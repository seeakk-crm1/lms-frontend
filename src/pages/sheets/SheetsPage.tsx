import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  Download,
  ExternalLink,
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

import SheetFollowUpModal from './components/SheetFollowUpModal';
import SheetProductModal from './components/SheetProductModal';
import AdvancePaymentModal from '../leads/components/AdvancePaymentModal';

import { SheetsCellBar } from './components/SheetsCellBar';
import { SheetsContextMenu } from './components/SheetsContextMenu';
import { SheetsToolbar } from './components/SheetsToolbar';
import { FindReplaceModal } from './components/FindReplaceModal';
import { DropdownOption, SearchableDropdownMenu } from './components/SearchableDropdownMenu';
import { DuplicateMatchModal } from './components/DuplicateMatchModal';
import LeadFormDrawer from '../leads/components/LeadFormDrawer';
import type { LeadListItem } from '../../types/lead.types';

type SelectedCell = { rowIndex: number; colIndex: number; rowId: string; columnId: string } | null;
type SelectionRange = { startRowIdx: number; startColIdx: number; endRowIdx: number; endColIdx: number } | null;
type SortState = { columnId: string; direction: 'asc' | 'desc' } | null;
type SearchLocation = { rowIndex: number; colIndex: number; rowId: string; columnId: string };

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

const toInputDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr || '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return dateStr || '';
  }
};

