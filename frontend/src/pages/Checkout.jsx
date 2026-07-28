import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Checkout() {
  const { items, total: subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({});
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    area: '',
    city: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount }

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  // ── Delivery calculation ──────────────────────────────────────
  const deliveryCharge = Number(settings.delivery_charge ?? 200);
  const freeDeliveryMin = Number(settings.free_delivery_min ?? 3000);
  const deliveryNote = settings.delivery_note || '';
  const isFreeDelivery = freeDeliveryMin > 0 && subtotal >= freeDeliveryMin;
  const deliveryFee = isFreeDelivery ? 0 : deliveryCharge;
  const discount = appliedCoupon?.discount || 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discount);

  const wa = settings.whatsapp_number || '923001234567';
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // ── Coupon ────────────────────────────────────────────────────
  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true); setCouponError(''); setAppliedCoupon(null);
    try {
      const res = await api.validateCoupon(couponInput.trim(), subtotal + deliveryFee);
      setAppliedCoupon({ code: res.coupon.code, discount: res.discount });
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() { setAppliedCoupon(null); setCouponInput(''); setCouponError(''); }

  // ── Empty cart ────────────────────────────────────────────────
  if (items.length === 0 && !success) {
    return (
      <div className="co-empty-page">
        <p className="co-empty-icon">🛍</p>
        <h2 className="display">Your cart is empty</h2>
        <p>Add some products before checking out.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Products</Link>
        <style>{`.co-empty-page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:40px;background:var(--cream);}.co-empty-icon{font-size:56px;}`}</style>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────
  if (success) {
    const fullAddress = [form.address, form.area, form.city].filter(Boolean).join(', ');
    const itemsText = success.items
      .map(i => `• ${i.name} × ${i.quantity} — Rs ${Number(i.price * i.quantity).toLocaleString()}`)
      .join('\n');
    const waMsg = encodeURIComponent(
      `Hi Dreamer Products! I just placed Order #${success.id}.\n\nCustomer: ${form.name}\nPhone: ${form.phone}\nAddress: ${fullAddress}\n\nItems:\n${itemsText}\n\nSubtotal: Rs ${Number(subtotal).toLocaleString()}\nDelivery: Rs ${Number(deliveryFee).toLocaleString()}${discount > 0 ? `\nDiscount: −Rs ${Number(discount).toLocaleString()}` : ''}\nTotal: Rs ${Number(grandTotal).toLocaleString()}${form.notes ? `\n\nNotes: ${form.notes}` : ''}`
    );
    return (
      <div className="co-success-page">
        <div className="co-success-card">
          <div className="co-success-icon">✓</div>
          <h2 className="display">Order placed!</h2>
          <p className="co-success-sub">Thank you, {form.name}! We've received your order and will confirm it shortly.</p>
          <p className="co-order-num">Order #{success.id}</p>

          <div className="co-success-bill">
            {success.items.map((i, idx) => (
              <div key={idx} className="co-sb-row">
                <span>{i.name} × {i.quantity}</span>
                <span>Rs {Number(i.price * i.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="co-sb-divider" />
            <div className="co-sb-row co-sb-sub"><span>Subtotal</span><span>Rs {Number(subtotal).toLocaleString()}</span></div>
            {discount > 0 && (
              <div className="co-sb-row co-sb-sub" style={{ color: '#16a34a' }}>
                <span>Discount ({appliedCoupon?.code})</span>
                <span>−Rs {Number(discount).toLocaleString()}</span>
              </div>
            )}
            <div className="co-sb-row co-sb-sub">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? <span className="co-free-tag">FREE</span> : `Rs ${Number(deliveryFee).toLocaleString()}`}</span>
            </div>
            <div className="co-sb-divider" />
            <div className="co-sb-row co-sb-total"><span>Total</span><span>Rs {Number(grandTotal).toLocaleString()}</span></div>
          </div>

          <a className="btn btn-primary co-wa-btn"
            href={`https://wa.me/${wa}?text=${waMsg}`}
            target="_blank" rel="noopener noreferrer">
            Confirm on WhatsApp
          </a>
          <Link to="/" className="co-home-link">← Continue shopping</Link>
        </div>

        <style>{`
          .co-success-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--twilight);padding:24px;}
          .co-success-card{background:var(--card);border-radius:24px;padding:44px 40px;max-width:480px;width:100%;text-align:center;box-shadow:0 28px 80px rgba(0,0,0,.35);}
          .co-success-icon{width:64px;height:64px;border-radius:50%;background:#e6f4ea;color:#2d7a3a;font-size:28px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;}
          .co-success-card h2{font-size:28px;margin-bottom:10px;}
          .co-success-sub{font-size:15px;color:var(--ink-soft);line-height:1.6;margin:0 0 12px;}
          .co-order-num{font-size:13px;font-weight:700;color:var(--ink-soft);background:var(--cream);padding:6px 16px;border-radius:999px;display:inline-block;margin-bottom:20px;}
          .co-success-bill{background:var(--cream);border-radius:14px;padding:16px 18px;text-align:left;margin-bottom:24px;display:flex;flex-direction:column;gap:8px;}
          .co-sb-row{display:flex;justify-content:space-between;font-size:13px;color:var(--ink-soft);}
          .co-sb-sub{font-size:13.5px;}
          .co-sb-total{font-size:15px;font-weight:700;color:var(--ink);}
          .co-sb-divider{border:none;border-top:1px solid var(--border);margin:2px 0;}
          .co-free-tag{color:#16a34a;font-weight:700;}
          .co-wa-btn{width:100%;justify-content:center;margin-bottom:12px;display:flex;}
          .co-home-link{font-size:13.5px;color:var(--ink-soft);display:block;}
          .co-home-link:hover{color:var(--ink);}
        `}</style>
      </div>
    );
  }

  // ── Submit ────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const fullAddress = [form.address, form.area].filter(Boolean).join(', ');

    try {
      // Send only IDs + quantities — server loads prices authoritatively
      const orderPayload = {
        customer_name: form.name,
        email: form.email,
        phone: form.phone,
        address: fullAddress,
        city: form.city,
        notes: form.notes,
        items: items.map(i => ({ id: i.product.id, quantity: i.quantity })),
        payment_method: 'cod',
        coupon_code: appliedCoupon?.code || null,
      };

      const res = await api.createOrder(orderPayload);
      const order = res.order || res;

      clearCart();
      setSuccess(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Main checkout ─────────────────────────────────────────────
  return (
    <div className="co-page">
      <div className="co-container">

        {/* ── LEFT: Order summary ── */}
        <div className="co-summary">
          <Link to="/" className="co-back">← Back to store</Link>
          <div className="co-summary-brand">
            <span className="co-brand-dr">Dr.</span>
            <span className="display co-brand-name">Dreamer</span>
          </div>
          <h2 className="display co-summary-title">Order Summary</h2>

          <div className="co-items">
            {items.map(({ product, quantity }) => {
              const img = product.image_url
                ? (product.image_url.startsWith('http') ? product.image_url : `${api.base}${product.image_url}`)
                : null;
              return (
                <div key={product.id} className="co-item">
                  <div className="co-item-img">
                    {img ? <img src={img} alt={product.name} /> : <div className="co-item-ph" />}
                    <span className="co-item-qty">{quantity}</span>
                  </div>
                  <div className="co-item-info">
                    <p className="co-item-name">{product.name}</p>
                    <p className="co-item-cat">{product.category}</p>
                  </div>
                  <p className="co-item-price">Rs {Number(product.price * quantity).toLocaleString()}</p>
                </div>
              );
            })}
          </div>

          {/* Coupon */}
          <div className="co-coupon-section">
            {appliedCoupon ? (
              <div className="co-coupon-applied">
                <span className="co-coupon-check">✓</span>
                <div>
                  <p className="co-coupon-code">{appliedCoupon.code}</p>
                  <p className="co-coupon-save">Saves Rs {Number(appliedCoupon.discount).toLocaleString()}</p>
                </div>
                <button className="co-coupon-remove" onClick={removeCoupon}>×</button>
              </div>
            ) : (
              <div className="co-coupon-row">
                <input
                  className="co-coupon-input"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                />
                <button className="co-coupon-btn" onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()}>
                  {couponLoading ? '…' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <p className="co-coupon-err">{couponError}</p>}
          </div>

          {/* Bill breakdown */}
          <div className="co-bill">
            <div className="co-bill-row">
              <span>Subtotal</span>
              <span>Rs {Number(subtotal).toLocaleString()}</span>
            </div>
            <div className="co-bill-row">
              <span>Delivery</span>
              {isFreeDelivery
                ? <span className="co-free-badge">FREE 🎉</span>
                : <span>Rs {Number(deliveryFee).toLocaleString()}</span>
              }
            </div>
            {!isFreeDelivery && freeDeliveryMin > 0 && (
              <p className="co-free-hint">
                Add Rs {Number(freeDeliveryMin - subtotal).toLocaleString()} more for free delivery
              </p>
            )}
            {deliveryNote ? <p className="co-delivery-note">{deliveryNote}</p> : null}
            {discount > 0 && (
              <div className="co-bill-row" style={{ color: '#a8e6b0' }}>
                <span>Discount ({appliedCoupon?.code})</span>
                <span>−Rs {Number(discount).toLocaleString()}</span>
              </div>
            )}
            <div className="co-bill-divider" />
            <div className="co-bill-row co-bill-total">
              <span>Total</span>
              <span className="display">Rs {Number(grandTotal).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Delivery form ── */}
        <form className="co-form" onSubmit={handleSubmit}>
          <h2 className="display co-form-title">Delivery Details</h2>

          {error && <div className="co-error">{error}</div>}

          {!user && (
            <div className="co-auth-hint">
              <Link to="/login" className="co-auth-link">Sign in</Link> to auto-fill your details
            </div>
          )}

          {/* Contact */}
          <p className="co-section-label">Contact information</p>
          <div className="co-row">
            <div className="field">
              <label>Full name *</label>
              <input value={form.name} onChange={set('name')} required placeholder="e.g. Sara Ahmed" />
            </div>
            <div className="field">
              <label>Phone / WhatsApp *</label>
              <input type="tel" value={form.phone} onChange={set('phone')} required placeholder="+92 300 0000000" />
            </div>
          </div>
          <div className="field">
            <label>Email address *</label>
            <input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" />
          </div>

          {/* Address */}
          <p className="co-section-label" style={{ marginTop: 24 }}>Delivery address</p>
          <div className="field">
            <label>House / Flat no. &amp; Street *</label>
            <input value={form.address} onChange={set('address')} required placeholder="e.g. House 5, Block B, Main Boulevard" />
          </div>
          <div className="co-row">
            <div className="field">
              <label>Area / Neighbourhood</label>
              <input value={form.area} onChange={set('area')} placeholder="e.g. Gulshan-e-Iqbal" />
            </div>
            <div className="field">
              <label>City *</label>
              <input value={form.city} onChange={set('city')} required placeholder="e.g. Karachi" />
            </div>
          </div>
          <div className="field">
            <label>Order notes <span className="co-opt">(optional)</span></label>
            <textarea value={form.notes} onChange={set('notes')} placeholder="Preferred delivery time, landmark, etc." rows={3} />
          </div>

          {/* Payment method */}
          <p className="co-section-label" style={{ marginTop: 24 }}>Payment method</p>
          <div className="co-pay-methods">
            <div className="co-pay-option selected">
              <div className="co-pay-icon">💵</div>
              <div>
                <p className="co-pay-title">Cash on Delivery</p>
                <p className="co-pay-sub">Pay when your order arrives</p>
              </div>
            </div>
          </div>

          {/* Mobile bill */}
          <div className="co-mobile-bill">
            <div className="co-mb-row"><span>Subtotal</span><span>Rs {Number(subtotal).toLocaleString()}</span></div>
            <div className="co-mb-row">
              <span>Delivery</span>
              {isFreeDelivery
                ? <span className="co-free-badge-sm">FREE</span>
                : <span>Rs {Number(deliveryFee).toLocaleString()}</span>
              }
            </div>
            {discount > 0 && (
              <div className="co-mb-row" style={{ color: '#16a34a' }}>
                <span>Discount</span><span>−Rs {Number(discount).toLocaleString()}</span>
              </div>
            )}
            <div className="co-mb-divider" />
            <div className="co-mb-row co-mb-total"><span>Total</span><span>Rs {Number(grandTotal).toLocaleString()}</span></div>
          </div>

          <button className="btn btn-primary co-submit" disabled={loading}>
            {loading ? 'Processing…' : `Place Order · Rs ${Number(grandTotal).toLocaleString()}`}
          </button>
          <p className="co-note">We'll confirm your order via WhatsApp or email within a few hours</p>
        </form>
      </div>

      <style>{`
        .co-page { min-height:100vh;background:var(--cream);display:flex;align-items:stretch;justify-content:center; }
        .co-container { display:grid;grid-template-columns:1fr 1fr;max-width:1100px;width:100%;margin:0 auto; }

        .co-summary { background:var(--twilight);padding:52px 44px;color:rgba(250,243,236,0.8);display:flex;flex-direction:column; }
        .co-back { display:inline-block;font-size:12.5px;color:rgba(250,243,236,0.45);margin-bottom:36px;transition:color .18s;text-decoration:none; }
        .co-back:hover { color:var(--cream); }
        .co-summary-brand { display:flex;align-items:baseline;gap:4px;margin-bottom:28px; }
        .co-brand-dr { font-size:12px;font-weight:600;color:var(--sage-light);letter-spacing:.07em;font-family:'DM Sans',sans-serif; }
        .co-brand-name { font-size:20px;color:#fff; }
        .co-summary-title { font-size:22px;color:var(--cream);margin-bottom:24px; }

        .co-items { display:flex;flex-direction:column;gap:14px;margin-bottom:20px; }
        .co-item { display:flex;align-items:center;gap:14px; }
        .co-item-img { position:relative;width:58px;height:58px;flex-shrink:0;border-radius:10px;overflow:hidden;background:rgba(250,243,236,.1); }
        .co-item-img img { width:100%;height:100%;object-fit:cover; }
        .co-item-ph { width:100%;height:100%; }
        .co-item-qty { position:absolute;top:-6px;right:-6px;background:var(--dusty-rose);color:#fff;font-size:10px;font-weight:700;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center; }
        .co-item-info { flex:1; }
        .co-item-name { font-size:13.5px;font-weight:600;color:var(--cream);margin:0 0 3px; }
        .co-item-cat { font-size:11px;opacity:.45;margin:0;text-transform:capitalize; }
        .co-item-price { font-size:13.5px;font-weight:700;color:var(--cream);white-space:nowrap; }

        /* Coupon */
        .co-coupon-section { margin-bottom:14px; }
        .co-coupon-row { display:flex;gap:8px; }
        .co-coupon-input { flex:1;background:rgba(255,255,255,.1);border:1.5px solid rgba(250,243,236,.2);color:var(--cream);border-radius:8px;padding:9px 12px;font-size:13px;font-family:inherit;outline:none;letter-spacing:.05em; }
        .co-coupon-input::placeholder { color:rgba(250,243,236,.35); }
        .co-coupon-input:focus { border-color:rgba(250,243,236,.5); }
        .co-coupon-btn { background:rgba(255,255,255,.15);color:var(--cream);border:1.5px solid rgba(250,243,236,.25);border-radius:8px;padding:9px 16px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .18s;white-space:nowrap; }
        .co-coupon-btn:hover:not(:disabled) { background:rgba(255,255,255,.25); }
        .co-coupon-btn:disabled { opacity:.5;cursor:not-allowed; }
        .co-coupon-applied { display:flex;align-items:center;gap:10px;background:rgba(134,190,140,.15);border:1.5px solid rgba(134,190,140,.35);border-radius:8px;padding:10px 14px; }
        .co-coupon-check { width:20px;height:20px;border-radius:50%;background:#a8e6b0;color:#14532d;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .co-coupon-code { font-size:13px;font-weight:700;color:#a8e6b0;margin:0; }
        .co-coupon-save { font-size:11px;color:rgba(250,243,236,.6);margin:2px 0 0; }
        .co-coupon-remove { margin-left:auto;background:none;border:none;color:rgba(250,243,236,.5);font-size:18px;cursor:pointer;line-height:1;padding:0 4px; }
        .co-coupon-remove:hover { color:var(--cream); }
        .co-coupon-err { font-size:12px;color:#fca5a5;margin:6px 0 0; }

        /* Bill */
        .co-bill { border-top:1px solid rgba(250,243,236,.12);padding-top:20px;display:flex;flex-direction:column;gap:10px;margin-top:auto; }
        .co-bill-row { display:flex;justify-content:space-between;align-items:center;font-size:13.5px;color:rgba(250,243,236,.65); }
        .co-free-badge { background:rgba(134,190,140,.22);color:#a8e6b0;font-size:11px;font-weight:700;letter-spacing:.06em;padding:3px 10px;border-radius:999px; }
        .co-free-hint { font-size:11.5px;color:rgba(250,243,236,.4);margin:0;line-height:1.5; }
        .co-delivery-note { font-size:11.5px;color:rgba(250,243,236,.4);margin:0;font-style:italic; }
        .co-bill-divider { border:none;border-top:1px solid rgba(250,243,236,.12);margin:2px 0; }
        .co-bill-total { color:var(--cream) !important; }
        .co-bill-total .display { font-size:22px;color:var(--cream); }

        /* Form */
        .co-form { padding:52px 44px;background:var(--card);display:flex;flex-direction:column;gap:0;overflow-y:auto; }
        .co-form-title { font-size:24px;margin-bottom:22px; }
        .co-section-label { font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft);margin:0 0 14px; }
        .co-auth-hint { background:#f0f4ff;border-radius:10px;padding:10px 14px;font-size:13.5px;color:var(--ink-soft);margin-bottom:20px; }
        .co-auth-link { color:var(--dusty-rose);font-weight:600; }
        .co-error { background:#fbe7e9;color:#93303f;font-size:13.5px;padding:11px 14px;border-radius:10px;margin-bottom:18px; }
        .co-row { display:grid;grid-template-columns:1fr 1fr;gap:14px; }
        .field { display:flex;flex-direction:column;gap:6px;margin-bottom:14px; }
        .field label { font-size:12.5px;font-weight:700;color:var(--ink);letter-spacing:.02em; }
        .field input,.field textarea { font-size:14px;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-family:inherit;outline:none;background:var(--cream);transition:border-color .15s,box-shadow .15s;resize:none;color:var(--ink); }
        .field input:focus,.field textarea:focus { border-color:var(--forest);background:var(--card);box-shadow:0 0 0 3px rgba(27,58,45,.08); }
        .co-opt { font-weight:400;color:var(--ink-soft);font-size:11px; }

        /* Payment method */
        .co-pay-methods { display:flex;flex-direction:column;gap:8px;margin-bottom:16px; }
        .co-pay-option { display:flex;align-items:center;gap:12px;border:1.5px solid var(--border);border-radius:12px;padding:12px 16px;transition:border-color .18s,background .18s; }
        .co-pay-option.selected { border-color:var(--forest);background:rgba(27,58,45,.04); }
        .co-pay-icon { font-size:22px;flex-shrink:0; }
        .co-pay-title { font-size:13.5px;font-weight:700;color:var(--ink);margin:0 0 2px; }
        .co-pay-sub { font-size:11.5px;color:var(--ink-soft);margin:0; }

        /* Mobile bill */
        .co-mobile-bill { display:none; }
        .co-submit { width:100%;margin-top:8px;font-size:15px;padding:14px; }
        .co-note { text-align:center;font-size:12px;color:var(--ink-soft);margin:10px 0 0;line-height:1.5; }

        @media (max-width:820px) {
          .co-container { grid-template-columns:1fr; }
          .co-summary { padding:36px 24px; }
          .co-bill { display:none; }
          .co-form { padding:32px 24px; }
          .co-row { grid-template-columns:1fr; }
          .co-mobile-bill { display:flex;flex-direction:column;gap:8px;background:var(--cream);border-radius:14px;padding:16px 18px;margin-bottom:20px; }
          .co-mb-row { display:flex;justify-content:space-between;font-size:13.5px;color:var(--ink-soft); }
          .co-mb-divider { border:none;border-top:1px solid var(--border); }
          .co-mb-total { font-size:15px;font-weight:700;color:var(--ink); }
          .co-free-badge-sm { color:#16a34a;font-weight:700;font-size:13px; }
        }
      `}</style>
    </div>
  );
}
