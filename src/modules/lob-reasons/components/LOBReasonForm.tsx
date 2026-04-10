import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LOBReason, LOBReasonPayload, LOBReasonStatus } from '../types/lobReason.types';

const schema = z.object({
  name: z.string().trim().min(2, 'Reason is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type FormValues = z.infer<typeof schema>;

const inputStyles =
  'peer w-full rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-6 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-all placeholder:text-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';

const floatingLabelStyles =
  'pointer-events-none absolute left-4 top-3 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400 transition-all peer-placeholder-shown:top-4.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-semibold peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-3 peer-focus:text-[11px] peer-focus:font-black peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-emerald-600';

const statusOptions: Array<{ value: LOBReasonStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

interface LOBReasonFormProps {
  initialValue?: LOBReason | null;
  onSubmit: (payload: LOBReasonPayload) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const LOBReasonForm: React.FC<LOBReasonFormProps> = ({ initialValue, onSubmit, onCancel, isSubmitting }) => {
  const defaultValues = useMemo<FormValues>(
    () => ({
      name: initialValue?.name || '',
      status: initialValue?.status || 'ACTIVE',
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
    reset(defaultValues);
  }, [defaultValues, reset]);

  const selectedStatus = watch('status');

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          name: values.name.trim(),
          status: values.status,
        });
      })}
      className="space-y-5"
    >
      <label className="relative block">
        <input {...register('name')} placeholder="Reason Name" className={inputStyles} />
        <span className={floatingLabelStyles}>Reason Name</span>
        {errors.name ? <span className="mt-2 block text-xs font-bold text-rose-500">{errors.name.message}</span> : null}
      </label>

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
                    onClick={() => field.onChange(option.value)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition-all ${
                      active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
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
          {isSubmitting ? 'Saving...' : initialValue ? 'Save Changes' : 'Create Reason'}
        </button>
      </div>
    </form>
  );
};

export default LOBReasonForm;
