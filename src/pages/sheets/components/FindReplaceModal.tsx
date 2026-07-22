import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Replace, ReplaceAll, Search, X } from 'lucide-react';

interface FindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFindNext: (query: string, matchCase: boolean) => void;
  onFindPrev: (query: string, matchCase: boolean) => void;
  onReplace: (query: string, replacement: string, matchCase: boolean) => void;
  onReplaceAll: (query: string, replacement: string, matchCase: boolean) => void;
  matchCount?: number;
  currentMatchIndex?: number;
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({
  isOpen,
  onClose,
  onFindNext,
  onFindPrev,
  onReplace,
  onReplaceAll,
  matchCount = 0,
  currentMatchIndex = 0,
}) => {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [matchCase, setMatchCase] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed top-24 right-8 z-50 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl p-4 w-96 text-slate-100 text-xs animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2 font-semibold text-sm">
          <Search className="w-4 h-4 text-emerald-400" />
          <span>Find & Replace</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Find</label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value) onFindNext(e.target.value, matchCase);
              }}
              placeholder="Search in sheet..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
            />
            {query && (
              <span className="absolute right-2 text-[10px] text-slate-500 font-mono">
                {matchCount > 0 ? `${currentMatchIndex + 1} / ${matchCount}` : 'No matches'}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Replace with</label>
          <input
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="New value..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="matchCase"
            checked={matchCase}
            onChange={(e) => setMatchCase(e.target.checked)}
            className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-950"
          />
          <label htmlFor="matchCase" className="text-slate-300 select-none cursor-pointer">
            Match case
          </label>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => query && onFindPrev(query, matchCase)}
              disabled={!query}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded border border-slate-700 transition-colors"
              title="Find Previous"
            >
              <ChevronUp className="w-4 h-4 text-slate-300" />
            </button>
            <button
              onClick={() => query && onFindNext(query, matchCase)}
              disabled={!query}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded border border-slate-700 transition-colors"
              title="Find Next"
            >
              <ChevronDown className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => query && onReplace(query, replacement, matchCase)}
              disabled={!query || matchCount === 0}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700 font-medium transition-colors flex items-center space-x-1"
            >
              <Replace className="w-3.5 h-3.5 text-amber-400" />
              <span>Replace</span>
            </button>

            <button
              onClick={() => query && onReplaceAll(query, replacement, matchCase)}
              disabled={!query || matchCount === 0}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg font-medium shadow transition-colors flex items-center space-x-1"
            >
              <ReplaceAll className="w-3.5 h-3.5" />
              <span>Replace All</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
