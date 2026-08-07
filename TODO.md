# TODO — Run + improvements

## Done
- [x] Installed server & client dependencies (`npm install`)
- [x] Backend: Added `POST /api/custom-order` endpoint (Cloudinary image + imageUrl, saves to contact_forms)
- [x] Frontend: Rewrote corrupted `CustomOrderModal.jsx` (component, state, submit)
- [x] Frontend: Wired `CustomOrderModal` into `Categories.jsx` Custom Order card
- [x] Frontend: Fixed product card sizing in `styles/index.css`
- [x] Verified production build succeeds (vite build, 1.62s)
- [x] Tested `/api/custom-order` endpoint → `{"success":true,"id":5}`
- [x] Started backend on :3001 (Mongo + Cloudinary connected)
- [x] Started frontend dev server on :5000 (Vite, proxy verified)

## Admin: ready_to_ship / reject + ParcelGuru shipment
- [x] db.js: add `updateOrderShipment(id, { status, awb_number })`
- [x] parcelguru.js: add `statusMap` + webhook status mapping helper
- [x] index.js: trigger `pushOrder` only on `ready_to_ship` status change
- [x] index.js: add `POST /api/v1/channel/event/hook` webhook endpoint
- [x] Admin.jsx: add `ready_to_ship` + `rejected` to status dropdown/colors
- [x] TrackOrder.jsx: add `ready_to_ship` to steps + `rejected` handling
- [x] Verify statuses + test webhook endpoint

## SPA routing fix (live site 404 on reload)
- [x] server/index.js: serve built React app (`client/dist`) with express.static
- [x] server/index.js: add SPA fallback — non-API GET routes serve `index.html`
- [x] Verified `/about` returns SPA HTML (no more 404) and `/api/*` still returns JSON

## Next
- Rebuild frontend (`cd client && npm run build`) before deploying so `client/dist` is fresh
- Push to live site
