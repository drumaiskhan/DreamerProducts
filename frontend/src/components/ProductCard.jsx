import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';

const PLACEHOLDERS = {
  skin: '/product-skin.jpg',
  hair: '/product-hair.jpg',
  perfumes: '/product-perfume.jpg',
};

function StarRow({ rating, count }) {
  const r = parseFloat(rating) || 0;
  return (
    <div className="card-stars" aria-label={`${r} out of 5`}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= Math.round(r) ? '#D9B99B' : 'none'} stroke={i <= Math.round(r) ? '#D9B99B' : '#D8D8D8'} strokeWidth="2">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
      {count > 0 && <span className="card-review-count">({count})</span>}
    </div>
  );
}

export default function ProductCard({ product, onEnquire }) {
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

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

  const images = rawImages
    .map(u => u && u.startsWith('http') ? u : (u ? `${api.base}${u}` : null))
    .filter(Boolean);

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
  function handleAdd(e) {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const catLabel = product.category === 'skin' ? 'Skincare' : product.category === 'hair' ? 'Haircare' : 'Perfumes';

  return (
    <>
      <article className="card" onClick={() => navigate(`/product/${product.id || product._id}`)}>
        <div className="card-image">
          {!imgLoaded && <div className="card-skel" />}
          <img
            key={currentSrc}
            src={currentSrc}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            style={{ opacity: imgLoaded ? 1 : 0 }}
            loading="lazy"
          />

          <div className="card-badges">
            <span className="card-tag">{catLabel}</span>
            {Boolean(product.featured) && <span className="card-tag card-tag-accent">Featured</span>}
            {product.stock === 0
              ? <span className="card-tag card-tag-oos">Sold Out</span>
              : product.stock <= 5
                ? <span className="card-tag card-tag-low">Only {product.stock} left</span>
                : null
            }
          </div>

          {hasMultiple && (
            <>
              <button className="img-nav img-nav-prev" onClick={prev}>‹</button>
              <button className="img-nav img-nav-next" onClick={next}>›</button>
              <div className="img-dots">
                {images.map((_, i) => (
                  <button key={i} className={`img-dot ${i === imgIndex ? 'active' : ''}`}
                    onClick={e => { e.stopPropagation(); setImgIndex(i); setImgLoaded(false); }} />
                ))}
              </div>
            </>
          )}

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

          {(product.avg_rating > 0 || product.review_count > 0) && (
            <StarRow rating={product.avg_rating} count={product.review_count} />
          )}

          {product.description && (
            <p className="card-desc">{product.description}</p>
          )}

          <div className="card-footer">
            <span className="card-price">Rs {Number(product.price).toLocaleString()}</span>
            <div className="card-actions">
              <button
                className="btn btn-primary card-add"
                onClick={handleAdd}
                disabled={product.stock === 0 || added}
              >
                {added ? '✓' : product.stock === 0 ? 'Sold Out' : 'Add'}
              </button>
              <button
                className="btn btn-outline card-enq"
                onClick={e => { e.stopPropagation(); onEnquire(product); }}
              >
                Enquire
              </button>
            </div>
          </div>
        </div>
      </article>

      <style>{`
        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: box-shadow var(--t-base) ease, transform var(--t-base) ease, border-color var(--t-base) ease;
        }
        .card:hover {
          box-shadow: var(--shadow);
          transform: translateY(-4px);
          border-color: var(--border-dark);
        }
        .card-image {
          position: relative;
          aspect-ratio: 1 / 1.15;
          background: #F5F3F0;
          overflow: hidden;
        }
        .card-image img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: opacity var(--t-slow) ease, transform 0.5s var(--ease-out);
        }
        .card:hover .card-image img { transform: scale(1.04); }
        .card-skel {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, #F5F3F0 25%, #EDEAE6 50%, #F5F3F0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .card-badges {
          position: absolute; top: 12px; left: 12px;
          display: flex; gap: 5px; z-index: 2; flex-wrap: wrap;
        }
        .card-tag {
          font-family: 'Inter', sans-serif;
          font-size: 9px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase;
          background: rgba(255,255,255,0.95); color: var(--ink);
          padding: 4px 9px; border-radius: 3px;
          backdrop-filter: blur(4px);
        }
        .card-tag-accent { background: var(--accent); color: #fff; }
        .card-tag-oos { background: #1C1C1C; color: #fff; }
        .card-tag-low { background: #b45309; color: #fff; }

        .img-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.9); border: none;
          font-size: 16px; line-height: 1; color: var(--ink);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 2; opacity: 0;
          transition: opacity var(--t-base) ease, background var(--t-base) ease;
        }
        .card:hover .img-nav { opacity: 1; }
        .img-nav:hover { background: #fff; }
        .img-nav-prev { left: 10px; }
        .img-nav-next { right: 10px; }
        .img-dots {
          position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 5px; z-index: 2;
        }
        .img-dot {
          width: 5px; height: 5px; border-radius: 50%; border: none;
          background: rgba(255,255,255,0.6); cursor: pointer; padding: 0;
          transition: all .2s;
        }
        .img-dot.active { background: #fff; width: 14px; border-radius: 3px; }

        .card-overlay {
          position: absolute; left: 0; right: 0; bottom: 0;
          padding: 14px 12px;
          background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
          display: flex; justify-content: center;
          opacity: 0; transform: translateY(6px);
          transition: opacity var(--t-base) ease, transform var(--t-base) ease;
          z-index: 2;
        }
        .card:hover .card-overlay { opacity: 1; transform: translateY(0); }
        .card-quick-add { width: 100%; font-size: 11px; padding: 10px 20px; }

        .card-body {
          padding: 16px 16px 18px;
          display: flex; flex-direction: column; gap: 5px;
          flex: 1;
        }
        .card-meta {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1px;
        }
        .card-cat-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--accent-dark);
        }
        .stock { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.04em; }
        .stock.in { color: #4A8C6A; }
        .stock.out { color: #B54040; }

        .card-name {
          font-family: 'Playfair Display', serif;
          font-size: 18px; margin: 0; color: var(--ink); line-height: 1.2;
        }

        .card-stars {
          display: flex; align-items: center; gap: 2px; margin: 2px 0;
        }
        .card-review-count {
          font-family: 'Inter', sans-serif;
          font-size: 10px; color: var(--ink-soft); margin-left: 3px;
        }

        .card-desc {
          font-family: 'Inter', sans-serif;
          font-size: 12px; color: var(--ink-soft); line-height: 1.5;
          margin: 2px 0 0;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          margin-top: auto; padding-top: 12px;
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
        }
        .card-price {
          font-family: 'Playfair Display', serif;
          font-size: 19px; font-weight: 600; color: var(--ink);
        }
        .card-actions { display: flex; gap: 7px; }
        .card-add, .card-enq { padding: 8px 12px; font-size: 10px; }

        @media (max-width: 400px) {
          .card-body { padding: 12px 12px 14px; }
          .card-name { font-size: 15px; }
          .card-price { font-size: 16px; }
          .card-footer { flex-direction: column; align-items: stretch; gap: 8px; }
          .card-actions { justify-content: stretch; }
          .card-add, .card-enq { flex: 1; }
        }
      `}</style>
    </>
  );
}
