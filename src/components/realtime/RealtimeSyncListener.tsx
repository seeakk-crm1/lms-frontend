import { useEffect } from 'react';
import api from '../../services/api';
import { queryClient } from '../../lib/queryClient';
import { connectRealtime, disconnectRealtime } from '../../services/realtime';
import useAuthStore from '../../store/useAuthStore';
import { useAuthenticatedWorkflowEnabled } from '../../hooks/useAuthenticatedWorkflowEnabled';
import { useOverdueMandatoryBlocked } from '../../hooks/useOverdueMandatoryFollowUps';
import { useMandatoryFollowUpBlocked } from '../../hooks/useMandatoryFollowUpBlocked';
import useDashboardStore from '../../store/useDashboardStore';
import { dispatchAttendanceRefresh } from '../../utils/attendanceRefresh';

let dashboardRefreshTimer: ReturnType<typeof setTimeout> | null = null;

const refreshAuthenticatedUser = async (): Promise<void> => {
  const { updateUser, clearAuth } = useAuthStore.getState();
  try {
    const response = await api.get('/auth/me');
    if (response.data?.user) {
      updateUser(response.data.user);
    }
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      clearAuth();
    }
  }
};

const invalidatePermissionBoundQueries = (): void => {
  queryClient.invalidateQueries({ queryKey: ['roles'] });
  queryClient.invalidateQueries({ queryKey: ['role'] });
  queryClient.invalidateQueries({ queryKey: ['permissions'] });
  queryClient.invalidateQueries({ queryKey: ['users'] });
  queryClient.invalidateQueries({ queryKey: ['user'] });
  queryClient.invalidateQueries({ queryKey: ['departments'] });
  queryClient.invalidateQueries({ queryKey: ['supervisors'] });
  queryClient.invalidateQueries({ queryKey: ['offices'] });
  queryClient.invalidateQueries({ queryKey: ['locations-tree'] });
  queryClient.invalidateQueries({ queryKey: ['locations-all'] });
  queryClient.invalidateQueries({ queryKey: ['target-types'] });
  queryClient.invalidateQueries({ queryKey: ['user-targets'] });
};

const refetchDashboardIfLoaded = (): void => {
  const state = useDashboardStore.getState();
  if (state.kpiData.length === 0) return;

  if (dashboardRefreshTimer) {
    clearTimeout(dashboardRefreshTimer);
  }

  dashboardRefreshTimer = setTimeout(() => {
    dashboardRefreshTimer = null;
    const latestState = useDashboardStore.getState();
    if (latestState.kpiData.length === 0) return;
    void latestState.fetchDashboardData();
  }, 300);
};

const RealtimeSyncListener = () => {
  const workflowEnabled = useAuthenticatedWorkflowEnabled();
  const userId = useAuthStore((state) => state.user?.id);
  const { blocked: overdueBlocked, query: overdueQuery } = useOverdueMandatoryBlocked();
  const { blocked: lifecycleBlocked, query: lifecycleQuery } = useMandatoryFollowUpBlocked();
  const followUpLockActive = false; // Intentionally disabled to prevent socket reconnect thrashing

  useEffect(() => {
    if (!workflowEnabled || !userId || followUpLockActive) {
      disconnectRealtime();
      return;
    }

    const socket = connectRealtime();
    if (!socket) {
      return;
    }

    const onRoleUpdated = () => {
      invalidatePermissionBoundQueries();
      refetchDashboardIfLoaded();
      void refreshAuthenticatedUser();
    };

    const onPermissionsUpdated = () => {
      invalidatePermissionBoundQueries();
      refetchDashboardIfLoaded();
      void refreshAuthenticatedUser();
    };

    const onUserUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      refetchDashboardIfLoaded();
      void refreshAuthenticatedUser();
    };

    const onLeadUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['leads'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['lead'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['lead-meta'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['followups'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['followups', 'mandatory-continuation'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['lead-approvals'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['closed-leads'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-header'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['lob-analysis'], refetchType: 'all' });
      refetchDashboardIfLoaded();
    };

    const onReportUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      queryClient.invalidateQueries({ queryKey: ['report-types'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      refetchDashboardIfLoaded();
    };

    const onAttendanceUpdated = () => {
      dispatchAttendanceRefresh({ action: 'realtime' });
    };

    socket.on('role_updated', onRoleUpdated);
    socket.on('permissions_updated', onPermissionsUpdated);
    socket.on('user_updated', onUserUpdated);
    socket.on('lead_updated', onLeadUpdated);
    socket.on('approval_updated', onLeadUpdated);
    socket.on('report_updated', onReportUpdated);
    socket.on('attendance_updated', onAttendanceUpdated);

    return () => {
      socket.off('role_updated', onRoleUpdated);
      socket.off('permissions_updated', onPermissionsUpdated);
      socket.off('user_updated', onUserUpdated);
      socket.off('lead_updated', onLeadUpdated);
      socket.off('approval_updated', onLeadUpdated);
      socket.off('report_updated', onReportUpdated);
      socket.off('attendance_updated', onAttendanceUpdated);
    };
  }, [workflowEnabled, userId]);

  return null;
};

export default RealtimeSyncListener;
