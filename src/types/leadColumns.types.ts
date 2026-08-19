export interface ColumnDefinition {
  key: string;
  label: string;
  category: 'STANDARD' | 'CUSTOM';
  isRequired?: boolean;
  isSortable?: boolean;
  fieldId?: string;
  inputType?: string;
}

export const STANDARD_TABLE_COLUMNS: ColumnDefinition[] = [
  { key: 'lead_name', label: 'Lead Name', category: 'STANDARD', isRequired: true },
  { key: 'next_followup', label: 'Next Follow-Up', category: 'STANDARD' },
  { key: 'assigned_to', label: 'Assigned To', category: 'STANDARD' },
  { key: 'lead_stage', label: 'Stage', category: 'STANDARD' },
  { key: 'last_remark', label: 'Last Remark', category: 'STANDARD', isSortable: true },
  { key: 'total_amount', label: 'Total Amount', category: 'STANDARD', isSortable: true },
  { key: 'advance_amount', label: 'Advance Amount', category: 'STANDARD', isSortable: true },
  { key: 'lead_lifecycle', label: 'Lead Life Cycle', category: 'STANDARD' },
  { key: 'source', label: 'Source', category: 'STANDARD' },
  { key: 'office', label: 'Office Location', category: 'STANDARD' },
  { key: 'created_at', label: 'Created Date', category: 'STANDARD' },
  { key: 'updated_at', label: 'Updated Date', category: 'STANDARD' },
  { key: 'status', label: 'Status', category: 'STANDARD' },
];

export const DEFAULT_VISIBLE_COLUMN_KEYS: string[] = [
  'lead_name',
  'next_followup',
  'assigned_to',
  'lead_stage',
  'last_remark',
  'total_amount',
  'advance_amount',
  'lead_lifecycle',
  'source',
  'created_at',
];
