import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  UserCheck,
  Calendar,
  FileText,
  History,
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Search,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { toast } from 'react-hot-toast';
import { useLeadMetaQuery } from '../../hooks/useLeads';
import { useActiveExtensionReasonsQuery } from '../../modules/followup-extension-reasons/hooks/useFollowUpExtensionReasons';
import {
  getFollowUpSettings,
  updateFollowUpSettings,
  getTemporaryAccessList,
  grantTemporaryAccess,
  revokeTemporaryAccess,
  bulkExtendFollowUps,
  FollowUpSettings as SettingsType,
  TemporaryAccessEntry,
} from '../../services/followupSettings.api';
import { getFollowUpHistory } from '../../services/followupService';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import {
  canGrantBulkExtensionAccess,
  canManageFollowUpSettings,
  canUseBulkFollowUpExtension,
} from '../../utils/permission.util';
import {
  type BulkExtendFollowUpRow,
  hasActiveBulkFollowUpFilters,
  mapFollowUpToBulkExtendRow,
  matchesBulkFollowUpFilter,
} from '../../utils/bulkFollowUpDisplay.util';
import type { FollowUp } from '../../types/followup.types';

const FollowUpSettingsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const permissions = user?.permissions || [];

  const access = useMemo(
    () => ({
      canManageSettings: canManageFollowUpSettings(permissions),
      canGrantTemp: canGrantBulkExtensionAccess(permissions),
      canBulkExtend: canUseBulkFollowUpExtension(permissions),
      canViewReports:
        permissions.includes('SUPERADMIN') ||
        permissions.includes('view_followup_capacity') ||
        permissions.includes('manage_followup_settings'),
      canViewAudit: canManageFollowUpSettings(permissions),
    }),
    [permissions],
  );

  const [activeTab, setActiveTab] = useState<'settings' | 'temp-access' | 'bulk-extend' | 'reports' | 'audit'>('settings');

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState<Array<{ id: string; name: string | null; email: string }>>([]);

  // 1. Settings Tab State
  const [settings, setSettings] = useState<SettingsType | null>(null);

  // 2. Temporary Access Tab State
  const [tempAccesses, setTempAccesses] = useState<TemporaryAccessEntry[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [grantDuration, setGrantDuration] = useState<'1 Day' | '3 Days' | '7 Days' | 'Custom'>('1 Day');
  const [customExpiry, setCustomExpiry] = useState('');

  // 3. Bulk Extend Tab State
  const [pendingFollowUps, setPendingFollowUps] = useState<BulkExtendFollowUpRow[]>([]);
  const [selectedFollowUps, setSelectedFollowUps] = useState<string[]>([]);
  const [bulkFollowUpSearch, setBulkFollowUpSearch] = useState('');
  const [bulkAssigneeFilter, setBulkAssigneeFilter] = useState('');
  const [bulkScheduledFrom, setBulkScheduledFrom] = useState('');
  const [bulkScheduledTo, setBulkScheduledTo] = useState('');
  const [bulkTargetDate, setBulkTargetDate] = useState('');
  const [bulkReasonId, setBulkReasonId] = useState('');
  const [bulkDescription, setBulkDescription] = useState('');
  const [bulkAutoDistribute, setBulkAutoDistribute] = useState(false);

  // 4. Reports Tab State
  const [reportType, setReportType] = useState<'bulk-extensions' | 'capacity' | 'utilization' | 'user-limits'>('bulk-extensions');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportUserId, setReportUserId] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);

  // 5. Audit Logs Tab State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);

  const refreshSessionPermissions = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data?.user) {
        updateUser(response.data.user);
      }
    } catch {
      // Ignore background refresh failures.
    }
  }, [updateUser]);

  useEffect(() => {
    void refreshSessionPermissions();
    const intervalId = window.setInterval(() => {
      void refreshSessionPermissions();
    }, 45_000);
    return () => window.clearInterval(intervalId);
  }, [refreshSessionPermissions]);

  useEffect(() => {
    if (access.canBulkExtend && !access.canManageSettings && activeTab === 'settings') {
      setActiveTab('bulk-extend');
    }
    if (!access.canBulkExtend && activeTab === 'bulk-extend') {
      setActiveTab(access.canManageSettings ? 'settings' : access.canGrantTemp ? 'temp-access' : 'settings');
    }
  }, [access.canBulkExtend, access.canManageSettings, access.canGrantTemp, activeTab]);

  // Queries
  const leadMeta = useLeadMetaQuery();
  const extensionReasons = useActiveExtensionReasonsQuery();

  // Load Users List from lead meta query
  useEffect(() => {
    if (leadMeta.data?.users) {
      setUsersList(
        leadMeta.data.users.map((u: any) => ({
          id: u.id,
          name: u.label.split(' (')[0],
          email: u.label.includes('(') ? u.label.split('(')[1].replace(')', '') : u.label,
        })),
      );
    }
  }, [leadMeta.data]);

  // Load initial settings
  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await getFollowUpSettings();
      if (res.success) {
        setSettings(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load follow-up settings.');
    } finally {
      setLoading(false);
    }
  };

  // Load temporary access list
  const loadTempAccesses = async () => {
    try {
      setLoading(true);
      const res = await getTemporaryAccessList();
      if (res.success) {
        setTempAccesses(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load temporary access list.');
    } finally {
      setLoading(false);
    }
  };

  // Load pending followups for bulk extend (optional scheduled date range via history API)
  const loadPendingFollowUps = async () => {
    try {
      setLoading(true);
      const res = await getFollowUpHistory({
        userId: bulkAssigneeFilter || 'ALL',
        status: 'PENDING',
        page: 1,
        limit: 500,
        ...(bulkScheduledFrom ? { startDate: bulkScheduledFrom } : {}),
        ...(bulkScheduledTo ? { endDate: bulkScheduledTo } : {}),
      });
      const rows = (res.data || []).map((item: FollowUp) => mapFollowUpToBulkExtendRow(item));
      setPendingFollowUps(rows);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load pending follow-ups.');
    } finally {
      setLoading(false);
    }
  };

  // Load Audit Logs
  const loadAuditLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/audit/logs', {
        params: {
          page,
          limit: 10,
        },
      });
      if (res.data?.success) {
        // Filter by settings and bulk extend action keys
        const relevantActions = [
          'SETTINGS_UPDATED',
          'TEMPORARY_ACCESS_GRANTED',
          'TEMPORARY_ACCESS_REVOKED',
          'BULK_FOLLOWUP_EXTENDED',
        ];
        const allLogs = res.data.data.logs || [];
        const filtered = allLogs.filter((log: any) => relevantActions.includes(log.action));
        setAuditLogs(filtered);
        setAuditTotalPages(res.data.data.pagination?.totalPages || 1);
        setAuditPage(page);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch report data
  const loadReport = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      if (reportType === 'bulk-extensions') {
        endpoint = '/followups/reports/bulk-extensions';
      } else if (reportType === 'capacity') {
        endpoint = '/followups/reports/capacity';
      } else if (reportType === 'utilization') {
        endpoint = '/followups/reports/utilization';
      } else if (reportType === 'user-limits') {
        endpoint = '/followups/reports/user-limits';
      }

      const res = await api.get(endpoint, {
        params: {
          startDate: reportStartDate || undefined,
          endDate: reportEndDate || undefined,
          userId: reportUserId || undefined,
        },
      });

      if (res.data?.success) {
        setReportData(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial fetch on tab change
  useEffect(() => {
    if (activeTab === 'settings') {
      loadSettings();
    } else if (activeTab === 'temp-access') {
      loadTempAccesses();
    } else if (activeTab === 'bulk-extend') {
      if (!settings) {
        void loadSettings();
      }
    } else if (activeTab === 'reports') {
      loadReport();
    } else if (activeTab === 'audit') {
      loadAuditLogs(1);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'bulk-extend') {
      return;
    }
    const timer = window.setTimeout(() => {
      void loadPendingFollowUps();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [activeTab, bulkScheduledFrom, bulkScheduledTo, bulkAssigneeFilter]);

  // Handle settings update submit
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setLoading(true);
      const res = await updateFollowUpSettings({
        dailyLimitEnabled: settings.dailyLimitEnabled,
        dailyLimitCount: Number(settings.dailyLimitCount),
        isActive: settings.isActive,
        capacityValidationEnabled: settings.capacityValidationEnabled,
        bulkExtensionEnabled: settings.bulkExtensionEnabled,
        autoDistributionEnabled: settings.autoDistributionEnabled,
        defaultBulkExtensionDuration: settings.defaultBulkExtensionDuration,
        maxBulkExtensionCount: Number(settings.maxBulkExtensionCount),
      });
      if (res.success) {
        toast.success('Follow-up settings updated successfully.');
        setSettings(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  // Handle temporary access grant submit
  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please select a user.');
      return;
    }
    if (grantDuration === 'Custom' && !customExpiry) {
      toast.error('Please choose custom expiry date.');
      return;
    }

    try {
      setLoading(true);
      const res = await grantTemporaryAccess({
        userId: selectedUserId,
        duration: grantDuration,
        customExpiryDate: grantDuration === 'Custom' ? customExpiry : undefined,
      });
      if (res.success) {
        toast.success('Temporary bulk extension access granted successfully.');
        loadTempAccesses();
        setSelectedUserId('');
        setCustomExpiry('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to grant access.');
    } finally {
      setLoading(false);
    }
  };

  // Handle revoke access
  const handleRevokeAccess = async (id: string) => {
    try {
      setLoading(true);
      const res = await revokeTemporaryAccess(id);
      if (res.success) {
        toast.success('Temporary access revoked successfully.');
        loadTempAccesses();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to revoke access.');
    } finally {
      setLoading(false);
    }
  };

  // Select/Deselect follow-ups
  const toggleFollowUpSelect = (id: string) => {
    setSelectedFollowUps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const bulkFollowUpFilterCriteria = useMemo(
    () => ({
      search: bulkFollowUpSearch,
      assigneeUserId: bulkAssigneeFilter,
      scheduledFrom: bulkScheduledFrom,
      scheduledTo: bulkScheduledTo,
    }),
    [bulkFollowUpSearch, bulkAssigneeFilter, bulkScheduledFrom, bulkScheduledTo],
  );

  const filteredPendingFollowUps = useMemo(
    () => pendingFollowUps.filter((item) => matchesBulkFollowUpFilter(item, bulkFollowUpFilterCriteria)),
    [pendingFollowUps, bulkFollowUpFilterCriteria],
  );

  const pendingOnlyList = useMemo(() => 
    filteredPendingFollowUps.filter(item => new Date(item.scheduledAt).getTime() > Date.now()),
  [filteredPendingFollowUps]);

  const overdueList = useMemo(() => 
    filteredPendingFollowUps.filter(item => new Date(item.scheduledAt).getTime() <= Date.now()),
  [filteredPendingFollowUps]);

  const clearBulkFollowUpFilters = () => {
    setBulkFollowUpSearch('');
    setBulkAssigneeFilter('');
    setBulkScheduledFrom('');
    setBulkScheduledTo('');
  };

  // Load Assignee Users for Bulk Extend from hierarchy
  const [bulkUsers, setBulkUsers] = useState<Array<{ id: string; name: string }>>([]);
  useEffect(() => {
    import('../../services/followupService').then((module) => {
      module.getFollowUpUsers().then((users) => {
        if (import.meta.env.DEV) {
          console.info('[BulkReschedule] assignee options loaded', {
            count: users.length,
            userIds: users.map((u) => u.id),
          });
        }
        setBulkUsers(users.map((u) => ({ id: u.id, name: u.label })));
      }).catch((err) => {
        console.error('Failed to load bulk assignees', err);
      });
    });
  }, []);

  const bulkAssigneeOptions = useMemo(() => {
    return bulkUsers;
  }, [bulkUsers]);

  const allFilteredSelected =
    filteredPendingFollowUps.length > 0 &&
    filteredPendingFollowUps.every((row) => selectedFollowUps.includes(row.id));

  const selectAllFollowUps = () => {
    const visibleIds = filteredPendingFollowUps.map((row) => row.id);
    if (allFilteredSelected) {
      setSelectedFollowUps((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelectedFollowUps((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  // Handle Bulk Reschedule execution
  const handleBulkExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFollowUps.length === 0) {
      toast.error('Please select at least one follow-up to reschedule.');
      return;
    }
    if (!bulkTargetDate) {
      toast.error('Please select a new follow-up date.');
      return;
    }
    if (!bulkReasonId && !bulkDescription.trim()) {
      toast.error('Either a Predefined Reason or a Custom Description is required.');
      return;
    }

    try {
      setLoading(true);
      const res = await bulkExtendFollowUps({
        followUpIds: selectedFollowUps,
        newFollowupDate: bulkTargetDate,
        extensionReasonId: bulkReasonId || null,
        recentDescription: bulkDescription.trim() || null,
        autoDistribute: bulkAutoDistribute,
      });

      if (res.success) {
        toast.success(res.message);
        setSelectedFollowUps([]);
        setBulkTargetDate('');
        setBulkReasonId('');
        setBulkDescription('');
        setBulkAutoDistribute(false);
        loadPendingFollowUps();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reschedule follow-ups.');
    } finally {
      setLoading(false);
    }
  };

  // Export report to CSV/Excel
  const handleExportExcel = () => {
    const params = new URLSearchParams({
      type: reportType,
      startDate: reportStartDate,
      endDate: reportEndDate,
      userId: reportUserId,
    });
    // Triggers download from backend
    window.open(`${api.defaults.baseURL || ''}/followups/reports/export?${params.toString()}`, '_blank');
  };

  // Print PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-5 md:px-6 lg:px-8 print:p-0 print:bg-white print:text-black">
        <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 print:max-w-full">
          {/* Header Card */}
          <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,250,251,0.96))] p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] print:hidden">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
                  <Settings size={14} />
                  Follow-Up Settings
                </p>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 md:text-5xl">Capacity &amp; Extensions</h1>
                <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-gray-500">
                  Centrally control daily follow-up limits, manage temporary bulk extension access, execute bulk reassignments, and analyze capacities with reports.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'settings') loadSettings();
                    if (activeTab === 'temp-access') loadTempAccesses();
                    if (activeTab === 'bulk-extend') loadPendingFollowUps();
                    if (activeTab === 'reports') loadReport();
                    if (activeTab === 'audit') loadAuditLogs(auditPage);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
                >
                  <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </section>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 bg-white/70 rounded-2xl p-1.5 shadow-sm print:hidden">
            {access.canManageSettings ? (
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'settings' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'
                }`}
              >
                <Settings size={16} />
                Settings
              </button>
            ) : null}
            {access.canGrantTemp ? (
              <button
                onClick={() => setActiveTab('temp-access')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'temp-access' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'
                }`}
              >
                <UserCheck size={16} />
                Temporary Access
              </button>
            ) : null}
            {access.canBulkExtend ? (
              <button
                onClick={() => setActiveTab('bulk-extend')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'bulk-extend' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'
                }`}
              >
                <Calendar size={16} />
                Bulk Reschedule
              </button>
            ) : null}
            {access.canViewReports ? (
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'reports' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'
                }`}
              >
                <FileText size={16} />
                Capacity Reports
              </button>
            ) : null}
            {access.canViewAudit ? (
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'audit' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'
                }`}
              >
                <History size={16} />
                Audit Logs
              </button>
            ) : null}
          </div>

          {/* TAB CONTENTS */}
          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === 'settings' && settings && access.canManageSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-white/95 border border-white/70 p-6 rounded-[28px] shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur print:hidden"
                >
                  <h2 className="text-2xl font-black text-gray-900 mb-6">Global Policy Configuration</h2>
                  <form onSubmit={handleUpdateSettings} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Daily Follow-Up Limit</h3>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-gray-700">Enable Daily Limit</label>
                          <input
                            type="checkbox"
                            checked={settings.dailyLimitEnabled}
                            onChange={(e) => setSettings({ ...settings, dailyLimitEnabled: e.target.checked })}
                            className="w-5 h-5 accent-emerald-500 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Daily Limit Count</label>
                          <input
                            type="number"
                            min="1"
                            disabled={!settings.dailyLimitEnabled}
                            value={settings.dailyLimitCount}
                            onChange={(e) => setSettings({ ...settings, dailyLimitCount: Number(e.target.value) })}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold disabled:bg-gray-100 disabled:opacity-50"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <label className="text-sm font-bold text-gray-700">Settings Status (Active/Inactive)</label>
                          <input
                            type="checkbox"
                            checked={settings.isActive}
                            onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                            className="w-5 h-5 accent-emerald-500 rounded"
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Validation &amp; Distribution</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-bold text-gray-700 block">Enforce Capacity Validation</label>
                            <span className="text-xs text-gray-400 font-semibold block">Block follow-ups when daily limit is reached</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.capacityValidationEnabled}
                            onChange={(e) => setSettings({ ...settings, capacityValidationEnabled: e.target.checked })}
                            className="w-5 h-5 accent-emerald-500 rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-bold text-gray-700 block">Enable Auto Distribution</label>
                            <span className="text-xs text-gray-400 font-semibold block">Automatically place overflow on next available days</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.autoDistributionEnabled}
                            onChange={(e) => setSettings({ ...settings, autoDistributionEnabled: e.target.checked })}
                            className="w-5 h-5 accent-emerald-500 rounded"
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Bulk Extension Rules</h3>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-gray-700">Enable Bulk Extension</label>
                          <input
                            type="checkbox"
                            checked={settings.bulkExtensionEnabled}
                            onChange={(e) => setSettings({ ...settings, bulkExtensionEnabled: e.target.checked })}
                            className="w-5 h-5 accent-emerald-500 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Default Bulk Extension Duration</label>
                          <select
                            value={settings.defaultBulkExtensionDuration}
                            onChange={(e) => setSettings({ ...settings, defaultBulkExtensionDuration: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold"
                          >
                            <option value="1 Day">1 Day</option>
                            <option value="3 Days">3 Days</option>
                            <option value="7 Days">7 Days</option>
                            <option value="Custom">Custom</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Maximum Bulk Extension Count</label>
                          <input
                            type="number"
                            min="1"
                            value={settings.maxBulkExtensionCount}
                            onChange={(e) => setSettings({ ...settings, maxBulkExtensionCount: Number(e.target.value) })}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-md hover:bg-emerald-600 transition"
                      >
                        {loading ? 'Saving Settings...' : 'Save Settings Policy'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'temp-access' && access.canGrantTemp && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden"
                >
                  {/* Grant Access Form */}
                  <div className="bg-white/95 border border-white/70 p-6 rounded-[28px] shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur lg:col-span-1">
                    <h3 className="text-xl font-black text-gray-900 mb-6">Grant Bulk Extension</h3>
                    <form onSubmit={handleGrantAccess} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select User</label>
                        <select
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold"
                        >
                          <option value="">-- Choose User --</option>
                          {usersList.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name || user.email}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Access Duration</label>
                        <select
                          value={grantDuration}
                          onChange={(e) => setGrantDuration(e.target.value as any)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold"
                        >
                          <option value="1 Day">1 Day</option>
                          <option value="3 Days">3 Days</option>
                          <option value="7 Days">7 Days</option>
                          <option value="Custom">Custom Date</option>
                        </select>
                      </div>

                      {grantDuration === 'Custom' && (
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry Date &amp; Time</label>
                          <input
                            type="datetime-local"
                            value={customExpiry}
                            onChange={(e) => setCustomExpiry(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-black text-white shadow-md hover:bg-emerald-600 transition pt-3"
                      >
                        <Plus size={16} />
                        {loading ? 'Granting...' : 'Grant Access'}
                      </button>
                    </form>
                  </div>

                  {/* Access Entries List */}
                  <div className="bg-white/95 border border-white/70 p-6 rounded-[28px] shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur lg:col-span-2">
                    <h3 className="text-xl font-black text-gray-900 mb-6">Temporary Access Control List</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-xs font-black uppercase text-gray-400 tracking-wider">
                            <th className="py-3 px-4">User</th>
                            <th className="py-3 px-4">Granted By</th>
                            <th className="py-3 px-4">Permission Type</th>
                            <th className="py-3 px-4">Granted Date</th>
                            <th className="py-3 px-4">Expires At</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tempAccesses.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-sm font-semibold text-gray-400">
                                No active or past temporary access grants found.
                              </td>
                            </tr>
                          ) : (
                            tempAccesses.map((entry) => {
                              const isExpired = new Date(entry.expiresAt).getTime() < Date.now();
                              const isActiveEntry = entry.isActive && !isExpired;
                              return (
                                <tr key={entry.id} className="border-b border-gray-50 text-sm font-semibold text-gray-600 hover:bg-gray-50/50">
                                  <td className="py-3 px-4">
                                    <span className="font-bold text-gray-900 block">{entry.user.name || entry.user.email}</span>
                                    <span className="text-xs text-gray-400">{entry.user.email}</span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="block">{entry.grantedBy.name || entry.grantedBy.email}</span>
                                  </td>
                                  <td className="py-3 px-4 text-xs font-semibold text-gray-700">
                                    Bulk Follow-Up Extension
                                  </td>
                                  <td className="py-3 px-4 text-xs font-mono">
                                    {new Date(entry.createdAt).toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4 text-xs font-mono">
                                    {new Date(entry.expiresAt).toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                                        isActiveEntry
                                          ? 'bg-emerald-50 text-emerald-600'
                                          : 'bg-gray-100 text-gray-400'
                                      }`}
                                    >
                                      {isActiveEntry ? 'Active' : 'Expired'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    {isActiveEntry && (
                                      <button
                                        onClick={() => handleRevokeAccess(entry.id)}
                                        className="text-red-500 hover:text-red-600 font-bold text-xs"
                                        title="Revoke Permission"
                                      >
                                        Revoke
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bulk-extend' && access.canBulkExtend && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden"
                >
                  {settings && !settings.bulkExtensionEnabled ? (
                    <div className="lg:col-span-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                      Bulk extension is disabled in workspace settings. Contact an administrator to enable it.
                    </div>
                  ) : null}
                  {/* Select Follow-ups Panel */}
                  <div className="bg-white/95 border border-white/70 p-6 rounded-[28px] shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-black text-gray-900">Select Pending Follow-Ups</h3>
                      <button
                        type="button"
                        onClick={selectAllFollowUps}
                        disabled={filteredPendingFollowUps.length === 0}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        {allFilteredSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                        <div className="flex-1 space-y-1.5">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Search
                          </label>
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                              type="search"
                              value={bulkFollowUpSearch}
                              onChange={(e) => setBulkFollowUpSearch(e.target.value)}
                              placeholder="Lead name, contact, assignee, reason..."
                              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        <div className="w-full space-y-1.5 lg:w-52">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Assigned To
                          </label>
                          <select
                            value={bulkAssigneeFilter}
                            onChange={(e) => setBulkAssigneeFilter(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500"
                          >
                            <option value="">All assignees</option>
                            {bulkAssigneeOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="w-full space-y-1.5 sm:flex-1">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Scheduled From
                          </label>
                          <input
                            type="date"
                            value={bulkScheduledFrom}
                            onChange={(e) => setBulkScheduledFrom(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="w-full space-y-1.5 sm:flex-1">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Scheduled To
                          </label>
                          <input
                            type="date"
                            value={bulkScheduledTo}
                            onChange={(e) => setBulkScheduledTo(e.target.value)}
                            min={bulkScheduledFrom || undefined}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500"
                          />
                        </div>
                        {hasActiveBulkFollowUpFilters(bulkFollowUpFilterCriteria) ? (
                          <button
                            type="button"
                            onClick={clearBulkFollowUpFilters}
                            className="text-xs font-bold text-gray-500 hover:text-gray-800 sm:pb-2.5"
                          >
                                      <td className="py-2.5 px-4 text-center">
                                        <input
                                          type="checkbox"
                                          checked={selectedFollowUps.includes(item.id)}
                                          onChange={() => toggleFollowUpSelect(item.id)}
                                          className="w-4 h-4 accent-red-500 rounded"
                                        />
                                      </td>
                                      <td className="py-2.5 px-4">
                                        <span className="font-bold text-gray-900 block">{item.leadName}</span>
                                        <span className="text-xs text-gray-400">
                                          {item.leadPhone && item.leadEmail
                                            ? `${item.leadPhone} · ${item.leadEmail}`
                                            : item.leadPhone || item.leadEmail || 'No contact'}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-4 text-xs">{item.userName || 'Unassigned'}</td>
                                      <td className="py-2.5 px-4 text-xs font-mono">{new Date(item.scheduledAt).toLocaleString()}</td>
                                      <td className="py-2.5 px-4 text-xs font-bold text-red-500">{daysOverdue > 0 ? `${daysOverdue} days` : 'Today'}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-4 mt-2">
                          <h3 className="text-xl font-black text-gray-900">Pending Follow-Ups ({pendingOnlyList.length})</h3>
                          {pendingOnlyList.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-500 uppercase">Select All</span>
                              <input
                                type="checkbox"
                                checked={pendingOnlyList.every((row) => selectedFollowUps.includes(row.id))}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setSelectedFollowUps((prev) => {
                                    const newSelection = new Set(prev);
                                    pendingOnlyList.forEach((row) => {
                                      if (checked) newSelection.add(row.id);
                                      else newSelection.delete(row.id);
                                    });
                                    return Array.from(newSelection);
                                  });
                                }}
                                className="w-4 h-4 accent-emerald-500 rounded"
                              />
                            </div>
                          )}
                        </div>
                        <div className="overflow-y-auto max-h-[300px] border border-gray-100 rounded-2xl">
                          {pendingOnlyList.length === 0 ? (
                            <div className="p-8 text-center text-sm font-semibold text-gray-400">
                              No future pending follow-ups match your filters.
                            </div>
                          ) : (
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-gray-100 bg-emerald-50/50 text-xs font-black uppercase text-emerald-600 tracking-wider">
                                  <th className="py-2.5 px-4 w-12 text-center">Select</th>
                                  <th className="py-2.5 px-4">Lead & Contact</th>
                                  <th className="py-2.5 px-4">Assigned To</th>
                                  <th className="py-2.5 px-4">Scheduled Date</th>
                                  <th className="py-2.5 px-4">Reason</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pendingOnlyList.map((item) => (
                                  <tr
                                    key={item.id}
                                    className={`border-b border-gray-50 text-sm font-semibold text-gray-600 transition-colors ${
                                      selectedFollowUps.includes(item.id) ? 'bg-emerald-50/30' : 'hover:bg-gray-50/30'
                                    }`}
                                  >
                                    <td className="py-2.5 px-4 text-center">
                                      <input
                                        type="checkbox"
                                        checked={selectedFollowUps.includes(item.id)}
                                        onChange={() => toggleFollowUpSelect(item.id)}
                                        className="w-4 h-4 accent-emerald-500 rounded"
                                      />
                                    </td>
                                    <td className="py-2.5 px-4">
                                      <span className="font-bold text-gray-900 block">{item.leadName}</span>
                                      <span className="text-xs text-gray-400">
                                        {item.leadPhone && item.leadEmail
                                          ? `${item.leadPhone} · ${item.leadEmail}`
                                          : item.leadPhone || item.leadEmail || 'No contact'}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-xs">{item.userName || 'Unassigned'}</td>
                                    <td className="py-2.5 px-4 text-xs font-mono">{new Date(item.scheduledAt).toLocaleString()}</td>
                                    <td className="py-2.5 px-4 text-xs">{item.extensionReasonName || item.description || 'N/A'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>

                  {/* Reschedule parameters */}
                  <div className="bg-white/95 border border-white/70 p-6 rounded-[28px] shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur lg:col-span-1">
                    <h3 className="text-xl font-black text-gray-900 mb-6">Reschedule Parameters</h3>
                    <form onSubmit={handleBulkExtendSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Scheduled Date</label>
                        <input
                          type="date"
                          value={bulkTargetDate}
                          onChange={(e) => setBulkTargetDate(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Predefined Reason</label>
                        <select
                          value={bulkReasonId}
                          onChange={(e) => setBulkReasonId(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold"
                        >
                          <option value="">-- Predefined Reason (Optional) --</option>
                          {(extensionReasons.data || []).map((reason: any) => (
                            <option key={reason.id} value={reason.id}>
                              {reason.reasonName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Custom Description</label>
                        <textarea
                          placeholder="Enter details about this extension..."
                          value={bulkDescription}
                          onChange={(e) => setBulkDescription(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold min-h-[80px]"
                        ></textarea>
                      </div>

                      <div className="flex items-start gap-2.5 pt-2">
                        <input
                          type="checkbox"
                          id="bulkAutoDistribute"
                          checked={bulkAutoDistribute}
                          onChange={(e) => setBulkAutoDistribute(e.target.checked)}
                          className="w-5 h-5 accent-emerald-500 rounded mt-0.5"
                        />
                        <label htmlFor="bulkAutoDistribute" className="text-sm font-bold text-gray-700 leading-tight block select-none">
                          Automatically distribute remaining
                          <span className="text-xs text-gray-400 font-semibold block mt-0.5">
                            Place leftover follow-ups on subsequent available dates.
                          </span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || selectedFollowUps.length === 0}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-black text-white shadow-md hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Reschedule {selectedFollowUps.length} Follow-up(s)
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reports' && access.canViewReports && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* Query / Filters block */}
                  <div className="bg-white/95 border border-white/70 p-6 rounded-[28px] shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur flex flex-wrap gap-4 items-end justify-between print:hidden">
                    <div className="flex flex-wrap gap-4 flex-1">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Report Type</label>
                        <select
                          value={reportType}
                          onChange={(e) => setReportType(e.target.value as any)}
                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold"
                        >
                          <option value="bulk-extensions">Bulk Extension Report</option>
                          <option value="capacity">Follow-Up Capacity Report</option>
                          <option value="utilization">Daily Follow-Up Utilization</option>
                          <option value="user-limits">User Follow-Up Limit Report</option>
                        </select>
                      </div>

                      {reportType !== 'user-limits' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
                            <input
                              type="date"
                              value={reportStartDate}
                              onChange={(e) => setReportStartDate(e.target.value)}
                              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Date</label>
                            <input
                              type="date"
                              value={reportEndDate}
                              onChange={(e) => setReportEndDate(e.target.value)}
                              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold"
                            />
                          </div>
                        </>
                      )}

                      {(reportType === 'capacity' || reportType === 'utilization') && (
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">User</label>
                          <select
                            value={reportUserId}
                            onChange={(e) => setReportUserId(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold min-w-[150px]"
                          >
                            <option value="">-- All Users --</option>
                            {usersList.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name || user.email}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={loadReport}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-5 py-3 text-sm font-bold shadow-sm"
                      >
                        Apply Filters
                      </button>
                      <button
                        onClick={handleExportExcel}
                        className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-1.5"
                      >
                        <Download size={15} />
                        Export Excel
                      </button>
                      <button
                        onClick={handlePrintPDF}
                        className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-1.5"
                      >
                        <Printer size={15} />
                        Print PDF
                      </button>
                    </div>
                  </div>

                  {/* Print Layout Header */}
                  <div className="hidden print:block mb-8 border-b border-gray-300 pb-4">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">SEEAKK FOLLOW-UP CAPACITY REPORT</h1>
                    <p className="text-sm font-bold text-gray-500 mt-2">
                      Report Type: {reportType === 'bulk-extensions' ? 'Bulk Extensions History' : reportType === 'capacity' ? 'Date Capacity Status' : reportType === 'utilization' ? 'Daily Utilization Matrix' : 'User Limits Settings'}
                    </p>
                    <p className="text-xs text-gray-400 font-semibold mt-1">Generated At: {new Date().toLocaleString()}</p>
                  </div>

                  {/* Report Display Table */}
                  <div className="bg-white/95 border border-white/70 p-6 rounded-[28px] shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur print:border-none print:shadow-none print:p-0">
                    <div className="overflow-x-auto">
                      {reportData.length === 0 ? (
                        <div className="py-12 text-center text-sm font-semibold text-gray-400">
                          No report records match the selected query filters.
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse print:table">
                          <thead>
                            {reportType === 'bulk-extensions' ? (
                              <tr className="border-b border-gray-100 text-xs font-black uppercase text-gray-400 tracking-wider">
                                <th className="py-3 px-4">Date Logged</th>
                                <th className="py-3 px-4">Extended By</th>
                                <th className="py-3 px-4">Target Date</th>
                                <th className="py-3 px-4">Reason</th>
                                <th className="py-3 px-4">Count</th>
                                <th className="py-3 px-4">Auto-Distributed</th>
                              </tr>
                            ) : reportType === 'capacity' || reportType === 'utilization' ? (
                              <tr className="border-b border-gray-100 text-xs font-black uppercase text-gray-400 tracking-wider">
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">User</th>
                                <th className="py-3 px-4">Follow-ups Count</th>
                                <th className="py-3 px-4">Daily Limit</th>
                                <th className="py-3 px-4">Remaining Capacity</th>
                                <th className="py-3 px-4">Utilization %</th>
                              </tr>
                            ) : (
                              <tr className="border-b border-gray-100 text-xs font-black uppercase text-gray-400 tracking-wider">
                                <th className="py-3 px-4">User Name</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Role</th>
                                <th className="py-3 px-4">Limit Config</th>
                                <th className="py-3 px-4">Limit Enabled</th>
                                <th className="py-3 px-4">Avg Daily Count (7d)</th>
                                <th className="py-3 px-4">Avg Utilization %</th>
                              </tr>
                            )}
                          </thead>
                          <tbody>
                            {reportType === 'bulk-extensions' ? (
                              reportData.map((item) => (
                                <tr key={item.id} className="border-b border-gray-50 text-sm font-semibold text-gray-600 hover:bg-gray-50/50">
                                  <td className="py-3 px-4 text-xs font-mono">{new Date(item.createdAt).toLocaleString()}</td>
                                  <td className="py-3 px-4">{item.user?.name || item.user?.email || 'Unknown'}</td>
                                  <td className="py-3 px-4 text-xs font-mono">{new Date(item.targetDate).toLocaleDateString()}</td>
                                  <td className="py-3 px-4">{item.extensionReasonName || item.customReason || 'N/A'}</td>
                                  <td className="py-3 px-4">{item.followupCount}</td>
                                  <td className="py-3 px-4">{item.autoDistributed ? 'Yes' : 'No'}</td>
                                </tr>
                              ))
                            ) : reportType === 'capacity' || reportType === 'utilization' ? (
                              reportData.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-50 text-sm font-semibold text-gray-600 hover:bg-gray-50/50">
                                  <td className="py-3 px-4 text-xs font-mono">{item.date}</td>
                                  <td className="py-3 px-4">{item.userName}</td>
                                  <td className="py-3 px-4">{item.count}</td>
                                  <td className="py-3 px-4">{item.limit}</td>
                                  <td className="py-3 px-4">{item.remaining}</td>
                                  <td className="py-3 px-4">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                        item.utilizationPercent >= 100
                                          ? 'bg-red-50 text-red-600'
                                          : item.utilizationPercent >= 80
                                          ? 'bg-amber-50 text-amber-600'
                                          : 'bg-emerald-50 text-emerald-600'
                                      }`}
                                    >
                                      {item.utilizationPercent}%
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              reportData.map((item) => (
                                <tr key={item.userId} className="border-b border-gray-50 text-sm font-semibold text-gray-600 hover:bg-gray-50/50">
                                  <td className="py-3 px-4 font-bold text-gray-900">{item.userName}</td>
                                  <td className="py-3 px-4">{item.userEmail}</td>
                                  <td className="py-3 px-4">{item.roleName}</td>
                                  <td className="py-3 px-4">{item.limit}</td>
                                  <td className="py-3 px-4">{item.limitEnabled ? 'Enabled' : 'Disabled'}</td>
                                  <td className="py-3 px-4">{item.avgDailyCount}</td>
                                  <td className="py-3 px-4">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                        item.utilizationPercent >= 100
                                          ? 'bg-red-50 text-red-600'
                                          : item.utilizationPercent >= 80
                                          ? 'bg-amber-50 text-amber-600'
                                          : 'bg-emerald-50 text-emerald-600'
                                      }`}
                                    >
                                      {item.utilizationPercent}%
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'audit' && access.canViewAudit && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-white/95 border border-white/70 p-6 rounded-[28px] shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur print:hidden space-y-4"
                >
                  <h3 className="text-xl font-black text-gray-900 mb-6">Settings Audit Log Trail</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs font-black uppercase text-gray-400 tracking-wider">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Actor</th>
                          <th className="py-3 px-4">Action Event</th>
                          <th className="py-3 px-4">Entity Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-sm font-semibold text-gray-400">
                              No policy audit logs found.
                            </td>
                          </tr>
                        ) : (
                          auditLogs.map((log) => (
                            <tr key={log.id} className="border-b border-gray-50 text-sm font-semibold text-gray-600 hover:bg-gray-50/50">
                              <td className="py-3 px-4 text-xs font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-gray-800">{log.user?.name || log.user?.email || 'System'}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                                    log.action === 'SETTINGS_UPDATED'
                                      ? 'bg-blue-50 text-blue-600'
                                      : log.action === 'BULK_FOLLOWUP_EXTENDED'
                                      ? 'bg-purple-50 text-purple-600'
                                      : 'bg-amber-50 text-amber-600'
                                  }`}
                                >
                                  {log.action}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-xs font-mono max-w-sm overflow-hidden truncate">
                                {JSON.stringify(log.details)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {auditTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <p className="text-xs font-bold text-gray-500">
                        Page {auditPage} of {auditTotalPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadAuditLogs(Math.max(1, auditPage - 1))}
                          disabled={auditPage <= 1}
                          className="px-3 py-1.5 border border-gray-200 text-xs font-bold rounded-lg disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => loadAuditLogs(Math.min(auditTotalPages, auditPage + 1))}
                          disabled={auditPage >= auditTotalPages}
                          className="px-3 py-1.5 border border-gray-200 text-xs font-bold rounded-lg disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FollowUpSettingsPage;
