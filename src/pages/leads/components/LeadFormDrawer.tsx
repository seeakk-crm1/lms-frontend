import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CalendarClock, Save, Sparkles, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SearchableSelect from '../../../components/SearchableSelect';
import { useChangeLeadStageMutation, useCreateLeadMutation, useLeadDetailQuery, useLeadMetaQuery, useUpdateLeadMutation } from '../../../hooks/useLeads';
import type { LeadDynamicField } from '../../../modules/admin/lead-dynamics/types';
import { useLeadStore, createEmptyLeadFormValues } from '../../../store/leadStore';
import type { LeadFormValues, LeadListItem, LeadOption } from '../../../types/lead.types';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import LOBModal from './LOBModal';
import StageRulesTransitionModal, { StageRuleValueEntry } from './StageRulesTransitionModal';
import { getStageRules } from '../../../services/stageRule.api';
import type { ListStageRulesResponse, StageRule } from '../../../types/stageRule.types';

interface LeadFormDrawerProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  lead: LeadListItem | null;
  onClose: () => void;
}

const inputClassName =
  'w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

const normalizeStageName = (value?: string | null) => (value || '').toLowerCase().trim();

const toInputDateTime = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const fromLeadToForm = (lead: LeadListItem): LeadFormValues => ({
  name: lead.name || '',
  email: lead.email || '',
  phone: lead.phone || '',
  expectedRevenue: lead.expectedRevenue !== null && lead.expectedRevenue !== undefined ? String(lead.expectedRevenue) : '',
  assignedToId: lead.assignedToId || '',
  stageId: lead.stageId || '',
  lifecycleId: lead.lifecycleId || '',
  sourceId: lead.sourceId || '',
  nextFollowUpAt: toInputDateTime(lead.nextFollowUpAt),
  followUpDescription: '',
  reasonId: lead.lobLogs?.[0]?.reasonId || '',
  remarks: lead.lobLogs?.[0]?.remarks || '',
  dynamicValues: {},
});

const isLobStageOption = (option?: { label: string; isLOB?: boolean }) =>
  Boolean(option?.isLOB || normalizeStageName(option?.label) === 'lob');

const buildDynamicPayload = (
  values: Record<string, string | string[]>,
  fields: LeadDynamicField[],
) =>
  fields
    .map((field) => {
      const rawValue = values[field.id];
      if (Array.isArray(rawValue)) {
        return {
          fieldId: field.id,
          value: rawValue.join(', '),
        };
      }
      return {
        fieldId: field.id,
        value: rawValue?.trim() || '',
      };
    })
    .filter((item) => item.value.length > 0);

const getMissingRequiredDynamicField = (
  values: Record<string, string | string[]>,
  fields: LeadDynamicField[],
): LeadDynamicField | null => {
  for (const field of fields) {
    if (!field.isRequired) continue;

    const rawValue = values[field.id];
    if (Array.isArray(rawValue)) {
      if (rawValue.length === 0) return field;
      continue;
    }

    if (!rawValue || rawValue.trim().length === 0) {
      return field;
    }
  }

  return null;
};

const buildAllowedStageMap = (lifeCycle: any) => {
  const map = new Map<string, Set<string>>();
  const transitions = lifeCycle?.transitions || [];
  transitions.forEach((transition: { fromStageId: string; toStageId: string }) => {
    const current = map.get(transition.fromStageId) || new Set<string>();
    current.add(transition.toStageId);
    map.set(transition.fromStageId, current);
  });
  return map;
};

const getSelectOptions = (items: LeadOption[]) => items.map((item) => ({ value: item.id, label: item.label }));

