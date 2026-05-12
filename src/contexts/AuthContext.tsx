import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../api/auth';
import { decodeToken, getTokenExpiresAt, isTokenExpired, removeStoredAuth } from '../utils/authToken';

interface AuthContextValue {
  token: string | null;
  user: UserProfile | null;
  role: 'CUSTOMER' | 'OWNER' | null;
  setToken: (token: string | null) => void;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  isOwner: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const getStoredToken = () => {
  const storedToken = localStorage.getItem('token') || localStorage.getItem('accessToken');

  if (isTokenExpired(storedToken)) {
    removeStoredAuth();
    return null;
  }

  return storedToken;
};

const getRoleFromToken = (token: string | null): 'CUSTOMER' | 'OWNER' | null => {
  const decodedToken = decodeToken(token);
  const groups = decodedToken?.groups ?? [];

  if (groups.includes('OWNER')) return 'OWNER';
  if (groups.includes('CUSTOMER')) return 'CUSTOMER';

  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<UserProfile | null>(null);
  const queryClient = useQueryClient();
  const role = user?.role ?? getRoleFromToken(token);
  const isAuthenticated = !!token && !isTokenExpired(token);

  const setToken = useCallback((t: string | null) => {
    if (isTokenExpired(t)) {
      setTokenState(null);
      setUser(null);
      removeStoredAuth();
      queryClient.clear();
      return;
    }

    setTokenState(t);
    if (t) {
      localStorage.setItem('token', t);
      localStorage.setItem('accessToken', t);
    } else {
      removeStoredAuth();
    }
  }, [queryClient]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient, setToken]);

  useEffect(() => {
    if (!token) setUser(null);
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;

    const expiresAt = getTokenExpiresAt(token);
    if (!expiresAt) {
      logout();
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      logout();
    }, Math.max(expiresAt - Date.now(), 0));

    return () => window.clearTimeout(timeoutId);
  }, [logout, token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        setToken,
        setUser,
        logout,
        isOwner: role === 'OWNER',
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
