import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { OrganisationChartApiResponse } from './types';

const getOrganisationChart = async (includeInactive = false): Promise<OrganisationChartApiResponse> => {
  try {
    const response = await api.get('/admin/organisation-chart', {
      params: { includeInactive },
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status !== 404) throw error;

    const fallback = await api.get('/admin/organization-chart', {
      params: { includeInactive },
    });
    return fallback.data;
  }
};

export const useOrganisationChartQuery = (includeInactive = false) =>
  useQuery<OrganisationChartApiResponse, Error>({
    queryKey: ['organisation-chart', includeInactive],
    queryFn: () => getOrganisationChart(includeInactive),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    },
  });
