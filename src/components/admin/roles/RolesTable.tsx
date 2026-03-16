import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Calendar
} from 'lucide-react';
import useRoleStore from '../../../store/useRoleStore';
import { useRolesQuery } from '../../../hooks/useRolesQuery';
import { useRoleMutations } from '../../../hooks/useRoleMutations';
import { Role } from '../../../types/role.types';
import { format } from 'date-fns';

interface RolesTableProps {
  onEdit: (role: Role) => void;
  onManagePermissions: (role: Role) => void;
  onDelete: (id: string, name: string) => void;
}

const RolesTable: React.FC<RolesTableProps> = ({ onEdit, onManagePermissions, onDelete }) => {
  const { filters, setFilters, pagination, setPagination } = useRoleStore();
  const { data: rolesResponse, isLoading } = useRolesQuery();
  const { updateRole } = useRoleMutations();

  const roles = rolesResponse?.data || [];
  const total = rolesResponse?.pagination?.total || 0;
  const totalPages = rolesResponse?.pagination?.totalPages || 1;

  const handleStatusToggle = (role: Role) => {
    updateRole.mutate({
      id: role.id,
      data: { status: role.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
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
            placeholder="Search roles..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
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
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Created By</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-100 rounded-full"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-8 w-8 ml-auto bg-gray-100 rounded-lg"></div></td>
                </tr>
              ))
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No roles found</p>
                  </div>
                </td>
              </tr>
            ) : (
              roles.map((role: Role) => (
                <motion.tr
                  key={role.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{role.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{role.description || 'No description'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {role.createdBy || 'System'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${role.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      {role.status === 'ACTIVE' ? <UserCheck className="w-2.5 h-2.5" /> : <UserX className="w-2.5 h-2.5" />}
                      {role.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Created: {format(new Date(role.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Updated: {format(new Date(role.updatedAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onManagePermissions(role)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-[10px] font-bold"
                        title="Manage Permissions"
                      >
                        Permissions
                      </button>
                      <button
                        onClick={() => onEdit(role)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Role"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusToggle(role)}
                        className={`p-1.5 rounded-lg transition-colors ${role.status === 'ACTIVE' ? 'text-orange-500 hover:bg-orange-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        title={role.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      >
                        {role.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onDelete(role.id, role.name)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Role"
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

      {/* Pagination */}
      <div className="p-4 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between mt-auto">
        <span className="text-xs text-gray-500">
          Showing <span className="font-bold">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-bold">{Math.min(pagination.page * pagination.limit, total)}</span> of <span className="font-bold">{total}</span> roles
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            className="p-2 bg-white border border-gray-100 rounded-lg disabled:opacity-50 text-gray-600 hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPagination({ ...pagination, page: i + 1 })}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${pagination.page === i + 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={pagination.page === totalPages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            className="p-2 bg-white border border-gray-100 rounded-lg disabled:opacity-50 text-gray-600 hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolesTable;
