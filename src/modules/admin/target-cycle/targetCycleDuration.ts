import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import type { PerformanceTargetCyclePayload } from './PerformanceTargetCycleForm';

const inclusiveDays = (start: Date, end: Date) => {
  const s = startOfDay(start);
  const e = startOfDay(end);
  if (e < s) return 0;
  return differenceInCalendarDays(e, s) + 1;
};

const countWeeksInMonth = (monthStart: Date): number => {
  const monthEnd = endOfMonth(monthStart);
  let cursor = startOfDay(monthStart);
  let weeks = 0;
  while (cursor <= monthEnd && weeks < 6) {
    const weekEnd = endOfDay(addDays(cursor, 6));
    const cappedEnd = weekEnd > monthEnd ? endOfDay(monthEnd) : weekEnd;
    cursor = startOfDay(addDays(cappedEnd, 1));
    weeks += 1;
    if (cursor > monthEnd) break;
  }
  return weeks;
};

export const countPeriodSlots = (input: {
  targetType: PerformanceTargetCyclePayload['targetType'];
  startDate: string;
  numberOfMonths?: number;
}): number => {
  const start = startOfDay(new Date(input.startDate));
  const months =
    input.targetType === 'SEMI_ANNUAL'
      ? 6
      : Math.max(1, input.numberOfMonths || (input.targetType === 'MONTHLY' || input.targetType === 'WEEKLY' ? 12 : 1));

  if (input.targetType === 'SEMI_ANNUAL') return 6;
  if (input.targetType === 'MONTHLY') return months;
  if (input.targetType === 'WEEKLY') {
    let slots = 0;
    for (let i = 0; i < months; i += 1) {
      slots += countWeeksInMonth(startOfMonth(addMonths(start, i)));
    }
    return slots;
  }
  return 0;
};

export const previewTotalTargetDays = (input: {
  targetType: PerformanceTargetCyclePayload['targetType'];
  startDate: string;
  numberOfMonths?: number;
  manualPeriods?: Array<{ startDate: string; endDate: string }>;
}): number => {
  if (input.targetType === 'MANUAL' && input.manualPeriods?.length) {
    return input.manualPeriods.reduce(
      (sum, period) => sum + inclusiveDays(new Date(period.startDate), new Date(period.endDate)),
      0,
    );
  }

  const start = startOfDay(new Date(input.startDate));
  const months =
    input.targetType === 'SEMI_ANNUAL'
      ? 6
      : Math.max(1, input.numberOfMonths || 12);

  if (input.targetType === 'MONTHLY' || input.targetType === 'SEMI_ANNUAL') {
    const spanMonths = input.targetType === 'SEMI_ANNUAL' ? 6 : months;
    const first = startOfMonth(start);
    const last = endOfMonth(addMonths(start, spanMonths - 1));
    return inclusiveDays(first, last);
  }

  if (input.targetType === 'WEEKLY') {
    let total = 0;
    for (let i = 0; i < months; i += 1) {
      const monthStart = startOfMonth(addMonths(start, i));
      const monthEnd = endOfMonth(monthStart);
      total += inclusiveDays(monthStart, monthEnd);
    }
    return total;
  }

  return 0;
};

export const periodSlotLabel = (
  targetType: PerformanceTargetCyclePayload['targetType'],
  startDate: string,
  index: number,
): string => {
  const start = startOfDay(new Date(startDate));
  if (targetType === 'WEEKLY') {
    let offset = 0;
    let monthIndex = 0;
    while (monthIndex < 24) {
      const weeks = countWeeksInMonth(startOfMonth(addMonths(start, monthIndex)));
      if (index < offset + weeks) {
        const label = format(startOfMonth(addMonths(start, monthIndex)), 'MMM yyyy');
        return `${label} W${index - offset + 1}`;
      }
      offset += weeks;
      monthIndex += 1;
    }
    return `Week ${index + 1}`;
  }
  if (targetType === 'SEMI_ANNUAL') {
    return format(startOfMonth(addMonths(start, index)), 'MMMM yyyy');
  }
  return format(startOfMonth(addMonths(start, index)), 'MMMM yyyy');
};

export interface GeneratedPeriod {
  label: string;
  periodIndex: number;
  startDate: string;
  endDate: string;
  lockingDate: string;
}

export const generatePeriods = (input: {
  targetType: 'WEEKLY' | 'MONTHLY' | 'SEMI_ANNUAL';
  startDate: string;
  numberOfMonths?: number;
}): GeneratedPeriod[] => {
  const start = startOfDay(new Date(input.startDate));
  const months = input.targetType === 'SEMI_ANNUAL' ? 6 : Math.max(1, input.numberOfMonths || 12);
  const periods: GeneratedPeriod[] = [];

  if (input.targetType === 'MONTHLY' || input.targetType === 'SEMI_ANNUAL') {
    for (let i = 0; i < months; i += 1) {
      const monthStart = startOfMonth(addMonths(start, i));
      const monthEnd = endOfMonth(monthStart);
      periods.push({
        label: format(monthStart, 'MMMM yyyy'),
        periodIndex: i,
        startDate: format(monthStart, 'yyyy-MM-dd'),
        endDate: format(monthEnd, 'yyyy-MM-dd'),
        lockingDate: format(monthEnd, 'yyyy-MM-dd'),
      });
    }
  } else if (input.targetType === 'WEEKLY') {
    let globalIndex = 0;
    for (let i = 0; i < months; i += 1) {
      const monthStart = startOfMonth(addMonths(start, i));
      const monthEnd = endOfMonth(monthStart);
      let cursor = startOfDay(monthStart);
      let weekNum = 0;
      while (cursor <= monthEnd && weekNum < 6) {
        const weekEnd = endOfDay(addDays(cursor, 6));
        const cappedEnd = weekEnd > monthEnd ? endOfDay(monthEnd) : weekEnd;
        periods.push({
          label: `${format(monthStart, 'MMM yyyy')} · Week ${weekNum + 1}`,
          periodIndex: globalIndex,
          startDate: format(cursor, 'yyyy-MM-dd'),
          endDate: format(cappedEnd, 'yyyy-MM-dd'),
          lockingDate: format(cappedEnd, 'yyyy-MM-dd'),
        });
        cursor = startOfDay(addDays(cappedEnd, 1));
        weekNum += 1;
        globalIndex += 1;
        if (cursor > monthEnd) break;
      }
    }
  }

  return periods;
};
