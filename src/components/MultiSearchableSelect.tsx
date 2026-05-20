import React, { useEffect, useMemo, useRef, useState, ChangeEvent } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Option } from './SearchableSelect';

interface MultiSearchableSelectProps {
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  name: string;
  maxSelections?: number;
}

const MultiSearchableSelect: React.FC<MultiSearchableSelectProps> = ({
  options,
  values,
  onChange,
  placeholder,
  name,
  maxSelections,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const valueSet = useMemo(() => new Set(values), [values]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        opt.value.toLowerCase().includes(term),
    );
  }, [options, searchTerm]);

  const selectedOptions = useMemo(
    () =>
      values.map((value) => ({
        value,
        label: options.find((opt) => opt.value === value)?.label || value,
      })),
    [options, values],
  );

  const atMax = typeof maxSelections === 'number' && values.length >= maxSelections;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleValue = (value: string) => {
    if (valueSet.has(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }
    if (atMax) return;
    onChange([...values, value]);
  };

  const selectAllVisible = () => {
    const merged = [...values];
    for (const opt of filteredOptions) {
      if (merged.includes(opt.value)) continue;
      if (typeof maxSelections === 'number' && merged.length >= maxSelections) break;
      merged.push(opt.value);
    }
    onChange(merged);
  };

  const clearAll = () => onChange([]);

  const removeValue = (value: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(values.filter((item) => item !== value));
  };

  return (
    <motion.div ref={wrapperRef} className="relative w-full" data-name={name}>
      <div
        className={`min-h-[42px] w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm transition-all ${
          isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200'
        } cursor-pointer`}
        onClick={() => {
          setIsOpen((open) => !open);
          setSearchTerm('');
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <motion.div className="flex min-h-[26px] flex-1 flex-wrap items-center gap-1.5">
            {selectedOptions.length > 0 ? (
              selectedOptions.map(({ value, label }) => (
                <span
                  key={value}
                  className="inline-flex max-w-full items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
                >
                  <span className="truncate">{label}</span>
                  <button
                    type="button"
                    onClick={(event) => removeValue(value, event)}
                    className="rounded-full p-0.5 text-emerald-500 transition hover:bg-emerald-100 hover:text-emerald-800"
                    aria-label={`Remove ${label}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="py-1 text-sm font-medium text-gray-400">{placeholder}</span>
            )}
          </motion.div>
          <ChevronDown
            size={16}
            className={`mt-1 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 flex max-h-[320px] w-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]"
          >
            <div className="sticky top-0 z-10 shrink-0 border-b border-gray-100 bg-gray-50/90 px-3 py-2">
              <div className="flex items-center gap-2">
                <Search size={14} className="text-gray-400" />
                <input
                  type="text"
                  className="w-full border-none bg-transparent text-sm font-medium text-gray-700 outline-none"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAllVisible();
                  }}
                  disabled={filteredOptions.length === 0 || atMax}
                  className="text-xs font-bold text-emerald-600 transition hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                  }}
                  disabled={values.length === 0}
                  className="text-xs font-bold text-gray-500 transition hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  Clear all
                </button>
                <span className="text-[11px] font-semibold text-gray-400">
                  {values.length} selected
                  {typeof maxSelections === 'number' ? ` / ${maxSelections}` : ''}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1" style={{ scrollbarWidth: 'thin' }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const selected = valueSet.has(opt.value);
                  const disabled = !selected && atMax;
                  return (
                    <motion.div
                      key={`${opt.value}:${opt.label}`}
                      className={`my-0.5 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        selected
                          ? 'bg-emerald-50 font-bold text-emerald-700'
                          : disabled
                            ? 'cursor-not-allowed text-gray-300'
                            : 'font-medium text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!disabled) toggleValue(opt.value);
                      }}
                    >
                      <span className="truncate pr-4">{opt.label}</span>
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          selected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selected ? <Check size={12} /> : null}
                      </span>
                    </motion.div>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-sm font-medium text-gray-500">
                  No options found for &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MultiSearchableSelect;
