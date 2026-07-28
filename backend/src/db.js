import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')
    ? { rejectUnauthorized: false }
    : false
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      price NUMERIC NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      images JSONB NOT NULL DEFAULT '[]',
      featured BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      notes TEXT,
      items JSONB NOT NULL DEFAULT '[]',
      total NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      email TEXT,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      title TEXT,
      body TEXT NOT NULL,
      reply TEXT,
      approved BOOLEAN NOT NULL DEFAULT false,
      status TEXT NOT NULL DEFAULT 'pending',
      verified_purchase BOOLEAN NOT NULL DEFAULT false,
      helpful_count INTEGER NOT NULL DEFAULT 0,
      is_featured BOOLEAN NOT NULL DEFAULT false,
      is_pinned BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS review_images (
      id SERIAL PRIMARY KEY,
      review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS review_replies (
      id SERIAL PRIMARY KEY,
      review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
      admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
      reply TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Ensure category constraint allows perfumes (drop & recreate safely)
  await pool.query(`
    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
    ALTER TABLE products ADD CONSTRAINT products_category_check
      CHECK(category IN ('skin', 'hair', 'perfumes'));
  `).catch(() => {});

  // Add delivery_charge column to orders if it doesn't exist yet
  await pool.query(`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC NOT NULL DEFAULT 0;
  `).catch(() => {});

  // Migrate old reviews: add new columns if missing
  const migrations = [
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id) ON DELETE CASCADE`,
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title TEXT`,
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'`,
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verified_purchase BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`,
  ];
  for (const sql of migrations) {
    await pool.query(sql).catch(() => {});
  }

  // Sync status with approved flag for existing rows
  await pool.query(`
    UPDATE reviews SET status = CASE WHEN approved THEN 'approved' ELSE 'pending' END
    WHERE status = 'pending' AND approved = true
  `).catch(() => {});

  // ── New feature migrations ────────────────────────────────────
  // Payment & coupon fields on orders
  const orderMigrations = [
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod'`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending'`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC NOT NULL DEFAULT 0`,
  ];
  for (const sql of orderMigrations) await pool.query(sql).catch(() => {});

  // Coupons table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL DEFAULT 'percent',
      value NUMERIC NOT NULL,
      min_order NUMERIC NOT NULL DEFAULT 0,
      max_discount NUMERIC,
      expiry TIMESTAMPTZ,
      usage_limit INTEGER,
      used_count INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `).catch(() => {});

  // Password reset tokens
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      account_type TEXT NOT NULL DEFAULT 'user',
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `).catch(() => {});
}

export async function seedAdmin(email, password) {
  if (!email || !password) return;
  const { rows } = await pool.query('SELECT id FROM admins WHERE email = $1', [email]);
  if (rows.length === 0) {
    const hash = bcrypt.hashSync(password, 10);
    await pool.query('INSERT INTO admins (email, password_hash) VALUES ($1, $2)', [email, hash]);
    console.log(`Seeded admin: ${email}`);
  }
}

export default pool;
