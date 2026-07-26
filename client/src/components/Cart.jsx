import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart({ open, onClose }) {
  const { cart, dispatch, total } = useCart();
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          address: form.address,
          items: cart,
          total,
        }),
      });
      dispatch({ type: 'CLEAR_CART' });
      setSubmitted(true);
    } catch (err) {
      alert('Order failed. Please try again.');
    }
    setLoading(false);
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
            <p>Thank you for your order — we'll reach out shortly to confirm the details.</p>
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