const formatFollowupDisplay = (valStr: string): string => {
  if (!valStr) return '—';
  try {
    const d = new Date(valStr);
    if (Number.isNaN(d.getTime())) return valStr;
    return format(d, 'dd MMM yyyy • hh:mm a');
  } catch {
    return valStr;
  }
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

const FOLLOW_UP_TYPES: DropdownOption[] = [
  { id: 'CALL', label: 'Call' },
  { id: 'MEETING', label: 'Meeting' },
  { id: 'EMAIL', label: 'Email' },
  { id: 'WHATSAPP', label: 'WhatsApp' },
  { id: 'SITE_VISIT', label: 'Site Visit' },
  { id: 'DEMO', label: 'Demo' },
];

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

  // Find & Replace state
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [findReplaceMode, setFindReplaceMode] = useState<'find' | 'replace'>('find');
  const [searchState, setSearchState] = useState<{ query: string; matchCase: boolean; wholeCell: boolean; scope: 'sheet' | 'column' | 'selection' }>({
    query: '',
    matchCase: false,
    wholeCell: false,
    scope: 'sheet',
  });
  const [searchResults, setSearchResults] = useState<SearchLocation[]>([]);
  const [searchIndex, setSearchIndex] = useState(0);

  const [isHeaderFrozen, setIsHeaderFrozen] = useState(true);
  const [rowWindowStart, setRowWindowStart] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; rowId: string; columnId: string } | null>(null);
  const [activeDropdownCell, setActiveDropdownCell] = useState<{ rowId: string; columnId: string; type: 'stage' | 'source' | 'user' | 'followupType' } | null>(null);

  // CRM Lead Form Drawer Integration
  const [editingFormLead, setEditingFormLead] = useState<LeadListItem | null>(null);
  const [duplicateCandidates, setDuplicateCandidates] = useState<LeadListItem[]>([]);

  // CRM Follow-up Scheduling Modal Integration (uses same PUT /leads/:id API as All Leads)
  const [sheetFollowUpModal, setSheetFollowUpModal] = useState<{
    isOpen: boolean;
    rowId: string;
    columnId: string;
    leadId?: string;
    leadName?: string;
    currentFollowUpAt?: string | null;
  }>({
    isOpen: false,
    rowId: '',
    columnId: '',
  });

  // CRM Product Selector Modal Integration
  const [productModal, setProductModal] = useState<{
    isOpen: boolean;
    rowId: string;
    columnId: string;
    leadId?: string;
    leadName?: string;
    initialValue?: string | null;
  }>({
    isOpen: false,
    rowId: '',
    columnId: '',
  });

  const handleOpenProductModal = useCallback(
    (rowId: string, columnId: string, leadId?: string, leadName?: string, valStr?: string) => {
      setProductModal({
        isOpen: true,
        rowId,
        columnId,
        leadId,
        leadName,
        initialValue: valStr || null,
      });
    },
    [],
  );

  const handleOpenFollowUpModal = useCallback(
    (rowId: string, columnId: string, leadId?: string, leadName?: string, valStr?: string) => {
      if (!canSync) {
        toast.error('You do not have permission to edit follow-ups.');
        return;
      }
      setSheetFollowUpModal({
        isOpen: true,
        rowId,
        columnId,
        leadId,
        leadName,
        currentFollowUpAt: valStr || null,
      });
    },
    [canSync],
  );

  const [advanceModal, setAdvanceModal] = useState<{
    isOpen: boolean;
    rowId?: string;
    columnId?: string;
    leadId?: string;
    leadName?: string;
  }>({ isOpen: false });

  const handleOpenAdvanceModal = useCallback(
    (rowId: string, columnId: string, leadId?: string, leadName?: string) => {
      if (!leadId) {
        toast.error('This row is not linked to a CRM lead yet.');
        return;
      }
      setAdvanceModal({
        isOpen: true,
        rowId,
        columnId,
        leadId,
        leadName,
      });
    },
    [],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridViewportRef = useRef<HTMLDivElement>(null);
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

  // Exact height of grid based on active rows to prevent empty whitespace scrolling
  const exactGridHeight = useMemo(() => {
    return Math.max(360, filteredSortedRows.length * 36 + 32);
  }, [filteredSortedRows.length]);

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
      const targetCol = draft.columns.find((c) => c.id === columnId);
      if (targetCol) {
        const colKey = (targetCol.leadFieldKey || targetCol.id || targetCol.label).toLowerCase();
        const isAdv =
          targetCol.leadFieldKey === 'advanceAmount' ||
          targetCol.leadFieldKey === 'approvedAdvanceAmount' ||
          colKey.includes('advance amount') ||
          colKey.includes('approved advance amount') ||
          colKey.includes('advanceamount') ||
          colKey.includes('approvedadvanceamount') ||
          colKey.includes('approved advance') ||
          colKey.includes('advance payment');
        if (isAdv) {
          return;
        }
      }
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
      console.log('[Sheet Sync Started]', { changesCount: changes?.length || 0, changes });
      return syncSheetLeadChanges(draft.id, changes);
    },
    onSuccess: (result) => {
      console.log('[Sheet Sync Server Response]', result);
      if (!result) return;
      const applied = result.applied || [];
      const pending = result.pending || [];
      const blocked = result.blocked || [];

      console.log('[Diagnostic] Sync Started');
      if (applied.length === 0 && pending.length === 0 && blocked.length === 0) {
        toast('No changes detected to sync.', { icon: 'ℹ️' });
        return;
      }

      console.log('[Diagnostic] CRM Update Success');
      if (applied.length > 0 || pending.length > 0) {
        setDraft((currentDraft) => {
          if (!currentDraft) return currentDraft;
          console.log('[Diagnostic] Updated Lead Received');
          console.log('[Diagnostic] Replacing Row');
          const newRows = [...currentDraft.rows];
          
          const updateRowWithLead = (changeItem: any) => {
            if (!changeItem.lead || !changeItem.rowId) return;
            const lead = changeItem.lead;
            const rowIndex = newRows.findIndex(r => r.id === changeItem.rowId);
            if (rowIndex === -1) return;
            
            const rowToUpdate = { ...newRows[rowIndex], cells: { ...newRows[rowIndex].cells } };
            
            currentDraft.columns.forEach(col => {
              const colKey = (col.leadFieldKey || col.id || col.label).toLowerCase();
              if (colKey.includes('total amount') || colKey === 'totalamount') {
                rowToUpdate.cells[col.id] = lead.totalAmount ?? rowToUpdate.cells[col.id];
              } else if (colKey.includes('advance amount') || colKey === 'advanceamount' || colKey === 'approved advance amount') {
                rowToUpdate.cells[col.id] = lead.advanceAmount ?? rowToUpdate.cells[col.id];
              } else if (colKey.includes('balance amount') || colKey === 'balanceamount') {
                const total = lead.totalAmount || 0;
                const adv = lead.advanceAmount || 0;
                rowToUpdate.cells[col.id] = Math.max(0, total - adv);
              } else if (colKey.includes('expected revenue') || colKey === 'expectedrevenue') {
                rowToUpdate.cells[col.id] = lead.expectedRevenue ?? rowToUpdate.cells[col.id];
              } else if (colKey.includes('revenue contribution') || colKey === 'revenuecontribution') {
                rowToUpdate.cells[col.id] = lead.revenueContribution ?? rowToUpdate.cells[col.id];
              } else if (col.leadFieldKey === 'products' || colKey.includes('product')) {
                if (Array.isArray(lead.products)) {
                  rowToUpdate.cells[col.id] = lead.products.map((p: any) => `${p.productName || 'Product'} ×${p.quantity || 1}`).join(', ');
                }
              } else if (col.leadFieldKey === 'stageId' || colKey.includes('stage')) {
                if (lead.stage?.name) {
                  rowToUpdate.cells[col.id] = lead.stage.name;
                }
              } else if (colKey.includes('remarks') || colKey === 'lastremark') {
                rowToUpdate.cells[col.id] = lead.lastRemark || lead.remarks || rowToUpdate.cells[col.id];
              } else if (col.leadFieldKey === 'nextFollowUpAt' || colKey.includes('followup date') || colKey.includes('follow up date') || colKey.includes('next follow up')) {
                if (lead.nextFollowUpAt) {
                  rowToUpdate.cells[col.id] = lead.nextFollowUpAt.split('T')[0];
                }
              }
            });
            newRows[rowIndex] = rowToUpdate;
          };
          
          applied.forEach(updateRowWithLead);
          pending.forEach(updateRowWithLead);
          
          console.log('[Diagnostic] Refreshing Grid');
          console.log('[Diagnostic] Row Updated');
          return { ...currentDraft, rows: newRows };
        });
      }

      if (applied.length > 0) {
        toast.success(result.message || `Successfully updated ${applied.length} change(s) in CRM.`);
        void queryClient.invalidateQueries({ queryKey: ['leads'] });
        void queryClient.invalidateQueries({ queryKey: ['followups'] });
        void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        void queryClient.invalidateQueries({ queryKey: ['sheet', draft?.id] });
      }
      if (pending.length > 0) {
        toast(pending[0].message || `${pending.length} change(s) submitted and pending supervisor approval.`, { icon: '⏳' });
      }
      if (blocked.length > 0) {
        toast.error(blocked[0].message || `${blocked.length} change(s) could not be updated.`);
      }
      console.log('[Sheet Sync Finished]');
    },
    onError: (error: any) => {
      console.error('[Sheet Sync Error]', error);
      toast.error(error?.response?.data?.message || error?.message || 'Unable to sync leads');
    },
  });

  // Handle Master Dropdown Select (Stage, Source, User, Status, FollowUp Type)
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

  // Handle Opening Interactive Lead Identifiers (Name, Mobile, Email)
  const handleOpenLeadForm = useCallback(
    (leadId?: string | null, phone?: string | null, email?: string | null, leadName?: string | null) => {
      if (leadId) {
        setEditingFormLead({ id: leadId } as LeadListItem);
        return;
      }

      const matchingRows = (draft?.rows || []).filter((r) => {
        const m = r.metadata || {};
        if (phone && m.phone && m.phone.trim() === phone.trim()) return true;
        if (email && m.email && m.email.trim().toLowerCase() === email.trim().toLowerCase()) return true;
        if (leadName && m.leadName && m.leadName.trim().toLowerCase() === leadName.trim().toLowerCase()) return true;
        return false;
      });

      const matchedLeadIds = Array.from(new Set(matchingRows.map((r) => r.metadata?.leadId).filter(Boolean))) as string[];

      if (matchedLeadIds.length === 1) {
        setEditingFormLead({ id: matchedLeadIds[0] } as LeadListItem);
      } else if (matchedLeadIds.length > 1) {
        const candidateItems = matchedLeadIds.map((id) => {
          const rowMatch = matchingRows.find((r) => r.metadata?.leadId === id);
          const m = rowMatch?.metadata || {};
          return {
            id,
            name: m.leadName || 'Lead',
            phone: m.phone || '',
            email: m.email || '',
          } as LeadListItem;
        });
        setDuplicateCandidates(candidateItems);
      } else {
        toast.error('No matching CRM lead record found for this identifier.');
      }
    },
    [draft?.rows],
  );

  // Find & Replace Search Engine
  useEffect(() => {
    if (!searchState.query || !draft) {
      setSearchResults([]);
      setSearchIndex(0);
      return;
    }

    const q = searchState.matchCase ? searchState.query : searchState.query.toLowerCase();
    const results: SearchLocation[] = [];

    filteredSortedRows.forEach((row, rIdx) => {
      columns.forEach((col, cIdx) => {
        if (searchState.scope === 'column' && selectedCell && cIdx !== selectedCell.colIndex) return;
        if (searchState.scope === 'selection' && selectionRange) {
          const minRow = Math.min(selectionRange.startRowIdx, selectionRange.endRowIdx);
          const maxRow = Math.max(selectionRange.startRowIdx, selectionRange.endRowIdx);
          const minCol = Math.min(selectionRange.startColIdx, selectionRange.endColIdx);
          const maxCol = Math.max(selectionRange.startColIdx, selectionRange.endColIdx);
          if (rIdx < minRow || rIdx > maxRow || cIdx < minCol || cIdx > maxCol) return;
        }

        const val = String(row.cells?.[col.id] ?? '').trim();
        const target = searchState.matchCase ? val : val.toLowerCase();

        const isMatch = searchState.wholeCell ? target === q : target.includes(q);
        if (isMatch) {
          results.push({ rowIndex: rIdx, colIndex: cIdx, rowId: row.id, columnId: col.id });
        }
      });
    });

    setSearchResults(results);
    setSearchIndex(0);
  }, [columns, draft, filteredSortedRows, searchState, selectedCell, selectionRange]);

  // Focus & Scroll to Matched Cell
  const focusSearchLocation = useCallback(
    (index: number) => {
      if (searchResults.length === 0 || !searchResults[index]) return;
      const target = searchResults[index];
      setSelectedCell({ rowIndex: target.rowIndex, colIndex: target.colIndex, rowId: target.rowId, columnId: target.columnId });
      setSelectionRange({ startRowIdx: target.rowIndex, startColIdx: target.colIndex, endRowIdx: target.rowIndex, endColIdx: target.colIndex });

      if (gridViewportRef.current) {
        const topPx = target.rowIndex * 36;
        gridViewportRef.current.scrollTo({ top: Math.max(0, topPx - 100), behavior: 'smooth' });
      }
    },
    [searchResults],
  );

  const handleFindNextMatch = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (searchIndex + 1) % searchResults.length;
    setSearchIndex(nextIdx);
    focusSearchLocation(nextIdx);
  };

  const handleFindPrevMatch = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (searchIndex - 1 + searchResults.length) % searchResults.length;
    setSearchIndex(prevIdx);
    focusSearchLocation(prevIdx);
  };

  const handleReplaceCurrentMatch = (replacement: string) => {
    if (searchResults.length === 0 || !searchResults[searchIndex] || !editable) return;
    const target = searchResults[searchIndex];
    updateCell(target.rowId, target.columnId, replacement);
    toast.success('Replaced 1 match');
  };

  const handleReplaceAllMatches = (replacement: string) => {
    if (searchResults.length === 0 || !draft || !editable) return;
    const updatedRows = [...draft.rows];
    searchResults.forEach((target) => {
      const rowIdx = updatedRows.findIndex((r) => r.id === target.rowId);
      if (rowIdx !== -1) {
        updatedRows[rowIdx] = {
          ...updatedRows[rowIdx],
          cells: {
            ...updatedRows[rowIdx].cells,
            [target.columnId]: replacement,
          },
        };
      }
    });

    remember({ ...draft, rows: updatedRows });
    toast.success(`Replaced all ${searchResults.length} occurrence(s)`);
  };

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
      if (editingCell || !draft) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFindReplaceMode('find');
        setFindReplaceOpen(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setFindReplaceMode('replace');
        setFindReplaceOpen(true);
        return;
      }

      if (!selectedCell) return;

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
          const targetCol = columns[colIdx];
          const targetColKey = (targetCol.leadFieldKey || targetCol.id || targetCol.label).toLowerCase();
          const isAdv =
            targetCol.leadFieldKey === 'advanceAmount' ||
            targetCol.leadFieldKey === 'approvedAdvanceAmount' ||
            targetColKey.includes('advance amount') ||
            targetColKey.includes('approved advance amount') ||
            targetColKey.includes('advanceamount') ||
            targetColKey.includes('approvedadvanceamount') ||
            targetColKey.includes('approved advance') ||
            targetColKey.includes('advance payment');

          if (isAdv) {
            const row = filteredSortedRows[rowIdx];
            const leadId = row?.metadata?.leadId;
            handleOpenAdvanceModal(
              row.id,
              targetCol.id,
              leadId || undefined,
              row.metadata?.leadName || (row.cells?.name ? String(row.cells.name) : undefined),
            );
          } else {
            const row = filteredSortedRows[rowIdx];
            const val = String(row?.cells?.[columns[colIdx].id] ?? '');
            setEditingCell(selectedCell);
            setEditingValue(val);
          }
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [columns, draft, editable, editingCell, filteredSortedRows, handleCopy, handleCut, handlePaste, handleRedo, handleUndo, remember, selectedCell, selectionRange, updateCell]);

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

  const hasUnsyncedChanges = useMemo(() => {
    if (!draft) return false;
    const originalRows = draft.originalSnapshot?.rows || [];
    const originalByRow = new Map(originalRows.map((row) => [row.id, row]));
    return draft.rows.some((row) => {
      const original = originalByRow.get(row.id);
      return draft.columns.some((column) => {
        const oldValue = original?.cells?.[column.id];
        const newValue = row.cells?.[column.id];
        return String(oldValue ?? '') !== String(newValue ?? '');
      });
    });
  }, [draft]);

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
          onToggleFindReplace={() => {
            setFindReplaceMode('find');
            setFindReplaceOpen(!findReplaceOpen);
          }}
          onToggleFilter={() => setFilterText(filterText ? '' : ' ')}
          hasFilterActive={Boolean(filterText.trim())}
          onToggleFreezeHeader={() => setIsHeaderFrozen(!isHeaderFrozen)}
          isHeaderFrozen={isHeaderFrozen}
          onSyncLeads={() => {
            if (!hasUnsyncedChanges) {
              toast('No changes to sync.', { icon: 'ℹ️' });
              return;
            }
            syncMutation.mutate(undefined);
          }}
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
            ref={gridViewportRef}
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
              <div style={{ height: exactGridHeight, position: 'relative' }}>
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
                            const valStr = String(value ?? '').trim();
                            const cellStyle = applyCellStyle(draft.formatting, row.id, column.id);

                            const colKey = (column.leadFieldKey || column.id || column.label).toLowerCase();
                            const isStageCol = colKey.includes('stage');
                            const isSourceCol = colKey.includes('source');
                            const isUserCol = colKey.includes('assigned') || colKey.includes('user');
                            const isFollowupTypeCol = colKey.includes('followup type') || colKey.includes('follow-up type');
                            const isProductsCol = column.leadFieldKey === 'products' || colKey.includes('product');
                            const isFollowupDateCol =
                              column.leadFieldKey === 'nextFollowupDate' ||
                              column.leadFieldKey === 'nextFollowUpAt' ||
                              colKey.includes('next follow up') ||
                              colKey.includes('next followup') ||
                              colKey.includes('next follow-up') ||
                              colKey.includes('followup date') ||
                              colKey.includes('follow-up date') ||
                              colKey.includes('follow up date') ||
                              colKey.includes('nextfollowupat') ||
                              colKey.includes('nextfollowup') ||
                              colKey.includes('scheduled');

                            const isAdvanceCol =
                              column.leadFieldKey === 'advanceAmount' ||
                              column.leadFieldKey === 'approvedAdvanceAmount' ||
                              colKey.includes('advance amount') ||
                              colKey.includes('approved advance amount') ||
                              colKey.includes('advanceamount') ||
                              colKey.includes('approvedadvanceamount') ||
                              colKey.includes('approved advance') ||
                              colKey.includes('advance payment');

                            const isNameCol = column.leadFieldKey === 'name' || colKey.includes('name');
                            const isPhoneCol = column.leadFieldKey === 'phone' || colKey.includes('phone') || colKey.includes('mobile');
                            const isEmailCol = column.leadFieldKey === 'email' || colKey.includes('email');

                            const isLeadIdentifier = (isNameCol || isPhoneCol || isEmailCol) && valStr.length > 0;
                            const leadId = row.metadata?.leadId;

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
                                    if (isProductsCol) {
                                      handleOpenProductModal(
                                        row.id,
                                        column.id,
                                        leadId || undefined,
                                        row.metadata?.leadName || (row.cells?.name ? String(row.cells.name) : undefined),
                                        valStr,
                                      );
                                    } else if (isFollowupDateCol) {
                                      handleOpenFollowUpModal(
                                        row.id,
                                        column.id,
                                        leadId || undefined,
                                        row.metadata?.leadName || (row.cells?.name ? String(row.cells.name) : undefined),
                                        valStr,
                                      );
                                    } else if (isAdvanceCol) {
                                      handleOpenAdvanceModal(
                                        row.id,
                                        column.id,
                                        leadId || undefined,
                                        row.metadata?.leadName || (row.cells?.name ? String(row.cells.name) : undefined),
                                      );
                                    } else {
                                      setEditingCell({ rowIndex: actualRowIdx, colIndex: colIdx, rowId: row.id, columnId: column.id });
                                      setEditingValue(valStr);
                                    }
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
                                ) : isFollowupTypeCol ? (
                                  <div className="relative flex items-center">
                                    <button
                                      onClick={() => setActiveDropdownCell(activeDropdownCell?.rowId === row.id && activeDropdownCell?.columnId === column.id ? null : { rowId: row.id, columnId: column.id, type: 'followupType' })}
                                      disabled={!editable}
                                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium border flex items-center justify-between w-full ${
                                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
                                      }`}
                                    >
                                      <span className="truncate">{valStr || 'Follow-up Type'}</span>
                                      <ChevronDown className="w-3 h-3 opacity-60 ml-1" />
                                    </button>

                                    {activeDropdownCell?.rowId === row.id && activeDropdownCell?.columnId === column.id && (
                                      <SearchableDropdownMenu
                                        title="Select Follow-up Type"
                                        options={FOLLOW_UP_TYPES}
                                        selectedValue={valStr}
                                        onSelect={(opt) => handleDropdownSelect('followupType', opt, row.id, column.id, row.metadata?.leadId)}
                                        onClose={() => setActiveDropdownCell(null)}
                                        isLight={isLight}
                                      />
                                    )}
                                  </div>
                                ) : isLeadIdentifier ? (
                                  <div className="flex items-center space-x-1.5 truncate max-w-full">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenLeadForm(
                                          leadId,
                                          isPhoneCol ? valStr : row.metadata?.phone,
                                          isEmailCol ? valStr : row.metadata?.email,
                                          isNameCol ? valStr : row.metadata?.leadName,
                                        );
                                      }}
                                      className="text-emerald-500 hover:text-emerald-400 font-semibold hover:underline truncate max-w-full text-left flex items-center space-x-1 group/link"
                                      title="Open Lead Form"
                                    >
                                      <span className="truncate">{valStr}</span>
                                      <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover/link:opacity-100 transition-opacity" />
                                    </button>
                                  </div>
                                 ) : isProductsCol ? (
                                   <button
                                     type="button"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleOpenProductModal(
                                         row.id,
                                         column.id,
                                         leadId || undefined,
                                         row.metadata?.leadName || (row.cells?.name ? String(row.cells.name) : undefined),
                                         valStr,
                                       );
                                     }}
                                     className="w-full text-left truncate font-mono text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer flex items-center justify-between"
                                     title="Click to select products"
                                   >
                                     <span className="truncate">{valStr || 'Select Products'}</span>
                                     <ChevronDown className="w-3 h-3 opacity-60 ml-1 shrink-0" />
                                   </button>
                                 ) : isFollowupDateCol ? (
                                   <button
                                     type="button"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleOpenFollowUpModal(
                                         row.id,
                                         column.id,
                                         leadId || undefined,
                                         row.metadata?.leadName || (row.cells?.name ? String(row.cells.name) : undefined),
                                         valStr,
                                       );
                                     }}
                                     className="w-full text-left truncate font-mono text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                                     title="Click to schedule follow-up in CRM"
                                   >
                                     {formatFollowupDisplay(valStr)}
                                   </button>
                                 ) : isAdvanceCol ? (
                                   <button
                                     type="button"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleOpenAdvanceModal(
                                         row.id,
                                         column.id,
                                         leadId || undefined,
                                         row.metadata?.leadName || (row.cells?.name ? String(row.cells.name) : undefined),
                                       );
                                     }}
                                     className="w-full text-left truncate font-mono text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer flex items-center justify-between"
                                     title="Click to request advance payment approval"
                                   >
                                     <span className="truncate">{valStr || '0'}</span>
                                     <ChevronDown className="w-3 h-3 opacity-60 ml-1 shrink-0" />
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

        {/* Enhanced Find & Replace Modal */}
        <FindReplaceModal
          isOpen={findReplaceOpen}
          initialMode={findReplaceMode}
          onClose={() => setFindReplaceOpen(false)}
          onSearchChange={setSearchState}
          onFindNext={handleFindNextMatch}
          onFindPrev={handleFindPrevMatch}
          onReplace={handleReplaceCurrentMatch}
          onReplaceAll={handleReplaceAllMatches}
          matchCount={searchResults.length}
          currentMatchIndex={searchIndex}
          isLight={isLight}
        />

        {/* Duplicate Match Resolution Modal */}
        <DuplicateMatchModal
          isOpen={duplicateCandidates.length > 0}
          matchingLeads={duplicateCandidates}
          onSelectLead={(lead) => {
            setEditingFormLead(lead);
            setDuplicateCandidates([]);
          }}
          onClose={() => setDuplicateCandidates([])}
          isLight={isLight}
        />

        {/* Integrated CRM Lead Create/Edit Form Drawer */}
        {editingFormLead && (
          <LeadFormDrawer
            isOpen={Boolean(editingFormLead)}
            mode="edit"
            lead={editingFormLead}
            onClose={() => {
              setEditingFormLead(null);
              void queryClient.invalidateQueries({ queryKey: ['sheet', activeSheetId] });
              void queryClient.invalidateQueries({ queryKey: ['sheets'] });
            }}
          />
        )}

        {/* CRM Follow-up Scheduling Modal — uses same PUT /leads/:id flow as All Leads */}
        <SheetFollowUpModal
          isOpen={sheetFollowUpModal.isOpen}
          leadId={sheetFollowUpModal.leadId}
          leadName={sheetFollowUpModal.leadName}
          currentFollowUpAt={sheetFollowUpModal.currentFollowUpAt}
          onClose={() => setSheetFollowUpModal((prev) => ({ ...prev, isOpen: false }))}
          onSaved={(newIsoDate) => {
            updateCell(sheetFollowUpModal.rowId, sheetFollowUpModal.columnId, newIsoDate);
          }}
        />

        {/* CRM Product Selector Modal */}
        <SheetProductModal
          isOpen={productModal.isOpen}
          leadId={productModal.leadId}
          leadName={productModal.leadName}
          initialValue={productModal.initialValue}
          onClose={() => setProductModal((prev) => ({ ...prev, isOpen: false }))}
          onSaved={(formattedProducts, newTotalAmount) => {
            updateCell(productModal.rowId, productModal.columnId, formattedProducts);
            const totalAmountCol = columns.find(
              (c) => c.leadFieldKey === 'totalAmount' || (c.leadFieldKey || c.id || '').toLowerCase().includes('total amount'),
            );
            if (totalAmountCol) {
              updateCell(productModal.rowId, totalAmountCol.id, newTotalAmount);
            }
            const balanceAmountCol = columns.find(
              (c) => c.leadFieldKey === 'balanceAmount' || (c.leadFieldKey || c.id || '').toLowerCase().includes('balance amount'),
            );
            if (balanceAmountCol) {
              const advCol = columns.find(
                (c) => c.leadFieldKey === 'advanceAmount' || (c.leadFieldKey || c.id || '').toLowerCase().includes('advance amount'),
              );
              const currentRow = draft?.rows.find((r) => r.id === productModal.rowId);
              const advVal = advCol ? Number(currentRow?.cells?.[advCol.id] || 0) : 0;
              const newBalance = Math.max(0, newTotalAmount - advVal);
              updateCell(productModal.rowId, balanceAmountCol.id, newBalance);
            }
          }}
        />

        {/* Advance Payment Modal — exact same popup as All Leads module */}
        <AdvancePaymentModal
          isOpen={advanceModal.isOpen}
          leadId={advanceModal.leadId}
          mode="edit"
          currentUser={user}
          onClose={() => setAdvanceModal((prev) => ({ ...prev, isOpen: false }))}
          onSuccess={() => {
            toast.success('Advance payment request submitted to supervisor for approval.');
            void queryClient.invalidateQueries({ queryKey: ['leads'] });
            void queryClient.invalidateQueries({ queryKey: ['sheet', draft?.id] });
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default SheetsPage;
