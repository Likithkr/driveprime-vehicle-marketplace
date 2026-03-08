/**
 * PinCodeInput — 6-digit India PIN code input that auto-fetches
 * district/state from api.postalpincode.in and calls onResolved(state, city).
 *
 * Props:
 *   value        current PIN value (string)
 *   onChange     (pin: string) => void
 *   onResolved   (details: object) => void — called when PIN resolves, passes { state, district, taluk, town, city, pincode }
 *   style        optional extra styles for the wrapper
 *   disabled     optional
 */
import { useState, useEffect, useRef } from 'react';
import { FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function PinCodeInput({ value, onChange, onResolved, style, disabled }) {
    const [status, setStatus] = useState('idle'); // idle | loading | ok | error
    const [hint, setHint] = useState('');
    const timerRef = useRef(null);

    useEffect(() => {
        if (value?.length !== 6 || !/^\d{6}$/.test(value)) {
            setStatus('idle');
            setHint('');
            return;
        }
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            setStatus('loading');
            setHint('');
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
                const [data] = await res.json();
                if (data.Status !== 'Success' || !data.PostOffice?.length) {
                    setStatus('error');
                    setHint('PIN not found — check and retry');
                    return;
                }
                const po = data.PostOffice[0];
                const resolvedState = po.State;
                const resolvedDistrict = po.District || po.Region || '';
                const resolvedTaluk = po.Block || '';
                const resolvedTown = po.Name || '';
                const resolvedCity = po.District || po.Region || po.Block || po.Name; // backward compat

                setStatus('ok');
                setHint(`${resolvedTown}, ${resolvedDistrict}, ${resolvedState}`);
                onResolved?.({
                    state: resolvedState,
                    district: resolvedDistrict,
                    taluk: resolvedTaluk,
                    town: resolvedTown,
                    city: resolvedCity,
                    pincode: value
                });
            } catch {
                setStatus('error');
                setHint('Could not fetch PIN details');
            }
        }, 500); // debounce 500ms
        return () => clearTimeout(timerRef.current);
    }, [value]);

    const colors = { idle: '#94a3b8', loading: '#f97316', ok: '#16a34a', error: '#dc2626' };
    const color = colors[status];

    return (
        <div style={style}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="e.g. 682001"
                    value={value}
                    onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                        onChange(v);
                    }}
                    disabled={disabled}
                    className="form-input"
                    style={{ paddingRight: 36 }}
                />
                {/* Status icon */}
                <span style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    color, display: 'flex', alignItems: 'center',
                }}>
                    {status === 'loading' && (
                        <FiLoader size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    )}
                    {status === 'ok' && <FiCheckCircle size={15} />}
                    {status === 'error' && <FiAlertCircle size={15} />}
                </span>
            </div>
            {hint && (
                <p style={{ marginTop: 5, fontSize: '0.77rem', color, fontWeight: 600 }}>
                    {status === 'ok' ? '📍 ' : '⚠️ '}{hint}
                </p>
            )}
            <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
        </div>
    );
}
