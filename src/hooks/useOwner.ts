import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  fetchOwnerFields,
  createField,
  updateField,
  fetchOwnerBookings,
  confirmBooking,
  fetchRevenue,
} from '../api/owner';

export function useOwnerFields() {
  return useQuery({
    queryKey: ['owner-fields'],
    queryFn: fetchOwnerFields,
    staleTime: 60 * 1000,
  });
}

export function useCreateField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => createField(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-fields'] });
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      message.success('Lapangan berhasil ditambahkan!');
    },
    onError: () => {
      message.error('Gagal menambahkan lapangan.');
    },
  });
}

export function useUpdateField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateField(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-fields'] });
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      message.success('Lapangan berhasil diperbarui!');
    },
    onError: () => {
      message.error('Gagal memperbarui lapangan.');
    },
  });
}

export function useOwnerBookings() {
  return useQuery({
    queryKey: ['owner-bookings'],
    queryFn: fetchOwnerBookings,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      message.success('Booking dikonfirmasi!');
    },
    onError: () => {
      message.error('Gagal mengkonfirmasi booking.');
    },
  });
}

export function useRevenue() {
  return useQuery({
    queryKey: ['revenue'],
    queryFn: fetchRevenue,
    staleTime: 5 * 60 * 1000,
  });
}
