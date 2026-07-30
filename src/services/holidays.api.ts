import api from './api';

export type HolidayStatus = 'ACTIVE' | 'INACTIVE';
export type HolidaySource = 'MANUAL' | 'API' | 'AI' | 'GOOGLE';

export interface AssignedOffice {
  id: string;
  name: string;
}

export interface HolidayRecord {
  id: string;
  name: string;
  holidayDate: string;
  color: string;
  offices?: AssignedOffice[];
  isRecurring: boolean;
  recurrenceRule?: string | null;
  source: HolidaySource;
  status: HolidayStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HolidayCalendarItem {
  date: string;
  color: string;
  title: string;
  type: 'HOLIDAY' | 'WEEKLY_OFF';
  source: HolidaySource | 'SYSTEM';
  offices?: AssignedOffice[];
}

export interface WeeklyOffSettings {
  weeklyOffDays: number[];
  weeklyOffColor: string;
}

export interface WeeklyOffSettingsPayload {
  weeklyOffDays: number[];
  weeklyOffColor: string;
}

export interface HolidayPayload {
  name: string;
  holidayDate: string;
  color?: string;
  officeIds: string[];
  isRecurring?: boolean;
  recurrenceRule?: string;
  status?: HolidayStatus;
}

export const getHolidays = async (): Promise<HolidayRecord[]> => {
  const { data } = await api.get('/holidays');
  return data?.data?.holidays || [];
};

export const getHolidayCalendar = async (month: string, officeIds?: string[]): Promise<HolidayCalendarItem[]> => {
  const params: Record<string, string> = { month };
  if (officeIds && officeIds.length > 0) {
    params.officeIds = officeIds.join(',');
  }
  const { data } = await api.get('/holidays/calendar', { params });
  return data?.data || [];
};

export const createHoliday = async (payload: HolidayPayload): Promise<HolidayRecord> => {
  const { data } = await api.post('/holidays', payload);
  return data?.data?.holiday;
};

export const updateHoliday = async (id: string, payload: Partial<HolidayPayload>): Promise<HolidayRecord> => {
  const { data } = await api.patch(`/holidays/${id}`, payload);
  return data?.data?.holiday;
};

export const deleteHoliday = async (id: string) => {
  const { data } = await api.delete(`/holidays/${id}`);
  return data;
};

export const getWeeklyOffSettings = async (): Promise<WeeklyOffSettings> => {
  const { data } = await api.get('/holidays/weekly-off');
  return data?.data;
};

export const updateWeeklyOffSettings = async (payload: WeeklyOffSettingsPayload): Promise<WeeklyOffSettings> => {
  const { data } = await api.put('/holidays/weekly-off', payload);
  return data?.data;
};

export const suggestHolidays = async (country: string) => {
  const { data } = await api.post('/holidays/ai-suggest', { country });
  return data?.data?.suggestions || [];
};
