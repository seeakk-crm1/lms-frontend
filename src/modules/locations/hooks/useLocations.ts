import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  configureLocationLevels,
  createCountry,
  createLocation,
  deleteCountry,
  deleteLocation,
  getCountries,
  getLocationLevels,
  getLocations,
  type ConfigureLevelsPayload,
  type CreateCountryPayload,
  type CreateLocationPayload,
  type ListCountriesParams,
  type ListLocationsParams,
  type UpdateCountryPayload,
  type UpdateLocationPayload,
  updateCountry,
  updateLocation,
} from '../../../services/locations.api';

export const useCountriesQuery = (params: ListCountriesParams) =>
  useQuery({
    queryKey: ['locations', 'countries', params],
    queryFn: () => getCountries(params),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const responseStatus = error?.response?.status;
      if (responseStatus === 401 || responseStatus === 403 || responseStatus === 422) return false;
      return failureCount < 1;
    },
  });

export const useCountryLevelsQuery = (countryId?: string) =>
  useQuery({
    queryKey: ['locations', 'levels', countryId],
    queryFn: () => getLocationLevels(countryId),
    enabled: Boolean(countryId),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

export const useLocationsQuery = (params: ListLocationsParams, enabled = true) =>
  useQuery({
    queryKey: ['locations', 'nodes', params],
    queryFn: () => getLocations(params),
    enabled,
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const responseStatus = error?.response?.status;
      if (responseStatus === 401 || responseStatus === 403 || responseStatus === 422) return false;
      return failureCount < 1;
    },
  });

export const useCreateCountryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCountryPayload) => createCountry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', 'countries'] });
    },
  });
};

export const useUpdateCountryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCountryPayload }) => updateCountry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', 'countries'] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'nodes'] });
    },
  });
};

export const useDeleteCountryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCountry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', 'countries'] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'levels'] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'nodes'] });
    },
  });
};

export const useConfigureLevelsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConfigureLevelsPayload) => configureLocationLevels(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: ['locations', 'levels', payload.countryId] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'nodes'] });
    },
  });
};

export const useCreateLocationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLocationPayload) => createLocation(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: ['locations', 'nodes'] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'levels', payload.countryId] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'countries'] });
    },
  });
};

export const useUpdateLocationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLocationPayload }) => updateLocation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', 'nodes'] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'countries'] });
    },
  });
};

export const useDeleteLocationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', 'nodes'] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'countries'] });
    },
  });
};
