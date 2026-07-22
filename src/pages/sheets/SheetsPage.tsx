import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  Plus,
  Search,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { getLeadStages } from '../../services/leadStage.api';
import {
  createSheet,
  deleteSheet,
  duplicateSheet,
  exportSheet,
  getSheet,
  importSheetFile,
  listSheetVersions,
  listSheets,
  restoreSheetVersion,
  saveSheet,
  syncSheetLeadChanges,
  Sheet,
  SheetColumn,
  SheetFormatting,
  SheetRow,
} from '../../services/sheets.api';
import useAuthStore from '../../store/useAuthStore';
import { hasPermission } from '../../utils/permission.util';

import { SheetsCellBar } from './components/SheetsCellBar';
import { SheetsContextMenu } from './components/SheetsContextMenu';
import { SheetsToolbar } from './components/SheetsToolbar';
import { FindReplaceModal } from './components/FindReplaceModal';

type SelectedCell = { rowIndex: number; colIndex: number; rowId: string; columnId: string } | null;
type SortState = { columnId: string; direction: 'asc' | 'desc' } | null;

const columnLetter = (index: number) => {
  let value = '';
  let number = index + 1;
  while (number > 0) {
    const remainder = (number - 1) % 26;
    value = String.fromCharCode(65 + remainder) + value;
    number = Math.floor((number - 1) / 26);
  }
  return value;
};

const createBlankRows = (count: number, columns: SheetColumn[]): SheetRow[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `row_${Date.now()}_${index}`,
    cells: Object.fromEntries(columns.map((column) => [column.id, ''])),
  }));

const buildBlankColumns = (): SheetColumn[] =>
  Array.from({ length: 10 }, (_, index) => ({
    id: `column_${index + 1}`,
    label: `Column ${index + 1}`,
    type: 'text',
    width: 160,
  }));

const getCellKey = (rowId: string, columnId: string) => `${rowId}:${columnId}`;

const applyCellStyle = (formatting: SheetFormatting | null | undefined, rowId: string, columnId: string): React.CSSProperties => {
  const cellFormat = formatting?.cells?.[getCellKey(rowId, columnId)] || {};
  return {
    fontWeight: cellFormat.bold ? 'bold' : 'normal',
    fontStyle: cellFormat.italic ? 'italic' : 'normal',
    textDecoration: cellFormat.underline ? 'underline' : 'none',
    color: (cellFormat.color as string) || undefined,
    backgroundColor: (cellFormat.bgColor as string) || undefined,
    textAlign: (cellFormat.align as any) || 'left',
  };
};

const SheetsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const permissions = user?.permissions || [];
  const canView = hasPermission(permissions, 'SHEETS_VIEW');
  const canCreate = hasPermission(permissions, 'SHEETS_CREATE');
  const canEdit = hasPermission(permissions, 'SHEETS_EDIT');
  const canDelete = hasPermission(permissions, 'SHEETS_DELETE');
  const canImport = hasPermission(permissions, 'SHEETS_IMPORT');
  const canExport = hasPermission(permissions, 'SHEETS_EXPORT');
  const canSync = hasPermission(permissions, 'SHEETS_SYNC_LEADS');
  const canFormat = hasPermission(permissions, 'SHEETS_FORMAT_MANAGE');
  const editable = canEdit || canFormat;

  const [search, setSearch] = useState('');
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Sheet | null>(null);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [editingCell, setEditingCell] = useState<SelectedCell>(null);
  const [editingValue, setEditingValue] = useState('');
  const [clipboardValue, setClipboardValue] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [sortState, setSortState] = useState<SortState>(null);
  const [history, setHistory] = useState<Sheet[]>([]);
  const [future, setFuture] = useState<Sheet[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [showVersions, setShowVersions] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [isHeaderFrozen, setIsHeaderFrozen] = useState(true);
  const [rowWindowStart, setRowWindowStart] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; rowId: string; columnId: string } | null>(null);
  const [isDraggingFill, setIsDraggingFill] = useState(false);
  const [activeStageMenuCell, setActiveStageMenuCell] = useState<{ rowId: string; columnId: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<number | null>(null);

  const sheetsQuery = useQuery({
    queryKey: ['sheets', search],
    queryFn: () => listSheets({ search, page: 1, limit: 50 }),
    enabled: canView,
  });

  const sheetQuery = useQuery({
    queryKey: ['sheet', activeSheetId],
    queryFn: () => getSheet(activeSheetId!),
    enabled: canView && Boolean(activeSheetId),
  });

  const versionsQuery = useQuery({
    queryKey: ['sheet-versions', activeSheetId],
    queryFn: () => listSheetVersions(activeSheetId!),
    enabled: showVersions && Boolean(activeSheetId),
  });

  const stagesQuery = useQuery({
    queryKey: ['sheet-lead-stages'],
    queryFn: () => getLeadStages({ status: 'ACTIVE', page: 1, limit: 200, search: '' }),
    staleTime: 60_000,
  });

  useEffect(() => {
    const requestedSheetId = searchParams.get('sheetId');
    if (requestedSheetId && requestedSheetId !== activeSheetId) {
      setActiveSheetId(requestedSheetId);
      return;
    }
    const first = sheetsQuery.data?.data?.[0];
    if (!activeSheetId && first?.id) setActiveSheetId(first.id);
  }, [activeSheetId, searchParams, sheetsQuery.data]);

  useEffect(() => {
    if (!sheetQuery.data) return;
    setDraft(sheetQuery.data);
    setHiddenColumns(new Set((sheetQuery.data.columns || []).filter((column) => column.hidden).map((column) => column.id)));
    setHistory([]);
    setFuture([]);
    setSaveStatus('saved');
    setRowWindowStart(0);
    setSelectedCell(null);
    setEditingCell(null);
  }, [sheetQuery.data]);

  const sheets = sheetsQuery.data?.data || [];
  const leadStages = stagesQuery.data?.data || [];

  const columns = useMemo(
    () => (draft?.columns || []).filter((column) => !hiddenColumns.has(column.id)),
    [draft?.columns, hiddenColumns],
  );

  const filteredSortedRows = useMemo(() => {
    const rows = draft?.rows || [];
    const filtered = filterText.trim()
      ? rows.filter((row) =>
          columns.some((column) =>
            String(row.cells?.[column.id] ?? '').toLowerCase().includes(filterText.trim().toLowerCase()),
          ),
        )
      : rows;

    if (!sortState) return filtered;
    return [...filtered].sort((left, right) => {
      const a = String(left.cells?.[sortState.columnId] ?? '').toLowerCase();
      const b = String(right.cells?.[sortState.columnId] ?? '').toLowerCase();
      return sortState.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
    });
  }, [columns, draft?.rows, filterText, sortState]);

  const visibleRows = filteredSortedRows.slice(rowWindowStart, rowWindowStart + 200);

  const remember = useCallback((next: Sheet) => {
    setDraft((current) => {
      if (current) setHistory((items) => [...items.slice(-30), current]);
      setFuture([]);
      return next;
    });
    setSaveStatus('unsaved');
  }, []);

  const saveMutation = useMutation({
    mutationFn: (payload: { sheet: Sheet; autoSave?: boolean }) =>
      saveSheet(payload.sheet.id, {
        name: payload.sheet.name,
        description: payload.sheet.description,
        columns: payload.sheet.columns,
        rows: payload.sheet.rows,
        formatting: payload.sheet.formatting || {},
        metadata: payload.sheet.metadata || {},
        autoSave: payload.autoSave,
      }),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: (sheet) => {
      setSaveStatus('saved');
      queryClient.setQueryData(['sheet', sheet.id], sheet);
      void queryClient.invalidateQueries({ queryKey: ['sheets'] });
    },
    onError: () => setSaveStatus('error'),
  });

  // Debounced auto-save
  useEffect(() => {
    if (!draft || !editable || saveStatus !== 'unsaved') return undefined;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = window.setTimeout(() => {
      saveMutation.mutate({ sheet: draft, autoSave: true });
    }, 2000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [draft, editable, saveStatus, saveMutation]);

  const updateCell = useCallback(
    (rowId: string, columnId: string, value: unknown) => {
      if (!draft || !editable) return;
      remember({
        ...draft,
        rows: draft.rows.map((row) =>
          row.id === rowId ? { ...row, cells: { ...row.cells, [columnId]: value } } : row,
        ),
      });
    },
    [draft, editable, remember],
  );

  const updateFormatting = useCallback(
    (patch: Record<string, unknown>) => {
      if (!draft || !selectedCell || !canFormat) return;
      const key = getCellKey(selectedCell.rowId, selectedCell.columnId);
      remember({
        ...draft,
        formatting: {
          ...(draft.formatting || {}),
          cells: {
            ...(draft.formatting?.cells || {}),
            [key]: {
              ...(draft.formatting?.cells?.[key] || {}),
              ...patch,
            },
          },
        },
      });
    },
    [canFormat, draft, remember, selectedCell],
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      const blankColumns = buildBlankColumns();
      return createSheet({
        name: `Sheet ${sheets.length + 1}`,
        source: 'BLANK',
        columns: blankColumns,
        rows: createBlankRows(50, blankColumns),
        formatting: { frozenRows: 1, alternateRows: true, cells: {}, rows: {}, columns: {} },
      });
    },
    onSuccess: (sheet) => {
      toast.success('New sheet created');
      setActiveSheetId(sheet.id);
      void queryClient.invalidateQueries({ queryKey: ['sheets'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Unable to create sheet'),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => importSheetFile(file),
    onSuccess: (sheet) => {
      toast.success('File imported to Sheets');
      setActiveSheetId(sheet.id);
      void queryClient.invalidateQueries({ queryKey: ['sheets'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Unable to import file'),
  });

  const duplicateMutation = useMutation({
    mutationFn: () => duplicateSheet(activeSheetId!),
    onSuccess: (sheet) => {
      toast.success('Sheet duplicated');
      setActiveSheetId(sheet.id);
      void queryClient.invalidateQueries({ queryKey: ['sheets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSheet(activeSheetId!),
    onSuccess: () => {
      toast.success('Sheet deleted');
      setActiveSheetId(null);
      setDraft(null);
      void queryClient.invalidateQueries({ queryKey: ['sheets'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (versionId: string) => restoreSheetVersion(activeSheetId!, versionId),
    onSuccess: (sheet) => {
      toast.success('Version restored');
      setDraft(sheet);
      void queryClient.invalidateQueries({ queryKey: ['sheet', sheet.id] });
      void queryClient.invalidateQueries({ queryKey: ['sheet-versions', sheet.id] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: (customChanges?: Array<Record<string, unknown>>) => {
      if (!draft) return Promise.resolve(null);
      let changes = customChanges;
      if (!changes) {
        const originalRows = draft.originalSnapshot?.rows || [];
        const originalByRow = new Map(originalRows.map((row) => [row.id, row]));
        changes = draft.rows.flatMap((row) => {
          const original = originalByRow.get(row.id);
          return draft.columns.flatMap((column) => {
            const oldValue = original?.cells?.[column.id];
            const newValue = row.cells?.[column.id];
            if (String(oldValue ?? '') === String(newValue ?? '')) return [];
            return [{
              rowId: row.id,
              leadId: row.metadata?.leadId,
              fieldKey: column.leadFieldKey || column.id,
              oldValue,
              newValue,
            }];
          });
        });
      }
      return syncSheetLeadChanges(draft.id, changes);
    },
    onSuccess: (result) => {
      if (!result) return;
      const applied = result.applied || [];
      const pending = result.pending || [];
      const blocked = result.blocked || [];

      if (applied.length > 0) {
        toast.success(`Successfully updated ${applied.length} lead(s) in CRM.`);
        void queryClient.invalidateQueries({ queryKey: ['leads'] });
      }
      if (pending.length > 0) {
        toast(pending[0].message || 'Lead stage change submitted and pending approval.', { icon: '⏳' });
      }
      if (blocked.length > 0) {
        toast.error(blocked[0].message || 'Lead update was blocked by CRM rules.');
      }
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Unable to sync leads'),
  });

  const handleStageSelect = useCallback(
    (rowId: string, columnId: string, stageName: string, leadId?: string | null) => {
      updateCell(rowId, columnId, stageName);
      setActiveStageMenuCell(null);
      if (leadId && canSync) {
        syncMutation.mutate([{
          rowId,
          leadId,
          fieldKey: 'stage',
          newValue: stageName,
        }]);
      }
    },
    [canSync, syncMutation, updateCell],
  );

  const handleUndo = useCallback(() => {
    const previous = history.at(-1);
    if (!previous || !draft) return;
    setFuture((items) => [draft, ...items]);
    setHistory((items) => items.slice(0, -1));
    setDraft(previous);
  }, [draft, history]);

  const handleRedo = useCallback(() => {
    const next = future[0];
    if (!next || !draft) return;
    setHistory((items) => [...items, draft]);
    setFuture((items) => items.slice(1));
    setDraft(next);
  }, [draft, future]);

  const handleCopy = useCallback(() => {
    if (!selectedCell || !draft) return;
    const row = draft.rows.find((r) => r.id === selectedCell.rowId);
    const val = String(row?.cells?.[selectedCell.columnId] ?? '');
    setClipboardValue(val);
    void navigator.clipboard.writeText(val);
    toast.success('Copied cell');
  }, [draft, selectedCell]);

  const handleCut = useCallback(() => {
    if (!selectedCell || !draft || !editable) return;
    handleCopy();
    updateCell(selectedCell.rowId, selectedCell.columnId, '');
  }, [draft, editable, handleCopy, selectedCell, updateCell]);

  const handlePaste = useCallback(() => {
    if (!selectedCell || !draft || !editable) return;
    void navigator.clipboard.readText().then((text) => {
      const pasteVal = text || clipboardValue || '';
      updateCell(selectedCell.rowId, selectedCell.columnId, pasteVal);
      toast.success('Pasted content');
    });
  }, [clipboardValue, draft, editable, selectedCell, updateCell]);

  // Excel Keyboard Navigation & Editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingCell || showFindReplace || !selectedCell || !draft) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      const rowIdx = selectedCell.rowIndex;
      const colIdx = selectedCell.colIndex;
      const totalRows = filteredSortedRows.length;
      const totalCols = columns.length;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (rowIdx > 0) {
          const nextRow = filteredSortedRows[rowIdx - 1];
          setSelectedCell({ rowIndex: rowIdx - 1, colIndex: colIdx, rowId: nextRow.id, columnId: columns[colIdx].id });
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (rowIdx < totalRows - 1) {
          const nextRow = filteredSortedRows[rowIdx + 1];
          setSelectedCell({ rowIndex: rowIdx + 1, colIndex: colIdx, rowId: nextRow.id, columnId: columns[colIdx].id });
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (colIdx > 0) {
          setSelectedCell({ rowIndex: rowIdx, colIndex: colIdx - 1, rowId: selectedCell.rowId, columnId: columns[colIdx - 1].id });
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (colIdx < totalCols - 1) {
          setSelectedCell({ rowIndex: rowIdx, colIndex: colIdx + 1, rowId: selectedCell.rowId, columnId: columns[colIdx + 1].id });
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          if (colIdx > 0) setSelectedCell({ rowIndex: rowIdx, colIndex: colIdx - 1, rowId: selectedCell.rowId, columnId: columns[colIdx - 1].id });
        } else {
          if (colIdx < totalCols - 1) setSelectedCell({ rowIndex: rowIdx, colIndex: colIdx + 1, rowId: selectedCell.rowId, columnId: columns[colIdx + 1].id });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (editable) {
          const row = filteredSortedRows[rowIdx];
          const val = String(row?.cells?.[columns[colIdx].id] ?? '');
          setEditingCell(selectedCell);
          setEditingValue(val);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        setSelectedCell({ rowIndex: rowIdx, colIndex: 0, rowId: selectedCell.rowId, columnId: columns[0].id });
      } else if (e.key === 'End') {
        e.preventDefault();
        const lastColIdx = totalCols - 1;
        setSelectedCell({ rowIndex: rowIdx, colIndex: lastColIdx, rowId: selectedCell.rowId, columnId: columns[lastColIdx].id });
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        const nextRowIdx = Math.max(0, rowIdx - 15);
        setSelectedCell({ rowIndex: nextRowIdx, colIndex: colIdx, rowId: filteredSortedRows[nextRowIdx].id, columnId: columns[colIdx].id });
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        const nextRowIdx = Math.min(totalRows - 1, rowIdx + 15);
        setSelectedCell({ rowIndex: nextRowIdx, colIndex: colIdx, rowId: filteredSortedRows[nextRowIdx].id, columnId: columns[colIdx].id });
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePaste();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleCut();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowFindReplace(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [columns, draft, editable, editingCell, filteredSortedRows, handleCopy, handleCut, handlePaste, handleRedo, handleUndo, selectedCell, showFindReplace]);

  // Context Menu Handlers
  const handleContextMenu = (e: React.MouseEvent, rowId: string, columnId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, rowId, columnId });
  };

  const handleInsertRow = (above: boolean) => {
    if (!draft || !contextMenu || !editable) return;
    const targetIdx = draft.rows.findIndex((r) => r.id === contextMenu.rowId);
    if (targetIdx === -1) return;
    const newRow: SheetRow = {
      id: `row_${Date.now()}`,
      cells: Object.fromEntries(draft.columns.map((col) => [col.id, ''])),
    };
    const insertAt = above ? targetIdx : targetIdx + 1;
    const updatedRows = [...draft.rows];
    updatedRows.splice(insertAt, 0, newRow);
    remember({ ...draft, rows: updatedRows });
    toast.success('Row inserted');
  };

  const handleDeleteRow = () => {
    if (!draft || !contextMenu || !editable) return;
    remember({
      ...draft,
      rows: draft.rows.filter((r) => r.id !== contextMenu.rowId),
    });
    toast.success('Row deleted');
  };

  const handleClearCell = () => {
    if (!contextMenu || !editable) return;
    updateCell(contextMenu.rowId, contextMenu.columnId, '');
    toast.success('Cell cleared');
  };

  // Find & Replace
  const handleFindNext = (query: string, matchCase: boolean) => {
    if (!draft || !query) return;
    const q = matchCase ? query : query.toLowerCase();
    for (let r = 0; r < filteredSortedRows.length; r += 1) {
      const row = filteredSortedRows[r];
      for (let c = 0; c < columns.length; c += 1) {
        const col = columns[c];
        const val = String(row.cells?.[col.id] ?? '');
        const target = matchCase ? val : val.toLowerCase();
        if (target.includes(q)) {
          setSelectedCell({ rowIndex: r, colIndex: c, rowId: row.id, columnId: col.id });
          return;
        }
      }
    }
    toast('No matches found', { icon: '🔍' });
  };

  const handleReplace = (query: string, replacement: string, matchCase: boolean) => {
    if (!selectedCell || !draft || !editable) return;
    const row = draft.rows.find((r) => r.id === selectedCell.rowId);
    if (!row) return;
    const currentVal = String(row.cells?.[selectedCell.columnId] ?? '');
    const q = matchCase ? query : query.toLowerCase();
    const target = matchCase ? currentVal : currentVal.toLowerCase();
    if (target.includes(q)) {
      const newText = currentVal.replace(new RegExp(query, matchCase ? 'g' : 'gi'), replacement);
      updateCell(selectedCell.rowId, selectedCell.columnId, newText);
      toast.success('Replaced 1 match');
    }
  };

  const handleReplaceAll = (query: string, replacement: string, matchCase: boolean) => {
    if (!draft || !query || !editable) return;
    let count = 0;
    const updatedRows = draft.rows.map((row) => {
      const newCells = { ...row.cells };
      let rowModified = false;
      columns.forEach((col) => {
        const val = String(newCells[col.id] ?? '');
        const q = matchCase ? query : query.toLowerCase();
        const target = matchCase ? val : val.toLowerCase();
        if (target.includes(q)) {
          newCells[col.id] = val.replace(new RegExp(query, matchCase ? 'g' : 'gi'), replacement);
          count += 1;
          rowModified = true;
        }
      });
      return rowModified ? { ...row, cells: newCells } : row;
    });
    if (count > 0) {
      remember({ ...draft, rows: updatedRows });
      toast.success(`Replaced ${count} occurrence(s)`);
    } else {
      toast('No occurrences found to replace', { icon: 'ℹ️' });
    }
  };

  const activeCellKey = selectedCell ? getCellKey(selectedCell.rowId, selectedCell.columnId) : '';
  const activeFormat = draft?.formatting?.cells?.[activeCellKey] || {};
  const selectedRow = selectedCell ? draft?.rows.find((r) => r.id === selectedCell.rowId) : null;
  const activeCellValue = selectedCell && selectedRow ? String(selectedRow.cells?.[selectedCell.columnId] ?? '') : '';
  const activeCellAddress = selectedCell ? `${columnLetter(selectedCell.colIndex)}${selectedCell.rowIndex + 1}` : '';

  if (!canView) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm font-bold text-rose-700">
            You do not have permission to view Sheets.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-950 text-slate-100 overflow-hidden select-none">
        {/* Professional Spreadsheet Toolbar */}
        <SheetsToolbar
          sheets={sheets}
          activeSheetId={activeSheetId}
          onSelectSheet={(id) => setActiveSheetId(id)}
          onCreateSheet={() => createMutation.mutate()}
          onRenameSheet={() => {}}
          onDeleteSheet={() => canDelete && window.confirm('Delete sheet?') && deleteMutation.mutate()}
          saveStatus={saveStatus}
          onManualSave={() => draft && saveMutation.mutate({ sheet: draft })}
          canUndo={history.length > 0}
          canRedo={future.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onCut={handleCut}
          onCopy={handleCopy}
          onPaste={handlePaste}
          activeCellFormat={activeFormat as any}
          onApplyFormat={updateFormatting}
          onToggleFindReplace={() => setShowFindReplace(!showFindReplace)}
          onToggleFilter={() => setFilterText(filterText ? '' : ' ')}
          hasFilterActive={Boolean(filterText.trim())}
          onToggleFreezeHeader={() => setIsHeaderFrozen(!isHeaderFrozen)}
          isHeaderFrozen={isHeaderFrozen}
          onSyncLeads={() => syncMutation.mutate(undefined)}
          isSyncingLeads={syncMutation.isPending}
          onOpenImport={() => fileInputRef.current?.click()}
          onExport={(format) => draft && exportSheet(draft.id, format)}
          onOpenVersions={() => setShowVersions(!showVersions)}
          canEdit={editable}
          canFormat={canFormat}
          canExport={canExport}
          canImport={canImport}
          canSync={canSync}
          canDelete={canDelete}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) importMutation.mutate(file);
            event.currentTarget.value = '';
          }}
        />

        {/* Cell Coordinate & Formula Bar */}
        <SheetsCellBar
          cellAddress={activeCellAddress}
          value={editingCell ? editingValue : activeCellValue}
          onChangeValue={(val) => {
            if (selectedCell) {
              setEditingValue(val);
              updateCell(selectedCell.rowId, selectedCell.columnId, val);
            }
          }}
          onCommit={() => setEditingCell(null)}
          disabled={!editable || !selectedCell}
        />

        {/* Main Grid & Versions Sidebar Layout */}
        <div className="flex-1 flex overflow-hidden relative bg-slate-950">
          <div
            ref={gridContainerRef}
            className="flex-1 overflow-auto bg-slate-950 relative scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950"
            onScroll={(event) => {
              const top = event.currentTarget.scrollTop;
              const nextStart = Math.max(0, Math.floor(top / 36) - 15);
              if (Math.abs(nextStart - rowWindowStart) > 15) setRowWindowStart(nextStart);
            }}
          >
            {!draft || sheetQuery.isLoading ? (
              <div className="grid h-full place-items-center text-sm font-bold text-slate-500">
                Loading sheet data...
              </div>
            ) : (
              <div style={{ height: Math.max(640, filteredSortedRows.length * 36 + 60), position: 'relative' }}>
                <table className="absolute left-0 top-0 border-collapse bg-slate-900 text-xs w-max" style={{ top: rowWindowStart * 36 }}>
                  <thead className={`${isHeaderFrozen ? 'sticky top-0 z-20 shadow-md' : ''} bg-slate-800 text-slate-300 font-semibold border-b border-slate-700`}>
                    <tr>
                      <th className="sticky left-0 z-30 w-12 h-8 bg-slate-800 border-r border-b border-slate-700 text-center font-mono text-[11px] text-slate-400 select-none">
                        #
                      </th>
                      {columns.map((column, colIdx) => (
                        <th
                          key={column.id}
                          style={{ width: column.width || 160, minWidth: column.width || 160 }}
                          className="h-8 px-2 border-r border-b border-slate-700 bg-slate-800 font-mono text-left text-slate-200 select-none group relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate text-slate-300">
                              <span className="text-emerald-400 font-bold mr-1.5">{columnLetter(colIdx)}</span>
                              {column.label}
                            </span>
                            <button
                              onClick={() => setSortState({
                                columnId: column.id,
                                direction: sortState?.columnId === column.id && sortState.direction === 'asc' ? 'desc' : 'asc',
                              })}
                              className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row, rowIndex) => {
                      const actualRowIdx = rowWindowStart + rowIndex;
                      return (
                        <tr key={row.id} className="h-9 hover:bg-slate-800/40 border-b border-slate-800/60 transition-colors">
                          <td className="sticky left-0 z-10 w-12 h-9 bg-slate-900 border-r border-slate-800 text-center font-mono text-[11px] text-slate-500 font-medium select-none">
                            {actualRowIdx + 1}
                          </td>
                          {columns.map((column, colIdx) => {
                            const isSelected = selectedCell?.rowId === row.id && selectedCell.columnId === column.id;
                            const isEditing = editingCell?.rowId === row.id && editingCell.columnId === column.id;
                            const value = row.cells?.[column.id] ?? '';
                            const valStr = String(value ?? '');
                            const cellStyle = applyCellStyle(draft.formatting, row.id, column.id);

                            const isStageColumn = column.leadFieldKey === 'stage' || column.label.toLowerCase().includes('stage');
                            const matchedStage = isStageColumn
                              ? leadStages.find((s: any) => s.name.toLowerCase() === valStr.toLowerCase() || s.id === valStr)
                              : null;

                            return (
                              <td
                                key={column.id}
                                style={{ width: column.width || 160, minWidth: column.width || 160, ...cellStyle }}
                                className={`h-9 border-r border-slate-800/80 px-2.5 text-xs text-slate-200 relative select-none ${
                                  isSelected ? 'ring-2 ring-emerald-500 z-10 bg-emerald-950/20' : ''
                                }`}
                                onClick={() => setSelectedCell({ rowIndex: actualRowIdx, colIndex: colIdx, rowId: row.id, columnId: column.id })}
                                onDoubleClick={() => {
                                  if (editable) {
                                    setEditingCell({ rowIndex: actualRowIdx, colIndex: colIdx, rowId: row.id, columnId: column.id });
                                    setEditingValue(valStr);
                                  }
                                }}
                                onContextMenu={(e) => handleContextMenu(e, row.id, column.id)}
                              >
                                {isEditing ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    onBlur={() => {
                                      updateCell(row.id, column.id, editingValue);
                                      setEditingCell(null);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        updateCell(row.id, column.id, editingValue);
                                        setEditingCell(null);
                                      } else if (e.key === 'Escape') {
                                        setEditingCell(null);
                                      }
                                    }}
                                    className="w-full h-full bg-slate-950 text-white font-mono px-1 border border-emerald-500 rounded focus:outline-none"
                                  />
                                ) : isStageColumn ? (
                                  <div className="relative flex items-center">
                                    <button
                                      onClick={() => setActiveStageMenuCell(activeStageMenuCell?.rowId === row.id ? null : { rowId: row.id, columnId: column.id })}
                                      disabled={!editable}
                                      className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white shadow-sm flex items-center space-x-1 hover:opacity-90 transition-opacity"
                                      style={{ backgroundColor: matchedStage?.color || '#475569' }}
                                    >
                                      <span>{matchedStage?.name || valStr || 'Select Stage'}</span>
                                      <ChevronDown className="w-3 h-3 opacity-70" />
                                    </button>

                                    {activeStageMenuCell?.rowId === row.id && activeStageMenuCell?.columnId === column.id && (
                                      <div className="absolute left-0 top-full mt-1 z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1.5 w-44 space-y-1">
                                        {leadStages.map((stage: any) => (
                                          <button
                                            key={stage.id}
                                            onClick={() => handleStageSelect(row.id, column.id, stage.name, row.metadata?.leadId)}
                                            className="w-full text-left px-2.5 py-1 rounded text-xs text-white font-medium flex items-center space-x-2 hover:bg-slate-800 transition-colors"
                                          >
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                                            <span>{stage.name}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : row.metadata?.leadId && (column.leadFieldKey === 'name' || column.label.toLowerCase().includes('lead name')) ? (
                                  <button
                                    onClick={() => navigate('/leads', { state: { openLeadId: row.metadata?.leadId } })}
                                    className="text-emerald-400 hover:text-emerald-300 font-semibold underline truncate max-w-full text-left"
                                  >
                                    {valStr}
                                  </button>
                                ) : (
                                  <span className="truncate block max-w-full font-mono">{valStr}</span>
                                )}

                                {/* Excel Bottom-Right Fill Handle */}
                                {isSelected && editable && (
                                  <div
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      setIsDraggingFill(true);
                                    }}
                                    className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border border-white cursor-crosshair z-30 shadow"
                                    title="Drag to fill down"
                                  />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Version History Drawer */}
          {showVersions && (
            <aside className="w-80 shrink-0 border-l border-slate-800 bg-slate-900 p-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Version History</h2>
                <button onClick={() => setShowVersions(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {versionsQuery.data?.map((version) => (
                  <div
                    key={version.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">Version {version.version}</div>
                      <div className="text-[11px] text-slate-500">{new Date(version.createdAt).toLocaleString()}</div>
                    </div>
                    <button
                      onClick={() => restoreMutation.mutate(version.id)}
                      disabled={restoreMutation.isPending}
                      className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 rounded text-[11px] font-semibold transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>

        {/* Floating Context Menu */}
        {contextMenu && (
          <SheetsContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onCut={handleCut}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onInsertRowAbove={() => handleInsertRow(true)}
            onInsertRowBelow={() => handleInsertRow(false)}
            onDeleteRow={handleDeleteRow}
            onClearContents={handleClearCell}
            onHideColumn={() => selectedCell && setHiddenColumns(new Set([...hiddenColumns, selectedCell.columnId]))}
            onToggleFreezeHeader={() => setIsHeaderFrozen(!isHeaderFrozen)}
            isHeaderFrozen={isHeaderFrozen}
            canEdit={editable}
          />
        )}

        {/* Find & Replace Modal */}
        <FindReplaceModal
          isOpen={showFindReplace}
          onClose={() => setShowFindReplace(false)}
          onFindNext={handleFindNext}
          onFindPrev={handleFindNext}
          onReplace={handleReplace}
          onReplaceAll={handleReplaceAll}
        />
      </div>
    </DashboardLayout>
  );
};

export default SheetsPage;
