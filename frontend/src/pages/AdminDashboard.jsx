import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import ProductFormModal from '../components/ProductFormModal';

export default function AdminDashboard() {
  const [tab, setTab] = useState('products');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.getAdminProducts().catch(() => []),
      api.getAdminOrders().catch(() => []),
      api.getAdminReviews().catch(() => []),
    ]).then(([products, orders, reviews]) => {
      const revenue = orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + Number(o.total), 0);
      setStats({
        products: products.length,
        orders: orders.length,
        pending: orders.filter(o => o.status === 'Pending').length,
        reviews: reviews.length,
        pendingReviews: reviews.filter(r => !r.approved).length,
        revenue,
      });
    });
  }, [tab]);

  function logout() {
    localStorage.removeItem('dd_token');
    navigate('/admin/login');
  }

  const TABS = [
    { id: 'products',  label: '📦 Products' },
    { id: 'orders',    label: '🛍 Orders' },
    { id: 'reviews',   label: '💬 Reviews' },
    { id: 'users',     label: '👤 Users' },
    { id: 'coupons',   label: '🎟 Coupons' },
    { id: 'analytics', label: '📊 Analytics' },
    { id: 'settings',  label: '⚙️ Settings' },
  ];

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="container dash-header-inner">
          <div className="dash-brand">
            <span className="dash-dr">Dr.</span>
            <span className="display">Dreamer</span>
            <span className="dash-badge">Admin</span>
          </div>
          <div className="dash-header-actions">
            <a href="/" target="_blank" rel="noopener noreferrer" className="dash-link-btn">
              <span>↗</span> Storefront
            </a>
            <button className="dash-logout-btn" onClick={logout}>Log out</button>
          </div>
        </div>
      </header>

      {stats && (
        <div className="dash-stats-bar">
          <div className="container dash-stats-inner">
            <StatCard label="Total Products" value={stats.products} color="#6D48E5" />
            <StatCard label="Total Orders" value={stats.orders} color="#1A7F64" />
            <StatCard label="Pending Orders" value={stats.pending} color="#B45309" alert={stats.pending > 0} />
            <StatCard label="Pending Reviews" value={stats.pendingReviews} color="#BE185D" alert={stats.pendingReviews > 0} />
            <StatCard label="Total Revenue" value={`Rs ${Number(stats.revenue).toLocaleString()}`} color="#0369A1" />
          </div>
        </div>
      )}

      <div className="dash-tabs">
        <div className="container dash-tabs-inner">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`dash-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.id === 'orders' && stats?.pending > 0 && <span className="tab-dot" />}
              {t.id === 'reviews' && stats?.pendingReviews > 0 && <span className="tab-dot" />}
            </button>
          ))}
        </div>
      </div>

      <main className="container dash-main">
        {tab === 'products'  && <ProductsTab navigate={navigate} />}
        {tab === 'orders'    && <OrdersTab />}
        {tab === 'reviews'   && <ReviewsTab />}
        {tab === 'users'     && <UsersTab />}
        {tab === 'coupons'   && <CouponsTab />}
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'settings'  && <SettingsTab />}
      </main>

      <style>{`
        :root { --dash-bg: #F7F6F9; }
        .dash { min-height: 100vh; background: var(--dash-bg); }

        .dash-header { background: var(--twilight); color: var(--cream); box-shadow: 0 2px 12px rgba(0,0,0,.18); }
        .dash-header-inner { display: flex; align-items: center; justify-content: space-between; height: 62px; }
        .dash-brand { display: flex; align-items: center; gap: 10px; }
        .dash-dr { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #8BA899; letter-spacing: .05em; }
        .dash-brand .display { font-size: 18px; color: var(--cream); }
        .dash-badge { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; background: rgba(255,255,255,.12); color: rgba(250,243,236,.7); padding: 3px 10px; border-radius: 999px; }
        .dash-header-actions { display: flex; align-items: center; gap: 8px; }
        .dash-link-btn { display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 600; color: rgba(250,243,236,.7); background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.12); padding: 6px 14px; border-radius: 8px; text-decoration: none; transition: all .18s; }
        .dash-link-btn:hover { background: rgba(255,255,255,.18); color: #fff; }
        .dash-logout-btn { font-size: 13px; font-weight: 600; color: rgba(250,243,236,.6); background: none; border: none; cursor: pointer; font-family: inherit; padding: 6px 10px; border-radius: 8px; transition: color .18s; }
        .dash-logout-btn:hover { color: var(--cream); }

        .dash-stats-bar { background: #fff; border-bottom: 1px solid var(--border); }
        .dash-stats-inner { display: flex; gap: 0; padding: 0; overflow-x: auto; }
        .stat-card { flex: 1; padding: 18px 24px; border-right: 1px solid var(--border); min-width: 140px; }
        .stat-card:last-child { border-right: none; }
        .stat-label { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-soft); margin: 0 0 6px; }
        .stat-value { font-size: 26px; font-weight: 700; line-height: 1; margin: 0; }
        .stat-alert { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; margin-top: 4px; }
        .stat-alert-dot { width: 6px; height: 6px; border-radius: 50%; }

        .dash-tabs { background: #fff; border-bottom: 1px solid var(--border); overflow-x: auto; }
        .dash-tabs-inner { display: flex; min-width: max-content; }
        .dash-tab { position: relative; background: none; border: none; padding: 14px 20px; font-size: 13px; font-weight: 600; font-family: inherit; color: var(--ink-soft); cursor: pointer; border-bottom: 2px solid transparent; transition: color .15s, border-color .15s; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
        .dash-tab:hover { color: var(--ink); }
        .dash-tab.active { color: var(--twilight); border-bottom-color: var(--twilight); }
        .tab-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dusty-rose); }

        .dash-main { padding: 32px 28px 80px; }

        .dash-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .dash-toolbar h1 { font-size: 22px; font-weight: 700; }

        .table-wrap { background: #fff; border-radius: 14px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.04); overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        thead th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: var(--ink-soft); padding: 13px 18px; border-bottom: 1px solid var(--border); background: #fafafa; font-weight: 700; }
        tbody td { padding: 14px 18px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover { background: #fafafa; }

        .state-msg { color: var(--ink-soft); font-size: 14px; }
        .thumb { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; }
        .thumb-empty { background: linear-gradient(135deg, var(--moon-lavender), var(--dusty-rose)); opacity: 0.4; }
        .p-name { font-weight: 600; }
        .badge { margin-left: 8px; font-size: 10.5px; font-weight: 700; color: #8A6A1E; background: #FBEBC7; padding: 2px 8px; border-radius: 999px; }
        .capitalize { text-transform: capitalize; }
        .row-actions { display: flex; gap: 6px; justify-content: flex-end; }

        .status-select { font-size: 12.5px; font-weight: 700; padding: 5px 12px; border-radius: 999px; border: 1.5px solid transparent; cursor: pointer; font-family: inherit; outline: none; }
        .status-Pending   { color: #92400e; background: #fef3c7; border-color: #fde68a; }
        .status-Confirmed { color: #1e40af; background: #dbeafe; border-color: #bfdbfe; }
        .status-Shipped   { color: #5b21b6; background: #ede9fe; border-color: #ddd6fe; }
        .status-Completed { color: #14532d; background: #dcfce7; border-color: #bbf7d0; }
        .status-Cancelled { color: #991b1b; background: #fee2e2; border-color: #fecaca; }

        .order-customer { font-weight: 600; font-size: 14px; margin: 0; }
        .order-meta { font-size: 12.5px; color: var(--ink-soft); margin: 2px 0 0; }
        .order-items-list { font-size: 13px; color: var(--ink-soft); line-height: 1.6; }

        .review-body { font-size: 14px; color: var(--ink); line-height: 1.6; font-style: italic; }
        .review-reply-box { display: flex; flex-direction: column; gap: 6px; }
        .review-reply-input { font-size: 13px; padding: 8px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-family: inherit; resize: vertical; min-height: 64px; outline: none; transition: border-color .15s; }
        .review-reply-input:focus { border-color: var(--twilight); }
        .review-reply-saved { font-size: 12.5px; color: var(--ink-soft); font-style: italic; background: #f0f4ff; border-left: 3px solid var(--dusty-rose); padding: 6px 10px; border-radius: 0 6px 6px 0; }
        .review-approved { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; cursor: pointer; border: none; font-family: inherit; }
        .review-approved.yes { color: #14532d; background: #dcfce7; }
        .review-approved.no  { color: #92400e; background: #fef3c7; }

        .dash-empty { text-align: center; padding: 60px 20px; color: var(--ink-soft); }
        .dash-empty-icon { font-size: 48px; margin-bottom: 12px; }
        .dash-empty p { margin-bottom: 20px; }

        /* Settings */
        .settings-form { display: flex; flex-direction: column; gap: 24px; max-width: 700px; }
        .settings-section { background: #fff; border-radius: 14px; border: 1px solid var(--border); padding: 24px 28px; }
        .settings-section-title { font-size: 14px; font-weight: 700; color: var(--ink); margin: 0 0 18px; display: flex; align-items: center; gap: 8px; }
        .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .settings-grid-full { grid-column: 1 / -1; }
        .sfield { display: flex; flex-direction: column; gap: 6px; }
        .sfield label { font-size: 12px; font-weight: 700; color: var(--ink-soft); letter-spacing: .04em; text-transform: uppercase; }
        .sfield input, .sfield textarea { font-size: 14px; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 10px; font-family: inherit; outline: none; transition: border-color .15s; background: #fff; }
        .sfield input:focus, .sfield textarea:focus { border-color: var(--twilight); }
        .sfield textarea { resize: vertical; min-height: 80px; }
        .sfield .shint { font-size: 11.5px; color: var(--ink-soft); margin: 0; }
        .hero-img-preview { width: 100%; max-height: 200px; object-fit: cover; border-radius: 10px; margin-top: 8px; border: 1px solid var(--border); }
        .settings-save-row { display: flex; align-items: center; gap: 14px; }
        .settings-saved { font-size: 13px; color: #14532d; font-weight: 600; }
        .settings-error { font-size: 13px; color: #b91c1c; font-weight: 600; }

        /* Users */
        .user-name { font-weight: 600; margin: 0; }
        .user-meta { font-size: 12.5px; color: var(--ink-soft); margin: 2px 0 0; }

        @media (max-width: 768px) {
          .dash-stats-inner { flex-wrap: wrap; }
          .stat-card { flex: 0 0 50%; border-bottom: 1px solid var(--border); }
          .stat-card:nth-child(2), .stat-card:nth-child(4) { border-right: none; }
          .settings-grid { grid-template-columns: 1fr; }
          .settings-grid-full { grid-column: 1; }
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, color, alert }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={{ color }}>{value}</p>
      {alert && (
        <div className="stat-alert" style={{ color }}>
          <span className="stat-alert-dot" style={{ background: color }} />
          Needs attention
        </div>
      )}
    </div>
  );
}

// ─── Products Tab ──────────────────────────────────────────────
function ProductsTab({ navigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  function load() {
    setLoading(true);
    api.getAdminProducts()
      .then(setProducts)
      .catch((err) => {
        if (err.message.includes('authenticat') || err.message.includes('expired')) {
          localStorage.removeItem('dd_token');
          navigate('/admin/login');
        } else setError(err.message);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleDelete(product) {
    if (!confirm(`Remove "${product.name}"? This can't be undone.`)) return;
    try { await api.deleteProduct(product.id); load(); }
    catch (err) { alert(err.message); }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="dash-toolbar">
        <h1>Products <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }}>({filtered.length})</span></h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: 13, padding: '7px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'inherit', outline: 'none', width: 180 }}
          />
          <button className="btn btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>+ Add Product</button>
        </div>
      </div>
      {loading && <p className="state-msg">Loading…</p>}
      {error && <p className="state-msg" style={{ color: '#b91c1c' }}>{error}</p>}
      {!loading && !error && (
        filtered.length === 0 ? (
          <div className="dash-empty">
            <p className="dash-empty-icon">📦</p>
            <p>{search ? 'No products match your search.' : 'No products yet.'}</p>
            {!search && <button className="btn btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>Add your first product</button>}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ width: 60 }}>
                      {p.image_url ? (
                        <img className="thumb" src={p.image_url.startsWith('http') ? p.image_url : `${api.base}${p.image_url}`} alt="" />
                      ) : <div className="thumb thumb-empty" />}
                    </td>
                    <td>
                      <span className="p-name">{p.name}</span>
                      {Boolean(p.featured) && <span className="badge">Featured</span>}
                    </td>
                    <td className="capitalize" style={{ color: 'var(--ink-soft)' }}>
                      {p.category === 'skin' ? 'Skincare' : p.category === 'hair' ? 'Haircare' : 'Perfumes'}
                    </td>
                    <td style={{ fontWeight: 700 }}>Rs {Number(p.price).toLocaleString()}</td>
                    <td>
                      <span style={{ color: p.stock === 0 ? '#991b1b' : p.stock <= 5 ? '#b45309' : 'inherit', fontWeight: p.stock <= 5 ? 700 : 400 }}>
                        {p.stock === 0 ? 'Out of stock' : p.stock}
                      </span>
                    </td>
                    <td className="row-actions">
                      <button className="btn-ghost" onClick={() => { setEditing(p); setFormOpen(true); }}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete(p)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      {formOpen && (
        <ProductFormModal product={editing} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} />
      )}
    </>
  );
}

// ─── Orders Tab ────────────────────────────────────────────────
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Completed', 'Cancelled'];
const PAY_STATUSES   = ['pending', 'paid', 'failed', 'refunded'];

const PAY_COLORS = {
  pending:  { bg: '#fef3c7', color: '#92400e' },
  paid:     { bg: '#dcfce7', color: '#14532d' },
  failed:   { bg: '#fee2e2', color: '#991b1b' },
  refunded: { bg: '#e0e7ff', color: '#3730a3' },
};

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  function load() {
    setLoading(true);
    api.getAdminOrders().then(data => {
      setOrders(Array.isArray(data) ? data : data.orders || []);
    }).catch(err => setError(err.message)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleStatus(id, status) {
    try {
      const updated = await api.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: updated.status } : o));
    } catch (err) { alert(err.message); }
  }

  async function handlePayment(id, payment_status) {
    try {
      const updated = await api.updateOrderPayment(id, payment_status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: updated.payment_status } : o));
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this order permanently? This cannot be undone.')) return;
    try {
      await api.deleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) { alert(err.message); }
  }

  const filtered = orders
    .filter(o => filter === 'all' || o.status === filter)
    .filter(o => !search || o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase()) || String(o.id).includes(search));

  return (
    <>
      <div className="dash-toolbar">
        <h1>Orders <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }}>({filtered.length})</span></h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            placeholder="Search name / email / #…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: 13, padding: '7px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'inherit', outline: 'none', width: 200 }}
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ fontSize: 13, padding: '7px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'inherit', background: '#fff', cursor: 'pointer' }}>
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-ghost" onClick={load} style={{ fontSize: 13 }}>↻ Refresh</button>
        </div>
      </div>
      {loading && <p className="state-msg">Loading…</p>}
      {error && <p className="state-msg" style={{ color: '#b91c1c' }}>{error}</p>}
      {!loading && !error && (
        filtered.length === 0 ? (
          <div className="dash-empty"><p className="dash-empty-icon">🛍</p><p>No orders {filter !== 'all' ? `with status "${filter}"` : 'yet'}.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Order Status</th><th>Payment</th></tr></thead>
              <tbody>
                {filtered.map((o) => {
                  const items = Array.isArray(o.items) ? o.items : JSON.parse(o.items || '[]');
                  const pc = PAY_COLORS[o.payment_status] || PAY_COLORS.pending;
                  return (
                    <tr key={o.id}>
                      <td style={{ color: 'var(--ink-soft)', fontWeight: 700, fontSize: 13 }}>#{o.id}</td>
                      <td>
                        <p className="order-customer">{o.customer_name}</p>
                        <p className="order-meta">{o.email}</p>
                        <p className="order-meta">📞 {o.phone}</p>
                        <p className="order-meta">📍 {o.address}, {o.city}</p>
                        {o.notes && <p className="order-meta" style={{ fontStyle: 'italic' }}>"{o.notes}"</p>}
                        {o.coupon_code && (
                          <p className="order-meta">🎟 {o.coupon_code} −Rs {Number(o.discount_amount).toLocaleString()}</p>
                        )}
                        <p className="order-meta" style={{ textTransform: 'uppercase', fontSize: 11 }}>
                          {o.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                        </p>
                      </td>
                      <td>
                        <div className="order-items-list">
                          {items.map((item, i) => <div key={i}>{item.name} × {item.quantity}</div>)}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>Rs {Number(o.total).toLocaleString()}</td>
                      <td style={{ color: 'var(--ink-soft)', fontSize: 13, whiteSpace: 'nowrap' }}>
                        {new Date(o.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <select className={`status-select status-${o.status}`} value={o.status} onChange={e => handleStatus(o.id, e.target.value)}>
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {o.status === 'Cancelled' && (
                            <button
                              onClick={() => handleDelete(o.id)}
                              style={{ padding: '4px 8px', fontSize: 12, background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
                            >🗑 Delete</button>
                          )}
                        </div>
                      </td>
                      <td>
                        <select
                          value={o.payment_status || 'pending'}
                          onChange={e => handlePayment(o.id, e.target.value)}
                          style={{ fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 999, border: '1.5px solid transparent', cursor: 'pointer', fontFamily: 'inherit', outline: 'none', background: pc.bg, color: pc.color }}
                        >
                          {PAY_STATUSES.map(s => <option key={s} value={s} style={{ background: '#fff', color: '#000' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </>
  );
}

// ─── Reviews Tab ───────────────────────────────────────────────
function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyDraft, setReplyDraft] = useState({});
  const [savingReply, setSavingReply] = useState({});
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  function load() {
    setLoading(true);
    api.getAdminReviews().then(r => { setReviews(r); setReplyDraft(Object.fromEntries(r.map(x => [x.id, x.reply || '']))); })
      .catch(err => setError(err.message)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleApprove(id) {
    try {
      const updated = await api.toggleApproveReview(id);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: updated.approved } : r));
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    try { await api.deleteReview(id); setReviews(prev => prev.filter(r => r.id !== id)); }
    catch (err) { alert(err.message); }
  }

  async function handleReply(id) {
    setSavingReply(s => ({ ...s, [id]: true }));
    try {
      const updated = await api.replyToReview(id, replyDraft[id]);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: updated.reply } : r));
    } catch (err) { alert(err.message); }
    finally { setSavingReply(s => ({ ...s, [id]: false })); }
  }

  function Stars({ count }) {
    return <span style={{ color: '#E8C77E', fontSize: 14 }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;
  }

  const filtered = filter === 'all' ? reviews : filter === 'approved' ? reviews.filter(r => r.approved) : reviews.filter(r => !r.approved);

  return (
    <>
      <div className="dash-toolbar">
        <h1>Reviews <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }}>({filtered.length})</span></h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ fontSize: 13, padding: '7px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'inherit', background: '#fff', cursor: 'pointer' }}>
            <option value="all">All reviews</option>
            <option value="pending">Pending approval</option>
            <option value="approved">Approved</option>
          </select>
          <button className="btn-ghost" onClick={load} style={{ fontSize: 13 }}>↻ Refresh</button>
          <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => setShowAdd(true)}>+ Add Review</button>
        </div>
      </div>
      {loading && <p className="state-msg">Loading…</p>}
      {error && <p className="state-msg" style={{ color: '#b91c1c' }}>{error}</p>}
      {!loading && !error && (
        filtered.length === 0 ? (
          <div className="dash-empty">
            <p className="dash-empty-icon">💬</p>
            <p>No reviews {filter !== 'all' ? 'in this category' : 'yet'}.</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add first review</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Customer</th><th>Rating</th><th>Review</th><th>Your Reply</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ minWidth: 130 }}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{r.customer_name}</p>
                      {r.email && <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '2px 0 0' }}>{r.email}</p>}
                      <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '2px 0 0' }}>
                        {new Date(r.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}><Stars count={r.rating} /></td>
                    <td style={{ maxWidth: 280 }}><p className="review-body">"{r.body}"</p></td>
                    <td style={{ minWidth: 220 }}>
                      <div className="review-reply-box">
                        {r.reply && <div className="review-reply-saved">{r.reply}</div>}
                        <textarea
                          className="review-reply-input"
                          placeholder={r.reply ? 'Edit reply…' : 'Write a reply…'}
                          value={replyDraft[r.id] ?? ''}
                          onChange={e => setReplyDraft(d => ({ ...d, [r.id]: e.target.value }))}
                        />
                        <button className="btn-ghost" style={{ fontSize: 12, alignSelf: 'flex-start' }} disabled={savingReply[r.id]} onClick={() => handleReply(r.id)}>
                          {savingReply[r.id] ? 'Saving…' : r.reply ? '✓ Update reply' : '↩ Send reply'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <button onClick={() => handleApprove(r.id)} className={`review-approved ${r.approved ? 'yes' : 'no'}`} title={r.approved ? 'Click to unpublish' : 'Click to publish'}>
                        {r.approved ? '✓ Published' : '○ Pending'}
                      </button>
                    </td>
                    <td><button className="btn-danger" onClick={() => handleDelete(r.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      {showAdd && (
        <AddReviewModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); load(); }}
        />
      )}
    </>
  );
}

// ─── Add Review Modal ──────────────────────────────────────────
function AddReviewModal({ onClose, onSaved }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ customer_name: '', email: '', rating: 5, title: '', body: '', product_id: '', approved: true });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    api.getAdminProducts().then(setProducts).catch(() => {});
  }, []);

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleImages(e) {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  }

  function removeImage(i) {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.body.trim()) return setError('Name and review text are required.');
    setSaving(true); setError('');
    const fd = new FormData();
    fd.append('customer_name', form.customer_name);
    fd.append('email', form.email);
    fd.append('rating', form.rating);
    fd.append('title', form.title);
    fd.append('body', form.body);
    if (form.product_id) fd.append('product_id', form.product_id);
    fd.append('approved', form.approved ? 'true' : 'false');
    images.forEach(img => fd.append('images', img));
    try {
      await api.createAdminReview(fd);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Add Review</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-soft)', lineHeight: 1, padding: '2px 6px' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Customer name */}
          <div className="sfield">
            <label>Customer Name *</label>
            <input value={form.customer_name} onChange={e => setField('customer_name', e.target.value)} placeholder="e.g. Sara Khan" required />
          </div>

          {/* Email */}
          <div className="sfield">
            <label>Email <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></label>
            <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="customer@email.com" />
          </div>

          {/* Star rating */}
          <div className="sfield">
            <label>Star Rating *</label>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setField('rating', n)}
                  style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: n <= form.rating ? '#E8C77E' : '#D1D5DB', padding: '0 2px', lineHeight: 1, transition: 'color .15s' }}>
                  ★
                </button>
              ))}
              <span style={{ fontSize: 13, color: 'var(--ink-soft)', marginLeft: 8 }}>{form.rating} / 5</span>
            </div>
          </div>

          {/* Product */}
          <div className="sfield">
            <label>Product <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></label>
            <select value={form.product_id} onChange={e => setField('product_id', e.target.value)}
              style={{ fontSize: 14, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'inherit', background: '#fff', cursor: 'pointer', outline: 'none' }}>
              <option value="">— General review (no specific product) —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Title */}
          <div className="sfield">
            <label>Review Title <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></label>
            <input value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. Absolutely love this product!" />
          </div>

          {/* Body */}
          <div className="sfield">
            <label>Review Text *</label>
            <textarea value={form.body} onChange={e => setField('body', e.target.value)}
              placeholder="Write the customer's review here…" style={{ minHeight: 100 }} required />
          </div>

          {/* Images */}
          <div className="sfield">
            <label>Review Images <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(up to 5 · requires Cloudinary)</span></label>
            <button type="button" className="btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 13 }} onClick={() => fileRef.current?.click()}>
              📎 Choose images from device
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" multiple style={{ display: 'none' }} onChange={handleImages} />
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                    <button type="button" onClick={() => removeImage(i)}
                      style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approve toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, userSelect: 'none' }}>
            <input type="checkbox" checked={form.approved} onChange={e => setField('approved', e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--forest)' }} />
            Publish immediately (mark as approved)
          </label>

          {error && <p style={{ color: '#b91c1c', fontSize: 13, margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add Review'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Users Tab ─────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  function load() {
    setLoading(true);
    api.getAdminUsers().then(setUsers).catch(err => setError(err.message)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleDelete(user) {
    if (!confirm(`Delete account for "${user.name}"? Their orders will remain but their login will be removed.`)) return;
    try { await api.deleteUser(user.id); setUsers(prev => prev.filter(u => u.id !== user.id)); }
    catch (err) { alert(err.message); }
  }

  const filtered = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search))
  );

  return (
    <>
      <div className="dash-toolbar">
        <h1>Customers <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }}>({filtered.length})</span></h1>
        <input
          placeholder="Search name / email / phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ fontSize: 13, padding: '7px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'inherit', outline: 'none', width: 220 }}
        />
      </div>
      {loading && <p className="state-msg">Loading…</p>}
      {error && <p className="state-msg" style={{ color: '#b91c1c' }}>{error}</p>}
      {!loading && !error && (
        filtered.length === 0 ? (
          <div className="dash-empty">
            <p className="dash-empty-icon">👤</p>
            <p>{search ? 'No customers match your search.' : 'No registered customers yet.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th><th></th></tr></thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--ink-soft)', fontWeight: 700, fontSize: 13 }}>{u.id}</td>
                    <td><p className="user-name">{u.name}</p></td>
                    <td style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{u.email}</td>
                    <td style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{u.phone || '—'}</td>
                    <td style={{ color: 'var(--ink-soft)', fontSize: 13, maxWidth: 180 }}>{u.address || '—'}</td>
                    <td style={{ color: 'var(--ink-soft)', fontSize: 13, whiteSpace: 'nowrap' }}>
                      {new Date(u.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td><button className="btn-danger" onClick={() => handleDelete(u)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </>
  );
}

// ─── Coupons Tab ───────────────────────────────────────────────
function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  function load() {
    setLoading(true);
    api.getAdminCoupons().then(setCoupons).catch(err => setError(err.message)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleDelete(id, code) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try { await api.deleteCoupon(id); setCoupons(prev => prev.filter(c => c.id !== id)); }
    catch (err) { alert(err.message); }
  }

  function openNew() { setEditing(null); setShowForm(true); }
  function openEdit(c) { setEditing(c); setShowForm(true); }

  return (
    <>
      <div className="dash-toolbar">
        <h1>Coupons <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }}>({coupons.length})</span></h1>
        <button className="btn btn-primary" onClick={openNew}>+ New Coupon</button>
      </div>
      {loading && <p className="state-msg">Loading…</p>}
      {error && <p className="state-msg" style={{ color: '#b91c1c' }}>{error}</p>}
      {!loading && !error && (
        coupons.length === 0 ? (
          <div className="dash-empty">
            <p className="dash-empty-icon">🎟</p>
            <p>No coupons yet.</p>
            <button className="btn btn-primary" onClick={openNew}>Create your first coupon</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Usage</th><th>Expiry</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id}>
                    <td><span style={{ fontWeight: 700, letterSpacing: '.08em', fontSize: 13 }}>{c.code}</span></td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--ink-soft)', fontSize: 13 }}>{c.type}</td>
                    <td style={{ fontWeight: 600 }}>
                      {c.type === 'percent' ? `${c.value}%` : `Rs ${Number(c.value).toLocaleString()}`}
                      {c.max_discount ? <span style={{ fontSize: 11, color: 'var(--ink-soft)', display: 'block' }}>max Rs {Number(c.max_discount).toLocaleString()}</span> : null}
                    </td>
                    <td style={{ color: 'var(--ink-soft)', fontSize: 13 }}>
                      {Number(c.min_order) > 0 ? `Rs ${Number(c.min_order).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                      {c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ' / ∞'}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
                      {c.expiry ? new Date(c.expiry).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: c.active ? '#dcfce7' : '#fee2e2', color: c.active ? '#14532d' : '#991b1b' }}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="row-actions">
                      <button className="btn-ghost" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete(c.id, c.code)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      {showForm && (
        <CouponFormModal coupon={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
    </>
  );
}

function CouponFormModal({ coupon, onClose, onSaved }) {
  const isEdit = !!coupon;
  const [form, setForm] = useState({
    code: coupon?.code || '',
    type: coupon?.type || 'percent',
    value: coupon?.value || '',
    min_order: coupon?.min_order || '',
    max_discount: coupon?.max_discount || '',
    expiry: coupon?.expiry ? new Date(coupon.expiry).toISOString().slice(0, 10) : '',
    usage_limit: coupon?.usage_limit || '',
    active: coupon?.active !== false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const data = {
        code: form.code.toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        min_order: parseFloat(form.min_order || 0),
        max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
        expiry: form.expiry || null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        active: form.active,
      };
      if (isEdit) await api.updateCoupon(coupon.id, data);
      else await api.createCoupon(data);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.2)' }}>
        <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{isEdit ? 'Edit Coupon' : 'New Coupon'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-soft)' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="sfield">
            <label>Code *</label>
            <input value={form.code} onChange={e => setF('code', e.target.value.toUpperCase())} placeholder="e.g. SAVE20" required style={{ letterSpacing: '.08em', fontWeight: 700 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="sfield">
              <label>Discount type *</label>
              <select value={form.type} onChange={e => setF('type', e.target.value)} style={{ fontSize: 14, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'inherit', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed amount (Rs)</option>
              </select>
            </div>
            <div className="sfield">
              <label>Value * {form.type === 'percent' ? '(%)' : '(Rs)'}</label>
              <input type="number" min="0" step="0.01" value={form.value} onChange={e => setF('value', e.target.value)} placeholder={form.type === 'percent' ? '20' : '200'} required />
            </div>
            <div className="sfield">
              <label>Min. order (Rs) <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></label>
              <input type="number" min="0" value={form.min_order} onChange={e => setF('min_order', e.target.value)} placeholder="0" />
            </div>
            {form.type === 'percent' && (
              <div className="sfield">
                <label>Max discount (Rs) <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></label>
                <input type="number" min="0" value={form.max_discount} onChange={e => setF('max_discount', e.target.value)} placeholder="500" />
              </div>
            )}
            <div className="sfield">
              <label>Expiry date <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></label>
              <input type="date" value={form.expiry} onChange={e => setF('expiry', e.target.value)} />
            </div>
            <div className="sfield">
              <label>Usage limit <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></label>
              <input type="number" min="1" value={form.usage_limit} onChange={e => setF('usage_limit', e.target.value)} placeholder="∞ unlimited" />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, userSelect: 'none' }}>
            <input type="checkbox" checked={form.active} onChange={e => setF('active', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--forest)' }} />
            Active (coupon can be used)
          </label>
          {error && <p style={{ color: '#b91c1c', fontSize: 13, margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Analytics Tab ─────────────────────────────────────────────
function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    api.getAnalytics(days)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [days]);

  function MiniChart({ data: rows }) {
    if (!rows || rows.length === 0) return <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No data for this period.</p>;
    const maxRev = Math.max(...rows.map(r => parseFloat(r.revenue) || 0), 1);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80, padding: '0 4px' }}>
        {rows.map((r, i) => {
          const h = Math.max(4, Math.round(((parseFloat(r.revenue) || 0) / maxRev) * 76));
          return (
            <div key={i} title={`${r.date}: Rs ${Number(r.revenue).toLocaleString()} · ${r.orders} order${r.orders !== 1 ? 's' : ''}`}
              style={{ flex: 1, minWidth: 4, height: h, background: 'var(--forest)', borderRadius: '3px 3px 0 0', opacity: 0.8, cursor: 'default', transition: 'opacity .15s' }}
              onMouseOver={e => e.target.style.opacity = 1}
              onMouseOut={e => e.target.style.opacity = 0.8}
            />
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="dash-toolbar">
        <h1>Analytics</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              style={{ fontSize: 12, fontWeight: days === d ? 700 : 500, padding: '6px 14px', borderRadius: 999, border: '1.5px solid var(--border)', background: days === d ? 'var(--forest)' : '#fff', color: days === d ? '#fff' : 'var(--ink-soft)', cursor: 'pointer', fontFamily: 'inherit' }}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="state-msg">Loading…</p>}
      {error && <p className="state-msg" style={{ color: '#b91c1c' }}>{error}</p>}

      {!loading && !error && data && (
        <>
          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <AnalyticsCard label="Total Revenue" value={`Rs ${Number(data.total_revenue).toLocaleString()}`} color="#0369A1" />
            <AnalyticsCard label="Total Orders" value={data.total_orders} color="#1A7F64" />
            <AnalyticsCard label="Avg. Order Value" value={`Rs ${Number(data.avg_order_value).toLocaleString()}`} color="#6D48E5" />
          </div>

          {/* Revenue chart */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '22px 24px', marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px' }}>Revenue — last {days} days</p>
            <MiniChart data={data.revenue_by_day} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {data.revenue_by_day.length > 0 && (
                <>
                  <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{data.revenue_by_day[0]?.date}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{data.revenue_by_day[data.revenue_by_day.length - 1]?.date}</span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Top products */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '20px 22px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', margin: '0 0 14px' }}>🏆 Top Selling Products</p>
              {data.top_products.length === 0
                ? <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No sales data yet.</p>
                : data.top_products.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < data.top_products.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', width: 18 }}>#{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '2px 0 0', textTransform: 'capitalize' }}>{p.category}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.total_sold} sold</p>
                      <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '2px 0 0' }}>Rs {Number(p.total_revenue).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Low stock */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '20px 22px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', margin: '0 0 14px' }}>⚠️ Low / Out of Stock</p>
              {data.low_stock.length === 0
                ? <p style={{ color: '#14532d', fontSize: 13 }}>✓ All products are well stocked.</p>
                : data.low_stock.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '2px 0 0', textTransform: 'capitalize' }}>{p.category}</p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                      background: p.stock === 0 ? '#fee2e2' : '#fef3c7',
                      color: p.stock === 0 ? '#991b1b' : '#92400e',
                    }}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        </>
      )}
    </>
  );
}

function AnalyticsCard({ label, value, color }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-soft)', margin: '0 0 8px' }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{value}</p>
    </div>
  );
}

// ─── Settings Tab ──────────────────────────────────────────────
const CAT_DEFAULTS = {
  skin:     'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=700&q=80',
  hair:     'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=700&q=80',
  perfumes: '/perfume-category.jpg',
};

function ImageUploadField({ label, preview, fileRef, onChange, hint }) {
  return (
    <div className="sfield">
      <label>{label}</label>
      <button type="button" className="btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 13 }} onClick={() => fileRef.current?.click()}>
        {preview ? '↺ Change image' : '+ Upload image'}
      </button>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={onChange} />
      {preview && <img className="hero-img-preview" src={preview} alt={label} />}
      {hint && <p className="shint">{hint}</p>}
    </div>
  );
}

function SettingsTab() {
  const DEFAULTS = {
    hero_eyebrow: 'SKIN · HAIR · PERFUMES',
    hero_title: 'The glow you keep\ndreaming about,\nnow within reach.',
    hero_subtitle: 'Small-batch formulas for skin and hair, made to be part of the quiet five minutes you get to yourself each day.',
    hero_cta_primary: 'Shop Now →',
    hero_cta_secondary: 'Browse Collections',
    trust_1: 'Dermatologist Reviewed',
    trust_2: 'No Harmful Chemicals',
    trust_3: 'Fast Delivery',
    trust_4: 'Customer Satisfaction',
    badge_1_title: 'Dreamer Products',
    badge_1_sub: 'Pure Botanical',
    badge_2_title: 'Dermatologist',
    badge_2_sub: 'Reviewed',
    cat_label_skin: 'Skincare',
    cat_label_hair: 'Haircare',
    cat_label_perfumes: 'Perfumes',
    cat_tagline_skin: 'Clinically proven glow',
    cat_tagline_hair: 'Nourish every strand',
    cat_tagline_perfumes: 'Wear your signature',
    delivery_charge: '200',
    free_delivery_min: '3000',
    brand_title:      'Made with intention,\nbacked by science.',
    brand_rx_badge:   'Dermatologist-reviewed formulas',
    brand_body_1:     'Dreamer Products was born from a simple belief — that your skin and hair deserve the very best, without compromise. Every formula we make is thoughtfully crafted using pure botanicals, clinically verified for safety and efficacy, and free from harmful chemicals.',
    brand_body_2:     'From rich moisturisers that restore your natural glow, to silky hair serums that nourish at the root — each product is a precise ritual designed to fit into your everyday life.',
    brand_badge_num:  '100%',
    brand_badge_text: 'Natural\nIngredients',
    brand_stat_1_num: '3+',   brand_stat_1_label: 'Product Lines',
    brand_stat_2_num: '100%', brand_stat_2_label: 'Natural Base',
    brand_stat_3_num: '0',    brand_stat_3_label: 'Harmful Chemicals',
    delivery_note: '',
    announcement_banner: 'Free delivery on orders over Rs 3,000 · Dermatologist-reviewed formulas',
    whatsapp_number: '',
    contact_email: '',
    instagram_url: '',
    tiktok_url: '',
    // ── Theme ──
    theme_bg:               '#FAF8F5',
    theme_card:             '#FFFFFF',
    theme_primary:          '#1C1C1C',
    theme_secondary:        '#6B6B6B',
    theme_accent:           '#D9B99B',
    theme_accent_dark:      '#C4A080',
    theme_border:           '#ECECEC',
    theme_heading_font:     'Playfair Display',
    theme_body_font:        'Inter',
    theme_motion_style:     'normal',
    theme_page_transitions: 'true',
    theme_hover_cards:      'true',
    theme_reduced_motion:   'false',
    theme_radius:           'soft',
    theme_shadow:           'soft',
  };

  const THEME_COLOR_DEFAULTS = {
    theme_bg:          '#FAF8F5',
    theme_card:        '#FFFFFF',
    theme_primary:     '#1C1C1C',
    theme_secondary:   '#6B6B6B',
    theme_accent:      '#D9B99B',
    theme_accent_dark: '#C4A080',
    theme_border:      '#ECECEC',
  };

  const FONT_OPTIONS = [
    'Playfair Display', 'Cormorant Garamond', 'Lora', 'DM Serif Display',
    'Inter', 'DM Sans', 'Poppins', 'Montserrat',
  ];

  const [values, setValues] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // image files & previews
  const [files, setFiles] = useState({ hero_image: null, cat_img_skin: null, cat_img_hair: null, cat_img_perfumes: null, brand_image: null, favicon_url: null });
  const [previews, setPreviews] = useState({ hero_image: '', cat_img_skin: '', cat_img_hair: '', cat_img_perfumes: '', brand_image: '', favicon_url: '' });
  const refs = {
    hero_image:       useRef(),
    cat_img_skin:     useRef(),
    cat_img_hair:     useRef(),
    cat_img_perfumes: useRef(),
    brand_image:      useRef(),
    favicon_url:      useRef(),
  };

  useEffect(() => {
    api.getAdminSettings()
      .then(s => {
        setValues(prev => ({ ...DEFAULTS, ...prev, ...s }));
        setPreviews(p => ({
          ...p,
          hero_image:       s.hero_image       || '',
          cat_img_skin:     s.cat_img_skin     || CAT_DEFAULTS.skin,
          cat_img_hair:     s.cat_img_hair     || CAT_DEFAULTS.hair,
          cat_img_perfumes: s.cat_img_perfumes || CAT_DEFAULTS.perfumes,
          brand_image:      s.brand_image      || '',
          favicon_url:      s.favicon_url      || '',
        }));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function set(key, val) { setValues(v => ({ ...v, [key]: val })); setSaved(false); }

  function resetTheme() {
    setValues(v => ({
      ...v,
      ...THEME_COLOR_DEFAULTS,
      theme_heading_font: 'Playfair Display',
      theme_body_font: 'Inter',
      theme_motion_style: 'normal',
      theme_page_transitions: 'true',
      theme_hover_cards: 'true',
      theme_reduced_motion: 'false',
      theme_radius: 'soft',
      theme_shadow: 'soft',
    }));
    setSaved(false);
  }

  function handleFileChange(key) {
    return (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setFiles(f => ({ ...f, [key]: file }));
      setPreviews(p => ({ ...p, [key]: URL.createObjectURL(file) }));
      setSaved(false);
    };
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v));
    Object.entries(files).forEach(([k, f]) => { if (f) fd.append(k, f); });
    try {
      const updated = await api.updateSettings(fd);
      setValues(prev => ({ ...prev, ...updated }));
      setPreviews(p => ({
        hero_image:       updated.hero_image       || p.hero_image,
        cat_img_skin:     updated.cat_img_skin     || p.cat_img_skin,
        cat_img_hair:     updated.cat_img_hair     || p.cat_img_hair,
        cat_img_perfumes: updated.cat_img_perfumes || p.cat_img_perfumes,
        brand_image:      updated.brand_image      || p.brand_image,
        favicon_url:      updated.favicon_url      || p.favicon_url,
      }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="state-msg">Loading settings…</p>;

  return (
    <form className="settings-form" onSubmit={handleSave}>
      <div className="dash-toolbar" style={{ marginBottom: 0 }}>
        <h1>Site Settings</h1>
      </div>

      {/* Hero Section */}
      <div className="settings-section">
        <p className="settings-section-title">🖼 Hero Section</p>
        <div className="settings-grid">
          <div className="sfield settings-grid-full">
            <ImageUploadField
              label="Hero Image"
              preview={previews.hero_image}
              fileRef={refs.hero_image}
              onChange={handleFileChange('hero_image')}
              hint="JPG, PNG or WEBP · max 10 MB · requires Cloudinary"
            />
          </div>
          <div className="sfield settings-grid-full">
            <label>Eyebrow text</label>
            <input value={values.hero_eyebrow} onChange={e => set('hero_eyebrow', e.target.value)} placeholder={DEFAULTS.hero_eyebrow} />
          </div>
          <div className="sfield settings-grid-full">
            <label>Headline (line break = new line on site)</label>
            <textarea value={values.hero_title} onChange={e => set('hero_title', e.target.value)} placeholder={DEFAULTS.hero_title} style={{ minHeight: 100 }} />
          </div>
          <div className="sfield settings-grid-full">
            <label>Subtitle</label>
            <textarea value={values.hero_subtitle} onChange={e => set('hero_subtitle', e.target.value)} placeholder={DEFAULTS.hero_subtitle} />
          </div>
          <div className="sfield">
            <label>Primary CTA label</label>
            <input value={values.hero_cta_primary} onChange={e => set('hero_cta_primary', e.target.value)} placeholder={DEFAULTS.hero_cta_primary} />
          </div>
          <div className="sfield">
            <label>Secondary CTA label</label>
            <input value={values.hero_cta_secondary} onChange={e => set('hero_cta_secondary', e.target.value)} placeholder={DEFAULTS.hero_cta_secondary} />
          </div>
        </div>
      </div>

      {/* Hero Image Badges */}
      <div className="settings-section">
        <p className="settings-section-title">🏷 Hero Image Badges</p>
        <p className="shint" style={{ marginBottom: 16 }}>The two floating labels shown on top of the hero photo.</p>
        <div className="settings-grid">
          <div className="sfield">
            <label>Badge 1 — title</label>
            <input value={values.badge_1_title} onChange={e => set('badge_1_title', e.target.value)} placeholder={DEFAULTS.badge_1_title} />
          </div>
          <div className="sfield">
            <label>Badge 1 — subtitle</label>
            <input value={values.badge_1_sub} onChange={e => set('badge_1_sub', e.target.value)} placeholder={DEFAULTS.badge_1_sub} />
          </div>
          <div className="sfield">
            <label>Badge 2 — title</label>
            <input value={values.badge_2_title} onChange={e => set('badge_2_title', e.target.value)} placeholder={DEFAULTS.badge_2_title} />
          </div>
          <div className="sfield">
            <label>Badge 2 — subtitle</label>
            <input value={values.badge_2_sub} onChange={e => set('badge_2_sub', e.target.value)} placeholder={DEFAULTS.badge_2_sub} />
          </div>
        </div>
      </div>

      {/* Category Images */}
      <div className="settings-section">
        <p className="settings-section-title">🗂 Category Section</p>
        <p className="shint" style={{ marginBottom: 16 }}>Background photos and text labels shown on the Skincare, Haircare and Perfumes cards.</p>
        <div className="settings-grid">
          <ImageUploadField label="Skincare image"  preview={previews.cat_img_skin}     fileRef={refs.cat_img_skin}     onChange={handleFileChange('cat_img_skin')}     hint="Recommended: portrait 3:4" />
          <ImageUploadField label="Haircare image"  preview={previews.cat_img_hair}     fileRef={refs.cat_img_hair}     onChange={handleFileChange('cat_img_hair')}     hint="Recommended: portrait 3:4" />
          <ImageUploadField label="Perfumes image"  preview={previews.cat_img_perfumes} fileRef={refs.cat_img_perfumes} onChange={handleFileChange('cat_img_perfumes')} hint="Recommended: portrait 3:4" />
        </div>
        <div className="settings-grid" style={{ marginTop: 20 }}>
          {['skin', 'hair', 'perfumes'].map(cat => (
            <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="sfield">
                <label>{cat.charAt(0).toUpperCase() + cat.slice(1)} — card title</label>
                <input value={values[`cat_label_${cat}`]} onChange={e => set(`cat_label_${cat}`, e.target.value)} placeholder={DEFAULTS[`cat_label_${cat}`]} />
              </div>
              <div className="sfield">
                <label>{cat.charAt(0).toUpperCase() + cat.slice(1)} — tagline</label>
                <input value={values[`cat_tagline_${cat}`]} onChange={e => set(`cat_tagline_${cat}`, e.target.value)} placeholder={DEFAULTS[`cat_tagline_${cat}`]} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Story */}
      <div className="settings-section">
        <p className="settings-section-title">📖 Brand Story Section</p>
        <p className="shint" style={{ marginBottom: 16 }}>The "Our Story" section that appears below the category cards.</p>
        <div className="settings-grid">
          <div className="sfield settings-grid-full">
            <ImageUploadField
              label="Brand Story Image"
              preview={previews.brand_image}
              fileRef={refs.brand_image}
              onChange={handleFileChange('brand_image')}
              hint="JPG, PNG or WEBP · portrait 4:5 recommended · requires Cloudinary"
            />
          </div>
          <div className="sfield settings-grid-full">
            <label>Headline (use line break for new line)</label>
            <textarea value={values.brand_title} onChange={e => set('brand_title', e.target.value)} placeholder={DEFAULTS.brand_title} style={{ minHeight: 72 }} />
          </div>
          <div className="sfield settings-grid-full">
            <label>Verified badge text</label>
            <input value={values.brand_rx_badge} onChange={e => set('brand_rx_badge', e.target.value)} placeholder={DEFAULTS.brand_rx_badge} />
          </div>
          <div className="sfield settings-grid-full">
            <label>Paragraph 1</label>
            <textarea value={values.brand_body_1} onChange={e => set('brand_body_1', e.target.value)} placeholder={DEFAULTS.brand_body_1} style={{ minHeight: 80 }} />
          </div>
          <div className="sfield settings-grid-full">
            <label>Paragraph 2 <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></label>
            <textarea value={values.brand_body_2} onChange={e => set('brand_body_2', e.target.value)} placeholder={DEFAULTS.brand_body_2} style={{ minHeight: 80 }} />
          </div>
          <div className="sfield">
            <label>Image badge — number</label>
            <input value={values.brand_badge_num} onChange={e => set('brand_badge_num', e.target.value)} placeholder={DEFAULTS.brand_badge_num} />
          </div>
          <div className="sfield">
            <label>Image badge — label (use \n for line break)</label>
            <input value={values.brand_badge_text} onChange={e => set('brand_badge_text', e.target.value)} placeholder={DEFAULTS.brand_badge_text} />
          </div>
        </div>
        {/* Stats row */}
        <div className="settings-grid" style={{ marginTop: 16 }}>
          {[1,2,3].map(n => (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="sfield">
                <label>Stat {n} — number</label>
                <input value={values[`brand_stat_${n}_num`]} onChange={e => set(`brand_stat_${n}_num`, e.target.value)} placeholder={DEFAULTS[`brand_stat_${n}_num`]} />
              </div>
              <div className="sfield">
                <label>Stat {n} — label</label>
                <input value={values[`brand_stat_${n}_label`]} onChange={e => set(`brand_stat_${n}_label`, e.target.value)} placeholder={DEFAULTS[`brand_stat_${n}_label`]} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Bar */}
      <div className="settings-section">
        <p className="settings-section-title">✦ Trust Bar</p>
        <div className="settings-grid">
          {[1,2,3,4].map(n => (
            <div key={n} className="sfield">
              <label>Badge {n}</label>
              <input value={values[`trust_${n}`]} onChange={e => set(`trust_${n}`, e.target.value)} placeholder={DEFAULTS[`trust_${n}`]} />
            </div>
          ))}
        </div>
      </div>

      {/* Delivery */}
      <div className="settings-section">
        <p className="settings-section-title">🚚 Delivery & Shipping</p>
        <p className="shint" style={{ marginBottom: 16 }}>Set your flat delivery fee and the minimum order amount for free delivery. These are shown live at checkout.</p>
        <div className="settings-grid">
          <div className="sfield">
            <label>Delivery fee (Rs)</label>
            <input
              type="number" min="0" step="1"
              value={values.delivery_charge}
              onChange={e => set('delivery_charge', e.target.value)}
              placeholder="200"
            />
            <p className="shint">Charged when the order is below the free delivery threshold.</p>
          </div>
          <div className="sfield">
            <label>Free delivery from (Rs)</label>
            <input
              type="number" min="0" step="1"
              value={values.free_delivery_min}
              onChange={e => set('free_delivery_min', e.target.value)}
              placeholder="3000"
            />
            <p className="shint">Orders at or above this amount get free delivery. Set to 0 to always charge.</p>
          </div>
          <div className="sfield settings-grid-full">
            <label>Delivery note <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional — shown at checkout)</span></label>
            <input
              value={values.delivery_note}
              onChange={e => set('delivery_note', e.target.value)}
              placeholder="e.g. Delivery within 3–5 business days"
            />
          </div>
          <div className="sfield settings-grid-full">
            <label>Announcement banner <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(shown in navbar)</span></label>
            <input
              value={values.announcement_banner}
              onChange={e => set('announcement_banner', e.target.value)}
              placeholder="e.g. Free delivery on orders over Rs 3,000 · Dermatologist-reviewed formulas"
            />
            <p className="shint">This text appears in the top navigation strip on all pages.</p>
          </div>
        </div>
      </div>

      {/* Favicon */}
      <div className="settings-section">
        <p className="settings-section-title">🌐 Website Icon (Favicon)</p>
        <p className="shint" style={{ marginBottom: 16 }}>The small icon shown in the browser tab. Use a square PNG or ICO, ideally 64×64 px or larger. Requires Cloudinary.</p>
        <div className="settings-grid">
          <div className="sfield">
            <ImageUploadField
              label="Favicon image"
              preview={previews.favicon_url}
              fileRef={refs.favicon_url}
              onChange={handleFileChange('favicon_url')}
              hint="Square PNG or ICO · 64×64 px or larger"
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="settings-section">
        <p className="settings-section-title">📞 Contact & Enquiries</p>
        <div className="settings-grid">
          <div className="sfield">
            <label>WhatsApp number</label>
            <input value={values.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} placeholder="923001234567" />
            <p className="shint">Country code + number, no + sign (e.g. 923001234567)</p>
          </div>
          <div className="sfield">
            <label>Contact email</label>
            <input type="email" value={values.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="hello@dreamproducts.com" />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="settings-section">
        <p className="settings-section-title">📱 Social Media</p>
        <p className="shint" style={{ marginBottom: 16 }}>Links appear in the footer on your storefront. Leave blank to hide.</p>
        <div className="settings-grid">
          <div className="sfield">
            <label>Instagram URL</label>
            <input
              type="url"
              value={values.instagram_url}
              onChange={e => set('instagram_url', e.target.value)}
              placeholder="https://instagram.com/yourhandle"
            />
          </div>
          <div className="sfield">
            <label>TikTok URL</label>
            <input
              type="url"
              value={values.tiktok_url}
              onChange={e => set('tiktok_url', e.target.value)}
              placeholder="https://tiktok.com/@yourhandle"
            />
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="settings-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <p className="settings-section-title" style={{ margin: 0 }}>🎨 Theme — Colours, Fonts & Motion</p>
          <button type="button" onClick={resetTheme}
            style={{ fontSize: 12, fontWeight: 600, color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '5px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>
            ↺ Reset to Default
          </button>
        </div>

        {/* Colours */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '.06em', textTransform: 'uppercase', margin: '0 0 12px' }}>Colours</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { key: 'theme_bg',          label: 'Background' },
            { key: 'theme_card',        label: 'Card' },
            { key: 'theme_primary',     label: 'Primary text' },
            { key: 'theme_secondary',   label: 'Secondary text' },
            { key: 'theme_accent',      label: 'Accent' },
            { key: 'theme_accent_dark', label: 'Accent dark' },
            { key: 'theme_border',      label: 'Border' },
          ].map(({ key, label }) => (
            <div key={key} className="sfield" style={{ gap: 8 }}>
              <label style={{ marginBottom: 4 }}>{label}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={values[key] || '#000000'}
                  onChange={e => set(key, e.target.value)}
                  style={{ width: 36, height: 36, border: '1.5px solid var(--border)', borderRadius: 8, padding: 2, cursor: 'pointer', background: 'none' }}
                />
                <input
                  type="text"
                  value={values[key] || ''}
                  onChange={e => set(key, e.target.value)}
                  placeholder="#FAF8F5"
                  style={{ fontSize: 12, padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', width: 90, outline: 'none' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Live colour preview */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '.06em', textTransform: 'uppercase', margin: '0 0 10px' }}>Live Preview</p>
          <div style={{ background: values.theme_bg || '#FAF8F5', border: `1px solid ${values.theme_border || '#ECECEC'}`, borderRadius: 12, padding: 20, maxWidth: 320 }}>
            <p style={{ fontFamily: `'${values.theme_heading_font || 'Playfair Display'}', serif`, fontSize: 18, fontWeight: 600, color: values.theme_primary || '#1C1C1C', margin: '0 0 4px' }}>
              Glow Serum
            </p>
            <p style={{ fontFamily: `'${values.theme_body_font || 'Inter'}', sans-serif`, fontSize: 12, color: values.theme_secondary || '#6B6B6B', margin: '0 0 12px' }}>
              Brightening formula for all skin types
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: `'${values.theme_heading_font || 'Playfair Display'}', serif`, fontSize: 16, fontWeight: 700, color: values.theme_primary || '#1C1C1C' }}>Rs 2,400</span>
              <button type="button" style={{ background: values.theme_primary || '#1C1C1C', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontSize: 11, fontWeight: 600, cursor: 'default', fontFamily: `'${values.theme_body_font || 'Inter'}', sans-serif` }}>
                Add to Cart
              </button>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${values.theme_border || '#ECECEC'}`, display: 'flex', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: values.theme_accent || '#D9B99B', marginTop: 2 }} />
              <span style={{ fontSize: 11, color: values.theme_secondary || '#6B6B6B', fontFamily: `'${values.theme_body_font || 'Inter'}', sans-serif` }}>Accent colour sample</span>
            </div>
          </div>
        </div>

        {/* Fonts */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '.06em', textTransform: 'uppercase', margin: '0 0 12px' }}>Fonts</p>
        <div className="settings-grid" style={{ marginBottom: 24 }}>
          <div className="sfield">
            <label>Heading font</label>
            <select value={values.theme_heading_font} onChange={e => set('theme_heading_font', e.target.value)}
              style={{ fontSize: 14, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: `'${values.theme_heading_font}', serif`, background: '#fff', cursor: 'pointer', outline: 'none' }}>
              {FONT_OPTIONS.map(f => <option key={f} value={f} style={{ fontFamily: `'${f}', serif` }}>{f}</option>)}
            </select>
            <p className="shint" style={{ fontFamily: `'${values.theme_heading_font}', serif`, fontSize: 15, color: 'var(--ink)', margin: '6px 0 0' }}>
              The quick brown fox — {values.theme_heading_font}
            </p>
          </div>
          <div className="sfield">
            <label>Body font</label>
            <select value={values.theme_body_font} onChange={e => set('theme_body_font', e.target.value)}
              style={{ fontSize: 14, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: `'${values.theme_body_font}', sans-serif`, background: '#fff', cursor: 'pointer', outline: 'none' }}>
              {FONT_OPTIONS.map(f => <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>)}
            </select>
            <p className="shint" style={{ fontFamily: `'${values.theme_body_font}', sans-serif`, fontSize: 14, color: 'var(--ink-soft)', margin: '6px 0 0' }}>
              Body text sample — {values.theme_body_font}
            </p>
          </div>
        </div>

        {/* Motion */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '.06em', textTransform: 'uppercase', margin: '0 0 12px' }}>Animation & Motion</p>
        <div className="settings-grid" style={{ marginBottom: 16 }}>
          <div className="sfield">
            <label>Animation style</label>
            <select value={values.theme_motion_style} onChange={e => set('theme_motion_style', e.target.value)}
              style={{ fontSize: 14, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'inherit', background: '#fff', cursor: 'pointer', outline: 'none' }}>
              <option value="subtle">Subtle — quick and minimal</option>
              <option value="normal">Normal — balanced (default)</option>
              <option value="playful">Playful — slow and expressive</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {[
            { key: 'theme_page_transitions', label: 'Page transition animation', hint: 'Fade-up effect when navigating between pages' },
            { key: 'theme_hover_cards',      label: 'Product card hover lift', hint: 'Cards lift and show overlay on mouse hover' },
            { key: 'theme_reduced_motion',   label: 'Reduced motion mode (overrides all above)', hint: "Disables all non-essential animations \u2014 also respects the visitor\u2019s OS accessibility setting" },
          ].map(({ key, label, hint }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={key === 'theme_reduced_motion' ? values[key] === 'true' : values[key] !== 'false'}
                onChange={e => set(key, e.target.checked ? (key === 'theme_reduced_motion' ? 'true' : 'true') : (key === 'theme_reduced_motion' ? 'false' : 'false'))}
                style={{ width: 16, height: 16, cursor: 'pointer', marginTop: 2, accentColor: 'var(--forest)', flexShrink: 0 }}
              />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ink-soft)' }}>{hint}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Radius & Shadow */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: '.06em', textTransform: 'uppercase', margin: '0 0 12px' }}>Shape & Depth</p>
        <div className="settings-grid">
          <div className="sfield">
            <label>Corner roundness</label>
            <select value={values.theme_radius} onChange={e => set('theme_radius', e.target.value)}
              style={{ fontSize: 14, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'inherit', background: '#fff', cursor: 'pointer', outline: 'none' }}>
              <option value="sharp">Sharp — 4 px corners</option>
              <option value="soft">Soft — 16 px corners (default)</option>
              <option value="rounded">Rounded — 24 px corners</option>
            </select>
          </div>
          <div className="sfield">
            <label>Shadow intensity</label>
            <select value={values.theme_shadow} onChange={e => set('theme_shadow', e.target.value)}
              style={{ fontSize: 14, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'inherit', background: '#fff', cursor: 'pointer', outline: 'none' }}>
              <option value="flat">Flat — minimal shadows</option>
              <option value="soft">Soft — gentle depth (default)</option>
              <option value="elevated">Elevated — prominent shadows</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="settings-save-row">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save all settings'}
        </button>
        {saved && <span className="settings-saved">✓ Saved successfully</span>}
        {error && <span className="settings-error">Error: {error}</span>}
      </div>
    </form>
  );
}
