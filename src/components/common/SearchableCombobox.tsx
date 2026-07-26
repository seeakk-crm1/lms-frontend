import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, User, X } from 'lucide-react';
import { getImageUrl } from '../../utils/getImageUrl';

export interface ComboboxItem {
  id: string;
  name: string;
  subtext?: string;
  code?: string;
  avatarUrl?: string | null;
  searchString?: string;
}

export interface SearchableComboboxProps {
  items: ComboboxItem[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  icon?: React.ReactNode;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  items,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((item) => item.id === value);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = item.name.toLowerCase().includes(q);
    const subtextMatch = item.subtext ? item.subtext.toLowerCase().includes(q) : false;
    const codeMatch = item.code ? item.code.toLowerCase().includes(q) : false;
    const customMatch = item.searchString ? item.searchString.toLowerCase().includes(q) : false;
    return nameMatch || subtextMatch || codeMatch || customMatch;
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-gray-50 border ${
          isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white' : 'border-gray-200'
        } rounded-xl text-left flex items-center justify-between gap-2 transition-all hover:bg-white`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {selectedItem?.avatarUrl ? (
            <img
              src={getImageUrl(selectedItem.avatarUrl)}
              alt={selectedItem.name}
              className="w-6 h-6 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="text-gray-400 shrink-0">{icon || <User className="w-4 h-4" />}</div>
          )}
          <span className={`text-xs sm:text-sm font-semibold truncate ${selectedItem ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
            {selectedItem ? (
              <span className="flex items-center gap-2">
                <span>{selectedItem.name}</span>
                {selectedItem.subtext && <span className="text-gray-400 font-normal text-xs">({selectedItem.subtext})</span>}
              </span>
            ) : (
              placeholder
            )}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {selectedItem && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden max-h-64 flex flex-col">
          <div className="p-2 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400 font-medium">{emptyText}</div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = item.id === value;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.id);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full px-3 py-2 text-left rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-gray-50 text-gray-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {item.avatarUrl ? (
                        <img
                          src={getImageUrl(item.avatarUrl)}
                          alt={item.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[10px] font-bold shrink-0">
                          {item.name.charAt(0)}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="truncate text-xs font-bold text-gray-900">{item.name}</p>
                        {item.subtext && <p className="truncate text-[10px] text-gray-400 font-normal">{item.subtext}</p>}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
