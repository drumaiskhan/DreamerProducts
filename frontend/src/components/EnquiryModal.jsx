export default function EnquiryModal({ product, onClose, whatsappNumber, contactEmail }) {
  if (!product) return null;

  const wa = whatsappNumber || '923001234567';
  const email = contactEmail || 'hello@drdreamer.com';

  const message = encodeURIComponent(
    `Hi Dreamer Products! I'm interested in "${product.name}" (Rs ${product.price}). Is it available?`
  );

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        <p className="eyebrow-sm">ENQUIRE ABOUT</p>
        <h3 className="display">{product.name}</h3>
        <p className="modal-price">Rs {Number(product.price).toLocaleString()}</p>
        <p className="modal-hint">
          Reach out and we'll confirm availability, shipping, and payment details with you directly.
        </p>
        <div className="modal-actions">
          <a
            className="btn btn-primary"
            href={`https://wa.me/${wa}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message on WhatsApp
          </a>
          <a className="btn btn-outline" href={`mailto:${email}?subject=${encodeURIComponent('Product enquiry: ' + product.name)}`}>
            Email instead
          </a>
        </div>
      </div>

      <style>{`
        .overlay {
          position: fixed; inset: 0;
          background: rgba(30, 23, 48, 0.45);
          display: flex; align-items: center; justify-content: center;
          padding: 20px; z-index: 50;
        }
        .modal {
          background: var(--cream); border-radius: 20px; padding: 36px 32px;
          max-width: 420px; width: 100%; position: relative;
          box-shadow: 0 20px 60px rgba(30,23,48,0.25);
        }
        .close {
          position: absolute; top: 16px; right: 16px;
          background: none; border: none; font-size: 26px; line-height: 1; color: var(--ink-soft);
        }
        .eyebrow-sm {
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.1em;
          color: var(--dusty-rose); margin: 0 0 8px;
        }
        .modal h3 { font-size: 24px; margin-bottom: 6px; }
        .modal-price { font-weight: 700; margin: 0 0 14px; }
        .modal-hint { font-size: 14px; color: var(--ink-soft); line-height: 1.55; margin-bottom: 26px; }
        .modal-actions { display: flex; flex-direction: column; gap: 10px; }
        .modal-actions .btn { width: 100%; }
      `}</style>
    </div>
  );
}
