import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Mail, Shield, Building2, MapPin, AlertTriangle } from 'lucide-react';
import { OrganisationChartNode } from './types';

interface SupervisorNodeProps {
  node: OrganisationChartNode;
  expandedNodes: Record<string, boolean>;
  selectedNode: string | null;
  searchQuery: string;
  matchedIds: Set<string>;
  pathIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + lowerQuery.length);
  const after = text.slice(index + lowerQuery.length);

  return (
    <>
      {before}
      <mark className="bg-yellow-200 rounded px-0.5">{match}</mark>
      {after}
    </>
  );
};

const SupervisorNode: React.FC<SupervisorNodeProps> = ({
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
  // Default to expanded unless explicitly set to false
  const isExpanded = expandedNodes[node.id] ?? true;
  const isSelected = selectedNode === node.id;
  const isMatched = matchedIds.has(node.id);
  const isOnPath = pathIds.has(node.id);

  return (
    <div className="flex flex-col items-center">
      {/* User Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={`w-[260px] rounded-2xl border p-4 shadow-sm transition-all cursor-pointer bg-white border-slate-200 ${
          isSelected
            ? 'ring-2 ring-emerald-500 shadow-lg border-emerald-300'
            : 'hover:shadow-md hover:border-emerald-300'
        } ${isOnPath ? 'ring-2 ring-emerald-400/80 shadow-emerald-100' : ''}`}
        onClick={() => onSelect(node.id)}
        title={node.name}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-label={`Supervisor node ${node.name}`}
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
          {/* Avatar with Initials Fallback */}
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center shadow-sm">
            {node.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-900 truncate">
              {highlightText(node.name, searchQuery)}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
                Supervisor
              </span>
              {node.isActive === false ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200">
                  Inactive
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active
                </span>
              )}
            </div>
          </div>

          {hasChildren && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggle(node.id);
              }}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.name}`}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Card Details */}
        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5">
          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{highlightText(node.role || 'No Designation', searchQuery)}</span>
          </p>
          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{highlightText(node.department || 'No Department', searchQuery)}</span>
          </p>

          {node.status && (
            <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{node.status}</span>
            </p>
          )}

          {node.email && (
            <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{node.email}</span>
            </p>
          )}

          {/* Subordinates Count Badge */}
          {hasChildren && (
            <div className="pt-1.5 mt-1 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Direct Reports: {node.children.length}</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Team: {node.memberCount ?? node.children.length}
              </span>
            </div>
          )}

          {node.isOrphan && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Unassigned / Root Node</span>
            </div>
          )}

          {isMatched && (
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mt-1">
              ★ Search Match
            </p>
          )}
        </div>
      </motion.div>

      {/* Downward Vertical Stem connecting parent to children */}
      {hasChildren && isExpanded && (
        <div className="w-px h-6 bg-slate-300" />
      )}

      {/* Subordinates Recursive Subtree */}
      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            key={`${node.id}-sub-tree`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="w-full flex justify-center overflow-visible"
          >
            <div className="flex flex-row justify-center items-start">
              {node.children.map((child, index) => {
                const isFirst = index === 0;
                const isLast = index === node.children.length - 1;
                const isOnly = node.children.length === 1;

                return (
                  <div key={child.id} className="relative flex flex-col items-center px-4">
                    {/* Horizontal Connector Bar Segment */}
                    {!isOnly && (
                      <div
                        className={`absolute top-0 h-px bg-slate-300 ${
                          isFirst
                            ? 'left-1/2 right-0'
                            : isLast
                            ? 'left-0 right-1/2'
                            : 'left-0 right-0'
                        }`}
                      />
                    )}

                    {/* Vertical Drop Line into Child Card */}
                    <div className="w-px h-6 bg-slate-300 relative z-10" />

                    {/* Recursive Child Node */}
                    <SupervisorNode
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
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(SupervisorNode);
