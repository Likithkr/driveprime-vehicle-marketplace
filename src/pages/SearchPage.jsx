import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown, FiSearch, FiSliders } from 'react-icons/fi';
import { useStore } from '../store/StoreContext';
import CarCard from '../components/CarCard';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, INDIA_STATES } from '../data/mockData';

const SORT_OPTIONS = [
    { value: 'latest', label: 'Latest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'km_asc', label: 'Lowest KM' },
    { value: 'year_desc', label: 'Newest Year' },
];

export default function SearchPage() {
    const { state } = useStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Filters
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

    // Sync filters when navbar changes the URL search params
    useEffect(() => {
        setQuery(searchParams.get('q') || '');
        setType(searchParams.get('type') || '');
        if (searchParams.get('brand')) setSelectedBrands([searchParams.get('brand')]);
    }, [searchParams]);

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

    const hasFilters = query || type || selectedBrands.length || fuels.length || transmissions.length || minBudget > 0 || maxBudget < 10000000 || minKm > 0 || maxKm < 300000 || selectedState;

    const FilterPanel = () => (
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
                    value={minBudget} onChange={e => setMinBudget(Number(e.target.value))} style={{ marginTop: '8px' }} />
            </div>

            {/* KM Range */}
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
            {/* Top bar */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
                    <FiSearch size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input value={query} onChange={e => setQuery(e.target.value)}
                        placeholder="Search brand, model, city..."
                        className="form-input"
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
                <select value={sort} onChange={e => setSort(e.target.value)} className="form-select" style={{ width: 'auto' }}>
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button onClick={() => setSidebarOpen(true)} className="btn btn-outline btn-sm" style={{ display: 'none' }} id="filter-btn">
                    <FiSliders size={14} /> Filters
                </button>
                {hasFilters && (
                    <button onClick={clearFilters} className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <FiX size={14} /> Clear Filters
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
                {/* Sidebar */}
                <aside style={{
                    width: '260px', flexShrink: 0,
                    background: '#fff', borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)', padding: '24px',
                    position: 'sticky', top: '80px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Filters</h3>
                        {hasFilters && (
                            <button onClick={clearFilters} style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Clear all</button>
                        )}
                    </div>
                    <FilterPanel />
                </aside>

                {/* Results */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
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
        </div>
    );
}
