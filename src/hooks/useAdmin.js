/**
 * useAdmin — manages the logged-in admin/staff/developer session.
 * Reads from / writes to localStorage key `dp_admin`
 */

const SESSION_KEY = 'dp_admin';

export function useAdmin() {
    function getSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    function login(token, user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
    }

    function getToken() {
        return getSession()?.token || null;
    }

    function getUser() {
        return getSession()?.user || null;
    }

    function isLoggedIn() {
        return Boolean(getToken());
    }

    return { login, logout, getToken, getUser, isLoggedIn };
}
