import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  Users
} from 'lucide-react';
import useDepartmentStore from '../../../store/useDepartmentStore';
import { useDepartmentsQuery } from '../../../hooks/useDepartmentsQuery';
import { useDepartmentMutations } from '../../../hooks/useDepartmentMutations';
import { Department } from '../../../types/department.types';
import { format } from 'date-fns';

interface DepartmentsTableProps {
  onEdit: (dept: Department) => void;
  onDelete: (id: string, name: string) => void;
}

const DepartmentsTable: React.FC<DepartmentsTableProps> = ({ onEdit, onDelete }) => {
  const { filters, setFilters, pagination, setPagination } = useDepartmentStore();
  const { data: deptResponse, isLoading } = useDepartmentsQuery();
  const { updateDepartment } = useDepartmentMutations();
  const [searchTerm, setSearchTerm] = useState(filters.search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchTerm });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, setFilters]);

  const departments = deptResponse?.data || [];
  const total = deptResponse?.pagination?.total || 0;
  const totalPages = deptResponse?.pagination?.totalPages || 1;

  const handleStatusToggle = (dept: Department) => {
    updateDepartment.mutate({
      id: dept.id,
      data: { status: dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-50 rounded-xl focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-50">
            <button
              onClick={() => setFilters({ status: undefined })}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filters.status === undefined ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilters({ status: 'ACTIVE' })}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filters.status === 'ACTIVE' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilters({ status: 'INACTIVE' })}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filters.status === 'INACTIVE' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Members</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Created</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-100 rounded-full"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-8 w-16 ml-auto bg-gray-100 rounded-lg"></div></td>
                </tr>
              ))
            ) : departments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">No departments found</p>
                  </div>
                </td>
              </tr>
            ) : (
              departments.map((dept: Department) => (
                <motion.tr
                  key={dept.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-emerald-600 font-black shrink-0 border border-emerald-100/30">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900 leading-tight mb-0.5">{dept.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate max-w-[200px]" title={dept.description || ''}>
                          {dept.description || 'Org Structure Group'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-700">
                          {dept._count?.users || 0}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                        onClick={() => handleStatusToggle(dept)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${dept.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {dept.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {dept.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] text-gray-500 font-bold flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 opacity-50" /> {format(new Date(dept.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => onEdit(dept)}
                        className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all shadow-sm active:scale-90"
                        title="Edit Department"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(dept.id, dept.name)}
                        className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm active:scale-90"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-50">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-5 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-gray-100 rounded-lg" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))
        ) : departments.length === 0 ? (
          <div className="py-20 text-center px-6">
            <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-bold text-sm">No departments found</p>
          </div>
        ) : (
          departments.map((dept: Department) => (
            <div key={dept.id} className="p-5 space-y-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-emerald-600 font-black text-lg shrink-0 border border-emerald-100/50 shadow-sm">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-gray-900 truncate">{dept.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${dept.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                            {dept.status}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" /> {dept._count?.users || 0}
                        </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onEdit(dept)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg active:scale-95 transition-all"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(dept.id, dept.name)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg active:scale-95 transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                 <button 
                    onClick={() => handleStatusToggle(dept)}
                    className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${dept.status === 'ACTIVE' ? 'text-amber-500' : 'text-emerald-500'}`}
                 >
                    {dept.status === 'ACTIVE' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Mark {dept.status === 'ACTIVE' ? 'Inactive' : 'Active'}
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="p-4 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
        <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">
          Displaying <span className="text-gray-900 font-black">{(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, total)}</span> of <span className="text-gray-900 font-black">{total}</span> Departments
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            className="p-2.5 bg-white border border-gray-100 rounded-xl disabled:opacity-30 text-gray-500 shadow-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPagination({ ...pagination, page: i + 1 })}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${pagination.page === i + 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border border-gray-100 text-gray-400 hover:text-gray-900'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={pagination.page === totalPages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            className="p-2.5 bg-white border border-gray-100 rounded-xl disabled:opacity-30 text-gray-500 shadow-sm transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentsTable;
