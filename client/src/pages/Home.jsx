import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Truck, Headphones, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { apiUrl } from '../config/api';


const CATEGORIES = [
  {
    id: 'acrylic',
    label: 'Acrylic Art',
    kicker: '01',
    desc: 'Crystal-clear panels with stunning visual depth and modern finish.',
    icon: 'ti-diamond',
    accent: '#E8DACB',
  },
  {
    id: 'mdf',
    label: 'MDF Art',
    kicker: '02',
    desc: 'Precision laser-cut MDF for intricate wall decor and organic patterns.',
    icon: 'ti-leaf',
    accent: '#DFE8CB',
  },
  {
    id: 'acp',
    label: 'ACP Signage',
    kicker: '03',
    desc: 'Aluminium composite panels for premium signage & brand identity.',
    icon: 'ti-building-arch',
    accent: '#CBDCE8',
  },
  {
    id: 'pvc',
    label: 'PVC Displays',
    kicker: '04',
    desc: 'Lightweight, weather-resistant displays, backdrops & letter forms.',
    icon: 'ti-shape-3',
    accent: '#F2DCD1',
  },
  {
    id: '3d',
    label: '3D Designs',
    kicker: '05',
    desc: 'Cutting-edge 3D printed creations, miniatures and technical models.',
    icon: 'ti-box',
    accent: '#E4D6E8',
  },
];

const FEATURES = [
  { icon: <Star size={20} strokeWidth={1.75} />,        title: 'Premium Quality', desc: 'CNC Precision Technology' },
  { icon: <ShieldCheck size={20} strokeWidth={1.75} />, title: 'Secure Payment',  desc: '100% Safe Checkout' },
  { icon: <Truck size={20} strokeWidth={1.75} />,       title: 'Fast Shipping',   desc: 'Delivered Across India' },
  { icon: <Headphones size={20} strokeWidth={1.75} />,  title: '24/7 Support',    desc: 'Expert Design Advice' },
];

