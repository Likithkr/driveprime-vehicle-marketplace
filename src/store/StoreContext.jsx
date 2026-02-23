import { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../lib/api';

const StoreContext = createContext(null);

const initialState = {
    listings: [],
    pendingListings: [],
    isAdminLoggedIn: false,
    loading: true,   // true until first API fetch completes
    error: null,
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_LISTINGS':
            return { ...state, listings: action.payload };
        case 'SET_PENDING':
            return { ...state, pendingListings: action.payload };
        case 'SET_READY':          // called after both fetches succeed
            return { ...state, loading: false, error: null };
        case 'SET_ERROR':          // called when fetch fails — keep loading:true so error screen stays
            return { ...state, loading: true, error: action.payload };

        case 'ADMIN_LOGIN':
            return { ...state, isAdminLoggedIn: true };
        case 'ADMIN_LOGOUT':
            return { ...state, isAdminLoggedIn: false };

        case 'ADD_LISTING':
            return { ...state, listings: [action.payload, ...state.listings] };
        case 'UPDATE_LISTING':
            return {
                ...state,
                listings: state.listings.map(l =>
                    l.id === action.payload.id ? action.payload : l
                ),
            };
        case 'DELETE_LISTING':
            return { ...state, listings: state.listings.filter(l => l.id !== action.payload) };
        case 'TOGGLE_SOLD':
            return {
                ...state,
                listings: state.listings.map(l =>
                    l.id === action.payload.id ? action.payload : l
                ),
            };
        case 'SUBMIT_DEALER_LISTING':
            return { ...state, pendingListings: [action.payload, ...state.pendingListings] };
        case 'APPROVE_LISTING':
            return {
                ...state,
                pendingListings: state.pendingListings.filter(l => l.id !== action.payload.pendingId),
                listings: [action.payload.listing, ...state.listings],
            };
        case 'REJECT_LISTING':
            return { ...state, pendingListings: state.pendingListings.filter(l => l.id !== action.payload) };

        default:
            return state;
    }
}

export function StoreProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // ── Load data from MySQL on mount ────────────────────────────────────────
    useEffect(() => {
        async function loadData() {
            try {
                const [listings, pendingListings] = await Promise.all([
                    api.listings.getAll(),
                    api.pending.getAll(),
                ]);
                dispatch({ type: 'SET_LISTINGS', payload: listings });
                dispatch({ type: 'SET_PENDING', payload: pendingListings });
                dispatch({ type: 'SET_READY' });
            } catch (err) {
                dispatch({
                    type: 'SET_ERROR',
                    payload: 'Cannot connect to backend. Please start the backend server:\n\ncd backend  →  npm run dev',
                });
            }
        }
        loadData();
    }, []);

    // ── API-aware dispatch wrapper ───────────────────────────────────────────
    async function apiDispatch(action) {
        try {
            switch (action.type) {
                case 'ADD_LISTING': {
                    const created = await api.listings.add(action.payload);
                    dispatch({ type: 'ADD_LISTING', payload: created });
                    break;
                }
                case 'UPDATE_LISTING': {
                    const updated = await api.listings.update(action.payload.id, action.payload);
                    dispatch({ type: 'UPDATE_LISTING', payload: updated });
                    break;
                }
                case 'DELETE_LISTING': {
                    await api.listings.remove(action.payload);
                    dispatch({ type: 'DELETE_LISTING', payload: action.payload });
                    break;
                }
                case 'TOGGLE_SOLD': {
                    const toggled = await api.listings.toggleSold(action.payload);
                    dispatch({ type: 'TOGGLE_SOLD', payload: toggled });
                    break;
                }
                case 'SUBMIT_DEALER_LISTING': {
                    const submitted = await api.pending.submit(action.payload);
                    dispatch({ type: 'SUBMIT_DEALER_LISTING', payload: submitted });
                    break;
                }
                case 'APPROVE_LISTING': {
                    const result = await api.pending.approve(action.payload);
                    dispatch({ type: 'APPROVE_LISTING', payload: { pendingId: action.payload, listing: result.listing } });
                    break;
                }
                case 'REJECT_LISTING': {
                    await api.pending.reject(action.payload);
                    dispatch({ type: 'REJECT_LISTING', payload: action.payload });
                    break;
                }
                default:
                    dispatch(action);
            }
        } catch (err) {
            console.error(`[store] ${action.type} failed:`, err.message);
            throw err;
        }
    }

    // ── Show loading / error screen until DB is ready ────────────────────────
    if (state.loading) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: '#0f172a', color: '#fff', gap: '16px', padding: '24px',
            }}>
                <img src="/drive-prime-logo.png" alt="Drive Prime" style={{ height: 52, marginBottom: 8 }} />

                {state.error ? (
                    <>
                        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fca5a5' }}>
                            ⚠️ Cannot connect to the database
                        </p>
                        <div style={{
                            background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
                            borderRadius: '12px', padding: '20px 28px', maxWidth: '480px',
                            fontSize: '0.9rem', lineHeight: 1.8, color: '#fecaca', textAlign: 'center',
                        }}>
                            <p style={{ marginBottom: '10px' }}>Make sure:</p>
                            <p>1. <strong>XAMPP → MySQL is started</strong></p>
                            <p>2. Open a terminal in <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4 }}>backend/</code> and run:</p>
                            <code style={{
                                display: 'block', marginTop: '10px', padding: '10px 16px',
                                background: '#0f172a', borderRadius: '8px', fontSize: '0.95rem',
                            }}>npm run dev</code>
                        </div>
                        <button onClick={() => window.location.reload()}
                            style={{
                                marginTop: '8px', padding: '10px 28px', borderRadius: '99px',
                                background: 'var(--primary, #f97316)', color: '#fff', border: 'none',
                                fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
                            }}>
                            🔄 Retry
                        </button>
                    </>
                ) : (
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>
                        Connecting to database…
                    </p>
                )}
            </div>
        );
    }

    return (
        <StoreContext.Provider value={{ state, dispatch: apiDispatch }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error('useStore must be used within StoreProvider');
    return ctx;
}
