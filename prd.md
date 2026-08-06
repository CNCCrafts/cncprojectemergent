# PRD: CNC Crafts E-Commerce Platform

## 1. Overview
Full-stack e-commerce webapp for **CNC Crafts & Solutions** — a manufacturer of precision CNC art (acrylic, MDF, ACP, PVC, 3D printed items). Customers browse, purchase, and track orders; Admin manages catalog, inventory, offers, and fulfillment.

**Stack**: React (Vite) + Tailwind CSS frontend, Node.js/Express backend, SQLite (via better-sqlite3), Cloudinary for image uploads, Google OAuth for customer login.

---

## 2. Customer-Facing Pages (Home Page)

### Home Page (`/`)
- **Hero section** with tagline "Precision in Every Cut", CTA buttons (Shop Collection, Get a Quote)
- **Trust bar** — 4 feature highlights (Premium Quality, Secure Payment, Fast Shipping, 24/7 Support)
- **Categories grid** — 5 material categories (Acrylic Art, MDF Art, ACP Signage, PVC Displays, 3D Designs), each linking to `/categories#<id>`
- **Bestselling Crafts** — product card grid (image, title, category, price, offer badge, "Add to bag" button)
- **CTA section** — "Ready to Create Something Beautiful?" with Start Shopping / Contact Expert buttons
- **Footer** with logo, quick links, materials links, newsletter signup

### Categories Page (`/categories`)
- Products filtered by material category via URL hash
- Display product cards with images, prices, offers

### About Page (`/about`)
- Company info, mission, team details

### Contact Page (`/contact`)
- Contact form, address, phone, email

### Track Order Page (`/track`)
- Order lookup by order ID + phone/email — shows status (pending, confirmed, shipped, delivered, cancelled)

### Cart
- Slide-out cart panel (toggle via Navbar)
- Add/remove items, update quantities
- Checkout flow
- **Login required** at checkout (redirects to login modal)

---

## 3. Authentication & Customer Features

### Login Modal (Triggered via Navbar "Login" Button)
- Email + password login
- **Google OAuth** (`VITE_GOOGLE_CLIENT_ID`) — one-click sign-in
- Registration with name, email, phone, password
- Guest browsing allowed; login required for purchase

### Auth Context (`AuthContext.jsx`)
- Customer auth state persisted via localStorage (`cnc_customer`)
- Admin auth via separate token (`cnc_admin_token`)
- Login modal open/close control globally

---

## 4. Admin Panel (`/admin`)

### Access
- Protected route — locked behind admin login button on `/admin` page
- Admin credentials validated against backend (`ADMIN_EMAIL`, `ADMIN_PASSWORD` in .env)
- Admin token stored as `cnc_admin_token`

### Sidebar Navigation (5 tabs)

#### 4a. Dashboard Tab
- **4 stat cards**: Live Revenue, Order Flow (total orders), Critical Inventory (items < 5 units), Pending Action (pending orders)
- **Real-time Order Stream table** — last 6 orders (ID, customer, status, total, action)

#### 4b. Products Tab (Catalog Management)
- **Table** listing all products with columns: Asset & Identity (image + name + REF ID), Classification (category), Base Yield (price), Active Offer (offer_price + discount %), Inventory (stock count), Actions (edit/delete)
- **Add Product** button opens modal with:
  - Image upload (Cloudinary) or direct URL input
  - Name, Category (dropdown), Price (₹), Stock, Description
  - Active toggle (visibility to customers)
- **Edit Product** — same modal pre-filled, updates existing entry
- **Delete Product** — confirmation prompt, removes from DB

#### 4c. Promotions / Offers Tab
- **Banner Section**:
  - Textarea for banner narrative (promotional text)
  - Visibility toggle (active/inactive)
  - Image upload for banner visual
  - Save / Deactivate buttons
  - Live preview panel showing banner asset
- **Discount Matrix table** — per product:
  - List Price (strikethrough)
  - Target Offer input field (₹)
  - Calculated Net (shows discount % if active)
  - Save button to commit offer to product

#### 4d. Inventory Tab
- **Stock Integrity table** — per product:
  - Catalog Reference (name + category)
  - Capacity State (current stock + OPTIMAL/CRITICAL badge)
  - Adjustment Offset (input to set new stock value)
  - Commit button to save

#### 4e. Orders Tab
- **Per-order accordion cards** showing:
  - Collapsed: Ref ID, Customer, Timestamp, Gross Yield, Status badge
  - Expanded:
    - Customer Metadata (email, phone, address)
    - System State Transition dropdown (update order status: pending → confirmed → shipped → delivered → cancelled)
    - Manifest Breakdown table (items, qty, unit price, line total)

---

## 5. Backend API Endpoints

### Products
- `GET /api/products/all` — fetch all products
- `POST /api/products` — create product
- `PUT /api/products/:id` — update product
- `DELETE /api/products/:id` — delete product
- `GET /api/products?category=<id>` — fetch by category (for storefront)

### Inventory
- `PUT /api/inventory/:id` — update stock count

### Orders
- `GET /api/orders` — fetch all orders (admin)
- `PUT /api/orders/:id/status` — update order status
- `POST /api/orders` — create order (customer checkout)
- `GET /api/track?ref=<id>&phone=<phone>` — track order lookup

### Settings (Banner)
- `GET /api/settings` — fetch banner config
- `PUT /api/settings` — update banner (image, text, active)

### Auth
- `POST /api/auth/login` — admin login
- `POST /api/auth/customer/login` — customer email login
- `POST /api/auth/customer/register` — customer registration
- `POST /api/auth/google` — Google OAuth login

### Upload
- `POST /api/upload` — upload image to Cloudinary

---

## 6. Data Models

### Customer
- id, name, email, phone, password (hashed), google_id, created_at

### Order
- id, customerName, customerEmail, customerPhone, address, items (JSON), total, status, created_at

### Product
- id, name, category, price, offer_price (nullable), description, image, stock, active (boolean), created_at

### Setting
- id, key, value (stores banner_image, banner_text, banner_active)

---

## 7. UI / Styling Notes
- **Color Scheme**: Primary = `#D92D20` (red), Background = `#FAFAFA`, Text = `#0F172A`
- **Typography**: Tailwind font-heading (Inter), sans-serif
- **Components**: Lucide icons, Tailwind CSS, custom `shadow-relief`, `btn-primary`, `btn-ghost`, `half-relief` utilities
- **Animations**: Fade-in, slide-in, hover scale/translate transitions
- **Responsive**: Mobile-first grid layouts, container max-width ~1200px
- **Toast notifications**: Fixed top-center for admin actions (success/error)
- **Modal CRUD**: Product form modal with backdrop blur, scrollable form, Cloudinary image upload

---

## 8. Token Optimization Notes (for AI)
- All features are **implemented** in this codebase — no hypothetical/planned features listed
- Admin panel is monolithic in `Admin.jsx` (tabs managed via state, no React Router subroutes)
- Context providers (`AuthContext`, `CartContext`) wrap entire app in `App.jsx`
- CSS is in `index.css` (global Tailwind + custom classes) and component-level `<style>` JSX blocks
- Backend uses `better-sqlite3` (file: `cnc_ecom.db`), Express session, Cloudinary SDK
- `.env` file required for secrets (MongoDB URI placeholder in schema, actual DB is SQLite)

