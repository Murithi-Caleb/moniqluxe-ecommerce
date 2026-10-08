"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import WhatsAppInquiryLink from "@/components/WhatsAppInquiryLink";

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const isLocalStock = product.fulfillmentType === "local_stock";
  const price = currencyFormatter.format(product.price);
  const inquiryMessage = [
    "Hello Moniq☆Luxe Collection, I would like to inquire about:",
    product.title,
    `Price: ${price}`,
    `Fulfillment: ${isLocalStock ? "Local stock (fast delivery)" : "Dropship / pre-order (7–14 days)"}`,
  ].join("\n");

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#171614]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#24211d]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-cover transition duration-700 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-sm text-white/40"
            role="img"
            aria-label={`${product.title} image unavailable`}
          >
            Image coming soon
          </div>
        )}
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] backdrop-blur ${
            isLocalStock
              ? "bg-[#17251d]/90 text-[#c8e4cf]"
              : "bg-[#30281a]/90 text-[#f0d79c]"
          }`}
        >
          {isLocalStock ? "In Stock" : "Dropship / Pre-order"}
        </span>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-medium text-white">{product.title}</h2>
            <p className="mt-1 text-xs text-white/50">
              {isLocalStock ? "Fast, same-day delivery" : "Estimated delivery: 7–14 days"}
            </p>
          </div>
          <span className="shrink-0 text-sm text-[#e7d29e]">{price}</span>
        </div>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => addItem(product)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d5b875] px-4 py-2.5 text-sm font-semibold text-[#181612] transition hover:bg-[#e4ca8f]"
          >
            <ShoppingBag aria-hidden="true" size={16} />
            Add to Cart
          </button>
          <WhatsAppInquiryLink
            message={inquiryMessage}
            className="w-full"
          />
        </div>
      </div>
    </article>
  );
}
