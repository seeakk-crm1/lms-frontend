import React from 'react';
import { FunctionSquare } from 'lucide-react';

interface SheetsCellBarProps {
  cellAddress: string;
  value: string;
  onChangeValue: (val: string) => void;
  onCommit: () => void;
  disabled?: boolean;
}

export const SheetsCellBar: React.FC<SheetsCellBarProps> = ({
  cellAddress,
  value,
  onChangeValue,
  onCommit,
  disabled,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onCommit();
    }
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-slate-950 border-b border-slate-800 text-xs text-slate-200">
      <div className="flex items-center space-x-1 font-mono font-semibold px-2 py-1 bg-slate-900 border border-slate-800 rounded min-w-[70px] justify-center text-emerald-400 select-none">
        <span>{cellAddress || 'A1'}</span>
      </div>

      <div className="flex items-center text-slate-500 font-mono select-none px-1">
        <FunctionSquare className="w-4 h-4 text-emerald-500/70" />
      </div>

      <div className="flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onCommit}
          disabled={disabled}
          placeholder={cellAddress ? 'Type a value or text...' : 'Select a cell'}
          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/80 rounded px-2.5 py-1 text-slate-100 placeholder-slate-600 focus:outline-none font-mono text-xs transition-colors"
        />
      </div>
    </div>
  );
};
