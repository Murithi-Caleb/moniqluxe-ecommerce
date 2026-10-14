# Project Structure and Decisions

This document describes the current Moniq☆Luxe codebase and records the
technical, product, and interface decisions reflected in the implementation.
It is intended to help future contributors understand both where code belongs
and why the current MVP is built this way.

## Repository layout

```text
.
├── functions/                 Firebase Cloud Functions project
│   ├── index.js               Authenticated order-creation endpoint
│   ├── package.json           Backend runtime and dependencies
│   └── package-lock.json      Pinned backend dependency tree
├── src/
│   ├── app/                   Next.js App Router routes and root styling
│   │   ├── checkout/page.js   Bag review and WhatsApp handoff
│   │   ├── login/page.js      Login route and route metadata
│   │   ├── signup/page.js     Signup route and route metadata
│   │   ├── globals.css        Global dark theme and Tailwind import
│   │   ├── layout.js          Shared document layout and metadata
│   │   ├── page.js            Storefront and product catalog
│   │   └── providers.js       Shared client providers and site header
│   ├── components/            Reusable interface components
│   │   ├── AuthForm.jsx       Shared login and signup form
│   │   ├── ProductCard.jsx    Product details and shopping actions
│   │   ├── SiteHeader.jsx     Shared navigation, account, and bag actions
│   │   └── WhatsAppInquiryLink.jsx
│   ├── context/               Cross-route client state
│   │   ├── AuthContext.js     Firebase authentication state and actions
│   │   └── CartContext.js     Bag state, persistence, and derived totals
│   └── lib/                   External service clients and utilities
│       ├── firebase.js        Firebase app/Auth/Firestore/Storage setup
│       └── whatsapp.js        WhatsApp link construction
├── firestore.rules            Firestore access-control rules
├── firebase.json              Firebase CLI project configuration
├── .env.local.example         Browser configuration template and guidance
├── MVP_SETUP.md               Local setup, Firebase setup, and deployment guide
├── README.md                  Project overview, status, and quick start
├── package.json               Frontend scripts and dependencies
└── next.config.js, jsconfig.json,
    postcss.config.mjs          Framework, import alias, and CSS tooling config
```

Local secrets and generated/dependency directories are intentionally not part of
the committed source tree. In particular, `.env.local` contains local settings
and must not be committed.

## Structure and architecture decisions

### Next.js App Router for pages

Routes live under `src/app`, with folders for route-specific pages such as
`login`, `signup`, and `checkout`. This follows the framework's file-system
routing conventions, keeps URL ownership visible, and allows each route to define
its own metadata. `layout.js` provides the shared document, while `providers.js`
places client-only shared functionality around the route tree.

### Keep shared UI and domain state separate

Reusable visual elements are under `src/components`; cross-route state is under
`src/context`; Firebase initialization and small integrations are under `src/lib`.
This avoids putting every concern in route files and makes shared pieces easier
to change without duplicating them.

The root provider order supplies auth and cart state to the shared header and
pages. The header is mounted once rather than duplicated on the storefront,
login, and signup routes, so the bag count and account controls stay consistent.

### A separate Firebase Functions project

The browser app and `functions/` have their own dependency manifests and lock
files. Functions use the Admin SDK and a Node.js 22 runtime, while the storefront
uses Firebase's browser SDK. Keeping these deployment/runtime boundaries explicit
prevents server credentials and server-only packages from becoming part of the
browser bundle and lets the backend deploy independently.

### Plain JavaScript and the `@/` import alias

The existing app is written in JavaScript, so new pages and state continue that
convention rather than introducing a partial TypeScript migration. The `@/*`
alias maps imports to `src/*`, which keeps imports stable and readable as files
move within the source tree.

## Technical decisions

### Firebase is optional for the local preview

`src/lib/firebase.js` initializes Firebase only in the browser and only when all
required public web-app settings are present. With no Firebase settings, the
sample product catalog can still be previewed. Partial configuration is
represented as an error rather than silently pretending the live service is
working. This supports local design and development without requiring a Firebase
project while keeping configuration mistakes visible.

