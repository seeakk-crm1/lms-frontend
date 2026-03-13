import { useQuery } from '@tanstack/react-query';
import * as usersApi from '../services/users.api';
import { useUsersStore } from '../store/useUsersStore';

export const useUsersQuery = () => {
  const { search, filters, page, limit } = useUsersStore();

  return useQuery({
    queryKey: ['users', { search, ...filters, page, limit }],
    queryFn: () => usersApi.getUsers({ search, ...filters, page, limit }),
    placeholderData: (previousData) => previousData,
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
  });
};

export const useAllLocationsQuery = () => {
  return useQuery({
    queryKey: ['locations-all'],
    queryFn: usersApi.getAllLocations,
  });
};

export const useOfficesQuery = () => {
  return useQuery({
    queryKey: ['offices'],
    queryFn: usersApi.getOffices,
  });
};

export const useRolesQuery = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: usersApi.getRoles,
  });
};

export const useDepartmentsQuery = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: usersApi.getDepartments,
  });
};

export const useSupervisorsQuery = () => {
  return useQuery({
    queryKey: ['supervisors'],
    queryFn: usersApi.getSupervisors,
  });
};
