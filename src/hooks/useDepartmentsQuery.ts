import { useQuery } from '@tanstack/react-query';
import { getDepartments, getActiveDepartments } from '../services/department.api';
import useDepartmentStore from '../store/useDepartmentStore';

export const useDepartmentsQuery = () => {
  const { filters, pagination } = useDepartmentStore();

  return useQuery({
    queryKey: ['departments', filters, pagination.page, pagination.limit],
    queryFn: () => getDepartments({ ...filters, page: pagination.page, limit: pagination.limit }),
  });
};

export const useActiveDepartmentsQuery = () => {
  return useQuery({
    queryKey: ['departments', 'active'],
    queryFn: getActiveDepartments,
  });
};
