import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CalendarClock, Save, Sparkles, X, DollarSign, PlusCircle, FileText, History, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SearchableSelect from '../../../components/SearchableSelect';
import { useChangeLeadStageMutation, useCreateLeadMutation, useLeadDetailQuery, useLeadMetaQuery, useUpdateLeadMutation, useLeadRemarksQuery } from '../../../hooks/useLeads';
import type { LeadDynamicField } from '../../../modules/admin/lead-dynamics/types';
import { useLeadStore, createEmptyLeadFormValues } from '../../../store/leadStore';
import type { FollowUpType } from '../../../types/followup.types';
import { FOLLOW_UP_TYPE_OPTIONS } from '../../../modules/followups/followUpTypeUi';
import type { LeadFormValues, LeadListItem, LeadOption } from '../../../types/lead.types';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import { useLeadFieldEdits } from './useLeadFieldEdits';
import { FieldEditBadge } from './FieldEditBadge';
import LOBModal from './LOBModal';
import StageRulesTransitionModal, { StageRuleValueEntry } from './StageRulesTransitionModal';
import { getLeadTransitionStageRules, getStageRules } from '../../../services/stageRule.api';
import type { ListStageRulesResponse, StageRule } from '../../../types/stageRule.types';
import useAuthStore from '../../../store/useAuthStore';
import { useActiveLOBReasonOptions } from '../../../hooks/useActiveLOBReasonOptions';
import { useWeeklyOffScheduleGuard } from '../../../hooks/useWeeklyOffScheduleGuard';
import WhatsAppActionButton from '../../../components/common/WhatsAppActionButton';
import { LEAD_WHATSAPP_PERMISSIONS } from '../../../constants/whatsappPermissions';
import { getLeadPayments, updateLeadTotalAmount, requestAdvancePayment } from '../../../services/leads.api';

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

const fromSavedDynamicValues = (lead: LeadListItem): Record<string, string | string[]> => {
  const values: Record<string, string | string[]> = {};
  for (const entry of lead.dynamicValues || []) {
    values[entry.fieldId] =
      entry.field?.inputType === 'CHECKBOX'
        ? entry.value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : entry.value;
  }
  return values;
};

const fromLeadToForm = (lead: LeadListItem): LeadFormValues => ({
  name: lead.name || '',
  email: lead.email || '',
  phone: lead.phone || '',
  companyName: lead.companyName || '',
  address: lead.address || '',
  assignedToId: lead.assignedToId || '',
  stageId: lead.stageId || '',
  lifecycleId: lead.lifecycleId || '',
  sourceId: lead.sourceId || '',
  nextFollowUpAt: toInputDateTime(lead.nextFollowUpAt),
  nextFollowUpType: (lead.nextFollowUpType as FollowUpType) || 'CALL',
  followUpDescription: lead.followUpDescription || '',
  reasonId: lead.lobLogs?.[0]?.reasonId || '',
  leadRemarks: lead.remarks || '',
  remarks: lead.lobLogs?.[0]?.remarks || '',
  dynamicValues: fromSavedDynamicValues(lead),
  products: (lead.products || []).map((item) => ({
    productId: item.productId || '',
    quantity: item.quantity || 1,
  })).filter((item) => item.productId),
  totalAmount: (lead as any).totalAmount || 0,
});

const isLobStageOption = (option?: { label: string; isLOB?: boolean }) =>
  Boolean(option?.isLOB || normalizeStageName(option?.label) === 'lob');

const buildDynamicPayload = (
  values: Record<string, string | string[]>,
  fields: LeadDynamicField[],
  includeEmpty = false,
) => {
  const payload = fields
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
  return includeEmpty
    ? fields.map((field) => payload.find((item) => item.fieldId === field.id) || { fieldId: field.id, value: '' })
    : payload;
};

const calculateProductTotal = (
  selections: LeadFormValues['products'],
  products: Array<{ id: string; unitPrice: number }>,
) => {
  const productById = new Map(products.map((product) => [product.id, product]));
  return selections.reduce((sum, item) => {
    const product = productById.get(item.productId);
    return sum + Number(product?.unitPrice || 0) * Math.max(1, Number(item.quantity || 1));
  }, 0);
};

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

const containsUnsafeMarkup = (value: string): boolean => /<[^>]*>/u.test(value) || /javascript\s*:/iu.test(value);

type ValidationErrorItem = { field: string; message: string };
type ValidationErrorMap = Record<string, string>;

const compactObject = <T extends Record<string, any>>(value: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined) return false;
      if (typeof entry === 'number' && !Number.isFinite(entry)) return false;
      if (Array.isArray(entry) && entry.length === 0) return false;
      return true;
    }),
  ) as Partial<T>;

const optionalTrimmed = (value?: string | null) => {
  const trimmed = (value || '').trim();
  return trimmed || undefined;
};

const nullableTrimmed = (value?: string | null) => {
  const trimmed = (value || '').trim();
  return trimmed || null;
};

