import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import SearchableSelect from '../../../components/SearchableSelect';
import MultiSearchableSelect from '../../../components/MultiSearchableSelect';
import FilterSelector from './FilterSelector';
import type { AllowedReportFilterKey, ReportBaseDataSource, ReportModule, ReportType, ReportTypePayload, ReportTypeStatus } from '../types/reportType.types';

const schema = z.object({
  name: z.string().trim().min(3, 'Report type name must be at least 3 characters'),
  modules: z.array(z.string()).min(1, 'Select at least one module'),
  baseDataSources: z.array(z.string()).min(1, 'Select at least one base data source'),
  description: z.string().trim().optional(),
  allowedFilters: z.array(z.string()).min(1, 'Select at least one allowed filter'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  categories: z.array(z.string()).min(1, 'Select at least one report category'),
  trackModules: z.array(z.string()).optional(),
  enableUserFilter: z.boolean().optional(),
  enableDateFilter: z.boolean().optional(),
  trackActivityTypes: z.array(z.string()).optional(),
  allowExport: z.boolean().optional(),
  showSummary: z.boolean().optional(),
  showDetailedLogs: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const moduleOptions: Array<{ value: ReportModule; label: string }> = [
  { value: 'LEADS', label: 'Leads' },
  { value: 'USERS', label: 'Users' },
  { value: 'REPORTS', label: 'Reports' },
  { value: 'TARGETS', label: 'Targets' },
  { value: 'FOLLOWUPS', label: 'Follow-ups' },
  { value: 'ACTIVITY', label: 'Activity Logs' },
];

const sourceOptions: Array<{ value: ReportBaseDataSource; label: string }> = [
  { value: 'LEADS', label: 'Leads' },
  { value: 'USERS', label: 'Users' },
  { value: 'FOLLOWUPS', label: 'Follow-ups' },
  { value: 'ACTIVITY', label: 'Activity Logs' },
];

const statusOptions: Array<{ value: ReportTypeStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const categoryOptions = [
  { value: 'Leads Report', label: 'Leads Report' },
  { value: 'Revenue Report', label: 'Revenue Report' },
  { value: 'Follow-up Report', label: 'Follow-up Report' },
  { value: 'User Activity Report', label: 'User Activity Report' },
  { value: 'Attendance Report', label: 'Attendance Report' },
  { value: 'Approval Report', label: 'Approval Report' },
  { value: 'Calendar Report', label: 'Calendar Report' },
];

const trackModulesOptions = [
  { value: 'Leads', label: 'Leads' },
  { value: 'Follow-ups', label: 'Follow-ups' },
  { value: 'Calendar', label: 'Calendar' },
  { value: 'Reports', label: 'Reports' },
  { value: 'Revenue', label: 'Revenue' },
  { value: 'Pending Approval', label: 'Pending Approval' },
  { value: 'Bulk Assign', label: 'Bulk Assign' },
  { value: 'Dashboard', label: 'Dashboard' },
  { value: 'Attendance', label: 'Attendance' },
  { value: 'Users', label: 'Users' },
  { value: 'Masters', label: 'Masters' },
  { value: 'Lead Stages', label: 'Lead Stages' },
  { value: 'LOB Analysis', label: 'LOB Analysis' },
];

const trackActivityTypesOptions = [
  { value: 'Create', label: 'Create' },
  { value: 'Edit', label: 'Edit' },
  { value: 'Delete', label: 'Delete' },
  { value: 'Assign', label: 'Assign' },
  { value: 'Approve', label: 'Approve' },
  { value: 'Reject', label: 'Reject' },
  { value: 'Login', label: 'Login' },
  { value: 'Logout', label: 'Logout' },
  { value: 'Export', label: 'Export' },
  { value: 'Follow-up Complete', label: 'Follow-up Complete' },
  { value: 'Stage Change', label: 'Stage Change' },
  { value: 'Revenue Added', label: 'Revenue Added' },
  { value: 'Attendance Added', label: 'Attendance Added' },
];

const FILTERS_BY_SOURCE: Record<ReportBaseDataSource, AllowedReportFilterKey[]> = {
  LEADS: ['stage', 'assignee', 'lead_source', 'created_date', 'follow_up_date'],
  USERS: ['created_date', 'role', 'department', 'office', 'status'],
  FOLLOWUPS: ['stage', 'assignee', 'lead_source', 'created_date', 'follow_up_date', 'status'],
  ACTIVITY: ['created_date', 'user', 'module', 'action'],
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
      modules: initialValue?.modules?.length
        ? initialValue.modules
        : initialValue?.module
          ? [initialValue.module]
          : [],
      baseDataSources: initialValue?.baseDataSources?.length
        ? initialValue.baseDataSources
        : initialValue?.baseDataSource
          ? [initialValue.baseDataSource]
          : [],
      description: initialValue?.description || '',
      allowedFilters: initialValue?.allowedFilters || [],
      status: initialValue?.status || 'ACTIVE',
      categories: initialValue?.categories?.length
        ? initialValue.categories
        : initialValue?.category
          ? [initialValue.category]
          : ['Leads Report'],
      trackModules: initialValue?.trackModules || [],
      enableUserFilter: initialValue?.enableUserFilter || false,
      enableDateFilter: initialValue?.enableDateFilter || false,
      trackActivityTypes: initialValue?.trackActivityTypes || [],
      allowExport: initialValue?.allowExport || false,
      showSummary: initialValue?.showSummary || false,
      showDetailedLogs: initialValue?.showDetailedLogs || false,
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

  const selectedBaseDataSources = watch('baseDataSources');
  const selectedAllowedFilters = watch('allowedFilters');
  const selectedStatus = watch('status');
  const selectedCategories = watch('categories');

  const showUserActivityConfig = useMemo(
    () => selectedCategories.includes('User Activity Report'),
    [selectedCategories],
  );

  useEffect(() => {
    if (!selectedBaseDataSources.length) {
      if (selectedAllowedFilters.length) {
        setValue('allowedFilters', [], { shouldValidate: true });
      }
      return;
    }

    const supported = new Set<AllowedReportFilterKey>();
    for (const source of selectedBaseDataSources) {
      for (const filterKey of FILTERS_BY_SOURCE[source as ReportBaseDataSource] || []) {
        supported.add(filterKey);
      }
    }

    const filtered = selectedAllowedFilters.filter((filter) => supported.has(filter as AllowedReportFilterKey));

    if (filtered.length !== selectedAllowedFilters.length) {
      setValue('allowedFilters', filtered, { shouldValidate: true });
    }
  }, [selectedAllowedFilters, selectedBaseDataSources, setValue]);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        const modules = values.modules as ReportModule[];
        const baseDataSources = values.baseDataSources as ReportBaseDataSource[];

        await onSubmit({
          name: values.name.trim(),
          module: modules[0],
          modules,
          baseDataSource: baseDataSources[0],
          baseDataSources,
          description: values.description?.trim() || undefined,
          allowedFilters: values.allowedFilters as AllowedReportFilterKey[],
          status: values.status,
          category: values.categories[0],
          categories: values.categories,
          trackModules: values.trackModules,
          enableUserFilter: values.enableUserFilter,
          enableDateFilter: values.enableDateFilter,
          trackActivityTypes: values.trackActivityTypes,
          allowExport: values.allowExport,
          showSummary: values.showSummary,
          showDetailedLogs: values.showDetailedLogs,
        });
      })}
      className="space-y-5"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <label className="relative block md:col-span-3">
          <input {...register('name')} placeholder="Report Type Name" className={inputStyles} />
          <span className={floatingLabelStyles}>Report Type Name</span>
          {errors.name ? <span className="mt-2 block text-xs font-bold text-rose-500">{errors.name.message}</span> : null}
        </label>

        <div className="space-y-2">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Module</span>
          <Controller
            control={control}
            name="modules"
            render={({ field }) => (
              <MultiSearchableSelect
                options={moduleOptions}
                values={field.value || []}
                onChange={field.onChange}
                placeholder="Select modules"
                name={field.name}
              />
            )}
          />
          {errors.modules ? <span className="block text-xs font-bold text-rose-500">{errors.modules.message}</span> : null}
        </div>

        <div className="space-y-2">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Base Data Source</span>
          <Controller
            control={control}
            name="baseDataSources"
            render={({ field }) => (
              <MultiSearchableSelect
                options={sourceOptions}
                values={field.value || []}
                onChange={field.onChange}
                placeholder="Select data sources"
                name={field.name}
              />
            )}
          />
          {errors.baseDataSources ? (
            <span className="block text-xs font-bold text-rose-500">{errors.baseDataSources.message}</span>
          ) : null}
        </div>

        <div className="space-y-2">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Report Category</span>
          <Controller
            control={control}
            name="categories"
            render={({ field }) => (
              <MultiSearchableSelect
                options={categoryOptions}
                values={field.value || []}
                onChange={field.onChange}
                placeholder="Select categories"
                name={field.name}
              />
            )}
          />
          {errors.categories ? (
            <span className="block text-xs font-bold text-rose-500">{errors.categories.message}</span>
          ) : null}
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

      {showUserActivityConfig && (
        <div className="space-y-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-5">
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-600">User Activity Report Configurations</h4>
          
          <div className="space-y-2">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Track Modules</span>
            <Controller
              control={control}
              name="trackModules"
              render={({ field }) => {
                const currentVal = field.value || [];
                const toggleVal = (v: string) => {
                  const updated = currentVal.includes(v)
                    ? currentVal.filter((x) => x !== v)
                    : [...currentVal, v];
                  field.onChange(updated);
                };
                return (
                  <div className="flex flex-wrap gap-2">
                    {trackModulesOptions.map((opt) => {
                      const active = currentVal.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleVal(opt.value)}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                            active
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                );
              }}
            />
          </div>

          <div className="space-y-2">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Track Activity Types</span>
            <Controller
              control={control}
              name="trackActivityTypes"
              render={({ field }) => {
                const currentVal = field.value || [];
                const toggleVal = (v: string) => {
                  const updated = currentVal.includes(v)
                    ? currentVal.filter((x) => x !== v)
                    : [...currentVal, v];
                  field.onChange(updated);
                };
                return (
                  <div className="flex flex-wrap gap-2">
                    {trackActivityTypesOptions.map((opt) => {
                      const active = currentVal.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleVal(opt.value)}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                            active
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                );
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 rounded-xl border border-gray-200 bg-white p-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register('enableUserFilter')}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="select-none">
                <span className="block text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Enable User Filter</span>
                <span className="block text-[10px] text-gray-400">Allow selecting specific users</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register('enableDateFilter')}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="select-none">
                <span className="block text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Enable Date Range</span>
                <span className="block text-[10px] text-gray-400">Show From and To date fields</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register('allowExport')}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="select-none">
                <span className="block text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Allow Export</span>
                <span className="block text-[10px] text-gray-400">Excel, PDF, CSV formats</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register('showSummary')}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="select-none">
                <span className="block text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Show Summary</span>
                <span className="block text-[10px] text-gray-400">Display activity totals</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register('showDetailedLogs')}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="select-none">
                <span className="block text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Show Detailed Logs</span>
                <span className="block text-[10px] text-gray-400">Display itemized action logs</span>
              </div>
            </label>
          </div>
        </div>
      )}

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
              baseDataSources={selectedBaseDataSources as ReportBaseDataSource[]}
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
