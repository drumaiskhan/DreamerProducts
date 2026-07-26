import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.login(email, password);
      localStorage.setItem('dd_token', token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-side">
        <div className="login-side-inner">
          <div className="login-logo">
            <span className="login-dr">Dr.</span>
            <span className="display login-brand">Dreamer</span>
          </div>
          <p className="login-tagline">Dermatologist-reviewed skin &amp; hair care.</p>
          <div className="login-features">
            {['Manage your product catalogue', 'Track orders in real time', 'Review customer feedback', 'Control site settings'].map(f => (
              <div key={f} className="login-feature">
                <span className="login-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-main">
        <form className="login-card" onSubmit={handleSubmit}>
          <p className="login-eyebrow">Admin Portal</p>
          <h1 className="display login-title">Sign in</h1>
          <p className="login-hint">Authorised personnel only.</p>

          {error && (
            <div className="login-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus placeholder="admin@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>

          <button className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>

          <a href="/" className="login-back">← Back to storefront</a>
        </form>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .login-side {
          background: var(--forest);
          display: flex; align-items: center; justify-content: center;
          padding: 60px 48px;
        }
        .login-side-inner { max-width: 340px; width: 100%; }
        .login-logo {
          display: flex; align-items: baseline; gap: 5px;
          margin-bottom: 16px;
        }
        .login-dr {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          color: var(--sage-light); letter-spacing: 0.05em;
        }
        .login-brand { font-size: 28px; font-weight: 500; color: #fff; }
        .login-tagline {
          font-size: 14px; color: rgba(255,255,255,0.55);
          margin: 0 0 40px; line-height: 1.6;
        }
        .login-features { display: flex; flex-direction: column; gap: 14px; }
        .login-feature {
          display: flex; align-items: center; gap: 10px;
          font-size: 13.5px; color: rgba(255,255,255,0.65);
        }
        .login-feature-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--sage); flex-shrink: 0;
        }

        .login-main {
          display: flex; align-items: center; justify-content: center;
          padding: 60px 48px;
          background: var(--warm-white);
        }
        .login-card {
          width: 100%; max-width: 380px;
          display: flex; flex-direction: column;
        }
        .login-eyebrow {
          font-size: 10px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--sage); margin: 0 0 10px;
        }
        .login-title { font-size: 34px; margin-bottom: 6px; }
        .login-hint { font-size: 13px; color: var(--ink-muted); margin: 0 0 28px; }

        .login-error {
          display: flex; align-items: center; gap: 8px;
          background: #FEE8E8; color: #9B2020;
          font-size: 13px; font-weight: 500;
          padding: 11px 14px; border-radius: 4px;
          margin-bottom: 20px;
        }
        .login-error svg { flex-shrink: 0; }

        .login-btn { width: 100%; margin-top: 6px; margin-bottom: 20px; }
        .login-back {
          text-align: center; font-size: 12px; font-weight: 500;
          letter-spacing: 0.06em; color: var(--ink-muted);
          text-decoration: none; transition: color .18s;
        }
        .login-back:hover { color: var(--forest); }

        @media (max-width: 768px) {
          .login-page { grid-template-columns: 1fr; }
          .login-side { display: none; }
          .login-main { padding: 40px 24px; }
        }
      `}</style>
    </div>
  );
}
