import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Target,
  Mail,
  UserPlus,
  Pencil,
  Trash2,
  Key
} from 'lucide-react';
import { useUsersStore } from '../../store/useUsersStore';
import { useUsersQuery } from '../../hooks/useUsersQuery';
import {
  useUpdateStatusMutation,
  useDeleteUserMutation,
  useUnlockUserMutation,
  useResetPasswordMutation,
  useSendInviteMutation,
  useResendInviteMutation,
} from '../../hooks/useUserMutations';
import { User } from '../../types/user.types';
import { getInviteActionState, getUserActivationStatus } from '../../utils/inviteEligibility';
import DeleteUserModal from './DeleteUserModal';

const UsersTable: React.FC = () => {
  const { search, setSearch, filters, setFilters, page, setPage, openCreateModal } = useUsersStore();
  const { data: usersData, isLoading } = useUsersQuery();
  
  const updateStatus = useUpdateStatusMutation();
  const unlockUser = useUnlockUserMutation();
  const deleteUser = useDeleteUserMutation();
  const resetPassword = useResetPasswordMutation();
  const sendInvite = useSendInviteMutation();
  const resendInvite = useResendInviteMutation();
  const [inviteActionId, setInviteActionId] = useState<string | null>(null);
  const [inviteSentMap, setInviteSentMap] = useState<Record<string, boolean>>({});

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; userId: string; userName: string }>({
    open: false,
    userId: '',
    userName: ''
  });

  const users = usersData?.users || [];
  const totalPages = usersData?.pagination?.totalPages || 1;
  const totalUsers = usersData?.pagination?.total || 0;

  const getRoleLabel = (user: User): string => {
    if (typeof user.role === 'string') return user.role || 'Unassigned Role';
    if (user.role && typeof user.role === 'object' && 'name' in user.role) {
      return (user.role as any).name || 'Unassigned Role';
    }
    return 'Unassigned Role';
  };

  const getDepartmentLabel = (user: User): string => {
    if (typeof user.department === 'string') return user.department || 'Unassigned';
    if (user.department && typeof user.department === 'object' && 'name' in (user.department as any)) {
      return (user.department as any).name || 'Unassigned';
    }
    return 'Unassigned';
  };

  const handleStatusToggle = (id: string, currentStatus: boolean) => {
    updateStatus.mutate({ id, isActive: !currentStatus });
  };

  const handleUnlock = (id: string) => {
    unlockUser.mutate(id);
  };

  const handleResetPassword = async (userId: string, email: string) => {
    try {
      const res: any = await resetPassword.mutateAsync({ id: userId, payload: {} });
      const generatedPassword = res?.data?.generatedPassword;
      if (generatedPassword) {
        toast.success(`Password reset for ${email}. New password: ${generatedPassword}`, { duration: 7000 });
        return;
      }
      toast.success(res?.message || `Password reset successfully for ${email}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteModal({ open: true, userId: id, userName: name });
  };

  const getSortedInvites = (user: User) =>
    [...(user.receivedInvites || [])].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );

  const getLatestValidPendingInvite = (user: User) =>
    getSortedInvites(user).find((invite) => {
      if (invite.usedAt) return false;
      const expiresAtMs = new Date(invite.expiresAt).getTime();
      return Number.isFinite(expiresAtMs) && expiresAtMs > Date.now();
    }) || null;

  const hasPendingInvite = (user: User): boolean => Boolean(getLatestValidPendingInvite(user));

  const renderActivationStatusBadge = (user: User, compact = false) => {
    if (user.isLocked) {
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 font-bold uppercase tracking-tight w-fit ${
            compact ? 'px-2 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
          }`}
        >
          <Lock className={compact ? 'w-2.5 h-2.5' : 'w-2.5 h-2.5'} />
          Locked
        </span>
      );
    }

    const status = getUserActivationStatus(user);
    const toneClass =
      status.tone === 'pending'
        ? 'bg-amber-50 text-amber-600'
        : status.tone === 'active'
          ? 'bg-emerald-50 text-emerald-600'
          : 'bg-gray-100 text-gray-500';

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-tight w-fit ${toneClass} ${
          compact ? 'px-2 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
        }`}
      >
        {status.tone === 'inactive' ? (
          <UserX className="w-2.5 h-2.5" />
        ) : (
          <UserCheck className="w-2.5 h-2.5" />
        )}
        {status.label}
      </span>
    );
  };

  const resolveInviteActionState = (user: User) => {
    const latestInvite = getLatestValidPendingInvite(user);
    return getInviteActionState(user, {
      hasPendingInvite: hasPendingInvite(user),
      pendingInviteId: latestInvite?.id,
    });
  };

  const shouldShowInviteSent = (user: User): boolean => inviteSentMap[user.id] || hasPendingInvite(user);

  /** Show mail badge only when invite actions are valid for the user's account state. */
  const shouldShowInviteNameBadge = (user: User): boolean => Boolean(resolveInviteActionState(user));


  const handleSendInvite = async (userId: string) => {
    try {
      setInviteActionId(userId);
      await sendInvite.mutateAsync(userId);
      setInviteSentMap((current) => ({ ...current, [userId]: true }));
    } catch {
      // Error toast is handled in mutation hook.
    } finally {
      setInviteActionId(null);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      setInviteActionId(inviteId);
      await resendInvite.mutateAsync(inviteId);
    } catch {
      // Error toast is handled in mutation hook.
    } finally {
      setInviteActionId(null);
    }
  };

  const confirmDelete = () => {
    if (deleteModal.userId) {
      deleteUser.mutate(deleteModal.userId);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-50 rounded-xl focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-50 flex-1 sm:flex-none overflow-x-auto">
            <button
              onClick={() => setFilters({ ...filters, isActive: undefined })}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${filters.isActive === undefined ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilters({ ...filters, isActive: true })}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${filters.isActive === true ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilters({ ...filters, isActive: false })}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${filters.isActive === false ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Inactive
            </button>
          </div>

          <button
            onClick={() => openCreateModal()}
            className="flex items-center justify-center gap-2 p-2 sm:px-4 sm:py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0"
            title="Add New User"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline text-xs sm:text-sm font-bold">Add</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
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
              users.map((user: User) => (
                <motion.tr
                  key={user.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    // Only open modal if clicking the row background or cells, not buttons/links
                    if (target.tagName === 'TD' || target.classList.contains('group')) {
                      openCreateModal(user.id);
                    }
                  }}
                  className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0"
                      >
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm font-bold text-gray-900 truncate flex items-center gap-2"
                        >
                          {user.name || 'Invited User'}
                          {shouldShowInviteNameBadge(user) && (() => {
                            const inviteAction = resolveInviteActionState(user);
                            if (!inviteAction) return null;
                            const isActionPending = sendInvite.isPending || resendInvite.isPending;
                            const isActiveId = inviteAction.kind === 'SEND' 
                              ? inviteActionId === user.id 
                              : inviteAction.kind === 'RESEND' 
                                ? inviteActionId === inviteAction.inviteId 
                                : false;

                            return (
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (inviteAction.kind === 'SEND') {
                                    handleSendInvite(user.id);
                                  } else if (inviteAction.kind === 'RESEND') {
                                    handleResendInvite(inviteAction.inviteId);
                                  }
                                }}
                                disabled={isActionPending || isActiveId}
                                title={inviteAction.title} 
                                className="flex items-center justify-center p-0.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                              >
                                <Mail className="w-3 h-3" />
                              </button>
                            );
                          })()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-medium truncate">{user.email}</span>
                            {user.username && <span className="text-[9px] text-emerald-500 font-bold">@{user.username}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-tight w-fit">
                        <ShieldCheck className="w-3 h-3" />
                        {getRoleLabel(user)}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[150px]">{getDepartmentLabel(user)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {renderActivationStatusBadge(user)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(() => {
                      const inviteAction = resolveInviteActionState(user);
                      return (
                    <div className="flex items-center justify-end gap-2">
                      {inviteAction ? (() => {
                        const ia = inviteAction;
                        const busy =
                          (ia.kind === 'SEND' && (inviteActionId === user.id || sendInvite.isPending || resendInvite.isPending)) ||
                          (ia.kind === 'RESEND' && (inviteActionId === ia.inviteId || sendInvite.isPending || resendInvite.isPending));
                        const disabled = busy;
                        return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (ia.kind === 'SEND') {
                              handleSendInvite(user.id);
                            } else if (ia.kind === 'RESEND') {
                              handleResendInvite(ia.inviteId);
                            }
                          }}
                          disabled={disabled}
                          className="p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-emerald-600 hover:bg-emerald-50"
                          title={ia.title}
                          aria-label="Send invitation email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        );
                      })() : null}
                      {user.isLocked && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUnlock(user.id); }}
                          className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Unlock Account"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleResetPassword(user.id, user.email); }}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Send Reset Password Link"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openCreateModal(user.id); }}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(user.id, user.name || user.email); }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusToggle(user.id, !!user.isActive); }}
                        className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                      );
                    })()}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-50 bg-white">
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
              <div className="h-10 w-full bg-gray-50 rounded-xl" />
            </div>
          ))
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
             </div>
             <p className="text-gray-500 text-sm font-bold">No results found</p>
             <p className="text-gray-400 text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          users.map((user: User) => (
            (() => {
              const inviteAction = resolveInviteActionState(user);
              return (
            <div 
                key={user.id} 
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  // Stop modal if clicking specific action buttons (handled by their own stopPropagation, but this is a safety net)
                  if (target.closest('button')) return;
                  openCreateModal(user.id);
                }}
                className="p-5 space-y-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-emerald-600 font-black text-lg shrink-0 border border-emerald-100/50">
                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-gray-900 truncate flex items-center gap-2">
                      {user.name || 'Invited User'}
                      {shouldShowInviteNameBadge(user) && (
                        <span
                          title={
                            hasPendingInvite(user)
                              ? 'Invitation pending — resend from actions'
                              : 'Send invitation from row actions'
                          }
                          className="flex items-center justify-center p-0.5 bg-emerald-50 text-emerald-500 rounded-md"
                        >
                          <Mail className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium truncate mb-1">{user.email}</div>
                    <div className="flex items-center gap-1.5">
                        {renderActivationStatusBadge(user, true)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openCreateModal(user.id); }}
                    className="p-2.5 bg-blue-50 text-blue-600 rounded-xl active:scale-95 transition-all"
                    title="Edit User"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id, user.name || user.email)}
                    className="p-2.5 bg-red-50 text-red-600 rounded-xl active:scale-95 transition-all"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Role / Dept</span>
                      <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-purple-600">{getRoleLabel(user)}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-xs text-gray-600 font-bold">{getDepartmentLabel(user)}</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      {inviteAction ? (() => {
                        const ia = inviteAction;
                        const busy =
                          (ia.kind === 'SEND' && (inviteActionId === user.id || sendInvite.isPending || resendInvite.isPending)) ||
                          (ia.kind === 'RESEND' && (inviteActionId === ia.inviteId || sendInvite.isPending || resendInvite.isPending));
                        const disabled = busy;
                        return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (ia.kind === 'SEND') {
                              handleSendInvite(user.id);
                            } else if (ia.kind === 'RESEND') {
                              handleResendInvite(ia.inviteId);
                            }
                          }}
                          disabled={disabled}
                          className="p-2 rounded-lg border shadow-sm disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-50 text-emerald-600 border-emerald-100"
                          title={ia.title}
                          aria-label="Send invitation email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        );
                      })() : null}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleResetPassword(user.id, user.email); }}
                        className="p-2 text-amber-500 bg-white border border-gray-100 rounded-lg shadow-sm"
                        title="Send Reset Password Link"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusToggle(user.id, !!user.isActive)}
                        className={`p-2 rounded-lg border shadow-sm ${user.isActive ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}
                      >
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                  </div>
              </div>
            </div>
              );
            })()
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Showing <span className="font-bold">{totalUsers === 0 ? 0 : (page - 1) * 10 + 1}</span> to <span className="font-bold">{Math.min(page * 10, totalUsers)}</span> of <span className="font-bold">{totalUsers}</span> users
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

      <DeleteUserModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={confirmDelete}
        userName={deleteModal.userName}
      />
    </div>
  );
};

export default React.memo(UsersTable);
