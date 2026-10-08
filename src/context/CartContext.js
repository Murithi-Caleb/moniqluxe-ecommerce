"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "moniq-luxe-cart-v1";
const CartContext = createContext(null);

function readStoredCart() {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsed = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) {
      throw new TypeError("Saved cart must be an array.");
    }

    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        Number.isFinite(item.price) &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0 &&
        ["local_stock", "dropship"].includes(item.fulfillmentType),
    );
  } catch (error) {
    console.error("Unable to restore the saved cart.", error);
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Unable to save the cart to local storage.", error);
    }
  }, [items, isHydrated]);

  const addItem = useCallback((product) => {
    if (
      !product ||
      typeof product.id !== "string" ||
      typeof product.title !== "string" ||
      !Number.isFinite(product.price) ||
      product.price < 0 ||
      !["local_stock", "dropship"].includes(product.fulfillmentType)
    ) {
      throw new TypeError("A valid product is required to add an item to the cart.");
    }

    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.id === product.id);
      if (existing) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    );
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (!Number.isSafeInteger(quantity)) {
      throw new TypeError("Cart quantity must be a whole number.");
    }

    if (quantity < 1) {
      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== productId),
      );
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}
