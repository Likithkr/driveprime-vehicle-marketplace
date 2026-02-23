import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FiArrowLeft, FiMapPin, FiCalendar, FiActivity, FiShield, FiShare2, FiHeart } from 'react-icons/fi';
import { BsFuelPump, BsSpeedometer2 } from 'react-icons/bs';
import { GiGearStick, GiCarKey } from 'react-icons/gi';
import { useStore } from '../store/StoreContext';
import EMICalculator from '../components/EMICalculator';
import ContactButtons from '../components/ContactButtons';
import CarCard from '../components/CarCard';

export default function CarDetailPage() {
    const { id } = useParams();
    const { state } = useStore();
    const navigate = useNavigate();
    const [activeImg, setActiveImg] = useState(0);
    const [liked, setLiked] = useState(false);

    const listing = state.listings.find(l => l.id === id);

    if (!listing) return (
        <div style={{ textAlign: 'center', padding: '120px 20px' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>🚗</div>
            <h2>Listing not found</h2>
            <button onClick={() => navigate('/search')} className="btn btn-primary" style={{ marginTop: '20px' }}>Browse Cars</button>
        </div>
    );

    const related = state.listings.filter(l => l.id !== id && l.brand === listing.brand && l.status === 'live').slice(0, 4);

    const specs = [
        { icon: <BsSpeedometer2 size={18} />, label: 'KM Driven', value: `${listing.km.toLocaleString('en-IN')} km` },
        { icon: <BsFuelPump size={18} />, label: 'Fuel Type', value: listing.fuel },
        { icon: <GiGearStick size={18} />, label: 'Transmission', value: listing.transmission },
        { icon: <GiCarKey size={18} />, label: 'Ownership', value: listing.ownership },
        { icon: <FiCalendar size={18} />, label: 'Year', value: listing.year },
        { icon: <FiShield size={18} />, label: 'Insurance', value: listing.insurance ? new Date(listing.insurance).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A' },
        { icon: <FiMapPin size={18} />, label: 'Location', value: listing.location },
        { icon: <FiActivity size={18} />, label: 'Condition', value: listing.status === 'sold' ? 'Sold' : 'Available' },
    ];

    const formatPrice = (p) => {
        if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
        if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
        return `₹${p.toLocaleString('en-IN')}`;
    };

    return (
        <div style={{ paddingBottom: '80px' }}>
            {/* Breadcrumb */}
            <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem' }}>
                    <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 500 }}>
                        <FiArrowLeft size={16} /> Back
                    </button>
                    <span style={{ color: 'var(--border)' }}>›</span>
                    <Link to="/search" style={{ color: 'var(--text-muted)' }}>Search</Link>
                    <span style={{ color: 'var(--border)' }}>›</span>
                    <span style={{ fontWeight: 600 }}>{listing.brand} {listing.model}</span>
                </div>
            </div>

            <div className="container" style={{ paddingTop: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '32px', alignItems: 'flex-start' }}>
                    {/* Left column */}
                    <div>
                        {/* Image gallery */}
                        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '12px', background: '#f1f5f9', position: 'relative' }}>
                            <img
                                src={listing.images[activeImg]}
                                alt={`${listing.brand} ${listing.model}`}
                                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
                            />
                            {listing.status === 'sold' && (
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'rgba(0,0,0,0.45)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <span style={{
                                        fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900,
                                        color: '#fff', border: '6px solid #fff', padding: '10px 32px', borderRadius: '8px',
                                        transform: 'rotate(-15deg)', display: 'block',
                                        textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                                    }}>SOLD</span>
                                </div>
                            )}
                            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                                <button onClick={() => setLiked(!liked)}
                                    style={{
                                        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                                        border: 'none', borderRadius: '99px', width: 40, height: 40,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: liked ? '#ef4444' : '#64748b',
                                        fontSize: '18px',
                                    }}>
                                    {liked ? '❤️' : '🤍'}
                                </button>
                                <button
                                    style={{
                                        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                                        border: 'none', borderRadius: '99px', width: 40, height: 40,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: '#64748b',
                                    }}>
                                    <FiShare2 size={18} />
                                </button>
                            </div>
                        </div>
                        {/* Thumbnails */}
                        {listing.images.length > 1 && (
                            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                                {listing.images.map((img, i) => (
                                    <img key={i} src={img} alt={`View ${i + 1}`}
                                        onClick={() => setActiveImg(i)}
                                        style={{
                                            width: 90, height: 65, objectFit: 'cover', borderRadius: '10px', cursor: 'pointer', flexShrink: 0,
                                            border: i === activeImg ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                                            opacity: i === activeImg ? 1 : 0.65,
                                            transition: 'var(--transition)',
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Title + price */}
                        <div style={{ marginTop: '28px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                                <div>
                                    {listing.featured && <span className="badge badge-featured" style={{ marginBottom: '8px' }}>⭐ Featured</span>}
                                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                                        {listing.brand} {listing.model} {listing.variant}
                                    </h1>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                                        <span>{listing.year}</span>
                                        <span>•</span>
                                        <span>{listing.km.toLocaleString('en-IN')} km</span>
                                        <span>•</span>
                                        <span>{listing.fuel}</span>
                                        <span>•</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMapPin size={13} /> {listing.location}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: listing.status === 'sold' ? 'var(--text-muted)' : 'var(--primary)' }}>
                                        {formatPrice(listing.price)}
                                    </div>
                                    {listing.status === 'sold' && <span className="badge badge-sold">Sold</span>}
                                </div>
                            </div>
                        </div>

                        {/* Specs grid */}
                        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', marginBottom: '24px' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '20px', fontSize: '1.15rem' }}>Vehicle Details</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                {specs.map(({ icon, label, value }) => (
                                    <div key={label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '10px',
                                            background: 'rgba(249,115,22,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--primary)', flexShrink: 0,
                                        }}>
                                            {icon}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</p>
                                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* About */}
                        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', marginBottom: '24px' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '16px', fontSize: '1.15rem' }}>About this Vehicle</h2>
                            <p style={{ lineHeight: 1.8, color: 'var(--text-muted)' }}>{listing.about}</p>
                        </div>

                        {/* Dealer info */}
                        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', marginBottom: '24px' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '16px', fontSize: '1.15rem' }}>Dealer Information</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: '14px',
                                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-display)',
                                }}>
                                    {listing.dealerName?.[0] || 'D'}
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 700 }}>{listing.dealerName}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{listing.location}</p>
                                </div>
                            </div>
                            <ContactButtons
                                phone={listing.dealerPhone}
                                email={listing.dealerEmail}
                                whatsapp={listing.dealerWhatsApp}
                                carName={`${listing.brand} ${listing.model} ${listing.variant} ${listing.year}`}
                            />
                        </div>

                        {/* EMI Calculator */}
                        <EMICalculator defaultPrice={listing.price} />
                    </div>

                    {/* Right sticky panel */}
                    <div style={{ position: 'sticky', top: '80px' }}>
                        <div style={{
                            background: '#fff', borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border)', padding: '24px',
                            boxShadow: 'var(--shadow-lg)',
                        }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '4px' }}>
                                {formatPrice(listing.price)}
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                                Negotiable • All taxes included
                            </p>
                            <ContactButtons
                                phone={listing.dealerPhone}
                                email={listing.dealerEmail}
                                whatsapp={listing.dealerWhatsApp}
                                carName={`${listing.brand} ${listing.model} ${listing.variant} ${listing.year}`}
                                style={{ flexDirection: 'column' }}
                            />
                            <hr style={{ margin: '20px 0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                                {[
                                    '✓ Verified Listing',
                                    '✓ RC Transfer Support',
                                    '✓ Insurance Assistance',
                                    '✓ Free Inspection',
                                ].map(item => (
                                    <div key={item} style={{ color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>{item}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related listings */}
                {related.length > 0 && (
                    <div style={{ marginTop: '60px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '24px', fontSize: '1.4rem' }}>
                            More {listing.brand} Listings
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '24px' }}>
                            {related.map(l => <CarCard key={l.id} listing={l} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
