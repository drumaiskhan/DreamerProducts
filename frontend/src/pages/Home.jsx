import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CategoryShowcase from '../components/CategoryShowcase';
import BrandStory from '../components/BrandStory';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import ProductCard from '../components/ProductCard';
import EnquiryModal from '../components/EnquiryModal';
import CartDrawer from '../components/CartDrawer';
import { api } from '../lib/api';

export default function Home() {
  const [filter, setFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enquiryProduct, setEnquiryProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true); setError('');
    api.getProducts(filter === 'all' ? null : filter)
      .then(setProducts).catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  function handleCategory(cat) {
    setFilter(cat);
    setTimeout(() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }), 80);
  }

  return (
    <div>
      <Navbar active={filter} onFilter={setFilter} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Hero />

      <div id="categories">
        <CategoryShowcase onFilter={handleCategory} />
      </div>

      {/* Shop section */}
      <section id="shop" className="shop container">
        <div className="shop-header">
          <div>
            <p className="eyebrow shop-eyebrow">
              {filter === 'all' ? 'All Products' : filter === 'skin' ? 'Skincare' : filter === 'hair' ? 'Haircare' : 'Perfumes'}
            </p>
            <h2 className="display shop-title">
              {filter === 'all' ? 'The Full Range' : filter === 'skin' ? 'Skincare Range' : filter === 'hair' ? 'Haircare Range' : 'Perfumes Range'}
            </h2>
          </div>
          <div className="shop-right">
            {!loading && !error && products.length > 0 && (
              <span className="prod-count">{products.length} product{products.length !== 1 ? 's' : ''}</span>
            )}
            {filter !== 'all' && (
              <button className="clear-btn" onClick={() => setFilter('all')}>Clear filter ×</button>
            )}
          </div>
        </div>

        {loading && (
          <div className="grid">
            {[...Array(4)].map((_, i) => <div key={i} className="card-skel-outer" />)}
          </div>
        )}
        {error && (
          <div className="state-box">
            <p className="state-msg">Couldn't load products — please try again.</p>
          </div>
        )}
        {!loading && !error && products.length === 0 && (
          <div className="state-box">
            <p style={{ fontSize: 24, marginBottom: 12, color: 'var(--sage)' }}>—</p>
            <p className="state-msg">No products in this collection yet.</p>
            <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={() => setFilter('all')}>View all products</button>
          </div>
        )}
        <div className="grid">
          {!loading && products.map((p, i) => (
            <div key={p.id} className="animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <ProductCard product={p} onEnquire={setEnquiryProduct} />
            </div>
          ))}
        </div>
      </section>

      <BrandStory />
      <Testimonials />
      <Newsletter />

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand-col">
            <div className="footer-logo-wrap">
              <span className="footer-dr">Dr.</span>
              <span className="display footer-logo-name">Dreamer</span>
            </div>
            <p className="footer-tag">Dermatologist-reviewed skin &amp; hair care — made for the quiet five minutes you give yourself each day.</p>
            <div className="footer-badges">
              <span className="footer-badge">✦ Clinically Tested</span>
              <span className="footer-badge">✦ No Harmful Chemicals</span>
            </div>
          </div>
          <div>
            <p className="footer-head">Collections</p>
            <ul className="footer-links">
              {[['skin','Skincare'],['hair','Haircare'],['perfumes','Perfumes']].map(([k,l]) => (
                <li key={k}><button onClick={() => handleCategory(k)}>{l}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-head">Account</p>
            <ul className="footer-links">
              <li><a href="/login">Sign in</a></li>
              <li><a href="/signup">Create account</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom container">
          <p>© {new Date().getFullYear()} Dreamer Products. All rights reserved.</p>
          <p className="footer-bottom-rx">Formulated with care · Dermatologist approved</p>
        </div>
      </footer>

      <EnquiryModal
        product={enquiryProduct}
        onClose={() => setEnquiryProduct(null)}
        whatsappNumber={settings.whatsapp_number}
        contactEmail={settings.contact_email}
      />

      <style>{`
        .shop { padding: 80px 0 110px; }
        .shop-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 40px; flex-wrap: wrap; gap: 14px;
        }
        .shop-eyebrow { margin-bottom: 6px; }
        .shop-title { font-size: 36px; }
        .shop-right { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
        .prod-count { font-size: 12px; letter-spacing: 0.06em; color: var(--ink-soft); }
        .clear-btn {
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--sage); background: none; border: 1.5px solid var(--sage);
          border-radius: 2px; padding: 6px 14px; cursor: pointer;
          transition: background .18s, color .18s;
        }
        .clear-btn:hover { background: var(--sage); color: #fff; }

        .card-skel-outer {
          border-radius: 4px; aspect-ratio: 1/1.45;
          background: linear-gradient(90deg, var(--cream) 25%, #f0ede8 50%, var(--cream) 75%);
          background-size: 200% 100%; animation: shimmer 1.4s infinite;
          border: 1px solid var(--border);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }
        .state-box {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 0; text-align: center;
          color: var(--ink-soft);
        }
        .state-msg { font-size: 15px; margin: 0; }

        /* Footer */
        .footer { background: var(--forest); color: rgba(255,255,255,0.7); padding: 64px 0 0; }
        .footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr;
          gap: 56px; padding-bottom: 56px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .footer-brand-col {}
        .footer-logo-wrap {
          display: flex; align-items: baseline; gap: 5px; margin-bottom: 14px;
        }
        .footer-dr {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600;
          color: var(--sage-light); letter-spacing: 0.05em;
        }
        .footer-logo-name {
          font-size: 24px; font-weight: 500; color: #fff; letter-spacing: -0.02em;
        }
        .footer-tag { font-size: 13px; line-height: 1.7; opacity: 0.6; margin: 0 0 18px; max-width: 280px; }
        .footer-badges { display: flex; flex-direction: column; gap: 7px; }
        .footer-badge {
          font-size: 10px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--sage-light); opacity: 0.8;
        }
        .footer-head {
          font-size: 10px; font-weight: 700; letter-spacing: 0.16em;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
          margin: 0 0 16px;
        }
        .footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
        .footer-links a, .footer-links button {
          background: none; border: none; font-size: 13.5px; cursor: pointer;
          color: rgba(255,255,255,0.55); padding: 0; font-family: inherit;
          text-align: left; text-decoration: none; transition: color .18s;
        }
        .footer-links a:hover, .footer-links button:hover { color: #fff; }
        .footer-bottom {
          padding: 18px 0; display: flex; justify-content: space-between;
          align-items: center; font-size: 11px; opacity: 0.3; flex-wrap: wrap; gap: 8px;
        }
        .footer-bottom-rx { font-style: italic; letter-spacing: 0.04em; }

        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr; gap: 32px; }
          .shop { padding: 48px 0 64px; }
          .shop-title { font-size: 26px; }
          .footer-bottom { flex-direction: column; text-align: center; gap: 4px; }
          .grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
        }
        @media (max-width: 400px) {
          .grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .shop { padding: 40px 0 56px; }
        }
      `}</style>
    </div>
  );
}
