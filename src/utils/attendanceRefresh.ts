export const ATTENDANCE_REFRESH_EVENT = 'attendance:refresh';

export const dispatchAttendanceRefresh = (detail?: { userId?: string; action?: string }): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ATTENDANCE_REFRESH_EVENT, { detail }));
};

export const subscribeAttendanceRefresh = (handler: (detail?: { userId?: string; action?: string }) => void): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;

  const listener = (event: Event) => {
    const custom = event as CustomEvent<{ userId?: string; action?: string }>;
    handler(custom.detail);
  };

  window.addEventListener(ATTENDANCE_REFRESH_EVENT, listener);
  return () => window.removeEventListener(ATTENDANCE_REFRESH_EVENT, listener);
};
