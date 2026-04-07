import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as holidaysApi from '../services/holidays.api';

const shouldRetry = (failureCount: number, error: any) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403 || status === 404 || status === 422 || status === 503) {
    return false;
  }
  return failureCount < 2;
};

export const useHolidaysQuery = () =>
  useQuery({
    queryKey: ['holidays'],
    queryFn: holidaysApi.getHolidays,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: shouldRetry,
  });

export const useHolidayCalendarQuery = (month: string) =>
  useQuery({
    queryKey: ['holidays', 'calendar', month],
    queryFn: () => holidaysApi.getHolidayCalendar(month),
    enabled: Boolean(month),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: shouldRetry,
  });

export const useCreateHolidayMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: holidaysApi.createHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendar'] });
    },
  });
};

export const useUpdateHolidayMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<holidaysApi.HolidayPayload> }) =>
      holidaysApi.updateHoliday(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendar'] });
    },
  });
};

export const useDeleteHolidayMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: holidaysApi.deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendar'] });
    },
  });
};

export const useSyncHolidayMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: holidaysApi.syncGoogleHolidays,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendar'] });
    },
  });
};

export const useSuggestHolidayMutation = () =>
  useMutation({
    mutationFn: holidaysApi.suggestHolidays,
  });
