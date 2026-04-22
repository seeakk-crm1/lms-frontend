import React, { useCallback, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AlertTriangle, FileImage, Loader2, Save, ShieldCheck, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import OptionBuilder from './OptionBuilder';
import type { LeadDynamicField, LeadDynamicsFormValues, LeadDynamicsInputType } from './types';

const optionTypeSet = new Set<LeadDynamicsInputType>(['SELECT', 'RADIO', 'CHECKBOX']);
const previewWithCustomLayout = new Set<LeadDynamicsInputType>([
  'TEXTAREA',
  'SELECT',
  'RADIO',
  'CHECKBOX',
  'FILE',
]);

const optionSchema = z.object({
  value: z.string().trim().min(1, 'Option value is required'),
  sortOrder: z.number().int().min(1, 'Sort order must be at least 1'),
});

const schema = z
  .object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters').max(100, 'Name must be at most 100 characters'),
    inputType: z.enum([
      'TEXT',
      'TEXTAREA',
      'NUMBER',
      'DATE',
      'SELECT',
      'RADIO',
      'CHECKBOX',
      'FILE',
      'DATETIME',
    ]),
    sortOrder: z.number().int().min(1, 'Sort order must be at least 1'),
    isRequired: z.boolean(),
    isActive: z.boolean(),
    options: z.array(optionSchema),
  })
  .superRefine((value, ctx) => {
    const requiresOptions = optionTypeSet.has(value.inputType);
    if (requiresOptions && value.options.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `Options are required for ${value.inputType}.`,
      });
    }
    if (!requiresOptions && value.options.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `Options are not allowed for ${value.inputType}.`,
      });
    }

    const seen = new Set<string>();
    value.options.forEach((option, index) => {
      const key = option.value.trim().toLowerCase();
      if (!key) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options', index, 'value'],
          message: 'Option value is required',
        });
        return;
      }
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options', index, 'value'],
          message: 'Duplicate option values are not allowed',
        });
      } else {
        seen.add(key);
      }
    });
  });

interface Props {
  initialData?: LeadDynamicField | null;
  existingNames: string[];
  suggestedSortOrder: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: LeadDynamicsFormValues) => Promise<void> | void;
}

const getDefaultValues = (
  initialData: LeadDynamicField | null | undefined,
  suggestedSortOrder: number,
): LeadDynamicsFormValues => ({
  name: initialData?.name || '',
  inputType: initialData?.inputType || 'TEXT',
  sortOrder: initialData?.sortOrder || suggestedSortOrder,
  isRequired: initialData?.isRequired ?? false,
  isActive: initialData?.isActive ?? true,
  options:
    initialData?.options?.length
      ? initialData.options.map((option) => ({
          value: option.value,
          sortOrder: option.sortOrder,
        }))
      : [],
});

