import React from 'react';
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
  Palette,
  Plus,
  Redo2,
  RefreshCw,
  Save,
  Search,
  Scissors,
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
  onRenameSheet,
  onDeleteSheet,
  saveStatus,
  onManualSave,
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
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState<'text' | 'bg' | null>(null);

  const presetColors = [
    '#000000', '#475569', '#dc2626', '#ea580c', '#d97706', '#16a34a', '#0284c7', '#4f46e5', '#9333ea',
    '#ffffff', '#f1f5f9', '#fecaca', '#ffedd5', '#fef3c7', '#dcfce7', '#e0f2fe', '#e0e7ff', '#f3e8ff',
  ];

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 shadow-md">
      {/* Top Tab Bar & Sheet Selector */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/80 overflow-x-auto gap-2">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center space-x-1.5 mr-2 pr-3 border-r border-slate-700">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm tracking-tight text-white">Seeakk Sheets</span>
          </div>

          {sheets.map((sheet) => {
            const isActive = sheet.id === activeSheetId;
            return (
              <button
                key={sheet.id}
                onClick={() => onSelectSheet(sheet.id)}
                className={`px-3 py-1 text-xs font-medium rounded-t-md transition-all flex items-center space-x-1.5 border-t-2 ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border-emerald-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
                }`}
              >
                <span className="truncate max-w-[130px]">{sheet.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/40 text-slate-400">
                  {sheet.rowCount ?? 0}
                </span>
              </button>
            );
          })}

          <button
            onClick={onCreateSheet}
            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors"
            title="Create New Sheet"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Save & Status Actions */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50">
            {saveStatus === 'saving' && (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                <span className="text-emerald-400 font-medium">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-300">All changes saved</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300">Unsaved changes</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-rose-400">Save failed</span>
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
        </div>
      </div>

      {/* Main Formatting & Excel Operations Toolbar */}
      <div className="flex items-center px-3 py-1.5 gap-2 overflow-x-auto scrollbar-none text-slate-300 text-xs">
        {/* Undo / Redo */}
        <div className="flex items-center space-x-0.5 bg-slate-800/80 p-0.5 rounded border border-slate-700/60">
          <button
            onClick={onUndo}
            disabled={!canUndo || !canEdit}
            className="p-1.5 hover:bg-slate-700 disabled:opacity-40 rounded transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo || !canEdit}
            className="p-1.5 hover:bg-slate-700 disabled:opacity-40 rounded transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cut / Copy / Paste */}
        <div className="flex items-center space-x-0.5 bg-slate-800/80 p-0.5 rounded border border-slate-700/60">
          <button
            onClick={onCut}
            disabled={!canEdit}
            className="p-1.5 hover:bg-slate-700 disabled:opacity-40 rounded transition-colors"
            title="Cut (Ctrl+X)"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCopy}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title="Copy (Ctrl+C)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onPaste}
            disabled={!canEdit}
            className="p-1.5 hover:bg-slate-700 disabled:opacity-40 rounded transition-colors"
            title="Paste (Ctrl+V)"
          >
            <ClipboardIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-700 my-auto" />

        {/* Text Formatting Controls */}
        <div className="flex items-center space-x-0.5 bg-slate-800/80 p-0.5 rounded border border-slate-700/60">
          <button
            onClick={() => onApplyFormat({ bold: !activeCellFormat.bold })}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors ${
              activeCellFormat.bold ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-700'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApplyFormat({ italic: !activeCellFormat.italic })}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors ${
              activeCellFormat.italic ? 'bg-emerald-600 text-white italic' : 'hover:bg-slate-700'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApplyFormat({ underline: !activeCellFormat.underline })}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors ${
              activeCellFormat.underline ? 'bg-emerald-600 text-white underline' : 'hover:bg-slate-700'
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alignment Controls */}
        <div className="flex items-center space-x-0.5 bg-slate-800/80 p-0.5 rounded border border-slate-700/60">
          <button
            onClick={() => onApplyFormat({ align: 'left' })}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors ${
              activeCellFormat.align === 'left' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-700'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApplyFormat({ align: 'center' })}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors ${
              activeCellFormat.align === 'center' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-700'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApplyFormat({ align: 'right' })}
            disabled={!canFormat}
            className={`p-1.5 rounded transition-colors ${
              activeCellFormat.align === 'right' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-700'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Color Pickers */}
        <div className="relative flex items-center space-x-0.5 bg-slate-800/80 p-0.5 rounded border border-slate-700/60">
          <button
            onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
            disabled={!canFormat}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors flex items-center space-x-1"
            title="Text Color"
          >
            <Type className="w-3.5 h-3.5" style={{ color: activeCellFormat.color || '#e2e8f0' }} />
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          <button
            onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}
            disabled={!canFormat}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors flex items-center space-x-1"
            title="Cell Fill Background"
          >
            <Palette className="w-3.5 h-3.5" style={{ color: activeCellFormat.bgColor || '#10b981' }} />
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl grid grid-cols-6 gap-1 w-44">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    if (showColorPicker === 'text') onApplyFormat({ color });
                    else onApplyFormat({ bgColor: color });
                    setShowColorPicker(null);
                  }}
                  className="w-5 h-5 rounded border border-slate-700 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-700 my-auto" />

        {/* Spreadsheet Tools: Find, Filter, Freeze */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleFindReplace}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
            title="Find & Replace (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Find & Replace</span>
          </button>

          <button
            onClick={onToggleFilter}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded border transition-colors ${
              hasFilterActive
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
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
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
            }`}
            title="Freeze Header Row"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Freeze Header</span>
          </button>
        </div>

        <div className="h-4 w-px bg-slate-700 my-auto" />

        {/* Sync Leads Button */}
        {canSync && (
          <button
            onClick={onSyncLeads}
            disabled={isSyncingLeads}
            className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium shadow-sm transition-colors disabled:opacity-50"
            title="Sync Lead Changes with CRM"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLeads ? 'animate-spin' : ''}`} />
            <span>Sync to CRM</span>
          </button>
        )}

        {/* Import & Export */}
        <div className="flex items-center space-x-1 ml-auto">
          {canImport && (
            <button
              onClick={onOpenImport}
              className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors text-slate-300"
              title="Import CSV or Excel file"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Import</span>
            </button>
          )}

          {canExport && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors text-slate-300"
                title="Export Sheet"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-slate-900 border border-slate-700 rounded-md shadow-xl py-1 w-36 text-xs">
                  <button
                    onClick={() => {
                      onExport('xlsx');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>Excel (.xlsx)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Colors</span>
                  </button>
                  <button
                    onClick={() => {
                      onExport('csv');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                  >
                    CSV (.csv)
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onOpenVersions}
            className="p-1.5 hover:bg-slate-800 rounded border border-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors"
            title="Version History"
          >
            <History className="w-4 h-4" />
          </button>

          {canDelete && (
            <button
              onClick={onDeleteSheet}
              className="p-1.5 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded border border-slate-700/60 transition-colors"
              title="Delete Current Sheet"
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
