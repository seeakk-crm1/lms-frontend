import React, { useEffect, useState } from 'react';
import {
  Facebook,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Power,
  Settings2,
  Layers,
  Users,
  AlertCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  Plus,
  Pencil,
  Copy,
  Trash2,
  ToggleLeft,
  ToggleRight,
  FileText,
  Workflow,
  HelpCircle,
} from 'lucide-react';
import {
  getMetaStatus,
  getMetaConnections,
  getMetaPagesForConnection,
  getMetaPageForms,
  getMetaFormFields,
  getSeeakkLeadFields,
  getMetaAutomations,
  createMetaAutomation,
  updateMetaAutomation,
  toggleMetaAutomation,
  duplicateMetaAutomation,
  deleteMetaAutomation,
  getMetaAuthUrl,
  getMetaSyncActivity,
  retryMetaFailedImport,
  disconnectMeta,
  MetaStatusData,
  MetaFieldMappingItem,
} from '../../services/metaAds.api';
import { getLeadStages } from '../../services/leadStage.api';
import { getLeadSources } from '../../services/leadSource.api';
import { getUsers } from '../../services/users.api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const DEFAULT_AUTO_MAPPING: Record<string, string> = {
  full_name: 'name',
  name: 'name',
  first_name: 'name',
  last_name: 'name',
  phone_number: 'phone',
  phone: 'phone',
  mobile: 'phone',
  email: 'email',
  email_address: 'email',
  company_name: 'companyName',
  company: 'companyName',
  city: 'address',
  location: 'address',
  address: 'address',
  requirement: 'remarks',
  notes: 'remarks',
  remarks: 'remarks',
  message: 'remarks',
  budget: 'totalAmount',
  price: 'totalAmount',
  amount: 'totalAmount',
};

