import assert from "node:assert/strict";
import test from "node:test";
import { getProductMaxQuantity, normalizeProduct } from "../src/lib/products.mjs";

const validProduct = {
  title: "  Satin Intimates Set ",
  price: 6800,
  fulfillmentType: "local_stock",
  imageUrl: "https://example.com/satin-set.jpg",
  stockQuantity: 5,
};

test("normalizes product data and preserves known stock", () => {
  assert.deepEqual(normalizeProduct("satin-set", validProduct), {
    id: "satin-set",
    title: "Satin Intimates Set",
    price: 6800,
    fulfillmentType: "local_stock",
    imageUrl: "https://example.com/satin-set.jpg",
    stockQuantity: 5,
  });
});

test("excludes inactive products", () => {
  assert.equal(
    normalizeProduct("hidden", { ...validProduct, active: false }),
    null,
  );
});

test("rejects invalid price, fulfillment, inventory, and image fields", () => {
  for (const changes of [
    { title: "   " },
    { price: -1 },
    { price: 12.5 },
    { price: Number.MAX_SAFE_INTEGER + 1 },
    { fulfillmentType: "unknown" },
    { stockQuantity: -1 },
    { stockQuantity: 1.5 },
    { imageUrl: "http://example.com/image.jpg" },
    { imageUrl: "not-a-url" },
    { active: "true" },
  ]) {
    assert.throws(() => normalizeProduct("item", { ...validProduct, ...changes }));
  }
});

test("uses the order limit unless a local stock quantity is known", () => {
  assert.equal(getProductMaxQuantity({ fulfillmentType: "dropship" }), 20);
  assert.equal(
    getProductMaxQuantity({ fulfillmentType: "local_stock" }),
    20,
  );
  assert.equal(
    getProductMaxQuantity({
      fulfillmentType: "local_stock",
      stockQuantity: 25,
    }),
    20,
  );
  assert.equal(
    getProductMaxQuantity({
      fulfillmentType: "local_stock",
      stockQuantity: 3,
    }),
    3,
  );
  assert.equal(
    getProductMaxQuantity({
      fulfillmentType: "local_stock",
      stockQuantity: 0,
    }),
    0,
  );
});
