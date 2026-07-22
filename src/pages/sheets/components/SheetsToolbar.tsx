import React, { useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileSpreadsheet,
  Filter,
  History,
  Italic,
  Lock,
  Moon,
  Palette,
  Plus,
  Redo2,
  RefreshCw,
  Save,
  Search,
  Scissors,
  Sun,
  Trash2,
  Type,
  Underline,
  Undo2,
  Upload,
} from 'lucide-react';
import type { Sheet } from '../../../services/sheets.api';

interface SheetsToolbarProps {
  sheets: Sheet[];
  activeSheetId: string | null;
  onSelectSheet: (id: string) => void;
  onCreateSheet: () => void;
  onRenameSheet: () => void;
  onDeleteSheet: () => void;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  onManualSave: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  activeCellFormat: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    bgColor?: string;
    fontSize?: number;
    align?: 'left' | 'center' | 'right';
  };
  onApplyFormat: (patch: Record<string, unknown>) => void;
  onToggleFindReplace: () => void;
  onToggleFilter: () => void;
  hasFilterActive: boolean;
  onToggleFreezeHeader: () => void;
  isHeaderFrozen: boolean;
  onSyncLeads: () => void;
  isSyncingLeads: boolean;
  onOpenImport: () => void;
  onExport: (format: 'xlsx' | 'csv') => void;
  onOpenVersions: () => void;
  canEdit: boolean;
  canFormat: boolean;
  canExport: boolean;
  canImport: boolean;
  canSync: boolean;
  canDelete: boolean;
}

