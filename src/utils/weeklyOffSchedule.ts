import { getDay } from 'date-fns';

/** Sunday — matches backend DEFAULT_WEEKLY_OFF_DAYS when settings are unavailable. */
export const DEFAULT_WEEKLY_OFF_DAYS = [0];

export const isDateOnConfiguredWeeklyOff = (scheduledAt: string | Date, weeklyOffDays: number[]): boolean => {
  if (!weeklyOffDays.length) return false;

  const date = typeof scheduledAt === 'string' ? new Date(scheduledAt) : scheduledAt;
  if (Number.isNaN(date.getTime())) return false;

  return weeklyOffDays.includes(getDay(date));
};
