import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiUser, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useStore } from '../store/StoreContext';
import { useCustomer } from '../hooks/useCustomer';
import { useFlags } from '../context/FlagsContext';
import { API_BASE } from '../lib/config';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { state } = useStore();
    const customer = useCustomer();
    const { flags } = useFlags();
    const navigate = useNavigate();
    const location = useLocation();
    const isSearchPage = location.pathname === '/search';
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);   // customer auth modal
    const [authMode, setAuthMode] = useState('login');  // 'login' | 'register' | 'forgot_request' | 'forgot_verify'
    const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '', otp: '', newPassword: '' });
    const [authError, setAuthError] = useState('');
    const [authSuccess, setAuthSuccess] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [customerUser, setCustomerUser] = useState(customer.getUser());
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Sync customer state when login/logout happens across other components
    useEffect(() => {
        const handleCustomerChange = () => setCustomerUser(customer.getUser());
        window.addEventListener('customer_state_change', handleCustomerChange);
        window.addEventListener('storage', (e) => {
            if (e.key === 'dp_customer') handleCustomerChange();
        });
        return () => {
            window.removeEventListener('customer_state_change', handleCustomerChange);
            window.removeEventListener('storage', handleCustomerChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Allow other components (e.g. BookAppointmentModal) to open the auth modal
    useEffect(() => {
        const handler = () => { setAuthOpen(true); setAuthMode('login'); setAuthError(''); setAuthSuccess(''); };
        window.addEventListener('dp:open-auth', handler);
        return () => window.removeEventListener('dp:open-auth', handler);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    const handleCustomerLogout = () => {
        customer.logout();
        setCustomerUser(null);
        navigate('/');
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthSuccess('');
        setAuthLoading(true);
        try {
            if (authMode === 'forgot_request') {
                const res = await fetch(`${API_BASE}/api/auth/customer-forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: authForm.email }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setAuthSuccess('OTP sent to your email.');
                setAuthMode('forgot_verify');
                setAuthLoading(false);
                return;
            }

            if (authMode === 'forgot_verify') {
                const res = await fetch(`${API_BASE}/api/auth/customer-reset-password-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: authForm.email, otp: authForm.otp, newPassword: authForm.newPassword }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setAuthSuccess('Password reset successfully! You can now log in.');
                setAuthMode('login');
                setAuthForm({ ...authForm, password: '', otp: '', newPassword: '' });
                setAuthLoading(false);
                return;
            }

            const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const body = authMode === 'login'
                ? { email: authForm.email, password: authForm.password }
                : { name: authForm.name, email: authForm.email, password: authForm.password, phone: authForm.phone };

            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Authentication failed');

            customer.login(data.token, data.user);
            setCustomerUser(data.user);
            setAuthOpen(false);
            setAuthForm({ name: '', email: '', password: '', phone: '' });
        } catch (err) {
            setAuthError(err.message);
        } finally {
            setAuthLoading(false);
        }
    };

    const navLinks = [
        { to: '/search', label: 'Buy Cars' },
        ...(flags.allow_customer_selling?.value ? [{ to: '/dealer-submit', label: 'Sell Your Car' }] : []),
        { to: '/about', label: 'About' },
    ];

    return (
        <>
            <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
                <div className="container">
                    <div className="flex-between" style={{ gap: '16px' }}>
                        <Link to="/" className={styles.logo}>
                            <img
                                src={state?.settings?.site_logo || "/drive-prime-logo.png"}
                                alt={state?.settings?.brand_name || "Drive Prime"}
                                style={{ height: '38px', width: 'auto', objectFit: 'contain', filter: 'brightness(1.1)' }}
                            />
                        </Link>

                        {/* Center search — hidden on the /search page which has its own bar */}
                        {!isSearchPage && (
                            <form onSubmit={handleSearch} className={styles.searchBar}>
                                <FiSearch size={16} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Search brand, model, city..."
                                    className={styles.searchInput}
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className={`btn btn-primary ${styles.searchBtn}`}>Search</button>
                            </form>
                        )}

                        {/* Desktop nav */}
                        <div className={styles.navLinks}>
                            {navLinks.map(({ to, label }) => (
                                <NavLink key={to} to={to} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>{label}</NavLink>
                            ))}

                            {/* Customer Auth only — no admin login button */}
                            {customerUser ? (
                                <Link to="/profile" className="btn btn-outline btn-sm" style={{ gap: 6, textDecoration: 'none' }}>
                                    <FiUser size={14} /> My Profile
                                </Link>
                            ) : (
                                <button
                                    onClick={() => { setAuthOpen(true); setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                                    className="btn btn-outline btn-sm"
                                    style={{ gap: 6 }}
                                >
                                    <FiUser size={14} /> Sign In
                                </button>
                            )}
                        </div>

                        <button className={styles.menuBtn} onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                        </button>
                    </div>

                    {/* Mobile nav */}
                    {mobileOpen && (
                        <div className={styles.mobileNav}>
                            {/* Mobile Search Bar */}
                            {!isSearchPage && (
                                <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }} style={{ padding: '0 4px 12px 4px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '99px', padding: '6px 6px 6px 16px', alignItems: 'center' }}>
                                        <FiSearch size={16} color="rgba(255,255,255,0.5)" />
                                        <input
                                            type="text"
                                            placeholder="Search cars..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', padding: '0 12px', flex: 1, fontSize: '0.95rem' }}
                                        />
                                        <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: '99px' }}>Go</button>
                                    </div>
                                </form>
                            )}

                            {navLinks.map(({ to, label }) => (
                                <NavLink key={to} to={to} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>{label}</NavLink>
                            ))}
                            {!customerUser && (
                                <button className={styles.mobileLink} onClick={() => { setAuthOpen(true); setMobileOpen(false); }}>
                                    Sign In / Register
                                </button>
                            )}
                            {customerUser && (
                                <NavLink to="/profile" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                                    My Profile ({customerUser.name.split(' ')[0]})
                                </NavLink>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* ── Customer Auth Modal ───────────────────────────────────────── */}
            {authOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                }} onClick={() => setAuthOpen(false)}>
                    <div style={{
                        background: '#fff', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '400px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                    }} onClick={e => e.stopPropagation()}>
                        {/* Logo */}
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <img src={state?.settings?.site_logo || "/drive-prime-logo.png"} alt={state?.settings?.brand_name || "Drive Prime"} style={{ height: 36, marginBottom: 8 }} />
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
                            {['login', 'register'].map(mode => (
                                <button key={mode} onClick={() => { setAuthMode(mode); setAuthError(''); setAuthSuccess(''); }}
                                    style={{
                                        flex: 1, padding: '8px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: 600,
                                        fontSize: '0.875rem', transition: 'all 0.2s',
                                        background: authMode === mode || (mode === 'login' && authMode.startsWith('forgot')) ? '#fff' : 'transparent',
                                        color: authMode === mode || (mode === 'login' && authMode.startsWith('forgot')) ? 'var(--primary)' : 'var(--text-muted)',
                                        boxShadow: authMode === mode || (mode === 'login' && authMode.startsWith('forgot')) ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                    }}>
                                    {mode === 'login' ? '👋 Sign In' : '✨ Register'}
                                </button>
                            ))}
                        </div>

                        {authMode.startsWith('forgot') && (
                            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Reset Password</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {authMode === 'forgot_request' ? "Enter your email to receive an OTP." : "Enter the OTP sent to your email."}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {authMode === 'register' && (
                                <input value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Full name" className="form-input" required />
                            )}
                            {(authMode === 'login' || authMode === 'register' || authMode === 'forgot_request') && (
                                <input value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                                    type="email" placeholder="Email address" className="form-input" required={authMode !== 'forgot_verify'} disabled={authMode === 'forgot_verify'} />
                            )}
                            {(authMode === 'login' || authMode === 'register') && (
                                <div>
                                    <input value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                                        type="password" placeholder="Password" className="form-input" required />
                                    {authMode === 'login' && (
                                        <div style={{ textAlign: 'right', marginTop: '6px' }}>
                                            <button type="button" onClick={() => { setAuthMode('forgot_request'); setAuthError(''); setAuthSuccess(''); }}
                                                style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, border: 'none', background: 'none' }}>
                                                Forgot password?
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            {authMode === 'register' && (
                                <input value={authForm.phone} onChange={e => setAuthForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="Phone number (optional)" className="form-input" />
                            )}
                            {authMode === 'forgot_verify' && (
                                <>
                                    <input value={authForm.otp} onChange={e => setAuthForm(f => ({ ...f, otp: e.target.value.replace(/\D/g, '') }))}
                                        placeholder="6-Digit OTP" className="form-input" required maxLength="6" style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }} />
                                    <input value={authForm.newPassword} onChange={e => setAuthForm(f => ({ ...f, newPassword: e.target.value }))}
                                        type="password" placeholder="New Password" className="form-input" required minLength="6" />
                                </>
                            )}

                            {authError && (
                                <p style={{ color: '#dc2626', fontSize: '0.85rem', background: '#fee2e2', padding: '10px 14px', borderRadius: '8px' }}>
                                    ⚠️ {authError}
                                </p>
                            )}
                            {authSuccess && (
                                <p style={{ color: '#16a34a', fontSize: '0.85rem', background: '#dcfce7', padding: '10px 14px', borderRadius: '8px' }}>
                                    ✓ {authSuccess}
                                </p>
                            )}

                            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 4 }} disabled={authLoading}>
                                {authLoading ? 'Please wait…' :
                                    authMode === 'login' ? 'Sign In' :
                                        authMode === 'register' ? 'Create Account' :
                                            authMode === 'forgot_request' ? 'Send OTP' : 'Reset Password'}
                            </button>
                            {authMode.startsWith('forgot') && (
                                <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                                    className="btn btn-outline" style={{ justifyContent: 'center', marginTop: '4px' }}>
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
