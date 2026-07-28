import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'skin',     label: 'Skincare' },
  { key: 'hair',     label: 'Haircare' },
  { key: 'perfumes', label: 'Perfumes' },
];

export default function Navbar({ active, onFilter }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerText, setBannerText] = useState('Free delivery on orders over Rs 3,000 · Dermatologist-reviewed formulas');
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [useImageLogo, setUseImageLogo] = useState(false);
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getSettings()
      .then(s => {
        if (s.announcement_banner) setBannerText(s.announcement_banner);
        if (s.logo_url) setLogoUrl(s.logo_url);
        if (s.use_image_logo === 'true') setUseImageLogo(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  function handleLogout() { logout(); navigate('/'); }

  function openCartPopup() {
    const w = window.open('/cart-popup', 'dp_cart', 'width=400,height=620,resizable=yes');
    if (!w || w.closed || typeof w.closed === 'undefined') {
      setPopupBlocked(true);
    }
  }

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      {/* Top announcement strip */}
      <div className="nav-strip">
        <span>{bannerText}</span>
      </div>

      <div className="container nav-inner">
        <Link to="/" className="nav-logo">
          {useImageLogo && logoUrl
            ? <img src={logoUrl} alt="Dreamer" className="nav-logo-img" />
            : (<><span className="nav-logo-mark">Dr.</span><span className="nav-logo-name display">Dreamer</span></>)
          }
        </Link>

        {/* Desktop filters */}
        {onFilter && (
          <nav className="nav-pills" role="navigation" aria-label="Categories">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`nav-link ${active === f.key ? 'active' : ''}`}
                onClick={() => onFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </nav>
        )}

        {/* Contact link */}
        <Link to="/contact" className="nav-ghost nav-contact-link">Contact</Link>

        {/* Right actions */}
        <div className="nav-actions">
          {user ? (
            <div className="nav-user">
              <span className="nav-user-name">Hi, {user.name.split(' ')[0]}</span>
              <Link to="/my-orders" className="nav-ghost">Orders</Link>
              <button className="nav-ghost" onClick={handleLogout}>Sign out</button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="nav-ghost">Sign in</Link>
              <Link to="/signup" className="btn btn-outline nav-signup">Sign up</Link>
            </div>
          )}
          <div style={{ position: 'relative' }}>
              <button className="nav-cart" onClick={openCartPopup} aria-label={`Cart (${count} items)`}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {count > 0 && <span className="nav-cart-badge">{count}</span>}
              </button>
              {popupBlocked && (
                <div className="nav-popup-blocked">
                  <p>Popups are blocked.</p>
                  <a href="/cart-popup" className="nav-popup-link">Open cart →</a>
                  <button onClick={() => setPopupBlocked(false)} className="nav-popup-dismiss">✕</button>
                </div>
              )}
            </div>
          <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span className={menuOpen ? 'open' : ''}/><span className={menuOpen ? 'open' : ''}/><span className={menuOpen ? 'open' : ''}/>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="nav-mobile">
          {onFilter && FILTERS.map(f => (
            <button key={f.key} className={`nav-mob-link ${active === f.key ? 'active' : ''}`}
              onClick={() => { onFilter(f.key); setMenuOpen(false); }}>
              {f.label}
            </button>
          ))}
          <div className="nav-mob-divider" />
          {user ? (
            <>
              <Link to="/my-orders" className="nav-mob-link" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <button className="nav-mob-link" onClick={() => { handleLogout(); setMenuOpen(false); }}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/contact" className="nav-mob-link" onClick={() => setMenuOpen(false)}>Contact Us</Link>
              <Link to="/login" className="nav-mob-link" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/signup" className="nav-mob-link" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .nav-strip {
          background: var(--forest);
          color: rgba(255,255,255,0.8);
          text-align: center;
          font-size: 11px;
          letter-spacing: 0.08em;
          padding: 8px 20px;
          font-weight: 500;
        }
        .nav {
          position: sticky; top: 0; z-index: 40;
          background: rgba(253, 252, 250, 0.92);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid transparent;
          transition: background .3s ease, border-color .3s ease, box-shadow .3s ease;
        }
        .nav-scrolled {
          background: rgba(253,252,250,.97);
          border-bottom-color: var(--border);
          box-shadow: 0 1px 16px rgba(27,58,45,.06);
        }
        .nav-inner {
          display: flex; align-items: center; justify-content: space-between;
          height: 64px; gap: 24px;
        }
        .nav-logo {
          display: flex; align-items: baseline; gap: 4px;
          flex-shrink: 0; text-decoration: none;
          transition: opacity .18s;
        }
        .nav-logo:hover { opacity: .75; }
        .nav-logo-img { height: 36px; width: auto; object-fit: contain; display: block; }
        .nav-logo-mark {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600;
          color: var(--sage); letter-spacing: 0.05em;
        }
        .nav-logo-name {
          font-size: 20px; font-weight: 500;
          color: var(--forest); letter-spacing: -0.02em;
        }

        .nav-pills {
          display: flex; gap: 0;
        }
        .nav-link {
          background: none; border: none; font-size: 12px;
          font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--ink-soft); padding: 8px 16px; border-radius: 4px;
          transition: color .18s, background .18s; white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-link:hover { color: var(--forest); background: var(--sage-pale); }
        .nav-link.active { color: var(--forest); background: var(--sage-pale); font-weight: 600; }

        .nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .nav-user, .nav-auth { display: flex; align-items: center; gap: 6px; }
        .nav-user-name { font-size: 12px; font-weight: 500; color: var(--ink-soft); }
        .nav-ghost {
          background: none; border: none; font-size: 12px; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--ink-soft); cursor: pointer; padding: 7px 12px;
          border-radius: 4px; transition: color .18s, background .18s;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-ghost:hover { color: var(--forest); background: var(--sage-pale); }
        .nav-signup { font-size: 11px; padding: 8px 16px; }

        .nav-cart {
          position: relative; background: none; border: none;
          color: var(--ink); cursor: pointer; padding: 8px;
          border-radius: 6px; transition: background .18s;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-cart:hover { background: var(--sage-pale); color: var(--forest); }
        .nav-cart-badge {
          position: absolute; top: 2px; right: 2px;
          background: var(--forest); color: #fff;
          font-size: 9px; font-weight: 700;
          min-width: 16px; height: 16px; border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif; padding: 0 4px;
        }

        .nav-hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; padding: 8px; cursor: pointer;
        }
        .nav-hamburger span {
          display: block; width: 20px; height: 1.5px;
          background: var(--ink); border-radius: 2px;
          transition: transform .22s ease, opacity .22s ease;
        }

        .nav-mobile {
          display: flex; flex-direction: column;
          background: #fff; border-top: 1px solid var(--border);
          padding: 10px 16px 20px; gap: 2px;
        }
        .nav-mob-link {
          background: none; border: none; font-size: 14px; font-weight: 500;
          color: var(--ink-soft); padding: 12px 14px; text-align: left;
          border-radius: 6px; cursor: pointer; font-family: inherit;
          text-decoration: none; display: block;
          transition: background .18s, color .18s;
          letter-spacing: 0.05em; text-transform: uppercase; font-size: 12px;
        }
        .nav-mob-link:hover, .nav-mob-link.active { color: var(--forest); background: var(--sage-pale); }
        .nav-mob-divider { border: none; border-top: 1px solid var(--border); margin: 8px 0; }

        .nav-popup-blocked {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #fff; border: 1px solid var(--border); border-radius: 10px;
          padding: 10px 14px; white-space: nowrap; z-index: 100;
          box-shadow: 0 4px 16px rgba(0,0,0,.12);
          display: flex; align-items: center; gap: 10px;
        }
        .nav-popup-blocked p { font-size: 12px; color: var(--ink-soft); margin: 0; }
        .nav-popup-link { font-size: 12px; font-weight: 600; color: var(--forest); text-decoration: none; }
        .nav-popup-dismiss { background: none; border: none; font-size: 14px; cursor: pointer; color: var(--ink-soft); padding: 0 2px; }

        @media (max-width: 768px) {
          .nav-strip { display: none; }
          .nav-pills { display: none; }
          .nav-contact-link { display: none; }
          .nav-auth .nav-signup { display: none; }
          .nav-user-name { display: none; }
          .nav-hamburger { display: flex; }
        }
        @media (min-width: 769px) {
          .nav-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
