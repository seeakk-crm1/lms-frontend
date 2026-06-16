import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import UploadSection from './UploadSection';
import ProgressTracker from './ProgressTracker';
import ImportHistory, { ImportHistoryItem } from './ImportHistory';
import { ImportStatusResponse } from './import.service';
import useAuthStore from '../../../store/useAuthStore';

interface ActiveImportSession {
  jobId: string;
  fileName: string;
  startedAt: string;
  importedBy: string;
}

const ACTIVE_IMPORT_SESSION_KEY = 'leadImportActiveSession';
const IMPORT_HISTORY_KEY = 'leadImportUiHistory';

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value));

const readActiveSession = (): ActiveImportSession | null => {
  const stored = localStorage.getItem(ACTIVE_IMPORT_SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as ActiveImportSession;
  } catch {
    localStorage.removeItem(ACTIVE_IMPORT_SESSION_KEY);
    return null;
  }
};

const readHistory = (): ImportHistoryItem[] => {
  const stored = localStorage.getItem(IMPORT_HISTORY_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as ImportHistoryItem[];
  } catch {
    localStorage.removeItem(IMPORT_HISTORY_KEY);
    return [];
  }
};

export default function LeadImportPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [activeJobId, setActiveJobId] = useState<string | null>(localStorage.getItem("jobId") || null);
  const [activeSession, setActiveSession] = useState<ActiveImportSession | null>(() => {
    const storedSession = readActiveSession();
    const storedJobId = localStorage.getItem('jobId');

    if (storedSession) return storedSession;
    if (!storedJobId) return null;

    return {
      jobId: storedJobId,
      fileName: 'Current import',
      startedAt: new Date().toISOString(),
      importedBy: user?.name || user?.email || 'Current user',
    };
  });
  const [currentProgress, setCurrentProgress] = useState<ImportStatusResponse['data'] | null>(null);
  const [history, setHistory] = useState<ImportHistoryItem[]>(() => readHistory());

  const handleUploadStart = ({ jobId, fileName }: { jobId: string; fileName: string }) => {
    const session: ActiveImportSession = {
      jobId,
      fileName,
      startedAt: new Date().toISOString(),
      importedBy: user?.name || user?.email || 'Current user',
    };

    localStorage.setItem("jobId", jobId);
    localStorage.setItem(ACTIVE_IMPORT_SESSION_KEY, JSON.stringify(session));
    setActiveSession(session);
    setCurrentProgress(null);
    setActiveJobId(jobId);
  };

  const clearJob = () => {
    localStorage.removeItem("jobId");
    localStorage.removeItem(ACTIVE_IMPORT_SESSION_KEY);
    setActiveJobId(null);
    setActiveSession(null);
    setCurrentProgress(null);
  };

  useEffect(() => {
    if (!activeSession || !currentProgress) return;

    const isTerminal = currentProgress.status === 'COMPLETED' || currentProgress.status === 'FAILED';
    if (!isTerminal) return;

    setHistory((previous) => {
      const existingItem = previous.find((item) => item.id === activeSession.jobId);
      const completedAt = existingItem?.completedAt || new Date().toISOString();
      const historyItem: ImportHistoryItem = {
        id: activeSession.jobId,
        file: activeSession.fileName,
        status:
          currentProgress.status === 'FAILED'
            ? 'FAILED'
            : currentProgress.failed > 0
              ? 'COMPLETED_WITH_ERRORS'
              : 'COMPLETED',
        success: currentProgress.success,
        failed: currentProgress.failed,
        total: currentProgress.total,
        dateLabel: `Started At: ${formatDateTime(activeSession.startedAt)}`,
        completedAt,
        completedAtLabel: formatDateTime(completedAt),
      };
      const existingIndex = previous.findIndex((item) => item.id === historyItem.id);
      const nextHistory =
        existingIndex >= 0
          ? previous.map((item) => (item.id === historyItem.id ? historyItem : item))
          : [historyItem, ...previous].slice(0, 10);

      localStorage.setItem(IMPORT_HISTORY_KEY, JSON.stringify(nextHistory));
      return nextHistory;
    });
  }, [activeSession, currentProgress]);

  const activeHistoryItem = activeSession && currentProgress && currentProgress.status !== 'COMPLETED' && currentProgress.status !== 'FAILED'
    ? {
        id: activeSession.jobId,
        file: activeSession.fileName,
        status: currentProgress.status,
        success: currentProgress.success,
        failed: currentProgress.failed,
        total: currentProgress.total,
        dateLabel: `Started At: ${formatDateTime(activeSession.startedAt)}`,
      }
    : null;

  const historyItems = activeHistoryItem
    ? [activeHistoryItem, ...history.filter((item) => item.id !== activeHistoryItem.id)]
    : history;

  const activeCompletedHistory = activeSession ? history.find((item) => item.id === activeSession.jobId) : null;
  const importState =
    currentProgress?.status === 'PENDING' || currentProgress?.status === 'PROCESSING'
      ? 'processing'
      : currentProgress?.status === 'FAILED'
        ? 'failed'
        : currentProgress?.status === 'COMPLETED' && (currentProgress.failed ?? 0) > 0
          ? 'completed_with_errors'
          : currentProgress?.status === 'COMPLETED'
            ? 'completed'
            : 'idle';

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-y-auto">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/leads')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Bulk Lead Import</h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">Upload CSV files to import multiple leads at once.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <div className="flex flex-col gap-6">
          <UploadSection
            onUploadStart={handleUploadStart}
            importState={importState}
            importSummary={currentProgress ? { success: currentProgress.success, failed: currentProgress.failed } : null}
          />
          {activeJobId && (
            <ProgressTracker
              jobId={activeJobId}
              onClear={clearJob}
              fileName={activeSession?.fileName}
              importedBy={activeSession?.importedBy}
              completedAt={activeCompletedHistory?.completedAt || null}
              onProgressChange={setCurrentProgress}
            />
          )}
        </div>
        
        <div className="h-full">
          <ImportHistory history={historyItems} />
        </div>
      </motion.div>
    </div>
  );
}
