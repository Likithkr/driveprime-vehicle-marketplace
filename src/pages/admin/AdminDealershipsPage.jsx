import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiMapPin, FiPhone, FiMail, FiX, FiSave, FiHome, FiUsers } from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/ToastProvider';
import { api } from '../../lib/api';
import { useAdmin } from '../../hooks/useAdmin';
import { INDIA_STATES } from '../../data/mockData';

import PinCodeInput from '../../components/PinCodeInput';

const emptyForm = {
    name: '', type: 'drive_prime', address: '', town: '', city: '', taluk: '', district: '', state: '', pincode: '', phone: '', email: '',
};

export default function AdminDealershipsPage() {
    const { state } = useStore();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const admin = useAdmin();
    const token = admin.getToken();

    const [dealerships, setDealerships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('drive_prime');
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        if (!state.isAdminLoggedIn) navigate('/admin/login');
    }, [state.isAdminLoggedIn]);

    const load = useCallback(async () => {
        try {
            const data = await api.dealerships.getAll();
            setDealerships(data);
        } catch {
            addToast('Failed to load dealerships', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);


    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const openEdit = (d) => { setForm({ name: d.name, type: d.type, address: d.address, town: d.town || '', city: d.city, taluk: d.taluk || '', district: d.district || '', state: d.state, pincode: d.pincode || '', phone: d.phone, email: d.email }); setModal({ mode: 'edit', id: d.id }); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return addToast('Name is required', 'error');
        setSaving(true);
        try {
            if (modal.mode === 'add') {
                await api.dealerships.add(form, token);
                addToast('Dealership added!', 'success');
            } else {
                await api.dealerships.update(modal.id, form, token);
                addToast('Dealership updated!', 'success');
            }
            setModal(null);
            load();
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.dealerships.remove(deleteTarget.id, token);
            addToast('Dealership removed', 'success');
            setDeleteTarget(null);
            load();
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const filtered = dealerships.filter(d => d.type === activeTab);
    const cities = form.state ? INDIA_STATES[form.state] || [] : [];

    const TYPE_META = {
        drive_prime: { label: 'Drive Prime', color: '#f97316', bg: '#ffedd5', desc: 'Owned Drive Prime outlet' },
        third_party: { label: '3rd Party', color: '#2563eb', bg: '#dbeafe', desc: 'Partner dealership' },
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 0 80px' }}>
            <div className="container" style={{ maxWidth: 900 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                    <Link to="/admin/dashboard" className="btn btn-outline btn-sm"><FiArrowLeft size={14} /></Link>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>Dealerships</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>Manage Drive Prime outlets and 3rd party partner dealerships</p>
                    </div>
                    <button className="btn btn-primary" onClick={openAdd}><FiPlus size={15} /> Add Dealership</button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 4, width: 'fit-content' }}>
                    {Object.entries(TYPE_META).map(([key, meta]) => (
                        <button key={key} onClick={() => setActiveTab(key)} style={{
                            padding: '8px 20px', borderRadius: 'calc(var(--radius) - 2px)', fontWeight: 700, fontSize: '0.875rem',
                            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                            background: activeTab === key ? meta.bg : 'transparent',
                            color: activeTab === key ? meta.color : 'var(--text-muted)',
                        }}>
                            {meta.label}
                            <span style={{
                                marginLeft: 8, padding: '1px 8px', borderRadius: 99,
                                background: activeTab === key ? meta.color : 'var(--border)',
                                color: activeTab === key ? '#fff' : 'var(--text-muted)',
                                fontSize: '0.72rem', fontWeight: 800,
                            }}>
                                {dealerships.filter(d => d.type === key).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading…</div>
                ) : filtered.length === 0 ? (
                    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 60, textAlign: 'center', boxShadow: 'var(--shadow)' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
                        <p style={{ fontWeight: 700, marginBottom: 8 }}>No {TYPE_META[activeTab].label} dealerships yet</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>Add your first {activeTab === 'drive_prime' ? 'Drive Prime outlet' : '3rd party partner'}</p>
                        <button className="btn btn-primary" onClick={openAdd}><FiPlus size={15} /> Add Dealership</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filtered.map(d => (
                            <div key={d.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: TYPE_META[d.type]?.bg || '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FiHome size={20} style={{ color: TYPE_META[d.type]?.color || 'var(--primary)' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                                        <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{d.name}</h3>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: TYPE_META[d.type]?.bg, color: TYPE_META[d.type]?.color }}>
                                            {TYPE_META[d.type]?.label}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                        {(d.address || d.city || d.town) && <span><FiMapPin size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{[d.address, d.town || d.city, d.district, d.state, d.pincode].filter(Boolean).join(', ')}</span>}
                                        {d.phone && <span><FiPhone size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{d.phone}</span>}
                                        {d.email && <span><FiMail size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{d.email}</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    <button onClick={() => openEdit(d)} className="btn btn-outline btn-sm"><FiEdit2 size={14} /> Edit</button>
                                    <button onClick={() => setDeleteTarget(d)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 'var(--radius)', padding: '6px 12px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><FiTrash2 size={13} /> Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 0' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>
                                {modal.mode === 'add' ? 'Add Dealership' : 'Edit Dealership'}
                            </h2>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FiX size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Type */}
                            <div className="form-group">
                                <label className="form-label">Dealership Type *</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {Object.entries(TYPE_META).map(([key, meta]) => (
                                        <label key={key} style={{
                                            flex: 1, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                                            padding: '10px 14px', borderRadius: 'var(--radius)',
                                            border: `2px solid ${form.type === key ? meta.color : 'var(--border)'}`,
                                            background: form.type === key ? meta.bg : '#fafafa',
                                        }}>
                                            <input type="radio" name="type" value={key} checked={form.type === key} onChange={() => set('type', key)} style={{ accentColor: meta.color }} />
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: meta.color }}>{meta.label}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{meta.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div className="form-group">
                                <label className="form-label">Dealership Name *</label>
                                <input value={form.name} onChange={e => set('name', e.target.value)} className="form-input" placeholder="e.g. Drive Prime — Kochi (Main)" required />
                            </div>

                            {/* Address Details */}
                            <div className="form-group">
                                <label className="form-label">📍 PIN Code (auto-fills below)</label>
                                <PinCodeInput
                                    value={form.pincode}
                                    onChange={v => set('pincode', v)}
                                    onResolved={(details) => {
                                        setForm(f => ({
                                            ...f,
                                            state: details.state,
                                            district: details.district,
                                            taluk: details.taluk,
                                            town: details.town,
                                            city: details.city,
                                            pincode: details.pincode
                                        }));
                                    }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Street Address</label>
                                <input value={form.address} onChange={e => set('address', e.target.value)} className="form-input" placeholder="Building, Street, Landmark" />
                            </div>

                            <div className="grid-2" style={{ gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Town/City</label>
                                    <input value={form.town || form.city} onChange={e => set('town', e.target.value)} placeholder="e.g. Aluva" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Taluk/Block</label>
                                    <input value={form.taluk} onChange={e => set('taluk', e.target.value)} placeholder="e.g. Aluva" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">District</label>
                                    <input value={form.district} onChange={e => set('district', e.target.value)} placeholder="e.g. Ernakulam" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. Kerala" className="form-input" />
                                </div>
                            </div>

                            {/* Phone + Email */}
                            <div className="grid-2" style={{ gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input value={form.phone} onChange={e => set('phone', e.target.value)} className="form-input" placeholder="+91 XXXXX XXXXX" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="form-input" placeholder="branch@driveprime.in" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                <button type="button" onClick={() => setModal(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 2 }}>
                                    <FiSave size={15} /> {saving ? 'Saving…' : modal.mode === 'add' ? 'Add Dealership' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteTarget && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400, padding: 28, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ fontSize: 40, marginBottom: 12, textAlign: 'center' }}>🗑️</div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Delete Dealership?</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24, textAlign: 'center', lineHeight: 1.6 }}>
                            Are you sure you want to remove <strong>{deleteTarget.name}</strong>? This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setDeleteTarget(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleDelete} style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <FiTrash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
