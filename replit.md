# CNCCrafts E-Commerce

A full-stack CNC art & custom designs e-commerce platform.

## Stack
- **Frontend**: React + Vite (in `/client`) — port 5000
- **Backend**: Express.js (in `/server`) — port 3001
- **Database**: MongoDB Atlas (connection via `MONGODB_URI` secret)
- **Image storage**: Cloudinary (falls back to local disk if not configured)

## Running the Project

Two workflows run in parallel:
- **Backend API**: `cd server && node index.js` — Express API on port 3001
- **Start application**: `cd client && npm run dev` — Vite dev server on port 5000, proxies `/api` and `/uploads` to port 3001

## Required Secrets
- `MONGODB_URI` — MongoDB Atlas connection string
- `CLOUDINARY_API_SECRET` — Cloudinary secret key
- `ADMIN_PASSWORD` — Admin panel password
- `SESSION_SECRET` — JWT signing secret

## Environment Variables (shared)
- `MONGODB_DB_NAME=cnc_ecom`
- `CLOUDINARY_CLOUD_NAME=wiuxxcvz`
- `CLOUDINARY_API_KEY=861455542942942`
- `ADMIN_EMAIL=admin@cnccrafts.com`

## Features
- Modern navbar with cart, search, and sign-in
- Home page with hero, category grid, and features section
- Products page with 5 categories: Acrylic Art, MDF Art, ACP, PVC, 3D Designs + Custom Orders
- Functional cart with checkout (places orders via API, decrements stock)
- Customer registration & login (JWT-based)
- Order tracking by order ID + email
- Admin dashboard at `/admin` — manage products, inventory, orders, contacts

## Admin Panel (`/admin`)
- Login: `ADMIN_EMAIL` / `ADMIN_PASSWORD` (set in secrets/env)
- **Dashboard**: Revenue, order counts, low-stock alerts
- **Products**: Add/edit/delete products, toggle active/hidden
- **Inventory**: Update stock quantities
- **Orders**: View details, update status (pending → confirmed → shipped → delivered)

## User Preferences
- Keep project structure as `/client` (frontend) and `/server` (backend)
- Indian Rupee (₹) for prices
- Professional, fluid design with gold accent color
