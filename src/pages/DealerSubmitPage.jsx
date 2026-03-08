import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiArrowLeft, FiCheck, FiUpload, FiPhone, FiMail, FiAlertCircle, FiMapPin } from 'react-icons/fi';
import { useStore } from '../store/StoreContext';
import { useToast } from '../components/ToastProvider';
import ImageUploader from '../components/ImageUploader';
import { useFlags } from '../context/FlagsContext';
import { useCustomer } from '../hooks/useCustomer';
import PinCodeInput from '../components/PinCodeInput';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, OWNERSHIP_OPTIONS, INDIA_STATES, VEHICLE_TYPES } from '../data/mockData';
import { api } from '../lib/api';

const STEPS = ['Vehicle Info', 'Description & Price', 'Photos', 'Contact Info'];

const emptyForm = {
    type: 'Car', brand: '', model: '', variant: '', year: new Date().getFullYear(),
    km: '', fuel: 'Petrol', transmission: 'Manual', ownership: '1st Owner',
    insurance: '', color: '', state: '', district: '', taluk: '', town: '', city: '', pincode: '', address: '',
    about: '', price: '',
    images: [],
    dealerName: '', dealerPhone: '', dealerEmail: '', dealerWhatsApp: '',
    dealerAddress: '', dealerPin: '',
    dealershipId: '', dealershipName: '',
};

function validate(step, form) {
    const errors = [];
    if (step === 0) {
        if (!form.brand) errors.push('Brand is required');
        if (!form.model.trim()) errors.push('Model is required');
        const yr = Number(form.year);
        if (!yr || yr < 1990 || yr > new Date().getFullYear()) errors.push(`Year must be between 1990 and ${new Date().getFullYear()}`);
        const km = Number(form.km);
        if (!form.km || km <= 0) errors.push('KM Driven must be greater than 0');
        if (!form.state) errors.push('State is required');
        if (!form.district) errors.push('District is required');
        if (!form.town && !form.city) errors.push('Town/City is required');
        if (!form.pincode) errors.push('PIN Code is required');
        if (!form.address.trim()) errors.push('Address is required');
    }
    if (step === 1) {
        const price = Number(form.price);
        if (!form.price || price <= 0) errors.push('Asking price must be greater than ₹0');
        if (!form.about.trim() || form.about.trim().length < 20) errors.push('Description must be at least 20 characters');
    }
    if (step === 2) {
        if (form.images.length === 0) errors.push('Please upload at least 1 photo of the vehicle');
    }
    if (step === 3) {
        if (!form.dealerName.trim()) errors.push('Full name is required');
        const phone = form.dealerPhone.replace(/\D/g, '');
        if (!phone || phone.length !== 10) errors.push('Phone number must be exactly 10 digits');
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.dealerEmail);
        if (!form.dealerEmail.trim() || !emailOk) errors.push('A valid email address is required');
    }
    return errors;
}

