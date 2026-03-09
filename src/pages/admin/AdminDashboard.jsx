import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiList, FiPlusCircle, FiClock, FiCheckCircle, FiXCircle, FiBarChart2, FiHome, FiTag, FiUsers, FiSettings, FiCode, FiShield, FiUser, FiKey, FiCalendar, FiMessageCircle, FiMapPin } from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { useAdmin } from '../../hooks/useAdmin';
import { useFlags } from '../../context/FlagsContext';
import { API_BASE } from '../../lib/config';
import { api } from '../../lib/api';

export default function AdminDashboard() {
    const { state, dispatch } = useStore();
    const admin = useAdmin();
    const { flags } = useFlags();
    const navigate = useNavigate();
    const currentUser = admin.getUser();
    const role = currentUser?.role || 'admin';

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        const token = admin.getToken();
        if (token) {
            api.messages.unreadCount(token).then(d => setUnreadMessages(d.count)).catch(() => { });
        }
    }, [admin]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwdError(''); setPwdSuccess('');
        if (pwdForm.new !== pwdForm.confirm) return setPwdError('New passwords do not match');
        if (pwdForm.new.length < 6) return setPwdError('New password must be at least 6 characters');

        setPwdLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${admin.getToken()}` },
                body: JSON.stringify({ currentPassword: pwdForm.current, newPassword: pwdForm.new })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPwdSuccess('Password updated successfully!');
            setPwdForm({ current: '', new: '', confirm: '' });
            setTimeout(() => { setShowPasswordModal(false); setPwdSuccess(''); }, 2000);
        } catch (err) {
            setPwdError(err.message);
        } finally {
            setPwdLoading(false);
        }
    };

    const ROLE_META = {
        developer: { label: 'Developer', color: '#16a34a', bg: '#dcfce7', icon: FiCode, desc: 'Full access · Feature flags · Create any role' },
        admin: { label: 'Admin', color: '#f97316', bg: '#ffedd5', icon: FiShield, desc: 'Full access · Manage listings, users & brands' },
        staff: { label: 'Staff', color: '#7c3aed', bg: '#ede9fe', icon: FiUser, desc: 'Manage listings & brands' },
    };
    const roleMeta = ROLE_META[role] || ROLE_META.admin;
    const RoleIcon = roleMeta.icon;

    if (!state.isAdminLoggedIn) {
        navigate('/admin/login');
        return null;
    }

    const live = state.listings.filter(l => l.status === 'live').length;
    const sold = state.listings.filter(l => l.status === 'sold').length;
    const pending = state.pendingListings.length;
    const total = state.listings.length;

    const stats = [
        { label: 'Live Listings', value: live, color: '#16a34a', bg: '#dcfce7', icon: FiCheckCircle },
        { label: 'Sold Listings', value: sold, color: '#dc2626', bg: '#fee2e2', icon: FiXCircle },
        { label: 'Pending Review', value: pending, color: '#d97706', bg: '#fef3c7', icon: FiClock },
        { label: 'Total Listings', value: total, color: '#0369a1', bg: '#e0f2fe', icon: FiBarChart2 },
    ];

    const quickLinks = [
        { to: '/admin/listings', icon: FiList, label: 'Manage Listings', desc: 'View, edit, mark sold, delete listings' },
        { to: '/admin/add-car', icon: FiPlusCircle, label: 'Add New Car', desc: 'Create a new verified listing' },
        ...(flags.allow_customer_selling?.value ? [{ to: '/admin/review', icon: FiClock, label: 'Review Submissions', desc: `${pending} pending dealer submissions` }] : []),
        { to: '/admin/brands', icon: FiTag, label: 'Manage Brands', desc: 'Add or remove vehicle brands' },
        { to: '/admin/users', icon: FiUsers, label: 'Manage Users', desc: 'View, create and manage all users' },
        { to: '/admin/appointments', icon: FiCalendar, label: 'Appointments', desc: 'Review and confirm viewing requests' },
        { to: '/admin/dealerships', icon: FiMapPin, label: 'Dealerships', desc: 'Manage Drive Prime & partner outlets' },
        {
            to: '/admin/messages', icon: FiMessageCircle, label: 'Messages',
            desc: unreadMessages > 0 ? `${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''}` : 'Internal dealership communication',
            badge: unreadMessages > 0 ? unreadMessages : null,
        },
        {
            to: '/admin/settings', icon: FiSettings, label: 'Feature Flags',
            desc: role === 'developer' ? 'Toggle platform features' : '🔒 Developer only',
            locked: role !== 'developer',
        },
    ];

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 0 80px' }}>
            <div className="container">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        {/* Role badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: '99px', background: roleMeta.bg, color: roleMeta.color, fontWeight: 700, fontSize: '0.78rem', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <RoleIcon size={13} /> {roleMeta.label}
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem' }}>
                            {currentUser ? `Welcome, ${currentUser.name.split(' ')[0]}!` : 'Admin Dashboard'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.875rem' }}>{roleMeta.desc}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link to="/" className="btn btn-outline btn-sm"><FiHome size={14} /> View Site</Link>
                        <button onClick={() => setShowPasswordModal(true)} className="btn btn-outline btn-sm">
                            <FiKey size={14} /> Change Password
                        </button>
                        <button onClick={() => { dispatch({ type: 'ADMIN_LOGOUT' }); navigate('/'); }} className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
                            <FiLogOut size={14} /> Logout
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid-4" style={{ marginBottom: '36px' }}>
                    {stats.map(({ label, value, color, bg, icon: Icon }) => (
                        <div key={label} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--shadow)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                                <div style={{ width: 36, height: 36, borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={18} style={{ color }} />
                                </div>
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color }}>{value}</div>
                        </div>
                    ))}
                </div>

                {/* Bottom two-column layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, alignItems: 'flex-start', marginBottom: '40px' }}
                    className="dashboard-bottom">
                    <style>{`@media(max-width:900px){.dashboard-bottom{grid-template-columns:1fr!important}}`}</style>

                    {/* LEFT — Recent Listings */}
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '20px', fontSize: '1.2rem' }}>Recent Listings</h2>
                        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)', background: '#f8fafc' }}>
                                        {['Vehicle', 'Price', 'Status'].map(h => (
                                            <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.listings.slice(0, 8).map(l => (
                                        <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                        >
                                            <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.88rem' }}>
                                                {l.brand} {l.model}
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>{l.variant} · {l.year}</div>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                                ₹{(l.price / 100000).toFixed(1)}L
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span className={`badge badge-${l.status}`}>{l.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ padding: '14px', textAlign: 'center' }}>
                                <Link to="/admin/listings" className="btn btn-outline btn-sm">View All Listings</Link>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — Review Submissions */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
                                Review Submissions
                            </h2>
                            {pending > 0 && (
                                <span style={{
                                    background: '#fef3c7', color: '#92400e', fontWeight: 800,
                                    fontSize: '0.75rem', padding: '3px 10px', borderRadius: '99px',
                                }}>
                                    {pending} pending
                                </span>
                            )}
                        </div>

                        {!flags.allow_customer_selling?.value ? (
                            <div style={{
                                background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
                                padding: '28px', textAlign: 'center', color: 'var(--text-muted)', boxShadow: 'var(--shadow)',
                            }}>
                                <FiClock size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                                <p style={{ fontSize: '0.875rem' }}>Customer selling is currently disabled.</p>
                            </div>
                        ) : state.pendingListings.length === 0 ? (
                            <div style={{
                                background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
                                padding: '32px', textAlign: 'center', color: 'var(--text-muted)', boxShadow: 'var(--shadow)',
                            }}>
                                <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                                <p style={{ fontWeight: 600, marginBottom: 4 }}>All clear!</p>
                                <p style={{ fontSize: '0.85rem' }}>No pending submissions to review.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {state.pendingListings.slice(0, 5).map(p => (
                                    <div key={p.id} style={{
                                        background: '#fff', borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--border)', padding: '16px 20px',
                                        boxShadow: 'var(--shadow)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                                    }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>
                                                {p.brand} {p.model} {p.variant}
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                <span>{p.year}</span>
                                                <span>·</span>
                                                <span>₹{(p.price / 100000).toFixed(1)}L</span>
                                                <span>·</span>
                                                <span>{p.city}</span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: 4, fontWeight: 600 }}>
                                                Submitted {p.submittedAt}
                                            </div>
                                        </div>
                                        <Link to="/admin/review"
                                            style={{
                                                background: 'rgba(249,115,22,0.1)', color: 'var(--primary)',
                                                borderRadius: '8px', padding: '6px 14px', fontWeight: 700,
                                                fontSize: '0.8rem', whiteSpace: 'nowrap', flexShrink: 0,
                                                textDecoration: 'none',
                                            }}
                                        >
                                            Review →
                                        </Link>
                                    </div>
                                ))}
                                {state.pendingListings.length > 5 && (
                                    <div style={{ textAlign: 'center' }}>
                                        <Link to="/admin/review" className="btn btn-outline btn-sm">
                                            View all {state.pendingListings.length} submissions
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick links */}
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '20px', fontSize: '1.2rem' }}>Quick Actions</h2>
                <div className="grid-3" style={{ marginBottom: '40px' }}>
                    {quickLinks.map(({ to, icon: Icon, label, desc, locked, badge }) => (
                        <Link key={to} to={to} style={{
                            background: locked ? '#f8fafc' : '#fff',
                            borderRadius: 'var(--radius-lg)',
                            border: `1px solid ${locked ? '#e2e8f0' : 'var(--border)'}`,
                            padding: '28px', boxShadow: 'var(--shadow)', display: 'block',
                            transition: 'var(--transition)',
                            opacity: locked ? 0.65 : 1,
                            pointerEvents: locked ? 'none' : 'auto',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '12px',
                                    background: locked ? 'rgba(100,116,139,0.1)' : 'rgba(249,115,22,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={24} style={{ color: locked ? '#94a3b8' : 'var(--primary)' }} />
                                </div>
                                {badge && (
                                    <span style={{ background: '#dc2626', color: '#fff', fontWeight: 800, fontSize: '0.72rem', padding: '3px 9px', borderRadius: 99 }}>
                                        {badge}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                <h3 style={{ fontWeight: 700 }}>{label}</h3>
                                {locked && <span style={{ fontSize: '0.7rem', background: '#e2e8f0', color: '#64748b', padding: '2px 7px', borderRadius: '99px', fontWeight: 600 }}>DEV ONLY</span>}
                                {!locked && label === 'Feature Flags' && <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#16a34a', padding: '2px 7px', borderRadius: '99px', fontWeight: 600 }}>ACTIVE</span>}
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{desc}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
                }}>
                    <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: 400, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ padding: '24px 24px 0' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', marginBottom: 6 }}>Change Password</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Update your account password.</p>
                        </div>
                        <form onSubmit={handlePasswordChange} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {pwdError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem' }}>{pwdError}</div>}
                            {pwdSuccess && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem' }}>{pwdSuccess}</div>}
                            <div>
                                <label className="form-label">Current Password</label>
                                <input type="password" required className="form-input" value={pwdForm.current} onChange={e => setPwdForm({ ...pwdForm, current: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">New Password</label>
                                <input type="password" required className="form-input" value={pwdForm.new} onChange={e => setPwdForm({ ...pwdForm, new: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Confirm New Password</label>
                                <input type="password" required className="form-input" value={pwdForm.confirm} onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" disabled={pwdLoading} className="btn btn-primary" style={{ flex: 1 }}>
                                    {pwdLoading ? 'Updating...' : 'Save Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

