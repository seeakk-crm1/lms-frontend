import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endOfDay, endOfMonth, endOfWeek, formatISO, parseISO, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { toast } from 'react-hot-toast';
import useFollowupStore from '../store/followupStore';
import {
  completeFollowUp,
  createFollowUp,
  getCalendarData,
  getFollowUpReminderAlerts,
  getFollowUpLeads,
  snoozeFollowUp,
  getFollowUpUsers,
  getTodayFollowUps,
} from '../services/followupService';
import type { CalendarQueryParams, CompleteFollowUpInput, CreateFollowUpInput, FollowUp, SnoozeFollowUpInput } from '../types/followup.types';

const buildDateRange = (view: 'month' | 'week' | 'day' | 'list', selectedDate: string) => {
  const baseDate = parseISO(selectedDate);

  if (view === 'day') {
    return {
      startDate: formatISO(startOfDay(baseDate)),
      endDate: formatISO(endOfDay(baseDate)),
    };
  }

  if (view === 'week') {
    return {
      startDate: formatISO(startOfWeek(baseDate, { weekStartsOn: 1 })),
      endDate: formatISO(endOfWeek(baseDate, { weekStartsOn: 1 })),
    };
  }

  if (view === 'list') {
    const start = startOfWeek(baseDate, { weekStartsOn: 1 });
    return {
      startDate: formatISO(start),
      endDate: formatISO(endOfWeek(endOfMonth(baseDate), { weekStartsOn: 1 })),
    };
  }

  return {
    startDate: formatISO(startOfWeek(startOfMonth(baseDate), { weekStartsOn: 1 })),
    endDate: formatISO(endOfWeek(endOfMonth(baseDate), { weekStartsOn: 1 })),
  };
};

export const useCalendarQuery = () => {
  const { view, selectedDate, selectedUser } = useFollowupStore();

  const params = useMemo<CalendarQueryParams>(() => {
    const range = buildDateRange(view, selectedDate);
    return {
      view,
      ...range,
      ...(selectedUser ? { userId: selectedUser } : {}),
    };
  }, [selectedDate, selectedUser, view]);

  return useQuery({
    queryKey: ['followups', 'calendar', params],
    queryFn: () => getCalendarData(params),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 422 || status === 503) return false;
      return failureCount < 2;
    },
  });
};

export const useTodayFollowUpsQuery = () => {
  const { selectedUser } = useFollowupStore();

  return useQuery({
    queryKey: ['followups', 'today', selectedUser],
    queryFn: () => getTodayFollowUps(selectedUser || undefined),
    staleTime: 30_000,
    gcTime: 180_000,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 422 || status === 503) return false;
      return failureCount < 2;
    },
  });
};

export const useFollowUpReminderAlertsQuery = () => {
  const { selectedUser } = useFollowupStore();

  return useQuery({
    queryKey: ['followups', 'alerts', selectedUser],
    queryFn: () =>
      getFollowUpReminderAlerts({
        ...(selectedUser ? { userId: selectedUser } : {}),
        minutesAhead: 15,
        includePastMinutes: 5,
      }),
    staleTime: 20_000,
    gcTime: 120_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 422 || status === 503) return false;
      return failureCount < 2;
    },
  });
};

export const useFollowUpUsersQuery = () =>
  useQuery({
    queryKey: ['followups', 'users'],
    queryFn: getFollowUpUsers,
    staleTime: 300_000,
    gcTime: 600_000,
    refetchOnWindowFocus: false,
  });

export const useFollowUpLeadsQuery = () =>
  useQuery({
    queryKey: ['followups', 'leads'],
    queryFn: getFollowUpLeads,
    staleTime: 120_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
  });

export const useCreateFollowUpMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFollowUpInput) => createFollowUp(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups', 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'today'] });
      toast.success('Follow-up scheduled');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to schedule follow-up');
    },
  });
};

export const useCompleteFollowUpMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CompleteFollowUpInput }) => completeFollowUp(id, payload),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['followups', 'today'] });
      const previousToday = queryClient.getQueriesData({ queryKey: ['followups', 'today'] });

      queryClient.setQueriesData<{ data: { items: FollowUp[] } }>({ queryKey: ['followups', 'today'] }, (oldData) => {
        if (!oldData?.data?.items) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            items: oldData.data.items.filter((item) => item.id !== id),
          },
        };
      });

      return { previousToday };
    },
    onError: (error: any, _variables, context) => {
      context?.previousToday?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error(error?.response?.data?.message || 'Failed to complete follow-up');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups', 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'history'] });
      toast.success('Follow-up completed');
    },
  });
};

export const useSnoozeFollowUpMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SnoozeFollowUpInput }) => snoozeFollowUp(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups', 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'alerts'] });
      toast.success('Follow-up snoozed');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to snooze follow-up');
    },
  });
};
