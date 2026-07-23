import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Check,
  Search,
  Minus,
  Maximize2,
  Minimize2,
  CheckSquare,
  Square,
  Info,
} from 'lucide-react';
import useRoleStore from '../../../store/useRoleStore';
import { buildRbacTree, ModuleNode, SubmoduleNode, ActionItem } from './rbacTreeBuilder';

interface PermissionTreeProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
}

const PermissionTree: React.FC<PermissionTreeProps> = ({ selectedPermissions, onChange }) => {
  const { permissions } = useRoleStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedSubmodules, setExpandedSubmodules] = useState<Record<string, boolean>>({});

  // Build 3-level tree: Module -> Submodule -> Action
  const { modules, diagnostics } = useMemo(() => buildRbacTree(permissions), [permissions]);

  // Diagnostic logging requirement
  useEffect(() => {
    if (permissions && permissions.length > 0) {
      console.info('[RBAC Permission Tree Diagnostics]', {
        'Modules Loaded': diagnostics.modulesLoaded,
        'Submodules Loaded': diagnostics.submodulesLoaded,
        'Permissions Loaded': diagnostics.permissionsLoaded,
        'Missing Permissions': diagnostics.missingPermissions,
        'Duplicate Permissions': diagnostics.duplicatePermissions,
        'Permission Mapping Completed': diagnostics.permissionMappingCompleted,
      });
    }
  }, [diagnostics, permissions]);

  // Initialize expanded state for modules & submodules
  useEffect(() => {
    if (modules.length > 0 && Object.keys(expandedModules).length === 0) {
      const initModState: Record<string, boolean> = {};
      const initSubState: Record<string, boolean> = {};
      modules.forEach((mod) => {
        initModState[mod.id] = true; // Default expand all modules
        mod.submodules.forEach((sub) => {
          initSubState[sub.id] = true; // Default expand all submodules
        });
      });
      setExpandedModules(initModState);
      setExpandedSubmodules(initSubState);
    }
  }, [modules]);

  // Filter modules/submodules/actions based on search term
  const filteredModules = useMemo(() => {
    if (!searchTerm.trim()) return modules;
    const term = searchTerm.trim().toLowerCase();

    return modules
      .map((mod) => {
        const modMatches = mod.name.toLowerCase().includes(term);
        const matchingSubmodules = mod.submodules
          .map((sub) => {
            const subMatches = sub.name.toLowerCase().includes(term);
            const matchingActions = sub.actions.filter(
              (act) =>
                act.key.toLowerCase().includes(term) ||
                act.actionName.toLowerCase().includes(term) ||
                act.description.toLowerCase().includes(term),
            );

            if (modMatches || subMatches || matchingActions.length > 0) {
              return {
                ...sub,
                actions: subMatches || modMatches ? sub.actions : matchingActions,
              };
            }
            return null;
          })
          .filter((s): s is SubmoduleNode => s !== null);

        if (modMatches || matchingSubmodules.length > 0) {
          return {
            ...mod,
            submodules: modMatches ? mod.submodules : matchingSubmodules,
          };
        }
        return null;
      })
      .filter((m): m is ModuleNode => m !== null);
  }, [modules, searchTerm]);

  // Helper stats for module
  const getModuleStats = (mod: ModuleNode) => {
    let total = 0;
    let selected = 0;
    mod.submodules.forEach((sub) => {
      sub.actions.forEach((act) => {
        total++;
        if (selectedPermissions.includes(act.key)) selected++;
      });
    });
    return {
      total,
      selected,
      isAll: selected === total && total > 0,
      isSome: selected > 0 && selected < total,
    };
  };

  // Helper stats for submodule
  const getSubmoduleStats = (sub: SubmoduleNode) => {
    const total = sub.actions.length;
    const selected = sub.actions.filter((act) => selectedPermissions.includes(act.key)).length;
    return {
      total,
      selected,
      isAll: selected === total && total > 0,
      isSome: selected > 0 && selected < total,
    };
  };

  // Toggle single action permission key with view dependency check
  const handleToggleAction = (actionKey: string, submoduleActions: ActionItem[]) => {
    let newSelection = [...selectedPermissions];
    if (newSelection.includes(actionKey)) {
      newSelection = newSelection.filter((k) => k !== actionKey);
    } else {
      newSelection.push(actionKey);
      // Auto-select VIEW permission if user checks EDIT/CREATE/DELETE/EXPORT/etc.
      if (
        actionKey.endsWith('_EDIT') ||
        actionKey.endsWith('_CREATE') ||
        actionKey.endsWith('_DELETE') ||
        actionKey.endsWith('_EXPORT') ||
        actionKey.endsWith('_APPROVE') ||
        actionKey.endsWith('_ASSIGN')
      ) {
        const viewAction = submoduleActions.find(
          (a) =>
            a.key.endsWith('_VIEW') ||
            a.key.endsWith('_VIEW_ALL') ||
            a.key.toLowerCase().includes('view'),
        );
        if (viewAction && !newSelection.includes(viewAction.key)) {
          newSelection.push(viewAction.key);
        }
      }
    }
    onChange(newSelection);
  };

  // Toggle Submodule (Select All / Deselect All within submodule)
  const handleToggleSubmodule = (sub: SubmoduleNode, checkAll: boolean) => {
    const subKeys = sub.actions.map((a) => a.key);
    let newSelection = [...selectedPermissions];
    if (checkAll) {
      subKeys.forEach((key) => {
        if (!newSelection.includes(key)) newSelection.push(key);
      });
    } else {
      newSelection = newSelection.filter((key) => !subKeys.includes(key));
    }
    onChange(newSelection);
  };

  // Toggle Module (Select All / Deselect All within entire module)
  const handleToggleModule = (mod: ModuleNode, checkAll: boolean) => {
    const modKeys: string[] = [];
    mod.submodules.forEach((sub) => sub.actions.forEach((a) => modKeys.push(a.key)));
    let newSelection = [...selectedPermissions];

    if (checkAll) {
      modKeys.forEach((key) => {
        if (!newSelection.includes(key)) newSelection.push(key);
      });
    } else {
      newSelection = newSelection.filter((key) => !modKeys.includes(key));
    }
    onChange(newSelection);
  };

  const handleExpandAll = () => {
    const nextMod: Record<string, boolean> = {};
    const nextSub: Record<string, boolean> = {};
    modules.forEach((m) => {
      nextMod[m.id] = true;
      m.submodules.forEach((s) => (nextSub[s.id] = true));
    });
    setExpandedModules(nextMod);
    setExpandedSubmodules(nextSub);
  };

  const handleCollapseAll = () => {
    setExpandedModules({});
    setExpandedSubmodules({});
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Search & Actions Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search module, submodule, or action permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExpandAll}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Expand all modules & submodules"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            Expand All
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Collapse all modules & submodules"
          >
            <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
            Collapse All
          </button>
          <button
            type="button"
            onClick={() => onChange(permissions.map((p) => p.key))}
            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs font-semibold transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* 3-Level Permission Tree */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[520px] scrollbar-thin">
        {filteredModules.length === 0 ? (
          <div className="p-8 text-center text-xs font-medium text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            No permissions matching "{searchTerm}".
          </div>
        ) : (
          filteredModules.map((mod) => {
            const modStats = getModuleStats(mod);
            const isModExpanded = expandedModules[mod.id] ?? true;

            return (
              <div
                key={mod.id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs"
              >
                {/* Level 1: Module Header */}
                <div
                  className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors border-b ${
                    modStats.selected > 0
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
                      : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:bg-slate-100/60'
                  }`}
                  onClick={() =>
                    setExpandedModules((prev) => ({ ...prev, [mod.id]: !isModExpanded }))
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleModule(mod, !modStats.isAll);
                      }}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        modStats.isAll
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : modStats.isSome
                            ? 'bg-emerald-500/30 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                      }`}
                    >
                      {modStats.isAll && <Check className="w-3 h-3" strokeWidth={3} />}
                      {modStats.isSome && !modStats.isAll && <Minus className="w-3 h-3" strokeWidth={3} />}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-wide">
                      {mod.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        modStats.selected > 0
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {modStats.selected} / {modStats.total}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isModExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Level 2: Submodules Accordion Container */}
                <AnimatePresence initial={false}>
                  {isModExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-3 space-y-2.5 bg-slate-50/30 dark:bg-slate-950/30"
                    >
                      {mod.submodules.map((sub) => {
                        const subStats = getSubmoduleStats(sub);
                        const isSubExpanded = expandedSubmodules[sub.id] ?? true;

                        return (
                          <div
                            key={sub.id}
                            className="border border-slate-200/80 dark:border-slate-800/80 rounded-lg overflow-hidden bg-white dark:bg-slate-900"
                          >
                            {/* Level 2: Submodule Header */}
                            <div
                              className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                                subStats.selected > 0
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                                  : 'bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50'
                              }`}
                              onClick={() =>
                                setExpandedSubmodules((prev) => ({
                                  ...prev,
                                  [sub.id]: !isSubExpanded,
                                }))
                              }
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleSubmodule(sub, !subStats.isAll);
                                  }}
                                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                    subStats.isAll
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : subStats.isSome
                                        ? 'bg-emerald-500/30 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                                  }`}
                                >
                                  {subStats.isAll && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                                  {subStats.isSome && !subStats.isAll && (
                                    <Minus className="w-2.5 h-2.5" strokeWidth={3} />
                                  )}
                                </div>
                                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                                  {sub.name}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">
                                  ({subStats.selected} / {subStats.total})
                                </span>
                              </div>

                              {isSubExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>

                            {/* Level 3: Action Checkboxes Grid */}
                            <AnimatePresence initial={false}>
                              {isSubExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="p-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900"
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {sub.actions.map((act) => {
                                      const isChecked = selectedPermissions.includes(act.key);

                                      return (
                                        <div
                                          key={act.key}
                                          onClick={() => handleToggleAction(act.key, sub.actions)}
                                          className={`p-2 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${
                                            isChecked
                                              ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 ring-1 ring-emerald-500/20'
                                              : 'bg-slate-50/30 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700'
                                          }`}
                                        >
                                          <div
                                            className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center transition-all shrink-0 ${
                                              isChecked
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                                            }`}
                                          >
                                            {isChecked && <Check className="w-2.5 h-2.5" strokeWidth={4} />}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div
                                              className={`text-xs font-bold leading-snug ${
                                                isChecked
                                                  ? 'text-emerald-700 dark:text-emerald-300'
                                                  : 'text-slate-700 dark:text-slate-200'
                                              }`}
                                            >
                                              {act.actionName}
                                            </div>
                                            <div
                                              className="text-[10px] text-slate-400 font-medium truncate mt-0.5"
                                              title={act.description}
                                            >
                                              {act.description}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PermissionTree;
