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
 * Resolve check-in timestamp or string from any attendance record structure
 * (Approved, Pending Approval, Attendance Correction, Calendar Day, etc.)
 */
export const resolveAttendanceCheckIn = (record: any): string | Date | null => {
  if (!record) return null;
  return (
    record.checkInTime ??
    record.checkInAt ??
    record.requestedCheckInTime ??
    record.requestedCheckIn ??
    record.submittedCheckInTime ??
    record.submittedCheckIn ??
    record.checkIn ??
    record.record?.checkInTime ??
    record.approvalRequest?.checkInTime ??
    record.data?.checkInTime ??
    null
  );
};

/**
 * Resolve check-out timestamp or string from any attendance record structure
 * (Approved, Pending Approval, Attendance Correction, Calendar Day, etc.)
 */
export const resolveAttendanceCheckOut = (record: any): string | Date | null => {
  if (!record) return null;
  return (
    record.checkOutTime ??
    record.checkOutAt ??
    record.requestedCheckOutTime ??
    record.requestedCheckOut ??
    record.submittedCheckOutTime ??
    record.submittedCheckOut ??
    record.checkOut ??
    record.record?.checkOutTime ??
    record.approvalRequest?.checkOutTime ??
    record.data?.checkOutTime ??
    null
  );
};

/**
 * Format timestamp or time string into 12-hour time (e.g. "01:09 PM") respecting configured timezone.
 * Supports ISO strings, Date objects, and pre-formatted 12h/24h time strings.
 */
export const formatAttendanceTime = (
  dateInput?: string | Date | null,
  overrideTimeZone?: string,
): string => {
  if (!dateInput) return '—';

  // Handle pre-formatted time strings (e.g. "01:09 PM", "11:39 AM", "13:09")
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed) return '—';

    // 12-hour format e.g. "01:09 PM", "1:09 PM", "11:39 AM"
    const twelveHourMatch = trimmed.match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s?([AP]M)$/i);
    if (twelveHourMatch) {
      const hh = twelveHourMatch[1].padStart(2, '0');
      const mm = twelveHourMatch[2];
      const ampm = twelveHourMatch[3].toUpperCase();
      return `${hh}:${mm} ${ampm}`;
    }

    // 24-hour format e.g. "13:09", "09:00"
    const twentyFourHourMatch = trimmed.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
    if (twentyFourHourMatch) {
      let hours = parseInt(twentyFourHourMatch[1], 10);
      const minutes = twentyFourHourMatch[2];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    }
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (!date || isNaN(date.getTime())) return '—';

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

  // If time portion is a pre-formatted time, attempt to parse or fallback gracefully
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (/^(0?[1-9]|1[0-2]):([0-5][0-9])\s?([AP]M)$/i.test(trimmed)) {
      return trimmed;
    }
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (!date || isNaN(date.getTime())) return '—';

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