const toIsoOrUndefined = (value?: string | null) => {
  const raw = (value || '').trim();
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const toIsoOrNull = (value?: string | null) => {
  const iso = toIsoOrUndefined(value);
  return iso || null;
};

const buildValidationMap = (errors?: ValidationErrorItem[] | Record<string, string[] | string>): ValidationErrorMap => {
  if (!errors) return {};
  if (Array.isArray(errors)) {
    return errors.reduce<ValidationErrorMap>((acc, item) => {
      if (item?.field && item?.message) acc[item.field] = item.message;
      return acc;
    }, {});
  }
  return Object.entries(errors).reduce<ValidationErrorMap>((acc, [field, messages]) => {
    const first = Array.isArray(messages) ? messages[0] : messages;
    if (first) acc[field] = first;
    return acc;
  }, {});
};

const getValidationMessage = (errors: ValidationErrorMap, ...fields: string[]) =>
  fields.map((field) => errors[field]).find(Boolean) || '';

const LeadFormDrawer: React.FC<LeadFormDrawerProps> = ({ isOpen, mode, lead, onClose }) => {
  const { data: meta, isLoading: metaLoading } = useLeadMetaQuery(isOpen);
  const { data: leadDetails, isLoading: leadLoading } = useLeadDetailQuery(lead?.id, isOpen && mode === 'edit');
  const { data: remarksData, isLoading: remarksLoading } = useLeadRemarksQuery(lead?.id, isOpen && mode === 'edit');
  const { data: fieldEdits } = useLeadFieldEdits(isOpen && mode === 'edit' ? lead?.id : undefined);
  const setDynamicFields = useLeadStore((state) => state.setDynamicFields);
  const createMutation = useCreateLeadMutation();
  const updateMutation = useUpdateLeadMutation();
  const changeStageMutation = useChangeLeadStageMutation();
  const currentUser = useAuthStore((state) => state.user);
  const { confirmIfWeeklyOff, WeeklyOffScheduleModal } = useWeeklyOffScheduleGuard();

  const [formValues, setFormValues] = useState<LeadFormValues>(createEmptyLeadFormValues());
  const [lobModalOpen, setLobModalOpen] = useState(false);
  const [lobExitModalOpen, setLobExitModalOpen] = useState(false);
  const [lobExitReason, setLobExitReason] = useState('');
  const [pendingStageId, setPendingStageId] = useState<string | null>(null);
  const [previousStageId, setPreviousStageId] = useState<string>('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [localAdvances, setLocalAdvances] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrorMap>({});

  const ErrorText = ({ field }: { field: string | string[] }) => {
    const message = Array.isArray(field)
      ? getValidationMessage(validationErrors, ...field)
      : validationErrors[field];
    if (!message) return null;
    return <p className="mt-1 text-xs font-bold text-red-600">{message}</p>;
  };

  useEffect(() => {
    if (isOpen) {
      console.log('[Diagnostic] Payment section initialized');
      if (mode === 'create') {
        console.log('[Diagnostic] Lead Create page loaded');
        setLocalAdvances([]);
      } else {
        console.log('[Diagnostic] Lead Edit page loaded');
      }
    }
  }, [isOpen, mode]);

  const FieldLabel = ({ fieldKey, label, required = false, className = "mb-2 block text-sm font-black text-gray-900" }: { fieldKey: string, label: string, required?: boolean, className?: string }) => {
    const summary = fieldEdits?.summaries.find(s => s.fieldKey === fieldKey);
    const histories = fieldEdits?.histories.filter(h => h.fieldKey === fieldKey) || [];
    return (
      <label className={`${className} flex items-center`}>
        {label} {required && <span className="text-red-500 ml-1">*</span>}
        <FieldEditBadge summary={summary} histories={histories} fieldName={label} />
      </label>
    );
  };


  const [paymentData, setPaymentData] = useState<any>(null);
  const [totalAmountReasonModalOpen, setTotalAmountReasonModalOpen] = useState(false);
  const [totalAmountReason, setTotalAmountReason] = useState('');
  const [addAdvanceModalOpen, setAddAdvanceModalOpen] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advancePaymentDate, setAdvancePaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [advanceRemarks, setAdvanceRemarks] = useState('');
  const [advanceProofUrl, setAdvanceProofUrl] = useState('');
  const [isSubmittingTotalAmountReason, setIsSubmittingTotalAmountReason] = useState(false);
  const [isSubmittingAdvance, setIsSubmittingAdvance] = useState(false);

  useEffect(() => {
    if (addAdvanceModalOpen) {
      console.log('[Diagnostic] Advance popup opened');
    }
  }, [addAdvanceModalOpen]);

  const fetchPayments = async () => {
    if (lead?.id) {
      try {
        const res = await getLeadPayments(lead.id);
        if (res.success) {
          setPaymentData(res.data);
          setFormValues((prev) => ({
            ...prev,
            totalAmount: res.data.totalAmount || 0,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch payments:', err);
      }
    }
  };

  useEffect(() => {
    if (isOpen && mode === 'edit' && lead?.id) {
      fetchPayments();
    } else {
      setPaymentData(null);
    }
  }, [isOpen, mode, lead?.id]);

  const handleSaveTotalAmountReason = async () => {
    if (!totalAmountReason.trim()) {
      toast.error('Reason is required');
      return;
    }
    if (!lead?.id) return;
    setIsSubmittingTotalAmountReason(true);
    try {
      await updateLeadTotalAmount(lead.id, {
        totalAmount: Number(formValues.totalAmount),
        reason: totalAmountReason.trim(),
      });
      toast.success('Total amount updated successfully');
      setTotalAmountReasonModalOpen(false);
      await fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update total amount');
    } finally {
      setIsSubmittingTotalAmountReason(false);
    }
  };

  const handleSaveAdvancePayment = async () => {
    console.log('[Diagnostic] Submit Request clicked');
    if (!advanceAmount || Number(advanceAmount) <= 0) {
      toast.error('Advance amount must be greater than zero.');
      return;
    }
    if (!advancePaymentDate) {
      toast.error('Payment date is required.');
      return;
    }

    if (mode === 'create') {
      const newAdv = {
        amount: Number(advanceAmount),
        paymentDate: new Date(advancePaymentDate).toISOString(),
        remarks: advanceRemarks.trim(),
        proofUrl: advanceProofUrl || null,
        status: 'PENDING',
        requestedBy: { name: currentUser?.displayName || currentUser?.name || 'You' },
        createdAt: new Date().toISOString(),
      };
      setLocalAdvances((prev) => [...prev, newAdv]);
      console.log('[Diagnostic] Request submitted');
      toast.success('Advance payment added locally.');
      console.log('[Diagnostic] Success notification displayed');
      setAddAdvanceModalOpen(false);
      setAdvanceAmount('');
      setAdvanceRemarks('');
      setAdvanceProofUrl('');
      return;
    }

    if (!lead?.id) return;
    setIsSubmittingAdvance(true);
    try {
      await requestAdvancePayment(lead.id, {
        amount: Number(advanceAmount),
        paymentDate: new Date(advancePaymentDate).toISOString(),
        remarks: advanceRemarks.trim(),
        proofUrl: advanceProofUrl || undefined,
      });
      console.log('[Diagnostic] Request submitted');
      toast.success('Advance payment approval requested successfully.');
      console.log('[Diagnostic] Success notification displayed');
      setAddAdvanceModalOpen(false);
      setAdvanceAmount('');
      setAdvanceRemarks('');
      setAdvanceProofUrl('');
      await fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request advance payment.');
    } finally {
      setIsSubmittingAdvance(false);
    }
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error('Proof image size must be 1 MB or less.');
      e.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, PNG, and WEBP formats are allowed.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAdvanceProofUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  const [stageRulesModalOpen, setStageRulesModalOpen] = useState(false);
  const [stageRulesForTransition, setStageRulesForTransition] = useState<StageRule[]>([]);
  const [pendingTransitionStageId, setPendingTransitionStageId] = useState<string | null>(null);
  const [stageRuleSubmitPayload, setStageRuleSubmitPayload] = useState<StageRuleValueEntry[]>([]);
  const revertFormBeforeRulesRef = useRef<Pick<LeadFormValues, 'stageId' | 'reasonId' | 'remarks'> | null>(null);
  const stageIdBeforeLobRef = useRef<string>('');
  const hydratedLead = leadDetails?.id ? (leadDetails as LeadListItem) : lead;
  const currentStageId = hydratedLead?.stageId || previousStageId || '';
  const stageOptions = meta?.stages || [];
  const currentStage = stageOptions.find((s: LeadOption) => s.id === currentStageId);
  const currentStageIsLob = isLobStageOption(currentStage);
  const advancePaymentsList = mode === 'edit' && paymentData
    ? paymentData.advancePayments || []
    : localAdvances;

  useEffect(() => {
    if (!meta?.dynamicFields) return;
    setDynamicFields(meta.dynamicFields);
  }, [meta?.dynamicFields, setDynamicFields]);

  useEffect(() => {
    if (!isOpen) {
      setValidationErrors({});
      setStageRulesModalOpen(false);
      setStageRulesForTransition([]);
      setPendingTransitionStageId(null);
      setStageRuleSubmitPayload([]);
      revertFormBeforeRulesRef.current = null;
      return;
    }

    if (mode === 'edit' && hydratedLead && !isBusy) {
      if (revertFormBeforeRulesRef.current || pendingStageId || pendingTransitionStageId) {
        return;
      }
      setValidationErrors({});
      setFormValues(fromLeadToForm(hydratedLead));
      setPreviousStageId(hydratedLead.stageId || '');
      return;
    }

    setFormValues({
      ...createEmptyLeadFormValues(),
      assignedToId: currentUser?.id || '',
    });
    setValidationErrors({});
    setPreviousStageId('');
  }, [hydratedLead, isOpen, mode]);

  const lifeCycleOptions = meta?.lifeCycles || [];
  const dynamicFields = (meta?.dynamicFields as LeadDynamicField[]) || [];
  const { options: lobReasonOptions } = useActiveLOBReasonOptions(isOpen, meta?.lobReasons || []);
  const canAssignOtherUsers = Boolean(meta?.canAssignOtherUsers);
  const productOptions = meta?.products || [];
  const allRemarks = remarksData?.data || [];
  const lobReturnRemarks = allRemarks.filter((remark: any) => remark.remarkType === 'LOB_RETURN');
  const generalRemarks = allRemarks.filter((remark: any) => remark.remarkType !== 'LOB_RETURN');
  const selectedFormStage = stageOptions.find((item) => item.id === formValues.stageId);
  const showLobContext = Boolean(isLobStageOption(selectedFormStage) && (formValues.reasonId || formValues.remarks));

  const isBusy =
    metaLoading ||
    (mode === 'edit' && leadLoading) ||
    createMutation.isPending ||
    updateMutation.isPending ||
    changeStageMutation.isPending;

  // Apply lifecycle transition constraints only when user explicitly selects a lifecycle.
  const activeLifeCycle = lifeCycleOptions.find((item) => item.id === formValues.lifecycleId);
  const stageTransitionMap = useMemo(() => buildAllowedStageMap(activeLifeCycle), [activeLifeCycle]);

  const allowedStages = stageOptions;

  const disabledStageIds = useMemo(() => new Set<string>(), []);

  useEffect(() => {
    if (!isOpen || formValues.products.length === 0) return;
    const total = calculateProductTotal(formValues.products, productOptions);
    setFormValues((current) => (
      Number(current.totalAmount || 0) === total ? current : { ...current, totalAmount: total }
    ));
  }, [formValues.products, isOpen, productOptions]);

  const handleAddProductRow = () => {
    setValidationErrors((current) => {
      const next = { ...current };
      delete next.products;
      return next;
    });
    setFormValues((current) => ({
      ...current,
      products: [...current.products, { productId: '', quantity: 1 }],
    }));
  };

  const handleProductRowChange = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    setValidationErrors((current) => {
      const next = { ...current };
      delete next.products;
      delete next[`products.${index}.${field}`];
      return next;
    });
    setFormValues((current) => {
      const products = current.products.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === 'quantity' ? Math.max(1, Number(value) || 1) : String(value),
            }
          : item,
      );
      return {
        ...current,
        products,
        totalAmount: calculateProductTotal(products, productOptions),
      };
    });
  };

  const handleRemoveProductRow = (index: number) => {
    setValidationErrors((current) => {
      const next = { ...current };
      delete next.products;
      delete next[`products.${index}.productId`];
      delete next[`products.${index}.quantity`];
      return next;
    });
    setFormValues((current) => {
      const products = current.products.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        products,
        totalAmount: products.length ? calculateProductTotal(products, productOptions) : current.totalAmount,
      };
    });
  };

  const handleFieldChange = (field: keyof LeadFormValues, value: any) => {
    setValidationErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (field === 'stageId') {
      const nextStage = stageOptions.find((item) => item.id === value);
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

      if (currentStageIsLob && !isLobStageOption(nextStage)) {
        revertFormBeforeRulesRef.current = {
          stageId: formValues.stageId,
          reasonId: formValues.reasonId,
          remarks: formValues.remarks,
        };
        setPendingStageId(value);
        setLobExitModalOpen(true);
        return;
      }

      if (mode === 'edit' && currentStageId && value !== currentStageId) {
        void (async () => {
          setStageRuleSubmitPayload([]);
          try {
            const res = (await getLeadTransitionStageRules(value)) as ListStageRulesResponse;
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
    setValidationErrors((current) => {
      const next = { ...current };
      delete next.dynamicValues;
      Object.keys(next).forEach((key) => {
        if (key.startsWith('dynamicValues.')) delete next[key];
      });
      return next;
    });
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
          const res = (await getLeadTransitionStageRules(lobTarget)) as ListStageRulesResponse;
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
    setValidationErrors({});

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

      const proceed = await confirmIfWeeklyOff(formValues.nextFollowUpAt);
      if (!proceed) return;
    }

    if (formValues.leadRemarks.length > 1000) {
      toast.error('Remarks must be 1000 characters or fewer.');
      return;
    }

    if (containsUnsafeMarkup(formValues.leadRemarks)) {
      toast.error('Remarks cannot contain HTML or script content.');
      return;
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

    const hasAmountChanged = mode === 'edit' && paymentData && Number(formValues.totalAmount) !== Number(paymentData.totalAmount);
    if (hasAmountChanged && !totalAmountReason.trim()) {
      setTotalAmountReasonModalOpen(true);
      return;
    }

    const totalAmount = Number(formValues.totalAmount || 0);
    const safeProducts = formValues.products
      .filter((item) => item.productId && productOptions.some((product: any) => product.id === item.productId))
      .map((item) => ({
        productId: item.productId,
        quantity: Math.max(1, Math.trunc(Number(item.quantity) || 1)),
      }));
    const safeAdvances = localAdvances
      .map((item) => {
        const amount = Number(item.amount);
        const paymentDate = toIsoOrUndefined(item.paymentDate);
        if (!Number.isFinite(amount) || amount <= 0 || !paymentDate) return null;
        return compactObject({
          amount,
          paymentDate,
          remarks: optionalTrimmed(item.remarks),
          proofUrl: optionalTrimmed(item.proofUrl),
        });
      })
      .filter(Boolean);

    const payload = compactObject({
      name: formValues.name.trim(),
      email: optionalTrimmed(formValues.email),
      phone: optionalTrimmed(formValues.phone),
      companyName: optionalTrimmed(formValues.companyName),
      address: optionalTrimmed(formValues.address),
      assignedToId: canAssignOtherUsers
        ? optionalTrimmed(formValues.assignedToId)
        : currentUser?.id,
      stageId: optionalTrimmed(formValues.stageId),
      lifecycleId: optionalTrimmed(formValues.lifecycleId),
      sourceId: optionalTrimmed(formValues.sourceId),
      nextFollowUpAt: toIsoOrUndefined(formValues.nextFollowUpAt),
      nextFollowUpType: formValues.nextFollowUpType,
      followUpDescription: optionalTrimmed(formValues.followUpDescription),
      reasonId: optionalTrimmed(formValues.reasonId),
      remarks: optionalTrimmed(formValues.leadRemarks),
      lobRemarks: optionalTrimmed(formValues.remarks),
      totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
      products: safeProducts,
      ...(mode === 'create' ? { advancePayments: safeAdvances } : {}),
    });

    const targetStageId = formValues.stageId;
    const selectedTargetStage = stageOptions.find((item) => item.id === targetStageId);
    const isMovingOutOfLob = currentStageIsLob && Boolean(selectedTargetStage) && !isLobStageOption(selectedTargetStage);
    const stageTransitionRemarks = isMovingOutOfLob
      ? formValues.leadRemarks.trim()
      : formValues.remarks.trim();
    const dynamicPayload = buildDynamicPayload(formValues.dynamicValues, meta?.dynamicFields || [], mode === 'edit');
    const stageChanged = mode === 'edit' && Boolean(targetStageId) && targetStageId !== currentStageId;
    const shouldUseStageTransitionFlow = stageChanged && Boolean(currentStageId);
    const payloadWithDynamicValues = compactObject({
      ...payload,
      dynamicValues: dynamicPayload,
    });

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({ payload: payloadWithDynamicValues });
        console.log('[Diagnostic] Lead created successfully');
      } else if (lead?.id) {
        await updateMutation.mutateAsync({
          id: lead.id,
          payload: {
            ...payloadWithDynamicValues,
            email: nullableTrimmed(formValues.email),
            phone: nullableTrimmed(formValues.phone),
            companyName: nullableTrimmed(formValues.companyName),
            address: nullableTrimmed(formValues.address),
            assignedToId: canAssignOtherUsers ? nullableTrimmed(formValues.assignedToId) : undefined,
            stageId: shouldUseStageTransitionFlow ? undefined : targetStageId || null,
            lifecycleId: formValues.lifecycleId || null,
            sourceId: formValues.sourceId || null,
            nextFollowUpAt: toIsoOrNull(formValues.nextFollowUpAt),
            nextFollowUpType: formValues.nextFollowUpType,
            reasonId: shouldUseStageTransitionFlow ? undefined : formValues.reasonId.trim() || null,
            remarks:
              isMovingOutOfLob && shouldUseStageTransitionFlow
                ? undefined
                : nullableTrimmed(formValues.leadRemarks),
            lobRemarks: shouldUseStageTransitionFlow ? undefined : nullableTrimmed(formValues.remarks),
          },
        });

        if (shouldUseStageTransitionFlow) {
          try {
            const rulesRes = (await getLeadTransitionStageRules(targetStageId)) as ListStageRulesResponse;
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
              reasonId: isMovingOutOfLob ? undefined : formValues.reasonId.trim() || undefined,
              remarks: stageTransitionRemarks || undefined,
              nextFollowUpAt: formValues.nextFollowUpAt
                ? new Date(formValues.nextFollowUpAt).toISOString()
                : undefined,
              nextFollowUpType: formValues.nextFollowUpType,
              followUpDescription: formValues.followUpDescription.trim() || undefined,
              stageRuleValues: stageRuleSubmitPayload.length ? stageRuleSubmitPayload : [],
            },
          });
        }
      }

      onClose();
    } catch (error: any) {
      const status = error?.response?.status;
      const responseErrors = error?.response?.data?.errors;
      if (status === 422) {
        if (responseErrors) {
          const nextErrors = buildValidationMap(responseErrors);
          setValidationErrors(nextErrors);
          const firstMessage = Object.values(nextErrors)[0];
          if (firstMessage) {
            toast.error(firstMessage);
          }
        } else if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Validation failed.');
        }
      } else {
        toast.error(error?.response?.data?.message || 'Could not save lead.');
      }
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
                        <p className="text-sm font-semibold text-gray-500">
                          Core contact details, company, address, source, and owner.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <FieldLabel fieldKey="name" label="Lead Name" required />
                          <input
                            type="text"
                            value={formValues.name}
                            onChange={(event) => handleFieldChange('name', event.target.value)}
                            className={inputClassName}
                            placeholder="Enter lead or account name"
                            required
                          />
                          <ErrorText field="name" />
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <FieldLabel fieldKey="phone" label="Mobile" className="block text-sm font-black text-gray-900" />
                            {formValues.phone ? (
                              <WhatsAppActionButton
                                phone={formValues.phone}
                                variant="inline"
                                stopPropagation={false}
                                requiredPermissions={LEAD_WHATSAPP_PERMISSIONS}
                                title="Open WhatsApp"
                                audit={
                                  lead?.id
                                    ? {
                                        entityType: 'Lead',
                                        entityId: lead.id,
                                        entityName: formValues.name || lead.name,
                                      }
                                    : undefined
                                }
                              />
                            ) : null}
                          </div>
                          <input
                            type="text"
                            value={formValues.phone}
                            onChange={(event) => handleFieldChange('phone', event.target.value)}
                            className={inputClassName}
                            placeholder="9876543210"
                          />
                          <ErrorText field="phone" />
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <FieldLabel fieldKey="email" label="Email" className="block text-sm font-black text-gray-900" />
                            {formValues.email && (
                              <a 
                                href={`mailto:${formValues.email}`}
                                className="text-[10px] font-bold text-emerald-600 hover:underline"
                              >
                                Send Email
                              </a>
                            )}
                          </div>
                          <input
                            type="email"
                            value={formValues.email}
                            onChange={(event) => handleFieldChange('email', event.target.value)}
                            className={inputClassName}
                            placeholder="lead@company.com"
                          />
                          <ErrorText field="email" />
                        </div>

                        <div>
                          <FieldLabel fieldKey="companyName" label="Company Name" />
                          <input
                            type="text"
                            value={formValues.companyName}
                            onChange={(event) => handleFieldChange('companyName', event.target.value)}
                            className={inputClassName}
                            placeholder="Acme Pvt Ltd"
                          />
                          <ErrorText field="companyName" />
                        </div>

                        <div className="md:col-span-2">
                          <FieldLabel fieldKey="address" label="Address" />
                          <textarea
                            rows={3}
                            value={formValues.address}
                            onChange={(event) => handleFieldChange('address', event.target.value)}
                            className={`${inputClassName} resize-none`}
                            placeholder="Street, city, state, PIN"
                          />
                          <ErrorText field="address" />
                        </div>

                        <div>
                          <FieldLabel fieldKey="assignedToId" label="Assigned To" />
                          {canAssignOtherUsers ? (
                            <SearchableSelect
                              name="assignedToId"
                              value={formValues.assignedToId}
                              options={getSelectOptions(meta?.users || [])}
                              placeholder="Select owner"
                              onChange={(event) => handleFieldChange('assignedToId', event.target.value)}
                            />
                          ) : (
                            <div className={`${inputClassName} flex min-h-[50px] items-center`}>
                              {hydratedLead?.assignedTo?.displayName ||
                               hydratedLead?.assignedTo?.name ||
                               (mode === 'create'
                                 ? currentUser?.name || currentUser?.email || 'You'
                                 : 'Unassigned')}
                            </div>
                          )}
                          <ErrorText field="assignedToId" />
                        </div>

                        <div>
                          <FieldLabel fieldKey="sourceId" label="Source" />
                          <SearchableSelect
                            name="sourceId"
                            value={formValues.sourceId}
                            options={getSelectOptions(meta?.sources || [])}
                            placeholder="Select source"
                            onChange={(event) => handleFieldChange('sourceId', event.target.value)}
                          />
                          <ErrorText field="sourceId" />
                        </div>

                        <div>
                          <FieldLabel fieldKey="lifecycleId" label="Lead Life Cycle" />
                          <SearchableSelect
                            name="lifecycleId"
                            value={formValues.lifecycleId}
                            options={getSelectOptions(meta?.lifeCycles || [])}
                            placeholder="Select lifecycle"
                            allowClear
                            clearLabel="No lifecycle"
                            onChange={(event) => handleFieldChange('lifecycleId', event.target.value)}
                          />
                          <ErrorText field="lifecycleId" />
                        </div>

                        <div className="md:col-span-2">
                          <FieldLabel fieldKey="stageId" label="Stage" />
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
                            <ErrorText field="stageId" />
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <FieldLabel fieldKey="remarks" label="Remarks History" className="text-lg font-black text-gray-900" />
                          <p className="text-sm font-semibold text-gray-500">
                            {mode === 'edit' ? 'Timeline of notes and system events for this lead.' : 'Initial notes about this lead.'}
                          </p>
                        </div>
                      </div>

                      {mode === 'edit' && (
                        <div className="mb-4 max-h-[300px] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-4">
                          {remarksLoading ? (
                            <p className="text-sm text-gray-500">Loading remarks...</p>
                          ) : allRemarks.length ? (
                            <div className="space-y-5">
                              {lobReturnRemarks.length > 0 ? (
                                <div>
                                  <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-rose-500">
                                    LOB Return Reasons
                                  </div>
                                  <div className="space-y-3">
                                    {lobReturnRemarks.map((remark: any) => (
                                      <div key={remark.id} className="flex gap-3">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">
                                          {remark.createdBy?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1 rounded-xl border border-rose-100 bg-white p-3 shadow-sm">
                                          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                                            <span className="font-semibold">{remark.createdBy?.name || 'System'}</span>
                                            <span>
                                              {new Date(remark.createdAt).toLocaleDateString()} at{' '}
                                              {new Date(remark.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                          </div>
                                          {remark.lobReturnStage ? (
                                            <p className="mb-2 text-xs font-bold text-rose-600">
                                              {remark.lobReturnStage.fromStageName || 'LOB'} to {remark.lobReturnStage.toStageName || 'Pipeline'}
                                            </p>
                                          ) : null}
                                          <p className="whitespace-pre-wrap text-sm text-gray-800">{remark.text}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null}

                              {generalRemarks.length > 0 ? (
                                <div>
                                  <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
                                    Remarks
                                  </div>
                                  <div className="space-y-3">
                                    {generalRemarks.map((remark: any) => (
                                      <div key={remark.id} className="flex gap-3">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                          {remark.createdBy?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1 rounded-xl bg-white p-3 shadow-sm">
                                          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                                            <span className="font-semibold">{remark.createdBy?.name || 'System'}</span>
                                            <span>
                                              {new Date(remark.createdAt).toLocaleDateString()} at{' '}
                                              {new Date(remark.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                          </div>
                                          <p className="whitespace-pre-wrap text-sm text-gray-800">{remark.text}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No remarks yet.</p>
                          )}
                        </div>
                      )}

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-sm font-bold text-gray-700">
                            {mode === 'edit' ? 'Add New Remark' : 'Remarks'}
                          </label>
                          <span className={`text-xs font-black ${formValues.leadRemarks.length > 1000 ? 'text-red-500' : 'text-gray-400'}`}>
                            {formValues.leadRemarks.length}/1000
                          </span>
                        </div>
                        <textarea
                          rows={mode === 'edit' ? 3 : 5}
                          maxLength={1000}
                          value={formValues.leadRemarks}
                          onChange={(event) => handleFieldChange('leadRemarks', event.target.value)}
                          className={`${inputClassName} ${mode === 'edit' ? 'min-h-[80px]' : 'min-h-[140px]'} resize-y leading-relaxed`}
                          placeholder={mode === 'edit' ? 'Enter a new remark...' : 'Enter any additional information or important notes about this lead...'}
                        />
                        <ErrorText field={['remarks', 'leadRemarks']} />
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
                          <FieldLabel fieldKey="nextFollowUpAt" label="Next Follow-up" />
                          <input
                            type="datetime-local"
                            value={formValues.nextFollowUpAt}
                            onChange={(event) => handleFieldChange('nextFollowUpAt', event.target.value)}
                            className={inputClassName}
                          />
                          <ErrorText field="nextFollowUpAt" />
                          <label className="mb-2 mt-4 block text-sm font-black text-gray-900">Follow-up Type</label>
                          <select
                            value={formValues.nextFollowUpType}
                            onChange={(event) => handleFieldChange('nextFollowUpType', event.target.value as FollowUpType)}
                            className={inputClassName}
                            aria-label="Follow-up type"
                          >
                            {FOLLOW_UP_TYPE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <ErrorText field="nextFollowUpType" />
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
                          <ErrorText field="followUpDescription" />
                        </div>
                      </div>
                    </section>

                    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <PlusCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-gray-900">Product Selection</h3>
                            <p className="text-sm font-semibold text-gray-500">Selected products calculate the total amount automatically.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddProductRow}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Add Product</span>
                        </button>
                      </div>

                      {formValues.products.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm font-bold text-gray-500">
                          No products selected for this lead.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formValues.products.map((item, index) => {
                            const selectedProduct = productOptions.find((product: any) => product.id === item.productId);
                            const unitPrice = Number(selectedProduct?.unitPrice || 0);
                            const quantity = Math.max(1, Number(item.quantity || 1));
                            const lineTotal = unitPrice * quantity;

                            return (
                              <div key={`${item.productId || 'product'}-${index}`} className="grid gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 md:grid-cols-[1.7fr_110px_130px_130px_44px]">
                                <select
                                  value={item.productId}
                                  onChange={(event) => handleProductRowChange(index, 'productId', event.target.value)}
                                  className={inputClassName}
                                >
                                  <option value="">Select product</option>
                                  {productOptions.map((product: any) => (
                                    <option key={product.id} value={product.id}>
                                      {product.name} - {Number(product.unitPrice || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  min="1"
                                  value={quantity}
                                  onChange={(event) => handleProductRowChange(index, 'quantity', event.target.value)}
                                  className={inputClassName}
                                  aria-label="Product quantity"
                                />
                                <input
                                  type="text"
                                  readOnly
                                  value={unitPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                  className={`${inputClassName} bg-white text-gray-500`}
                                  aria-label="Unit price"
                                />
                                <input
                                  type="text"
                                  readOnly
                                  value={lineTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                  className={`${inputClassName} bg-white font-black`}
                                  aria-label="Line total"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProductRow(index)}
                                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-400 transition hover:border-rose-200 hover:text-rose-600"
                                  title="Remove product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="md:col-span-5">
                                  <ErrorText field={[`products.${index}.productId`, `products.${index}.quantity`, 'products']} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-gray-900">Payment Information</h3>
                          <p className="text-sm font-semibold text-gray-500">Agreed revenue terms, advance payments, and outstanding balances.</p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <FieldLabel fieldKey="totalAmount" label="Total Amount" />
                          <input
                            type="number"
                            min="0"
                            placeholder="0.00"
                            value={formValues.totalAmount || ''}
                            onChange={(e) => handleFieldChange('totalAmount', e.target.value)}
                            className={`${inputClassName} ${
                              mode === 'edit' && paymentData && Number(formValues.totalAmount) !== Number(paymentData.totalAmount)
                                ? 'text-red-600 font-bold border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                : ''
                            }`}
                          />
                          <ErrorText field="totalAmount" />
                          {mode === 'edit' && paymentData?.amountHistory?.[0] && (
                            <div className="mt-2 text-xs font-semibold text-gray-500 flex flex-col gap-1">
                              <p>
                                Last changed reason: <span className="text-gray-700 italic">"{paymentData.amountHistory[0].reason}"</span> (by {paymentData.amountHistory[0].changedBy?.name})
                              </p>
                              {paymentData.amountHistory.length > 1 && (
                                <details className="cursor-pointer text-emerald-600 hover:text-emerald-700">
                                  <summary className="outline-none">View Amount Change History ({paymentData.amountHistory.length})</summary>
                                  <div className="mt-2 space-y-2 border-l-2 border-gray-100 pl-3">
                                    {paymentData.amountHistory.map((hist: any) => (
                                      <div key={hist.id} className="text-gray-600">
                                        <span className="font-bold">${hist.oldAmount} &rarr; ${hist.newAmount}</span> by {hist.changedBy?.name} on {new Date(hist.createdAt).toLocaleDateString()}:
                                        <p className="italic text-gray-500 pl-2">"{hist.reason}"</p>
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-black text-gray-900">Balance Amount (Read-only)</label>
                          <div className="relative">
                            <input
                              type="text"
                              readOnly
                              value={
                                mode === 'edit' && paymentData
                                  ? `$${paymentData.balance.toFixed(2)}`
                                  : `$${Math.max(
                                      0,
                                      Number(formValues.totalAmount || 0) -
                                        localAdvances.reduce((sum, item) => sum + item.amount, 0)
                                    ).toFixed(2)}`
                              }
                              className={`${inputClassName} bg-gray-100 cursor-not-allowed font-bold text-gray-700`}
                            />
                            {mode === 'edit' && paymentData && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                Approved Advances: ${paymentData.approvedSum.toFixed(2)}
                              </span>
                            )}
                            {mode === 'create' && localAdvances.length > 0 && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                Pending Advances: ${localAdvances.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {(mode === 'create' || (mode === 'edit' && paymentData)) && (
                        <div className="mt-6 border-t border-gray-100 pt-6">
                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-md font-black text-gray-900 flex items-center gap-2">
                              <History className="h-4 w-4 text-gray-400" />
                              <span>Advance Payments</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                console.log('[Diagnostic] Add Advance clicked');
                                setAdvanceAmount('');
                                setAdvanceRemarks('');
                                setAdvanceProofUrl('');
                                setAddAdvanceModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600 transition-colors hover:bg-emerald-100"
                            >
                              <PlusCircle className="h-4 w-4" />
                              <span>Request Advance</span>
                            </button>
                          </div>

                          {advancePaymentsList.length === 0 ? (
                            <p className="text-xs font-bold text-gray-400 py-3 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                              No advance payments recorded for this lead.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {advancePaymentsList.map((adv: any, index: number) => (
                                <div key={adv.id || `local-adv-${index}`} className="p-3 border border-gray-100 bg-gray-50/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-black text-gray-900">${adv.amount.toFixed(2)}</span>
                                      <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                                        adv.status === 'APPROVED'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : adv.status === 'REJECTED' || adv.status === 'DENIED'
                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                      }`}>
                                        {adv.status}
                                      </span>
                                    </div>
                                    <p className="text-gray-500 font-semibold">
                                      Requested by {adv.requestedBy?.name} on {new Date(adv.paymentDate).toLocaleDateString()}
                                    </p>
                                    {adv.remarks && (
                                      <p className="text-gray-600 italic">"{adv.remarks}"</p>
                                    )}
                                    {adv.status === 'APPROVED' && (
                                      <p className="text-emerald-700 font-bold">
                                        Check Number: {adv.checkNumber || 'N/A'} (Approved by {adv.approvedBy?.name})
                                      </p>
                                    )}
                                    {(adv.status === 'REJECTED' || adv.status === 'DENIED') && adv.rejectionReason && (
                                      <p className="text-rose-700 font-bold">
                                        Rejection Reason: {adv.rejectionReason} (Rejected by {adv.rejectedBy?.name})
                                      </p>
                                    )}
                                  </div>
                                  {adv.proofUrl && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPreviewImageUrl(adv.proofUrl);
                                        setPreviewModalOpen(true);
                                      }}
                                      className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold self-start md:self-center"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      <span>View Receipt</span>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
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
                              fieldEdits={fieldEdits}
                            />
                          ))}
                        </div>
                        <ErrorText field={['dynamicValues', 'dynamicValues.0.fieldId', 'dynamicValues.0.value']} />
                      </section>
                    ) : null}

                    {showLobContext ? (
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
                            <ErrorText field="reasonId" />
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
                            <ErrorText field="lobRemarks" />
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

      {/* LOB Exit Reason Modal */}
      {lobExitModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 mb-2">Return From LOB</h3>
            <p className="text-xs font-semibold text-gray-500 mb-4">
              Please enter the reason for returning this lead from LOB.
            </p>
            <label className="mb-2 block text-sm font-black text-gray-900">LOB Return Remark <span className="text-red-500">*</span></label>
            <textarea
              className={inputClassName}
              rows={4}
              value={lobExitReason}
              onChange={(e) => setLobExitReason(e.target.value)}
              placeholder="e.g. Customer became interested after follow-up."
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (revertFormBeforeRulesRef.current) {
                    setFormValues((prev) => ({ ...prev, ...revertFormBeforeRulesRef.current }));
                    revertFormBeforeRulesRef.current = null;
                  }
                  setLobExitReason('');
                  setLobExitModalOpen(false);
                  setPendingStageId(null);
                }}
                className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-black text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!lobExitReason.trim()}
                onClick={() => {
                  if (!pendingStageId || !lobExitReason.trim()) return;
                  setFormValues((prev) => ({
                    ...prev,
                    stageId: pendingStageId,
                    leadRemarks: lobExitReason.trim(),
                  }));
                  setLobExitReason('');
                  setLobExitModalOpen(false);
                  setPendingStageId(null);
                  revertFormBeforeRulesRef.current = null;
                }}
                className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-black text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <StageRulesTransitionModal
        isOpen={stageRulesModalOpen}
        rules={stageRulesForTransition}
        isSubmitting={changeStageMutation.isPending || updateMutation.isPending}
        onClose={handleStageRulesClose}
        onConfirm={handleStageRulesConfirm}
      />

      {/* Total Amount Change Reason Modal */}
      {totalAmountReasonModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 mb-2">Reason for Total Amount Modification</h3>
            <p className="text-xs font-semibold text-gray-500 mb-4">
              You are updating the Total Amount from ${(paymentData?.totalAmount || 0).toFixed(2)} to ${Number(formValues.totalAmount).toFixed(2)}. Please provide a reason.
            </p>
            <textarea
              className={inputClassName}
              rows={3}
              value={totalAmountReason}
              onChange={(e) => setTotalAmountReason(e.target.value)}
              placeholder="e.g. Added contract scope or discount applied"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormValues((prev) => ({
                    ...prev,
                    totalAmount: paymentData?.totalAmount || 0,
                  }));
                  setTotalAmountReason('');
                  setTotalAmountReasonModalOpen(false);
                }}
                className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-black text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingTotalAmountReason || !totalAmountReason.trim()}
                onClick={handleSaveTotalAmountReason}
                className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-black text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSubmittingTotalAmountReason ? 'Saving…' : 'Submit Reason'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Advance Payment Modal */}
      {addAdvanceModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 mb-4">Request Advance Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-black text-gray-900">Amount <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  className={inputClassName}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-black text-gray-900">Payment Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={advancePaymentDate}
                  onChange={(e) => setAdvancePaymentDate(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-black text-gray-900">Remarks</label>
                <textarea
                  value={advanceRemarks}
                  onChange={(e) => setAdvanceRemarks(e.target.value)}
                  className={`${inputClassName} resize-none`}
                  rows={2}
                  placeholder="e.g. Check clearance details or cash reference"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-black text-gray-900">Upload Receipt Proof (Max 1MB)</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleProofChange}
                  className="w-full text-xs font-semibold text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-xs file:font-black file:text-emerald-700 file:transition-colors hover:file:bg-emerald-100"
                />
                {advanceProofUrl && (
                  <div className="mt-2 relative inline-block">
                    <img src={advanceProofUrl} alt="Preview" className="h-20 w-20 rounded-xl object-cover border border-gray-100" />
                    <button
                      type="button"
                      onClick={() => setAdvanceProofUrl('')}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-red-100 p-0.5 text-red-600 hover:bg-red-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAddAdvanceModalOpen(false)}
                className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-black text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingAdvance || !advanceAmount || Number(advanceAmount) <= 0}
                onClick={handleSaveAdvancePayment}
                className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-black text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSubmittingAdvance ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Receipt Lightbox Modal */}
      {previewModalOpen && previewImageUrl && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full rounded-3xl bg-white p-4 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setPreviewImageUrl(null);
                setPreviewModalOpen(false);
              }}
              className="absolute -top-3 -right-3 rounded-full bg-white p-1 text-gray-700 shadow-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex justify-center max-h-[75vh] overflow-hidden rounded-2xl">
              <img src={previewImageUrl} alt="Receipt Proof" className="max-w-full max-h-[75vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {WeeklyOffScheduleModal}
    </>
  );
};

export default memo(LeadFormDrawer);