export const SheetsToolbar: React.FC<SheetsToolbarProps> = ({
  sheets,
  activeSheetId,
  onSelectSheet,
  onCreateSheet,
  onDeleteSheet,
  saveStatus,
  onManualSave,
  theme,
  onToggleTheme,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  activeCellFormat,
  onApplyFormat,
  onToggleFindReplace,
  onToggleFilter,
  hasFilterActive,
  onToggleFreezeHeader,
  isHeaderFrozen,
  onSyncLeads,
  isSyncingLeads,
  onOpenImport,
  onExport,
  onOpenVersions,
  canEdit,
  canFormat,
  canExport,
  canImport,
  canSync,
  canDelete,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'bg' | null>(null);

  const isLight = theme === 'light';

  const presetColors = [
    '#000000', '#475569', '#dc2626', '#ea580c', '#d97706', '#16a34a', '#0284c7', '#4f46e5', '#9333ea', '#db2777',
    '#ffffff', '#f1f5f9', '#fecaca', '#ffedd5', '#fef3c7', '#dcfce7', '#e0f2fe', '#e0e7ff', '#f3e8ff', '#fce7f3',
  ];

  const fontSizes = [9, 10, 11, 12, 14, 16, 18, 20, 24];

  return (
    <div
      className={`border-b shadow-sm transition-colors ${
        isLight
          ? 'bg-slate-50 text-slate-800 border-slate-200'
          : 'bg-slate-900 text-slate-100 border-slate-800'
      }`}
    >
      {/* Top Header & Tab Bar */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 border-b gap-2 ${
          isLight ? 'border-slate-200/80 bg-white' : 'border-slate-800/80 bg-slate-900'
        }`}
      >
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
          <div
            className={`flex items-center space-x-2 mr-2 pr-3 border-r ${
              isLight ? 'border-slate-200' : 'border-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-sm tracking-tight">Seeakk Sheets</span>
          </div>

          <div className="flex items-center space-x-1">
            {sheets.map((sheet) => {
              const isActive = sheet.id === activeSheetId;
              return (
                <button
                  key={sheet.id}
                  onClick={() => onSelectSheet(sheet.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-t-md transition-all flex items-center space-x-1.5 border-t-2 ${
                    isActive
                      ? isLight
                        ? 'bg-slate-100 text-emerald-600 border-emerald-600 shadow-sm font-bold'
                        : 'bg-slate-800 text-emerald-400 border-emerald-500 shadow-sm font-bold'
                      : isLight
                        ? 'text-slate-600 hover:bg-slate-100/70 border-transparent'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
                  }`}
                >
                  <span className="truncate max-w-[130px]">{sheet.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-950/60 text-slate-400'
                    }`}
                  >
                    {sheet.rowCount ?? 0}
                  </span>
                </button>
              );
            })}

            <button
              onClick={onCreateSheet}
              className={`p-1.5 rounded-md transition-colors ${
                isLight ? 'text-slate-500 hover:bg-slate-200 hover:text-slate-800' : 'text-slate-400 hover:bg-slate-800 hover:text-emerald-400'
              }`}
              title="Create New Sheet"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Section: Save Status & Theme Switcher */}
        <div className="flex items-center space-x-3 shrink-0">
          <div
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800/60 border-slate-700/50 text-slate-400'
            }`}
          >
            {saveStatus === 'saving' && (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-500" />
                <span className="text-emerald-500 font-medium">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Saved</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-600 font-medium">Unsaved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-rose-500">Save failed</span>
              </>
            )}
          </div>

          <button
            onClick={onManualSave}
            disabled={!canEdit || saveStatus === 'saving'}
            className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow transition-colors"
            title="Save Sheet (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border transition-colors flex items-center space-x-1 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-600'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-indigo-300'
            }`}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Theme`}
          >
            {isLight ? <Sun className="w-4 h-4 fill-amber-400" /> : <Moon className="w-4 h-4 fill-indigo-300" />}
            <span className="text-xs font-bold capitalize">{theme}</span>
          </button>
        </div>
      </div>

      {/* Main Formatting Toolbar with Clean Flex Wrapping & Tool Groups */}
      <div className="flex flex-wrap items-center px-3 py-1.5 gap-2 text-xs">
        {/* Undo / Redo Group */}
        <div className={`flex items-center space-x-0.5 p-0.5 rounded border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-800/80 border-slate-700/60'}`}>
          <button
            onClick={onUndo}
            disabled={!canUndo || !canEdit}
            className={`p-1.5 rounded transition-colors ${isLight ? 'hover:bg-slate-100 disabled:opacity-30' : 'hover:bg-slate-700 disabled:opacity-40'}`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo || !canEdit}
            className={`p-1.5 rounded transition-colors ${isLight ? 'hover:bg-slate-100 disabled:opacity-30' : 'hover:bg-slate-700 disabled:opacity-40'}`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clipboard Group */}
        <div className={`flex items-center space-x-0.5 p-0.5 rounded border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-800/80 border-slate-700/60'}`}>
          <button
            onClick={onCut}
            disabled={!canEdit}
            className={`p-1.5 rounded transition-colors ${isLight ? 'hover:bg-slate-100 disabled:opacity-30' : 'hover:bg-slate-700 disabled:opacity-40'}`}
            title="Cut (Ctrl+X)"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCopy}
            className={`p-1.5 rounded transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}
            title="Copy (Ctrl+C)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onPaste}
            disabled={!canEdit}
            className={`p-1.5 rounded transition-colors ${isLight ? 'hover:bg-slate-100 disabled:opacity-30' : 'hover:bg-slate-700 disabled:opacity-40'}`}
            title="Paste (Ctrl+V)"
          >
            <ClipboardIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={`h-4 w-px my-auto ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`} />

        {/* Font Formatting Group */}
        <div className={`flex items-center space-x-0.5 p-0.5 rounded border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-800/80 border-slate-700/60'}`}>
          <select
            value={activeCellFormat.fontSize || 10}
            onChange={(e) => onApplyFormat({ fontSize: Number(e.target.value) })}
            disabled={!canFormat}
            className={`px-1.5 py-1 text-xs rounded border outline-none font-mono ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}
            title="Font Size"
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>

          <button
            onClick={() => onApplyFormat({ bold: !activeCellFormat.bold })}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors ${
              activeCellFormat.bold
                ? 'bg-emerald-600 text-white font-bold'
                : isLight
                  ? 'hover:bg-slate-100 text-slate-700'
                  : 'hover:bg-slate-700 text-slate-300'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApplyFormat({ italic: !activeCellFormat.italic })}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors ${
              activeCellFormat.italic
                ? 'bg-emerald-600 text-white italic'
                : isLight
                  ? 'hover:bg-slate-100 text-slate-700'
                  : 'hover:bg-slate-700 text-slate-300'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApplyFormat({ underline: !activeCellFormat.underline })}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors ${
              activeCellFormat.underline
                ? 'bg-emerald-600 text-white underline'
                : isLight
                  ? 'hover:bg-slate-100 text-slate-700'
                  : 'hover:bg-slate-700 text-slate-300'
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alignment Controls Group */}
        <div className={`flex items-center space-x-0.5 p-0.5 rounded border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-800/80 border-slate-700/60'}`}>
          <button
            onClick={() => onApplyFormat({ align: 'left' })}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors ${
              activeCellFormat.align === 'left' ? 'bg-emerald-600 text-white' : isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-700'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApplyFormat({ align: 'center' })}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors ${
              activeCellFormat.align === 'center' ? 'bg-emerald-600 text-white' : isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-700'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApplyFormat({ align: 'right' })}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors ${
              activeCellFormat.align === 'right' ? 'bg-emerald-600 text-white' : isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-700'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text & Fill Color Pickers Group */}
        <div className={`relative flex items-center space-x-0.5 p-0.5 rounded border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-800/80 border-slate-700/60'}`}>
          <button
            onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors flex items-center space-x-1 ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}
            title="Text Color"
          >
            <Type className="w-3.5 h-3.5" style={{ color: activeCellFormat.color || (isLight ? '#0f172a' : '#e2e8f0') }} />
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          <button
            onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors flex items-center space-x-1 ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}
            title="Cell Fill Background"
          >
            <Palette className="w-3.5 h-3.5" style={{ color: activeCellFormat.bgColor || '#10b981' }} />
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {showColorPicker && (
            <div
              className={`absolute top-full left-0 mt-1 z-50 p-2.5 rounded-lg shadow-2xl border w-52 ${
                isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-400 mb-1.5">
                {showColorPicker === 'text' ? 'Text Color' : 'Cell Fill Color'}
              </div>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      if (showColorPicker === 'text') onApplyFormat({ color });
                      else onApplyFormat({ bgColor: color });
                      setShowColorPicker(null);
                    }}
                    className="w-6 h-6 rounded border border-slate-300 dark:border-slate-700 hover:scale-110 transition-transform shadow-xs"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Custom Color</span>
                <input
                  type="color"
                  value={
                    showColorPicker === 'text'
                      ? activeCellFormat.color || '#0f172a'
                      : activeCellFormat.bgColor || '#ffffff'
                  }
                  onChange={(e) => {
                    if (showColorPicker === 'text') onApplyFormat({ color: e.target.value });
                    else onApplyFormat({ bgColor: e.target.value });
                  }}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <div className={`h-4 w-px my-auto ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`} />

        {/* Spreadsheet Tools Group */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleFindReplace}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded border transition-colors ${
              isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="Find & Replace (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Find & Replace</span>
          </button>

          <button
            onClick={onToggleFilter}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded border transition-colors ${
              hasFilterActive
                ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500 font-semibold'
                : isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="Filter Data"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>

          <button
            onClick={onToggleFreezeHeader}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded border transition-colors ${
              isHeaderFrozen
                ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500 font-semibold'
                : isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="Freeze Header Row"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Freeze Header</span>
          </button>
        </div>

        <div className={`h-4 w-px my-auto ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`} />

        {/* CRM Actions & Import / Export Group */}
        <div className="flex items-center space-x-1.5 ml-auto">
          {canSync && (
            <button
              onClick={onSyncLeads}
              disabled={isSyncingLeads}
              className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium shadow-sm transition-colors disabled:opacity-50"
              title="Sync Lead Changes with CRM"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLeads ? 'animate-spin' : ''}`} />
              <span>Sync to CRM</span>
            </button>
          )}

          {canImport && (
            <button
              onClick={onOpenImport}
              className={`flex items-center space-x-1 px-2 py-1 rounded border transition-colors ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="Import CSV or Excel file"
            >
              <Upload className="w-3.5 h-3.5 text-sky-500" />
              <span>Import</span>
            </button>
          )}

          {canExport && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded border transition-colors ${
                  isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
                title="Export Sheet"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Export</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>

              {showExportMenu && (
                <div
                  className={`absolute right-0 top-full mt-1 z-50 rounded-md shadow-xl py-1 w-36 text-xs border ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
                  }`}
                >
                  <button
                    onClick={() => {
                      onExport('xlsx');
                      setShowExportMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                    }`}
                  >
                    <span>Excel (.xlsx)</span>
                    <span className="text-[10px] text-emerald-500 font-mono font-bold">Styles</span>
                  </button>
                  <button
                    onClick={() => {
                      onExport('csv');
                      setShowExportMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}
                  >
                    CSV (.csv)
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onOpenVersions}
            className={`p-1.5 rounded border transition-colors ${
              isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
            }`}
            title="Version History"
          >
            <History className="w-4 h-4" />
          </button>

          {canDelete && (
            <button
              onClick={onDeleteSheet}
              className="p-1.5 hover:bg-rose-600/20 text-rose-500 rounded border border-rose-500/30 transition-colors"
              title="Delete Sheet"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
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
