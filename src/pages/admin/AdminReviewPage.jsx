import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiEye, FiMapPin, FiCalendar } from 'react-icons/fi';
import { BsSpeedometer2, BsFuelPump } from 'react-icons/bs';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/ToastProvider';

export default function AdminReviewPage() {
    const { state, dispatch } = useStore();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(null);

    if (!state.isAdminLoggedIn) { navigate('/admin/login'); return null; }

    const handleApprove = (id) => {
        dispatch({ type: 'APPROVE_LISTING', payload: id });
        addToast('Listing approved and published!', 'success');
        setExpanded(null);
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
                            {state.pendingListings.length} pending dealer submission{state.pendingListings.length !== 1 ? 's' : ''}
                        </p>
                    </div>
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
                                background: '#fff',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow)',
                                overflow: 'hidden',
                            }}>
                                {/* Summary row */}
                                <div style={{ display: 'flex', gap: '16px', padding: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {/* Thumbnail */}
                                    {listing.images?.[0] && (
                                        <img src={listing.images[0]} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                                    )}

                                    {/* Info */}
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

                                    {/* Price + Dealer */}
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>
                                            {formatPrice(listing.price)}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{listing.dealerName}</div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                        <button onClick={() => setExpanded(expanded === listing.id ? null : listing.id)}
                                            className="btn btn-outline btn-sm">
                                            <FiEye size={14} /> {expanded === listing.id ? 'Collapse' : 'Review'}
                                        </button>
                                        <button onClick={() => handleApprove(listing.id)} className="btn btn-sm"
                                            style={{ background: '#dcfce7', color: '#16a34a', fontWeight: 700 }}>
                                            <FiCheckCircle size={14} /> Approve
                                        </button>
                                        <button onClick={() => handleReject(listing.id)} className="btn btn-sm"
                                            style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 700 }}>
                                            <FiXCircle size={14} /> Reject
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded details */}
                                {expanded === listing.id && (
                                    <div style={{ borderTop: '1px solid var(--border)', padding: '24px', background: '#fafafa' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                                            {[
                                                ['Ownership', listing.ownership],
                                                ['Transmission', listing.transmission],
                                                ['Insurance', listing.insurance || 'N/A'],
                                                ['Color', listing.color || 'N/A'],
                                                ['Dealer Phone', listing.dealerPhone],
                                                ['Dealer Email', listing.dealerEmail],
                                                ['WhatsApp', listing.dealerWhatsApp || listing.dealerPhone],
                                            ].map(([k, v]) => (
                                                <div key={k}>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{k}</p>
                                                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {listing.about && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>DESCRIPTION</p>
                                                <p style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: '0.9rem' }}>{listing.about}</p>
                                            </div>
                                        )}

                                        {listing.images?.length > 0 && (
                                            <div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>PHOTOS ({listing.images.length})</p>
                                                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                                                    {listing.images.map((img, i) => (
                                                        <img key={i} src={img} alt={`Photo ${i + 1}`}
                                                            style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleReject(listing.id)} className="btn btn-sm"
                                                style={{ background: '#fee2e2', color: '#dc2626' }}>
                                                <FiXCircle size={14} /> Reject Submission
                                            </button>
                                            <button onClick={() => handleApprove(listing.id)} className="btn btn-primary">
                                                <FiCheckCircle size={16} /> Approve & Publish Live
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
