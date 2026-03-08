import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiSearch, FiArrowRight, FiCheckCircle, FiMapPin, FiShield, FiStar, FiChevronRight, FiTag } from 'react-icons/fi';
import { useStore } from '../store/StoreContext';
import CarCard from '../components/CarCard';
import { API_BASE } from '../lib/config';
import styles from './HomePage.module.css';


// Brand accent colours for display
const BRAND_COLORS = {
    'Maruti Suzuki': '#003087', 'Hyundai': '#002c5f', 'Honda': '#cc0000',
    'Toyota': '#cc0000', 'Tata': '#00509e', 'Mahindra': '#cc0000',
    'BMW': '#0066b2', 'KTM': '#ff6600', 'Royal Enfield': '#7b2d2d',
    'Yamaha': '#003087', 'Hero': '#e31837', 'Bajaj': '#1a1a6e',
};

const STATS = [
    { value: '100+', label: 'Verified Listings' },
    { value: 'Trusted', label: 'Dealers' },
    { value: 'All', label: 'States Covered' },
    { value: '₹50L+', label: 'Saved by Buyers' },
];

const WHY_US = [
    { icon: FiShield, title: 'Verified Listings', desc: 'Every car is verified by our team before going live. Zero fraud guarantee.' },
    { icon: FiStar, title: 'Best Prices', desc: 'Compare prices across thousands of listings and get the best deal.' },
    { icon: FiCheckCircle, title: 'Easy Paperwork', desc: 'Our team helps with RC transfer, insurance, and all documentation.' },
    { icon: FiMapPin, title: 'Pan-India Reach', desc: 'Listings from all 28 states and 500+ cities across India.' },
];

