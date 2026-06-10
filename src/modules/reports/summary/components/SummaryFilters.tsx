import React from 'react';
import { Calendar, User, Briefcase, Filter } from 'lucide-react';

interface SummaryFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  users: any[];
}

const SummaryFilters: React.FC<SummaryFiltersProps> = ({ filters, setFilters, users }) => {
  const handleDatePreset = (preset: string) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (preset === 'today') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (preset === 'yesterday') {
      startDate.setDate(today.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(today.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
    } else if (preset === 'this-week') {
      startDate.setDate(today.getDate() - today.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (preset === 'this-month') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    setFilters({ ...filters, startDate: startDate.toISOString(), endDate: endDate.toISOString() });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2 text-gray-500 font-medium">
        <Filter size={18} /> Filters
      </div>
      
      {/* Date Presets */}
      <div className="flex gap-2">
        <button onClick={() => handleDatePreset('today')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">Today</button>
        <button onClick={() => handleDatePreset('yesterday')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">Yesterday</button>
        <button onClick={() => handleDatePreset('this-week')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">This Week</button>
        <button onClick={() => handleDatePreset('this-month')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">This Month</button>
      </div>

      {/* Date Range Inputs */}
      <div className="flex items-center gap-2 ml-auto">
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="date" 
            className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            onChange={(e) => setFilters({ ...filters, startDate: new Date(e.target.value).toISOString() })}
          />
        </div>
        <span className="text-gray-400 text-sm">to</span>
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="date" 
            className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            onChange={(e) => setFilters({ ...filters, endDate: new Date(e.target.value).toISOString() })}
          />
        </div>
      </div>

      {/* User Select */}
      <div className="relative w-48">
        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <select 
          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
          onChange={(e) => setFilters({ ...filters, userId: e.target.value || undefined })}
        >
          <option value="">All Users</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
    </div>
  );
};

export default SummaryFilters;
