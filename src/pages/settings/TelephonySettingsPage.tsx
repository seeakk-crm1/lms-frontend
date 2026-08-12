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
} from 'lucide-react';
import {
  getTelephonySettings,
  updateTelephonySettings,
  getTelephonyProviders,
  saveTelephonyProviderConfig,
  testTelephonyProviderConnection,
  TelephonySettingsData,
  TelephonyProviderConfigItem,
} from '../../services/telephony.api';

const TelephonySettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<TelephonySettingsData | null>(null);
  const [providers, setProviders] = useState<TelephonyProviderConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Selected provider modal state
  const [selectedProvider, setSelectedProvider] = useState<TelephonyProviderConfigItem | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Modal Input State
  const [enabled, setEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [accountId, setAccountId] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [virtualNumber, setVirtualNumber] = useState('');
  const [callerId, setCallerId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, providersRes] = await Promise.all([
        getTelephonySettings(),
        getTelephonyProviders(),
      ]);
      setSettings(settingsRes);
      setProviders(providersRes);
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

      setMessage({ text: `Configuration saved for ${selectedProvider.providerName}.`, type: 'success' });
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
        setMessage({ text: `Connection test failed: ${res.message}`, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Connection test failed.', type: 'error' });
    } finally {
      setTestingKey(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
                Configure provider-agnostic telephony routing, API credentials, and call recording rules.
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
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{p.providerName}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>Outbound: {p.capabilities.outboundCalling ? '✓ Yes' : '✕ No'}</span>
                        <span>•</span>
                        <span>Recording: {p.capabilities.callRecording ? '✓ Yes' : '✕ No'}</span>
                      </div>
                    </div>
                  </div>

                  {settings.activeProvider === p.providerKey && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  )}
                </label>
              ))}
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Active Provider'}
            </button>
          </div>

          {/* Call Recording Settings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mic size={18} className="text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Call Recording Settings</h2>
              </div>
              <span className="text-[11px] text-slate-400">Compliance & Security</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Enable Call Recording</span>
                  <span className="text-[11px] text-slate-500">Record calls using active provider capabilities</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.recordingEnabled}
                  onChange={(e) => setSettings({ ...settings, recordingEnabled: e.target.checked })}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2.5 bg-white border border-slate-200 rounded-xl">
                  <input
                    type="checkbox"
                    checked={settings.recordOutbound}
                    onChange={(e) => setSettings({ ...settings, recordOutbound: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  Record Outbound
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2.5 bg-white border border-slate-200 rounded-xl">
                  <input
                    type="checkbox"
                    checked={settings.recordInbound}
                    onChange={(e) => setSettings({ ...settings, recordInbound: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  Record Inbound
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Recording Storage</label>
                  <select
                    value={settings.recordingStorage}
                    onChange={(e) => setSettings({ ...settings, recordingStorage: e.target.value as any })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white font-medium text-slate-900"
                  >
                    <option value="PROVIDER_STORAGE">Provider Storage</option>
                    <option value="SEEAKK_STORAGE">Seeakk Secure Storage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Retention Period</label>
                  <select
                    value={settings.retentionMonths}
                    onChange={(e) => setSettings({ ...settings, retentionMonths: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white font-medium text-slate-900"
                  >
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months</option>
                    <option value={24}>24 Months</option>
                  </select>
                </div>
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

      {/* Provider Credentials & API Configurations */}
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">API Key</label>
                    <input
                      type="password"
                      placeholder="Enter Knowlarity API Key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Virtual Number</label>
                    <input
                      type="text"
                      placeholder="+91XXXXXXXXXX"
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

              {selectedProvider.providerKey === 'PLIVO' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Auth ID / Account ID</label>
                    <input
                      type="text"
                      placeholder="Enter Plivo Auth ID..."
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Auth Token</label>
                    <input
                      type="password"
                      placeholder="Enter Plivo Auth Token..."
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Virtual / Outbound Number</label>
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

              {selectedProvider.providerKey === 'EXOTEL' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account SID</label>
                    <input
                      type="text"
                      placeholder="Enter Exotel Account SID..."
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">API Key</label>
                    <input
                      type="text"
                      placeholder="Enter Exotel API Key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">API Secret</label>
                    <input
                      type="password"
                      placeholder="Enter Exotel API Secret..."
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ExoPhone / Virtual Number</label>
                    <input
                      type="text"
                      placeholder="080XXXXXXXX"
                      value={virtualNumber}
                      onChange={(e) => setVirtualNumber(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                </>
              )}

              {/* Webhook Endpoint Info */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-slate-700 block">Webhook Ingestion Endpoint</span>
                <code className="text-[10px] bg-white p-1.5 rounded border text-slate-800 font-mono block truncate">
                  {`${window.location.origin}/api/telephony/webhook/${selectedProvider.providerKey}`}
                </code>
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
                onClick={handleSaveProviderConfig}
                disabled={savingConfig}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {savingConfig ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelephonySettingsPage;
