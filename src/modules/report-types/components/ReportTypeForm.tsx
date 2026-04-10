import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import SearchableSelect from '../../../components/SearchableSelect';
import FilterSelector from './FilterSelector';
import type { AllowedReportFilterKey, ReportBaseDataSource, ReportModule, ReportType, ReportTypePayload, ReportTypeStatus } from '../types/reportType.types';

const schema = z.object({
  name: z.string().trim().min(3, 'Report type name must be at least 3 characters'),
  module: z.string().min(1, 'Module is required'),
  baseDataSource: z.string().min(1, 'Base data source is required'),
  description: z.string().trim().optional(),
  allowedFilters: z.array(z.string()).min(1, 'Select at least one allowed filter'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type FormValues = z.infer<typeof schema>;

const moduleOptions: Array<{ value: ReportModule; label: string }> = [
  { value: 'LEADS', label: 'Leads' },
  { value: 'USERS', label: 'Users' },
  { value: 'REPORTS', label: 'Reports' },
  { value: 'TARGETS', label: 'Targets' },
  { value: 'FOLLOWUPS', label: 'Follow-ups' },
];

const sourceOptions: Array<{ value: ReportBaseDataSource; label: string }> = [
  { value: 'LEADS', label: 'Leads' },
  { value: 'USERS', label: 'Users' },
  { value: 'FOLLOWUPS', label: 'Follow-ups' },
];

const statusOptions: Array<{ value: ReportTypeStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const FILTERS_BY_SOURCE: Record<ReportBaseDataSource, AllowedReportFilterKey[]> = {
  LEADS: ['stage', 'assignee', 'lead_source', 'created_date', 'follow_up_date'],
  USERS: ['created_date', 'role', 'department', 'office', 'status'],
  FOLLOWUPS: ['stage', 'assignee', 'lead_source', 'created_date', 'follow_up_date', 'status'],
};

interface ReportTypeFormProps {
  initialValue?: ReportType | null;
  onSubmit: (payload: ReportTypePayload) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const inputStyles =
  'peer w-full rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-6 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-all placeholder:text-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';

const floatingLabelStyles =
  'pointer-events-none absolute left-4 top-3 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400 transition-all peer-placeholder-shown:top-4.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-semibold peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-3 peer-focus:text-[11px] peer-focus:font-black peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-emerald-600';

const ReportTypeForm: React.FC<ReportTypeFormProps> = ({ initialValue, onSubmit, onCancel, isSubmitting }) => {
  const defaultValues = useMemo<FormValues>(
    () => ({
      name: initialValue?.name || '',
      module: initialValue?.module || '',
      baseDataSource: initialValue?.baseDataSource || '',
      description: initialValue?.description || '',
      allowedFilters: initialValue?.allowedFilters || [],
      status: initialValue?.status || 'ACTIVE',
    }),
    [initialValue],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const selectedBaseDataSource = watch('baseDataSource');
  const selectedAllowedFilters = watch('allowedFilters');
  const selectedStatus = watch('status');

  useEffect(() => {
    if (!selectedBaseDataSource) {
      if (selectedAllowedFilters.length) {
        setValue('allowedFilters', [], { shouldValidate: true });
      }
      return;
    }

    const supported = new Set(FILTERS_BY_SOURCE[selectedBaseDataSource as ReportBaseDataSource]);
    const filtered = selectedAllowedFilters.filter((filter) => supported.has(filter as AllowedReportFilterKey));

    if (filtered.length !== selectedAllowedFilters.length) {
      setValue('allowedFilters', filtered, { shouldValidate: true });
    }
  }, [selectedAllowedFilters, selectedBaseDataSource, setValue]);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          name: values.name.trim(),
          module: values.module as ReportModule,
          baseDataSource: values.baseDataSource as ReportBaseDataSource,
          description: values.description?.trim() || undefined,
          allowedFilters: values.allowedFilters as AllowedReportFilterKey[],
          status: values.status,
        });
      })}
      className="space-y-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="relative block">
          <input {...register('name')} placeholder="Report Type Name" className={inputStyles} />
          <span className={floatingLabelStyles}>Report Type Name</span>
          {errors.name ? <span className="mt-2 block text-xs font-bold text-rose-500">{errors.name.message}</span> : null}
        </label>

        <div className="space-y-2">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Module</span>
          <Controller
            control={control}
            name="module"
            render={({ field }) => (
              <SearchableSelect
                options={moduleOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select module"
                name={field.name}
              />
            )}
          />
          {errors.module ? <span className="block text-xs font-bold text-rose-500">{errors.module.message}</span> : null}
        </div>

        <div className="space-y-2">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Base Data Source</span>
          <Controller
            control={control}
            name="baseDataSource"
            render={({ field }) => (
              <SearchableSelect
                options={sourceOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select data source"
                name={field.name}
              />
            )}
          />
          {errors.baseDataSource ? <span className="block text-xs font-bold text-rose-500">{errors.baseDataSource.message}</span> : null}
        </div>
      </div>

      <label className="relative block">
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Description"
          className={`${inputStyles} resize-none`}
        />
        <span className={floatingLabelStyles}>Description</span>
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Allowed Filters</div>
            <p className="mt-1 text-sm font-semibold text-gray-500">Enable only the filters this report type should expose to users.</p>
          </div>
        </div>
        <Controller
          control={control}
          name="allowedFilters"
          render={({ field }) => (
            <FilterSelector
              value={field.value as AllowedReportFilterKey[]}
              onChange={field.onChange}
              baseDataSource={selectedBaseDataSource as ReportBaseDataSource | ''}
            />
          )}
        />
        {errors.allowedFilters ? (
          <span className="mt-2 block text-xs font-bold text-rose-500">{errors.allowedFilters.message}</span>
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
        <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Status</div>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              {statusOptions.map((option) => {
                const active = selectedStatus === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange({ target: { name: field.name, value: option.value } })}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition-all ${
                      active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        active ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-600 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.8)] transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? 'Saving...' : initialValue ? 'Save Changes' : 'Save Report Type'}
        </button>
      </div>
    </form>
  );
};

export default ReportTypeForm;
