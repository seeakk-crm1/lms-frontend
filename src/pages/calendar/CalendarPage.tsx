import React, { useCallback, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, Loader2, Plus, X } from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import CalendarHeader from '../../components/calendar/CalendarHeader';
import CalendarView from '../../components/calendar/CalendarView';
import CompleteFollowUpModal from '../../components/calendar/CompleteFollowUpModal';
import {
  useCalendarQuery,
  useCompleteFollowUpMutation,
  useCreateFollowUpMutation,
  useFollowUpLeadsQuery,
  useFollowUpUsersQuery,
} from '../../hooks/useFollowUps';
import useFollowupStore from '../../store/followupStore';
import type { CreateFollowUpInput } from '../../types/followup.types';

const scheduleSchema = z.object({
  leadId: z.string().trim().min(1, 'Lead ID is required'),
  type: z.enum(['CALL', 'VISIT', 'MEETING']),
  scheduledAt: z.string().trim().min(1, 'Schedule date & time is required'),
  description: z.string().trim().max(1000).optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

const CalendarPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { view, selectedDate, selectedUser, modalOpen, selectedFollowUp, setView, setDate, setUser, openModal, closeModal } =
    useFollowupStore();

  const calendarQuery = useCalendarQuery();
  const usersQuery = useFollowUpUsersQuery();
  const leadsQuery = useFollowUpLeadsQuery();
  const createMutation = useCreateFollowUpMutation();
  const completeMutation = useCompleteFollowUpMutation();

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

  const calendarItems = useMemo(
    () => calendarQuery.data?.data.items || calendarQuery.data?.data.groups?.flatMap((group) => group.items) || [],
    [calendarQuery.data],
  );

  const onScheduleFollowUp = useCallback(
    async (values: ScheduleFormValues) => {
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
    [createMutation, reset],
  );

    <DashboardLayout>
        <div className="custom-scrollbar relative flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <div className="pointer-events-none absolute right-0 top-0 -z-10 h-[520px] w-[820px] bg-gradient-to-bl from-emerald-50/80 via-transparent to-transparent" />

          <div className="mx-auto max-w-[1480px] space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CalendarHeader
                view={view}
                selectedDate={selectedDate}
                selectedUser={selectedUser}
                users={usersQuery.data || []}
                onToday={() => setDate(new Date().toISOString())}
                onNavigate={setDate}
                onViewChange={setView}
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

            <CalendarView
              view={view}
              selectedDate={selectedDate}
              items={calendarItems}
              groups={calendarQuery.data?.data.groups}
              onSelectDate={setDate}
              onComplete={openModal}
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
                      className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
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
                    disabled={createMutation.isPending}
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
    </DashboardLayout>
  );
};

export default CalendarPage;
