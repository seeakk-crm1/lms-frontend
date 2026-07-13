import React, { memo, useMemo } from 'react';
import { CalendarDays, FileUp, ListChecks } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import type { LeadDynamicField } from '../../../modules/admin/lead-dynamics/types';
import { FieldEditBadge } from './FieldEditBadge';
import { LeadFieldEditsResponse } from './useLeadFieldEdits';

interface DynamicFieldRendererProps {
  field: LeadDynamicField;
  value: string | string[];
  onChange: (fieldId: string, value: string | string[]) => void;
  fieldEdits?: LeadFieldEditsResponse;
}

const baseInputClassName =
  'w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({ field, value, onChange, fieldEdits }) => {
  const isArrayValue = Array.isArray(value);
  const normalizedValue = isArrayValue ? '' : value || '';
  const checkboxValue = isArrayValue ? value : [];

  const options = useMemo(
    () =>
      (field.options || []).map((option) => ({
        value: option.value,
        label: option.value,
      })),
    [field.options],
  );

  const summary = fieldEdits?.summaries.find(s => s.fieldKey === field.id);
  const histories = fieldEdits?.histories.filter(h => h.fieldKey === field.id) || [];
  const hasHighlight = summary && summary.editCount > 0;

  const label = (
    <label className="mb-2 flex items-center text-sm font-black text-gray-900">
      <span>{field.name}</span>
      {field.isRequired ? <span className="text-[10px] uppercase tracking-widest text-rose-500 ml-2">Required</span> : null}
      <FieldEditBadge summary={summary} histories={histories} fieldName={field.name} />
    </label>
  );

  const wrapperClass = hasHighlight ? "relative rounded-2xl ring-2 ring-red-400 bg-red-50/20 p-3 -mx-3 -mt-3 transition-all" : "";

  switch (field.inputType) {
    case 'TEXTAREA':
      return (
        <div className={wrapperClass}>
          {label}
          <textarea
            rows={4}
            value={normalizedValue}
            onChange={(event) => onChange(field.id, event.target.value)}
            className={`${baseInputClassName} resize-none`}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        </div>
      );

    case 'NUMBER':
      return (
        <div className={wrapperClass}>
          {label}
          <input
            type="number"
            min="0"
            step="any"
            value={normalizedValue}
            onChange={(event) => onChange(field.id, event.target.value)}
            className={baseInputClassName}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        </div>
      );

    case 'DATE':
      return (
        <div className={wrapperClass}>
          {label}
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={normalizedValue}
              onChange={(event) => onChange(field.id, event.target.value)}
              className={baseInputClassName}
            />
          </div>
        </div>
      );
    case 'SELECT':
    case 'RADIO':
      return (
        <div className={wrapperClass}>
          {label}
          <SearchableSelect
            name={field.id}
            value={normalizedValue}
            options={options}
            placeholder={`Select ${field.name.toLowerCase()}`}
            onChange={(event) => onChange(field.id, event.target.value)}
          />
        </div>
      );

    case 'CHECKBOX':
      return (
        <div className={wrapperClass}>
          {label}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
              <ListChecks className="h-4 w-4" />
              <span>Multi Select</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {field.options.map((option) => {
                const checked = checkboxValue.includes(option.value);
                return (
                  <label
                    key={`${field.id}-${option.value}`}
                    className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all ${
                      checked
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const nextValues = checked
                          ? checkboxValue.filter((item) => item !== option.value)
                          : [...checkboxValue, option.value];
                        onChange(field.id, nextValues);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>{option.value}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      );

    case 'FILE':
      return (
        <div className={wrapperClass}>
          {label}
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-700">
              <FileUp className="h-4 w-4 text-emerald-500" />
              <span>Paste a hosted file URL</span>
            </div>
            <input
              type="url"
              value={normalizedValue}
              onChange={(event) => onChange(field.id, event.target.value)}
              className={baseInputClassName}
              placeholder="https://example.com/proposal.pdf"
            />
            <p className="mt-2 text-xs font-semibold text-gray-500">
              The current backend stores file fields as HTTP/HTTPS URLs.
            </p>
          </div>
        </div>
      );

    case 'TEXT':
    default:
      return (
        <div className={wrapperClass}>
          {label}
          <input
            type="text"
            value={normalizedValue}
            onChange={(event) => onChange(field.id, event.target.value)}
            className={baseInputClassName}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        </div>
      );
  }
};

export default memo(DynamicFieldRenderer);
