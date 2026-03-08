import { useState } from 'react';
import { FiX, FiCalendar, FiMessageSquare, FiCheck } from 'react-icons/fi';
import { useCustomer } from '../hooks/useCustomer';
import { api } from '../lib/api';

export default function BookAppointmentModal({ listing, onClose, onOpenAuth }) {
    const customer = useCustomer();
    const user = customer.getUser();
    const token = customer.getToken();
    const isLoggedIn = customer.isLoggedIn();

    const [form, setForm] = useState({
        preferred_date: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().split('T')[0];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.appointments.submit({
                listing_id: listing.id,
                car_name: `${listing.brand} ${listing.model} ${listing.variant} ${listing.year}`,
                preferred_date: form.preferred_date,
                message: form.message,
            }, token);
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20, animation: 'fadeIn 0.2s ease',
            }}
            onClick={onClose}
        >
            <style>{`
                @keyframes fadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
                @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                .appt-modal { animation: slideUp 0.25s ease; }
            `}</style>
            <div
                className="appt-modal"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '460px',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.3)', overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                            <FiCalendar size={20} /> Book a Viewing
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', marginTop: 4 }}>
                            {listing.brand} {listing.model} {listing.variant} · {listing.year}
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '99px',
                        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#fff',
                    }}>
                        <FiX size={18} />
                    </button>
                </div>

                <div style={{ padding: '28px' }}>
                    {/* Success state */}
                    {success ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px', color: '#fff',
                            }}>
                                <FiCheck size={28} strokeWidth={3} />
                            </div>
                            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 8 }}>Request Sent!</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                                Your appointment request has been submitted. We'll review it and send you a confirmation
                                with the exact date, time and location to <strong>{user?.email}</strong>.
                            </p>
                            <button onClick={onClose} className="btn btn-primary" style={{ marginTop: 24, justifyContent: 'center', width: '100%' }}>
                                Done
                            </button>
                        </div>
                    ) : !isLoggedIn ? (
                        /* Not logged in — prompt */
                        <div style={{ textAlign: 'center', padding: '12px 0' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
                            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>Sign In to Book</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 24 }}>
                                You need to be signed in to schedule a viewing appointment. Create a free account — it only takes a minute!
                            </p>
                            <button
                                className="btn btn-primary"
                                style={{ justifyContent: 'center', width: '100%' }}
                                onClick={() => { onClose(); onOpenAuth(); }}
                            >
                                Sign In / Register
                            </button>
                        </div>
                    ) : (
                        /* Booking form */
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Pre-filled info */}
                            <div style={{
                                background: '#f8fafc', borderRadius: 12, padding: '14px 16px',
                                border: '1px solid var(--border)', fontSize: '0.875rem',
                            }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 4 }}>Booking as</p>
                                <p style={{ fontWeight: 700 }}>{user?.name}</p>
                                <p style={{ color: 'var(--text-muted)' }}>{user?.email} · {user?.phone || 'No phone on file'}</p>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
                                    Preferred Visit Date *
                                </label>
                                <input
                                    type="date"
                                    min={minDateStr}
                                    value={form.preferred_date}
                                    onChange={(e) => setForm(f => ({ ...f, preferred_date: e.target.value }))}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
                                    <FiMessageSquare size={14} /> Message (optional)
                                </label>
                                <textarea
                                    value={form.message}
                                    onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                                    placeholder="Any specific questions or requests?"
                                    className="form-input"
                                    rows={3}
                                    style={{ resize: 'vertical', minHeight: 80 }}
                                />
                            </div>

                            {error && (
                                <p style={{ color: '#dc2626', background: '#fee2e2', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem' }}>
                                    ⚠️ {error}
                                </p>
                            )}

                            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={loading}>
                                {loading ? 'Submitting…' : '📅 Request Appointment'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
