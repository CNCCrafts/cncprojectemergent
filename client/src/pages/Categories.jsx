import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { apiUrl } from '../config/api';

const SECTIONS = [
  { id: 'acrylic', label: 'Acrylic Art',  kicker: '01', icon: 'ti-diamond',        desc: 'Vibrant, crystal-clear acrylic panels for home & office spaces.' },
  { id: 'mdf',     label: 'MDF Art',       kicker: '02', icon: 'ti-leaf',           desc: 'Intricate laser-cut MDF wall art and hand-finished decorative pieces.' },
  { id: 'acp',     label: 'ACP Signage',   kicker: '03', icon: 'ti-building-arch',  desc: 'Aluminium composite panels — the standard for signage & premium branding.' },
  { id: 'pvc',     label: 'PVC Displays',  kicker: '04', icon: 'ti-shape-3',        desc: 'Lightweight and weather-resistant PVC displays & backdrops.' },
  { id: '3d',      label: '3D Designs',    kicker: '05', icon: 'ti-box',            desc: 'Cutting-edge 3D printed custom creations, models and miniatures.' },
  { id: 'custom',  label: 'Custom Order',  kicker: '06', icon: 'ti-pencil-plus',    desc: 'Have a unique vision? Get a personalised quote from our craft team.' },
];

function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);
  const hasOffer = product.offer_price && product.offer_price < product.price;

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card" data-testid={`product-card-${product.id}`}>
      <div className="product-card__img-wrap">
        {product.image
          ? <img src={product.image} alt={product.name} className="product-card__img" loading="lazy" />
          : <div className="product-card__img product-card__img--placeholder" />}
        {product.stock === 0 && (
          <span className="product-card__badge product-card__badge--out">Out of Stock</span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="product-card__badge product-card__badge--low">Only {product.stock} left</span>
        )}
        {hasOffer && product.stock > 0 && (
          <span className="product-card__badge product-card__badge--offer">
            {Math.round((1 - product.offer_price / product.price) * 100)}% Off
          </span>
        )}
      </div>
      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>
        <div className="product-card__footer">
          <div className="product-card__pricing">
            {hasOffer ? (
              <>
                <span className="product-card__price">₹{product.offer_price.toLocaleString('en-IN')}</span>
                <span className="product-card__original-price">₹{product.price.toLocaleString('en-IN')}</span>
              </>
            ) : (
              <span className="product-card__price">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>
          <button
            className={`product-card__btn ${added ? 'product-card__btn--added' : ''}`}
            onClick={handleAdd}
            disabled={product.stock === 0}
            data-testid={`add-to-cart-${product.id}`}
          >
            {added ? <><Check size={14} /> Added</> : <><ShoppingBag size={14} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  const { dispatch } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const location    = useLocation();
  const sectionRefs = useRef({});

  useEffect(() => {
    fetch(apiUrl('/api/products'))
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (location.hash && sectionRefs.current[location.hash.slice(1)]) {
      setTimeout(() => {
        sectionRefs.current[location.hash.slice(1)]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [location.hash, loading]);

  const addToCart = (product) => dispatch({ type: 'ADD_ITEM', item: product });

  const filtered = (category) =>
    products
      .filter(p => p.category === category)
      .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="categories-page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow--center" style={{ color: '#EEC7B4', marginBottom: 20 }}>The Collection</span>
          <h1 className="page-hero__title">
            Every material, <em>meticulously&nbsp;crafted</em>.
          </h1>
          <p className="page-hero__sub">
            Explore our full catalogue — organised by material — from bespoke acrylic edges to weather-resistant PVC displays.
          </p>
          <div className="search-bar" data-testid="categories-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search the studio…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="categories-search-input"
            />
          </div>
        </div>
      </section>

      <div className="cat-nav" data-testid="category-nav">
        <div className="container">
          {SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="cat-nav__link"
              onClick={e => {
                e.preventDefault();
                sectionRefs.current[s.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              data-testid={`category-nav-${s.id}`}
            >
              <span className="cat-nav__dot" /> {s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : (
          SECTIONS.map(section => {
            const items = filtered(section.id);
            return (
              <section
                key={section.id}
                id={section.id}
                ref={el => sectionRefs.current[section.id] = el}
                className="product-section"
                data-testid={`section-${section.id}`}
              >
                <header className="product-section__header">
                  <div className="product-section__header-left">
                    <div className="product-section__kicker-row">
                      <span className="product-section__kicker">{section.kicker}</span>
                      <span className="product-section__icon-badge">
                        <i className={`ti ${section.icon}`} />
                      </span>
                    </div>
                    <div className="product-section__eyebrow">Material Study · {section.label}</div>
                    <h2 className="product-section__title">{section.label}</h2>
                    <p className="product-section__desc">{section.desc}</p>
                  </div>
                  <div className="product-section__count">
                    {items.length.toString().padStart(2, '0')}&nbsp;pieces
                  </div>
                </header>

                {items.length === 0 ? (
                  <p className="no-products">
                    No products found{search ? ` for "${search}"` : ''}.
                  </p>
                ) : (
                  <div className="product-grid">
                    {items.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}
