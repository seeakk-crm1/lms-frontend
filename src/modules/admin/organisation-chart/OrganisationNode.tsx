import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  IdCard,
  MapPin,
  Shield,
  UserRound,
  Users,
} from 'lucide-react';
import type { DisplayOrganisationNode } from './OrganisationTree';

interface OrganisationNodeProps {
  node: DisplayOrganisationNode;
  expandedNodes: Record<string, boolean>;
  selectedNode: string | null;
  searchQuery: string;
  matchedIds: Set<string>;
  pathIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

const highlightText = (value: string | null | undefined, query: string): React.ReactNode => {
  const text = value?.trim() || 'Not assigned';
  if (!query.trim()) return text;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-amber-200 px-0.5 text-slate-950">{text.slice(index, index + lowerQuery.length)}</mark>
      {text.slice(index + lowerQuery.length)}
    </>
  );
};

const initialsFor = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'U';

const DetailRow = ({
  icon,
  label,
  value,
  query,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  query: string;
}) => (
  <div className="flex min-w-0 items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
    <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="truncate text-xs font-bold text-slate-700">{highlightText(value, query)}</p>
    </div>
  </div>
);

const OrganisationNode: React.FC<OrganisationNodeProps> = ({
  node,
  expandedNodes,
  selectedNode,
  searchQuery,
  matchedIds,
  pathIds,
  onToggle,
  onSelect,
}) => {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodes[node.id] ?? true;
  const isSelected = selectedNode === node.id;
  const isMatched = matchedIds.has(node.id);
  const isOnPath = pathIds.has(node.id);
  const statusLabel = node.isActive === false ? 'Inactive' : 'Active';

  return (
    <div className="org-node flex min-w-[280px] flex-col items-center md:min-w-[320px]">
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className={`w-full max-w-[340px] cursor-pointer rounded-2xl border bg-white p-4 shadow-sm transition-all ${
          isSelected ? 'border-emerald-400 ring-4 ring-emerald-500/10' : 'border-slate-200 hover:border-emerald-200 hover:shadow-md'
        } ${isOnPath ? 'shadow-[0_18px_45px_-28px_rgba(16,185,129,0.85)]' : ''}`}
        onClick={() => onSelect(node.id)}
        title={node.name}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-label={`Organisation user ${node.name}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(node.id);
          }
          if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && hasChildren) {
            event.preventDefault();
            onToggle(node.id);
          }
        }}
      >
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-inner">
            {node.avatarUrl ? (
              <img src={node.avatarUrl} alt={`${node.name} profile`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-black">
                {initialsFor(node.name)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-950">{highlightText(node.name, searchQuery)}</h3>
                <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                  {highlightText(node.designation || node.role || 'No designation', searchQuery)}
                </p>
              </div>

              {hasChildren && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggle(node.id);
                  }}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-600"
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.name}`}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                node.isActive === false ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {statusLabel}
              </span>
              {isMatched && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700">
                  Match
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          <DetailRow icon={<IdCard className="h-3.5 w-3.5" />} label="Employee ID" value={node.employeeId} query={searchQuery} />
          <DetailRow icon={<Building2 className="h-3.5 w-3.5" />} label="Department" value={node.department} query={searchQuery} />
          <DetailRow icon={<Shield className="h-3.5 w-3.5" />} label="Role" value={node.role} query={searchQuery} />
          <DetailRow icon={<MapPin className="h-3.5 w-3.5" />} label="Reporting Office" value={node.office} query={searchQuery} />
          <DetailRow icon={<UserRound className="h-3.5 w-3.5" />} label="Supervisor" value={node.supervisorName || 'Root user'} query={searchQuery} />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <span className="inline-flex items-center gap-2 text-xs font-black text-slate-600">
            <Users className="h-4 w-4 text-emerald-500" />
            Direct Reports
          </span>
          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-black text-slate-900 shadow-sm">{node.children.length}</span>
        </div>
      </motion.article>

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            key={`${node.id}-children`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="w-full overflow-visible"
          >
            <div className="relative mt-5 pl-5 md:pl-0 md:pt-8">
              <span className="absolute left-2 top-0 h-full w-px bg-slate-200 md:left-1/2 md:h-8 md:-translate-x-1/2" />
              {node.children.length > 1 && (
                <span className="absolute left-[10px] top-8 hidden h-px bg-slate-200 md:block md:left-10 md:right-10" />
              )}
              <div className="flex flex-col items-start gap-5 md:flex-row md:items-start md:justify-center md:gap-6">
                {node.children.map((child) => (
                  <div key={child.id} className="relative w-full md:w-auto md:pt-8">
                    <span className="absolute -left-3 top-7 h-px w-3 bg-slate-200 md:left-1/2 md:top-0 md:h-8 md:w-px md:-translate-x-1/2" />
                    <OrganisationNode
                      node={child}
                      expandedNodes={expandedNodes}
                      selectedNode={selectedNode}
                      searchQuery={searchQuery}
                      matchedIds={matchedIds}
                      pathIds={pathIds}
                      onToggle={onToggle}
                      onSelect={onSelect}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(OrganisationNode);
