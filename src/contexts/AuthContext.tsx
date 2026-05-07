import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../api/auth';

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

interface DecodedToken {
  sub?: string;
  upn?: string;
  groups?: string[];
  exp?: number;
}

const getStoredToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

const decodeToken = (token: string | null): DecodedToken | null => {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    );
    const decodedPayload = atob(paddedPayload);
    return JSON.parse(decodedPayload) as DecodedToken;
  } catch {
    return null;
  }
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

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) {
      localStorage.setItem('token', t);
      localStorage.setItem('accessToken', t);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    queryClient.clear();
  };

  useEffect(() => {
    if (!token) setUser(null);
  }, [token]);

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
        isAuthenticated: !!token,
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
