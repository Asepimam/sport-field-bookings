import { useMutation, useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import { login, register, fetchMe } from '../api/auth';
import type { LoginPayload, RegisterPayload } from '../api/auth';
import { useAuthContext } from '../contexts/AuthContext';

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
    },
    onError: () => {
      message.error('Email atau password salah');
    },
  });
}

export function useRegister() {
  const { setToken } = useAuthContext();
  return useMutation({
    mutationFn: (data: RegisterPayload) => register(data),
    onSuccess: (res) => {
      setToken(res.token);
      message.success('Registrasi berhasil!');
    },
    onError: () => {
      message.error('Registrasi gagal. Email mungkin sudah terdaftar.');
    },
  });
}
