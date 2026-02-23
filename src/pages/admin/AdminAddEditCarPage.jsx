import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/ToastProvider';
import ImageUploader from '../../components/ImageUploader';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, OWNERSHIP_OPTIONS, INDIA_STATES, VEHICLE_TYPES } from '../../data/mockData';

const emptyForm = {
    type: 'Car', brand: '', model: '', variant: '', year: 2023,
    km: '', fuel: 'Petrol', transmission: 'Manual', ownership: '1st Owner',
    insurance: '', color: '', state: '', city: '',
    about: '', price: '', images: [],
    dealerName: '', dealerPhone: '', dealerEmail: '', dealerWhatsApp: '',
    status: 'live', featured: false,
};

export default function AdminAddEditCarPage() {
    const { id } = useParams();
    const { state, dispatch } = useStore();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(emptyForm);

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
            location: `${form.city}, ${form.state}`,
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
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <select value={form.state} onChange={e => { set('state', e.target.value); set('city', ''); }} className="form-select">
                                    <option value="">Select State</option>
                                    {Object.keys(INDIA_STATES).map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <select value={form.city} onChange={e => set('city', e.target.value)} className="form-select" disabled={!form.state}>
                                    <option value="">Select City</option>
                                    {cities.map(c => <option key={c}>{c}</option>)}
                                </select>
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

                    {/* Section: Settings */}
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
