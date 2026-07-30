import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Mail, Shield, Building2 } from 'lucide-react';
import { OrganisationChartNode } from './types';

interface OrganisationNodeProps {
  node: OrganisationChartNode;
  expandedNodes: Record<string, boolean>;
  selectedNode: string | null;
  searchQuery: string;
  matchedIds: Set<string>;
  pathIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

const nodeTheme = (nodeType: OrganisationChartNode['nodeType']) => {
  if (nodeType === 'WORKSPACE') {
    return {
      card: 'bg-purple-50 border-purple-200',
      badge: 'bg-purple-100 text-purple-700',
      avatar: 'from-purple-500 to-indigo-500',
    };
  }
  if (nodeType === 'DEPARTMENT') {
    return {
      card: 'bg-indigo-50 border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-700',
      avatar: 'from-indigo-500 to-blue-500',
    };
  }
  return {
    card: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    avatar: 'from-emerald-500 to-teal-500',
  };
};

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
  const theme = useMemo(() => nodeTheme(node.nodeType), [node.nodeType]);

  return (
    <div className="flex flex-col items-center min-w-[220px]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={`w-[260px] rounded-2xl border p-4 shadow-sm transition-all cursor-pointer ${
          theme.card
        } ${isSelected ? 'ring-2 ring-emerald-400 shadow-lg' : 'hover:shadow-md'} ${
          isOnPath ? 'ring-1 ring-emerald-300/80' : ''
        }`}
        onClick={() => onSelect(node.id)}
        title={node.name}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-label={`Organisation node ${node.name}`}
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
          <div
            className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${theme.avatar} text-white font-black flex items-center justify-center shadow`}
          >
            {node.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-gray-900 truncate">
              {highlightText(node.name, searchQuery)}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${theme.badge}`}>
                {node.role || node.nodeType}
              </span>
              {node.nodeType === 'USER' && !node.isActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-200 text-gray-600">
                  Inactive
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
              className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-gray-600"
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.name}`}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        <div className="mt-3 space-y-1.5">
          {node.nodeType === 'USER' && (
            <>
              <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="truncate">{highlightText(node.role || 'No Role', searchQuery)}</span>
              </p>
              <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="truncate">{highlightText(node.department || 'No Department', searchQuery)}</span>
              </p>
              <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="truncate">{node.email}</span>
              </p>
            </>
          )}
          
          {(node.memberCount ?? 0) > 0 && (
            <div className="pt-1 mt-1 border-t border-black/5 flex items-center justify-between text-[11px] font-bold text-gray-600">
              <span>Team: {node.memberCount}</span>
              <span className="text-emerald-600">Active: {node.activeCount}</span>
            </div>
          )}

          {isMatched && (
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mt-1">Search Match</p>
          )}
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            key={`${node.id}-children`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="mt-5 w-full overflow-visible"
          >
            <div className="relative pt-6">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-px bg-gray-300" />
              {node.children.length > 1 && (
                <span className="absolute top-0 left-8 right-8 h-px bg-gray-300 hidden md:block" />
              )}
              <div className="flex flex-col md:flex-row gap-5 md:gap-6 justify-center items-center md:items-start">
                {node.children.map((child) => (
                  <div key={child.id} className="relative pt-6">
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-px bg-gray-300" />
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

