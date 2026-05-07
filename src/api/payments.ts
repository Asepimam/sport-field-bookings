import client from './client';

export interface PaymentConfirmPayload {
  bookingId: string;
  method: 'BANK_TRANSFER' | 'QRIS';
}

export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId: string;
}

export const confirmPayment = (data: PaymentConfirmPayload) =>
  client.post<PaymentResult>('/payments/confirm', data).then((r) => r.data);
