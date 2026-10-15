# Moniq☆Luxe MVP: setup and next steps

This guide takes the current storefront from a local preview to a small, usable
MVP. The MVP lets customers browse a Firestore catalog, add products to a bag,
and send an order inquiry through WhatsApp. You confirm availability, delivery,
and payment with each customer.

**Important:** customer email/password sign-in and account creation are available
when Firebase Authentication is configured. The bag and checkout collect
delivery details and a preferred payment option (M-Pesa/Daraja Sandbox or
Visa/bank card/Pesapal), then open a WhatsApp order request. Payment gateway
processing, automatic order submission, and stock reservation are not
implemented; customers are not charged online.

## 1. Check prerequisites

Install:

- Node.js 22 or newer (the same major version is required by the optional
  Firebase Functions project).
- npm, which is included with Node.js.
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
to the bag, open `/cart`, and check its quantity and subtotal. Continue to
checkout, enter delivery details, select a payment preference, and verify the
WhatsApp order request and recipient. This is a manual order inquiry; neither
payment option initiates a real or sandbox charge yet.

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
   | `stockQuantity` | number | Optional; whole-number local quantity, useful for future checkout validation |

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
   invalid product data are surfaced rather than silently replaced with sample
   data.
11. Place a test inquiry using the bag and checkout. Confirm that the received
    message includes delivery details, selected payment preference, item
    quantities, prices, and subtotal. Confirm the manual order process with the
    shop team.

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
3. Add the same six `NEXT_PUBLIC_FIREBASE_*` settings and
   `NEXT_PUBLIC_WHATSAPP_NUMBER` from `.env.local` to the hosting project's
   production environment variables. These Firebase web-app values are used by
   the browser; never put service-account keys, payment secrets, or other
   private credentials in `NEXT_PUBLIC_*` variables.
4. Deploy, then open the production URL and repeat the catalog, account,
   bag, and WhatsApp inquiry checks from steps 10–11.
5. If a `NEXT_PUBLIC_*` value changes, redeploy so the new value is included in
   the frontend build.

The Firebase Functions code is not required for this WhatsApp MVP and is not
called by the current checkout page. Do not deploy it expecting it to enable
payment or automatic checkout; that integration still needs to be implemented.
The `WEB_APP_ORIGIN` setting is for Functions CORS when that backend is
integrated, not a required storefront setting.

## 5. What to do next

Work through these in order; each step builds on the one before it:

1. **Operate the manual MVP.** Add the real catalog, test inquiries on desktop
   and mobile, confirm how staff verify stock and delivery, and document the
   manual payment and fulfillment process. Keep customer-facing prices and
   fulfillment estimates accurate.
2. **Integrate authenticated checkout.** Customer email/password signup, login,
   password reset, and sign-out are implemented in the storefront. Connect the
   signed-in customer to `createCheckoutOrder` from checkout using a Firebase ID
   token, and show order success and recoverable errors. The existing function
   creates `pending_payment` orders using server-side product prices, but the
   current storefront does not call it.
3. **Add and test M-Pesa payments.** Implement server-side payment initiation
   and a verified callback that updates order status. Store provider credentials
   in Firebase Functions secrets, never in frontend environment variables.
   Do not mark an order paid based only on a browser redirect or customer
   message.
4. **Complete order and stock operations.** Define how to prevent overselling,
   handle failed/duplicate payment callbacks, update order status, and process
   cancellations/refunds. Add a protected way for authorized staff to manage
   catalog and orders; product writes are currently denied to all clients.
5. **Add automated checks and prepare launch.** Cover cart behavior, product
   validation, authorization, order totals, stock edge cases, and payment
   callbacks. Test rules and functions in the Firebase emulators, then review
   privacy, support, shipping, returns, and payment messaging before launch.

Until authenticated order creation and payment gateway integrations are
complete, describe the checkout honestly as a WhatsApp order inquiry with
manual confirmation—not as an online checkout or a payment flow. Daraja and
Pesapal credentials must be held server-side; do not collect or send card
numbers or security codes through the storefront or WhatsApp.
