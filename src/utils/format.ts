import dayjs from 'dayjs';

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

export const formatDate = (date: string) => dayjs(date).format('DD MMM YYYY');

export const formatDateTime = (date: string) => dayjs(date).format('DD MMM YYYY, HH:mm');

export const statusLabel: Record<string, { label: string; color: string }> = {
  WAITING_PAYMENT: { label: 'Menunggu Pembayaran', color: 'orange' },
  PAID: { label: 'Sudah Dibayar', color: 'blue' },
  CONFIRMED: { label: 'Dikonfirmasi', color: 'green' },
  CANCELLED: { label: 'Dibatalkan', color: 'red' },
  COMPLETED: { label: 'Selesai', color: 'default' },
};
