"use client";

import SiteHeader from "@/components/SiteHeader";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <SiteHeader />
        {children}
      </CartProvider>
    </AuthProvider>
  );
}
