import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../../services/users.api';

interface UserSearchSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (userId: string) => void;
  title: string;
  excludeIds: Set<string>;
  includeInactive: boolean;
}

const UserSearchSelectModal: React.FC<UserSearchSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title,
  excludeIds,
  includeInactive,
}) => {
  const [search, setSearch] = useState('');

  // Fetch all eligible users
  const { data, isLoading } = useQuery({
    queryKey: ['org-chart-picker-users', includeInactive],
    queryFn: () => getUsers({ limit: 1000, isActive: includeInactive ? undefined : true }),
    enabled: isOpen,
    staleTime: 30_000,
  });

  const users = data?.users || [];

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((u: any) => {
      // Exclude invalid choices (self, current parent, descendants)
      if (excludeIds.has(u.id)) return false;

      if (query) {
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const roleName = (typeof u.role === 'object' ? u.role?.name : u.role || '').toLowerCase();
        const deptName = (typeof u.department === 'object' ? u.department?.name : u.department || '').toLowerCase();
        
        return name.includes(query) || email.includes(query) || roleName.includes(query) || deptName.includes(query);
      }
      return true;
    });
  }, [users, search, excludeIds]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900 leading-tight">{title}</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Select User
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user by name, email, role..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[300px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  <p className="text-sm font-bold">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <p className="text-sm font-bold">No matching users found</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching for a different name or email.</p>
                </div>
              ) : (
                filteredUsers.map((u: any) => {
                  const roleName = typeof u.role === 'object' ? u.role?.name : u.role;
                  const deptName = typeof u.department === 'object' ? u.department?.name : u.department;
                  
                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        onSelect(u.id);
                        onClose();
                      }}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50/50 border border-transparent hover:border-emerald-100 transition-all cursor-pointer group"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-black flex items-center justify-center shadow-md">
                        {(u.name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate group-hover:text-emerald-900 transition-colors">
                          {u.name || u.email.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {roleName && (
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[9px] font-bold uppercase tracking-wider">
                              {roleName}
                            </span>
                          )}
                          {deptName && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-wider">
                              {deptName}
                            </span>
                          )}
                          {!u.isActive && (
                            <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-500 text-[9px] font-bold uppercase tracking-wider">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserSearchSelectModal;
