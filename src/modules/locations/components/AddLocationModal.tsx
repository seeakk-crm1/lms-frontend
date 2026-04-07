import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import type { Country, LocationLevel, LocationRecord } from '../../../services/locations.api';

const schema = z.object({
  name: z.string().trim().min(2, 'Location name is required'),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

interface AddLocationModalProps {
  open: boolean;
  country?: Country | null;
  level?: LocationLevel | null;
  parent?: LocationRecord | null;
  onClose: () => void;
  onSubmit: (payload: { countryId: string; levelId: string; parentId?: string; name: string; isActive: boolean }) => Promise<void>;
  isSubmitting?: boolean;
  initialValues?: { name?: string; isActive?: boolean } | null;
  mode?: 'create' | 'edit';
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({
  open,
  country,
  level,
  parent,
  onClose,
  onSubmit,
  isSubmitting,
  initialValues,
  mode = 'create',
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  const handleClose = () => {
    reset();
    onClose();
  };

  React.useEffect(() => {
    if (!open) return;
    reset({
      name: initialValues?.name || '',
      isActive: initialValues?.isActive ?? true,
    });
  }, [initialValues, open, reset]);

  const submitHandler = handleSubmit(async (values) => {
    if (!country || !level) return;
    await onSubmit({
      countryId: country.id,
      levelId: level.id,
      parentId: parent?.id,
      name: values.name.trim(),
      isActive: values.isActive,
    });
    reset();
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
            className="flex h-full w-full max-w-xl flex-col overflow-hidden rounded-none border-0 bg-white shadow-[0_30px_90px_-35px_rgba(16,185,129,0.2)] sm:h-auto sm:max-h-[92vh] sm:rounded-[2rem] sm:border sm:border-emerald-100"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-8 sm:py-5">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  {mode === 'edit' ? `Edit ${level?.levelName || 'Location'}` : `Add ${level?.levelName || 'Location'}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-2xl border border-emerald-100 p-3 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                aria-label="Close add location modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitHandler} className="flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="space-y-5">
                <div className="grid gap-4 rounded-[1.25rem] border border-emerald-100 bg-emerald-50/35 p-4 text-sm font-semibold text-slate-600">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Country</div>
                    <div className="mt-1 text-slate-900">{country?.name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Parent</div>
                    <div className="mt-1 text-slate-900">{parent?.name || country?.name || '-'}</div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">{level?.levelName || 'Location'} Name</label>
                  <input
                    {...register('name')}
                    placeholder={level?.levelName ? `Enter ${level.levelName.toLowerCase()} name` : 'Enter location name'}
                    className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                  {errors.name ? <p className="mt-2 text-sm font-bold text-rose-500">{errors.name.message}</p> : null}
                </div>

                <div>
                  <div className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Status</div>
                  <div className="inline-flex rounded-2xl border border-emerald-100 bg-emerald-50/40 p-1">
                    <button
                      type="button"
                      onClick={() => setValue('isActive', true)}
                      className={`rounded-2xl px-4 py-2 text-sm font-black transition-colors ${isActive ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('isActive', false)}
                      className={`rounded-2xl px-4 py-2 text-sm font-black transition-colors ${!isActive ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !country || !level}
                  className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.32)] transition-colors hover:from-emerald-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (mode === 'edit' ? 'Saving...' : 'Adding...') : mode === 'edit' ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AddLocationModal;
