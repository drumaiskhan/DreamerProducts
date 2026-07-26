import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function CartDrawer({ open, onClose }) {
  const { items, removeFromCart, setQty, total, count } = useCart();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  const deliveryCharge = Number(settings.delivery_charge ?? 200);
  const freeDeliveryMin = Number(settings.free_delivery_min ?? 3000);
  const isFreeDelivery = freeDeliveryMin > 0 && total >= freeDeliveryMin;
  const deliveryFee = isFreeDelivery ? 0 : deliveryCharge;
  const grandTotal = total + deliveryFee;

  return (
    <>
      <div className={`cd-backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`cd-drawer ${open ? 'open' : ''}`} aria-label="Shopping cart">
        <div className="cd-header">
          <h2 className="display cd-title">
            Cart {count > 0 && <span className="cd-badge">{count}</span>}
          </h2>
          <button className="cd-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {items.length === 0 ? (
          <div className="cd-empty">
            <span className="cd-empty-icon">🛍</span>
            <p>Your cart is empty</p>
            <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={onClose}>
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="cd-list">
              {items.map(({ product, quantity }) => {
                const img = product.image_url
                  ? (product.image_url.startsWith('http') ? product.image_url : `${api.base}${product.image_url}`)
                  : null;
                return (
                  <div key={product.id} className="cd-item">
                    <div className="cd-thumb">
                      {img ? <img src={img} alt={product.name} /> : <div className="cd-thumb-ph" />}
                    </div>
                    <div className="cd-item-body">
                      <p className="cd-name">{product.name}</p>
                      <p className="cd-price">Rs {Number(product.price).toLocaleString()}</p>
                      <div className="cd-qty-row">
                        <button onClick={() => quantity === 1 ? removeFromCart(product.id) : setQty(product.id, quantity - 1)}>−</button>
                        <span>{quantity}</span>
                        <button onClick={() => setQty(product.id, quantity + 1)}>+</button>
                      </div>
                    </div>
                    <button className="cd-rm" onClick={() => removeFromCart(product.id)} aria-label="Remove">×</button>
                  </div>
                );
              })}
            </div>

            <div className="cd-footer">
              <div className="cd-bill">
                <div className="cd-bill-row">
                  <span>Subtotal</span>
                  <span>Rs {Number(total).toLocaleString()}</span>
                </div>
                <div className="cd-bill-row">
                  <span>Delivery</span>
                  {isFreeDelivery
                    ? <span className="cd-free">FREE</span>
                    : <span>Rs {Number(deliveryFee).toLocaleString()}</span>
                  }
                </div>
                {!isFreeDelivery && freeDeliveryMin > 0 && (
                  <p className="cd-free-hint">
                    Rs {Number(freeDeliveryMin - total).toLocaleString()} away from free delivery
                  </p>
                )}
                <div className="cd-bill-divider" />
                <div className="cd-bill-row cd-bill-total">
                  <span>Total</span>
                  <span className="display">Rs {Number(grandTotal).toLocaleString()}</span>
                </div>
              </div>
              <button className="btn btn-primary cd-cta" onClick={() => { onClose(); navigate('/checkout'); }}>
                Checkout · Rs {Number(grandTotal).toLocaleString()} →
              </button>
              <button className="cd-continue" onClick={onClose}>Continue Shopping</button>
            </div>
          </>
        )}
      </aside>

      <style>{`
        .cd-backdrop {
          position: fixed; inset: 0;
          background: rgba(30,23,48,0.45);
          z-index: 55;
          opacity: 0; pointer-events: none;
          transition: opacity 0.28s ease;
        }
        .cd-backdrop.open { opacity: 1; pointer-events: auto; }

        .cd-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(420px, 100vw);
          background: #fff;
          z-index: 60;
          display: flex; flex-direction: column;
          box-shadow: -8px 0 48px rgba(30,23,48,0.14);
          transform: translateX(100%);
          transition: transform 0.32s cubic-bezier(0.22,1,0.36,1);
        }
        .cd-drawer.open { transform: translateX(0); }

        .cd-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 24px 20px;
          border-bottom: 1px solid var(--border);
        }
        .cd-title { font-size: 22px; display: flex; align-items: center; gap: 10px; }
        .cd-badge {
          background: var(--dusty-rose); color: #fff;
          font-size: 12px; font-weight: 700;
          padding: 2px 8px; border-radius: 999px;
          font-family: 'Inter', sans-serif;
        }
        .cd-close {
          background: none; border: none; font-size: 28px;
          color: var(--ink-soft); line-height: 1; cursor: pointer;
          padding: 4px 8px; border-radius: 8px;
          transition: background 0.15s ease;
        }
        .cd-close:hover { background: var(--border); }

        .cd-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px; text-align: center; color: var(--ink-soft);
        }
        .cd-empty-icon { font-size: 48px; margin-bottom: 12px; display: block; }

        .cd-list {
          flex: 1; overflow-y: auto; padding: 16px 24px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .cd-item {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 14px; border-radius: 14px;
          background: var(--cream); border: 1px solid var(--border);
          position: relative;
        }
        .cd-thumb {
          width: 64px; height: 64px; border-radius: 10px; overflow: hidden;
          background: linear-gradient(135deg, #f0e8e0, #ead9de); flex-shrink: 0;
        }
        .cd-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .cd-thumb-ph { width: 100%; height: 100%; }
        .cd-item-body { flex: 1; min-width: 0; }
        .cd-name { font-size: 14px; font-weight: 600; margin: 0 0 4px; line-height: 1.3; }
        .cd-price { font-size: 14px; font-weight: 700; color: var(--ink); margin: 0 0 10px; }
        .cd-qty-row {
          display: flex; align-items: center; gap: 0;
          background: #fff; border: 1.5px solid var(--border);
          border-radius: 10px; overflow: hidden; width: fit-content;
        }
        .cd-qty-row button {
          background: none; border: none; padding: 6px 12px;
          font-size: 16px; cursor: pointer; color: var(--ink);
          transition: background 0.15s ease;
        }
        .cd-qty-row button:hover { background: var(--border); }
        .cd-qty-row span { font-size: 14px; font-weight: 600; padding: 0 10px; }
        .cd-rm {
          position: absolute; top: 10px; right: 10px;
          background: none; border: none; font-size: 18px;
          color: var(--ink-soft); cursor: pointer; line-height: 1; padding: 2px 6px;
          border-radius: 6px; transition: background 0.15s ease, color 0.15s ease;
        }
        .cd-rm:hover { background: #fbe7e9; color: #b5495a; }

        .cd-footer {
          padding: 20px 24px 28px;
          border-top: 1px solid var(--border);
        }
        .cd-bill {
          display: flex; flex-direction: column; gap: 8px;
          margin-bottom: 16px;
        }
        .cd-bill-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 13.5px; color: var(--ink-soft);
        }
        .cd-bill-total { color: var(--ink); }
        .cd-bill-total .display { font-size: 20px; color: var(--ink); }
        .cd-bill-divider { border: none; border-top: 1px solid var(--border); margin: 2px 0; }
        .cd-free { color: #16a34a; font-weight: 700; font-size: 13px; }
        .cd-free-hint {
          font-size: 11.5px; color: var(--ink-soft); margin: 0;
          background: var(--sage-pale); padding: 6px 10px; border-radius: 8px;
          line-height: 1.4;
        }
        .cd-cta { width: 100%; justify-content: center; margin-bottom: 10px; font-size: 13.5px; }
        .cd-continue {
          width: 100%; background: none; border: none;
          font-size: 13.5px; color: var(--ink-soft);
          cursor: pointer; padding: 8px;
          transition: color 0.18s ease; font-family: inherit;
        }
        .cd-continue:hover { color: var(--ink); }
      `}</style>
    </>
  );
}