export default function HomePage() {
    const { state } = useStore();
    const navigate = useNavigate();
    const [searchVal, setSearchVal] = useState('');
    const [activeTab, setActiveTab] = useState('Car');

    const featured = state.listings.filter(l => l.featured && l.status === 'live').slice(0, 6);
    const recent = state.listings.filter(l => l.status === 'live').slice(0, 8);

    // Dynamic brands from API
    const [brands, setBrands] = useState([]);
    useEffect(() => {
        fetch(`${API_BASE}/api/brands`)
            .then(r => r.json())
            .then(data => setBrands(Array.isArray(data) ? data : []))
            .catch(() => { });
    }, []);

    // Popular search tags: top 5 most-listed live brands
    const popularTags = (() => {
        const counts = {};
        state.listings.filter(l => l.status === 'live').forEach(l => {
            if (l.brand) counts[l.brand] = (counts[l.brand] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([b]) => b);
        // Fall back to model names if fewer than 5 brands available
        if (sorted.length < 5) {
            const models = state.listings.filter(l => l.status === 'live').map(l => l.model).filter(Boolean);
            return [...new Set([...sorted, ...models])].slice(0, 5);
        }
        return sorted.slice(0, 5);
    })();

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?q=${encodeURIComponent(searchVal)}&type=${activeTab}`);
    };

    return (
        <div>
            {/* ===== HERO ===== */}
            <section className={styles.hero}>
                <div className={styles.heroBg} />
                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroBadge}>
                        <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                        Your Trusted Car Marketplace
                    </div>
                    <h1 className={styles.heroTitle}>
                        Find Your Perfect<br />
                        <span className={styles.heroAccent}>Dream Car</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        verified pre-owned cars & bikes across India. Best prices, zero fraud.
                    </p>

                    {/* Tab switcher */}
                    <div className={styles.tabSwitcher}>
                        {['Car', 'Bike', 'SUV'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} className={styles.heroSearch}>
                        <div className={styles.heroSearchInner}>
                            <FiSearch size={20} className={styles.heroSearchIcon} />
                            <input
                                value={searchVal}
                                onChange={e => setSearchVal(e.target.value)}
                                placeholder={`Search ${activeTab === 'Bike' ? 'bikes' : 'cars'} by brand, model, city...`}
                                className={styles.heroSearchInput}
                            />
                            <button type="submit" className={`btn btn-primary ${styles.heroSearchBtn}`}>
                                Search <FiArrowRight size={16} />
                            </button>
                        </div>
                        <div className={styles.popularSearches}>
                            <span>Popular:</span>
                            {(popularTags.length > 0
                                ? popularTags
                                : ['Swift', 'Creta', 'Fortuner', 'Nexon EV', 'Classic 350']
                            ).map(s => (
                                <button type="button" key={s}
                                    onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                                    className={styles.popularTag}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </form>
                </div>
            </section>

            {/* ===== STATS ===== */}
            <section style={{ background: 'var(--primary)', padding: '32px 0' }}>
                <div className="container">
                    <div className="grid-4" style={{ textAlign: 'center' }}>
                        {STATS.map(({ value, label }) => (
                            <div key={label}>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: '#fff' }}>{value}</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginTop: '2px' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== BRANDS ===== */}
            <section className="section-pad-sm">
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                        <h2 className="section-title">Browse by Brand</h2>
                        <Link to="/search" className="btn btn-outline btn-sm">View All <FiChevronRight size={14} /></Link>
                    </div>
                    {brands.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>Loading brands…</p>
                    ) : (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {brands.slice(0, 16).map(({ id, name, type }) => {
                                const color = BRAND_COLORS[name] || 'var(--primary)';
                                return (
                                    <Link key={id} to={`/search?brand=${encodeURIComponent(name)}`}
                                        className={styles.brandChip}
                                        style={{ borderLeftColor: color }}>
                                        <FiTag size={11} style={{ color, opacity: 0.7 }} />
                                        {name}
                                        <span style={{
                                            fontSize: '0.68rem', padding: '1px 6px', borderRadius: '99px',
                                            background: type === 'bike' ? '#fef3c7' : type === 'car' ? '#e0f2fe' : '#f1f5f9',
                                            color: type === 'bike' ? '#d97706' : type === 'car' ? '#0369a1' : '#64748b',
                                            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px',
                                        }}>{type}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ===== FEATURED ===== */}
            {featured.length > 0 && (
                <section className="section-pad-sm" style={{ background: 'var(--bg)' }}>
                    <div className="container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div>
                                <h2 className="section-title">Featured Listings</h2>
                                <p className="section-subtitle">Handpicked premium vehicles</p>
                            </div>
                            <Link to="/search?featured=true" className="btn btn-outline btn-sm">See All <FiChevronRight size={14} /></Link>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                            {featured.map(listing => (
                                <CarCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== RECENT LISTINGS ===== */}
            <section className="section-pad-sm">
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                        <div>
                            <h2 className="section-title">Latest Listings</h2>
                            <p className="section-subtitle">Freshly added vehicles</p>
                        </div>
                        <Link to="/search" className="btn btn-outline btn-sm">Browse All <FiChevronRight size={14} /></Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {recent.map(listing => (
                            <CarCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== WHY US ===== */}
            <section className="section-pad" style={{ background: 'var(--bg-dark)' }}>
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title" style={{ color: '#fff' }}>Why Drive Prime?</h2>
                        <p className="section-subtitle">Trusted by 1 million+ buyers across India</p>
                    </div>
                    <div className="grid-4">
                        {WHY_US.map(({ icon: Icon, title, desc }) => (
                            <div key={title} style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '28px 24px',
                                textAlign: 'center',
                                transition: 'var(--transition)',
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(249,115,22,0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                }}
                            >
                                <div style={{
                                    width: 56, height: 56, borderRadius: '14px',
                                    background: 'rgba(249,115,22,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 16px',
                                }}>
                                    <Icon size={26} style={{ color: 'var(--primary)' }} />
                                </div>
                                <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{title}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                padding: '80px 0',
                textAlign: 'center',
            }}>
                {/* <div className="container">
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>
                        Ready to Sell Your Car?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: '32px' }}>
                        List your car for free and reach lakhs of buyers across India.
                    </p>
                    <Link to="/dealer-submit" className="btn btn-ghost btn-lg">
                        Submit Your Listing <FiArrowRight size={18} />
                    </Link>
                </div> */}
            </section>
        </div>
    );
}
