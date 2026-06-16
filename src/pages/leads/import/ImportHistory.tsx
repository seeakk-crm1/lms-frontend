import React from 'react';
import { motion } from 'framer-motion';
import { Database, Calendar, FileText, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';

export interface ImportHistoryItem {
  id: string;
  file: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'FAILED';
  success: number;
  failed: number;
  total?: number;
  dateLabel: string;
  completedAt?: string | null;
  completedAtLabel?: string | null;
}

interface ImportHistoryProps {
  history: ImportHistoryItem[];
}

const getStatusStyles = (status: ImportHistoryItem['status']) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-700';
    case 'COMPLETED_WITH_ERRORS':
      return 'bg-amber-100 text-amber-700';
    case 'FAILED':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-blue-100 text-blue-700';
  }
};

export default function ImportHistory({ history }: ImportHistoryProps) {

  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-gray-100 flex items-center gap-2">
        <Database className="w-5 h-5 text-emerald-500" />
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Recent Imports</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[500px]">
        {history.map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={item.id} 
            className="p-5 border-b border-gray-50 hover:bg-emerald-50/30 transition-colors group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                  <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                </div>
                <span className="font-bold text-sm text-gray-800 truncate">{item.file}</span>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${getStatusStyles(item.status)}`}>
                {item.status === 'COMPLETED_WITH_ERRORS' ? 'COMPLETED' : item.status}
              </span>
            </div>
            
            <div className="ml-11 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-gray-500">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {item.completedAtLabel ? `Completed At: ${item.completedAtLabel}` : item.dateLabel}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 font-black text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Imported: {item.success} Records
                </div>
                {item.failed > 0 && (
                  <div className={`flex items-center gap-1.5 font-black ${
                    item.status === 'COMPLETED_WITH_ERRORS' ? 'text-amber-600' : 'text-rose-500'
                  }`}>
                    {item.status === 'COMPLETED_WITH_ERRORS' ? <AlertTriangle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    Failed: {item.failed}
                  </div>
                )}
                {(item.status === 'PROCESSING' || item.status === 'PENDING') && (
                  <div className="flex items-center gap-1.5 font-black text-blue-600">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {item.total ? `${item.success + item.failed} / ${item.total} processed` : 'Import in progress'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {history.length === 0 && (
           <div className="p-10 flex flex-col items-center justify-center text-gray-400 text-sm font-medium">
             <Database className="w-10 h-10 mb-3 opacity-20" />
             No past imports found.
           </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 text-center mt-auto border-t border-gray-100">
        <button className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors">
          View full history
        </button>
      </div>
    </div>
  );
}
