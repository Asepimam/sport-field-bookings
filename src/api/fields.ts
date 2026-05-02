import client from './client';

export interface Field {
  id: number;
  name: string;
  sport: string;
  location: string;
  pricePerHour: number;
  rating: number;
  imageUrl: string;
  facilities: string[];
  openTime: string;
  closeTime: string;
  description?: string;
  ownerId: number;
}

export interface FieldFilters {
  sport?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const fetchFields = (params: FieldFilters) =>
  client.get<PagedResponse<Field>>('/fields', { params }).then((r) => r.data);

export const fetchField = (id: number) =>
  client.get<Field>(`/fields/${id}`).then((r) => r.data);

export const fetchAvailableSlots = (id: number, date: string) =>
  client
    .get<string[]>(`/fields/${id}/available-slots`, { params: { date } })
    .then((r) => r.data);
