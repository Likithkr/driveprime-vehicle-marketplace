import { API_BASE } from './config';

const BASE = API_BASE;


async function request(path, options = {}) {
    const { token, ...rest } = options;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, { headers, ...rest });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `API error ${res.status}`);
    }
    return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const api = {
    auth: {
        updateProfile: (data, token) => request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data), token }),
        changePassword: (data, token) => request('/api/auth/password', { method: 'PUT', body: JSON.stringify(data), token }),
    },
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
    settings: {
        getAll: () => request('/api/settings'),
    },
    appointments: {
        submit: (data, token) => request('/api/appointments', { method: 'POST', body: JSON.stringify(data), token }),
        getMine: (token) => request('/api/appointments/mine', { token }),
        getAll: (token) => request('/api/appointments', { token }),
        confirm: (id, data, token) => request(`/api/appointments/${id}/confirm`, { method: 'PATCH', body: JSON.stringify(data), token }),
        cancel: (id, token) => request(`/api/appointments/${id}/cancel`, { method: 'PATCH', token }),
        remove: (id, token) => request(`/api/appointments/${id}`, { method: 'DELETE', token }),
    },
    dealerships: {
        getAll: () => request('/api/dealerships'),
        add: (data, token) => request('/api/dealerships', { method: 'POST', body: JSON.stringify(data), token }),
        update: (id, data, token) => request(`/api/dealerships/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
        remove: (id, token) => request(`/api/dealerships/${id}`, { method: 'DELETE', token }),
    },
    messages: {
        getAll: (token, dealershipId) => request(`/api/messages${dealershipId ? `?dealershipId=${dealershipId}` : ''}`, { token }),
        unreadCount: (token) => request('/api/messages/unread-count', { token }),
        send: (data, token) => request('/api/messages', { method: 'POST', body: JSON.stringify(data), token }),
        markRead: (id, token) => request(`/api/messages/${id}/read`, { method: 'PATCH', token }),
        markAllRead: (token) => request('/api/messages/read-all', { method: 'PATCH', token }),
        remove: (id, token) => request(`/api/messages/${id}`, { method: 'DELETE', token }),
    },
    uploads: {
        // Upload a document scan for a pending listing.
        // file: File object, pendingId: string, docKey: string, token: JWT.
        uploadDoc: async (file, pendingId, docKey, token) => {
            const form = new FormData();
            form.append('file', file);
            form.append('pendingId', pendingId);
            form.append('docKey', docKey);
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${BASE}/api/uploads/doc`, { method: 'POST', headers, body: form });
            if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || `Upload error ${res.status}`); }
            return res.json();
        },
        getDocsByPending: (pendingId, token) => request(`/api/uploads/doc/${pendingId}`, { token }),
        removeDoc: (id, token) => request(`/api/uploads/doc/${id}`, { method: 'DELETE', token }),
    },
};
