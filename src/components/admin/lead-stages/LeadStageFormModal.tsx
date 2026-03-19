import React, { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { CreateLeadStageInput, LeadStage } from '../../../types/leadStage.types';

const stageRuleSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  condition: z.string().min(1, 'Condition is required'),
});

const leadStageSchema = z.object({
  name: z.string().trim().min(2, 'Lead stage name must be at least 2 characters'),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'Pick a valid color'),
  isApprovalRequired: z.boolean(),
  isLOB: z.boolean(),
  isClosed: z.boolean(),
  stageOrder: z.number().int().min(1, 'Stage order must be greater than 0'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  rules: z.array(stageRuleSchema),
});

interface LeadStageFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  title: string;
  submitText: string;
  leadStage?: LeadStage | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadStageInput) => Promise<void> | void;
}

const ruleFieldOptions = ['Customer Comment', 'Next Follow-up Date', 'LOB Reason', 'Escalation Note', 'Amount'];
const conditionOptions = ['Mandatory', 'Optional', 'Equals', 'Not Empty', 'Greater Than'];

const ToggleField: React.FC<{
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  ariaLabel: string;
}> = React.memo(({ label, description, value, onChange, ariaLabel }) => (
  <div className="flex items-center gap-4 p-4 bg-emerald-50/20 rounded-2xl border border-emerald-50/50">
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-label={ariaLabel}
      aria-pressed={value}
      className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 shrink-0 ${
        value ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-gray-300'
      }`}
    >
      <motion.div animate={{ x: value ? 28 : 0 }} transition={{ duration: 0.2 }} className="w-5 h-5 bg-white rounded-full shadow-md" />
    </button>
    <div>
      <p className="text-sm font-black text-gray-900">{label}</p>
      <p className="text-[10px] text-gray-400 font-bold mt-1">{description}</p>
    </div>
  </div>
));

const LeadStageFormModal: React.FC<LeadStageFormModalProps> = ({
  isOpen,
  mode,
  title,
  submitText,
  leadStage,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLeadStageInput>({
    resolver: zodResolver(leadStageSchema),
    defaultValues: {
      name: '',
      color: '#10b981',
      isApprovalRequired: false,
      isLOB: false,
      isClosed: false,
      stageOrder: 1,
      status: 'ACTIVE',
      rules: [{ field: '', condition: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rules',
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: leadStage?.name || '',
      color: leadStage?.color || '#10b981',
      isApprovalRequired: leadStage?.isApprovalRequired || false,
      isLOB: leadStage?.isLOB || false,
      isClosed: leadStage?.isClosed || false,
      stageOrder: leadStage?.stageOrder || 1,
      status: leadStage?.status || 'ACTIVE',
      rules: leadStage?.rules?.length ? leadStage.rules : [{ field: '', condition: '' }],
    });
  }, [isOpen, leadStage, reset]);

  const formSubmit = async (data: CreateLeadStageInput) => {
    await onSubmit({
      ...data,
      name: data.name.trim(),
      rules: data.rules.map((rule) => ({ field: rule.field.trim(), condition: rule.condition.trim() })),
    });
  };

  const modalSkeleton = useMemo(
    () => (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-12 w-full rounded-2xl shimmer-bg" />
        <div className="h-12 w-full rounded-2xl shimmer-bg" />
        <div className="h-24 w-full rounded-2xl shimmer-bg" />
      </div>
    ),
    [],
  );

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
            className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[96vh] sm:max-h-[92vh] flex flex-col mt-8 sm:mt-0"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-stage-modal-title"
          >
            <div className="p-4 sm:p-6 border-b border-gray-50 flex items-center justify-between gap-3">
              <div>
                <h2 id="lead-stage-modal-title" className="text-lg sm:text-xl font-black text-gray-900">
                  {title}
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Pipeline Configuration</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                aria-label="Close lead stage modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(formSubmit)} className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar">
              {isSubmitting ? (
                modalSkeleton
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead Stage Name</label>
                      <input
                        {...register('name')}
                        placeholder="e.g., Proposal Sent"
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all font-bold text-gray-900 ${
                          errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-50 focus:border-emerald-500'
                        }`}
                      />
                      {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stage Color Picker</label>
                      <div className="flex items-center gap-3 flex-wrap px-3 py-2.5 bg-gray-50 border border-gray-50 rounded-2xl">
                        <input type="color" {...register('color')} className="h-8 w-8 rounded-lg border border-gray-200 bg-transparent" />
                        <input
                          {...register('color')}
                          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm font-bold text-gray-700"
                          aria-label="Stage color hex code"
                        />
                        <span className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: (leadStage?.color || '#10b981') as string }} />
                      </div>
                      {errors.color && <p className="text-[10px] text-red-500 font-bold">{errors.color.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stage Order</label>
                      <input
                        type="number"
                        min={1}
                        {...register('stageOrder', { valueAsNumber: true })}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all font-bold text-gray-900 ${
                          errors.stageOrder ? 'border-red-300 focus:border-red-500' : 'border-gray-50 focus:border-emerald-500'
                        }`}
                      />
                      {errors.stageOrder && <p className="text-[10px] text-red-500 font-bold">{errors.stageOrder.message}</p>}
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Controller
                        name="isApprovalRequired"
                        control={control}
                        render={({ field }) => (
                          <ToggleField
                            label="Approval Required"
                            description="Enable approval workflow"
                            value={field.value}
                            onChange={field.onChange}
                            ariaLabel="Toggle approval required"
                          />
                        )}
                      />
                      <Controller
                        name="isLOB"
                        control={control}
                        render={({ field }) => (
                          <ToggleField
                            label="Is LOB"
                            description="Mark as loss-of-business stage"
                            value={field.value}
                            onChange={field.onChange}
                            ariaLabel="Toggle LOB stage"
                          />
                        )}
                      />
                      <Controller
                        name="isClosed"
                        control={control}
                        render={({ field }) => (
                          <ToggleField
                            label="Closed Status"
                            description="Consider stage as closed outcome"
                            value={field.value}
                            onChange={field.onChange}
                            ariaLabel="Toggle closed status"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-black text-gray-900">Stage Rules</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dynamic rule builder</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/admin/stage-rules')}
                        className="inline-flex w-full sm:w-auto justify-center items-center gap-1 px-3 py-2 rounded-xl text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all"
                      >
                        Add Stage Rules
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {fields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-100"
                      >
                        <select
                          {...register(`rules.${index}.field` as const)}
                          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                          aria-label={`Rule field ${index + 1}`}
                        >
                          <option value="">Select field</option>
                          {ruleFieldOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <select
                          {...register(`rules.${index}.condition` as const)}
                          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                          aria-label={`Rule condition ${index + 1}`}
                        >
                          <option value="">Select condition</option>
                          {conditionOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="px-3 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 transition-all w-full sm:w-auto"
                          aria-label={`Remove rule ${index + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="md:col-span-3">
                          {(errors.rules?.[index]?.field || errors.rules?.[index]?.condition) && (
                            <p className="text-[10px] text-red-500 font-bold">
                              {errors.rules?.[index]?.field?.message || errors.rules?.[index]?.condition?.message}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    <button
                      type="button"
                      onClick={() => append({ field: '', condition: '' })}
                      className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Stage Rule
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-50 w-full sm:w-fit">
                          <button
                            type="button"
                            onClick={() => field.onChange('ACTIVE')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              field.value === 'ACTIVE' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'
                            }`}
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange('INACTIVE')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              field.value === 'INACTIVE' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'
                            }`}
                          >
                            Inactive
                          </button>
                        </div>
                      )}
                    />
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

export default React.memo(LeadStageFormModal);
