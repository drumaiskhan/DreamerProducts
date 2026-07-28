import { useState } from 'react';
import { useInView } from '../lib/useInView';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [ref, inView] = useInView();

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    window.open(`mailto:hello@dreamerproducts.com?subject=Newsletter%20Signup&body=Please%20add%20me%20to%20your%20newsletter%3A%20${encodeURIComponent(email)}`, '_blank');
    setSent(true);
  }

  return (
    <section className="nl-section" ref={ref}>
      <div className={`container nl-inner ${inView ? 'visible' : ''}`}>
        <div className="nl-left">
          <div className="nl-rx-tag">
            <span className="nl-rx-mark">Rx</span>
            <span>Weekly Wellness</span>
          </div>
          <h2 className="display nl-title">Clinical tips &amp;<br/>new arrivals</h2>
          <p className="nl-sub">Be the first to know about new Dreamer Products formulas, dermatologist tips, and exclusive offers.</p>
        </div>
        <div className="nl-right">
          {sent ? (
            <div className="nl-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Thank you — we'll be in touch soon.</span>
            </div>
          ) : (
            <form className="nl-form" onSubmit={handleSubmit}>
              <input
                type="email"
                className="nl-input"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address"
              />
              <button type="submit" className="btn btn-primary nl-btn">
                Subscribe
              </button>
            </form>
          )}
          <p className="nl-fine">No spam. Unsubscribe anytime. By subscribing, you agree to receive marketing emails from Dreamer Products.</p>
        </div>
      </div>

      <style>{`
        .nl-section {
          padding: 56px 0;
          background: var(--cream);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .nl-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
          opacity: 0; transform: translateY(18px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .nl-inner.visible { opacity: 1; transform: translateY(0); }

        .nl-rx-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--forest); border-radius: 4px; padding: 5px 14px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(255,255,255,0.75);
          margin-bottom: 18px;
        }
        .nl-rx-mark {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 600; font-style: italic;
          color: var(--sage-light);
        }

        .nl-title { font-size: 38px; margin-bottom: 14px; color: var(--ink); }
        .nl-sub { font-size: 14.5px; color: var(--ink-soft); line-height: 1.7; margin: 0; }

        .nl-form {
          display: flex; gap: 10px; margin-bottom: 14px;
        }
        .nl-input {
          flex: 1; padding: 13px 18px;
          border-radius: 4px;
          border: 1.5px solid var(--border-dark);
          background: #fff; color: var(--ink);
          font-size: 14px; font-family: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .nl-input::placeholder { color: var(--ink-muted); }
        .nl-input:focus {
          outline: none; border-color: var(--sage);
          box-shadow: 0 0 0 3px rgba(122,158,142,0.15);
        }
        .nl-btn { white-space: nowrap; }

        .nl-success {
          display: flex; align-items: center; gap: 10px;
          padding: 16px 20px;
          background: var(--sage-pale);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--forest);
          font-size: 14px; font-weight: 600;
          margin-bottom: 14px;
        }
        .nl-success svg { color: var(--sage); flex-shrink: 0; }

        .nl-fine {
          font-size: 11px; color: var(--ink-muted); line-height: 1.6; margin: 0;
        }

        @media (max-width: 768px) {
          .nl-section { padding: 56px 0; }
          .nl-inner { grid-template-columns: 1fr; gap: 28px; }
          .nl-title { font-size: 26px; }
          .nl-form { flex-direction: column; }
        }
        @media (max-width: 480px) {
          .nl-section { padding: 36px 0; }
          .nl-title { font-size: 24px; }
          .nl-btn { width: 100%; }
        }
      `}</style>
    </section>
  );
}