const LeadFormDrawer: React.FC<LeadFormDrawerProps> = ({ isOpen, mode, lead, onClose }) => {
  const { data: meta, isLoading: metaLoading } = useLeadMetaQuery(isOpen);
  const { data: leadDetails, isLoading: leadLoading } = useLeadDetailQuery(lead?.id, isOpen && mode === 'edit');
  const setDynamicFields = useLeadStore((state) => state.setDynamicFields);
  const createMutation = useCreateLeadMutation();
  const updateMutation = useUpdateLeadMutation();
  const changeStageMutation = useChangeLeadStageMutation();

  const [formValues, setFormValues] = useState<LeadFormValues>(createEmptyLeadFormValues());
  const [lobModalOpen, setLobModalOpen] = useState(false);
  const [pendingStageId, setPendingStageId] = useState<string | null>(null);
  const [previousStageId, setPreviousStageId] = useState<string>('');
  const [stageRulesModalOpen, setStageRulesModalOpen] = useState(false);
  const [stageRulesForTransition, setStageRulesForTransition] = useState<StageRule[]>([]);
  const [pendingTransitionStageId, setPendingTransitionStageId] = useState<string | null>(null);
  const [stageRuleSubmitPayload, setStageRuleSubmitPayload] = useState<StageRuleValueEntry[]>([]);
  const revertFormBeforeRulesRef = useRef<Pick<LeadFormValues, 'stageId' | 'reasonId' | 'remarks'> | null>(null);
  const stageIdBeforeLobRef = useRef<string>('');
  const hydratedLead = leadDetails?.id ? (leadDetails as LeadListItem) : lead;
  const currentStageId = hydratedLead?.stageId || previousStageId || '';

  useEffect(() => {
    if (!meta?.dynamicFields) return;
    setDynamicFields(meta.dynamicFields);
  }, [meta?.dynamicFields, setDynamicFields]);

  useEffect(() => {
    if (!isOpen) {
      setStageRulesModalOpen(false);
      setStageRulesForTransition([]);
      setPendingTransitionStageId(null);
      setStageRuleSubmitPayload([]);
      revertFormBeforeRulesRef.current = null;
      return;
    }

    if (mode === 'edit' && hydratedLead && !isBusy) {
      setFormValues(fromLeadToForm(hydratedLead));
      setPreviousStageId(hydratedLead.stageId || '');
      return;
    }

    setFormValues({
      ...createEmptyLeadFormValues(),
    });
    setPreviousStageId('');
  }, [hydratedLead, isOpen, mode]);

  const stageOptions = meta?.stages || [];
  const lifeCycleOptions = meta?.lifeCycles || [];
  const dynamicFields = (meta?.dynamicFields as LeadDynamicField[]) || [];
  const lobReasonOptions = getSelectOptions(meta?.lobReasons || []);

  const isBusy =
    metaLoading ||
    (mode === 'edit' && leadLoading) ||
    createMutation.isPending ||
    updateMutation.isPending ||
    changeStageMutation.isPending;

  // Apply lifecycle transition constraints only when user explicitly selects a lifecycle.
  const activeLifeCycle = lifeCycleOptions.find((item) => item.id === formValues.lifecycleId);
  const stageTransitionMap = useMemo(() => buildAllowedStageMap(activeLifeCycle), [activeLifeCycle]);

  const allowedStages = useMemo(() => {
    if (mode === 'create' || !currentStageId || stageTransitionMap.size === 0) {
      return stageOptions;
    }

    const allowedIds = stageTransitionMap.get(currentStageId);
    if (!allowedIds || allowedIds.size === 0) {
      return stageOptions;
    }

    return stageOptions.filter((stage) => stage.id === currentStageId || allowedIds.has(stage.id));
  }, [currentStageId, mode, stageOptions, stageTransitionMap]);

  const disabledStageIds = useMemo(() => {
    const allowed = new Set(allowedStages.map((item) => item.id));
    return new Set(stageOptions.filter((item) => !allowed.has(item.id)).map((item) => item.id));
  }, [allowedStages, stageOptions]);

  const handleFieldChange = (field: keyof LeadFormValues, value: any) => {
    if (field === 'stageId') {
      const nextStage = stageOptions.find((item) => item.id === value);
      if (disabledStageIds.has(value)) {
        toast.error('That stage transition is not allowed for the selected life cycle.');
        return;
      }
      if (isLobStageOption(nextStage)) {
        stageIdBeforeLobRef.current = formValues.stageId;
        revertFormBeforeRulesRef.current = {
          stageId: formValues.stageId,
          reasonId: formValues.reasonId,
          remarks: formValues.remarks,
        };
        setPendingStageId(value);
        setLobModalOpen(true);
        return;
      }

      if (mode === 'edit' && currentStageId && value !== currentStageId) {
        void (async () => {
          setStageRuleSubmitPayload([]);
          try {
            const res = (await getStageRules({
              stageId: value,
              status: 'ACTIVE',
              page: 1,
              limit: 100,
              search: '',
            })) as ListStageRulesResponse;
            const rules = res?.data || [];
            if (rules.length > 0) {
              revertFormBeforeRulesRef.current = {
                stageId: formValues.stageId,
                reasonId: formValues.reasonId,
                remarks: formValues.remarks,
              };
              setPendingTransitionStageId(value);
              setStageRulesForTransition(rules);
              setStageRulesModalOpen(true);
              return;
            }
          } catch {
            toast.error('Could not load stage rules for this transition.');
            return;
          }
          setFormValues((current) => ({
            ...current,
            stageId: value,
          }));
          setStageRuleSubmitPayload([]);
        })();
        return;
      }

      setFormValues((current) => ({
        ...current,
        stageId: value,
      }));
      setStageRuleSubmitPayload([]);
      return;
    }

    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleDynamicFieldChange = (fieldId: string, value: string | string[]) => {
    setFormValues((current) => ({
      ...current,
      dynamicValues: {
        ...current.dynamicValues,
        [fieldId]: value,
      },
    }));
  };

  const handleLobConfirm = ({ reasonId, remarks }: { reasonId: string; remarks: string }) => {
    const lobTarget = pendingStageId;
    setFormValues((current) => ({
      ...current,
      stageId: lobTarget || current.stageId,
      reasonId,
      remarks,
    }));
    setLobModalOpen(false);
    setPendingStageId(null);

    if (lobTarget && mode === 'edit') {
      void (async () => {
        try {
          const res = (await getStageRules({
            stageId: lobTarget,
            status: 'ACTIVE',
            page: 1,
            limit: 100,
            search: '',
          })) as ListStageRulesResponse;
          const rules = res?.data || [];
          if (rules.length > 0) {
            revertFormBeforeRulesRef.current = {
              stageId: stageIdBeforeLobRef.current,
              reasonId: '',
              remarks: '',
            };
            setPendingTransitionStageId(lobTarget);
            setStageRulesForTransition(rules);
            setStageRulesModalOpen(true);
          }
        } catch {
          toast.error('Could not load stage rules for this transition.');
        }
      })();
    }
  };

  const handleLobClose = () => {
    setPendingStageId(null);
    setLobModalOpen(false);
  };

  const handleStageRulesConfirm = (entries: StageRuleValueEntry[]) => {
    if (!pendingTransitionStageId) return;
    setFormValues((current) => ({
      ...current,
      stageId: pendingTransitionStageId,
    }));
    setStageRuleSubmitPayload(entries);
    setStageRulesModalOpen(false);
    setPendingTransitionStageId(null);
    setStageRulesForTransition([]);
    revertFormBeforeRulesRef.current = null;
  };

  const handleStageRulesClose = () => {
    const snap = revertFormBeforeRulesRef.current;
    if (snap) {
      setFormValues((current) => ({
        ...current,
        ...snap,
      }));
    }
    setStageRulesModalOpen(false);
    setPendingTransitionStageId(null);
    setStageRulesForTransition([]);
    setStageRuleSubmitPayload([]);
    revertFormBeforeRulesRef.current = null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formValues.name.trim()) {
      toast.error('Lead name is required');
      return;
    }

    if (formValues.nextFollowUpAt) {
      const nextDate = new Date(formValues.nextFollowUpAt);
      if (nextDate.getTime() <= Date.now()) {
        toast.error('Follow-up date must be in the future.');
        return;
      }
    }

    const selectedStage = stageOptions.find((item) => item.id === formValues.stageId);
    if (isLobStageOption(selectedStage) && !formValues.reasonId.trim()) {
      setPendingStageId(formValues.stageId);
      setLobModalOpen(true);
      return;
    }

    if (mode === 'create') {
      const missingRequiredField = getMissingRequiredDynamicField(formValues.dynamicValues, meta?.dynamicFields || []);
      if (missingRequiredField) {
        toast.error(`${missingRequiredField.name} is required.`);
        return;
      }
    }

    const payload = {
      name: formValues.name.trim(),
      email: formValues.email.trim() || undefined,
      phone: formValues.phone.trim() || undefined,
      expectedRevenue: formValues.expectedRevenue ? Number(formValues.expectedRevenue) : undefined,
      assignedToId: formValues.assignedToId || undefined,
      stageId: formValues.stageId || undefined,
      lifecycleId: formValues.lifecycleId || undefined,
      sourceId: formValues.sourceId || undefined,
      nextFollowUpAt: formValues.nextFollowUpAt ? new Date(formValues.nextFollowUpAt).toISOString() : undefined,
      followUpDescription: formValues.followUpDescription.trim() || undefined,
      reasonId: formValues.reasonId.trim() || undefined,
      remarks: formValues.remarks.trim() || undefined,
    };

    const targetStageId = formValues.stageId;
    const dynamicPayload = buildDynamicPayload(formValues.dynamicValues, meta?.dynamicFields || []);
    const stageChanged = mode === 'edit' && Boolean(targetStageId) && targetStageId !== currentStageId;
    const shouldUseStageTransitionFlow = stageChanged && Boolean(currentStageId);

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({ payload, dynamicValues: dynamicPayload });
      } else if (lead?.id) {
        await updateMutation.mutateAsync({
          id: lead.id,
          payload: {
            ...payload,
            email: formValues.email.trim() || null,
            phone: formValues.phone.trim() || null,
            expectedRevenue: formValues.expectedRevenue ? Number(formValues.expectedRevenue) : null,
            assignedToId: formValues.assignedToId || null,
            stageId: shouldUseStageTransitionFlow ? undefined : targetStageId || null,
            lifecycleId: formValues.lifecycleId || null,
            sourceId: formValues.sourceId || null,
            nextFollowUpAt: formValues.nextFollowUpAt ? new Date(formValues.nextFollowUpAt).toISOString() : null,
            reasonId: shouldUseStageTransitionFlow ? undefined : formValues.reasonId.trim() || null,
            remarks: shouldUseStageTransitionFlow ? undefined : formValues.remarks.trim() || null,
          },
          dynamicValues: dynamicPayload,
        });

        if (shouldUseStageTransitionFlow) {
          try {
            const rulesRes = (await getStageRules({
              stageId: targetStageId,
              status: 'ACTIVE',
              page: 1,
              limit: 100,
              search: '',
            })) as ListStageRulesResponse;
            const transitionRules = rulesRes?.data || [];
            if (transitionRules.length > 0 && stageRuleSubmitPayload.length === 0) {
              revertFormBeforeRulesRef.current = {
                stageId: currentStageId,
                reasonId: formValues.reasonId,
                remarks: formValues.remarks,
              };
              setPendingTransitionStageId(targetStageId);
              setStageRulesForTransition(transitionRules);
              setStageRulesModalOpen(true);
              toast.error('Complete the stage information fields before saving.');
              return;
            }
          } catch {
            toast.error('Could not verify stage rules. Try again.');
            return;
          }

          await changeStageMutation.mutateAsync({
            id: lead.id,
            payload: {
              stageId: targetStageId,
              reasonId: formValues.reasonId.trim() || undefined,
              remarks: formValues.remarks.trim() || undefined,
              nextFollowUpAt: formValues.nextFollowUpAt
                ? new Date(formValues.nextFollowUpAt).toISOString()
                : undefined,
              followUpDescription: formValues.followUpDescription.trim() || undefined,
              stageRuleValues: stageRuleSubmitPayload.length ? stageRuleSubmitPayload : [],
            },
          });
        }
      }

      onClose();
    } catch {
      // handled by mutation hooks
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <div className="fixed inset-0 z-[120]">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              aria-label="Close lead drawer overlay"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="absolute inset-y-0 right-0 flex h-full w-full max-w-3xl flex-col border-l border-gray-100 bg-white shadow-2xl"
            >
              <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{mode === 'create' ? 'New Lead' : 'Edit Lead'}</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {mode === 'create' ? 'Add a new pipeline opportunity' : `Update ${lead?.name || 'lead'}`}
                    </h2>
                    <p className="mt-1 max-w-xl text-sm font-semibold text-gray-500">
                      Capture general lead details, follow-up cadence, and any active advanced fields defined by the workspace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl border border-gray-200 p-2 text-gray-400 transition-colors hover:bg-gray-50"
                    aria-label="Close lead drawer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                {isBusy && metaLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-20 rounded-3xl shimmer-bg" />
                    <div className="h-44 rounded-3xl shimmer-bg" />
                    <div className="h-56 rounded-3xl shimmer-bg" />
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <section className="rounded-3xl border border-gray-100 bg-gray-50/70 p-5">
                      <div className="mb-5">
                        <h3 className="text-lg font-black text-gray-900">General</h3>
                        <p className="text-sm font-semibold text-gray-500">Core contact details, source, owner, and expected value.</p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-black text-gray-900">Lead Name <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={formValues.name}
                            onChange={(event) => handleFieldChange('name', event.target.value)}
                            className={inputClassName}
                            placeholder="Enter lead or account name"
                            required
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-black text-gray-900">Mobile</label>
                          <input
                            type="text"
                            value={formValues.phone}
                            onChange={(event) => handleFieldChange('phone', event.target.value)}
                            className={inputClassName}
                            placeholder="9876543210"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-black text-gray-900">Email</label>
                          <input
                            type="email"
                            value={formValues.email}
                            onChange={(event) => handleFieldChange('email', event.target.value)}
                            className={inputClassName}
                            placeholder="lead@company.com"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-black text-gray-900">Expected Revenue</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={formValues.expectedRevenue}
                            onChange={(event) => handleFieldChange('expectedRevenue', event.target.value)}
                            className={inputClassName}
                            placeholder="250000"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-black text-gray-900">Assigned To</label>
                          <SearchableSelect
                            name="assignedToId"
                            value={formValues.assignedToId}
                            options={getSelectOptions(meta?.users || [])}
                            placeholder="Select owner"
                            onChange={(event) => handleFieldChange('assignedToId', event.target.value)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-black text-gray-900">Source</label>
                          <SearchableSelect
                            name="sourceId"
                            value={formValues.sourceId}
                            options={getSelectOptions(meta?.sources || [])}
                            placeholder="Select source"
                            onChange={(event) => handleFieldChange('sourceId', event.target.value)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-black text-gray-900">Lead Life Cycle</label>
                          <SearchableSelect
                            name="lifecycleId"
                            value={formValues.lifecycleId}
                            options={getSelectOptions(meta?.lifeCycles || [])}
                            placeholder="Select lifecycle"
                            allowClear
                            clearLabel="No lifecycle"
                            onChange={(event) => handleFieldChange('lifecycleId', event.target.value)}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-black text-gray-900">Stage</label>
                          <div className="space-y-2">
                            <SearchableSelect
                              name="stageId"
                              value={formValues.stageId}
                              options={stageOptions.map((item) => ({
                                value: item.id,
                                label: disabledStageIds.has(item.id) ? `${item.label} (Locked)` : item.label,
                              }))}
                              placeholder="Select pipeline stage"
                              onChange={(event) => handleFieldChange('stageId', event.target.value)}
                            />
                            {mode === 'edit' && disabledStageIds.size > 0 ? (
                              <p className="text-xs font-semibold text-gray-500">
                                Invalid stage transitions are labeled as locked based on the selected life cycle.
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                          <CalendarClock className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-gray-900">Follow-up</h3>
                          <p className="text-sm font-semibold text-gray-500">Keep the next touchpoint visible directly in the leads table.</p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-black text-gray-900">Next Follow-up</label>
                          <input
                            type="datetime-local"
                            value={formValues.nextFollowUpAt}
                            onChange={(event) => handleFieldChange('nextFollowUpAt', event.target.value)}
                            className={inputClassName}
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="mb-2 block text-sm font-black text-gray-900">Follow-up Note</label>
                          <textarea
                            rows={4}
                            value={formValues.followUpDescription}
                            onChange={(event) => handleFieldChange('followUpDescription', event.target.value)}
                            className={`${inputClassName} resize-none`}
                            placeholder="Describe the next customer action, context, or talking point"
                          />
                        </div>
                      </div>
                    </section>

                    {meta?.dynamicFields?.length ? (
                      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="mb-5">
                          <h3 className="text-lg font-black text-gray-900">Advanced Fields</h3>
                          <p className="text-sm font-semibold text-gray-500">
                            These inputs are generated from the active Lead Dynamics configuration for this workspace.
                          </p>
                          {mode === 'edit' ? (
                            <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-amber-600">
                              <AlertCircle className="h-4 w-4" />
                              Existing dynamic values are preserved unless you explicitly overwrite them here.
                            </p>
                          ) : null}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {dynamicFields.map((field) => (
                            <DynamicFieldRenderer
                              key={field.id}
                              field={field}
                              value={formValues.dynamicValues[field.id] || (field.inputType === 'CHECKBOX' ? [] : '')}
                              onChange={handleDynamicFieldChange}
                            />
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {formValues.reasonId || formValues.remarks ? (
                      <section className="rounded-3xl border border-rose-100 bg-rose-50/70 p-5">
                        <h3 className="text-lg font-black text-gray-900">LOB Context</h3>
                        <p className="mt-1 text-sm font-semibold text-gray-500">
                          This lead is being tracked as LOB or is ready for a LOB transition.
                        </p>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-black text-gray-900">LOB Reason</label>
                            <SearchableSelect
                              options={lobReasonOptions}
                              value={formValues.reasonId}
                              onChange={(event) => handleFieldChange('reasonId', event.target.value)}
                              placeholder={lobReasonOptions.length ? 'Select LOB reason' : 'No active LOB reasons'}
                              name="reasonId"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-black text-gray-900">Remarks <span className="text-xs font-semibold text-gray-400">(Optional)</span></label>
                            <textarea
                              rows={4}
                              value={formValues.remarks}
                              onChange={(event) => handleFieldChange('remarks', event.target.value)}
                              className={`${inputClassName} resize-none`}
                              placeholder="Explain the loss context"
                            />
                          </div>
                        </div>
                      </section>
                    ) : null}

                    <div className="sticky bottom-0 z-10 border-t border-gray-100 bg-white/95 px-1 py-4 backdrop-blur">
                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-black text-gray-500 transition-colors hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isBusy}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <Save className="h-4 w-4" />
                          <span>
                            {isBusy ? 'Saving…' : mode === 'create' ? 'Create Lead' : 'Save Changes'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>

      <LOBModal
        isOpen={lobModalOpen}
        isSubmitting={changeStageMutation.isPending || updateMutation.isPending}
        initialReasonId={formValues.reasonId}
        initialRemarks={formValues.remarks}
        lobReasonOptions={lobReasonOptions}
        onClose={handleLobClose}
        onConfirm={handleLobConfirm}
      />

      <StageRulesTransitionModal
        isOpen={stageRulesModalOpen}
        rules={stageRulesForTransition}
        isSubmitting={changeStageMutation.isPending || updateMutation.isPending}
        onClose={handleStageRulesClose}
        onConfirm={handleStageRulesConfirm}
      />
    </>
  );
};

export default memo(LeadFormDrawer);
