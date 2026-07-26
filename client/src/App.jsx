import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar      from './components/Navbar';
import Cart        from './components/Cart';
import LoginModal  from './components/LoginModal';
import OfferBanner from './components/OfferBanner';
import Home        from './pages/Home';
import Categories  from './pages/Categories';
import About       from './pages/About';
import Contact     from './pages/Contact';
import Admin       from './pages/Admin';
import TrackOrder  from './pages/TrackOrder';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import './styles/index.css';
import './styles/auth-track.css';

function AppShell() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />
      <LoginModal />
      <div className="page-wrapper flex flex-col min-h-screen">
        <OfferBanner />
        <Routes>
          <Route path="/"           element={<Home />}       />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about"      element={<About />}      />
          <Route path="/contact"    element={<Contact />}    />
          <Route path="/admin"      element={<Admin />}      />
          <Route path="/track"      element={<TrackOrder />} />
        </Routes>

        <footer className="site-footer">
          <div className="container">
            <div className="site-footer__grid">
              <div className="site-footer__brand-col">
                <Link to="/" className="site-footer__brand">
                  <img src="/logo.png" alt="CNC Crafts" className="site-footer__brand-img" />
                  <span className="site-footer__brand-text">
                    CNC <em>Crafts</em>
                  </span>
                </Link>
                <p className="site-footer__blurb">
                  Precision CNC craftsmanship — acrylic art, MDF laser cuts, ACP signage, PVC displays &amp; bespoke 3D pieces made in India.
                </p>
                <div className="site-footer__socials">
                  <a href="#" aria-label="Instagram"><i className="ti ti-brand-instagram" /></a>
                  <a href="#" aria-label="Facebook"><i className="ti ti-brand-facebook" /></a>
                  <a href="#" aria-label="Pinterest"><i className="ti ti-brand-pinterest" /></a>
                  <a href="#" aria-label="Whatsapp"><i className="ti ti-brand-whatsapp" /></a>
                </div>
              </div>

              <div className="site-footer__col">
                <h5>Explore</h5>
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/categories">Products</Link></li>
                  <li><Link to="/track">Track Order</Link></li>
                  <li><Link to="/about">About</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                </ul>
              </div>

              <div className="site-footer__col">
                <h5>Materials</h5>
                <ul>
                  <li><Link to="/categories#acrylic">Acrylic Art</Link></li>
                  <li><Link to="/categories#mdf">MDF Laser Cut</Link></li>
                  <li><Link to="/categories#acp">ACP Signage</Link></li>
                  <li><Link to="/categories#pvc">PVC Displays</Link></li>
                  <li><Link to="/categories#3d">3D Designs</Link></li>
                </ul>
              </div>

              <div className="site-footer__col site-footer__col--newsletter">
                <h5>Studio Notes</h5>
                <p className="site-footer__newsletter-copy">
                  Get early access to new designs, studio stories &amp; exclusive drops.
                </p>
                <form className="site-footer__newsletter" onSubmit={(e) => e.preventDefault()}>
                  <input type="email" placeholder="you@studio.com" />
                  <button type="submit" aria-label="Subscribe">
                    <i className="ti ti-arrow-narrow-right" />
                  </button>
                </form>
              </div>
            </div>

            <div className="site-footer__base">
              <div>© {new Date().getFullYear()} CNC Craft &amp; Solutions — Precision in Every Cut.</div>
              <div className="site-footer__legal">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Refund Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
