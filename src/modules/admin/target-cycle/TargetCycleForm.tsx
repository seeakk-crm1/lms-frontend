import React, { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2, Plus, Save } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import RangeSelector from './RangeSelector';
import type { TargetCycle, TargetCycleFormValues, TargetCycleRange } from './types';

const rangeSchema = z
  .object({
    startDay: z.number().int().min(1).max(31),
    endDay: z.number().int().min(1).max(31),
  })
  .refine((value) => value.endDay >= value.startDay, {
    message: 'End date must be greater than or equal to start date',
    path: ['endDay'],
  });

const targetCycleFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Target cycle name is required').max(100, 'Name cannot exceed 100 characters'),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    ranges: z.array(rangeSchema).min(1, 'At least one range is required'),
  })
  .superRefine((value, ctx) => {
    const sorted = [...value.ranges]
      .map((range, index) => ({ ...range, index }))
      .sort((a, b) => a.startDay - b.startDay);

    for (let idx = 1; idx < sorted.length; idx += 1) {
      const prev = sorted[idx - 1];
      const current = sorted[idx];
      if (current.startDay <= prev.endDay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ranges cannot overlap',
          path: ['ranges', current.index, 'startDay'],
        });
      }
    }

    const totalDays = value.ranges.reduce((sum, range) => sum + (range.endDay - range.startDay + 1), 0);
    if (totalDays < 28 || totalDays > 31) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Total should be between 28 to 31',
        path: ['ranges'],
      });
    }
  });

interface Props {
  initialData?: TargetCycle | null;
  existingNames: string[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: TargetCycleFormValues) => Promise<void> | void;
}

const buildDefaults = (initialData?: TargetCycle | null): TargetCycleFormValues => ({
  name: initialData?.name || '',
  status: initialData?.status || 'ACTIVE',
  ranges: initialData?.ranges?.length ? initialData.ranges.map(({ startDay, endDay }) => ({ startDay, endDay })) : [{ startDay: 1, endDay: 1 }],
});

const buildRowErrors = (ranges: TargetCycleRange[]): Record<number, string> => {
  const errors: Record<number, string> = {};

  ranges.forEach((range, index) => {
    if (range.endDay < range.startDay) {
      errors[index] = 'End date must be >= start date';
    }
  });

  const sorted = [...ranges]
    .map((range, index) => ({ ...range, index }))
    .sort((a, b) => a.startDay - b.startDay);

  for (let index = 1; index < sorted.length; index += 1) {
    const prev = sorted[index - 1];
    const current = sorted[index];
    if (current.startDay <= prev.endDay) {
      errors[current.index] = 'Overlaps with previous range';
      errors[prev.index] = errors[prev.index] || 'Overlaps with next range';
    }
  }

  return errors;
};

const TargetCycleForm: React.FC<Props> = ({ initialData, existingNames, isSubmitting, onCancel, onSubmit }) => {
  const defaultValues = useMemo(() => buildDefaults(initialData), [initialData]);
  const normalizedExisting = useMemo(() => existingNames.map((item) => item.trim().toLowerCase()), [existingNames]);

  const {
    register,
    control,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TargetCycleFormValues>({
    resolver: zodResolver(targetCycleFormSchema),
    mode: 'onChange',
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ranges',
  });

  const watchedName = watch('name');
  const watchedStatus = watch('status');
  const watchedRanges = watch('ranges');

  const rowErrors = useMemo(() => buildRowErrors(watchedRanges || []), [watchedRanges]);
  const totalDays = useMemo(
    () => (watchedRanges || []).reduce((sum, range) => sum + Math.max(0, range.endDay - range.startDay + 1), 0),
    [watchedRanges],
  );
  const totalDaysError = totalDays < 28 || totalDays > 31 ? 'Total should be between 28 to 31' : '';
  const duplicateNameError = useMemo(() => {
    const normalized = watchedName?.trim().toLowerCase();
    if (!normalized) return '';
    const currentName = initialData?.name?.trim().toLowerCase();
    if (currentName && normalized === currentName) return '';
    return normalizedExisting.includes(normalized) ? 'Target cycle name already exists' : '';
  }, [initialData?.name, normalizedExisting, watchedName]);

  const isSubmitDisabled =
    isSubmitting ||
    Boolean(totalDaysError) ||
    Boolean(duplicateNameError) ||
    Object.keys(rowErrors).length > 0 ||
    !isValid;

  const handleRangeChange = (index: number, patch: Partial<TargetCycleRange>) => {
    if (patch.startDay !== undefined) {
      setValue(`ranges.${index}.startDay`, patch.startDay, { shouldValidate: true, shouldDirty: true });
    }
    if (patch.endDay !== undefined) {
      setValue(`ranges.${index}.endDay`, patch.endDay, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleAddRange = () => {
    append({ startDay: 1, endDay: 1 });
  };

  const handleRemoveRange = (index: number) => {
    remove(index);
  };

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          name: values.name.trim(),
          status: values.status,
          ranges: values.ranges.map((range) => ({
            startDay: Number(range.startDay),
            endDay: Number(range.endDay),
          })),
        });
      })}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Target Cycle Name</label>
          <input
            {...register('name')}
            placeholder="January 2026"
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
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Status</label>
          <div className="mt-1 p-1 rounded-xl border border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-1 sm:gap-0">
            <button
              type="button"
              onClick={() => setValue('status', 'ACTIVE', { shouldValidate: true, shouldDirty: true })}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                watchedStatus === 'ACTIVE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setValue('status', 'INACTIVE', { shouldValidate: true, shouldDirty: true })}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                watchedStatus === 'INACTIVE' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h4 className="text-sm font-black text-gray-900">Target Definition (Monthly 28 / 30 / 31)</h4>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              Configure one or more non-overlapping working ranges.
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddRange}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
          >
            <Plus className="w-4 h-4" />
            Add More
          </motion.button>
        </div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {fields.map((field, index) => (
              <RangeSelector
                key={field.id}
                index={index}
                range={watchedRanges?.[index] || { startDay: 1, endDay: 1 }}
                rowError={rowErrors[index]}
                canDelete={fields.length > 1}
                onChange={handleRangeChange}
                onDelete={handleRemoveRange}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Total</p>
          <p className={`text-lg font-black ${totalDaysError ? 'text-red-600' : 'text-emerald-600'}`}>{totalDays}</p>
        </div>

        {errors.ranges?.message ? <p className="text-[11px] text-red-600 font-bold mt-2">{errors.ranges.message}</p> : null}
        {totalDaysError ? (
          <p className="text-[11px] text-red-600 font-bold mt-2 inline-flex items-center gap-1.5" title={totalDaysError}>
            <AlertTriangle className="w-3.5 h-3.5" />
            {totalDaysError}
          </p>
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
          {initialData ? 'Update Target Cycle' : 'Create Target Cycle'}
        </motion.button>
      </div>
    </form>
  );
};

export default React.memo(TargetCycleForm);
