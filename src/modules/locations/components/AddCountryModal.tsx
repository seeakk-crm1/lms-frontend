import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';

const schema = z.object({
  name: z.string().trim().min(2, 'Country name is required'),
  code: z.string().trim().max(10, 'Country code is too long').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

interface AddCountryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; code?: string; isActive: boolean }) => Promise<void>;
  isSubmitting?: boolean;
  initialValues?: { name?: string; code?: string | null; isActive?: boolean } | null;
  mode?: 'create' | 'edit';
}

const AddCountryModal: React.FC<AddCountryModalProps> = ({
  open,
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
      code: '',
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      code: values.code?.trim() || undefined,
      isActive: values.isActive,
    });
    reset();
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  React.useEffect(() => {
    if (!open) return;
    reset({
      name: initialValues?.name || '',
      code: initialValues?.code || '',
      isActive: initialValues?.isActive ?? true,
    });
  }, [initialValues, open, reset]);

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
            className="flex h-full w-full max-w-xl flex-col overflow-hidden rounded-none border-0 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.35)] sm:h-auto sm:max-h-[92vh] sm:rounded-[2rem] sm:border sm:border-gray-100"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-8 sm:py-5">
              <div>
                <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">
                  {mode === 'edit' ? 'Edit Country' : 'Add Country'}
                </div>
                <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
                  {mode === 'edit' ? 'Update country' : 'Create a country context'}
                </h2>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  {mode === 'edit'
                    ? 'Edit the country details and availability for the hierarchy.'
                    : 'Every dynamic level tree starts from a country root.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-2xl border border-gray-200 p-3 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                aria-label="Close add country modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitHandler} className="flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">Country Name</label>
                  <input
                    {...register('name')}
                    placeholder="India"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                  {errors.name ? <p className="mt-2 text-sm font-bold text-rose-500">{errors.name.message}</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">Country Code</label>
                  <input
                    {...register('code')}
                    placeholder="IN"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold uppercase text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                  {errors.code ? <p className="mt-2 text-sm font-bold text-rose-500">{errors.code.message}</p> : null}
                </div>

                <div>
                  <div className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">Status</div>
                  <div className="inline-flex rounded-2xl border border-gray-200 bg-gray-50 p-1">
                    <button
                      type="button"
                      onClick={() => setValue('isActive', true)}
                      className={`rounded-2xl px-4 py-2 text-sm font-black transition-colors ${isActive ? 'bg-emerald-500 text-white' : 'text-gray-500'}`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('isActive', false)}
                      className={`rounded-2xl px-4 py-2 text-sm font-black transition-colors ${!isActive ? 'bg-gray-900 text-white' : 'text-gray-500'}`}
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
                  className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.8)] transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (mode === 'edit' ? 'Saving...' : 'Creating...') : mode === 'edit' ? 'Save Country' : 'Create Country'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AddCountryModal;
