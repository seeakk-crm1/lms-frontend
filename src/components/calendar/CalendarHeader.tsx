import React from 'react';
import { addDays, addMonths, addWeeks, format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import type { FollowUpUserOption, FollowUpView } from '../../types/followup.types';

interface Props {
  view: FollowUpView;
  selectedDate: string;
  selectedUser: string;
  users: FollowUpUserOption[];
  onToday: () => void;
  onNavigate: (nextDate: string) => void;
  onViewChange: (view: FollowUpView) => void;
  onUserChange: (userId: string) => void;
}

const views: FollowUpView[] = ['month', 'week', 'day', 'list'];

const CalendarHeader: React.FC<Props> = ({
  view,
  selectedDate,
  selectedUser,
  users,
  onToday,
  onNavigate,
  onViewChange,
  onUserChange,
}) => {
  const currentDate = parseISO(selectedDate);

  const shiftDate = (direction: 'prev' | 'next') => {
    const multiplier = direction === 'prev' ? -1 : 1;
    const nextDate =
      view === 'month'
        ? addMonths(currentDate, multiplier)
        : view === 'week'
          ? addWeeks(currentDate, multiplier)
          : addDays(currentDate, multiplier);
    onNavigate(nextDate.toISOString());
  };

  return (
    <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-600">
            <CalendarDays className="h-3.5 w-3.5" />
            Calendar Leads View
          </div>
          <h1 className="text-2xl font-black text-gray-900 md:text-3xl">{format(currentDate, 'MMMM yyyy')}</h1>
          <p className="mt-1 text-sm text-gray-500">Track pending and completed follow-ups with a calendar-first workflow.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onToday}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-700 hover:bg-emerald-100"
          >
            Today
          </button>

          <div className="inline-flex items-center rounded-2xl border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => shiftDate('prev')}
              className="rounded-xl p-2 text-gray-500 hover:bg-white hover:text-gray-900"
              aria-label="Previous period"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => shiftDate('next')}
              className="rounded-xl p-2 text-gray-500 hover:bg-white hover:text-gray-900"
              aria-label="Next period"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {views.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => onViewChange(entry)}
                className={`rounded-2xl px-4 py-2 text-sm font-black capitalize transition-all ${
                  entry === view ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
              >
                {entry}
              </button>
            ))}
          </div>

          <select
            value={selectedUser}
            onChange={(event) => onUserChange(event.target.value)}
            className="min-w-[220px] rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            aria-label="Filter by user"
          >
            <option value="">My follow-ups</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CalendarHeader);
