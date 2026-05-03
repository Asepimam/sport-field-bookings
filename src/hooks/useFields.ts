import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  fetchPublicGrounds,
  fetchGroundById,
  fetchAvailableSlots,
  FieldFilters,
  GroundResponse,
  PagedResponse,
} from '../api/fields';

// ================= LIST =================

export const useFields = (
  filters: Omit<FieldFilters, 'page' | 'size'>
) => {
  return useInfiniteQuery<PagedResponse<GroundResponse>>({
    queryKey: ['fields', filters],
    queryFn: ({ pageParam = 1 }) =>
      fetchPublicGrounds({
        ...filters,
        page: pageParam as number,
        size: 10,
      }),

    getNextPageParam: (lastPage) => {
      // FIX: prevent over-fetch
      if (lastPage.number >= lastPage.totalPages) return undefined;
      return lastPage.number + 1;
    },

    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
};

// ================= DETAIL =================

export const useGroundDetail = (id: string) => {
  return useQuery({
    queryKey: ['ground', id],
    queryFn: () => fetchGroundById(id),
    enabled: !!id,
  });
};

// ================= SLOTS =================

export const useAvailableSlots = (
  groundId: string,
  date: string
) => {
  return useQuery({
    queryKey: ['availableSlots', groundId, date],
    queryFn: () => fetchAvailableSlots(groundId, date),
    enabled: !!groundId && !!date,
    staleTime: 5 * 60 * 1000,
  });
};