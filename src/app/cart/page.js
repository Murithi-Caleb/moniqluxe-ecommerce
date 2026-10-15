"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, isHydrated } = useCart();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 sm:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5b875]"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Continue shopping
      </Link>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#d5b875]">
            Your selection
          </p>
          <h1 className="mt-2 text-4xl font-light text-white">Your bag</h1>
        </div>
        {isHydrated && items.length > 0 && (
          <p className="text-sm text-white/45">
            {items.reduce((count, item) => count + item.quantity, 0)}{" "}
            {items.reduce((count, item) => count + item.quantity, 0) === 1
              ? "item"
              : "items"}
          </p>
        )}
      </div>
      <p className="mt-3 text-sm text-white/50">
        Review your pieces and quantities before you continue to checkout.
      </p>

      {!isHydrated ? (
        <p className="mt-10 text-sm text-white/50" aria-live="polite">
          Loading your bag…
        </p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center sm:p-12">
          <p className="text-lg font-light text-white">
            Your bag is waiting for something lovely.
          </p>
          <p className="mt-2 text-sm text-white/45">
            Explore the collection and add a piece to get started.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d5b875] px-5 py-2.5 text-sm font-semibold text-[#181612] transition hover:bg-[#e4ca8f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5b875]"
          >
            Explore the collection
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[#24211d]">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center px-2 text-center text-[10px] text-white/40"
                        role="img"
                        aria-label={`${item.title} image unavailable`}
                      >
                        Image coming soon
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-medium text-white">{item.title}</h2>
                    <p className="mt-1 text-xs text-white/50">
                      {item.fulfillmentType === "local_stock"
                        ? "In Stock · Fast, same-day delivery"
                        : "Pre-order · Estimated 7–14 days"}
                    </p>
                    <p className="mt-2 text-sm text-[#e7d29e]">
                      {currencyFormatter.format(item.price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-24 sm:pl-0">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.title}`}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="rounded-full border border-white/15 p-2 text-white/75 transition hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d5b875]"
                  >
                    <Minus aria-hidden="true" size={14} />
                  </button>
                  <span className="min-w-6 text-center text-sm text-white">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${item.title}`}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="rounded-full border border-white/15 p-2 text-white/75 transition hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d5b875]"
                  >
                    <Plus aria-hidden="true" size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${item.title} from bag`}
                    onClick={() => removeItem(item.id)}
                    className="ml-1 rounded-full p-2 text-white/40 transition hover:text-rose-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d5b875]"
                  >
                    <Trash2 aria-hidden="true" size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <h2 className="text-lg font-medium text-white">Order summary</h2>
            <div className="mt-5 flex justify-between text-sm">
              <span className="text-white/60">Subtotal</span>
              <span className="text-white">{currencyFormatter.format(subtotal)}</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/40">
              Delivery fees and final availability will be confirmed before
              payment.
            </p>
            <Link
              href="/checkout"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d5b875] px-5 py-3 text-sm font-semibold text-[#181612] transition hover:bg-[#e4ca8f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5b875]"
            >
              Continue to checkout
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
            <p className="mt-4 text-center text-[11px] leading-5 text-white/35">
              You&apos;ll confirm delivery details and choose a preferred
              payment method next.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
