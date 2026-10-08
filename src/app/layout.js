import "./globals.css";
import Providers from "@/app/providers";

export const metadata = {
  title: "Moniq☆Luxe Collection",
  description: "Luxury innerwear, accessories, footwear and apparel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
