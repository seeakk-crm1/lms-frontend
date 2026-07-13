import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X } from 'lucide-react';
import { format } from 'date-fns';
import { FieldEditHistory, FieldEditSummary } from './useLeadFieldEdits';

interface Props {
  summary?: FieldEditSummary;
  histories?: FieldEditHistory[];
  fieldName: string;
}

export const FieldEditBadge: React.FC<Props> = ({ summary, histories = [], fieldName }) => {
  const [showModal, setShowModal] = useState(false);

  if (!summary || summary.editCount === 0) return null;

  const latestHistory = histories[0];

  return (
    <>
      <div 
        className="group relative inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold tracking-wider cursor-pointer hover:bg-red-200 transition-colors"
        onClick={() => setShowModal(true)}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        Edited ({summary.editCount})
        
        {/* Tooltip */}
        {latestHistory && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
            <div className="font-semibold mb-1 text-red-300">Latest Edit ({format(new Date(latestHistory.changedAt), 'PPp')})</div>
            <div className="text-gray-300 truncate"><span className="text-gray-500">By:</span> {latestHistory.changedBy.name}</div>
            <div className="mt-1 grid grid-cols-2 gap-2 bg-gray-800 p-2 rounded-lg">
              <div>
                <span className="block text-[9px] text-gray-500 uppercase">Old</span>
                <span className="truncate block font-medium">{latestHistory.oldValue || '—'}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 uppercase">New</span>
                <span className="truncate block font-medium text-emerald-400">{latestHistory.newValue || '—'}</span>
              </div>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{fieldName} Edit History</h3>
                    <p className="text-xs text-gray-500 font-medium">Total {summary.editCount} edits</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {histories.map((history, idx) => (
                  <div key={history.id} className="relative pl-6 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {idx !== histories.length - 1 && (
                      <div className="absolute left-2 top-6 bottom-0 w-px bg-gray-200" />
                    )}
                    
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-red-400 shadow-sm" />

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">{history.changedBy.name}</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                            Edit #{history.editNumber}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-gray-400">
                          {format(new Date(history.changedAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-gray-200 border-dashed">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Previous Value</span>
                          <span className="text-sm text-gray-600 break-words">{history.oldValue || <span className="text-gray-400 italic">Empty</span>}</span>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">New Value</span>
                          <span className="text-sm font-medium text-emerald-800 break-words">{history.newValue || <span className="text-emerald-400 italic">Empty</span>}</span>
                        </div>
                      </div>
                      
                      {history.reason && (
                        <div className="mt-3 text-xs text-gray-500 flex items-start gap-1">
                          <span className="font-medium text-gray-700">Reason:</span> {history.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
