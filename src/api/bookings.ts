import client from './client';

export interface Booking {
  id: string;
  ground_id: string;
  ground_name: string;
  ground_location: string;
  customer_email: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  created_at: string;
  selected_facilities?: string[];
}

export interface CreateBookingPayload {
  ground_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  selected_facilities?: string[];
}

interface ApiEnvelope<T> {
  code?: string;
  status?: string;
  data: T;
  meta?: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

const unwrapApiResponse = <T>(response: T | ApiEnvelope<T>): T => {
  if (
    response &&
    typeof response === 'object' &&
    'data' in response
  ) {
    return (response as ApiEnvelope<T>).data;
  }

  return response as T;
};

export const createBooking = (data: CreateBookingPayload) =>
  client
    .post<Booking | ApiEnvelope<Booking>>('/bookings', data)
    .then((r) => unwrapApiResponse(r.data));

export const fetchMyBookings = () =>
  client
    .get<Booking[] | ApiEnvelope<Booking[]>>('/bookings')
    .then((r) => {
      const bookings = unwrapApiResponse(r.data);
      return Array.isArray(bookings) ? bookings : [];
    });

export const fetchOwnerBookings = () =>
  client
    .get<Booking[] | ApiEnvelope<Booking[]>>('/bookings/owner')
    .then((r) => {
      const bookings = unwrapApiResponse(r.data);
      return Array.isArray(bookings) ? bookings : [];
    });
