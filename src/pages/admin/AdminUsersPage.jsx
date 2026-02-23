import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiUser, FiShield, FiCode } from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/ToastProvider';
import { useCustomer } from '../../hooks/useCustomer';
import { API_BASE } from '../../lib/config';

const ROLES = ['customer', 'staff', 'admin', 'developer'];

const roleMeta = {
    customer: { color: '#0369a1', bg: '#e0f2fe', label: 'Customer', icon: FiUser },
    staff: { color: '#7c3aed', bg: '#ede9fe', label: 'Staff', icon: FiUser },
    admin: { color: '#d97706', bg: '#fef3c7', label: 'Admin', icon: FiShield },
    developer: { color: '#16a34a', bg: '#dcfce7', label: 'Developer', icon: FiCode },
};

export default function AdminUsersPage() {
    const { state } = useStore();
    const { addToast } = useToast();
    const customerHook = useCustomer();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
    const [creating, setCreating] = useState(false);

    if (!state.isAdminLoggedIn) { navigate('/admin/login'); return null; }

    // Get admin token from customer session (admin logs in with same /api/auth/login)
    const adminToken = customerHook.getToken();

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
    };

    useEffect(() => {
        fetch(`${API_BASE}/api/users`, { headers: authHeaders })
            .then(r => r.json())
            .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch(`${API_BASE}/api/users`, {
                method: 'POST', headers: authHeaders, body: JSON.stringify(createForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setUsers(prev => [data, ...prev]);
            setShowCreate(false);
            setCreateForm({ name: '', email: '', password: '', role: 'customer', phone: '' });
            addToast(`User "${data.name}" created!`, 'success');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/users/${id}`, {
                method: 'PUT', headers: authHeaders, body: JSON.stringify(editData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setUsers(prev => prev.map(u => u.id === id ? data : u));
            setEditId(null);
            addToast('User updated!', 'success');
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Delete user "${user.name}"?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/users/${user.id}`, { method: 'DELETE', headers: authHeaders });
            if (!res.ok) throw new Error((await res.json()).error);
            setUsers(prev => prev.filter(u => u.id !== user.id));
            addToast(`"${user.name}" deleted.`, 'info');
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const filtered = users.filter(u =>
        `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())
    );

    const RoleBadge = ({ role }) => {
        const m = roleMeta[role] || roleMeta.customer;
        const Icon = m.icon;
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px',
                background: m.bg, color: m.color, textTransform: 'uppercase', letterSpacing: '0.5px',
            }}><Icon size={11} /> {m.label}</span>
        );
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 0 80px' }}>
            <div className="container">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Link to="/admin/dashboard" className="btn btn-outline btn-sm"><FiArrowLeft size={14} /></Link>
                        <div>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>User Management</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{users.length} total users</p>
                        </div>
                    </div>
                    <button onClick={() => setShowCreate(true)} className="btn btn-primary">
                        <FiPlus size={15} /> New User
                    </button>
                </div>

                {/* Create modal */}
                {showCreate && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                        onClick={() => setShowCreate(false)}>
                        <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                            onClick={e => e.stopPropagation()}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Create New User</h2>
                            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" className="form-input" required />
                                <input value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="Email" className="form-input" required />
                                <input value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} type="password" placeholder="Password" className="form-input" required />
                                <input value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone (optional)" className="form-input" />
                                <select value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))} className="form-select">
                                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                                </select>
                                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                    <button type="button" onClick={() => setShowCreate(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={creating}>
                                        {creating ? 'Creating…' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div style={{ marginBottom: 16 }}>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, role…" className="form-input" style={{ maxWidth: 360 }} />
                </div>

                {/* Table */}
                <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', background: '#f8fafc' }}>
                                {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</td></tr>
                            ) : filtered.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    {editId === user.id ? (
                                        <>
                                            <td style={{ padding: '10px 16px' }}>
                                                <input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} className="form-input" style={{ width: '100%' }} />
                                            </td>
                                            <td style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.email}</td>
                                            <td style={{ padding: '10px 16px' }}>
                                                <input value={editData.phone} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))} className="form-input" />
                                            </td>
                                            <td style={{ padding: '10px 16px' }}>
                                                <select value={editData.role} onChange={e => setEditData(d => ({ ...d, role: e.target.value }))} className="form-select">
                                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </td>
                                            <td></td>
                                            <td style={{ padding: '10px 16px', display: 'flex', gap: 6 }}>
                                                <button onClick={() => handleUpdate(user.id)} className="btn btn-sm" style={{ background: '#dcfce7', color: '#16a34a' }}><FiCheck size={14} /></button>
                                                <button onClick={() => setEditId(null)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626' }}><FiX size={14} /></button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{user.name}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.email}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.phone || '—'}</td>
                                            <td style={{ padding: '12px 16px' }}><RoleBadge role={user.role} /></td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button onClick={() => { setEditId(user.id); setEditData({ name: user.name, role: user.role, phone: user.phone }); }} className="btn btn-sm btn-outline"><FiEdit2 size={13} /></button>
                                                    <button onClick={() => handleDelete(user)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626' }}><FiTrash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {!loading && filtered.length === 0 && (
                                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
