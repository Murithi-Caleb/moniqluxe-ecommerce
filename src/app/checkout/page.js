"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { auth } from "@/lib/firebase";
import { getWhatsAppUrl } from "@/lib/whatsapp";

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const inputClassName =
  "mt-2 w-full rounded-xl border border-white/15 bg-[#171614] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d5b875]";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { items, subtotal, isHydrated } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login?redirect=%2Fcheckout");
    }
  }, [isAuthLoading, router, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!user || !auth?.currentUser) {
      router.replace("/login?redirect=%2Fcheckout");
      return;
    }

    const functionUrl = process.env.NEXT_PUBLIC_ORDER_FUNCTION_URL;
    if (!functionUrl) {
      setSubmitError(
        "Order checkout is not configured yet. Please contact the store for help.",
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    const customerName = formData.get("name");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const address = formData.get("address");
    const paymentLabel =
      paymentMethod === "mpesa"
        ? "M-Pesa (Daraja Sandbox preference)"
        : "Visa / bank card (Pesapal preference)";
    setIsSubmitting(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });
      const order = await response.json();

      if (!response.ok) {
        throw new Error(order.error || "Unable to create your order.");
      }
      if (
        typeof order.orderId !== "string" ||
        !Number.isSafeInteger(order.subtotal) ||
        order.subtotal < 0 ||
        order.currency !== "KES"
      ) {
        throw new Error("The order service returned an invalid order summary.");
      }

      const message = [
        "Hello Moniq☆Luxe Collection, I would like to confirm my order:",
        "",
        `Order ID: ${order.orderId}`,
        `Name: ${customerName}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Delivery address: ${address}`,
        `Preferred payment: ${paymentLabel}`,
        "",
        ...items.map(
          (item) =>
            `• ${item.title} × ${item.quantity} (${item.fulfillmentType === "local_stock" ? "In Stock / fast delivery" : "Pre-order / 7–14 days"})`,
        ),
        `Order total: ${currencyFormatter.format(order.subtotal)}`,
        "",
        "Please confirm delivery fees and the secure payment instructions.",
      ].join("\n");
      const url = getWhatsAppUrl(message);

      if (!url) {
        setSubmitError(
          `Order ${order.orderId} was created, but WhatsApp ordering is not configured. Please contact the store with this order ID.`,
        );
        return;
      }

      window.location.assign(url);
    } catch (error) {
      console.error("Unable to submit the checkout order.", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to submit your order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading || !user) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 sm:py-16">
        <p className="text-sm text-white/50" aria-live="polite">
          {isAuthLoading ? "Checking your account…" : "Redirecting to sign in…"}
        </p>
      </main>
    );
  }

  if (!isHydrated) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 sm:py-16">
        <p className="text-sm text-white/50" aria-live="polite">
          Loading your checkout…
        </p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-10 sm:py-16">
        <h1 className="text-4xl font-light text-white">Checkout</h1>
        <div className="mt-8 rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-white/70">Your bag is empty.</p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-full bg-[#d5b875] px-5 py-2.5 text-sm font-semibold text-[#181612] transition hover:bg-[#e4ca8f]"
          >
            Explore the collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 sm:py-16">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5b875]"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Back to your bag
      </Link>
      <div className="mt-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#d5b875]">
          Almost yours
        </p>
        <h1 className="mt-2 text-4xl font-light text-white">Checkout</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
          Add your delivery details and choose how you&apos;d prefer to pay.
          We&apos;ll confirm your order and share payment instructions securely.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <div className="space-y-8">
          <section
            aria-labelledby="delivery-heading"
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7"
          >
            <h2 id="delivery-heading" className="text-xl font-medium text-white">
              Delivery details
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-sm text-white/75">
                Full name
                <input
                  className={inputClassName}
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  required
                />
              </label>
              <label className="text-sm text-white/75">
                Phone number
                <input
                  className={inputClassName}
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="+254 7XX XXX XXX"
                  required
                />
              </label>
              <label className="text-sm text-white/75 sm:col-span-2">
                Email address
                <input
                  className={inputClassName}
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="text-sm text-white/75 sm:col-span-2">
                Delivery address or area
                <textarea
                  className={`${inputClassName} min-h-24 resize-y`}
                  name="address"
                  autoComplete="street-address"
                  placeholder="Estate, street, town, or preferred pickup point"
                  required
                />
              </label>
            </div>
          </section>

          <section
            aria-labelledby="payment-heading"
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7"
          >
            <h2 id="payment-heading" className="text-xl font-medium text-white">
              Preferred payment method
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Select your preference. No payment is taken on this page.
            </p>
            <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
              <legend className="sr-only">Choose a preferred payment method</legend>
              <label
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                  paymentMethod === "mpesa"
                    ? "border-[#d5b875]/70 bg-[#d5b875]/[0.07]"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <input
                  className="mt-1 accent-[#d5b875]"
                  type="radio"
                  name="paymentMethod"
                  value="mpesa"
                  checked={paymentMethod === "mpesa"}
                  onChange={() => setPaymentMethod("mpesa")}
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    <Smartphone aria-hidden="true" size={16} className="text-[#e7d29e]" />
                    M-Pesa
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-white/45">
                    Daraja Sandbox preference. We&apos;ll confirm M-Pesa
                    instructions with you.
                  </span>
                </span>
              </label>
              <label
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                  paymentMethod === "pesapal"
                    ? "border-[#d5b875]/70 bg-[#d5b875]/[0.07]"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <input
                  className="mt-1 accent-[#d5b875]"
                  type="radio"
                  name="paymentMethod"
                  value="pesapal"
                  checked={paymentMethod === "pesapal"}
                  onChange={() => setPaymentMethod("pesapal")}
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    <CreditCard aria-hidden="true" size={16} className="text-[#e7d29e]" />
                    Visa / bank card
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-white/45">
                    Pesapal preference. We&apos;ll share a secure payment link
                    after confirming your order.
                  </span>
                </span>
              </label>
            </fieldset>
            <p className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4 text-xs leading-5 text-white/50">
              Online gateway processing is not connected yet. Your choice will
              be included in a WhatsApp order request; never send card numbers
              or security codes in chat.
            </p>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.025] p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-medium text-white">Your order</h2>
          <ul className="mt-5 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="text-white/65">
                  {item.title} <span className="text-white/35">× {item.quantity}</span>
                </span>
                <span className="shrink-0 text-white">
                  {currencyFormatter.format(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-white/10 pt-5">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Subtotal</span>
              <span className="font-medium text-white">
                {currencyFormatter.format(subtotal)}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/40">
              Product prices, delivery fees, and final availability are
              reconfirmed by the store before payment.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d5b875] px-5 py-3 text-sm font-semibold text-[#181612] transition hover:bg-[#e4ca8f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5b875]"
          >
            {isSubmitting ? "Creating your order…" : "Create order and continue"}
            <ArrowRight aria-hidden="true" size={16} />
          </button>
          {submitError && (
            <p className="mt-3 text-xs leading-5 text-rose-200" role="alert">
              {submitError}
            </p>
          )}
          <p className="mt-4 text-center text-[11px] leading-5 text-white/35">
            This opens WhatsApp with your order details. You won&apos;t be
            charged online.
          </p>
        </aside>
      </form>
    </main>
  );
}
