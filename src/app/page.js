"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { db, firebaseConfigError } from "@/lib/firebase";

const featuredProducts = [
  {
    id: "sample-local-satin-set",
    title: "Satin Intimates Set",
    price: 6800,
    fulfillmentType: "local_stock",
    imageUrl:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "sample-dropship-leather-loafers",
    title: "Leather Penny Loafers",
    price: 12400,
    fulfillmentType: "dropship",
    imageUrl:
      "https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=900&q=85",
  },
];

export default function HomePage() {
  const { itemCount } = useCart();
  const [products, setProducts] = useState(featuredProducts);
  const [catalogStatus, setCatalogStatus] = useState("demo");
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    if (firebaseConfigError) {
      setCatalogStatus("error");
      setCatalogError(firebaseConfigError.message);
      return;
    }

    if (!db) {
      return;
    }

    let isCurrent = true;
    setCatalogStatus("loading");
    setCatalogError("");

    getDocs(collection(db, "products"))
      .then((snapshot) => {
        const liveProducts = snapshot.docs.flatMap((productDocument) => {
          const product = productDocument.data();
          if (product.active === false) {
            return [];
          }

          if (
            typeof product.title !== "string" ||
            !Number.isSafeInteger(product.price) ||
            product.price < 0 ||
            !["local_stock", "dropship"].includes(product.fulfillmentType)
          ) {
            throw new Error(
              `Product "${productDocument.id}" is missing a valid title, whole-number price, or fulfillment type.`,
            );
          }

          return [
            {
              id: productDocument.id,
              title: product.title,
              price: product.price,
              fulfillmentType: product.fulfillmentType,
              imageUrl: typeof product.imageUrl === "string" ? product.imageUrl : "",
            },
          ];
        });

        if (isCurrent) {
          setProducts(liveProducts);
          setCatalogStatus("ready");
        }
      })
      .catch((error) => {
        console.error("Unable to load the Firestore product catalog.", error);
        if (isCurrent) {
          setProducts([]);
          setCatalogError(
            error instanceof Error
              ? error.message
              : "An unexpected error occurred while loading products.",
          );
          setCatalogStatus("error");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-sm font-medium tracking-[0.18em] text-[#e7d29e]"
          >
            MONIQ☆LUXE
          </Link>
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:border-[#d5b875]/70"
          >
            <ShoppingBag aria-hidden="true" size={16} />
            Bag <span className="text-[#e7d29e]">({itemCount})</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pt-24">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d5b875]">
          Curated with intention
        </p>
        <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="max-w-2xl text-4xl font-light leading-tight text-white sm:text-6xl">
              Everyday luxury,
              <span className="block text-[#d5b875]">beautifully considered.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
              Discover intimate essentials and considered finds for him.
              Delivery timing is shown clearly on every piece.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="featured-heading"
        className="mx-auto max-w-7xl px-6 pb-24"
      >
        <div className="mb-7 flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              The collection
            </p>
            <h2 id="featured-heading" className="mt-2 text-2xl font-light text-white">
              Featured pieces
            </h2>
          </div>
          {catalogStatus === "demo" && (
            <p className="hidden text-xs text-white/40 sm:block">
              Sample products — connect Firebase to load your live catalog
            </p>
          )}
        </div>
        {catalogStatus === "loading" ? (
          <p className="py-10 text-center text-sm text-white/50" aria-live="polite">
            Loading the latest collection…
          </p>
        ) : catalogStatus === "error" ? (
          <p
            className="rounded-2xl border border-rose-300/20 bg-rose-300/5 p-5 text-sm text-rose-100/80"
            role="alert"
          >
            The product catalog couldn&apos;t be loaded. {catalogError}
          </p>
        ) : products.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/50">
            There are no products in the collection yet.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
