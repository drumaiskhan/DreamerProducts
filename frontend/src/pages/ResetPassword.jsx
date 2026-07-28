import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token. Please request a new link.');
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setError(''); setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
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
        <p className="eyebrow" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--dusty-rose)', margin: '0 0 10px', textTransform: 'uppercase' }}>NEW PASSWORD</p>
        <h1 className="display auth-title">Reset password</h1>

        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e6f4ea', color: '#2d7a3a', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>✓</div>
            <p style={{ fontSize: 15, color: 'var(--ink)', marginBottom: 8 }}>Password updated!</p>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              Redirecting you to sign in…
            </p>
            <Link to="/login" className="btn btn-primary auth-btn" style={{ display: 'block', marginTop: 24, textAlign: 'center', textDecoration: 'none' }}>
              Sign in now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 26px' }}>
              Enter a new password for your account.
            </p>
            {error && <div className="auth-error">{error}</div>}
            <div className="field">
              <label htmlFor="password">New password</label>
              <input
                id="password" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                required autoFocus placeholder="At least 6 characters"
                disabled={!token}
              />
            </div>
            <div className="field">
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm" type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required placeholder="Repeat your password"
                disabled={!token}
              />
            </div>
            <button className="btn btn-primary auth-btn" disabled={loading || !token}>
              {loading ? 'Updating…' : 'Update password'}
            </button>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Link to="/login" style={{ fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>← Back to sign in</Link>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .auth-page { min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--twilight);padding:24px;position:relative;overflow:hidden; }
        .auth-blob { position:absolute;top:-200px;right:-200px;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,var(--dusty-rose),var(--moon-lavender));filter:blur(80px);opacity:0.2;pointer-events:none; }
        .auth-card { background:#fff;border-radius:24px;padding:40px 36px;width:100%;max-width:400px;box-shadow:0 28px 80px rgba(0,0,0,0.35);position:relative;z-index:1; }
        .auth-title { font-size:28px;margin-bottom:8px; }
        .auth-error { background:#fbe7e9;color:#93303f;font-size:13.5px;padding:11px 14px;border-radius:10px;margin-bottom:18px; }
        .auth-btn { width:100%;margin-top:6px; }
        .field { display:flex;flex-direction:column;gap:6px;margin-bottom:14px; }
        .field label { font-size:12.5px;font-weight:700;color:var(--ink);letter-spacing:.02em; }
        .field input { font-size:14px;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-family:inherit;outline:none;background:var(--cream);transition:border-color .15s;color:var(--ink); }
        .field input:focus { border-color:var(--forest);background:#fff; }
      `}</style>
    </div>
  );
}
