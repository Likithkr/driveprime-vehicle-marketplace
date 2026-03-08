import { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiX, FiTrash2, FiCalendar, FiClock, FiMapPin, FiUser, FiPhone, FiMail, FiChevronDown } from 'react-icons/fi';
import { api } from '../../lib/api';
import { useSSE } from '../../hooks/useSSE';

const ADMIN_SESSION_KEY = 'dp_admin';
function getAdminToken() {
    try {
        const raw = localStorage.getItem(ADMIN_SESSION_KEY);
        return raw ? JSON.parse(raw)?.token : null;
    } catch { return null; }
}

const STATUS_COLORS = {
    pending: { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
    confirmed: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
    cancelled: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};

function StatusChip({ status }) {
    const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
    return (
        <span style={{
            background: s.bg, color: s.color, padding: '4px 12px',
            borderRadius: '99px', fontSize: '0.78rem', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

const TABS = ['all', 'pending', 'confirmed', 'cancelled'];

export default function AdminAppointmentsPage() {
    const token = getAdminToken();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('all');
    const [confirmingId, setConfirmingId] = useState(null);
    const [confirmForm, setConfirmForm] = useState({ confirmed_date: '', confirmed_time: '', confirmed_location: '' });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

    const fetchAppointments = useCallback(async () => {
        try {
            const data = await api.appointments.getAll(token);
            setAppointments(data);
        } catch (err) {
            showToast('❌ ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    // Live update: re-fetch when any appointment changes anywhere
    useSSE({ onAppointmentsChanged: fetchAppointments });

    const filtered = tab === 'all' ? appointments : appointments.filter(a => a.status === tab);
    const count = (s) => appointments.filter(a => a.status === s).length;

    const handleConfirm = async (id) => {
        const { confirmed_date, confirmed_time, confirmed_location } = confirmForm;
        if (!confirmed_date || !confirmed_time || !confirmed_location) {
            return showToast('⚠️ Please fill in all confirmation details.');
        }
        setSaving(true);
        try {
            const updated = await api.appointments.confirm(id, confirmForm, token);
            setAppointments(prev => prev.map(a => a.id === id ? updated : a));
            setConfirmingId(null);
            setConfirmForm({ confirmed_date: '', confirmed_time: '', confirmed_location: '' });
            showToast('✅ Appointment confirmed — customer notified via email & WhatsApp!');
        } catch (err) {
            showToast('❌ ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this appointment? The customer will be notified.')) return;
        try {
            const updated = await api.appointments.cancel(id, token);
            setAppointments(prev => prev.map(a => a.id === id ? updated : a));
            showToast('📧 Appointment cancelled — customer notified.');
        } catch (err) {
            showToast('❌ ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Permanently delete this appointment?')) return;
        try {
            await api.appointments.remove(id, token);
            setAppointments(prev => prev.filter(a => a.id !== id));
            showToast('🗑 Appointment deleted.');
        } catch (err) {
            showToast('❌ ' + err.message);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    background: '#1e293b', color: '#fff', padding: '14px 24px',
                    borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    fontSize: '0.9rem', fontWeight: 600, animation: 'slideIn 0.2s ease',
                }}>
                    {toast}
                </div>
            )}

            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontWeight: 800, fontSize: '1.75rem', color: '#0f172a' }}>📅 Appointments</h1>
                    <p style={{ color: '#64748b', marginTop: 4 }}>Manage in-person viewing requests. Confirm with details to notify the customer.</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: '8px 18px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                            fontWeight: 700, fontSize: '0.85rem',
                            background: tab === t ? 'var(--primary, #f97316)' : '#fff',
                            color: tab === t ? '#fff' : '#475569',
                            boxShadow: tab === t ? '0 2px 8px rgba(249,115,22,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
                            transition: 'all 0.2s',
                        }}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                            {t !== 'all' && count(t) > 0 && (
                                <span style={{ marginLeft: 6, background: 'rgba(255,255,255,0.25)', padding: '1px 8px', borderRadius: '99px', fontSize: '0.78rem' }}>
                                    {count(t)}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>Loading appointments…</div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                        <p style={{ fontWeight: 600 }}>No appointments found</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {filtered.map(appt => (
                            <div key={appt.id} style={{
                                background: '#fff', borderRadius: 16, padding: 24,
                                border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    {/* Info block */}
                                    <div style={{ flex: '1 1 340px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                            <StatusChip status={appt.status} />
                                            <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                                                {new Date(appt.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: 8 }}>
                                            🚗 {appt.car_name}
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', fontSize: '0.85rem', color: '#475569' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiUser size={13} /> {appt.customer_name}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiMail size={13} /> {appt.customer_email}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiPhone size={13} /> {appt.customer_phone || 'N/A'}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <FiCalendar size={13} /> Requested: {new Date(appt.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        {appt.message && (
                                            <div style={{ marginTop: 10, background: '#f8fafc', borderRadius: 8, padding: '8px 12px', fontSize: '0.82rem', color: '#64748b', borderLeft: '3px solid #e2e8f0' }}>
                                                {appt.message}
                                            </div>
                                        )}
                                        {appt.status === 'confirmed' && (
                                            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: '6px 20px', fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                                                <span><FiCalendar size={13} style={{ marginRight: 4 }} />
                                                    {new Date(appt.confirmed_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </span>
                                                <span><FiClock size={13} style={{ marginRight: 4 }} />{appt.confirmed_time}</span>
                                                <span><FiMapPin size={13} style={{ marginRight: 4 }} />{appt.confirmed_location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action block */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                                        {appt.status === 'pending' && (
                                            <button
                                                onClick={() => setConfirmingId(confirmingId === appt.id ? null : appt.id)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
                                                    border: 'none', borderRadius: '10px', padding: '9px 16px',
                                                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                <FiCheck size={14} /> Confirm <FiChevronDown size={13} />
                                            </button>
                                        )}
                                        {appt.status === 'pending' && (
                                            <button onClick={() => handleCancel(appt.id)} style={{
                                                background: '#fff', color: '#dc2626', border: '1px solid #fca5a5',
                                                borderRadius: '10px', padding: '8px 16px', fontWeight: 700, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem',
                                            }}>
                                                <FiX size={14} /> Cancel
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(appt.id)} style={{
                                            background: 'transparent', color: '#94a3b8', border: '1px solid #e2e8f0',
                                            borderRadius: '10px', padding: '8px 16px', fontWeight: 600, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem',
                                        }}>
                                            <FiTrash2 size={13} /> Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm sub-form */}
                                {confirmingId === appt.id && (
                                    <div style={{
                                        marginTop: 20, padding: '20px', background: '#f0fdf4',
                                        borderRadius: 12, border: '1px solid #bbf7d0',
                                    }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#166534', marginBottom: 14 }}>
                                            ✅ Set confirmed appointment details:
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                            <div style={{ flex: '1 1 160px' }}>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534', display: 'block', marginBottom: 4 }}>Date *</label>
                                                <input
                                                    type="date"
                                                    className="form-input"
                                                    value={confirmForm.confirmed_date}
                                                    onChange={e => setConfirmForm(f => ({ ...f, confirmed_date: e.target.value }))}
                                                    style={{ fontSize: '0.875rem', padding: '8px 12px' }}
                                                    required
                                                />
                                            </div>
                                            <div style={{ flex: '1 1 120px' }}>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534', display: 'block', marginBottom: 4 }}>Time *</label>
                                                <input
                                                    type="time"
                                                    className="form-input"
                                                    value={confirmForm.confirmed_time}
                                                    onChange={e => setConfirmForm(f => ({ ...f, confirmed_time: e.target.value }))}
                                                    style={{ fontSize: '0.875rem', padding: '8px 12px' }}
                                                    required
                                                />
                                            </div>
                                            <div style={{ flex: '2 1 240px' }}>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534', display: 'block', marginBottom: 4 }}>Location *</label>
                                                <input
                                                    type="text"
                                                    list="location-suggestions"
                                                    className="form-input"
                                                    placeholder="e.g. Drive Prime Showroom, Marine Drive, Kochi"
                                                    value={confirmForm.confirmed_location}
                                                    onChange={e => setConfirmForm(f => ({ ...f, confirmed_location: e.target.value }))}
                                                    style={{ fontSize: '0.875rem', padding: '8px 12px' }}
                                                    required
                                                />
                                                <datalist id="location-suggestions">
                                                    <option value="Drive Prime Showroom, Kochi" />
                                                    <option value="Drive Prime Showroom, Bangalore" />
                                                    <option value="Drive Prime Showroom, Chennai" />
                                                    <option value="Drive Prime Showroom, Hyderabad" />
                                                    <option value="Drive Prime Showroom, Mumbai" />
                                                    <option value="Drive Prime Showroom, Delhi" />
                                                    <option value="Drive Prime Showroom, Pune" />
                                                    <option value="Drive Prime Inspection Centre, Kochi" />
                                                    <option value="Drive Prime Inspection Centre, Bangalore" />
                                                    <option value="Customer's Address (Home Visit)" />
                                                    <option value="Online Video Inspection (Zoom/WhatsApp)" />
                                                </datalist>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                                            <button
                                                onClick={() => handleConfirm(appt.id)}
                                                disabled={saving}
                                                style={{
                                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
                                                    border: 'none', borderRadius: '10px', padding: '10px 22px',
                                                    fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                                                }}
                                            >
                                                {saving ? 'Sending…' : '📨 Confirm & Notify Customer'}
                                            </button>
                                            <button onClick={() => setConfirmingId(null)} style={{
                                                background: '#fff', color: '#475569', border: '1px solid #e2e8f0',
                                                borderRadius: '10px', padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
                                            }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
