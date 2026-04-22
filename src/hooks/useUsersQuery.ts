import { useQuery } from '@tanstack/react-query';
import * as usersApi from '../services/users.api';
import { useUsersStore } from '../store/useUsersStore';

export const useUsersQuery = () => {
  const { search, filters, page, limit } = useUsersStore();

  return useQuery({
    queryKey: ['users', { search, ...filters, page, limit }],
    queryFn: () => usersApi.getUsers({ search, ...filters, page, limit }),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 429) return false;
      return failureCount < 2;
    },
  });
};

export const useUserDetailQuery = (userId: string | null) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getUserById(userId!),
    enabled: !!userId,
  });
};

export const useTargetTypesQuery = () => {
  return useQuery({
    queryKey: ['target-types'],
    queryFn: usersApi.getTargetTypes,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 429) return false;
      return failureCount < 2;
    },
  });
};

export const useUserTargetsQuery = (userId: string | null) => {
  return useQuery({
    queryKey: ['user-targets', userId],
    queryFn: () => usersApi.getUserTargets(userId!),
    enabled: !!userId,
  });
};

export const useLocationTreeQuery = () => {
  return useQuery({
    queryKey: ['locations-tree'],
    queryFn: usersApi.getLocationTree,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 429) return false;
      return failureCount < 2;
    },
  });
};

export const useAllLocationsQuery = () => {
  return useQuery({
    queryKey: ['locations-all'],
    queryFn: usersApi.getAllLocations,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 429) return false;
      return failureCount < 2;
    },
  });
};

export const useOfficesQuery = () => {
  return useQuery({
    queryKey: ['offices'],
    queryFn: usersApi.getOffices,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 429) return false;
      return failureCount < 2;
    },
  });
};

export const useRolesQuery = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: usersApi.getRoles,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 429) return false;
      return failureCount < 2;
    },
  });
};

export const useDepartmentsQuery = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: usersApi.getDepartments,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 429) return false;
      return failureCount < 2;
    },
  });
};

export const useSupervisorsQuery = () => {
  return useQuery({
    queryKey: ['supervisors'],
    queryFn: usersApi.getSupervisors,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 429) return false;
      return failureCount < 2;
    },
  });
};
