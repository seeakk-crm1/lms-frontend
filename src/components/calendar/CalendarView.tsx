import React, { useMemo, useState } from 'react';
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  calendarShowsFollowUps,
  calendarShowsLeads,
  type CalendarContentFilter,
  type FollowUp,
  type FollowUpView,
} from '../../types/followup.types';
import CalendarDetailsModal from './CalendarDetailsModal';

type SummaryDay = {
  date: string;
  leadsCreated: number;
  leadsCreatedByStage: Array<{ stageId: string; count: number; name: string; color: string }>;
  totalFollowUps: number;
  stageTransitions: Array<{ stageId: string; count: number; name: string; color: string }>;
  stageFollowUps: Array<{
    stageId: string;
    count: number;
    name: string;
    color: string;
    overdueExtendedCount?: number;
  }>;
};

interface Props {
  view: FollowUpView;
  contentFilter: CalendarContentFilter;
  selectedDate: string;
  summary: SummaryDay[];
  onSelectDate: (date: string) => void;
  onComplete: (followUp: FollowUp) => void;
  onOpenFollowUp: (followUp: FollowUp) => void;
  onOpenLead: (lead: any) => void;
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarView: React.FC<Props> = ({
  view,
  contentFilter,
  selectedDate,
  summary = [],
  onSelectDate,
  onComplete,
  onOpenFollowUp,
  onOpenLead,
}) => {
  const selected = parseISO(selectedDate);
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    date: string;
    type: string;
    stageId?: string;
    title: string;
    overdueExtendedOnly?: boolean;
  }>({ isOpen: false, date: '', type: '', title: '' });

  const showFollowUps = calendarShowsFollowUps(contentFilter);
  const showLeads = calendarShowsLeads(contentFilter);

  const summaryMap = useMemo(
    () =>
      summary.reduce<Record<string, SummaryDay>>((acc, item) => {
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

  const openDetails = (
    date: string,
    type: string,
    title: string,
    stageId?: string,
    overdueExtendedOnly?: boolean,
  ) => {
    setDetailsModal({ isOpen: true, date, type, stageId, title, overdueExtendedOnly });
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
                    {showFollowUps
                      ? data?.stageFollowUps?.map((sf) => {
                          const isOverdueChip = (sf.overdueExtendedCount || 0) > 0;
                          const chipColor = isOverdueChip ? '#dc2626' : sf.color;

                          return (
                            <button
                              key={`fup-${sf.stageId}-${isOverdueChip ? 'overdue' : 'normal'}`}
                              onClick={() =>
                                openDetails(
                                  key,
                                  'STAGE_FOLLOWUPS',
                                  `${sf.name} Follow-Up - ${sf.count}`,
                                  sf.stageId,
                                  isOverdueChip,
                                )
                              }
                              className="flex w-full items-center justify-between rounded-lg border px-2 py-1 text-left transition-colors"
                              style={{
                                borderColor: `${chipColor}40`,
                                backgroundColor: isOverdueChip ? '#fef2f2' : `${sf.color}15`,
                              }}
                            >
                              <span className="truncate text-[10px] font-bold" style={{ color: chipColor }}>
                                {sf.name} Follow-Up - {sf.count}
                              </span>
                              <span
                                className="rounded-full px-1.5 py-0.5 text-[9px] font-black"
                                style={{ backgroundColor: `${chipColor}30`, color: chipColor }}
                              >
                                {sf.count}
                              </span>
                            </button>
                          );
                        })
                      : null}

                    {showLeads ? (
                      <>
                        {data?.leadsCreatedByStage?.map((st) => (
                          <button
                            key={`lead-create-${st.stageId}`}
                            onClick={() =>
                              openDetails(key, 'LEAD_STAGE_CREATED', `${st.name} Created - ${st.count}`, st.stageId)
                            }
                            className="flex w-full items-center justify-between rounded-lg border px-2 py-1 text-left transition-colors"
                            style={{ borderColor: `${st.color}40`, backgroundColor: `${st.color}15` }}
                          >
                            <span className="truncate text-[10px] font-bold" style={{ color: st.color }}>
                              {st.name} Created - {st.count}
                            </span>
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[9px] font-black"
                              style={{ backgroundColor: `${st.color}30`, color: st.color }}
                            >
                              {st.count}
                            </span>
                          </button>
                        ))}

                        {data?.stageTransitions?.map((st) => (
                          <button
                            key={`trans-${st.stageId}`}
                            onClick={() =>
                              openDetails(key, 'STAGE_CREATED', `${st.name} Created - ${st.count}`, st.stageId)
                            }
                            className="flex w-full items-center justify-between rounded-lg border px-2 py-1 text-left transition-colors"
                            style={{ borderColor: `${st.color}40`, backgroundColor: `${st.color}15` }}
                          >
                            <span className="truncate text-[10px] font-bold" style={{ color: st.color }}>
                              {st.name} Created - {st.count}
                            </span>
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[9px] font-black"
                              style={{ backgroundColor: `${st.color}30`, color: st.color }}
                            >
                              {st.count}
                            </span>
                          </button>
                        ))}
                      </>
                    ) : null}
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
        overdueExtendedOnly={detailsModal.overdueExtendedOnly}
        onClose={() => setDetailsModal({ ...detailsModal, isOpen: false })}
        onOpenFollowUp={onOpenFollowUp}
        onCompleteFollowUp={onComplete}
        onOpenLead={onOpenLead}
      />
    </>
  );
};

export default React.memo(CalendarView);
