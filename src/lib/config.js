// Central API base URL — dynamically uses the same host the browser is on, port 3001
// Override with VITE_API_URL env variable if needed (e.g. for Cloudflare tunnel)
export const API_BASE = import.meta.env.VITE_API_URL
    || `http://${window.location.hostname}:3001`;
