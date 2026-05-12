import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  fetchGrounds,
  fetchPublicGrounds,
  fetchGroundLocations,
  fetchGroundById,
  fetchAvailableSlots,
  FieldFilters,
  GroundResponse,
  PagedResponse,
} from '../api/fields';

// ================= LIST =================

export const useFields = (
  filters: Omit<FieldFilters, 'page' | 'size'>,
  useAuthenticatedEndpoint = false
) => {
  return useInfiniteQuery<PagedResponse<GroundResponse>>({
    queryKey: ['fields', useAuthenticatedEndpoint ? 'auth' : 'public', filters],
    queryFn: ({ pageParam = 1 }) => {
      if (!useAuthenticatedEndpoint) {
        return fetchPublicGrounds({
          ...filters,
          page: 1,
          size: 10,
        });
      }

      return fetchGrounds({
        ...filters,
        page: pageParam as number,
        size: 10,
      });
    },

    getNextPageParam: (lastPage) => {
      // FIX: prevent over-fetch
      if (!useAuthenticatedEndpoint) return undefined;
      if (lastPage.number >= lastPage.totalPages) return undefined;
      return lastPage.number + 1;
    },

    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGroundLocations = (
  keyword = '',
  useAuthenticatedEndpoint = false,
  enabled = true
) => {
  return useQuery({
    queryKey: ['ground-locations', useAuthenticatedEndpoint ? 'auth' : 'public', keyword],
    queryFn: () =>
      fetchGroundLocations(
        { q: keyword || undefined, limit: useAuthenticatedEndpoint ? 20 : 10 },
        useAuthenticatedEndpoint
      ),
    enabled,
    staleTime: 10 * 60 * 1000,
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
