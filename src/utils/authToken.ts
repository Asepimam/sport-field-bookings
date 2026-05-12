export interface DecodedToken {
  sub?: string;
  upn?: string;
  groups?: string[];
  exp?: number;
}

export const decodeToken = (token: string | null): DecodedToken | null => {
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

export const getTokenExpiresAt = (token: string | null) => {
  const decodedToken = decodeToken(token);
  return decodedToken?.exp ? decodedToken.exp * 1000 : null;
};

export const isTokenExpired = (token: string | null) => {
  const expiresAt = getTokenExpiresAt(token);
  return !expiresAt || expiresAt <= Date.now();
};

export const removeStoredAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
