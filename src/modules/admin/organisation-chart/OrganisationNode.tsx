import React, { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Mail, Shield, Building2, MoreVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { OrganisationChartNode } from './types';
import UserSearchSelectModal from './UserSearchSelectModal';

interface OrganisationNodeProps {
  node: OrganisationChartNode;
  expandedNodes: Record<string, boolean>;
  selectedNode: string | null;
  searchQuery: string;
  matchedIds: Set<string>;
  pathIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  
  // New props for editing
  isEditMode?: boolean;
  onMoveNode?: (userId: string, supervisorId: string | null) => Promise<void>;
  parentById?: Map<string, string | null>;
  includeInactive?: boolean;
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
  isEditMode = false,
  onMoveNode,
  parentById = new Map(),
  includeInactive = false,
}) => {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodes[node.id] ?? true;
  const isSelected = selectedNode === node.id;
  const isMatched = matchedIds.has(node.id);
  const isOnPath = pathIds.has(node.id);
  const theme = useMemo(() => nodeTheme(node.nodeType), [node.nodeType]);

  const [isDragOver, setIsDragOver] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isChangeParentOpen, setIsChangeParentOpen] = useState(false);

  // Helper to check if a node is descendant of parentId
  const checkIsDescendant = (parentId: string, childId: string): boolean => {
    let current: string | null | undefined = childId;
    while (current) {
      if (current === parentId) return true;
      current = parentById.get(current);
    }
    return false;
  };

  // HTML5 Drag Handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (!isEditMode || node.nodeType !== 'USER') return;
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!isEditMode || !onMoveNode) return;

    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === node.id) return;

    // Cycle Prevention Check: Target must not report to dragged user
    if (checkIsDescendant(draggedId, node.id)) {
      toast.error('Circular reporting structure detected. You cannot assign a user under their own subordinate.');
      return;
    }

    // Set supervisorId to the drop target user ID, or null if dropped on Workspace/Department
    const targetSupervisorId = node.nodeType === 'USER' ? node.id : null;
    await onMoveNode(draggedId, targetSupervisorId);
  };

  // Exclude sets for dropdown picker modals
  const addUserExcludeIds = useMemo(() => {
    const ancestors = new Set<string>();
    let current: string | null | undefined = node.id;
    while (current) {
      ancestors.add(current);
      current = parentById.get(current);
    }
    return ancestors;
  }, [node.id, parentById]);

  const changeParentExcludeIds = useMemo(() => {
    const getDescendants = (n: OrganisationChartNode): string[] => {
      const ids: string[] = [];
      n.children.forEach((child) => {
        ids.push(child.id);
        ids.push(...getDescendants(child));
      });
      return ids;
    };
    const ids = new Set<string>([node.id]); // Exclude self
    if (node.reportingTo) ids.add(node.reportingTo); // Exclude current supervisor
    getDescendants(node).forEach((id) => ids.add(id)); // Exclude descendants
    return ids;
  }, [node]);

  return (
    <div className="flex flex-col items-center min-w-[220px]">
      <div
        draggable={isEditMode && node.nodeType === 'USER'}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="w-full flex justify-center animate-card-drag"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className={`w-[260px] rounded-2xl border p-4 shadow-sm transition-all cursor-pointer relative ${
            theme.card
          } ${isSelected ? 'ring-2 ring-emerald-400 shadow-lg' : 'hover:shadow-md'} ${
            isOnPath ? 'ring-1 ring-emerald-300/80' : ''
          } ${isDragOver ? 'border-emerald-500 bg-emerald-100/50 scale-102 ring-2 ring-emerald-500' : ''} ${
            isEditMode && node.nodeType === 'USER' ? 'border-dashed border-gray-400' : ''
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
                {node.nodeType}
              </span>
              {node.nodeType === 'USER' && !node.isActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-200 text-gray-600">
                  Inactive
                </span>
              )}
            </div>
          </div>

          {/* Action Menu (Three Dots) - print-exclude */}
          {isEditMode && onMoveNode && (
            <div className="relative print:hidden">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1.5 rounded-lg hover:bg-black/5 text-gray-500 hover:text-gray-900"
                aria-label="Node options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsMenuOpen(false);
                    }}
                  />
                  <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white border border-gray-150 shadow-lg py-1 z-40 text-left">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsMenuOpen(false);
                        onSelect(node.id);
                      }}
                      className="w-full px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      View User
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsMenuOpen(false);
                        setIsAddUserOpen(true);
                      }}
                      className="w-full px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      Add User Under
                    </button>
                    {node.nodeType === 'USER' && (
                      <>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setIsMenuOpen(false);
                            setIsChangeParentOpen(true);
                          }}
                          className="w-full px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          Change Parent
                        </button>
                        {node.reportingTo && (
                          <>
                            <button
                              type="button"
                              onClick={async (event) => {
                                event.stopPropagation();
                                setIsMenuOpen(false);
                                await onMoveNode(node.id, null);
                              }}
                              className="w-full px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                            >
                              Move to Root
                            </button>
                            <button
                              type="button"
                              onClick={async (event) => {
                                event.stopPropagation();
                                setIsMenuOpen(false);
                                await onMoveNode(node.id, null);
                              }}
                              className="w-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              Remove from Hierarchy
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {hasChildren && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggle(node.id);
              }}
              className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-gray-600 print:hidden"
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
    </div>

      {/* Dropdown Modals */}
      {isAddUserOpen && onMoveNode && (
        <UserSearchSelectModal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          onSelect={async (userId) => {
            const targetSupervisorId = node.nodeType === 'USER' ? node.id : null;
            await onMoveNode(userId, targetSupervisorId);
          }}
          title={`Add User Under: ${node.name}`}
          excludeIds={addUserExcludeIds}
          includeInactive={includeInactive}
        />
      )}

      {isChangeParentOpen && onMoveNode && (
        <UserSearchSelectModal
          isOpen={isChangeParentOpen}
          onClose={() => setIsChangeParentOpen(false)}
          onSelect={async (supervisorId) => {
            await onMoveNode(node.id, supervisorId);
          }}
          title={`Change Parent for: ${node.name}`}
          excludeIds={changeParentExcludeIds}
          includeInactive={includeInactive}
        />
      )}

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
            <div className="relative pt-6 animate-lines-fade">
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
                      isEditMode={isEditMode}
                      onMoveNode={onMoveNode}
                      parentById={parentById}
                      includeInactive={includeInactive}
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
