import client from './client';
import type { Field } from './fields';
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
  openTime: string;
  closeTime: string;
  facilities: string[];
  description?: string;
}

export const fetchOwnerFields = () =>
  client.get<Field[]>('/owner/fields').then((r) => r.data);

export const createField = (data: FormData) =>
  client
    .post<Field>('/owner/fields', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const updateField = (id: number, data: FormData) =>
  client
    .put<Field>(`/owner/fields/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const fetchOwnerBookings = () =>
  client.get<Booking[]>('/owner/bookings').then((r) => r.data);

export const confirmBooking = (id: number) =>
  client.put<Booking>(`/owner/bookings/${id}/confirm`).then((r) => r.data);

export const fetchRevenue = () =>
  client.get<RevenueStats>('/owner/revenue').then((r) => r.data);
