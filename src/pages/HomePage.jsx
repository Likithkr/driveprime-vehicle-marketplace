import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
    FiSearch, FiArrowRight, FiCheckCircle, FiMapPin, FiShield, FiStar,
    FiChevronRight, FiTag, FiPhone, FiKey, FiChevronLeft,
} from 'react-icons/fi';
import { BsCheckCircleFill } from 'react-icons/bs';
import { useStore } from '../store/StoreContext';
import CarCard from '../components/CarCard';
import VehicleCarousel from '../components/VehicleCarousel';
import { API_BASE } from '../lib/config';
import styles from './HomePage.module.css';

// ── Brand accent colours ───────────────────────────────────────────────────
const BRAND_COLORS = {
    'Maruti Suzuki': '#003087', 'Hyundai': '#002c5f', 'Honda': '#cc0000',
    'Toyota': '#cc0000', 'Tata': '#00509e', 'Mahindra': '#cc0000',
    'BMW': '#0066b2', 'KTM': '#ff6600', 'Royal Enfield': '#7b2d2d',
    'Yamaha': '#003087', 'Hero': '#e31837', 'Bajaj': '#1a1a6e',
};

// ── Fallback slides if no banners in DB ────────────────────────────────────
const FALLBACK_BANNERS = [
    { id: 'f1', title: 'Find Your Perfect Dream Car', subtitle: 'Verified pre-owned cars & bikes across India. Transparent prices, zero fraud.', cta_label: 'Browse Cars', cta_link: '/search', badge_text: 'Trusted Marketplace', image_url: 'linear-gradient(135deg, #0f172a 0%, #1a1f35 100%)' },
    { id: 'f2', title: 'Drive Home with Confidence', subtitle: '200-point inspected vehicles with a 5-day money-back guarantee.', cta_label: 'View Inspected Cars', cta_link: '/search', badge_text: 'Fully Inspected', image_url: 'linear-gradient(135deg, #0c1523 0%, #1a1040 100%)' },
    { id: 'f3', title: 'Best Prices. Fixed. Upfront.', subtitle: 'No hidden charges. Fixed price assurance. Doorstep delivery available.', cta_label: 'Explore Deals', cta_link: '/search', badge_text: 'Fixed Price Guarantee', image_url: 'linear-gradient(135deg, #0f2229 0%, #0c1a1a 100%)' },
];

// ── Body types ─────────────────────────────────────────────────────────────
const BODY_TYPES = [
    { label: 'Hatchback', emoji: '🚗', query: 'hatchback' },
    { label: 'Sedan', emoji: '🚙', query: 'sedan' },
    { label: 'SUV', emoji: '🛻', query: 'suv' },
    { label: 'MUV', emoji: '🚐', query: 'muv' },
    { label: 'Luxury', emoji: '🏎️', query: 'luxury' },
    { label: 'Electric', emoji: '⚡', query: 'electric' },
];

// ── Benefits ───────────────────────────────────────────────────────────────
const BENEFITS = [
    { icon: '🔍', title: '200-Point Inspection', desc: 'Every car is thoroughly checked before listing.' },
    { icon: '🛡️', title: 'Warranty Included', desc: 'Full warranty support through your ownership.' },
    { icon: '↩️', title: '5-Day Money Back', desc: 'No-questions-asked return within 5 days.' },
    { icon: '🏷️', title: 'Fixed Price', desc: 'No haggling. Best price upfront.' },
];

// ── How it works ───────────────────────────────────────────────────────────
const HOW_STEPS = [
    { num: '01', icon: FiSearch, title: 'Browse & Filter', desc: 'Search from 1,000+ verified pre-owned cars and bikes.' },
    { num: '02', icon: FiPhone, title: 'Schedule Test Drive', desc: 'Book a test drive at a hub near you or at your doorstep.' },
    { num: '03', icon: FiKey, title: 'Finalize & Drive Home', desc: 'Complete paperwork, pay online, and get doorstep delivery.' },
];

// ── Why Us ─────────────────────────────────────────────────────────────────
const WHY_US = [
    { icon: FiShield, title: 'Verified Listings', desc: 'Every car is verified by our team before going live. Zero fraud.' },
    { icon: FiStar, title: 'Best Prices', desc: 'Compare prices across thousands of listings and get the best deal.' },
    { icon: FiCheckCircle, title: 'Easy Paperwork', desc: 'Our team helps with RC transfer, insurance, and all documentation.' },
    { icon: FiMapPin, title: 'Pan-India Reach', desc: 'Listings from all 28 states and 500+ cities across India.' },
];

// ── Stats ──────────────────────────────────────────────────────────────────
const STATS = [
    { value: '10,000+', label: 'Verified Listings' },
    { value: '2 Lakh+', label: 'Happy Buyers' },
    { value: '500+', label: 'Cities Covered' },
    { value: '₹50L+', label: 'Saved by Buyers' },
];

// ── Marquee brands ─────────────────────────────────────────────────────────
const MARQUEE_BRANDS = [
    'Maruti Suzuki', 'Hyundai', 'Honda', 'Toyota', 'Tata', 'Mahindra',
    'BMW', 'Royal Enfield', 'Yamaha', 'Hero', 'Bajaj', 'KTM',
    'Ford', 'Volkswagen', 'Skoda', 'MG', 'Kia', 'Renault',
];

