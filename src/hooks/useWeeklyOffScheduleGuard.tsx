import { useCallback, useRef, useState } from 'react';
import WeeklyOffScheduleConfirmModal from '../components/calendar/WeeklyOffScheduleConfirmModal';
import { DEFAULT_WEEKLY_OFF_DAYS, isDateOnConfiguredWeeklyOff } from '../utils/weeklyOffSchedule';
import { useWeeklyOffSettingsQuery } from './useHolidays';

export const useWeeklyOffScheduleGuard = () => {
  const { data: settings } = useWeeklyOffSettingsQuery();
  const weeklyOffDays = settings?.weeklyOffDays?.length ? settings.weeklyOffDays : DEFAULT_WEEKLY_OFF_DAYS;
  const [isOpen, setIsOpen] = useState(false);
  const resolverRef = useRef<((proceed: boolean) => void) | null>(null);

  const confirmIfWeeklyOff = useCallback(
    (scheduledAt: string | Date): Promise<boolean> => {
      if (!isDateOnConfiguredWeeklyOff(scheduledAt, weeklyOffDays)) {
        return Promise.resolve(true);
      }

      return new Promise((resolve) => {
        resolverRef.current = resolve;
        setIsOpen(true);
      });
    },
    [weeklyOffDays],
  );

  const closeWith = useCallback((proceed: boolean) => {
    setIsOpen(false);
    resolverRef.current?.(proceed);
    resolverRef.current = null;
  }, []);

  const WeeklyOffScheduleModal = (
    <WeeklyOffScheduleConfirmModal
      isOpen={isOpen}
      onContinue={() => closeWith(true)}
      onChangeDate={() => closeWith(false)}
    />
  );

  return { confirmIfWeeklyOff, WeeklyOffScheduleModal };
};
