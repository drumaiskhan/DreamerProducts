import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await api.userLogin(email, password);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-blob" />
      <form className="auth-card" onSubmit={handleSubmit}>
        <Link to="/" className="auth-back">← Back to store</Link>
        <p className="eyebrow">WELCOME BACK</p>
        <h1 className="display auth-title">Sign in</h1>
        <p className="auth-sub">New here? <Link to="/signup" className="auth-link">Create an account</Link></p>

        {error && <div className="auth-error">{error}</div>}

        <div className="field">
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus placeholder="you@example.com" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
        </div>

        <button className="btn btn-primary auth-btn" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <style>{`
        .auth-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: var(--twilight); padding: 24px; position: relative; overflow: hidden;
        }
        .auth-blob {
          position: absolute; top: -200px; right: -200px;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, var(--dusty-rose), var(--moon-lavender));
          filter: blur(80px); opacity: 0.2; pointer-events: none;
        }
        .auth-card {
          background: #fff; border-radius: 24px;
          padding: 40px 36px; width: 100%; max-width: 400px;
          box-shadow: 0 28px 80px rgba(0,0,0,0.35); position: relative; z-index: 1;
        }
        .auth-back {
          display: inline-block; font-size: 13px; color: var(--ink-soft);
          margin-bottom: 28px; transition: color 0.18s ease;
        }
        .auth-back:hover { color: var(--ink); }
        .auth-card .eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.16em;
          color: var(--dusty-rose); margin: 0 0 10px; text-transform: uppercase;
        }
        .auth-title { font-size: 28px; margin-bottom: 8px; }
        .auth-sub { font-size: 14px; color: var(--ink-soft); margin: 0 0 26px; }
        .auth-link { color: var(--dusty-rose); font-weight: 600; }
        .auth-error {
          background: #fbe7e9; color: #93303f; font-size: 13.5px;
          padding: 11px 14px; border-radius: 10px; margin-bottom: 18px;
        }
        .auth-btn { width: 100%; margin-top: 6px; }
      `}</style>
    </div>
  );
}
