import api from './api';
import { getLeads } from './leads.api';
import { getUsers } from './users.api';
import type {
  CalendarQueryParams,
  CalendarResponse,
  CompleteFollowUpInput,
  CreateFollowUpInput,
  FollowUp,
  FollowUpReminderAlertsResponse,
  FollowUpLeadOption,
  FollowUpHistoryResponse,
  SnoozeFollowUpInput,
  FollowUpUserOption,
  TodayFollowUpsResponse,
} from '../types/followup.types';

export const getCalendarData = async (params: CalendarQueryParams) => {
  const response = await api.get<CalendarResponse>('/followups/calendar', { params });
  return response.data;
};

export const getAdvancedCalendarSummary = async (params: { startDate: string; endDate: string; userId?: string }) => {
  const response = await api.get<import('../types/followup.types').AdvancedCalendarSummaryResponse>(
    '/followups/calendar/advanced/summary',
    { params },
  );
  return response.data;
};

export const getOverdueMandatoryFollowUps = async () => {
  const response = await api.get<import('../types/followup.types').OverdueMandatoryFollowUpResponse>(
    '/followups/overdue-mandatory',
  );
  return response.data;
};

export const getAdvancedCalendarDetails = async (params: {
  date: string;
  type: string;
  stageId?: string;
  userId?: string;
  page?: number;
  limit?: number;
  overdueExtendedOnly?: boolean;
}) => {
  const response = await api.get<import('../types/followup.types').AdvancedCalendarDetailsResponse>(
    '/followups/calendar/advanced/details',
    { params },
  );
  return response.data;
};

export const getTodayFollowUps = async (userId?: string) => {
  const response = await api.get<TodayFollowUpsResponse>('/followups/today', {
    params: userId ? { userId } : undefined,
  });
  return response.data;
};

export const getLifecycleExtensionLimit = async (leadId: string) => {
  const response = await api.get<import('../types/followup.types').LifecycleExtensionLimitResponse>(
    '/followups/lifecycle-extension-limit',
    { params: { leadId } },
  );
  return response.data;
};

export const getMandatoryFollowUpContinuation = async () => {
  const response = await api.get<import('../types/mandatoryFollowup.types').MandatoryFollowUpContinuationResponse>(
    '/followups/mandatory-continuation',
  );
  return response.data;
};

export const saveMandatoryFollowUpContinuation = async (
  payload: import('../types/mandatoryFollowup.types').SaveMandatoryFollowUpContinuationInput,
) => {
  const response = await api.post<import('../types/mandatoryFollowup.types').SaveMandatoryFollowUpContinuationResponse>(
    '/followups/mandatory-continuation',
    payload,
  );
  return response.data;
};

export const getFollowUpReminderAlerts = async (params?: {
  userId?: string;
  minutesAhead?: number;
  includePastMinutes?: number;
}) => {
  const response = await api.get<FollowUpReminderAlertsResponse>('/followups/alerts', { params });
  return response.data;
};

export const createFollowUp = async (payload: CreateFollowUpInput) => {
  const response = await api.post<{ success: boolean; message: string; data: FollowUp }>('/followups', payload);
  return response.data;
};

export const completeFollowUp = async (id: string, payload: CompleteFollowUpInput) => {
  const response = await api.post<{ success: boolean; message: string; data: FollowUp }>(
    `/followups/${id}/complete`,
    payload,
  );
  return response.data;
};

export const snoozeFollowUp = async (id: string, payload: SnoozeFollowUpInput) => {
  const response = await api.patch<{ success: boolean; message: string; data: FollowUp }>(
    `/followups/${id}/snooze`,
    payload,
  );
  return response.data;
};

export const getFollowUpHistory = async (params: {
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get<FollowUpHistoryResponse>('/followups/history', { params });
  return response.data;
};

export const getFollowUpUsers = async (): Promise<FollowUpUserOption[]> => {
  const response = await getUsers({ page: 1, limit: 100, isActive: true });
  const users = response?.users || [];
  return users.map((user: any) => ({
    id: user.id,
    label: user.name || user.username || user.email,
  }));
};

export const getFollowUpLeads = async (): Promise<FollowUpLeadOption[]> => {
  const response = await getLeads({
    page: 1,
    limit: 200,
    status: 'ACTIVE',
  });

  const leads = response?.leads || [];
  return leads.map((lead: any) => ({
    id: lead.id,
    label: lead.name || lead.email || lead.phone || lead.id,
    subtitle: [lead.email, lead.phone].filter(Boolean).join(' • ') || undefined,
  }));
};
