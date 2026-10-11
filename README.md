# Moniq☆Luxe Collection

Moniq☆Luxe is a Next.js storefront prototype for curated innerwear, accessories,
footwear, and apparel. It currently includes a product catalog, a browser-persisted
shopping bag, WhatsApp inquiry links, and a Firebase Cloud Function for creating
authenticated pending orders.

## Progress so far

- Built a responsive storefront and product cards with local-stock and dropship
  fulfillment labels.
- Connected the storefront to the public Firestore `products` collection. While
  Firebase is not configured, the two sample products remain available for local
  preview. The catalog reports loading, configuration/data errors, and an empty
  collection explicitly.
- Added a shopping bag persisted in browser local storage, with quantity controls,
  removal, and KES subtotal calculations.
- Added WhatsApp inquiry links for products and a checkout summary. Checkout
  currently hands off to WhatsApp for order questions and confirmation.
- Added a Firebase Cloud Function that verifies Firebase ID tokens, validates
  requested product IDs and quantities against Firestore, checks local stock,
  and creates a pending-payment order using server-side product prices.
- Added Firestore rules that allow public product reads and restrict order access
  to the order's authenticated owner.

## Run locally

Requirements: Node.js 22 or newer and npm.

```sh
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

Open <http://localhost:3000>. Without Firebase configuration the storefront uses
the sample products. To load a live catalog, fill in the `NEXT_PUBLIC_FIREBASE_*`
values in `.env.local` with a Firebase web app's configuration and set
`NEXT_PUBLIC_WHATSAPP_NUMBER` to the shop's international phone number using
digits only.

Create Firestore documents in the `products` collection with this shape:

```json
{
  "title": "Satin Intimates Set",
  "price": 6800,
  "fulfillmentType": "local_stock",
  "imageUrl": "https://example.com/product.jpg",
  "active": true,
  "stockQuantity": 5
}
```

`title`, a non-negative whole-number `price`, and `fulfillmentType` (`local_stock`
or `dropship`) are required. `imageUrl`, `active`, and `stockQuantity` are
optional. Products with `active: false` are not displayed. `stockQuantity` is
checked by the order function for local-stock products when it is a whole number.

## Firebase Functions

The Functions project requires Node.js 22. From the `functions` directory, install
its dependencies with `npm install`. The root `firebase.json` points Firebase CLI
to this directory and to `firestore.rules`.

The `serve` script in `functions/package.json` starts the Functions and Firestore
emulators; the `deploy` script deploys the function and Firestore rules. Configure
`WEB_APP_ORIGIN` for the deployed storefront's CORS origin. M-Pesa secret names
are documented in `.env.local.example`, but M-Pesa payment initiation and callback
handling are not implemented yet.

## Project map

### Application (`src/`)

- `src/app/page.js` — storefront home page. Loads active products from Firestore
  when configured, otherwise displays sample products, and renders catalog
  loading, error, and empty states.
- `src/app/checkout/page.js` — shopping-bag page with quantity controls, item
  removal, subtotal, fulfillment estimates, and a WhatsApp checkout summary.
- `src/app/layout.js` — shared root layout, global stylesheet, and page metadata.
- `src/app/providers.js` — mounts application-wide React providers.
- `src/app/globals.css` — global dark theme, page background, and Tailwind CSS
  import.
- `src/components/ProductCard.jsx` — product image, price, fulfillment label,
  add-to-cart button, and product WhatsApp inquiry.
- `src/components/WhatsAppInquiryLink.jsx` — reusable WhatsApp link; renders a
  disabled button when no phone number is configured.
- `src/context/CartContext.js` — cart state and actions, local-storage
  persistence, hydration state, validation, item count, and subtotal.
- `src/lib/firebase.js` — Firebase client initialization and exported Auth,
  Firestore, and Storage services. Missing configuration leaves the sample
  storefront usable; partial configuration is exposed as a visible catalog error.
- `src/lib/whatsapp.js` — formats WhatsApp chat URLs and message text.

### Firebase backend and configuration

- `functions/index.js` — `createCheckoutOrder` HTTPS function. Requires a Firebase
  ID token, re-reads products and prices from Firestore, validates availability
  and local stock, and writes a `pending_payment` order.
- `firestore.rules` — public read-only product access, owner-only order reads,
  user-scoped user-document access, and deny-by-default rules.
- `firebase.json` — Firebase CLI configuration for Functions and Firestore rules.
- `.env.local.example` — template for browser Firebase settings, WhatsApp number,
  Functions CORS origin, and documented M-Pesa secret names. It contains
  placeholders, not usable credentials.

### Root tooling

- `package.json` — Next.js development/build/start scripts and frontend
  dependencies.
- `package-lock.json` — pinned frontend dependency tree for reproducible npm
  installs.
- `functions/package.json` — Cloud Functions runtime, emulator, deploy scripts,
  and backend dependencies.
- `functions/package-lock.json` — pinned Cloud Functions dependency tree.
- `next.config.js` — Next.js configuration.
- `postcss.config.mjs` — configures Tailwind CSS through PostCSS.
- `jsconfig.json` — enables the `@/` alias for imports from `src/`.
- `.gitignore` — excludes dependencies, build output, local environment files,
  and Firebase emulator logs while keeping the example environment file tracked.

## Current limitations / next steps

- The sample catalog is intended for preview only; connect a Firebase project and
  populate Firestore before launch.
- The checkout page does not yet call `createCheckoutOrder`; its current order
  handoff is WhatsApp-based. Integrate Firebase Authentication and the order
  function before accepting online payments.
- M-Pesa initiation, payment callbacks, order status updates, product-management
  tooling, and automated tests are not implemented yet.
