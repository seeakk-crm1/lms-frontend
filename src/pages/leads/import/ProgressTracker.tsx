import React, { useEffect, useState } from 'react';
import { fetchImportStatus, ImportStatusResponse } from './import.service';
import { CheckCircle2, XCircle, Loader2, Download, AlertTriangle, ShieldCheck, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ProgressTrackerProps {
  jobId: string;
  onClear: () => void;
  fileName?: string;
  importedBy?: string;
  completedAt?: string | null;
  onProgressChange?: (progress: ImportStatusResponse['data']) => void;
}

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value));

const formatCurrency = (val: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function ProgressTracker({
  jobId,
  onClear,
  fileName,
  importedBy,
  completedAt,
  onProgressChange,
}: ProgressTrackerProps) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<ImportStatusResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cacheSynced, setCacheSynced] = useState(false);
  const [completionToastShown, setCompletionToastShown] = useState(false);
  const [showWarnings, setShowWarnings] = useState(true);
  const [showApprovals, setShowApprovals] = useState(true);

  useEffect(() => {
    setCacheSynced(false);
    setCompletionToastShown(false);
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;

    let isMounted = true;
    const pollStatus = async () => {
      try {
        const res = await fetchImportStatus(jobId);
        if (!isMounted) return false;

        setProgress(res.data);
        onProgressChange?.(res.data);

        if (res.data.status === 'COMPLETED' || res.data.status === 'FAILED') {
          return true;
        }
        return false;
      } catch (err: any) {
        if (!isMounted) return false;
        console.error('Polling error', err);
        setError('Failed to fetch progress update.');
        return true;
      }
    };

    void pollStatus();

    const interval = setInterval(async () => {
      const shouldStop = await pollStatus();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [jobId, onProgressChange]);

  useEffect(() => {
    if (!progress || cacheSynced || progress.status !== 'COMPLETED') return;

    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['lead-meta'] });
    queryClient.invalidateQueries({ queryKey: ['lead-sources'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    setCacheSynced(true);
  }, [cacheSynced, progress, queryClient]);

  useEffect(() => {
    if (!progress || completionToastShown) return;

    if (progress.status === 'COMPLETED' && progress.failed === 0) {
      toast.success('Import completed successfully.');
      setCompletionToastShown(true);
      return;
    }

    if (progress.status === 'COMPLETED' && progress.failed > 0) {
      toast('Import completed with errors/warnings.', { icon: '!' });
      setCompletionToastShown(true);
      return;
    }

    if (progress.status === 'FAILED') {
      toast.error('Import failed.');
      setCompletionToastShown(true);
    }
  }, [completionToastShown, progress]);

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 p-4 rounded-xl flex items-start gap-3 shadow-sm">
        <AlertTriangle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-700">Tracking Error</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button onClick={onClear} className="mt-3 text-sm text-red-700 font-medium hover:underline">
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="border rounded-xl p-6 bg-white shadow-sm flex items-center justify-center text-gray-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        Initializing progress tracker...
      </div>
    );
  }

  const isComplete = progress.status === 'COMPLETED' || progress.status === 'FAILED';
  const processed = progress.processed || 0;
  const total = progress.total || 0;
  const percentage = total > 0 ? Math.min(Math.round((processed / total) * 100), 100) : progress.status === 'COMPLETED' ? 100 : 0;
  const isSuccessfulCompletion = progress.status === 'COMPLETED' && progress.failed === 0;
  const isCompletedWithErrors = progress.status === 'COMPLETED' && progress.failed > 0;
  const completionLabel = completedAt ? formatDateTime(completedAt) : null;

  return (
    <div className="space-y-4">
      {isSuccessfulCompletion && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">Import Completed Successfully</p>
              <p className="mt-2 text-xl font-black text-emerald-900">{progress.success} Leads Imported Successfully</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">{progress.failed} Failed Records</p>
            </div>
          </div>
        </div>
      )}

      {isCompletedWithErrors && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-800">Import Completed With Warnings/Errors</p>
              <p className="mt-2 text-xl font-black text-amber-900">{progress.success} Leads Imported Successfully</p>
              <p className="mt-1 text-sm font-semibold text-amber-700">{progress.failed} Failed Records</p>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            {progress.status === 'PROCESSING' && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            {progress.status === 'PENDING' && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
            {progress.status === 'COMPLETED' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {progress.status === 'FAILED' && <XCircle className="w-5 h-5 text-red-500" />}
            Import Progress
          </h3>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              progress.status === 'COMPLETED'
                ? 'bg-green-100 text-green-700'
                : progress.status === 'FAILED'
                  ? 'bg-red-100 text-red-700'
                  : progress.status === 'PROCESSING'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
            }`}
          >
            {progress.status}
          </span>
        </div>

        <div className="p-6">
          {!isComplete && (
            <>
              <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                <span>{percentage}% Complete</span>
                <span>
                  {processed} / {total || '?'} rows
                </span>
              </div>

              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-6 relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    progress.status === 'FAILED'
                      ? 'bg-red-500'
                      : progress.status === 'COMPLETED'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
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
            </>
          )}

          {isComplete && (
            <div
              className={`mb-6 rounded-2xl border px-4 py-4 ${
                isSuccessfulCompletion
                  ? 'border-emerald-200 bg-emerald-50'
                  : isCompletedWithErrors
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-rose-200 bg-rose-50'
              }`}
            >
              <p
                className={`text-lg font-black ${
                  isSuccessfulCompletion ? 'text-emerald-900' : isCompletedWithErrors ? 'text-amber-900' : 'text-rose-900'
                }`}
              >
                {isSuccessfulCompletion && 'Import Completed Successfully'}
                {isCompletedWithErrors && 'Import Completed With Errors'}
                {progress.status === 'FAILED' && 'Import Failed'}
              </p>
              <p
                className={`mt-2 text-sm font-semibold ${
                  isSuccessfulCompletion ? 'text-emerald-700' : isCompletedWithErrors ? 'text-amber-700' : 'text-rose-700'
                }`}
              >
                {progress.success} leads imported successfully.
              </p>
              <p
                className={`mt-1 text-sm font-semibold ${
                  isSuccessfulCompletion ? 'text-emerald-700' : isCompletedWithErrors ? 'text-amber-700' : 'text-rose-700'
                }`}
              >
                Failed Records: {progress.failed}
              </p>
              {completionLabel && <p className="mt-1 text-sm font-semibold text-gray-700">Import finished on: {completionLabel}</p>}
            </div>
          )}

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
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h4 className="text-sm font-black uppercase tracking-[0.18em] text-gray-900">Import Summary</h4>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Total Rows Found</p>
                  <p className="mt-1 text-lg font-black text-gray-900">{processed}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Successfully Imported</p>
                  <p className="mt-1 text-lg font-black text-emerald-700">{progress.success}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Imported With Warnings</p>
                  <p className="mt-1 text-lg font-black text-amber-700">{progress.warningCount || 0}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-rose-600">Failed Rows</p>
                  <p className="mt-1 text-lg font-black text-rose-700">{progress.failed}</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Approvals Created
                  </p>
                  <p className="mt-1 text-lg font-black text-blue-900">{progress.approvalRequestsCount || 0}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Revenue Imported
                  </p>
                  <p className="mt-1 text-lg font-black text-emerald-900">{formatCurrency(progress.totalRevenueImported || 0)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stage Approval Import Result Section */}
          {isComplete && progress.approvals && progress.approvals.length > 0 && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
              <button
                onClick={() => setShowApprovals(!showApprovals)}
                className="w-full flex items-center justify-between font-black text-sm uppercase tracking-wider text-blue-900"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Approval Import Results ({progress.approvals.length} Stage Pending Approvals)
                </span>
                {showApprovals ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showApprovals && (
                <div className="mt-3 space-y-2">
                  {progress.approvals.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-blue-100 bg-white p-3 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <p className="font-bold text-gray-900">
                          Row {item.row}: {item.leadName}
                        </p>
                        <p className="text-xs font-semibold text-blue-700 mt-0.5">
                          Target Stage: <span className="font-bold">{item.stage}</span> | Supervisor: <span className="font-bold">{item.supervisor}</span>
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Warning Details Section */}
          {isComplete && progress.warnings && progress.warnings.length > 0 && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
              <button
                onClick={() => setShowWarnings(!showWarnings)}
                className="w-full flex items-center justify-between font-black text-sm uppercase tracking-wider text-amber-900"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Warning Details ({progress.warnings.length} Field Warnings)
                </span>
                {showWarnings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showWarnings && (
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {progress.warnings.map((warn, idx) => (
                    <div key={idx} className="rounded-xl border border-amber-100 bg-white p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-amber-900">Row {warn.row}</span>
                        <span className="font-bold text-xs uppercase px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                          {warn.field}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        Provided value: <span className="font-mono font-semibold text-gray-900">"{warn.value}"</span>
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-amber-800">{warn.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isComplete && (
            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={onClear}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Start New Import
              </button>

              {progress.error_file_url && (progress.failed > 0 || (progress.warnings && progress.warnings.length > 0)) && (
                <a
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(progress.error_file_url)}`}
                  download="import_summary_report.json"
                  className="text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg flex items-center gap-2 border border-amber-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Complete Summary Log
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
