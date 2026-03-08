import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiEye, FiEyeOff, FiCode, FiShield } from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/ToastProvider';
import { useAdmin } from '../../hooks/useAdmin';
import { API_BASE } from '../../lib/config';


const ROLE_META = {
    developer: { label: 'Developer Portal', color: '#16a34a', icon: FiCode, bg: 'rgba(22,163,74,0.15)' },
    admin: { label: 'Admin Portal', color: '#f97316', icon: FiShield, bg: 'rgba(249,115,22,0.15)' },
    staff: { label: 'Staff Portal', color: '#7c3aed', icon: FiShield, bg: 'rgba(124,58,237,0.15)' },
};

export default function AdminLoginPage() {
    const { state, dispatch } = useStore();
    const { addToast } = useToast();
    const admin = useAdmin();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Forgot Password States
    const [showForgot, setShowForgot] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1 = request email, 2 = enter OTP & confirm
    const [forgotEmail, setForgotEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotStatus, setForgotStatus] = useState({ type: '', msg: '' });

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotStatus({ type: 'loading', msg: 'Sending OTP...' });
        try {
            const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setForgotStatus({ type: 'success', msg: data.message });
            setForgotStep(2); // Move to OTP verification
        } catch (err) {
            setForgotStatus({ type: 'error', msg: err.message });
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setForgotStatus({ type: 'loading', msg: 'Verifying & resetting...' });
        try {
            const res = await fetch(`${API_BASE}/api/auth/reset-password-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, otp, newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setForgotStatus({ type: 'success_final', msg: 'Password reset successfully! You can now log in.' });
        } catch (err) {
            setForgotStatus({ type: 'error', msg: err.message });
        }
    };

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
            admin.login(token, user);

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
                    <img src={state?.settings?.site_logo || "/drive-prime-logo.png"} alt={state?.settings?.brand_name || "Drive Prime"}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', fontWeight: 600 }}>Password</label>
                                <button type="button" onClick={() => {
                                    setShowForgot(true);
                                    setForgotStep(1);
                                    setForgotStatus({ type: '', msg: '' });
                                    setForgotEmail(email);
                                    setOtp('');
                                    setNewPassword('');
                                }}
                                    style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    Forgot password?
                                </button>
                            </div>
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

            {/* Forgot Password Modal */}
            {showForgot && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
                }}>
                    <div style={{ background: '#1e293b', borderRadius: '16px', width: '100%', maxWidth: 400, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ padding: '24px 24px 0' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', marginBottom: 6, color: '#fff' }}>Reset Password</h2>
                            {forgotStep === 1 ? (
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>Enter your email to receive a 6-digit OTP code.</p>
                            ) : forgotStatus.type === 'success_final' ? null : (
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>We sent an OTP to <strong>{forgotEmail}</strong>.</p>
                            )}
                        </div>
                        <form onSubmit={forgotStep === 1 ? handleForgotPassword : handleVerifyOtp} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {forgotStatus.type === 'error' && <div style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', border: '1px solid rgba(220,38,38,0.3)' }}>{forgotStatus.msg}</div>}
                            {forgotStatus.type === 'success' && <div style={{ background: 'rgba(22,163,74,0.15)', color: '#4ade80', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', border: '1px solid rgba(22,163,74,0.3)' }}>{forgotStatus.msg}</div>}

                            {forgotStatus.type === 'success_final' ? (
                                <div style={{ background: 'rgba(22,163,74,0.15)', color: '#4ade80', padding: '16px', borderRadius: 8, fontSize: '0.9rem', border: '1px solid rgba(22,163,74,0.3)', textAlign: 'center' }}>
                                    <p style={{ marginBottom: 12 }}>{forgotStatus.msg}</p>
                                </div>
                            ) : forgotStep === 1 ? (
                                <div>
                                    <label className="form-label" style={{ color: '#fff' }}>Email Address</label>
                                    <input type="email" required className="form-input" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                                        style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }} />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="form-label" style={{ color: '#fff' }}>6-Digit OTP</label>
                                        <input type="text" required maxLength="6" className="form-input" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                            placeholder="123456"
                                            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)', letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }} />
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ color: '#fff' }}>New Password</label>
                                        <input type="password" required minLength="6" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }} />
                                    </div>
                                </>
                            )}

                            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                                <button type="button" onClick={() => setShowForgot(false)} className="btn btn-outline" style={{ flex: 1, borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                                    {forgotStatus.type === 'success_final' ? 'Close' : 'Cancel'}
                                </button>
                                {forgotStatus.type !== 'success_final' && (
                                    <button type="submit" disabled={forgotStatus.type === 'loading'} className="btn btn-primary" style={{ flex: 1 }}>
                                        {forgotStatus.type === 'loading' ? 'Loading...' : forgotStep === 1 ? 'Send OTP' : 'Reset Password'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
