import { useMutation, useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import axios from 'axios';
import { login, register, fetchMe } from '../api/auth';
import type { LoginPayload, RegisterPayload } from '../api/auth';
import { useAuthContext } from '../contexts/AuthContext';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  code?: string;
}

const getAuthErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  if (!error.response) {
    return 'Tidak bisa terhubung ke server. Pastikan backend Quarkus berjalan dan CORS sudah diizinkan.';
  }

  const status = error.response.status;
  const data = error.response.data;

  if (data?.message) return data.message;
  if (data?.error) return data.error;

  if (status === 400 || status === 401) {
    return 'Email atau password salah';
  }

  if (status === 404) {
    return 'Endpoint login tidak ditemukan. Cek VITE_API_BASE_URL dan path /auth/login.';
  }

  return `Login gagal. Server mengembalikan status ${status}.`;
};

export function useProfile() {
  const { token, setUser } = useAuthContext();
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const profile = await fetchMe();
      setUser(profile);
      return profile;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const { setToken } = useAuthContext();
  return useMutation({
    mutationFn: (data: LoginPayload) => login(data),
    onSuccess: (res) => {
      setToken(res.token);
      if (res.refreshToken) {
        localStorage.setItem('refreshToken', res.refreshToken);
      }
    },
    onError: (error) => {
      message.error(getAuthErrorMessage(error, 'Email atau password salah'));
    },
  });
}

export function useRegister() {
  const { setToken } = useAuthContext();
  return useMutation({
    mutationFn: (data: RegisterPayload) => register(data),
    onSuccess: (res) => {
      setToken(res.token);
      if (res.refreshToken) {
        localStorage.setItem('refreshToken', res.refreshToken);
      }
      message.success('Registrasi berhasil!');
    },
    onError: (error) => {
      message.error(
        getAuthErrorMessage(error, 'Registrasi gagal. Email mungkin sudah terdaftar.')
      );
    },
  });
}
