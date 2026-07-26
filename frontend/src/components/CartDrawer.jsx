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
    position: fixed;
    inset: 0;
    background: rgba(30,23,48,0.45);
    z-index: 55;

    opacity: 0;
    visibility: hidden;
    pointer-events: none;

    transition:
      opacity 0.28s ease,
      visibility 0s linear 0.28s;
  }

  .cd-backdrop.open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;

    transition:
      opacity 0.28s ease,
      visibility 0s linear 0s;
  }


  .cd-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;

    width: min(420px, 100vw);

    background: #fff;
    z-index: 60;

    display: flex;
    flex-direction: column;

    box-shadow: -8px 0 48px rgba(30,23,48,0.14);

    transform: translateX(100%);
    visibility: hidden;
    pointer-events: none;

    transition:
      transform 0.32s cubic-bezier(0.22,1,0.36,1),
      visibility 0s linear 0.32s;
  }


  .cd-drawer.open {
    transform: translateX(0);

    visibility: visible;
    pointer-events: auto;

    transition:
      transform 0.32s cubic-bezier(0.22,1,0.36,1),
      visibility 0s linear 0s;
  }


  .cd-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 24px 24px 20px;
    border-bottom: 1px solid var(--border);
  }


  .cd-title {
    font-size: 22px;
    display: flex;
    align-items: center;
    gap: 10px;
  }


  .cd-close {
    background: none;
    border: none;
    font-size: 28px;
    color: var(--ink-soft);
    cursor: pointer;
    padding: 4px 8px;
  }


  .cd-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px;

    display: flex;
    flex-direction: column;
    gap: 16px;
  }


  .cd-item {
    display: flex;
    gap: 14px;

    padding: 14px;
    border-radius: 14px;

    background: var(--cream);
    border: 1px solid var(--border);

    position: relative;
  }


  .cd-thumb {
    width: 64px;
    height: 64px;

    border-radius: 10px;
    overflow: hidden;

    flex-shrink: 0;
  }


  .cd-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }


  .cd-item-body {
    flex: 1;
  }


  .cd-name {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 4px;
  }


  .cd-price {
    font-weight: 700;
    margin: 0 0 10px;
  }


  .cd-qty-row {
    display: flex;
    align-items: center;

    background: #fff;
    border: 1px solid var(--border);

    border-radius: 10px;
    overflow: hidden;
    width: fit-content;
  }


  .cd-qty-row button {
    border: none;
    background: none;
    padding: 6px 12px;
    cursor: pointer;
  }


  .cd-rm {
    position: absolute;
    top: 10px;
    right: 10px;

    background: none;
    border: none;

    cursor: pointer;
  }


  .cd-footer {
    padding: 20px 24px 28px;
    border-top: 1px solid var(--border);
  }


  .cd-bill-row {
    display: flex;
    justify-content: space-between;

    margin-bottom: 8px;
  }


  .cd-cta {
    width: 100%;
    margin-top: 15px;
  }


  .cd-continue {
    width: 100%;
    background: none;
    border: none;

    padding: 10px;
    cursor: pointer;
  }
`}</style>
    </>
  );
}
