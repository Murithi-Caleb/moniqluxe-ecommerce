"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";

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
          <p className="hidden text-xs text-white/40 sm:block">
            Sample products — connect your Firestore catalog to go live
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
