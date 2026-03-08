import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiTag } from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/ToastProvider';
import { api } from '../../lib/api';
import { useAdmin } from '../../hooks/useAdmin';

const TYPES = ['car', 'bike', 'both'];

export default function AdminBrandsPage() {
    const { state } = useStore();
    const { addToast } = useToast();
    const admin = useAdmin();
    const navigate = useNavigate();

    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('both');
    const [adding, setAdding] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState('both');
    const [search, setSearch] = useState('');

    if (!state.isAdminLoggedIn) { navigate('/admin/login'); return null; }

    useEffect(() => {
        api.brands.getAll()
            .then(data => { setBrands(data); setLoading(false); })
            .catch(() => { addToast('Failed to load brands', 'error'); setLoading(false); });
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setAdding(true);
        try {
            const created = await api.brands.add({ name: newName.trim(), type: newType });
            setBrands(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
            setNewName('');
            setNewType('both');
            addToast(`Brand "${created.name}" added!`, 'success');
        } catch (err) {
            addToast(err.message.includes('already') ? 'Brand already exists' : 'Failed to add brand', 'error');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (brand) => {
        if (!window.confirm(`Delete brand "${brand.name}"? This does NOT affect existing listings.`)) return;
        try {
            await api.brands.remove(brand.id);
            setBrands(prev => prev.filter(b => b.id !== brand.id));
            addToast(`"${brand.name}" deleted.`, 'info');
        } catch {
            addToast('Failed to delete brand', 'error');
        }
    };

    const startEdit = (brand) => {
        setEditId(brand.id);
        setEditName(brand.name);
        setEditType(brand.type);
    };

    const handleUpdate = async (id) => {
        try {
            const updated = await api.brands.update(id, { name: editName.trim(), type: editType, logo_url: '' });
            setBrands(prev => prev.map(b => b.id === id ? updated : b).sort((a, b) => a.name.localeCompare(b.name)));
            setEditId(null);
            addToast('Brand updated!', 'success');
        } catch {
            addToast('Failed to update brand', 'error');
        }
    };

    const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
    const typeBadge = (t) => ({ car: '#0369a1', bike: '#d97706', both: '#16a34a' }[t] || '#6b7280');
    const typeBg = (t) => ({ car: '#e0f2fe', bike: '#fef3c7', both: '#dcfce7' }[t] || '#f3f4f6');

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 0 80px' }}>
            <div className="container" style={{ maxWidth: '860px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <Link to="/admin/dashboard" className="btn btn-outline btn-sm"><FiArrowLeft size={14} /></Link>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>
                            Manage Vehicle Brands
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{brands.length} brands · used in listings &amp; filters</p>
                    </div>
                </div>

                {/* Add brand card */}
                <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow)' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '16px' }}>
                        <FiPlus size={16} style={{ marginRight: 6 }} />Add New Brand
                    </h2>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Brand name (e.g. Porsche)"
                            className="form-input"
                            style={{ flex: 1, minWidth: '200px' }}
                            required
                        />
                        <select value={newType} onChange={e => setNewType(e.target.value)} className="form-select" style={{ width: 'auto' }}>
                            <option value="car">Car only</option>
                            <option value="bike">Bike only</option>
                            <option value="both">Both</option>
                        </select>
                        <button type="submit" className="btn btn-primary" disabled={adding}>
                            {adding ? 'Adding…' : <><FiPlus size={15} /> Add Brand</>}
                        </button>
                    </form>
                </div>

                {/* Search + list */}
                <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiTag size={16} style={{ color: 'var(--primary)' }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search brands…"
                            className="form-input"
                            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '4px 0' }}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filtered.length} results</span>
                    </div>

                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
                    ) : (
                        <div>
                            {filtered.map((brand, i) => (
                                <div key={brand.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '12px 20px',
                                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                                    background: editId === brand.id ? '#fafafa' : '#fff',
                                }}>
                                    {editId === brand.id ? (
                                        <>
                                            <input value={editName} onChange={e => setEditName(e.target.value)}
                                                className="form-input" style={{ flex: 1 }} autoFocus />
                                            <select value={editType} onChange={e => setEditType(e.target.value)} className="form-select" style={{ width: 'auto' }}>
                                                <option value="car">Car</option>
                                                <option value="bike">Bike</option>
                                                <option value="both">Both</option>
                                            </select>
                                            <button onClick={() => handleUpdate(brand.id)} className="btn btn-sm" style={{ background: '#dcfce7', color: '#16a34a' }}><FiCheck size={14} /></button>
                                            <button onClick={() => setEditId(null)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626' }}><FiX size={14} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ flex: 1, fontWeight: 600 }}>{brand.name}</span>
                                            <span style={{
                                                fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px',
                                                borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.5px',
                                                background: typeBg(brand.type), color: typeBadge(brand.type),
                                            }}>{brand.type}</span>
                                            <button onClick={() => startEdit(brand)} className="btn btn-sm btn-outline"><FiEdit2 size={13} /></button>
                                            <button onClick={() => handleDelete(brand)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626' }}><FiTrash2 size={13} /></button>
                                        </>
                                    )}
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No brands found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
