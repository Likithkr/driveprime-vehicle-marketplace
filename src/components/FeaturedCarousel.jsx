import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import CarCard from './CarCard';

export default function FeaturedCarousel({ listings = [], title, subtitle, viewAllLink = '/search' }) {
    const trackRef = useRef(null);

    const scroll = (dir) => {
        if (!trackRef.current) return;
        const cardWidth = trackRef.current.firstChild?.offsetWidth || 300;
        trackRef.current.scrollBy({ left: dir * (cardWidth + 24), behavior: 'smooth' });
    };

    if (!listings.length) return null;

    return (
        <div style={{ position: 'relative' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div>
                    {title && <h2 className="section-title">{title}</h2>}
                    {subtitle && <p className="section-subtitle">{subtitle}</p>}
                </div>
                <Link to={viewAllLink} className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
                    View All <FiChevronRight size={14} />
                </Link>
            </div>

            {/* Arrow buttons */}
            <button
                onClick={() => scroll(-1)}
                aria-label="Scroll left"
                style={{
                    position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
                    zIndex: 10, width: 44, height: 44, borderRadius: '50%',
                    background: '#fff', border: '1.5px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    color: '#0f172a',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#f97316'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
                <FiChevronLeft size={20} />
            </button>

            <button
                onClick={() => scroll(1)}
                aria-label="Scroll right"
                style={{
                    position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
                    zIndex: 10, width: 44, height: 44, borderRadius: '50%',
                    background: '#fff', border: '1.5px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    color: '#0f172a',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#f97316'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
                <FiChevronRight size={20} />
            </button>

            {/* Scrollable track */}
            <div
                ref={trackRef}
                style={{
                    display: 'flex',
                    gap: '24px',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                    paddingBottom: '8px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                <style>{`.carousel-track::-webkit-scrollbar { display: none; }`}</style>
                {listings.map(listing => (
                    <div
                        key={listing.id}
                        style={{
                            minWidth: 'clamp(260px, 30vw, 300px)',
                            flex: '0 0 auto',
                            scrollSnapAlign: 'start',
                        }}
                    >
                        <CarCard listing={listing} />
                    </div>
                ))}
            </div>
        </div>
    );
}
