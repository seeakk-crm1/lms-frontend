import { useQuery } from '@tanstack/react-query';
import { getRoles, getRoleById, getPermissions } from '../services/role.api';
import useRoleStore from '../store/useRoleStore';

export const useRolesQuery = () => {
  const { filters, pagination } = useRoleStore();

  return useQuery({
    queryKey: ['roles', filters, pagination.page, pagination.limit],
    queryFn: () => getRoles({ ...filters, page: pagination.page, limit: pagination.limit }),
  });
};

export const useRoleDetailsQuery = (id: string | null) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => getRoleById(id!),
    enabled: !!id,
  });
};

export const usePermissionsQuery = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
    staleTime: Infinity, // Permissions rarely change
  });
};
