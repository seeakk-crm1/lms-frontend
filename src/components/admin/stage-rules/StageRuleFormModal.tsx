import React, { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, FileType2, ListChecks, Loader2, Save, TextCursorInput, Type, X } from 'lucide-react';
import { z } from 'zod';
import { CreateStageRuleInput, StageRule, StageRuleInputType } from '../../../types/stageRule.types';

const stageRuleSchema = z.object({
  name: z.string().trim().min(2, 'Rule name must be at least 2 characters'),
  inputType: z.enum(['TEXT', 'TEXTAREA', 'RADIO', 'SELECT']),
  sortOrder: z.number().int().min(1, 'Sort order must be greater than 0'),
  required: z.boolean(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

interface StageRuleFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  title: string;
  submitText: string;
  stageRule?: StageRule | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStageRuleInput) => Promise<void> | void;
}

const inputTypeOptions: Array<{ value: StageRuleInputType; label: string; icon: React.ElementType }> = [
  { value: 'TEXT', label: 'Text', icon: Type },
  { value: 'TEXTAREA', label: 'Text Area', icon: TextCursorInput },
  { value: 'RADIO', label: 'Radio', icon: ListChecks },
  { value: 'SELECT', label: 'Select', icon: FileType2 },
];

const previewByType: Record<StageRuleInputType, React.ReactNode> = {
  TEXT: <input type="text" readOnly placeholder="Preview input" className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm" />,
  TEXTAREA: <textarea readOnly rows={3} placeholder="Preview textarea" className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-none" />,
  RADIO: (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="radio" name="preview-radio" disabled /> Option 1</label>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="radio" name="preview-radio" disabled /> Option 2</label>
    </div>
  ),
  SELECT: (
    <div className="relative">
      <select disabled className="w-full appearance-none px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-500">
        <option>Select an option</option>
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  ),
};

const StageRuleFormModal: React.FC<StageRuleFormModalProps> = ({
  isOpen,
  mode,
  title,
  submitText,
  stageRule,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateStageRuleInput>({
    resolver: zodResolver(stageRuleSchema),
    defaultValues: {
      name: '',
      inputType: 'TEXT',
      sortOrder: 1,
      required: false,
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: stageRule?.name || '',
      inputType: stageRule?.inputType || 'TEXT',
      sortOrder: stageRule?.sortOrder || 1,
      required: stageRule?.required || false,
      status: stageRule?.status || 'ACTIVE',
    });
  }, [isOpen, stageRule, reset]);

  const watchedInputType = watch('inputType');
  const previewContent = useMemo(() => previewByType[watchedInputType], [watchedInputType]);

  const handleFormSubmit = async (data: CreateStageRuleInput) => {
    await onSubmit({
      ...data,
      name: data.name.trim(),
      sortOrder: Number(data.sortOrder),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
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
            className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[96vh] sm:max-h-[92vh] flex flex-col mt-8 sm:mt-0"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stage-rule-modal-title"
          >
            <div className="p-4 sm:p-6 border-b border-gray-50 flex items-center justify-between gap-3">
              <div>
                <h2 id="stage-rule-modal-title" className="text-lg sm:text-xl font-black text-gray-900">
                  {title}
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Dynamic Form Configuration</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                aria-label="Close stage rule modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar">
              {isSubmitting ? (
                <div className="space-y-4" aria-hidden="true">
                  <div className="h-12 w-full rounded-2xl shimmer-bg" />
                  <div className="h-12 w-full rounded-2xl shimmer-bg" />
                  <div className="h-20 w-full rounded-2xl shimmer-bg" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rule Name</label>
                      <input
                        {...register('name')}
                        placeholder="e.g., Customer Comment"
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all font-bold text-gray-900 ${
                          errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-50 focus:border-emerald-500'
                        }`}
                        aria-invalid={Boolean(errors.name)}
                      />
                      {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Input Type</label>
                      <div className="relative">
                        <select
                          {...register('inputType')}
                          className={`w-full appearance-none px-4 py-3 bg-gray-50 border rounded-2xl outline-none transition-all font-bold text-gray-900 ${
                            errors.inputType ? 'border-red-300 focus:border-red-500' : 'border-gray-50 focus:border-emerald-500'
                          }`}
                        >
                          {inputTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort Order</label>
                      <input
                        type="number"
                        min={1}
                        {...register('sortOrder', { valueAsNumber: true })}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all font-bold text-gray-900 ${
                          errors.sortOrder ? 'border-red-300 focus:border-red-500' : 'border-gray-50 focus:border-emerald-500'
                        }`}
                        aria-invalid={Boolean(errors.sortOrder)}
                      />
                      {errors.sortOrder && <p className="text-[10px] text-red-500 font-bold">{errors.sortOrder.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</label>
                          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-50 w-full">
                            <button
                              type="button"
                              onClick={() => field.onChange('ACTIVE')}
                              className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                field.value === 'ACTIVE' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'
                              }`}
                            >
                              Active
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange('INACTIVE')}
                              className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                field.value === 'INACTIVE' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'
                              }`}
                            >
                              Inactive
                            </button>
                          </div>
                        </div>
                      )}
                    />

                    <Controller
                      name="required"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Required Field</label>
                          <div className="flex items-center gap-4 p-3 bg-emerald-50/20 rounded-2xl border border-emerald-50/50">
                            <button
                              type="button"
                              onClick={() => field.onChange(!field.value)}
                              className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 shrink-0 ${
                                field.value ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-gray-300'
                              }`}
                              aria-label="Toggle required field"
                              aria-pressed={field.value}
                            >
                              <motion.div
                                animate={{ x: field.value ? 28 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-5 h-5 bg-white rounded-full shadow-md"
                              />
                            </button>
                            <p className="text-xs font-bold text-gray-700">{field.value ? 'Mandatory on transition' : 'Optional field'}</p>
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Input Preview</p>
                    <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
                      <p className="text-xs font-black text-gray-700 mb-3">{watch('name') || 'Field Preview'}</p>
                      {previewContent}
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Future types: Checkbox, Date, File Upload
                    </p>
                  </div>
                </>
              )}

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-3 text-sm font-black text-gray-500 hover:bg-gray-50 rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-60 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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

export default React.memo(StageRuleFormModal);
