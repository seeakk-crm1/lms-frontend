import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, X } from 'lucide-react';
import { z } from 'zod';
import { CreateLeadSourceInput, LeadSource } from '../../../types/leadSource.types';

const leadSourceSchema = z.object({
  name: z.string().trim().min(2, 'Lead source name must be at least 2 characters'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

interface LeadSourceFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  title: string;
  submitText: string;
  leadSource?: LeadSource | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadSourceInput) => Promise<void> | void;
}

const LeadSourceFormModal: React.FC<LeadSourceFormModalProps> = ({
  isOpen,
  mode,
  title,
  submitText,
  leadSource,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateLeadSourceInput>({
    resolver: zodResolver(leadSourceSchema),
    defaultValues: {
      name: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: leadSource?.name || '',
      status: leadSource?.status || 'ACTIVE',
    });
  }, [isOpen, leadSource, reset]);

  const formSubmit = async (data: CreateLeadSourceInput) => {
    await onSubmit({ ...data, name: data.name.trim() });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.button
            aria-label="Close modal overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-source-modal-title"
          >
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 id="lead-source-modal-title" className="text-xl font-black text-gray-900">
                  {title}
                </h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Master Configuration</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                aria-label="Close lead source modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(formSubmit)} className="p-6 space-y-6">
              {isSubmitting ? (
                <div className="space-y-4" aria-hidden="true">
                  <div className="h-3 w-32 rounded shimmer-bg" />
                  <div className="h-12 w-full rounded-2xl shimmer-bg" />
                  <div className="h-16 w-full rounded-2xl shimmer-bg" />
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead Source Name</label>
                    <input
                      {...register('name')}
                      placeholder="e.g., Facebook Ads"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all font-bold text-gray-900 ${
                        errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-50 focus:border-emerald-500'
                      }`}
                    />
                    {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name.message}</p>}
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-emerald-50/20 rounded-2xl border border-emerald-50/50">
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(field.value === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                          className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 shrink-0 ${
                            field.value === 'ACTIVE' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-gray-300'
                          }`}
                          aria-label="Toggle lead source status"
                          aria-pressed={field.value === 'ACTIVE'}
                        >
                          <motion.div
                            animate={{ x: field.value === 'ACTIVE' ? 28 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-5 h-5 bg-white rounded-full shadow-md"
                          />
                        </button>
                      )}
                    />
                    <div>
                      <p className="text-sm font-black text-gray-900">Status</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">{mode === 'create' ? 'Set initial state' : 'Update active state'}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-black text-gray-500 hover:bg-gray-50 rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-60 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {submitText}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(LeadSourceFormModal);

