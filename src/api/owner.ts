import client from './client';
import { ApiResponse, toPagedResponse, type GroundResponse } from './fields';
import type { Booking } from './bookings';

export interface RevenueStats {
  totalRevenue: number;
  revenueByField: { fieldName: string; revenue: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

export interface CreateFieldPayload {
  name_ground: string;
  location: string;
  price_per_hour: number;
  is_available: boolean;
  sport_type: string;
  open_time: string;
  close_time: string;
  cover_image_url: string;
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

export const fetchOwnerFields = () =>
  client.get<ApiResponse<GroundResponse[]>>('/grounds/owner/').then((r) => toPagedResponse(r.data));

export const createField = (data: CreateFieldPayload) =>
  client
    .post<GroundResponse | ApiEnvelope<GroundResponse>>('/grounds', data)
    .then((r) => unwrapApiResponse(r.data));

export const updateField = (id: string, data: CreateFieldPayload) =>
  client
    .put<GroundResponse | ApiEnvelope<GroundResponse>>(`/grounds/${id}`, data)
    .then((r) => unwrapApiResponse(r.data));

export const fetchOwnerBookings = () =>
  client
    .get<Booking[] | ApiEnvelope<Booking[]>>('/bookings/owner')
    .then((r) => {
      const bookings = unwrapApiResponse(r.data);
      return Array.isArray(bookings) ? bookings : [];
    });

export const confirmBooking = (id: string) =>
  client.put<Booking>(`/owner/bookings/${id}/confirm`).then((r) => r.data);

export const fetchRevenue = () =>
  client.get<RevenueStats>('/owner/revenue').then((r) => r.data);
