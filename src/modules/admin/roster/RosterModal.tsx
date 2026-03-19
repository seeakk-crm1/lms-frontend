import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Loader2, Pencil, Plus, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import RosterForm from './RosterForm';
import { useBulkRosterMutation, useCreateRosterMutation, useDeleteRosterMutation, useUpdateRosterMutation } from './useRosterMutation';
import type { RosterEntry, RosterFormValues, RosterUser } from './types';

interface Props {
  isOpen: boolean;
  isFormOpen: boolean;
  user: RosterUser | null;
  entries: RosterEntry[];
  isLoading: boolean;
  editingEntry: RosterEntry | null;
  departmentId?: string;
  onClose: () => void;
  onOpenCreate: () => void;
  onCloseForm: () => void;
  onEdit: (entry: RosterEntry) => void;
}

const toDate = (value: string) => new Date(`${value}T00:00:00`);

const getDateRange = (entry: Pick<RosterEntry, 'startDate' | 'endDate'>): { start: Date; end: Date } => {
  const start = new Date(entry.startDate);
  const end = entry.endDate ? new Date(entry.endDate) : new Date(entry.startDate);
  return { start, end };
};

const hasOverlap = (candidate: { startDate: string; endDate?: string; id?: string }, entries: RosterEntry[]): boolean => {
  const start = toDate(candidate.startDate);
  const end = candidate.endDate ? toDate(candidate.endDate) : toDate(candidate.startDate);

  return entries.some((entry) => {
    if (entry.status !== 'ACTIVE') return false;
    if (candidate.id && entry.id === candidate.id) return false;
    const range = getDateRange(entry);
    return start <= range.end && end >= range.start;
  });
};

const RosterModal: React.FC<Props> = ({
  isOpen,
  isFormOpen,
  user,
  entries,
  isLoading,
  editingEntry,
  departmentId,
  onClose,
  onOpenCreate,
  onCloseForm,
  onEdit,
}) => {
  const [confirmDelete, setConfirmDelete] = useState<RosterEntry | null>(null);
  const createRoster = useCreateRosterMutation();
  const updateRoster = useUpdateRosterMutation();
  const deleteRoster = useDeleteRosterMutation();
  const bulkRoster = useBulkRosterMutation();

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
    [entries],
  );

  if (!user) return null;

  const handleSubmit = async (values: RosterFormValues) => {
    const payload = {
      rosterType: values.rosterType,
      name: values.name.trim(),
      startDate: values.startDate,
      endDate: values.rosterType === 'HOLIDAY' ? null : values.endDate || null,
      shiftSession: values.rosterType === 'SHIFT' ? values.shiftSession : undefined,
      shiftStartTime: values.rosterType === 'SHIFT' ? values.shiftStartTime || null : null,
      shiftEndTime: values.rosterType === 'SHIFT' ? values.shiftEndTime || null : null,
      status: values.status,
    };

    const overlapSource = editingEntry ? sortedEntries.filter((entry) => entry.id !== editingEntry.id) : sortedEntries;
    if (values.status === 'ACTIVE' && hasOverlap({ startDate: values.startDate, endDate: payload.endDate || undefined }, overlapSource)) {
      toast.error('Date range overlaps with an existing active roster entry.');
      return;
    }

    if (editingEntry) {
      await updateRoster.mutateAsync({
        id: editingEntry.id,
        data: payload,
      });
      onCloseForm();
      return;
    }

    if (values.assignScope === 'DEPARTMENT') {
      if (!departmentId) {
        toast.error('Department is required for department scope assignment.');
        return;
      }
      await bulkRoster.mutateAsync({
        departmentId,
        ...payload,
      });
      onCloseForm();
      return;
    }

    await createRoster.mutateAsync({
      userId: user.id,
      ...payload,
    });
    onCloseForm();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteRoster.mutateAsync(confirmDelete.id);
    setConfirmDelete(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            aria-label="Close roster modal overlay"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-6xl rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col"
          >
            <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900">Roster Depends upon Users</h2>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  {user.name} • {user.department || 'Unassigned'} • {user.supervisor || 'No supervisor'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-500 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-5">
              <div className="flex justify-between items-center">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Roster Entries</p>
                <motion.button
                  whileHover={{ y: -1, scale: 1.02 }}
                  onClick={onOpenCreate}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-black hover:bg-emerald-600"
                >
                  <Plus className="w-4 h-4" />
                  Create Roster Entry
                </motion.button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full min-w-[1080px]">
                  <thead className="bg-gray-50/70">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-gray-400">Roster Name</th>
                      <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-gray-400">Roster Type</th>
                      <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-gray-400">Date / Date Range</th>
                      <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-gray-400">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-gray-400">Created Date</th>
                      <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-gray-400">Modified Date</th>
                      <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-gray-400">Created By</th>
                      <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          {Array.from({ length: 8 }).map((__, col) => (
                            <td key={col} className="px-4 py-3">
                              <div className="h-4 w-20 rounded shimmer-bg" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : sortedEntries.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-14 text-center">
                          <CalendarDays className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm font-black text-gray-700">No roster entries</p>
                          <p className="text-xs text-gray-400">Create your first roster entry for this user</p>
                        </td>
                      </tr>
                    ) : (
                      sortedEntries.map((entry, index) => (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          className="hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-black text-gray-900">{entry.name}</td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-700">{entry.rosterType}</td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-600">
                            {format(new Date(entry.startDate), 'dd MMM yyyy')}
                            {entry.endDate ? ` - ${format(new Date(entry.endDate), 'dd MMM yyyy')}` : ''}
                            {entry.rosterType === 'SHIFT' && entry.shiftSession && entry.shiftStartTime && entry.shiftEndTime
                              ? ` • ${entry.shiftSession} (${entry.shiftStartTime}-${entry.shiftEndTime})`
                              : ''}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                                entry.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {entry.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-gray-500">{format(new Date(entry.createdAt), 'dd MMM yyyy')}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-gray-500">{format(new Date(entry.updatedAt), 'dd MMM yyyy')}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-gray-500 inline-flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {entry.createdBy || 'System'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => onEdit(entry)}
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(entry)}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                title="Delete"
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

              <AnimatePresence>
                {isFormOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-4 sm:p-5"
                  >
                    <RosterForm
                      user={user}
                      defaultEntry={editingEntry}
                      canDepartmentAssign={Boolean(departmentId)}
                      isSubmitting={
                        createRoster.isPending || updateRoster.isPending || bulkRoster.isPending
                      }
                      onCancel={onCloseForm}
                      onSubmit={handleSubmit}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <AnimatePresence>
            {confirmDelete && (
              <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfirmDelete(null)}
                  className="absolute inset-0 bg-gray-900/50"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-xl p-5"
                >
                  <h3 className="text-base font-black text-gray-900">Delete roster entry?</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This will soft-delete <span className="font-bold text-gray-700">{confirmDelete.name}</span>.
                  </p>
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-black text-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteRoster.isPending}
                      className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-black hover:bg-red-600 inline-flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {deleteRoster.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Delete
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(RosterModal);
