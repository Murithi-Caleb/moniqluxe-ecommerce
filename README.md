# Moniq☆Luxe Collection

Moniq☆Luxe is a Next.js storefront for curated innerwear, accessories, footwear,
and apparel. It includes a product catalog, a browser-persisted shopping bag,
Firebase email/password accounts, authenticated server-priced order creation,
and WhatsApp order inquiries.

## Progress so far

- Built a responsive storefront and product cards with local-stock and dropship
  fulfillment labels, KES prices, delivery estimates, and add-to-bag and WhatsApp
  inquiry actions.
- Connected the storefront to the public Firestore `products` collection. While
  Firebase is not configured, the two sample products remain available for local
  preview. The catalog reports loading and configuration errors, shows valid
  products when individual records are invalid, and makes those invalid records
  visible as a catalog warning.
- Added a shopping bag persisted in browser local storage, with quantity controls,
  removal, hydration handling, item counts, and KES subtotal calculations.
- Added Firebase email/password account creation and sign-in, display names,
  password reset, sign-out, authentication-state handling, and shared account
  navigation.
- Added responsive `/signup` and `/login` pages with labeled inputs, password
  visibility, confirmation, inline validation, accessible status/error feedback,
  and a branded layout.
- Added separate `/cart` and `/checkout` pages. Checkout requires sign-in,
  creates an order through the authenticated Firebase Function, and sends the
  returned order ID and server-calculated total with delivery details to
  WhatsApp. Gateway processing is not connected; checkout does not collect card
  details or charge customers.
- Added a Firebase Cloud Function that verifies Firebase ID tokens, validates
  requested product IDs and quantities against Firestore, checks local stock,
  and creates a pending-payment order using server-side product prices.
- Added Firestore rules that allow public product reads and restrict order access
  to the order's authenticated owner, and prevent user profiles from storing
  role or admin fields.
- Added emulator-backed Firestore rules tests and a checkout integration test
  proving that a client-supplied product price cannot change the server-calculated
  order total.
- Added setup and deployment guidance for Firebase, Authentication, Firestore,
  the WhatsApp MVP, and the current implementation roadmap.
- Added focused product-catalog validation tests for product data, fulfillment,
  image URLs, stock, and the order quantity limit.
- Removed the unused Firebase Storage client SDK initialization so storefront
  sessions load and initialize only the Firebase services currently in use
  (Authentication and Firestore).

## Run locally

For the complete step-by-step guide to configuring a live catalog, running the
WhatsApp MVP, deploying it, and planning the next implementation steps, see
[MVP_SETUP.md](./MVP_SETUP.md).

For the source tree and the reasons behind the technical and design choices so
far, see [PROJECT_STRUCTURE_AND_DECISIONS.md](./PROJECT_STRUCTURE_AND_DECISIONS.md).

Requirements: Node.js 22 or newer and npm.

