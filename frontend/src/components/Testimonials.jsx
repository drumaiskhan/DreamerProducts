import { useEffect, useState } from 'react';
import { useInView } from '../lib/useInView';
import { api } from '../lib/api';

function Stars({ count }) {
  return (
    <div className="stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i < count ? '#D9B99B' : 'none'}
          stroke={i < count ? '#D9B99B' : '#D8D8D8'}
          strokeWidth="2">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
    </div>
  );
}

const AVATAR_COLORS = ['#D9B99B','#7A9E8E','#8BA8B8','#A8B87A','#B87A8A'];

function initials(name) {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Testimonials() {
  const [ref, inView] = useInView();
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_name: '', email: '', rating: 5, body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getReviews().then(setReviews).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      await api.submitReview({ ...form, rating: parseInt(form.rating) });
      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="testi-section" ref={ref}>
      <div className="container">
        <div className={`testi-header ${inView ? 'visible' : ''}`}>
          <p className="eyebrow">Customer Reviews</p>
          <h2 className="display testi-title">What Our Customers Say</h2>
          <p className="testi-intro">Real results, real stories. Every review is verified and approved by our team.</p>
        </div>

        {reviews.length > 0 ? (
          <div className="testi-grid">
            {reviews.map((r, i) => (
              <div
                key={r.id}
                className={`testi-card ${inView ? 'visible' : ''}`}
                style={{ transitionDelay: `${0.08 + i * 0.1}s` }}
              >
                <Stars count={r.rating} />
                <p className="testi-text">"{r.body}"</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {initials(r.customer_name)}
                  </div>
                  <div>
                    <p className="testi-name">{r.customer_name}</p>
                    <p className="testi-location">
                      {new Date(r.created_at).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {r.reply && (
                  <div className="testi-reply">
                    <span className="testi-reply-label">Official Dreamer Products Response</span>
                    <p className="testi-reply-text">{r.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="testi-empty">No reviews yet — be the first to share your experience!</p>
        )}

        <div className="testi-cta-row">
          {submitted ? (
            <p className="testi-thanks">— Thank you. Your review will appear after approval.</p>
          ) : (
            <button className="btn btn-outline" onClick={() => setShowForm(s => !s)}>
              {showForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
        </div>

        {showForm && !submitted && (
          <form className="testi-form" onSubmit={handleSubmit}>
            {error && <p className="testi-form-error">{error}</p>}
            <div className="testi-form-row">
              <div className="field">
                <label>Your name *</label>
                <input value={form.customer_name} onChange={set('customer_name')} required placeholder="e.g. Sara M." />
              </div>
              <div className="field">
                <label>Email <span style={{opacity:.5,fontWeight:400,textTransform:'none'}}>(optional)</span></label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
              </div>
            </div>
            <div className="field">
              <label>Rating *</label>
              <div className="testi-star-picker">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n} type="button"
                    className={`star-pick ${form.rating >= n ? 'on' : ''}`}
                    onClick={() => setForm(f => ({ ...f, rating: n }))}
                  >★</button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Your review *</label>
              <textarea value={form.body} onChange={set('body')} required rows={3} placeholder="Share your experience with Dreamer Products…" />
            </div>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .testi-section { padding: 96px 0; background: var(--card); }
        .testi-header {
          text-align: center; margin-bottom: 52px;
          opacity: 0; transform: translateY(18px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .testi-header.visible { opacity: 1; transform: translateY(0); }
        .testi-title { font-size: 38px; margin-bottom: 12px; }
        .testi-intro { font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink-soft); margin: 0; }

        .testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .testi-card {
          background: var(--bg); border-radius: var(--radius); padding: 26px 24px;
          border: 1px solid var(--border);
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.25s ease;
        }
        .testi-card.visible { opacity: 1; transform: translateY(0); }
        .testi-card:hover { box-shadow: var(--shadow-sm); }

        .stars { margin-bottom: 14px; display: flex; gap: 2px; }

        .testi-text {
          font-family: 'Playfair Display', serif;
          font-size: 16px; line-height: 1.65; color: var(--ink);
          margin: 0 0 20px; font-style: italic; font-weight: 500;
        }
        .testi-author { display: flex; align-items: center; gap: 12px; }
        .testi-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .testi-name { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; margin: 0 0 2px; color: var(--ink); }
        .testi-location { font-family: 'Inter', sans-serif; font-size: 11px; color: var(--ink-muted); margin: 0; }

        .testi-reply {
          margin-top: 16px; padding: 12px 14px;
          background: rgba(217,185,155,0.1);
          border-left: 2px solid var(--accent);
          border-radius: 0 6px 6px 0;
        }
        .testi-reply-label {
          font-family: 'Inter', sans-serif;
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--accent-dark); display: block; margin-bottom: 5px;
        }
        .testi-reply-text { font-family: 'Inter', sans-serif; font-size: 12.5px; color: var(--ink); margin: 0; line-height: 1.6; }

        .testi-empty { text-align: center; font-family: 'Inter', sans-serif; color: var(--ink-soft); font-size: 14px; margin: 0 0 32px; }
        .testi-cta-row { text-align: center; margin-top: 44px; }
        .testi-thanks { font-family: 'Inter', sans-serif; color: #4A8C6A; font-weight: 500; font-size: 14px; font-style: italic; }

        .testi-form {
          max-width: 580px; margin: 36px auto 0;
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 32px;
        }
        .testi-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .testi-form-error {
          background: #FEE8E8; color: #9B2020;
          font-family: 'Inter', sans-serif; font-size: 13px; padding: 10px 14px;
          border-radius: 6px; margin-bottom: 16px;
        }
        .testi-star-picker { display: flex; gap: 4px; }
        .star-pick {
          background: none; border: none; font-size: 26px;
          cursor: pointer; color: #D8D8D8;
          transition: color .15s, transform .1s; padding: 0; line-height: 1;
        }
        .star-pick:hover, .star-pick.on { color: var(--accent); transform: scale(1.15); }

        @media (max-width: 768px) {
          .testi-section { padding: 64px 0; }
          .testi-grid { grid-template-columns: 1fr; }
          .testi-form-row { grid-template-columns: 1fr; }
          .testi-title { font-size: 28px; }
          .testi-form { padding: 22px 16px; }
        }
        @media (max-width: 480px) {
          .testi-section { padding: 52px 0; }
          .testi-title { font-size: 24px; }
        }
      `}</style>
    </section>
  );
}
