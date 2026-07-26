# PRD — CNC Crafts E-Commerce (UI/UX Refresh)

## Original Problem Statement
> https://github.com/CNCCrafts/cncproject.git — Inspect the repo. Keep functionality and layout unchanged.
> Improve only the UI/UX: enhance all UI components, redesign category sections, use better typography,
> and maintain a consistent modern design. Read `prd.md` and follow its requirements. In the admin panel,
> ensure "Add Product" supports image upload. Leave everything else unchanged. Commit all changes and
> push to the repository if possible; otherwise, tell me and I'll push manually. And the website should
> be mobile, tablet, desktop compatible, dynamic.

## User Choices (verbatim)
- Design direction: **Premium e-commerce**
- Image upload storage: **Cloudinary** (with local-disk fallback when secret is unset)
- Stack: **Keep original stack** (React + Vite + Express + JSON-file DB + Cloudinary)

## Architecture (unchanged)
- **Frontend**: React 18 + Vite 5 + Tailwind v4 (via `@tailwindcss/vite`) + lucide-react + Tabler icons
- **Backend**: Node 20 + Express 4 + Multer + Cloudinary SDK
- **Data**: JSON-file DB (`server/db.js`), no schema changes
- **Auth**: Existing admin token + customer email/pw + optional Google OAuth (unchanged)

## Design System (new)
| Token | Value |
|-------|-------|
| Ink (primary text/BG) | `#0F1B2D` |
| Accent (terracotta) | `#C7451F` |
| Accent-deep | `#A6371A` |
| Cream background | `#FBF7F0` |
| Surface | `#FFFFFF` |
| Border | `#EDE6D8` |
| Muted text | `#6B7280` |
| Display font | Fraunces (serif, variable) |
| Body font | Manrope (sans, 300–800) |
| Mono | JetBrains Mono |

## Implemented (this session)
- Cohesive design tokens across all components (`index.css` + `styles/index.css`)
- Fraunces + Manrope typography pairing (loaded via Google Fonts CDN)
- **Home**: editorial hero with kinetic photo stack, dark trust bar, 5-tile
  category showcase, bestsellers grid, dark CTA card
- **Categories**: dark hero, sticky category-nav, redesigned section headers
  (kicker + icon badge + material study eyebrow), refined product cards
- **About / Contact / TrackOrder**: unified page-hero + card system
- **Navbar**: glassy sticky header with hover state, search input, cart badge,
  user dropdown, mobile drawer with search
- **Footer**: 4-col grid (brand + explore + materials + newsletter) with
  radial glow, socials, legal row
- **Cart drawer**: 460px right-drawer, slide-in animation, quantity controls
- **LoginModal / OfferBanner**: aligned with new token system
- **Admin**: swapped accent hex codes (#D92D20→#C7451F, #B42318→#A6371A,
  #FAFAFA→#FBF7F0). Structure untouched.
- **Add Product image upload**: server now auto-detects Cloudinary env,
  falls back to local disk storage at `server/uploads/…` served via
  `/uploads/<file>` when Cloudinary secret is not configured.
- Fully responsive: dedicated breakpoints at 1024 / 768 / 640 / 480 / 420

## Files Touched
- `client/index.html`
- `client/src/index.css`
- `client/src/styles/index.css`
- `client/src/styles/auth-track.css`
- `client/src/App.jsx`
- `client/src/components/Navbar.jsx`
- `client/src/components/Cart.jsx`
- `client/src/pages/{Home,Categories,About,Contact,TrackOrder,Admin}.jsx`
- `server/index.js`

## Verified
- Home / Categories / About / Contact render correctly at 1440px
- Admin login → Add Product modal → image upload works (returns
  `/uploads/<name>` when Cloudinary secret missing, real Cloudinary URL
  otherwise)
- Backend `/api/upload` accepts multipart file with admin bearer token

## Deferred / Backlog
- P1: Refresh sidebar & KPI card layout inside Admin so it visually flows
  with the new global palette (currently untouched per task constraint)
- P2: Add product-detail page & related-items section
- P2: Real Google OAuth setup (needs client ID + secret)
- P2: Wishlist / favorites, product search results page
- P2: SEO metadata + sitemap for public pages
- P2: Migrate JSON-file DB to SQLite (already listed in original prd.md)

## Session 2 — Jul 24, 2026

**Delivered**
- **Track Order → My Orders**: removed manual inputs; logged-out shows sign-in card, logged-in shows expandable order cards with 4-step tracker, itemised total and delivery details.
- **Admin login placeholder** corrected (`admin@cnccrafts.in` — was `cnccraft.in`).
- **Fixed hidden Tailwind bug**: a global `* { margin:0; padding:0 }` reset in `styles/index.css` had been silently killing every Tailwind utility (padding/margin), which is why the Admin dashboard looked squashed. Removed the wildcard reset and scoped it to explicit elements. Admin panel now renders correctly.
- **Branding**: replaced text "C" mark in navbar & footer with the supplied CNC oval logo; cleaned it to remove the "20" from the left ESTD plaque as requested; regenerated `favicon.ico` (16/32/48/64) and `logo.png`.
- **New backend endpoint**: `GET /api/orders/mine?email=…` returns a customer's orders (newest first) with parsed item arrays.

**Verified**
- Admin login → dashboard KPI cards render at full width with proper padding, sidebar shows icons, real-time order table lays out correctly.
- Track Order (logged out) → sign-in card visible.
- Track Order (logged in) → order list + expand/collapse works, progress tracker highlights the current step in green.

**Committed** `8a81cfe feat: My Orders flow, admin polish, real logo + fix Tailwind reset bug`
