import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarClock, Loader2, X } from 'lucide-react';
import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { updateLead } from '../../../services/leads.api';
import { useLifecycleExtensionLimit } from '../../../hooks/useLifecycleExtensionLimit';
import {
  lifecycleExtensionHint,
  maxDateTimeLocalFromLifecycleLimit,
} from '../../../modules/followups/followupLifecycleUi';
import { useWeeklyOffScheduleGuard } from '../../../hooks/useWeeklyOffScheduleGuard';
import { MANDATORY_FOLLOWUP_QUERY_KEY } from '../../../constants/mandatoryFollowup.constants';
import { OVERDUE_MANDATORY_QUERY_KEY } from '../../../hooks/useOverdueMandatoryFollowUps';

interface SheetFollowUpModalProps {
  isOpen: boolean;
  leadId?: string;
  leadName?: string;
  currentFollowUpAt?: string | null;
  onClose: () => void;
  onSaved: (newIsoDate: string) => void;
}

const toInputDateTimeLocal = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

const formatCurrentDisplay = (dateStr?: string | null): string => {
  if (!dateStr) return 'None scheduled';
  try {
    const d = parseISO(dateStr);
    if (isPast(d) && !isToday(d)) return `Overdue – ${format(d, 'dd MMM yyyy • hh:mm a')}`;
    if (isToday(d)) return `Today • ${format(d, 'hh:mm a')}`;
    if (isTomorrow(d)) return `Tomorrow • ${format(d, 'hh:mm a')}`;
    return format(d, 'dd MMM yyyy • hh:mm a');
  } catch {
    return dateStr;
  }
};

const SheetFollowUpModal: React.FC<SheetFollowUpModalProps> = ({
  isOpen,
  leadId,
  leadName,
  currentFollowUpAt,
  onClose,
  onSaved,
}) => {
  const queryClient = useQueryClient();
  const { confirmIfWeeklyOff, WeeklyOffScheduleModal } = useWeeklyOffScheduleGuard();

  const [value, setValue] = useState<string>('');
  const [description, setDescription] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setValue(toInputDateTimeLocal(currentFollowUpAt) || toInputDateTimeLocal(new Date().toISOString()));
      setDescription('');
    }
  }, [isOpen, currentFollowUpAt, leadId]);

  const lifecycleQuery = useLifecycleExtensionLimit(leadId, isOpen && Boolean(leadId));
  const lifecycle = lifecycleQuery.data?.data;

  const minDateTime = useMemo(() => {
    const next = new Date();
    next.setMinutes(next.getMinutes() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${pad(next.getHours())}:${pad(next.getMinutes())}`;
  }, [isOpen]);

  const maxDateTime = useMemo(
    () =>
      lifecycle?.applies && !lifecycle.canOverride
        ? maxDateTimeLocalFromLifecycleLimit(lifecycle.maxExtensionDate)
        : undefined,
    [lifecycle],
  );

  const lifecycleHint = useMemo(
    () =>
      lifecycle?.applies
        ? lifecycleExtensionHint({
            applies: true,
            remainingDays: lifecycle.remainingDays,
            maxFollowUpDate: lifecycle.maxExtensionDate?.slice(0, 10) ?? null,
            canOverride: lifecycle.canOverride,
          })
        : null,
    [lifecycle],
  );

  const lifecycleBlocked = Boolean(lifecycle?.applies && !lifecycle?.canOverride && lifecycle.remainingDays === 0);

  const mutation = useMutation({
    mutationFn: ({ id, isoDate, note }: { id: string; isoDate: string; note?: string }) =>
      updateLead(id, {
        nextFollowUpAt: isoDate,
        ...(note ? { followUpDescription: note } : {}),
      } as any),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      }
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'advanced-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'advanced-calendar-details'] });
      queryClient.invalidateQueries({ queryKey: MANDATORY_FOLLOWUP_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: OVERDUE_MANDATORY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      const updatedLead = response?.approvalRequired ? response?.data?.lead : response?.data;
      const newDate = updatedLead?.nextFollowUpAt;
      onSaved(newDate || new Date(value).toISOString());
      toast.success('Follow-up updated');
      onClose();
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 422) {
        toast.error(message || 'Invalid follow-up date.');
        return;
      }
      toast.error(message || 'Failed to update follow-up');
    },
  });

  const handleSubmit = async () => {
    if (!leadId) {
      toast.error('No lead is linked to this cell.');
      return;
    }
    if (!value) {
      toast.error('Please select a follow-up date and time.');
      return;
    }
    const selectedDate = new Date(value);
    if (selectedDate.getTime() <= Date.now()) {
      toast.error('Follow-up date must be in the future.');
      return;
    }
    const proceed = await confirmIfWeeklyOff(value);
    if (!proceed) return;
    mutation.mutate({ id: leadId, isoDate: selectedDate.toISOString(), note: description.trim() || undefined });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/55 backdrop-blur-sm"
            aria-label="Close follow-up modal"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="relative w-full max-w-md rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-black text-gray-900">Schedule Follow-up</h3>
              </div>
              <button onClick={onClose} className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5 flex-1 overflow-y-auto min-h-0 scrollbar-thin">
              {leadName && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500">Lead</p>
                  <p className="mt-0.5 text-sm font-bold text-gray-800 truncate">{leadName}</p>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Current Follow-up
                </label>
                <div className="mt-1 text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                  {formatCurrentDisplay(currentFollowUpAt)}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">
                  New Follow-up Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={value}
                  min={minDateTime}
                  max={maxDateTime}
                  onChange={(e) => setValue(e.target.value)}
                  disabled={lifecycleBlocked}
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
                {lifecycleHint && (
                  <p className={`mt-1.5 text-[11px] font-semibold leading-relaxed ${lifecycleBlocked ? 'text-rose-600' : 'text-amber-700'}`}>
                    {lifecycleHint}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Follow-up Note <span className="text-gray-300">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="e.g. Customer requested callback tomorrow."
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 resize-y"
                />
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-black text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={mutation.isPending || !value || lifecycleBlocked}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Follow-up
              </button>
            </div>
          </motion.div>
          {WeeklyOffScheduleModal}
        </div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(SheetFollowUpModal);
