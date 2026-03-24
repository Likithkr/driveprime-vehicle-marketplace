import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff,
    FiSave, FiX, FiChevronUp, FiChevronDown, FiImage,
} from 'react-icons/fi';
import { useAdmin } from '../../hooks/useAdmin';
import { API_BASE } from '../../lib/config';

// ── Gradient presets for background ──────────────────────────────────────────
const GRADIENTS = [
    { label: 'Dark Blue',    value: 'linear-gradient(135deg,#0f172a 0%,#1a1f35 100%)' },
    { label: 'Deep Purple',  value: 'linear-gradient(135deg,#0c1523 0%,#1a1040 100%)' },
    { label: 'Forest Night', value: 'linear-gradient(135deg,#0f2229 0%,#0c1a1a 100%)' },
    { label: 'Midnight Red', value: 'linear-gradient(135deg,#1a0a0a 0%,#2d0808 100%)' },
    { label: 'Slate',        value: 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)'  },
    { label: 'Warm Dark',    value: 'linear-gradient(135deg,#1c1208 0%,#2d1a00 100%)' },
];

const EMPTY_FORM = {
    title: '',
    subtitle: '',
    cta_label: 'Browse Cars',
    cta_link: '/search',
    badge_text: '',
    image_url: GRADIENTS[0].value,   // always holds the final bg value
    bg_type: 'gradient',             // 'gradient' | 'photo'
    active: true,
    sort_order: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminBannersPage() {
    const admin    = useAdmin();
    const navigate = useNavigate();
    const fileRef  = useRef(null);

    const [banners,       setBanners]       = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [saving,        setSaving]        = useState(false);
    const [error,         setError]         = useState('');
    const [success,       setSuccess]       = useState('');
    const [showModal,     setShowModal]     = useState(false);
    const [editingId,     setEditingId]     = useState(null);
    const [form,          setForm]          = useState(EMPTY_FORM);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const token = admin.getToken();

    // ── Auth guard ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!admin.isLoggedIn()) { navigate('/admin/login'); return; }
        fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Fetch all banners (admin view) ────────────────────────────────────────
    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/banners/all`);
            const data = await res.json();
            setBanners(Array.isArray(data) ? data : []);
        } catch {
            setError('Failed to load banners. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    // ── Open modal for new or edit ────────────────────────────────────────────
    const openNew = () => {
        setForm({ ...EMPTY_FORM, sort_order: banners.length + 1 });
        setEditingId(null);
        setError('');
        setShowModal(true);
    };

    const openEdit = (b) => {
        const isPhoto = b.image_url?.startsWith('data:') || b.image_url?.startsWith('http');
        setForm({
            title:      b.title      || '',
            subtitle:   b.subtitle   || '',
            cta_label:  b.cta_label  || 'Browse Cars',
            cta_link:   b.cta_link   || '/search',
            badge_text: b.badge_text || '',
            image_url:  b.image_url  || GRADIENTS[0].value,
            bg_type:    isPhoto ? 'photo' : 'gradient',
            active:     b.active,
            sort_order: b.sort_order || 0,
        });
        setEditingId(b.id);
        setError('');
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingId(null); };

    // ── Gradient picker ───────────────────────────────────────────────────────
    const pickGradient = (gradient) => {
        setForm(f => ({ ...f, image_url: gradient, bg_type: 'gradient' }));
    };

    // ── Photo upload → base64 ─────────────────────────────────────────────────
    const handlePhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setForm(f => ({ ...f, image_url: ev.target.result, bg_type: 'photo' }));
        reader.readAsDataURL(file);
    };

    // ── Save (create or update) ───────────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.title.trim()) { setError('Headline is required.'); return; }

        setSaving(true);
        try {
            const payload = {
                title:      form.title.trim(),
                subtitle:   form.subtitle.trim(),
                cta_label:  form.cta_label.trim() || 'Browse Cars',
                cta_link:   form.cta_link.trim()  || '/search',
                badge_text: form.badge_text.trim(),
                image_url:  form.image_url,        // gradient string OR base64
                active:     form.active,
                sort_order: Number(form.sort_order) || 0,
            };

            const url    = editingId ? `${API_BASE}/api/banners/${editingId}` : `${API_BASE}/api/banners`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Save failed');

            setSuccess(editingId ? 'Banner updated!' : 'Banner created!');
            setTimeout(() => setSuccess(''), 2500);
            closeModal();
            fetchBanners();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Toggle active ─────────────────────────────────────────────────────────
    const toggleActive = async (b) => {
        try {
            await fetch(`${API_BASE}/api/banners/${b.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...b, active: !b.active }),
            });
            fetchBanners();
        } catch { setError('Failed to update'); }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        try {
            await fetch(`${API_BASE}/api/banners/${id}`, { method: 'DELETE' });
            setDeleteConfirm(null);
            fetchBanners();
        } catch { setError('Failed to delete'); }
    };

    // ── Reorder ───────────────────────────────────────────────────────────────
    const moveOrder = async (b, delta) => {
        try {
            await fetch(`${API_BASE}/api/banners/${b.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...b, sort_order: (b.sort_order || 0) + delta }),
            });
            fetchBanners();
        } catch { setError('Failed to reorder'); }
    };

    // ── Preview background style ──────────────────────────────────────────────
    const bgStyle = (imageUrl) => {
        if (!imageUrl) return { background: GRADIENTS[0].value };
        if (imageUrl.startsWith('data:') || imageUrl.startsWith('http'))
            return { backgroundImage: `url("${imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' };
        return { background: imageUrl }; // gradient string
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 0 80px' }}>
            <div className="container">

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
                    <Link to="/admin/dashboard" className="btn btn-outline btn-sm">
                        <FiArrowLeft size={14} /> Back
                    </Link>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.7rem' }}>
                            🎠 Homepage Banners
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
                            Manage the hero carousel slides shown on the homepage. Changes are live immediately.
                        </p>
                    </div>
                    <button onClick={openNew} className="btn btn-primary">
                        <FiPlus size={16} /> Add Banner
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 10, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError('')}><FiX size={16} color="#dc2626" /></button>
                    </div>
                )}
                {success && (
                    <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontWeight: 600 }}>
                        ✓ {success}
                    </div>
                )}

                {/* Banner list */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                        <div className="spinner" style={{ margin: '0 auto 16px' }} />
                        Loading banners…
                    </div>
                ) : banners.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 16, border: '1.5px dashed var(--border)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🖼️</div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>No banners yet</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Add your first homepage banner slide to get started.</p>
                        <button onClick={openNew} className="btn btn-primary"><FiPlus size={16} /> Add First Banner</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {banners.map((banner) => (
                            <div key={banner.id} style={{
                                background: '#fff', borderRadius: 16,
                                border: `1.5px solid ${banner.active ? 'var(--border)' : '#fbbf24'}`,
                                boxShadow: 'var(--shadow)', overflow: 'hidden',
                                opacity: banner.active ? 1 : 0.72,
                                transition: 'all 0.2s',
                            }}>
                                <div style={{ display: 'flex' }}>
                                    {/* Mini preview */}
                                    <div style={{
                                        width: 180, minHeight: 110, flexShrink: 0,
                                        position: 'relative',
                                        ...bgStyle(banner.image_url),
                                    }}>
                                        {(banner.image_url?.startsWith('data:') || banner.image_url?.startsWith('http')) && (
                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
                                        )}
                                        {banner.badge_text && (
                                            <span style={{
                                                position: 'absolute', top: 8, left: 8, zIndex: 1,
                                                background: 'rgba(249,115,22,0.9)', color: '#fff',
                                                padding: '2px 10px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700,
                                            }}>{banner.badge_text}</span>
                                        )}
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px', background: 'linear-gradient(to top,rgba(0,0,0,0.8),transparent)', zIndex: 1 }}>
                                            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.3 }}>{banner.title}</div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>{banner.title}</span>
                                            <span style={{
                                                padding: '1px 9px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
                                                background: banner.active ? '#dcfce7' : '#fef3c7',
                                                color: banner.active ? '#16a34a' : '#92400e',
                                            }}>{banner.active ? '● Active' : '○ Hidden'}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Order #{banner.sort_order}</span>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                                            {banner.subtitle}
                                        </p>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            CTA: <strong>{banner.cta_label}</strong> → <span style={{ color: 'var(--primary)' }}>{banner.cta_link}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: 12, borderLeft: '1px solid var(--border)', alignItems: 'center' }}>
                                        <button onClick={() => moveOrder(banner, -1)} title="Move Up" style={{ padding: '5px 8px', background: '#f1f5f9', borderRadius: 7, color: '#475569', cursor: 'pointer', border: 'none' }}>
                                            <FiChevronUp size={15} />
                                        </button>
                                        <button onClick={() => moveOrder(banner, 1)} title="Move Down" style={{ padding: '5px 8px', background: '#f1f5f9', borderRadius: 7, color: '#475569', cursor: 'pointer', border: 'none' }}>
                                            <FiChevronDown size={15} />
                                        </button>
                                        <button onClick={() => toggleActive(banner)} title={banner.active ? 'Hide' : 'Show'} style={{ padding: '5px 8px', background: banner.active ? '#fef9c3' : '#dcfce7', borderRadius: 7, color: banner.active ? '#854d0e' : '#166534', cursor: 'pointer', border: 'none' }}>
                                            {banner.active ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                                        </button>
                                        <button onClick={() => openEdit(banner)} title="Edit" style={{ padding: '5px 8px', background: '#e0f2fe', borderRadius: 7, color: '#0369a1', cursor: 'pointer', border: 'none' }}>
                                            <FiEdit2 size={15} />
                                        </button>
                                        <button onClick={() => setDeleteConfirm(banner.id)} title="Delete" style={{ padding: '5px 8px', background: '#fee2e2', borderRadius: 7, color: '#dc2626', cursor: 'pointer', border: 'none' }}>
                                            <FiTrash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                {/* Delete confirm */}
                                {deleteConfirm === banner.id && (
                                    <div style={{ background: '#fee2e2', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                        <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>Delete "{banner.title}"?</span>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => setDeleteConfirm(null)} className="btn btn-outline btn-sm">Cancel</button>
                                            <button onClick={() => handleDelete(banner.id)} className="btn btn-sm" style={{ background: '#dc2626', color: '#fff' }}>Delete</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Add / Edit Modal ─────────────────────────────────────────────── */}
            {showModal && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
                    onClick={closeModal}
                >
                    <div
                        style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div style={{ padding: '22px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>
                                {editingId ? '✏️ Edit Banner' : '➕ New Banner Slide'}
                            </h2>
                            <button onClick={closeModal} style={{ color: 'var(--text-muted)', padding: 4, lineHeight: 0 }}><FiX size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {error && (
                                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem' }}>{error}</div>
                            )}

                            {/* ── Live preview ── */}
                            <div style={{ height: 130, borderRadius: 12, overflow: 'hidden', position: 'relative', ...bgStyle(form.image_url) }}>
                                {form.bg_type === 'photo' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />}
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: 'linear-gradient(to top,rgba(0,0,0,0.8),transparent)' }}>
                                    {form.badge_text && <div style={{ color: '#fbbf24', fontSize: '0.72rem', fontWeight: 700, marginBottom: 3 }}>{form.badge_text}</div>}
                                    <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>{form.title || 'Slide Headline'}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginTop: 2 }}>{(form.subtitle || 'Tagline preview…').substring(0, 70)}</div>
                                </div>
                            </div>

                            {/* Headline */}
                            <div className="form-group">
                                <label className="form-label">Headline *</label>
                                <input className="form-input" required placeholder="Find Your Perfect Dream Car"
                                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                            </div>

                            {/* Subtitle */}
                            <div className="form-group">
                                <label className="form-label">Subtitle</label>
                                <textarea className="form-input" rows={2} placeholder="Short tagline or description…"
                                    style={{ resize: 'vertical', minHeight: 56 }}
                                    value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
                            </div>

                            {/* Badge + Order */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Badge Text</label>
                                    <input className="form-input" placeholder="e.g. New Arrivals"
                                        value={form.badge_text} onChange={e => setForm(f => ({ ...f, badge_text: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sort Order</label>
                                    <input className="form-input" type="number" min={0}
                                        value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
                                </div>
                            </div>

                            {/* CTA */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Button Label</label>
                                    <input className="form-input" placeholder="Browse Cars"
                                        value={form.cta_label} onChange={e => setForm(f => ({ ...f, cta_label: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Button Link</label>
                                    <input className="form-input" placeholder="/search"
                                        value={form.cta_link} onChange={e => setForm(f => ({ ...f, cta_link: e.target.value }))} />
                                </div>
                            </div>

                            {/* Background */}
                            <div className="form-group">
                                <label className="form-label"><FiImage size={13} style={{ marginRight: 4 }} />Background</label>

                                {/* Gradient swatches */}
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                                    {GRADIENTS.map(g => (
                                        <button
                                            key={g.value} type="button"
                                            title={g.label}
                                            onClick={() => pickGradient(g.value)}
                                            style={{
                                                width: 34, height: 34, borderRadius: 8,
                                                background: g.value,
                                                border: form.image_url === g.value && form.bg_type === 'gradient'
                                                    ? '3px solid var(--primary)' : '2px solid #cbd5e1',
                                                cursor: 'pointer', transition: 'border 0.15s',
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Photo upload */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>or upload photo:</span>
                                    <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                                    <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>
                                        <FiImage size={14} /> Choose Image
                                    </button>
                                    {form.bg_type === 'photo' && (
                                        <button type="button" className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626' }}
                                            onClick={() => setForm(f => ({ ...f, image_url: GRADIENTS[0].value, bg_type: 'gradient' }))}>
                                            <FiX size={13} /> Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Active */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none', padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1.5px solid var(--border)' }}>
                                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Active — visible on homepage</span>
                                <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    {form.active ? '✅ Will show' : '🚫 Hidden'}
                                </span>
                            </label>

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                                <button type="button" onClick={closeModal} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                                    <FiSave size={16} />
                                    {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
