import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import nodemailer from 'nodemailer';

import pool, { initDb, seedAdmin } from './db.js';
import { requireAdmin, requireUser, optionalUser } from './authMiddleware.js';

// ─── Cloudinary (graceful — works without credentials) ────────
const cloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY    &&
  process.env.CLOUDINARY_API_SECRET
);

let uploadStorage;
if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  uploadStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'dreamer-products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
    },
  });
  console.log('✅  Cloudinary configured — image uploads enabled');
} else {
  uploadStorage = multer.memoryStorage();
  console.warn('⚠️   Cloudinary not configured — image uploads disabled');
}

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!cloudinaryConfigured) {
      return cb(new Error('Image uploads require Cloudinary. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your environment.'), false);
    }
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG, or WEBP images are allowed'), ok);
  },
});

// ─── Email (optional) ─────────────────────────────────────────
function createMailer() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}
const mailer = createMailer();

async function sendOrderEmail(order) {
  if (!mailer) return;
  const itemsText = order.items.map(i => `• ${i.name} × ${i.quantity} — Rs ${Number(i.price * i.quantity).toLocaleString()}`).join('\n');
  const deliveryCharge = Number(order.delivery_charge || 0);
  const subtotal = Number(order.total) - deliveryCharge;
  try {
    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.STORE_EMAIL || process.env.EMAIL_USER,
      subject: `New Order #${order.id} — ${order.customer_name}`,
      text: `New order received!\n\nOrder #${order.id}\nCustomer: ${order.customer_name}\nEmail: ${order.email}\nPhone: ${order.phone}\nCity: ${order.city}\nAddress: ${order.address}\n\nItems:\n${itemsText}\n\nSubtotal: Rs ${Number(subtotal).toLocaleString()}\nDelivery: Rs ${deliveryCharge.toLocaleString()}\nTotal: Rs ${Number(order.total).toLocaleString()}\n\nNotes: ${order.notes || 'None'}`,
    });
  } catch (e) {
    console.error('Email error:', e.message);
  }
}

// ─── App ──────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// ── Admin auth ───────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const { rows } = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    const admin = rows[0];
    if (!admin || !bcrypt.compareSync(password, admin.password_hash))
      return res.status(401).json({ error: 'Incorrect email or password' });
    const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email: admin.email });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── User auth ────────────────────────────────────────────────
