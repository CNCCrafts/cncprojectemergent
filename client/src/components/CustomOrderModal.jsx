import { useState } from 'react';
import { X, Send, Sparkles, ArrowUpRight, Ruler, Palette, Layers, MessageSquare, CheckCircle, ChevronLeft } from 'lucide-react';

const CATEGORIES = [
  { id: 'acrylic', label: 'Acrylic Art' },
  { id: 'mdf',     label: 'MDF Art' },
  { id: 'acp',     label: 'ACP Signage' },
  { id: 'pvc',     label: 'PVC Displays' },
  { id: '3d',      label: '3D Design' },
  { id: 'other',   label: 'Something else' },
];

const MATERIALS_BY_CATEGORY = {
  acrylic: [
    { id: 'acrylic-2mm', label: '2mm Clear Acrylic', desc: 'Lightweight, best for small wall pieces' },
    { id: 'acrylic-3mm', label: '3mm Clear Acrylic', desc: 'Standard thickness, great for signs and art' },
    { id: 'acrylic-5mm', label: '5mm Clear Acrylic', desc: 'Premium thickness for statement pieces' },
    { id: 'acrylic-8mm', label: '8mm Clear Acrylic', desc: 'Heavy-duty architectural' },
    { id: 'acrylic-matte', label: '3mm Matte Acrylic', desc: 'Non-reflective matte finish' },
    { id: 'acrylic-mirror', label: '3mm Mirror Acrylic', desc: 'Reflective mirror-like surface' },
    { id: 'acrylic-uv', label: '3mm UV Print Acrylic', desc: 'Full-color UV printed on acrylic' },
  ],
  mdf: [
    { id: 'mdf-3mm', label: '3mm MDF', desc: 'Thin, great for intricate laser cuts' },
    { id: 'mdf-6mm', label: '6mm MDF', desc: 'Standard thickness for wall decor' },
    { id: 'mdf-9mm', label: '9mm MDF', desc: 'Medium thickness, sturdy pieces' },
    { id: 'mdf-12mm', label: '12mm MDF', desc: 'Thick, structural applications' },
    { id: 'mdf-natural', label: 'Natural MDF', desc: 'Raw MDF with sealed edges' },
    { id: 'mdf-painted', label: 'Painted MDF', desc: 'Custom color painted finish' },
    { id: 'mdf-laminated', label: 'Laminated MDF', desc: 'With textured laminate layer' },
  ],
  acp: [
    { id: 'acp-3mm', label: '3mm ACP', desc: 'Standard aluminium composite' },
    { id: 'acp-4mm', label: '4mm ACP', desc: 'Heavy-duty aluminium composite' },
    { id: 'acp-brushed', label: 'Brushed Aluminium', desc: 'Metallic brushed finish' },
    { id: 'acp-glossy', label: 'Glossy White ACP', desc: 'High-gloss white finish' },
    { id: 'acp-wood', label: 'Wood Finish ACP', desc: 'Timber-look aluminium panels' },
    { id: 'acp-digital', label: 'Digital Print ACP', desc: 'Full-color UV printed ACP' },
  ],
  pvc: [
    { id: 'pvc-3mm', label: '3mm PVC Foam', desc: 'Lightweight, good for indoor displays' },
    { id: 'pvc-5mm', label: '5mm PVC Foam', desc: 'Standard display board thickness' },
    { id: 'pvc-10mm', label: '10mm PVC Foam', desc: 'Thick, rigid for stands' },
    { id: 'pvc-glossy', label: 'Glossy PVC', desc: 'High-gloss finish PVC' },
    { id: 'pvc-matte', label: 'Matte PVC', desc: 'Non-reflective matte board' },
  ],
  '3d': [
    { id: '3d-pla', label: 'PLA Filament', desc: 'Standard matte finish, eco-friendly' },
    { id: '3d-resin', label: 'Resin Print', desc: 'High detail, smooth surface finish' },
    { id: '3d-petg', label: 'PETG Filament', desc: 'Durable, slightly flexible' },
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
