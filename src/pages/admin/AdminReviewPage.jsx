import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiEye, FiMapPin, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { BsSpeedometer2, BsFuelPump } from 'react-icons/bs';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/ToastProvider';
import { useAdmin } from '../../hooks/useAdmin';
import { useFlags } from '../../context/FlagsContext';

// All documents admin must physically verify
const DOC_CHECKLIST = [
    { key: 'rc', label: 'Registration Certificate (RC)', required: true, emoji: '📋', desc: 'RC book / smart card — verify name, chassis & engine number' },
    { key: 'insurance', label: 'Insurance Certificate', required: true, emoji: '🛡️', desc: 'Current valid motor insurance policy — check expiry date' },
    { key: 'puc', label: 'PUC Certificate', required: true, emoji: '🌿', desc: 'Latest Pollution Under Control certificate — check validity' },
    { key: 'id_proof', label: 'ID Proof (Aadhaar / PAN)', required: true, emoji: '🪪', desc: 'Owner identity document — verify name matches RC' },
    { key: 'form29', label: 'Form 29 — Notice of Transfer', required: false, emoji: '📝', desc: 'Signed transfer notice — required for smooth RTO process' },
    { key: 'form30', label: 'Form 30 — Transfer Application', required: false, emoji: '📝', desc: 'Application for transfer of ownership' },
    { key: 'noc', label: 'NOC from Financier / Bank', required: false, emoji: '🏦', desc: 'Needed if vehicle was under a loan — must be original' },
    { key: 'service_history', label: 'Service History / Invoices', required: false, emoji: '🔧', desc: 'Authorised service records — improves buyer confidence' },
];

// Vehicle condition grades
const GRADES = [
    { grade: 'A', label: 'Excellent', color: '#16a34a', bg: '#dcfce7', desc: 'Like new, no issues' },
    { grade: 'B', label: 'Good', color: '#2563eb', bg: '#dbeafe', desc: 'Minor wear, fully functional' },
    { grade: 'C', label: 'Fair', color: '#d97706', bg: '#fef3c7', desc: 'Moderate wear, some repairs needed' },
    { grade: 'D', label: 'Poor', color: '#dc2626', bg: '#fee2e2', desc: 'Major issues, significant repairs needed' },
];

