# Dreamer Products

A skincare, haircare & perfume storefront with a React frontend and Express + PostgreSQL backend.

## Stack

- **Frontend**: React 19 + Vite (port 5000)
- **Backend**: Express + PostgreSQL (port 4000), auto-migrates tables on start
- **Images**: Cloudinary (optional — app runs without it, uploads disabled)

## Running on Replit

Two workflows are configured and run automatically:

| Workflow | Command | Port |
|---|---|---|
| Start application | `cd frontend && npm install && npm run dev` | 5000 |
| Backend API | `cd backend && npm install --legacy-peer-deps && npm start` | 4000 |

The Vite dev server proxies `/api/*` → `http://localhost:4000`, so no `VITE_API_URL` is needed in development.

## Environment variables / secrets

| Key | Where | Notes |
|---|---|---|
| `DATABASE_URL` | Auto-managed by Replit | PostgreSQL — always available |
| `JWT_SECRET` | Replit Secret | Signs admin + user JWT tokens |
| `ADMIN_EMAIL` | Replit Secret | Admin login email |
| `ADMIN_PASSWORD` | Replit Secret | Admin login password |
| `CLOUDINARY_CLOUD_NAME` | Replit Secret (optional) | Required for image uploads |
| `CLOUDINARY_API_KEY` | Replit Secret (optional) | Required for image uploads |
| `CLOUDINARY_API_SECRET` | Replit Secret (optional) | Required for image uploads |
| `FRONTEND_URL` | Optional env var | CORS origin — defaults to `*` |

## Admin panel

Visit `/admin/login` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Features:
- **Products** — add/edit/delete with multi-image upload, bulk delete
- **Orders** — status management, COD payment tracking ("Mark Cash Received"), bulk delete
- **Reviews** — approve/pin/feature/reply, bulk delete
- **Users** — view/delete customer accounts
- **Coupons** — create percent/fixed discount codes
- **Settings** — theme colours, fonts, hero/category/brand/favicon/logo/placeholder image uploads, announcement banner, delivery charge, social share image

## Cart

The cart icon opens a popup window (`/cart-popup`) showing items, qty controls, and checkout. If the browser blocks popups, a fallback link appears inline. Cart state syncs between the main window and the popup via `localStorage` + the `storage` event.

## User preferences

- Keep the existing project structure (monorepo: `frontend/` + `backend/`)
- Do not restructure to pnpm workspaces unless explicitly asked
