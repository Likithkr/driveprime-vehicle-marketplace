import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/ToastProvider';
import { useAdmin } from '../../hooks/useAdmin';
import { useFlags } from '../../context/FlagsContext';
import { API_BASE } from '../../lib/config';

export default function AdminSettingsPage() {
    const { state, dispatch } = useStore();
    const { addToast } = useToast();
    const { refreshFlags } = useFlags();
    const adminHook = useAdmin();
    const navigate = useNavigate();
    const [flags, setFlags] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState('');

    const [settingsList, setSettingsList] = useState([]);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [updatingSetting, setUpdatingSetting] = useState('');
    const [settingValues, setSettingValues] = useState({});

    if (!state.isAdminLoggedIn) { navigate('/admin/login'); return null; }

    const adminToken = adminHook.getToken();
    const currentUser = adminHook.getUser();
    const isDeveloper = currentUser?.role === 'developer';

    useEffect(() => {
        // Fetch feature flags
        fetch(`${API_BASE}/api/flags`)
            .then(r => r.json())
            .then(data => { setFlags(data); setLoading(false); })
            .catch(() => setLoading(false));

        // Fetch settings if developer
        if (isDeveloper) {
            fetch(`${API_BASE}/api/settings/all`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
                .then(r => r.json())
                .then(data => {
                    setSettingsList(data);
                    const vals = {};
                    data.forEach(s => vals[s.key] = s.value);
                    setSettingValues(vals);
                    setLoadingSettings(false);
                })
                .catch(() => setLoadingSettings(false));
        }
    }, [isDeveloper, adminToken]);

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
            refreshFlags(); // sync global store
            addToast(`Flag "${key}" ${!currentValue ? 'enabled' : 'disabled'}`, 'success');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setUpdating('');
        }
    };

    const handleSaveSetting = async (key) => {
        setUpdatingSetting(key);
        try {
            const res = await fetch(`${API_BASE}/api/settings/${key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({ value: settingValues[key] }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Update global store so UI (navbar, footer) updates immediately
            dispatch({ type: 'SET_SETTINGS', payload: { ...state.settings, [key]: data.value } });
            addToast(`Setting "${key}" updated successfully`, 'success');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setUpdatingSetting('');
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

                {/* ── Platform Settings ───────────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, marginTop: 48 }}>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>Platform Details</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {isDeveloper ? 'Customize the brand name, logo, and contact information.' : '🔒 Read-only — only developers can change platform details.'}
                        </p>
                    </div>
                </div>

                {isDeveloper && !loadingSettings && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {settingsList.map((s) => {
                            const busy = updatingSetting === s.key;
                            return (
                                <div key={s.key} style={{
                                    background: '#fff', borderRadius: 'var(--radius-lg)', border: `1px solid var(--border)`,
                                    padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: 'var(--shadow)',
                                    opacity: busy ? 0.7 : 1, transition: 'all 0.2s',
                                }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.key}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.description}</div>
                                        </div>
                                        <input
                                            value={settingValues[s.key] || ''}
                                            onChange={e => setSettingValues(prev => ({ ...prev, [s.key]: e.target.value }))}
                                            className="form-input"
                                            style={{ marginTop: 8 }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleSaveSetting(s.key)}
                                        disabled={busy}
                                        className="btn btn-primary"
                                        style={{ alignSelf: 'flex-end', marginBottom: 4 }}
                                    >
                                        {busy ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
