const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

initializeApp();

const db = getFirestore();
const allowedOrigins = (process.env.WEB_APP_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const MAX_ORDER_ITEMS = 20;
const MAX_QUANTITY = 20;

exports.createCheckoutOrder = onRequest(
  { cors: allowedOrigins },
  async (req, res) => {
    if (req.method !== "POST") {
      res.set("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed." });
    }

    const authorization = req.get("authorization") || "";
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ error: "Authentication is required." });
    }

    let uid;
    try {
      ({ uid } = await getAuth().verifyIdToken(match[1]));
    } catch (error) {
      logger.warn("Checkout rejected: invalid Firebase ID token.", {
        error: error.message,
      });
      return res.status(401).json({ error: "Authentication is invalid or expired." });
    }

    const items = req.body && req.body.items;
    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > MAX_ORDER_ITEMS
    ) {
      return res.status(400).json({
        error: `Provide between 1 and ${MAX_ORDER_ITEMS} order items.`,
      });
    }

    const seenIds = new Set();
    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        item.productId.length === 0 ||
        item.productId.length > 150 ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > MAX_QUANTITY ||
        seenIds.has(item.productId)
      ) {
        return res.status(400).json({
          error: "Each item must have a unique productId and quantity from 1 to 20.",
        });
      }
      seenIds.add(item.productId);
    }

    try {
      const productRefs = items.map((item) =>
        db.collection("products").doc(item.productId),
      );
      const productSnapshots = await db.getAll(...productRefs);
      const orderItems = [];
      let subtotal = 0;

      for (let index = 0; index < productSnapshots.length; index += 1) {
        const snapshot = productSnapshots[index];
        const requestedItem = items[index];

        if (!snapshot.exists) {
          return res.status(400).json({
            error: `Product ${requestedItem.productId} is no longer available.`,
          });
        }

        const product = snapshot.data();
        if (
          product.active === false ||
          typeof product.title !== "string" ||
          !Number.isSafeInteger(product.price) ||
          product.price < 0 ||
          !["local_stock", "dropship"].includes(product.fulfillmentType)
        ) {
          return res.status(400).json({
            error: `Product ${requestedItem.productId} is not available for checkout.`,
          });
        }

        if (
          product.fulfillmentType === "local_stock" &&
          Number.isSafeInteger(product.stockQuantity) &&
          requestedItem.quantity > product.stockQuantity
        ) {
          return res.status(409).json({
            error: `${product.title} does not have enough local stock.`,
          });
        }

        const lineTotal = product.price * requestedItem.quantity;
        if (!Number.isSafeInteger(lineTotal) || !Number.isSafeInteger(subtotal + lineTotal)) {
          return res.status(400).json({ error: "Order total is out of range." });
        }
        subtotal += lineTotal;
        orderItems.push({
          productId: snapshot.id,
          title: product.title,
          unitPrice: product.price,
          quantity: requestedItem.quantity,
          fulfillmentType: product.fulfillmentType,
          lineTotal,
        });
      }

      const orderRef = db.collection("orders").doc();
      await orderRef.create({
        uid,
        items: orderItems,
        subtotal,
        currency: "KES",
        status: "pending_payment",
        createdAt: FieldValue.serverTimestamp(),
      });

      return res.status(201).json({
        orderId: orderRef.id,
        subtotal,
        currency: "KES",
        status: "pending_payment",
      });
    } catch (error) {
      logger.error("Unable to create checkout order.", { uid, error });
      return res.status(500).json({ error: "Unable to create the order." });
    }
  },
);
