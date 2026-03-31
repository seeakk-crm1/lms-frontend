import api from './api';
import { getUsers } from './users.api';
import type {
  CalendarQueryParams,
  CalendarResponse,
  CompleteFollowUpInput,
  CreateFollowUpInput,
  FollowUp,
  FollowUpHistoryResponse,
  FollowUpUserOption,
  TodayFollowUpsResponse,
} from '../types/followup.types';

export const getCalendarData = async (params: CalendarQueryParams) => {
  const response = await api.get<CalendarResponse>('/followups/calendar', { params });
  return response.data;
};

export const getTodayFollowUps = async (userId?: string) => {
  const response = await api.get<TodayFollowUpsResponse>('/followups/today', {
    params: userId ? { userId } : undefined,
  });
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
