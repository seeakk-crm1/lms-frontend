import React, { useState } from 'react';
import {
  CheckSquare,
  Copy,
  Check,
  PhoneCall,
  PhoneForwarded,
  User,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CallInitiatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadName: string;
  leadPhone: string;
  telUrl?: string;
  currentStageName?: string;
  currentSubstageName?: string;
  onLaunchDialer: () => void;
  onDirectOutcome: () => void;
}

export const CallInitiatorModal: React.FC<CallInitiatorModalProps> = ({
  isOpen,
  onClose,
  leadName,
  leadPhone,
  telUrl,
  currentStageName,
  currentSubstageName,
  onLaunchDialer,
  onDirectOutcome,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyPhone = () => {
    if (!leadPhone) return;
    navigator.clipboard.writeText(leadPhone);
    setCopied(true);
    toast.success(`Copied ${leadPhone} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[10350] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 bg-white/20 rounded-2xl animate-ping opacity-75" />
              <div className="relative p-3 rounded-2xl bg-white text-emerald-600 shadow-lg shadow-emerald-950/20">
                <PhoneCall className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-emerald-200" />
                <span>Seeakk Call Engine</span>
              </div>
              <h3 className="text-lg font-black tracking-tight">Initiating Outgoing Call</h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Lead Snapshot Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 font-black text-sm flex items-center justify-center border border-emerald-500/20">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{leadName}</h4>
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{leadPhone}</span>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                      title="Copy phone number"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Stage & Substage Status */}
            {(currentStageName || currentSubstageName) && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold text-[11px]">Current Stage:</span>
                {currentStageName && (
                  <span className="px-2.5 py-0.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                    {currentStageName}
                  </span>
                )}
                {currentSubstageName && (
                  <span className="px-2 py-0.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-[11px]">
                    {currentSubstageName}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 bg-emerald-50/60 border border-emerald-200/60 p-3 rounded-2xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Call session created. Select your preferred call action below to launch dialer or record call notes.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={onLaunchDialer}
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-black text-xs tracking-wide shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <PhoneForwarded className="w-4 h-4" />
              <span>Launch Device Phone Dialer ({leadPhone})</span>
            </button>

            <button
              type="button"
              onClick={onDirectOutcome}
              className="w-full py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <CheckSquare className="w-4 h-4 text-slate-500" />
              <span>Record Outcome / Stage Update Directly</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-extrabold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel / Close
          </button>
        </div>
      </div>
    </div>
  );
};
