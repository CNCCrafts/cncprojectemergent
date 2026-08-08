# TODO — WhatsApp Integration After Checkout

## Steps
- [x] Analyze checkout flow in `client/src/components/Cart.jsx`
- [x] Understand styles in `client/src/styles/index.css`
- [x] Confirm plan with user (include order ID in WhatsApp message)
- [x] Update `Cart.jsx`: build WhatsApp message with order details + order ID, auto-open WhatsApp, and add WhatsApp button on success screen
- [x] Update `client/src/styles/index.css`: add WhatsApp button styling
- [x] Verify build/lint

## Bugfix — "Could not load your orders" on live site
- [x] Fix `TrackOrder.jsx`: use `apiUrl()` instead of relative `/api/orders/mine` URL

## Bugfix — 404 on live site when reloading sub-pages
- [x] Harden SPA fallback in `server/index.js` (regex catch-all + final middleware)
- [x] Add `client/public/_redirects` for Netlify-style static hosts
- [x] Verify server syntax + client build (both pass)
