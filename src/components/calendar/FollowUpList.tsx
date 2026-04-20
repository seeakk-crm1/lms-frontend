import React from 'react';
import { format } from 'date-fns';
import { MapPinned, PhoneCall, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FollowUp } from '../../types/followup.types';

interface Props {
  items: FollowUp[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onComplete?: (followUp: FollowUp) => void;
  onOpen?: (followUp: FollowUp) => void;
}

const getIcon = (type: FollowUp['type']) => {
  if (type === 'VISIT') return MapPinned;
  if (type === 'MEETING') return Video;
  return PhoneCall;
};

const FollowUpList: React.FC<Props> = ({
  items,
  isLoading = false,
  emptyTitle = 'No follow-ups found',
  emptyDescription = 'Try changing the filters or date range.',
  onComplete,
  onOpen,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="hidden md:block">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid animate-pulse grid-cols-6 gap-4 border-b border-gray-50 px-5 py-4 last:border-b-0">
              {Array.from({ length: 6 }).map((__, columnIndex) => (
                <div key={columnIndex} className="h-4 rounded shimmer-bg" />
              ))}
            </div>
          ))}
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2 rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="h-4 w-2/3 rounded shimmer-bg" />
              <div className="h-3 w-1/2 rounded shimmer-bg" />
              <div className="h-8 w-full rounded shimmer-bg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
        <p className="text-base font-black text-gray-800">{emptyTitle}</p>
        <p className="mt-2 text-sm text-gray-500">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[960px] text-left">
          <thead>
            <tr className="bg-gray-50/70">
              {['Lead Name', 'Contact', 'Time', 'Type', 'Status', 'Action'].map((heading) => (
                <th key={heading} className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item, index) => {
              const Icon = getIcon(item.type);
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="cursor-pointer transition-colors hover:bg-red-50/40"
                  onClick={() => onOpen?.(item)}
                >
                  <td className="px-5 py-4 text-sm font-black text-gray-900">{item.lead?.name || item.leadId}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-600">{item.user.displayName}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-600">
                    {format(new Date(item.scheduledAt), 'dd MMM, hh:mm a')}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-gray-600">
                      <Icon className="h-3.5 w-3.5" />
                      {item.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                        item.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {item.status === 'PENDING' && onComplete ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onComplete(item);
                        }}
                        className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-white hover:bg-emerald-600"
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">Closed</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-gray-50 md:hidden">
        {items.map((item) => {
          const Icon = getIcon(item.type);
          return (
            <button key={item.id} className="w-full space-y-3 p-4 text-left" type="button" onClick={() => onOpen?.(item)}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-gray-900">{item.lead?.name || item.leadId}</p>
                  <p className="mt-0.5 text-xs font-semibold text-gray-500">{item.user.displayName}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${
                    item.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <Icon className="h-4 w-4 text-emerald-600" />
                {item.type} • {format(new Date(item.scheduledAt), 'dd MMM, hh:mm a')}
              </div>
              {item.status === 'PENDING' && onComplete ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onComplete(item);
                  }}
                  className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-white"
                >
                  Complete
                </button>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(FollowUpList);