Firebase browser configuration is public client configuration, not a secret.
Administrative credentials and payment secrets must stay server-side and must
never be placed in `NEXT_PUBLIC_*` variables.

### Firebase Authentication owns identity

`AuthContext` observes Firebase's auth-state stream and exposes email/password
signup, login, password reset, and sign-out actions to the rest of the client
app. This avoids separate components maintaining conflicting copies of the
signed-in user. Auth-dependent navigation waits for the initial auth-state
resolution to avoid briefly showing the wrong account actions.

Signup stores the customer's display name on the Firebase Auth profile. It does
not currently create a Firestore profile document. Account pages remain usable
as a local visual preview, but account actions require Firebase configuration
and the Email/Password provider to be enabled in the Firebase console.

### Client cart for the inquiry MVP; server authority for orders

The shopping bag is stored in browser local storage so it survives page reloads
without requiring a customer account or a cart service. Cart values are validated
when restored and Firebase order creation independently reads products and
prices from Firestore. Client-stored prices are convenient for display and
WhatsApp inquiry text; they are not authoritative for a paid order.

The Cloud Function verifies a Firebase ID token, validates item identifiers and
quantities, reads current product prices and availability from Firestore, checks
local stock when configured, and creates an order with `pending_payment` status.
Firestore rules deny client-side product writes and order writes. The current
checkout UI does **not** yet call this function: it builds an inquiry and hands
off to WhatsApp for manual confirmation. Payment, stock reservation, and order
status updates therefore remain future work.

### Narrow, explicit Firestore access

The rules allow public reads of products, deny client product writes, permit an
authenticated user to read their own orders, and scope user-document access to
the matching Firebase UID. A final deny-all rule prevents accidental access to
collections that are not explicitly covered. The function uses the Admin SDK
for order creation after performing its own validation.

## Interface and HCI decisions

### A coherent luxury visual language

The interface uses a dark neutral background with warm gold accents, restrained
borders, rounded surfaces, and generous spacing to support the curated-luxury
brand. Gold is also used for important actions and prices, while supporting copy
uses softer contrast to preserve hierarchy. Catalog cards, the global header, and
the auth pages share this visual vocabulary.

### Responsive, task-focused account forms

Login and signup share `AuthForm` so their field styles, focus behavior, error
handling, and navigation remain consistent. A two-column brand/story panel is
used on larger screens; it is hidden on smaller screens so the primary form
remains focused and avoids a cramped side-by-side layout.

Fields have persistent visible labels, appropriate input types and autocomplete
hints, and helpful password guidance. Signup requests a name, email, password,
and confirmation; confirmation catches a common entry mistake before a request
is sent. The password visibility control lets customers verify what they typed
without changing the underlying value.

### Feedback, error prevention, and accessibility

Forms use native browser validation for required fields, email format, and
minimum password length. Password mismatch and Firebase failures are reported
near the form, and submission buttons show progress and prevent duplicate
submissions. Password reset uses neutral success copy so the interface does not
reveal whether an email has a registered account.

Semantic headings, navigation landmarks, associated labels, buttons with
explicit types, descriptive accessible names for icon-only controls, visible
keyboard focus, and status/alert announcements support keyboard and assistive
technology use. Color is not the only way an error or status is conveyed.

### Clear shopping and delivery expectations

The product card and bag show prices in KES and identify local-stock versus
dropship/pre-order fulfillment with delivery estimates. The bag provides direct
quantity controls and removal actions, while the WhatsApp summary makes the
selected products, quantities, and subtotal explicit before customers contact
the store. Delivery fees and final availability are described as requiring
confirmation rather than being implied as guaranteed.

## Current boundaries and next implementation steps

- Configure Firebase and enable Email/Password Authentication for live accounts.
- Integrate authenticated checkout with `createCheckoutOrder` and provide
  recoverable order status feedback.
- Implement M-Pesa initiation and verified server-side callbacks before claiming
  that online payments are supported.
- Define transactional stock reservation, duplicate callback handling, order
  status operations, and staff-only catalog/order management.
- Add automated tests for auth states, cart behavior, Firestore rules, order
  validation, stock edge cases, and payment callbacks.

The current frontend build has been verified with `npm run build`; automated
test suites have not yet been added.
