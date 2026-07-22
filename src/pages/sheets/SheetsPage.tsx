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
import { getActiveLeadSources } from '../../services/leadSource.api';
import { getUsers } from '../../services/users.api';
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
import { DropdownOption, SearchableDropdownMenu } from './components/SearchableDropdownMenu';
import LeadViewDrawer from '../leads/components/LeadViewDrawer';

type SelectedCell = { rowIndex: number; colIndex: number; rowId: string; columnId: string } | null;
type SelectionRange = { startRowIdx: number; startColIdx: number; endRowIdx: number; endColIdx: number } | null;
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
    fontSize: cellFormat.fontSize ? `${cellFormat.fontSize}px` : undefined,
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

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('seeakk_sheets_theme') as 'light' | 'dark') || 'dark';
  });

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('seeakk_sheets_theme', next);
  };

  const [search, setSearch] = useState('');
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Sheet | null>(null);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
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
  const [activeDropdownCell, setActiveDropdownCell] = useState<{ rowId: string; columnId: string; type: 'stage' | 'source' | 'user' | 'status' } | null>(null);
  const [viewingLeadId, setViewingLeadId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<number | null>(null);

  const isLight = theme === 'light';

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

  // Dynamic Master Configuration Queries
  const stagesQuery = useQuery({
    queryKey: ['sheet-lead-stages'],
    queryFn: () => getLeadStages({ status: 'ACTIVE', page: 1, limit: 200, search: '' }),
    staleTime: 60_000,
  });

  const sourcesQuery = useQuery({
    queryKey: ['sheet-lead-sources'],
    queryFn: () => getActiveLeadSources(),
    staleTime: 60_000,
  });

  const usersQuery = useQuery({
    queryKey: ['sheet-assigned-users'],
    queryFn: () => getUsers({ limit: 200, status: 'ACTIVE' }),
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
    setSelectionRange(null);
    setEditingCell(null);
  }, [sheetQuery.data]);

  const sheets = sheetsQuery.data?.data || [];
  const leadStages = stagesQuery.data?.data || [];
  const leadSources = sourcesQuery.data?.data || [];
  const rawUsers = usersQuery.data?.users || usersQuery.data || [];
  const assignedUsers = Array.isArray(rawUsers) ? rawUsers : [];

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

  // Bulk formatting support across selection range
  const updateFormatting = useCallback(
    (patch: Record<string, unknown>) => {
      if (!draft || !canFormat) return;
      const targetCells: Array<{ rowId: string; columnId: string }> = [];

      if (selectionRange) {
        const minRow = Math.min(selectionRange.startRowIdx, selectionRange.endRowIdx);
        const maxRow = Math.max(selectionRange.startRowIdx, selectionRange.endRowIdx);
        const minCol = Math.min(selectionRange.startColIdx, selectionRange.endColIdx);
        const maxCol = Math.max(selectionRange.startColIdx, selectionRange.endColIdx);

        for (let r = minRow; r <= maxRow; r += 1) {
          const row = filteredSortedRows[r];
          if (!row) continue;
          for (let c = minCol; c <= maxCol; c += 1) {
            const col = columns[c];
            if (col) targetCells.push({ rowId: row.id, columnId: col.id });
          }
        }
      } else if (selectedCell) {
        targetCells.push({ rowId: selectedCell.rowId, columnId: selectedCell.columnId });
      }

      if (targetCells.length === 0) return;

      const newCellFormatting = { ...(draft.formatting?.cells || {}) };
      targetCells.forEach(({ rowId, columnId }) => {
        const key = getCellKey(rowId, columnId);
        newCellFormatting[key] = {
          ...(newCellFormatting[key] || {}),
          ...patch,
        };
      });

      remember({
        ...draft,
        formatting: {
          ...(draft.formatting || {}),
          cells: newCellFormatting,
        },
      });
    },
    [canFormat, columns, draft, filteredSortedRows, remember, selectedCell, selectionRange],
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

  // Handle Master Dropdown Select (Stage, Source, User, Status)
  const handleDropdownSelect = useCallback(
    (fieldKey: string, option: DropdownOption, targetRowId: string, targetColId: string, leadId?: string | null) => {
      const targetRows: Array<{ rowId: string; leadId?: string | null }> = [];

      if (selectionRange && draft) {
        const minRow = Math.min(selectionRange.startRowIdx, selectionRange.endRowIdx);
        const maxRow = Math.max(selectionRange.startRowIdx, selectionRange.endRowIdx);
        for (let r = minRow; r <= maxRow; r += 1) {
          const row = filteredSortedRows[r];
          if (row) targetRows.push({ rowId: row.id, leadId: row.metadata?.leadId });
        }
      } else {
        targetRows.push({ rowId: targetRowId, leadId });
      }

      targetRows.forEach(({ rowId }) => {
        updateCell(rowId, targetColId, option.label);
      });

      setActiveDropdownCell(null);

      if (canSync) {
        const changes = targetRows
          .filter((tr) => Boolean(tr.leadId))
          .map((tr) => ({
            rowId: tr.rowId,
            leadId: tr.leadId,
            fieldKey,
            newValue: option.id || option.label,
          }));

        if (changes.length > 0) {
          syncMutation.mutate(changes);
        }
      }
    },
    [canSync, draft, filteredSortedRows, selectionRange, syncMutation, updateCell],
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
    toast.success('Copied to clipboard');
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

  // Handle Cell Click & Drag Range Selection
  const handleCellMouseDown = (rIdx: number, cIdx: number, rowId: string, colId: string, e: React.MouseEvent) => {
    setIsMouseDown(true);
    if (e.shiftKey && selectedCell) {
      setSelectionRange({
        startRowIdx: selectedCell.rowIndex,
        startColIdx: selectedCell.colIndex,
        endRowIdx: rIdx,
        endColIdx: cIdx,
      });
    } else {
      setSelectedCell({ rowIndex: rIdx, colIndex: cIdx, rowId, columnId: colId });
      setSelectionRange({ startRowIdx: rIdx, startColIdx: cIdx, endRowIdx: rIdx, endColIdx: cIdx });
    }
  };

  const handleCellMouseEnter = (rIdx: number, cIdx: number) => {
    if (isMouseDown && selectionRange) {
      setSelectionRange({
        ...selectionRange,
        endRowIdx: rIdx,
        endColIdx: cIdx,
      });
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Excel Keyboard Navigation & Shortcut Commands
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
          const nextSel = { rowIndex: rowIdx - 1, colIndex: colIdx, rowId: nextRow.id, columnId: columns[colIdx].id };
          setSelectedCell(nextSel);
          setSelectionRange({ startRowIdx: nextSel.rowIndex, startColIdx: nextSel.colIndex, endRowIdx: nextSel.rowIndex, endColIdx: nextSel.colIndex });
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (rowIdx < totalRows - 1) {
          const nextRow = filteredSortedRows[rowIdx + 1];
          const nextSel = { rowIndex: rowIdx + 1, colIndex: colIdx, rowId: nextRow.id, columnId: columns[colIdx].id };
          setSelectedCell(nextSel);
          setSelectionRange({ startRowIdx: nextSel.rowIndex, startColIdx: nextSel.colIndex, endRowIdx: nextSel.rowIndex, endColIdx: nextSel.colIndex });
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (colIdx > 0) {
          const nextSel = { rowIndex: rowIdx, colIndex: colIdx - 1, rowId: selectedCell.rowId, columnId: columns[colIdx - 1].id };
          setSelectedCell(nextSel);
          setSelectionRange({ startRowIdx: nextSel.rowIndex, startColIdx: nextSel.colIndex, endRowIdx: nextSel.rowIndex, endColIdx: nextSel.colIndex });
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (colIdx < totalCols - 1) {
          const nextSel = { rowIndex: rowIdx, colIndex: colIdx + 1, rowId: selectedCell.rowId, columnId: columns[colIdx + 1].id };
          setSelectedCell(nextSel);
          setSelectionRange({ startRowIdx: nextSel.rowIndex, startColIdx: nextSel.colIndex, endRowIdx: nextSel.rowIndex, endColIdx: nextSel.colIndex });
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          if (colIdx > 0) {
            const nextSel = { rowIndex: rowIdx, colIndex: colIdx - 1, rowId: selectedCell.rowId, columnId: columns[colIdx - 1].id };
            setSelectedCell(nextSel);
            setSelectionRange({ startRowIdx: nextSel.rowIndex, startColIdx: nextSel.colIndex, endRowIdx: nextSel.rowIndex, endColIdx: nextSel.colIndex });
          }
        } else {
          if (colIdx < totalCols - 1) {
            const nextSel = { rowIndex: rowIdx, colIndex: colIdx + 1, rowId: selectedCell.rowId, columnId: columns[colIdx + 1].id };
            setSelectedCell(nextSel);
            setSelectionRange({ startRowIdx: nextSel.rowIndex, startColIdx: nextSel.colIndex, endRowIdx: nextSel.rowIndex, endColIdx: nextSel.colIndex });
          }
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (editable) {
          const row = filteredSortedRows[rowIdx];
          const val = String(row?.cells?.[columns[colIdx].id] ?? '');
          setEditingCell(selectedCell);
          setEditingValue(val);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (editable) {
          if (selectionRange) {
            const minRow = Math.min(selectionRange.startRowIdx, selectionRange.endRowIdx);
            const maxRow = Math.max(selectionRange.startRowIdx, selectionRange.endRowIdx);
            const minCol = Math.min(selectionRange.startColIdx, selectionRange.endColIdx);
            const maxCol = Math.max(selectionRange.startColIdx, selectionRange.endColIdx);
            const updatedRows = draft.rows.map((row, rIdx) => {
              if (rIdx >= minRow && rIdx <= maxRow) {
                const newCells = { ...row.cells };
                for (let c = minCol; c <= maxCol; c += 1) {
                  if (columns[c]) newCells[columns[c].id] = '';
                }
                return { ...row, cells: newCells };
              }
              return row;
            });
            remember({ ...draft, rows: updatedRows });
          } else {
            updateCell(selectedCell.rowId, selectedCell.columnId, '');
          }
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
  }, [columns, draft, editable, editingCell, filteredSortedRows, handleCopy, handleCut, handlePaste, handleRedo, handleUndo, remember, selectedCell, selectionRange, showFindReplace, updateCell]);

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
          const nextSel = { rowIndex: r, colIndex: c, rowId: row.id, columnId: col.id };
          setSelectedCell(nextSel);
          setSelectionRange({ startRowIdx: r, startColIdx: c, endRowIdx: r, endColIdx: c });
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

  // Cell Address & Selection Bounds
  const activeCellKey = selectedCell ? getCellKey(selectedCell.rowId, selectedCell.columnId) : '';
  const activeFormat = draft?.formatting?.cells?.[activeCellKey] || {};
  const selectedRow = selectedCell ? draft?.rows.find((r) => r.id === selectedCell.rowId) : null;
  const activeCellValue = selectedCell && selectedRow ? String(selectedRow.cells?.[selectedCell.columnId] ?? '') : '';

  const activeCellAddress = useMemo(() => {
    if (!selectedCell) return '';
    if (selectionRange) {
      const minRow = Math.min(selectionRange.startRowIdx, selectionRange.endRowIdx);
      const maxRow = Math.max(selectionRange.startRowIdx, selectionRange.endRowIdx);
      const minCol = Math.min(selectionRange.startColIdx, selectionRange.endColIdx);
      const maxCol = Math.max(selectionRange.startColIdx, selectionRange.endColIdx);
      if (minRow !== maxRow || minCol !== maxCol) {
        return `${columnLetter(minCol)}${minRow + 1}:${columnLetter(maxCol)}${maxRow + 1}`;
      }
    }
    return `${columnLetter(selectedCell.colIndex)}${selectedCell.rowIndex + 1}`;
  }, [selectedCell, selectionRange]);

  const isCellInRange = (rIdx: number, cIdx: number) => {
    if (!selectionRange) return false;
    const minRow = Math.min(selectionRange.startRowIdx, selectionRange.endRowIdx);
    const maxRow = Math.max(selectionRange.startRowIdx, selectionRange.endRowIdx);
    const minCol = Math.min(selectionRange.startColIdx, selectionRange.endColIdx);
    const maxCol = Math.max(selectionRange.startColIdx, selectionRange.endColIdx);
    return rIdx >= minRow && rIdx <= maxRow && cIdx >= minCol && cIdx <= maxCol;
  };

  // Build Master Dropdown Options
  const masterStageOptions: DropdownOption[] = useMemo(
    () => leadStages.map((s: any) => ({ id: s.id, label: s.name, color: s.color })),
    [leadStages],
  );

  const masterSourceOptions: DropdownOption[] = useMemo(
    () => leadSources.map((s: any) => ({ id: s.id, label: s.name })),
    [leadSources],
  );

  const masterUserOptions: DropdownOption[] = useMemo(
    () => assignedUsers.map((u: any) => ({ id: u.id, label: u.name || u.email })),
    [assignedUsers],
  );

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
      <div
        className={`flex flex-col h-[calc(100vh-64px)] overflow-hidden select-none transition-colors ${
          isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
        }`}
      >
        {/* Responsive Toolbar */}
        <SheetsToolbar
          sheets={sheets}
          activeSheetId={activeSheetId}
          onSelectSheet={(id) => setActiveSheetId(id)}
          onCreateSheet={() => createMutation.mutate()}
          onRenameSheet={() => {}}
          onDeleteSheet={() => canDelete && window.confirm('Delete sheet?') && deleteMutation.mutate()}
          saveStatus={saveStatus}
          onManualSave={() => draft && saveMutation.mutate({ sheet: draft })}
          theme={theme}
          onToggleTheme={handleToggleTheme}
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
          theme={theme}
        />

        {/* Main Grid & Versions Sidebar Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          <div
            className={`flex-1 overflow-auto relative scrollbar-thin ${
              isLight
                ? 'bg-white scrollbar-thumb-slate-300 scrollbar-track-slate-100'
                : 'bg-slate-950 scrollbar-thumb-slate-800 scrollbar-track-slate-950'
            }`}
            onScroll={(event) => {
              const top = event.currentTarget.scrollTop;
              const nextStart = Math.max(0, Math.floor(top / 36) - 15);
              if (Math.abs(nextStart - rowWindowStart) > 15) setRowWindowStart(nextStart);
            }}
          >
            {!draft || sheetQuery.isLoading ? (
              <div className="grid h-full place-items-center text-sm font-bold text-slate-400">
                Loading sheet data...
              </div>
            ) : (
              <div style={{ height: Math.max(640, filteredSortedRows.length * 36 + 60), position: 'relative' }}>
                <table
                  className={`absolute left-0 top-0 border-collapse text-xs w-max ${
                    isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'
                  }`}
                  style={{ top: rowWindowStart * 36 }}
                >
                  <thead
                    className={`${isHeaderFrozen ? 'sticky top-0 z-20 shadow-xs' : ''} ${
                      isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                    } font-semibold border-b`}
                  >
                    <tr>
                      <th
                        className={`sticky left-0 z-30 w-12 h-8 border-r border-b text-center font-mono text-[11px] select-none ${
                          isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        #
                      </th>
                      {columns.map((column, colIdx) => (
                        <th
                          key={column.id}
                          style={{ width: column.width || 160, minWidth: column.width || 160 }}
                          className={`h-8 px-2 border-r border-b font-mono text-left select-none group relative ${
                            isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">
                              <span className="text-emerald-500 font-bold mr-1.5">{columnLetter(colIdx)}</span>
                              {column.label}
                            </span>
                            <button
                              onClick={() => setSortState({
                                columnId: column.id,
                                direction: sortState?.columnId === column.id && sortState.direction === 'asc' ? 'desc' : 'asc',
                              })}
                              className={`p-0.5 rounded transition-colors opacity-0 group-hover:opacity-100 ${
                                isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-700 text-slate-400'
                              }`}
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
                        <tr
                          key={row.id}
                          className={`h-9 border-b transition-colors ${
                            isLight
                              ? 'border-slate-200/80 hover:bg-slate-50'
                              : 'border-slate-800/80 hover:bg-slate-800/40'
                          }`}
                        >
                          <td
                            className={`sticky left-0 z-10 w-12 h-9 border-r text-center font-mono text-[11px] font-medium select-none ${
                              isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            {actualRowIdx + 1}
                          </td>
                          {columns.map((column, colIdx) => {
                            const isSelected = selectedCell?.rowId === row.id && selectedCell.columnId === column.id;
                            const isSelectedInRange = isCellInRange(actualRowIdx, colIdx);
                            const isEditing = editingCell?.rowId === row.id && editingCell.columnId === column.id;
                            const value = row.cells?.[column.id] ?? '';
                            const valStr = String(value ?? '');
                            const cellStyle = applyCellStyle(draft.formatting, row.id, column.id);

                            const colKey = (column.leadFieldKey || column.id || column.label).toLowerCase();
                            const isStageCol = colKey.includes('stage');
                            const isSourceCol = colKey.includes('source');
                            const isUserCol = colKey.includes('assigned') || colKey.includes('user');

                            const matchedStage = isStageCol
                              ? leadStages.find((s: any) => s.name.toLowerCase() === valStr.toLowerCase() || s.id === valStr)
                              : null;

                            return (
                              <td
                                key={column.id}
                                style={{ width: column.width || 160, minWidth: column.width || 160, ...cellStyle }}
                                className={`h-9 border-r px-2.5 text-xs relative select-none ${
                                  isLight ? 'border-slate-200 text-slate-800' : 'border-slate-800/80 text-slate-200'
                                } ${
                                  isSelected
                                    ? 'ring-2 ring-emerald-500 z-10'
                                    : isSelectedInRange
                                      ? isLight ? 'bg-emerald-500/15' : 'bg-emerald-950/30'
                                      : ''
                                }`}
                                onMouseDown={(e) => handleCellMouseDown(actualRowIdx, colIdx, row.id, column.id, e)}
                                onMouseEnter={() => handleCellMouseEnter(actualRowIdx, colIdx)}
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
                                    className={`w-full h-full font-mono px-1 border border-emerald-500 rounded focus:outline-none ${
                                      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
                                    }`}
                                  />
                                ) : isStageCol ? (
                                  <div className="relative flex items-center">
                                    <button
                                      onClick={() => setActiveDropdownCell(activeDropdownCell?.rowId === row.id && activeDropdownCell?.columnId === column.id ? null : { rowId: row.id, columnId: column.id, type: 'stage' })}
                                      disabled={!editable}
                                      className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white shadow-xs flex items-center space-x-1 hover:opacity-90 transition-opacity"
                                      style={{ backgroundColor: matchedStage?.color || '#475569' }}
                                    >
                                      <span>{matchedStage?.name || valStr || 'Select Stage'}</span>
                                      <ChevronDown className="w-3 h-3 opacity-70" />
                                    </button>

                                    {activeDropdownCell?.rowId === row.id && activeDropdownCell?.columnId === column.id && (
                                      <SearchableDropdownMenu
                                        title="Select Lead Stage"
                                        options={masterStageOptions}
                                        selectedValue={valStr}
                                        onSelect={(opt) => handleDropdownSelect('stage', opt, row.id, column.id, row.metadata?.leadId)}
                                        onClose={() => setActiveDropdownCell(null)}
                                        isLight={isLight}
                                      />
                                    )}
                                  </div>
                                ) : isSourceCol ? (
                                  <div className="relative flex items-center">
                                    <button
                                      onClick={() => setActiveDropdownCell(activeDropdownCell?.rowId === row.id && activeDropdownCell?.columnId === column.id ? null : { rowId: row.id, columnId: column.id, type: 'source' })}
                                      disabled={!editable}
                                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium border flex items-center justify-between w-full ${
                                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
                                      }`}
                                    >
                                      <span className="truncate">{valStr || 'Select Source'}</span>
                                      <ChevronDown className="w-3 h-3 opacity-60 ml-1" />
                                    </button>

                                    {activeDropdownCell?.rowId === row.id && activeDropdownCell?.columnId === column.id && (
                                      <SearchableDropdownMenu
                                        title="Select Lead Source"
                                        options={masterSourceOptions}
                                        selectedValue={valStr}
                                        onSelect={(opt) => handleDropdownSelect('source', opt, row.id, column.id, row.metadata?.leadId)}
                                        onClose={() => setActiveDropdownCell(null)}
                                        isLight={isLight}
                                      />
                                    )}
                                  </div>
                                ) : isUserCol ? (
                                  <div className="relative flex items-center">
                                    <button
                                      onClick={() => setActiveDropdownCell(activeDropdownCell?.rowId === row.id && activeDropdownCell?.columnId === column.id ? null : { rowId: row.id, columnId: column.id, type: 'user' })}
                                      disabled={!editable}
                                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium border flex items-center justify-between w-full ${
                                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
                                      }`}
                                    >
                                      <span className="truncate">{valStr || 'Assign User'}</span>
                                      <ChevronDown className="w-3 h-3 opacity-60 ml-1" />
                                    </button>

                                    {activeDropdownCell?.rowId === row.id && activeDropdownCell?.columnId === column.id && (
                                      <SearchableDropdownMenu
                                        title="Select Assigned User"
                                        options={masterUserOptions}
                                        selectedValue={valStr}
                                        onSelect={(opt) => handleDropdownSelect('assignedUser', opt, row.id, column.id, row.metadata?.leadId)}
                                        onClose={() => setActiveDropdownCell(null)}
                                        isLight={isLight}
                                      />
                                    )}
                                  </div>
                                ) : row.metadata?.leadId && (column.leadFieldKey === 'name' || column.label.toLowerCase().includes('lead name')) ? (
                                  <button
                                    type="button"
                                    onClick={() => setViewingLeadId(row.metadata?.leadId || null)}
                                    className="text-emerald-500 hover:underline font-bold truncate max-w-full text-left"
                                  >
                                    {valStr}
                                  </button>
                                ) : (
                                  <span className="truncate block max-w-full font-mono">{valStr}</span>
                                )}

                                {/* Fill Handle */}
                                {isSelected && editable && (
                                  <div
                                    className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border border-white cursor-crosshair z-30 shadow-xs"
                                    title="Drag to fill"
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
            <aside
              className={`w-80 shrink-0 border-l p-4 overflow-y-auto ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Version History</h2>
                <button onClick={() => setShowVersions(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {versionsQuery.data?.map((version) => (
                  <div
                    key={version.id}
                    className={`p-3 border rounded-xl transition-colors flex items-center justify-between ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:border-emerald-500' : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">Version {version.version}</div>
                      <div className="text-[11px] text-slate-400">{new Date(version.createdAt).toLocaleString()}</div>
                    </div>
                    <button
                      onClick={() => restoreMutation.mutate(version.id)}
                      disabled={restoreMutation.isPending}
                      className="px-2.5 py-1 bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-600/40 rounded text-[11px] font-semibold transition-colors"
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

        {/* Integrated CRM Lead Details View Drawer */}
        {viewingLeadId && (
          <LeadViewDrawer
            isOpen={Boolean(viewingLeadId)}
            lead={{ id: viewingLeadId } as any}
            onClose={() => setViewingLeadId(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default SheetsPage;
