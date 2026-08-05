import React from 'react';
import { PhoneCall } from 'lucide-react';

interface CallButtonProps {
  leadId: string;
  leadName?: string;
  phone?: string | null;
  sourceContext?: 'ALL_LEADS' | 'LEAD_DETAILS' | 'FOLLOW_UP_POPUP';
  followUpId?: string;
  currentStageName?: string;
  currentSubstageName?: string;
  variant?: 'icon' | 'button' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onInitiate: (
    leadId: string,
    leadName: string,
    phone: string,
    sourceContext: 'ALL_LEADS' | 'LEAD_DETAILS' | 'FOLLOW_UP_POPUP',
    followUpId?: string,
    currentStageName?: string,
    currentSubstageName?: string,
  ) => void;
}

export const CallButton: React.FC<CallButtonProps> = ({
  leadId,
  leadName = 'Lead',
  phone,
  sourceContext = 'ALL_LEADS',
  followUpId,
  currentStageName,
  currentSubstageName,
  variant = 'icon',
  size = 'md',
  className = '',
  onInitiate,
}) => {
  const hasPhone = Boolean(phone && phone.trim());

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasPhone) return;
    onInitiate(leadId, leadName, phone!, sourceContext, followUpId, currentStageName, currentSubstageName);
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-xs',
    lg: 'px-3 py-2 text-sm',
  }[size];

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={!hasPhone}
        title={hasPhone ? `Call ${phone}` : 'No phone number available'}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-sm transition-all ${
          hasPhone
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 shadow-emerald-600/20'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800'
        } ${className}`}
      >
        <PhoneCall className="w-3.5 h-3.5" />
        <span>Call</span>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={!hasPhone}
        title={hasPhone ? `Call ${phone}` : 'No phone number available'}
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all shadow-sm ${
          hasPhone
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 shadow-emerald-600/20'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800'
        } ${sizeClasses} ${className}`}
      >
        <PhoneCall className="w-4 h-4" />
        <span>Call Lead</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!hasPhone}
      title={hasPhone ? `Call ${phone}` : 'No phone number available'}
      className={`inline-flex items-center justify-center rounded-xl transition-all ${
        hasPhone
          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white'
          : 'bg-slate-100 text-slate-300 cursor-not-allowed dark:bg-slate-800/50 dark:text-slate-600'
      } ${sizeClasses} ${className}`}
    >
      <PhoneCall className="w-4 h-4" />
    </button>
  );
};
