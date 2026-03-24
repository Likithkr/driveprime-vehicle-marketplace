import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiSearch, FiTrash2, FiChevronUp, FiChevronDown,
    FiFilter, FiX, FiEdit2, FiSave, FiPlus, FiCheck,
} from 'react-icons/fi';
import { useAdmin } from '../../hooks/useAdmin';
import { API_BASE } from '../../lib/config';

// ── Background presets ───────────────────────────────────────────────────────
const BG_PRESETS = [
    { label: 'Dark Blue',   value: 'linear-gradient(135deg,#0d111c 0%,#1a2035 100%)' },
    { label: 'Deep Navy',   value: 'linear-gradient(135deg,#040d21 0%,#0a1a45 100%)' },
    { label: 'Purple',      value: 'linear-gradient(135deg,#130a2a 0%,#2d1060 100%)' },
    { label: 'Forest',      value: 'linear-gradient(135deg,#071a10 0%,#0e3a20 100%)' },
    { label: 'Dark Red',    value: 'linear-gradient(135deg,#1a0505 0%,#400a0a 100%)' },
    { label: 'Slate',       value: 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)' },
    { label: 'Warm Amber',  value: 'linear-gradient(135deg,#1c1208 0%,#3d1a00 100%)' },
    { label: 'Lilac',       value: 'linear-gradient(135deg,#6b5baf 0%,#9b7fdb 100%)' },
];

