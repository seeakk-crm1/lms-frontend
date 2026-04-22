import React, { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import type {
  LeadLifeCycle,
  LeadLifeCycleFormValues,
  LeadStageOption,
} from '../../../types/admin/lead-life-cycle/leadLifeCycle.types';
import TransitionPreview from './TransitionPreview';

const transitionSchema = z
  .object({
    fromStageId: z.string().trim().min(1, 'From stage is required'),
    toStageId: z.string().trim().min(1, 'To stage is required'),
    numberOfDays: z
      .number()
      .int('Days must be a whole number')
      .min(1, 'Number of days must be greater than 0'),
    expiryAction: z.enum(['AUTO_LOB', 'WARN_AND_CHOOSE']),
    warningDays: z.number().int('Warning days must be a whole number').min(0, 'Warning days must be zero or greater'),
    sortOrder: z.number().int().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.fromStageId === value.toStageId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'From Stage and To Stage must be different',
        path: ['toStageId'],
      });
    }
    if (value.warningDays >= value.numberOfDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Warning must be earlier than the expiry day',
        path: ['warningDays'],
      });
    }
  });

const formSchema = z
  .object({
    name: z.string().trim().min(1, 'Lead life cycle name is required').max(120, 'Name is too long'),
    isDefault: z.boolean(),
    transitions: z.array(transitionSchema).min(1, 'At least one transition is required'),
  })
  .superRefine((value, ctx) => {
    const pairSet = new Set<string>();
    const sortSet = new Set<number>();

    value.transitions.forEach((transition, index) => {
      const pair = `${transition.fromStageId}::${transition.toStageId}`;
      if (pairSet.has(pair)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate transition is not allowed',
          path: ['transitions', index, 'toStageId'],
        });
      }
      pairSet.add(pair);

      const sortOrder = transition.sortOrder ?? index + 1;
      if (sortSet.has(sortOrder)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate sort order is not allowed',
          path: ['transitions', index, 'sortOrder'],
        });
      }
      sortSet.add(sortOrder);
    });
  });

type LeadLifeCycleFormSchemaValues = z.infer<typeof formSchema>;

interface Props {
  initialData: LeadLifeCycle | null;
  stageOptions: LeadStageOption[];
  existingNames: string[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: LeadLifeCycleFormValues) => Promise<void> | void;
}

const getDefaults = (initialData: LeadLifeCycle | null): LeadLifeCycleFormSchemaValues => ({
  name: initialData?.name || '',
  isDefault: initialData?.isDefault || false,
  transitions:
    initialData?.transitions?.length
      ? initialData.transitions
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((transition, index) => ({
            fromStageId: transition.fromStageId,
            toStageId: transition.toStageId,
            numberOfDays: transition.numberOfDays,
            expiryAction: transition.expiryAction,
            warningDays: transition.warningDays ?? 0,
            sortOrder: transition.sortOrder || index + 1,
          }))
      : [{ fromStageId: '', toStageId: '', numberOfDays: 1, expiryAction: 'AUTO_LOB', warningDays: 0, sortOrder: 1 }],
});

