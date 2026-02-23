import { API_BASE } from './config';

const BASE = API_BASE;


async function request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `API error ${res.status}`);
    }
    return res.json();
}

// ── Listings ─────────────────────────────────────────────────────────────────
export const api = {
    listings: {
        getAll: () => request('/api/listings'),
        add: (data) => request('/api/listings', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => request(`/api/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        remove: (id) => request(`/api/listings/${id}`, { method: 'DELETE' }),
        toggleSold: (id) => request(`/api/listings/${id}/toggle-sold`, { method: 'PATCH' }),
    },
    pending: {
        getAll: () => request('/api/pending'),
        submit: (data) => request('/api/pending', { method: 'POST', body: JSON.stringify(data) }),
        approve: (id) => request(`/api/pending/${id}/approve`, { method: 'POST' }),
        reject: (id) => request(`/api/pending/${id}`, { method: 'DELETE' }),
    },
    brands: {
        getAll: () => request('/api/brands'),
        add: (data) => request('/api/brands', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => request(`/api/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        remove: (id) => request(`/api/brands/${id}`, { method: 'DELETE' }),
    },
};
