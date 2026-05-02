import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchField, fetchFields, fetchAvailableSlots } from '../api/fields';
import type { FieldFilters } from '../api/fields';

export function useFields(filters: Omit<FieldFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['fields', filters],
    queryFn: ({ pageParam = 0 }) =>
      fetchFields({ ...filters, page: pageParam as number, size: 12 }),
    getNextPageParam: (last) =>
      last.number + 1 < last.totalPages ? last.number + 1 : undefined,
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useField(id: number) {
  return useQuery({
    queryKey: ['field', id],
    queryFn: () => fetchField(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useAvailableSlots(fieldId: number, date: string | null) {
  return useQuery({
    queryKey: ['slots', fieldId, date],
    queryFn: () => fetchAvailableSlots(fieldId, date!),
    enabled: !!date && !!fieldId,
    staleTime: 30 * 1000,
  });
}
