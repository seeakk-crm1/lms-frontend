import api from './api';

export type SheetColumn = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'dropdown' | 'checkbox' | 'formula';
  width?: number;
  hidden?: boolean;
  sourceField?: string;
  leadFieldKey?: string | null;
};

export type SheetRow = {
  id: string;
  cells: Record<string, unknown>;
  metadata?: {
    leadId?: string | null;
    leadName?: string | null;
    leadNumber?: string | null;
  };
};

export type SheetFormatting = {
  frozenRows?: number;
  frozenColumns?: number;
  alternateRows?: boolean;
  cells?: Record<string, Record<string, unknown>>;
  rows?: Record<string, Record<string, unknown>>;
  columns?: Record<string, Record<string, unknown>>;
};

export type Sheet = {
  id: string;
  name: string;
  description?: string | null;
  source: string;
  columns: SheetColumn[];
  rows: SheetRow[];
  formatting?: SheetFormatting | null;
  metadata?: Record<string, unknown> | null;
  originalSnapshot?: { columns?: SheetColumn[]; rows?: SheetRow[] } | null;
  rowCount: number;
  columnCount: number;
  createdAt: string;
  updatedAt: string;
  lastAutoSavedAt?: string | null;
};

export type SheetVersion = {
  id: string;
  version: number;
  name: string;
  createdAt: string;
  createdBy?: { id: string; name?: string | null } | null;
};

export const listSheets = async (params: { search?: string; page?: number; limit?: number }) => {
  const response = await api.get('/sheets', { params });
  return response.data;
};

export const createSheet = async (payload: Partial<Sheet> & { name: string }) => {
  const response = await api.post('/sheets', payload);
  return response.data.data as Sheet;
};

export const createSheetFromLeadExport = async (payload: {
  name?: string;
  fields: string[];
  filters: Record<string, unknown>;
}) => {
  const response = await api.post('/sheets/lead-export', payload);
  return response.data.data as Sheet;
};

export const importSheetFile = async (file: File, name?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (name) formData.append('name', name);
  const response = await api.post('/sheets/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data as Sheet;
};

export const getSheet = async (id: string) => {
  const response = await api.get(`/sheets/${id}`);
  return response.data.data as Sheet;
};

export const saveSheet = async (id: string, payload: Partial<Sheet> & { autoSave?: boolean }) => {
  const response = await api.put(`/sheets/${id}`, payload);
  return response.data.data.sheet as Sheet;
};

export const duplicateSheet = async (id: string, name?: string) => {
  const response = await api.post(`/sheets/${id}/duplicate`, { name });
  return response.data.data as Sheet;
};

export const deleteSheet = async (id: string) => {
  const response = await api.delete(`/sheets/${id}`);
  return response.data;
};

export const listSheetVersions = async (id: string) => {
  const response = await api.get(`/sheets/${id}/versions`);
  return response.data.data as SheetVersion[];
};

export const restoreSheetVersion = async (id: string, versionId: string) => {
  const response = await api.post(`/sheets/${id}/versions/${versionId}/restore`);
  return response.data.data as Sheet;
};

export const exportSheet = async (id: string, format: 'csv' | 'xlsx') => {
  const response = await api.get(`/sheets/${id}/export`, { params: { format }, responseType: 'blob' });
  const blob = new Blob([response.data], {
    type: format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv;charset=utf-8;',
  });
  const disposition = response.headers['content-disposition'] || '';
  const match = /filename="([^"]+)"/.exec(disposition);
  const filename = match?.[1] || `sheet-export.${format}`;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return true;
};

export const syncSheetLeadChanges = async (id: string, changes: Array<Record<string, unknown>>) => {
  const response = await api.post(`/sheets/${id}/sync-leads`, { changes });
  return response.data.data;
};
