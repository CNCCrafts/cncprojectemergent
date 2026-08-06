import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, ChevronDown, LayoutDashboard, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
{ label: 'Home',        to: '/'           },
  { label: 'Products',    to: '/categories' },
  { label: 'My Orders',   to: '/track'      },
  { label: 'About',       to: '/about'      },
  { label: 'Contact',     to: '/contact'    },
];

export default function Navbar({ onCartOpen }) {
  const { count } = useCart();
  const { user, isAdmin, setLoginOpen, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isLoggedIn = !!user || isAdmin;

  return (
    <nav data-testid="site-navbar" className={`site-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-nav__inner container">
        {/* Left cluster */}
        <div className="site-nav__left">
          <Link to="/" className="site-nav__logo" data-testid="nav-logo">
            <img src="/logo.png" alt="CNC Crafts" className="site-nav__logo-img" />
            <span className="site-nav__logo-text">
              CNC <em>Crafts</em>
            </span>
          </Link>

          <div className="site-nav__links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`site-nav__link ${location.pathname === link.to ? 'is-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right cluster */}
        <div className="site-nav__right">
          <div className="site-nav__search" data-testid="nav-search">
            <Search size={16} strokeWidth={2} />
            <input type="text" placeholder="Search the studio…" aria-label="Search products" />
          </div>

          <button
            className="site-nav__icon-btn"
            onClick={onCartOpen}
            aria-label="Open cart"
            data-testid="nav-cart-btn"
          >
            <ShoppingBag size={20} strokeWidth={1.75} />
            {count > 0 && <span className="site-nav__cart-badge">{count}</span>}
          </button>

          {isLoggedIn ? (
            <div className="site-nav__user">
              <button
                className="site-nav__user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                data-testid="nav-user-btn"
              >
                <span className="site-nav__user-avatar">
                  <User size={14} />
                </span>
                <span className="site-nav__user-name">
                  {isAdmin ? 'Admin' : (user?.name?.split(' ')[0] || 'Account')}
                </span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="site-nav__dropdown" data-testid="nav-user-dropdown">
                  {isAdmin && (
                    <Link to="/admin" className="site-nav__dropdown-item">
                      <LayoutDashboard size={15} /> Admin Panel
                    </Link>
                  )}
                  <button
                    className="site-nav__dropdown-item is-danger"
                    onClick={logout}
                    data-testid="nav-logout-btn"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="site-nav__login-btn"
              onClick={() => setLoginOpen(true)}
              data-testid="nav-login-btn"
            >
              <User size={15} />
              <span>Sign In</span>
            </button>
          )}

          <button
            className="site-nav__menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            data-testid="nav-mobile-toggle"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="site-nav__mobile" data-testid="nav-mobile">
          <div className="site-nav__mobile-search">
            <Search size={16} />
            <input type="text" placeholder="Search the studio…" />
          </div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`site-nav__mobile-link ${location.pathname === link.to ? 'is-active' : ''}`}
              data-testid={`nav-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="site-nav__mobile-link">Admin Panel</Link>
          )}
          <div className="site-nav__mobile-actions">
            {!isLoggedIn ? (
              <button className="btn-primary" onClick={() => setLoginOpen(true)} data-testid="nav-mobile-login">
                <User size={15} /> Sign In / Register
              </button>
            ) : (
              <button className="btn-ghost" onClick={logout} data-testid="nav-mobile-logout">
                <LogOut size={15} /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