export default function Home() {
  const { dispatch } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(apiUrl('/api/products'))
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const bestsellers = products.slice(0, 4);
  const addToCart = (p) => dispatch({ type: 'ADD_ITEM', item: p });

  return (
    <main className="home-page">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__glow" aria-hidden />
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="eyebrow">Premium CNC Craftsmanship</span>
            <h1 className="hero__title">
              Precision in <em>every&nbsp;cut,</em>
              <br />
              art in every&nbsp;<span className="hero__title-underline">detail</span>.
            </h1>
            <p className="hero__lead">
              Bespoke acrylic, MDF, ACP, PVC and 3D-printed pieces — crafted for those who
              appreciate technical perfection and quiet luxury.
            </p>
            <div className="hero__actions">
              <Link to="/categories" className="btn-primary" data-testid="hero-shop-btn">
                Shop the Collection <ArrowUpRight size={17} strokeWidth={2} />
              </Link>
              <Link to="/contact" className="btn-ghost" data-testid="hero-quote-btn">
                Request a Quote
              </Link>
            </div>

            <dl className="hero__stats">
              <div>
                <dt>Projects Delivered</dt>
                <dd>2,000<span>+</span></dd>
              </div>
              <div>
                <dt>Materials Mastered</dt>
                <dd>05</dd>
              </div>
              <div>
                <dt>Years of Craft</dt>
                <dd>05<span>+</span></dd>
              </div>
            </dl>
          </div>

          <div className="hero__gallery">
            <figure className="hero__frame hero__frame--main">
              <img
                src="https://images.unsplash.com/photo-1704423896061-b0a1057e20a3?auto=format&w=900&q=80&fit=crop"
                alt="Intricate laser-cut wooden mandala relief"
                loading="eager"
              />
              <figcaption>
                <span className="hero__frame-tag">Signature Piece</span>
                <strong>Mandala Wood Relief</strong>
                <em>"Absolute precision on my custom order."</em>
              </figcaption>
            </figure>
            <figure className="hero__frame hero__frame--sub-a">
              <img
                src="https://images.unsplash.com/photo-1562541996-dc329febcdbc?auto=format&w=500&q=80&fit=crop"
                alt="Acrylic LED sign"
              />
            </figure>
            <figure className="hero__frame hero__frame--sub-b">
              <img
                src="https://images.unsplash.com/photo-1643199350511-ffc840cf7c34?auto=format&w=500&q=80&fit=crop"
                alt="3D printed architecture model"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* ── Trust bar ───────────────────────────────────────────────────── */}
      <section className="trust-bar">
        <div className="container trust-bar__grid">
          {FEATURES.map((f) => (
            <div className="trust-bar__item" key={f.title}>
              <span className="trust-bar__icon">{f.icon}</span>
              <div>
                <div className="trust-bar__title">{f.title}</div>
                <div className="trust-bar__desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────────────── */}
      <section className="section categories-showcase">
        <div className="container">
          <header className="section-head">
            <div>
              <span className="eyebrow">Browse by Material</span>
              <h2 className="section-head__title">
                Five materials, <em>infinite&nbsp;possibilities</em>.
              </h2>
            </div>
            <p className="section-head__lede">
              Every category is anchored by a signature technique — from vapour-polished
              acrylic edges to hand-finished MDF reliefs.
            </p>
          </header>

          <div className="cat-showcase-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories#${cat.id}`}
                className="cat-tile"
                data-testid={`home-cat-${cat.id}`}
                style={{ '--tile-accent': cat.accent }}
              >
                <div className="cat-tile__frame">
                  <span className="cat-tile__kicker">{cat.kicker}</span>
                  <span className="cat-tile__icon">
                    <i className={`ti ${cat.icon}`} />
                  </span>
                </div>
                <div className="cat-tile__body">
                  <h3>{cat.label}</h3>
                  <p>{cat.desc}</p>
                  <span className="cat-tile__cta">
                    Explore <ArrowUpRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bestsellers ────────────────────────────────────────────────── */}
      <section className="section bestsellers">
        <div className="container">
          <header className="section-head section-head--split">
            <div>
              <span className="eyebrow">Bestselling Crafts</span>
              <h2 className="section-head__title">
                Studio favourites, <em>hand-picked</em>.
              </h2>
            </div>
            <Link to="/categories" className="section-head__link" data-testid="bestseller-view-all">
              View the full collection <ArrowUpRight size={16} />
            </Link>
          </header>

          {bestsellers.length === 0 ? (
            <div className="loading-grid">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : (
            <div className="product-grid">
              {bestsellers.map((p) => {
                const hasOffer = p.offer_price && p.offer_price < p.price;
                return (
                  <div key={p.id} className="product-card" data-testid={`home-product-${p.id}`}>
                    <div className="product-card__img-wrap">
                      {p.image
                        ? <img src={p.image} alt={p.name} className="product-card__img" loading="lazy" />
                        : <div className="product-card__img product-card__img--placeholder" />}
                      {hasOffer && (
                        <span className="product-card__badge product-card__badge--offer">
                          {Math.round((1 - p.offer_price / p.price) * 100)}% Off
                        </span>
                      )}
                    </div>
                    <div className="product-card__body">
                      <h3 className="product-card__name">{p.name}</h3>
                      <p className="product-card__desc">{p.description}</p>
                      <div className="product-card__footer">
                        <div className="product-card__pricing">
                          {hasOffer ? (
                            <>
                              <span className="product-card__price">₹{p.offer_price.toLocaleString('en-IN')}</span>
                              <span className="product-card__original-price">₹{p.price.toLocaleString('en-IN')}</span>
                            </>
                          ) : (
                            <span className="product-card__price">₹{p.price.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        <button
                          className="product-card__btn"
                          onClick={() => addToCart(p)}
                          disabled={p.stock === 0}
                          data-testid={`home-add-to-cart-${p.id}`}
                        >
                          <ShoppingBag size={14} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="section cta-block">
        <div className="container">
          <div className="cta-card">
            <div className="cta-card__pattern" aria-hidden />
            <div className="cta-card__inner">
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>Custom Commissions</span>
              <h2>
                Ready to create <em>something&nbsp;beautiful?</em>
              </h2>
              <p>
                From boutique retail signage to statement wall pieces — our team turns
                blueprints into precision-crafted reality.
              </p>
              <div className="cta-card__actions">
                <Link to="/categories" className="btn-primary btn-accent" data-testid="cta-start-btn">
                  Start Shopping <ArrowUpRight size={17} />
                </Link>
                <Link to="/contact" className="btn-ghost cta-card__ghost" data-testid="cta-contact-btn">
                  Talk to a Craftsman
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
