import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiEye, FiEyeOff, FiCode, FiShield } from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/ToastProvider';
import { useCustomer } from '../../hooks/useCustomer';
import { API_BASE } from '../../lib/config';


const ROLE_META = {
    developer: { label: 'Developer Portal', color: '#16a34a', icon: FiCode, bg: 'rgba(22,163,74,0.15)' },
    admin: { label: 'Admin Portal', color: '#f97316', icon: FiShield, bg: 'rgba(249,115,22,0.15)' },
    staff: { label: 'Staff Portal', color: '#7c3aed', icon: FiShield, bg: 'rgba(124,58,237,0.15)' },
};

export default function AdminLoginPage() {
    const { dispatch } = useStore();
    const { addToast } = useToast();
    const customer = useCustomer();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Login failed');

            const { user, token } = data;

            // Only admin, staff, and developer may access the admin panel
            if (!['admin', 'developer', 'staff'].includes(user.role)) {
                throw new Error('You do not have permission to access the admin panel.');
            }

            // Store JWT (used by AdminUsersPage, AdminSettingsPage, etc.)
            customer.login(token, user);

            // Set legacy admin flag so existing admin pages keep working
            dispatch({ type: 'ADMIN_LOGIN' });

            const meta = ROLE_META[user.role] || ROLE_META.admin;
            addToast(`Welcome, ${user.name}! Logged in as ${meta.label}.`, 'success');
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '20px',
        }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <img src="/drive-prime-logo.png" alt="Drive Prime"
                        style={{ height: '52px', width: 'auto', objectFit: 'contain', marginBottom: '12px', filter: 'brightness(1.1)' }} />
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Staff · Admin · Developer Portal</p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: '36px',
                }}>
                    <h2 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
                        Sign In
                    </h2>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {/* Email */}
                        <div className="form-group">
                            <label style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', fontWeight: 600 }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <FiMail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                                <input value={email} onChange={e => setEmail(e.target.value)}
                                    type="email" placeholder="you@driveprime.in" required
                                    style={{
                                        width: '100%', padding: '12px 16px 12px 42px',
                                        background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)',
                                        borderRadius: 'var(--radius)', color: '#fff', fontSize: '0.95rem', outline: 'none',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', fontWeight: 600 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <FiLock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                                <input value={password} onChange={e => setPassword(e.target.value)}
                                    type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                                    style={{
                                        width: '100%', padding: '12px 42px',
                                        background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)',
                                        borderRadius: 'var(--radius)', color: '#fff', fontSize: '0.95rem', outline: 'none',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 'var(--radius)', padding: '12px 16px', color: '#fca5a5', fontSize: '0.875rem' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    {/* Hint */}
                    <div style={{ marginTop: 24, padding: '14px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Default Accounts</p>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', lineHeight: 1.8 }}>
                            🟢 Developer: <code style={{ color: '#4ade80' }}>dev@driveprime.in</code> / <code style={{ color: '#4ade80' }}>dev123</code><br />
                            🟠 Admin: <code style={{ color: '#fb923c' }}>admin@driveprime.in</code> / <code style={{ color: '#fb923c' }}>admin123</code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
