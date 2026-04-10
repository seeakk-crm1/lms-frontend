import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { MapPinned, PhoneCall, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FollowUp } from '../../types/followup.types';

interface Props {
  followUp: FollowUp;
  compact?: boolean;
  onComplete?: (followUp: FollowUp) => void;
}

const FollowUpCard: React.FC<Props> = ({ followUp, compact = false, onComplete }) => {
  const icon = useMemo(() => {
    if (followUp.type === 'VISIT') return MapPinned;
    if (followUp.type === 'MEETING') return Video;
    return PhoneCall;
  }, [followUp.type]);

  const Icon = icon;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-colors hover:border-emerald-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-gray-900">{followUp.user.displayName}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{followUp.type}</p>
            </div>
          </div>
          <p className="mt-2 text-xs font-semibold text-gray-500">
            Lead ID: <span className="font-black text-gray-700">{followUp.leadId}</span>
          </p>
          {!compact && followUp.description ? (
            <p className="mt-2 line-clamp-2 text-xs text-gray-500">{followUp.description}</p>
          ) : null}
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
            followUp.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {followUp.status}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-gray-500">{format(new Date(followUp.scheduledAt), 'dd MMM, hh:mm a')}</p>
        {followUp.status === 'PENDING' && onComplete ? (
          <button
            type="button"
            onClick={() => onComplete(followUp)}
            className="rounded-xl bg-emerald-500 px-3 py-1.5 text-[11px] font-black text-white hover:bg-emerald-600"
          >
            Complete
          </button>
        ) : null}
      </div>
    </motion.div>
  );
};

export default React.memo(FollowUpCard);
