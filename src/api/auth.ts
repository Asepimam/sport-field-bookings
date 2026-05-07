import client from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  user_name: string;
  password: string;
  email: string;
  role: 'CUSTOMER' | 'OWNER';
  phone_number: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  email?: string;
  username?: string;
  user_name?: string;
}

interface ApiEnvelope<T> {
  code: string;
  data: T;
}

const unwrapApiResponse = <T>(response: T | ApiEnvelope<T>): T => {
  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    'code' in response
  ) {
    return (response as ApiEnvelope<T>).data;
  }

  return response as T;
};

export interface UserProfile {
  id: number | string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'OWNER';
  avatar?: string;
}

interface RawUserProfile {
  id: number | string;
  name?: string;
  username?: string;
  email: string;
  role?: 'CUSTOMER' | 'OWNER';
  groups?: ('CUSTOMER' | 'OWNER')[];
  avatar?: string;
}

const normalizeUserProfile = (profile: RawUserProfile): UserProfile => ({
  id: profile.id,
  name: profile.name ?? profile.username ?? profile.email,
  email: profile.email,
  role: profile.role ?? (profile.groups?.includes('OWNER') ? 'OWNER' : 'CUSTOMER'),
  avatar: profile.avatar,
});

export const login = (data: LoginPayload) =>
  client
    .post<AuthResponse | ApiEnvelope<AuthResponse>>('/auth/login', data)
    .then((r) => unwrapApiResponse(r.data));

export const register = (data: RegisterPayload) =>
  client
    .post<AuthResponse | ApiEnvelope<AuthResponse>>('/auth/register', data)
    .then((r) => unwrapApiResponse(r.data));

export const fetchMe = () =>
  client
    .get<RawUserProfile | ApiEnvelope<RawUserProfile>>('/profile/me')
    .then((r) => normalizeUserProfile(unwrapApiResponse(r.data)));
