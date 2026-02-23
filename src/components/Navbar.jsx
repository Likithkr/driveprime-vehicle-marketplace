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
    const flags = useFlags();
    const navigate = useNavigate();
    const location = useLocation();
    const isSearchPage = location.pathname === '/search';
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);   // customer auth modal
    const [authMode, setAuthMode] = useState('login');  // 'login' | 'register'
    const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [customerUser, setCustomerUser] = useState(customer.getUser());
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
        setAuthLoading(true);
        try {
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
                                src="/drive-prime-logo.png"
                                alt="Drive Prime"
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
                                <div style={{ position: 'relative' }}>
                                    <button className="btn btn-outline btn-sm" style={{ gap: 6 }}
                                        onClick={() => { customer.logout(); setCustomerUser(null); }}>
                                        <FiUser size={14} /> {customerUser.name.split(' ')[0]}
                                        <FiLogOut size={13} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setAuthOpen(true); setAuthMode('login'); setAuthError(''); }}
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
                            {navLinks.map(({ to, label }) => (
                                <NavLink key={to} to={to} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>{label}</NavLink>
                            ))}
                            {!customerUser && (
                                <button className={styles.mobileLink} onClick={() => { setAuthOpen(true); setMobileOpen(false); }}>
                                    Sign In / Register
                                </button>
                            )}
                            {customerUser && (
                                <button className={styles.mobileLink} onClick={handleCustomerLogout}>Logout ({customerUser.name})</button>
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
                            <img src="/drive-prime-logo.png" alt="Drive Prime" style={{ height: 36, marginBottom: 8 }} />
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
                            {['login', 'register'].map(mode => (
                                <button key={mode} onClick={() => { setAuthMode(mode); setAuthError(''); }}
                                    style={{
                                        flex: 1, padding: '8px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: 600,
                                        fontSize: '0.875rem', transition: 'all 0.2s',
                                        background: authMode === mode ? '#fff' : 'transparent',
                                        color: authMode === mode ? 'var(--primary)' : 'var(--text-muted)',
                                        boxShadow: authMode === mode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                    }}>
                                    {mode === 'login' ? '👋 Sign In' : '✨ Register'}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {authMode === 'register' && (
                                <input value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Full name" className="form-input" required />
                            )}
                            <input value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                                type="email" placeholder="Email address" className="form-input" required />
                            <input value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                                type="password" placeholder="Password" className="form-input" required />
                            {authMode === 'register' && (
                                <input value={authForm.phone} onChange={e => setAuthForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="Phone number (optional)" className="form-input" />
                            )}

                            {authError && (
                                <p style={{ color: '#dc2626', fontSize: '0.85rem', background: '#fee2e2', padding: '10px 14px', borderRadius: '8px' }}>
                                    ⚠️ {authError}
                                </p>
                            )}

                            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 4 }} disabled={authLoading}>
                                {authLoading ? 'Please wait…' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
