import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { API_BASE } from '../lib/config';
import styles from './VehicleCarousel.module.css';

// ── Per-brand slide accent colours ────────────────────────────────────────────
const BRAND_BG = {
    'Maruti Suzuki': ['#0a1628', '#1a2f55'],
    'Hyundai':       ['#0a1a30', '#002c5f'],
    'Honda':         ['#1a0505', '#3d0909'],
    'Toyota':        ['#0a0a0a', '#1a0000'],
    'Tata':          ['#071830', '#00509e'],
    'Mahindra':      ['#0a0505', '#2a0000'],
    'BMW':           ['#050a18', '#0d1f4a'],
    'KTM':           ['#1a0a00', '#3d1100'],
    'Royal Enfield': ['#0d0505', '#3d1010'],
    'Yamaha':        ['#050a18', '#0a193d'],
    'Hero':          ['#1a0005', '#3d000e'],
    'Bajaj':         ['#050515', '#0a0a3d'],
    'Kia':           ['#050f1e', '#0a1f3d'],
};
const DEFAULT_BG = ['#0d111c', '#1a2035'];

const fmt = (price) => {
    if (!price) return '—';
    const l = price / 100000;
    return l >= 100 ? `₹${(price / 10000000).toFixed(2)} Cr` : `₹${l.toFixed(1)} L`;
};
const fmtKm = (km) => km ? `${(km / 1000).toFixed(0)}k km` : '—';

// ─────────────────────────────────────────────────────────────────────────────
export default function VehicleCarousel({ title = 'Featured Showcase', subtitle = '' }) {
    const [vehicles, setVehicles] = useState([]);
    const [current,  setCurrent]  = useState(0);
    const [loading,  setLoading]  = useState(true);
    const [animDir,  setAnimDir]  = useState('next'); // 'next' | 'prev'
    const timerRef = useRef(null);

    useEffect(() => {
        fetch(`${API_BASE}/api/carousel`)
            .then(r => r.json())
            .then(data => setVehicles(Array.isArray(data) ? data : []))
            .catch(() => setVehicles([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (vehicles.length < 2) return;
        timerRef.current = setInterval(() => {
            setAnimDir('next');
            setCurrent(c => (c + 1) % vehicles.length);
        }, 5500);
        return () => clearInterval(timerRef.current);
    }, [vehicles]);

    const goTo = (idx, dir = 'next') => {
        clearInterval(timerRef.current);
        setAnimDir(dir);
        setCurrent((idx + vehicles.length) % vehicles.length);
        if (vehicles.length >= 2) {
            timerRef.current = setInterval(() => {
                setAnimDir('next');
                setCurrent(c => (c + 1) % vehicles.length);
            }, 5500);
        }
    };

    if (loading || !vehicles.length) return null;

    const car     = vehicles[current];
    const images  = typeof car.images === 'string' ? JSON.parse(car.images || '[]') : (car.images || []);
    const mainImg = images[0] || null;
    // Use admin-set bg, or fall back to brand colour
    const [bg1, bg2] = BRAND_BG[car.brand] || DEFAULT_BG;
    const bgStyle = car.bgGradient
        ? car.bgGradient
        : `linear-gradient(135deg, ${bg1} 0%, ${bg2} 100%)`;
    // Use admin-set text, or fall back to vehicle data
    const displayTitle    = car.customTitle    || car.model;
    const displaySubtitle = car.customSubtitle || car.variant;

    return (
        <section className={styles.section}>
            {/* Section label above the slide */}
            <div className="container">
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{title}</h2>
                    {subtitle && <p className={styles.sectionSub}>{subtitle}</p>}
                    {vehicles.length > 1 && (
                        <div className={styles.dots}>
                            {vehicles.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i, i > current ? 'next' : 'prev')}
                                    className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                                    aria-label={`Slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Banner slide ───────────────────────────────────────────────── */}
            <div
                className={`${styles.banner} ${animDir === 'next' ? styles.slideNext : styles.slidePrev}`}
                key={`${car.id}-${current}`}
                style={{ background: bgStyle }}
            >
                {/* Decorative circles */}
                <div className={styles.deco1} />
                <div className={styles.deco2} />

                <div className={`container ${styles.bannerInner}`}>
                    {/* LEFT — Text content */}
                    <div className={styles.textSide}>
                        <div className={styles.brandPill}>{car.brand}</div>

                        <h3 className={styles.carName}>
                            <span className={styles.accentWord}>{displayTitle}</span>{' '}
                            {!car.customTitle && <span className={styles.whiteWord}>{car.variant}</span>}
                        </h3>

                        <div className={styles.price}>{fmt(car.price)}</div>

                        {/* Subtitle if customized */}
                        {displaySubtitle && (
                            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.5, marginTop: -8 }}>
                                {displaySubtitle}
                            </p>
                        )}

                        {/* Key specs row */}
                        <div className={styles.specRow}>
                            <span className={styles.specChip}>📅 {car.year}</span>
                            <span className={styles.specChip}>⚡ {car.fuel}</span>
                            <span className={styles.specChip}>⚙️ {car.transmission}</span>
                            <span className={styles.specChip}>🛣️ {fmtKm(car.km)}</span>
                        </div>

                        {car.city && (
                            <div className={styles.location}>
                                <FiMapPin size={13} /> {car.city || car.town}
                            </div>
                        )}

                        <Link to={`/car/${car.id}`} className={styles.ctaBtn}>
                            View Car <FiArrowRight size={16} />
                        </Link>
                    </div>

                    {/* RIGHT — Vehicle image */}
                    <div className={styles.imageSide}>
                        {mainImg ? (
                            <img
                                src={mainImg}
                                alt={`${car.brand} ${car.model}`}
                                className={styles.carImg}
                            />
                        ) : (
                            <div className={styles.noImg}>🚗</div>
                        )}
                        {/* Reflection / glow */}
                        <div className={styles.glow} />
                    </div>
                </div>

                {/* ── Arrow navigation ─────────────────────────────────────── */}
                {vehicles.length > 1 && (
                    <>
                        <button
                            className={`${styles.arrow} ${styles.arrowLeft}`}
                            onClick={() => goTo(current - 1, 'prev')}
                            aria-label="Previous"
                        >
                            <FiChevronLeft size={24} />
                        </button>
                        <button
                            className={`${styles.arrow} ${styles.arrowRight}`}
                            onClick={() => goTo(current + 1, 'next')}
                            aria-label="Next"
                        >
                            <FiChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Slide counter */}
                {vehicles.length > 1 && (
                    <div className={styles.counter}>{current + 1} / {vehicles.length}</div>
                )}
            </div>
        </section>
    );
}
