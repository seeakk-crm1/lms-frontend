import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Check,
  Search,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { Permission } from '../../../types/role.types';
import useRoleStore from '../../../store/useRoleStore';

interface PermissionTreeProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
}

const PermissionTree: React.FC<PermissionTreeProps> = ({ selectedPermissions, onChange }) => {
  const { permissions, togglePermissionGroup, permissionUIState } = useRoleStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Group permissions
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach((p) => {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    });
    return groups;
  }, [permissions]);

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedPermissions;
    const filtered: Record<string, Permission[]> = {};
    Object.entries(groupedPermissions).forEach(([group, perms]) => {
      const matched = perms.filter(
        (p) => 
          p.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matched.length > 0 || group.toLowerCase().includes(searchTerm.toLowerCase())) {
        filtered[group] = matched.length > 0 ? matched : perms;
      }
    });
    return filtered;
  }, [groupedPermissions, searchTerm]);

  const handleToggleGroup = (group: string, isChecked: boolean) => {
    const groupPermKeys = groupedPermissions[group].map(p => p.key);
    let newSelection = [...selectedPermissions];
    
    if (isChecked) {
      // Add all from group if not already present
      groupPermKeys.forEach(key => {
        if (!newSelection.includes(key)) newSelection.push(key);
      });
    } else {
      // Remove all from group
      newSelection = newSelection.filter(key => !groupPermKeys.includes(key));
    }
    onChange(newSelection);
  };

  const handleTogglePermission = (key: string) => {
    let newSelection = [...selectedPermissions];
    if (newSelection.includes(key)) {
      newSelection = newSelection.filter(k => k !== key);
    } else {
      newSelection.push(key);
      // Dependency Logic: If editing/deleting, must have View
      if (key.endsWith('_EDIT') || key.endsWith('_DELETE') || key.endsWith('_CREATE')) {
          const base = key.split('_').slice(0, -1).join('_');
          const viewKey = `${base}_VIEW`;
          const viewAllKey = `${base}_VIEW_ALL`;
          // Find if a view permission exists in the set
          if (permissions.some(p => p.key === viewKey) && !newSelection.includes(viewKey)) {
              newSelection.push(viewKey);
          } else if (permissions.some(p => p.key === viewAllKey) && !newSelection.includes(viewAllKey)) {
            newSelection.push(viewAllKey);
          }
      }
    }
    onChange(newSelection);
  };

  const getGroupStats = (group: string) => {
    const groupPerms = groupedPermissions[group] || [];
    const selectedInGroup = groupPerms.filter(p => selectedPermissions.includes(p.key)).length;
    return {
      total: groupPerms.length,
      selected: selectedInGroup,
      isAll: selectedInGroup === groupPerms.length && groupPerms.length > 0,
      isSome: selectedInGroup > 0 && selectedInGroup < groupPerms.length
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => onChange(permissions.map(p => p.key))}
                className="px-3 py-1.5 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-lg text-xs font-bold transition-all border border-gray-100"
            >
                Select All
            </button>
            <button 
                onClick={() => onChange([])}
                className="px-3 py-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-lg text-xs font-bold transition-all border border-gray-100"
            >
                Clear
            </button>
        </div>
      </div>

      {/* Permission Tree */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[500px]">
        {Object.entries(filteredGroups).map(([group, perms]) => {
          const stats = getGroupStats(group);
          const isExpanded = permissionUIState[group] ?? true;

          return (
            <div key={group} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
              <div 
                className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${stats.selected > 0 ? 'bg-emerald-50/30' : 'bg-gray-50/50 hover:bg-gray-50'}`}
                onClick={() => togglePermissionGroup(group)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggleGroup(group, !stats.isAll);
                    }}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${stats.isAll ? 'bg-emerald-500 border-emerald-500' : stats.isSome ? 'bg-emerald-500/50 border-emerald-500/50' : 'bg-white border-gray-300 hover:border-emerald-500'}`}
                  >
                    {stats.isAll && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    {stats.isSome && !stats.isAll && <div className="w-2 h-0.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{group.replace('_', ' ')}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stats.selected > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                    {stats.selected} / {stats.total}
                  </span>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-gray-50"
                  >
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((p) => {
                        const isChecked = selectedPermissions.includes(p.key);
                        return (
                          <div 
                            key={p.key}
                            onClick={() => handleTogglePermission(p.key)}
                            className={`p-2 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${isChecked ? 'bg-emerald-50/50 border-emerald-100 ring-4 ring-emerald-500/5' : 'bg-white border-gray-50 hover:border-gray-100'}`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${isChecked ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'}`}>
                              {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                            </div>
                            <div className="min-w-0">
                              <div className={`text-xs font-bold leading-none mb-1 ${isChecked ? 'text-emerald-700' : 'text-gray-700'}`}>
                                {p.key.split('_').pop()?.replace('VIEW', 'View').replace('CREATE', 'Create').replace('EDIT', 'Edit').replace('DELETE', 'Delete').replace('ALL', 'All').replace('OWN', 'Own').replace('TEAM', 'Team') || p.key}
                              </div>
                              <div className="text-[10px] text-gray-400 font-medium truncate" title={p.description || ''}>
                                {p.description || p.key}
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
      </div>
    </div>
  );
};

export default PermissionTree;
