import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';

function Stars({ rating, size = 14, interactive = false, onSet }) {
  const r = parseFloat(rating) || 0;
  return (
    <div className="rv-stars" style={{ '--sz': size + 'px' }}>
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          className={`rv-star ${i <= Math.round(r) ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => onSet(i) : undefined}
          tabIndex={interactive ? 0 : -1}
          aria-label={interactive ? `${i} star${i > 1 ? 's' : ''}` : undefined}
        >
          <svg width={size} height={size} viewBox="0 0 24 24"
            fill={i <= Math.round(r) ? 'var(--accent)' : 'none'}
            stroke={i <= Math.round(r) ? 'var(--accent)' : '#D8D8D8'}
            strokeWidth="2">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="rv-bar-row">
      <span className="rv-bar-label">{label}</span>
      <div className="rv-bar-track">
        <div className="rv-bar-fill" style={{ width: pct + '%' }} />
      </div>
      <span className="rv-bar-count">{count}</span>
    </div>
  );
}

function Avatar({ name, color }) {
  const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return <div className="rv-avatar" style={{ background: color }}>{initials}</div>;
}

const COLORS = ['#D9B99B','#7A9E8E','#8BA8B8','#A8B87A','#B87A8A'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
  { value: 'helpful', label: 'Most Helpful' },
];

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [filterStar, setFilterStar] = useState(0);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterPhotos, setFilterPhotos] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [helpfulClicked, setHelpfulClicked] = useState({});

  // Form state
  const [form, setForm] = useState({ customer_name: '', email: '', rating: 0, title: '', body: '' });
  const [formImages, setFormImages] = useState([]);
  const [formPreviews, setFormPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    Promise.all([
      api.getReviews(productId),
      api.getProductRating(productId),
    ]).then(([rv, rt]) => {
      setReviews(rv);
      setRating(rt);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [productId]);

  function sortedFiltered() {
    let list = [...reviews];
    if (filterStar > 0) list = list.filter(r => r.rating === filterStar);
    if (filterVerified) list = list.filter(r => r.verified_purchase);
    if (filterPhotos) list = list.filter(r => r.images && r.images.length > 0);
    list.sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sort === 'highest') return b.rating - a.rating;
      if (sort === 'lowest') return a.rating - b.rating;
      if (sort === 'helpful') return (b.helpful_count || 0) - (a.helpful_count || 0);
      return 0;
    });
    return list;
  }

  async function handleHelpful(id) {
    if (helpfulClicked[id]) return;
    setHelpfulClicked(h => ({ ...h, [id]: true }));
    try {
      const { helpful_count } = await api.markHelpful(id);
      setReviews(rv => rv.map(r => r.id === id ? { ...r, helpful_count } : r));
    } catch {}
  }

  function handleImageSelect(e) {
    const files = Array.from(e.target.files || []).slice(0, 5 - formImages.length);
    setFormImages(prev => [...prev, ...files].slice(0, 5));
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setFormPreviews(prev => [...prev, ev.target.result].slice(0, 5));
      reader.readAsDataURL(f);
    });
  }

  function removeImage(i) {
    setFormImages(prev => prev.filter((_, idx) => idx !== i));
    setFormPreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!form.customer_name.trim()) return setFormError('Please enter your name.');
    if (form.rating === 0) return setFormError('Please select a star rating.');
    if (!form.body.trim() || form.body.trim().length < 10) return setFormError('Review must be at least 10 characters.');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('customer_name', form.customer_name);
      fd.append('email', form.email);
      fd.append('rating', form.rating);
      fd.append('title', form.title);
      fd.append('body', form.body);
      if (productId) fd.append('product_id', productId);
      formImages.forEach(img => fd.append('images', img));
      await api.submitReview(fd);
      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const displayed = sortedFiltered();
  const total = rating?.total || 0;
  const avg = parseFloat(rating?.average) || 0;

  return (
    <section className="rv-section">
      <div className="rv-header">
        <h2 className="display rv-title">Customer Reviews</h2>
      </div>

      {/* Rating overview */}
      {total > 0 && (
        <div className="rv-overview">
          <div className="rv-big-score">
            <span className="rv-avg-num">{avg.toFixed(1)}</span>
            <Stars rating={avg} size={18} />
            <span className="rv-based">Based on {total} review{total !== 1 ? 's' : ''}</span>
          </div>
          <div className="rv-bars">
            {[5,4,3,2,1].map(n => (
              <RatingBar
                key={n}
                label={`${n}★`}
                count={rating?.[['','one','two','three','four','five'][n]] || 0}
                total={total}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filters + sort */}
      {total > 0 && (
        <div className="rv-controls">
          <div className="rv-filters">
            <button className={`rv-filter-btn ${filterStar === 0 && !filterVerified && !filterPhotos ? 'active' : ''}`}
              onClick={() => { setFilterStar(0); setFilterVerified(false); setFilterPhotos(false); }}>
              All
            </button>
            {[5,4,3,2,1].map(n => (
              <button key={n} className={`rv-filter-btn ${filterStar === n ? 'active' : ''}`}
                onClick={() => setFilterStar(filterStar === n ? 0 : n)}>
                {n}★
              </button>
            ))}
            <button className={`rv-filter-btn ${filterVerified ? 'active' : ''}`}
              onClick={() => setFilterVerified(v => !v)}>
              Verified
            </button>
            <button className={`rv-filter-btn ${filterPhotos ? 'active' : ''}`}
              onClick={() => setFilterPhotos(p => !p)}>
              With Photos
            </button>
          </div>
          <select className="rv-sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="rv-loading">
          {[1,2,3].map(i => <div key={i} className="rv-card-skel" />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="rv-empty">
          <p>{total === 0 ? 'No reviews yet — be the first to share your experience!' : 'No reviews match these filters.'}</p>
        </div>
      ) : (
        <div className="rv-list">
          {displayed.map((r, idx) => (
            <div key={r.id} className="rv-card">
              <div className="rv-card-top">
                <Avatar name={r.customer_name} color={COLORS[idx % COLORS.length]} />
                <div className="rv-card-meta">
                  <div className="rv-card-name-row">
                    <span className="rv-card-name">{r.customer_name}</span>
                    {r.verified_purchase && (
                      <span className="rv-verified-badge">✓ Verified Purchase</span>
                    )}
                    {r.is_featured && <span className="rv-featured-badge">★ Featured</span>}
                    {r.is_pinned && <span className="rv-pinned-badge">📌 Pinned</span>}
                  </div>
                  <div className="rv-card-row2">
                    <Stars rating={r.rating} size={13} />
                    <span className="rv-card-date">
                      {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              {r.title && <p className="rv-card-title">"{r.title}"</p>}
              <p className="rv-card-body">{r.body}</p>

              {r.images && r.images.length > 0 && (
                <div className="rv-card-photos">
                  {r.images.map((img, ii) => (
                    <button key={ii} className="rv-photo-thumb" onClick={() => setLightbox(img.image_url)}>
                      <img src={img.image_url} alt="Review photo" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              <div className="rv-card-actions">
                <button
                  className={`rv-helpful-btn ${helpfulClicked[r.id] ? 'clicked' : ''}`}
                  onClick={() => handleHelpful(r.id)}
                  disabled={helpfulClicked[r.id]}
                >
                  👍 Helpful {r.helpful_count > 0 ? `(${r.helpful_count})` : ''}
                </button>
              </div>

              {r.reply && (
                <div className="rv-reply">
                  <span className="rv-reply-brand">Official Dreamer Products Response</span>
                  <p className="rv-reply-text">{r.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CTA + Form */}
      <div className="rv-form-section">
        {submitted ? (
          <div className="rv-submitted">
            <span className="rv-submitted-icon">✓</span>
            <p>Thank you! Your review will appear after our team approves it.</p>
          </div>
        ) : (
          <button
            className="btn btn-outline rv-write-btn"
            onClick={() => setShowForm(s => !s)}
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}

        {showForm && !submitted && (
          <form className="rv-form" onSubmit={handleSubmit}>
            <h3 className="rv-form-title">Share Your Experience</h3>
            {formError && <div className="rv-form-error">{formError}</div>}

            <div className="rv-form-row">
              <div className="field">
                <label>Your Name *</label>
                <input
                  value={form.customer_name}
                  onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                  placeholder="e.g. Sara M."
                  required
                />
              </div>
              <div className="field">
                <label>Email <span style={{ opacity: .5, fontWeight: 400, textTransform: 'none' }}>(optional, hidden)</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="field">
              <label>Rating *</label>
              <Stars rating={form.rating} size={28} interactive onSet={n => setForm(f => ({ ...f, rating: n }))} />
            </div>

            <div className="field">
              <label>Review Title</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Summarise your experience in a few words"
                maxLength={100}
              />
            </div>

            <div className="field">
              <label>Your Review * <span className="rv-char-count">({form.body.length}/1000)</span></label>
              <textarea
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value.slice(0, 1000) }))}
                rows={4}
                placeholder="Tell others about your experience with this product…"
                required
              />
            </div>

            {/* Image upload */}
            <div className="field">
              <label>Photos <span style={{ opacity: .5, fontWeight: 400, textTransform: 'none' }}>(up to 5)</span></label>
              <div
                className="rv-upload-zone"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleImageSelect({ target: { files: e.dataTransfer.files } }); }}
              >
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageSelect} />
                {formPreviews.length > 0 ? (
                  <div className="rv-upload-previews">
                    {formPreviews.map((src, i) => (
                      <div key={i} className="rv-upload-preview">
                        <img src={src} alt="" />
                        <button type="button" className="rv-remove-img" onClick={e => { e.stopPropagation(); removeImage(i); }}>×</button>
                      </div>
                    ))}
                    {formPreviews.length < 5 && <div className="rv-upload-add">+ Add</div>}
                  </div>
                ) : (
                  <div className="rv-upload-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>Drag & drop or click to upload photos</span>
                    <span className="rv-upload-hint">JPG, PNG, WEBP up to 10MB each</span>
                  </div>
                )}
              </div>
            </div>

            <button className="btn btn-primary rv-submit-btn" disabled={submitting}>
              {submitting ? (
                <><span className="rv-spinner" /> Submitting…</>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="rv-lightbox" onClick={() => setLightbox(null)}>
          <button className="rv-lightbox-close" onClick={() => setLightbox(null)}>×</button>
          <img src={lightbox} alt="Review photo" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <style>{`
        .rv-section { padding: 60px 0 0; }
        .rv-header { margin-bottom: 28px; }
        .rv-title { font-size: 32px; }

        /* Stars */
        .rv-stars { display: flex; align-items: center; gap: 2px; }
        .rv-star { background: none; border: none; padding: 0; line-height: 1; cursor: default; }
        .rv-star.interactive { cursor: pointer; transition: transform .12s; }
        .rv-star.interactive:hover { transform: scale(1.2); }

        /* Overview */
        .rv-overview {
          display: flex; gap: 40px; align-items: flex-start;
          background: #fff; border: 1px solid var(--border);
          border-radius: var(--radius); padding: 28px 32px;
          margin-bottom: 24px;
        }
        .rv-big-score {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          min-width: 100px;
        }
        .rv-avg-num {
          font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 600;
          color: var(--ink); line-height: 1;
        }
        .rv-based { font-size: 11px; color: var(--ink-soft); text-align: center; }
        .rv-bars { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .rv-bar-row { display: flex; align-items: center; gap: 10px; }
        .rv-bar-label { font-size: 11px; color: var(--ink-soft); width: 20px; text-align: right; flex-shrink: 0; }
        .rv-bar-track { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
        .rv-bar-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width .6s var(--ease-out); }
        .rv-bar-count { font-size: 11px; color: var(--ink-muted); width: 20px; }

        /* Controls */
        .rv-controls {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 24px;
        }
        .rv-filters { display: flex; flex-wrap: wrap; gap: 6px; }
        .rv-filter-btn {
          background: #fff; border: 1.5px solid var(--border);
          border-radius: 999px; padding: 5px 14px;
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500;
          color: var(--ink-soft); cursor: pointer;
          transition: all .15s;
        }
        .rv-filter-btn:hover { border-color: var(--ink); color: var(--ink); }
        .rv-filter-btn.active { background: var(--ink); border-color: var(--ink); color: #fff; }
        .rv-sort-select {
          border: 1.5px solid var(--border); border-radius: 8px;
          padding: 6px 12px; font-family: 'Inter', sans-serif;
          font-size: 12px; color: var(--ink); background: #fff;
          cursor: pointer;
        }

        /* Review cards */
        .rv-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
        .rv-card {
          background: #fff; border: 1px solid var(--border);
          border-radius: var(--radius); padding: 24px;
          transition: box-shadow .2s;
        }
        .rv-card:hover { box-shadow: var(--shadow-sm); }
        .rv-card-top { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 14px; }
        .rv-avatar {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; color: #fff;
        }
        .rv-card-meta { flex: 1; min-width: 0; }
        .rv-card-name-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 4px; }
        .rv-card-name { font-size: 14px; font-weight: 600; color: var(--ink); }
        .rv-verified-badge {
          font-size: 10px; font-weight: 600; color: #4A8C6A;
          background: #EEF7F2; padding: 2px 8px; border-radius: 3px; letter-spacing: .03em;
        }
        .rv-featured-badge {
          font-size: 10px; font-weight: 600; color: #B8890A;
          background: #FEF7E6; padding: 2px 8px; border-radius: 3px;
        }
        .rv-pinned-badge {
          font-size: 10px; color: var(--ink-soft);
          background: var(--border); padding: 2px 8px; border-radius: 3px;
        }
        .rv-card-row2 { display: flex; align-items: center; gap: 12px; }
        .rv-card-date { font-size: 11px; color: var(--ink-muted); }
        .rv-card-title {
          font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 500;
          font-style: italic; color: var(--ink); margin: 0 0 8px;
        }
        .rv-card-body { font-size: 14px; line-height: 1.7; color: var(--ink-soft); margin: 0 0 12px; }

        /* Photos */
        .rv-card-photos { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .rv-photo-thumb {
          width: 72px; height: 72px; border-radius: 8px; overflow: hidden;
          border: 1.5px solid var(--border); padding: 0; cursor: pointer;
          transition: border-color .15s;
        }
        .rv-photo-thumb:hover { border-color: var(--accent); }
        .rv-photo-thumb img { width: 100%; height: 100%; object-fit: cover; }

        /* Actions */
        .rv-card-actions { display: flex; gap: 8px; margin-bottom: 0; }
        .rv-helpful-btn {
          background: none; border: 1.5px solid var(--border);
          border-radius: 999px; padding: 4px 12px;
          font-family: 'Inter', sans-serif; font-size: 11px; color: var(--ink-soft);
          cursor: pointer; transition: all .15s;
        }
        .rv-helpful-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--ink); }
        .rv-helpful-btn.clicked { background: #FEF7F0; border-color: var(--accent); color: var(--accent-dark); cursor: default; }

        /* Reply */
        .rv-reply {
          margin-top: 14px; padding: 14px 16px;
          background: #FAF8F5; border-left: 2px solid var(--accent);
          border-radius: 0 8px 8px 0;
        }
        .rv-reply-brand {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .1em; color: var(--accent-dark); display: block; margin-bottom: 6px;
        }
        .rv-reply-text { font-size: 13px; color: var(--ink); margin: 0; line-height: 1.65; }

        /* Loading */
        .rv-loading { display: flex; flex-direction: column; gap: 14px; margin-bottom: 32px; }
        .rv-card-skel {
          height: 120px; border-radius: var(--radius);
          background: linear-gradient(90deg, #F5F3F0 25%, #EDEAE6 50%, #F5F3F0 75%);
          background-size: 200% 100%; animation: shimmer 1.4s infinite;
        }
        .rv-empty { text-align: center; padding: 32px 0; color: var(--ink-soft); font-size: 14px; margin-bottom: 24px; }

        /* Form CTA */
        .rv-form-section { padding-top: 8px; border-top: 1px solid var(--border); margin-top: 8px; padding-top: 32px; }
        .rv-write-btn { margin-bottom: 24px; }
        .rv-submitted {
          display: flex; align-items: center; gap: 12px;
          background: #EEF7F2; border: 1px solid #C3E2CE;
          border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;
          color: #2E7D52;
        }
        .rv-submitted-icon { font-size: 18px; font-weight: 700; }

        /* Review form */
        .rv-form {
          background: #fff; border: 1px solid var(--border);
          border-radius: var(--radius); padding: 32px;
          animation: fadeInUp .35s var(--ease-out) both;
        }
        .rv-form-title {
          font-size: 22px; margin-bottom: 24px;
        }
        .rv-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .rv-form-error {
          background: #FEE8E8; color: #9B2020; border-radius: 6px;
          font-size: 13px; padding: 10px 14px; margin-bottom: 18px;
        }
        .rv-char-count { color: var(--ink-muted); font-weight: 400; font-size: 10px; }

        /* Upload zone */
        .rv-upload-zone {
          border: 2px dashed var(--border); border-radius: 10px;
          padding: 20px; cursor: pointer; transition: border-color .2s;
          min-height: 100px;
        }
        .rv-upload-zone:hover { border-color: var(--accent); }
        .rv-upload-placeholder {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          color: var(--ink-soft);
        }
        .rv-upload-placeholder svg { color: var(--ink-muted); }
        .rv-upload-placeholder span { font-size: 13px; }
        .rv-upload-hint { font-size: 11px; color: var(--ink-muted); }
        .rv-upload-previews { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .rv-upload-preview { position: relative; width: 72px; height: 72px; border-radius: 8px; overflow: hidden; }
        .rv-upload-preview img { width: 100%; height: 100%; object-fit: cover; }
        .rv-remove-img {
          position: absolute; top: 2px; right: 2px;
          background: rgba(0,0,0,0.55); color: #fff; border: none;
          border-radius: 50%; width: 18px; height: 18px; font-size: 12px;
          line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .rv-upload-add {
          width: 72px; height: 72px; border-radius: 8px;
          border: 2px dashed var(--border); display: flex; align-items: center;
          justify-content: center; font-size: 13px; color: var(--ink-muted);
          cursor: pointer;
        }

        .rv-submit-btn { margin-top: 8px; width: 100%; }
        .rv-spinner {
          display: inline-block; width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,.35); border-top-color: #fff;
          animation: spin .7s linear infinite; margin-right: 6px;
        }

        /* Lightbox */
        .rv-lightbox {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          display: flex; align-items: center; justify-content: center;
          z-index: 999; cursor: pointer;
          animation: fadeIn .2s ease;
        }
        .rv-lightbox img {
          max-width: 90vw; max-height: 90vh; border-radius: 8px;
          object-fit: contain; cursor: default;
          box-shadow: 0 24px 64px rgba(0,0,0,.5);
        }
        .rv-lightbox-close {
          position: absolute; top: 20px; right: 24px;
          background: rgba(255,255,255,.15); border: none; color: #fff;
          font-size: 28px; width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .15s;
        }
        .rv-lightbox-close:hover { background: rgba(255,255,255,.25); }

        @media (max-width: 640px) {
          .rv-overview { flex-direction: column; gap: 24px; padding: 20px; }
          .rv-big-score { flex-direction: row; min-width: unset; gap: 12px; }
          .rv-avg-num { font-size: 36px; }
          .rv-form { padding: 20px 16px; }
          .rv-form-row { grid-template-columns: 1fr; }
          .rv-controls { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </section>
  );
}
