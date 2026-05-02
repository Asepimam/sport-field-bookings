import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { confirmPayment } from '../api/payments';
import type { PaymentConfirmPayload } from '../api/payments';

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentConfirmPayload) => confirmPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      message.success('Pembayaran berhasil dikonfirmasi!');
    },
    onError: () => {
      message.error('Konfirmasi pembayaran gagal.');
    },
  });
}
