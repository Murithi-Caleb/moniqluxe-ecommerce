export const MAX_ORDER_QUANTITY = 20;

export function normalizeProduct(id, data) {
  if (typeof id !== "string" || id.length === 0) {
    throw new TypeError("Product ID must be a non-empty string.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new TypeError("Product data must be an object.");
  }
  if (data.active !== undefined && typeof data.active !== "boolean") {
    throw new TypeError("Active must be a boolean.");
  }
  if (data.active === false) {
    return null;
  }
  if (typeof data.title !== "string" || data.title.trim().length === 0) {
    throw new TypeError("Title must be a non-empty string.");
  }
  if (!Number.isSafeInteger(data.price) || data.price < 0) {
    throw new TypeError("Price must be a non-negative whole number in KES.");
  }
  if (!["local_stock", "dropship"].includes(data.fulfillmentType)) {
    throw new TypeError("Fulfillment type must be local_stock or dropship.");
  }
  if (
    data.stockQuantity !== undefined &&
    (!Number.isSafeInteger(data.stockQuantity) || data.stockQuantity < 0)
  ) {
    throw new TypeError("Stock quantity must be a non-negative whole number.");
  }

  const imageUrl = data.imageUrl === undefined ? "" : data.imageUrl;
  if (typeof imageUrl !== "string") {
    throw new TypeError("Image URL must be a string.");
  }
  if (imageUrl !== "") {
    let parsedImageUrl;
    try {
      parsedImageUrl = new URL(imageUrl);
    } catch {
      throw new TypeError("Image URL must be a valid HTTPS URL.");
    }
    if (parsedImageUrl.protocol !== "https:") {
      throw new TypeError("Image URL must use HTTPS.");
    }
  }

  return {
    id,
    title: data.title.trim(),
    price: data.price,
    fulfillmentType: data.fulfillmentType,
    imageUrl,
    ...(data.stockQuantity === undefined
      ? {}
      : { stockQuantity: data.stockQuantity }),
  };
}

export function getProductMaxQuantity(product) {
  if (
    product.fulfillmentType === "local_stock" &&
    Number.isSafeInteger(product.stockQuantity)
  ) {
    return Math.min(product.stockQuantity, MAX_ORDER_QUANTITY);
  }
  return MAX_ORDER_QUANTITY;
}
