import React from 'react';
import { AlertCircle, User, Phone, Mail, ChevronRight, X } from 'lucide-react';
import type { LeadListItem } from '../../../types/lead.types';

interface DuplicateMatchModalProps {
  isOpen: boolean;
  matchingLeads: LeadListItem[];
  onSelectLead: (lead: LeadListItem) => void;
  onClose: () => void;
  isLight?: boolean;
}

export const DuplicateMatchModal: React.FC<DuplicateMatchModalProps> = ({
  isOpen,
  matchingLeads,
  onSelectLead,
  onClose,
  isLight = false,
}) => {
  if (!isOpen || matchingLeads.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border p-5 text-xs transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 font-bold text-sm text-amber-500">
            <AlertCircle className="w-4 h-4" />
            <span>Multiple Matching Leads Found</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-slate-400 text-xs">
          Select which lead record you want to open in the Lead Edit form:
        </p>

        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {matchingLeads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => {
                onSelectLead(lead);
                onClose();
              }}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                isLight
                  ? 'bg-slate-50 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50'
                  : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2 font-bold text-sm text-slate-800 dark:text-slate-100">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{lead.name}</span>
                  {lead.stage?.name && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ml-2"
                      style={{ backgroundColor: lead.stage?.color || '#475569' }}
                    >
                      {lead.stage.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                  {lead.phone && (
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{lead.phone}</span>
                    </span>
                  )}
                  {lead.email && (
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{lead.email}</span>
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
