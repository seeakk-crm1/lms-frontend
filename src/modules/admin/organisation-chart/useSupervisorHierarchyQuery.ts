import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { OrganisationChartApiResponse } from './types';

const getSupervisorHierarchy = async (includeInactive = false): Promise<OrganisationChartApiResponse> => {
  const response = await api.get('/admin/organisation-chart/supervisor-tree', {
    params: { includeInactive },
  });
  return response.data;
};

export const useSupervisorHierarchyQuery = (includeInactive = false) =>
  useQuery<OrganisationChartApiResponse, Error>({
    queryKey: ['supervisor-hierarchy', includeInactive],
    queryFn: () => getSupervisorHierarchy(includeInactive),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    },
  });
