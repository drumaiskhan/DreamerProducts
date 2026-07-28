import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';

export default function CartPopup() {
  const { items, removeFromCart, setQty, total, count } = useCart();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
    // Keep popup title in sync
    document.title = 'Your Cart — Dr. Dreamer';
  }, []);

  const deliveryCharge = Number(settings.delivery_charge ?? 200);
  const freeDeliveryMin = Number(settings.free_delivery_min ?? 3000);
  const isFreeDelivery = freeDeliveryMin > 0 && total >= freeDeliveryMin;
  const deliveryFee = isFreeDelivery ? 0 : deliveryCharge;
  const grandTotal = total + deliveryFee;

  return (
    <div className="cp-wrap">
      <div className="cp-header">
        <h2 className="cp-title">
          Cart {count > 0 && <span className="cp-badge">{count}</span>}
        </h2>
        <button className="cp-close-btn" onClick={() => window.close()}>×</button>
      </div>

      {items.length === 0 ? (
        <div className="cp-empty">
          <span className="cp-empty-icon">🛍</span>
          <p>Your cart is empty</p>
          <Link to="/" className="cp-browse-btn">Browse Products</Link>
        </div>
      ) : (
        <>
          <div className="cp-list">
            {items.map(({ product, quantity }) => {
              const img = product.image_url
                ? (product.image_url.startsWith('http') ? product.image_url : `${api.base}${product.image_url}`)
                : null;
              return (
                <div key={product.id} className="cp-item">
                  <div className="cp-thumb">
                    {img ? <img src={img} alt={product.name} /> : <div className="cp-thumb-ph" />}
                  </div>
                  <div className="cp-body">
                    <p className="cp-name">{product.name}</p>
                    <p className="cp-price">Rs {Number(product.price).toLocaleString()}</p>
                    <div className="cp-qty-row">
                      <button onClick={() => quantity === 1 ? removeFromCart(product.id) : setQty(product.id, quantity - 1)}>−</button>
                      <span>{quantity}</span>
                      <button onClick={() => setQty(product.id, quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className="cp-rm" onClick={() => removeFromCart(product.id)} aria-label="Remove">×</button>
                </div>
              );
            })}
          </div>

          <div className="cp-footer">
            <div className="cp-bill">
              <div className="cp-bill-row">
                <span>Subtotal</span>
                <span>Rs {Number(total).toLocaleString()}</span>
              </div>
              <div className="cp-bill-row">
                <span>Delivery</span>
                {isFreeDelivery
                  ? <span className="cp-free">FREE</span>
                  : <span>Rs {Number(deliveryFee).toLocaleString()}</span>}
              </div>
              {!isFreeDelivery && freeDeliveryMin > 0 && (
                <p className="cp-free-hint">Rs {Number(freeDeliveryMin - total).toLocaleString()} away from free delivery</p>
              )}
              <div className="cp-bill-divider" />
              <div className="cp-bill-row cp-bill-total">
                <span>Total</span>
                <span>Rs {Number(grandTotal).toLocaleString()}</span>
              </div>
            </div>
            <button className="cp-cta" onClick={() => navigate('/checkout')}>
              Checkout · Rs {Number(grandTotal).toLocaleString()} →
            </button>
            <button className="cp-continue" onClick={() => window.close()}>Continue Shopping</button>
          </div>
        </>
      )}

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', 'Inter', sans-serif; background: #FAF8F5; color: #1C1C1C; }
        .cp-wrap { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

        .cp-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px 9px; border-bottom: 1px solid #ECECEC;
          background: #fff; flex-shrink: 0;
        }
        .cp-title { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 7px; }
        .cp-badge {
          background: #1B3A2D; color: #fff; font-size: 10px; font-weight: 700;
          min-width: 18px; height: 18px; border-radius: 999px;
          display: flex; align-items: center; justify-content: center; padding: 0 4px;
        }
        .cp-close-btn {
          background: none; border: none; font-size: 24px; color: #6B6B6B;
          cursor: pointer; padding: 2px 6px; line-height: 1;
        }

        .cp-empty {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 8px; padding: 32px 20px; text-align: center;
        }
        .cp-empty-icon { font-size: 40px; }
        .cp-empty p { font-size: 14px; color: #6B6B6B; }
        .cp-browse-btn {
          margin-top: 10px; padding: 8px 20px; border: 1.5px solid #1C1C1C;
          border-radius: 8px; font-size: 12px; font-weight: 600;
          color: #1C1C1C; text-decoration: none; display: inline-block;
        }

        .cp-list { flex: 1; overflow-y: auto; padding: 8px 10px; display: flex; flex-direction: column; gap: 7px; }

        .cp-item {
          display: flex; gap: 8px; padding: 8px; border-radius: 10px;
          background: #fff; border: 1px solid #ECECEC; position: relative;
        }
        .cp-thumb { width: 48px; height: 48px; border-radius: 7px; overflow: hidden; flex-shrink: 0; background: #FAF8F5; }
        .cp-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .cp-thumb-ph { width: 100%; height: 100%; background: #ECECEC; }
        .cp-body { flex: 1; min-width: 0; padding-right: 18px; }
        .cp-name { font-size: 12.5px; font-weight: 600; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cp-price { font-size: 12px; font-weight: 700; color: #1B3A2D; margin-bottom: 5px; }
        .cp-qty-row {
          display: flex; align-items: center; background: #FAF8F5;
          border: 1px solid #ECECEC; border-radius: 7px; width: fit-content; overflow: hidden;
        }
        .cp-qty-row button { border: none; background: none; padding: 3px 8px; font-size: 14px; cursor: pointer; color: #1C1C1C; }
        .cp-qty-row span { font-size: 12px; font-weight: 600; padding: 0 4px; min-width: 20px; text-align: center; }
        .cp-rm {
          position: absolute; top: 7px; right: 8px;
          background: none; border: none; color: #9B9B9B; font-size: 16px;
          cursor: pointer; line-height: 1; padding: 0;
        }
        .cp-rm:hover { color: #1C1C1C; }

        .cp-footer { padding: 9px 12px 12px; border-top: 1px solid #ECECEC; flex-shrink: 0; background: #fff; }
        .cp-bill { display: flex; flex-direction: column; gap: 5px; margin-bottom: 9px; }
        .cp-bill-row { display: flex; justify-content: space-between; font-size: 12.5px; color: #6B6B6B; }
        .cp-bill-total { font-size: 14px; font-weight: 700; color: #1C1C1C; }
        .cp-bill-divider { border: none; border-top: 1px solid #ECECEC; margin: 3px 0; }
        .cp-free { color: #16a34a; font-weight: 700; font-size: 11.5px; }
        .cp-free-hint { font-size: 11px; color: #9B9B9B; margin-top: 2px; }

        .cp-cta {
          width: 100%; padding: 10px; background: #1B3A2D; color: #fff;
          border: none; border-radius: 10px; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: inherit; margin-bottom: 6px;
          transition: background .15s;
        }
        .cp-cta:hover { background: #142d23; }
        .cp-continue {
          width: 100%; background: none; border: none; padding: 6px;
          font-size: 12px; color: #6B6B6B; cursor: pointer; font-family: inherit;
        }
        .cp-continue:hover { color: #1C1C1C; }
      `}</style>
    </div>
  );
}
