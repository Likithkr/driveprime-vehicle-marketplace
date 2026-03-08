/**
 * DocumentUploader — upload vehicle ownership/compliance documents
 * Accepts PDF, DOCX, DOC. Reads as base64 for backend transmission.
 *
 * Props:
 *   docs     { [slotKey]: { name, size, data, type } | null }
 *   onChange  (updatedDocs) => void
 */
import { useRef } from 'react';
import { FiUpload, FiX, FiFile, FiCheckCircle } from 'react-icons/fi';

// Indian vehicle documents required / optional for resale
export const DOC_SLOTS = [
    {
        key: 'rc',
        label: 'Registration Certificate (RC)',
        desc: 'Vehicle RC book / smart card issued by RTO',
        required: true,
        emoji: '📋',
    },
    {
        key: 'insurance',
        label: 'Insurance Certificate',
        desc: 'Current valid motor insurance policy document',
        required: true,
        emoji: '🛡️',
    },
    {
        key: 'puc',
        label: 'PUC Certificate',
        desc: 'Pollution Under Control certificate (latest)',
        required: true,
        emoji: '🌿',
    },
    {
        key: 'id_proof',
        label: 'ID Proof (Aadhaar / PAN)',
        desc: "Owner's Aadhaar card or PAN card",
        required: true,
        emoji: '🪪',
    },
    {
        key: 'form29',
        label: 'Form 29 — Notice of Transfer',
        desc: 'Signed notice of transfer of ownership (RTO Form 29)',
        required: false,
        emoji: '📝',
    },
    {
        key: 'form30',
        label: 'Form 30 — Application for Transfer',
        desc: 'Application for transfer of ownership (RTO Form 30)',
        required: false,
        emoji: '📝',
    },
    {
        key: 'noc',
        label: 'NOC from Financier / Bank',
        desc: 'No Objection Certificate — required if vehicle was under a loan',
        required: false,
        emoji: '🏦',
    },
    {
        key: 'service_history',
        label: 'Service History / Invoices',
        desc: 'Authorised service centre records, repair invoices (optional)',
        required: false,
        emoji: '🔧',
    },
];

const ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_MB = 5;

function humanSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileTypeBadge(name = '') {
    if (name.endsWith('.pdf')) return { label: 'PDF', bg: '#fee2e2', color: '#dc2626' };
    if (name.endsWith('.docx') || name.endsWith('.doc')) return { label: 'DOCX', bg: '#dbeafe', color: '#1d4ed8' };
    return { label: 'FILE', bg: '#f3f4f6', color: '#374151' };
}

export default function DocumentUploader({ docs = {}, onChange }) {
    const inputRefs = useRef({});

    const handleFile = (slotKey, file) => {
        if (!file) return;
        const ext = file.name.toLowerCase();
        const isPdf = file.type === 'application/pdf' || ext.endsWith('.pdf');
        const isDoc = file.type === 'application/msword'
            || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            || ext.endsWith('.doc') || ext.endsWith('.docx');
        if (!isPdf && !isDoc) {
            alert('Only PDF and DOCX/DOC files are accepted.');
            return;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
            alert(`File too large. Maximum size is ${MAX_MB} MB.`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            onChange({ ...docs, [slotKey]: { name: file.name, size: file.size, type: file.type, data: e.target.result } });
        };
        reader.readAsDataURL(file);
    };

    const removeDoc = (slotKey) => {
        const updated = { ...docs };
        delete updated[slotKey];
        onChange(updated);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {DOC_SLOTS.map(slot => {
                const uploaded = docs[slot.key];
                const badge = fileTypeBadge(uploaded?.name || '');
                return (
                    <div key={slot.key} style={{
                        border: `1.5px solid ${uploaded ? '#22c55e' : 'var(--border)'}`,
                        borderRadius: 'var(--radius)',
                        padding: '14px 18px',
                        background: uploaded ? '#f0fdf4' : '#fff',
                        transition: 'border-color 0.2s, background 0.2s',
                        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                    }}>
                        {/* Icon + label */}
                        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                <span style={{ fontSize: 18 }}>{slot.emoji}</span>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{slot.label}</span>
                                {slot.required
                                    ? <span style={{ fontSize: '0.68rem', background: '#fee2e2', color: '#dc2626', padding: '2px 7px', borderRadius: '99px', fontWeight: 700 }}>REQUIRED</span>
                                    : <span style={{ fontSize: '0.68rem', background: '#f1f5f9', color: '#64748b', padding: '2px 7px', borderRadius: '99px', fontWeight: 600 }}>Optional</span>
                                }
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{slot.desc}</p>
                        </div>

                        {/* Uploaded file info OR upload button */}
                        {uploaded ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                <FiCheckCircle size={18} color="#22c55e" />
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{
                                            fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px',
                                            borderRadius: 4, background: badge.bg, color: badge.color,
                                        }}>{badge.label}</span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {uploaded.name}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{humanSize(uploaded.size)}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeDoc(slot.key)}
                                    style={{
                                        background: '#fee2e2', border: 'none', borderRadius: '99px',
                                        width: 28, height: 28, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', cursor: 'pointer', color: '#dc2626', flexShrink: 0,
                                    }}
                                >
                                    <FiX size={13} />
                                </button>
                            </div>
                        ) : (
                            <div style={{ flexShrink: 0 }}>
                                <input
                                    ref={el => inputRefs.current[slot.key] = el}
                                    type="file"
                                    accept={ACCEPT}
                                    style={{ display: 'none' }}
                                    onChange={e => handleFile(slot.key, e.target.files[0])}
                                />
                                <button
                                    type="button"
                                    onClick={() => inputRefs.current[slot.key]?.click()}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '8px 16px', borderRadius: 'var(--radius)',
                                        border: '1.5px dashed var(--primary)',
                                        background: 'rgba(249,115,22,0.06)', color: 'var(--primary)',
                                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <FiUpload size={13} /> Upload <FiFile size={12} style={{ opacity: 0.7 }} />
                                </button>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4, textAlign: 'center' }}>PDF / DOCX · max {MAX_MB} MB</div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
