import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import EnquiryModal from "../components/EnquiryModal";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";

const PLACEHOLDERS = {
  skin: '/product-skin.jpg',
  hair: '/product-hair.jpg',
  perfumes: '/product-perfume.jpg',
};

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
            border: 2.5px solid var(--border); border-top-color: var(--sage);
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
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

  function handleAdd() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="pd-page">
      <Navbar />

      <div className="container pd-crumb">
        <Link to="/">Shop</Link> <span>/</span> <span>{catLabel}</span> <span>/</span> <span className="pd-crumb-current">{product.name}</span>
      </div>

      <div className="container pd-layout">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-main-image">
            <img src={gallery[imgIndex]} alt={product.name} />
            {Boolean(product.featured) && <span className="pd-tag pd-tag-gold">Featured</span>}
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
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd-info">
          <p className="eyebrow pd-eyebrow">{catLabel}</p>
          <h1 className="display pd-name">{product.name}</h1>
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
            <div className="pd-perk"><span className="pd-perk-dot" />100% natural ingredients</div>
            <div className="pd-perk"><span className="pd-perk-dot" />Dermatologist-reviewed formula</div>
            <div className="pd-perk"><span className="pd-perk-dot" />No harmful chemicals</div>
          </div>

          <button className="pd-back" onClick={() => navigate(-1)}>← Continue shopping</button>
        </div>
      </div>

      <EnquiryModal
        product={enquiryProduct}
        onClose={() => setEnquiryProduct(null)}
        whatsappNumber={settings.whatsapp_number}
        contactEmail={settings.contact_email}
      />

      <style>{`
        .pd-page { min-height: 100vh; background: var(--warm-white); }
        .pd-crumb {
          padding: 20px 32px 0; font-size: 12.5px; color: var(--ink-muted);
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .pd-crumb a { color: var(--ink-soft); }
        .pd-crumb a:hover { color: var(--forest); }
        .pd-crumb-current { color: var(--ink); font-weight: 500; }

        .pd-layout {
          display: grid; grid-template-columns: 1.1fr 1fr; gap: 64px;
          padding: 32px 32px 100px;
        }

        /* Gallery */
        .pd-main-image {
          position: relative; aspect-ratio: 1 / 1.05; border-radius: var(--radius);
          overflow: hidden; background: var(--sage-pale);
        }
        .pd-main-image img { width: 100%; height: 100%; object-fit: cover; }
        .pd-tag {
          position: absolute; top: 16px; left: 16px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 6px 12px; border-radius: 3px;
        }
        .pd-tag-gold { background: var(--gold); color: #fff; }
        .pd-thumbs { display: flex; gap: 10px; margin-top: 14px; }
        .pd-thumb {
          width: 68px; height: 68px; border-radius: 10px; overflow: hidden;
          border: 1.5px solid var(--border); padding: 0; cursor: pointer; flex-shrink: 0;
          transition: border-color var(--t-base) ease;
        }
        .pd-thumb.active { border-color: var(--forest); }
        .pd-thumb img { width: 100%; height: 100%; object-fit: cover; }

        /* Info */
        .pd-info { display: flex; flex-direction: column; padding-top: 8px; }
        .pd-eyebrow { margin-bottom: 10px; }
        .pd-name { font-size: 40px; margin-bottom: 12px; }
        .pd-price {
          font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 600;
          color: var(--ink); margin: 0 0 14px;
        }
        .pd-stock {
          display: inline-flex; width: fit-content; font-size: 12px; font-weight: 600;
          letter-spacing: 0.04em; margin-bottom: 20px;
        }
        .pd-stock.in { color: var(--sage); }
        .pd-stock.out { color: #B54040; }
        .pd-desc {
          font-size: 15px; line-height: 1.75; color: var(--ink-soft);
          margin: 0 0 32px; padding-bottom: 32px; border-bottom: 1px solid var(--border);
        }

        .pd-actions { display: flex; gap: 12px; margin-bottom: 32px; }
        .pd-add { flex: 1.4; }
        .pd-enq { flex: 1; }

        .pd-perks { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        .pd-perk { display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: var(--ink-soft); }
        .pd-perk-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sage); flex-shrink: 0; }

        .pd-back {
          align-self: flex-start; background: none; border: none; cursor: pointer;
          font-size: 12.5px; font-weight: 500; letter-spacing: 0.04em;
          color: var(--ink-muted); padding: 0; transition: color var(--t-base) ease;
        }
        .pd-back:hover { color: var(--forest); }

        @media (max-width: 900px) {
          .pd-layout { grid-template-columns: 1fr; gap: 28px; padding: 24px 20px 72px; }
          .pd-crumb { padding: 16px 20px 0; }
          .pd-name { font-size: 30px; }
          .pd-price { font-size: 22px; }
          .pd-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
