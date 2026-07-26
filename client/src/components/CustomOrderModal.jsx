import { useState } from 'react';
import { X, Send, Sparkles, ArrowUpRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'acrylic', label: 'Acrylic Art' },
  { id: 'mdf',     label: 'MDF Art' },
  { id: 'acp',     label: 'ACP Signage' },
  { id: 'pvc',     label: 'PVC Displays' },
  { id: '3d',      label: '3D Design' },
  { id: 'other',   label: 'Something else' },
];

export default function CustomOrderModal({ open, onClose }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    category: 'acrylic',
    dimensions: '', quantity: '1',
    budget: '', timeline: '',
    message: '',
  });
  const [sent, setSent]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const message = [
        `Category: ${form.category}`,
        `Dimensions: ${form.dimensions || '—'}`,
        `Quantity: ${form.quantity || '1'}`,
        `Budget: ${form.budget || '—'}`,
        `Timeline: ${form.timeline || '—'}`,
        '',
        'Brief:',
        form.message,
      ].join('\n');

      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:    form.name,
          email:   form.email,
          phone:   form.phone,
          subject: `Custom Order — ${form.category}`,
          message,
          type:    'custom_order',
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to send');
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((v) => ({ ...v, [k]: e.target.value }));

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="custom-order-overlay"
    >
      <div className="modal custom-order-modal" data-testid="custom-order-modal">
        <header className="modal-header">
          <div className="custom-order-modal__header">
            <span className="custom-order-modal__badge">
              <Sparkles size={14} /> Custom Order
            </span>
            <h2>Bring your vision to us.</h2>
            <p>Share your design brief — our craft team will get back with a quote within 24 hours.</p>
          </div>
          <button onClick={onClose} aria-label="Close" data-testid="custom-order-close">
            <X size={18} />
          </button>
        </header>

        <div className="modal-body">
          {sent ? (
            <div className="cart-success" data-testid="custom-order-success" style={{ padding: 32 }}>
              <div className="cart-success-icon">✓</div>
              <h3>Request received!</h3>
              <p>We've saved your brief. A craft specialist will reach out to <strong>{form.email}</strong> within 24 hours.</p>
              <button className="btn-primary" onClick={onClose} data-testid="custom-order-done">
                Continue browsing <ArrowUpRight size={15} />
              </button>
            </div>
          ) : (
            <form onSubmit={submit} data-testid="custom-order-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input type="text" required value={form.name} onChange={set('name')} data-testid="co-name" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" required value={form.email} onChange={set('email')} data-testid="co-email" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91…" data-testid="co-phone" />
                </div>
                <div className="form-group">
                  <label>Material / Category *</label>
                  <select value={form.category} onChange={set('category')} data-testid="co-category">
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dimensions</label>
                  <input type="text" placeholder='e.g. 24" x 36"' value={form.dimensions} onChange={set('dimensions')} data-testid="co-dimensions" />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" min="1" value={form.quantity} onChange={set('quantity')} data-testid="co-quantity" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Budget (₹)</label>
                  <input type="text" placeholder="Optional — helps us suggest options" value={form.budget} onChange={set('budget')} data-testid="co-budget" />
                </div>
                <div className="form-group">
                  <label>Timeline</label>
                  <input type="text" placeholder="e.g. 2 weeks, ASAP" value={form.timeline} onChange={set('timeline')} data-testid="co-timeline" />
                </div>
              </div>

              <div className="form-group">
                <label>Design Brief *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe your vision — style, colours, references, use-case…"
                  value={form.message}
                  onChange={set('message')}
                  data-testid="co-message"
                />
              </div>

              {error && (
                <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 12 }} data-testid="co-error">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary btn-accent"
                disabled={loading}
                style={{ width: '100%' }}
                data-testid="co-submit"
              >
                {loading ? 'Submitting…' : <>Submit Request <Send size={15} /></>}
              </button>
              <p className="custom-order-modal__hint">
                By submitting, you agree to be contacted by CNC Crafts about this enquiry.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
