import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/ToastProvider';
import ImageUploader from '../../components/ImageUploader';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, OWNERSHIP_OPTIONS, INDIA_STATES, VEHICLE_TYPES } from '../../data/mockData';
import { api } from '../../lib/api';
import { useAdmin } from '../../hooks/useAdmin';
import PinCodeInput from '../../components/PinCodeInput';
import { FiArrowLeft, FiSave, FiCheck, FiMapPin, FiAlertTriangle } from 'react-icons/fi';

// Documents admin must physically collect and verify
const DOC_CHECKLIST = [
    { key: 'rc', label: 'Registration Certificate (RC)', required: true, emoji: '📋', desc: 'RC book / smart card — verify name, chassis & engine number' },
    { key: 'insurance', label: 'Insurance Certificate', required: true, emoji: '🛡️', desc: 'Valid motor insurance policy — check expiry date' },
    { key: 'puc', label: 'PUC Certificate', required: true, emoji: '🌿', desc: 'Pollution Under Control certificate — check validity' },
    { key: 'id_proof', label: 'ID Proof (Aadhaar / PAN)', required: true, emoji: '🪪', desc: 'Owner identity — verify name matches RC' },
    { key: 'form29', label: 'Form 29 — Notice of Transfer', required: false, emoji: '📝', desc: 'Signed transfer notice — required for smooth RTO process' },
    { key: 'form30', label: 'Form 30 — Transfer Application', required: false, emoji: '📝', desc: 'Application for transfer of ownership' },
    { key: 'noc', label: 'NOC from Financier / Bank', required: false, emoji: '🏦', desc: 'Needed if vehicle was under a loan — must be original' },
    { key: 'service_history', label: 'Service History / Invoices', required: false, emoji: '🔧', desc: 'Authorised service records' },
];

const GRADES = [
    { grade: 'A', label: 'Excellent', color: '#16a34a', bg: '#dcfce7', desc: 'Like new, no issues' },
    { grade: 'B', label: 'Good', color: '#2563eb', bg: '#dbeafe', desc: 'Minor wear, fully functional' },
    { grade: 'C', label: 'Fair', color: '#d97706', bg: '#fef3c7', desc: 'Moderate wear' },
    { grade: 'D', label: 'Poor', color: '#dc2626', bg: '#fee2e2', desc: 'Major issues' },
];

const emptyForm = {
    type: 'Car', brand: '', model: '', variant: '', year: 2023,
    km: '', fuel: 'Petrol', transmission: 'Manual', ownership: '1st Owner',
    insurance: '', color: '', state: '', district: '', taluk: '', town: '', city: '', pincode: '', address: '',
    about: '', price: '', images: [],
    dealerName: '', dealerPhone: '', dealerEmail: '', dealerWhatsApp: '',
    status: 'live', featured: false,
    conditionGrade: '', verifiedDocs: {},
    dealershipId: '', dealershipName: '',
};

