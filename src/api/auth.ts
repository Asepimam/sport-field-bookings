import client from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'OWNER';
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  email?: string;
  username?: string;
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
  id: number;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'OWNER';
  avatar?: string;
}

export const login = (data: LoginPayload) =>
  client
    .post<AuthResponse | ApiEnvelope<AuthResponse>>('/auth/login', data)
    .then((r) => unwrapApiResponse(r.data));

export const register = (data: RegisterPayload) =>
  client
    .post<AuthResponse | ApiEnvelope<AuthResponse>>('/auth/register', data)
    .then((r) => unwrapApiResponse(r.data));

export const fetchMe = () =>
  client.get<UserProfile>('/users/me').then((r) => r.data);
