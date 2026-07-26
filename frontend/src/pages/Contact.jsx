import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';

export default function Contact() {
  const [settings, setSettings] = useState({});
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending'); setErrorMsg('');
    const submittedEmail = form.email;
    try {
      await api.sendContactMessage(form);
      setForm({ name: '', email: '', phone: '', message: '' });
      setStatus('success');
      // Store submitted email so success message can reference it
      setForm(f => ({ ...f, email: submittedEmail }));
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  }

  const wa = settings.whatsapp_number || '923001234567';
  const email = settings.contact_email || 'hello@dreamerproducts.com';
  const waLink = `https://wa.me/${wa}?text=${encodeURIComponent('Hi Dreamer Products! I have a question.')}`;

  return (
    <div className="contact-page">
      <Navbar />

      {/* Page hero */}
      <div className="contact-hero">
        <div className="ch-blob ch-b1" />
        <div className="ch-blob ch-b2" />
        <div className="container contact-hero-inner">
          <p className="eyebrow animate-in">GET IN TOUCH</p>
          <h1 className="display contact-title animate-in delay-1">We'd love to<br /><em>hear from you</em></h1>
          <p className="contact-sub animate-in delay-2">
            Have a question about a product, an order, or just want to say hello?
            Reach out — we usually reply within a few hours.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container contact-body">

        {/* Info cards */}
        <div className="contact-cards">
          <a className="ccard" href={waLink} target="_blank" rel="noopener noreferrer">
            <span className="ccard-icon">💬</span>
            <div>
              <p className="ccard-title">WhatsApp</p>
              <p className="ccard-sub">Message us directly — fastest response</p>
              <p className="ccard-value">+{wa}</p>
            </div>
            <span className="ccard-arrow">→</span>
          </a>

          <a className="ccard" href={`mailto:${email}`}>
            <span className="ccard-icon">✉️</span>
            <div>
              <p className="ccard-title">Email</p>
              <p className="ccard-sub">We'll reply within 24 hours</p>
              <p className="ccard-value">{email}</p>
            </div>
            <span className="ccard-arrow">→</span>
          </a>

          <div className="ccard ccard-hours">
            <span className="ccard-icon">🕐</span>
            <div>
              <p className="ccard-title">Business Hours</p>
              <p className="ccard-sub">Mon – Sat</p>
              <p className="ccard-value">10 AM – 8 PM (PKT)</p>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="contact-form-wrap">
          <div className="contact-form-card">
            <h2 className="display contact-form-title">Send us a message</h2>
            <p className="contact-form-hint">Fill in the form and we'll get back to you via email.</p>

            {status === 'success' ? (
              <div className="contact-success">
                <span className="contact-success-icon">✓</span>
                <h3 className="display">Message sent!</h3>
                <p>Thanks for reaching out. We'll reply to <strong>{form.email || 'you'}</strong> shortly.</p>
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <button className="btn btn-primary" onClick={() => setStatus('idle')}>Send another</button>
                  <Link to="/" className="btn btn-outline">Back to shop</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="cf">
                <div className="cf-row">
                  <div className="cf-field">
                    <label htmlFor="cf-name">Your name *</label>
                    <input
                      id="cf-name" required
                      placeholder="e.g. Sara Ahmed"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                    />
                  </div>
                  <div className="cf-field">
                    <label htmlFor="cf-email">Email address *</label>
                    <input
                      id="cf-email" type="email" required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="cf-field">
                  <label htmlFor="cf-phone">Phone / WhatsApp <span className="cf-optional">(optional)</span></label>
                  <input
                    id="cf-phone"
                    placeholder="+92 300 0000000"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                  />
                </div>
                <div className="cf-field">
                  <label htmlFor="cf-msg">Message *</label>
                  <textarea
                    id="cf-msg" required
                    placeholder="Ask about a product, an order, or anything else…"
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    rows={5}
                  />
                </div>

                {status === 'error' && (
                  <p className="cf-error">{errorMsg || 'Something went wrong. Please try again.'}</p>
                )}

                <div className="cf-actions">
                  <button type="submit" className="btn btn-primary cf-submit" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending…' : 'Send message'}
                  </button>
                  <span className="cf-or">or</span>
                  <a className="btn btn-outline" href={waLink} target="_blank" rel="noopener noreferrer">
                    Message on WhatsApp
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="contact-footer-strip">
        <div className="container">
          <p>© {new Date().getFullYear()} Dreamer Products · <Link to="/">Back to shop</Link></p>
        </div>
      </div>

      <style>{`
        .contact-page { min-height: 100vh; background: var(--cream); display: flex; flex-direction: column; }

        /* Hero */
        .contact-hero {
          position: relative; overflow: hidden;
          padding: 72px 0 60px; background: var(--cream);
        }
        .ch-blob {
          position: absolute; border-radius: 50%;
          filter: blur(72px); pointer-events: none; z-index: 0;
        }
        .ch-b1 {
          width: 480px; height: 480px; top: -180px; right: -120px;
          background: radial-gradient(circle, var(--soft-gold), var(--dusty-rose) 50%, var(--moon-lavender));
          opacity: .35;
        }
        .ch-b2 {
          width: 260px; height: 260px; bottom: -80px; left: -60px;
          background: radial-gradient(circle, var(--moon-lavender), var(--dusty-rose));
          opacity: .2;
        }
        .contact-hero-inner { position: relative; z-index: 1; max-width: 580px; }
        .eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: .18em;
          color: var(--dusty-rose); margin: 0 0 16px; text-transform: uppercase;
        }
        .contact-title { font-size: 48px; line-height: 1.1; margin-bottom: 18px; }
        .contact-title em { font-style: italic; color: var(--dusty-rose); }
        .contact-sub { font-size: 16px; line-height: 1.65; color: var(--ink-soft); margin: 0; max-width: 460px; }

        /* Body */
        .contact-body { flex: 1; padding: 56px 28px 80px; display: flex; flex-direction: column; gap: 48px; }

        /* Info cards */
        .contact-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .ccard {
          background: #fff; border: 1px solid var(--border); border-radius: 18px;
          padding: 24px 22px; display: flex; align-items: flex-start; gap: 16px;
          text-decoration: none; color: inherit;
          transition: box-shadow .22s, transform .22s, border-color .22s;
        }
        a.ccard:hover {
          box-shadow: 0 8px 32px rgba(43,31,61,.1);
          transform: translateY(-3px); border-color: var(--dusty-rose);
        }
        .ccard-icon { font-size: 26px; line-height: 1; flex-shrink: 0; margin-top: 2px; }
        .ccard-title { font-size: 14px; font-weight: 700; color: var(--ink); margin: 0 0 4px; }
        .ccard-sub { font-size: 12.5px; color: var(--ink-soft); margin: 0 0 8px; line-height: 1.5; }
        .ccard-value { font-size: 13.5px; font-weight: 600; color: var(--twilight); margin: 0; }
        .ccard-arrow { margin-left: auto; font-size: 18px; color: var(--dusty-rose); align-self: center; flex-shrink: 0; opacity: 0; transition: opacity .18s; }
        a.ccard:hover .ccard-arrow { opacity: 1; }

        /* Form */
        .contact-form-wrap { display: flex; justify-content: center; }
        .contact-form-card {
          width: 100%; max-width: 640px;
          background: #fff; border: 1px solid var(--border); border-radius: 24px;
          padding: 40px 40px 44px;
          box-shadow: 0 4px 24px rgba(43,31,61,.06);
        }
        .contact-form-title { font-size: 26px; margin-bottom: 6px; }
        .contact-form-hint { font-size: 14px; color: var(--ink-soft); margin: 0 0 28px; }

        /* Form fields */
        .cf { display: flex; flex-direction: column; gap: 18px; }
        .cf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .cf-field { display: flex; flex-direction: column; gap: 7px; }
        .cf-field label { font-size: 13px; font-weight: 700; color: var(--ink); letter-spacing: .02em; }
        .cf-optional { font-weight: 400; color: var(--ink-soft); }
        .cf-field input, .cf-field textarea {
          font-size: 14px; padding: 11px 14px;
          border: 1.5px solid var(--border); border-radius: 12px;
          font-family: inherit; outline: none; background: var(--cream);
          transition: border-color .15s, box-shadow .15s; resize: none;
          color: var(--ink);
        }
        .cf-field input:focus, .cf-field textarea:focus {
          border-color: var(--dusty-rose);
          box-shadow: 0 0 0 3px rgba(190,130,150,.12);
          background: #fff;
        }
        .cf-error {
          font-size: 13.5px; color: #b91c1c;
          background: #fef2f2; border: 1px solid #fecaca;
          padding: 10px 14px; border-radius: 10px;
        }
        .cf-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding-top: 4px; }
        .cf-submit { min-width: 160px; }
        .cf-or { font-size: 13px; color: var(--ink-soft); }

        /* Success */
        .contact-success {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 32px 0 8px; gap: 10px;
        }
        .contact-success-icon {
          width: 60px; height: 60px; border-radius: 50%;
          background: #dcfce7; color: #16a34a;
          font-size: 26px; display: flex; align-items: center; justify-content: center;
          margin-bottom: 8px;
        }
        .contact-success h3 { font-size: 24px; margin: 0; }
        .contact-success p { font-size: 15px; color: var(--ink-soft); margin: 0; }

        /* Footer strip */
        .contact-footer-strip {
          border-top: 1px solid var(--border); padding: 18px 28px;
          font-size: 12.5px; color: var(--ink-soft); text-align: center;
        }
        .contact-footer-strip a { color: var(--dusty-rose); text-decoration: none; }
        .contact-footer-strip a:hover { text-decoration: underline; }

        @media (max-width: 900px) {
          .contact-title { font-size: 36px; }
          .contact-cards { grid-template-columns: 1fr; }
          .contact-form-card { padding: 28px 22px 32px; }
          .cf-row { grid-template-columns: 1fr; }
          .contact-hero { padding: 52px 0 40px; }
          .contact-body { padding: 40px 0 56px; }
        }
        @media (max-width: 480px) {
          .contact-title { font-size: 26px; }
          .contact-hero { padding: 36px 0 32px; }
          .contact-sub { font-size: 14px; }
          .cf-actions { flex-direction: column; align-items: stretch; }
          .cf-or { text-align: center; }
          .cf-submit, .cf-actions .btn { width: 100%; justify-content: center; }
          .contact-body { gap: 32px; padding: 32px 0 48px; }
        }
      `}</style>
    </div>
  );
}
