import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Plus, Trash2, HelpCircle, Save, Info, AlertTriangle, 
  ChevronRight, Calendar, User, CheckCircle2, Circle
} from 'lucide-react';
import { 
  getAutomationMeta, 
  createWorkflow, 
  updateWorkflow, 
  getWorkflowById,
  AutomationMeta,
  WorkflowAction
} from '../../services/automation.api';
import toast from 'react-hot-toast';

// ----------------------------------------------------------------------
// HELPER CONSTANTS
// ----------------------------------------------------------------------

const TRIGGERS = [
  { id: 'lead.created', label: 'When a lead is created' },
  { id: 'lead.updated', label: 'When a lead is updated' },
  { id: 'lead.stage_changed', label: 'When lead stage changes' },
  { id: 'lead.assigned', label: 'When a lead is assigned/reassigned' },
  { id: 'followup.created', label: 'When a follow-up is created' },
  { id: 'followup.completed', label: 'When a follow-up is completed' },
];

const FIELDS = [
  { id: 'name', label: 'Lead Name', type: 'STRING' },
  { id: 'phone', label: 'Phone Number', type: 'STRING' },
  { id: 'email', label: 'Email Address', type: 'STRING' },
  { id: 'stageId', label: 'Lead Stage', type: 'SELECT', provider: 'stages' },
  { id: 'sourceId', label: 'Lead Source', type: 'SELECT', provider: 'sources' },
  { id: 'expectedRevenue', label: 'Expected Revenue', type: 'NUMBER' },
  { id: 'isClosed', label: 'Is Closed', type: 'BOOLEAN' },
  { id: 'isLOB', label: 'Is LOB', type: 'BOOLEAN' },
  { id: 'createdAt', label: 'Created Date', type: 'DATE' },
  { id: 'updatedAt', label: 'Updated Date', type: 'DATE' },
];

const ACTIONS = [
  { id: 'change_stage', label: 'Change Lead Stage' },
  { id: 'assign_user', label: 'Assign to User' },
  { id: 'create_followup', label: 'Create Follow-Up' },
  { id: 'add_remark', label: 'Add Remark' },
  { id: 'send_notification', label: 'Send In-App Notification' },
];

const OPERATORS_BY_TYPE: Record<string, string[]> = {
  STRING: ['Equals', 'Does Not Equal', 'Contains', 'Does Not Contain', 'Starts With', 'Ends With', 'Is Empty', 'Is Not Empty'],
  SELECT: ['Equals', 'Does Not Equal', 'Is Any Of', 'Is None Of'],
  NUMBER: ['Greater Than', 'Greater Than or Equal', 'Less Than', 'Less Than or Equal', 'Equals', 'Does Not Equal'],
  BOOLEAN: ['Is True', 'Is False'],
  DATE: ['Before', 'After', 'Is Empty', 'Is Not Empty'],
};

// Types mapping frontend models
interface ConditionRule {
  field: string;
  operator: string;
  value: any;
}

interface ConditionGroup {
  rules: ConditionRule[];
}

