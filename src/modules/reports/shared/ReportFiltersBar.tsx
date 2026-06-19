import React, { useMemo } from 'react';
import { Calendar, Filter, User } from 'lucide-react';
import { endOfDay, format, startOfDay, startOfMonth, startOfWeek, subDays } from 'date-fns';
import { useLeadMetaQuery } from '../../../hooks/useLeads';
import MultiSearchableSelect from '../../../components/MultiSearchableSelect';
import type { ReportFilterState } from './reportFilterDefaults';
import { useReportMetaOptions } from './useReportUsers';

interface ReportFiltersBarProps {
  filters: ReportFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilterState>>;
}

const ReportFiltersBar: React.FC<ReportFiltersBarProps> = ({ filters, setFilters }) => {
  const { userOptions, roleOptions, departmentOptions, branchOptions, supervisorOptions } = useReportMetaOptions();
  const { data: leadMeta } = useLeadMetaQuery();

  const stageOptions = useMemo(
    () => (leadMeta?.stages || []).map((item) => ({ value: item.id, label: item.label })),
    [leadMeta],
  );
  const sourceOptions = useMemo(
    () => (leadMeta?.sources || []).map((item) => ({ value: item.id, label: item.label })),
    [leadMeta],
  );

  const handleDatePreset = (preset: string) => {
    const today = new Date();
    let startDate = startOfDay(today);
    let endDate = endOfDay(today);

    if (preset === 'yesterday') {
      startDate = startOfDay(subDays(today, 1));
      endDate = endOfDay(subDays(today, 1));
    } else if (preset === 'this-week') {
      startDate = startOfWeek(today, { weekStartsOn: 1 });
      endDate = endOfDay(today);
    } else if (preset === 'this-month') {
      startDate = startOfMonth(today);
      endDate = endOfDay(today);
    }

    setFilters((prev) => ({ ...prev, startDate: startDate.toISOString(), endDate: endDate.toISOString(), page: 1 }));
  };

  const selectedUserIds = Array.isArray(filters.userId)
    ? filters.userId
    : filters.userId
      ? [filters.userId]
      : [];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm print:hidden">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3 font-black text-gray-900">
        <Filter size={18} className="text-emerald-500" /> Report Filters
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => handleDatePreset('today')} className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200">Today</button>
        <button type="button" onClick={() => handleDatePreset('yesterday')} className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200">Yesterday</button>
        <button type="button" onClick={() => handleDatePreset('this-week')} className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200">This Week</button>
        <button type="button" onClick={() => handleDatePreset('this-month')} className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200">This Month</button>

        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            className="rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            value={format(new Date(filters.startDate || new Date()), 'yyyy-MM-dd')}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: startOfDay(new Date(e.target.value)).toISOString(), page: 1 }))}
          />
        </div>
        <span className="text-sm font-medium text-gray-400">to</span>
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            className="rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            value={format(new Date(filters.endDate || new Date()), 'yyyy-MM-dd')}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: endOfDay(new Date(e.target.value)).toISOString(), page: 1 }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative">
          <User size={14} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400" />
          <select
            className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500"
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

        {filters.userMode === 'single' ? (
          <select
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500"
            value={typeof filters.userId === 'string' ? filters.userId : ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value, page: 1 }))}
          >
            {userOptions.map((option: any) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        ) : null}

        {filters.userMode === 'multiple' ? (
          <div className="md:col-span-2">
            <MultiSearchableSelect
              name="reportUsers"
              options={userOptions}
              values={selectedUserIds}
              onChange={(values) => setFilters((prev) => ({ ...prev, userId: values, page: 1 }))}
              placeholder="Select users"
            />
          </div>
        ) : null}

        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 outline-none focus:ring-2 focus:ring-emerald-500"
          value={filters.role || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All Roles</option>
          {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 outline-none focus:ring-2 focus:ring-emerald-500"
          value={filters.supervisorId || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, supervisorId: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All Supervisors</option>
          {supervisorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 outline-none focus:ring-2 focus:ring-emerald-500"
          value={filters.branchId || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, branchId: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All Branches</option>
          {branchOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 outline-none focus:ring-2 focus:ring-emerald-500"
          value={filters.departmentId || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, departmentId: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All Departments</option>
          {departmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 outline-none focus:ring-2 focus:ring-emerald-500"
          value={filters.leadSource || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, leadSource: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All Lead Sources</option>
          {sourceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 outline-none focus:ring-2 focus:ring-emerald-500"
          value={filters.leadStage || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, leadStage: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All Lead Stages</option>
          {stageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
    </div>
  );
};

export default ReportFiltersBar;
