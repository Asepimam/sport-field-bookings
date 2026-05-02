import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { createBooking, fetchMyBookings } from '../api/bookings';
import type { CreateBookingPayload } from '../api/bookings';

export function useMyBookings() {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: fetchMyBookings,
    staleTime: 60 * 1000,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingPayload) => createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      message.success('Booking berhasil dibuat!');
    },
    onError: () => {
      message.error('Booking gagal. Slot mungkin sudah terisi.');
    },
  });
}
