import React, { useMemo, useState } from 'react';
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import type { FollowUp, FollowUpView } from '../../types/followup.types';
import CalendarDetailsModal from './CalendarDetailsModal';

interface Props {
  view: FollowUpView;
  selectedDate: string;
  summary: Array<{
    date: string;
    leadsCreated: number;
    totalFollowUps: number;
    stageTransitions: Array<{ stageId: string; count: number; name: string; color: string }>;
    stageFollowUps: Array<{ stageId: string; count: number; name: string; color: string }>;
  }>;
  onSelectDate: (date: string) => void;
  onComplete: (followUp: FollowUp) => void;
  onOpenFollowUp: (followUp: FollowUp) => void;
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarView: React.FC<Props> = ({ view, selectedDate, summary = [], onSelectDate, onComplete, onOpenFollowUp }) => {
  const selected = parseISO(selectedDate);
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    date: string;
    type: string;
    stageId?: string;
    title: string;
  }>({ isOpen: false, date: '', type: '', title: '' });

  const summaryMap = useMemo(
    () =>
      summary.reduce<Record<string, any>>((acc, item) => {
        acc[item.date] = item;
        return acc;
      }, {}),
    [summary],
  );

  const monthDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(selected), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(selected), { weekStartsOn: 1 }),
      }),
    [selected],
  );

  const openDetails = (date: string, type: string, title: string, stageId?: string) => {
    setDetailsModal({ isOpen: true, date, type, stageId, title });
  };

  if (view !== 'month') {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold text-gray-500">The advanced calendar redesign only supports Month view currently.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-3 grid grid-cols-7 gap-3">
          {dayNames.map((day) => (
            <div key={day} className="px-2 text-center text-[11px] font-black uppercase tracking-widest text-gray-400">
              {day}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={format(selected, 'yyyy-MM')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-7 gap-3"
          >
            {monthDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const data = summaryMap[key];
              const isCurrentMonth = isSameMonth(day, selected);

              return (
                <motion.div
                  key={key}
                  whileHover={{ y: -2 }}
                  className={`flex min-h-[160px] flex-col rounded-2xl border p-3 transition-all ${
                    isCurrentMonth
                      ? 'border-gray-100 bg-gray-50/30 hover:border-emerald-200 hover:bg-white'
                      : 'border-gray-50 bg-gray-50/60 opacity-60'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onSelectDate(day.toISOString())}
                      className={`text-sm font-black hover:text-emerald-600 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                      {format(day, 'dd')}
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
                    {data?.leadsCreated > 0 ? (
                      <button
                        onClick={() => openDetails(day.toISOString(), 'LEADS_CREATED', 'Leads Created')}
                        className="flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-left hover:bg-blue-100"
                      >
                        <span className="truncate text-[10px] font-bold text-blue-800">Leads Created</span>
                        <span className="rounded-full bg-blue-200 px-1.5 py-0.5 text-[9px] font-black text-blue-900">{data.leadsCreated}</span>
                      </button>
                    ) : null}

                    {data?.stageTransitions?.map((st: any) => (
                      <button
                        key={`trans-${st.stageId}`}
                        onClick={() => openDetails(day.toISOString(), 'STAGE_CREATED', `Stage: ${st.name}`, st.stageId)}
                        className="flex w-full items-center justify-between rounded-lg border px-2 py-1 text-left transition-colors"
                        style={{ borderColor: `${st.color}40`, backgroundColor: `${st.color}15` }}
                      >
                        <span className="truncate text-[10px] font-bold" style={{ color: st.color }}>{st.name}</span>
                        <span className="rounded-full px-1.5 py-0.5 text-[9px] font-black" style={{ backgroundColor: `${st.color}30`, color: st.color }}>{st.count}</span>
                      </button>
                    ))}

                    {data?.totalFollowUps > 0 ? (
                      <button
                        onClick={() => openDetails(day.toISOString(), 'TOTAL_FOLLOWUPS', 'Total Follow-ups')}
                        className="flex w-full items-center justify-between rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-left hover:bg-red-100 mt-1"
                      >
                        <span className="truncate text-[10px] font-bold text-red-800">Total Follow-ups</span>
                        <span className="rounded-full bg-red-200 px-1.5 py-0.5 text-[9px] font-black text-red-900">{data.totalFollowUps}</span>
                      </button>
                    ) : null}

                    {data?.stageFollowUps?.map((sf: any) => (
                      <button
                        key={`fup-${sf.stageId}`}
                        onClick={() => openDetails(day.toISOString(), 'STAGE_FOLLOWUPS', `Follow-ups: ${sf.name}`, sf.stageId)}
                        className="flex w-full items-center justify-between rounded-lg border px-2 py-1 text-left transition-colors"
                        style={{ borderColor: `${sf.color}40`, backgroundColor: `${sf.color}15` }}
                      >
                        <span className="truncate text-[10px] font-bold" style={{ color: sf.color }}>F/U: {sf.name}</span>
                        <span className="rounded-full px-1.5 py-0.5 text-[9px] font-black" style={{ backgroundColor: `${sf.color}30`, color: sf.color }}>{sf.count}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <CalendarDetailsModal
        isOpen={detailsModal.isOpen}
        date={detailsModal.date}
        type={detailsModal.type}
        stageId={detailsModal.stageId}
        title={detailsModal.title}
        onClose={() => setDetailsModal({ ...detailsModal, isOpen: false })}
        onOpenFollowUp={onOpenFollowUp}
        onCompleteFollowUp={onComplete}
        onOpenLead={() => {}} 
      />
    </>
  );
};

export default React.memo(CalendarView);