// ═══════════════════════════════════════════════════════════════════════════
export default function HomePage() {
    const { state } = useStore();
    const navigate = useNavigate();
    const [searchVal, setSearchVal] = useState('');
    const [activeTab, setActiveTab] = useState('Car');
    const [slide, setSlide] = useState(0);
    const [banners, setBanners] = useState([]);
    const timerRef = useRef(null);

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

    // Fetch admin-managed banners
    useEffect(() => {
        fetch(`${API_BASE}/api/banners`)
            .then(r => r.json())
            .then(data => setBanners(Array.isArray(data) && data.length > 0 ? data : FALLBACK_BANNERS))
            .catch(() => setBanners(FALLBACK_BANNERS));
    }, []);

    // Hero auto-advance
    useEffect(() => {
        if (banners.length < 2) return;
        timerRef.current = setInterval(() => setSlide(s => (s + 1) % banners.length), 4500);
        return () => clearInterval(timerRef.current);
    }, [banners]);

    const goToSlide = (idx) => {
        clearInterval(timerRef.current);
        setSlide(idx);
        if (banners.length >= 2) {
            timerRef.current = setInterval(() => setSlide(s => (s + 1) % banners.length), 4500);
        }
    };

    const prevSlide = () => goToSlide((slide - 1 + banners.length) % banners.length);
    const nextSlide = () => goToSlide((slide + 1) % banners.length);

    // Popular tags
    const popularTags = (() => {
        const counts = {};
        state.listings.filter(l => l.status === 'live').forEach(l => {
            if (l.brand) counts[l.brand] = (counts[l.brand] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([b]) => b);
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

    const cur = banners[slide] || FALLBACK_BANNERS[0];
    const isImgUrl = cur.image_url && (cur.image_url.startsWith('data:') || cur.image_url.startsWith('http'));

    return (
        <div>
            {/* ══════════════════════ HERO CAROUSEL ══════════════════════ */}
            <section className={styles.hero}>
                {/* Background — image or gradient */}
                <div
                    className={styles.heroBg}
                    style={isImgUrl
                        ? { backgroundImage: `url("${cur.image_url}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { background: cur.image_url || 'linear-gradient(135deg,#0f172a,#1a1f35)' }
                    }
                >
                    {/* Overlay for readability when using photo */}
                    {isImgUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,30,0.62)' }} />}
                    <div className={styles.heroBgAccent} />
                    <div className={styles.ring1} /><div className={styles.ring2} />
                </div>

                <div className={`container ${styles.heroContent}`}>
                    {cur.badge_text && (
                        <div className={styles.heroBadge}>
                            <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                            {cur.badge_text}
                        </div>
                    )}

                    <h1 className={styles.heroTitle} key={`title-${slide}`}>
                        {cur.title}
                    </h1>
                    <p className={styles.heroSubtitle} key={`sub-${slide}`}>{cur.subtitle}</p>

                    {/* Tab switcher */}
                    <div className={styles.tabSwitcher}>
                        {['Car', 'Bike', 'SUV'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
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

                    {/* Dots + arrows */}
                    {banners.length > 1 && (
                        <div className={styles.heroDots}>
                            {banners.map((_, i) => (
                                <button key={i} onClick={() => goToSlide(i)}
                                    className={`${styles.heroDot} ${i === slide ? styles.heroDotActive : ''}`}
                                    aria-label={`Slide ${i + 1}`} />
                            ))}
                        </div>
                    )}
                </div>

                {banners.length > 1 && (
                    <>
                        <button className={styles.heroArrowLeft} onClick={prevSlide} aria-label="Previous slide"><FiChevronLeft size={22} /></button>
                        <button className={styles.heroArrowRight} onClick={nextSlide} aria-label="Next slide"><FiChevronRight size={22} /></button>
                    </>
                )}
            </section>

            {/* ══════════════════════ STATS BAR ══════════════════════ */}
            <section className={styles.statsSection}>
                <div className={`container ${styles.statsGrid}`}>
                    {STATS.map(({ value, label }) => (
                        <div key={label} className={styles.statItem}>
                            <div className={styles.statValue}>{value}</div>
                            <div className={styles.statLabel}>{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════ BENEFITS BAR ══════════════════════ */}
            <section className={styles.benefitsSection}>
                <div className="container">
                    <div className={styles.benefitsGrid}>
                        {BENEFITS.map(({ icon, title, desc }) => (
                            <div key={title} className={styles.benefitCard}>
                                <div className={styles.benefitIconWrap}>
                                    <span className={styles.benefitIcon}>{icon}</span>
                                </div>
                                <div>
                                    <div className={styles.benefitTitle}>{title}</div>
                                    <div className={styles.benefitDesc}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════ VEHICLE SHOWCASE CAROUSEL ══════════════════════ */}
            <VehicleCarousel title="Featured Showcase" subtitle="Hand-picked vehicles selected by our team" />

            {/* ══════════════════════ EXPLORE BY BODY TYPE ══════════════════════ */}
            <section className={styles.bodyTypeSection}>
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                        <div>
                            <h2 className="section-title">Explore by Type</h2>
                            <p className="section-subtitle">Find the style that fits your life</p>
                        </div>
                    </div>
                    <div className={styles.bodyTypeGrid}>
                        {BODY_TYPES.map(({ label, emoji, query }) => (
                            <Link key={label} to={`/search?q=${encodeURIComponent(query)}`} className={styles.bodyTypeCard}>
                                <div className={styles.bodyTypeEmojiWrap}>
                                    <span className={styles.bodyTypeEmoji}>{emoji}</span>
                                </div>
                                <div className={styles.bodyTypeLabel}>{label}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════ BROWSE BY BRAND ══════════════════════ */}
            <section className="section-pad-sm" style={{ background: 'var(--bg)' }}>
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
                                        className={styles.brandChip} style={{ borderLeftColor: color }}>
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


            {/* ══════════════════════ FEATURED LISTINGS (GRID) ══════════════════════ */}
            {featured.length > 0 && (
                <section className="section-pad-sm" style={{ background: '#f1f5f9' }}>
                    <div className="container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                            <div>
                                <h2 className="section-title">Featured Listings</h2>
                                <p className="section-subtitle">Handpicked premium vehicles</p>
                            </div>
                            <Link to="/search?featured=true" className="btn btn-outline btn-sm">See All <FiChevronRight size={14} /></Link>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                            {featured.map(listing => <CarCard key={listing.id} listing={listing} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* (How It Works moved to bottom — see below) */}

            {/* ══════════════════════ RECENT LISTINGS (GRID) ══════════════════════ */}
            <section className="section-pad-sm">
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                        <div>
                            <h2 className="section-title">Latest Listings</h2>
                            <p className="section-subtitle">Freshly added vehicles</p>
                        </div>
                        <Link to="/search" className="btn btn-outline btn-sm">Browse All <FiChevronRight size={14} /></Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {recent.map(listing => <CarCard key={listing.id} listing={listing} />)}
                    </div>
                </div>
            </section>

            {/* ══════════════════════ WHY DRIVE PRIME ══════════════════════ */}
            <section className="section-pad" style={{ background: 'var(--bg-dark)' }}>
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title" style={{ color: '#fff' }}>Why Drive Prime?</h2>
                        <p className="section-subtitle">Trusted by 1 million+ buyers across India</p>
                    </div>
                    <div className="grid-4">
                        {WHY_US.map(({ icon: Icon, title, desc }) => (
                            <div key={title} style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-lg)', padding: '28px 24px', textAlign: 'center', transition: 'var(--transition)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                            >
                                <div style={{ width: 56, height: 56, borderRadius: '14px', background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <Icon size={26} style={{ color: 'var(--primary)' }} />
                                </div>
                                <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{title}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════ BRAND MARQUEE ══════════════════════ */}
            <section className={styles.marqueeSection}>
                <div className={styles.marqueeLabel}>Our trusted brands</div>
                <div className={styles.marqueeTrackOuter}>
                    <div className={styles.marqueeTrack}>
                        {[...MARQUEE_BRANDS, ...MARQUEE_BRANDS].map((b, i) => (
                            <Link key={`${b}-${i}`} to={`/search?brand=${encodeURIComponent(b)}`} className={styles.marqueeItem}>{b}</Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═════ HOW IT WORKS (above footer) ═════ */}
            <section className={styles.howSection}>
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-subtitle">You won't just love our cars — you'll love the way you buy them</p>
                    </div>
                    <div className={styles.howGrid}>
                        {HOW_STEPS.map(({ num, icon: Icon, title, desc }, idx) => (
                            <div key={num} className={styles.howStep}>
                                <div className={styles.howStepNum}>{num}</div>
                                <div className={styles.howStepIconWrap}>
                                    <Icon size={28} style={{ color: 'var(--primary)' }} />
                                </div>
                                <h3 className={styles.howStepTitle}>{title}</h3>
                                <p className={styles.howStepDesc}>{desc}</p>
                                {idx < HOW_STEPS.length - 1 && <div className={styles.howConnector} />}
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <Link to="/search" className="btn btn-primary btn-lg">Start Browsing <FiArrowRight size={18} /></Link>
                    </div>
                </div>
            </section>

            {/* ═════ CTA ═════ */}
            <section className={styles.ctaSection}>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div className={styles.ctaInner}>
                        <div>
                            <h2 className={styles.ctaTitle}>Ready to Sell Your Car?</h2>
                            <p className={styles.ctaSubtitle}>List your car for free and reach lakhs of buyers across India.</p>
                        </div>
                        <div className={styles.ctaCheckList}>
                            {['Free listing', 'Instant verification', 'Guaranteed reach'].map(item => (
                                <div key={item} className={styles.ctaCheckItem}>
                                    <BsCheckCircleFill size={18} style={{ color: '#4ade80' }} />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                        <Link to="/dealer-submit" className="btn btn-ghost btn-lg" style={{ flexShrink: 0 }}>
                            Submit Your Listing <FiArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
