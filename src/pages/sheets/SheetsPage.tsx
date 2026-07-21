import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Copy,
  Download,
  EyeOff,
  FileSpreadsheet,
  Filter,
  Italic,
  Palette,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Underline,
  Undo2,
  Upload,
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

type SelectedCell = { rowId: string; columnId: string } | null;
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

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Not saved yet';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const getCellKey = (rowId: string, columnId: string) => `${rowId}:${columnId}`;

const applyCellStyle = (formatting: SheetFormatting | null | undefined, rowId: string, columnId: string) =>
  (formatting?.cells?.[getCellKey(rowId, columnId)] || {}) as React.CSSProperties;

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
  const [filterText, setFilterText] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [sortState, setSortState] = useState<SortState>(null);
  const [history, setHistory] = useState<Sheet[]>([]);
  const [future, setFuture] = useState<Sheet[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [rowWindowStart, setRowWindowStart] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setLastSavedAt(sheetQuery.data.lastAutoSavedAt || sheetQuery.data.updatedAt);
    setRowWindowStart(0);
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

  const visibleRows = filteredSortedRows.slice(rowWindowStart, rowWindowStart + 220);

  const remember = useCallback((next: Sheet) => {
    setDraft((current) => {
      if (current) setHistory((items) => [...items.slice(-24), current]);
      setFuture([]);
      return next;
    });
  }, []);

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
    onSuccess: (sheet) => {
      setLastSavedAt(sheet.lastAutoSavedAt || sheet.updatedAt);
      queryClient.setQueryData(['sheet', sheet.id], sheet);
      void queryClient.invalidateQueries({ queryKey: ['sheets'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const blankColumns = buildBlankColumns();
      return createSheet({
        name: `Blank Sheet ${new Date().toLocaleDateString()}`,
        source: 'BLANK',
        columns: blankColumns,
        rows: createBlankRows(50, blankColumns),
        formatting: { frozenRows: 1, alternateRows: true, cells: {}, rows: {}, columns: {} },
      });
    },
    onSuccess: (sheet) => {
      toast.success('Sheet created');
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
    mutationFn: () => {
      if (!draft) return Promise.resolve(null);
      const originalRows = draft.originalSnapshot?.rows || [];
      const originalByRow = new Map(originalRows.map((row) => [row.id, row]));
      const changes = draft.rows.flatMap((row) => {
        const original = originalByRow.get(row.id);
        if (!original) return [];
        return draft.columns.flatMap((column) => {
          const oldValue = original.cells?.[column.id];
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
      return syncSheetLeadChanges(draft.id, changes);
    },
    onSuccess: (result) => {
      if (!result) return;
      const blocked = result.blocked?.length || 0;
      const pending = result.pending?.length || 0;
      toast.success(`Sync checked. ${pending} prepared, ${blocked} blocked by workflow rules.`);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Unable to sync leads'),
  });

  useEffect(() => {
    if (!draft || !editable) return undefined;
    const id = window.setInterval(() => {
      saveMutation.mutate({ sheet: draft, autoSave: true });
    }, 30_000);
    return () => window.clearInterval(id);
  }, [draft, editable, saveMutation]);

  const handleUndo = () => {
    const previous = history.at(-1);
    if (!previous || !draft) return;
    setFuture((items) => [draft, ...items]);
    setHistory((items) => items.slice(0, -1));
    setDraft(previous);
  };

  const handleRedo = () => {
    const next = future[0];
    if (!next || !draft) return;
    setHistory((items) => [...items, draft]);
    setFuture((items) => items.slice(1));
    setDraft(next);
  };

  const handleColumnResize = (columnId: string, delta: number) => {
    if (!draft || !canFormat) return;
    remember({
      ...draft,
      columns: draft.columns.map((column) =>
        column.id === columnId ? { ...column, width: Math.max(90, (column.width || 160) + delta) } : column,
      ),
    });
  };

  const selectedColumn = selectedCell ? draft?.columns.find((column) => column.id === selectedCell.columnId) : null;

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
      <div className="flex h-[calc(100vh-96px)] min-h-[720px] bg-slate-50">
        <aside className="w-80 shrink-0 border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-950">Sheets</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Spreadsheet manager</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => createMutation.mutate()}
                disabled={!canCreate || createMutation.isPending}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Blank
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!canImport || importMutation.isPending}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-black text-gray-700 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
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
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sheets"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm font-semibold outline-none focus:border-emerald-300 focus:bg-white"
              />
            </div>
          </div>
          <div className="h-[calc(100%-180px)] overflow-y-auto p-3">
            {sheetsQuery.isLoading ? (
              <div className="p-4 text-sm font-bold text-gray-400">Loading sheets...</div>
            ) : sheets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm font-bold text-gray-500">
                No sheets yet.
              </div>
            ) : (
              sheets.map((sheet: Sheet) => (
                <button
                  key={sheet.id}
                  type="button"
                  onClick={() => setActiveSheetId(sheet.id)}
                  className={`mb-2 w-full rounded-xl border p-3 text-left transition ${
                    activeSheetId === sheet.id
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="truncate text-sm font-black text-gray-900">{sheet.name}</div>
                  <div className="mt-1 text-xs font-semibold text-gray-500">
                    {sheet.rowCount} rows · {sheet.columnCount} columns
                  </div>
                  <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">{sheet.source}</div>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden">
          <div className="border-b border-gray-200 bg-white px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={draft?.name || ''}
                disabled={!editable || !draft}
                onChange={(event) => draft && remember({ ...draft, name: event.target.value })}
                className="min-w-[220px] rounded-xl border border-transparent bg-gray-50 px-3 py-2 text-lg font-black text-gray-950 outline-none focus:border-emerald-300"
              />
              <div className="text-xs font-bold text-gray-400">Saved {formatDateTime(lastSavedAt)}</div>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button title="Undo" onClick={handleUndo} disabled={!history.length} className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40">
                  <Undo2 className="h-4 w-4" />
                </button>
                <button title="Redo" onClick={handleRedo} disabled={!future.length} className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40">
                  <Redo2 className="h-4 w-4" />
                </button>
                <button
                  title="Save"
                  onClick={() => draft && saveMutation.mutate({ sheet: draft })}
                  disabled={!editable || !draft || saveMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-3 py-2 text-xs font-black text-white disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button title="Duplicate" onClick={() => duplicateMutation.mutate()} disabled={!canCreate || !draft} className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40">
                  <Copy className="h-4 w-4" />
                </button>
                <button title="Delete" onClick={() => canDelete && window.confirm('Delete this sheet?') && deleteMutation.mutate()} disabled={!canDelete || !draft} className="rounded-lg border border-rose-100 bg-rose-50 p-2 text-rose-600 disabled:opacity-40">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={filterText}
                  onChange={(event) => setFilterText(event.target.value)}
                  placeholder="Search any column"
                  className="w-64 rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm font-semibold outline-none focus:border-emerald-300"
                />
              </div>
              <button onClick={() => selectedCell && setSortState({ columnId: selectedCell.columnId, direction: sortState?.direction === 'asc' ? 'desc' : 'asc' })} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-black text-gray-700">
                <Filter className="h-4 w-4" />
                Sort
              </button>
              <button onClick={() => selectedColumn && setHiddenColumns(new Set([...hiddenColumns, selectedColumn.id]))} disabled={!selectedColumn} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-black text-gray-700 disabled:opacity-40">
                <EyeOff className="h-4 w-4" />
                Hide
              </button>
              <select
                onChange={(event) => {
                  const columnId = event.target.value;
                  if (!columnId) return;
                  const next = new Set(hiddenColumns);
                  next.delete(columnId);
                  setHiddenColumns(next);
                  event.currentTarget.value = '';
                }}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-black text-gray-700"
              >
                <option value="">Show columns</option>
                {draft?.columns.filter((column) => hiddenColumns.has(column.id)).map((column) => (
                  <option key={column.id} value={column.id}>{column.label}</option>
                ))}
              </select>

              <div className="mx-1 h-7 w-px bg-gray-200" />
              <button title="Bold" disabled={!canFormat} onClick={() => updateFormatting({ fontWeight: '800' })} className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40">
                <Bold className="h-4 w-4" />
              </button>
              <button title="Italic" disabled={!canFormat} onClick={() => updateFormatting({ fontStyle: 'italic' })} className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40">
                <Italic className="h-4 w-4" />
              </button>
              <button title="Underline" disabled={!canFormat} onClick={() => updateFormatting({ textDecoration: 'underline' })} className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40">
                <Underline className="h-4 w-4" />
              </button>
              <button title="Align left" disabled={!canFormat} onClick={() => updateFormatting({ textAlign: 'left' })} className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40">
                <AlignLeft className="h-4 w-4" />
              </button>
              <button title="Align center" disabled={!canFormat} onClick={() => updateFormatting({ textAlign: 'center' })} className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40">
                <AlignCenter className="h-4 w-4" />
              </button>
              <button title="Align right" disabled={!canFormat} onClick={() => updateFormatting({ textAlign: 'right' })} className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40">
                <AlignRight className="h-4 w-4" />
              </button>
              <label title="Text color" className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-gray-200 text-gray-600">
                <Palette className="h-4 w-4" />
                <input type="color" className="hidden" disabled={!canFormat} onChange={(event) => updateFormatting({ color: event.target.value })} />
              </label>
              <label title="Background color" className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-gray-200 text-gray-600">
                <span className="h-4 w-4 rounded bg-emerald-200" />
                <input type="color" className="hidden" disabled={!canFormat} onChange={(event) => updateFormatting({ backgroundColor: event.target.value })} />
              </label>

              <div className="ml-auto flex gap-2">
                <button onClick={() => setShowVersions((value) => !value)} disabled={!draft} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-black text-gray-700 disabled:opacity-40">
                  <RotateCcw className="h-4 w-4" />
                  Versions
                </button>
                <button onClick={() => draft && exportSheet(draft.id, 'csv')} disabled={!canExport || !draft} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-black text-gray-700 disabled:opacity-40">
                  <Download className="h-4 w-4" />
                  CSV
                </button>
                <button onClick={() => draft && exportSheet(draft.id, 'xlsx')} disabled={!canExport || !draft} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-black text-gray-700 disabled:opacity-40">
                  <Download className="h-4 w-4" />
                  XLSX
                </button>
                <button onClick={() => syncMutation.mutate()} disabled={!canSync || !draft || syncMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-white disabled:opacity-40">
                  <Check className="h-4 w-4" />
                  Sync Leads
                </button>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100%-124px)]">
            <div className="min-w-0 flex-1 overflow-auto" onScroll={(event) => {
              const top = event.currentTarget.scrollTop;
              const nextStart = Math.max(0, Math.floor(top / 42) - 20);
              if (Math.abs(nextStart - rowWindowStart) > 20) setRowWindowStart(nextStart);
            }}>
              {!draft || sheetQuery.isLoading ? (
                <div className="grid h-full place-items-center text-sm font-black text-gray-400">Open or create a sheet.</div>
              ) : (
                <div style={{ height: Math.max(620, filteredSortedRows.length * 42 + 80), position: 'relative' }}>
                  <table className="absolute left-0 top-0 border-collapse bg-white" style={{ top: rowWindowStart * 42 }}>
                    <thead className="sticky top-0 z-10 bg-gray-100">
                      <tr>
                        <th className="sticky left-0 z-20 h-9 w-14 border border-gray-200 bg-gray-100 text-xs font-black text-gray-500">#</th>
                        {columns.map((column, index) => (
                          <th key={column.id} style={{ width: column.width || 160, minWidth: column.width || 160 }} className="h-9 border border-gray-200 bg-gray-100 text-xs font-black text-gray-600">
                            <button
                              type="button"
                              onClick={() => setSortState({ columnId: column.id, direction: sortState?.columnId === column.id && sortState.direction === 'asc' ? 'desc' : 'asc' })}
                              className="flex w-full items-center justify-between px-2"
                            >
                              <span>{columnLetter(index)} · {column.label}</span>
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((row, rowIndex) => (
                        <tr key={row.id} className={draft.formatting?.alternateRows && rowIndex % 2 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="sticky left-0 z-10 h-[42px] w-14 border border-gray-200 bg-gray-100 text-center text-xs font-bold text-gray-500">
                            {rowWindowStart + rowIndex + 1}
                          </td>
                          {columns.map((column) => {
                            const isSelected = selectedCell?.rowId === row.id && selectedCell.columnId === column.id;
                            const isEditing = editingCell?.rowId === row.id && editingCell.columnId === column.id;
                            const value = row.cells?.[column.id] ?? '';
                            const style = applyCellStyle(draft.formatting, row.id, column.id);
                            const isLeadLink = column.leadFieldKey === 'name' || String(column.label).toLowerCase().includes('lead number');
                            return (
                              <td
                                key={column.id}
                                style={{ width: column.width || 160, minWidth: column.width || 160, ...style }}
                                className={`h-[42px] border border-gray-200 px-2 text-sm font-semibold text-gray-800 ${isSelected ? 'outline outline-2 outline-emerald-400' : ''}`}
                                onClick={() => setSelectedCell({ rowId: row.id, columnId: column.id })}
                                onDoubleClick={() => editable && setEditingCell({ rowId: row.id, columnId: column.id })}
                              >
                                {isEditing ? (
                                  column.type === 'dropdown' && column.leadFieldKey === 'stage' ? (
                                    <select
                                      autoFocus
                                      value={String(value)}
                                      onChange={(event) => updateCell(row.id, column.id, event.target.value)}
                                      onBlur={() => setEditingCell(null)}
                                      className="h-full w-full bg-transparent outline-none"
                                    >
                                      <option value="">Select stage</option>
                                      {leadStages.map((stage: any) => (
                                        <option key={stage.id} value={stage.name}>{stage.name}</option>
                                      ))}
                                    </select>
                                  ) : column.type === 'checkbox' ? (
                                    <input
                                      autoFocus
                                      type="checkbox"
                                      checked={String(value).toLowerCase() === 'true'}
                                      onChange={(event) => updateCell(row.id, column.id, event.target.checked)}
                                      onBlur={() => setEditingCell(null)}
                                    />
                                  ) : (
                                    <input
                                      autoFocus
                                      value={String(value)}
                                      onChange={(event) => updateCell(row.id, column.id, event.target.value)}
                                      onBlur={() => setEditingCell(null)}
                                      onKeyDown={(event) => {
                                        if (event.key === 'Enter') setEditingCell(null);
                                      }}
                                      className="h-full w-full bg-transparent outline-none"
                                    />
                                  )
                                ) : isLeadLink && row.metadata?.leadId ? (
                                  <button
                                    type="button"
                                    onClick={() => navigate('/leads', { state: { openLeadId: row.metadata?.leadId } })}
                                    className="max-w-full truncate font-black text-emerald-600 hover:underline"
                                  >
                                    {String(value)}
                                  </button>
                                ) : (
                                  <span className="block max-w-full truncate">{String(value)}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {showVersions && (
              <aside className="w-80 shrink-0 border-l border-gray-200 bg-white p-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Version History</h2>
                <div className="mt-4 space-y-2">
                  {versionsQuery.data?.map((version) => (
                    <button
                      key={version.id}
                      type="button"
                      onClick={() => restoreMutation.mutate(version.id)}
                      className="w-full rounded-xl border border-gray-100 p-3 text-left hover:border-emerald-200"
                    >
                      <div className="text-sm font-black text-gray-900">Version {version.version}</div>
                      <div className="text-xs font-semibold text-gray-500">{formatDateTime(version.createdAt)}</div>
                    </button>
                  ))}
                </div>
              </aside>
            )}
          </div>

          <div className="border-t border-gray-200 bg-white px-5 py-2 text-xs font-bold text-gray-500">
            Showing {visibleRows.length} of {filteredSortedRows.length} rows. Use search/filter to narrow large sheets. Drag-free width controls:
            <button disabled={!selectedColumn} onClick={() => selectedColumn && handleColumnResize(selectedColumn.id, -24)} className="ml-2 rounded border px-2 py-1 disabled:opacity-40">-</button>
            <button disabled={!selectedColumn} onClick={() => selectedColumn && handleColumnResize(selectedColumn.id, 24)} className="ml-1 rounded border px-2 py-1 disabled:opacity-40">+</button>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default SheetsPage;
