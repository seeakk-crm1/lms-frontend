import React, { memo, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  CircleDollarSign,
  History,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Tag,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { useLeadDetailQuery } from '../../../hooks/useLeads';
import type { LeadListItem } from '../../../types/lead.types';
import FollowUpBadge from './FollowUpBadge';
import { stageBadgeStyle } from '../../../utils/leadStageColor';
import WhatsAppActionButton from '../../../components/common/WhatsAppActionButton';
import { LEAD_WHATSAPP_PERMISSIONS } from '../../../constants/whatsappPermissions';

interface LeadViewDrawerProps {
  isOpen: boolean;
  lead: LeadListItem | null;
  initialTab?: 'overview' | 'history';
  onClose: () => void;
  onEdit?: (lead: LeadListItem) => void;
}

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'history', label: 'Activity' },
] as const;

const moneyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
    <dt className="shrink-0 text-xs font-semibold text-gray-500">{label}</dt>
    <dd className="text-right text-sm font-semibold text-gray-900">{value}</dd>
  </div>
);

const LeadViewDrawer: React.FC<LeadViewDrawerProps> = ({
  isOpen,
  lead,
  initialTab = 'overview',
  onClose,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>(initialTab);
  const { data, isLoading } = useLeadDetailQuery(lead?.id, isOpen);
  const resolvedLead = (data || lead) as LeadListItem | null;
  const isClosedLead = Boolean(
    !resolvedLead?.isLOB && (resolvedLead?.isClosed || resolvedLead?.closureType) && resolvedLead?.stage?.isLOB !== true,
  );

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

  const followUpTypeLabel = resolvedLead?.nextFollowUpType
    ? resolvedLead.nextFollowUpType.replace(/_/g, ' ')
    : null;

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[130] flex justify-end">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
            aria-label="Close lead details"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="relative flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-gray-100 bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-view-title"
          >
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                    {isClosedLead ? 'Closed lead' : 'Lead details'}
                  </p>
                  <h2 id="lead-view-title" className="mt-1 truncate text-xl font-bold text-gray-900">
                    {resolvedLead?.name || '—'}
                  </h2>
                  {resolvedLead?.stage?.name ? (
                    <span
                      className="mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={stageBadgeStyle(resolvedLead.stage.color)}
                    >
                      {resolvedLead.stage.name}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex gap-1 rounded-xl bg-gray-50 p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      activeTab === tab.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isLoading || !resolvedLead ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-14 rounded-xl shimmer-bg" />
                  ))}
                </div>
              ) : activeTab === 'overview' ? (
                <div className="space-y-4">
                  <section className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      Contact
                    </p>
                    <div className="space-y-2.5 text-sm text-gray-700">
                      <div className="flex items-center gap-2.5">
                        <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="font-medium">{resolvedLead.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="font-medium">{resolvedLead.phone || 'No phone'}</span>
                        <WhatsAppActionButton
                          phone={resolvedLead.phone}
                          variant="compact"
                          stopPropagation={false}
                          requiredPermissions={LEAD_WHATSAPP_PERMISSIONS}
                          audit={{
                            entityType: 'Lead',
                            entityId: resolvedLead.id,
                            entityName: resolvedLead.name,
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="font-medium">{resolvedLead.companyName?.trim() || 'No company'}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        <span className="font-medium whitespace-pre-wrap">
                          {resolvedLead.address?.trim() || 'No address'}
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-gray-100 p-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      Next follow-up
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <FollowUpBadge value={resolvedLead.nextFollowUpAt || null} />
                      <WhatsAppActionButton
                        phone={resolvedLead.phone}
                        variant="compact"
                        stopPropagation={false}
                        requiredPermissions={LEAD_WHATSAPP_PERMISSIONS}
                        title="Open WhatsApp for follow-up"
                        audit={{
                          entityType: 'Lead',
                          entityId: resolvedLead.id,
                          entityName: resolvedLead.name,
                        }}
                      />
                    </div>
                    {followUpTypeLabel ? (
                      <p className="mt-2 text-xs font-semibold text-gray-500">
                        Type: <span className="text-gray-800">{followUpTypeLabel}</span>
                      </p>
                    ) : null}
                    {resolvedLead.followUpDescription ? (
                      <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
                        {resolvedLead.followUpDescription}
                      </p>
                    ) : null}
                  </section>

                  <section className="rounded-2xl border border-gray-100 p-4">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      Pipeline
                    </p>
                    <dl>
                      <DetailRow
                        label="Assigned to"
                        value={
                          <span className="inline-flex flex-col items-end">
                            <span>{resolvedLead.assignedTo?.displayName || 'Unassigned'}</span>
                            {resolvedLead.assignedTo?.email ? (
                              <span className="text-[11px] font-medium text-gray-500">
                                {resolvedLead.assignedTo.email}
                              </span>
                            ) : null}
                          </span>
                        }
                      />
                      <DetailRow label="Life cycle" value={resolvedLead.lifecycle?.name || 'No lifecycle'} />
                      <DetailRow label="Source" value={resolvedLead.source?.name || 'Unknown'} />
                      <DetailRow
                        label="Created"
                        value={format(new Date(resolvedLead.createdAt), 'dd MMM yyyy, hh:mm a')}
                      />
                      <DetailRow
                        label="Last updated"
                        value={format(new Date(resolvedLead.updatedAt), 'dd MMM yyyy, hh:mm a')}
                      />
                      {resolvedLead.createdBy ? (
                        <DetailRow
                          label="Created by"
                          value={resolvedLead.createdBy.displayName || resolvedLead.createdBy.email}
                        />
                      ) : null}
                    </dl>
                  </section>

                  <section className="rounded-2xl border border-gray-100 p-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      Revenue
                    </p>
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500">Expected</p>
                        <p className="text-lg font-bold text-gray-900">
                          {moneyFormatter.format(resolvedLead.expectedRevenue || 0)}
                        </p>
                      </div>
                    </div>
                    {isClosedLead ? (
                      <div className="mt-3 border-t border-gray-50 pt-3">
                        <p className="text-[11px] font-semibold text-gray-500">Generated</p>
                        <p
                          className={`text-lg font-bold ${
                            resolvedLead.closureType === 'WON' ? 'text-emerald-600' : 'text-gray-900'
                          }`}
                        >
                          {moneyFormatter.format(resolvedLead.generatedRevenue || 0)}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-gray-500">
                          Closure: {resolvedLead.closureType || '—'}
                        </p>
                      </div>
                    ) : null}
                  </section>

                  {!isClosedLead && resolvedLead.slaState ? (
                    <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                      <div className="flex items-center gap-2 text-amber-800">
                        <Tag className="h-4 w-4" />
                        <p className="text-xs font-bold uppercase tracking-wide">
                          SLA: {resolvedLead.slaState.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </section>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-3">
                  {timeline.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
                      No activity recorded yet.
                    </p>
                  ) : (
                    timeline.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <History className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900">{item.label}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{item.detail}</p>
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            {format(new Date(item.at), 'dd MMM yyyy, hh:mm a')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {resolvedLead && !isLoading && onEdit && !isClosedLead && !resolvedLead.deletedAt ? (
              <div className="border-t border-gray-100 bg-white px-5 py-4">
                <button
                  type="button"
                  onClick={() => onEdit(resolvedLead)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800"
                >
                  <Pencil className="h-4 w-4" />
                  Edit lead
                </button>
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default memo(LeadViewDrawer);
