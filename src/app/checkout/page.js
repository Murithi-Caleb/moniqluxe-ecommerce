"use client";

import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import WhatsAppInquiryLink from "@/components/WhatsAppInquiryLink";

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export default function CheckoutPage() {
  const { items, subtotal, updateQuantity, removeItem, isHydrated } = useCart();
  const checkoutMessage = [
    "Hello Moniq☆Luxe Collection, I would like to check out:",
    ...items.map(
      (item) =>
        `• ${item.title} × ${item.quantity} — ${currencyFormatter.format(item.price * item.quantity)} (${item.fulfillmentType === "local_stock" ? "In Stock / fast delivery" : "Dropship / 7–14 days"})`,
    ),
    `Subtotal: ${currencyFormatter.format(subtotal)}`,
    "Please confirm delivery options and payment.",
  ].join("\n");

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10 sm:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Continue shopping
      </Link>
      <h1 className="mt-8 text-4xl font-light text-white">Your bag</h1>
      <p className="mt-2 text-sm text-white/50">
        Delivery timing is based on each item&apos;s fulfillment type.
      </p>

      {!isHydrated ? (
        <p className="mt-10 text-sm text-white/50" aria-live="polite">
          Loading your bag…
        </p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-white/70">Your bag is waiting for something lovely.</p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-full bg-[#d5b875] px-5 py-2.5 text-sm font-semibold text-[#181612]"
          >
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="font-medium text-white">{item.title}</h2>
                  <p className="mt-1 text-xs text-white/50">
                    {item.fulfillmentType === "local_stock"
                      ? "In Stock · Fast, same-day delivery"
                      : "Dropship / Pre-order · Estimated 7–14 days"}
                  </p>
                  <p className="mt-2 text-sm text-[#e7d29e]">
                    {currencyFormatter.format(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.title}`}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="rounded-full border border-white/15 p-2 text-white/75 hover:border-white/40"
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
                    className="rounded-full border border-white/15 p-2 text-white/75 hover:border-white/40"
                  >
                    <Plus aria-hidden="true" size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${item.title} from bag`}
                    onClick={() => removeItem(item.id)}
                    className="ml-2 rounded-full p-2 text-white/40 transition hover:text-rose-300"
                  >
                    <Trash2 aria-hidden="true" size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="ml-auto mt-7 max-w-sm">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Subtotal</span>
              <span className="text-white">{currencyFormatter.format(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/40">
              Delivery fees and final availability will be confirmed before payment.
            </p>
            <WhatsAppInquiryLink
              message={checkoutMessage}
              className="mt-6 w-full"
            />
            <p className="mt-3 text-center text-[11px] leading-5 text-white/35">
              Secure payment initiation belongs in the authenticated Cloud Function;
              this WhatsApp button is for order questions and confirmation.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
