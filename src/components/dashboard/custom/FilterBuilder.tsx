import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Filter, Sparkles, AlertCircle } from 'lucide-react';
import type { FilterConditionInput } from '../../../services/customPipelines.api';

interface FilterBuilderProps {
  conditions: FilterConditionInput[];
  filterLogic: 'AND' | 'OR';
  onChange: (conditions: FilterConditionInput[], filterLogic: 'AND' | 'OR') => void;
  stages?: Array<{ id: string; name: string }>;
  substages?: Array<{ id: string; name: string; leadStageId: string }>;
  sources?: Array<{ id: string; name: string }>;
  lifecycles?: Array<{ id: string; name: string }>;
  users?: Array<{ id: string; name: string }>;
  offices?: Array<{ id: string; name: string }>;
  departments?: Array<{ id: string; name: string }>;
  dynamicFields?: Array<{ id: string; name: string; inputType: string; options?: Array<{ value: string }> }>;
}

export const STANDARD_FIELDS = [
  { group: 'Standard Fields', id: 'name', label: 'Lead Name', type: 'text' },
  { group: 'Standard Fields', id: 'email', label: 'Email Address', type: 'text' },
  { group: 'Standard Fields', id: 'phone', label: 'Phone Number', type: 'text' },
  { group: 'Standard Fields', id: 'companyName', label: 'Company Name', type: 'text' },
  { group: 'Standard Fields', id: 'address', label: 'Address', type: 'text' },
  { group: 'Standard Fields', id: 'stageId', label: 'Lead Stage', type: 'stage_select' },
  { group: 'Standard Fields', id: 'substageId', label: 'Lead Substage', type: 'substage_select' },
  { group: 'Standard Fields', id: 'sourceId', label: 'Lead Source', type: 'source_select' },
  { group: 'Standard Fields', id: 'lifecycleId', label: 'Lead Lifecycle', type: 'lifecycle_select' },
  { group: 'Standard Fields', id: 'assignedToId', label: 'Assigned User', type: 'user_select' },
  { group: 'Standard Fields', id: 'officeId', label: 'Office', type: 'office_select' },
  { group: 'Standard Fields', id: 'departmentId', label: 'Department', type: 'department_select' },
  { group: 'Standard Fields', id: 'leadStatus', label: 'Lead Status', type: 'status_select' },
  { group: 'Standard Fields', id: 'isClosed', label: 'Is Closed', type: 'boolean' },
  { group: 'Standard Fields', id: 'isLOB', label: 'Is LOB', type: 'boolean' },
  { group: 'Standard Fields', id: 'expectedRevenue', label: 'Expected Revenue (₹)', type: 'number' },
  { group: 'Standard Fields', id: 'createdAt', label: 'Created Date', type: 'date' },
  { group: 'Standard Fields', id: 'nextFollowUpAt', label: 'Next Follow-Up Date', type: 'date' },
  { group: 'Standard Fields', id: 'closedAt', label: 'Closed Date', type: 'date' },
];

