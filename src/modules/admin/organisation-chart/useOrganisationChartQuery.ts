import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { getUsers } from '../../../services/users.api';
import { OrganisationChartApiResponse, OrganisationUserDirectoryEntry } from './types';

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

const getNestedName = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'name' in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === 'string' && name.trim() ? name.trim() : null;
  }
  return null;
};

const getOrganisationUserDirectory = async (includeInactive = false): Promise<Record<string, OrganisationUserDirectoryEntry>> => {
  const directory: Record<string, OrganisationUserDirectoryEntry> = {};
  let page = 1;
  let totalPages = 1;

  do {
    const payload = await getUsers({
      page,
      limit: 100,
      ...(includeInactive ? {} : { isActive: true }),
    });
    const users = payload?.users || [];
    users.forEach((user: any) => {
      directory[user.id] = {
        id: user.id,
        employeeId: user.employeeId || user.employeeCode || user.staffId || null,
        designation: user.designation || user.jobTitle || user.title || null,
        office: getNestedName(user.office),
        avatarUrl: user.avatarUrl || user.profileImageUrl || user.photoUrl || null,
      };
    });

    totalPages = payload?.pagination?.totalPages || page;
    page += 1;
  } while (page <= totalPages && page <= 100);

  return directory;
};

export const useOrganisationUserDirectoryQuery = (includeInactive = false) =>
  useQuery<Record<string, OrganisationUserDirectoryEntry>, Error>({
    queryKey: ['organisation-chart-user-directory', includeInactive],
    queryFn: () => getOrganisationUserDirectory(includeInactive),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    },
  });