function ReviewPanel({ listing, onApprove, onReject, approving }) {
    const [docs, setDocs] = useState({});        // { [key]: true/false }
    const [grade, setGrade] = useState('');
    const [notes, setNotes] = useState('');

    const requiredDocs = DOC_CHECKLIST.filter(d => d.required);
    const verifiedCount = requiredDocs.filter(d => docs[d.key]).length;
    const allRequiredOk = verifiedCount === requiredDocs.length && grade !== '';

    const toggleDoc = (key) => setDocs(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div style={{ borderTop: '1px solid var(--border)', background: '#fafafa' }}>
            {/* Tabs layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

                {/* ── LEFT: Vehicle details + photos ── */}
                <div style={{ padding: '24px', borderRight: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 12 }}>VEHICLE DETAILS</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: 20 }}>
                        {[
                            ['Ownership', listing.ownership],
                            ['Transmission', listing.transmission],
                            ['Insurance', listing.insurance || 'N/A'],
                            ['Color', listing.color || 'N/A'],
                            ['Dealer Phone', listing.dealerPhone],
                            ['Dealer Email', listing.dealerEmail],
                            ['WhatsApp', listing.dealerWhatsApp || listing.dealerPhone],
                            ['Address', listing.dealerAddress || '—'],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>{k}</p>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem', wordBreak: 'break-all' }}>{v}</p>
                            </div>
                        ))}
                    </div>

                    {listing.about && (
                        <div style={{ marginBottom: 20 }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 6 }}>DESCRIPTION</p>
                            <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text)' }}>{listing.about}</p>
                        </div>
                    )}

                    {listing.images?.length > 0 && (
                        <div>
                            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 10 }}>
                                PHOTOS ({listing.images.length})
                            </p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {listing.images.map((img, i) => (
                                    <img key={i} src={img} alt={`Photo ${i + 1}`}
                                        style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 8, flexShrink: 0, cursor: 'pointer' }}
                                        onClick={() => window.open(img, '_blank')}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Doc checklist + grading ── */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Document checklist */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                                DOCUMENT VERIFICATION
                            </p>
                            <span style={{
                                fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '99px',
                                background: verifiedCount === requiredDocs.length ? '#dcfce7' : '#fef3c7',
                                color: verifiedCount === requiredDocs.length ? '#16a34a' : '#92400e',
                            }}>
                                {verifiedCount}/{requiredDocs.length} required verified
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {DOC_CHECKLIST.map(doc => (
                                <label key={doc.key} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                                    padding: '10px 12px', borderRadius: 'var(--radius)',
                                    border: `1.5px solid ${docs[doc.key] ? '#22c55e' : 'var(--border)'}`,
                                    background: docs[doc.key] ? '#f0fdf4' : '#fff',
                                    transition: 'all 0.15s',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={!!docs[doc.key]}
                                        onChange={() => toggleDoc(doc.key)}
                                        style={{ marginTop: 2, width: 16, height: 16, accentColor: 'var(--primary)', flexShrink: 0 }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 14 }}>{doc.emoji}</span>
                                            <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{doc.label}</span>
                                            {doc.required
                                                ? <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '99px', fontWeight: 700 }}>REQUIRED</span>
                                                : <span style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#64748b', padding: '1px 6px', borderRadius: '99px' }}>Optional</span>
                                            }
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{doc.desc}</p>
                                    </div>
                                    {docs[doc.key] && <FiCheck size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Vehicle condition grade */}
                    <div>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 10 }}>
                            CONDITION GRADE *
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {GRADES.map(g => (
                                <button key={g.grade} type="button"
                                    onClick={() => setGrade(g.grade)}
                                    style={{
                                        flex: '1 1 80px', padding: '10px 8px', borderRadius: 'var(--radius)',
                                        border: `2px solid ${grade === g.grade ? g.color : 'var(--border)'}`,
                                        background: grade === g.grade ? g.bg : '#fff',
                                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                                    }}
                                >
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: g.color }}>{g.grade}</div>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: g.color }}>{g.label}</div>
                                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>{g.desc}</div>
                                </button>
                            ))}
                        </div>
                        {!grade && (
                            <p style={{ fontSize: '0.78rem', color: '#d97706', marginTop: 6 }}>
                                ⚠️ Select a condition grade before approving
                            </p>
                        )}
                    </div>

                    {/* Admin notes */}
                    <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                            ADMIN NOTES (internal)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Any internal notes about this vehicle or seller…"
                            className="form-input"
                            rows={3}
                            style={{ resize: 'vertical', fontSize: '0.875rem' }}
                        />
                    </div>

                    {/* Readiness status */}
                    {!allRequiredOk && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
                            <FiAlertTriangle size={15} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: '0.82rem', color: '#92400e', margin: 0 }}>
                                {verifiedCount < requiredDocs.length
                                    ? `Verify all ${requiredDocs.length} required documents before approving.`
                                    : 'Select a condition grade before approving.'}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button onClick={() => onReject(listing.id)}
                            className="btn btn-sm"
                            style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 700, flex: 1, justifyContent: 'center' }}>
                            <FiXCircle size={14} /> Reject
                        </button>
                        <button
                            onClick={() => onApprove(listing.id, { grade, notes, verifiedDocs: Object.keys(docs).filter(k => docs[k]) })}
                            className="btn btn-primary"
                            disabled={approving === listing.id || !allRequiredOk}
                            style={{ flex: 2, justifyContent: 'center', opacity: !allRequiredOk ? 0.5 : 1 }}
                        >
                            <FiCheckCircle size={15} />
                            {approving === listing.id ? 'Approving…' : `Approve & Publish${grade ? ` (Grade ${grade})` : ''}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminReviewPage() {
    const { state, dispatch } = useStore();
    const { addToast } = useToast();
    const { flags } = useFlags();
    const navigate = useNavigate();
    const admin = useAdmin();
    const [expanded, setExpanded] = useState(null);
    const [approving, setApproving] = useState(null);

    if (!admin.isLoggedIn()) { navigate('/admin/login'); return null; }

    if (!flags.allow_customer_selling?.value) {
        return (
            <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 0 80px' }}>
                <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', marginBottom: 12 }}>Feature Disabled</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Customer selling is currently turned off.</p>
                    <Link to="/admin/dashboard" className="btn btn-primary">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    const handleApprove = async (id, reviewData) => {
        setApproving(id);
        try {
            await dispatch({ type: 'APPROVE_LISTING', payload: id, meta: reviewData });
            addToast(`Listing approved! Grade: ${reviewData.grade}`, 'success');
            setExpanded(null);
        } catch (err) {
            addToast(`Approval failed: ${err.message}`, 'error');
        } finally {
            setApproving(null);
        }
    };

    const handleReject = (id) => {
        if (window.confirm('Reject and remove this submission?')) {
            dispatch({ type: 'REJECT_LISTING', payload: id });
            addToast('Submission rejected.', 'info');
            setExpanded(null);
        }
    };

    const formatPrice = (p) => p >= 100000 ? `₹${(p / 100000).toFixed(1)}L` : `₹${p?.toLocaleString('en-IN')}`;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 0 80px' }}>
            <div className="container">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <Link to="/admin/dashboard" className="btn btn-outline btn-sm"><FiArrowLeft size={14} /></Link>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>Review Submissions</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {state.pendingListings.length} pending submission{state.pendingListings.length !== 1 ? 's' : ''}
                            {' · '}Personally collect and verify documents, then grade the vehicle before approving.
                        </p>
                    </div>
                </div>

                {/* Info banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e40af11, #3b82f611)',
                    border: '1px solid #bfdbfe', borderRadius: 'var(--radius)',
                    padding: '14px 20px', marginBottom: 28,
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>ℹ️</span>
                    <p style={{ fontSize: '0.85rem', color: '#1e40af', margin: 0, lineHeight: 1.6 }}>
                        <strong>Admin workflow:</strong> Contact the seller → physically collect all required documents → verify them in person →
                        inspect the vehicle and assign a condition grade → then approve or reject the listing here.
                    </p>
                </div>

                {state.pendingListings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                        <h2 style={{ marginBottom: '8px' }}>All caught up!</h2>
                        <p style={{ color: 'var(--text-muted)' }}>No pending submissions to review.</p>
                        <Link to="/admin/dashboard" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Dashboard</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {state.pendingListings.map(listing => (
                            <div key={listing.id} style={{
                                background: '#fff', borderRadius: 'var(--radius-lg)',
                                border: expanded === listing.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                boxShadow: 'var(--shadow)', overflow: 'hidden',
                                transition: 'border-color 0.2s',
                            }}>
                                {/* Summary row */}
                                <div style={{ display: 'flex', gap: '16px', padding: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {listing.images?.[0] && (
                                        <img src={listing.images[0]} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                                    )}
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span className="badge badge-pending">Pending</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Submitted: {listing.submittedAt}</span>
                                        </div>
                                        <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{listing.brand} {listing.model} {listing.variant}</h3>
                                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', flexWrap: 'wrap' }}>
                                            <span>{listing.year}</span>
                                            <span><BsSpeedometer2 size={11} style={{ marginRight: 3 }} />{listing.km?.toLocaleString()} km</span>
                                            <span><BsFuelPump size={11} style={{ marginRight: 3 }} />{listing.fuel}</span>
                                            <span><FiMapPin size={11} style={{ marginRight: 3 }} />{listing.city}, {listing.state}</span>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>
                                            {formatPrice(listing.price)}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{listing.dealerName}</div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                        <button
                                            onClick={() => setExpanded(expanded === listing.id ? null : listing.id)}
                                            className="btn btn-outline btn-sm"
                                        >
                                            <FiEye size={14} /> {expanded === listing.id ? 'Collapse' : 'Review'}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded review panel */}
                                {expanded === listing.id && (
                                    <ReviewPanel
                                        listing={listing}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                        approving={approving}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
