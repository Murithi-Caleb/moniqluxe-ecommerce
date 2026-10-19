# Moniq☆Luxe MVP: setup and next steps

This guide takes the current storefront from a local preview to a small, usable
MVP. Customers browse a Firestore catalog, add products to a bag, create an
authenticated pending order, and send delivery/payment details through WhatsApp.
You confirm availability, delivery, and payment with each customer.

**Important:** customer email/password sign-in and account creation are available
when Firebase Authentication is configured. The browser cart is untrusted;
checkout requires sign-in and sends product IDs and quantities to a Firebase
Function, which reloads products and calculates prices from Firestore. Checkout
then opens WhatsApp with the returned order ID and server-calculated total.
Payment gateway processing and stock reservation are not implemented; customers
are not charged online.

## 1. Check prerequisites

Install:

- Node.js 22 or newer (the same major version is required by the optional
  Firebase Functions project).
- npm, which is included with Node.js.
- Java 21 for the Firebase Emulator Suite tests (`npm test`).
- A Firebase account/project for a live catalog. This is optional for a local
  sample-catalog preview.
- A WhatsApp number for receiving customer inquiries.

Open PowerShell in the repository folder:

```powershell
Set-Location D:\moniqluxe-ecommerce
```

## 2. Install dependencies and start the preview

Install the frontend dependencies from the committed lockfile:

```powershell
npm ci
```

Create a local environment file:

```powershell
Copy-Item .env.local.example .env.local
```

For a preview with the two built-in sample products, leave the Firebase values
blank. Set `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local` to the shop's
international phone number using digits only (for example, `2547XXXXXXXX`).

Start the development server:

```powershell
npm run dev
```

Open <http://localhost:3000>. Confirm that the sample products appear, add one
to the bag, open `/cart`, and check its quantity and subtotal. A sample-only
preview cannot submit checkout; configure Firebase and the order function
before testing authenticated checkout. No payment option initiates a real or
sandbox charge.

Stop the server with `Ctrl+C` when finished.

## 3. Create and configure Firebase for a live catalog

Skip this section if a sample-catalog preview is all you need.

