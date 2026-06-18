import React from 'react';
import { Calendar, User, Briefcase, Filter, Building, Users as UsersIcon } from 'lucide-react';
import { format, startOfWeek, startOfMonth, subDays } from 'date-fns';

interface SummaryFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  users: any[];
}

const SummaryFilters: React.FC<SummaryFiltersProps> = ({ filters, setFilters, users }) => {
  const handleDatePreset = (preset: string) => {
    const today = new Date();
    let startDate = today;
    let endDate = today;

    if (preset === 'today') {
      startDate = today;
      endDate = today;
    } else if (preset === 'yesterday') {
      startDate = subDays(today, 1);
      endDate = subDays(today, 1);
    } else if (preset === 'this-week') {
      startDate = startOfWeek(today, { weekStartsOn: 1 });
      endDate = today;
    } else if (preset === 'this-month') {
      startDate = startOfMonth(today);
      endDate = today;
    }

    setFilters({ ...filters, startDate: format(startDate, 'yyyy-MM-dd'), endDate: format(endDate, 'yyyy-MM-dd') });
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      setFilters({ ...filters, userId: undefined });
    } else if (value === 'multiple') {
      // For simplicity, selecting top 3 users as a "multiple" preset for demo purposes
      // In production, use a MultiSelect dropdown library
      setFilters({ ...filters, userId: users.slice(0, 3).map(u => u.id) });
    } else {
      setFilters({ ...filters, userId: value });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center gap-2 text-gray-900 font-black border-b border-gray-100 pb-3">
        <Filter size={18} className="text-emerald-500" /> Advanced Report Filters
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Presets */}
        <div className="flex gap-2">
          <button onClick={() => handleDatePreset('today')} className="px-3 py-2 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">Today</button>
          <button onClick={() => handleDatePreset('yesterday')} className="px-3 py-2 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">Yesterday</button>
          <button onClick={() => handleDatePreset('this-week')} className="px-3 py-2 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">This Week</button>
          <button onClick={() => handleDatePreset('this-month')} className="px-3 py-2 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">This Month</button>
        </div>

        {/* Date Range Inputs */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="date" 
              className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-700"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <span className="text-gray-400 text-sm font-medium">to</span>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="date" 
              className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-700"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
        </div>

        {/* User Select */}
        <div className="relative flex-1 min-w-[200px]">
          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer font-bold text-gray-700"
            onChange={handleUserSelect}
            value={Array.isArray(filters.userId) ? 'multiple' : (filters.userId || 'all')}
          >
            <option value="all">All Users (Company Report)</option>
            <option value="multiple">Multiple Users (Top 3 Demo)</option>
            <optgroup label="Individual Users">
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </optgroup>
          </select>
        </div>
      </div>
      
      {/* Secondary Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
        <div className="relative w-40">
          <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none appearance-none text-gray-600">
            <option value="">All Roles</option>
            <option value="Executive">Executive</option>
            <option value="Team Leader">Team Leader</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div className="relative w-40">
          <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none appearance-none text-gray-600">
            <option value="">All Branches</option>
            {/* Branches map here */}
          </select>
        </div>
        <div className="relative w-40">
          <UsersIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none appearance-none text-gray-600">
            <option value="">All Departments</option>
            {/* Departments map here */}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SummaryFilters;
