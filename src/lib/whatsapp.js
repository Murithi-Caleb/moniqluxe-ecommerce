export function getWhatsAppUrl(message, phoneNumber) {
  const phone = (phoneNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "")
    .replace(/\D/g, "");

  if (!phone) {
    return null;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
