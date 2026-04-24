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
  Calendar,
  LayoutDashboard
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

  const canDeleteRole = (role: Role) => !role.isSystemRole && (role.usersCount ?? 0) === 0;
  const getDeleteTooltip = (role: Role) => {
    if (role.isSystemRole) {
      return 'System roles cannot be deleted';
    }

    if ((role.usersCount ?? 0) > 0) {
      return `Reassign ${role.usersCount} user${role.usersCount === 1 ? '' : 's'} before deleting`;
    }

    return 'Decommission Role';
  };

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

      {/* Desktop Table (Visible on md and up) */}
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
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-emerald-600 font-black shrink-0 border border-emerald-100/30">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900 leading-tight mb-0.5">{role.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate max-w-[200px]" title={role.description || ''}>
                          {role.description || 'No description provided'}
                        </div>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          {role.isSystemRole && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider">
                              System protected
                            </span>
                          )}
                          {(role.usersCount ?? 0) > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider">
                              {role.usersCount} assigned user{role.usersCount === 1 ? '' : 's'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-600 px-2 py-1 bg-gray-100 rounded-lg">
                      {role.createdBy || 'System'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                        onClick={() => handleStatusToggle(role)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${role.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {role.status === 'ACTIVE' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      {role.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] text-gray-500 font-bold flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 opacity-50" /> {format(new Date(role.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-[9px] text-gray-400 font-medium italic">
                        Last sync: {format(new Date(role.updatedAt), 'p')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => onManagePermissions(role)}
                        className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all shadow-sm shadow-emerald-500/5 group/btn active:scale-90"
                        title="Manage Permissions Matrix"
                      >
                        <LayoutDashboard className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                      </button>
                      <button
                        onClick={() => onEdit(role)}
                        className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all shadow-sm active:scale-90"
                        title="Configuration Settings"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => canDeleteRole(role) && onDelete(role.id, role.name)}
                        disabled={!canDeleteRole(role)}
                        className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-50"
                        title={getDeleteTooltip(role)}
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

      {/* Mobile Card View (Visible on small screens) */}
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
              <div className="flex gap-2">
                <div className="h-8 flex-1 bg-gray-50 rounded-xl" />
                <div className="h-8 flex-1 bg-gray-50 rounded-xl" />
              </div>
            </div>
          ))
        ) : roles.length === 0 ? (
          <div className="py-20 text-center px-6">
            <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-bold">No active roles found</p>
          </div>
        ) : (
          roles.map((role: Role) => (
            <div key={role.id} className="p-5 space-y-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-emerald-600 font-black text-lg shrink-0 border border-emerald-100/50 shadow-sm">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-gray-900 truncate">{role.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate mb-1">{role.description || 'System Access Role'}</p>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${role.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                            {role.status}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold">{format(new Date(role.createdAt), 'dd MMM')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pb-1">
                 <button 
                    onClick={() => onManagePermissions(role)}
                    className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all"
                 >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Permissions
                 </button>
                 <button 
                    onClick={() => onEdit(role)}
                    className="flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all"
                 >
                    <Pencil className="w-3.5 h-3.5" />
                    Settings
                 </button>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                 <button 
                    onClick={() => handleStatusToggle(role)}
                    className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${role.status === 'ACTIVE' ? 'text-amber-500' : 'text-emerald-500'}`}
                 >
                    {role.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    Mark {role.status === 'ACTIVE' ? 'Inactive' : 'Active'}
                 </button>
                 <button 
                    onClick={() => canDeleteRole(role) && onDelete(role.id, role.name)}
                    disabled={!canDeleteRole(role)}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={getDeleteTooltip(role)}
                 >
                    <Trash2 className="w-3.5 h-3.5" />
                    Archive
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination (Responsive) */}
      <div className="p-4 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
        <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">
          Displaying <span className="text-gray-900 font-black">{(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, total)}</span> of <span className="text-gray-900 font-black">{total}</span> Units
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
            {/* Show only current page button on mobile to save space if needed, or keep short list */}
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

export default RolesTable;
