import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Replace, ReplaceAll, Search, X } from 'lucide-react';

interface FindReplaceModalProps {
  isOpen: boolean;
  initialMode?: 'find' | 'replace';
  onClose: () => void;
  onSearchChange: (params: { query: string; matchCase: boolean; wholeCell: boolean; scope: 'sheet' | 'column' | 'selection' }) => void;
  onFindNext: () => void;
  onFindPrev: () => void;
  onReplace: (replacement: string) => void;
  onReplaceAll: (replacement: string) => void;
  matchCount?: number;
  currentMatchIndex?: number;
  isLight?: boolean;
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({
  isOpen,
  initialMode = 'find',
  onClose,
  onSearchChange,
  onFindNext,
  onFindPrev,
  onReplace,
  onReplaceAll,
  matchCount = 0,
  currentMatchIndex = 0,
  isLight = false,
}) => {
  const [activeTab, setActiveTab] = useState<'find' | 'replace'>(initialMode);
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeCell, setWholeCell] = useState(false);
  const [scope, setScope] = useState<'sheet' | 'column' | 'selection'>('sheet');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    onSearchChange({ query, matchCase, wholeCell, scope });
  }, [query, matchCase, wholeCell, scope, onSearchChange]);

  if (!isOpen) return null;

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onFindPrev();
      } else {
        onFindNext();
      }
    }
  };

  const handleReplaceAllClick = () => {
    if (!query || matchCount === 0) return;
    if (window.confirm(`Are you sure you want to replace all ${matchCount} occurrence(s)?`)) {
      onReplaceAll(replacement);
    }
  };

  return (
    <div
      className={`fixed top-24 right-8 z-50 rounded-2xl shadow-2xl border p-4 w-96 text-xs animate-in fade-in slide-in-from-top-4 duration-200 transition-colors ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
      }`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('find')}
            className={`px-3 py-1 font-bold rounded-lg transition-colors ${
              activeTab === 'find'
                ? 'bg-emerald-500/20 text-emerald-500'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Find
          </button>
          <button
            onClick={() => setActiveTab('replace')}
            className={`px-3 py-1 font-bold rounded-lg transition-colors ${
              activeTab === 'replace'
                ? 'bg-emerald-500/20 text-emerald-500'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Replace
          </button>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded-md">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Find</label>
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search in sheet..."
              className={`w-full rounded-lg px-3 py-1.5 font-mono text-xs border focus:outline-none transition-colors ${
                isLight
                  ? 'bg-slate-50 border-slate-300 focus:border-emerald-500 text-slate-900 placeholder-slate-400'
                  : 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-slate-100 placeholder-slate-600'
              }`}
            />
            {query && (
              <span className="absolute right-2 text-[10px] text-slate-400 font-mono">
                {matchCount > 0 ? `${currentMatchIndex + 1} of ${matchCount}` : 'No matches'}
              </span>
            )}
          </div>
        </div>

        {activeTab === 'replace' && (
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Replace with</label>
            <input
              type="text"
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="New value..."
              className={`w-full rounded-lg px-3 py-1.5 font-mono text-xs border focus:outline-none transition-colors ${
                isLight
                  ? 'bg-slate-50 border-slate-300 focus:border-emerald-500 text-slate-900 placeholder-slate-400'
                  : 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-slate-100 placeholder-slate-600'
              }`}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-400 text-[11px]">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Match case</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer text-slate-400 text-[11px]">
            <input
              type="checkbox"
              checked={wholeCell}
              onChange={(e) => setWholeCell(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Whole cell</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold text-slate-400">Search in:</span>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as any)}
            className={`px-2 py-1 rounded text-xs border outline-none font-medium ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
          >
            <option value="sheet">Entire Sheet</option>
            <option value="column">Current Column</option>
            <option value="selection">Current Selection</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-1">
            <button
              onClick={onFindPrev}
              disabled={!query || matchCount === 0}
              className={`p-1.5 rounded border transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 disabled:opacity-40'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 disabled:opacity-40'
              }`}
              title="Previous Match (Shift+Enter)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={onFindNext}
              disabled={!query || matchCount === 0}
              className={`p-1.5 rounded border transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 disabled:opacity-40'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 disabled:opacity-40'
              }`}
              title="Next Match (Enter)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-1.5">
            {activeTab === 'replace' ? (
              <>
                <button
                  onClick={() => onReplace(replacement)}
                  disabled={!query || matchCount === 0}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700 font-medium transition-colors flex items-center space-x-1"
                >
                  <Replace className="w-3.5 h-3.5 text-amber-400" />
                  <span>Replace</span>
                </button>
                <button
                  onClick={handleReplaceAllClick}
                  disabled={!query || matchCount === 0}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg font-medium shadow transition-colors flex items-center space-x-1"
                >
                  <ReplaceAll className="w-3.5 h-3.5" />
                  <span>Replace All</span>
                </button>
              </>
            ) : (
              <button
                onClick={onFindNext}
                disabled={!query || matchCount === 0}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg font-medium shadow transition-colors flex items-center space-x-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Next</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
