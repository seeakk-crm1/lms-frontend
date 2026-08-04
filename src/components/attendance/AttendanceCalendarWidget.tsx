import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  Building2,
  Filter,
  RefreshCw,
  Clock,
  AlertCircle,
  X,
  Search,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import { hasPermission } from '../../utils/permission.util';
import * as attendanceApi from '../../services/attendance.api';

export interface CalendarDayDetail {
  date: string;
  dayOfWeek: string;
  dayNumber: number;
  status:
    | 'PRESENT'
    | 'LATE'
    | 'EARLY_CHECKOUT'
    | 'HALF_DAY'
    | 'ABSENT'
    | 'HOLIDAY'
    | 'LEAVE'
    | 'WEEKEND'
    | 'NO_ATTENDANCE';
  statusLabel: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHours: number;
  breakTimeMinutes: number;
  lateMinutes: number;
  earlyCheckoutMinutes: number;
  officeName: string | null;
  gpsStatus: 'VERIFIED' | 'OUTSIDE_RADIUS' | 'BYPASSED' | 'N/A';
  ipStatus: 'VERIFIED' | 'UNKNOWN_IP' | 'N/A';
  deviceInfo: string | null;
  approvedBy: string | null;
  approvalStatus: string | null;
  remarks: string | null;
  workSummary: string | null;
  achievements: string | null;
  pendingTasks: string | null;
  leaveDetails: {
    leaveType: string;
    reason: string;
    approvalStatus: string;
  } | null;
  holidayDetails: {
    name: string;
  } | null;
  recordId?: string | null;
}

export interface CalendarSummaryMetrics {
  totalDaysInMonth: number;
  workingDaysCount: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  halfDays: number;
  totalWorkingHours: number;
  avgCheckInTime: string;
  avgCheckOutTime: string;
  attendancePercentage: number;
}

export interface UserOptionItem {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  roleName: string;
  officeName: string;
  officeId?: string | null;
}

