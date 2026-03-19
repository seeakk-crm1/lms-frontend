import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface Props {
  search: string;
  showFilters: boolean;
  departmentId?: string;
  supervisorId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  departments: Option[];
  supervisors: Option[];
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
  onDepartmentChange: (value?: string) => void;
  onSupervisorChange: (value?: string) => void;
  onStatusChange: (value?: 'ACTIVE' | 'INACTIVE') => void;
}

const RosterFilters: React.FC<Props> = ({
  search,
  showFilters,
  departmentId,
  supervisorId,
  status,
  departments,
  supervisors,
  onSearchChange,
  onToggleFilters,
  onDepartmentChange,
  onSupervisorChange,
  onStatusChange,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <label className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search user, email..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          aria-label="Search roster users"
        />
      </label>
      <button
        onClick={onToggleFilters}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 transition"
        aria-label="Toggle roster filters"
      >
        <Filter className="w-4 h-4 text-emerald-600" />
        Filters
      </button>
    </div>

    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
            <select
              value={departmentId || ''}
              onChange={(event) => onDepartmentChange(event.target.value || undefined)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Filter by department"
            >
              <option value="">All departments</option>
              {departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={supervisorId || ''}
              onChange={(event) => onSupervisorChange(event.target.value || undefined)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Filter by supervisor"
            >
              <option value="">All supervisors</option>
              {supervisors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={status || ''}
              onChange={(event) => onStatusChange((event.target.value as 'ACTIVE' | 'INACTIVE') || undefined)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default React.memo(RosterFilters);
