import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Settings,
  Users,
  TrendingUp,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle,
  FileText,
  Download,
  AlertCircle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import useAuthStore from '../../store/useAuthStore';
import { hasPermission } from '../../utils/permission.util';
import * as attendanceApi from '../../services/attendance.api';
import LockedScreen from '../../components/LockedScreen';

const AttendancePage: React.FC = () => {
  const { user } = useAuthStore();
  const permissions = user?.permissions || [];

  const [activeTab, setActiveTab] = useState<'dashboard' | 'mark' | 'history' | 'admin' | 'settings'>('dashboard');

  // Today Status State
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [adminOverview, setAdminOverview] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  // Filters
  const [historyFilters, setHistoryFilters] = useState({ startDate: '', endDate: '' });
  const [adminFilters, setAdminFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    attendanceType: '',
    page: 1,
    limit: 10
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    cutoffTime: '09:30',
    enableWarning: true,
    warningThreshold: 3,
    enableAutoLock: false
  });

  // Loader states
  const [loadingToday, setLoadingToday] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Check if today reminder modal has been closed
  const [showReminder, setShowReminder] = useState(false);

  const fetchTodayStatus = async () => {
    try {
      setLoadingToday(true);
      const res = await attendanceApi.getTodayStatus();
      setTodayStatus(res.data);
      if (res.data && !res.data.isMarked && !res.data.isHoliday && !res.data.isLocked) {
        // Automatically pop up check-in reminder
        setShowReminder(true);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingToday(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await attendanceApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await attendanceApi.getHistory(historyFilters);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminData = async () => {
    if (!hasPermission(permissions, 'view_all_attendance')) return;
    try {
      const overviewRes = await attendanceApi.getAdminOverview(adminFilters);
      setAdminOverview(overviewRes.data);
      const statsRes = await attendanceApi.getAdminStats();
      setAdminStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    if (!hasPermission(permissions, 'manage_attendance')) return;
    try {
      const res = await attendanceApi.getSettings();
      setSettings(res.data);
      setSettingsForm({
        cutoffTime: res.data.cutoffTime,
        enableWarning: res.data.enableWarning,
        warningThreshold: res.data.warningThreshold,
        enableAutoLock: res.data.enableAutoLock
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
    if (activeTab === 'admin') fetchAdminData();
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab, historyFilters, adminFilters]);

  // Actions
  const handleCheckIn = async (type: string) => {
    setSubmitting(true);
    try {
      await attendanceApi.markAttendance({
        attendanceType: type,
        checkInTime: new Date().toISOString()
      });
      toast.success(`Checked in successfully as ${type}`);
      setShowReminder(false);
      fetchTodayStatus();
      fetchStats();
      if (activeTab === 'mark') setActiveTab('dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to check in');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await attendanceApi.updateSettings(settingsForm);
      toast.success('Attendance settings updated successfully');
      fetchSettings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      await attendanceApi.unlockUser(userId);
      toast.success('User account unlocked successfully');
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to unlock user');
    }
  };

  const handleExport = async () => {
    try {
      const data = await attendanceApi.exportAttendance(adminFilters);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Attendance records exported successfully');
    } catch (err) {
      toast.error('Failed to export attendance');
    }
  };

  if (todayStatus?.isLocked) {
    return (
      <DashboardLayout>
        <LockedScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-4 md:p-8">
        <div className="absolute top-0 right-0 w-[800px] h-[500px] bg-gradient-to-bl from-emerald-50/80 via-transparent to-transparent pointer-events-none -z-10" />

        <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Attendance System</span>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-1">Attendance Management</h1>
              <p className="text-sm text-gray-500 mt-1">Mark attendance, check histories, and configure workspace settings.</p>
            </div>
            
            {/* Quick check in button if not marked */}
            {todayStatus && !todayStatus.isMarked && !todayStatus.isHoliday && (
              <button
                onClick={() => handleCheckIn('PRESENT')}
                disabled={submitting}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all hover:bg-emerald-600"
              >
                <Clock className="w-4 h-4" />
                <span>Quick Check In</span>
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto space-x-6 pb-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'mark', label: 'Mark Attendance', icon: Clock },
              { id: 'history', label: 'History', icon: Calendar },
              { id: 'admin', label: 'Admin Panel', icon: Users, permission: 'view_all_attendance' },
              { id: 'settings', label: 'Settings', icon: Settings, permission: 'manage_attendance' }
            ]
              .filter(tab => !tab.permission || hasPermission(permissions, tab.permission))
              .map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
          </div>

          {/* Tab Contents */}
          <div className="mt-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Status card */}
                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Today's Status</h3>
                    <p className="text-xs text-gray-400 mt-1">{new Date().toDateString()}</p>
                    <div className="flex items-center gap-2 mt-3">
                      {todayStatus?.isHoliday ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                          Holiday: {todayStatus.holidayName || 'Public Holiday'}
                        </span>
                      ) : todayStatus?.isMarked ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Marked ({todayStatus.record?.attendanceType})
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-full">
                          Pending Check In
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Warning summary */}
                  {stats?.totalWarnings > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl">
                      <AlertTriangle className="w-5 h-5" />
                      <div className="text-left">
                        <p className="text-xs font-bold uppercase tracking-wider">Warnings</p>
                        <p className="text-sm font-black">{stats.totalWarnings} Late Check-Ins</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Attendance Rate', value: `${stats?.attendancePercentage || 0}%`, color: 'emerald' },
                    { label: 'WFH Days', value: stats?.wfhCount || 0, color: 'blue' },
                    { label: 'Half Days', value: stats?.halfDayCount || 0, color: 'amber' },
                    { label: 'Absent/Leaves', value: (stats?.absentCount || 0) + (stats?.leaveCount || 0), color: 'rose' }
                  ].map(stat => (
                    <div key={stat.label} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                      <h4 className="text-xl md:text-2xl font-black mt-2 text-gray-900">{stat.value}</h4>
                    </div>
                  ))}
                </div>

                {/* Admin Quick Widget */}
                {hasPermission(permissions, 'view_all_attendance') && adminStats && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-black text-gray-800">Workspace Daily Overview</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Present Today', value: adminStats.totalPresent, color: 'emerald' },
                        { label: 'Absent Today', value: adminStats.totalAbsent, color: 'rose' },
                        { label: 'Holidays Today', value: adminStats.totalHolidays, color: 'blue' },
                        { label: 'Locked Accounts', value: adminStats.totalLocked, color: 'red' }
                      ].map(stat => (
                        <div key={stat.label} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <h4 className="text-xl md:text-2xl font-black text-gray-900 mt-2">{stat.value}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mark' && (
              <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Mark Your Attendance</h3>
                  <p className="text-sm text-gray-400 mt-1">Select your work status for today.</p>
                </div>

                {todayStatus?.isHoliday ? (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center text-blue-700 text-sm font-semibold">
                    Today is a holiday ({todayStatus.holidayName}). Attendance registration is not required.
                  </div>
                ) : todayStatus?.isMarked ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center text-emerald-700 text-sm font-semibold">
                    Today's attendance is already marked as {todayStatus.record?.attendanceType}.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { type: 'PRESENT', label: 'Present (Office)', desc: 'Work from workplace', color: 'emerald' },
                      { type: 'WORK_FROM_HOME', label: 'Work from Home', desc: 'Remote work duties', color: 'blue' },
                      { type: 'HALF_DAY', label: 'Half Day', desc: 'Half day attendance', color: 'amber' },
                      { type: 'LEAVE', label: 'Leave', desc: 'Approved leave request', color: 'rose' }
                    ].map(option => (
                      <button
                        key={option.type}
                        onClick={() => handleCheckIn(option.type)}
                        disabled={submitting}
                        className={`p-5 rounded-3xl text-left border border-gray-100 hover:border-${option.color}-500 hover:shadow-lg transition-all group`}
                      >
                        <h4 className="font-extrabold text-gray-800 group-hover:text-emerald-600">{option.label}</h4>
                        <p className="text-xs text-gray-400 mt-1">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                {/* Date range filters */}
                <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Start Date</label>
                    <input
                      type="date"
                      value={historyFilters.startDate}
                      onChange={e => setHistoryFilters({ ...historyFilters, startDate: e.target.value })}
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">End Date</label>
                    <input
                      type="date"
                      value={historyFilters.endDate}
                      onChange={e => setHistoryFilters({ ...historyFilters, endDate: e.target.value })}
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm"
                    />
                  </div>
                </div>

                {/* History table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <th className="p-4">Date</th>
                        <th className="p-4">Check-In Time</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Warnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                      {history?.records?.map((record: any) => (
                        <tr key={record.id} className="hover:bg-gray-50/50">
                          <td className="p-4 font-bold">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="p-4">{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              record.attendanceType === 'PRESENT' ? 'bg-emerald-100 text-emerald-600' :
                              record.attendanceType === 'WORK_FROM_HOME' ? 'bg-blue-100 text-blue-600' :
                              record.attendanceType === 'HALF_DAY' ? 'bg-amber-100 text-amber-600' :
                              'bg-rose-100 text-rose-600'
                            }`}>
                              {record.attendanceType}
                            </span>
                          </td>
                          <td className="p-4">{record.status}</td>
                          <td className="p-4">
                            {record.warningCount > 0 ? (
                              <span className="text-rose-500 font-bold flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" /> {record.warningCount} Late Check-in
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                      {(!history?.records || history.records.length === 0) && (
                        <tr>
                          <td colSpan={5} className="text-center p-8 text-gray-400 font-semibold">
                            No attendance records found for the selected period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="space-y-6">
                {/* Admin Filters */}
                <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Start Date</label>
                    <input
                      type="date"
                      value={adminFilters.startDate}
                      onChange={e => setAdminFilters({ ...adminFilters, startDate: e.target.value })}
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">End Date</label>
                    <input
                      type="date"
                      value={adminFilters.endDate}
                      onChange={e => setAdminFilters({ ...adminFilters, endDate: e.target.value })}
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleExport}
                    className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>

                {/* Users List Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <th className="p-4">Employee</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Check-In Time</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Compliance Lock</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                      {adminOverview?.records?.map((record: any) => (
                        <tr key={record.id} className="hover:bg-gray-50/50">
                          <td className="p-4">
                            <div>
                              <p className="font-bold text-gray-900">{record.user?.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{record.user?.email}</p>
                            </div>
                          </td>
                          <td className="p-4">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="p-4">{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              record.attendanceType === 'PRESENT' ? 'bg-emerald-100 text-emerald-600' :
                              record.attendanceType === 'WORK_FROM_HOME' ? 'bg-blue-100 text-blue-600' :
                              record.attendanceType === 'HALF_DAY' ? 'bg-amber-100 text-amber-600' :
                              'bg-rose-100 text-rose-600'
                            }`}>
                              {record.attendanceType}
                            </span>
                          </td>
                          <td className="p-4">
                            {record.user?.isLocked ? (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-extrabold flex items-center gap-1 w-max">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-xs font-extrabold flex items-center gap-1 w-max">
                                <Unlock className="w-3 h-3" /> Active
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {record.user?.isLocked && hasPermission(permissions, 'unlock_attendance_locked_users') && (
                              <button
                                onClick={() => handleUnlockUser(record.user.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                              >
                                <Unlock className="w-3.5 h-3.5" /> Unlock
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(!adminOverview?.records || adminOverview.records.length === 0) && (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-gray-400 font-semibold">
                            No attendance records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-800 mb-6">Attendance Policy Configuration</h3>
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600">Daily Cutoff Time (HH:MM)</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:30"
                      value={settingsForm.cutoffTime}
                      onChange={e => setSettingsForm({ ...settingsForm, cutoffTime: e.target.value })}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Late Check-in Warnings</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Generate warnings for check-ins after cutoff.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.enableWarning}
                      onChange={e => setSettingsForm({ ...settingsForm, enableWarning: e.target.checked })}
                      className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600">Lock Threshold (Warnings Count)</label>
                    <input
                      type="number"
                      value={settingsForm.warningThreshold}
                      onChange={e => setSettingsForm({ ...settingsForm, warningThreshold: parseInt(e.target.value, 10) || 3 })}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Auto Lock Accounts</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Lock accounts automatically when warning threshold is reached.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.enableAutoLock}
                      onChange={e => setSettingsForm({ ...settingsForm, enableAutoLock: e.target.checked })}
                      className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-colors"
                  >
                    Save Configuration
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Check In Reminder Modal */}
      <AnimatePresence>
        {showReminder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-gray-50"
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Mark Today's Attendance</h3>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  You have not marked your attendance for today. Please check in before the cutoff time to avoid late warnings.
                </p>
                <div className="mt-6 flex flex-col w-full gap-3">
                  <button
                    onClick={() => handleCheckIn('PRESENT')}
                    className="w-full py-3.5 bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-colors"
                  >
                    Check In Now
                  </button>
                  <button
                    onClick={() => setShowReminder(false)}
                    className="w-full py-3 bg-gray-50 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-colors"
                  >
                    Remind Me Later
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AttendancePage;
