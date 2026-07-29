import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, ShieldOff, Timer } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { extendTargetGrace, listLockedStaff, unlockTargetStaff } from '../../services/target.api';
import { getOffices } from '../../services/users.api';
import type { Office } from '../../types/admin/office/office.types';

const UnlockStaffPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [graceUserId, setGraceUserId] = useState<string | null>(null);
  const [graceDate, setGraceDate] = useState('');
  const [reason, setReason] = useState('');
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('ALL');

  const officesQuery = useQuery({
    queryKey: ['offices-options'],
    queryFn: getOffices,
    staleTime: 5 * 60_000,
  });

  const offices = useMemo(() => {
    const raw = (officesQuery.data?.offices || []) as Office[];
    return raw
      .filter((o) => o.id && o.isActive !== false)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [officesQuery.data]);

  const { data, isLoading } = useQuery({
    queryKey: ['locked-staff', selectedOfficeId],
    queryFn: () => listLockedStaff({ officeId: selectedOfficeId !== 'ALL' ? selectedOfficeId : undefined }),
  });

  const unlockMutation = useMutation({
    mutationFn: ({ userId, reason: unlockReason }: { userId: string; reason?: string }) =>
      unlockTargetStaff(userId, unlockReason),
    onSuccess: () => {
      toast.success('Staff account unlocked.');
      queryClient.invalidateQueries({ queryKey: ['locked-staff'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Unlock failed'),
  });

  const graceMutation = useMutation({
    mutationFn: ({ userId, graceUntil }: { userId: string; graceUntil: string }) =>
      extendTargetGrace(userId, graceUntil, reason),
    onSuccess: () => {
      toast.success('Grace period extended.');
      setGraceUserId(null);
      setGraceDate('');
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['locked-staff'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to extend grace'),
  });

  const lockedUsers = data?.data || [];

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">Unlock Staff</h1>
              <p className="text-sm text-gray-500 mt-1">
                Target-locked accounts can only be unlocked by their supervisor or an authorized admin.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedOfficeId}
                onChange={(e) => setSelectedOfficeId(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 bg-white"
              >
                <option value="ALL">All Offices</option>
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Staff', 'Target Cycle', 'Completion', 'Lock Reason', 'Supervisor', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                      Loading locked staff…
                    </td>
                  </tr>
                ) : lockedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm font-semibold text-gray-500">
                      {selectedOfficeId !== 'ALL'
                        ? 'No locked staff found for this office.'
                        : 'No locked staff at the moment.'}
                    </td>
                  </tr>
                ) : (
                  lockedUsers.map((row: any) => (
                    <tr key={row.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-gray-900">{row.name || row.email}</p>
                        <p className="text-xs text-gray-500">{row.email}</p>
                        {row.office?.name && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-semibold">
                            {row.office.name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-700">
                        {row.targetCycle?.name || '—'}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-rose-600">
                        {Math.round(row.completionPercentage || 0)}%
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-600 max-w-[200px]">
                        {row.targetLockReason || 'Target incomplete'}
                        {row.targetLockedAt ? (
                          <p className="text-[10px] text-gray-400 mt-1">
                            {format(new Date(row.targetLockedAt), 'dd MMM yyyy, hh:mm a')}
                          </p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {row.hasUsedSelfUnlock && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold">
                              Self Unlocked
                            </span>
                          )}
                          {row.isEscalatedLock && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                              Escalated Lock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {row.supervisor?.name || row.supervisor?.email || 'No supervisor'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => unlockMutation.mutate({ userId: row.id, reason })}
                            disabled={unlockMutation.isPending}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                          >
                            <ShieldOff className="h-3.5 w-3.5" />
                            Unlock
                          </button>
                          <button
                            type="button"
                            onClick={() => setGraceUserId(row.id)}
                            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700"
                          >
                            <Timer className="h-3.5 w-3.5" />
                            Grace
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {graceUserId ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Grace until</label>
                <input
                  type="date"
                  value={graceDate}
                  onChange={(e) => setGraceDate(e.target.value)}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-gray-600 block mb-1">Reason</label>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Optional note"
                />
              </div>
              <button
                type="button"
                disabled={!graceDate || graceMutation.isPending}
                onClick={() => graceMutation.mutate({ userId: graceUserId, graceUntil: graceDate })}
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Apply grace
              </button>
              <button type="button" onClick={() => setGraceUserId(null)} className="text-sm font-bold text-gray-500">
                Cancel
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UnlockStaffPage;
