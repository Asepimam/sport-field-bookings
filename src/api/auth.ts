import client from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'OWNER';
}

export interface AuthResponse {
  token: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'OWNER';
  avatar?: string;
}

export const login = (data: LoginPayload) =>
  client.post<AuthResponse>('/auth/login', data).then((r) => r.data);

export const register = (data: RegisterPayload) =>
  client.post<AuthResponse>('/auth/register', data).then((r) => r.data);

export const fetchMe = () =>
  client.get<UserProfile>('/users/me').then((r) => r.data);
