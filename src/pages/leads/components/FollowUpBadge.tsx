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
    <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors whitespace-nowrap ${descriptor.className}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="font-bold tracking-tight">{descriptor.label}</span>
      <span className="text-[10px] font-medium opacity-75">· {descriptor.subtitle}</span>
    </div>
  );
};

export default memo(FollowUpBadge);
