import { useState } from 'react';
import { Mail, Phone, MapPin, Send, ArrowUpRight } from 'lucide-react';
import { apiUrl } from '../config/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'contact' }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to send');
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="contact-page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow--center" style={{ color: '#EEC7B4', marginBottom: 20 }}>Get in touch</span>
          <h1 className="page-hero__title">
            Let's create <em>something&nbsp;together</em>.
          </h1>
          <p className="page-hero__sub">
            Custom orders, bulk pricing, design consultations — our studio is ready when you are.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info">
            <span className="eyebrow">Direct lines</span>
            <h2>Reach the studio.</h2>
            {[
              { icon: <Mail size={18} strokeWidth={1.75} />, label: 'clientscred@gmail.com' },
              { icon: <Phone size={18} strokeWidth={1.75} />, label: '+91 00000 00000' },
              { icon: <MapPin size={18} strokeWidth={1.75} />, label: 'India — nationwide delivery' },
            ].map((i) => (
              <div key={i.label} className="contact-info__item">
                {i.icon} <span>{i.label}</span>
              </div>
            ))}
          </div>

          {sent ? (
            <div className="contact-success">
              <div className="cart-success-icon">✓</div>
              <h3>Message received.</h3>
              <p>Our team will reply within 24 hours — usually much sooner.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} data-testid="contact-form">
              <span className="eyebrow" style={{ marginBottom: 12 }}>Send a note</span>
              <h2>Tell us about the project.</h2>
              {[
                { key: 'name', label: 'Your Name', type: 'text' },
                { key: 'email', label: 'Email Address', type: 'email' },
              ].map((f) => (
                <div key={f.key} className="form-group">
                  <label>{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={(e) => setForm((v) => ({ ...v, [f.key]: e.target.value }))}
                    required
                    data-testid={`contact-${f.key}`}
                  />
                </div>
              ))}
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((v) => ({ ...v, message: e.target.value }))}
                  rows={5}
                  required
                  data-testid="contact-message"
                />
              </div>
              <button className="btn-primary" type="submit" disabled={loading} data-testid="contact-submit">
                {loading ? 'Sending…' : <>Send message <Send size={15} /></>}
              </button>
              {error && (
                <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 12 }} data-testid="contact-error">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
