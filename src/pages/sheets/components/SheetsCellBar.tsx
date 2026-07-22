import React from 'react';
import { FunctionSquare } from 'lucide-react';

interface SheetsCellBarProps {
  cellAddress: string;
  value: string;
  onChangeValue: (val: string) => void;
  onCommit: () => void;
  disabled?: boolean;
  theme?: 'dark' | 'light';
}

export const SheetsCellBar: React.FC<SheetsCellBarProps> = ({
  cellAddress,
  value,
  onChangeValue,
  onCommit,
  disabled,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onCommit();
    }
  };

  return (
    <div
      className={`flex items-center space-x-2 px-3 py-1 border-b text-xs transition-colors ${
        isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
      }`}
    >
      <div
        className={`flex items-center space-x-1 font-mono font-bold px-2 py-0.5 border rounded min-w-[70px] justify-center select-none ${
          isLight ? 'bg-white border-slate-300 text-emerald-600' : 'bg-slate-900 border-slate-800 text-emerald-400'
        }`}
      >
        <span>{cellAddress || 'A1'}</span>
      </div>

      <div className="flex items-center text-slate-400 font-mono select-none px-1">
        <FunctionSquare className="w-4 h-4 text-emerald-500/80" />
      </div>

      <div className="flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onCommit}
          disabled={disabled}
          placeholder={cellAddress ? 'Type cell value...' : 'Select a cell'}
          className={`w-full border rounded px-2.5 py-1 font-mono text-xs focus:outline-none transition-colors ${
            isLight
              ? 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900 placeholder-slate-400'
              : 'bg-slate-900 border-slate-800 focus:border-emerald-500 text-slate-100 placeholder-slate-600'
          }`}
        />
      </div>
    </div>
  );
};