const LeadDynamicsForm: React.FC<Props> = ({
  initialData,
  existingNames,
  suggestedSortOrder,
  isSubmitting,
  onCancel,
  onSubmit,
}) => {
  const defaultValues = useMemo(
    () => getDefaultValues(initialData, suggestedSortOrder),
    [initialData, suggestedSortOrder],
  );

  const normalizedNames = useMemo(
    () => existingNames.map((item) => item.trim().toLowerCase()),
    [existingNames],
  );

  const {
    watch,
    setValue,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LeadDynamicsFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues,
  });

  const values = watch();
  const options = values.options || [];
  const needsOptions = optionTypeSet.has(values.inputType);

  const duplicateNameError = useMemo(() => {
    const normalized = values.name?.trim().toLowerCase();
    if (!normalized) return '';
    const initialName = initialData?.name?.trim().toLowerCase();
    if (initialName && initialName === normalized) return '';
    return normalizedNames.includes(normalized) ? 'Field name already exists' : '';
  }, [initialData?.name, normalizedNames, values.name]);

  const optionRowErrors = useMemo(() => {
    const rowErrors: Record<number, string> = {};
    const seen = new Set<string>();

    options.forEach((option, index) => {
      const value = option.value?.trim();
      if (!value) {
        rowErrors[index] = 'Option value is required';
        return;
      }
      const key = value.toLowerCase();
      if (seen.has(key)) rowErrors[index] = 'Duplicate option value';
      seen.add(key);
    });

    return rowErrors;
  }, [options]);

  const onAddOption = useCallback(() => {
    const nextSortOrder =
      options.length === 0 ? 1 : Math.max(...options.map((item) => item.sortOrder || 1)) + 1;
    setValue(
      'options',
      [...options, { value: '', sortOrder: nextSortOrder }],
      { shouldDirty: true, shouldValidate: true },
    );
  }, [options, setValue]);

  const onRemoveOption = useCallback(
    (index: number) => {
      const next = options.filter((_, idx) => idx !== index).map((option, idx) => ({
        ...option,
        sortOrder: idx + 1,
      }));
      setValue('options', next, { shouldDirty: true, shouldValidate: true });
    },
    [options, setValue],
  );

  const onChangeOption = useCallback(
    (index: number, patch: { value?: string; sortOrder?: number }) => {
      const next = options.map((option, idx) =>
        idx === index ? { ...option, ...patch } : option,
      );
      setValue('options', next, { shouldDirty: true, shouldValidate: true });
    },
    [options, setValue],
  );

  const onInputTypeChange = useCallback(
    (inputType: LeadDynamicsInputType) => {
      setValue('inputType', inputType, { shouldDirty: true, shouldValidate: true });
      if (!optionTypeSet.has(inputType)) {
        setValue('options', [], { shouldDirty: true, shouldValidate: true });
      } else if (options.length === 0) {
        setValue('options', [{ value: '', sortOrder: 1 }], {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    },
    [options.length, setValue],
  );

  const isSubmitDisabled =
    isSubmitting ||
    !isValid ||
    Boolean(duplicateNameError) ||
    Object.keys(optionRowErrors).length > 0;

  return (
    <form
      onSubmit={handleSubmit(async (formValues) => {
        const payload: LeadDynamicsFormValues = {
          name: formValues.name.trim(),
          inputType: formValues.inputType,
          sortOrder: Number(formValues.sortOrder),
          isRequired: formValues.isRequired,
          isActive: formValues.isActive,
          options: formValues.options
            .map((item, index) => ({
              value: item.value.trim(),
              sortOrder: index + 1,
            }))
            .filter((item) => item.value.length > 0),
        };

        await onSubmit(payload);
      })}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Field Name</label>
          <input
            {...register('name')}
            placeholder="Call Category"
            className={`w-full mt-1 px-3 py-2.5 rounded-xl border bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
              errors.name || duplicateNameError ? 'border-red-200' : 'border-gray-200'
            }`}
          />
          {errors.name ? <p className="text-[11px] text-red-600 font-bold mt-1">{errors.name.message}</p> : null}
          {!errors.name && duplicateNameError ? (
            <p className="text-[11px] text-red-600 font-bold mt-1">{duplicateNameError}</p>
          ) : null}
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Input Type</label>
          <select
            value={values.inputType}
            onChange={(event) => onInputTypeChange(event.target.value as LeadDynamicsInputType)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="TEXT">TEXT</option>
            <option value="TEXTAREA">TEXTAREA</option>
            <option value="NUMBER">NUMBER</option>
            <option value="SELECT">SELECT</option>
            <option value="RADIO">RADIO</option>
            <option value="CHECKBOX">CHECKBOX</option>
            <option value="DATE">DATE</option>
            <option value="FILE">FILE</option>
            <option value="DATETIME">DATETIME</option>
          </select>
          <div className="mt-2 min-h-[34px]">
            {values.inputType === 'FILE' ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2">
                <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                  File Upload Field
                </p>
                <p className="mt-1 text-[11px] font-semibold leading-5 text-emerald-800/80">
                  Leads will upload a document or image here. The app should save only the final
                  secure file URL from S3 or Cloudinary, not a local file path.
                </p>
              </div>
            ) : (
              <p className="text-[11px] font-semibold text-gray-500">
                Pick the best input format for how your team will capture this lead detail.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Sort Order</label>
          <input
            type="number"
            min={1}
            {...register('sortOrder', { valueAsNumber: true })}
            className={`w-full mt-1 px-3 py-2.5 rounded-xl border bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
              errors.sortOrder ? 'border-red-200' : 'border-gray-200'
            }`}
          />
          <p className="text-[11px] font-semibold text-gray-500 mt-1">
            Suggested: {suggestedSortOrder}
          </p>
          {errors.sortOrder ? (
            <p className="text-[11px] text-red-600 font-bold mt-1">{errors.sortOrder.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Required</label>
          <div className="mt-1 p-1 rounded-xl border border-gray-200 bg-gray-50 flex gap-1">
            <button
              type="button"
              onClick={() => setValue('isRequired', true, { shouldDirty: true, shouldValidate: true })}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                values.isRequired ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              Mandatory
            </button>
            <button
              type="button"
              onClick={() => setValue('isRequired', false, { shouldDirty: true, shouldValidate: true })}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                !values.isRequired ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              Optional
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Status</label>
          <div className="mt-1 p-1 rounded-xl border border-gray-200 bg-gray-50 flex gap-1">
            <button
              type="button"
              onClick={() => setValue('isActive', true, { shouldDirty: true, shouldValidate: true })}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                values.isActive ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setValue('isActive', false, { shouldDirty: true, shouldValidate: true })}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                !values.isActive ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {needsOptions ? (
        <OptionBuilder
          options={options}
          rowErrors={optionRowErrors}
          canDelete={options.length > 1}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
          onChangeOption={onChangeOption}
        />
      ) : null}

      {errors.options?.message ? (
        <p className="text-[11px] text-red-600 font-bold inline-flex items-center gap-1.5" title={errors.options.message}>
          <AlertTriangle className="w-3.5 h-3.5" />
          {errors.options.message}
        </p>
      ) : null}

      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-blue-500">Live Preview</p>
        <label className="text-xs font-black text-gray-700">
          {values.name || 'Field Preview'}
          {values.isRequired ? <span className="text-red-500 ml-1">*</span> : null}
        </label>
        {values.inputType === 'TEXTAREA' ? (
          <textarea
            disabled
            placeholder="Preview textarea"
            className="w-full h-20 resize-none rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm"
          />
        ) : null}
        {values.inputType === 'SELECT' ? (
          <select disabled className="w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm">
            <option>Select option</option>
            {options.map((option) => (
              <option key={`preview-select-${option.sortOrder}`} value={option.value}>
                {option.value || `Option ${option.sortOrder}`}
              </option>
            ))}
          </select>
        ) : null}
        {values.inputType === 'RADIO' ? (
          <div className="space-y-2 rounded-xl border border-gray-200 bg-white/80 px-3 py-2">
            {options.length === 0 ? <p className="text-xs text-gray-400">No options yet</p> : null}
            {options.map((option) => (
              <label
                key={`preview-radio-${option.sortOrder}`}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input type="radio" disabled />
                {option.value || `Option ${option.sortOrder}`}
              </label>
            ))}
          </div>
        ) : null}
        {values.inputType === 'CHECKBOX' ? (
          <div className="space-y-2 rounded-xl border border-gray-200 bg-white/80 px-3 py-2">
            {options.length === 0 ? <p className="text-xs text-gray-400">No options yet</p> : null}
            {options.map((option) => (
              <label
                key={`preview-check-${option.sortOrder}`}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input type="checkbox" disabled />
                {option.value || `Option ${option.sortOrder}`}
              </label>
            ))}
          </div>
        ) : null}
        {values.inputType === 'FILE' ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-gradient-to-br from-white via-emerald-50/60 to-teal-50/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800">Upload supporting file</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-gray-500">
                    Drag and drop a file here, or browse from your device. Uploaded files should
                    resolve to a secure HTTPS URL before saving.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                URL Validated
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="flex min-h-[116px] items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-white/90 px-4 py-6 text-center">
                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <FileImage className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-black text-gray-700">Drop file to upload</p>
                  <p className="text-xs font-semibold text-gray-500">
                    PNG, JPG, PDF, DOCX or any supported CRM attachment
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white/90 p-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Stored Value
                </p>
                <code className="mt-2 block rounded-xl bg-gray-950 px-3 py-2 text-[11px] font-semibold text-emerald-300 break-all">
                  https://files.seeakk.com/leads/proof-of-visit.pdf
                </code>
                <p className="mt-2 text-[11px] font-semibold leading-5 text-gray-500">
                  Backend accepts only uploaded file URLs, which keeps lead submissions auditable
                  and safe across devices.
                </p>
              </div>
            </div>
          </div>
        ) : null}
        {!previewWithCustomLayout.has(values.inputType) ? (
          <input
            disabled
            type={
              values.inputType === 'NUMBER'
                ? 'number'
                : values.inputType === 'DATE'
                  ? 'date'
                  : values.inputType === 'DATETIME'
                    ? 'datetime-local'
                    : 'text'
            }
            placeholder={`Preview ${values.inputType.toLowerCase()} input`}
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm"
          />
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:flex-1 py-3 rounded-xl border border-gray-200 text-sm font-black text-gray-500 hover:bg-gray-50"
        >
          Cancel
        </button>
        <motion.button
          whileHover={{ y: -1, boxShadow: '0 10px 20px -12px rgba(16, 185, 129, 0.55)' }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-500 text-white text-sm font-black hover:bg-emerald-600 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {initialData ? 'Update Field' : 'Create Field'}
        </motion.button>
      </div>
    </form>
  );
};

export default React.memo(LeadDynamicsForm);
