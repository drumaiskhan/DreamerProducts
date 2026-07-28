import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-blob" />
      <div className="auth-card">
        <Link to="/login" className="auth-back">← Back to sign in</Link>
        <p className="eyebrow" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--dusty-rose)', margin: '0 0 10px', textTransform: 'uppercase' }}>PASSWORD RESET</p>
        <h1 className="display auth-title">Forgot password?</h1>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e6f4ea', color: '#2d7a3a', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>✓</div>
            <p style={{ fontSize: 15, color: 'var(--ink)', marginBottom: 8 }}>Check your email</p>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              If <strong>{email}</strong> is registered, we've sent a reset link. It expires in 1 hour.
            </p>
            <Link to="/login" className="btn btn-primary auth-btn" style={{ display: 'block', marginTop: 24, textAlign: 'center', textDecoration: 'none' }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="auth-sub" style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 26px' }}>
              Enter your email and we'll send you a reset link.
            </p>
            {error && <div className="auth-error">{error}</div>}
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                required autoFocus placeholder="you@example.com"
              />
            </div>
            <button className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .auth-page { min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--twilight);padding:24px;position:relative;overflow:hidden; }
        .auth-blob { position:absolute;top:-200px;right:-200px;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,var(--dusty-rose),var(--moon-lavender));filter:blur(80px);opacity:0.2;pointer-events:none; }
        .auth-card { background:#fff;border-radius:24px;padding:40px 36px;width:100%;max-width:400px;box-shadow:0 28px 80px rgba(0,0,0,0.35);position:relative;z-index:1; }
        .auth-back { display:inline-block;font-size:13px;color:var(--ink-soft);margin-bottom:28px;transition:color .18s;text-decoration:none; }
        .auth-back:hover { color:var(--ink); }
        .auth-title { font-size:28px;margin-bottom:8px; }
        .auth-error { background:#fbe7e9;color:#93303f;font-size:13.5px;padding:11px 14px;border-radius:10px;margin-bottom:18px; }
        .auth-btn { width:100%;margin-top:6px; }
      `}</style>
    </div>
  );
}
