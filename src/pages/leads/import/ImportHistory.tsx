import React from 'react';
import { motion } from 'framer-motion';
import { Database, Calendar, FileText, CheckCircle2, XCircle } from 'lucide-react';

export default function ImportHistory() {
  const history = [
    { id: '1', date: '2023-10-25', file: 'leads_batch_oct.csv', status: 'COMPLETED', success: 4200, failed: 12 },
    { id: '2', date: '2023-10-20', file: 'invalid_data.xlsx', status: 'FAILED', success: 0, failed: 1500 },
    { id: '3', date: '2023-10-15', file: 'expo_leads.csv', status: 'COMPLETED', success: 850, failed: 0 },
  ];

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
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm
                ${item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {item.status}
              </span>
            </div>
            
            <div className="flex items-center gap-5 text-xs ml-11">
              <div className="flex items-center gap-1.5 font-semibold text-gray-500">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {item.date}
              </div>
              <div className="flex items-center gap-1.5 font-black text-emerald-600">
                 <CheckCircle2 className="w-3.5 h-3.5" /> {item.success}
              </div>
              {item.failed > 0 && (
                <div className="flex items-center gap-1.5 font-black text-rose-500">
                   <XCircle className="w-3.5 h-3.5" /> {item.failed}
                </div>
              )}
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
