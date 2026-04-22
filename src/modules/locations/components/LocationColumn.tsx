import React, { memo, useMemo, useState } from 'react';
import { ChevronRight, Loader2, MapPinned, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LocationLevel } from '../../../services/locations.api';
import { useLocationsQuery } from '../hooks/useLocations';

interface LocationColumnProps {
  level: LocationLevel;
  countryId?: string;
  parentId?: string;
  selectedId?: string;
  parentSelected: boolean;
  onSelect: (location: { id: string; name: string }) => void;
  onAdd?: () => void;
  onEdit?: (location: { id: string; name: string; isActive: boolean }) => void;
  onDelete?: (location: { id: string; name: string }) => void;
  canManage?: boolean;
}

const LocationColumn: React.FC<LocationColumnProps> = ({
  level,
  countryId,
  parentId,
  selectedId,
  parentSelected,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  canManage,
}) => {
  const [search, setSearch] = useState('');
  const query = useLocationsQuery(
    {
      countryId,
      parentId,
      levelOrder: level.levelOrder,
    },
    Boolean(countryId) && (level.levelOrder === 1 || parentSelected),
  );
  const rows = query.data?.data || [];
  const loading = query.isLoading || query.isFetching;

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    return rows.filter((row) => row.name.toLowerCase().includes(search.trim().toLowerCase()));
  }, [rows, search]);

  const disabled = level.levelOrder > 1 && !parentSelected;
  const emptyLabel = `No ${level.levelName} added`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24 }}
      className="flex min-h-[460px] min-w-[260px] max-w-[280px] flex-1 flex-col rounded-[1.15rem] border border-emerald-100/80 bg-white/95 p-3 shadow-[0_18px_40px_-28px_rgba(16,185,129,0.18)]"
    >
      <div className="px-2 pb-3">
        <h3 className="text-[1.65rem] font-black tracking-tight text-slate-900">{level.levelName}</h3>
        <label className="mt-3 flex items-center gap-2 rounded-[0.95rem] border border-emerald-100 bg-white px-3 py-3 text-sm font-semibold text-slate-600 focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${level.levelName.toLowerCase()}...`}
            disabled={disabled}
            className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-1 pb-3">
        {disabled ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-[1rem] border border-dashed border-emerald-100 bg-emerald-50/40 px-5 text-center">
            <MapPinned className="h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm font-black text-gray-700">Select the previous level first</p>
            <p className="mt-1 text-xs font-semibold text-gray-500">This column unlocks after choosing a parent location.</p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : filteredRows.length ? (
          <div className="space-y-3">
            {filteredRows.map((row) => {
              const isSelected = row.id === selectedId;

              return (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01, x: 2 }}
                  className={`flex w-full items-center justify-between rounded-[0.95rem] border px-4 py-3 transition-all ${
                    isSelected
                      ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-[0_14px_30px_-22px_rgba(16,185,129,0.24)]'
                      : 'border-emerald-100/60 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/45'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect({ id: row.id, name: row.name })}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="text-sm font-black">{row.name}</div>
                  </button>
                  <div className="ml-3 flex items-center gap-2">
                    {canManage ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit?.({ id: row.id, name: row.name, isActive: row.isActive })}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                          aria-label={`Edit ${row.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete?.({ id: row.id, name: row.name })}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Delete ${row.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : null}
                    <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-emerald-500' : 'text-slate-300'}`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
            <button
              type="button"
              onClick={onAdd}
              disabled={!canManage || disabled}
              className="w-full rounded-[0.95rem] bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-600 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add {level.levelName}
            </button>
            
        )}
      </div>

      {!disabled && !loading && filteredRows.length === 0 ? (
        <div className="px-2 pb-3 text-center text-sm font-black text-slate-500">{emptyLabel}</div>
      ) : null}

      {canManage && !disabled && filteredRows.length > 0 ? (
        <div className="px-2 pt-1">
          <button
            type="button"
            onClick={onAdd}
            className="w-full rounded-[0.95rem] bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-600 transition-colors hover:bg-emerald-100"
          >
            + Add {level.levelName}
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="border-t border-gray-100 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-gray-400">
          <div className="inline-flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading
          </div>
        </div>
      ) : null}
    </motion.div>
  );
};

export default memo(LocationColumn);
