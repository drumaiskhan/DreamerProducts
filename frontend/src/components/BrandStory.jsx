import { useEffect, useState } from 'react';
import { useInView } from '../lib/useInView';
import { api } from '../lib/api';

const DEFAULTS = {
  brand_title:      'Made with intention,\nbacked by science.',
  brand_rx_badge:   'Dermatologist-reviewed formulas',
  brand_body_1:     'Dreamer Products was born from a simple belief — that your skin and hair deserve the very best, without compromise. Every formula we make is thoughtfully crafted using pure botanicals, clinically verified for safety and efficacy, and free from harmful chemicals.',
  brand_body_2:     'From rich moisturisers that restore your natural glow, to silky hair serums that nourish at the root — each product is a precise ritual designed to fit into your everyday life.',
  brand_badge_num:  '100%',
  brand_badge_text: 'Natural\nIngredients',
  brand_stat_1_num:   '3+',
  brand_stat_1_label: 'Product Lines',
  brand_stat_2_num:   '100%',
  brand_stat_2_label: 'Natural Base',
  brand_stat_3_num:   '0',
  brand_stat_3_label: 'Harmful Chemicals',
};

export default function BrandStory() {
  const [ref, inView] = useInView();
  const [s, setS] = useState(DEFAULTS);

  useEffect(() => {
    api.getSettings()
      .then(data => setS({ ...DEFAULTS, ...data }))
      .catch(() => {});
  }, []);

  const brandImg = s.brand_image || '/brand-story.jpg';
  const titleLines = s.brand_title.split('\n');
  const badgeLines = s.brand_badge_text.split('\n');

  const stats = [
    { num: s.brand_stat_1_num, label: s.brand_stat_1_label },
    { num: s.brand_stat_2_num, label: s.brand_stat_2_label },
    { num: s.brand_stat_3_num, label: s.brand_stat_3_label },
  ];

  return (
    <section className="brand-section" ref={ref}>
      <div className="container brand-inner">
        <div className={`brand-image-wrap ${inView ? 'visible' : ''}`}>
          <img src={brandImg} alt="Dreamer Products natural ingredients" loading="lazy" />
          <div className="brand-img-badge">
            <span className="brand-badge-num display">{s.brand_badge_num}</span>
            <span className="brand-badge-text">
              {badgeLines.map((l, i) => <span key={i}>{l}{i < badgeLines.length - 1 && <br />}</span>)}
            </span>
          </div>
        </div>

        <div className={`brand-text ${inView ? 'visible' : ''}`}>
          <p className="eyebrow">Our Story</p>
          <h2 className="display brand-title">
            {titleLines.map((line, i) => (
              <span key={i}>{line}{i < titleLines.length - 1 && <br />}</span>
            ))}
          </h2>
          <div className="brand-rx-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span>{s.brand_rx_badge}</span>
          </div>
          {s.brand_body_1 && <p className="brand-body">{s.brand_body_1}</p>}
          {s.brand_body_2 && <p className="brand-body">{s.brand_body_2}</p>}
          <div className="brand-stats">
            {stats.map((st) => (
              <div key={st.label} className="brand-stat">
                <span className="brand-stat-num display">{st.num}</span>
                <span className="brand-stat-label">{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .brand-section { padding: 110px 0; background: var(--cream); overflow: hidden; }
        .brand-inner {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
        }
        .brand-image-wrap {
          position: relative;
          opacity: 0; transform: translateX(-24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .brand-image-wrap.visible { opacity: 1; transform: translateX(0); }
        .brand-image-wrap img {
          width: 100%; border-radius: 4px;
          aspect-ratio: 4/5; object-fit: cover;
          box-shadow: var(--shadow-lg); display: block;
        }
        .brand-img-badge {
          position: absolute; bottom: 28px; right: -24px;
          background: var(--forest); border-radius: 6px;
          padding: 18px 22px; box-shadow: var(--shadow);
          display: flex; flex-direction: column;
          align-items: center; text-align: center; gap: 4px;
        }
        .brand-badge-num { font-size: 32px; font-weight: 500; color: #fff; line-height: 1; }
        .brand-badge-text {
          font-size: 10px; font-weight: 600;
          color: var(--sage-light); text-transform: uppercase;
          letter-spacing: 0.08em; line-height: 1.5;
        }
        .brand-text {
          opacity: 0; transform: translateX(24px);
          transition: opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s;
        }
        .brand-text.visible { opacity: 1; transform: translateX(0); }
        .brand-title { font-size: 38px; line-height: 1.18; margin-bottom: 20px; }
        .brand-rx-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--sage-pale); border: 1px solid var(--border);
          border-radius: 4px; padding: 7px 14px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
          color: var(--forest); margin-bottom: 22px;
        }
        .brand-rx-badge svg { color: var(--sage); }
        .brand-body { font-size: 15px; line-height: 1.8; color: var(--ink-soft); margin: 0 0 16px; }
        .brand-stats {
          display: flex; gap: 36px; margin-top: 36px;
          padding-top: 32px; border-top: 1px solid var(--border);
        }
        .brand-stat { display: flex; flex-direction: column; gap: 5px; }
        .brand-stat-num { font-size: 32px; color: var(--forest); line-height: 1; }
        .brand-stat-label {
          font-size: 10px; font-weight: 600;
          color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.1em;
        }
        @media (max-width: 900px) {
          .brand-section { padding: 72px 0; }
          .brand-inner { grid-template-columns: 1fr; gap: 44px; }
          .brand-image-wrap { transform: none; }
          .brand-text { transform: none; }
          .brand-img-badge { right: 16px; bottom: 16px; }
          .brand-title { font-size: 30px; }
        }
        @media (max-width: 480px) {
          .brand-section { padding: 56px 0; }
          .brand-title { font-size: 26px; }
          .brand-stats { gap: 20px; flex-wrap: wrap; }
          .brand-stat-num { font-size: 26px; }
          .brand-img-badge { padding: 12px 16px; }
          .brand-badge-num { font-size: 24px; }
        }
      `}</style>
    </section>
  );
}
