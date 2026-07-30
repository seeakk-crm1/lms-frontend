import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { OrganisationChartApiResponse } from './types';

const getOrganisationChart = async (includeInactive = false): Promise<OrganisationChartApiResponse> => {
  try {
    const response = await api.get('/admin/organisation-chart', {
      params: { includeInactive },
    });
    console.log('[Organisation Chart Frontend] API Response Received:', response.data);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status !== 404) throw error;

    const fallback = await api.get('/admin/organization-chart', {
      params: { includeInactive },
    });
    console.log('[Organisation Chart Frontend] Fallback Response Received:', fallback.data);
    return fallback.data;
  }
};

export const useOrganisationChartQuery = (includeInactive = false) =>
  useQuery<OrganisationChartApiResponse, Error>({
    queryKey: ['organisation-chart', includeInactive],
    queryFn: () => getOrganisationChart(includeInactive),
    staleTime: 0,
    gcTime: 60_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    },
  });
