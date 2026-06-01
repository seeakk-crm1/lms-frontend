import React, { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { ExtensionReason, ExtensionReasonPayload } from '../types/followUpExtensionReason.types';

interface ExtensionReasonModalProps {
  open: boolean;
  onClose: () => void;
  initialValue?: ExtensionReason | null;
  onSubmit: (payload: ExtensionReasonPayload) => Promise<void>;
  isSubmitting?: boolean;
}

const schema = z.object({
  reasonName: z.string().trim().min(1, 'Reason Name is required').max(255, 'Reason Name must not exceed 255 characters'),
  description: z.string().trim().max(1000, 'Description must not exceed 1000 characters').optional().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0, 'Sort Order must be at least 0'),
});

type FormValues = z.infer<typeof schema>;

const inputStyles =
  'peer w-full rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-6 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-all placeholder:text-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';

const textareaStyles =
  'peer w-full rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-6 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-all placeholder:text-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-y min-h-[80px]';

const floatingLabelStyles =
  'pointer-events-none absolute left-4 top-3 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400 transition-all peer-placeholder-shown:top-4.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-semibold peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-3 peer-focus:text-[11px] peer-focus:font-black peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-emerald-600';

const ExtensionReasonModal: React.FC<ExtensionReasonModalProps> = ({ open, onClose, initialValue, onSubmit, isSubmitting }) => {
  const defaultValues = useMemo<FormValues>(
    () => ({
      reasonName: initialValue?.reasonName || '',
      description: initialValue?.description || '',
      isActive: initialValue ? initialValue.isActive : true,
      sortOrder: initialValue ? initialValue.sortOrder : 0,
    }),
    [initialValue],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const selectedIsActive = watch('isActive');

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit({
      reasonName: values.reasonName.trim(),
      description: values.description?.trim() || null,
      isActive: values.isActive,
      sortOrder: values.sortOrder,
    });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-0 sm:p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 18 }}
            transition={{ duration: 0.22 }}
            className="flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-none border-0 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.35)] sm:h-auto sm:max-h-[92vh] sm:rounded-[2rem] sm:border sm:border-gray-100"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-8 sm:py-5">
              <div className="min-w-0">
                <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">
                  {initialValue ? 'Edit Predefined Reason' : 'Create Predefined Reason'}
                </div>
                <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
                  {initialValue ? 'Update extension reason' : 'Add extension reason'}
                </h2>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  Configure pre-defined reasons that users can choose when extending/snoozing reminders or follow-ups.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-gray-200 p-3 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                <label className="relative block">
                  <input {...register('reasonName')} placeholder="Reason Name" className={inputStyles} />
                  <span className={floatingLabelStyles}>Reason Name</span>
                  {errors.reasonName ? (
                    <span className="mt-2 block text-xs font-bold text-rose-500">{errors.reasonName.message}</span>
                  ) : null}
                </label>

                <label className="relative block">
                  <textarea {...register('description')} placeholder="Description (Optional)" className={textareaStyles} />
                  <span className={floatingLabelStyles}>Description (Optional)</span>
                  {errors.description ? (
                    <span className="mt-2 block text-xs font-bold text-rose-500">{errors.description.message}</span>
                  ) : null}
                </label>

                <label className="relative block">
                  <input type="number" {...register('sortOrder', { valueAsNumber: true })} placeholder="Sort Order" className={inputStyles} />
                  <span className={floatingLabelStyles}>Sort Order</span>
                  {errors.sortOrder ? (
                    <span className="mt-2 block text-xs font-bold text-rose-500">{errors.sortOrder.message}</span>
                  ) : null}
                </label>

                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
                  <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Status</div>
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <div className="grid gap-3 sm:flex sm:flex-wrap">
                        <button
                          type="button"
                          onClick={() => field.onChange(true)}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition-all ${
                            selectedIsActive
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                          }`}
                        >
                          <span className={`h-2.5 w-2.5 rounded-full ${selectedIsActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          <span>Active</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => field.onChange(false)}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition-all ${
                            !selectedIsActive
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                          }`}
                        >
                          <span className={`h-2.5 w-2.5 rounded-full ${!selectedIsActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          <span>Inactive</span>
                        </button>
                      </div>
                    )}
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.8)] transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isSubmitting ? 'Saving...' : initialValue ? 'Save Changes' : 'Create Reason'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ExtensionReasonModal;
