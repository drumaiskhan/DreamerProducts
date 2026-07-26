# Dreamer Products

A skin & hair care storefront with:
- A **public site** where customers browse products by category (Skin / Hair) and tap "Enquire" to message you on WhatsApp or email to order.
- A **password-protected admin panel** (only you can log in) to add, edit, and remove products — including uploading product photos.

---

## Project structure

```
dreamer-products/
├── backend/     Express + PostgreSQL API (products, admin login, Cloudinary image upload)
└── frontend/    React storefront + admin dashboard (Vite)
```

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the API runs on (default `4000`) |
| `DATABASE_URL` | PostgreSQL connection string (e.g. from Render) |
| `JWT_SECRET` | Long random string for signing admin tokens |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
| `FRONTEND_URL` | Your deployed frontend URL (for CORS) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Your deployed backend URL (e.g. `https://your-api.onrender.com`) |

---

## Running locally

### 1. Backend

```bash
cd backend
npm install
npm start
```

Starts the API on **http://localhost:4000**. Requires a running PostgreSQL database — tables are created automatically on first start.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens the storefront at **http://localhost:5173**. Admin panel is at **/admin/login**.

---

## Deploying

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com), pointing to the `backend/` folder.
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add a **PostgreSQL** database on Render and copy its connection string to `DATABASE_URL`.
5. Set all other environment variables (JWT_SECRET, ADMIN_*, CLOUDINARY_*, FRONTEND_URL) in Render's dashboard.

### Frontend → Netlify

1. Create a new site on [Netlify](https://netlify.com), pointing to the `frontend/` folder.
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set `VITE_API_URL` to your Render backend URL in Netlify's environment variables.
5. The `public/_redirects` file is already included — React routes like `/admin/login` will work after refresh.

### Images → Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com) and copy your **Cloud Name**, **API Key**, and **API Secret** from the dashboard.
2. Add them as environment variables on Render (backend).

---

## Before you go live

- Change `ADMIN_PASSWORD` to something only you know.
- Set `JWT_SECRET` to a long random string.
- Update the WhatsApp number and contact email in `frontend/src/components/EnquiryModal.jsx`.