export const OPERATOR_OPTIONS: Record<string, Array<{ id: string; label: string }>> = {
  text: [
    { id: 'EQUALS', label: 'Equals' },
    { id: 'NOT_EQUALS', label: 'Not Equals' },
    { id: 'CONTAINS', label: 'Contains' },
    { id: 'NOT_CONTAINS', label: 'Does Not Contain' },
    { id: 'STARTS_WITH', label: 'Starts With' },
    { id: 'ENDS_WITH', label: 'Ends With' },
    { id: 'IS_EMPTY', label: 'Is Empty' },
    { id: 'IS_NOT_EMPTY', label: 'Is Not Empty' },
  ],
  number: [
    { id: 'EQUALS', label: 'Equals (=)' },
    { id: 'NOT_EQUALS', label: 'Not Equals (≠)' },
    { id: 'GREATER_THAN', label: 'Greater Than (>)' },
    { id: 'GREATER_THAN_OR_EQUAL', label: 'Greater Than or Equal (≥)' },
    { id: 'LESS_THAN', label: 'Less Than (<)' },
    { id: 'LESS_THAN_OR_EQUAL', label: 'Less Than or Equal (≤)' },
    { id: 'IN_RANGE', label: 'In Range (Min-Max)' },
    { id: 'IS_EMPTY', label: 'Is Empty' },
    { id: 'IS_NOT_EMPTY', label: 'Is Not Empty' },
  ],
  date: [
    { id: 'TODAY', label: 'Today' },
    { id: 'YESTERDAY', label: 'Yesterday' },
    { id: 'THIS_WEEK', label: 'This Week' },
    { id: 'LAST_WEEK', label: 'Last Week' },
    { id: 'THIS_MONTH', label: 'This Month' },
    { id: 'LAST_MONTH', label: 'Last Month' },
    { id: 'LAST_N_DAYS', label: 'Last X Days' },
    { id: 'NEXT_N_DAYS', label: 'Next X Days' },
    { id: 'EQUALS', label: 'Specific Date' },
    { id: 'GREATER_THAN', label: 'After Date' },
    { id: 'LESS_THAN', label: 'Before Date' },
    { id: 'IN_RANGE', label: 'Date Range (From - To)' },
    { id: 'IS_EMPTY', label: 'Is Empty' },
    { id: 'IS_NOT_EMPTY', label: 'Is Not Empty' },
  ],
  select: [
    { id: 'EQUALS', label: 'Equals' },
    { id: 'NOT_EQUALS', label: 'Not Equals' },
    { id: 'IS_ANY_OF', label: 'Is Any Of' },
    { id: 'IS_NONE_OF', label: 'Is None Of' },
    { id: 'IS_EMPTY', label: 'Is Empty' },
    { id: 'IS_NOT_EMPTY', label: 'Is Not Empty' },
  ],
  boolean: [
    { id: 'YES', label: 'Yes' },
    { id: 'NO', label: 'No' },
  ],
};

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  conditions,
  filterLogic,
  onChange,
  stages = [],
  substages = [],
  sources = [],
  lifecycles = [],
  users = [],
  offices = [],
  departments = [],
  dynamicFields = [],
}) => {
  const addCondition = () => {
    const updated = [...conditions, { field: 'stageId', operator: 'EQUALS', value: '' }];
    onChange(updated, filterLogic);
  };

  const removeCondition = (index: number) => {
    const updated = conditions.filter((_, i) => i !== index);
    onChange(updated, filterLogic);
  };

  const updateCondition = (index: number, key: keyof FilterConditionInput, val: any) => {
    const updated = conditions.map((cond, i) => {
      if (i === index) {
        const nextCond = { ...cond, [key]: val };
        // Reset operator & value if field changed
        if (key === 'field') {
          const fieldType = getFieldType(val);
          const defaultOps = OPERATOR_OPTIONS[fieldType] || OPERATOR_OPTIONS.text;
          nextCond.operator = defaultOps[0].id;
          nextCond.value = '';
        }
        return nextCond;
      }
      return cond;
    });
    onChange(updated, filterLogic);
  };

  const getFieldType = (fieldId: string): string => {
    if (fieldId.startsWith('dynamic_')) {
      const df = dynamicFields.find((f) => `dynamic_${f.id}` === fieldId);
      if (df?.inputType === 'NUMBER' || df?.inputType === 'CURRENCY') return 'number';
      if (df?.inputType === 'DATE') return 'date';
      if (df?.inputType === 'BOOLEAN') return 'boolean';
      if (df?.inputType === 'SELECT' || df?.inputType === 'RADIO') return 'select';
      return 'text';
    }
    const std = STANDARD_FIELDS.find((f) => f.id === fieldId);
    if (!std) return 'text';
    if (std.type.endsWith('_select')) return 'select';
    return std.type;
  };

  const renderValueInput = (cond: FilterConditionInput, index: number) => {
    const fieldType = getFieldType(cond.field);
    const noValueOps = ['IS_EMPTY', 'IS_NOT_EMPTY', 'TODAY', 'YESTERDAY', 'THIS_WEEK', 'LAST_WEEK', 'THIS_MONTH', 'LAST_MONTH', 'YES', 'NO'];

    if (noValueOps.includes(cond.operator)) {
      return (
        <span className="text-xs font-semibold italic text-gray-400 py-2">No additional value needed</span>
      );
    }

    if (cond.operator === 'LAST_N_DAYS' || cond.operator === 'NEXT_N_DAYS') {
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="365"
            value={cond.value || 7}
            onChange={(e) => updateCondition(index, 'value', Number(e.target.value))}
            className="w-24 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
            placeholder="Days"
          />
          <span className="text-xs font-medium text-gray-500">Days</span>
        </div>
      );
    }

    if (cond.operator === 'IN_RANGE' && fieldType === 'date') {
      const fromVal = typeof cond.value === 'object' && cond.value ? cond.value.from || '' : '';
      const toVal = typeof cond.value === 'object' && cond.value ? cond.value.to || '' : '';

      return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">From</span>
            <input
              type="date"
              value={fromVal}
              onChange={(e) =>
                updateCondition(index, 'value', { ...cond.value, from: e.target.value })
              }
              className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">To</span>
            <input
              type="date"
              value={toVal}
              onChange={(e) =>
                updateCondition(index, 'value', { ...cond.value, to: e.target.value })
              }
              className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      );
    }

    if (cond.operator === 'IN_RANGE' && fieldType === 'number') {
      const minVal = typeof cond.value === 'object' && cond.value ? cond.value.min ?? '' : '';
      const maxVal = typeof cond.value === 'object' && cond.value ? cond.value.max ?? '' : '';

      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minVal}
            onChange={(e) =>
              updateCondition(index, 'value', { ...cond.value, min: Number(e.target.value) })
            }
            className="w-24 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
            placeholder="Min ₹"
          />
          <span className="text-xs text-gray-400">-</span>
          <input
            type="number"
            value={maxVal}
            onChange={(e) =>
              updateCondition(index, 'value', { ...cond.value, max: Number(e.target.value) })
            }
            className="w-24 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
            placeholder="Max ₹"
          />
        </div>
      );
    }

    if (fieldType === 'date') {
      return (
        <input
          type="date"
          value={typeof cond.value === 'string' ? cond.value : ''}
          onChange={(e) => updateCondition(index, 'value', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
        />
      );
    }

    if (cond.field === 'stageId') {
      return (
        <select
          value={cond.value || ''}
          onChange={(e) => updateCondition(index, 'value', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">-- Select Stage --</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      );
    }

    if (cond.field === 'substageId') {
      return (
        <select
          value={cond.value || ''}
          onChange={(e) => updateCondition(index, 'value', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">-- Select Substage --</option>
          {substages.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      );
    }

    if (cond.field === 'sourceId') {
      return (
        <select
          value={cond.value || ''}
          onChange={(e) => updateCondition(index, 'value', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">-- Select Source --</option>
          {sources.map((src) => (
            <option key={src.id} value={src.id}>
              {src.name}
            </option>
          ))}
        </select>
      );
    }

    if (cond.field === 'lifecycleId') {
      return (
        <select
          value={cond.value || ''}
          onChange={(e) => updateCondition(index, 'value', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">-- Select Lifecycle --</option>
          {lifecycles.map((lc) => (
            <option key={lc.id} value={lc.id}>
              {lc.name}
            </option>
          ))}
        </select>
      );
    }

    if (cond.field === 'assignedToId') {
      return (
        <select
          value={cond.value || ''}
          onChange={(e) => updateCondition(index, 'value', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">-- Select User --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      );
    }

    if (cond.field === 'officeId') {
      return (
        <select
          value={cond.value || ''}
          onChange={(e) => updateCondition(index, 'value', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">-- Select Office --</option>
          {offices.map((off) => (
            <option key={off.id} value={off.id}>
              {off.name}
            </option>
          ))}
        </select>
      );
    }

    if (cond.field === 'departmentId') {
      return (
        <select
          value={cond.value || ''}
          onChange={(e) => updateCondition(index, 'value', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">-- Select Department --</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      );
    }

    if (cond.field === 'leadStatus') {
      return (
        <select
          value={cond.value || 'OPEN'}
          onChange={(e) => updateCondition(index, 'value', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
        >
          <option value="OPEN">Open Leads</option>
          <option value="CLOSED">Closed Leads (Won)</option>
          <option value="LOB">Loss of Business (LOB)</option>
          <option value="ACTIVE">Active (Non-LOB & Non-Closed)</option>
          <option value="ARCHIVED">Archived / Deleted</option>
        </select>
      );
    }

    return (
      <input
        type={fieldType === 'number' ? 'number' : 'text'}
        value={cond.value || ''}
        onChange={(e) => updateCondition(index, 'value', e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
        placeholder="Enter filter value..."
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-600" />
            Filter Conditions Logic
          </h4>
          <p className="mt-0.5 text-[11px] font-semibold text-emerald-700">
            Combine multiple standard and dynamic lead fields to build custom pipeline queries.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm border border-emerald-100">
          <button
            type="button"
            onClick={() => onChange(conditions, 'AND')}
            className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
              filterLogic === 'AND' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Match ALL (AND)
          </button>
          <button
            type="button"
            onClick={() => onChange(conditions, 'OR')}
            className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
              filterLogic === 'OR' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Match ANY (OR)
          </button>
        </div>
      </div>

      {conditions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
          <Sparkles className="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <p className="text-xs font-bold text-gray-600">No filter conditions added yet</p>
          <p className="mt-1 text-[11px] text-gray-400">This pipeline will match all leads in your scope.</p>
          <button
            type="button"
            onClick={addCondition}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add First Condition
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {conditions.map((cond, index) => {
            const fieldType = getFieldType(cond.field);
            const operators = OPERATOR_OPTIONS[fieldType] || OPERATOR_OPTIONS.text;

            return (
              <div
                key={index}
                className="group relative flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm transition-all hover:border-emerald-200 sm:flex-row sm:items-center"
              >
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Field
                  </label>
                  <select
                    value={cond.field}
                    onChange={(e) => updateCondition(index, 'field', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <optgroup label="Standard Fields">
                      {STANDARD_FIELDS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </optgroup>
                    {dynamicFields.length > 0 && (
                      <optgroup label="Dynamic Custom Fields">
                        {dynamicFields.map((df) => (
                          <option key={df.id} value={`dynamic_${df.id}`}>
                            {df.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div className="w-full sm:w-48">
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Operator
                  </label>
                  <select
                    value={cond.operator}
                    onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    {operators.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Value
                  </label>
                  {renderValueInput(cond, index)}
                </div>

                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  className="self-end rounded-xl border border-gray-200 p-2.5 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all sm:self-center"
                  title="Remove condition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}

          <div className="pt-2">
            <button
              type="button"
              onClick={addCondition}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-2.5 text-xs font-black text-emerald-700 hover:bg-emerald-100/60 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Another Condition
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
