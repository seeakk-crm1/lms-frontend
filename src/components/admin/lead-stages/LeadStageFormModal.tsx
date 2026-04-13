import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, ChevronDown, Loader2, Save, Search, X } from 'lucide-react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { CreateLeadStageInput, LeadStage, LeadStageRuleAssignment } from '../../../types/leadStage.types';
import { useQuery } from '@tanstack/react-query';
import { getStageRules } from '../../../services/stageRule.api';
import type { StageRule } from '../../../types/stageRule.types';

const leadStageSchema = z.object({
  name: z.string().trim().min(2, 'Lead stage name must be at least 2 characters'),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'Pick a valid color'),
  isApprovalRequired: z.boolean(),
  isLOB: z.boolean(),
  isClosed: z.boolean(),
  stageOrder: z.number().int().min(1, 'Stage order must be greater than 0'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  ruleAssignments: z.array(
    z.object({
      ruleId: z.string().trim().min(1, 'Rule is required'),
      required: z.boolean(),
    }),
  ),
});

type LeadStageFormValues = z.infer<typeof leadStageSchema>;

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

const ToggleField: React.FC<{
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
}> = React.memo(({ label, description, value, onChange, ariaLabel, disabled = false }) => (
  <div className="flex items-center gap-4 p-4 bg-emerald-50/20 rounded-2xl border border-emerald-50/50">
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        onChange(!value);
      }}
      aria-label={ariaLabel}
      aria-pressed={value}
      disabled={disabled}
      className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 shrink-0 ${
        disabled
          ? 'cursor-not-allowed opacity-60'
          : value
            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
            : 'bg-gray-300'
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
  const [isRulesDropdownOpen, setIsRulesDropdownOpen] = useState(false);
  const [ruleSearchTerm, setRuleSearchTerm] = useState('');
  const activeStageRulesQuery = useQuery({
    queryKey: ['stage-rules', 'active-for-lead-stage-modal'],
    queryFn: async () => {
      const response = await getStageRules({ search: '', page: 1, limit: 100, status: 'ACTIVE' });
      return response.data || [];
    },
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
  });
  const {
    register,
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeadStageFormValues>({
    resolver: zodResolver(leadStageSchema),
    defaultValues: {
      name: '',
      color: '#10b981',
      isApprovalRequired: false,
      isLOB: false,
      isClosed: false,
      stageOrder: 1,
      status: 'ACTIVE',
      ruleAssignments: [],
    },
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
      ruleAssignments:
        leadStage?.rules?.map((rule) => ({
          ruleId: rule.id,
          required: rule.required,
        })) || [],
    });
  }, [isOpen, leadStage, reset]);

  const selectedRuleAssignments = watch('ruleAssignments');
  const isClosedStage = watch('isClosed');
  const isLOBStage = watch('isLOB');
  const activeStageRules = activeStageRulesQuery.data || [];

  useEffect(() => {
    if (!isOpen) {
      setIsRulesDropdownOpen(false);
      setRuleSearchTerm('');
    }
  }, [isOpen]);

  const selectedRules = useMemo(
    () =>
      selectedRuleAssignments
        .map((assignment) => {
          const rule = activeStageRules.find((entry: StageRule) => entry.id === assignment.ruleId);
          if (!rule) return null;

          return {
            ...rule,
            assignmentRequired: assignment.required,
          };
        })
        .filter(Boolean) as Array<StageRule & { assignmentRequired: boolean }>,
    [activeStageRules, selectedRuleAssignments],
  );

  const filteredStageRules = useMemo(() => {
    const normalizedSearch = ruleSearchTerm.trim().toLowerCase();
    if (!normalizedSearch) return activeStageRules;

    return activeStageRules.filter((rule: StageRule) => {
      const searchable = [rule.name, rule.inputType, String(rule.sortOrder), rule.required ? 'required' : 'optional']
        .join(' ')
        .toLowerCase();
      return searchable.includes(normalizedSearch);
    });
  }, [activeStageRules, ruleSearchTerm]);

  const updateSelectedRuleAssignments = useCallback(
    (nextAssignments: LeadStageRuleAssignment[]) => {
      const dedupedAssignments = Array.from(
        new Map(nextAssignments.map((assignment) => [assignment.ruleId, assignment])).values(),
      );

      setValue('ruleAssignments', dedupedAssignments, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const toggleRuleSelection = useCallback(
    (ruleId: string) => {
      const nextAssignments = selectedRuleAssignments.some((entry) => entry.ruleId === ruleId)
        ? selectedRuleAssignments.filter((entry) => entry.ruleId !== ruleId)
        : [...selectedRuleAssignments, { ruleId, required: false }];
      updateSelectedRuleAssignments(nextAssignments);
    },
    [selectedRuleAssignments, updateSelectedRuleAssignments],
  );

  const updateRuleRequirement = useCallback(
    (ruleId: string, required: boolean) => {
      updateSelectedRuleAssignments(
        selectedRuleAssignments.map((entry) => (entry.ruleId === ruleId ? { ...entry, required } : entry)),
      );
    },
    [selectedRuleAssignments, updateSelectedRuleAssignments],
  );

  const formSubmit = async (data: LeadStageFormValues) => {
    await onSubmit({
      ...data,
      name: data.name.trim(),
      ruleAssignments: Array.from(new Map(data.ruleAssignments.map((rule) => [rule.ruleId, rule])).values()),
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
                            description="Require review before lead enters this stage"
                            value={field.value}
                            onChange={field.onChange}
                            ariaLabel="Toggle approval required"
                            disabled={false}
                          />
                        )}
                      />
                      <Controller
                        name="isLOB"
                        control={control}
                        render={({ field }) => (
                          <ToggleField
                            label="Is LOB"
                            description="Mark as loss-of-business (Lost)"
                            value={field.value}
                            onChange={(val) => {
                              field.onChange(val);
                              if (val) setValue('isClosed', false, { shouldDirty: true });
                            }}
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
                            description="Mark as successful outcome (Won)"
                            value={field.value}
                            onChange={(val) => {
                              field.onChange(val);
                              if (val) setValue('isLOB', false, { shouldDirty: true });
                            }}
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
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Connect existing rules to this stage</p>
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

                    {activeStageRulesQuery.isLoading ? (
                      <div className="space-y-2" aria-hidden="true">
                        <div className="h-12 w-full rounded-2xl shimmer-bg" />
                        <div className="h-12 w-full rounded-2xl shimmer-bg" />
                      </div>
                    ) : activeStageRulesQuery.data && activeStageRulesQuery.data.length > 0 ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsRulesDropdownOpen((current) => !current)}
                            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                              isRulesDropdownOpen
                                ? 'border-emerald-300 bg-white shadow-lg shadow-emerald-100/40'
                                : 'border-gray-200 bg-gray-50 hover:border-emerald-200 hover:bg-white'
                            }`}
                            aria-expanded={isRulesDropdownOpen}
                            aria-haspopup="listbox"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-black text-gray-900">
                                {selectedRules.length > 0
                                  ? `${selectedRules.length} stage rule${selectedRules.length > 1 ? 's' : ''} selected`
                                  : 'Select stage rules'}
                              </p>
                              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Search and attach existing rules to this stage
                              </p>
                            </div>
                            <ChevronDown
                              className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isRulesDropdownOpen ? 'rotate-180' : ''}`}
                            />
                          </button>

                          <AnimatePresence>
                            {isRulesDropdownOpen ? (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                transition={{ duration: 0.18 }}
                                className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl shadow-emerald-100/30"
                              >
                                <div className="border-b border-gray-100 p-3">
                                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                                    <Search className="h-4 w-4 text-gray-400" />
                                    <input
                                      value={ruleSearchTerm}
                                      onChange={(event) => setRuleSearchTerm(event.target.value)}
                                      placeholder="Search rules by name, type, or order"
                                      className="w-full bg-transparent text-sm font-semibold text-gray-700 outline-none placeholder:text-gray-400"
                                    />
                                  </div>
                                </div>

                                <div className="max-h-72 overflow-y-auto p-2">
                                  {filteredStageRules.length > 0 ? (
                                    filteredStageRules.map((rule: StageRule) => {
                                      const selected = selectedRuleAssignments.some((entry) => entry.ruleId === rule.id);
                                      return (
                                        <button
                                          key={rule.id}
                                          type="button"
                                          onClick={() => toggleRuleSelection(rule.id)}
                                          className={`mb-2 flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all last:mb-0 ${
                                            selected
                                              ? 'border-emerald-200 bg-emerald-50/50'
                                              : 'border-transparent bg-gray-50 hover:border-emerald-100 hover:bg-white'
                                          }`}
                                        >
                                          <span
                                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                              selected
                                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                                : 'border-gray-300 bg-white text-transparent'
                                            }`}
                                          >
                                            <Check className="h-3.5 w-3.5" />
                                          </span>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <p className="text-sm font-black text-gray-900">{rule.name}</p>
                                              <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                {rule.inputType}
                                              </span>
                                              <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                #{rule.sortOrder}
                                              </span>
                                              {rule.required ? (
                                                <span className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-red-600">
                                                  Required
                                                </span>
                                              ) : null}
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })
                                  ) : (
                                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                                      <p className="text-sm font-black text-gray-700">No matching stage rules</p>
                                      <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                        Try a different keyword
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>

                        {selectedRules.length > 0 ? (
                          <div className="space-y-3">
                            {selectedRules.map((rule) => (
                              <motion.div
                                key={rule.id}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-black text-emerald-800">{rule.name}</span>
                                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] uppercase tracking-widest text-emerald-600">
                                      {rule.inputType}
                                    </span>
                                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] uppercase tracking-widest text-gray-500">
                                      #{rule.sortOrder}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700/70">
                                    Choose whether this rule is optional or mandatory for this stage
                                  </p>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                  <select
                                    value={rule.assignmentRequired ? 'MANDATORY' : 'OPTIONAL'}
                                    onChange={(event) => updateRuleRequirement(rule.id, event.target.value === 'MANDATORY')}
                                    className="min-w-[160px] rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                    aria-label={`${rule.name} requirement`}
                                  >
                                    <option value="OPTIONAL">Optional</option>
                                    <option value="MANDATORY">Mandatory</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => toggleRuleSelection(rule.id)}
                                    className="inline-flex items-center justify-center rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm font-bold text-rose-500 transition-all hover:border-rose-200 hover:bg-rose-50"
                                    aria-label={`Remove ${rule.name}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4">
                            <p className="text-sm font-black text-gray-700">No rules selected yet</p>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                              Use the dropdown above to attach one or more rules
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                        <p className="text-sm font-black text-gray-700">No stage rules available</p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                          Create rules first, then connect them here
                        </p>
                      </div>
                    )}

                    {errors.ruleAssignments ? (
                      <p className="text-[10px] text-red-500 font-bold">{errors.ruleAssignments.message}</p>
                    ) : null}
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
