import React, { useEffect, useState } from 'react';
import {
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Settings2,
  RefreshCw,
  Zap,
  Mic,
  Shield,
  Copy,
  ExternalLink,
  Users,
  UserCheck,
  Info,
} from 'lucide-react';
import {
  getTelephonySettings,
  updateTelephonySettings,
  getTelephonyProviders,
  saveTelephonyProviderConfig,
  testTelephonyProviderConnection,
  getTelephonyUserMappings,
  saveTelephonyUserMapping,
  TelephonySettingsData,
  TelephonyProviderConfigItem,
  TelephonyUserMappingItem,
} from '../../services/telephony.api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const TelephonySettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<TelephonySettingsData | null>(null);
  const [providers, setProviders] = useState<TelephonyProviderConfigItem[]>([]);
  const [userMappings, setUserMappings] = useState<TelephonyUserMappingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [savingMappingId, setSavingMappingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Selected provider modal state
  const [selectedProvider, setSelectedProvider] = useState<TelephonyProviderConfigItem | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Modal Input State (Configurable Placeholder Fields for Knowlarity / Providers)
  const [enabled, setEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [accountId, setAccountId] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [virtualNumber, setVirtualNumber] = useState('');
  const [callerId, setCallerId] = useState('');

  // Editable mappings state
  const [editingMappings, setEditingMappings] = useState<Record<string, { agentId: string; phone: string; enabled: boolean }>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, providersRes, mappingsRes] = await Promise.all([
        getTelephonySettings(),
        getTelephonyProviders(),
        getTelephonyUserMappings('KNOWLARITY'),
      ]);
      setSettings(settingsRes);
      setProviders(providersRes);
      setUserMappings(mappingsRes);

      const mappingState: Record<string, { agentId: string; phone: string; enabled: boolean }> = {};
      mappingsRes.forEach((m) => {
        mappingState[m.userId] = {
          agentId: m.providerAgentId || '',
          phone: m.providerPhoneNumber || m.userPhone || '',
          enabled: m.enabled,
        };
      });
      setEditingMappings(mappingState);
    } catch (err: any) {
      console.error('Failed to load telephony settings data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    try {
      const updated = await updateTelephonySettings(settings);
      setSettings(updated);
      setMessage({ text: 'Telephony settings updated successfully.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to update settings.', type: 'error' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenConfigure = (provider: TelephonyProviderConfigItem) => {
    setSelectedProvider(provider);
    setEnabled(provider.enabled);
    setApiKey('');
    setApiSecret('');
    setAccountId('');
    setAuthToken('');
    setVirtualNumber(provider.virtualNumber || '');
    setCallerId(provider.callerId || '');
    setIsConfigModalOpen(true);
  };

  const handleSaveProviderConfig = async () => {
    if (!selectedProvider) return;
    setSavingConfig(true);
    try {
      await saveTelephonyProviderConfig(selectedProvider.providerKey, {
        enabled,
        apiKey: apiKey || undefined,
        apiSecret: apiSecret || undefined,
        accountId: accountId || undefined,
        authToken: authToken || undefined,
        virtualNumber: virtualNumber || undefined,
        callerId: callerId || undefined,
      });

      setMessage({ text: `Configuration saved for ${selectedProvider.providerName}. Credentials encrypted with AES-256.`, type: 'success' });
      setIsConfigModalOpen(false);
      await loadData();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to save provider config.', type: 'error' });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTestConnection = async (providerKey: string) => {
    setTestingKey(providerKey);
    try {
      const res = await testTelephonyProviderConnection(providerKey);
      if (res.success) {
        setMessage({ text: `Connection test passed: ${res.message}`, type: 'success' });
      } else {
        const msgType = (res as any).code === 'PROVIDER_CONFIGURATION_INCOMPLETE' ? 'warning' : 'error';
        setMessage({ text: res.message, type: msgType });
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Connection test failed.', type: 'error' });
    } finally {
      setTestingKey(null);
    }
  };

  const handleSaveUserMappingItem = async (userId: string) => {
    const item = editingMappings[userId];
    if (!item) return;
    setSavingMappingId(userId);
    try {
      await saveTelephonyUserMapping({
        providerKey: 'KNOWLARITY',
        userId,
        providerAgentId: item.agentId,
        providerPhoneNumber: item.phone,
        enabled: item.enabled,
      });
      setMessage({ text: 'User agent mapping updated successfully.', type: 'success' });
      await loadData();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to update user mapping.', type: 'error' });
    } finally {
      setSavingMappingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <PhoneCall size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Settings → Telephony</h1>
                <p className="text-xs text-slate-500">
                  Connect your preferred cloud telephony provider (BYOT Customer Account Model) for business calling and call recording.
                </p>
              </div>
            </div>
          </div>

          {settings && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Active Provider:</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                {settings.activeProvider}
              </span>
            </div>
          )}
        </div>

        {/* BYOT Notice Banner */}
        <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
          <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">BYOT (Customer-Owned Account Model)</span>
            <p className="leading-relaxed">
              Your organization maintains its own Knowlarity or telephony provider account. Enter your provider API credentials below to connect your account. All credentials are encrypted using AES-256 within your isolated workspace.
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : message.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : message.type === 'warning' ? (
              <AlertCircle size={16} className="text-amber-600" />
            ) : (
              <AlertCircle size={16} />
            )}
            {message.text}
          </div>
        )}

        {/* Grid Section 1: Active Provider Selection & Recording Rules */}
        {settings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Telephony Provider */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">Active Telephony Provider</h2>
                </div>
                <span className="text-[11px] text-slate-400">Routes all outbound calls</span>
              </div>

              <div className="space-y-3">
                {providers.map((p) => (
                  <label
                    key={p.providerKey}
                    onClick={() => setSettings({ ...settings, activeProvider: p.providerKey })}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      settings.activeProvider === p.providerKey
                        ? 'bg-emerald-50/50 border-emerald-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="activeProvider"
                        checked={settings.activeProvider === p.providerKey}
                        onChange={() => setSettings({ ...settings, activeProvider: p.providerKey })}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{p.providerName}</span>
                        <span className="text-[11px] text-slate-500">
                          {p.providerKey === 'DEVICE_DIALER'
                            ? 'Native device dialer / Tel: links'
                            : p.providerKey === 'KNOWLARITY'
                            ? 'Knowlarity SuperReceptionist & Click-to-Call'
                            : `${p.providerName} Cloud Telephony`}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {p.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {savingSettings ? 'Saving...' : 'Set Active Telephony Provider'}
              </button>
            </div>

            {/* Call Recording Preferences */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Mic size={18} className="text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">Call & Recording Add-on Settings</h2>
                </div>
                <span className="text-[11px] text-slate-400">Compliance & Storage</span>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900 block">Enable Automatic Call Recording</span>
                    <span className="text-[11px] text-slate-500">Records connected calls via provider API</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.recordingEnabled}
                    onChange={(e) => setSettings({ ...settings, recordingEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Recording Retention Period</label>
                  <select
                    value={settings.retentionMonths}
                    onChange={(e) => setSettings({ ...settings, retentionMonths: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none"
                  >
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months</option>
                    <option value={24}>24 Months</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {savingSettings ? 'Saving...' : 'Save Recording Preferences'}
              </button>
            </div>
          </div>
        )}

        {/* Provider Credentials & Integration Setup */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Provider Credentials & Integration Setup</h2>
            </div>
            <span className="text-[11px] text-slate-400">Encrypted AES-256 Storage</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p) => (
              <div key={p.providerKey} className="border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{p.providerName}</span>
                    <span className="text-[11px] text-slate-400">Key: {p.providerKey}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      p.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {p.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
                  <div className="flex justify-between">
                    <span>API Key Configured:</span>
                    <strong className="text-slate-900">{p.hasApiKey ? '✓ Yes' : '✕ No'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Virtual Number:</span>
                    <strong className="text-slate-900">{p.virtualNumber || 'Not set'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {p.providerKey !== 'DEVICE_DIALER' && (
                    <button
                      onClick={() => handleOpenConfigure(p)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <Settings2 size={14} /> Configure Credentials
                    </button>
                  )}
                  <button
                    onClick={() => handleTestConnection(p.providerKey)}
                    disabled={testingKey === p.providerKey}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={testingKey === p.providerKey ? 'animate-spin' : ''} />
                    {testingKey === p.providerKey ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User / Agent Mapping Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">User / Agent Mapping (Knowlarity)</h2>
            </div>
            <span className="text-[11px] text-slate-400">Map SEEAKK Users to Knowlarity Agents</span>
          </div>

          <p className="text-xs text-slate-500">
            Map each SEEAKK user to their corresponding Knowlarity Agent ID / Extension or agent phone number for outbound calling.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3">SEEAKK User</th>
                  <th className="p-3">Knowlarity Agent ID / Extension</th>
                  <th className="p-3">Agent Phone Number</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userMappings.map((u) => {
                  const state = editingMappings[u.userId] || { agentId: '', phone: '', enabled: true };
                  return (
                    <tr key={u.userId} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{u.userName}</span>
                        <span className="text-[11px] text-slate-400">{u.userEmail}</span>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="e.g. AGENT-101"
                          value={state.agentId}
                          onChange={(e) =>
                            setEditingMappings({
                              ...editingMappings,
                              [u.userId]: { ...state, agentId: e.target.value },
                            })
                          }
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 font-mono"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="+91XXXXXXXXXX"
                          value={state.phone}
                          onChange={(e) =>
                            setEditingMappings({
                              ...editingMappings,
                              [u.userId]: { ...state, phone: e.target.value },
                            })
                          }
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 font-mono"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleSaveUserMappingItem(u.userId)}
                          disabled={savingMappingId === u.userId}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg transition disabled:opacity-50"
                        >
                          {savingMappingId === u.userId ? 'Saving...' : 'Save Mapping'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Configure Provider Credentials Modal */}
        {isConfigModalOpen && selectedProvider && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Configure Provider Credentials</h3>
                  <p className="text-xs text-slate-500">{selectedProvider.providerName}</p>
                </div>
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <span className="text-xs font-bold text-slate-900">Enable Provider Integration</span>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                </div>

                {selectedProvider.providerKey === 'KNOWLARITY' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Knowlarity Account / Customer ID</label>
                      <input
                        type="text"
                        placeholder="KNOWLARITY_PLACEHOLDER_ACCOUNT_ID"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">API Key / Authorization Key</label>
                      <input
                        type="password"
                        placeholder="KNOWLARITY_PLACEHOLDER_API_KEY"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">API Secret / Auth Token</label>
                      <input
                        type="password"
                        placeholder="KNOWLARITY_PLACEHOLDER_API_SECRET"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Knowlarity Virtual Number</label>
                      <input
                        type="text"
                        placeholder="KNOWLARITY_PLACEHOLDER_VIRTUAL_NUMBER"
                        value={virtualNumber}
                        onChange={(e) => setVirtualNumber(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Default Caller ID / Agent Number</label>
                      <input
                        type="text"
                        placeholder="+91XXXXXXXXXX"
                        value={callerId}
                        onChange={(e) => setCallerId(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                  </>
                )}

                {selectedProvider.providerKey !== 'KNOWLARITY' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">API Key</label>
                      <input
                        type="password"
                        placeholder="API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Virtual Number</label>
                      <input
                        type="text"
                        placeholder="+1XXXXXXXXXX"
                        value={virtualNumber}
                        onChange={(e) => setVirtualNumber(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProviderConfig}
                  disabled={savingConfig}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {savingConfig ? 'Saving Encrypted...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TelephonySettingsPage;
