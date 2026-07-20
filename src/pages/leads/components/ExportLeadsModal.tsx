import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, CheckSquare, Square, Download, FileSpreadsheet } from 'lucide-react';
import { useLeadStore } from '../../../store/leadStore';

interface ExportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (selectedFields: string[]) => void;
  onImportToSheets?: (selectedFields: string[]) => void;
  isExporting: boolean;
  isImportingToSheets?: boolean;
  exportFormatLabel?: string;
}

interface FieldDefinition {
  id: string;
  label: string;
  mandatory?: boolean;
}

interface FieldGroup {
  name: string;
  fields: FieldDefinition[];
}

const STATIC_FIELD_GROUPS: FieldGroup[] = [
  {
    name: 'Basic Information',
    fields: [
      { id: 'sl_no', label: 'SL No.' },
      { id: 'name', label: 'Lead Name', mandatory: true },
      { id: 'companyName', label: 'Company Name' },
      { id: 'address', label: 'Address' },
    ],
  },
  {
    name: 'Contact Information',
    fields: [
      { id: 'phone', label: 'Mobile Number' },
      { id: 'email', label: 'Email' },
    ],
  },
  {
    name: 'Pipeline & Assignment',
    fields: [
      { id: 'stage', label: 'Current Lead Stage' },
      { id: 'lifecycle', label: 'Lead Lifecycle' },
      { id: 'source', label: 'Lead Source' },
      { id: 'assignedUser', label: 'Assigned User' },
      { id: 'reportingOffice', label: 'Reporting Office' },
    ],
  },
  {
    name: 'Revenue',
    fields: [
      { id: 'expectedRevenue', label: 'Expected Revenue Contribution' },
      { id: 'totalAmount', label: 'Total Amount' },
      { id: 'advanceAmount', label: 'Approved Advance Amount' },
      { id: 'balanceAmount', label: 'Balance Amount' },
      { id: 'products', label: 'Products' },
    ],
  },
  {
    name: 'Follow-up',
    fields: [
      { id: 'lastRemark', label: 'Last Remark' },
      { id: 'remarks', label: 'Remarks' },
      { id: 'nextFollowUpAt', label: 'Next Follow Up At' },
    ],
  },
  {
    name: 'Dates & Meta',
    fields: [
      { id: 'createdBy', label: 'Created By' },
      { id: 'createdAt', label: 'Created Date' },
      { id: 'updatedAt', label: 'Updated Date' },
      { id: 'isClosed', label: 'Is Closed' },
      { id: 'isLOB', label: 'Is LOB' },
      { id: 'archivedAt', label: 'Archived At' },
    ],
  },
];

const LOCAL_STORAGE_KEY = 'seeakk_export_selected_fields';

