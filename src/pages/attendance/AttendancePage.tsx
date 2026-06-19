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
  Info,
  MapPin,
  Globe,
  Plus,
  Trash2,
  Edit3,
  X,
  UserCheck,
  Building,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import useAuthStore from '../../store/useAuthStore';
import { hasPermission } from '../../utils/permission.util';
import * as attendanceApi from '../../services/attendance.api';
import LockedScreen from '../../components/LockedScreen';
import { dispatchAttendanceRefresh, subscribeAttendanceRefresh } from '../../utils/attendanceRefresh';
import {
  AttendanceGeolocationError,
  captureAttendanceLocation,
  previewDistanceMeters,
} from '../../utils/attendanceGeolocation';

const AttendancePage: React.FC = () => {
  const { user } = useAuthStore();
  const permissions = user?.permissions || [];

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Stats / Overview states
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  
  // Pending queue & Users states
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [usersOverview, setUsersOverview] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  
  // Office location settings
  const [officeLocations, setOfficeLocations] = useState<any[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [locationForm, setLocationForm] = useState({
    officeName: '',
    branch: '',
    latitude: '',
    longitude: '',
    radiusMeters: 50,
    isEnabled: true,
  });
  const [markGpsPreview, setMarkGpsPreview] = useState<{
    latitude: number;
    longitude: number;
    distanceMeters: number | null;
    gpsAccuracy: number | null;
  } | null>(null);
  const [markGpsLoading, setMarkGpsLoading] = useState(false);

  // Policy Settings
  const [settings, setSettings] = useState<any>(null);
  const [settingsForm, setSettingsForm] = useState({
    cutoffTime: '09:30',
    enableWarning: true,
    warningThreshold: 3,
    enableAutoLock: false,
    attendanceStartTime: '08:00',
    lateMarkTime: '09:45',
    autoAbsentTime: '12:00',
    approvalRequired: true
  });

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);

  // Filters
  const [historyFilters, setHistoryFilters] = useState({ startDate: '', endDate: '', approvalStatus: 'APPROVED' });
  const [adminFilters, setAdminFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    attendanceType: '',
    approvalStatus: '',
    page: 1,
    limit: 50
  });

  // Mark form inputs
  const [attendanceType, setAttendanceType] = useState('PRESENT');
  const [notes, setNotes] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  // Check-Out summary fields
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [workSummary, setWorkSummary] = useState('');
  const [achievements, setAchievements] = useState('');
  const [pendingTasks, setPendingTasks] = useState('');
  const [challenges, setChallenges] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  // Schedules management
  const [schedulesList, setSchedulesList] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedUserForSchedule, setSelectedUserForSchedule] = useState<any>(null);
  const [scheduleForm, setScheduleForm] = useState({
    checkInTime: '09:00',
    checkOutTime: '18:00',
    gracePeriod: 15,
    lateMarkThreshold: '09:45',
    halfDayThreshold: 4.0,
    workingHoursRequirement: 8.0,
  });

  // Approval history and clarification request
  const [approvalHistoryList, setApprovalHistoryList] = useState<any[]>([]);
  const [clarificationRecordId, setClarificationRecordId] = useState<string | null>(null);
  const [clarificationReason, setClarificationReason] = useState('');
  const [showClarificationModal, setShowClarificationModal] = useState(false);

  // Summary details viewing
  const [showSummaryViewModal, setShowSummaryViewModal] = useState(false);
  const [selectedRecordForSummary, setSelectedRecordForSummary] = useState<any>(null);
  
  const canManageLocations =
    hasPermission(permissions, 'manage_attendance_locations') ||
    hasPermission(permissions, 'manage_attendance_network');

  // Rejection modal
  const [rejectRecordId, setRejectRecordId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchTodayStatus = async () => {
    try {
      const res = await attendanceApi.getTodayStatus();
      setTodayStatus(res.data);
    } catch (err) {
      console.error(err);
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

  const fetchNotifications = async () => {
    try {
      const res = await attendanceApi.getNotifications();
      setNotifications(res.data || []);
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

  const fetchPendingQueue = async () => {
    if (!hasPermission(permissions, 'approve_attendance') && !hasPermission(permissions, 'view_pending_attendance')) return;
    try {
      const res = await attendanceApi.getPendingApprovals();
      setPendingList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsersList = async () => {
    if (!hasPermission(permissions, 'view_all_attendance')) return;
    try {
      const overviewRes = await attendanceApi.getAdminOverview(adminFilters);
      setUsersOverview(overviewRes.data);
      const statsRes = await attendanceApi.getAdminStats();
      setAdminStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOfficeLocations = async () => {
    if (!canManageLocations && !hasPermission(permissions, 'view_all_attendance')) return;
    try {
      const res = await attendanceApi.getOfficeLocations();
      setOfficeLocations(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    if (!hasPermission(permissions, 'manage_attendance_settings')) return;
    try {
      const res = await attendanceApi.getSettings();
      setSettings(res.data);
      setSettingsForm({
        cutoffTime: res.data.cutoffTime,
        enableWarning: res.data.enableWarning,
        warningThreshold: res.data.warningThreshold,
        enableAutoLock: res.data.enableAutoLock,
        attendanceStartTime: res.data.attendanceStartTime,
        lateMarkTime: res.data.lateMarkTime,
        autoAbsentTime: res.data.autoAbsentTime,
        approvalRequired: res.data.approvalRequired
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedules = async () => {
    if (!hasPermission(permissions, 'manage_attendance_settings') && !hasPermission(permissions, 'ATTENDANCE_APPROVE')) return;
    try {
      const res = await attendanceApi.getSchedules();
      setSchedulesList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApprovalHistory = async () => {
    if (!hasPermission(permissions, 'approve_attendance') && !hasPermission(permissions, 'ATTENDANCE_APPROVE')) return;
    try {
      const res = await attendanceApi.getApprovalHistory();
      setApprovalHistoryList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    const tasks: Promise<void>[] = [
      fetchTodayStatus(),
      fetchStats(),
      fetchNotifications(),
      fetchHistory(),
      fetchPendingQueue(),
      fetchSchedules(),
      fetchApprovalHistory(),
    ];
    if (hasPermission(permissions, 'view_all_attendance')) {
      tasks.push(fetchUsersList());
    }
    await Promise.all(tasks);
    setLoading(false);
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchTodayStatus(),
      fetchStats(),
      fetchNotifications(),
      fetchHistory(),
      fetchPendingQueue(),
      fetchUsersList(),
      fetchSchedules(),
      fetchApprovalHistory(),
    ]);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => subscribeAttendanceRefresh(() => void refreshAll()), []);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
    if (activeTab === 'pending') fetchPendingQueue();
    if (activeTab === 'users') fetchUsersList();
    if (activeTab === 'networks' || activeTab === 'users') fetchOfficeLocations();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'schedules') fetchSchedules();
    if (activeTab === 'approval-history') fetchApprovalHistory();
  }, [activeTab, historyFilters, adminFilters]);

  const refreshMarkGpsPreview = async () => {
    const office = todayStatus?.assignedOfficeLocation;
    if (
      todayStatus?.attendanceApplyType !== 'FROM_OFFICE' ||
      !todayStatus?.locationValidationActive ||
      !office
    ) {
      setMarkGpsPreview(null);
      return;
    }
    if (['WORK_FROM_HOME', 'LEAVE'].includes(attendanceType)) {
      setMarkGpsPreview(null);
      return;
    }
    setMarkGpsLoading(true);
    try {
      const captured = await captureAttendanceLocation();
      setMarkGpsPreview({
        latitude: captured.latitude,
        longitude: captured.longitude,
        gpsAccuracy: captured.gpsAccuracy,
        distanceMeters: previewDistanceMeters(
          captured.latitude,
          captured.longitude,
          office.latitude,
          office.longitude,
        ),
      });
    } catch (err) {
      setMarkGpsPreview(null);
      if (err instanceof AttendanceGeolocationError) toast.error(err.message);
    } finally {
      setMarkGpsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mark') void refreshMarkGpsPreview();
  }, [
    activeTab,
    attendanceType,
    todayStatus?.assignedOfficeLocation?.id,
    todayStatus?.locationValidationActive,
  ]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const needsOfficeGps =
        todayStatus?.attendanceApplyType === 'FROM_OFFICE' &&
        !['WORK_FROM_HOME', 'LEAVE'].includes(attendanceType);
      if (needsOfficeGps && !todayStatus?.locationValidationActive) {
        toast.error(
          todayStatus?.locationSetupMessage ||
            'Office location is not configured yet. Please contact administrator.',
          { duration: 7000 },
        );
        return;
      }
      const needsGps = needsOfficeGps && Boolean(todayStatus?.locationValidationActive);
      let locationPayload = {};
      if (needsGps) {
        const captured = await captureAttendanceLocation();
        locationPayload = captured;
        const office = todayStatus?.assignedOfficeLocation;
        if (office) {
          const dist = previewDistanceMeters(
            captured.latitude,
            captured.longitude,
            office.latitude,
            office.longitude,
          );
          if (dist > office.radiusMeters) {
            toast.error('You can only mark attendance from office location.');
            return;
          }
        }
      }

      const response = await attendanceApi.markAttendance({
        attendanceType,
        checkInTime: new Date().toISOString(),
        date: todayStatus?.date,
        ...locationPayload,
        clientChannel: 'web',
        deviceInfo: navigator.userAgent,
        notes,
        attachmentUrl,
      });
      if (response.success) {
        toast.success(
          response.data?.approvalStatus === 'PENDING'
            ? 'Attendance request submitted for supervisor approval.'
            : 'Attendance marked successfully.'
        );
        dispatchAttendanceRefresh({ action: 'check-in' });
        await refreshAll();
        setActiveTab('dashboard');
      }
    } catch (err: any) {
      const data = err.response?.data;
      let hint = '';
      if (data?.errorCode === 'OFFICE_LOCATION_OUT_OF_RADIUS' && data?.details?.allowedRadiusMeters) {
        hint = ` You are ${data.details.distanceMeters}m away; allowed radius is ${data.details.allowedRadiusMeters}m.`;
      } else if (data?.errorCode === 'GPS_LOCATION_REQUIRED') {
        hint = ' Enable location permission in your browser and try again.';
      } else if (data?.errorCode === 'OFFICE_LOCATION_NOT_CONFIGURED') {
        hint = ' Ask admin to configure Attendance → Location Settings.';
      }
      toast.error((data?.message || 'Failed to check in') + hint, { duration: 7000 });
    } finally {
      setSubmitting(false);
    }
  };

  // Review (Approve/Reject) Action
  const handleReview = async (recordId: string, action: 'APPROVE' | 'REJECT') => {
    if (action === 'REJECT') {
      setRejectRecordId(recordId);
      setRejectionReason('');
      return;
    }

    try {
      await attendanceApi.reviewAttendance(recordId, 'APPROVE');
      toast.success('Attendance request approved.');
      refreshAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to review request');
    }
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is mandatory.');
      return;
    }
    try {
      await attendanceApi.reviewAttendance(rejectRecordId!, 'REJECT', rejectionReason);
      toast.success('Attendance request rejected.');
      setRejectRecordId(null);
      refreshAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workSummary.trim()) {
      toast.error('Work Summary is mandatory.');
      return;
    }
    setCheckoutSubmitting(true);
    try {
      const response = await attendanceApi.checkOut({
        workSummary,
        achievements: achievements || null,
        pendingTasks: pendingTasks || null,
        challenges: challenges || null,
        additionalNotes: additionalNotes || null,
      });
      if (response.success) {
        toast.success('Attendance summary submitted & checked out successfully');
        setShowCheckOutModal(false);
        setWorkSummary('');
        setAchievements('');
        setPendingTasks('');
        setChallenges('');
        setAdditionalNotes('');
        dispatchAttendanceRefresh({ action: 'check-out' });
        await refreshAll();
        setActiveTab('dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to check out');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleClarificationRequest = (recordId: string) => {
    setClarificationRecordId(recordId);
    setClarificationReason('');
    setShowClarificationModal(true);
  };

  const submitClarification = async () => {
    if (!clarificationReason.trim()) {
      toast.error('Clarification request reason is mandatory.');
      return;
    }
    try {
      await attendanceApi.requestClarification(clarificationRecordId!, clarificationReason);
      toast.success('Clarification request sent to employee.');
      setClarificationRecordId(null);
      setClarificationReason('');
      setShowClarificationModal(false);
      refreshAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request clarification');
    }
  };

  const handleEditSchedule = (user: any) => {
    setSelectedUserForSchedule(user);
    if (user.attendanceSchedule) {
      setScheduleForm({
        checkInTime: user.attendanceSchedule.checkInTime,
        checkOutTime: user.attendanceSchedule.checkOutTime,
        gracePeriod: user.attendanceSchedule.gracePeriod,
        lateMarkThreshold: user.attendanceSchedule.lateMarkThreshold,
        halfDayThreshold: user.attendanceSchedule.halfDayThreshold,
        workingHoursRequirement: user.attendanceSchedule.workingHoursRequirement,
      });
    } else {
      setScheduleForm({
        checkInTime: '09:00',
        checkOutTime: '18:00',
        gracePeriod: 15,
        lateMarkThreshold: '09:45',
        halfDayThreshold: 4.0,
        workingHoursRequirement: 8.0,
      });
    }
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await attendanceApi.updateSchedule(selectedUserForSchedule.id, scheduleForm);
      toast.success('Attendance schedule updated successfully.');
      setShowScheduleModal(false);
      setSelectedUserForSchedule(null);
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update schedule');
    }
  };

  // Inline User Apply Type Edit
  const handleInlineApplyTypeChange = async (userId: string, type: string) => {
    try {
      await attendanceApi.updateUserApplyType(userId, type);
      toast.success('Apply type updated successfully.');
      refreshAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user apply type');
    }
  };

  const handleInlineOfficeBranchChange = async (userId: string, locationId: string) => {
    try {
      await attendanceApi.updateUserOfficeBranch(userId, locationId || null);
      toast.success('Office branch updated successfully.');
      refreshAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update office branch');
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...locationForm,
        latitude: parseFloat(locationForm.latitude),
        longitude: parseFloat(locationForm.longitude),
        radiusMeters: Number(locationForm.radiusMeters) || 50,
      };
      if (editingLocation) {
        await attendanceApi.updateOfficeLocation(editingLocation.id, payload);
        toast.success('Office location updated successfully.');
      } else {
        await attendanceApi.createOfficeLocation(payload);
        toast.success('Office location created successfully.');
      }
      setShowLocationModal(false);
      setEditingLocation(null);
      fetchOfficeLocations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save office location');
    }
  };

  const handleEditLocation = (loc: any) => {
    setEditingLocation(loc);
    setLocationForm({
      officeName: loc.officeName,
      branch: loc.branch || '',
      latitude: String(loc.latitude),
      longitude: String(loc.longitude),
      radiusMeters: loc.radiusMeters ?? 50,
      isEnabled: loc.isEnabled,
    });
    setShowLocationModal(true);
  };

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm('Delete this office location? Assigned users will be unlinked.')) return;
    try {
      await attendanceApi.deleteOfficeLocation(id);
      toast.success('Office location deleted.');
      fetchOfficeLocations();
    } catch (err: any) {
      toast.error('Failed to delete office location');
    }
  };

  const handleUpdatePolicySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await attendanceApi.updateSettings(settingsForm);
      toast.success('Attendance policy settings updated.');
      fetchSettings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update policy settings');
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      await attendanceApi.unlockUser(userId);
      toast.success('User unlocked and warnings cleared.');
      refreshAll();
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
      link.setAttribute('download', `attendance-reports-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Export finished successfully.');
    } catch (err) {
      toast.error('Failed to export reports');
    }
  };

  if (todayStatus?.isLocked) {
    return (
      <DashboardLayout>
        <LockedScreen
          isTargetLocked={Boolean(todayStatus?.isTargetLocked)}
          targetLock={todayStatus?.targetLock}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-4 md:p-8">
        {/* Banner Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-emerald-50/70 via-transparent to-transparent pointer-events-none -z-10" />

        <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Enterprise Compliance</span>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-1">Attendance Management</h1>
              <p className="text-sm text-gray-500 mt-1">Configure WiFi network validation, apply types, approve requests, and export reports.</p>
            </div>
            
            {todayStatus && todayStatus.requiresMandatoryPopup && !todayStatus.isHoliday && !todayStatus.isWeeklyOff && (
              <button
                onClick={() => setActiveTab('mark')}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all hover:bg-emerald-600 cursor-pointer"
              >
                <Clock size={16} />
                <span>Mark Attendance</span>
              </button>
            )}

            {todayStatus && todayStatus.record && todayStatus.record.checkInTime && !todayStatus.record.checkOutTime && (
              <button
                onClick={() => {
                  setActiveTab('mark');
                  setShowCheckOutModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all hover:bg-rose-600 cursor-pointer"
              >
                <Clock size={16} />
                <span>Check Out</span>
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto space-x-6 pb-2 scrollbar-none">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'mark', label: 'Mark Attendance', icon: Clock },
              { id: 'history', label: 'History', icon: Calendar },
              { id: 'pending', label: 'Pending Approvals', icon: UserCheck, permission: 'view_pending_attendance' },
              { id: 'approval-history', label: 'Approval History', icon: FileText, permission: 'ATTENDANCE_APPROVE' },
              { id: 'schedules', label: 'Attendance Schedules', icon: Calendar, permission: 'ATTENDANCE_APPROVE' },
              { id: 'users', label: 'Users List', icon: Users, permission: 'view_all_attendance' },
              { id: 'networks', label: 'Location Settings', icon: Building, permission: 'manage_attendance_locations' },
              { id: 'settings', label: 'Settings', icon: Settings, permission: 'manage_attendance_settings' }
            ].map(tab => {
              if (tab.id === 'networks' && !canManageLocations) return null;
              if (tab.permission && tab.id !== 'networks' && !hasPermission(permissions, tab.permission)) return null;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content area */}
          <div>
            
            {/* 1. DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Daily Status Banner */}
                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Today's Check-In Status</h3>
                    <p className="text-xs text-gray-400 mt-1">{new Date().toDateString()}</p>
                    <div className="flex items-center gap-2 mt-3">
                      {todayStatus?.isWeeklyOff ? (
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                          Off Day: {todayStatus.weeklyOffLabel || 'Weekly Off'}
                        </span>
                      ) : todayStatus?.isHoliday ? (
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                          Holiday: {todayStatus.holidayName || 'Public Holiday'}
                        </span>
                      ) : todayStatus?.record?.approvalStatus === 'PENDING_APPROVAL' ? (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full flex items-center gap-1">
                          <Clock size={14} />
                          Pending Approval (Checked Out)
                        </span>
                      ) : todayStatus?.record?.approvalStatus === 'CLARIFICATION_REQUESTED' ? (
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full flex items-center gap-1">
                          <AlertCircle size={14} />
                          Clarification Requested
                        </span>
                      ) : todayStatus?.record?.approvalStatus === 'APPROVED' ? (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full flex items-center gap-1">
                          <CheckCircle size={14} />
                          Approved ({todayStatus.record?.attendanceType})
                        </span>
                      ) : todayStatus?.record?.approvalStatus === 'REJECTED' || todayStatus?.submissionState === 'REJECTED' ? (
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full flex items-center gap-1">
                          <AlertTriangle size={14} />
                          Rejected — resubmit required
                        </span>
                      ) : todayStatus?.submissionState === 'PENDING' ? (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full flex items-center gap-1">
                          <Clock size={14} />
                          Pending Approval (Checked In)
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">
                          Pending Submission
                        </span>
                      )}
                    </div>
                  </div>

                  {stats?.totalWarnings > 0 && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl">
                      <AlertTriangle className="text-rose-500" size={20} />
                      <div className="text-left text-xs">
                        <p className="font-bold text-rose-800">Late Cutoff Warnings</p>
                        <p className="text-rose-600 mt-0.5">{stats.totalWarnings} Records Exceeded Cutoff</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Personal stats count cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Attendance Rate', value: `${stats?.attendancePercentage || 0}%`, icon: TrendingUp },
                    { label: 'WFH Submissions', value: stats?.wfhCount || 0, icon: Clock },
                    { label: 'Half Days', value: stats?.halfDayCount || 0, icon: Clock },
                    { label: 'Absents / Leaves', value: (stats?.absentCount || 0) + (stats?.leaveCount || 0), icon: AlertCircle }
                  ].map(stat => (
                    <div key={stat.label} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center text-gray-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                        <stat.icon size={14} />
                      </div>
                      <h4 className="text-xl md:text-2xl font-black mt-2 text-gray-900">{stat.value}</h4>
                    </div>
                  ))}
                </div>

                {/* Notifications & System Audit Log Widget */}
                {notifications.length > 0 && (
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
                    <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                      <Bell size={16} className="text-emerald-500" />
                      <span>Recent Activity Alerts</span>
                    </h3>
                    <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                      {notifications.map((n, i) => (
                        <div key={i} className="py-3 text-xs flex justify-between gap-4">
                          <div>
                            <p className="font-bold text-gray-700">{n.title}</p>
                            <p className="text-gray-400 mt-0.5">{n.message}</p>
                          </div>
                          <span className="text-gray-300 text-[10px] font-mono shrink-0">{new Date(n.createdAt).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Workspace Administrator Summary stats */}
                {hasPermission(permissions, 'view_all_attendance') && adminStats && (
                  <div className="space-y-4 pt-4 border-t border-gray-50">
                    <h3 className="text-base font-black text-gray-800">Workspace Compliance Dashboard</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                      {[
                        { label: 'Present Today', value: adminStats.totalPresent },
                        { label: 'Pending Approvals', value: adminStats.totalPending ?? 0 },
                        { label: 'Approved Today', value: adminStats.totalApproved ?? 0 },
                        { label: 'Late Users', value: adminStats.totalLate ?? 0 },
                        { label: 'Absent / Not Submitted', value: adminStats.totalAbsent },
                        { label: 'Rejected', value: adminStats.totalRejected ?? 0 },
                      ].map(stat => (
                        <div key={stat.label} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                          <h4 className="text-lg md:text-xl font-black text-gray-900 mt-1">{stat.value}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. MARK ATTENDANCE */}
            {activeTab === 'mark' && (
              <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="text-center">
                  <div className="mx-auto h-14 w-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Mark Your Attendance</h3>
                  <p className="text-xs text-gray-400 mt-1">GPS location is validated for office staff within branch radius.</p>
                </div>

                {todayStatus?.isWeeklyOff ? (
                  <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-center text-slate-700 text-xs font-semibold">
                    Today is a weekly off. Attendance registration is not required.
                  </div>
                ) : todayStatus?.isHoliday ? (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center text-blue-700 text-xs font-semibold">
                    Today is a holiday ({todayStatus.holidayName}). Attendance registration is not required.
                  </div>
                ) : todayStatus?.record?.approvalStatus === 'APPROVED' && todayStatus.record.checkOutTime ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center text-emerald-800">
                      <p className="text-sm font-black">Attendance Approved & Checked Out</p>
                      <p className="mt-2 text-xs font-semibold">
                        Type: {todayStatus.record?.attendanceType?.replace(/_/g, ' ')} · Check-in:{' '}
                        {todayStatus.record?.checkInTime
                          ? new Date(todayStatus.record.checkInTime).toLocaleString()
                          : '—'}
                      </p>
                      <p className="mt-1 text-xs">
                        Check-out:{' '}
                        {todayStatus.record?.checkOutTime
                          ? new Date(todayStatus.record.checkOutTime).toLocaleString()
                          : '—'}
                      </p>
                      <p className="mt-1 text-xs font-bold text-emerald-950">
                        Total Working Hours: {todayStatus.record?.workingHours ?? '—'}
                      </p>
                    </div>
                  </div>
                ) : todayStatus?.record?.approvalStatus === 'PENDING_APPROVAL' ? (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-center text-amber-800 space-y-3">
                    <p className="text-sm font-black">Attendance Pending Approval</p>
                    <p className="text-xs">You have checked out and submitted your daily work summary.</p>
                    <div className="mt-2 text-xs font-semibold">
                      Check-in:{' '}
                      {todayStatus.record?.checkInTime
                        ? new Date(todayStatus.record.checkInTime).toLocaleString()
                        : '—'}
                    </div>
                    <div className="text-xs">
                      Check-out:{' '}
                      {todayStatus.record?.checkOutTime
                        ? new Date(todayStatus.record.checkOutTime).toLocaleString()
                        : '—'}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRecordForSummary(todayStatus.record);
                        setShowSummaryViewModal(true);
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      View Submitted Summary
                    </button>
                  </div>
                ) : todayStatus?.record?.approvalStatus === 'CLARIFICATION_REQUESTED' ? (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-center text-blue-800 space-y-3">
                    <p className="text-sm font-black">Clarification Requested</p>
                    <p className="text-xs font-semibold">Reason: {todayStatus.record.rejectedReason}</p>
                    <p className="text-xs text-blue-700">Please review and resubmit your work summary below.</p>
                    <button
                      onClick={() => {
                        setWorkSummary(todayStatus.record.workSummary || '');
                        setAchievements(todayStatus.record.achievements || '');
                        setPendingTasks(todayStatus.record.pendingTasks || '');
                        setChallenges(todayStatus.record.challenges || '');
                        setAdditionalNotes(todayStatus.record.additionalNotes || '');
                        setShowCheckOutModal(true);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-colors shadow-md text-xs flex items-center justify-center gap-2 cursor-pointer font-black"
                    >
                      Update & Resubmit Summary
                    </button>
                  </div>
                ) : todayStatus?.record && todayStatus.record.checkInTime && !todayStatus.record.checkOutTime ? (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center text-emerald-800 space-y-4">
                    <p className="text-sm font-black">You are Checked In</p>
                    <p className="text-xs font-semibold">
                      Type: {todayStatus.record?.attendanceType?.replace(/_/g, ' ')} · Checked-in at:{' '}
                      {todayStatus.record?.checkInTime
                        ? new Date(todayStatus.record.checkInTime).toLocaleTimeString()
                        : '—'}
                    </p>
                    <button
                      onClick={() => {
                        setWorkSummary('');
                        setAchievements('');
                        setPendingTasks('');
                        setChallenges('');
                        setAdditionalNotes('');
                        setShowCheckOutModal(true);
                      }}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl transition-colors shadow-md text-xs flex items-center justify-center gap-2 cursor-pointer font-black"
                    >
                      <Clock size={16} />
                      <span>Check Out & Submit Work Summary</span>
                    </button>
                  </div>
                ) : todayStatus?.submissionState === 'APPROVED' ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center text-emerald-800">
                      <p className="text-sm font-black">Attendance Approved</p>
                      <p className="mt-2 text-xs font-semibold">
                        Type: {todayStatus.record?.attendanceType?.replace(/_/g, ' ')} · Check-in:{' '}
                        {todayStatus.record?.checkInTime
                          ? new Date(todayStatus.record.checkInTime).toLocaleString()
                          : '—'}
                      </p>
                      <p className="mt-1 text-xs">
                        Location: {todayStatus.record?.geoLocation || '—'}
                        {todayStatus.record?.calculatedDistanceMeters != null
                          ? ` · ${Math.round(todayStatus.record.calculatedDistanceMeters)}m from office`
                          : ''}
                      </p>
                      <p className="mt-1 text-xs">
                        Apply type: {todayStatus.record?.attendanceApplyType === 'FROM_OFFICE' ? 'From Office' : 'From Anywhere'}
                        {todayStatus.record?.isInsideOfficeRadius ? ' · Inside office radius' : ''}
                      </p>
                    </div>
                  </div>
                ) : todayStatus?.submissionState === 'PENDING' ? (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-center text-amber-800">
                    <p className="text-sm font-black">Attendance Pending Approval</p>
                    <p className="mt-2 text-xs font-semibold">
                      Submitted as {todayStatus.record?.attendanceType?.replace(/_/g, ' ')} at{' '}
                      {todayStatus.record?.checkInTime
                        ? new Date(todayStatus.record.checkInTime).toLocaleString()
                        : '—'}
                    </p>
                    <p className="mt-1 text-xs text-amber-700">You cannot submit again until your supervisor reviews this request.</p>
                  </div>
                ) : (
                  <>
                    {todayStatus?.submissionState === 'REJECTED' || todayStatus?.record?.approvalStatus === 'REJECTED' ? (
                      <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center text-rose-800">
                        <p className="text-sm font-black">Attendance Rejected</p>
                        {todayStatus.record?.rejectedReason ? (
                          <p className="mt-2 text-xs">Reason: {todayStatus.record.rejectedReason}</p>
                        ) : null}
                        <p className="mt-2 text-xs">Please resubmit your attendance below.</p>
                      </div>
                    ) : null}
                  <form onSubmit={handleCheckIn} className="space-y-5">
                    {/* Simulated presets helper */}
                    {todayStatus?.attendanceApplyType === 'FROM_OFFICE' &&
                      !['WORK_FROM_HOME', 'LEAVE'].includes(attendanceType) && (
                      <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                        {!todayStatus.locationValidationActive ? (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                            <p className="font-bold">Office location setup required</p>
                            <p className="mt-1">
                              {todayStatus.locationSetupMessage ||
                                'Office location is not configured yet. Please contact administrator.'}
                            </p>
                            {!todayStatus.officeLocationConfigured ? (
                              <p className="mt-1 text-[10px] opacity-75">
                                Waiting for admin setup in Location Settings.
                              </p>
                            ) : !todayStatus.officeBranchAssigned ? (
                              <p className="mt-1 text-[10px] opacity-75">
                                No office branch assigned to your account yet.
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                Live GPS Check
                              </label>
                              <button
                                type="button"
                                onClick={() => void refreshMarkGpsPreview()}
                                className="px-2 py-0.5 text-[9px] rounded font-bold border bg-white text-gray-700"
                              >
                                Refresh
                              </button>
                            </div>
                            <p className="font-bold text-gray-800">
                              {todayStatus.assignedOfficeLocation?.officeName}
                              {todayStatus.assignedOfficeLocation?.branch
                                ? ` · ${todayStatus.assignedOfficeLocation.branch}`
                                : ''}{' '}
                              (radius {todayStatus.assignedOfficeLocation?.radiusMeters}m)
                            </p>
                            {markGpsLoading ? (
                              <p className="text-gray-500">Detecting location…</p>
                            ) : markGpsPreview ? (
                              <>
                                <p className="font-mono text-[10px]">
                                  {markGpsPreview.latitude.toFixed(5)}, {markGpsPreview.longitude.toFixed(5)}
                                </p>
                                <p
                                  className={`font-bold ${
                                    markGpsPreview.distanceMeters != null &&
                                    todayStatus.assignedOfficeLocation &&
                                    markGpsPreview.distanceMeters <=
                                      todayStatus.assignedOfficeLocation.radiusMeters
                                      ? 'text-emerald-700'
                                      : 'text-rose-600'
                                  }`}
                                >
                                  {markGpsPreview.distanceMeters != null
                                    ? `${Math.round(markGpsPreview.distanceMeters)} m from office`
                                    : 'Distance unknown'}
                                </p>
                              </>
                            ) : (
                              <p className="text-rose-600">Enable location services to mark attendance.</p>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Check-in Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['PRESENT', 'WORK_FROM_HOME', 'HALF_DAY', 'LEAVE'].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setAttendanceType(t)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                              attendanceType === t
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            {t.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Notes</label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Work details..."
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition-colors shadow-md text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Registering...' : 'Register Daily Attendance'}
                    </button>
                  </form>
                  </>
                )}
              </div>
            )}

            {/* 3. HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col">
                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-1">Start Date</label>
                    <input
                      type="date"
                      value={historyFilters.startDate}
                      onChange={e => setHistoryFilters({ ...historyFilters, startDate: e.target.value })}
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-emerald-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-1">End Date</label>
                    <input
                      type="date"
                      value={historyFilters.endDate}
                      onChange={e => setHistoryFilters({ ...historyFilters, endDate: e.target.value })}
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-emerald-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-1">Approval Status</label>
                    <select
                      value={historyFilters.approvalStatus}
                      onChange={e => setHistoryFilters({ ...historyFilters, approvalStatus: e.target.value })}
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-emerald-500 bg-white"
                    >
                      <option value="APPROVED">Approved Only</option>
                      <option value="PENDING">Pending Approval</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="ALL">All Statuses</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <th className="p-4">Date</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Approval Status</th>
                        <th className="p-4">Approved By</th>
                        <th className="p-4">Approved At</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Apply Type</th>
                        <th className="p-4">Work Location</th>
                        <th className="p-4">Late Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                      {history?.records?.map((record: any) => (
                        <tr key={record.id} className="hover:bg-gray-50/50">
                          <td className="p-4 font-bold">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="p-4 font-bold text-gray-900">{record.user?.name || '-'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              record.attendanceType === 'PRESENT' ? 'bg-emerald-100 text-emerald-600' :
                              record.attendanceType === 'WORK_FROM_HOME' ? 'bg-blue-100 text-blue-600' :
                              record.attendanceType === 'HALF_DAY' ? 'bg-amber-100 text-amber-600' :
                              'bg-rose-100 text-rose-600'
                            }`}>
                              {record.attendanceType}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              record.approvalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                              record.approvalStatus === 'REJECTED' ? 'bg-rose-50 text-rose-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>
                              {record.approvalStatus}
                            </span>
                            {record.rejectedReason && (
                              <p className="text-[10px] text-rose-500 mt-1 font-medium">Reason: {record.rejectedReason}</p>
                            )}
                          </td>
                          <td className="p-4">{record.approvedByName || '-'}</td>
                          <td className="p-4">{record.approvedAt ? new Date(record.approvedAt).toLocaleString() : '-'}</td>
                          <td className="p-4 text-gray-400 font-mono text-[10px]">
                            {record.geoLocation || (record.latitude != null ? `${record.latitude}, ${record.longitude}` : '—')}
                            {record.calculatedDistanceMeters != null
                              ? ` · ${Math.round(record.calculatedDistanceMeters)}m`
                              : ''}
                          </td>
                          <td className="p-4 font-semibold text-gray-500">
                            {record.attendanceApplyType === 'FROM_OFFICE' ? 'From Office' : 'From Anywhere'}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              record.isInsideOfficeRadius || record.isOfficeNetwork
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {record.isInsideOfficeRadius || record.isOfficeNetwork ? 'In radius' : 'Remote'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              record.warningCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {record.warningCount > 0 ? 'Late' : 'On Time'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!history?.records || history.records.length === 0) && (
                        <tr>
                          <td colSpan={10} className="text-center p-8 text-gray-400 font-semibold">
                            No attendance history logs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. PENDING APPROVALS */}
            {activeTab === 'pending' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <th className="p-4">Employee</th>
                        <th className="p-4">Role / Dept</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Time</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Notes</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                      {pendingList.map((record: any) => (
                        <tr key={record.id} className="hover:bg-gray-50/50">
                          <td className="p-4">
                            <p className="font-bold text-gray-900">{record.user?.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{record.user?.email}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold">{record.user?.department?.name || 'No Dept'}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{record.user?.role?.name}</p>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-bold">
                              {record.attendanceType}
                            </span>
                          </td>
                          <td className="p-4">{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}</td>
                          <td className="p-4 text-[10px] font-mono">
                            <p>{record.geoLocation || '—'}</p>
                            <p className="text-gray-400">
                              {record.calculatedDistanceMeters != null
                                ? `${Math.round(record.calculatedDistanceMeters)} m`
                                : record.isInsideOfficeRadius
                                ? 'In radius'
                                : '—'}
                            </p>
                          </td>
                          <td className="p-4 max-w-[200px] truncate">
                            {record.notes && <p className="font-medium">Check-In: {record.notes}</p>}
                            {record.workSummary && <p className="text-[10px] text-gray-500 mt-1 truncate">Check-Out Summary: {record.workSummary}</p>}
                            {!record.notes && !record.workSummary && '—'}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              {(record.workSummary || record.notes) && (
                                <button
                                  onClick={() => {
                                    setSelectedRecordForSummary(record);
                                    setShowSummaryViewModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg font-bold hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                  View Summary
                                </button>
                              )}
                              <button
                                onClick={() => handleClarificationRequest(record.id)}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                              >
                                Clarify
                              </button>
                              <button
                                onClick={() => handleReview(record.id, 'APPROVE')}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReview(record.id, 'REJECT')}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pendingList.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-gray-400 font-semibold">
                            No pending attendance approvals found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. USERS LIST */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase mb-1">Status Filter</span>
                      <select
                        value={adminFilters.approvalStatus}
                        onChange={e => setAdminFilters({ ...adminFilters, approvalStatus: e.target.value })}
                        className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-emerald-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="NOT_SUBMITTED">Not Submitted</option>
                        <option value="APPROVED">Approved</option>
                        <option value="PENDING">Pending</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <th className="p-4">Employee</th>
                        <th className="p-4">Timing Schedule</th>
                        <th className="p-4">Day Details</th>
                        <th className="p-4">Attendance Status</th>
                        <th className="p-4">Approver & Resolve Info</th>
                        <th className="p-4">Location Settings / Branch</th>
                        <th className="p-4">Compliance / Lock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                      {usersOverview?.records?.map((record: any) => (
                        <tr key={record.id} className="hover:bg-gray-50/50">
                          <td className="p-4">
                            <p className="font-bold text-gray-900">{record.user?.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{record.user?.email}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{record.user?.role?.name || '—'} · {record.user?.department?.name || '—'}</p>
                          </td>
                          <td className="p-4">
                            {record.user?.attendanceSchedule ? (
                              <div className="space-y-1">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                                  {record.user.attendanceSchedule.checkInTime} - {record.user.attendanceSchedule.checkOutTime}
                                </span>
                                <p className="text-[9px] text-gray-400 mt-0.5">Grace: {record.user.attendanceSchedule.gracePeriod}m · Late: {record.user.attendanceSchedule.lateMarkThreshold}</p>
                              </div>
                            ) : (
                              <span className="text-gray-400 font-medium">
                                09:00 - 18:00 (Default)
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-semibold text-gray-800">
                                In: {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                Out: {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </p>
                              {record.workingHours != null && (
                                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                                  Work: {record.workingHours} hrs
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1.5">
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold block w-fit ${
                                  record.approvalStatus === 'APPROVED'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : record.approvalStatus === 'PENDING' || record.approvalStatus === 'PENDING_APPROVAL'
                                    ? 'bg-amber-50 text-amber-600'
                                    : record.approvalStatus === 'CLARIFICATION_REQUESTED'
                                    ? 'bg-blue-50 text-blue-600'
                                    : record.approvalStatus === 'REJECTED'
                                    ? 'bg-rose-50 text-rose-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {record.approvalStatus === 'NOT_SUBMITTED'
                                  ? 'Not Submitted'
                                  : record.approvalStatus === 'PENDING_APPROVAL'
                                  ? 'Pending Approval (Checked Out)'
                                  : record.approvalStatus === 'CLARIFICATION_REQUESTED'
                                  ? 'Clarification Requested'
                                  : `${record.approvalStatus} (${record.attendanceType})`}
                              </span>
                              {(record.workSummary || record.notes) && (
                                <button
                                  onClick={() => {
                                    setSelectedRecordForSummary(record);
                                    setShowSummaryViewModal(true);
                                  }}
                                  className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer text-left block"
                                >
                                  View Notes/Summary
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {record.approvalStatus === 'APPROVED' ? (
                              <div>
                                <p className="font-semibold text-gray-700">By: {record.approvedByName || 'System'}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{record.approvedAt ? new Date(record.approvedAt).toLocaleDateString() : ''}</p>
                              </div>
                            ) : record.approvalStatus === 'REJECTED' ? (
                              <div>
                                <p className="font-bold text-rose-600">Rejected</p>
                                {record.rejectedReason && <p className="text-[10px] text-rose-500 mt-0.5 line-clamp-2" title={record.rejectedReason}>Reason: {record.rejectedReason}</p>}
                              </div>
                            ) : record.approvalStatus === 'CLARIFICATION_REQUESTED' ? (
                              <div>
                                <p className="font-bold text-blue-600">Clarification Req.</p>
                                {record.rejectedReason && <p className="text-[10px] text-blue-500 mt-0.5 line-clamp-2" title={record.rejectedReason}>Reason: {record.rejectedReason}</p>}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="p-4 space-y-2">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-bold text-gray-500">Apply Type:</span>
                              {hasPermission(permissions, 'edit_attendance_apply_type') ? (
                                <select
                                  value={record.attendanceApplyType || record.user?.attendanceApplyType || 'FROM_ANYWHERE'}
                                  onChange={e => handleInlineApplyTypeChange(record.user.id, e.target.value)}
                                  className="border border-gray-200 rounded-lg px-2 py-1 text-[11px] focus:outline-emerald-500 font-bold bg-white text-gray-700"
                                >
                                  <option value="FROM_OFFICE">From Office</option>
                                  <option value="FROM_ANYWHERE">From Anywhere</option>
                                </select>
                              ) : (
                                <span className="font-bold text-gray-700">
                                  {(record.attendanceApplyType || record.user?.attendanceApplyType) === 'FROM_OFFICE'
                                    ? 'From Office'
                                    : 'From Anywhere'}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-bold text-gray-500">Office Location:</span>
                              {hasPermission(permissions, 'assign_office_branch') ||
                              hasPermission(permissions, 'edit_attendance_apply_type') ? (
                                <select
                                  value={record.user?.attendanceOfficeLocationId || ''}
                                  onChange={(e) =>
                                    handleInlineOfficeBranchChange(record.user.id, e.target.value)
                                  }
                                  className="border border-gray-200 rounded-lg px-2 py-1 text-[11px] focus:outline-emerald-500 font-bold bg-white text-gray-700 max-w-[140px]"
                                >
                                  <option value="">Unassigned</option>
                                  {officeLocations.map((loc: any) => (
                                    <option key={loc.id} value={loc.id}>
                                      {loc.officeName}
                                      {loc.branch ? ` (${loc.branch})` : ''}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-gray-700 font-bold">
                                  {record.user?.attendanceOfficeLocation?.officeName || '—'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold w-fit ${
                                  record.complianceStatus === 'COMPLIANT'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : record.complianceStatus === 'PENDING'
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {record.complianceStatus?.replace(/_/g, ' ') || '—'}
                              </span>
                              <div className="flex items-center gap-2">
                                {record.user?.isLocked ? (
                                  <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[9px] font-bold flex items-center gap-1">
                                    <Lock size={12} /> Locked
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold flex items-center gap-1">
                                    <Unlock size={12} /> Active
                                  </span>
                                )}
                                {record.user?.isLocked && hasPermission(permissions, 'unlock_attendance_locked_users') && (
                                  <button
                                    onClick={() => handleUnlockUser(record.user.id)}
                                    className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold hover:bg-emerald-700 cursor-pointer"
                                  >
                                    Unlock
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!usersOverview?.records || usersOverview.records.length === 0) && (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-gray-400 font-semibold">
                            No users found for this workspace.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. LOCATION SETTINGS */}
            {activeTab === 'networks' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 font-black">Office Location Settings</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Configure GPS coordinates and allowed check-in radius per branch.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingLocation(null);
                      setLocationForm({
                        officeName: '',
                        branch: '',
                        latitude: '',
                        longitude: '',
                        radiusMeters: 50,
                        isEnabled: true,
                      });
                      setShowLocationModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Location</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {officeLocations.map((loc) => (
                    <div key={loc.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{loc.officeName}</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">{loc.branch || 'Head Office'}</p>
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEditLocation(loc)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(loc.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="divide-y divide-gray-50 text-xs pt-2">
                        <div className="py-2 flex justify-between">
                          <span className="text-gray-400">Latitude</span>
                          <span className="font-mono text-gray-700 font-bold">{loc.latitude}</span>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span className="text-gray-400">Longitude</span>
                          <span className="font-mono text-gray-700">{loc.longitude}</span>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span className="text-gray-400">Radius</span>
                          <span className="font-mono text-gray-700">{loc.radiusMeters} m</span>
                        </div>
                        <div className="py-2">
                          <a
                            href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 font-bold text-[10px] hover:underline"
                          >
                            Open map preview
                          </a>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span className="text-gray-400">Status</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            loc.isEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                          }`}>{loc.isEnabled ? 'Active' : 'Disabled'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {officeLocations.length === 0 && (
                    <div className="col-span-full bg-white p-8 rounded-3xl border border-gray-100 text-center text-gray-400 font-semibold">
                      No office locations configured yet. Add your first office location to enable GPS
                      validation.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. SETTINGS */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-gray-800">Attendance Policies & Timings</h3>
                
                <form onSubmit={handleUpdatePolicySettings} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600">Start Time (HH:MM)</label>
                      <input
                        type="text"
                        value={settingsForm.attendanceStartTime}
                        onChange={e => setSettingsForm({ ...settingsForm, attendanceStartTime: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-emerald-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600">Cutoff Time (HH:MM)</label>
                      <input
                        type="text"
                        value={settingsForm.cutoffTime}
                        onChange={e => setSettingsForm({ ...settingsForm, cutoffTime: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-emerald-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600">Late Mark Time (HH:MM)</label>
                      <input
                        type="text"
                        value={settingsForm.lateMarkTime}
                        onChange={e => setSettingsForm({ ...settingsForm, lateMarkTime: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-emerald-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600">Auto Absent Time (HH:MM)</label>
                      <input
                        type="text"
                        value={settingsForm.autoAbsentTime}
                        onChange={e => setSettingsForm({ ...settingsForm, autoAbsentTime: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="divide-y divide-gray-50 space-y-4">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">Late Cutoff Warnings</h4>
                        <p className="text-[10px] text-gray-400">Mark warnings automatically for late logins.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.enableWarning}
                        onChange={e => setSettingsForm({ ...settingsForm, enableWarning: e.target.checked })}
                        className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5 pt-3">
                      <label className="text-xs font-bold text-gray-600">Warning Account Lock Threshold</label>
                      <input
                        type="number"
                        value={settingsForm.warningThreshold}
                        onChange={e => setSettingsForm({ ...settingsForm, warningThreshold: parseInt(e.target.value, 10) || 3 })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">Auto-Lock Users</h4>
                        <p className="text-[10px] text-gray-400">Lock user accounts once warning threshold limit is met.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.enableAutoLock}
                        onChange={e => setSettingsForm({ ...settingsForm, enableAutoLock: e.target.checked })}
                        className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">Approval Required Workflow</h4>
                        <p className="text-[10px] text-gray-400">Submissions go to the pending queue for supervisor reviews.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.approvalRequired}
                        onChange={e => setSettingsForm({ ...settingsForm, approvalRequired: e.target.checked })}
                        className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Update Policies
                  </button>
                </form>
              </div>
            )}

            {/* 8. APPROVAL HISTORY */}
            {activeTab === 'approval-history' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <th className="p-4">Employee</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Working Hours</th>
                        <th className="p-4">Review Details</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                      {approvalHistoryList.map((record: any) => (
                        <tr key={record.id} className="hover:bg-gray-50/50">
                          <td className="p-4">
                            <p className="font-bold text-gray-900">{record.user?.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{record.user?.email}</p>
                          </td>
                          <td className="p-4 font-bold">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              record.attendanceType === 'PRESENT' ? 'bg-emerald-100 text-emerald-600' :
                              record.attendanceType === 'WORK_FROM_HOME' ? 'bg-blue-100 text-blue-600' :
                              record.attendanceType === 'HALF_DAY' ? 'bg-amber-100 text-amber-600' :
                              'bg-rose-100 text-rose-600'
                            }`}>
                              {record.attendanceType}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              record.approvalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {record.approvalStatus}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-gray-800">{record.workingHours ?? '—'} hrs</td>
                          <td className="p-4">
                            {record.approvalStatus === 'APPROVED' ? (
                              <div>
                                <p className="font-semibold text-gray-700">Approved by {record.approvedByName || 'System'}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{record.approvedAt ? new Date(record.approvedAt).toLocaleString() : '—'}</p>
                              </div>
                            ) : (
                              <div>
                                <p className="font-semibold text-rose-700">Rejected by {record.rejectedByName || 'System'}</p>
                                {record.rejectedReason && <p className="text-[10px] text-rose-500 mt-1">Reason: {record.rejectedReason}</p>}
                                <p className="text-[10px] text-gray-400 mt-0.5">{record.rejectedAt ? new Date(record.rejectedAt).toLocaleString() : '—'}</p>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedRecordForSummary(record);
                                setShowSummaryViewModal(true);
                              }}
                              className="px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg font-bold transition-colors cursor-pointer"
                            >
                              View Summary
                            </button>
                          </td>
                        </tr>
                      ))}
                      {approvalHistoryList.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-gray-400 font-semibold">
                            No approval/rejection history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 9. ATTENDANCE SCHEDULES */}
            {activeTab === 'schedules' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <th className="p-4">Employee</th>
                        <th className="p-4">Dept / Role</th>
                        <th className="p-4">Shift Timings</th>
                        <th className="p-4">Grace / Late</th>
                        <th className="p-4">Half / Full Hours</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                      {schedulesList.map((emp: any) => {
                        const sched = emp.attendanceSchedule;
                        return (
                          <tr key={emp.id} className="hover:bg-gray-50/50">
                            <td className="p-4">
                              <p className="font-bold text-gray-900">{emp.name}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{emp.email}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-bold">{emp.department?.name || 'No Dept'}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{emp.role?.name || 'No Role'}</p>
                            </td>
                            <td className="p-4">
                              {sched ? (
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold">
                                  {sched.checkInTime} - {sched.checkOutTime}
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-bold">
                                  Workspace Default
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              {sched ? (
                                <div>
                                  <p className="font-semibold text-gray-700">Grace: {sched.gracePeriod} min</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">Late Limit: {sched.lateMarkThreshold}</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="p-4">
                              {sched ? (
                                <div>
                                  <p className="font-semibold text-gray-700">Half Day: {sched.halfDayThreshold} hrs</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">Full Day: {sched.workingHoursRequirement} hrs</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleEditSchedule(emp)}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-bold transition-colors cursor-pointer"
                              >
                                Edit Schedule
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {schedulesList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-gray-400 font-semibold">
                            No employees found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Office Location Modal (Add / Edit) */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative border border-gray-50 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h3 className="text-base font-black text-gray-900">
                  {editingLocation ? 'Edit Office Location' : 'Add Office Location'}
                </h3>
                <button
                  onClick={() => {
                    setShowLocationModal(false);
                    setEditingLocation(null);
                  }}
                  className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleLocationSubmit} className="space-y-4 text-xs text-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Office Name</label>
                    <input
                      type="text"
                      required
                      value={locationForm.officeName}
                      onChange={e => setLocationForm({ ...locationForm, officeName: e.target.value })}
                      placeholder="e.g. Headquarters"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Branch Name</label>
                    <input
                      type="text"
                      value={locationForm.branch}
                      onChange={e => setLocationForm({ ...locationForm, branch: e.target.value })}
                      placeholder="e.g. Main Branch"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={locationForm.latitude}
                      onChange={e => setLocationForm({ ...locationForm, latitude: e.target.value })}
                      placeholder="Latitude"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={locationForm.longitude}
                      onChange={e => setLocationForm({ ...locationForm, longitude: e.target.value })}
                      placeholder="Longitude"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Allowed Radius (meters)</label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={locationForm.radiusMeters}
                    onChange={e =>
                      setLocationForm({ ...locationForm, radiusMeters: parseInt(e.target.value, 10) || 50 })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500"
                  />
                </div>

                {locationForm.latitude && locationForm.longitude ? (
                  <a
                    href={`https://www.google.com/maps?q=${locationForm.latitude},${locationForm.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] hover:underline"
                  >
                    <MapPin size={12} /> Map preview
                  </a>
                ) : null}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-bold text-gray-800 text-[11px]">Active branch</h4>
                    <p className="text-[10px] text-gray-400">Inactive locations are ignored for validation.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={locationForm.isEnabled}
                    onChange={e => setLocationForm({ ...locationForm, isEnabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Save Location
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Attendance Reason Modal */}
      <AnimatePresence>
        {rejectRecordId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-gray-55 space-y-4"
            >
              <div>
                <h3 className="text-base font-black text-gray-900">Mandatory Rejection Reason</h3>
                <p className="text-xs text-gray-400 mt-1">Please provide a validation warning/reason for this rejection. The employee will be notified.</p>
              </div>

              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Reason details..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500 text-gray-700"
              />

              <div className="flex gap-2 justify-end text-xs">
                <button
                  onClick={() => setRejectRecordId(null)}
                  className="px-4 py-2 bg-gray-50 text-gray-500 font-bold rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRejection}
                  className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Check-Out Work Summary Submission Modal */}
      <AnimatePresence>
        {showCheckOutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative border border-gray-50 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <div>
                  <h3 className="text-base font-black text-gray-900">Daily Work Summary</h3>
                  <p className="text-xs text-gray-400 mt-1">Please provide a summary of the work completed today before checking out.</p>
                </div>
                <button
                  onClick={() => setShowCheckOutModal(false)}
                  className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCheckOut} className="space-y-4 text-xs text-gray-700">
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Work Summary (Mandatory)</label>
                  <textarea
                    rows={3}
                    required
                    value={workSummary}
                    onChange={e => setWorkSummary(e.target.value)}
                    placeholder="Provide a detailed description of what you completed today..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500 text-gray-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Today's Achievements (Optional)</label>
                  <textarea
                    rows={2}
                    value={achievements}
                    onChange={e => setAchievements(e.target.value)}
                    placeholder="List any key successes or achievements..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500 text-gray-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Pending Tasks (Optional)</label>
                  <textarea
                    rows={2}
                    value={pendingTasks}
                    onChange={e => setPendingTasks(e.target.value)}
                    placeholder="Tasks that will carry over to the next working day..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500 text-gray-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Challenges Faced (Optional)</label>
                  <textarea
                    rows={2}
                    value={challenges}
                    onChange={e => setChallenges(e.target.value)}
                    placeholder="Mention roadblocks, dependency issues, or challenges..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500 text-gray-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Additional Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={additionalNotes}
                    onChange={e => setAdditionalNotes(e.target.value)}
                    placeholder="Any other comments or feedback..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500 text-gray-700"
                  />
                </div>

                <div className="flex gap-2 justify-end text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCheckOutModal(false)}
                    className="px-4 py-2.5 bg-gray-50 text-gray-500 font-bold rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={checkoutSubmitting}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {checkoutSubmitting ? 'Checking Out...' : 'Submit & Check Out'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Work Summary Modal */}
      <AnimatePresence>
        {showSummaryViewModal && selectedRecordForSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative border border-gray-50 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <div>
                  <h3 className="text-base font-black text-gray-900">Work Summary Details</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted by {selectedRecordForSummary.user?.name || 'Employee'} on{' '}
                    {new Date(selectedRecordForSummary.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowSummaryViewModal(false);
                    setSelectedRecordForSummary(null);
                  }}
                  className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs text-gray-700">
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <h4 className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Work Summary</h4>
                  <p className="whitespace-pre-wrap text-gray-800 font-semibold">{selectedRecordForSummary.workSummary || '—'}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <h4 className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Today's Achievements</h4>
                  <p className="whitespace-pre-wrap text-gray-800">{selectedRecordForSummary.achievements || '—'}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <h4 className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Pending Tasks</h4>
                  <p className="whitespace-pre-wrap text-gray-800">{selectedRecordForSummary.pendingTasks || '—'}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <h4 className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Challenges Faced</h4>
                  <p className="whitespace-pre-wrap text-gray-800">{selectedRecordForSummary.challenges || '—'}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <h4 className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Additional Notes</h4>
                  <p className="whitespace-pre-wrap text-gray-800">{selectedRecordForSummary.additionalNotes || '—'}</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setShowSummaryViewModal(false);
                      setSelectedRecordForSummary(null);
                    }}
                    className="px-5 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clarification Request Modal */}
      <AnimatePresence>
        {showClarificationModal && clarificationRecordId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-gray-50 space-y-4"
            >
              <div>
                <h3 className="text-base font-black text-gray-900">Request Clarification</h3>
                <p className="text-xs text-gray-400 mt-1">Specify what explanation or addition is required. The employee will be prompted to edit and resubmit.</p>
              </div>

              <textarea
                rows={3}
                required
                value={clarificationReason}
                onChange={e => setClarificationReason(e.target.value)}
                placeholder="Details of clarification request..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500 text-gray-700"
              />

              <div className="flex gap-2 justify-end text-xs">
                <button
                  onClick={() => {
                    setShowClarificationModal(false);
                    setClarificationRecordId(null);
                    setClarificationReason('');
                  }}
                  className="px-4 py-2 bg-gray-50 text-gray-500 font-bold rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={submitClarification}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Send Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Custom Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && selectedUserForSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative border border-gray-50 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <div>
                  <h3 className="text-base font-black text-gray-900">Set Timing Schedule</h3>
                  <p className="text-xs text-gray-400 mt-1">Configure custom attendance timing constraints for {selectedUserForSchedule.name}.</p>
                </div>
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setSelectedUserForSchedule(null);
                  }}
                  className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs text-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Check-In Time (HH:MM)</label>
                    <input
                      type="text"
                      required
                      value={scheduleForm.checkInTime}
                      onChange={e => setScheduleForm({ ...scheduleForm, checkInTime: e.target.value })}
                      placeholder="e.g. 09:00"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Check-Out Time (HH:MM)</label>
                    <input
                      type="text"
                      required
                      value={scheduleForm.checkOutTime}
                      onChange={e => setScheduleForm({ ...scheduleForm, checkOutTime: e.target.value })}
                      placeholder="e.g. 18:00"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Grace Period (Minutes)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={scheduleForm.gracePeriod}
                      onChange={e => setScheduleForm({ ...scheduleForm, gracePeriod: parseInt(e.target.value, 10) || 0 })}
                      placeholder="e.g. 15"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Late Mark Threshold (HH:MM)</label>
                    <input
                      type="text"
                      required
                      value={scheduleForm.lateMarkThreshold}
                      onChange={e => setScheduleForm({ ...scheduleForm, lateMarkThreshold: e.target.value })}
                      placeholder="e.g. 09:45"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Half Day Threshold (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      min={1}
                      max={12}
                      value={scheduleForm.halfDayThreshold}
                      onChange={e => setScheduleForm({ ...scheduleForm, halfDayThreshold: parseFloat(e.target.value) || 4.0 })}
                      placeholder="e.g. 4.0"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Full Day Required (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      min={1}
                      max={24}
                      value={scheduleForm.workingHoursRequirement}
                      onChange={e => setScheduleForm({ ...scheduleForm, workingHoursRequirement: parseFloat(e.target.value) || 8.0 })}
                      placeholder="e.g. 8.0"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Save Schedule
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AttendancePage;
