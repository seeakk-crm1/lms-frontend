import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedCalendarDetailsQuery } from '../../hooks/useFollowUps';
import FollowUpCard from './FollowUpCard';
import type { FollowUp } from '../../types/followup.types';
import { stageBadgeStyle } from '../../utils/leadStageColor';

interface CalendarDetailsModalProps {
  isOpen: boolean;
  date: string;
  type: string;
  stageId?: string;
  title: string;
  onClose: () => void;
  onOpenFollowUp?: (followUp: FollowUp) => void;
  onCompleteFollowUp?: (followUp: FollowUp) => void;
  onOpenLead?: (lead: any) => void;
}

const CalendarDetailsModal: React.FC<CalendarDetailsModalProps> = ({
  isOpen,
  date,
  type,
  stageId,
  title,
  onClose,
  onOpenFollowUp,
  onCompleteFollowUp,
  onOpenLead,
}) => {
  const { data, isLoading } = useAdvancedCalendarDetailsQuery({
    date,
    type,
    stageId,
    limit: 100,
  });

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[150] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/55 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">{title}</h3>
                <p className="mt-1 text-xs font-semibold text-gray-500">{format(new Date(date), 'EEEE, MMMM do, yyyy')}</p>
              </div>
              <button onClick={onClose} className="rounded-xl border border-gray-200 p-2 text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : data?.items?.length ? (
                <div className="space-y-3">
                  {data.items.map((item: any) => {
                    if (type === 'TOTAL_FOLLOWUPS' || type === 'STAGE_FOLLOWUPS') {
                      return (
                        <FollowUpCard 
                          key={item.id} 
                          followUp={item} 
                          onComplete={onCompleteFollowUp!} 
                          onOpen={onOpenFollowUp!} 
                        />
                      );
                    }
                    return (
                      <div key={item.id} onClick={() => onOpenLead?.(item)} className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-gray-900">{item.name}</h4>
                          {item.stage ? (
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={stageBadgeStyle(item.stage.color)}>
                              {item.stage.name}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 text-xs font-semibold text-gray-500 flex gap-2">
                          {item.email && <span>{item.email}</span>}
                          {item.phone && <span>{item.phone}</span>}
                          {item.assignedTo && <span>• Assigned: {item.assignedTo.name}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm font-semibold text-gray-500">No items found.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default CalendarDetailsModal;
