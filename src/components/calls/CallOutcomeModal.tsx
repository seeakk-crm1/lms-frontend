import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  PhoneCall,
  PhoneOff,
  Sparkles,
  Tag,
  User,
  X,
} from 'lucide-react';
import { fetchGroupedSubstages, GroupedSubstages, LeadSubstage } from '../../services/substages.api';
import { saveCallOutcome, SaveCallOutcomePayload } from '../../services/calls.api';

interface CallOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  callSessionId: string;
  leadId: string;
  leadName?: string;
  leadPhone?: string;
  sourceContext?: string;
  followUpId?: string;
  currentStageName?: string;
  currentSubstageName?: string;
  onSuccess?: (result: any) => void;
  onReturnToFollowUp?: () => void;
}

export const CallOutcomeModal: React.FC<CallOutcomeModalProps> = ({
  isOpen,
  onClose,
  callSessionId,
  leadId,
  leadName = 'Lead',
  leadPhone = '',
  sourceContext = 'ALL_LEADS',
  followUpId,
  currentStageName,
  currentSubstageName,
  onSuccess,
  onReturnToFollowUp,
}) => {
  const [groupedSubstages, setGroupedSubstages] = useState<GroupedSubstages[]>([]);
  const [loadingSubstages, setLoadingSubstages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'NOT_CONNECTED'>('CONNECTED');
  const [selectedSubstageId, setSelectedSubstageId] = useState<string | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [callPriority, setCallPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextFollowUpTime, setNextFollowUpTime] = useState('10:00');
  const [followUpDescription, setFollowUpDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSubstages();
      // Default next follow-up date to tomorrow
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      setNextFollowUpDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const loadSubstages = async () => {
    setLoadingSubstages(true);
    try {
      const data = await fetchGroupedSubstages();
      setGroupedSubstages(data);
    } catch (err) {
      console.error('Failed to load substages:', err);
    } finally {
      setLoadingSubstages(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const payload: SaveCallOutcomePayload = {
      callSessionId,
      connectionStatus,
      substageId: selectedSubstageId,
      outcomeNotes: outcomeNotes.trim() || undefined,
      callPriority,
      followUpRequired,
      nextFollowUpDate: followUpRequired ? nextFollowUpDate : undefined,
      nextFollowUpTime: followUpRequired ? nextFollowUpTime : undefined,
      followUpDescription: followUpRequired ? followUpDescription || outcomeNotes : undefined,
    };

    try {
      const res = await saveCallOutcome(leadId, payload);
      if (onSuccess) onSuccess(res);
      onClose();
      if (sourceContext === 'FOLLOW_UP_POPUP' && onReturnToFollowUp) {
        onReturnToFollowUp();
      }
    } catch (err: any) {
      console.error('Failed to save call outcome:', err);
      const msg = err.response?.data?.message || 'Failed to save call outcome. Please try again.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Call Outcome & Stage Update</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-200">{leadName}</span>
                {leadPhone && <span className="text-slate-500">• {leadPhone}</span>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-100">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Status Snapshot */}
          {(currentStageName || currentSubstageName) && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs dark:bg-slate-800/50 dark:border-slate-700">
              <span className="text-slate-500 font-medium">Current Status:</span>
              <div className="flex items-center gap-2">
                {currentStageName && (
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-semibold dark:bg-emerald-900/40 dark:text-emerald-300">
                    {currentStageName}
                  </span>
                )}
                {currentSubstageName && (
                  <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 font-medium dark:bg-slate-700 dark:text-slate-300">
                    {currentSubstageName}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Section 1: Connection Status Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Connection Status <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConnectionStatus('CONNECTED')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  connectionStatus === 'CONNECTED'
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/20 dark:bg-emerald-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${
                    connectionStatus === 'CONNECTED'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Call Connected</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Spoke with lead successfully</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConnectionStatus('NOT_CONNECTED')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  connectionStatus === 'NOT_CONNECTED'
                    ? 'border-rose-500 bg-rose-50/60 shadow-md ring-2 ring-rose-500/20 dark:bg-rose-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${
                    connectionStatus === 'NOT_CONNECTED'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700'
                  }`}
                >
                  <PhoneOff className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Not Connected</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">No answer, busy, or switched off</div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Substage Selection Grouped by Main Stage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Select Substage / Lead Stage Transition
              </label>
              {selectedSubstageId && (
                <button
                  type="button"
                  onClick={() => setSelectedSubstageId(null)}
                  className="text-xs text-rose-600 hover:underline font-medium"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {loadingSubstages ? (
              <div className="p-6 text-center text-slate-400 text-sm">Loading lead substages...</div>
            ) : groupedSubstages.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 dark:bg-slate-800 dark:border-slate-700">
                No active substages configured in Master Configuration.
              </div>
            ) : (
              <div className="space-y-4">
                {groupedSubstages.map((stageGroup) => {
                  const filteredSubstages = stageGroup.substages.filter((sub) => {
                    if (!sub.connectionStatusRestriction) return true;
                    return sub.connectionStatusRestriction === connectionStatus;
                  });

                  if (filteredSubstages.length === 0) return null;

                  return (
                    <div
                      key={stageGroup.id}
                      className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/80"
                    >
                      <div className="flex items-center gap-2 mb-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: stageGroup.color || '#10b981' }}
                        />
                        <span className="font-bold text-xs tracking-wide uppercase text-slate-700 dark:text-slate-200">
                          {stageGroup.name}
                        </span>
                        {stageGroup.isApprovalRequired && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            Approval Required
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {filteredSubstages.map((sub) => {
                          const isSelected = selectedSubstageId === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => setSelectedSubstageId(isSelected ? null : sub.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/20 dark:bg-emerald-600 dark:border-emerald-500'
                                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600'
                              }`}
                            >
                              <Tag className="w-3 h-3 opacity-70" />
                              <span>{sub.name}</span>
                              {sub.outcomeCategory && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                    sub.outcomeCategory === 'POSITIVE'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : sub.outcomeCategory === 'NEGATIVE'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {sub.outcomeCategory}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Call Priority & Outcome Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Call Priority
              </label>
              <div className="flex flex-col gap-2">
                {(['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCallPriority(p)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-center ${
                      callPriority === p
                        ? p === 'HIGH'
                          ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm dark:bg-rose-950/40 dark:text-rose-300'
                          : p === 'MEDIUM'
                          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm dark:bg-blue-950/40 dark:text-blue-300'
                          : 'bg-slate-100 border-slate-400 text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {p} Priority
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Outcome Remarks / Notes
              </label>
              <textarea
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                rows={3}
                placeholder="Enter key discussion details, customer interest level, or reason for no answer..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Section 4: Next Follow-Up Schedule */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 dark:bg-slate-800/30 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Schedule Next Follow-Up</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={followUpRequired}
                  onChange={(e) => setFollowUpRequired(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:peer-focus:ring-emerald-800 peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {followUpRequired && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Follow-Up Date</label>
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Time</label>
                  <input
                    type="time"
                    value={nextFollowUpTime}
                    onChange={(e) => setNextFollowUpTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between dark:bg-slate-800/80 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Cancel / Close
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide shadow-md shadow-emerald-600/20 disabled:opacity-50 transition flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Outcome...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit Outcome</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
