import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import type { ReportFilterState } from './reportFilterDefaults';

export const useReportUsers = () =>
  useQuery({
    queryKey: ['reports-users-list'],
    queryFn: async () => {
      const res = await api.get('/admin/users', { params: { limit: 500 } });
      const payload = res.data?.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.users)) return payload.users;
      if (Array.isArray(res.data?.users)) return res.data.users;
      return [];
    },
  });

export const resolveFilteredUserIds = (
  users: any[],
  filters: ReportFilterState,
): string[] | undefined => {
  const safeUsers = Array.isArray(users) ? users : [];
  let filtered = [...safeUsers];

  if (filters.role) {
    filtered = filtered.filter((user) => user.role?.id === filters.role || user.role?.name === filters.role);
  }
  if (filters.departmentId) {
    filtered = filtered.filter((user) => user.department?.id === filters.departmentId || user.departmentId === filters.departmentId);
  }
  if (filters.branchId) {
    filtered = filtered.filter((user) => user.office?.id === filters.branchId || user.officeId === filters.branchId);
  }
  if (filters.supervisorId) {
    filtered = filtered.filter((user) => user.supervisorId === filters.supervisorId);
  }

  if (filters.userMode === 'single' && typeof filters.userId === 'string') {
    return [filters.userId];
  }

  if (filters.userMode === 'multiple' && Array.isArray(filters.userId)) {
    return filters.userId;
  }

  if (filters.userMode === 'all') {
    if (
      filters.role ||
      filters.departmentId ||
      filters.branchId ||
      filters.supervisorId
    ) {
      return filtered.map((user) => user.id);
    }
    return undefined;
  }

  if (typeof filters.userId === 'string') return [filters.userId];
  if (Array.isArray(filters.userId) && filters.userId.length > 0) return filters.userId;
  return undefined;
};

export const buildApiFilters = (filters: ReportFilterState, users: any[] = []) => {
  const userIds = resolveFilteredUserIds(users, filters);
  return {
    ...filters,
    userId: userIds?.length === 1 ? userIds[0] : userIds,
    page: filters.page || 1,
    limit: filters.limit || 20,
  };
};

export const useReportMetaOptions = () => {
  const usersQuery = useReportUsers();

  const roleOptions = useMemo(() => {
    const map = new Map<string, string>();
    (usersQuery.data || []).forEach((user: any) => {
      if (user.role?.id) map.set(user.role.id, user.role.name || user.role.id);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [usersQuery.data]);

  const departmentOptions = useMemo(() => {
    const map = new Map<string, string>();
    (usersQuery.data || []).forEach((user: any) => {
      if (user.department?.id) map.set(user.department.id, user.department.name || user.department.id);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [usersQuery.data]);

  const branchOptions = useMemo(() => {
    const map = new Map<string, string>();
    (usersQuery.data || []).forEach((user: any) => {
      if (user.office?.id) map.set(user.office.id, user.office.name || user.office.id);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [usersQuery.data]);

  const supervisorOptions = useMemo(() => {
    const map = new Map<string, string>();
    (usersQuery.data || []).forEach((user: any) => {
      if (user.id && user.name) map.set(user.id, user.name);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [usersQuery.data]);

  const userOptions = useMemo(
    () => (usersQuery.data || []).map((user: any) => ({ value: user.id, label: user.name || user.email })),
    [usersQuery.data],
  );

  return {
    users: usersQuery.data || [],
    userOptions,
    roleOptions,
    departmentOptions,
    branchOptions,
    supervisorOptions,
    isLoading: usersQuery.isLoading,
  };
};
