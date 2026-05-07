import client from './client';
import { ApiResponse, toPagedResponse, type GroundResponse } from './fields';
import type { Booking } from './bookings';

export interface RevenueStats {
  totalRevenue: number;
  revenueByField: { fieldName: string; revenue: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

export interface CreateFieldPayload {
  name: string;
  sport: string;
  location: string;
  pricePerHour: number;
  open_time: string;
  close_time: string;
  facilities: string[];
  description?: string;
}

export const fetchOwnerFields = () =>
  client.get<ApiResponse<GroundResponse[]>>('grounds/owner').then((r) => toPagedResponse(r.data));

export const createField = (data: FormData) =>
  client
    .post<GroundResponse>('/owner/fields', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const updateField = (id: string, data: FormData) =>
  client
    .put<GroundResponse>(`/owner/fields/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const fetchOwnerBookings = () =>
  client.get<Booking[]>('/owner/bookings').then((r) => r.data);

export const confirmBooking = (id: string) =>
  client.put<Booking>(`/owner/bookings/${id}/confirm`).then((r) => r.data);

export const fetchRevenue = () =>
  client.get<RevenueStats>('/owner/revenue').then((r) => r.data);