export const ExportLeadsModal: React.FC<ExportLeadsModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onImportToSheets,
  isExporting,
  isImportingToSheets = false,
  exportFormatLabel = '',
}) => {
  const dynamicFields = useLeadStore((state: any) => state.dynamicFields);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [fieldOrder, setFieldOrder] = useState<Record<string, number>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const fieldGroups = useMemo(() => {
    const groups = [...STATIC_FIELD_GROUPS];
    if (dynamicFields && dynamicFields.length > 0) {
      groups.push({
        name: 'Advanced Fields',
        fields: dynamicFields.map((df: any) => ({
          id: df.id,
          label: df.name,
        })),
      });
    }
    return groups;
  }, [dynamicFields]);

  const allFieldIds = useMemo(() => {
    return fieldGroups.flatMap((g) => g.fields.map((f) => f.id));
  }, [fieldGroups]);

  useEffect(() => {
    if (isOpen) {
      setValidationError(null);
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const initialSet = new Set<string>(parsed);
            const initialOrder: Record<string, number> = {};
            
            fieldGroups.forEach((group) => {
              group.fields.forEach((field) => {
                if (field.mandatory && !initialSet.has(field.id)) {
                  initialSet.add(field.id);
                  parsed.push(field.id);
                }
              });
            });

            let counter = 1;
            parsed.forEach((id: string) => {
              if (initialSet.has(id)) {
                initialOrder[id] = counter++;
              }
            });

            setSelectedFields(initialSet);
            setFieldOrder(initialOrder);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
      
      const initialSet = new Set(allFieldIds);
      const initialOrder: Record<string, number> = {};
      allFieldIds.forEach((id, index) => {
        initialOrder[id] = index + 1;
      });
      setSelectedFields(initialSet);
      setFieldOrder(initialOrder);
    }
  }, [isOpen, allFieldIds, fieldGroups]);

  const handleToggle = (id: string, mandatory?: boolean) => {
    if (mandatory) return;
    const next = new Set(selectedFields);
    const nextOrder = { ...fieldOrder };
    
    if (next.has(id)) {
      next.delete(id);
      delete nextOrder[id];
    } else {
      next.add(id);
      const currentOrders = Object.values(nextOrder).filter(val => typeof val === 'number' && !isNaN(val));
      const maxOrder = currentOrders.length > 0 ? Math.max(...currentOrders) : 0;
      nextOrder[id] = maxOrder + 1;
    }
    setSelectedFields(next);
    setFieldOrder(nextOrder);
    setValidationError(null);
  };

  const handleOrderChange = (id: string, value: string) => {
    const nextOrder = { ...fieldOrder };
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      delete nextOrder[id];
    } else {
      nextOrder[id] = num;
    }
    setFieldOrder(nextOrder);
    setValidationError(null);
  };

  const handleSelectAll = () => {
    const nextSet = new Set(allFieldIds);
    const nextOrder: Record<string, number> = {};
    allFieldIds.forEach((id, index) => {
      nextOrder[id] = index + 1;
    });
    setSelectedFields(nextSet);
    setFieldOrder(nextOrder);
    setValidationError(null);
  };

  const handleClearAll = () => {
    const nextSet = new Set<string>();
    const nextOrder: Record<string, number> = {};
    let counter = 1;
    fieldGroups.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.mandatory) {
          nextSet.add(field.id);
          nextOrder[field.id] = counter++;
        }
      });
    });
    setSelectedFields(nextSet);
    setFieldOrder(nextOrder);
    setValidationError(null);
  };

  const getOrderedSelection = () => {
    if (selectedFields.size === 0) return;
    
    const usedOrders = new Set<number>();
    for (const id of Array.from(selectedFields)) {
      const order = fieldOrder[id];
      if (order === undefined || isNaN(order) || order <= 0) {
        setValidationError('Every selected field must have a valid positive order number.');
        return;
      }
      if (usedOrders.has(order)) {
        setValidationError('Duplicate order numbers are not allowed.');
        return;
      }
      usedOrders.add(order);
    }
    
    setValidationError(null);

    const orderedSelection = Array.from(selectedFields).sort((a, b) => {
      return (fieldOrder[a] || 0) - (fieldOrder[b] || 0);
    });
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orderedSelection));
    return orderedSelection;
  };

  const handleExportClick = () => {
    const orderedSelection = getOrderedSelection();
    if (!orderedSelection) return;
    onExport(orderedSelection);
  };

  const handleImportToSheetsClick = () => {
    const orderedSelection = getOrderedSelection();
    if (!orderedSelection || !onImportToSheets) return;
    onImportToSheets(orderedSelection);
  };

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return fieldGroups;
    const lowerSearch = searchTerm.toLowerCase();
    return fieldGroups
      .map((group) => ({
        ...group,
        fields: group.fields.filter((f) => f.label.toLowerCase().includes(lowerSearch)),
      }))
      .filter((group) => group.fields.length > 0);
  }, [fieldGroups, searchTerm]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 shrink-0 bg-white">
              <div>
                <h3 className="text-xl font-black text-gray-900">Export Leads</h3>
                <p className="mt-1 text-sm text-gray-500">Select the fields you want to include in the exported file.</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-200 p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 px-6 py-3 shrink-0">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <CheckSquare className="h-4 w-4" /> Select All
                </button>
                <div className="h-4 w-px bg-gray-300"></div>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Square className="h-4 w-4" /> Clear All
                </button>
              </div>
            </div>

            {/* Field List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 bg-gray-50/30">
              {filteredGroups.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p>No fields found matching "{searchTerm}"</p>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.name} className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">{group.name}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {group.fields.map((field) => {
                        const isSelected = selectedFields.has(field.id);
                        return (
                          <label
                            key={field.id}
                            className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50/50 shadow-sm shadow-blue-500/10'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            } ${field.mandatory ? 'opacity-70 !cursor-not-allowed' : ''}`}
                          >
                            <div className="flex h-5 items-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={field.mandatory}
                                onChange={() => handleToggle(field.id, field.mandatory)}
                                className={`h-4 w-4 rounded text-blue-600 focus:ring-blue-500 ${
                                  field.mandatory ? 'cursor-not-allowed' : 'cursor-pointer'
                                } transition-transform group-active:scale-90`}
                              />
                            </div>
                            <div className="flex flex-col flex-1">
                              <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                {field.label}
                              </span>
                              {field.mandatory && (
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide mt-0.5">Required</span>
                              )}
                            </div>
                            <div className="flex items-center ml-auto pl-2">
                              <input 
                                type="number"
                                min="1"
                                disabled={!isSelected}
                                value={fieldOrder[field.id] || ''}
                                onChange={(e) => handleOrderChange(field.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="-"
                                className="w-12 sm:w-14 text-center rounded-md border border-gray-300 py-1 text-xs font-semibold text-gray-700 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                              />
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-white px-6 py-4 shrink-0 flex flex-col gap-3">
              {validationError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 text-center font-medium">
                  {validationError}
                </div>
              )}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-500">
                  {selectedFields.size} {selectedFields.size === 1 ? 'field' : 'fields'} selected
                </p>
                <div className="flex w-full sm:w-auto items-center gap-3">
                  <button
                    onClick={onClose}
                  className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  Cancel
                </button>
                {onImportToSheets && (
                  <button
                    onClick={handleImportToSheetsClick}
                    disabled={selectedFields.size === 0 || isExporting || isImportingToSheets}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-black text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImportingToSheets ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-700" />
                        Importing...
                      </span>
                    ) : (
                      <>
                        <FileSpreadsheet className="h-4 w-4" />
                        Import to Sheets
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleExportClick}
                  disabled={selectedFields.size === 0 || isExporting || isImportingToSheets}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-black text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </span>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export {exportFormatLabel}
                    </>
                  )}
                </button>
              </div>
            </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
