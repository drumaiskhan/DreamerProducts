import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';

// Per-category AI-generated placeholder images
const PLACEHOLDERS = {
  skin:     '/product-skin.jpg',
  hair:     '/product-hair.jpg',
  perfumes: '/product-perfume.jpg',
};

export default function ProductCard({ product, onEnquire }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  // Build full image list
  const rawImages = (() => {
    try {
      const parsed = Array.isArray(product.images)
        ? product.images
        : JSON.parse(product.images || '[]');
      return parsed.length > 0 ? parsed : (product.image_url ? [product.image_url] : []);
    } catch {
      return product.image_url ? [product.image_url] : [];
    }
  })();

  const images = rawImages.map(u =>
    u && u.startsWith('http') ? u : u ? `${api.base}${u}` : null
  ).filter(Boolean);

  // Fall back to branded AI placeholder by category
  const placeholder = PLACEHOLDERS[product.category] || PLACEHOLDERS.skin;
  const currentSrc = images[imgIndex] ?? placeholder;
  const hasMultiple = images.length > 1;

  function prev(e) {
    e.stopPropagation();
    setImgIndex(i => (i - 1 + images.length) % images.length);
    setImgLoaded(false);
  }
  function next(e) {
    e.stopPropagation();
    setImgIndex(i => (i + 1) % images.length);
    setImgLoaded(false);
  }

  function handleAdd() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const catLabel = product.category === 'skin' ? 'Skincare' : product.category === 'hair' ? 'Haircare' : 'Perfumes';

  return (
    <article className="card">
      <div className="card-image">
        <>
          {!imgLoaded && <div className="card-skel" />}
          <img
            key={currentSrc}
            src={currentSrc}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            style={{ opacity: imgLoaded ? 1 : 0 }}
          />
        </>

        {/* Badges */}
        <div className="card-badges">
          <span className="card-tag">{catLabel}</span>
          {Boolean(product.featured) && <span className="card-tag card-tag-gold">Featured</span>}
        </div>

        {/* Multi-image nav */}
        {hasMultiple && (
          <>
            <button className="img-nav img-nav-prev" onClick={prev} aria-label="Previous image">‹</button>
            <button className="img-nav img-nav-next" onClick={next} aria-label="Next image">›</button>
            <div className="img-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`img-dot ${i === imgIndex ? 'active' : ''}`}
                  onClick={e => { e.stopPropagation(); setImgIndex(i); setImgLoaded(false); }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Quick add overlay */}
        <div className="card-overlay">
          <button className="card-quick-add btn btn-primary" onClick={handleAdd}>
            {added ? '✓ Added' : '+ Add to Cart'}
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="card-meta">
          <span className="card-cat-label">{catLabel}</span>
          {product.stock > 0
            ? <span className="stock in">In Stock</span>
            : <span className="stock out">Out of Stock</span>
          }
        </div>
        <h3 className="card-name">{product.name}</h3>
        {product.description && <p className="card-desc">{product.description}</p>}
        <div className="card-footer">
          <span className="display card-price">Rs {Number(product.price).toLocaleString()}</span>
          <div className="card-actions">
            <button
              className="btn btn-primary card-add"
              onClick={handleAdd}
              disabled={product.stock === 0 || added}
            >
              {added ? '✓ Added!' : product.stock === 0 ? 'Out of Stock' : 'Add'}
            </button>
            <button className="btn btn-outline card-enq" onClick={() => onEnquire(product)}>
              Enquire
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .card {
          background: #fff; border-radius: 4px; overflow: hidden;
          border: 1px solid var(--border); display: flex; flex-direction: column;
          transition: box-shadow .28s ease, transform .28s ease;
        }
        .card:hover { box-shadow: var(--shadow); transform: translateY(-4px); }

        .card-image {
          position: relative; aspect-ratio: 1/1;
          background: var(--cream); overflow: hidden;
        }
        .card-skel {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, var(--cream) 25%, #f0ede8 50%, var(--cream) 75%);
          background-size: 200% 100%; animation: shimmer 1.4s infinite;
        }
        .card-image img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .45s ease, opacity .3s ease; position: relative;
        }
        .card:hover .card-image img { transform: scale(1.06); }

        .card-badges {
          position: absolute; top: 12px; left: 12px;
          display: flex; gap: 6px; z-index: 2;
        }
        .card-tag {
          background: rgba(255,255,255,0.95); backdrop-filter: blur(6px);
          font-size: 9px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 4px 10px; border-radius: 2px;
          color: var(--ink-soft);
        }
        .card-tag-gold { background: rgba(201,169,110,0.9); color: #fff; }

        /* Multi-image nav */
        .img-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 3; background: rgba(255,255,255,0.9); border: 1px solid var(--border);
          width: 28px; height: 28px; border-radius: 2px;
          font-size: 16px; line-height: 1; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,.1);
          opacity: 0; transition: opacity .2s;
          color: var(--ink);
        }
        .card:hover .img-nav { opacity: 1; }
        .img-nav-prev { left: 8px; }
        .img-nav-next { right: 8px; }
        .img-nav:hover { background: #fff; }

        .img-dots {
          position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 5px; z-index: 3;
        }
        .img-dot {
          width: 5px; height: 5px; border-radius: 50%; border: none; padding: 0;
          background: rgba(255,255,255,.5); cursor: pointer;
          transition: background .18s, transform .18s;
        }
        .img-dot.active { background: #fff; transform: scale(1.4); }

        /* Quick add overlay */
        .card-overlay {
          position: absolute; inset: 0; z-index: 2;
          background: rgba(27,58,45,0.38);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .28s ease;
        }
        .card:hover .card-overlay { opacity: 1; }
        .card-quick-add {
          font-size: 12px; padding: 10px 22px; letter-spacing: 0.1em;
          transform: translateY(8px); opacity: 0;
          transition: transform .28s ease, opacity .28s ease;
        }
        .card:hover .card-quick-add { transform: translateY(0); opacity: 1; }

        /* Body */
        .card-body { padding: 18px 18px 20px; display: flex; flex-direction: column; flex: 1; }
        .card-meta {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 8px;
        }
        .card-cat-label {
          font-size: 9px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--sage);
        }
        .card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-weight: 500;
          margin-bottom: 6px; line-height: 1.25;
          color: var(--ink);
        }
        .card-desc {
          font-size: 12.5px; color: var(--ink-soft); line-height: 1.6;
          margin: 0 0 14px; flex: 1;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .card-footer {
          display: flex; align-items: center;
          justify-content: space-between; gap: 8px;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }
        .card-price {
          font-size: 18px; font-weight: 500; color: var(--forest);
        }
        .stock {
          font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 3px 8px; border-radius: 2px;
        }
        .in { background: #E8F5F0; color: #1B5E3B; }
        .out { background: #FEE8E8; color: #9B2020; }

        .card-actions { display: flex; gap: 6px; }
        .card-add { font-size: 11px; padding: 8px 14px; letter-spacing: 0.08em; }
        .card-add:disabled { opacity: .45; cursor: not-allowed; transform: none; box-shadow: none; }
        .card-enq { font-size: 11px; padding: 8px 12px; letter-spacing: 0.08em; }

        @media (hover: none) {
          .card-overlay { display: none; }
          .img-nav { opacity: 1; }
        }
        @media (max-width: 380px) {
          .card-footer { flex-direction: column; align-items: flex-start; gap: 10px; }
          .card-actions { width: 100%; }
          .card-add, .card-enq { flex: 1; text-align: center; justify-content: center; }
        }
      `}</style>
    </article>
  );
}
