import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, SlidersHorizontal, RotateCcw, Check, Sparkles, Lock } from 'lucide-react';
import { ColumnDefinition, DEFAULT_VISIBLE_COLUMN_KEYS } from '../../../types/leadColumns.types';

interface LeadTableColumnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allColumns: ColumnDefinition[];
  selectedKeys: Set<string>;
  onSave: (keys: string[]) => void;
  onReset: () => void;
}

export const LeadTableColumnsModal: React.FC<LeadTableColumnsModalProps> = ({
  isOpen,
  onClose,
  allColumns,
  selectedKeys,
  onSave,
  onReset,
}) => {
  const [draftKeys, setDraftKeys] = useState<Set<string>>(new Set(selectedKeys));
  const [searchTerm, setSearchTerm] = useState('');

  // Re-sync draft state when modal opens or selectedKeys change
  useEffect(() => {
    if (isOpen) {
      setDraftKeys(new Set(selectedKeys));
      setSearchTerm('');
    }
  }, [isOpen, selectedKeys]);

  const filteredColumns = useMemo(() => {
    if (!searchTerm.trim()) return allColumns;
    const q = searchTerm.toLowerCase();
    return allColumns.filter((col) => col.label.toLowerCase().includes(q));
  }, [allColumns, searchTerm]);

  const standardCols = useMemo(
    () => filteredColumns.filter((col) => col.category === 'STANDARD'),
    [filteredColumns],
  );

  const customCols = useMemo(
    () => filteredColumns.filter((col) => col.category === 'CUSTOM'),
    [filteredColumns],
  );

  const handleToggle = (key: string, isRequired?: boolean) => {
    if (isRequired) return; // Cannot toggle required column
    setDraftKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleApply = () => {
    onSave(Array.from(draftKeys));
    onClose();
  };

  const handleResetClick = () => {
    onReset();
    setDraftKeys(new Set(DEFAULT_VISIBLE_COLUMN_KEYS));
  };

  if (!isOpen) return null;

  const modalNode = (
    <AnimatePresence>
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (e.target === e.currentTarget) onClose();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed inset-0 z-[10500] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500 p-2.5 text-white shadow-md shadow-emerald-500/20">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Lead Table Columns</h3>
                <p className="text-xs font-semibold text-gray-500">
                  Choose which fields appear in the All Leads table.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Controls Bar */}
          <div className="p-6 pb-0 space-y-3">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>

            {/* Tip Banner */}
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-3.5 py-2 text-[11px] font-semibold text-emerald-800">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Tip: Hide unused columns for better table readability.</span>
            </div>
          </div>

          {/* Scrollable Columns Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* STANDARD FIELDS */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                  Standard Fields ({standardCols.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {standardCols.map((col) => {
                  const isChecked = col.isRequired || draftKeys.has(col.key);
                  return (
                    <label
                      key={col.key}
                      className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'border-emerald-200 bg-emerald-50/30 text-gray-900 shadow-sm'
                          : 'border-gray-200/80 bg-white text-gray-600 hover:border-gray-300'
                      } ${col.isRequired ? 'opacity-90 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={col.isRequired}
                          onChange={() => handleToggle(col.key, col.isRequired)}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="text-xs font-bold truncate">{col.label}</span>
                      </div>

                      {col.isRequired ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-extrabold text-gray-500 shrink-0">
                          <Lock className="h-2.5 w-2.5" /> Required
                        </span>
                      ) : (
                        col.isSortable && (
                          <span className="text-[10px] font-semibold text-gray-400 shrink-0">Sortable</span>
                        )
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* CUSTOM FIELDS */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                  Custom Fields ({customCols.length})
                </h4>
              </div>

              {customCols.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-5 text-center">
                  <p className="text-xs font-bold text-gray-500">
                    {searchTerm ? 'No custom fields match your search' : 'No custom lead fields configured'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {customCols.map((col) => {
                    const isChecked = draftKeys.has(col.key);
                    return (
                      <label
                        key={col.key}
                        className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'border-emerald-200 bg-emerald-50/30 text-gray-900 shadow-sm'
                            : 'border-gray-200/80 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggle(col.key)}
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold truncate">{col.label}</span>
                        </div>
                        {col.inputType && (
                          <span className="inline-flex rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-100 shrink-0">
                            {col.inputType}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/50">
            <button
              type="button"
              onClick={handleResetClick}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
            >
              <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
              Reset to Default
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Check className="h-4 w-4" />
                Apply Columns
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

export default LeadTableColumnsModal;
