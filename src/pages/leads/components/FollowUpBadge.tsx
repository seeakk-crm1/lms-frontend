import React, { memo, useMemo } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import { format, formatDistanceToNowStrict, isPast, isToday, isTomorrow, parseISO } from 'date-fns';

interface FollowUpBadgeProps {
  value: string | null;
}

const FollowUpBadge: React.FC<FollowUpBadgeProps> = ({ value }) => {
  const descriptor = useMemo(() => {
    if (!value) {
      return {
        label: 'No follow-up',
        subtitle: 'Not scheduled',
        className: 'bg-gray-100 text-gray-500 border-gray-200',
        icon: CalendarClock,
      };
    }

    const date = parseISO(value);

    if (isPast(date) && !isToday(date)) {
      return {
        label: 'Overdue',
        subtitle: format(date, 'dd MMM, hh:mm a'),
        className: 'bg-rose-50 text-rose-600 border-rose-200',
        icon: AlertTriangle,
      };
    }

    if (isToday(date)) {
      return {
        label: 'Due today',
        subtitle: format(date, 'hh:mm a'),
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: CalendarClock,
      };
    }

    if (isTomorrow(date)) {
      return {
        label: 'Tomorrow',
        subtitle: format(date, 'hh:mm a'),
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: CheckCircle2,
      };
    }

    return {
      label: formatDistanceToNowStrict(date, { addSuffix: true }),
      subtitle: format(date, 'dd MMM, hh:mm a'),
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    };
  }, [value]);

  const Icon = descriptor.icon;

  return (
    <div className={`inline-flex min-w-[138px] items-start gap-2 rounded-2xl border px-3 py-2 ${descriptor.className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <div className="text-xs font-black uppercase tracking-wider">{descriptor.label}</div>
        <div className="text-[11px] font-semibold opacity-80">{descriptor.subtitle}</div>
      </div>
    </div>
  );
};

export default memo(FollowUpBadge);
