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
} from 'lucide-react';
import {
  getMetaStatus,
  getMetaPagesAndForms,
  getMetaAuthUrl,
  saveMetaFormConfig,
  getMetaSyncActivity,
  retryMetaFailedImport,
  disconnectMeta,
  MetaStatusData,
} from '../../services/metaAds.api';
import { getLeadStages } from '../../services/leadStage.api';
import { getLeadSources } from '../../services/leadSource.api';
import { getUsers } from '../../services/users.api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const DEFAULT_FIELD_SUGGESTIONS: Record<string, string> = {
  full_name: 'name',
  name: 'name',
  first_name: 'name',
  last_name: 'name',
  phone_number: 'phone',
  phone: 'phone',
  mobile: 'phone',
  email: 'email',
  email_address: 'email',
  budget: 'totalAmount',
  price: 'totalAmount',
  interested_location: 'address',
  location: 'address',
  city: 'address',
  requirement: 'remarks',
  notes: 'remarks',
  message: 'remarks',
};

const MetaAdsSettingsPage: React.FC = () => {
  const [status, setStatus] = useState<MetaStatusData | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forms' | 'activity'>('forms');
  const [selectedForm, setSelectedForm] = useState<any | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form Configuration State
  const [formEnabled, setFormEnabled] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [assignmentType, setAssignmentType] = useState<'UNASSIGNED' | 'SPECIFIC_USER' | 'ROUND_ROBIN'>('UNASSIGNED');
  const [assignmentUserId, setAssignmentUserId] = useState<string>('');
  const [roundRobinUserIds, setRoundRobinUserIds] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Array<{ metaFieldName: string; metaFieldLabel: string; seeakkFieldKey: string }>>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusRes, pagesRes, activityRes, stagesRes, sourcesRes, usersRes] = await Promise.all([
        getMetaStatus(),
        getMetaPagesAndForms(),
        getMetaSyncActivity(),
        getLeadStages(),
        getLeadSources(),
        getUsers({ page: 1, limit: 100 }),
      ]);

      setStatus(statusRes);
      setPages(pagesRes);
      setSyncLogs(activityRes);
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
      setMessage({ text: err.response?.data?.error?.message || err.message || 'Failed to initiate Meta OAuth.', type: 'error' });
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Meta account? Previously imported leads will remain safe.')) {
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

  const handleOpenConfigure = (form: any) => {
    setSelectedForm(form);
    setFormEnabled(Boolean(form.enabled));
    setSelectedStageId(form.defaultLeadStage?.id || form.defaultLeadStageId || (stages[0]?.id || ''));
    setSelectedSourceId(form.leadSource?.id || form.leadSourceId || (sources[0]?.id || ''));
    setAssignmentType(form.assignmentType || 'UNASSIGNED');
    setAssignmentUserId(form.assignmentUserId || '');
    setRoundRobinUserIds(form.roundRobinUserIds || []);

    // Initialize field mappings (or default suggestions)
    const existingMap = new Map(form.fieldMappings?.map((m: any) => [m.metaFieldName, m.seeakkFieldKey]) || []);
    const defaultMetaFields = ['full_name', 'phone_number', 'email', 'budget', 'interested_location', 'requirement'];
    
    const initialMappings: Array<{ metaFieldName: string; metaFieldLabel: string; seeakkFieldKey: string }> = defaultMetaFields.map((field) => ({
      metaFieldName: field,
      metaFieldLabel: field.replace('_', ' ').toUpperCase(),
      seeakkFieldKey: (existingMap.get(field) as string) || DEFAULT_FIELD_SUGGESTIONS[field] || 'ignore',
    }));

    setFieldMappings(initialMappings);
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedForm) return;
    setSaving(true);
    try {
      const payload = {
        enabled: formEnabled,
        defaultLeadStageId: selectedStageId || null,
        leadSourceId: selectedSourceId || null,
        assignmentType,
        assignmentUserId: assignmentType === 'SPECIFIC_USER' ? assignmentUserId : null,
        roundRobinUserIds: assignmentType === 'ROUND_ROBIN' ? roundRobinUserIds : [],
        fieldMappings: fieldMappings.filter((m) => m.seeakkFieldKey !== 'ignore'),
      };

      await saveMetaFormConfig(selectedForm.id, payload);
      setMessage({ text: `Configuration saved for "${selectedForm.formName}".`, type: 'success' });
      setIsConfigModalOpen(false);
      await loadData();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error?.message || 'Failed to save configuration.', type: 'error' });
    } finally {
      setSaving(false);
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
                  Automatically capture leads from Facebook and Instagram Lead Ads and distribute them to your sales team.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <button
                  onClick={handleConnectMeta}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-2"
                >
                  <RefreshCw size={14} /> Reconnect
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-2"
                >
                  <Power size={14} /> Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectMeta}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-2"
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
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                }`}
              />
              <span className="text-base font-bold text-slate-800">
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block truncate">{status?.accountName || 'No account linked'}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Connected Pages</span>
            <div className="text-xl font-bold text-slate-900">{status?.connectedPagesCount || 0}</div>
            <span className="text-[11px] text-slate-400 block">{status?.activeFormsCount || 0} Active Forms</span>
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

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 bg-slate-50/50">
            <button
              onClick={() => setActiveTab('forms')}
              className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                activeTab === 'forms'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Layers size={14} /> Connected Pages & Lead Forms
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Activity size={14} /> Sync Activity ({syncLogs.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'forms' && (
              <div className="space-y-6">
                {!isConnected ? (
                  <div className="text-center py-12 space-y-4 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <Facebook size={32} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Connect Meta Account</h3>
                    <p className="text-xs text-slate-500">
                      Connect your Facebook business account to list lead forms, configure stage mappings, and receive leads automatically.
                    </p>
                    <button
                      onClick={handleConnectMeta}
                      className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition inline-flex items-center gap-2"
                    >
                      <Facebook size={16} /> Connect Meta Account
                    </button>
                  </div>
                ) : pages.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No Facebook Pages found for this account. Make sure you have admin rights to at least one Page.
                  </div>
                ) : (
                  pages.map((page: any) => (
                    <div key={page.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{page.pageName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                            {page.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Page ID: {page.metaPageId}</span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {page.forms.length === 0 ? (
                          <div className="p-4 text-xs text-slate-400 italic text-center">
                            No Lead Forms configured yet for this Page.
                          </div>
                        ) : (
                          page.forms.map((form: any) => (
                            <div key={form.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-slate-900">{form.formName}</span>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      form.enabled
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                    }`}
                                  >
                                    {form.enabled ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-4">
                                  <span>Initial Stage: <strong className="text-slate-700">{form.defaultLeadStage?.name || 'Not Configured'}</strong></span>
                                  <span>Assignment: <strong className="text-slate-700">{form.assignmentType}</strong></span>
                                  <span>Mapped Fields: <strong className="text-slate-700">{form.fieldMappings?.length || 0}</strong></span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleOpenConfigure(form)}
                                className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition flex items-center gap-1.5 self-start md:self-auto"
                              >
                                <Settings2 size={14} /> Configure & Activate
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

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
                                onClick={() => handleRetryImport(log.id)}
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

        {/* Configuration Drawer / Modal */}
        {isConfigModalOpen && selectedForm && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Configure Meta Lead Form</h3>
                  <p className="text-xs text-slate-500">{selectedForm.formName}</p>
                </div>
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Form Enable Switch */}
                <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Enable Automatic Lead Import</span>
                    <span className="text-[11px] text-slate-500">Automatically import leads from this Meta Lead Form into Seeakk</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formEnabled}
                    onChange={(e) => setFormEnabled(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* Section 1: Lead Setup */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">1. Lead Setup & Stage</h4>
                  
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
                </div>

                {/* Section 2: Lead Assignment */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">2. Lead Assignment</h4>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {(['UNASSIGNED', 'SPECIFIC_USER', 'ROUND_ROBIN'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAssignmentType(type)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition ${
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
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Assign To User</label>
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
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Round Robin Sales Reps</label>
                      <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1">
                        {users.map((u) => (
                          <label key={u.id} className="flex items-center gap-2 text-xs text-slate-700 font-medium p-1 hover:bg-slate-50 rounded">
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
                    </div>
                  )}
                </div>

                {/* Section 3: Field Mapping */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">3. Field Mapping</h4>

                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {fieldMappings.map((mapping, idx) => (
                      <div key={mapping.metaFieldName} className="p-3 flex items-center justify-between gap-4 bg-white">
                        <div className="w-1/2">
                          <span className="text-xs font-semibold text-slate-900 block">{mapping.metaFieldLabel}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{mapping.metaFieldName}</span>
                        </div>

                        <div className="w-1/2">
                          <select
                            value={mapping.seeakkFieldKey}
                            onChange={(e) => {
                              const newKey = e.target.value;
                              setFieldMappings(
                                fieldMappings.map((m, i) => (i === idx ? { ...m, seeakkFieldKey: newKey } : m))
                              );
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-900"
                          >
                            <option value="name">Lead Name</option>
                            <option value="phone">mobile</option>
                            <option value="email">Email</option>
                            <option value="totalAmount">Total Amount</option>
                            <option value="address">Address</option>
                            <option value="remarks">Remarks</option>
                            <option value="ignore">Do Not Import</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save & Activate Configuration'}
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