export default function DealerSubmitPage() {
    const { state, dispatch } = useStore();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { flags } = useFlags();
    const customer = useCustomer();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(emptyForm);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [dealerships, setDealerships] = useState([]);

    // Fetch dealerships for the selector
    useEffect(() => {
        api.dealerships.getAll().then(setDealerships).catch(() => { });
    }, []);

    // ── Sign-in gate ──────────────────────────────────────────────────────────
    if (!customer.isLoggedIn()) {
        return (
            <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{ textAlign: 'center', maxWidth: 460 }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🔐</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 12 }}>
                        Sign In to List Your Vehicle
                    </h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
                        You need a free Drive Prime account to submit a vehicle listing. It only takes a minute to sign up!
                    </p>
                    <button
                        className="btn btn-primary"
                        style={{ justifyContent: 'center', fontSize: '1rem', padding: '14px 36px' }}
                        onClick={() => window.dispatchEvent(new CustomEvent('dp:open-auth'))}
                    >
                        Sign In / Register
                    </button>
                </div>
            </div>
        );
    }

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
                        {state?.settings?.brand_name || "Drive Prime"} is currently the exclusive dealer on this platform. Customer vehicle submissions are temporarily disabled. Contact us to inquire about selling your vehicle.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href={`tel:${state?.settings?.dealer_phone || "+919876543210"}`} className="btn btn-primary">
                            <FiPhone size={15} /> Call Us
                        </a>
                        <a href={`mailto:${state?.settings?.dealer_email || "support@driveprime.in"}`} className="btn btn-outline">
                            <FiMail size={15} /> Email Us
                        </a>
                        <Link to="/" className="btn btn-outline">Back to Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    const set = (field, val) => {
        setForm(prev => ({ ...prev, [field]: val }));
        // Clear errors when user starts filling in fields
        if (errors.length > 0) setErrors([]);
    };

    const handleNext = () => {
        const errs = validate(step, form);
        if (errs.length > 0) {
            setErrors(errs);
            return;
        }
        setErrors([]);
        setStep(s => s + 1);
    };

    const handleSubmit = async () => {
        const errs = validate(3, form);
        if (errs.length > 0) {
            setErrors(errs);
            return;
        }
        setErrors([]);
        setSubmitting(true);
        try {
            await dispatch({
                type: 'SUBMIT_DEALER_LISTING',
                payload: {
                    ...form,
                    id: `p${Date.now()}`,
                    price: Number(form.price),
                    km: Number(form.km),
                    year: Number(form.year),
                    status: 'pending',
                    location: `${form.town || form.city}, ${form.district || form.state}`,
                    submittedAt: new Date().toISOString().split('T')[0],
                    featured: false,
                },
            });
            addToast('Listing submitted! Our team will review it shortly.', 'success');
            setSubmitted(true);
        } catch (err) {
            addToast(`Submission failed: ${err.message}`, 'error');
        } finally {
            setSubmitting(false);
        }
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

                {/* Validation error box */}
                {errors.length > 0 && (
                    <div style={{
                        background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius)',
                        padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start',
                    }}>
                        <FiAlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <p style={{ fontWeight: 700, color: '#dc2626', marginBottom: errors.length > 1 ? 8 : 0, fontSize: '0.9rem' }}>
                                Please fix the following before continuing:
                            </p>
                            {errors.length > 1 && (
                                <ul style={{ margin: 0, paddingLeft: 18, color: '#dc2626', fontSize: '0.875rem', lineHeight: 1.7 }}>
                                    {errors.map((e, i) => <li key={i}>{e}</li>)}
                                </ul>
                            )}
                            {errors.length === 1 && (
                                <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{errors[0]}</p>
                            )}
                        </div>
                    </div>
                )}

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
                                    <input type="number" value={form.year} onChange={e => set('year', e.target.value)} min={1990} max={new Date().getFullYear()} className="form-input" />
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

                            {/* PIN auto-fill */}
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">📍 Vehicle PIN Code <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>(auto-fills address details)</span> *</label>
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
                                        if (errors.length > 0) setErrors([]);
                                    }}
                                />
                            </div>

                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">Address *</label>
                                <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="House/Flat No, Street, Landmark" className="form-input" />
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Town/City *</label>
                                    <input value={form.town || form.city} onChange={e => set('town', e.target.value)} placeholder="e.g. Aluva" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Taluk / Block</label>
                                    <input value={form.taluk} onChange={e => set('taluk', e.target.value)} placeholder="e.g. Aluva" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">District *</label>
                                    <input value={form.district} onChange={e => set('district', e.target.value)} placeholder="e.g. Ernakulam" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State *</label>
                                    <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. Kerala" className="form-input" />
                                </div>
                            </div>
                            {/* Dealership Selection */}
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">
                                    <FiMapPin size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                    Nearest Drive Prime Dealership
                                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 6 }}>(where you'll drop off the vehicle for inspection)</span>
                                </label>
                                {dealerships.length === 0 ? (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading dealerships…</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {/* Smart Sorting logic */}
                                        {(() => {
                                            const matchField = form.district || form.state;
                                            const sorted = [...dealerships].sort((a, b) => {
                                                const aMatch = a.district === matchField || a.state === matchField;
                                                const bMatch = b.district === matchField || b.state === matchField;
                                                if (aMatch && !bMatch) return -1;
                                                if (!aMatch && bMatch) return 1;
                                                return a.name.localeCompare(b.name);
                                            });

                                            // Auto-select the top match if nothing is selected and there's a good match
                                            if (matchField && form.dealershipId === '' && (sorted[0].district === matchField || sorted[0].state === matchField)) {
                                                // We use a timeout to avoid updating state directly during render
                                                setTimeout(() => {
                                                    set('dealershipId', sorted[0].id);
                                                    set('dealershipName', sorted[0].name);
                                                }, 0);
                                            }

                                            return sorted.map((d, i) => {
                                                const isBestMatch = matchField && i === 0 && (d.district === matchField || d.state === matchField);
                                                return (
                                                    <label key={d.id} style={{
                                                        display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
                                                        padding: '12px 14px', borderRadius: 'var(--radius)',
                                                        border: `2px solid ${form.dealershipId === d.id ? 'var(--primary)' : 'var(--border)'}`,
                                                        background: form.dealershipId === d.id ? 'var(--primary-light, #fff7ed)' : '#fafafa',
                                                        transition: 'all 0.15s',
                                                    }}>
                                                        <input
                                                            type="radio"
                                                            name="dealershipId"
                                                            value={d.id}
                                                            checked={form.dealershipId === d.id}
                                                            onChange={() => {
                                                                set('dealershipId', d.id);
                                                                set('dealershipName', d.name);
                                                            }}
                                                            style={{ marginTop: 3, accentColor: 'var(--primary)', flexShrink: 0 }}
                                                        />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                {d.name}
                                                                {isBestMatch && (
                                                                    <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: 99, fontWeight: 800 }}>
                                                                        ⭐ CLOSEST MATCH
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                                📍 {d.address}, {d.city}, {d.state}
                                                            </div>
                                                            {d.phone && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 1 }}>📞 {d.phone}</div>}
                                                        </div>
                                                        {form.dealershipId === d.id && <FiCheck size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />}
                                                    </label>
                                                );
                                            });
                                        })()}

                                        <label style={{
                                            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                                            padding: '10px 14px', borderRadius: 'var(--radius)',
                                            border: `2px solid ${!form.dealershipId ? 'var(--primary)' : 'var(--border)'}`,
                                            background: !form.dealershipId ? 'var(--primary-light, #fff7ed)' : '#fafafa',
                                            fontSize: '0.85rem', color: 'var(--text-muted)', transition: 'all 0.15s',
                                        }}>
                                            <input
                                                type="radio"
                                                name="dealershipId"
                                                value="none"
                                                checked={!form.dealershipId}
                                                onChange={() => { set('dealershipId', ''); set('dealershipName', ''); }}
                                                style={{ accentColor: 'var(--primary)' }}
                                            />
                                            I'll discuss the drop-off location later
                                        </label>
                                    </div>
                                )}
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
                                <label className="form-label">About this Vehicle * <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>(min. 20 characters)</span></label>
                                <textarea value={form.about} onChange={e => set('about', e.target.value)}
                                    placeholder="Describe the condition, features, service history, reason for selling..."
                                    className="form-textarea" style={{ minHeight: '160px' }} />
                                <p style={{ fontSize: '0.78rem', color: form.about.trim().length < 20 && form.about.length > 0 ? '#dc2626' : 'var(--text-muted)', marginTop: 4 }}>
                                    {form.about.trim().length} characters{form.about.trim().length < 20 ? ` (${20 - form.about.trim().length} more needed)` : ''}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Images */}
                    {step === 2 && (
                        <div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>Upload Images</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
                                Add up to 10 clear photos. First image will be the cover photo. <strong>At least 1 photo is required.</strong>
                            </p>
                            <ImageUploader images={form.images} onChange={imgs => set('images', imgs)} />
                        </div>
                    )}


                    {/* Step 3: Contact */}
                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '4px' }}>Your Contact Details</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    These details are used internally by Drive Prime to reach you after we verify your listing. They will <strong>not</strong> be shown to buyers.
                                </p>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input value={form.dealerName} onChange={e => set('dealerName', e.target.value)} placeholder="Your full name" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number * <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>(10 digits)</span></label>
                                    <input type="tel" value={form.dealerPhone} onChange={e => set('dealerPhone', e.target.value)} placeholder="10-digit mobile" className="form-input" maxLength={10} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address *</label>
                                    <input type="email" value={form.dealerEmail} onChange={e => set('dealerEmail', e.target.value)} placeholder="your@email.com" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">WhatsApp Number <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>(optional)</span></label>
                                    <input type="tel" value={form.dealerWhatsApp} onChange={e => set('dealerWhatsApp', e.target.value)} placeholder="Same as phone (or different)" className="form-input" maxLength={10} />
                                </div>
                            </div>

                            {/* Address + PIN */}
                            <div className="form-group">
                                <label className="form-label">Street Address <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>(optional — for pickup/inspection)</span></label>
                                <input
                                    value={form.dealerAddress}
                                    onChange={e => set('dealerAddress', e.target.value)}
                                    placeholder="Flat/House No., Street, Area"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Your Area PIN Code <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>(optional)</span></label>
                                <PinCodeInput
                                    value={form.dealerPin}
                                    onChange={v => set('dealerPin', v)}
                                />
                            </div>

                            {/* Privacy notice */}
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius)', padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: 18 }}>🔒</span>
                                <p style={{ fontSize: '0.85rem', color: '#166534', margin: 0, lineHeight: 1.6 }}>
                                    <strong>Your privacy is protected.</strong> Drive Prime will contact you directly after verification. Buyers will only see Drive Prime's contact details — your personal information is never shared.
                                </p>
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
                                        ['Photos', `${form.images.length} uploaded`],
                                        ['Dealership', form.dealershipName || 'To be confirmed'],
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
                        <button onClick={() => { setErrors([]); setStep(s => s - 1); }} className="btn btn-outline"
                            style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
                            <FiArrowLeft size={16} /> Previous
                        </button>
                        {step < STEPS.length - 1 ? (
                            <button onClick={handleNext} className="btn btn-primary">
                                Next <FiArrowRight size={16} />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} className="btn btn-primary" disabled={submitting}>
                                <FiUpload size={16} /> {submitting ? 'Submitting…' : 'Submit Listing'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
