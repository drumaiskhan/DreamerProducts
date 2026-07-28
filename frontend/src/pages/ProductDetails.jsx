import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import EnquiryModal from "../components/EnquiryModal";
import ProductReviews from "../components/ProductReviews";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";

const PLACEHOLDERS = {
  skin: '/product-skin.jpg',
  hair: '/product-hair.jpg',
  perfumes: '/product-perfume.jpg',
};

function Stars({ rating }) {
  const r = parseFloat(rating) || 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24"
          fill={i <= Math.round(r) ? '#D9B99B' : 'none'}
          stroke={i <= Math.round(r) ? '#D9B99B' : '#D8D8D8'}
          strokeWidth="2">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [imgIndex, setImgIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [enquiryProduct, setEnquiryProduct] = useState(null);
  const [settings, setSettings] = useState({});
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    setProduct(null);
    setError('');
    setImgIndex(0);
    api.getProduct(id)
      .then(data => setProduct(data))
      .catch(err => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="pd-state container">
          <p className="pd-state-msg">Couldn't load this product.</p>
          <Link to="/" className="btn btn-outline">Back to shop</Link>
        </div>
        <style>{`
          .pd-state { min-height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; text-align: center; padding: 80px 24px; }
          .pd-state-msg { color: var(--ink-soft); font-size: 15px; }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Navbar />
        <div className="pd-state container">
          <div className="pd-spinner" />
        </div>
        <style>{`
          .pd-state { min-height: 50vh; display: flex; align-items: center; justify-content: center; }
          .pd-spinner {
            width: 32px; height: 32px; border-radius: 50%;
            border: 2px solid var(--border); border-top-color: var(--accent);
            animation: spin 0.8s linear infinite;
          }
        `}</style>
      </div>
    );
  }

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
    .map(u => (u && u.startsWith('http')) ? u : (u ? `${api.base}${u}` : null))
    .filter(Boolean);

  const placeholder = PLACEHOLDERS[product.category] || PLACEHOLDERS.skin;
  const gallery = images.length > 0 ? images : [placeholder];
  const catLabel = product.category === 'skin' ? 'Skincare' : product.category === 'hair' ? 'Haircare' : 'Perfumes';
  const inStock = product.stock > 0;
  const avg = parseFloat(product.avg_rating) || 0;
  const reviewCount = parseInt(product.review_count) || 0;

  function handleAdd() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="pd-page">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      <div className="container pd-crumb">
        <Link to="/">Shop</Link>
        <span className="pd-crumb-sep">/</span>
        <span>{catLabel}</span>
        <span className="pd-crumb-sep">/</span>
        <span className="pd-crumb-current">{product.name}</span>
      </div>

      <div className="container pd-layout">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-main-image">
            <img src={gallery[imgIndex]} alt={product.name} />
            {Boolean(product.featured) && <span className="pd-tag pd-tag-accent">Featured</span>}
          </div>
          {gallery.length > 1 && (
            <div className="pd-thumbs">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  className={`pd-thumb ${i === imgIndex ? 'active' : ''}`}
                  onClick={() => setImgIndex(i)}
                  aria-label={`Image ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd-info">
          <p className="eyebrow pd-eyebrow">{catLabel}</p>
          <h1 className="display pd-name">{product.name}</h1>

          {/* Rating row */}
          {reviewCount > 0 && (
            <div className="pd-rating-row">
              <Stars rating={avg} />
              <span className="pd-rating-score">{avg.toFixed(1)}</span>
              <button
                className="pd-rating-link"
                onClick={() => document.getElementById('pd-reviews')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              </button>
            </div>
          )}

          <p className="pd-price">Rs {Number(product.price).toLocaleString()}</p>

          <span className={`pd-stock ${inStock ? 'in' : 'out'}`}>
            {inStock ? '● In Stock' : '● Out of Stock'}
          </span>

          {product.description && (
            <p className="pd-desc">{product.description}</p>
          )}

          <div className="pd-actions">
            <button
              className="btn btn-primary pd-add"
              onClick={handleAdd}
              disabled={!inStock || added}
            >
              {added ? '✓ Added to cart' : inStock ? '+ Add to Cart' : 'Out of Stock'}
            </button>
            <button className="btn btn-outline pd-enq" onClick={() => setEnquiryProduct(product)}>
              Enquire
            </button>
          </div>

          <div className="pd-perks">
            <div className="pd-perk">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              100% natural ingredients
            </div>
            <div className="pd-perk">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Dermatologist-reviewed formula
            </div>
            <div className="pd-perk">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              No harmful chemicals
            </div>
          </div>

          <button className="pd-back" onClick={() => navigate(-1)}>← Continue shopping</button>
        </div>
      </div>

      {/* Reviews */}
      <div id="pd-reviews" className="container pd-reviews-wrap">
        <ProductReviews productId={id} />
      </div>

      <EnquiryModal
        product={enquiryProduct}
        onClose={() => setEnquiryProduct(null)}
        whatsappNumber={settings.whatsapp_number}
        contactEmail={settings.contact_email}
      />

      <style>{`
        .pd-page { min-height: 100vh; background: var(--bg); }
        .pd-crumb {
          padding: 20px 32px 0; font-family: 'Inter', sans-serif;
          font-size: 12px; color: var(--ink-muted);
          display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
        }
        .pd-crumb a { color: var(--ink-soft); transition: color .15s; }
        .pd-crumb a:hover { color: var(--ink); }
        .pd-crumb-sep { opacity: .4; }
        .pd-crumb-current { color: var(--ink); font-weight: 500; }

        .pd-layout {
          display: grid; grid-template-columns: 1.1fr 1fr; gap: 64px;
          padding: 32px 32px 80px;
        }

        /* Gallery */
        .pd-main-image {
          position: relative; aspect-ratio: 1 / 1.05; border-radius: var(--radius);
          overflow: hidden; background: #F5F3F0;
        }
        .pd-main-image img { width: 100%; height: 100%; object-fit: cover; }
        .pd-tag {
          position: absolute; top: 16px; left: 16px;
          font-family: 'Inter', sans-serif;
          font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 5px 11px; border-radius: 3px;
        }
        .pd-tag-accent { background: var(--accent); color: #fff; }
        .pd-thumbs { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
        .pd-thumb {
          width: 68px; height: 68px; border-radius: 10px; overflow: hidden;
          border: 1.5px solid var(--border); padding: 0; cursor: pointer; flex-shrink: 0;
          transition: border-color var(--t-base) ease;
        }
        .pd-thumb.active { border-color: var(--ink); }
        .pd-thumb img { width: 100%; height: 100%; object-fit: cover; }

        /* Info */
        .pd-info { display: flex; flex-direction: column; padding-top: 8px; }
        .pd-eyebrow { margin-bottom: 10px; }
        .pd-name { font-size: 38px; margin-bottom: 14px; }

        .pd-rating-row {
          display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
        }
        .pd-rating-score {
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: var(--ink);
        }
        .pd-rating-link {
          background: none; border: none; cursor: pointer; padding: 0;
          font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft);
          text-decoration: underline; text-underline-offset: 2px; transition: color .15s;
        }
        .pd-rating-link:hover { color: var(--ink); }

        .pd-price {
          font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 600;
          color: var(--ink); margin: 0 0 12px;
        }
        .pd-stock {
          display: inline-flex; width: fit-content; font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 20px;
        }
        .pd-stock.in { color: #4A8C6A; }
        .pd-stock.out { color: #B54040; }
        .pd-desc {
          font-size: 15px; line-height: 1.75; color: var(--ink-soft);
          margin: 0 0 28px; padding-bottom: 28px; border-bottom: 1px solid var(--border);
        }

        .pd-actions { display: flex; gap: 12px; margin-bottom: 28px; }
        .pd-add { flex: 1.4; }
        .pd-enq { flex: 1; }

        .pd-perks { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        .pd-perk {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Inter', sans-serif; font-size: 13px; color: var(--ink-soft);
        }

        .pd-back {
          align-self: flex-start; background: none; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 0.04em;
          color: var(--ink-muted); padding: 0; transition: color var(--t-base) ease;
        }
        .pd-back:hover { color: var(--ink); }

        .pd-reviews-wrap { padding-bottom: 80px; }

        @media (max-width: 900px) {
          .pd-layout { grid-template-columns: 1fr; gap: 28px; padding: 24px 20px 60px; }
          .pd-crumb { padding: 16px 20px 0; }
          .pd-name { font-size: 28px; }
          .pd-price { font-size: 22px; }
          .pd-actions { flex-direction: column; }
          .pd-reviews-wrap { padding: 0 0 60px; }
        }
      `}</style>
    </div>
  );
}