1. In the [Firebase console](https://console.firebase.google.com/), create or
   select the project for the store.
2. In **Project settings**, add a **Web app** and copy its Firebase web
   configuration values.
3. In **Build → Firestore Database**, create a database. Choose the location
   carefully; Firebase does not let you change the database location later.
4. Open `.env.local` and fill in all six required browser configuration values:
   `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`,
   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, and
   `NEXT_PUBLIC_FIREBASE_APP_ID`. Set `NEXT_PUBLIC_WHATSAPP_NUMBER` to the
   shop's number. `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` may be left blank.
5. In **Project settings → General → Your apps**, make sure the values belong to
   the same Firebase project as the Firestore database.
6. In **Build → Authentication → Sign-in method**, enable the **Email/Password**
   provider. This enables the `/signup` and `/login` pages and password reset.
7. Sign in to Firebase CLI and select this project. If the CLI is not already
   available, `npx` can run it without a global install:

   ```powershell
   npx firebase-tools login
   npx firebase-tools use --add
   ```

   When prompted, choose the project created above and give it a local alias.
   This writes project selection to `.firebaserc`; check the selected project
   before deploying rules.
8. Deploy the repository's Firestore rules:

   ```powershell
   npx firebase-tools deploy --only firestore:rules
   ```

   The rules allow anyone to read products, deny client product writes, and
   prevent unauthenticated order reads. Do not loosen them to make catalog
   editing easier.
9. In the Firebase console, add documents to the `products` collection. For
   each product, use a unique document ID and these fields:

   | Field | Type | Requirement |
   | --- | --- | --- |
   | `title` | string | Required; customer-facing product name |
   | `price` | number | Required; non-negative whole number in KES (for example, `6800`) |
   | `fulfillmentType` | string | Required; exactly `local_stock` or `dropship` |
   | `imageUrl` | string | Optional; use a publicly accessible HTTPS image URL |
   | `active` | boolean | Optional; set `true` to show it; `false` hides it |
   | `stockQuantity` | number | Optional; non-negative whole-number local quantity; omit if stock is not tracked |

   Example document:

   ```json
   {
     "title": "Satin Intimates Set",
     "price": 6800,
     "fulfillmentType": "local_stock",
     "imageUrl": "https://example.com/satin-set.jpg",
     "active": true,
     "stockQuantity": 5
   }
   ```

10. Restart `npm run dev` if it is already running, then open
   <http://localhost:3000>. Verify that the live products appear and that an
   inactive product does not. Create a test account and verify that you can log
   in, sign out, and request a password reset. Check the browser console and
   page if the catalog reports an error; incomplete Firebase configuration and
   invalid product records are omitted with a visible warning and logged for
   correction; other valid products remain available.
11. Set `WEB_APP_ORIGIN` to the storefront's production origin in
    `functions/.env.<project-id>`, then deploy the function and rules:

    ```powershell
    npx firebase-tools deploy --only functions,firestore:rules
    ```

    Copy the deployed `createCheckoutOrder` HTTPS URL into
    `NEXT_PUBLIC_ORDER_FUNCTION_URL` in `.env.local` and the hosting
    environment.
12. Sign in, add products to the bag, and submit checkout. Confirm the WhatsApp
    message includes delivery details, payment preference, order ID, and the
    total returned by the function. Verify the created order in Firestore and
    confirm the manual fulfillment process with the shop team.

## 4. Build and deploy the storefront

Before deploying, make sure the shop has reviewed the product names, prices,
photos, WhatsApp recipient, and fulfillment estimates. Then run a production
build locally:

```powershell
npm run build
```

For a straightforward Next.js deployment, use a hosting provider that supports
Next.js (for example, Vercel):

1. Push the project to a private or public GitHub repository as appropriate.
   Do not commit `.env.local`.
2. Import the repository into the hosting provider and let it detect Next.js.
   Keep the default build command unless the provider requests otherwise.
3. Add the six `NEXT_PUBLIC_FIREBASE_*` settings,
   `NEXT_PUBLIC_WHATSAPP_NUMBER`, and `NEXT_PUBLIC_ORDER_FUNCTION_URL` from
   `.env.local` to the hosting project's production environment variables.
   These Firebase web-app values are used by the browser; never put
   service-account keys, payment secrets, or other private credentials in
   `NEXT_PUBLIC_*` variables.
4. Deploy, then open the production URL and repeat the catalog, account,
   bag, and WhatsApp inquiry checks from steps 10–11.
5. If a `NEXT_PUBLIC_*` value changes, redeploy so the new value is included in
   the frontend build.

The Firebase Function creates a pending order and calculates its total, but does
not initiate payment, reserve stock, or confirm fulfillment. Configure
`WEB_APP_ORIGIN` to the exact storefront origin for Functions CORS. Checkout
requires a signed-in Firebase user.

## 5. What to do next

Work through these in order; each step builds on the one before it:

1. **Operate the manual MVP.** Add the real catalog, test inquiries on desktop
   and mobile, confirm how staff verify stock and delivery, and document the
   manual payment and fulfillment process. Keep customer-facing prices and
   fulfillment estimates accurate.
2. **Add and test M-Pesa payments.** Implement server-side payment initiation
   and a verified callback that updates order status. Store provider credentials
   in Firebase Functions secrets, never in frontend environment variables.
   Do not mark an order paid based only on a browser redirect or customer
   message.
3. **Complete order and stock operations.** Define how to prevent overselling,
   handle failed/duplicate payment callbacks, update order status, and process
   cancellations/refunds. Add a protected way for authorized staff to manage
   catalog and orders; product writes are currently denied to all clients.
4. **Prepare launch.** Expand coverage for cart behavior, stock edge cases, and
   future payment callbacks. Run `npm test` to execute product validation,
   Firestore rules, and the tampered-price checkout integration test in Firebase
   emulators, then review privacy, support, shipping, returns, and payment
   messaging before launch.

Describe checkout honestly as a pending order followed by WhatsApp confirmation,
not as a payment flow. Daraja and Pesapal credentials must be held server-side;
do not collect or send card numbers or security codes through the storefront or
WhatsApp.

Run `npm test` for product, rules, and function emulator tests, and verify the
production bundle with `npm run build` before deployment.
