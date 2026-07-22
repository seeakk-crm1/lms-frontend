import React, { useEffect, useRef } from 'react';
import {
  Copy,
  Eraser,
  EyeOff,
  Lock,
  Plus,
  Scissors,
  Trash2,
} from 'lucide-react';

interface SheetsContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onInsertRowAbove: () => void;
  onInsertRowBelow: () => void;
  onDeleteRow: () => void;
  onClearContents: () => void;
  onHideColumn: () => void;
  onToggleFreezeHeader: () => void;
  isHeaderFrozen: boolean;
  canEdit: boolean;
}

export const SheetsContextMenu: React.FC<SheetsContextMenuProps> = ({
  x,
  y,
  onClose,
  onCut,
  onCopy,
  onPaste,
  onInsertRowAbove,
  onInsertRowBelow,
  onDeleteRow,
  onClearContents,
  onHideColumn,
  onToggleFreezeHeader,
  isHeaderFrozen,
  canEdit,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x }}
      className="fixed z-50 bg-slate-900 border border-slate-700/80 rounded-lg shadow-2xl py-1.5 w-52 text-xs text-slate-200"
    >
      <button
        onClick={() => {
          onCopy();
          onClose();
        }}
        className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Copy className="w-3.5 h-3.5 text-slate-400" />
          <span>Copy</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Ctrl+C</span>
      </button>

      <button
        onClick={() => {
          onCut();
          onClose();
        }}
        disabled={!canEdit}
        className="w-full text-left px-3 py-1.5 hover:bg-slate-800 disabled:opacity-40 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Scissors className="w-3.5 h-3.5 text-slate-400" />
          <span>Cut</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Ctrl+X</span>
      </button>

      <button
        onClick={() => {
          onPaste();
          onClose();
        }}
        disabled={!canEdit}
        className="w-full text-left px-3 py-1.5 hover:bg-slate-800 disabled:opacity-40 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center space-x-2">
          <ClipboardIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>Paste</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Ctrl+V</span>
      </button>

      <div className="my-1 border-t border-slate-800" />

      <button
        onClick={() => {
          onInsertRowAbove();
          onClose();
        }}
        disabled={!canEdit}
        className="w-full text-left px-3 py-1.5 hover:bg-slate-800 disabled:opacity-40 flex items-center space-x-2 transition-colors"
      >
        <Plus className="w-3.5 h-3.5 text-emerald-400" />
        <span>Insert Row Above</span>
      </button>

      <button
        onClick={() => {
          onInsertRowBelow();
          onClose();
        }}
        disabled={!canEdit}
        className="w-full text-left px-3 py-1.5 hover:bg-slate-800 disabled:opacity-40 flex items-center space-x-2 transition-colors"
      >
        <Plus className="w-3.5 h-3.5 text-emerald-400" />
        <span>Insert Row Below</span>
      </button>

      <button
        onClick={() => {
          onDeleteRow();
          onClose();
        }}
        disabled={!canEdit}
        className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-rose-400 disabled:opacity-40 flex items-center space-x-2 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
        <span>Delete Row</span>
      </button>

      <div className="my-1 border-t border-slate-800" />

      <button
        onClick={() => {
          onClearContents();
          onClose();
        }}
        disabled={!canEdit}
        className="w-full text-left px-3 py-1.5 hover:bg-slate-800 disabled:opacity-40 flex items-center space-x-2 transition-colors"
      >
        <Eraser className="w-3.5 h-3.5 text-amber-400" />
        <span>Clear Cell Contents</span>
      </button>

      <button
        onClick={() => {
          onHideColumn();
          onClose();
        }}
        className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center space-x-2 transition-colors"
      >
        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
        <span>Hide Column</span>
      </button>

      <button
        onClick={() => {
          onToggleFreezeHeader();
          onClose();
        }}
        className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center space-x-2 transition-colors"
      >
        <Lock className="w-3.5 h-3.5 text-sky-400" />
        <span>{isHeaderFrozen ? 'Unfreeze Header' : 'Freeze Header'}</span>
      </button>
    </div>
  );
};

const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);