```sh
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

Open <http://localhost:3000>. Without Firebase configuration the storefront uses
the sample products. To place an order, configure Firebase Authentication and
Firestore, deploy `createCheckoutOrder`, and set its URL in
`NEXT_PUBLIC_ORDER_FUNCTION_URL`. Also set `NEXT_PUBLIC_WHATSAPP_NUMBER` to the
shop's international phone number using digits only.

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

`title` (non-empty), a non-negative whole-number `price`, and `fulfillmentType`
(`local_stock` or `dropship`) are required. `imageUrl`, `active`, and
`stockQuantity` are optional. Image URLs must use HTTPS. Products with
`active: false` are not displayed. A provided `stockQuantity` must be a
non-negative whole number and limits local-stock cart quantities. Leave it out
when stock is not tracked. Each product is capped at 20 units to match the order
service limit. Invalid catalog records are excluded with a visible warning so
one malformed record does not hide the rest of the collection.

Run `npm test` to start the Firebase Auth, Firestore, and Functions emulators,
then run the product, rules, and tampered-price checkout tests. The first run
may download emulator binaries and requires a Java 21 runtime.

## Firebase Functions

The Functions project requires Node.js 22. The root `firebase.json` points Firebase
CLI to the Functions source and Firestore rules. Set `WEB_APP_ORIGIN` to the
deployed storefront origin in `functions/.env.<project-id>` before deployment;
set `NEXT_PUBLIC_ORDER_FUNCTION_URL` to the deployed HTTPS function URL in the
storefront environment. The `functions` project also has `serve` and `deploy`
scripts. M-Pesa initiation and payment callbacks are not implemented; no online
payment is taken.

## Security model

The browser cart and all values in it are untrusted. Checkout sends only product
IDs and quantities with a Firebase ID token; it never sends prices. The order
function reloads each product from Firestore and calculates the item prices and
total on the server. Firestore rules deny client writes to products and orders
and limit order reads to the authenticated owner. User profile documents allow
only profile fields and must never contain role, admin, or other authorization
flags.

## Project map

### Application (`src/`)

- `src/app/page.js` — storefront home page. Loads active products from Firestore
  when configured, otherwise displays sample products, and renders catalog
  loading, error, warning, and empty states.
- `src/app/cart/page.js` — shopping-bag review with quantity controls, item
  removal, fulfillment estimates, subtotal, and a link to checkout.
- `src/app/checkout/page.js` — sign-in-gated checkout, authenticated order
  creation, delivery form, M-Pesa and Pesapal preference selection, and
  WhatsApp order-request handoff using the server's order ID and total.
- `src/app/login/page.js` and `src/app/signup/page.js` — customer sign-in and
  account-creation routes.
- `src/app/layout.js` — shared root layout, global stylesheet, and page metadata.
- `src/app/providers.js` — mounts authentication and cart providers and the
  shared site header.
- `src/app/globals.css` — global dark theme, page background, and Tailwind CSS
  import.
- `src/components/AuthForm.jsx` — reusable accessible login and signup forms,
  including password visibility, validation, and password-reset feedback.
- `src/components/ProductCard.jsx` — product image, price, fulfillment label,
  add-to-cart button, and product WhatsApp inquiry.
- `src/components/SiteHeader.jsx` — shared storefront navigation, account links,
  sign-out action, and shopping-bag count.
- `src/components/WhatsAppInquiryLink.jsx` — reusable WhatsApp link; renders a
  disabled button when no phone number is configured.
- `src/context/CartContext.js` — cart state and actions, local-storage
  persistence, hydration state, validation, item count, and subtotal.
- `src/context/AuthContext.js` — Firebase authentication state and email/password
  account actions.
- `src/lib/firebase.js` — Firebase client initialization and exported Auth and
  Firestore services. Unused Storage is not loaded. Missing configuration leaves
  the sample storefront usable; partial configuration is exposed as a visible
  catalog error.
- `src/lib/products.mjs` — shared Firestore product validation and cart quantity
  limits.
- `src/lib/whatsapp.js` — formats WhatsApp chat URLs and message text.

For a full directory overview and the rationale behind the architecture, security,
interaction, and visual design choices, see
[PROJECT_STRUCTURE_AND_DECISIONS.md](./PROJECT_STRUCTURE_AND_DECISIONS.md).

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
- `tests/products.test.mjs` — product validation tests.
- `tests/firestore.rules.test.mjs` — rules tests for client write denial,
  order ownership, and safe user profile fields.
- `tests/checkout-function.test.mjs` — emulator integration test for ignoring a
  tampered client price.
- `next.config.js` — Next.js configuration.
- `postcss.config.mjs` — configures Tailwind CSS through PostCSS.
- `jsconfig.json` — enables the `@/` alias for imports from `src/`.
- `.gitignore` — excludes dependencies, build output, local environment files,
  and Firebase emulator logs while keeping the example environment file tracked.

## Current limitations / next steps

- The sample catalog is intended for preview only; connect a Firebase project and
  populate Firestore before launch. Account actions also require the Firebase
  Email/Password provider to be enabled.
- Checkout creates a pending order before opening WhatsApp. If customers do not
  complete the WhatsApp handoff, the pending order remains for staff follow-up.
- M-Pesa initiation, payment callbacks, order status updates, and
  product-management tooling are not implemented. The store must confirm
  availability, delivery fees, and payment instructions before fulfilling orders.
