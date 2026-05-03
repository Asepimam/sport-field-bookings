import client from './client';

export interface Booking {
  id: number;
  fieldId: number;
  fieldName: string;
  fieldLocation: string;
  customerName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'WAITING_PAYMENT' | 'PAID' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

export interface CreateBookingPayload {
  fieldId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
}

export const createBooking = (data: CreateBookingPayload) =>
  client.post<Booking>('/bookings', data).then((r) => r.data);

export const fetchMyBookings = () =>
  client.get<Booking[]>('/bookings/my-bookings').then((r) => r.data);