const LeadLifeCycleForm: React.FC<Props> = ({
  initialData,
  stageOptions,
  existingNames,
  isSubmitting,
  onCancel,
  onSubmit,
}) => {
  const defaultValues = useMemo(() => getDefaults(initialData), [initialData]);

  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LeadLifeCycleFormSchemaValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'transitions',
  });

  const watchedName = watch('name');
  const watchedTransitions = watch('transitions');
  const watchedDefault = watch('isDefault');

  const duplicateNameError = useMemo(() => {
    const normalized = watchedName?.trim().toLowerCase();
    if (!normalized) return '';

    const current = initialData?.name?.trim().toLowerCase();
    if (current && normalized === current) return '';

    const exists = existingNames.some((entry) => entry.trim().toLowerCase() === normalized);
    return exists ? 'Lead life cycle name already exists' : '';
  }, [existingNames, initialData?.name, watchedName]);

  const normalizedPreview = useMemo(
    () =>
      (watchedTransitions || []).map((transition: LeadLifeCycleFormSchemaValues['transitions'][number], index: number) => ({
        ...transition,
        sortOrder: transition.sortOrder ?? index + 1,
      })),
    [watchedTransitions],
  );

  const canSubmit = !isSubmitting && isValid && !duplicateNameError;

  const getFromStageOptions = (currentToStageId?: string) =>
    stageOptions.filter((stage) => !currentToStageId || stage.id !== currentToStageId);

  const getToStageOptions = (currentFromStageId?: string) =>
    stageOptions.filter((stage) => !currentFromStageId || stage.id !== currentFromStageId);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        const payload: LeadLifeCycleFormValues = {
          name: values.name.trim(),
          isDefault: values.isDefault,
          transitions: values.transitions.map((transition: LeadLifeCycleFormSchemaValues['transitions'][number], index: number) => ({
            fromStageId: transition.fromStageId,
            toStageId: transition.toStageId,
            numberOfDays: Number(transition.numberOfDays),
            expiryAction: transition.expiryAction,
            warningDays: Number(transition.warningDays),
            sortOrder: transition.sortOrder || index + 1,
          })),
        };

        await onSubmit(payload);
      })}
      className="space-y-5"
    >
      <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Basic Details</p>

        <div className="mt-3 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600">Lead Life Cycle Name</label>
            <input
              {...register('name')}
              placeholder="Sales Pipeline"
              className={`mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                errors.name || duplicateNameError ? 'border-red-200' : 'border-gray-200'
              }`}
            />
            {errors.name?.message ? <p className="mt-1 text-[11px] font-bold text-red-600">{errors.name.message}</p> : null}
            {!errors.name?.message && duplicateNameError ? (
              <p className="mt-1 text-[11px] font-bold text-red-600">{duplicateNameError}</p>
            ) : null}
          </div>

          <label className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
            <input
              type="checkbox"
              {...register('isDefault')}
              checked={watchedDefault}
              onChange={(event) => setValue('isDefault', event.target.checked, { shouldDirty: true, shouldValidate: true })}
              className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
            />
            Set as default life cycle
          </label>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">On Expiry</p>
            <p className="mt-1 text-sm font-black text-amber-900">Choose what should happen for each stage</p>
            <p className="mt-1 text-[11px] font-semibold text-amber-800/80">
              You can auto-move expired leads to LOB, or warn the user first and allow them to extend the deadline.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lead Life Cycle Details</p>
            <p className="mt-1 text-xs font-semibold text-gray-500">
              Define flow and SLA days between stages using active Master Lead Stages
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              append({
                fromStageId: '',
                toStageId: '',
                numberOfDays: 1,
                expiryAction: 'AUTO_LOB',
                warningDays: 0,
                sortOrder: (watchedTransitions?.length || 0) + 1,
              })
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Add More
          </motion.button>
        </div>

        {stageOptions.length === 0 ? (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
            No lead stages found. Create stages first in Master Configuration to Lead Stages.
          </div>
        ) : null}

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {fields.map((field, index) => {
              const rowError = errors.transitions?.[index];
              const currentFromStageId = watchedTransitions?.[index]?.fromStageId;
              const currentToStageId = watchedTransitions?.[index]?.toStageId;
              const fromStageOptions = getFromStageOptions(currentToStageId);
              const toStageOptions = getToStageOptions(currentFromStageId);

              return (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  layout
                  className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 md:grid-cols-14"
                >
                  <div className="md:col-span-4">
                    <label className="text-[11px] font-bold text-gray-500">From Stage</label>
                    <select
                      {...register(`transitions.${index}.fromStageId`)}
                      className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                        rowError?.fromStageId ? 'border-red-200' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select stage</option>
                      {fromStageOptions.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                    {rowError?.fromStageId?.message ? (
                      <p className="mt-1 text-[10px] font-bold text-red-600">{rowError.fromStageId.message}</p>
                    ) : null}
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-[11px] font-bold text-gray-500">To Stage</label>
                    <select
                      {...register(`transitions.${index}.toStageId`)}
                      className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                        rowError?.toStageId ? 'border-red-200' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select stage</option>
                      {toStageOptions.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                    {rowError?.toStageId?.message ? (
                      <p className="mt-1 text-[10px] font-bold text-red-600">{rowError.toStageId.message}</p>
                    ) : null}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-bold text-gray-500">Days</label>
                    <input
                      type="number"
                      min={1}
                      {...register(`transitions.${index}.numberOfDays`, { valueAsNumber: true })}
                      className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                        rowError?.numberOfDays ? 'border-red-200' : 'border-gray-200'
                      }`}
                    />
                    {rowError?.numberOfDays?.message ? (
                      <p className="mt-1 text-[10px] font-bold text-red-600">{rowError.numberOfDays.message}</p>
                    ) : null}
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-[11px] font-bold text-gray-500">On Expiry</label>
                    <select
                      {...register(`transitions.${index}.expiryAction`)}
                      className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                        rowError?.expiryAction ? 'border-red-200' : 'border-gray-200'
                      }`}
                    >
                      <option value="AUTO_LOB">Move to LOB automatically</option>
                      <option value="WARN_AND_CHOOSE">Warn and allow extension</option>
                    </select>
                    {rowError?.expiryAction?.message ? (
                      <p className="mt-1 text-[10px] font-bold text-red-600">{rowError.expiryAction.message}</p>
                    ) : null}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-bold text-gray-500">Warn Before</label>
                    <input
                      type="number"
                      min={0}
                      {...register(`transitions.${index}.warningDays`, { valueAsNumber: true })}
                      className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                        rowError?.warningDays ? 'border-red-200' : 'border-gray-200'
                      }`}
                    />
                    {rowError?.warningDays?.message ? (
                      <p className="mt-1 text-[10px] font-bold text-red-600">{rowError.warningDays.message}</p>
                    ) : null}
                  </div>

                  <div className="md:col-span-1">
                    <label className="text-[11px] font-bold text-gray-500">Order</label>
                    <input
                      type="number"
                      min={1}
                      {...register(`transitions.${index}.sortOrder`, { valueAsNumber: true })}
                      placeholder={`${index + 1}`}
                      className={`mt-1.5 w-full rounded-lg border bg-white px-2 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                        rowError?.sortOrder ? 'border-red-200' : 'border-gray-200'
                      }`}
                    />
                  </div>

                  <div className="flex items-end md:col-span-1">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="w-full rounded-lg bg-red-50 px-2 py-2.5 text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Remove transition ${index + 1}`}
                    >
                      <Trash2 className="mx-auto h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {typeof errors.transitions?.message === 'string' ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            {errors.transitions.message}
          </p>
        ) : null}

        <div className="mt-4">
          <TransitionPreview transitions={normalizedPreview} stageOptions={stageOptions} />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-xl border border-gray-200 py-3 text-sm font-black text-gray-500 hover:bg-gray-50 sm:flex-1"
        >
          Cancel
        </button>
        <motion.button
          whileHover={{ y: -1, boxShadow: '0 10px 20px -12px rgba(34, 197, 94, 0.6)' }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={!canSubmit}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-black text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {initialData ? 'Update Life Cycle' : 'Create Life Cycle'}
        </motion.button>
      </div>
    </form>
  );
};

export default React.memo(LeadLifeCycleForm);
