import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Tag, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { apiUrl } from '../config/api';

export default function ProductPage() {
  const { id } = useParams();
  const { dispatch } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(apiUrl(`/api/products/${id}`))
      .then((r) => r.json())
      .then((data) => {
        if (active) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setProduct(null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    dispatch({ type: 'ADD_ITEM', item: product });
  };

  if (loading) {
    return (
      <main className="container" style={{ padding: '72px 0' }}>
        <div className="loading-grid">
          <div className="skeleton-card" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container" style={{ padding: '72px 0' }}>
        <Link to="/categories" className="section-head__link" style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to collection
        </Link>
        <div className="cta-card" style={{ padding: 32 }}>
          <h2>Product not found</h2>
          <p>The selected item is unavailable right now.</p>
        </div>
      </main>
    );
  }

  const hasOffer = product.offer_price && product.offer_price < product.price;

  return (
    <main className="container" style={{ padding: '56px 0 84px' }}>
      <Link to="/categories" className="section-head__link" style={{ marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to collection
      </Link>

      <div className="product-detail">
        <div className="product-detail__media">
          {product.image ? (
            <img src={product.image} alt={product.name} className="product-detail__img" />
          ) : (
            <div className="product-detail__img product-card__img--placeholder" />
          )}
        </div>

        <div className="product-detail__content">
          <span className="eyebrow">Featured piece</span>
          <h1 className="page-hero__title" style={{ fontSize: '2.1rem', marginBottom: 16 }}>
            {product.name}
          </h1>

          <p className="product-section__desc" style={{ fontSize: '1rem', maxWidth: '640px' }}>
            {product.description || 'A carefully crafted piece from our CNC studio collection.'}
          </p>

          <div className="product-detail__meta">
            <div className="product-detail__pill">
              <Tag size={16} />
              <span>{product.category || 'General'}</span>
            </div>
            <div className="product-detail__pill">
              <Package size={16} />
              <span>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</span>
            </div>
          </div>

          <div className="product-detail__price-row">
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
              className="product-card__btn"
              onClick={addToCart}
              disabled={product.stock === 0}
            >
              <ShoppingBag size={14} /> Add to cart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
