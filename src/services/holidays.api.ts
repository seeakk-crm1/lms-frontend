import api from './api';

export type HolidayStatus = 'ACTIVE' | 'INACTIVE';
export type HolidaySource = 'MANUAL' | 'API' | 'AI' | 'GOOGLE';

export interface HolidayRecord {
  id: string;
  name: string;
  holidayDate: string;
  countryId?: string | null;
  stateId?: string | null;
  districtId?: string | null;
  isRecurring: boolean;
  recurrenceRule?: string | null;
  source: HolidaySource;
  status: HolidayStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HolidayCalendarItem {
  date: string;
  title: string;
  type: 'HOLIDAY';
  source: HolidaySource;
}

export interface HolidayPayload {
  name: string;
  holidayDate: string;
  countryId?: string;
  stateId?: string;
  districtId?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  status?: HolidayStatus;
}

export const getHolidays = async (): Promise<HolidayRecord[]> => {
  const { data } = await api.get('/holidays');
  return data?.data?.holidays || [];
};

export const getHolidayCalendar = async (month: string): Promise<HolidayCalendarItem[]> => {
  const { data } = await api.get('/holidays/calendar', { params: { month } });
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

export const syncGoogleHolidays = async () => {
  const { data } = await api.post('/holidays/sync');
  return data?.data;
};

export const suggestHolidays = async (country: string) => {
  const { data } = await api.post('/holidays/ai-suggest', { country });
  return data?.data?.suggestions || [];
};
