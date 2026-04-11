import React, { useEffect, useState } from "react";
import { fetchImportStatus, ImportStatusResponse } from "./import.service";
import { CheckCircle2, XCircle, Loader2, Download, AlertTriangle } from 'lucide-react';

interface ProgressTrackerProps {
  jobId: string;
  onClear: () => void;
}

export default function ProgressTracker({ jobId, onClear }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<ImportStatusResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let isMounted = true;
    const pollStatus = async () => {
      try {
        const res = await fetchImportStatus(jobId);
        if (!isMounted) return false;
        
        setProgress(res.data);

        if (res.data.status === "COMPLETED" || res.data.status === "FAILED") {
          return true; // Stop polling
        }
        return false;
      } catch (err: any) {
        if (!isMounted) return false;
        console.error("Polling error", err);
        setError("Failed to fetch progress update.");
        return true; 
      }
    };

    pollStatus();
    
    const interval = setInterval(async () => {
      const shouldStop = await pollStatus();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    }
  }, [jobId]);

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 p-4 rounded-xl flex items-start gap-3 shadow-sm">
        <AlertTriangle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-700">Tracking Error</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button onClick={onClear} className="mt-3 text-sm text-red-700 font-medium hover:underline">Dismiss</button>
        </div>
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="border rounded-xl p-6 bg-white shadow-sm flex items-center justify-center text-gray-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        Initializing progress tracker...
      </div>
    );
  }

  const isComplete = progress.status === "COMPLETED" || progress.status === "FAILED";
  const processed = progress.processed || 0;
  const total = progress.total || 0;
  const percentage = total > 0 ? Math.min(Math.round((processed / total) * 100), 100) : 0;

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          {progress.status === 'PROCESSING' && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
          {progress.status === 'PENDING' && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
          {progress.status === 'COMPLETED' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          {progress.status === 'FAILED' && <XCircle className="w-5 h-5 text-red-500" />}
          Import Progress
        </h3>
        
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider
          ${progress.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
            progress.status === 'FAILED' ? 'bg-red-100 text-red-700' :
            progress.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'}`}>
          {progress.status}
        </span>
      </div>

      <div className="p-6">
        <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
          <span>{percentage}% Complete</span>
          <span>{processed} / {total || "?"} rows</span>
        </div>

        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-6 relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              progress.status === 'FAILED' ? 'bg-red-500' : 
              progress.status === 'COMPLETED' ? 'bg-green-500' : 
              'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          >
             {progress.status === 'PROCESSING' && (
                <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden rounded-full">
                  <div className="w-full h-full bg-white/20 animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                </div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50/50 border border-green-100 p-3 rounded-lg flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-md">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Success</p>
              <p className="text-xl font-bold text-green-800">{progress.success}</p>
            </div>
          </div>
          
          <div className="bg-red-50/50 border border-red-100 p-3 rounded-lg flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-md">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-red-700 font-medium uppercase tracking-wide">Failed</p>
              <p className="text-xl font-bold text-red-800">{progress.failed}</p>
            </div>
          </div>
        </div>

        {isComplete && (
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <button 
              onClick={onClear}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start New Import
            </button>
            
            {(progress.error_file_url && progress.failed > 0) && (
              <a 
                href={`data:text/json;charset=utf-8,${encodeURIComponent(progress.error_file_url)}`} 
                download="import_errors.json"
                className="text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg flex items-center gap-2 border border-red-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Error Log
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
