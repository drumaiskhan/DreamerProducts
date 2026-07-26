import { useEffect, useState } from 'react';
import { useInView } from '../lib/useInView';
import { api } from '../lib/api';

const DEFAULTS = {
  skin:     '/cat-skin.jpg',
  hair:     '/cat-hair.jpg',
  perfumes: '/cat-perfumes.jpg',
};

const TAGLINE_DEFAULTS = {
  cat_tagline_skin:     'Clinically proven glow',
  cat_tagline_hair:     'Nourish every strand',
  cat_tagline_perfumes: 'Wear your signature',
  cat_label_skin:       'Skincare',
  cat_label_hair:       'Haircare',
  cat_label_perfumes:   'Perfumes',
};

const META = [
  { key: 'skin',     settingKey: 'cat_img_skin'     },
  { key: 'hair',     settingKey: 'cat_img_hair'     },
  { key: 'perfumes', settingKey: 'cat_img_perfumes' },
];

export default function CategoryShowcase({ onFilter }) {
  const [ref, inView] = useInView();
  const [images, setImages] = useState(DEFAULTS);
  const [texts, setTexts] = useState(TAGLINE_DEFAULTS);

  useEffect(() => {
    api.getSettings().then(s => {
      setImages({
        skin:     s.cat_img_skin     || DEFAULTS.skin,
        hair:     s.cat_img_hair     || DEFAULTS.hair,
        perfumes: s.cat_img_perfumes || DEFAULTS.perfumes,
      });
      setTexts({
        cat_tagline_skin:     s.cat_tagline_skin     || TAGLINE_DEFAULTS.cat_tagline_skin,
        cat_tagline_hair:     s.cat_tagline_hair     || TAGLINE_DEFAULTS.cat_tagline_hair,
        cat_tagline_perfumes: s.cat_tagline_perfumes || TAGLINE_DEFAULTS.cat_tagline_perfumes,
        cat_label_skin:       s.cat_label_skin       || TAGLINE_DEFAULTS.cat_label_skin,
        cat_label_hair:       s.cat_label_hair       || TAGLINE_DEFAULTS.cat_label_hair,
        cat_label_perfumes:   s.cat_label_perfumes   || TAGLINE_DEFAULTS.cat_label_perfumes,
      });
    }).catch(() => {});
  }, []);

  return (
    <section className="cats-section" id="categories" ref={ref}>
      <div className="container">
        <div className={`cats-header ${inView ? 'visible' : ''}`}>
          <p className="eyebrow">Collections</p>
          <h2 className="display cats-title">Shop by Category</h2>
          <p className="cats-subtitle">Each formula is crafted with purpose — clean ingredients, visible results.</p>
        </div>
        <div className="cats-grid">
          {META.map((cat, i) => {
            const label   = texts[`cat_label_${cat.key}`];
            const tagline = texts[`cat_tagline_${cat.key}`];
            return (
            <button
              key={cat.key}
              className={`cat-card ${inView ? 'visible' : ''}`}
              style={{ animationDelay: `${0.08 + i * 0.13}s` }}
              onClick={() => onFilter(cat.key)}
              aria-label={`Browse ${label}`}
            >
              <div className="cat-img-wrap">
                <img src={images[cat.key]} alt={label} loading="lazy" />
                <div className="cat-overlay" />
              </div>
              <div className="cat-content">
                <p className="cat-tagline">{tagline}</p>
                <h3 className="display cat-label">{label}</h3>
                <span className="cat-cta">
                  Explore
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </span>
              </div>
            </button>
            );
          })}
        </div>
      </div>

      <style>{`
        .cats-section { padding: 100px 0; background: var(--warm-white); }
        .cats-header {
          text-align: center; margin-bottom: 52px;
          opacity: 0; transform: translateY(18px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .cats-header.visible { opacity: 1; transform: translateY(0); }
        .cats-title { font-size: 40px; margin-bottom: 14px; }
        .cats-subtitle { font-size: 15px; color: var(--ink-soft); margin: 0; }

        .cats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .cat-card {
          position: relative; border-radius: 4px; overflow: hidden;
          border: none; padding: 0; cursor: pointer; aspect-ratio: 3 / 4;
          background: var(--sage-pale);
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.65s ease, transform 0.65s ease, box-shadow 0.3s ease;
          text-align: left;
        }
        .cat-card.visible { opacity: 1; transform: translateY(0); }
        .cat-card:hover { box-shadow: var(--shadow-lg); }
        .cat-img-wrap { position: absolute; inset: 0; }
        .cat-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.6s ease;
        }
        .cat-card:hover .cat-img-wrap img { transform: scale(1.06); }
        .cat-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(27,58,45,0.82) 0%, rgba(27,58,45,0.1) 50%, transparent 100%);
          transition: background 0.3s ease;
        }
        .cat-card:hover .cat-overlay {
          background: linear-gradient(to top, rgba(27,58,45,0.88) 0%, rgba(27,58,45,0.18) 55%, transparent 100%);
        }
        .cat-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 28px 26px; z-index: 1; color: #fff; }
        .cat-tagline {
          font-size: 10px; font-weight: 500; letter-spacing: 0.18em;
          opacity: 0.65; margin: 0 0 8px; text-transform: uppercase;
        }
        .cat-label { font-size: 28px; color: #fff; margin-bottom: 14px; }
        .cat-cta {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
          opacity: 0; transform: translateY(6px);
          transition: opacity 0.28s ease, transform 0.28s ease;
          color: rgba(255,255,255,0.9);
          border-bottom: 1px solid rgba(255,255,255,0.35); padding-bottom: 2px;
        }
        .cat-card:hover .cat-cta { opacity: 1; transform: translateY(0); }

        @media (max-width: 768px) {
          .cats-section { padding: 64px 0; }
          .cats-title { font-size: 30px; }
          .cats-grid { grid-template-columns: 1fr; gap: 14px; }
          .cat-card { aspect-ratio: 16 / 7; }
          .cat-cta { opacity: 1; transform: translateY(0); }
          .cat-content { padding: 20px 18px; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .cats-grid { gap: 14px; }
        }
      `}</style>
    </section>
  );
}