app.post('/api/user/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows[0]) return res.status(409).json({ error: 'An account with this email already exists' });
    const hash = bcrypt.hashSync(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone) VALUES ($1,$2,$3,$4) RETURNING id,name,email,phone',
      [name, email, hash, phone || null]
    );
    const user = rows[0];
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ error: 'Incorrect email or password' });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Products (public) ────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    const valid = ['skin', 'hair', 'perfumes'];
    const result = valid.includes(category)
      ? await pool.query(`
          SELECT p.*,
            COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
            COUNT(r.id)::int AS review_count
          FROM products p
          LEFT JOIN reviews r ON r.product_id = p.id AND r.approved = true
          WHERE p.category = $1
          GROUP BY p.id
          ORDER BY p.created_at DESC
        `, [category])
      : await pool.query(`
          SELECT p.*,
            COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
            COUNT(r.id)::int AS review_count
          FROM products p
          LEFT JOIN reviews r ON r.product_id = p.id AND r.approved = true
          GROUP BY p.id
          ORDER BY p.created_at DESC
        `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
        COUNT(r.id)::int AS review_count
      FROM products p
      LEFT JOIN reviews r ON r.product_id = p.id AND r.approved = true
      WHERE p.id = $1
      GROUP BY p.id
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Products (admin) ─────────────────────────────────────────
app.get('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/products', requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const { name, category, description, price, stock, featured } = req.body;
    if (!name || !category || !price) return res.status(400).json({ error: 'Name, category and price required' });
    if (!['skin','hair','perfumes'].includes(category)) return res.status(400).json({ error: 'Invalid category' });
    const urls = req.files ? req.files.map(f => f.path) : [];
    const { rows } = await pool.query(
      `INSERT INTO products (name,category,description,price,stock,image_url,images,featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, category, description||'', parseFloat(price), parseInt(stock||0), urls[0]||null, JSON.stringify(urls), featured==='true'||featured===true]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/products/:id', requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const { rows: ex } = await pool.query('SELECT * FROM products WHERE id=$1', [req.params.id]);
    if (!ex[0]) return res.status(404).json({ error: 'Product not found' });
    const p = ex[0];
    const { name, category, description, price, stock, featured } = req.body;
    if (category && !['skin','hair','perfumes'].includes(category)) return res.status(400).json({ error: 'Invalid category' });
    let image_url = p.image_url, images = p.images || [];
    if (req.files && req.files.length > 0) {
      const urls = req.files.map(f => f.path);
      image_url = urls[0]; images = urls;
    }
    const { rows } = await pool.query(
      `UPDATE products SET name=$1,category=$2,description=$3,price=$4,stock=$5,image_url=$6,images=$7,featured=$8 WHERE id=$9 RETURNING *`,
      [name??p.name, category??p.category, description??p.description,
       price!==undefined?parseFloat(price):p.price, stock!==undefined?parseInt(stock):p.stock,
       image_url, JSON.stringify(images),
       featured!==undefined?(featured==='true'||featured===true):p.featured, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id FROM products WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Orders ───────────────────────────────────────────────────
app.post('/api/orders', optionalUser, async (req, res) => {
  try {
    const { customer_name, email, phone, address, city, notes, items, total, delivery_charge } = req.body;
    if (!customer_name || !email || !phone || !address || !city)
      return res.status(400).json({ error: 'Please fill in all required fields' });
    if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    const { rows } = await pool.query(
      `INSERT INTO orders (user_id,customer_name,email,phone,address,city,notes,items,total,delivery_charge)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.user?.id||null, customer_name, email, phone, address, city, notes||'', JSON.stringify(items), parseFloat(total), parseFloat(delivery_charge||0)]
    );
    const order = rows[0];
    sendOrderEmail(order);
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Orders (admin) ───────────────────────────────────────────
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['Pending','Confirmed','Shipped','Completed','Cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id FROM orders WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
    await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Reviews (public) — product-level ─────────────────────────
app.get('/api/reviews', async (req, res) => {
  try {
    const { product_id } = req.query;
    let query, params;
    if (product_id) {
      query = `
        SELECT r.id, r.product_id, r.customer_name, r.rating, r.title, r.body,
          r.reply, r.verified_purchase, r.helpful_count, r.is_featured, r.is_pinned, r.created_at,
          COALESCE(json_agg(ri ORDER BY ri.sort_order) FILTER (WHERE ri.id IS NOT NULL), '[]') AS images
        FROM reviews r
        LEFT JOIN review_images ri ON ri.review_id = r.id
        WHERE r.approved = true AND r.product_id = $1
        GROUP BY r.id
        ORDER BY r.is_pinned DESC, r.is_featured DESC, r.created_at DESC
      `;
      params = [product_id];
    } else {
      query = `
        SELECT r.id, r.product_id, r.customer_name, r.rating, r.title, r.body,
          r.reply, r.verified_purchase, r.helpful_count, r.is_featured, r.is_pinned, r.created_at,
          COALESCE(json_agg(ri ORDER BY ri.sort_order) FILTER (WHERE ri.id IS NOT NULL), '[]') AS images
        FROM reviews r
        LEFT JOIN review_images ri ON ri.review_id = r.id
        WHERE r.approved = true
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `;
      params = [];
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Rating summary for a product
app.get('/api/products/:id/rating', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average,
        COUNT(CASE WHEN rating = 5 THEN 1 END)::int AS five,
        COUNT(CASE WHEN rating = 4 THEN 1 END)::int AS four,
        COUNT(CASE WHEN rating = 3 THEN 1 END)::int AS three,
        COUNT(CASE WHEN rating = 2 THEN 1 END)::int AS two,
        COUNT(CASE WHEN rating = 1 THEN 1 END)::int AS one
      FROM reviews
      WHERE product_id = $1 AND approved = true
    `, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reviews', optionalUser, upload.array('images', 5), async (req, res) => {
  try {
    const { customer_name, email, rating, title, body, product_id } = req.body;
    if (!customer_name || !rating || !body)
      return res.status(400).json({ error: 'Name, rating and review text are required' });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ error: 'Rating must be 1–5' });
    const { rows } = await pool.query(
      `INSERT INTO reviews (customer_name, email, rating, title, body, product_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING *`,
      [customer_name, email || null, parseInt(rating), title || null, body, product_id ? parseInt(product_id) : null]
    );
    const review = rows[0];
    // Save uploaded images
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        await pool.query(
          'INSERT INTO review_images (review_id, image_url, sort_order) VALUES ($1,$2,$3)',
          [review.id, req.files[i].path, i]
        );
      }
    }
    res.status(201).json(review);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Mark helpful
app.post('/api/reviews/:id/helpful', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING helpful_count',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Review not found' });
    res.json({ helpful_count: rows[0].helpful_count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Reviews (admin) ───────────────────────────────────────────
app.get('/api/admin/reviews', requireAdmin, async (req, res) => {
  try {
    const { product_id, status, rating } = req.query;
    let conditions = [];
    let params = [];
    if (product_id) { params.push(product_id); conditions.push(`r.product_id = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`r.status = $${params.length}`); }
    if (rating) { params.push(parseInt(rating)); conditions.push(`r.rating = $${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(`
      SELECT r.*,
        p.name AS product_name,
        COALESCE(json_agg(ri ORDER BY ri.sort_order) FILTER (WHERE ri.id IS NOT NULL), '[]') AS images
      FROM reviews r
      LEFT JOIN products p ON p.id = r.product_id
      LEFT JOIN review_images ri ON ri.review_id = r.id
      ${where}
      GROUP BY r.id, p.name
      ORDER BY r.created_at DESC
    `, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Review stats for admin dashboard
app.get('/api/admin/reviews/stats', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END)::int AS approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int AS rejected,
        COALESCE(ROUND(AVG(CASE WHEN approved THEN rating END)::numeric, 1), 0) AS average_rating
      FROM reviews
    `);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/reviews/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE reviews SET approved = NOT approved,
        status = CASE WHEN approved THEN 'pending' ELSE 'approved' END,
        updated_at = NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Review not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/reviews/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending','approved','rejected','spam'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const approved = status === 'approved';
    const { rows } = await pool.query(
      'UPDATE reviews SET status=$1, approved=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [status, approved, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Review not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/reviews/:id/verified', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE reviews SET verified_purchase = NOT verified_purchase, updated_at=NOW() WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Review not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/reviews/:id/feature', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE reviews SET is_featured = NOT is_featured, updated_at=NOW() WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Review not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/reviews/:id/pin', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE reviews SET is_pinned = NOT is_pinned, updated_at=NOW() WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Review not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/reviews/:id/reply', requireAdmin, async (req, res) => {
  try {
    const { reply } = req.body;
    const { rows } = await pool.query(
      'UPDATE reviews SET reply=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [reply || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Review not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Bulk actions
app.post('/api/admin/reviews/bulk', requireAdmin, async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ error: 'No IDs provided' });
    if (action === 'approve') {
      await pool.query(`UPDATE reviews SET approved=true, status='approved', updated_at=NOW() WHERE id = ANY($1)`, [ids]);
    } else if (action === 'reject') {
      await pool.query(`UPDATE reviews SET approved=false, status='rejected', updated_at=NOW() WHERE id = ANY($1)`, [ids]);
    } else if (action === 'delete') {
      await pool.query('DELETE FROM reviews WHERE id = ANY($1)', [ids]);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Contact form ──────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message are required' });
    if (mailer) {
      await mailer.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.STORE_EMAIL || process.env.EMAIL_USER,
        replyTo: email,
        subject: `Contact form message from ${name}`,
        text: `New contact form submission\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`,
      });
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Site settings (public) ────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM site_settings');
    res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Site settings (admin) ─────────────────────────────────────
app.get('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM site_settings');
    res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/settings', requireAdmin,
  upload.fields([
    { name: 'hero_image',      maxCount: 1 },
    { name: 'cat_img_skin',    maxCount: 1 },
    { name: 'cat_img_hair',    maxCount: 1 },
    { name: 'cat_img_perfumes',maxCount: 1 },
    { name: 'brand_image',     maxCount: 1 },
    { name: 'favicon_url',     maxCount: 1 },
  ]),
  async (req, res) => {
  try {
    const updates = { ...req.body };
    const files = req.files || {};
    if (files.hero_image?.[0])       updates.hero_image       = files.hero_image[0].path;
    if (files.cat_img_skin?.[0])     updates.cat_img_skin     = files.cat_img_skin[0].path;
    if (files.cat_img_hair?.[0])     updates.cat_img_hair     = files.cat_img_hair[0].path;
    if (files.cat_img_perfumes?.[0]) updates.cat_img_perfumes = files.cat_img_perfumes[0].path;
    if (files.brand_image?.[0])      updates.brand_image      = files.brand_image[0].path;
    if (files.favicon_url?.[0])      updates.favicon_url      = files.favicon_url[0].path;
    for (const [key, value] of Object.entries(updates)) {
      await pool.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      );
    }
    const { rows } = await pool.query('SELECT key, value FROM site_settings');
    res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Users (admin) ─────────────────────────────────────────────
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, phone, address, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 4000;

async function start() {
  await initDb();
  await seedAdmin(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  app.listen(PORT, () => console.log(`Dream Products API running on port ${PORT}`));
}

start().catch(err => { console.error('Failed to start:', err); process.exit(1); });
