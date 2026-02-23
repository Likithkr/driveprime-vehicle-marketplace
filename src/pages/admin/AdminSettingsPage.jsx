import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/ToastProvider';
import { useCustomer } from '../../hooks/useCustomer';
import { API_BASE } from '../../lib/config';

export default function AdminSettingsPage() {
    const { state } = useStore();
    const { addToast } = useToast();
    const customerHook = useCustomer();
    const navigate = useNavigate();
    const [flags, setFlags] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState('');

    if (!state.isAdminLoggedIn) { navigate('/admin/login'); return null; }

    const adminToken = customerHook.getToken();
    // Check if current admin session is developer role
    const currentUser = customerHook.getUser();
    const isDeveloper = currentUser?.role === 'developer';

    useEffect(() => {
        fetch(`${API_BASE}/api/flags`)
            .then(r => r.json())
            .then(data => { setFlags(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleToggle = async (key, currentValue) => {
        if (!isDeveloper) {
            addToast('Only developers can change feature flags', 'error');
            return;
        }
        setUpdating(key);
        try {
            const res = await fetch(`${API_BASE}/api/flags/${key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({ value: !currentValue }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setFlags(prev => ({ ...prev, [key]: { ...prev[key], value: Boolean(data.value) } }));
            addToast(`Flag "${key}" ${!currentValue ? 'enabled' : 'disabled'}`, 'success');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setUpdating('');
        }
    };

    const flagDescriptions = {
        allow_customer_selling: {
            label: 'Customer Vehicle Selling',
            hint: 'When enabled, customers can submit their own vehicles for sale via the "Sell Your Car" page.',
        },
        maintenance_mode: {
            label: 'Maintenance Mode',
            hint: 'When enabled, a maintenance notice banner is shown at the top of the website.',
        },
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 0 80px' }}>
            <div className="container" style={{ maxWidth: '720px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <Link to="/admin/dashboard" className="btn btn-outline btn-sm"><FiArrowLeft size={14} /></Link>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>Feature Flags</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {isDeveloper ? '🟢 Developer mode — you can toggle all flags' : '🔒 Read-only — only developers can change flags'}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <p style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>Loading flags…</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {Object.entries(flags).map(([key, flag]) => {
                            const meta = flagDescriptions[key] || { label: key, hint: '' };
                            const isOn = Boolean(flag.value);
                            const busy = updating === key;
                            return (
                                <div key={key} style={{
                                    background: '#fff', borderRadius: 'var(--radius-lg)', border: `1.5px solid ${isOn ? '#16a34a' : 'var(--border)'}`,
                                    padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: 'var(--shadow)',
                                    opacity: busy ? 0.7 : 1, transition: 'all 0.2s',
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{meta.label}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{meta.hint}</div>
                                        {flag.updatedAt && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                                Last changed: {new Date(flag.updatedAt).toLocaleString('en-IN')}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isOn ? '#16a34a' : '#9ca3af' }}>
                                            {isOn ? 'ON' : 'OFF'}
                                        </span>
                                        <button
                                            onClick={() => handleToggle(key, isOn)}
                                            disabled={!isDeveloper || busy}
                                            style={{ background: 'none', border: 'none', cursor: isDeveloper ? 'pointer' : 'not-allowed', padding: 0 }}
                                        >
                                            {isOn
                                                ? <FiToggleRight size={40} style={{ color: '#16a34a' }} />
                                                : <FiToggleLeft size={40} style={{ color: '#d1d5db' }} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
