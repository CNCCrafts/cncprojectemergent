import { useState, useEffect } from 'react';
import {
  Package, Truck, CheckCircle, Clock, XCircle, AlertCircle,
  ChevronDown, LogIn, ShoppingBag, Calendar, MapPin, Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_STEPS = ['pending', 'confirmed', 'ready_to_ship', 'shipped', 'delivered'];

const STATUS_META = {
  pending:   { icon: <Clock size={20} strokeWidth={1.75} />,       label: 'Order Placed', color: 'var(--warning)' },
  confirmed: { icon: <Package size={20} strokeWidth={1.75} />,     label: 'Confirmed',    color: '#4338CA' },
  ready_to_ship: { icon: <Truck size={20} strokeWidth={1.75} />,   label: 'Ready to Ship', color: '#0D9488' },
  shipped:   { icon: <Truck size={20} strokeWidth={1.75} />,       label: 'Shipped',      color: '#6D28D9' },
  delivered: { icon: <CheckCircle size={20} strokeWidth={1.75} />, label: 'Delivered',    color: 'var(--success)' },
  cancelled: { icon: <XCircle size={20} strokeWidth={1.75} />,     label: 'Cancelled',    color: 'var(--danger)' },
  rejected:  { icon: <XCircle size={20} strokeWidth={1.75} />,     label: 'Rejected',     color: 'var(--danger)' },
};

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const isCancelled = order.status === 'cancelled' || order.status === 'rejected';

  const placedAt = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <article className="order-card" data-testid={`order-card-${order.id}`}>
      <button
        className="order-card__summary"
        onClick={() => setOpen(!open)}
        data-testid={`order-toggle-${order.id}`}
      >
        <div className="order-card__summary-left">
          <span className="order-card__id">#{String(order.id).padStart(4, '0')}</span>
          <div className="order-card__meta">
            <span className="order-card__meta-item">
              <Calendar size={12} strokeWidth={2} /> {placedAt}
            </span>
            <span className="order-card__meta-item">
              <ShoppingBag size={12} strokeWidth={2} /> {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="order-card__summary-right">
          <span className="order-card__status" style={{ color: meta.color }}>
            <span className="order-card__status-dot" style={{ background: meta.color }} />
            {meta.label}
          </span>
          <span className="order-card__total">₹{order.total.toLocaleString('en-IN')}</span>
          <ChevronDown
            size={18}
            strokeWidth={2}
            className={`order-card__chevron ${open ? 'is-open' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className="order-card__body">
          {/* Progress steps */}
          {!isCancelled ? (
            <div className="order-steps">
              {STATUS_STEPS.map((step, idx) => {
                const done   = idx <= currentStep;
                const active = idx === currentStep;
                const m = STATUS_META[step];
                return (
                  <div key={step} className={`order-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                    <div className="order-step__icon">{m.icon}</div>
                    <p className="order-step__label">{m.label}</p>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`order-step__line ${done && idx < currentStep ? 'done' : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>
) : (
            <div className="order-cancelled">
              <XCircle size={20} /> This order has been {order.status === 'rejected' ? 'rejected.' : 'cancelled.'}
            </div>
          )}

          {/* Items */}
          <div className="order-items">
            <h4>Items</h4>
            {items.map((item, i) => (
              <div key={i} className="order-item">
                {item.image && <img src={item.image} alt={item.name} className="order-item__img" />}
                <div className="order-item__info">
                  <p className="order-item__name">{item.name}</p>
                  <p className="order-item__meta">Qty {item.quantity} · ₹{item.price.toLocaleString('en-IN')} each</p>
                </div>
                <div className="order-item__subtotal">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
            <div className="order-total">
              <span>Order total</span>
              <strong>₹{order.total.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Delivery details */}
          {(order.address || order.customerPhone) && (
            <div className="order-delivery">
              <h4>Delivery details</h4>
              {order.address && (
                <div className="order-delivery__row"><MapPin size={14} /> {order.address}</div>
              )}
              {order.customerPhone && (
                <div className="order-delivery__row"><Phone size={14} /> {order.customerPhone}</div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default function TrackOrder() {
  const { user, setLoginOpen } = useAuth();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    setError('');
    fetch(`/api/orders/mine?email=${encodeURIComponent(user.email)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setOrders)
      .catch(() => setError('Could not load your orders. Please try again.'))
      .finally(() => setLoading(false));
  }, [user?.email]);

  // ── Logged out ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <main className="track-page">
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow eyebrow--center" style={{ color: '#EEC7B4', marginBottom: 20 }}>My Orders</span>
            <h1 className="page-hero__title">
              Sign in to <em>track your&nbsp;orders</em>.
            </h1>
            <p className="page-hero__sub">
              Your orders, deliveries and history — all in one place. Sign in with your customer account to view them.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 560 }}>
            <div className="track-signin-card" data-testid="track-signin-card">
              <div className="track-signin-card__icon">
                <ShoppingBag size={30} strokeWidth={1.5} />
              </div>
              <h2>Access your orders</h2>
              <p>
                Once signed in, you'll see live status, delivery estimates and full history for every order you've placed.
              </p>
              <button
                className="btn-primary track-signin-card__btn"
                onClick={() => setLoginOpen(true)}
                data-testid="track-login-btn"
              >
                <LogIn size={16} /> Sign In to Continue
              </button>
              <p className="track-signin-card__hint">
                New to CNC Crafts? You'll be able to create an account from the same sign-in window.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── Logged in ─────────────────────────────────────────────────────────────
  return (
    <main className="track-page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow--center" style={{ color: '#EEC7B4', marginBottom: 20 }}>My Orders</span>
          <h1 className="page-hero__title">
            Welcome back, <em>{user.name?.split(' ')[0] || 'friend'}</em>.
          </h1>
          <p className="page-hero__sub">
            Here's every order tied to <strong style={{ color: '#fff' }}>{user.email}</strong>, sorted from most recent.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          {loading && (
            <div className="orders-loading" data-testid="orders-loading">
              <div className="skeleton-order" />
              <div className="skeleton-order" />
            </div>
          )}

          {error && (
            <div className="track-error" data-testid="orders-error">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="orders-empty" data-testid="orders-empty">
              <ShoppingBag size={44} strokeWidth={1.25} />
              <h3>No orders yet</h3>
              <p>Once you place an order, it will appear here — with live tracking updates every step of the way.</p>
              <a href="/categories" className="btn-primary" data-testid="orders-shop-btn">
                Browse the collection
              </a>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="orders-list" data-testid="orders-list">
              {orders.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
