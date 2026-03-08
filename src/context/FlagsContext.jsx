import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../lib/config';


const FlagsContext = createContext({});

export function FlagsProvider({ children }) {
    const [flags, setFlags] = useState({
        allow_customer_selling: { value: false },
        maintenance_mode: { value: false },
    });

    const refreshFlags = () => {
        return fetch(`${API_BASE}/api/flags`)
            .then(r => r.json())
            .then(data => setFlags(data))
            .catch(() => { });
    };

    useEffect(() => {
        refreshFlags();
    }, []);

    return <FlagsContext.Provider value={{ flags, refreshFlags }}>{children}</FlagsContext.Provider>;
}

export function useFlags() {
    return useContext(FlagsContext);
}
