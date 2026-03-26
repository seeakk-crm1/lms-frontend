import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  createOffice,
  deleteOffice,
  getAllLocations,
  getOffices,
  toggleStatus,
  updateOffice,
} from '../../../services/admin/office/officeService';
import { useOfficeStore } from '../../../store/admin/office/officeStore';
import type {
  ListOfficesApiResponse,
  Office,
  OfficeFormValues,
} from '../../../types/admin/office/office.types';

const getErrorMessage = (error: any, fallback: string): string => {
  if (error?.code === 'ERR_NETWORK') return 'Cannot connect to backend. Please ensure API server is running on port 5000.';
  if (error?.response?.status === 401) return 'Unauthorized. Please login again.';
  return error?.response?.data?.message || fallback;
};

const patchOfficeList = (
  oldData: ListOfficesApiResponse | undefined,
  updater: (list: Office[]) => Office[],
): ListOfficesApiResponse | undefined => {
  if (!oldData) return oldData;
  return {
    ...oldData,
    data: {
      ...oldData.data,
      offices: updater(oldData.data?.offices || []),
    },
  };
};

export const useOfficesQuery = () => {
  const { search, filters, pagination } = useOfficeStore();

  return useQuery<ListOfficesApiResponse, Error>({
    queryKey: ['offices', search, filters, pagination.page, pagination.limit],
    queryFn: () =>
      getOffices({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        status: filters.status === 'ALL' ? undefined : filters.status,
        countryId: filters.countryId || undefined,
        stateId: filters.stateId || undefined,
        districtId: filters.districtId || undefined,
      }),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 429) return false;
      return failureCount < 2;
    },
  });
};

export const useLocationsQuery = () =>
  useQuery({
    queryKey: ['locations', 'all'],
    queryFn: getAllLocations,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

export const useCreateOfficeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OfficeFormValues) => createOffice(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['offices'] });
      const previous = queryClient.getQueriesData<ListOfficesApiResponse>({ queryKey: ['offices'] });

      queryClient.setQueriesData<ListOfficesApiResponse>({ queryKey: ['offices'] }, (oldData) =>
        patchOfficeList(oldData, (list) => [
          {
            id: `temp-${Date.now()}`,
            name: payload.name,
            address: payload.address || null,
            countryId: payload.countryId,
            stateId: payload.stateId,
            districtId: payload.districtId,
            isActive: payload.isActive,
            createdBy: 'You',
            workspaceId: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ...list,
        ]),
      );

      return { previous };
    },
    onError: (error: any, _payload, context) => {
      context?.previous?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error(getErrorMessage(error, 'Failed to create office'));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      toast.success(response?.message || 'Office created successfully');
    },
  });
};

export const useUpdateOfficeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OfficeFormValues }) => updateOffice(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['offices'] });
      const previous = queryClient.getQueriesData<ListOfficesApiResponse>({ queryKey: ['offices'] });

      queryClient.setQueriesData<ListOfficesApiResponse>({ queryKey: ['offices'] }, (oldData) =>
        patchOfficeList(oldData, (list) =>
          list.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...payload,
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        ),
      );

      return { previous };
    },
    onError: (error: any, _payload, context) => {
      context?.previous?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error(getErrorMessage(error, 'Failed to update office'));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      toast.success(response?.message || 'Office updated successfully');
    },
  });
};

export const useDeleteOfficeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOffice(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['offices'] });
      const previous = queryClient.getQueriesData<ListOfficesApiResponse>({ queryKey: ['offices'] });

      queryClient.setQueriesData<ListOfficesApiResponse>({ queryKey: ['offices'] }, (oldData) =>
        patchOfficeList(oldData, (list) => list.filter((item) => item.id !== id)),
      );

      return { previous };
    },
    onError: (error: any, _id, context) => {
      context?.previous?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error(getErrorMessage(error, 'Failed to delete office'));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      toast.success(response?.message || 'Office deleted successfully');
    },
  });
};

export const useToggleOfficeStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleStatus(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['offices'] });
      const previous = queryClient.getQueriesData<ListOfficesApiResponse>({ queryKey: ['offices'] });

      queryClient.setQueriesData<ListOfficesApiResponse>({ queryKey: ['offices'] }, (oldData) =>
        patchOfficeList(oldData, (list) =>
          list.map((item) => (item.id === id ? { ...item, isActive } : item)),
        ),
      );

      return { previous };
    },
    onError: (error: any, _payload, context) => {
      context?.previous?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error(getErrorMessage(error, 'Failed to update office status'));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      toast.success(response?.message || 'Office status updated');
    },
  });
};
