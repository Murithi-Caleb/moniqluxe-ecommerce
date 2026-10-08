"use client";

import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export default function WhatsAppInquiryLink({
  message,
  phoneNumber,
  className = "",
  children = "Inquire on WhatsApp",
}) {
  const url = getWhatsAppUrl(message, phoneNumber);
  const classes = `inline-flex items-center justify-center gap-2 rounded-full border border-[#d5b875]/50 px-4 py-2.5 text-sm font-medium text-[#e7d29e] transition hover:border-[#d5b875] hover:bg-[#d5b875]/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`;

  if (!url) {
    return (
      <button
        type="button"
        className={classes}
        disabled
        title="Set NEXT_PUBLIC_WHATSAPP_NUMBER to enable WhatsApp inquiries."
      >
        <MessageCircle aria-hidden="true" size={16} />
        {children}
      </button>
    );
  }

  return (
    <a
      className={classes}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <MessageCircle aria-hidden="true" size={16} />
      {children}
    </a>
  );
}
