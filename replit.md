# Dreamer Products

A clinical-luxe skin & hair care storefront with a "Dr. Dreamer" brand identity.

## Stack

- **Frontend**: React + Vite (port 5000)
- **Backend**: Express + PostgreSQL API (port 4000)
- **Images**: Cloudinary (for product/hero images uploaded via admin)
- **Auth**: JWT (admin) + JWT (customers)

## Running locally

Both workflows are already configured:

- **Start application** → `cd frontend && npm run dev` (port 5000)
- **Backend API** → `cd backend && npm start` (port 4000)

Frontend proxies `/api` to `http://localhost:4000` via Vite config.

## Environment variables needed

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | API port (default 4000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Long random string for signing tokens |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
| `FRONTEND_URL` | Deployed frontend URL (for CORS) |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (default: `http://localhost:4000`) |

## Admin panel

- URL: `/admin/login`
- Default email: `admin@drdreamer.com`
- Default password: `ChangeMe123!` ← **change this before going live**

From the admin panel you can:
- Add/edit/remove products (with image uploads)
- Manage orders and update their status
- Approve/reply to customer reviews
- Manage registered customers
- Change hero image, category images, trust bar text, WhatsApp/email contact

## AI-generated images

The following images are pre-generated and live in `frontend/public/`:
- `hero-image.jpg` — hero section
- `cat-skin.jpg`, `cat-hair.jpg`, `cat-perfumes.jpg` — category cards
- `brand-story.jpg` — brand story section
- `product-skin.jpg`, `product-hair.jpg`, `product-perfume.jpg` — product card placeholders (shown when no product image is uploaded)

All of these can be replaced from the admin panel → Settings tab.

## Design system

Clinical-luxe "Dr. Dreamer" aesthetic — deep forest green (`#1B3A2D`), sage (`#7A9E8E`), warm white, gold accents. Fonts: Cormorant Garamond (display) + DM Sans (body).

## User preferences

- Brand name: **Dreamer Products** / **Dr. Dreamer**
- Visual direction: clinical-luxe, dermatologist aesthetic, clean and professional
