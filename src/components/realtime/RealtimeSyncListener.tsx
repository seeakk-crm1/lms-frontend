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
  void state.fetchDashboardData(state.selectedRange);
};

const RealtimeSyncListener = () => {
  const workflowEnabled = useAuthenticatedWorkflowEnabled();
  const userId = useAuthStore((state) => state.user?.id);
  const { blocked: overdueBlocked, query: overdueQuery } = useOverdueMandatoryBlocked();
  const { blocked: lifecycleBlocked, query: lifecycleQuery } = useMandatoryFollowUpBlocked();
  const followUpLockActive =
    overdueBlocked ||
    lifecycleBlocked ||
    overdueQuery.isLoading ||
    overdueQuery.isPending ||
    lifecycleQuery.isLoading ||
    lifecycleQuery.isPending;

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
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead'] });
      queryClient.invalidateQueries({ queryKey: ['lead-meta'] });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['followups', 'mandatory-continuation'] });
      queryClient.invalidateQueries({ queryKey: ['lead-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['closed-leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
    socket.on('report_updated', onReportUpdated);
    socket.on('attendance_updated', onAttendanceUpdated);

    return () => {
      socket.off('role_updated', onRoleUpdated);
      socket.off('permissions_updated', onPermissionsUpdated);
      socket.off('user_updated', onUserUpdated);
      socket.off('lead_updated', onLeadUpdated);
      socket.off('report_updated', onReportUpdated);
      socket.off('attendance_updated', onAttendanceUpdated);
    };
  }, [followUpLockActive, workflowEnabled, userId]);

  return null;
};

export default RealtimeSyncListener;
