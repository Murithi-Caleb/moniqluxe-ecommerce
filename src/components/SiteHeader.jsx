"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function SiteHeader() {
  const { itemCount } = useCart();
  const { user, isLoading, signOut } = useAuth();
  const [signOutError, setSignOutError] = useState("");

  async function handleSignOut() {
    setSignOutError("");
    try {
      await signOut();
    } catch (error) {
      console.error("Unable to sign out.", error);
      setSignOutError("Unable to sign out. Please try again.");
    }
  }

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-sm font-medium tracking-[0.18em] text-[#e7d29e]"
        >
          MONIQ☆LUXE
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-5">
          {!isLoading && user ? (
            <>
              <span
                className="hidden max-w-44 truncate text-sm text-white/55 sm:inline"
                title={user.displayName || user.email || ""}
              >
                {user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm text-white/65 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5b875]"
              >
                Sign out
              </button>
            </>
          ) : !isLoading ? (
            <>
              <Link
                href="/login"
                className="text-sm text-white/65 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5b875]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="hidden rounded-full bg-[#d5b875] px-4 py-2 text-sm font-semibold text-[#181612] transition hover:bg-[#e4ca8f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5b875] sm:inline-flex"
              >
                Create account
              </Link>
            </>
          ) : null}
          <Link
            href="/cart"
            aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-sm text-white transition hover:border-[#d5b875]/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5b875] sm:px-4"
          >
            <ShoppingBag aria-hidden="true" size={16} />
            <span className="hidden sm:inline">Bag</span>
            <span className="text-[#e7d29e]">({itemCount})</span>
          </Link>
        </nav>
      </div>
      {signOutError && (
        <p role="alert" className="mx-auto max-w-7xl px-6 pb-3 text-right text-xs text-rose-200">
          {signOutError}
        </p>
      )}
    </header>
  );
}
