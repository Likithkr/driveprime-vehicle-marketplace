import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiArrowLeft, FiCheck, FiUpload, FiPhone, FiMail } from 'react-icons/fi';
import { useStore } from '../store/StoreContext';
import { useToast } from '../components/ToastProvider';
import ImageUploader from '../components/ImageUploader';
import { useFlags } from '../context/FlagsContext';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, OWNERSHIP_OPTIONS, INDIA_STATES, VEHICLE_TYPES } from '../data/mockData';

const STEPS = ['Vehicle Info', 'Description & Price', 'Images', 'Contact Info'];

const emptyForm = {
    type: 'Car', brand: '', model: '', variant: '', year: new Date().getFullYear(),
    km: '', fuel: 'Petrol', transmission: 'Manual', ownership: '1st Owner',
    insurance: '', color: '', state: '', city: '',
    about: '', price: '',
    images: [],
    dealerName: '', dealerPhone: '', dealerEmail: '', dealerWhatsApp: '',
};

export default function DealerSubmitPage() {
    const { dispatch } = useStore();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const flags = useFlags();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(emptyForm);
    const [submitted, setSubmitted] = useState(false);

    // Feature flag gate — show disabled screen when selling is turned off
    if (!flags.allow_customer_selling?.value) {
        return (
            <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{ textAlign: 'center', maxWidth: 480 }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 12 }}>
                        Not Accepting Submissions
                    </h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
                        Drive Prime is currently the exclusive dealer on this platform. Customer vehicle submissions are temporarily disabled. Contact us to inquire about selling your vehicle.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="tel:+919876543210" className="btn btn-primary">
                            <FiPhone size={15} /> Call Us
                        </a>
                        <a href="mailto:sales@driveprime.in" className="btn btn-outline">
                            <FiMail size={15} /> Email Us
                        </a>
                        <Link to="/" className="btn btn-outline">Back to Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    const handleSubmit = () => {
        dispatch({
            type: 'SUBMIT_DEALER_LISTING',
            payload: {
                ...form,
                id: `p${Date.now()}`,
                price: Number(form.price),
                km: Number(form.km),
                year: Number(form.year),
                status: 'pending',
                location: `${form.city}, ${form.state}`,
                submittedAt: new Date().toISOString().split('T')[0],
                featured: false,
            },
        });
        addToast('Listing submitted! Our team will review it shortly.', 'success');
        setSubmitted(true);
    };

    const cities = form.state ? INDIA_STATES[form.state] || [] : [];

    if (submitted) {
        return (
            <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: '40px', maxWidth: '480px' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '40px' }}>✓</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: '12px' }}>Submission Received!</h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
                        Thank you! Our team will review your listing within 24 hours and contact you via phone or email.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button onClick={() => { setSubmitted(false); setForm(emptyForm); setStep(0); }} className="btn btn-outline">
                            Submit Another
                        </button>
                        <button onClick={() => navigate('/')} className="btn btn-primary">
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '48px', paddingBottom: '80px' }}>
            <div className="container" style={{ maxWidth: '760px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginBottom: '8px' }}>
                        Sell Your Vehicle
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Reach thousands of buyers — list your car or bike for free</p>
                </div>

                {/* Steps indicator */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', alignItems: 'center' }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: i < step ? '#16a34a' : i === step ? 'var(--primary)' : 'var(--border)',
                                    color: i <= step ? '#fff' : 'var(--text-muted)',
                                    fontWeight: 700, fontSize: '0.85rem',
                                    transition: 'var(--transition)',
                                }}>
                                    {i < step ? <FiCheck size={14} /> : i + 1}
                                </div>
                                <span style={{ fontSize: '0.82rem', fontWeight: i === step ? 700 : 400, color: i === step ? 'var(--text)' : 'var(--text-muted)', whiteSpace: 'nowrap', display: window.innerWidth < 500 ? 'none' : 'inline' }}>{s}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: i < step ? '#16a34a' : 'var(--border)', transition: 'var(--transition)' }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form card */}
                <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '32px', boxShadow: 'var(--shadow)' }}>

                    {/* Step 0: Vehicle Info */}
                    {step === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>Vehicle Information</h2>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Vehicle Type *</label>
                                    <select value={form.type} onChange={e => set('type', e.target.value)} className="form-select">
                                        {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Brand *</label>
                                    <select value={form.brand} onChange={e => set('brand', e.target.value)} className="form-select">
                                        <option value="">Select Brand</option>
                                        {BRANDS.map(b => <option key={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Model *</label>
                                    <input value={form.model} onChange={e => set('model', e.target.value)} placeholder="e.g. Swift, Creta" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Variant</label>
                                    <input value={form.variant} onChange={e => set('variant', e.target.value)} placeholder="e.g. VXi, SX Opt" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Year *</label>
                                    <input type="number" value={form.year} onChange={e => set('year', e.target.value)} min={1990} max={2025} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">KM Driven *</label>
                                    <input type="number" value={form.km} onChange={e => set('km', e.target.value)} placeholder="e.g. 45000" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Fuel Type *</label>
                                    <select value={form.fuel} onChange={e => set('fuel', e.target.value)} className="form-select">
                                        {FUEL_TYPES.map(f => <option key={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Transmission *</label>
                                    <select value={form.transmission} onChange={e => set('transmission', e.target.value)} className="form-select">
                                        {TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ownership *</label>
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
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">State *</label>
                                    <select value={form.state} onChange={e => { set('state', e.target.value); set('city', ''); }} className="form-select">
                                        <option value="">Select State</option>
                                        {Object.keys(INDIA_STATES).map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <select value={form.city} onChange={e => set('city', e.target.value)} className="form-select" disabled={!form.state}>
                                        <option value="">Select City</option>
                                        {cities.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Description + Price */}
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>Description & Price</h2>
                            <div className="form-group">
                                <label className="form-label">Asking Price (₹) *</label>
                                <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 650000" className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">About this Vehicle *</label>
                                <textarea value={form.about} onChange={e => set('about', e.target.value)}
                                    placeholder="Describe the condition, features, service history, reason for selling..."
                                    className="form-textarea" style={{ minHeight: '160px' }} />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Images */}
                    {step === 2 && (
                        <div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>Upload Images</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
                                Add up to 10 clear photos. First image will be the cover photo.
                            </p>
                            <ImageUploader images={form.images} onChange={imgs => set('images', imgs)} />
                        </div>
                    )}

                    {/* Step 3: Contact */}
                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>Your Contact Details</h2>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Full Name / Dealer Name *</label>
                                    <input value={form.dealerName} onChange={e => set('dealerName', e.target.value)} placeholder="Your name or dealership" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number *</label>
                                    <input type="tel" value={form.dealerPhone} onChange={e => set('dealerPhone', e.target.value)} placeholder="10-digit mobile" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address *</label>
                                    <input type="email" value={form.dealerEmail} onChange={e => set('dealerEmail', e.target.value)} placeholder="your@email.com" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">WhatsApp Number</label>
                                    <input type="tel" value={form.dealerWhatsApp} onChange={e => set('dealerWhatsApp', e.target.value)} placeholder="Same as phone (or different)" className="form-input" />
                                </div>
                            </div>

                            {/* Summary */}
                            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '20px', marginTop: '8px' }}>
                                <h4 style={{ fontWeight: 700, marginBottom: '12px' }}>Listing Summary</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.875rem' }}>
                                    {[
                                        ['Vehicle', `${form.brand} ${form.model} ${form.variant}`],
                                        ['Year', form.year],
                                        ['KM', `${Number(form.km).toLocaleString('en-IN')} km`],
                                        ['Fuel', form.fuel],
                                        ['Transmission', form.transmission],
                                        ['Price', `₹${Number(form.price).toLocaleString('en-IN')}`],
                                        ['Location', `${form.city}, ${form.state}`],
                                        ['Images', `${form.images.length} uploaded`],
                                    ].map(([k, v]) => (
                                        <div key={k} style={{ display: 'flex', gap: '8px' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                                            <span style={{ fontWeight: 600 }}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', gap: '12px' }}>
                        <button onClick={() => setStep(s => s - 1)} className="btn btn-outline"
                            style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
                            <FiArrowLeft size={16} /> Previous
                        </button>
                        {step < STEPS.length - 1 ? (
                            <button onClick={() => setStep(s => s + 1)} className="btn btn-primary">
                                Next <FiArrowRight size={16} />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} className="btn btn-primary">
                                <FiUpload size={16} /> Submit Listing
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
