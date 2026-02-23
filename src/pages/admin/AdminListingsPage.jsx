import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiArrowLeft, FiMapPin, FiGrid, FiList } from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/ToastProvider';
import CarCard from '../../components/CarCard';

export default function AdminListingsPage() {
    const { state, dispatch } = useStore();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    if (!state.isAdminLoggedIn) { navigate('/admin/login'); return null; }

    const filtered = state.listings.filter(l => {
        const matchSearch = `${l.brand} ${l.model} ${l.city}`.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || l.status === filter;
        return matchSearch && matchFilter;
    });

    const handleToggleSold = (id) => {
        dispatch({ type: 'TOGGLE_SOLD', payload: id });
        addToast('Listing status updated!', 'success');
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this listing permanently?')) {
            dispatch({ type: 'DELETE_LISTING', payload: id });
            addToast('Listing deleted.', 'info');
        }
    };

    const handleEdit = (listing) => {
        navigate(`/admin/edit-car/${listing.id}`);
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 0 80px' }}>
            <div className="container">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link to="/admin/dashboard" className="btn btn-outline btn-sm"><FiArrowLeft size={14} /></Link>
                        <div>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>Manage Listings</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{state.listings.length} total listings</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')} className="btn btn-outline btn-sm">
                            {viewMode === 'grid' ? <><FiList size={14} /> Table</> : <><FiGrid size={14} /> Grid</>}
                        </button>
                        <Link to="/admin/add-car" className="btn btn-primary">
                            <FiPlus size={16} /> Add New Car
                        </Link>
                    </div>
                </div>

                {/* Filters bar */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', background: '#fff', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                    <div style={{ flex: 1, position: 'relative', minWidth: '180px' }}>
                        <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search listings..." className="form-input" style={{ paddingLeft: '36px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {['all', 'live', 'sold'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} className="btn btn-sm"
                                style={{ background: filter === f ? 'var(--primary)' : 'var(--bg)', color: filter === f ? '#fff' : 'var(--text)', border: '1.5px solid', borderColor: filter === f ? 'var(--primary)' : 'var(--border)' }}>
                                {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? state.listings.length : state.listings.filter(l => l.status === f).length})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table view */}
                {viewMode === 'table' ? (
                    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', background: '#f8fafc' }}>
                                    {['Vehicle', 'Year', 'Price', 'KM', 'Location', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(l => {
                                    const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(`${l.city}, ${l.state}, India`)}`;
                                    return (
                                        <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                                            <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '0.9rem' }}>
                                                {l.brand} {l.model}
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>{l.variant}</div>
                                            </td>
                                            <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{l.year}</td>
                                            <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--primary)' }}>₹{(l.price / 100000).toFixed(1)}L</td>
                                            <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{(l.km / 1000).toFixed(0)}k km</td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <a href={mapUrl} target="_blank" rel="noreferrer"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0369a1', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>
                                                    <FiMapPin size={13} /> {l.city}
                                                </a>
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <span className={`badge badge-${l.status}`}>{l.status}</span>
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button onClick={() => handleToggleSold(l.id)} className="btn btn-sm" style={{ background: l.status === 'sold' ? '#dcfce7' : '#fef3c7', color: l.status === 'sold' ? '#16a34a' : '#d97706', fontSize: '0.75rem' }}>
                                                        {l.status === 'sold' ? 'Mark Live' : 'Mark Sold'}
                                                    </button>
                                                    <button onClick={() => handleEdit(l)} className="btn btn-sm btn-outline"><FiEdit size={13} /></button>
                                                    <button onClick={() => handleDelete(l.id)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626' }}><FiTrash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No listings found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Grid view */
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {filtered.map(listing => {
                                const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(`${listing.city}, ${listing.state}, India`)}`;
                                return (
                                    <div key={listing.id} style={{ position: 'relative' }}>
                                        <CarCard listing={listing} showActions
                                            onToggleSold={handleToggleSold}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                        {/* Map link overlay — top-right corner (top-left = badges, bottom-right = year) */}
                                        <a href={mapUrl} target="_blank" rel="noreferrer" title="Open in Google Maps"
                                            style={{
                                                position: 'absolute', top: 12, right: 12, zIndex: 10,
                                                background: 'rgba(255,255,255,0.95)', borderRadius: '99px',
                                                padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600,
                                                color: '#0369a1', display: 'flex', alignItems: 'center', gap: 4,
                                                textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                backdropFilter: 'blur(4px)',
                                            }}>
                                            <FiMapPin size={11} /> {listing.city}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                        {filtered.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                                <h3>No listings found</h3>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