export const CreateWorkflowPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ----------------------------------------------------------------------
  // COMPONENT STATE
  // ----------------------------------------------------------------------
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('lead.created');
  const [triggerConfig, setTriggerConfig] = useState<Record<string, any>>({});
  const [conditionGroups, setConditionGroups] = useState<ConditionGroup[]>([]);
  const [actions, setActions] = useState<WorkflowAction[]>([]);
  const [active, setActive] = useState(false);

  // ----------------------------------------------------------------------
  // API LOAD QUERIES
  // ----------------------------------------------------------------------
  const { data: meta } = useQuery<AutomationMeta>({
    queryKey: ['automation-meta'],
    queryFn: getAutomationMeta,
  });

  const { data: workflowData, isLoading: isLoadingWorkflow } = useQuery({
    queryKey: ['automation-workflow', id],
    queryFn: () => getWorkflowById(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (workflowData) {
      setName(workflowData.name);
      setDescription(workflowData.description || '');
      setTriggerType(workflowData.triggerType);
      setActive(workflowData.active);
      
      try {
        setTriggerConfig(JSON.parse(workflowData.triggerConfig || '{}'));
      } catch (e) {
        setTriggerConfig({});
      }

      try {
        setConditionGroups(JSON.parse(workflowData.conditionConfig || '[]'));
      } catch (e) {
        setConditionGroups([]);
      }

      const formattedActions = (workflowData.actions || []).map((act: any) => {
        let actionConfig: Record<string, any> = {};
        try {
          actionConfig = typeof act.actionConfig === 'string' ? JSON.parse(act.actionConfig) : act.actionConfig;
        } catch (e) {}

        return {
          ...act,
          actionConfig,
        };
      });
      setActions(formattedActions);
    }
  }, [workflowData]);

  // ----------------------------------------------------------------------
  // MUTATIONS
  // ----------------------------------------------------------------------
  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (isEditMode) {
        return updateWorkflow(id!, payload);
      }
      return createWorkflow(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-workflows'] });
      toast.success(isEditMode ? 'Workflow updated successfully' : 'Workflow created successfully');
      navigate('/settings/automations');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save workflow');
    }
  });

  // ----------------------------------------------------------------------
  // RULE ACTIONS
  // ----------------------------------------------------------------------
  const addConditionGroup = () => {
    setConditionGroups([...conditionGroups, { rules: [{ field: 'name', operator: 'Equals', value: '' }] }]);
  };

  const removeConditionGroup = (groupIndex: number) => {
    setConditionGroups(conditionGroups.filter((_, idx) => idx !== groupIndex));
  };

  const addRule = (groupIndex: number) => {
    const updated = [...conditionGroups];
    updated[groupIndex].rules.push({ field: 'name', operator: 'Equals', value: '' });
    setConditionGroups(updated);
  };

  const removeRule = (groupIndex: number, ruleIndex: number) => {
    const updated = [...conditionGroups];
    updated[groupIndex].rules = updated[groupIndex].rules.filter((_, idx) => idx !== ruleIndex);
    if (updated[groupIndex].rules.length === 0) {
      removeConditionGroup(groupIndex);
    } else {
      setConditionGroups(updated);
    }
  };

  const updateRule = (groupIndex: number, ruleIndex: number, key: keyof ConditionRule, val: any) => {
    const updated = [...conditionGroups];
    const rule = updated[groupIndex].rules[ruleIndex];
    rule[key] = val;

    // Reset operator if field changes
    if (key === 'field') {
      const fieldDef = FIELDS.find(f => f.id === val);
      const operators = fieldDef ? OPERATORS_BY_TYPE[fieldDef.type] : [];
      rule.operator = operators[0] || 'Equals';
      rule.value = '';
    }

    setConditionGroups(updated);
  };

  // ----------------------------------------------------------------------
  // ACTIONS CHAIN SETUP
  // ----------------------------------------------------------------------
  const addActionStep = () => {
    const newAction: WorkflowAction = {
      actionType: 'change_stage',
      actionConfig: { stageId: '', remarks: '' },
      delaySeconds: 0,
    };
    setActions([...actions, newAction]);
  };

  const removeActionStep = (index: number) => {
    setActions(actions.filter((_, idx) => idx !== index));
  };

  const updateActionType = (index: number, type: string) => {
    const updated = [...actions];
    updated[index].actionType = type;
    
    // Setup default action configs
    if (type === 'change_stage') {
      updated[index].actionConfig = { stageId: '', remarks: '' };
    } else if (type === 'assign_user') {
      updated[index].actionConfig = { assignedToId: '' };
    } else if (type === 'create_followup') {
      updated[index].actionConfig = { type: 'CALL', delayMinutes: 1440, description: '' };
    } else if (type === 'add_remark') {
      updated[index].actionConfig = { remarks: '' };
    } else if (type === 'send_notification') {
      updated[index].actionConfig = { recipientId: '', title: '', message: '' };
    }

    setActions(updated);
  };

  const updateActionConfig = (index: number, key: string, val: any) => {
    const updated = [...actions];
    updated[index].actionConfig = {
      ...updated[index].actionConfig,
      [key]: val,
    };
    setActions(updated);
  };

  const updateActionDelay = (index: number, value: number, unit: string) => {
    const updated = [...actions];
    let factor = 1;
    if (unit === 'minutes') factor = 60;
    else if (unit === 'hours') factor = 3600;
    else if (unit === 'days') factor = 86400;

    updated[index].delaySeconds = value * factor;
    setActions(updated);
  };

  const getActionDelayValues = (delaySeconds: number) => {
    if (!delaySeconds) return { value: 0, unit: 'seconds' };
    if (delaySeconds % 86400 === 0) return { value: delaySeconds / 86400, unit: 'days' };
    if (delaySeconds % 3600 === 0) return { value: delaySeconds / 3600, unit: 'hours' };
    if (delaySeconds % 60 === 0) return { value: delaySeconds / 60, unit: 'minutes' };
    return { value: delaySeconds, unit: 'seconds' };
  };

  // ----------------------------------------------------------------------
  // VALIDATION & SUBMIT
  // ----------------------------------------------------------------------
  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Workflow Name is required');
      return;
    }
    if (actions.length === 0) {
      toast.error('At least one action step is required');
      return;
    }

    // Deep copy and map to strings for API compatibility
    const payload = {
      name,
      description,
      triggerType,
      triggerConfig,
      conditionConfig: conditionGroups,
      active,
      actions: actions.map(act => ({
        ...act,
        actionConfig: act.actionConfig, // Sent as object, controller validator will validate it
      })),
    };

    saveMutation.mutate(payload);
  };

  // Build Progress checklist state
  const isNameDone = !!name.trim();
  const isTriggerDone = !!triggerType;
  const isActionsDone = actions.length > 0;
  const isAllValid = isNameDone && isTriggerDone && isActionsDone;

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
      
      {/* Left side: Main Editor */}
      <div className="flex-1 space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/settings/automations')}
            className="rounded-lg p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isEditMode ? `Edit Workflow: ${name}` : 'Create Workflow Automation'}
            </h1>
            <p className="text-xs text-slate-500">Design your business automation flow card by card.</p>
          </div>
        </div>

        {/* Card 1: Meta Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
            1. Workflow Details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Workflow Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Auto assign Facebook Leads"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description (Optional)</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Runs onFacebook lead source creation and maps supervisor"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="active" 
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="active" className="text-sm text-slate-700 font-medium">Activate this workflow immediately</label>
          </div>
        </div>

        {/* Card 2: WHEN Trigger Event */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
            2. WHEN (Trigger Event)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Choose Trigger Event</label>
              <select
                value={triggerType}
                onChange={(e) => {
                  setTriggerType(e.target.value);
                  setTriggerConfig({});
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                {TRIGGERS.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Sub-config depending on selected trigger */}
            {triggerType === 'lead.stage_changed' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Enters Specific Stage</label>
                <select
                  value={triggerConfig.stageId || ''}
                  onChange={(e) => setTriggerConfig({ stageId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Any Stage Changes</option>
                  {meta?.stages.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: IF Conditions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-semibold text-slate-900">
              3. IF (Optional Conditions Tree)
            </h3>
            <button
              onClick={addConditionGroup}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add OR Group
            </button>
          </div>

          {conditionGroups.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No conditions set. This workflow will always run when the trigger event fires.
            </p>
          ) : (
            <div className="space-y-4">
              {conditionGroups.map((group, gIdx) => (
                <div key={gIdx} className="rounded-lg border border-slate-100 bg-slate-50 p-4 relative">
                  
                  {/* OR Group Header */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Condition Group {gIdx > 0 ? `(OR)` : ''}
                    </span>
                    <button
                      onClick={() => removeConditionGroup(gIdx)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Remove Group
                    </button>
                  </div>

                  {/* Rules inside group */}
                  <div className="space-y-3">
                    {group.rules.map((rule, rIdx) => {
                      const currentField = FIELDS.find(f => f.id === rule.field);
                      const operators = currentField ? OPERATORS_BY_TYPE[currentField.type] : [];

                      return (
                        <div key={rIdx} className="flex flex-wrap items-center gap-2">
                          {/* AND indicator */}
                          {rIdx > 0 && <span className="text-xs font-bold text-slate-400 px-1">AND</span>}

                          {/* Field Dropdown */}
                          <select
                            value={rule.field}
                            onChange={(e) => updateRule(gIdx, rIdx, 'field', e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none"
                          >
                            {FIELDS.map(f => (
                              <option key={f.id} value={f.id}>{f.label}</option>
                            ))}
                          </select>

                          {/* Operator Dropdown */}
                          <select
                            value={rule.operator}
                            onChange={(e) => updateRule(gIdx, rIdx, 'operator', e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none"
                          >
                            {operators.map(op => (
                              <option key={op} value={op}>{op}</option>
                            ))}
                          </select>

                          {/* Value input (depends on field data type) */}
                          {!['Is Empty', 'Is Not Empty', 'Is True', 'Is False'].includes(rule.operator) && (
                            <>
                              {currentField?.type === 'SELECT' ? (
                                <select
                                  value={rule.value || ''}
                                  onChange={(e) => updateRule(gIdx, rIdx, 'value', e.target.value)}
                                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none"
                                >
                                  <option value="">Select Option</option>
                                  {currentField.provider === 'stages' && meta?.stages.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                  {currentField.provider === 'sources' && meta?.sources.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                              ) : currentField?.type === 'DATE' ? (
                                <input
                                  type="date"
                                  value={rule.value || ''}
                                  onChange={(e) => updateRule(gIdx, rIdx, 'value', e.target.value)}
                                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none"
                                />
                              ) : currentField?.type === 'NUMBER' ? (
                                <input
                                  type="number"
                                  value={rule.value || ''}
                                  onChange={(e) => updateRule(gIdx, rIdx, 'value', e.target.value)}
                                  placeholder="0"
                                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none w-20"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={rule.value || ''}
                                  onChange={(e) => updateRule(gIdx, rIdx, 'value', e.target.value)}
                                  placeholder="value..."
                                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none"
                                />
                              )}
                            </>
                          )}

                          {/* Delete rule button */}
                          <button
                            onClick={() => removeRule(gIdx, rIdx)}
                            className="rounded p-1 hover:bg-slate-200 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add rule button */}
                  <button
                    onClick={() => addRule(gIdx)}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600"
                  >
                    <Plus className="h-3 w-3" />
                    Add Condition (AND)
                  </button>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 4: THEN Action Steps */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-semibold text-slate-900">
              4. THEN (Actions Chain Sequence)
            </h3>
            <button
              onClick={addActionStep}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Action Step
            </button>
          </div>

          {actions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center bg-slate-50">
              <p className="text-xs text-slate-400 italic">
                No action steps added yet. Add at least one action step to save the workflow.
              </p>
              <button
                onClick={addActionStep}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Action Step Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {actions.map((act, index) => {
                const delay = getActionDelayValues(act.delaySeconds);

                return (
                  <div key={index} className="rounded-lg border border-slate-200 p-4 bg-white relative">
                    
                    {/* Action Step Header */}
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                          {index + 1}
                        </span>
                        <select
                          value={act.actionType}
                          onChange={(e) => updateActionType(index, e.target.value)}
                          className="font-semibold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-sm cursor-pointer"
                        >
                          {ACTIONS.map(option => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => removeActionStep(index)}
                        className="text-xs text-red-500 hover:text-red-600 inline-flex items-center gap-0.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Step
                      </button>
                    </div>

                    {/* Action Config Fields */}
                    <div className="space-y-4">
                      {act.actionType === 'change_stage' && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Target Stage</label>
                            <select
                              value={act.actionConfig.stageId || ''}
                              onChange={(e) => updateActionConfig(index, 'stageId', e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
                            >
                              <option value="">Select Stage</option>
                              {meta?.stages.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Remarks</label>
                            <input
                              type="text"
                              value={act.actionConfig.remarks || ''}
                              onChange={(e) => updateActionConfig(index, 'remarks', e.target.value)}
                              placeholder="remarks variable template..."
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {act.actionType === 'assign_user' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Assign To User</label>
                          <select
                            value={act.actionConfig.assignedToId || ''}
                            onChange={(e) => updateActionConfig(index, 'assignedToId', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none max-w-sm"
                          >
                            <option value="">Select User</option>
                            {meta?.users.map(u => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {act.actionType === 'create_followup' && (
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Type</label>
                            <select
                              value={act.actionConfig.type || 'CALL'}
                              onChange={(e) => updateActionConfig(index, 'type', e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
                            >
                              <option value="CALL">Call</option>
                              <option value="VISIT">Visit</option>
                              <option value="MEETING">Meeting</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Schedule Delay (Minutes)</label>
                            <input
                              type="number"
                              value={act.actionConfig.delayMinutes || ''}
                              onChange={(e) => updateActionConfig(index, 'delayMinutes', Number(e.target.value))}
                              placeholder="1440 (24h)"
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                            <input
                              type="text"
                              value={act.actionConfig.description || ''}
                              onChange={(e) => updateActionConfig(index, 'description', e.target.value)}
                              placeholder="Follow up with {{lead.name}}"
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {act.actionType === 'add_remark' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Remark Notes</label>
                          <textarea
                            value={act.actionConfig.remarks || ''}
                            onChange={(e) => updateActionConfig(index, 'remarks', e.target.value)}
                            placeholder="Add remark notes. Supports variables like {{lead.name}}."
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none h-16"
                          />
                        </div>
                      )}

                      {act.actionType === 'send_notification' && (
                        <div className="space-y-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 mb-1">Recipient User</label>
                              <select
                                value={act.actionConfig.recipientId || ''}
                                onChange={(e) => updateActionConfig(index, 'recipientId', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
                              >
                                <option value="">Select Recipient</option>
                                {meta?.users.map(u => (
                                  <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 mb-1">Notification Title</label>
                              <input
                                type="text"
                                value={act.actionConfig.title || ''}
                                onChange={(e) => updateActionConfig(index, 'title', e.target.value)}
                                placeholder="Alert for {{lead.name}}"
                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Message Body</label>
                            <textarea
                              value={act.actionConfig.message || ''}
                              onChange={(e) => updateActionConfig(index, 'message', e.target.value)}
                              placeholder="Message details..."
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none h-16"
                            />
                          </div>
                        </div>
                      )}

                      {/* Step delay config */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-semibold">Execute after delay:</span>
                        <input
                          type="number"
                          value={delay.value || 0}
                          onChange={(e) => updateActionDelay(index, Number(e.target.value), delay.unit)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:outline-none w-16"
                        />
                        <select
                          value={delay.unit}
                          onChange={(e) => updateActionDelay(index, delay.value, e.target.value)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:outline-none"
                        >
                          <option value="seconds">Seconds</option>
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => navigate('/settings/automations')}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className={`inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition ${
              saveMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>

      </div>

      {/* Right side: Floating Info & Progress Panel */}
      <div className="w-full lg:w-80 space-y-6">
        
        {/* Progress Checklist */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Build Checklist</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              {isNameDone ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-50" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
              <span className={isNameDone ? 'line-through text-slate-400' : ''}>Workflow Name defined</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              {isTriggerDone ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-50" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
              <span className={isTriggerDone ? 'line-through text-slate-400' : ''}>Trigger event configured</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              {isActionsDone ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-50" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
              <span className={isActionsDone ? 'line-through text-slate-400' : ''}>At least one action added</span>
            </div>
          </div>

          {!isAllValid && (
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 flex gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>Complete all checklist steps to activate and save your automation flow.</span>
            </div>
          )}
        </div>

        {/* Dynamic Variable Reference Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-indigo-500" />
            Template Variables
          </h3>
          <p className="text-xs text-slate-500">
            Use these variables inside action remarks, comments, and notification fields. They will be auto-replaced at execution time:
          </p>
          <div className="space-y-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700">
            <div>{"{{lead.name}}"} - Lead full name</div>
            <div>{"{{lead.email}}"} - Lead email address</div>
            <div>{"{{lead.phone}}"} - Lead phone number</div>
            <div>{"{{lead.expectedRevenue}}"} - Estimated revenue</div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CreateWorkflowPage;