const MetaAdsSettingsPage: React.FC = () => {
  const [status, setStatus] = useState<MetaStatusData | null>(null);
  const [automations, setAutomations] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [seeakkFields, setSeeakkFields] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'automations' | 'pages' | 'activity'>('automations');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal / Form State for Create & Edit Automation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAutomationId, setEditingAutomationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Automation Form Inputs
  const [workflowName, setWorkflowName] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [availablePages, setAvailablePages] = useState<any[]>([]);
  const [selectedPageConnectionId, setSelectedPageConnectionId] = useState('');
  const [availableForms, setAvailableForms] = useState<any[]>([]);
  const [selectedMetaFormId, setSelectedMetaFormId] = useState('');
  const [selectedFormName, setSelectedFormName] = useState('');
  const [availableMetaFields, setAvailableMetaFields] = useState<Array<{ key: string; label: string; type: string }>>([]);
  const [fetchingForms, setFetchingForms] = useState(false);
  const [fetchingFields, setFetchingFields] = useState(false);

  // Automation Mapping & Setup State
  const [formEnabled, setFormEnabled] = useState(true);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [assignmentType, setAssignmentType] = useState<'UNASSIGNED' | 'SPECIFIC_USER' | 'ROUND_ROBIN'>('UNASSIGNED');
  const [assignmentUserId, setAssignmentUserId] = useState('');
  const [roundRobinUserIds, setRoundRobinUserIds] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<MetaFieldMappingItem[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusRes, connectionsRes, automationsRes, activityRes, stagesRes, sourcesRes, usersRes, leadFieldsRes] = await Promise.all([
        getMetaStatus(),
        getMetaConnections(),
        getMetaAutomations(),
        getMetaSyncActivity(),
        getLeadStages(),
        getLeadSources(),
        getUsers({ page: 1, limit: 100 }),
        getSeeakkLeadFields(),
      ]);

      setStatus(statusRes);
      setConnections(connectionsRes || []);
      setAutomations(automationsRes || []);
      setSyncLogs(activityRes || []);
      setStages(Array.isArray(stagesRes) ? stagesRes : (stagesRes as any)?.data || []);
      setSources(Array.isArray(sourcesRes) ? sourcesRes : (sourcesRes as any)?.data || []);
      setUsers(Array.isArray(usersRes?.users) ? usersRes.users : Array.isArray(usersRes) ? usersRes : []);
      setSeeakkFields(leadFieldsRes || []);
    } catch (err: any) {
      console.error('Failed to load Meta Ads settings data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleConnectMeta = async () => {
    try {
      const res = await getMetaAuthUrl();
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error?.message || err.message || 'Failed to initiate Meta OAuth.', type: 'error' });
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Meta account? Previously imported leads and automations will be preserved.')) {
      return;
    }
    try {
      await disconnectMeta();
      setMessage({ text: 'Meta account disconnected successfully.', type: 'success' });
      await loadData();
    } catch (err: any) {
      setMessage({ text: 'Failed to disconnect Meta account.', type: 'error' });
    }
  };

  // Dependent Dropdown Handlers
  const handleConnectionChange = async (connId: string) => {
    setSelectedConnectionId(connId);
    setSelectedPageConnectionId('');
    setAvailablePages([]);
    setSelectedMetaFormId('');
    setAvailableForms([]);
    setAvailableMetaFields([]);
    setFieldMappings([]);

    if (connId) {
      try {
        const pages = await getMetaPagesForConnection(connId);
        setAvailablePages(pages || []);
      } catch (err) {
        console.error('Failed to load pages for connection:', err);
      }
    }
  };

  const handlePageChange = async (pageConnId: string) => {
    setSelectedPageConnectionId(pageConnId);
    setSelectedMetaFormId('');
    setAvailableForms([]);
    setAvailableMetaFields([]);
    setFieldMappings([]);

    if (pageConnId) {
      setFetchingForms(true);
      try {
        const forms = await getMetaPageForms(pageConnId);
        setAvailableForms(forms || []);
      } catch (err) {
        console.error('Failed to load forms for page:', err);
      } finally {
        setFetchingForms(false);
      }
    }
  };

  const handleFormChange = async (metaFormId: string) => {
    setSelectedMetaFormId(metaFormId);
    const formObj = availableForms.find((f) => String(f.metaFormId || f.id) === String(metaFormId));
    if (formObj) {
      setSelectedFormName(formObj.name || formObj.formName || 'Meta Form');
    }

    if (selectedPageConnectionId && metaFormId) {
      setFetchingFields(true);
      try {
        const fields = await getMetaFormFields(selectedPageConnectionId, metaFormId);
        setAvailableMetaFields(fields || []);

        // Auto-populate initial mappings if none exist
        if (fieldMappings.length === 0 && Array.isArray(fields) && fields.length > 0) {
          const autoMappings: MetaFieldMappingItem[] = [];
          for (const f of fields) {
            const keyLower = f.key.toLowerCase();
            const suggestedSeeakkKey = DEFAULT_AUTO_MAPPING[keyLower];
            if (suggestedSeeakkKey) {
              autoMappings.push({
                metaFieldName: f.key,
                metaFieldLabel: f.label || f.key,
                seeakkFieldKey: suggestedSeeakkKey,
              });
            }
          }

          if (autoMappings.length === 0) {
            autoMappings.push({
              metaFieldName: fields[0].key,
              metaFieldLabel: fields[0].label || fields[0].key,
              seeakkFieldKey: 'name',
            });
          }
          setFieldMappings(autoMappings);
        }
      } catch (err) {
        console.error('Failed to fetch Meta form fields:', err);
      } finally {
        setFetchingFields(false);
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingAutomationId(null);
    setWorkflowName('');
    setSelectedConnectionId(connections[0]?.id || '');
    if (connections[0]?.id) {
      void handleConnectionChange(connections[0].id);
    }
    setFormEnabled(true);
    setSelectedStageId(stages[0]?.id || '');
    setSelectedSourceId(sources[0]?.id || '');
    setAssignmentType('UNASSIGNED');
    setAssignmentUserId('');
    setRoundRobinUserIds([]);
    setFieldMappings([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (auto: any) => {
    setEditingAutomationId(auto.id);
    setWorkflowName(auto.name || auto.formName || '');
    setFormEnabled(Boolean(auto.enabled));
    setSelectedStageId(auto.defaultLeadStage?.id || auto.defaultLeadStageId || (stages[0]?.id || ''));
    setSelectedSourceId(auto.leadSource?.id || auto.leadSourceId || (sources[0]?.id || ''));
    setAssignmentType(auto.assignmentType || 'UNASSIGNED');
    setAssignmentUserId(auto.assignmentUser?.id || auto.assignmentUserId || '');
    setRoundRobinUserIds(auto.roundRobinUserIds || []);

    const connId = auto.metaConnectionId || connections[0]?.id || '';
    setSelectedConnectionId(connId);

    if (connId) {
      const pageList = await getMetaPagesForConnection(connId);
      setAvailablePages(pageList || []);
    }

    const pageConnId = auto.metaPageConnectionId || '';
    setSelectedPageConnectionId(pageConnId);

    if (pageConnId) {
      setFetchingForms(true);
      const formList = await getMetaPageForms(pageConnId);
      setAvailableForms(formList || []);
      setFetchingForms(false);

      const formId = auto.metaFormId || '';
      setSelectedMetaFormId(formId);
      setSelectedFormName(auto.formName || '');

      if (formId) {
        setFetchingFields(true);
        const fieldList = await getMetaFormFields(pageConnId, formId);
        setAvailableMetaFields(fieldList || []);
        setFetchingFields(false);
      }
    }

    const mappings: MetaFieldMappingItem[] = (auto.fieldMappings || []).map((m: any) => ({
      metaFieldName: m.metaFieldName,
      metaFieldLabel: m.metaFieldLabel || m.metaFieldName,
      seeakkFieldKey: m.seeakkFieldKey,
    }));
    setFieldMappings(mappings);
    setIsModalOpen(true);
  };

  const handleSaveAutomation = async () => {
    if (!workflowName.trim()) {
      setMessage({ text: 'Automation Name is required.', type: 'error' });
      return;
    }
    if (!selectedPageConnectionId) {
      setMessage({ text: 'Facebook Page is required.', type: 'error' });
      return;
    }
    if (!selectedMetaFormId) {
      setMessage({ text: 'Lead Form is required.', type: 'error' });
      return;
    }
    const validMappings = fieldMappings.filter((m) => m.metaFieldName && m.seeakkFieldKey && m.seeakkFieldKey !== 'ignore');
    if (validMappings.length === 0) {
      setMessage({ text: 'At least one valid field mapping row is required.', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        name: workflowName.trim(),
        metaConnectionId: selectedConnectionId || undefined,
        metaPageConnectionId: selectedPageConnectionId,
        metaFormId: selectedMetaFormId,
        formName: selectedFormName || workflowName.trim(),
        enabled: formEnabled,
        defaultLeadStageId: selectedStageId || null,
        leadSourceId: selectedSourceId || null,
        assignmentType,
        assignmentUserId: assignmentType === 'SPECIFIC_USER' ? assignmentUserId || null : null,
        roundRobinUserIds: assignmentType === 'ROUND_ROBIN' ? roundRobinUserIds : [],
        fieldMappings: validMappings,
      };

      if (editingAutomationId) {
        await updateMetaAutomation(editingAutomationId, payload);
        setMessage({ text: `Automation "${workflowName.trim()}" updated successfully.`, type: 'success' });
      } else {
        await createMetaAutomation(payload);
        setMessage({ text: `Automation "${workflowName.trim()}" created successfully.`, type: 'success' });
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error?.message || err.message || 'Failed to save automation configuration.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleMetaAutomation(id, !currentStatus);
      setMessage({ text: `Automation ${!currentStatus ? 'activated' : 'deactivated'} successfully.`, type: 'success' });
      await loadData();
    } catch (err: any) {
      setMessage({ text: 'Failed to update automation status.', type: 'error' });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateMetaAutomation(id);
      setMessage({ text: 'Automation duplicated successfully as inactive draft.', type: 'success' });
      await loadData();
    } catch (err: any) {
      setMessage({ text: 'Failed to duplicate automation.', type: 'error' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the automation "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteMetaAutomation(id);
      setMessage({ text: 'Automation deleted successfully.', type: 'success' });
      await loadData();
    } catch (err: any) {
      setMessage({ text: 'Failed to delete automation.', type: 'error' });
    }
  };

  const handleRetryImport = async (importId: string) => {
    try {
      await retryMetaFailedImport(importId);
      setMessage({ text: 'Retry initiated successfully.', type: 'success' });
      await loadData();
    } catch (err: any) {
      setMessage({ text: 'Retry failed.', type: 'error' });
    }
  };

  const handleAddMappingRow = () => {
    const defaultMetaField = availableMetaFields[0]?.key || 'full_name';
    setFieldMappings([
      ...fieldMappings,
      {
        metaFieldName: defaultMetaField,
        metaFieldLabel: availableMetaFields[0]?.label || defaultMetaField,
        seeakkFieldKey: 'name',
      },
    ]);
  };

  const handleRemoveMappingRow = (index: number) => {
    setFieldMappings(fieldMappings.filter((_, i) => i !== index));
  };

  const handleAutoSuggestMappings = () => {
    if (availableMetaFields.length === 0) return;
    const suggested: MetaFieldMappingItem[] = [];
    for (const mf of availableMetaFields) {
      const keyLower = mf.key.toLowerCase();
      const seeakkKey = DEFAULT_AUTO_MAPPING[keyLower];
      if (seeakkKey) {
        suggested.push({
          metaFieldName: mf.key,
          metaFieldLabel: mf.label || mf.key,
          seeakkFieldKey: seeakkKey,
        });
      }
    }
    if (suggested.length > 0) {
      setFieldMappings(suggested);
      setMessage({ text: `Auto-mapped ${suggested.length} compatible field(s).`, type: 'success' });
    } else {
      setMessage({ text: 'No standard auto-mapping matches found. Please add mappings manually.', type: 'error' });
    }
  };

  const isConnected = status?.status === 'CONNECTED';

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Facebook size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Settings → Meta Ads</h1>
                <p className="text-xs text-slate-500">
                  Configure multi-automation workflows to capture leads from Facebook &amp; Instagram Lead Ads into Seeakk CRM.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <button
                  type="button"
                  onClick={handleConnectMeta}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={14} /> Reconnect
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <Power size={14} /> Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnectMeta}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Facebook size={16} /> Connect Meta Account
              </button>
            )}
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Connection Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-base font-bold text-slate-800">{isConnected ? 'Connected' : 'Not Connected'}</span>
            </div>
            <span className="text-[11px] text-slate-400 block truncate">{status?.accountName || 'No account linked'}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Automations</span>
            <div className="text-xl font-bold text-slate-900">{automations.filter((a) => a.enabled).length}</div>
            <span className="text-[11px] text-slate-400 block">{automations.length} Total Workflows</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Imported Today</span>
            <div className="text-xl font-bold text-emerald-600">{status?.importedToday || 0}</div>
            <span className="text-[11px] text-slate-400 block">{status?.importedMonth || 0} This Month</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Failed Imports</span>
            <div className="text-xl font-bold text-rose-600">{status?.failedImports || 0}</div>
            <span className="text-[11px] text-slate-400 block truncate">
              Last Sync: {status?.lastSync ? new Date(status.lastSync).toLocaleTimeString() : 'Never'}
            </span>
          </div>
        </div>

        {/* Tabs & Main Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 px-6 pt-4 gap-4 bg-slate-50/50">
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => setActiveTab('automations')}
                className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'automations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Workflow size={14} /> Meta Lead Automations ({automations.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pages')}
                className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'pages' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Layers size={14} /> Connected Accounts &amp; Pages ({connections.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('activity')}
                className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'activity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Activity size={14} /> Sync Activity ({syncLogs.length})
              </button>
            </div>

            {activeTab === 'automations' && (
              <button
                type="button"
                onClick={handleOpenCreate}
                disabled={!isConnected}
                className="mb-3 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Plus size={16} /> Create Automation
              </button>
            )}
          </div>

          <div className="p-6">
            {/* Tab 1: Meta Lead Automations */}
            {activeTab === 'automations' && (
              <div className="space-y-4">
                {!isConnected ? (
                  <div className="text-center py-12 space-y-4 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <Facebook size={32} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Connect Meta Account</h3>
                    <p className="text-xs text-slate-500">
                      Connect your Facebook Business account to set up lead form automations, field mappings, and automatic lead creation.
                    </p>
                    <button
                      type="button"
                      onClick={handleConnectMeta}
                      className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Facebook size={16} /> Connect Meta Account
                    </button>
                  </div>
                ) : automations.length === 0 ? (
                  <div className="text-center py-12 space-y-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <Workflow className="w-12 h-12 text-slate-300 mx-auto" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">No Meta Lead Automations Configured</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Create your first automation workflow to map Facebook Lead Ads forms to Seeakk CRM lead fields.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Plus size={16} /> Create First Automation
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {automations.map((auto) => (
                      <div
                        key={auto.id}
                        className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-slate-900">{auto.name}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(auto.id, auto.enabled)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                                auto.enabled
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {auto.enabled ? '● Active' : '○ Inactive'}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Account</span>
                              <span className="font-semibold text-slate-800 truncate block">{auto.metaConnectionName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Page</span>
                              <span className="font-semibold text-slate-800 truncate block">{auto.pageName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Lead Form</span>
                              <span className="font-semibold text-slate-800 truncate block">{auto.formName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Field Mappings</span>
                              <span className="font-semibold text-slate-800 block">{auto.fieldMappings?.length || 0} fields</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                            <span>Stage: <strong className="text-slate-700">{auto.defaultLeadStage?.name || 'Default'}</strong></span>
                            <span>Source: <strong className="text-slate-700">{auto.leadSource?.name || 'Meta Ads'}</strong></span>
                            <span>Assignment: <strong className="text-slate-700">{auto.assignmentType}</strong></span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(auto)}
                            title="Edit Automation"
                            className="p-2 text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition cursor-pointer"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(auto.id)}
                            title="Duplicate Automation"
                            className="p-2 text-slate-600 bg-slate-100 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition cursor-pointer"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(auto.id, auto.name)}
                            title="Delete Automation"
                            className="p-2 text-slate-600 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Connected Accounts & Pages */}
            {activeTab === 'pages' && (
              <div className="space-y-6">
                {connections.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">No Meta Business accounts connected yet.</div>
                ) : (
                  connections.map((conn) => (
                    <div key={conn.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Facebook size={16} className="text-blue-600" />
                          <span className="font-bold text-xs text-slate-900">{conn.metaUserName || 'Meta Business Account'}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                            {conn.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Meta User ID: {conn.metaUserId}</span>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Connected Pages</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {conn.pages?.map((page: any) => (
                            <div key={page.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-xs text-slate-800 block">{page.pageName}</span>
                                <span className="text-[10px] text-slate-400">Page ID: {page.metaPageId}</span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {page.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Sync Activity */}
            {activeTab === 'activity' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <th className="p-3">Received Time</th>
                      <th className="p-3">Meta Lead ID</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Created Lead</th>
                      <th className="p-3">Stage</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {syncLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No lead imports recorded yet.
                        </td>
                      </tr>
                    ) : (
                      syncLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="p-3 text-slate-600">{new Date(log.receivedAt).toLocaleString()}</td>
                          <td className="p-3 font-mono text-slate-800">{log.metaLeadId}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === 'IMPORTED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.status === 'PROCESSING'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-900">{log.lead?.name || '—'}</td>
                          <td className="p-3 text-slate-600">{log.lead?.stage?.name || '—'}</td>
                          <td className="p-3">
                            {log.status !== 'IMPORTED' && (
                              <button
                                type="button"
                                onClick={() => handleRetryImport(log.id)}
                                className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <RefreshCw size={12} /> Retry
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Create / Edit Automation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <Workflow size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {editingAutomationId ? 'Edit Meta Lead Automation' : 'Create Meta Lead Automation'}
                    </h3>
                    <p className="text-xs text-slate-500">Configure Facebook Lead Ads form mapping &amp; automated lead creation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1.5 rounded-full hover:bg-slate-200 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
                {/* 1. Workflow Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    1. Automation Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="e.g. Kerala Property Campaign Leads"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                {/* 2. Connected Account & Page Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      2. Meta Connection <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedConnectionId}
                      onChange={(e) => void handleConnectionChange(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 outline-none focus:border-blue-500"
                    >
                      <option value="">Select Meta Connection...</option>
                      {connections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.metaUserName || 'Meta Account'} ({c.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      3. Facebook Page <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedPageConnectionId}
                      onChange={(e) => void handlePageChange(e.target.value)}
                      disabled={!selectedConnectionId || availablePages.length === 0}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:opacity-60"
                    >
                      <option value="">Select Facebook Page...</option>
                      {availablePages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.pageName} (ID: {p.metaPageId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Lead Form Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      4. Facebook Lead Form <span className="text-rose-500">*</span>
                    </label>
                    {selectedPageConnectionId && (
                      <button
                        type="button"
                        onClick={() => void handlePageChange(selectedPageConnectionId)}
                        disabled={fetchingForms}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={11} className={fetchingForms ? 'animate-spin' : ''} /> Refresh Live Forms
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedMetaFormId}
                    onChange={(e) => void handleFormChange(e.target.value)}
                    disabled={!selectedPageConnectionId || fetchingForms || availableForms.length === 0}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:opacity-60"
                  >
                    <option value="">
                      {fetchingForms ? 'Loading forms from Meta Graph API...' : 'Select Lead Form...'}
                    </option>
                    {availableForms.map((f) => (
                      <option key={f.id || f.metaFormId} value={f.metaFormId || f.id}>
                        {f.name || f.formName} ({f.status || 'ACTIVE'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Field Mapping Builder */}
                <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                        5. Field Mapping Schema
                      </h4>
                      <p className="text-[11px] text-slate-500">Map Meta Lead Form questions to Seeakk Lead fields.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {availableMetaFields.length > 0 && (
                        <button
                          type="button"
                          onClick={handleAutoSuggestMappings}
                          className="px-3 py-1.5 text-[11px] font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition cursor-pointer"
                        >
                          Auto-Suggest
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleAddMappingRow}
                        className="px-3 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={13} /> Add Row
                      </button>
                    </div>
                  </div>

                  {fetchingFields ? (
                    <div className="py-6 text-center text-xs text-slate-400">Loading form question schema from Meta...</div>
                  ) : fieldMappings.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 italic">
                      Select a Lead Form to load questions, or click "Add Row" to manually configure field mapping.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase text-slate-400 px-2">
                        <div className="col-span-5">Seeakk Lead Field (Destination)</div>
                        <div className="col-span-1 text-center">Direction</div>
                        <div className="col-span-5">Meta Form Question / Value (Source)</div>
                        <div className="col-span-1 text-right">Action</div>
                      </div>

                      {fieldMappings.map((mapping, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                          {/* SEEAKK Field (Label) */}
                          <div className="col-span-5">
                            <select
                              value={mapping.seeakkFieldKey}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFieldMappings(
                                  fieldMappings.map((m, i) => (i === idx ? { ...m, seeakkFieldKey: val } : m))
                                );
                              }}
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-900 outline-none focus:border-blue-500"
                            >
                              <option value="ignore">-- Do Not Import --</option>
                              {seeakkFields.map((sf) => (
                                <option key={sf.key} value={sf.key}>
                                  {sf.label} {sf.isRequired ? '*' : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Direction Indicator */}
                          <div className="col-span-1 text-center font-bold text-slate-400 text-xs">
                            ←
                          </div>

                          {/* Meta Field (Value) */}
                          <div className="col-span-5">
                            <select
                              value={mapping.metaFieldName}
                              onChange={(e) => {
                                const val = e.target.value;
                                const mfObj = availableMetaFields.find((f) => f.key === val);
                                setFieldMappings(
                                  fieldMappings.map((m, i) =>
                                    i === idx ? { ...m, metaFieldName: val, metaFieldLabel: mfObj?.label || val } : m
                                  )
                                );
                              }}
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-900 outline-none focus:border-blue-500"
                            >
                              {availableMetaFields.map((mf) => (
                                <option key={mf.key} value={mf.key}>
                                  {mf.label} ({mf.key})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Remove */}
                          <div className="col-span-1 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveMappingRow(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Lead Setup & Assignment Settings */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600">6. Lead Setup &amp; Assignment</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Lead Stage *</label>
                      <select
                        value={selectedStageId}
                        onChange={(e) => setSelectedStageId(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        {stages.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Source *</label>
                      <select
                        value={selectedSourceId}
                        onChange={(e) => setSelectedSourceId(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        {sources.map((src) => (
                          <option key={src.id} value={src.id}>
                            {src.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Assignment Strategy</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['UNASSIGNED', 'SPECIFIC_USER', 'ROUND_ROBIN'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAssignmentType(type)}
                          className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            assignmentType === type
                              ? 'bg-blue-50 border-blue-600 text-blue-600'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {type === 'UNASSIGNED' ? 'Unassigned' : type === 'SPECIFIC_USER' ? 'Specific User' : 'Round Robin'}
                        </button>
                      ))}
                    </div>

                    {assignmentType === 'SPECIFIC_USER' && (
                      <div className="mt-2">
                        <select
                          value={assignmentUserId}
                          onChange={(e) => setAssignmentUserId(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900"
                        >
                          <option value="">Select Sales Rep...</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name || u.username || u.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {assignmentType === 'ROUND_ROBIN' && (
                      <div className="mt-2 max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-white">
                        {users.map((u) => (
                          <label key={u.id} className="flex items-center gap-2 text-xs text-slate-700 font-medium p-1 hover:bg-slate-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={roundRobinUserIds.includes(u.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRoundRobinUserIds([...roundRobinUserIds, u.id]);
                                } else {
                                  setRoundRobinUserIds(roundRobinUserIds.filter((id) => id !== u.id));
                                }
                              }}
                              className="rounded text-blue-600"
                            />
                            {u.name || u.username || u.email}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-50/60 border border-blue-100 rounded-2xl">
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">7. Automation Active Status</span>
                    <span className="text-[11px] text-slate-500">Enable automatic lead creation when Meta Lead Ads form is submitted</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formEnabled}
                    onChange={(e) => setFormEnabled(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAutomation}
                  disabled={saving}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving Automation...</span>
                    </>
                  ) : (
                    <span>Save &amp; Activate Automation</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MetaAdsSettingsPage;
