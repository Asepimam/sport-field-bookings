import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import axios from 'axios';
import { confirmPayment } from '../api/payments';
import type { PaymentConfirmPayload } from '../api/payments';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const getPaymentErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return 'Konfirmasi pembayaran belum bisa diproses.';
  }

  if (!error.response) {
    return 'Tidak bisa terhubung ke server. Pastikan backend berjalan.';
  }

  if (error.response.data?.message) return error.response.data.message;
  if (error.response.data?.error) return error.response.data.error;

  if (error.response.status === 404) {
    return 'Endpoint konfirmasi pembayaran belum tersedia di backend.';
  }

  return `Konfirmasi pembayaran gagal. Server mengembalikan status ${error.response.status}.`;
};

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentConfirmPayload) => confirmPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      message.success('Pembayaran berhasil dikonfirmasi!');
    },
    onError: (error) => {
      message.error(getPaymentErrorMessage(error));
    },
  });
}

export { getPaymentErrorMessage };
