import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  UserPlus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Target
} from 'lucide-react';
import { useUsersStore } from '../../store/useUsersStore';
import { useUsersQuery } from '../../hooks/useUsersQuery';
import { useUpdateStatusMutation, useDeleteUserMutation, useUnlockUserMutation } from '../../hooks/useUserMutations';

const UsersTable = () => {
  const { search, setSearch, filters, setFilters, page, setPage, openCreateModal } = useUsersStore();
  const { data: usersData, isLoading } = useUsersQuery();
  
  const updateStatus = useUpdateStatusMutation();
  const deleteUser = useDeleteUserMutation();
  const unlockUser = useUnlockUserMutation();

  const users = usersData?.data?.users || [];
  const totalPages = usersData?.data?.pages || 1;

  const handleStatusToggle = (id: string, currentStatus: boolean) => {
    updateStatus.mutate({ id, isActive: !currentStatus });
  };

  const handleUnlock = (id: string) => {
    unlockUser.mutate(id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-50 rounded-xl focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-50">
            <button
              onClick={() => setFilters({ ...filters, status: undefined })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${!filters.status ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilters({ ...filters, status: 'active' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filters.status === 'active' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilters({ ...filters, status: 'locked' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filters.status === 'locked' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Locked
            </button>
          </div>

          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role / Dept</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-10 w-40 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-10 w-32 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-100 rounded-full"></div></td>
                  <td className="px-6 py-4"><div className="h-8 w-8 ml-auto bg-gray-100 rounded-lg"></div></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No users found match your criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user: any) => (
                <motion.tr
                  key={user.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{user.name || 'Invited User'}</div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-medium">{user.email}</span>
                            {user.username && <span className="text-[9px] text-emerald-500 font-bold">@{user.username}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-tight w-fit">
                        <ShieldCheck className="w-3 h-3" />
                        {user.role?.name || 'User'}
                      </span>
                      <span className="text-xs text-gray-500">{user.department?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {user.isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-tight w-fit">
                          <Lock className="w-2.5 h-2.5" />
                          Locked
                        </span>
                      ) : user.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-tight w-fit">
                          <UserCheck className="w-2.5 h-2.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-tight w-fit">
                          <UserX className="w-2.5 h-2.5" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user.isLocked && (
                        <button
                          onClick={() => handleUnlock(user.id)}
                          className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Unlock Account"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openCreateModal(user.id)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Target className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusToggle(user.id, user.isActive)}
                        className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Showing <span className="font-bold">{(page - 1) * 10 + 1}</span> to <span className="font-bold">{Math.min(page * 10, usersData?.data?.total || 0)}</span> of <span className="font-bold">{usersData?.data?.total || 0}</span> users
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2 bg-white border border-gray-100 rounded-lg disabled:opacity-50 text-gray-600 hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2 bg-white border border-gray-100 rounded-lg disabled:opacity-50 text-gray-600 hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UsersTable);
