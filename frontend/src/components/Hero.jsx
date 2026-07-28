import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const DEFAULTS = {
  hero_eyebrow: 'SKIN · HAIR · PERFUMES',
  hero_title: 'Clinical care,\nbeautifully\ncrafted.',
  hero_subtitle: 'Dermatologist-reviewed formulas for skin and hair, made with pure botanicals and backed by science.',
  hero_cta_primary: 'Shop Now',
  hero_cta_secondary: 'Our Collections',
  trust_1: 'Dermatologist Reviewed',
  trust_2: 'No Harmful Chemicals',
  trust_3: 'Fast Delivery',
  trust_4: 'Customer Satisfaction',
  badge_1_title: 'Dreamer Products',
  badge_1_sub: 'Pure Botanical',
  badge_2_title: 'Dermatologist',
  badge_2_sub: 'Reviewed',
};

export default function Hero() {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    api.getSettings().then(s => setSettings({ ...DEFAULTS, ...s })).catch(() => {});
  }, []);

  const titleLines = settings.hero_title.split('\n');
  const heroImg = settings.hero_image || '/hero-image.jpg';

  return (
    <section className="hero">
      <div className="container hero-grid">
        {/* Left */}
        <div className="hero-left">
          <div className="hero-rx animate-in">
            <span className="rx-dot" />
            <span>Dreamer Products</span>
          </div>
          <p className="eyebrow animate-in delay-1">{settings.hero_eyebrow}</p>
          <h1 className="display hero-title animate-in delay-1">
            {titleLines.map((line, i) => (
              <span key={i}>
                {i === 1 ? <em>{line}</em> : line}
                {i < titleLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="hero-sub animate-in delay-2">{settings.hero_subtitle}</p>
          <div className="hero-ctas animate-in delay-3">
            <a href="#shop" className="btn btn-primary">{settings.hero_cta_primary} →</a>
            <a href="#categories" className="btn btn-outline">{settings.hero_cta_secondary}</a>
          </div>

          <div className="hero-creds animate-in delay-4">
            <div className="cred">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <span>Clinically tested</span>
            </div>
            <div className="cred">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>No parabens or sulphates</span>
            </div>
            <div className="cred">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              <span>Cruelty-free</span>
            </div>
          </div>
        </div>

        {/* Right – image */}
        <div className="hero-right animate-in delay-2">
          <div className="hero-img-frame">
            <img src={heroImg} alt="Dreamer Products skincare" />
            {/* Badges sit inside the frame, no negative overflow */}
            <div className="hero-img-badge badge-tl">
              <span className="badge-icon">✦</span>
              <div>
                <p className="badge-title">{settings.badge_1_title}</p>
                <p className="badge-sub">{settings.badge_1_sub}</p>
              </div>
            </div>
            <div className="hero-img-badge badge-br">
              <span className="badge-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </span>
              <div>
                <p className="badge-title">{settings.badge_2_title}</p>
                <p className="badge-sub">{settings.badge_2_sub}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="trust-bar">
        <div className="container trust-inner">
          {[settings.trust_1, settings.trust_2, settings.trust_3, settings.trust_4].filter(Boolean).map((l, i) => (
            <div key={i} className="trust-item">
              <span className="trust-mark">—</span>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .hero {
          background: var(--bg);
          padding: 80px 0 0;
          overflow: hidden;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
          padding-bottom: 80px;
        }
        .hero-left { max-width: 520px; }

        .hero-rx {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(217,185,155,0.12); border: 1px solid rgba(217,185,155,0.4);
          border-radius: 4px; padding: 5px 12px;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--accent-dark);
          margin-bottom: 18px;
        }
        .rx-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--accent); flex-shrink: 0;
        }

        .hero-title {
          font-size: 56px;
          line-height: 1.05;
          margin-bottom: 22px;
          color: var(--ink);
        }
        .hero-title em {
          font-style: italic;
          color: var(--accent-dark);
        }
        .hero-sub {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          line-height: 1.7;
          color: var(--ink-soft);
          margin-bottom: 36px;
          max-width: 420px;
        }
        .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 36px; }

        .hero-creds {
          display: flex; flex-direction: column; gap: 10px;
          padding-top: 26px;
          border-top: 1px solid var(--border);
        }
        .cred {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 12.5px; color: var(--ink-soft); font-weight: 500;
        }
        .cred svg { color: var(--accent-dark); flex-shrink: 0; }

        /* Image */
        .hero-right { position: relative; }
        .hero-img-frame {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
        }
        .hero-img-frame img {
          width: 100%;
          border-radius: 4px;
          aspect-ratio: 4/5;
          object-fit: cover;
          box-shadow: var(--shadow-lg);
          display: block;
        }
        .hero-img-badge {
          position: absolute;
          background: rgba(255,255,255,0.95);
          border-radius: 10px;
          padding: 10px 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          display: flex; align-items: center; gap: 10px;
          z-index: 2;
          border: 1px solid rgba(255,255,255,0.8);
          backdrop-filter: blur(8px);
        }
        .badge-tl { top: 24px; left: 16px; }
        .badge-br { bottom: 32px; right: 16px; }
        .badge-icon {
          font-size: 14px; color: var(--accent);
          display: flex; align-items: center;
        }
        .badge-title {
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 700; color: var(--ink); margin: 0;
        }
        .badge-sub {
          font-family: 'Inter', sans-serif;
          font-size: 10px; color: var(--ink-soft); margin: 0;
        }

        /* Trust bar */
        .trust-bar {
          background: var(--ink);
        }
        .trust-inner {
          display: flex; align-items: center; justify-content: center;
          flex-wrap: wrap; padding: 14px 32px; gap: 0;
        }
        .trust-item {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.6);
          padding: 8px 24px;
          border-right: 1px solid rgba(255,255,255,0.1);
          white-space: nowrap;
        }
        .trust-item:last-child { border-right: none; }
        .trust-mark { color: var(--accent); font-size: 8px; }

        @media (max-width: 960px) {
          .hero { padding-top: 48px; }
          .hero-grid { grid-template-columns: 1fr; gap: 0; padding-bottom: 0; }
          .hero-right { display: none; }
          .hero-title { font-size: 38px; }
          .hero-left { max-width: 100%; padding-bottom: 52px; }
        }
        @media (max-width: 480px) {
          .hero { padding-top: 32px; }
          .hero-title { font-size: 28px; }
          .hero-sub { font-size: 14px; margin-bottom: 22px; }
          .hero-left { padding-bottom: 36px; }
          .hero-ctas { flex-direction: column; align-items: stretch; }
          .hero-ctas .btn { justify-content: center; }
          .trust-item { padding: 8px 10px; font-size: 9px; white-space: normal; text-align: center; }
          .trust-inner { gap: 0; }
          .trust-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.1); }
          .trust-item:last-child { border-bottom: none; }
        }
      `}</style>
    </section>
  );
}
