import React, { useMemo } from 'react';
import { Calendar, Filter, RotateCcw, User } from 'lucide-react';
import { endOfDay, format, startOfDay, startOfMonth, startOfWeek, subDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useLeadMetaQuery } from '../../../hooks/useLeads';
import MultiSearchableSelect from '../../../components/MultiSearchableSelect';
import type { ReportFilterState } from './reportFilterDefaults';
import { useReportMetaOptions } from './useReportUsers';
import OfficeFilterSelect from '../../../components/OfficeFilterSelect';
import useAuthStore from '../../../store/useAuthStore';
import { canUseOfficeFilter } from '../../../utils/officeFilterAccess';
import { fetchGroupedSubstages } from '../../../services/substages.api';

const toDateStr = (val?: string): string => {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? '' : format(d, 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

interface ReportFiltersBarProps {
  filters: ReportFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilterState>>;
}

const ReportFiltersBar: React.FC<ReportFiltersBarProps> = ({ filters, setFilters }) => {
  const { userOptions, roleOptions, departmentOptions, branchOptions, supervisorOptions } = useReportMetaOptions();
  const { data: leadMeta } = useLeadMetaQuery();
  const currentUser = useAuthStore((state) => state.user);
  const showOfficeFilter = canUseOfficeFilter(currentUser);

  const { data: groupedSubstages = [] } = useQuery({
    queryKey: ['grouped-substages'],
    queryFn: fetchGroupedSubstages,
    staleTime: 5 * 60_000,
  });

  const substageOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    (groupedSubstages || []).forEach((group) => {
      (group.substages || []).forEach((sub) => {
        options.push({
          value: sub.id,
          label: `${sub.name} (${group.name})`,
        });
      });
    });
    return options;
  }, [groupedSubstages]);

  const stageOptions = useMemo(
    () => (leadMeta?.stages || []).map((item) => ({ value: item.id, label: item.label })),
    [leadMeta],
  );
  const sourceOptions = useMemo(
    () => (leadMeta?.sources || []).map((item) => ({ value: item.id, label: item.label })),
    [leadMeta],
  );

  const handleDatePreset = (preset: 'today' | 'yesterday' | 'this-week' | 'this-month') => {
    const today = new Date();
    let startDate = format(today, 'yyyy-MM-dd');
    let endDate = format(today, 'yyyy-MM-dd');

    if (preset === 'yesterday') {
      const yesterday = subDays(today, 1);
      startDate = format(yesterday, 'yyyy-MM-dd');
      endDate = format(yesterday, 'yyyy-MM-dd');
    } else if (preset === 'this-week') {
      startDate = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      endDate = format(today, 'yyyy-MM-dd');
    } else if (preset === 'this-month') {
      startDate = format(startOfMonth(today), 'yyyy-MM-dd');
      endDate = format(today, 'yyyy-MM-dd');
    }

    setFilters((prev) => ({ ...prev, startDate, endDate, page: 1 }));
  };

  const isTodayActive = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const startStr = toDateStr(filters.startDate);
    const endStr = toDateStr(filters.endDate);
    return startStr === todayStr && endStr === todayStr;
  }, [filters.startDate, filters.endDate]);

  const isYesterdayActive = useMemo(() => {
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const startStr = toDateStr(filters.startDate);
    const endStr = toDateStr(filters.endDate);
    return startStr === yesterdayStr && endStr === yesterdayStr;
  }, [filters.startDate, filters.endDate]);

  const isThisWeekActive = useMemo(() => {
    const weekStartStr = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const startStr = toDateStr(filters.startDate);
    const endStr = toDateStr(filters.endDate);
    return startStr === weekStartStr && endStr === todayStr;
  }, [filters.startDate, filters.endDate]);

  const isThisMonthActive = useMemo(() => {
    const monthStartStr = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const startStr = toDateStr(filters.startDate);
    const endStr = toDateStr(filters.endDate);
    return startStr === monthStartStr && endStr === todayStr;
  }, [filters.startDate, filters.endDate]);

  const selectedUserIds = Array.isArray(filters.userId)
    ? filters.userId
    : filters.userId
      ? [filters.userId]
      : [];

  const hasFilterOverrides = Boolean(
    (filters.userMode && filters.userMode !== 'all') ||
    filters.role ||
    filters.supervisorId ||
    filters.officeId ||
    filters.branchId ||
    filters.departmentId ||
    filters.leadSource ||
    filters.leadStage ||
    (filters.substageIds && filters.substageIds.length > 0)
  );

  const handleResetFilters = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    setFilters({
      startDate: todayStr,
      endDate: todayStr,
      userMode: 'all',
      userId: undefined,
      role: undefined,
      supervisorId: undefined,
      officeId: undefined,
      branchId: undefined,
      departmentId: undefined,
      leadSource: undefined,
      leadStage: undefined,
      substageIds: [],
      page: 1,
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-2xs print:hidden">
      {/* Header bar with Reset */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
          <Filter size={14} className="text-emerald-600" />
          <span>Report Filters</span>
        </div>

        {hasFilterOverrides && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
            title="Reset all filters to default"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Row 1: Date Filter Row (Presets + Range) */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-lg border border-gray-200/90 bg-gray-50/70 p-0.5">
          <button
            type="button"
            onClick={() => handleDatePreset('today')}
            className={`h-7 px-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${isTodayActive
              ? 'bg-white text-emerald-700 shadow-2xs font-bold'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleDatePreset('yesterday')}
            className={`h-7 px-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${isYesterdayActive
              ? 'bg-white text-emerald-700 shadow-2xs font-bold'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Yesterday
          </button>
          <button
            type="button"
            onClick={() => handleDatePreset('this-week')}
            className={`h-7 px-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${isThisWeekActive
              ? 'bg-white text-emerald-700 shadow-2xs font-bold'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => handleDatePreset('this-month')}
            className={`h-7 px-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${isThisMonthActive
              ? 'bg-white text-emerald-700 shadow-2xs font-bold'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            This Month
          </button>
        </div>

        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
          <div className="relative">
            <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              aria-label="Filter start date"
              className="h-8 rounded-lg border border-gray-200 bg-white py-1 pl-8 pr-2 text-xs font-medium text-gray-800 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              value={toDateStr(filters.startDate)}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value || undefined, page: 1 }))}
            />
          </div>
          <span className="text-xs font-medium text-gray-400">to</span>
          <div className="relative">
            <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              aria-label="Filter end date"
              className="h-8 rounded-lg border border-gray-200 bg-white py-1 pl-8 pr-2 text-xs font-medium text-gray-800 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              value={toDateStr(filters.endDate)}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value || undefined, page: 1 }))}
            />
          </div>
        </div>
      </div>

      {/* Row 2 & 3: Primary Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* User filter mode + selector */}
        <div className={filters.userMode === 'multiple' ? 'sm:col-span-2' : ''}>
          {filters.userMode === 'multiple' ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    className="h-8 w-full appearance-none rounded-lg border border-gray-200 bg-white py-1 pl-8 pr-7 text-xs font-semibold text-gray-800 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    value={filters.userMode}
                    onChange={(e) => {
                      const mode = e.target.value as ReportFilterState['userMode'];
                      if (mode === 'all') setFilters((prev) => ({ ...prev, userMode: 'all', userId: undefined, page: 1 }));
                      if (mode === 'single') setFilters((prev) => ({ ...prev, userMode: 'single', userId: userOptions[0]?.value, page: 1 }));
                      if (mode === 'multiple') setFilters((prev) => ({ ...prev, userMode: 'multiple', userId: [], page: 1 }));
                    }}
                  >
                    <option value="all">All Users</option>
                    <option value="single">Single User</option>
                    <option value="multiple">Multiple Users</option>
                  </select>
                </div>
              </div>
              <MultiSearchableSelect
                name="reportUsers"
                options={userOptions}
                values={selectedUserIds}
                onChange={(values) => setFilters((prev) => ({ ...prev, userId: values, page: 1 }))}
                placeholder="Select users to include"
              />
            </div>
          ) : filters.userMode === 'single' ? (
            <div className="grid grid-cols-2 gap-1.5">
              <div className="relative">
                <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  className="h-8 w-full appearance-none rounded-lg border border-gray-200 bg-white py-1 pl-8 pr-6 text-xs font-semibold text-gray-800 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  value={filters.userMode}
                  onChange={(e) => {
                    const mode = e.target.value as ReportFilterState['userMode'];
                    if (mode === 'all') setFilters((prev) => ({ ...prev, userMode: 'all', userId: undefined, page: 1 }));
                    if (mode === 'single') setFilters((prev) => ({ ...prev, userMode: 'single', userId: userOptions[0]?.value, page: 1 }));
                    if (mode === 'multiple') setFilters((prev) => ({ ...prev, userMode: 'multiple', userId: [], page: 1 }));
                  }}
                >
                  <option value="all">All Users</option>
                  <option value="single">Single User</option>
                  <option value="multiple">Multiple Users</option>
                </select>
              </div>
              <select
                className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                value={typeof filters.userId === 'string' ? filters.userId : ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value, page: 1 }))}
              >
                {userOptions.map((option: any) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="relative">
              <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                className="h-8 w-full appearance-none rounded-lg border border-gray-200 bg-white py-1 pl-8 pr-7 text-xs font-semibold text-gray-800 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                value={filters.userMode || 'all'}
                onChange={(e) => {
                  const mode = e.target.value as ReportFilterState['userMode'];
                  if (mode === 'all') setFilters((prev) => ({ ...prev, userMode: 'all', userId: undefined, page: 1 }));
                  if (mode === 'single') setFilters((prev) => ({ ...prev, userMode: 'single', userId: userOptions[0]?.value, page: 1 }));
                  if (mode === 'multiple') setFilters((prev) => ({ ...prev, userMode: 'multiple', userId: [], page: 1 }));
                }}
              >
                <option value="all">All Users</option>
                <option value="single">Single User</option>
                <option value="multiple">Multiple Users</option>
              </select>
            </div>
          )}
        </div>

        {/* Roles */}
        <select
          className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          value={filters.role || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All Roles</option>
          {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        {/* Supervisors */}
        <select
          className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          value={filters.supervisorId || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, supervisorId: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All Supervisors</option>
          {supervisorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        {/* Office Location / Branch */}
        {showOfficeFilter ? (
          <OfficeFilterSelect
            value={filters.officeId || filters.branchId || ''}
            onChange={(officeId) => setFilters((prev) => ({ ...prev, officeId, branchId: undefined, page: 1 }))}
          />
        ) : (
          <select
            className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            value={filters.branchId || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, branchId: e.target.value || undefined, page: 1 }))}
          >
            <option value="">All Branches</option>
            {branchOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        )}

        {/* Departments */}
        <select
          className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          value={filters.departmentId || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, departmentId: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All Departments</option>
          {departmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        {/* Lead Sources */}
        <select
          className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          value={filters.leadSource || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, leadSource: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All Lead Sources</option>
          {sourceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        {/* Lead Stages */}
        <select
          className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          value={filters.leadStage || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, leadStage: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All Lead Stages</option>
          {stageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        {/* Substage comparison */}
        <div>
          <MultiSearchableSelect
            name="reportSubstages"
            options={substageOptions}
            values={filters.substageIds || []}
            onChange={(values) => setFilters((prev) => ({ ...prev, substageIds: values, page: 1 }))}
            placeholder="Select substages to compare"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportFiltersBar;
