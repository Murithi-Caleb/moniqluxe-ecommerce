import assert from "node:assert/strict";
import test from "node:test";

const projectId = "demo-moniqluxe";
const authEmulatorUrl = "http://127.0.0.1:9099";
const firestoreEmulatorUrl = "http://127.0.0.1:8080";
const functionsEmulatorUrl =
  `http://127.0.0.1:5001/${projectId}/us-central1/createCheckoutOrder`;

test("checkout ignores a client-supplied price and stores the Firestore price", async () => {
  const uniqueId = `price-check-${crypto.randomUUID()}`;
  const signUpResponse = await fetch(
    `${authEmulatorUrl}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `${uniqueId}@example.test`,
        password: "Local-test-password-123!",
        returnSecureToken: true,
      }),
    },
  );
  assert.equal(signUpResponse.status, 200);
  const { idToken } = await signUpResponse.json();

  const productId = uniqueId;
  const productDocument =
    `projects/${projectId}/databases/(default)/documents/products/${productId}`;
  const seedResponse = await fetch(
    `${firestoreEmulatorUrl}/v1/projects/${projectId}/databases/(default)/documents:commit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: productDocument,
              fields: {
                title: { stringValue: "Server-priced product" },
                price: { integerValue: "1250" },
                fulfillmentType: { stringValue: "dropship" },
                active: { booleanValue: true },
              },
            },
          },
        ],
      }),
    },
  );
  assert.equal(seedResponse.status, 200);

  const orderResponse = await fetch(functionsEmulatorUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ productId, quantity: 2, price: 1 }],
    }),
  });
  assert.equal(orderResponse.status, 201);
  const orderSummary = await orderResponse.json();
  assert.equal(orderSummary.subtotal, 2500);

  const storedOrderResponse = await fetch(
    `${firestoreEmulatorUrl}/v1/projects/${projectId}/databases/(default)/documents/orders/${orderSummary.orderId}`,
  );
  assert.equal(storedOrderResponse.status, 200);
  const storedOrder = await storedOrderResponse.json();
  assert.equal(storedOrder.fields.subtotal.integerValue, "2500");
  assert.equal(
    storedOrder.fields.items.arrayValue.values[0].mapValue.fields.unitPrice
      .integerValue,
    "1250",
  );
});
