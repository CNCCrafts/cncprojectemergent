import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);   // logged-in customer
  const [isAdmin, setIsAdmin]   = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    // Restore admin session
    const token = localStorage.getItem('cnc_admin_token');
    if (token) {
      fetch('/api/auth/verify', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? setIsAdmin(true) : localStorage.removeItem('cnc_admin_token'))
        .catch(() => {});
    }
    // Restore customer session
    const savedUser = localStorage.getItem('cnc_user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch {}
    }
  }, []);

  // ── Admin login ───────────────────────────────────────────────────────────
  const adminLogin = async (email, password) => {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const { token } = await res.json();
    localStorage.setItem('cnc_admin_token', token);
    setIsAdmin(true);
  };

  // ── Customer signup ───────────────────────────────────────────────────────
  const customerSignup = async (name, email, password) => {
    const res = await fetch('/api/auth/customer-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    const u = { name: data.customer.name, email: data.customer.email };
    setUser(u);
    localStorage.setItem('cnc_user', JSON.stringify(u));
    setLoginOpen(false);
  };

  // ── Customer email login ──────────────────────────────────────────────────
  const customerLogin = async (email, password) => {
    const res = await fetch('/api/auth/customer-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    const u = { name: data.customer.name, email: data.customer.email };
    setUser(u);
    localStorage.setItem('cnc_user', JSON.stringify(u));
    setLoginOpen(false);
  };

  // ── Google login ──────────────────────────────────────────────────────────
  const googleLogin = (googleUser) => {
    const u = { name: googleUser.name, email: googleUser.email, picture: googleUser.picture };
    setUser(u);
    localStorage.setItem('cnc_user', JSON.stringify(u));
    setLoginOpen(false);
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('cnc_admin_token');
    localStorage.removeItem('cnc_user');
    if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect();
  };

  return (
    <AuthContext.Provider value={{
      user, isAdmin, loginOpen, setLoginOpen,
      adminLogin, customerSignup, customerLogin, googleLogin, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
