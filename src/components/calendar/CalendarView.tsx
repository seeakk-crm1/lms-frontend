import React, { useMemo } from 'react';
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import type { FollowUp, FollowUpView } from '../../types/followup.types';
import FollowUpCard from './FollowUpCard';
import FollowUpList from './FollowUpList';

interface Props {
  view: FollowUpView;
  selectedDate: string;
  items: FollowUp[];
  groups?: Array<{ date: string; items: FollowUp[] }>;
  onSelectDate: (date: string) => void;
  onComplete: (followUp: FollowUp) => void;
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarView: React.FC<Props> = ({ view, selectedDate, items, groups = [], onSelectDate, onComplete }) => {
  const selected = parseISO(selectedDate);
  const groupedMap = useMemo(
    () =>
      groups.reduce<Record<string, FollowUp[]>>((acc, group) => {
        acc[group.date] = group.items;
        return acc;
      }, {}),
    [groups],
  );

  const monthDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(selected), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(selected), { weekStartsOn: 1 }),
      }),
    [selected],
  );

  const dayItems = useMemo(
    () => items.filter((item) => format(new Date(item.scheduledAt), 'yyyy-MM-dd') === format(selected, 'yyyy-MM-dd')),
    [items, selected],
  );

  if (view === 'list') {
    return <FollowUpList items={items} onComplete={onComplete} />;
  }

  if (view === 'day') {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-black text-gray-900">{format(selected, 'EEEE, dd MMMM yyyy')}</h2>
          <p className="text-sm text-gray-500">Time-based follow-up list for the selected day.</p>
        </div>
        <FollowUpList
          items={dayItems}
          onComplete={onComplete}
          emptyTitle="No follow-ups scheduled for this day"
          emptyDescription="Try another day or create a new follow-up."
        />
      </div>
    );
  }

  if (view === 'week') {
    return (
      <div className="grid gap-4 md:grid-cols-7">
        {groups.map((group) => (
          <motion.div key={group.date} layout className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={() => onSelectDate(new Date(group.date).toISOString())}
              className="mb-3 text-left"
            >
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">{format(new Date(group.date), 'EEE')}</p>
              <p className="text-lg font-black text-gray-900">{format(new Date(group.date), 'dd')}</p>
            </button>
            <div className="space-y-3">
              {group.items.length > 0 ? (
                group.items.map((item) => <FollowUpCard key={item.id} followUp={item} compact onComplete={onComplete} />)
              ) : (
                <p className="rounded-2xl border border-dashed border-gray-200 px-3 py-6 text-center text-xs font-bold text-gray-400">
                  No follow-ups
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
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
            const dayEntries = groupedMap[key] || [];
            return (
              <motion.button
                type="button"
                key={key}
                whileHover={{ y: -2 }}
                onClick={() => onSelectDate(day.toISOString())}
                className={`min-h-[132px] rounded-2xl border p-3 text-left transition-all ${
                  isSameMonth(day, selected)
                    ? 'border-gray-100 bg-gray-50/30 hover:border-emerald-200 hover:bg-white'
                    : 'border-gray-100 bg-gray-50/60 text-gray-300'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`text-sm font-black ${isSameMonth(day, selected) ? 'text-gray-900' : 'text-gray-300'}`}>
                    {format(day, 'dd')}
                  </span>
                  {dayEntries.length > 0 ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                      {dayEntries.length}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-2">
                  {dayEntries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="rounded-xl bg-white px-2.5 py-2 text-xs font-semibold text-gray-600 shadow-sm">
                      <p className="truncate font-black text-gray-800">{entry.type}</p>
                      <p className="truncate text-[11px] text-gray-500">{format(new Date(entry.scheduledAt), 'hh:mm a')}</p>
                    </div>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default React.memo(CalendarView);