export interface OfficeOptionItem {
  id: string;
  name: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const YEAR_OPTIONS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

const STATUS_BADGE_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; iconBg: string; label: string }
> = {
  PRESENT: {
    bg: 'bg-emerald-50 text-emerald-700',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-500',
    label: 'Present',
  },
  LATE: {
    bg: 'bg-amber-50 text-amber-800',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconBg: 'bg-amber-500',
    label: 'Late Check-In',
  },
  EARLY_CHECKOUT: {
    bg: 'bg-orange-50 text-orange-800',
    border: 'border-orange-200',
    text: 'text-orange-800',
    iconBg: 'bg-orange-500',
    label: 'Early Check-Out',
  },
  HALF_DAY: {
    bg: 'bg-blue-50 text-blue-700',
    border: 'border-blue-200',
    text: 'text-blue-700',
    iconBg: 'bg-blue-500',
    label: 'Half Day',
  },
  ABSENT: {
    bg: 'bg-rose-50 text-rose-700',
    border: 'border-rose-200',
    text: 'text-rose-700',
    iconBg: 'bg-rose-500',
    label: 'Absent',
  },
  HOLIDAY: {
    bg: 'bg-cyan-50 text-cyan-800',
    border: 'border-cyan-200',
    text: 'text-cyan-800',
    iconBg: 'bg-cyan-500',
    label: 'Holiday',
  },
  LEAVE: {
    bg: 'bg-purple-50 text-purple-700',
    border: 'border-purple-200',
    text: 'text-purple-700',
    iconBg: 'bg-purple-500',
    label: 'Leave',
  },
  WORK_FROM_HOME: {
    bg: 'bg-indigo-50 text-indigo-700',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    iconBg: 'bg-indigo-500',
    label: 'Work From Home',
  },
  WEEKEND: {
    bg: 'bg-slate-100 text-slate-600',
    border: 'border-slate-200',
    text: 'text-slate-600',
    iconBg: 'bg-slate-500',
    label: 'Weekend',
  },
  NO_ATTENDANCE: {
    bg: 'bg-gray-50 text-gray-400',
    border: 'border-gray-200',
    text: 'text-gray-400',
    iconBg: 'bg-gray-300',
    label: 'Unmarked',
  },
};

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const AttendanceCalendarWidget: React.FC = () => {
  const { user } = useAuthStore();
  const permissions = user?.permissions || [];

  const userRoleName = (
    typeof user?.role === 'object' ? user?.role?.name || '' : (user?.role as string) || ''
  ).toUpperCase();

  const isSuperOrAdmin = userRoleName === 'SUPERADMIN' || userRoleName === 'ADMIN';

  const canViewAllCalendar =
    isSuperOrAdmin ||
    hasPermission(permissions, 'view_all_attendance_calendar') ||
    hasPermission(permissions, 'view_all_attendance');

  const canViewAssignedCalendar =
    canViewAllCalendar || hasPermission(permissions, 'view_assigned_attendance_calendar');

  const canViewOwnCalendarOnly = !canViewAllCalendar && !canViewAssignedCalendar;

  // Calendar Date State
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());

  // Filter States
  const [selectedUserId, setSelectedUserId] = useState<string>(user?.id || '');
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Loaded Filter Options & Loading States
  const [officeOptions, setOfficeOptions] = useState<OfficeOptionItem[]>([]);
  const [loadingOffices, setLoadingOffices] = useState<boolean>(false);
  const [officesError, setOfficesError] = useState<string | null>(null);

  const [userOptions, setUserOptions] = useState<UserOptionItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Searchable User Select Dropdown state
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Response Data State
  const [calendarData, setCalendarData] = useState<{
    user: any;
    summary: CalendarSummaryMetrics;
    days: CalendarDayDetail[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Day Details Popup Modal State
  const [selectedDayPopup, setSelectedDayPopup] = useState<CalendarDayDetail | null>(null);

  // Outside Click Listener for User Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Fetch Permitted Offices
  const fetchOffices = async () => {
    setLoadingOffices(true);
    setOfficesError(null);
    console.log('[Attendance Calendar] Loading Offices');

    try {
      const res = await attendanceApi.getCalendarOffices();
      const offices: OfficeOptionItem[] = res?.data || [];
      setOfficeOptions(offices);
      console.log('[Attendance Calendar] Offices Loaded:', offices.length);
    } catch (err: any) {
      console.error('[Attendance Calendar] Failed to load offices:', err);
      setOfficesError('Unable to load offices.');
    } finally {
      setLoadingOffices(false);
    }
  };

  // 2. Fetch Permitted Users (depends on selectedOfficeId)
  const fetchUsers = async (officeId?: string) => {
    setLoadingUsers(true);
    setUsersError(null);
    console.log('[Attendance Calendar] Loading Users for office:', officeId || 'ALL');

    try {
      const res = await attendanceApi.getCalendarUsers({ officeId });
      const usersList: UserOptionItem[] = res?.data || [];
      setUserOptions(usersList);
      console.log('[Attendance Calendar] Users Loaded:', usersList.length);

      // Auto-select user if current selectedUserId is not in the newly loaded list
      if (usersList.length > 0) {
        const exists = usersList.some((u) => u.id === selectedUserId);
        if (!exists) {
          const defaultUser = usersList.find((u) => u.id === user?.id) || usersList[0];
          setSelectedUserId(defaultUser.id);
          console.log('[Attendance Calendar] User Selected:', defaultUser.id);
        }
      }
    } catch (err: any) {
      console.error('[Attendance Calendar] Failed to load users:', err);
      setUsersError('Unable to load users.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Initial Load of Offices and Users
  useEffect(() => {
    if (!canViewOwnCalendarOnly) {
      fetchOffices();
      fetchUsers(selectedOfficeId);
    } else if (user) {
      setUserOptions([
        {
          id: user.id,
          name: user.name || 'Self',
          email: user.email || '',
          profileImage: (user as any).avatar || (user as any).profileImage || null,
          roleName: userRoleName,
          officeName: (user as any).office?.name || 'HQ Office',
        },
      ]);
      setSelectedUserId(user.id);
    }
  }, [canViewOwnCalendarOnly]);

  // Handle Office Change (Office -> User Dependency)
  const handleOfficeChange = (newOfficeId: string) => {
    setSelectedOfficeId(newOfficeId);
    console.log('[Attendance Calendar] Office Selected:', newOfficeId || 'ALL');
    console.log('[Attendance Calendar] Reloading Users');
    fetchUsers(newOfficeId);
  };

  // Main Calendar Fetch Effect
  const fetchCalendar = async () => {
    setLoading(true);
    setError(null);
    console.log(
      `[Attendance Calendar] Loading Calendar: month=${currentMonth}, year=${currentYear}, userId=${selectedUserId}, officeId=${selectedOfficeId}, status=${selectedStatusFilter}`,
    );

    try {
      const res = await attendanceApi.getAttendanceCalendar({
        userId: selectedUserId || user?.id,
        month: currentMonth,
        year: currentYear,
        officeId: selectedOfficeId || undefined,
        status: selectedStatusFilter !== 'ALL' ? selectedStatusFilter : undefined,
      });

      if (res?.data) {
        setCalendarData(res.data);
        console.log('[Attendance Calendar] Calendar Loaded');
      }
    } catch (err: any) {
      console.error('[Attendance Calendar] Failed to load calendar data:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to load attendance calendar.';

      // Keep previous data if available to prevent page crash
      if (!calendarData) {
        setError(errMsg);
      }
      toast.error('Failed to refresh calendar data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      fetchCalendar();
    }
  }, [currentMonth, currentYear, selectedUserId, selectedOfficeId]);

  // Handle User Change
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setIsUserDropdownOpen(false);
    console.log('[Attendance Calendar] User Selected:', userId);
  };

  // Handle Status Filter Change
  const handleStatusFilterChange = (newStatus: string) => {
    setSelectedStatusFilter(newStatus);
    console.log('[Attendance Calendar] Status Filter Changed:', newStatus);
    console.log('[Attendance Calendar] Calendar Filter Applied');
  };

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleTodayClick = () => {
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
  };

  // Day Click Handler
  const handleDayClick = (day: CalendarDayDetail) => {
    console.log('[Attendance Calendar] Attendance Popup Opened for date:', day.date);
    setSelectedDayPopup(day);
  };

  // Filtered Users List for Searchable Dropdown
  const filteredUserOptions = useMemo(() => {
    if (!userSearchTerm.trim()) return userOptions;
    const q = userSearchTerm.toLowerCase();
    return userOptions.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.roleName?.toLowerCase().includes(q) ||
        u.officeName?.toLowerCase().includes(q),
    );
  }, [userOptions, userSearchTerm]);

  // Currently Selected User Item
  const selectedUserItem = useMemo(() => {
    return userOptions.find((u) => u.id === selectedUserId) || userOptions[0] || null;
  }, [userOptions, selectedUserId]);

  // Calendar Grid Cells Computation (Padding days before 1st of month)
  const gridCells = useMemo<{ leadingSlots: number[]; days: CalendarDayDetail[] }>(() => {
    if (!calendarData?.days) return { leadingSlots: [], days: [] };

    const firstDayObj = new Date(currentYear, currentMonth - 1, 1);
    let firstDayOfWeek = firstDayObj.getDay() - 1;
    if (firstDayOfWeek < 0) firstDayOfWeek = 6;

    const emptyLeadingSlots = Array.from({ length: firstDayOfWeek }, (_, i) => i);

    return {
      leadingSlots: emptyLeadingSlots,
      days: calendarData.days,
    };
  }, [calendarData, currentYear, currentMonth]);

  // Status Filter Cell Check Helper
  const isDayStatusMatchingFilter = (day: CalendarDayDetail, filter: string): boolean => {
    if (filter === 'ALL') return true;
    if (filter === 'PRESENT') {
      return day.status === 'PRESENT' || day.status === 'LATE' || day.status === 'EARLY_CHECKOUT' || day.status === 'WORK_FROM_HOME';
    }
    return day.status === filter;
  };

  // Calculate Dynamic Summary Metrics based on status filter
  const summaryMetrics = useMemo<CalendarSummaryMetrics | null>(() => {
    if (!calendarData?.summary || !calendarData?.days) return null;

    if (selectedStatusFilter === 'ALL') {
      return calendarData.summary;
    }

    // Filtered Recalculation
    const matchingDays = calendarData.days.filter((d) => isDayStatusMatchingFilter(d, selectedStatusFilter));
    const matchingCount = matchingDays.length;

    let presentDays = 0;
    let absentDays = 0;
    let lateDays = 0;
    let leaveDays = 0;
    let halfDays = 0;
    let totalWorkingHours = 0;

    matchingDays.forEach((d) => {
      if (d.status === 'PRESENT' || d.status === 'EARLY_CHECKOUT' || d.status === 'WORK_FROM_HOME') presentDays++;
      if (d.status === 'LATE') {
        lateDays++;
        presentDays++;
      }
      if (d.status === 'ABSENT') absentDays++;
      if (d.status === 'LEAVE') leaveDays++;
      if (d.status === 'HALF_DAY') halfDays++;
      totalWorkingHours += d.workingHours || 0;
    });

    return {
      totalDaysInMonth: calendarData.summary.totalDaysInMonth,
      workingDaysCount: calendarData.summary.workingDaysCount,
      presentDays,
      absentDays,
      lateDays,
      leaveDays,
      halfDays,
      totalWorkingHours: Math.round(totalWorkingHours * 10) / 10,
      avgCheckInTime: matchingCount > 0 ? calendarData.summary.avgCheckInTime : '—',
      avgCheckOutTime: matchingCount > 0 ? calendarData.summary.avgCheckOutTime : '—',
      attendancePercentage:
        calendarData.summary.workingDaysCount > 0
          ? Math.min(100, Math.round(((presentDays + halfDays * 0.5) / calendarData.summary.workingDaysCount) * 100))
          : 0,
    };
  }, [calendarData, selectedStatusFilter]);

  const targetUserInfo = calendarData?.user;

  return (
    <div className="space-y-6">
      {/* 1. Header & Date Stepper Bar */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
            <CalendarIcon size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Attendance Calendar</h2>
            <p className="text-xs text-gray-400 font-medium">
              {targetUserInfo?.name
                ? `Viewing Attendance for ${targetUserInfo.name} (${targetUserInfo.roleName || 'Staff'})`
                : 'Monthly Employee Attendance & Performance Tracking'}
            </p>
          </div>
        </div>

        {/* Date Navigation & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleTodayClick}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-slate-200 cursor-pointer shadow-sm"
          >
            Today
          </button>

          {/* Month / Year Stepper */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white rounded-xl text-slate-700 transition-all cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-black text-slate-900 px-3 min-w-[130px] text-center">
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-white rounded-xl text-slate-700 transition-all cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Month Select */}
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          {/* Year Select */}
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchCalendar}
            disabled={loading}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-all cursor-pointer shadow-sm"
            title="Refresh Calendar"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Interactive Filter Controls Bar */}
      {!canViewOwnCalendarOnly && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Filter size={14} className="text-emerald-500" />
              <span>Attendance Filters</span>
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {canViewAllCalendar ? 'All Offices Scope' : 'Assigned Staff Scope'}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Office Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Office Location</label>
              {officesError ? (
                <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  <AlertCircle size={14} />
                  <span>{officesError}</span>
                  <button
                    type="button"
                    onClick={fetchOffices}
                    className="ml-auto text-[10px] underline font-bold"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedOfficeId}
                    onChange={(e) => handleOfficeChange(e.target.value)}
                    disabled={loadingOffices}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer appearance-none"
                  >
                    <option value="">All Offices</option>
                    {officeOptions.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.name}
                      </option>
                    ))}
                  </select>
                  <Building2 size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Custom Searchable Employee / User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Employee / User</label>
              {usersError ? (
                <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  <AlertCircle size={14} />
                  <span>{usersError}</span>
                  <button
                    type="button"
                    onClick={() => fetchUsers(selectedOfficeId)}
                    className="ml-auto text-[10px] underline font-bold"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  {/* Select Trigger Box */}
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                    disabled={loadingUsers}
                    className="w-full flex items-center justify-between pl-3 pr-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all cursor-pointer text-left shadow-sm"
                  >
                    {selectedUserItem ? (
                      <div className="flex items-center gap-2.5 min-w-0">
                        {selectedUserItem.profileImage ? (
                          <img
                            src={selectedUserItem.profileImage}
                            alt={selectedUserItem.name}
                            className="w-7 h-7 rounded-full object-cover border border-emerald-300 shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-xs">
                            {getInitials(selectedUserItem.name)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 truncate">
                            {selectedUserItem.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate font-medium">
                            {selectedUserItem.roleName} • {selectedUserItem.officeName}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-bold">Select Employee...</span>
                    )}

                    <ChevronDown size={14} className="text-slate-400 shrink-0 ml-2" />
                  </button>

                  {/* Dropdown Menu Popup */}
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute z-40 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl p-2.5 space-y-2 max-h-80 overflow-hidden flex flex-col"
                      >
                        {/* Search Input inside Dropdown */}
                        <div className="relative shrink-0">
                          <input
                            type="text"
                            placeholder="Search by name, email, or role..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            autoFocus
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                          {userSearchTerm && (
                            <button
                              type="button"
                              onClick={() => setUserSearchTerm('')}
                              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        {/* Options List */}
                        <div className="overflow-y-auto space-y-1 pr-1 flex-1">
                          {filteredUserOptions.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400">
                              No matching employees found.
                            </div>
                          ) : (
                            filteredUserOptions.map((u) => {
                              const isSelected = u.id === selectedUserId;
                              return (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => handleUserSelect(u.id)}
                                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold'
                                      : 'hover:bg-slate-50 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {u.profileImage ? (
                                      <img
                                        src={u.profileImage}
                                        alt={u.name}
                                        className="w-8 h-8 rounded-full object-cover border border-emerald-300 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                                        {getInitials(u.name)}
                                      </div>
                                    )}

                                    <div className="min-w-0">
                                      <div className="text-xs font-black text-slate-900 truncate">
                                        {u.name}
                                      </div>
                                      <div className="text-[10px] text-slate-500 truncate font-medium">
                                        {u.roleName} • <span className="text-slate-400">{u.officeName}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {isSelected && <Check size={14} className="text-emerald-600 shrink-0 ml-2" />}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Filter By Status</label>
              <div className="relative">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer appearance-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PRESENT">🟢 Present</option>
                  <option value="LATE">🟡 Late Check-In</option>
                  <option value="EARLY_CHECKOUT">🟠 Early Check-Out</option>
                  <option value="HALF_DAY">🔵 Half Day</option>
                  <option value="ABSENT">🔴 Absent</option>
                  <option value="HOLIDAY">⚪ Holiday</option>
                  <option value="LEAVE">🟣 Leave</option>
                  <option value="WORK_FROM_HOME">🏠 Work From Home</option>
                  <option value="WEEKEND">⚫ Weekly Off</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Dynamic Summary Metrics Bar */}
      {summaryMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 block">Present</span>
            <span className="text-lg font-black text-gray-900 mt-0.5 block">{summaryMetrics.presentDays} Days</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 block">Absent</span>
            <span className="text-lg font-black text-gray-900 mt-0.5 block">{summaryMetrics.absentDays} Days</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block">Late</span>
            <span className="text-lg font-black text-gray-900 mt-0.5 block">{summaryMetrics.lateDays} Days</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 block">Leave</span>
            <span className="text-lg font-black text-gray-900 mt-0.5 block">{summaryMetrics.leaveDays} Days</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block">Half Day</span>
            <span className="text-lg font-black text-gray-900 mt-0.5 block">{summaryMetrics.halfDays} Days</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 block">Hours</span>
            <span className="text-lg font-black text-gray-900 mt-0.5 block">{summaryMetrics.totalWorkingHours}h</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Avg Check-In</span>
            <span className="text-sm font-bold text-gray-800 mt-1 block">{summaryMetrics.avgCheckInTime}</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Avg Check-Out</span>
            <span className="text-sm font-bold text-gray-800 mt-1 block">{summaryMetrics.avgCheckOutTime}</span>
          </div>

          <div className="p-3.5 bg-emerald-500 text-white rounded-2xl shadow-md text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 block">Attendance</span>
            <span className="text-lg font-black mt-0.5 block">{summaryMetrics.attendancePercentage}%</span>
          </div>
        </div>
      )}

      {/* 4. Calendar Monthly Grid Area */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
        {loading ? (
          /* Loading Skeleton */
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="h-6 bg-slate-100 rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="py-16 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-800">{error}</h3>
            <button
              type="button"
              onClick={fetchCalendar}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Retry Loading Calendar
            </button>
          </div>
        ) : !calendarData || calendarData.days.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <CalendarIcon size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No Attendance Records Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              There are no recorded attendance entries or schedule records for the selected month and filters.
            </p>
          </div>
        ) : (
          /* Main Calendar Grid */
          <div>
            {/* Day Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-3 border-b border-gray-100 mb-3">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty padding slots before 1st of month */}
              {gridCells.leadingSlots?.map((_, idx) => (
                <div key={`empty-${idx}`} className="min-h-[96px] bg-slate-50/40 rounded-2xl border border-slate-100/50" />
              ))}

              {/* Monthly Day Cards */}
              {gridCells.days?.map((day) => {
                const isMatchingStatus = isDayStatusMatchingFilter(day, selectedStatusFilter);
                const badgeCfg = STATUS_BADGE_CONFIG[day.status] || STATUS_BADGE_CONFIG.NO_ATTENDANCE;
                const isTodayDate = day.date === today.toISOString().split('T')[0];

                return (
                  <motion.div
                    key={day.date}
                    whileHover={isMatchingStatus ? { scale: 1.02 } : undefined}
                    whileTap={isMatchingStatus ? { scale: 0.98 } : undefined}
                    onClick={() => isMatchingStatus && handleDayClick(day)}
                    className={`min-h-[100px] p-2.5 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden ${
                      !isMatchingStatus
                        ? 'bg-slate-50/50 border-slate-100 opacity-40'
                        : isTodayDate
                        ? 'ring-2 ring-emerald-500 shadow-md bg-white border-emerald-300 cursor-pointer'
                        : 'bg-white hover:shadow-md border-gray-100 hover:border-emerald-200 cursor-pointer'
                    }`}
                  >
                    {/* Top Row: Date Number & Status Indicator */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                          isTodayDate ? 'bg-emerald-600 text-white' : 'text-slate-900 bg-slate-100'
                        }`}
                      >
                        {day.dayNumber}
                      </span>

                      {isMatchingStatus && (
                        <span className={`w-2.5 h-2.5 rounded-full ${badgeCfg.iconBg}`} title={badgeCfg.label} />
                      )}
                    </div>

                    {/* Content Body (Only visible if matching status) */}
                    {isMatchingStatus ? (
                      <>
                        <div className="mt-2 space-y-1">
                          {day.checkInTime ? (
                            <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
                              <span className="text-emerald-600">In:</span>
                              <span>{day.checkInTime}</span>
                            </div>
                          ) : null}

                          {day.checkOutTime ? (
                            <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
                              <span className="text-slate-500">Out:</span>
                              <span>{day.checkOutTime}</span>
                            </div>
                          ) : null}

                          {day.workingHours > 0 && (
                            <div className="text-[9px] font-semibold text-slate-400 text-right">{day.workingHours} hrs</div>
                          )}
                        </div>

                        {/* Bottom Status Badge */}
                        <div className={`mt-2 px-2 py-0.5 rounded-lg text-[9px] font-black border text-center truncate ${badgeCfg.bg} ${badgeCfg.border}`}>
                          {day.statusLabel}
                        </div>
                      </>
                    ) : (
                      /* Empty slot for non-matching dates */
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-slate-300 text-[10px] font-mono">□</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. Calendar Color-Coded Legend */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
          Attendance Status Legend
        </span>
        <div className="flex flex-wrap gap-3 text-xs font-bold">
          {Object.entries(STATUS_BADGE_CONFIG).map(([key, cfg]) => (
            <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.iconBg}`} />
              <span>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Day Details Modal Popup */}
      <AnimatePresence>
        {selectedDayPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 border border-gray-100 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedDayPopup(null)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-100">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Attendance Details — {selectedDayPopup.date}</h3>
                  <p className="text-xs text-gray-400 font-medium">
                    {selectedDayPopup.dayOfWeek}, Day {selectedDayPopup.dayNumber} of Month
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border mb-6 flex items-center justify-between ${
                  (STATUS_BADGE_CONFIG[selectedDayPopup.status] || STATUS_BADGE_CONFIG.NO_ATTENDANCE).bg
                } ${(STATUS_BADGE_CONFIG[selectedDayPopup.status] || STATUS_BADGE_CONFIG.NO_ATTENDANCE).border}`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      (STATUS_BADGE_CONFIG[selectedDayPopup.status] || STATUS_BADGE_CONFIG.NO_ATTENDANCE).iconBg
                    }`}
                  />
                  <span className="text-sm font-black">{selectedDayPopup.statusLabel}</span>
                </div>

                {selectedDayPopup.approvalStatus && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-gray-200">
                    Status: {selectedDayPopup.approvalStatus}
                  </span>
                )}
              </div>

              {/* Main Timing Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Check-In Time</span>
                  <span className="text-base font-black text-slate-900 mt-1 block">
                    {selectedDayPopup.checkInTime || '—'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Check-Out Time</span>
                  <span className="text-base font-black text-slate-900 mt-1 block">
                    {selectedDayPopup.checkOutTime || '—'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Working Hours</span>
                  <span className="text-base font-black text-emerald-700 mt-1 block">
                    {selectedDayPopup.workingHours} Hours
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Late Minutes</span>
                  <span className="text-base font-black text-amber-700 mt-1 block">
                    {selectedDayPopup.lateMinutes > 0 ? `${selectedDayPopup.lateMinutes} mins` : 'On Time'}
                  </span>
                </div>
              </div>

              {/* Detailed Operational Attributes */}
              <div className="space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 text-xs mb-6">
                <div className="flex justify-between py-1 border-b border-slate-200/40">
                  <span className="text-slate-500 font-semibold">Office / Branch:</span>
                  <span className="font-bold text-slate-900">{selectedDayPopup.officeName || 'HQ Office'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/40">
                  <span className="text-slate-500 font-semibold">GPS Location Status:</span>
                  <span
                    className={`font-bold ${
                      selectedDayPopup.gpsStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-slate-600'
                    }`}
                  >
                    {selectedDayPopup.gpsStatus}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/40">
                  <span className="text-slate-500 font-semibold">IP Network Status:</span>
                  <span
                    className={`font-bold ${
                      selectedDayPopup.ipStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-slate-600'
                    }`}
                  >
                    {selectedDayPopup.ipStatus}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/40">
                  <span className="text-slate-500 font-semibold">Approved By:</span>
                  <span className="font-bold text-slate-900">{selectedDayPopup.approvedBy || 'System Approved'}</span>
                </div>

                {selectedDayPopup.deviceInfo && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-semibold">Device Info:</span>
                    <span className="font-mono text-[10px] text-slate-700 max-w-[200px] truncate">
                      {selectedDayPopup.deviceInfo}
                    </span>
                  </div>
                )}
              </div>

              {/* Leave & Holiday Metadata if applicable */}
              {selectedDayPopup.leaveDetails && (
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs mb-4 space-y-1">
                  <span className="font-bold text-purple-900 block">Leave Information</span>
                  <p className="text-purple-700">Type: {selectedDayPopup.leaveDetails.leaveType}</p>
                  <p className="text-purple-700">Reason: {selectedDayPopup.leaveDetails.reason}</p>
                </div>
              )}

              {selectedDayPopup.holidayDetails && (
                <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100 text-xs mb-4">
                  <span className="font-bold text-cyan-900 block">Holiday Information</span>
                  <p className="text-cyan-800 mt-1">{selectedDayPopup.holidayDetails.name}</p>
                </div>
              )}

              {/* Remarks / Daily Work Summary */}
              {selectedDayPopup.workSummary && (
                <div className="p-4 bg-white rounded-2xl border border-gray-200 text-xs space-y-1 mb-4">
                  <span className="font-bold text-gray-800 block">Daily Work Summary</span>
                  <p className="text-gray-600 leading-relaxed">{selectedDayPopup.workSummary}</p>
                </div>
              )}

              {selectedDayPopup.remarks && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-xs space-y-1">
                  <span className="font-bold text-amber-900 block">Remarks & Justification</span>
                  <p className="text-amber-800">{selectedDayPopup.remarks}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceCalendarWidget;