const fmt = (p) => {
    if (!p) return '—';
    const l = p / 100000;
    return l >= 100 ? `₹${(p / 10000000).toFixed(2)} Cr` : `₹${l.toFixed(1)} L`;
};
const thumb = (images) => {
    const arr = typeof images === 'string' ? JSON.parse(images || '[]') : (images || []);
    return arr[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL STEPS:  'pick'  →  select vehicle from search list
//               'edit'  →  customise the selected slide
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminCarouselPage() {
    const admin    = useAdmin();
    const navigate = useNavigate();

    // ── State ────────────────────────────────────────────────────────────────
    const [slides,      setSlides]      = useState([]);
    const [listings,    setListings]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [lstLoading,  setLstLoading]  = useState(false);

    // modal
    const [modal,       setModal]       = useState(null);  // null | { step:'pick'|'edit', item?, listing? }
    const [editForm,    setEditForm]    = useState({ customTitle: '', customSubtitle: '', bgGradient: '' });
    const [saving,      setSaving]      = useState(false);
    const [removing,    setRemoving]    = useState(null);

    // vehicle search (inside modal)
    const [q,           setQ]           = useState('');
    const [fBrand,      setFBrand]      = useState('');
    const [fFuel,       setFFuel]       = useState('');
    const [fTx,         setFTx]         = useState('');
    const [fType,       setFType]       = useState('');

    const [error,   setError]   = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!admin.isLoggedIn()) { navigate('/admin/login'); return; }
        fetchSlides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Fetch carousel slides ────────────────────────────────────────────────
    const fetchSlides = async () => {
        setLoading(true);
        try {
            const res  = await fetch(`${API_BASE}/api/carousel/items`);
            const data = await res.json();
            setSlides(Array.isArray(data) ? data : []);
        } catch { setError('Failed to load carousel. Is the backend running?'); }
        finally { setLoading(false); }
    };

    // ── Fetch listings for picker (lazy) ─────────────────────────────────────
    const fetchListings = async () => {
        if (listings.length) return;  // already loaded
        setLstLoading(true);
        try {
            const res  = await fetch(`${API_BASE}/api/listings`);
            const data = await res.json();
            setListings(Array.isArray(data) ? data.filter(l => l.status === 'live') : []);
        } catch {}
        finally { setLstLoading(false); }
    };

    // ── Open Add New Slide modal (step: pick) ────────────────────────────────
    const openAddModal = () => {
        fetchListings();
        setQ(''); setFBrand(''); setFFuel(''); setFTx(''); setFType('');
        setModal({ step: 'pick' });
    };

    // ── Open Edit modal (step: edit) for existing slide ──────────────────────
    const openEditModal = (item) => {
        setEditForm({
            customTitle:    item.customTitle    || '',
            customSubtitle: item.customSubtitle || '',
            bgGradient:     item.bgGradient     || BG_PRESETS[0].value,
        });
        setModal({ step: 'edit', item });
    };

    // ── When a vehicle is chosen in picker → go to customize ─────────────────
    const selectVehicle = (listing) => {
        setEditForm({ customTitle: '', customSubtitle: '', bgGradient: BG_PRESETS[0].value });
        setModal({ step: 'edit', listing });
    };

    // ── Save: Add new slide (create) OR update existing (edit) ───────────────
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            if (modal.listing) {
                // --- Add new slide ---
                const inCarousel = slides.some(s => s.id === modal.listing.id);
                if (inCarousel) throw new Error('This vehicle is already in the carousel.');

                const addRes = await fetch(`${API_BASE}/api/carousel`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ listing_id: modal.listing.id }),
                });
                const addData = await addRes.json();
                if (!addRes.ok) throw new Error(addData.error || 'Failed to add slide');

                // Then customise it
                await fetch(`${API_BASE}/api/carousel/${modal.listing.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sort_order:      slides.length + 1,
                        custom_title:    editForm.customTitle    || null,
                        custom_subtitle: editForm.customSubtitle || null,
                        bg_gradient:     editForm.bgGradient     || null,
                    }),
                });
                setSuccess('Slide added to carousel!');
            } else {
                // --- Edit existing slide ---
                await fetch(`${API_BASE}/api/carousel/${modal.item.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sort_order:      modal.item.sortOrder || 0,
                        custom_title:    editForm.customTitle    || null,
                        custom_subtitle: editForm.customSubtitle || null,
                        bg_gradient:     editForm.bgGradient     || null,
                    }),
                });
                setSuccess('Slide updated!');
            }
            setTimeout(() => setSuccess(''), 2500);
            setModal(null);
            fetchSlides();
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    };

    // ── Remove slide ─────────────────────────────────────────────────────────
    const handleRemove = async (listingId, name) => {
        setRemoving(listingId);
        try {
            await fetch(`${API_BASE}/api/carousel/${listingId}`, { method: 'DELETE' });
            setSuccess(`"${name}" removed.`);
            setTimeout(() => setSuccess(''), 2000);
            fetchSlides();
        } catch { setError('Failed to remove'); }
        finally { setRemoving(null); }
    };

    // ── Reorder ──────────────────────────────────────────────────────────────
    const moveOrder = async (item, delta) => {
        await fetch(`${API_BASE}/api/carousel/${item.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sort_order:      (item.sortOrder || 0) + delta,
                custom_title:    item.customTitle    || null,
                custom_subtitle: item.customSubtitle || null,
                bg_gradient:     item.bgGradient     || null,
            }),
        });
        fetchSlides();
    };

    // ── Filtered listing results (inside picker) ─────────────────────────────
    const inCarouselIds = new Set(slides.map(s => s.id));
    const filtered = listings.filter(l => {
        const s = q.toLowerCase();
        return (!q || [l.brand, l.model, l.variant, l.city, String(l.year)].some(v => v?.toLowerCase().includes(s)))
            && (!fBrand || l.brand         === fBrand)
            && (!fFuel  || l.fuel          === fFuel)
            && (!fTx    || l.transmission  === fTx)
            && (!fType  || l.type          === fType);
    });
    const brands = [...new Set(listings.map(l => l.brand).filter(Boolean))].sort();
    const fuels  = [...new Set(listings.map(l => l.fuel ).filter(Boolean))].sort();
    const txs    = [...new Set(listings.map(l => l.transmission).filter(Boolean))].sort();
    const types  = [...new Set(listings.map(l => l.type).filter(Boolean))].sort();

    // ── Helpers ──────────────────────────────────────────────────────────────
    const bgOf = (item) => item?.bgGradient || BG_PRESETS[0].value;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 0 80px' }}>
            <div className="container" style={{ maxWidth: 900 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
                    <Link to="/admin/dashboard" className="btn btn-outline btn-sm"><FiArrowLeft size={14} /> Dashboard</Link>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.7rem' }}>🎠 Manage Carousel</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>
                            Add vehicle slides to the homepage banner carousel. Each slide is fully customisable.
                        </p>
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary">
                        <FiPlus size={15} /> Add New Slide
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '11px 16px', borderRadius: 10, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError('')}><FiX size={14} color="#dc2626" /></button>
                    </div>
                )}
                {success && (
                    <div style={{ background: '#dcfce7', color: '#16a34a', padding: '11px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 600 }}>
                        ✓ {success}
                    </div>
                )}

                {/* ── Slide list ──────────────────────────────────────────── */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>Loading slides…</div>
                ) : slides.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 20, border: '2px dashed var(--border)', padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🚗</div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>No slides yet</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Click "Add New Slide" to choose a vehicle from your listings.</p>
                        <button onClick={openAddModal} className="btn btn-primary"><FiPlus size={14} /> Add New Slide</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {slides.map((slide, idx) => {
                            const t = thumb(slide.images);
                            return (
                                <div key={slide.id} style={{
                                    borderRadius: 16, overflow: 'hidden',
                                    border: '1px solid var(--border)',
                                    boxShadow: 'var(--shadow)',
                                }}>
                                    {/* Banner preview row */}
                                    <div style={{
                                        background: bgOf(slide),
                                        display: 'flex', alignItems: 'center', gap: 16,
                                        padding: '16px 20px',
                                    }}>
                                        {/* Slide number */}
                                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
                                            #{idx + 1}
                                        </div>

                                        {/* Thumbnail */}
                                        <div style={{ width: 88, height: 64, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}>
                                            {t ? <img src={t} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                               : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🚗</div>}
                                        </div>

                                        {/* Text */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ color: '#fbbf24', fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 3 }}>
                                                {slide.brand}
                                            </div>
                                            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                {slide.customTitle || `${slide.model} ${slide.variant || ''}`}
                                            </div>
                                            {slide.customSubtitle && (
                                                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', marginTop: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                    {slide.customSubtitle}
                                                </div>
                                            )}
                                            <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '0.88rem', marginTop: 4 }}>
                                                {fmt(slide.price)} · {slide.year} · {slide.fuel}
                                            </div>
                                        </div>

                                        {/* Reorder arrows */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <button onClick={() => moveOrder(slide, -1)} disabled={idx === 0} title="Move up"
                                                style={{ padding: '4px 7px', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6, color: '#fff', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.35 : 1 }}>
                                                <FiChevronUp size={14} />
                                            </button>
                                            <button onClick={() => moveOrder(slide, 1)} disabled={idx === slides.length - 1} title="Move down"
                                                style={{ padding: '4px 7px', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6, color: '#fff', cursor: idx === slides.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === slides.length - 1 ? 0.35 : 1 }}>
                                                <FiChevronDown size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action bar */}
                                    <div style={{ background: '#fff', padding: '10px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            {slide.city || slide.town || ''}{slide.city ? ' · ' : ''}{slide.transmission} · {slide.km ? `${Math.round(slide.km / 1000)}k km` : '—'}
                                        </span>
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                            <button onClick={() => openEditModal(slide)} className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem', gap: 5 }}>
                                                <FiEdit2 size={13} /> Edit Slide
                                            </button>
                                            <button
                                                disabled={removing === slide.id}
                                                onClick={() => handleRemove(slide.id, `${slide.brand} ${slide.model}`)}
                                                className="btn btn-sm"
                                                style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.78rem', gap: 5 }}
                                            >
                                                <FiTrash2 size={13} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ════════════════════ MODAL ════════════════════ */}
            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
                    onClick={() => setModal(null)}>
                    <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: modal.step === 'pick' ? 640 : 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
                        onClick={e => e.stopPropagation()}>

                        {/* ── STEP 1: Vehicle picker ── */}
                        {modal.step === 'pick' && (
                            <>
                                <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>
                                        🔍 Select a Vehicle
                                    </h2>
                                    <button onClick={() => setModal(null)} style={{ color: 'var(--text-muted)', padding: 4 }}><FiX size={20} /></button>
                                </div>
                                <p style={{ padding: '4px 24px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    Search your active listings and click a vehicle to add it to the carousel.
                                </p>

                                {/* Search + filters */}
                                <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
                                    <div style={{ position: 'relative' }}>
                                        <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search brand, model, year, city…" value={q} onChange={e => setQ(e.target.value)} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 7 }}>
                                        <select className="form-input" style={{ fontSize: '0.8rem' }} value={fBrand} onChange={e => setFBrand(e.target.value)}>
                                            <option value="">Brand</option>
                                            {brands.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                        <select className="form-input" style={{ fontSize: '0.8rem' }} value={fType} onChange={e => setFType(e.target.value)}>
                                            <option value="">Type</option>
                                            {types.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <select className="form-input" style={{ fontSize: '0.8rem' }} value={fFuel} onChange={e => setFFuel(e.target.value)}>
                                            <option value="">Fuel</option>
                                            {fuels.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                        <select className="form-input" style={{ fontSize: '0.8rem' }} value={fTx} onChange={e => setFTx(e.target.value)}>
                                            <option value="">Transmission</option>
                                            {txs.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingBottom: 4 }}>
                                        <FiFilter size={11} style={{ marginRight: 4 }} />
                                        {filtered.length} of {listings.length} active listings
                                    </div>
                                </div>

                                {/* Listing results */}
                                <div style={{ padding: '0 24px 24px', maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {lstLoading ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading listings…</div>
                                    ) : filtered.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No listings match.</div>
                                    ) : filtered.map(listing => {
                                        const t = thumb(listing.images);
                                        const already = inCarouselIds.has(listing.id);
                                        return (
                                            <button
                                                key={listing.id}
                                                disabled={already}
                                                onClick={() => selectVehicle(listing)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 12,
                                                    background: already ? '#f0fdf4' : '#fff',
                                                    border: `1.5px solid ${already ? '#4ade80' : 'var(--border)'}`,
                                                    borderRadius: 12, padding: '10px 14px',
                                                    cursor: already ? 'not-allowed' : 'pointer',
                                                    textAlign: 'left', width: '100%',
                                                    transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={e => { if (!already) e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                                onMouseLeave={e => { if (!already) e.currentTarget.style.borderColor = 'var(--border)'; }}
                                            >
                                                <div style={{ width: 72, height: 54, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                                                    {t ? <img src={t} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                       : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🚗</div>}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{listing.brand} {listing.model}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
                                                        {listing.variant} · {listing.year} · {listing.fuel} · {listing.transmission}
                                                    </div>
                                                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem', marginTop: 3 }}>{fmt(listing.price)}</div>
                                                </div>
                                                {already ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                                                        <FiCheck size={14} /> In carousel
                                                    </div>
                                                ) : (
                                                    <div style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>Select →</div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* ── STEP 2: Customise slide ── */}
                        {modal.step === 'edit' && (
                            <>
                                {/* Banner preview */}
                                {(() => {
                                    const src = modal.listing || modal.item;
                                    const t   = thumb(src?.images);
                                    return (
                                        <div style={{
                                            background: editForm.bgGradient || BG_PRESETS[0].value,
                                            padding: '20px 24px',
                                            display: 'flex', alignItems: 'center', gap: 14,
                                        }}>
                                            <div style={{ width: 80, height: 60, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}>
                                                {t ? <img src={t} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                   : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🚗</div>}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ color: '#fbbf24', fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>{src?.brand}</div>
                                                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
                                                    {editForm.customTitle || `${src?.model} ${src?.variant || ''}`}
                                                </div>
                                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.76rem', marginTop: 2 }}>
                                                    {editForm.customSubtitle || 'Subtitle preview…'}
                                                </div>
                                            </div>
                                            <button onClick={() => setModal(null)} style={{ color: 'rgba(255,255,255,0.6)', padding: 4, marginLeft: 'auto' }}><FiX size={18} /></button>
                                        </div>
                                    );
                                })()}

                                <form onSubmit={handleSave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem' }}>⚠️ {error}</div>}

                                    <div className="form-group">
                                        <label className="form-label">Headline <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to use vehicle name)</span></label>
                                        <input className="form-input"
                                            placeholder={`${(modal.listing || modal.item)?.model || ''} ${(modal.listing || modal.item)?.variant || ''}`}
                                            value={editForm.customTitle}
                                            onChange={e => setEditForm(f => ({ ...f, customTitle: e.target.value }))} />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Subtitle / Tagline</label>
                                        <textarea className="form-input" rows={2} placeholder="e.g. Drive bold. Own the road."
                                            style={{ resize: 'vertical' }}
                                            value={editForm.customSubtitle}
                                            onChange={e => setEditForm(f => ({ ...f, customSubtitle: e.target.value }))} />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Slide Background</label>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                                            {BG_PRESETS.map(g => (
                                                <button key={g.value} type="button" title={g.label}
                                                    onClick={() => setEditForm(f => ({ ...f, bgGradient: g.value }))}
                                                    style={{
                                                        width: 36, height: 36, borderRadius: 8, background: g.value, cursor: 'pointer',
                                                        border: editForm.bgGradient === g.value ? '3px solid var(--primary)' : '2px solid #cbd5e1',
                                                    }} />
                                            ))}
                                        </div>
                                        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>If you don't set a background, one is auto-chosen based on the car's brand.</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 10 }}>
                                        {modal.listing && (
                                            <button type="button" onClick={() => setModal({ step: 'pick' })} className="btn btn-outline" style={{ gap: 5 }}>
                                                ← Back
                                            </button>
                                        )}
                                        <button type="button" onClick={() => setModal(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                        <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                                            <FiSave size={15} /> {saving ? 'Saving…' : modal.listing ? 'Add to Carousel' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
