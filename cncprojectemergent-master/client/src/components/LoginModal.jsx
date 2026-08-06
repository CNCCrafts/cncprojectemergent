import { useState, useEffect, useRef } from 'react';
import { X, Lock, Mail, Eye, EyeOff, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal() {
  const { loginOpen, setLoginOpen, adminLogin, customerSignup, customerLogin, googleLogin } = useAuth();
  const [mode, setMode] = useState('main');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const reset = () => {
    setMode('main');
    setError('');
    setForm({ name: '', email: '', password: '', confirm: '' });
    setShowPw(false);
  };

  useEffect(() => {
    if (!loginOpen) reset();
  }, [loginOpen]);

  useEffect(() => {
    if (!loginOpen || mode !== 'main') return;
    if (!window.google?.accounts?.id) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        googleLogin({ name: payload.name, email: payload.email, picture: payload.picture });
      },
    });
    if (googleBtnRef.current) {
      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline', size: 'large', width: '100%', text: 'continue_with',
      });
    }
  }, [loginOpen, mode]);

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await customerLogin(form.email, form.password);
    } catch (err) {
      setError(err.message || 'Login failed.');
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await customerSignup(form.name, form.email, form.password);
    } catch (err) {
      setError(err.message || 'Signup failed.');
    }
    setLoading(false);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(form.email, form.password);
      setLoginOpen(false);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    }
    setLoading(false);
  };

  const hasGoogleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!loginOpen) return null;

  const goBack = () => {
    setMode('main');
    setError('');
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((v) => ({ ...v, [key]: e.target.value })),
  });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setLoginOpen(false)}>
      <div className="modal login-modal">
        <div className="modal-header">
          <div className="login-modal__brand">
            <img src="/logo.png" alt="CNC Craft" className="login-modal__logo" />
            <span>
              {mode === 'admin' && 'Admin Login'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'customer-login' && 'Sign In'}
              {mode === 'main' && 'Welcome'}
            </span>
          </div>
          <button onClick={() => setLoginOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body login-modal__body">
          {mode === 'main' && (
            <>
              <p className="login-modal__subtitle">Sign in or create an account to track orders and save your details.</p>

              {hasGoogleClientId ? (
                <div ref={googleBtnRef} className="google-btn-wrap" />
              ) : (
                <div className="google-btn-placeholder">
                  <div className="google-btn-placeholder__inner">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} />
                    Continue with Google
                  </div>
                  <p className="google-btn-note">
                    Add <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in
                  </p>
                </div>
              )}

              <div className="login-modal__divider">
                <span>or</span>
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}
                onClick={() => { setMode('customer-login'); setError(''); }}
              >
                <Mail size={16} /> Sign In with Email
              </button>
              <button
                className="login-modal__signup-link"
                onClick={() => { setMode('signup'); setError(''); }}
              >
                Don't have an account? <strong>Sign Up</strong>
              </button>

              <div className="login-modal__divider">
                <span></span>
              </div>
              <button
                className="login-modal__admin-link"
                onClick={() => { setMode('admin'); setError(''); }}
              >
                <Lock size={14} /> Admin Login
              </button>
            </>
          )}

          {mode === 'customer-login' && (
            <form onSubmit={handleCustomerLogin}>
              <p className="login-modal__subtitle">Sign in to your customer account.</p>
              {error && (
                <div className="login-modal__error">
                  <AlertCircle size={15} /> {error}
                </div>
              )}
              <div className="form-group">
                <label>Email</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input type="email" placeholder="you@email.com" required style={{ paddingLeft: 38 }} {...field('email')} />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input type={showPw ? 'text' : 'password'} placeholder="••••••••" required style={{ paddingLeft: 38 }} {...field('password')} />
                  <button type="button" className="input-icon-right" onClick={() => setShowPw((v) => !v)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
              <button type="button" className="login-modal__signup-link" style={{ marginTop: 12 }}
                onClick={() => { setMode('signup'); setError(''); }}>
                Don't have an account? <strong>Sign Up</strong>
              </button>
              <button type="button" className="login-modal__back" onClick={goBack}>
                ← Back
              </button>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignup}>
              <p className="login-modal__subtitle">Create a free account to track orders.</p>
              {error && (
                <div className="login-modal__error">
                  <AlertCircle size={15} /> {error}
                </div>
              )}
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input type="text" placeholder="Your name" required style={{ paddingLeft: 38 }} {...field('name')} />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input type="email" placeholder="you@email.com" required style={{ paddingLeft: 38 }} {...field('email')} />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" required style={{ paddingLeft: 38 }} {...field('password')} />
                  <button type="button" className="input-icon-right" onClick={() => setShowPw((v) => !v)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input type={showPw ? 'text' : 'password'} placeholder="Repeat password" required style={{ paddingLeft: 38 }} {...field('confirm')} />
                </div>
              </div>
              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
              <button type="button" className="login-modal__signup-link" style={{ marginTop: 12 }}
                onClick={() => { setMode('customer-login'); setError(''); }}>
                Already have an account? <strong>Sign In</strong>
              </button>
              <button type="button" className="login-modal__back" onClick={goBack}>
                ← Back
              </button>
            </form>
          )}

          {mode === 'admin' && (
            <form onSubmit={handleAdminLogin}>
              <p className="login-modal__subtitle">Enter your admin credentials to access the dashboard.</p>
              {error && (
                <div className="login-modal__error">
                  <AlertCircle size={15} /> {error}
                </div>
              )}
              <div className="form-group">
                <label>Admin Email</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input type="email" placeholder="Enter your email address" required style={{ paddingLeft: 38 }} {...field('email')} />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input type={showPw ? 'text' : 'password'} placeholder="••••••••" required style={{ paddingLeft: 38 }} {...field('password')} />
                  <button type="button" className="input-icon-right" onClick={() => setShowPw((v) => !v)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {loading ? 'Signing in…' : 'Sign In as Admin'}
              </button>
              <button type="button" className="login-modal__back" onClick={goBack}>
                ← Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
