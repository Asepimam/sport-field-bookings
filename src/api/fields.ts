import client from './client';

// ================= TYPES =================

export interface GroundResponse {
  id: string;
  name_ground: string;
  location: string;
  price_per_hour: number;
  is_available: boolean;
  open_time: string;
  close_time: string;
  sport_type: string;
  cover_image_url?: string;
  cove_image_url?: string;
  rating: number;
  total_reviews?: number;
  is_open_now?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  code?: string;
  status?: string;
  data: T;
  meta?: {
    page: number;
    size: number;
    total: number;
    totalPages?: number;
  };
}

export const getGroundCoverImageUrl = (ground: GroundResponse) =>
  ground.cover_image_url ?? ground.cove_image_url;

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface FieldFilters {
  sport?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  order?: string;
}

// ================= ADAPTER =================

export const toPagedResponse = <T>(
  res: ApiResponse<T[]>
): PagedResponse<T> => {
  return {
    content: res.data ?? [],
    totalElements: res.meta?.total ?? 0,
    totalPages: res.meta?.totalPages ?? 0,
    number: res.meta?.page ?? 1,
    size: res.meta?.size ?? 10,
  };
};

// ================= API =================

// PUBLIC GROUNDS (FIXED)
export const fetchPublicGrounds = (params?: FieldFilters) =>
  client
    .get<ApiResponse<GroundResponse[]>>('/grounds/public', { params })
    .then((response) => {
      if (import.meta.env.DEV) {
        console.log('[API] public grounds raw:', response.data);
      }
      return toPagedResponse(response.data);
    });

// OWNER GROUNDS (FIXED)
export const fetchOwnerGrounds = (params?: FieldFilters) =>
  client
    .get<ApiResponse<GroundResponse[]>>('/grounds/owner/', { params })
    .then((res) => toPagedResponse(res.data));

// CREATE
export const createGround = (data: {
  name_ground: string;
  location: string;
  price_per_hour: number;
  is_available: boolean;
}) =>
  client
    .post<ApiResponse<GroundResponse>>('/grounds', data)
    .then((res) => res.data.data);

// DETAIL
export const fetchGroundById = (id: string) =>
  client
    .get<ApiResponse<GroundResponse>>(`/grounds/${id}`)
    .then((res) => res.data.data);

// AVAILABLE SLOTS
export const fetchAvailableSlots = (
  groundId: string,
  date: string
) =>
  client
    .get<string[] | ApiResponse<string[]>>(`/grounds/${groundId}/available-slots`, {
      params: { date },
    })
    .then((res) => {
      if (
        res.data &&
        typeof res.data === 'object' &&
        'data' in res.data
      ) {
        return res.data.data;
      }

      return Array.isArray(res.data) ? res.data : [];
    });
