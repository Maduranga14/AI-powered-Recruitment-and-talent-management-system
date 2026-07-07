import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokenStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);       
    const [isLoading, setIsLoading] = useState(true); 

    
    useEffect(() => {
        const stored = tokenStorage.getUser();
        if (stored && !tokenStorage.isExpired()) {
            setUser(stored);
        } else {
            tokenStorage.clear(); 
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await authApi.login({ email, password });
        tokenStorage.save(res.data);
        setUser(res.data);
        return res.data;
    }, []);

    const register = useCallback(async (payload) => {
        const res = await authApi.register(payload);
        tokenStorage.save(res.data);
        setUser(res.data);
        return res.data;
    }, []);

    const logout = useCallback(() => {
        tokenStorage.clear();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
