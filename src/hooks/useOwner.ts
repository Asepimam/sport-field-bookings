import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  fetchOwnerFields,
  createField,
  updateField,
  fetchOwnerBookings,
  confirmBooking,
  fetchRevenue,
  fetchOwnerRevenue,
  fetchOwnerRevenueSummary,
  fetchGroundFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
} from '../api/owner';
import type { CreateFieldPayload, CreateFacilityPayload } from '../api/owner';

export function useOwnerFields() {
  return useQuery({
    queryKey: ['owner-fields'],
    queryFn: fetchOwnerFields,
    staleTime: 60 * 1000,
  });
}

export function useCreateField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFieldPayload) => createField(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-fields'] });
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      message.success('Lapangan berhasil ditambahkan!');
    },
    onError: () => {
      message.error('Gagal menambahkan lapangan.');
    },
  });
}

export function useUpdateField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateFieldPayload }) => updateField(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-fields'] });
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      message.success('Lapangan berhasil diperbarui!');
    },
    onError: () => {
      message.error('Gagal memperbarui lapangan.');
    },
  });
}

export function useOwnerBookings() {
  return useQuery({
    queryKey: ['owner-bookings'],
    queryFn: fetchOwnerBookings,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      message.success('Booking dikonfirmasi!');
    },
    onError: () => {
      message.error('Gagal mengkonfirmasi booking.');
    },
  });
}

export function useRevenue() {
  return useQuery({
    queryKey: ['revenue'],
    queryFn: fetchRevenue,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOwnerRevenue(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['owner-revenue', startDate, endDate],
    queryFn: () => fetchOwnerRevenue(startDate, endDate),
    staleTime: 5 * 60 * 1000,
    enabled: !!startDate && !!endDate,
  });
}

export function useOwnerRevenueSummary() {
  return useQuery({
    queryKey: ['owner-revenue-summary'],
    queryFn: fetchOwnerRevenueSummary,
    staleTime: 5 * 60 * 1000,
  });
}

// Facility hooks
export function useGroundFacilities(groundId: string) {
  return useQuery({
    queryKey: ['ground-facilities', groundId],
    queryFn: () => fetchGroundFacilities(groundId),
    staleTime: 60 * 1000,
    enabled: !!groundId,
  });
}

export function useCreateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groundId, data }: { groundId: string; data: CreateFacilityPayload }) =>
      createFacility(groundId, data),
    onSuccess: (_, { groundId }) => {
      queryClient.invalidateQueries({ queryKey: ['ground-facilities', groundId] });
      message.success('Fasilitas berhasil ditambahkan');
    },
    onError: () => {
      message.error('Gagal menambahkan fasilitas');
    },
  });
}

export function useUpdateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groundId,
      facilityId,
      data,
    }: {
      groundId: string;
      facilityId: string;
      data: CreateFacilityPayload;
    }) => updateFacility(groundId, facilityId, data),
    onSuccess: (_, { groundId }) => {
      queryClient.invalidateQueries({ queryKey: ['ground-facilities', groundId] });
      message.success('Fasilitas berhasil diperbarui');
    },
    onError: () => {
      message.error('Gagal memperbarui fasilitas');
    },
  });
}

export function useDeleteFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groundId, facilityId }: { groundId: string; facilityId: string }) =>
      deleteFacility(groundId, facilityId),
    onSuccess: (_, { groundId }) => {
      queryClient.invalidateQueries({ queryKey: ['ground-facilities', groundId] });
      message.success('Fasilitas berhasil dihapus');
    },
    onError: () => {
      message.error('Gagal menghapus fasilitas');
    },
  });
}
