import useWorkspaceStore from '../store/useWorkspaceStore';

export const getResolvedAttendanceTimezone = (overrideTimeZone?: string): string => {
  if (overrideTimeZone && overrideTimeZone.trim()) {
    return overrideTimeZone;
  }
  const workspaceTz = useWorkspaceStore.getState().timeZone;
  if (workspaceTz && workspaceTz !== 'UTC') {
    return workspaceTz;
  }
  try {
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTz) return browserTz;
  } catch {
    // fallback
  }
  return workspaceTz || 'Asia/Kolkata';
};

/**
 * Format timestamp into 12-hour time (e.g. "01:09 PM") respecting configured timezone.
 */
export const formatAttendanceTime = (
  dateInput?: string | Date | null,
  overrideTimeZone?: string,
): string => {
  if (!dateInput) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '—';

  const timeZone = getResolvedAttendanceTimezone(overrideTimeZone);

  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }
};

/**
 * Format timestamp into Date string (e.g. "25 Aug 2026") respecting configured timezone.
 */
export const formatAttendanceDate = (
  dateInput?: string | Date | null,
  overrideTimeZone?: string,
): string => {
  if (!dateInput) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '—';

  const timeZone = getResolvedAttendanceTimezone(overrideTimeZone);

  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
};

/**
 * Format timestamp into Full DateTime string (e.g. "25 Aug 2026, 01:09 PM") respecting configured timezone.
 */
export const formatAttendanceDateTime = (
  dateInput?: string | Date | null,
  overrideTimeZone?: string,
): string => {
  if (!dateInput) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '—';

  const timeZone = getResolvedAttendanceTimezone(overrideTimeZone);

  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }
};
