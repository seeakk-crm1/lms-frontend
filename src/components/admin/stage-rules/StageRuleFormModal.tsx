import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ChevronDown, FileType2, ListChecks, Loader2, Save, TextCursorInput, Type, X } from 'lucide-react';
import { z } from 'zod';
import { CreateStageRuleInput, StageRule, StageRuleInputType } from '../../../types/stageRule.types';

const stageRuleSchema = z.object({
  name: z.string().trim().min(2, 'Rule name must be at least 2 characters'),
  inputType: z.enum(['TEXT', 'TEXTAREA', 'RADIO', 'SELECT']),
  sortOrder: z.number().int().min(1, 'Sort order must be greater than 0'),
  required: z.boolean(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type StageRuleFormValues = z.infer<typeof stageRuleSchema>;

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

const buildPreviewOptions = (ruleName: string): string[] => {
  const normalizedName = ruleName.trim();
  if (!normalizedName) {
    return ['Option 1', 'Option 2', 'Option 3'];
  }

  return [
    `${normalizedName} - Primary`,
    `${normalizedName} - Secondary`,
    `${normalizedName} - Follow-up`,
  ];
};

const buildPreviewByType = (
  inputType: StageRuleInputType,
  ruleName: string,
  previewValue: string,
  onPreviewValueChange: (value: string) => void,
): React.ReactNode => {
  const normalizedName = ruleName.trim();
  const label = normalizedName || 'Field Preview';
  const placeholder = normalizedName ? `Enter ${normalizedName.toLowerCase()}` : 'Enter value';
  const previewOptions = buildPreviewOptions(ruleName);

  if (inputType === 'TEXT') {
    return (
      <input
        type="text"
        readOnly
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600"
      />
    );
  }

  if (inputType === 'TEXTAREA') {
    return (
      <textarea
        readOnly
        rows={4}
        placeholder={`${label} notes...`}
        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600"
      />
    );
  }

  if (inputType === 'RADIO') {
    return (
      <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-3">
        {previewOptions.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="radio"
              name="preview-radio"
              value={option}
              checked={previewValue === option}
              onChange={(event) => onPreviewValueChange(event.target.value)}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            {option}
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={previewValue}
        onChange={(event) => onPreviewValueChange(event.target.value)}
        className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <option value="">{`Select ${label.toLowerCase()}`}</option>
        {previewOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
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
  const [previewValue, setPreviewValue] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<StageRuleFormValues>({
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

  const watchedName = watch('name');
  const watchedInputType = watch('inputType');
  const watchedRequired = watch('required');

  useEffect(() => {
    setPreviewValue('');
  }, [isOpen, watchedInputType, watchedName]);
  const previewContent = useMemo(
    () => buildPreviewByType(watchedInputType, watchedName || '', previewValue, setPreviewValue),
    [previewValue, watchedInputType, watchedName],
  );
  const selectedInputTypeMeta = useMemo(
    () => inputTypeOptions.find((option) => option.value === watchedInputType) || inputTypeOptions[0],
    [watchedInputType],
  );

  const handleFormSubmit = async (data: StageRuleFormValues) => {
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

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Input Type</label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {inputTypeOptions.map((option) => {
                          const Icon = option.icon;
                          const isSelected = watchedInputType === option.value;

                          return (
                            <label
                              key={option.value}
                              className={`cursor-pointer rounded-2xl border p-3 transition-all ${
                                isSelected
                                  ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                                  : 'border-gray-100 bg-gray-50 hover:border-emerald-200 hover:bg-white'
                              }`}
                            >
                              <input
                                type="radio"
                                value={option.value}
                                {...register('inputType')}
                                className="sr-only"
                              />
                              <div className="flex items-start gap-3">
                                <div className={`rounded-xl p-2 ${isSelected ? 'bg-white text-emerald-600' : 'bg-white text-gray-500'}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-black text-gray-900">{option.label}</p>
                                    {isSelected ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                                  </div>
                                  <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                    {option.value === 'TEXT'
                                      ? 'Single line input'
                                      : option.value === 'TEXTAREA'
                                        ? 'Long form response'
                                        : option.value === 'RADIO'
                                          ? 'Single choice'
                                          : 'Dropdown choice'}
                                  </p>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      {errors.inputType && <p className="text-[10px] text-red-500 font-bold">{errors.inputType.message}</p>}
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

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Input Preview</p>
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/60">
                      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-white/80 px-4 py-3">
                        <div>
                          <p className="text-xs font-black text-gray-900">{watchedName?.trim() || 'Field Preview'}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {selectedInputTypeMeta.label} input
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                            watchedRequired ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {watchedRequired ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      <div className="p-4">
                        {previewContent}
                        <p className="mt-3 text-[11px] font-semibold text-gray-500">
                          This preview shows how the field will appear during stage transition data entry.
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Keep labels short, specific, and action-oriented for better data quality
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
