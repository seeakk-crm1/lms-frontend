import React from 'react';
import { Database, Calendar, FileText, CheckCircle2, XCircle } from 'lucide-react';

export default function ImportHistory() {
  // Placeholder data for the UI
  // Real implementation would fetch from a new endpoint like GET /api/leads/import/history
  const history = [
    { id: '1', date: '2023-10-25', file: 'leads_batch_oct.csv', status: 'COMPLETED', success: 4200, failed: 12 },
    { id: '2', date: '2023-10-20', file: 'invalid_data.xlsx', status: 'FAILED', success: 0, failed: 1500 },
    { id: '3', date: '2023-10-15', file: 'expo_leads.csv', status: 'COMPLETED', success: 850, failed: 0 },
  ];

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b bg-gray-50/50 flex items-center gap-2">
        <Database className="w-5 h-5 text-gray-500" />
        <h3 className="font-semibold text-gray-800">Recent Imports</h3>
      </div>
      
      <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[500px]">
        {history.map((item) => (
          <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="font-medium text-sm text-gray-700 truncate">{item.file}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.status}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs mt-3">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                {item.date}
              </div>
              <div className="flex items-center gap-1.5 text-green-600 font-medium">
                 <CheckCircle2 className="w-3.5 h-3.5" /> {item.success}
              </div>
              {item.failed > 0 && (
                <div className="flex items-center gap-1.5 text-red-500 font-medium">
                   <XCircle className="w-3.5 h-3.5" /> {item.failed}
                </div>
              )}
            </div>
          </div>
        ))}
        {history.length === 0 && (
           <div className="p-8 text-center text-gray-500 text-sm">
             No past imports found.
           </div>
        )}
      </div>

      <div className="p-3 bg-gray-50 border-t text-center mt-auto">
        <button className="text-sm text-blue-600 font-medium hover:underline">
          View full history
        </button>
      </div>
    </div>
  );
}
