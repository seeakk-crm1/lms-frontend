import React, { memo, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarClock, CircleDollarSign, History, Mail, Phone, UserCircle2, X } from 'lucide-react';
import { format } from 'date-fns';
import { useLeadDetailQuery } from '../../../hooks/useLeads';
import type { LeadListItem } from '../../../types/lead.types';
import FollowUpBadge from './FollowUpBadge';

interface LeadViewDrawerProps {
  isOpen: boolean;
  lead: LeadListItem | null;
  initialTab?: 'overview' | 'history';
  onClose: () => void;
}

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'history', label: 'Activity History' },
  { key: 'notes', label: 'Notes' },
] as const;

const moneyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const LeadViewDrawer: React.FC<LeadViewDrawerProps> = ({ isOpen, lead, initialTab = 'overview', onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'notes'>(initialTab);
  const { data, isLoading } = useLeadDetailQuery(lead?.id, isOpen);
  const resolvedLead = (data || lead) as LeadListItem | null;

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  const timeline = useMemo(() => {
    if (!resolvedLead) return [];

    const items = [
      {
        id: 'created',
        label: 'Lead created',
        detail: resolvedLead.createdBy?.displayName || resolvedLead.createdBy?.email || 'System',
        at: resolvedLead.createdAt,
      },
      ...(resolvedLead.closedAt
        ? [
            {
              id: 'closed',
              label: `Lead closed${resolvedLead.closureType ? ` as ${resolvedLead.closureType}` : ''}`,
              detail: resolvedLead.closedBy?.displayName || resolvedLead.closedBy?.email || 'System',
              at: resolvedLead.closedAt,
            },
          ]
        : []),
      ...(resolvedLead.lobLogs || []).map((log) => ({
        id: log.id,
        label: 'LOB entry captured',
        detail: log.remarks || log.reasonId,
        at: log.changedAt,
      })),
    ];

    return items.sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime());
  }, [resolvedLead]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[130] flex justify-end">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            aria-label="Close lead view drawer"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-gray-200 bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-view-title"
          >
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">Closed Lead</p>
                  <h2 id="lead-view-title" className="mt-2 text-2xl font-black tracking-tight text-gray-900">
                    {resolvedLead?.name || 'Lead details'}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-gray-500">
                    Review ownership, revenue, closure context, and audit-friendly timeline in one place.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Close drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 rounded-2xl bg-gray-50 p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-2xl px-4 py-2 text-sm font-black transition-all ${
                      activeTab === tab.key ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {isLoading || !resolvedLead ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-20 rounded-3xl shimmer-bg" />
                  ))}
                </div>
              ) : activeTab === 'overview' ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-gray-100 bg-gray-50/60 p-5">
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Contact</p>
                      <div className="mt-4 space-y-3 text-sm font-semibold text-gray-600">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-emerald-500" />
                          <span>{resolvedLead.email || 'No email recorded'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-emerald-500" />
                          <span>{resolvedLead.phone || 'No phone recorded'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <UserCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>{resolvedLead.assignedTo?.displayName || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-gray-100 bg-gray-50/60 p-5">
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Revenue</p>
                      <div className="mt-4 space-y-3">
                        <div>
                          <div className="text-xs font-black uppercase tracking-widest text-gray-400">Expected</div>
                          <div className="mt-1 text-lg font-black text-gray-500">
                            {moneyFormatter.format(resolvedLead.expectedRevenue || 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-widest text-gray-400">Generated</div>
                          <div className={`mt-1 text-2xl font-black ${resolvedLead.closureType === 'WON' ? 'text-emerald-600' : 'text-gray-900'}`}>
                            {moneyFormatter.format(resolvedLead.generatedRevenue || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Pipeline Context</p>
                      <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <dt className="font-semibold text-gray-500">Stage</dt>
                          <dd className="font-black text-gray-900">{resolvedLead.stage?.name || 'No stage'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="font-semibold text-gray-500">Life Cycle</dt>
                          <dd className="font-black text-gray-900">{resolvedLead.lifecycle?.name || 'No lifecycle'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="font-semibold text-gray-500">Source</dt>
                          <dd className="font-black text-gray-900">{resolvedLead.source?.name || 'Unknown'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="font-semibold text-gray-500">Closure Type</dt>
                          <dd className="font-black text-gray-900">{resolvedLead.closureType || 'Pending'}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Scheduling</p>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start gap-3">
                          <CalendarClock className="mt-0.5 h-4 w-4 text-emerald-500" />
                          <div>
                            <div className="text-sm font-black text-gray-900">Next Follow-up</div>
                            <div className="mt-2">
                              <FollowUpBadge value={resolvedLead.nextFollowUpAt || null} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CircleDollarSign className="mt-0.5 h-4 w-4 text-emerald-500" />
                          <div className="text-sm font-semibold text-gray-600">
                            Closed {resolvedLead.closedAt ? format(new Date(resolvedLead.closedAt), 'dd MMM yyyy, hh:mm a') : 'Not recorded'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'history' ? (
                <div className="space-y-4">
                  {timeline.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/70 p-8 text-center">
                      <p className="text-sm font-semibold text-gray-500">No activity history is available for this lead yet.</p>
                    </div>
                  ) : (
                    timeline.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <History className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-black text-gray-900">{item.label}</div>
                            <div className="mt-1 text-sm font-semibold text-gray-500">{item.detail}</div>
                            <div className="mt-2 text-xs font-black uppercase tracking-[0.22em] text-gray-400">
                              {format(new Date(item.at), 'dd MMM yyyy, hh:mm a')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/70 p-8 text-center">
                  <p className="text-sm font-semibold text-gray-500">
                    Notes are not available from the current backend response yet. This drawer is ready to render them as soon as that API lands.
                  </p>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default memo(LeadViewDrawer);
