import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiX, FiSearch, FiSliders } from 'react-icons/fi';
import { useStore } from '../store/StoreContext';
import CarCard from '../components/CarCard';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, INDIA_STATES } from '../data/mockData';

const SORT_OPTIONS = [
    { value: 'latest', label: 'Latest First' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'km_asc', label: 'Lowest KM' },
    { value: 'year_desc', label: 'Newest Year' },
];

// Inject responsive styles once
const STYLE_ID = 'search-page-responsive';
if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .sp-layout { display: flex; gap: 28px; align-items: flex-start; }
        .sp-sidebar {
            width: 260px; flex-shrink: 0;
            background: var(--card, #fff);
            border-radius: var(--radius-lg, 12px);
            border: 1px solid var(--border, #e5e7eb);
            padding: 24px;
            position: sticky; top: 80px;
            max-height: calc(100vh - 100px); overflow-y: auto;
        }
        .sp-filter-btn { display: none !important; }
        .sp-drawer-overlay {
            display: none; position: fixed; inset: 0;
            background: rgba(0,0,0,0.45); z-index: 999;
        }
        .sp-drawer {
            display: none; position: fixed; bottom: 0; left: 0; right: 0;
            background: var(--card, #fff); border-radius: 20px 20px 0 0;
            padding: 20px; z-index: 1000;
            max-height: 82vh; overflow-y: auto;
            box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
            animation: slideUp 0.25s ease;
        }
        @keyframes slideUp {
            from { transform: translateY(60px); opacity: 0; }
            to   { transform: translateY(0);   opacity: 1; }
        }
        @media (max-width: 700px) {
            .sp-layout { display: block; }
            .sp-sidebar { display: none !important; }
            .sp-filter-btn { display: inline-flex !important; }
            .sp-drawer-overlay.open { display: block; }
            .sp-drawer.open { display: block; }
        }
    `;
    document.head.appendChild(s);
}

export default function SearchPage() {
    const { state } = useStore();
    const [searchParams] = useSearchParams();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [type, setType] = useState(searchParams.get('type') || '');
    const [selectedBrands, setSelectedBrands] = useState(
        searchParams.get('brand') ? [searchParams.get('brand')] : []
    );
    const [fuels, setFuels] = useState([]);
    const [transmissions, setTransmissions] = useState([]);
    const [minBudget, setMinBudget] = useState(0);
    const [maxBudget, setMaxBudget] = useState(10000000);
    const [minKm, setMinKm] = useState(0);
    const [maxKm, setMaxKm] = useState(300000);
    const [selectedState, setSelectedState] = useState('');
    const [sort, setSort] = useState('latest');
    const [showSold, setShowSold] = useState(false);

    useEffect(() => {
        setQuery(searchParams.get('q') || '');
        setType(searchParams.get('type') || '');
        if (searchParams.get('brand')) setSelectedBrands([searchParams.get('brand')]);
    }, [searchParams]);

    // Close drawer on outside scroll (UX nicety)
    useEffect(() => {
        if (drawerOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    const toggleArr = (arr, setArr, val) =>
        setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

    const filtered = useMemo(() => {
        let list = [...state.listings];
        if (!showSold) list = list.filter(l => l.status !== 'sold');
        if (query) list = list.filter(l =>
            `${l.brand} ${l.model} ${l.variant} ${l.city} ${l.state}`.toLowerCase().includes(query.toLowerCase())
        );
        if (type) list = list.filter(l => l.type === type);
        if (selectedBrands.length) list = list.filter(l => selectedBrands.includes(l.brand));
        if (fuels.length) list = list.filter(l => fuels.includes(l.fuel));
        if (transmissions.length) list = list.filter(l => transmissions.includes(l.transmission));
        list = list.filter(l => l.price >= minBudget && l.price <= maxBudget);
        list = list.filter(l => l.km >= minKm && l.km <= maxKm);
        if (selectedState) list = list.filter(l => l.state === selectedState);
        if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
        else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
        else if (sort === 'km_asc') list.sort((a, b) => a.km - b.km);
        else if (sort === 'year_desc') list.sort((a, b) => b.year - a.year);
        return list;
    }, [state.listings, query, type, selectedBrands, fuels, transmissions, minBudget, maxBudget, minKm, maxKm, selectedState, sort, showSold]);

    const clearFilters = () => {
        setQuery(''); setType(''); setSelectedBrands([]);
        setFuels([]); setTransmissions([]); setMinBudget(0);
        setMaxBudget(10000000); setMinKm(0); setMaxKm(300000);
        setSelectedState('');
    };

    const hasFilters = query || type || selectedBrands.length || fuels.length || transmissions.length
        || minBudget > 0 || maxBudget < 10000000 || minKm > 0 || maxKm < 300000 || selectedState;

    const FilterContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Vehicle Type */}
            <div>
                <h4 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.9rem' }}>Vehicle Type</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Car', 'Bike', 'SUV', 'Truck'].map(t => (
                        <button key={t} onClick={() => setType(prev => prev === t ? '' : t)}
                            className="btn btn-sm"
                            style={{
                                background: type === t ? 'var(--primary)' : 'var(--bg)',
                                color: type === t ? '#fff' : 'var(--text)',
                                border: `1.5px solid ${type === t ? 'var(--primary)' : 'var(--border)'}`,
                            }}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Budget */}
            <div>
                <h4 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.9rem' }}>Budget Range</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>₹{(minBudget / 100000).toFixed(1)}L</span>
                    <span>₹{(maxBudget / 100000).toFixed(1)}L</span>
                </div>
                <input type="range" min={0} max={10000000} step={50000}
                    value={maxBudget} onChange={e => setMaxBudget(Number(e.target.value))} />
                <input type="range" min={0} max={10000000} step={50000}
                    value={minBudget} onChange={e => setMinBudget(Number(e.target.value))}
                    style={{ marginTop: '8px' }} />
            </div>

            {/* KM */}
            <div>
                <h4 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.9rem' }}>KM Driven</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>{minKm.toLocaleString()} km</span>
                    <span>{maxKm.toLocaleString()} km</span>
                </div>
                <input type="range" min={0} max={300000} step={5000}
                    value={maxKm} onChange={e => setMaxKm(Number(e.target.value))} />
            </div>

            {/* Brand */}
            <div>
                <h4 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.9rem' }}>Brand</h4>
                <div className="check-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {BRANDS.map(brand => (
                        <label key={brand} className="check-item">
                            <input type="checkbox" checked={selectedBrands.includes(brand)}
                                onChange={() => toggleArr(selectedBrands, setSelectedBrands, brand)} />
                            {brand}
                        </label>
                    ))}
                </div>
            </div>

            {/* Fuel */}
            <div>
                <h4 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.9rem' }}>Fuel Type</h4>
                <div className="check-group">
                    {FUEL_TYPES.map(f => (
                        <label key={f} className="check-item">
                            <input type="checkbox" checked={fuels.includes(f)}
                                onChange={() => toggleArr(fuels, setFuels, f)} />
                            {f}
                        </label>
                    ))}
                </div>
            </div>

            {/* Transmission */}
            <div>
                <h4 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.9rem' }}>Transmission</h4>
                <div className="check-group">
                    {TRANSMISSIONS.map(t => (
                        <label key={t} className="check-item">
                            <input type="checkbox" checked={transmissions.includes(t)}
                                onChange={() => toggleArr(transmissions, setTransmissions, t)} />
                            {t}
                        </label>
                    ))}
                </div>
            </div>

            {/* State */}
            <div>
                <h4 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.9rem' }}>State</h4>
                <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="form-select">
                    <option value="">All India</option>
                    {Object.keys(INDIA_STATES).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Show Sold */}
            <label className="check-item">
                <input type="checkbox" checked={showSold} onChange={() => setShowSold(!showSold)} />
                Include Sold Listings
            </label>
        </div>
    );

    return (
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>

            {/* ── Top bar ── */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ flex: 1, position: 'relative', minWidth: '180px' }}>
                    <FiSearch size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input value={query} onChange={e => setQuery(e.target.value)}
                        placeholder="Search brand, model, city..."
                        className="form-input" style={{ paddingLeft: '40px' }} />
                </div>

                {/* Sort */}
                <select value={sort} onChange={e => setSort(e.target.value)} className="form-select" style={{ width: 'auto' }}>
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                {/* Mobile filter button */}
                <button onClick={() => setDrawerOpen(true)} className="btn btn-outline btn-sm sp-filter-btn">
                    <FiSliders size={14} /> Filters {hasFilters ? `(on)` : ''}
                </button>

                {/* Clear filters */}
                {hasFilters && (
                    <button onClick={clearFilters} className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <FiX size={14} /> Clear
                    </button>
                )}
            </div>

            {/* ── Layout ── */}
            <div className="sp-layout">

                {/* Desktop sidebar */}
                <aside className="sp-sidebar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Filters</h3>
                        {hasFilters && (
                            <button onClick={clearFilters} style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Clear all</button>
                        )}
                    </div>
                    <FilterContent />
                </aside>

                {/* Results */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> vehicles found
                    </div>
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                            <h3 style={{ marginBottom: '8px' }}>No results found</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters.</p>
                            <button onClick={clearFilters} className="btn btn-primary" style={{ marginTop: '16px' }}>Clear Filters</button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '24px' }}>
                            {filtered.map(listing => (
                                <CarCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Mobile drawer overlay ── */}
            <div className={`sp-drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />

            {/* ── Mobile filter drawer ── */}
            <div className={`sp-drawer ${drawerOpen ? 'open' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Filters</h3>
                    <button onClick={() => setDrawerOpen(false)} style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <FiX size={18} />
                    </button>
                </div>
                <FilterContent />
                <button
                    onClick={() => setDrawerOpen(false)}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '24px', padding: '14px', fontSize: '1rem' }}>
                    Show {filtered.length} Results
                </button>
            </div>
        </div>
    );
}
