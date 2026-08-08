import { useState, useRef } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { apiUrl } from '../config/api';

// WhatsApp number for order confirmation (+91 7276100364)
const WHATSAPP_NUMBER = '917276100364';

export default function Cart({ open, onClose }) {
  const { cart, dispatch, total } = useCart();
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [waLink, setWaLink] = useState('');
  const openedOnce = useRef(false);

  // Build a pre-filled WhatsApp message with all checkout details + order id
  const buildWhatsAppMessage = (id) => {
    const lines = [];
    lines.push(`🛒 *New Order Confirmation*`);
    lines.push('');
    lines.push(`🧾 *Order ID:* #CNC-${id}`);
    lines.push('');
    lines.push('*Items:*');
    cart.forEach((item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      lines.push(`• ${item.name} × ${qty} = ₹${(price * qty).toLocaleString('en-IN')}`);
    });
    lines.push('');
    lines.push(`💰 *Total:* ₹${Number(total || 0).toLocaleString('en-IN')}`);
    lines.push('');
    lines.push('*Customer Details:*');
    lines.push(`👤 Name: ${form.name}`);
    if (form.email) lines.push(`📧 Email: ${form.email}`);
    if (form.phone) lines.push(`📞 Phone: ${form.phone}`);
    if (form.address) lines.push(`🏠 Address: ${form.address}`);
    lines.push('');
    lines.push('Please confirm my order. Thank you!');
    return lines.join('\n');
  };

  const openWhatsApp = (id) => {
    const msg = buildWhatsAppMessage(id);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    setWaLink(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  openedOnce.current = false;

  try {
    const res = await fetch(apiUrl('/api/orders'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        address: form.address,
        items: cart,
        total,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Order failed");
    }

    const data = await res.json();
    console.log("Order created:", data);

    const id = data.id;
    setOrderId(id);
    dispatch({ type: 'CLEAR_CART' });
    setSubmitted(true);

    // Auto-open WhatsApp after placing the order (only once per order)
    if (!openedOnce.current) {
      openedOnce.current = true;
      openWhatsApp(id);
    }
  } catch (err) {
    console.error(err);
    alert("Order failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  if (!open) return null;

  return (
    <div className="cart-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} data-testid="cart-overlay">
      <aside className="cart-drawer" data-testid="cart-drawer">
        <header className="cart-header">
          <h2 className="cart-title">
            <ShoppingBag size={20} strokeWidth={1.75} /> Your Cart {cart.length > 0 && <span style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 500 }}>({cart.length})</span>}
          </h2>
          <button className="cart-close" onClick={onClose} aria-label="Close cart" data-testid="cart-close">
            <X size={20} />
          </button>
        </header>

{submitted ? (
          <div className="cart-success" data-testid="cart-success">
            <div className="cart-success-icon">✓</div>
            <h3>Order placed.</h3>
            {orderId && <p className="cart-success-orderid">Order ID: #CNC-{orderId}</p>}
            <p>For making payment and confirming your order ,Click below <strong>Send</strong> — your details are already typed out.</p>
            <button
              className="btn-whatsapp"
              onClick={() => orderId && openWhatsApp(orderId)}
              data-testid="cart-whatsapp"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Confirm on WhatsApp
            </button>
            <button
              className="btn-primary"
              onClick={() => { setSubmitted(false); setCheckout(false); onClose(); }}
              data-testid="cart-continue-shopping"
            >
              Continue shopping <ArrowUpRight size={15} />
            </button>
          </div>
        ) : checkout ? (
          <form className="checkout-form" onSubmit={handleSubmit} data-testid="checkout-form">
            <h3 className="checkout-title">Checkout details</h3>
            {[
              { key: 'name',    label: 'Full Name',        type: 'text',  required: true },
              { key: 'email',   label: 'Email Address',    type: 'email', required: true },
              { key: 'phone',   label: 'Phone Number',     type: 'tel' },
              { key: 'address', label: 'Delivery Address', type: 'text' },
            ].map((f) => (
              <div key={f.key} className="form-group">
                <label>{f.label}{f.required && ' *'}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={(e) => setForm((v) => ({ ...v, [f.key]: e.target.value }))}
                  required={f.required}
                  data-testid={`checkout-${f.key}`}
                />
              </div>
            ))}
            <div className="checkout-summary">
              <span>Order Total</span>
              <strong>₹{total.toLocaleString('en-IN')}</strong>
            </div>
            <button className="btn-primary" type="submit" disabled={loading} data-testid="checkout-submit">
              {loading ? 'Placing order…' : <>Place order <ArrowUpRight size={15} /></>}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setCheckout(false)} data-testid="checkout-back">
              ← Back to cart
            </button>
          </form>
        ) : (
          <>
            {cart.length === 0 ? (
              <div className="cart-empty" data-testid="cart-empty">
                <ShoppingBag size={48} strokeWidth={1} />
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--ink)', fontWeight: 600 }}>Your cart is empty</p>
                <p style={{ fontSize: '0.9rem' }}>Explore our collection to find something you love.</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item" data-testid={`cart-item-${item.id}`}>
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-info">
                        <p className="cart-item-name">{item.name}</p>
                        <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</p>
                        <div className="cart-item-qty">
                          <button onClick={() => dispatch({ type: 'UPDATE_QUANTITY', id: item.id, quantity: item.quantity - 1 })} aria-label="Decrease">
                            <Minus size={13} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => dispatch({ type: 'UPDATE_QUANTITY', id: item.id, quantity: item.quantity + 1 })} aria-label="Increase">
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                      <button className="cart-item-remove" onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })} aria-label="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Subtotal</span>
                    <strong>₹{total.toLocaleString('en-IN')}</strong>
                  </div>
                  <button className="btn-primary" onClick={() => setCheckout(true)} data-testid="cart-checkout-btn">
                    Proceed to checkout <ArrowUpRight size={15} />
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
