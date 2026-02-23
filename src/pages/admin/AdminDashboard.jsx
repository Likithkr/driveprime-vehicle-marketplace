import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiList, FiPlusCircle, FiClock, FiCheckCircle, FiXCircle, FiBarChart2, FiHome, FiTag, FiUsers, FiSettings, FiCode, FiShield, FiUser } from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { useCustomer } from '../../hooks/useCustomer';

export default function AdminDashboard() {
    const { state, dispatch } = useStore();
    const customer = useCustomer();
    const navigate = useNavigate();
    const currentUser = customer.getUser();
    const role = currentUser?.role || 'admin';

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
        { to: '/admin/review', icon: FiClock, label: 'Review Submissions', desc: `${pending} pending dealer submissions` },
        { to: '/admin/brands', icon: FiTag, label: 'Manage Brands', desc: 'Add or remove vehicle brands' },
        { to: '/admin/users', icon: FiUsers, label: 'Manage Users', desc: 'View, create and manage all users' },
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

                {/* Quick links */}
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '20px', fontSize: '1.2rem' }}>Quick Actions</h2>
                <div className="grid-3" style={{ marginBottom: '40px' }}>
                    {quickLinks.map(({ to, icon: Icon, label, desc, locked }) => (
                        <Link key={to} to={to} style={{
                            background: locked ? '#f8fafc' : '#fff',
                            borderRadius: 'var(--radius-lg)',
                            border: `1px solid ${locked ? '#e2e8f0' : 'var(--border)'}`,
                            padding: '28px', boxShadow: 'var(--shadow)', display: 'block',
                            transition: 'var(--transition)',
                            opacity: locked ? 0.65 : 1,
                            pointerEvents: locked ? 'none' : 'auto',
                        }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: '12px',
                                background: locked ? 'rgba(100,116,139,0.1)' : 'rgba(249,115,22,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                            }}>
                                <Icon size={24} style={{ color: locked ? '#94a3b8' : 'var(--primary)' }} />
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

                {/* Recent listings table */}
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '20px', fontSize: '1.2rem' }}>Recent Listings</h2>
                <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', background: '#f8fafc' }}>
                                {['Vehicle', 'Year', 'Price', 'KM', 'Location', 'Status'].map(h => (
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
                                    <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.9rem' }}>
                                        {l.brand} {l.model}
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>{l.variant}</div>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{l.year}</td>
                                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                                        ₹{(l.price / 100000).toFixed(1)}L
                                    </td>
                                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{(l.km / 1000).toFixed(0)}k km</td>
                                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{l.city}</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span className={`badge badge-${l.status}`}>{l.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ padding: '16px', textAlign: 'center' }}>
                        <Link to="/admin/listings" className="btn btn-outline btn-sm">View All Listings</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