export default function AdminAddEditCarPage() {
    const { id } = useParams();
    const { state, dispatch } = useStore();
    const { addToast } = useToast();
    const admin = useAdmin();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(emptyForm);
    const [dealerships, setDealerships] = useState([]);

    // Fetch dealerships list for the dropdown
    useEffect(() => {
        api.dealerships.getAll().then(setDealerships).catch(() => { });
    }, []);

    useEffect(() => {
        if (isEdit) {
            const listing = state.listings.find(l => l.id === id);
            if (listing) setForm({ ...emptyForm, ...listing });
        }
    }, [id]);

    if (!state.isAdminLoggedIn) { navigate('/admin/login'); return null; }

    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    const handleSave = (e) => {
        e.preventDefault();
        const data = {
            ...form,
            price: Number(form.price),
            km: Number(form.km),
            year: Number(form.year),
            location: `${form.town || form.city}, ${form.district || form.state}`,
            createdAt: form.createdAt || new Date().toISOString().split('T')[0],
        };

        if (isEdit) {
            dispatch({ type: 'UPDATE_LISTING', payload: data });
            addToast('Listing updated successfully!', 'success');
        } else {
            dispatch({ type: 'ADD_LISTING', payload: { ...data, id: Date.now().toString() } });
            addToast('New listing added!', 'success');
        }
        navigate('/admin/listings');
    };

    const cities = form.state ? INDIA_STATES[form.state] || [] : [];

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 0 80px' }}>
            <div className="container" style={{ maxWidth: '860px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <Link to="/admin/listings" className="btn btn-outline btn-sm"><FiArrowLeft size={14} /></Link>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>
                        {isEdit ? 'Edit Listing' : 'Add New Car / Bike'}
                    </h1>
                </div>

                <form onSubmit={handleSave}>
                    {/* Section: Vehicle Info */}
                    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', marginBottom: '20px', boxShadow: 'var(--shadow)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '20px', fontSize: '1.1rem' }}>Vehicle Information</h2>
                        <div className="grid-2" style={{ gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Vehicle Type</label>
                                <select value={form.type} onChange={e => set('type', e.target.value)} className="form-select">
                                    {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Brand *</label>
                                <select value={form.brand} onChange={e => set('brand', e.target.value)} className="form-select" required>
                                    <option value="">Select Brand</option>
                                    {BRANDS.map(b => <option key={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Model *</label>
                                <input value={form.model} onChange={e => set('model', e.target.value)} placeholder="e.g. Swift" className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Variant</label>
                                <input value={form.variant} onChange={e => set('variant', e.target.value)} placeholder="e.g. VXi" className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Year *</label>
                                <input type="number" value={form.year} onChange={e => set('year', e.target.value)} min={1990} max={2025} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">KM Driven *</label>
                                <input type="number" value={form.km} onChange={e => set('km', e.target.value)} placeholder="e.g. 45000" className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fuel Type</label>
                                <select value={form.fuel} onChange={e => set('fuel', e.target.value)} className="form-select">
                                    {FUEL_TYPES.map(f => <option key={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Transmission</label>
                                <select value={form.transmission} onChange={e => set('transmission', e.target.value)} className="form-select">
                                    {TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ownership</label>
                                <select value={form.ownership} onChange={e => set('ownership', e.target.value)} className="form-select">
                                    {OWNERSHIP_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Insurance Valid Until</label>
                                <input type="date" value={form.insurance} onChange={e => set('insurance', e.target.value)} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Color</label>
                                <input value={form.color} onChange={e => set('color', e.target.value)} placeholder="e.g. Pearl White" className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price (₹) *</label>
                                <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 650000" className="form-input" required />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">📍 PIN Code <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>(auto-fills address details)</span></label>
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

                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">Address</label>
                                <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="House/Flat No, Street, Landmark" className="form-input" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Town/City</label>
                                <input value={form.town || form.city} onChange={e => set('town', e.target.value)} placeholder="e.g. Aluva" className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Taluk / Block</label>
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
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label"><FiMapPin size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Nearest Dealership</label>
                                <select
                                    value={form.dealershipId}
                                    onChange={e => {
                                        const selected = dealerships.find(d => d.id === e.target.value);
                                        set('dealershipId', e.target.value);
                                        set('dealershipName', selected ? selected.name : '');
                                    }}
                                    className="form-select"
                                >
                                    <option value="">— No specific dealership —</option>
                                    {dealerships.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} — {d.city}{d.address ? ` · ${d.address}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {form.dealershipId && (() => {
                                    const d = dealerships.find(ds => ds.id === form.dealershipId);
                                    return d ? (
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                            📍 {d.address}, {d.city}, {d.state} &nbsp;·&nbsp; 📞 {d.phone}
                                        </p>
                                    ) : null;
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Section: About */}
                    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', marginBottom: '20px', boxShadow: 'var(--shadow)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '16px', fontSize: '1.1rem' }}>Description</h2>
                        <textarea value={form.about} onChange={e => set('about', e.target.value)}
                            placeholder="Describe the vehicle condition, features, service history..." className="form-textarea" style={{ minHeight: '120px' }} />
                    </div>

                    {/* Section: Images */}
                    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', marginBottom: '20px', boxShadow: 'var(--shadow)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px', fontSize: '1.1rem' }}>Photos</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>Upload images (first = cover photo)</p>
                        <ImageUploader images={form.images} onChange={imgs => set('images', imgs)} />
                    </div>

                    {/* Section: Dealer */}
                    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', marginBottom: '20px', boxShadow: 'var(--shadow)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '16px', fontSize: '1.1rem' }}>Dealer Contact</h2>
                        <div className="grid-2" style={{ gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Dealer Name</label>
                                <input value={form.dealerName} onChange={e => set('dealerName', e.target.value)} className="form-input" placeholder="Dealer / seller name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input value={form.dealerPhone} onChange={e => set('dealerPhone', e.target.value)} className="form-input" placeholder="10-digit mobile" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" value={form.dealerEmail} onChange={e => set('dealerEmail', e.target.value)} className="form-input" placeholder="dealer@email.com" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">WhatsApp Number</label>
                                <input value={form.dealerWhatsApp} onChange={e => set('dealerWhatsApp', e.target.value)} className="form-input" placeholder="WhatsApp number" />
                            </div>
                        </div>
                    </div>

                    {/* Section: Document Verification */}
                    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', marginBottom: '20px', boxShadow: 'var(--shadow)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: 8 }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>Document Verification</h2>
                            <span style={{
                                fontSize: '0.75rem', fontWeight: 700, padding: '3px 12px', borderRadius: '99px',
                                background: DOC_CHECKLIST.filter(d => d.required && form.verifiedDocs[d.key]).length === DOC_CHECKLIST.filter(d => d.required).length ? '#dcfce7' : '#fef3c7',
                                color: DOC_CHECKLIST.filter(d => d.required && form.verifiedDocs[d.key]).length === DOC_CHECKLIST.filter(d => d.required).length ? '#16a34a' : '#92400e',
                            }}>
                                {DOC_CHECKLIST.filter(d => d.required && form.verifiedDocs[d.key]).length}/{DOC_CHECKLIST.filter(d => d.required).length} required verified
                            </span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
                            Physically collect and verify each document in person before publishing.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
                            {DOC_CHECKLIST.map(doc => (
                                <label key={doc.key} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                                    padding: '10px 12px', borderRadius: 'var(--radius)',
                                    border: `1.5px solid ${form.verifiedDocs[doc.key] ? '#22c55e' : 'var(--border)'}`,
                                    background: form.verifiedDocs[doc.key] ? '#f0fdf4' : '#fafafa',
                                    transition: 'all 0.15s',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={!!form.verifiedDocs[doc.key]}
                                        onChange={() => set('verifiedDocs', { ...form.verifiedDocs, [doc.key]: !form.verifiedDocs[doc.key] })}
                                        style={{ marginTop: 2, width: 16, height: 16, accentColor: 'var(--primary)', flexShrink: 0 }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 14 }}>{doc.emoji}</span>
                                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{doc.label}</span>
                                            {doc.required
                                                ? <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '99px', fontWeight: 700 }}>REQUIRED</span>
                                                : <span style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#64748b', padding: '1px 6px', borderRadius: '99px' }}>Optional</span>
                                            }
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{doc.desc}</p>
                                    </div>
                                    {form.verifiedDocs[doc.key] && <FiCheck size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />}
                                </label>
                            ))}
                        </div>

                        {/* Condition Grade */}
                        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 10 }}>Condition Grade</h3>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                            {GRADES.map(g => (
                                <button key={g.grade} type="button"
                                    onClick={() => set('conditionGrade', form.conditionGrade === g.grade ? '' : g.grade)}
                                    style={{
                                        flex: '1 1 90px', padding: '10px 8px', borderRadius: 'var(--radius)',
                                        border: `2px solid ${form.conditionGrade === g.grade ? g.color : 'var(--border)'}`,
                                        background: form.conditionGrade === g.grade ? g.bg : '#fafafa',
                                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                                    }}
                                >
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: g.color }}>{g.grade}</div>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: g.color }}>{g.label}</div>
                                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>{g.desc}</div>
                                </button>
                            ))}
                        </div>
                        {!form.conditionGrade && (
                            <p style={{ fontSize: '0.8rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <FiAlertTriangle size={14} /> Select a condition grade
                            </p>
                        )}
                    </div>

                    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '28px', marginBottom: '28px', boxShadow: 'var(--shadow)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '16px', fontSize: '1.1rem' }}>Settings</h2>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select value={form.status} onChange={e => set('status', e.target.value)} className="form-select">
                                    <option value="live">Live</option>
                                    <option value="sold">Sold</option>
                                </select>
                            </div>
                            <label className="check-item" style={{ marginTop: '28px' }}>
                                <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
                                Mark as Featured (appears on homepage)
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <Link to="/admin/listings" className="btn btn-outline">Cancel</Link>
                        <button type="submit" className="btn btn-primary">
                            <FiSave size={16} /> {isEdit ? 'Save Changes' : 'Publish Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
