import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  User,
  Building,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  MapPin,
  Globe,
  Smartphone,
  ShieldCheck,
  X,
  Search,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
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
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  // Loaded Options
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [officeOptions, setOfficeOptions] = useState<any[]>([]);

  // Response Data State
  const [calendarData, setCalendarData] = useState<{
    user: any;
    summary: CalendarSummaryMetrics;
    days: CalendarDayDetail[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Day Detail Popup Modal State
  const [selectedDayPopup, setSelectedDayPopup] = useState<CalendarDayDetail | null>(null);

  // Console Logging on load & scope check
  useEffect(() => {
    console.log('[Attendance Calendar] Attendance Calendar Loaded');
    console.log(
      '[Attendance Calendar] Permission Validated:',
      canViewAllCalendar ? 'ALL' : canViewAssignedCalendar ? 'ASSIGNED' : 'OWN',
    );
  }, [canViewAllCalendar, canViewAssignedCalendar]);

  // Fetch filter options (Users & Offices) if permission allows
  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (canViewAssignedCalendar) {
        try {
          const overviewRes = await attendanceApi.getAdminOverview({ limit: 200 });
          if (overviewRes?.records) {
            const uniqueUsersMap = new Map<string, any>();
            overviewRes.records.forEach((rec: any) => {
              if (rec.user && !uniqueUsersMap.has(rec.user.id)) {
                uniqueUsersMap.set(rec.user.id, rec.user);
              }
            });
            setUserOptions(Array.from(uniqueUsersMap.values()));
          }
        } catch (e) {
          console.error('[Attendance Calendar] Failed to fetch user options:', e);
        }

        try {
          const officeRes = await attendanceApi.getOfficeLocations();
          setOfficeOptions(officeRes?.data || []);
        } catch (e) {
          console.error('[Attendance Calendar] Failed to fetch office options:', e);
        }
      }
    };

    fetchFilterOptions();
  }, [canViewAssignedCalendar]);

  // Main Calendar Fetch Effect
  const fetchCalendar = async () => {
    setLoading(true);
    setError(null);
    console.log(
      `[Attendance Calendar] Calendar Month Changed: month=${currentMonth}, year=${currentYear}, userId=${selectedUserId}`,
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
      } else {
        setCalendarData(null);
      }
    } catch (err: any) {
      console.error('[Attendance Calendar] Failed to load calendar data:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to load attendance calendar.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [currentMonth, currentYear, selectedUserId, selectedOfficeId, selectedStatusFilter]);

  // Handle User Change
  const handleUserChange = (newUserId: string) => {
    setSelectedUserId(newUserId);
    console.log('[Attendance Calendar] Selected User Changed:', newUserId);
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

  // Filtered Users List for Search
  const filteredUserOptions = useMemo(() => {
    if (!userSearchQuery.trim()) return userOptions;
    const q = userSearchQuery.toLowerCase();
    return userOptions.filter(
      (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
    );
  }, [userOptions, userSearchQuery]);

  // Calendar Grid Cells Computation (Padding days before 1st of month)
  const gridCells = useMemo<{ leadingSlots: number[]; days: CalendarDayDetail[] }>(() => {
    if (!calendarData?.days) return { leadingSlots: [], days: [] };

    const firstDayObj = new Date(currentYear, currentMonth - 1, 1);
    // getDay(): 0 = Sunday, 1 = Monday. Let's make Monday = 0
    let firstDayOfWeek = firstDayObj.getDay() - 1;
    if (firstDayOfWeek < 0) firstDayOfWeek = 6; // Sunday becomes 6

    const emptyLeadingSlots = Array.from({ length: firstDayOfWeek }, (_, i) => i);

    return {
      leadingSlots: emptyLeadingSlots,
      days: calendarData.days,
    };
  }, [calendarData, currentYear, currentMonth]);

  const summary = calendarData?.summary;
  const targetUserInfo = calendarData?.user;

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls Bar */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Attendance Calendar</h2>
              <p className="text-xs text-gray-400 font-medium">
                {targetUserInfo?.name
                  ? `Viewing Calendar for ${targetUserInfo.name} (${targetUserInfo.roleName || 'Staff'})`
                  : 'Monthly Employee Attendance & Performance Tracking'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation & Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Today Button */}
          <button
            type="button"
            onClick={handleTodayClick}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-slate-200 cursor-pointer"
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

          {/* Month Dropdown Selector */}
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          {/* Year Dropdown Selector */}
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Manual Refresh Button */}
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

      {/* 2. Hierarchical Filters Bar (Office & User Selector) */}
      {!canViewOwnCalendarOnly && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Filter size={14} className="text-emerald-500" />
              <span>Hierarchical Calendar Filters</span>
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {canViewAllCalendar ? 'All Users Visibility Scope' : 'Assigned Staff Scope'}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Selector Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Select Employee / User</label>
              <div className="relative">
                <select
                  value={selectedUserId}
                  onChange={(e) => handleUserChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                >
                  <option value={user?.id}>Self: {user?.name} (Me)</option>
                  {filteredUserOptions
                    .filter((u) => u.id !== user?.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.role?.name || u.email}
                      </option>
                    ))}
                </select>
                <User size={14} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Office Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Office Location / Branch</label>
              <div className="relative">
                <select
                  value={selectedOfficeId}
                  onChange={(e) => setSelectedOfficeId(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                >
                  <option value="">All Offices & Branches</option>
                  {officeOptions.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.officeName || off.name || 'HQ Office'}
                    </option>
                  ))}
                </select>
                <Building size={14} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Filter By Status</label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">🟢 Present</option>
                <option value="LATE">🟡 Late Check-In</option>
                <option value="EARLY_CHECKOUT">🟠 Early Check-Out</option>
                <option value="HALF_DAY">🔵 Half Day</option>
                <option value="ABSENT">🔴 Absent</option>
                <option value="HOLIDAY">⚪ Holiday</option>
                <option value="LEAVE">🟣 Leave</option>
                <option value="WEEKEND">⚫ Weekend / Weekly Off</option>
              </select>
            </div>

            {/* User Search Query Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Search User By Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Monthly Summary Metrics Bar */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 block">Present</span>
            <span className="text-lg font-black text-gray-900 mt-0.5 block">{summary.presentDays} Days</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 block">Absent</span>
            <span className="text-lg font-black text-gray-900 mt-0.5 block">{summary.absentDays} Days</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block">Late</span>
            <span className="text-lg font-black text-gray-900 mt-0.5 block">{summary.lateDays} Days</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 block">Leave</span>
            <span className="text-lg font-black text-gray-900 mt-0.5 block">{summary.leaveDays} Days</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block">Half Day</span>
            <span className="text-lg font-black text-gray-900 mt-0.5 block">{summary.halfDays} Days</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 block">Hours</span>
            <span className="text-lg font-black text-gray-900 mt-0.5 block">{summary.totalWorkingHours}h</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Avg Check-In</span>
            <span className="text-sm font-bold text-gray-800 mt-1 block">{summary.avgCheckInTime}</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Avg Check-Out</span>
            <span className="text-sm font-bold text-gray-800 mt-1 block">{summary.avgCheckOutTime}</span>
          </div>

          <div className="p-3.5 bg-emerald-500 text-white rounded-2xl shadow-md text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 block">Attendance</span>
            <span className="text-lg font-black mt-0.5 block">{summary.attendancePercentage}%</span>
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
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
                const badgeCfg = STATUS_BADGE_CONFIG[day.status] || STATUS_BADGE_CONFIG.NO_ATTENDANCE;
                const isTodayDate = day.date === today.toISOString().split('T')[0];

                return (
                  <motion.div
                    key={day.date}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDayClick(day)}
                    className={`min-h-[100px] p-2.5 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                      isTodayDate
                        ? 'ring-2 ring-emerald-500 shadow-md bg-white border-emerald-300'
                        : 'bg-white hover:shadow-md border-gray-100 hover:border-emerald-200'
                    }`}
                  >
                    {/* Top Row: Date Number & Badge Indicator */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                          isTodayDate ? 'bg-emerald-600 text-white' : 'text-slate-900 bg-slate-100'
                        }`}
                      >
                        {day.dayNumber}
                      </span>

                      <span className={`w-2.5 h-2.5 rounded-full ${badgeCfg.iconBg}`} title={badgeCfg.label} />
                    </div>

                    {/* Content Body */}
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
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-slate-100 transition-all"
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
