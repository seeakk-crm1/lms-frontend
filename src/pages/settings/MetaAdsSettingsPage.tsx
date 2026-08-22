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
  Plus,
  Trash2,
  Copy,
  Play,
  Check,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  getMetaAuthUrl,
  getMetaConnections,
  disconnectMetaConnection,
  getMetaPagesForConnection,
  getMetaFormsForPage,
  getMetaFormFields,
  getMetaAutomations,
  createMetaAutomation,
  updateMetaAutomation,
  deleteMetaAutomation,
  duplicateMetaAutomation,
  toggleMetaAutomation,
  testMetaAutomation,
  getMetaAutomationLogs,
  retryMetaAutomationRun,
  MetaConnectionItem,
  MetaPageItem,
  MetaFormItem,
  MetaFormFieldItem,
  MetaAutomationItem,
  MetaMappingInput,
  MetaTestResult,
  MetaRunLogItem,
} from '../../services/metaAds.api';
import { getLeadStages } from '../../services/leadStage.api';
import { getLeadSources } from '../../services/leadSource.api';
import { getUsers } from '../../services/users.api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const CRM_DESTINATION_OPTIONS = [
  { key: 'name', label: 'Lead Name *' },
  { key: 'phone', label: 'Phone / Mobile Number *' },
  { key: 'email', label: 'Email Address' },
  { key: 'companyName', label: 'Company Name' },
  { key: 'address', label: 'Address / Location' },
  { key: 'remarks', label: 'Remarks / Notes' },
  { key: 'totalAmount', label: 'Deal Amount / Budget' },
  { key: 'sourceId', label: 'CRM Lead Source' },
  { key: 'stageId', label: 'CRM Lead Stage' },
  { key: 'assignedToId', label: 'Assigned Sales Rep' },
];

const SYSTEM_VALUE_OPTIONS = [
  { key: 'PAGE_NAME', label: 'Facebook Page Name' },
  { key: 'PAGE_ID', label: 'Facebook Page ID' },
  { key: 'FORM_NAME', label: 'Lead Form Name' },
  { key: 'FORM_ID', label: 'Lead Form ID' },
  { key: 'META_LEAD_ID', label: 'Meta Lead ID' },
  { key: 'AD_ID', label: 'Facebook Ad ID' },
  { key: 'ADSET_ID', label: 'Facebook AdSet ID' },
  { key: 'CAMPAIGN_ID', label: 'Facebook Campaign ID' },
  { key: 'CONNECTION_NAME', label: 'Meta Connection Name' },
];

const DEFAULT_MAPPING_SUGGESTIONS: Record<string, string> = {
  full_name: 'name',
  name: 'name',
  first_name: 'name',
  phone_number: 'phone',
  phone: 'phone',
  mobile: 'phone',
  email: 'email',
  email_address: 'email',
  company_name: 'companyName',
  city: 'address',
  street_address: 'address',
};

