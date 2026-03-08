import { Link } from 'react-router-dom';
import { FiMapPin, FiNavigation, FiActivity, FiZap } from 'react-icons/fi';
import { BsFuelPump, BsSpeedometer2 } from 'react-icons/bs';
import { GiGearStick } from 'react-icons/gi';

function formatPrice(price) {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
}

function formatKm(km) {
    return `${km.toLocaleString('en-IN')} km`;
}

export default function CarCard({ listing, showActions, onToggleSold, onEdit, onDelete }) {
    const isSold = listing.status === 'sold';

    return (
        <div className="card" style={{ position: 'relative', cursor: 'pointer' }}>
            {/* Image */}
            <Link to={`/car/${listing.id}`} style={{ display: 'block' }}>
                <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
                    <img
                        src={listing.images[0]}
                        alt={`${listing.brand} ${listing.model}`}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                            filter: isSold ? 'grayscale(60%)' : 'none',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    {/* Badges */}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {listing.featured && <span className="badge badge-featured">⭐ Featured</span>}
                        {isSold && <span className="badge badge-sold">✓ Sold</span>}
                        <span className="badge" style={{ background: 'rgba(15,23,42,0.8)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                            {listing.type}
                        </span>
                    </div>
                    {/* Year badge */}
                    <div style={{
                        position: 'absolute', bottom: '10px', right: '10px',
                        background: 'rgba(15,23,42,0.85)', color: '#fff',
                        padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600,
                        backdropFilter: 'blur(8px)',
                    }}>
                        {listing.year}
                    </div>
                </div>
            </Link>

            {/* Content */}
            <div style={{ padding: '16px' }}>
                <Link to={`/car/${listing.id}`}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '2px', color: 'var(--text)' }}>
                        {listing.brand} {listing.model}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        {listing.variant} • {listing.ownership}
                    </p>
                </Link>

                {/* Specs row */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {[
                        { icon: <BsSpeedometer2 size={13} />, label: formatKm(listing.km) },
                        { icon: <BsFuelPump size={13} />, label: listing.fuel },
                        { icon: <GiGearStick size={13} />, label: listing.transmission },
                    ].map(({ icon, label }, i) => (
                        <span key={i} className="tag">
                            {icon} {label}
                        </span>
                    ))}
                </div>

                {/* Price + Location */}
                <div className="flex-between">
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: isSold ? 'var(--text-muted)' : 'var(--primary)' }}>
                            {formatPrice(listing.price)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <FiMapPin size={12} />
                            {listing.town || listing.city}, {(listing.district || listing.state).substring(0, 10)}
                        </div>
                    </div>
                    <Link
                        to={`/car/${listing.id}`}
                        className="btn btn-primary btn-sm"
                        style={{ borderRadius: '8px' }}
                    >
                        View
                    </Link>
                </div>

                {/* Admin actions */}
                {showActions && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => onToggleSold(listing.id)}
                            className="btn btn-sm"
                            style={{ background: isSold ? '#dcfce7' : '#fee2e2', color: isSold ? '#16a34a' : '#dc2626', borderRadius: '7px', fontSize: '0.8rem' }}>
                            {isSold ? '✓ Mark Live' : '⊘ Mark Sold'}
                        </button>
                        <button onClick={() => onEdit(listing)} className="btn btn-outline btn-sm">
                            ✏ Edit
                        </button>
                        <button onClick={() => onDelete(listing.id)}
                            className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626', borderRadius: '7px' }}>
                            🗑 Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
