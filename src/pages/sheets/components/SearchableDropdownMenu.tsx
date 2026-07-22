import React, { useEffect, useRef, useState } from 'react';
import { Check, Search, X } from 'lucide-react';

export interface DropdownOption {
  id: string;
  label: string;
  color?: string;
  badgeText?: string;
}

interface SearchableDropdownMenuProps {
  options: DropdownOption[];
  selectedValue?: string;
  onSelect: (option: DropdownOption) => void;
  onClose: () => void;
  title?: string;
  isLight?: boolean;
}

export const SearchableDropdownMenu: React.FC<SearchableDropdownMenuProps> = ({
  options,
  selectedValue,
  onSelect,
  onClose,
  title = 'Select Option',
  isLight = false,
}) => {
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[focusedIndex]) {
        onSelect(filteredOptions[focusedIndex]);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`absolute left-0 top-full mt-1 z-50 rounded-xl shadow-2xl border p-2 w-56 text-xs animate-in fade-in duration-150 ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
      }`}
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <button onClick={onClose} className="p-0.5 text-slate-400 hover:text-slate-200">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative my-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setFocusedIndex(0);
          }}
          placeholder="Search options..."
          className={`w-full pl-8 pr-2 py-1.5 rounded-lg border text-xs outline-none transition-colors ${
            isLight
              ? 'bg-slate-50 border-slate-300 focus:border-emerald-500 text-slate-900 placeholder-slate-400'
              : 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-slate-100 placeholder-slate-500'
          }`}
        />
      </div>

      <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
        {filteredOptions.length === 0 ? (
          <div className="py-3 text-center text-slate-400 text-[11px]">No options found</div>
        ) : (
          filteredOptions.map((option, idx) => {
            const isSelected = selectedValue?.toLowerCase() === option.label.toLowerCase() || selectedValue === option.id;
            const isFocused = idx === focusedIndex;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelect(option)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors ${
                  isFocused
                    ? isLight ? 'bg-slate-100 text-emerald-600' : 'bg-slate-800 text-emerald-400'
                    : isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800/60 text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  {option.color && (
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: option.color }} />
                  )}
                  <span className="truncate">{option.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
