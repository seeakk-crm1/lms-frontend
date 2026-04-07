import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, X } from 'lucide-react';
import type { Country, LocationLevel } from '../../../services/locations.api';

const schema = z.object({
  levels: z
    .array(
      z.object({
        name: z.string().trim().min(2, 'Level name is required'),
        order: z.coerce.number().int().min(1).max(10),
        isActive: z.boolean().default(true),
      }),
    )
    .min(1, 'At least one level is required')
    .max(10, 'Maximum 10 levels supported'),
});

type FormValues = z.infer<typeof schema>;

interface AddLevelModalProps {
  open: boolean;
  country?: Country | null;
  levels: LocationLevel[];
  desiredLevelCount?: number;
  onClose: () => void;
  onSubmit: (payload: { countryId: string; levels: Array<{ name: string; order: number; isActive?: boolean }> }) => Promise<void>;
  isSubmitting?: boolean;
}

const AddLevelModal: React.FC<AddLevelModalProps> = ({ open, country, levels, desiredLevelCount, onClose, onSubmit, isSubmitting }) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { levels: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'levels',
  });

  useEffect(() => {
    if (!open) return;
    const targetCount = Math.max(desiredLevelCount || 0, levels.length || 0, 1);
    const seededLevels = levels.length
      ? levels.map((level) => ({
          name: level.levelName,
          order: level.levelOrder,
          isActive: level.isActive,
        }))
      : [];

    while (seededLevels.length < targetCount) {
      seededLevels.push({
        name: '',
        order: seededLevels.length + 1,
        isActive: true,
      });
    }

    reset({
      levels: seededLevels,
    });
  }, [desiredLevelCount, levels, open, reset]);

  const handleClose = () => {
    onClose();
  };

  const submitHandler = handleSubmit(async (values) => {
    if (!country) return;
    await onSubmit({
      countryId: country.id,
      levels: values.levels
        .map((level) => ({
          name: level.name.trim(),
          order: Number(level.order),
          isActive: level.isActive,
        }))
        .sort((a, b) => a.order - b.order),
    });
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 p-0 sm:p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 18 }}
            transition={{ duration: 0.2 }}
            className="flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-none border-0 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.35)] sm:h-auto sm:max-h-[92vh] sm:rounded-[2rem] sm:border sm:border-gray-100"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-8 sm:py-5">
              <div>
                <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">
                  Dynamic Levels
                </div>
                <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">Configure hierarchy for {country?.name || 'country'}</h2>
                <p className="mt-1 text-sm font-semibold text-gray-500">Define the ordered levels that shape this country’s location tree.</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-2xl border border-gray-200 p-3 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                aria-label="Close levels modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitHandler} className="flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid gap-3 rounded-3xl border border-gray-100 bg-gray-50/60 p-4 md:grid-cols-[minmax(0,1fr)_120px_120px_auto]">
                    <div>
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">Level Name</label>
                      <input
                        {...register(`levels.${index}.name`)}
                        placeholder="State"
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      />
                      {errors.levels?.[index]?.name ? (
                        <p className="mt-2 text-sm font-bold text-rose-500">{errors.levels[index]?.name?.message}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">Order</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        {...register(`levels.${index}.order`)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">Status</label>
                      <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1">
                        <button
                          type="button"
                          onClick={() => setValue(`levels.${index}.isActive`, true)}
                          className={`rounded-2xl px-3 py-2 text-xs font-black transition-colors ${
                            watch(`levels.${index}.isActive`) ? 'bg-emerald-500 text-white' : 'text-gray-500'
                          }`}
                        >
                          Active
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue(`levels.${index}.isActive`, false)}
                          className={`rounded-2xl px-3 py-2 text-xs font-black transition-colors ${
                            !watch(`levels.${index}.isActive`) ? 'bg-gray-900 text-white' : 'text-gray-500'
                          }`}
                        >
                          Inactive
                        </button>
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => append({ name: '', order: fields.length + 1, isActive: true })}
                  disabled={fields.length >= 10}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  Add Level
                </button>
              </div>

              {typeof errors.levels?.message === 'string' ? <p className="mt-3 text-sm font-bold text-rose-500">{errors.levels.message}</p> : null}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !country}
                  className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.8)] transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Save Levels'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AddLevelModal;
