import React, { useCallback, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, Loader2, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SearchableSelect from '../../components/SearchableSelect';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import CalendarHeader from '../../components/calendar/CalendarHeader';
import CalendarView from '../../components/calendar/CalendarView';
import CompleteFollowUpModal from '../../components/calendar/CompleteFollowUpModal';
import FollowUpActionModal from '../../components/calendar/FollowUpActionModal';
import SnoozeFollowUpModal from '../../components/calendar/SnoozeFollowUpModal';
import {
  useCompleteFollowUpMutation,
  useCreateFollowUpMutation,
  useFollowUpLeadsQuery,
  useSnoozeFollowUpMutation,
  useFollowUpUsersQuery,
  useAdvancedCalendarSummaryQuery,
} from '../../hooks/useFollowUps';
import { useWeeklyOffScheduleGuard } from '../../hooks/useWeeklyOffScheduleGuard';
import { useMandatoryFollowUpContinuationQuery } from '../../hooks/useMandatoryFollowUpContinuation';
import { useLifecycleExtensionLimit } from '../../hooks/useLifecycleExtensionLimit';
import {
  lifecycleExtensionHint,
  maxDateTimeLocalFromLifecycleLimit,
} from '../../modules/followups/followupLifecycleUi';
import useFollowupStore from '../../store/followupStore';
import type { CreateFollowUpInput } from '../../types/followup.types';
import type { FollowUp } from '../../types/followup.types';

const scheduleSchema = z.object({
  leadId: z.string().trim().min(1, 'Lead ID is required'),
  type: z.enum(['CALL', 'VISIT', 'MEETING']),
  scheduledAt: z.string().trim().min(1, 'Schedule date & time is required'),
  description: z.string().trim().max(1000).optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

const CalendarPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionFollowUp, setActionFollowUp] = useState<FollowUp | null>(null);
  const [snoozeFollowUpItem, setSnoozeFollowUpItem] = useState<FollowUp | null>(null);
  const [snoozeDateTime, setSnoozeDateTime] = useState('');
  const [recentDescription, setRecentDescription] = useState('');
  const [snoozeReasonId, setSnoozeReasonId] = useState('');
  const [reminderActionType, setReminderActionType] = useState<'SNOOZE' | 'REMIND_LATER'>('SNOOZE');
  const navigate = useNavigate();

  const {
    view,
    calendarContentFilter,
    selectedDate,
    selectedUser,
    modalOpen,
    selectedFollowUp,
    setView,
    setCalendarContentFilter,
    setDate,
    setUser,
    openModal,
    closeModal,
  } = useFollowupStore();

  const advancedSummaryQuery = useAdvancedCalendarSummaryQuery();
  const mandatoryContinuationQuery = useMandatoryFollowUpContinuationQuery();
  const mandatoryCount = mandatoryContinuationQuery.data?.items?.length ?? 0;
  const usersQuery = useFollowUpUsersQuery();
  const leadsQuery = useFollowUpLeadsQuery();
  const createMutation = useCreateFollowUpMutation();
  const completeMutation = useCompleteFollowUpMutation();
  const snoozeMutation = useSnoozeFollowUpMutation();
  const { confirmIfWeeklyOff, WeeklyOffScheduleModal } = useWeeklyOffScheduleGuard();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      leadId: '',
      type: 'CALL',
      scheduledAt: '',
      description: '',
    },
  });

  const selectedLeadId = watch('leadId');
  const lifecycleLimitQuery = useLifecycleExtensionLimit(
    selectedLeadId,
    isCreateModalOpen && Boolean(selectedLeadId),
  );
  const createLifecycle = lifecycleLimitQuery.data?.data;
  const createLifecycleBlocked = Boolean(
    createLifecycle?.applies && !createLifecycle?.canOverride && createLifecycle.remainingDays === 0,
  );
  const createLifecycleMax = useMemo(
    () =>
      createLifecycle?.applies && !createLifecycle.canOverride
        ? maxDateTimeLocalFromLifecycleLimit(createLifecycle.maxExtensionDate)
        : undefined,
    [createLifecycle],
  );
  const createLifecycleHint = useMemo(
    () =>
      createLifecycle?.applies
        ? lifecycleExtensionHint({
            applies: true,
            remainingDays: createLifecycle.remainingDays,
            maxFollowUpDate: createLifecycle.maxExtensionDate?.slice(0, 10) ?? null,
            canOverride: createLifecycle.canOverride,
          })
        : null,
    [createLifecycle],
  );

  const calendarSummary = useMemo(
    () => advancedSummaryQuery.data?.data.summary || [],
    [advancedSummaryQuery.data],
  );

  const onScheduleFollowUp = useCallback(
    async (values: ScheduleFormValues) => {
      const proceed = await confirmIfWeeklyOff(values.scheduledAt);
      if (!proceed) return;

      const payload: CreateFollowUpInput = {
        leadId: values.leadId.trim(),
        type: values.type,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        ...(values.description?.trim() ? { description: values.description.trim() } : {}),
      };
      await createMutation.mutateAsync(payload);
      reset();
      setIsCreateModalOpen(false);
    },
    [confirmIfWeeklyOff, createMutation, reset],
  );

  return (
    <DashboardLayout>
        <div className="custom-scrollbar relative flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <div className="pointer-events-none absolute right-0 top-0 -z-10 h-[520px] w-[820px] bg-gradient-to-bl from-emerald-50/80 via-transparent to-transparent" />

          <div className="mx-auto max-w-[1480px] space-y-6">
            {mandatoryCount > 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                {mandatoryCount} lifecycle lead{mandatoryCount === 1 ? '' : 's'} need a future follow-up scheduled.
                Complete the mandatory follow-up dialog to unlock the rest of the app.
              </div>
            ) : null}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CalendarHeader
                view={view}
                contentFilter={calendarContentFilter}
                selectedDate={selectedDate}
                selectedUser={selectedUser}
                users={usersQuery.data || []}
                onToday={() => setDate(new Date().toISOString())}
                onNavigate={setDate}
                onViewChange={setView}
                onContentFilterChange={setCalendarContentFilter}
                onUserChange={setUser}
              />
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 md:self-start"
              >
                <Plus className="h-4 w-4" />
                Schedule Follow-up
              </button>
            </div>

            {advancedSummaryQuery.data?.data.analytics ? (
              <div className="grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-emerald-50 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Stage Follow-Ups</p>
                  <p className="mt-1 text-lg font-black text-emerald-900">
                    {advancedSummaryQuery.data.data.analytics.stageFollowUpCounts.reduce((s, r) => s + r.count, 0)}
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Stage Lead Entries</p>
                  <p className="mt-1 text-lg font-black text-blue-900">
                    {advancedSummaryQuery.data.data.analytics.stageLeadCreationCounts.reduce((s, r) => s + r.count, 0)}
                  </p>
                </div>
                <div className="rounded-xl bg-red-50 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Overdue Extended</p>
                  <p className="mt-1 text-lg font-black text-red-900">
                    {advancedSummaryQuery.data.data.analytics.overdueFollowUpCounts}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Delay Analytics</p>
                  <p className="mt-1 text-lg font-black text-amber-900">
                    {advancedSummaryQuery.data.data.analytics.followUpDelayAnalytics?.overdueExtendedTotal ?? 0}
                  </p>
                </div>
              </div>
            ) : null}

            <CalendarView
              view={view}
              contentFilter={calendarContentFilter}
              selectedDate={selectedDate}
              summary={calendarSummary}
              onSelectDate={setDate}
              onComplete={(item) => {
                setActionFollowUp(item);
                openModal(item);
              }}
              onOpenFollowUp={setActionFollowUp}
              onOpenLead={(lead) => {
                navigate('/leads', { state: { openLeadId: lead.id } });
              }}
            />
          </div>
        </div>

      <CompleteFollowUpModal
        isOpen={modalOpen}
        followUp={selectedFollowUp}
        isSubmitting={completeMutation.isPending}
        onClose={closeModal}
        onSubmit={async (payload) => {
          if (!selectedFollowUp) return;
          await completeMutation.mutateAsync({ id: selectedFollowUp.id, payload });
        }}
      />
      <FollowUpActionModal
        isOpen={Boolean(actionFollowUp)}
        followUp={actionFollowUp}
        onClose={() => setActionFollowUp(null)}
        onOpenLead={(followUp) => {
          navigate('/leads', { state: { openLeadId: followUp.leadId } });
          setActionFollowUp(null);
        }}
        onMarkCompleted={(followUp) => {
          openModal(followUp);
          setActionFollowUp(null);
        }}
        onSnooze={(followUp) => {
          setSnoozeFollowUpItem(followUp);
          setSnoozeDateTime('');
          setRecentDescription('');
          setSnoozeReasonId('');
          setReminderActionType('SNOOZE');
          setActionFollowUp(null);
        }}
      />
      <SnoozeFollowUpModal
        isOpen={Boolean(snoozeFollowUpItem)}
        followUp={snoozeFollowUpItem}
        value={snoozeDateTime}
        onChange={setSnoozeDateTime}
        recentDescription={recentDescription}
        onRecentDescriptionChange={setRecentDescription}
        selectedReasonId={snoozeReasonId}
        onSelectedReasonIdChange={setSnoozeReasonId}
        reminderActionType={reminderActionType}
        onReminderActionTypeChange={setReminderActionType}
        isSubmitting={snoozeMutation.isPending}
        onClose={() => {
          setSnoozeFollowUpItem(null);
          setSnoozeDateTime('');
          setRecentDescription('');
          setSnoozeReasonId('');
          setReminderActionType('SNOOZE');
        }}
        onSubmit={async () => {
          const hasInput = snoozeReasonId || recentDescription.trim();
          if (!snoozeFollowUpItem || !snoozeDateTime || !hasInput) return;
          const nextTime = new Date(snoozeDateTime);
          if (Number.isNaN(nextTime.getTime()) || nextTime.getTime() <= Date.now()) {
            toast.error('Please choose a future reminder time');
            return;
          }
          if (nextTime.getTime() === new Date(snoozeFollowUpItem.scheduledAt).getTime()) {
            toast.error('The new follow-up date must be different from the current scheduled date.');
            return;
          }
          const proceed = await confirmIfWeeklyOff(nextTime);
          if (!proceed) return;
          await snoozeMutation.mutateAsync({
            id: snoozeFollowUpItem.id,
            payload: {
              scheduledAt: nextTime.toISOString(),
              recentDescription: recentDescription.trim() || undefined,
              extensionReasonId: snoozeReasonId || undefined,
              reminderActionType,
            },
          });
          setSnoozeFollowUpItem(null);
          setSnoozeDateTime('');
          setRecentDescription('');
          setSnoozeReasonId('');
          setReminderActionType('SNOOZE');
        }}
      />

      <AnimatePresence>
        {isCreateModalOpen ? (
          <div className="fixed inset-0 z-[145] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-gray-900/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="relative w-full max-w-2xl rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl"
            >
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900">Create Follow-up</h3>
                  <p className="mt-1 text-xs font-semibold text-gray-500">Schedule a new call, visit, or meeting for a lead.</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="rounded-xl border border-gray-200 p-2 text-gray-400">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onScheduleFollowUp)} className="grid gap-4 p-5">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Lead</label>
                  <div className="mt-1.5">
                    <SearchableSelect
                      options={(leadsQuery.data || []).map((lead) => ({
                        value: lead.id,
                        label: lead.subtitle ? `${lead.label} • ${lead.subtitle}` : lead.label,
                      }))}
                      value={watch('leadId')}
                      onChange={(event) => setValue('leadId', event.target.value, { shouldValidate: true, shouldDirty: true })}
                      placeholder={leadsQuery.isLoading ? 'Loading leads...' : 'Search and select a lead'}
                      name="leadId"
                    />
                  </div>
                  {errors.leadId ? <p className="mt-1 text-[11px] font-bold text-red-600">{errors.leadId.message}</p> : null}
                  {!errors.leadId ? (
                    <p className="mt-1 text-[11px] font-semibold text-gray-500">
                      Pick the lead by name, email, or phone. The system will submit the correct lead ID automatically.
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Type</label>
                    <select
                      {...register('type')}
                      className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="CALL">Call</option>
                      <option value="VISIT">Visit</option>
                      <option value="MEETING">Meeting</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Scheduled At</label>
                    <input
                      type="datetime-local"
                      {...register('scheduledAt')}
                      max={createLifecycleMax}
                      disabled={createLifecycleBlocked}
                      className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    {createLifecycleHint ? (
                      <p
                        className={`mt-1 text-[11px] font-semibold leading-relaxed ${
                          createLifecycleBlocked ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {createLifecycleHint}
                      </p>
                    ) : null}
                    {errors.scheduledAt ? (
                      <p className="mt-1 text-[11px] font-bold text-red-600">{errors.scheduledAt.message}</p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Description</label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Add context for the upcoming interaction"
                    className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="w-full rounded-2xl border border-gray-200 py-3 text-sm font-black text-gray-500 hover:bg-gray-50 sm:flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || createLifecycleBlocked}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-70 sm:flex-1"
                  >
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
                    Schedule Follow-up
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {WeeklyOffScheduleModal}
    </DashboardLayout>
  );
};

export default CalendarPage;
