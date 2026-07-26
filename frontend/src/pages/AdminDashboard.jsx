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
    { id: 'products', label: '📦 Products' },
    { id: 'orders',   label: '🛍 Orders' },
    { id: 'reviews',  label: '💬 Reviews' },
    { id: 'users',    label: '👤 Users' },
    { id: 'settings', label: '⚙️ Settings' },
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
        {tab === 'products' && <ProductsTab navigate={navigate} />}
        {tab === 'orders'   && <OrdersTab />}
        {tab === 'reviews'  && <ReviewsTab />}
        {tab === 'users'    && <UsersTab />}
        {tab === 'settings' && <SettingsTab />}
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

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  function load() {
    setLoading(true);
    api.getAdminOrders().then(setOrders).catch(err => setError(err.message)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleStatus(id, status) {
    try {
      const updated = await api.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: updated.status } : o));
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
              <thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((o) => {
                  const items = Array.isArray(o.items) ? o.items : JSON.parse(o.items || '[]');
                  return (
                    <tr key={o.id}>
                      <td style={{ color: 'var(--ink-soft)', fontWeight: 700, fontSize: 13 }}>#{o.id}</td>
                      <td>
                        <p className="order-customer">{o.customer_name}</p>
                        <p className="order-meta">{o.email}</p>
                        <p className="order-meta">📞 {o.phone}</p>
                        <p className="order-meta">📍 {o.address}, {o.city}</p>
                        {o.notes && <p className="order-meta" style={{ fontStyle: 'italic' }}>"{o.notes}"</p>}
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
                        <select className={`status-select status-${o.status}`} value={o.status} onChange={e => handleStatus(o.id, e.target.value)}>
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
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
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ fontSize: 13, padding: '7px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'inherit', background: '#fff', cursor: 'pointer' }}>
            <option value="all">All reviews</option>
            <option value="pending">Pending approval</option>
            <option value="approved">Approved</option>
          </select>
          <button className="btn-ghost" onClick={load} style={{ fontSize: 13 }}>↻ Refresh</button>
        </div>
      </div>
      {loading && <p className="state-msg">Loading…</p>}
      {error && <p className="state-msg" style={{ color: '#b91c1c' }}>{error}</p>}
      {!loading && !error && (
        filtered.length === 0 ? (
          <div className="dash-empty"><p className="dash-empty-icon">💬</p><p>No reviews {filter !== 'all' ? 'in this category' : 'yet'}.</p></div>
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
    </>
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
    whatsapp_number: '',
    contact_email: '',
  };

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
