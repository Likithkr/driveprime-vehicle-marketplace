/**
 * useSSE — connects to the backend's SSE stream and calls callbacks
 * when specific data events are received.
 *
 * Events:
 *   listings:changed  → re-fetch listings
 *   pending:changed   → re-fetch pending submissions
 *   settings:changed  → re-fetch settings
 *   appointments:changed → re-fetch appointments (for AdminAppointmentsPage)
 */

import { useEffect, useRef } from 'react';
import { API_BASE } from '../lib/config';

export function useSSE(callbacks = {}) {
    const cbRef = useRef(callbacks);
    cbRef.current = callbacks;   // always point to latest version without re-mounting

    useEffect(() => {
        let source;
        let retryTimer;

        function connect() {
            source = new EventSource(`${API_BASE}/api/events`);

            source.addEventListener('listings:changed', () => {
                cbRef.current.onListingsChanged?.();
            });
            source.addEventListener('pending:changed', () => {
                cbRef.current.onPendingChanged?.();
            });
            source.addEventListener('settings:changed', () => {
                cbRef.current.onSettingsChanged?.();
            });
            source.addEventListener('appointments:changed', () => {
                cbRef.current.onAppointmentsChanged?.();
            });

            source.onerror = () => {
                // EventSource will retry automatically, but we add our own
                // small back-off so we don't spam logs on a downed server
                source.close();
                retryTimer = setTimeout(connect, 5000);
            };
        }

        connect();

        return () => {
            clearTimeout(retryTimer);
            source?.close();
        };
    }, []); // mount once — cb changes are tracked via ref
}
