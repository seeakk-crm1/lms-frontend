import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarPlus, Mail, Search, Users } from 'lucide-react';
import type { RosterUser } from './types';

interface Props {
  users: RosterUser[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOpenRoster: (user: RosterUser) => void;
}

const RosterTable: React.FC<Props> = ({
  users,
  isLoading,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onOpenRoster,
}) => {
  const pageButtons = useMemo(() => Array.from({ length: totalPages }, (_, idx) => idx + 1), [totalPages]);
  const safeFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const safeTo = Math.min(page * limit, total);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left min-w-[980px]">
          <thead>
            <tr className="bg-gray-50/60">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">User</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Department</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Supervisor</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, col) => (
                    <td key={col} className="px-6 py-4">
                      <div className="h-4 rounded w-24 shimmer-bg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-700">No users found</p>
                  <p className="text-xs text-gray-400 mt-1">Try changing filters or search</p>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 font-semibold inline-flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">{user.department || 'Unassigned'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">{user.supervisor || 'N/A'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onOpenRoster(user)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-black transition-all hover:shadow-sm"
                      aria-label={`Open roster for ${user.name}`}
                      title="Open roster"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      Roster
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-50">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={`mobile-skeleton-${idx}`} className="p-4 animate-pulse space-y-2">
              <div className="h-4 w-1/2 rounded shimmer-bg" />
              <div className="h-3 w-2/3 rounded shimmer-bg" />
              <div className="h-9 w-full rounded-xl shimmer-bg" />
            </div>
          ))
        ) : users.length === 0 ? (
          <div className="py-14 text-center px-6">
            <Users className="w-8 h-8 mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gray-700 mt-2">No users found</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="p-4 space-y-3 hover:bg-gray-50/60 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-black text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 font-semibold">{user.email}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                    user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {user.status}
                </span>
              </div>
              <div className="text-xs font-semibold text-gray-600">
                {user.department || 'Unassigned'} • {user.supervisor || 'N/A'}
              </div>
              <button
                onClick={() => onOpenRoster(user)}
                className="w-full py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-black"
              >
                Open Roster
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-[11px] font-bold text-gray-500">
          Showing {safeFrom}-{safeTo} of {total} users
        </span>
        <div className="flex items-center gap-1 overflow-x-auto">
          {pageButtons.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-black ${
                p === page ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-100 text-gray-500 hover:text-gray-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(RosterTable);