const MetaAdsSettingsPage: React.FC = () => {
  const [connections, setConnections] = useState<MetaConnectionItem[]>([]);
  const [automations, setAutomations] = useState<MetaAutomationItem[]>([]);
  const [logs, setLogs] = useState<MetaRunLogItem[]>([]);

  const [stages, setStages] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'automations' | 'connections' | 'activity'>('automations');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Automation Modal State
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [editingAutomationId, setEditingAutomationId] = useState<string | null>(null);
  const [savingAutomation, setSavingAutomation] = useState(false);

  // Form Fields State inside Modal
  const [automationName, setAutomationName] = useState('');
  const [automationActive, setAutomationActive] = useState(true);
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [selectedPageId, setSelectedPageId] = useState('');
  const [selectedMetaFormId, setSelectedMetaFormId] = useState('');
  const [selectedMetaFormName, setSelectedMetaFormName] = useState('');

  const [availablePages, setAvailablePages] = useState<MetaPageItem[]>([]);
  const [availableForms, setAvailableForms] = useState<MetaFormItem[]>([]);
  const [availableFields, setAvailableFields] = useState<MetaFormFieldItem[]>([]);

  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);

  const [mappings, setMappings] = useState<MetaMappingInput[]>([
    { destinationKey: 'name', sourceType: 'FIELD', sourceKey: 'full_name' },
    { destinationKey: 'phone', sourceType: 'FIELD', sourceKey: 'phone_number' },
    { destinationKey: 'email', sourceType: 'FIELD', sourceKey: 'email' },
  ]);

  // Test Modal State
  const [testResult, setTestResult] = useState<MetaTestResult | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [connsRes, autosRes, logsRes, stagesRes, sourcesRes, usersRes] = await Promise.all([
        getMetaConnections(),
        getMetaAutomations(),
        getMetaAutomationLogs(),
        getLeadStages(),
        getLeadSources(),
        getUsers({ page: 1, limit: 100 }),
      ]);

      setConnections(connsRes);
      setAutomations(autosRes);
      setLogs(logsRes);
      setStages(Array.isArray(stagesRes) ? stagesRes : (stagesRes as any)?.data || []);
      setSources(Array.isArray(sourcesRes) ? sourcesRes : (sourcesRes as any)?.data || []);
      setUsers(Array.isArray(usersRes?.users) ? usersRes.users : Array.isArray(usersRes) ? usersRes : []);
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
      setMessage({
        text: err.response?.data?.error?.message || err.message || 'Failed to initiate Meta OAuth.',
        type: 'error',
      });
    }
  };

  const handleDisconnectConnection = async (connId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to disconnect this Meta account? Associated automations will be paused.',
      )
    ) {
      return;
    }
    try {
      await disconnectMetaConnection(connId);
      setMessage({ text: 'Meta account disconnected successfully.', type: 'success' });
      await loadData();
    } catch (err: any) {
      setMessage({ text: 'Failed to disconnect account.', type: 'error' });
    }
  };

  // Connection selection change in modal
  const handleConnectionChange = async (connId: string) => {
    setSelectedConnectionId(connId);
    setSelectedPageId('');
    setSelectedMetaFormId('');
    setAvailablePages([]);
    setAvailableForms([]);
    setAvailableFields([]);

    if (!connId) return;
    setLoadingPages(true);
    try {
      const pages = await getMetaPagesForConnection(connId);
      setAvailablePages(pages);
      if (pages.length > 0) {
        await handlePageChange(pages[0].id, connId);
      }
    } catch (err: any) {
      setMessage({ text: 'Failed to load Facebook Pages for connection.', type: 'error' });
    } finally {
      setLoadingPages(false);
    }
  };

  // Page selection change in modal
  const handlePageChange = async (pageId: string, connId = selectedConnectionId) => {
    setSelectedPageId(pageId);
    setSelectedMetaFormId('');
    setAvailableForms([]);
    setAvailableFields([]);

    if (!pageId) return;
    setLoadingForms(true);
    try {
      const forms = await getMetaFormsForPage(pageId);
      setAvailableForms(forms);
      if (forms.length > 0) {
        await handleFormChange(forms[0].metaFormId, forms[0].formName, pageId);
      }
    } catch (err: any) {
      setMessage({ text: 'Failed to load Lead Forms for Facebook Page.', type: 'error' });
    } finally {
      setLoadingForms(false);
    }
  };

  // Form selection change in modal
  const handleFormChange = async (
    formMetaId: string,
    formName: string,
    pageId = selectedPageId,
  ) => {
    setSelectedMetaFormId(formMetaId);
    setSelectedMetaFormName(formName);
    setAvailableFields([]);

    if (!formMetaId || !pageId) return;
    setLoadingFields(true);
    try {
      const fields = await getMetaFormFields(pageId, formMetaId);
      setAvailableFields(fields);

      // Auto-suggest initial field mappings if creating new automation
      if (!editingAutomationId && fields.length > 0) {
        const autoMappings: MetaMappingInput[] = [];
        for (const f of fields) {
          const destKey = DEFAULT_MAPPING_SUGGESTIONS[f.key] || DEFAULT_MAPPING_SUGGESTIONS[f.id];
          if (destKey) {
            autoMappings.push({
              destinationKey: destKey,
              sourceType: 'FIELD',
              sourceKey: f.key || f.id,
            });
          }
        }

        if (autoMappings.length > 0) {
          setMappings(autoMappings);
        }
      }
    } catch (err: any) {
      console.warn('Could not fetch questions via Graph API, using default field list.', err);
    } finally {
      setLoadingFields(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAutomationId(null);
    setAutomationName('');
    setAutomationActive(true);
    setSelectedConnectionId(connections[0]?.id || '');
    setSelectedPageId('');
    setSelectedMetaFormId('');
    setSelectedMetaFormName('');
    setMappings([
      { destinationKey: 'name', sourceType: 'FIELD', sourceKey: 'full_name' },
      { destinationKey: 'phone', sourceType: 'FIELD', sourceKey: 'phone_number' },
      { destinationKey: 'email', sourceType: 'FIELD', sourceKey: 'email' },
    ]);
    setIsAutomationModalOpen(true);

    if (connections.length > 0) {
      void handleConnectionChange(connections[0].id);
    }
  };

  const handleOpenEditModal = async (auto: MetaAutomationItem) => {
    setEditingAutomationId(auto.id);
    setAutomationName(auto.name);
    setAutomationActive(auto.isActive);
    setSelectedConnectionId(auto.connectionId);
    setSelectedPageId(auto.pageId);
    setSelectedMetaFormId(auto.metaFormId);
    setSelectedMetaFormName(auto.metaFormName);

    setIsAutomationModalOpen(true);

    // Fetch details with mappings
    try {
      const details = await getMetaAutomations();
      const current = details.find((d) => d.id === auto.id);
      if (current && current.mappings) {
        setMappings(current.mappings);
      }
    } catch (err) {}

    // Load Pages and Forms
    try {
      const pages = await getMetaPagesForConnection(auto.connectionId);
      setAvailablePages(pages);
      const forms = await getMetaFormsForPage(auto.pageId);
      setAvailableForms(forms);
      const fields = await getMetaFormFields(auto.pageId, auto.metaFormId);
      setAvailableFields(fields);
    } catch (err) {}
  };

  const handleSaveAutomation = async () => {
    if (!automationName.trim()) {
      setMessage({ text: 'Please enter an Automation Name.', type: 'error' });
      return;
    }
    if (!selectedConnectionId || !selectedPageId || !selectedMetaFormId) {
      setMessage({ text: 'Please select Connection, Page, and Lead Form.', type: 'error' });
      return;
    }
    if (mappings.length === 0) {
      setMessage({ text: 'Please add at least one field mapping rule.', type: 'error' });
      return;
    }

    setSavingAutomation(true);
    try {
      if (editingAutomationId) {
        await updateMetaAutomation(editingAutomationId, {
          name: automationName,
          isActive: automationActive,
          mappings,
        });
        setMessage({ text: `Automation "${automationName}" updated successfully.`, type: 'success' });
      } else {
        await createMetaAutomation({
          name: automationName,
          connectionId: selectedConnectionId,
          pageId: selectedPageId,
          metaFormId: selectedMetaFormId,
          metaFormName: selectedMetaFormName,
          isActive: automationActive,
          mappings,
        });
        setMessage({ text: `Automation "${automationName}" created & active.`, type: 'success' });
      }
      setIsAutomationModalOpen(false);
      await loadData();
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.error?.message || err.message || 'Failed to save automation.',
        type: 'error',
      });
    } finally {
      setSavingAutomation(false);
    }
  };

  const handleToggleAutomation = async (id: string, currentActive: boolean) => {
    try {
      await toggleMetaAutomation(id, !currentActive);
      setAutomations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !currentActive } : a)),
      );
      setMessage({
        text: `Automation ${!currentActive ? 'enabled' : 'disabled'} successfully.`,
        type: 'success',
      });
    } catch (err: any) {
      setMessage({ text: 'Failed to toggle automation status.', type: 'error' });
    }
  };

  const handleDuplicateAutomation = async (id: string) => {
    try {
      await duplicateMetaAutomation(id);
      setMessage({ text: 'Automation duplicated successfully.', type: 'success' });
      await loadData();
    } catch (err: any) {
      setMessage({ text: 'Failed to duplicate automation.', type: 'error' });
    }
  };

  const handleDeleteAutomation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this automation?')) return;
    try {
      await deleteMetaAutomation(id);
      setMessage({ text: 'Automation deleted successfully.', type: 'success' });
      await loadData();
    } catch (err: any) {
      setMessage({ text: 'Failed to delete automation.', type: 'error' });
    }
  };

  const handleRunTest = async (id: string) => {
    setTestingId(id);
    try {
      const res = await testMetaAutomation(id);
      setTestResult(res);
      setIsTestModalOpen(true);
    } catch (err: any) {
      setMessage({ text: 'Failed to execute diagnostic test.', type: 'error' });
    } finally {
      setTestingId(null);
    }
  };

  const handleRetryRun = async (runId: string) => {
    try {
      await retryMetaAutomationRun(runId);
      setMessage({ text: 'Retry initiated successfully.', type: 'success' });
      await loadData();
    } catch (err: any) {
      setMessage({ text: 'Failed to retry run.', type: 'error' });
    }
  };

  const activeAutomationsCount = automations.filter((a) => a.isActive).length;
  const totalLeadsReceived = automations.reduce((acc, a) => acc + a.leadsReceivedCount, 0);
  const activeConnectionsCount = connections.filter((c) => c.status === 'CONNECTED').length;

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
                  Connect multiple Facebook accounts, map Lead Form questions to CRM fields, and import leads in real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleConnectMeta}
              className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Facebook size={16} /> + Connect Meta Account
            </button>
            <button
              onClick={handleOpenCreateModal}
              disabled={connections.length === 0}
              className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={16} /> + Create Automation
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Meta Connections</span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeConnectionsCount > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className="text-xl font-bold text-slate-900">{connections.length}</span>
            </div>
            <span className="text-[11px] text-slate-400 block truncate">{activeConnectionsCount} Active Connected</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Lead Automations</span>
            <div className="text-xl font-bold text-slate-900">{automations.length}</div>
            <span className="text-[11px] text-slate-400 block">{activeAutomationsCount} Enabled</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Leads Captured</span>
            <div className="text-xl font-bold text-emerald-600">{totalLeadsReceived}</div>
            <span className="text-[11px] text-slate-400 block">From Meta Lead Forms</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recent Executions</span>
            <div className="text-xl font-bold text-blue-600">{logs.length}</div>
            <span className="text-[11px] text-slate-400 block truncate">Webhook Runs Logged</span>
          </div>
        </div>

        {/* Main Tabs Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 bg-slate-50/50">
            <button
              onClick={() => setActiveTab('automations')}
              className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                activeTab === 'automations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Zap size={14} /> Lead Automations ({automations.length})
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                activeTab === 'connections'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Facebook size={14} /> Meta Accounts & Pages ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Activity size={14} /> Activity & Webhook Logs ({logs.length})
            </button>
          </div>

          <div className="p-6">
            {/* 1. AUTOMATIONS TAB */}
            {activeTab === 'automations' && (
              <div className="space-y-4">
                {automations.length === 0 ? (
                  <div className="text-center py-12 space-y-4 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <Zap size={32} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">No Lead Automations Created</h3>
                    <p className="text-xs text-slate-500">
                      Create an automation to map Facebook Lead Form questions to Seeakk CRM lead fields and capture leads automatically.
                    </p>
                    <button
                      onClick={handleOpenCreateModal}
                      disabled={connections.length === 0}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      <Plus size={16} /> Create First Automation
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {automations.map((auto) => (
                      <div
                        key={auto.id}
                        className="p-5 border border-slate-200 rounded-2xl hover:border-slate-300 transition bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">{auto.name}</span>
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                auto.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${auto.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {auto.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-y-1 gap-x-4">
                            <span>
                              Connection: <strong className="text-slate-700">{auto.connectionName}</strong>
                            </span>
                            <span>
                              Page: <strong className="text-slate-700">{auto.pageName}</strong>
                            </span>
                            <span>
                              Form: <strong className="text-slate-700">{auto.metaFormName}</strong>
                            </span>
                            <span>
                              Mappings: <strong className="text-slate-700">{auto.mappingCount} rules</strong>
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center gap-4 pt-1">
                            <span>Leads Received: <strong className="text-slate-700">{auto.leadsReceivedCount}</strong></span>
                            <span>
                              Last Lead:{' '}
                              <strong className="text-slate-700">
                                {auto.lastLeadAt ? new Date(auto.lastLeadAt).toLocaleString() : 'Never'}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 self-start md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 w-full md:w-auto justify-end">
                          <button
                            onClick={() => handleToggleAutomation(auto.id, auto.isActive)}
                            title={auto.isActive ? 'Disable Automation' : 'Enable Automation'}
                            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                          >
                            {auto.isActive ? (
                              <ToggleRight size={18} className="text-emerald-600" />
                            ) : (
                              <ToggleLeft size={18} className="text-slate-400" />
                            )}
                          </button>

                          <button
                            onClick={() => handleRunTest(auto.id)}
                            disabled={testingId === auto.id}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition flex items-center gap-1.5"
                          >
                            <Play size={13} /> Test Ready
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(auto)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
                          >
                            <Settings2 size={13} /> Edit
                          </button>

                          <button
                            onClick={() => handleDuplicateAutomation(auto.id)}
                            title="Duplicate Automation"
                            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                          >
                            <Copy size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteAutomation(auto.id)}
                            title="Delete Automation"
                            className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. CONNECTIONS TAB */}
            {activeTab === 'connections' && (
              <div className="space-y-6">
                {connections.length === 0 ? (
                  <div className="text-center py-12 space-y-4 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <Facebook size={32} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">No Meta Accounts Connected</h3>
                    <p className="text-xs text-slate-500">
                      Connect your Facebook business account to grant access to Pages and Lead Forms.
                    </p>
                    <button
                      onClick={handleConnectMeta}
                      className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition inline-flex items-center gap-2"
                    >
                      <Facebook size={16} /> Connect Meta Account
                    </button>
                  </div>
                ) : (
                  connections.map((conn) => (
                    <div key={conn.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                            <Facebook size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">{conn.name}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  conn.status === 'CONNECTED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {conn.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-mono">Meta User ID: {conn.metaUserId}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleConnectMeta}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition flex items-center gap-1.5"
                          >
                            <RefreshCw size={13} /> Reconnect
                          </button>
                          <button
                            onClick={() => handleDisconnectConnection(conn.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1.5"
                          >
                            <Power size={13} /> Disconnect
                          </button>
                        </div>
                      </div>

                      {/* Connected Pages Sub-table */}
                      <div className="p-4 bg-white space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                          Accessible Facebook Pages ({conn.pages?.length || 0})
                        </h4>

                        {!conn.pages || conn.pages.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No Facebook Pages retrieved for this account.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {conn.pages.map((p) => (
                              <div
                                key={p.id}
                                className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  {p.pictureUrl ? (
                                    <img src={p.pictureUrl} alt={p.pageName} className="w-8 h-8 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center">
                                      {p.pageName.substring(0, 1)}
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-bold text-xs text-slate-900 block">{p.pageName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">ID: {p.metaPageId}</span>
                                  </div>
                                </div>

                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    p.subscribedToLeadgen
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {p.subscribedToLeadgen ? 'Webhook Active' : 'Pending Automation'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. ACTIVITY LOGS TAB */}
            {activeTab === 'activity' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <th className="p-3">Received Time</th>
                      <th className="p-3">Automation / Form</th>
                      <th className="p-3">Meta Lead ID</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Created CRM Lead</th>
                      <th className="p-3">Error / Details</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No webhook activity recorded yet.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="p-3 text-slate-600 whitespace-nowrap">
                            {new Date(log.startedAt).toLocaleString()}
                          </td>
                          <td className="p-3 font-medium text-slate-900">
                            <div>{log.automationName || 'Meta Lead Form'}</div>
                            <div className="text-[10px] text-slate-400">{log.formName}</div>
                          </td>
                          <td className="p-3 font-mono text-slate-700">{log.leadgenId}</td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === 'SUCCESS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.status === 'PROCESSING'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-900">
                            {log.crmLead ? (
                              <div>
                                <span>{log.crmLead.name}</span>
                                <span className="text-[10px] text-slate-400 block font-mono">{log.crmLead.phone}</span>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="p-3 text-slate-500 max-w-xs truncate">{log.errorMessage || 'Clean processing'}</td>
                          <td className="p-3">
                            {log.status !== 'SUCCESS' && (
                              <button
                                onClick={() => handleRetryRun(log.id)}
                                className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1"
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

        {/* CREATE / EDIT AUTOMATION MODAL */}
        {isAutomationModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingAutomationId ? 'Edit Lead Automation' : 'Create Meta Lead Automation'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure Facebook Page, Lead Form, and CRM Field Mappings</p>
                </div>
                <button onClick={() => setIsAutomationModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* 1. Basic Details */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">1. Basic Automation Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Automation Name *</label>
                      <input
                        type="text"
                        value={automationName}
                        onChange={(e) => setAutomationName(e.target.value)}
                        placeholder="e.g. Website Lead Form - Facebook Ads"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                      <button
                        type="button"
                        onClick={() => setAutomationActive(!automationActive)}
                        className={`w-full p-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                          automationActive
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-slate-100 border-slate-300 text-slate-500'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${automationActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {automationActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Facebook Source Discovery */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">2. Facebook Source & Lead Form</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook Account *</label>
                      <select
                        value={selectedConnectionId}
                        onChange={(e) => handleConnectionChange(e.target.value)}
                        disabled={Boolean(editingAutomationId)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select Connection...</option>
                        {connections.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook Page *</label>
                      <select
                        value={selectedPageId}
                        onChange={(e) => handlePageChange(e.target.value)}
                        disabled={loadingPages || !selectedConnectionId || Boolean(editingAutomationId)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">{loadingPages ? 'Loading Pages...' : 'Select Page...'}</option>
                        {availablePages.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.pageName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Form *</label>
                      <select
                        value={selectedMetaFormId}
                        onChange={(e) => {
                          const form = availableForms.find((f) => f.metaFormId === e.target.value);
                          if (form) handleFormChange(form.metaFormId, form.formName);
                        }}
                        disabled={loadingForms || !selectedPageId || Boolean(editingAutomationId)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">{loadingForms ? 'Loading Forms...' : 'Select Lead Form...'}</option>
                        {availableForms.map((f) => (
                          <option key={f.id} value={f.metaFormId}>
                            {f.formName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Dynamic Field Mapping Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">3. Field Mapping Rules</h4>
                    <button
                      type="button"
                      onClick={() =>
                        setMappings([
                          ...mappings,
                          { destinationKey: 'remarks', sourceType: 'FIELD', sourceKey: '' },
                        ])
                      }
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Mapping Rule
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {mappings.map((m, idx) => (
                      <div key={idx} className="p-3 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="w-full md:w-1/3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CRM Destination Field</label>
                          <select
                            value={m.destinationKey}
                            onChange={(e) => {
                              const newKey = e.target.value;
                              setMappings(mappings.map((item, i) => (i === idx ? { ...item, destinationKey: newKey } : item)));
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-900"
                          >
                            {CRM_DESTINATION_OPTIONS.map((opt) => (
                              <option key={opt.key} value={opt.key}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full md:w-1/4">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Source Type</label>
                          <select
                            value={m.sourceType}
                            onChange={(e) => {
                              const newType = e.target.value as 'FIELD' | 'STATIC' | 'SYSTEM';
                              setMappings(
                                mappings.map((item, i) =>
                                  i === idx ? { ...item, sourceType: newType, sourceKey: '', staticValue: '' } : item,
                                ),
                              );
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-900"
                          >
                            <option value="FIELD">Facebook Form Field</option>
                            <option value="STATIC">Static Text Value</option>
                            <option value="SYSTEM">System Metadata</option>
                          </select>
                        </div>

                        <div className="w-full md:w-1/3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            {m.sourceType === 'FIELD' ? 'Facebook Question' : m.sourceType === 'STATIC' ? 'Static Value' : 'System Value'}
                          </label>

                          {m.sourceType === 'FIELD' ? (
                            <select
                              value={m.sourceKey || ''}
                              onChange={(e) => {
                                const newKey = e.target.value;
                                setMappings(mappings.map((item, i) => (i === idx ? { ...item, sourceKey: newKey } : item)));
                              }}
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-900"
                            >
                              <option value="">Select Question...</option>
                              {availableFields.map((f) => (
                                <option key={f.id} value={f.key || f.id}>
                                  {f.label} ({f.key})
                                </option>
                              ))}
                            </select>
                          ) : m.sourceType === 'STATIC' ? (
                            <input
                              type="text"
                              value={m.staticValue || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMappings(mappings.map((item, i) => (i === idx ? { ...item, staticValue: val } : item)));
                              }}
                              placeholder="Type static value..."
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-900"
                            />
                          ) : (
                            <select
                              value={m.sourceKey || ''}
                              onChange={(e) => {
                                const newKey = e.target.value;
                                setMappings(mappings.map((item, i) => (i === idx ? { ...item, sourceKey: newKey } : item)));
                              }}
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-900"
                            >
                              <option value="">Select System Metadata...</option>
                              {SYSTEM_VALUE_OPTIONS.map((sys) => (
                                <option key={sys.key} value={sys.key}>
                                  {sys.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setMappings(mappings.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1 self-end md:self-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAutomationModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAutomation}
                  disabled={savingAutomation}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {savingAutomation ? 'Saving...' : 'Save Lead Automation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TEST AUTOMATION DIAGNOSTIC MODAL */}
        {isTestModalOpen && testResult && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Diagnostic Test Checklist</h3>
                  <p className="text-xs text-slate-500">{testResult.automationName}</p>
                </div>
                <button onClick={() => setIsTestModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div
                  className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    testResult.ready
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {testResult.ready ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {testResult.ready ? 'AUTOMATION READY TO RECEIVE LEADS' : 'AUTOMATION NEEDS ATTENTION'}
                </div>

                <div className="space-y-2">
                  {testResult.checklist.map((item, idx) => (
                    <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {item.passed ? (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle size={16} className="text-rose-500 shrink-0" />
                        )}
                        <span className="font-bold text-slate-800">{item.name}</span>
                      </div>
                      <span className="text-slate-500 text-[11px]">{item.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm"
                >
                  Close Diagnostic
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
