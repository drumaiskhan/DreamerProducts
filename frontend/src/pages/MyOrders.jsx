import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';

const STATUS_COLORS = {
  Pending:   { bg: '#fef3c7', color: '#92400e' },
  Confirmed: { bg: '#dbeafe', color: '#1e40af' },
  Shipped:   { bg: '#ede9fe', color: '#5b21b6' },
  Completed: { bg: '#dcfce7', color: '#14532d' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b' },
};
const PAY_COLORS = {
  pending:  { bg: '#fef3c7', color: '#92400e' },
  paid:     { bg: '#dcfce7', color: '#14532d' },
  failed:   { bg: '#fee2e2', color: '#991b1b' },
  refunded: { bg: '#e0e7ff', color: '#3730a3' },
};

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.getMyOrders()
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  function toggle(id) { setExpanded(e => e === id ? null : id); }

  return (
    <div className="mo-page">
      <Navbar />
      <div className="container mo-container">
        <div className="mo-header">
          <Link to="/" className="mo-back">← Back to store</Link>
          <h1 className="display mo-title">My Orders</h1>
          <p className="mo-sub">Track your order history and status.</p>
        </div>

        {loading && (
          <div className="mo-loading">
            {[1,2,3].map(i => <div key={i} className="mo-skel" />)}
          </div>
        )}
        {error && <p className="mo-error">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <div className="mo-empty">
            <p className="mo-empty-icon">🛍</p>
            <h2 className="display">No orders yet</h2>
            <p>When you place an order, it will appear here.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Products</Link>
          </div>
        )}

        <div className="mo-list">
          {orders.map(order => {
            const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
            const isOpen = expanded === order.id;
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
            const pc = PAY_COLORS[order.payment_status] || PAY_COLORS.pending;
            return (
              <div key={order.id} className={`mo-card ${isOpen ? 'open' : ''}`}>
                {/* Header row */}
                <button className="mo-card-head" onClick={() => toggle(order.id)}>
                  <div className="mo-card-left">
                    <span className="mo-order-num">Order #{order.id}</span>
                    <span className="mo-date">
                      {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="mo-card-right">
                    <span className="mo-status-pill" style={{ background: sc.bg, color: sc.color }}>{order.status}</span>
                    <span className="mo-pay-pill" style={{ background: pc.bg, color: pc.color }}>
                      {order.payment_method === 'cod' ? 'COD' : 'Card'} · {order.payment_status}
                    </span>
                    <span className="mo-total">Rs {Number(order.total).toLocaleString()}</span>
                    <span className="mo-chevron">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Items preview (always visible) */}
                <div className="mo-items-preview">
                  {items.slice(0, 3).map((item, i) => (
                    <span key={i} className="mo-item-chip">{item.name} × {item.quantity}</span>
                  ))}
                  {items.length > 3 && <span className="mo-item-chip mo-item-more">+{items.length - 3} more</span>}
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="mo-detail">
                    <div className="mo-detail-cols">
                      {/* Items */}
                      <div>
                        <p className="mo-detail-label">Items</p>
                        <div className="mo-detail-items">
                          {items.map((item, i) => (
                            <div key={i} className="mo-detail-item">
                              <span>{item.name}</span>
                              <span className="mo-detail-item-right">
                                × {item.quantity} &nbsp;
                                <strong>Rs {Number(item.price * item.quantity).toLocaleString()}</strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Delivery */}
                      <div>
                        <p className="mo-detail-label">Delivery address</p>
                        <p className="mo-detail-addr">{order.address}, {order.city}</p>
                        <p className="mo-detail-label" style={{ marginTop: 16 }}>Contact</p>
                        <p className="mo-detail-addr">{order.phone}</p>
                        {order.notes && (
                          <>
                            <p className="mo-detail-label" style={{ marginTop: 16 }}>Notes</p>
                            <p className="mo-detail-addr">{order.notes}</p>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Bill */}
                    <div className="mo-bill">
                      <div className="mo-bill-row">
                        <span>Subtotal</span>
                        <span>Rs {Number(Number(order.total) + Number(order.discount_amount || 0) - Number(order.delivery_charge || 0)).toLocaleString()}</span>
                      </div>
                      {Number(order.discount_amount) > 0 && (
                        <div className="mo-bill-row mo-bill-discount">
                          <span>Discount {order.coupon_code && <span className="mo-coupon-tag">{order.coupon_code}</span>}</span>
                          <span>−Rs {Number(order.discount_amount).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="mo-bill-row">
                        <span>Delivery</span>
                        <span>{Number(order.delivery_charge) === 0 ? <span style={{ color: '#16a34a', fontWeight: 700 }}>FREE</span> : `Rs ${Number(order.delivery_charge).toLocaleString()}`}</span>
                      </div>
                      <div className="mo-bill-divider" />
                      <div className="mo-bill-row mo-bill-total">
                        <span>Total</span>
                        <span>Rs {Number(order.total).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .mo-page { min-height: 100vh; background: var(--cream); padding-bottom: 80px; }
        .mo-container { max-width: 760px; padding-top: 48px; }
        .mo-back { font-size: 13px; color: var(--ink-soft); text-decoration: none; display: inline-block; margin-bottom: 20px; transition: color .18s; }
        .mo-back:hover { color: var(--ink); }
        .mo-header { margin-bottom: 36px; }
        .mo-title { font-size: 34px; margin-bottom: 8px; }
        .mo-sub { font-size: 14px; color: var(--ink-soft); margin: 0; }
        .mo-loading { display: flex; flex-direction: column; gap: 12px; }
        .mo-skel { height: 84px; border-radius: 14px; background: linear-gradient(90deg, var(--border) 25%, #f0ede8 50%, var(--border) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        .mo-error { color: #b91c1c; font-size: 14px; }
        .mo-empty { text-align: center; padding: 80px 20px; color: var(--ink-soft); }
        .mo-empty-icon { font-size: 56px; margin-bottom: 12px; }
        .mo-list { display: flex; flex-direction: column; gap: 12px; }
        .mo-card { background: var(--card); border-radius: 14px; border: 1px solid var(--border); overflow: hidden; box-shadow: var(--shadow-sm); transition: box-shadow .18s; }
        .mo-card:hover { box-shadow: var(--shadow); }
        .mo-card-head { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: none; border: none; cursor: pointer; font-family: inherit; gap: 12px; flex-wrap: wrap; }
        .mo-card-left { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; }
        .mo-card-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .mo-order-num { font-size: 15px; font-weight: 700; color: var(--ink); }
        .mo-date { font-size: 12px; color: var(--ink-soft); }
        .mo-status-pill { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; white-space: nowrap; }
        .mo-pay-pill { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; white-space: nowrap; text-transform: capitalize; }
        .mo-total { font-size: 15px; font-weight: 700; color: var(--ink); white-space: nowrap; }
        .mo-chevron { font-size: 11px; color: var(--ink-soft); }
        .mo-items-preview { padding: 0 20px 14px; display: flex; gap: 6px; flex-wrap: wrap; }
        .mo-item-chip { font-size: 11.5px; background: var(--sage-pale); color: var(--forest); padding: 3px 10px; border-radius: 999px; font-weight: 500; }
        .mo-item-more { background: var(--cream); color: var(--ink-soft); border: 1px solid var(--border); }
        .mo-detail { padding: 16px 20px 20px; border-top: 1px solid var(--border); background: #fafaf9; }
        .mo-detail-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
        .mo-detail-label { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-soft); margin: 0 0 8px; }
        .mo-detail-items { display: flex; flex-direction: column; gap: 6px; }
        .mo-detail-item { display: flex; justify-content: space-between; font-size: 13px; color: var(--ink); }
        .mo-detail-item-right { color: var(--ink-soft); text-align: right; }
        .mo-detail-addr { font-size: 13px; color: var(--ink); margin: 0; line-height: 1.5; }
        .mo-bill { background: var(--cream); border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 7px; }
        .mo-bill-row { display: flex; justify-content: space-between; font-size: 13.5px; color: var(--ink-soft); }
        .mo-bill-discount { color: #16a34a; }
        .mo-coupon-tag { font-size: 10px; font-weight: 700; background: #dcfce7; color: #14532d; padding: 1px 8px; border-radius: 999px; margin-left: 6px; }
        .mo-bill-divider { border: none; border-top: 1px solid var(--border); }
        .mo-bill-total { font-size: 15px; font-weight: 700; color: var(--ink); }
        @media (max-width: 600px) {
          .mo-detail-cols { grid-template-columns: 1fr; }
          .mo-card-head { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
