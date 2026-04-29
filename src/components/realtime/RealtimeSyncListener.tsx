import { useEffect } from 'react';
import api from '../../services/api';
import { queryClient } from '../../lib/queryClient';
import { connectRealtime, disconnectRealtime } from '../../services/realtime';
import useAuthStore from '../../store/useAuthStore';
import useDashboardStore from '../../store/useDashboardStore';

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

const RealtimeSyncListener: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectRealtime();
      return;
    }

    const socket = connectRealtime(accessToken);
    const onConnect = () => {
      console.log('[Socket.io] Connected successfully');
    };
    const onConnectError = (err: any) => {
      const message = String(err?.message || '').toLowerCase();
      console.warn('[Socket.io] Connection error:', err?.message || String(err));
      if (
        message.includes('unauthorized') ||
        message.includes('token') ||
        message.includes('authentication') ||
        message.includes('jwt')
      ) {
        console.warn('[Socket.io] Auth failed - clearing session');
        useAuthStore.getState().clearAuth();
      }
    };
    const onDisconnect = (reason: string) => {
      console.log('[Socket.io] Disconnected:', reason);
      if (reason === 'io server disconnect') {
        console.warn('[Socket.io] Server forced disconnect');
      }
    };
    const onReconnect = (attemptNumber: number) => {
      console.log('[Socket.io] Reconnected after', attemptNumber, 'attempts');
    };
    const onReconnectError = (err: any) => {
      console.warn('[Socket.io] Reconnect error:', err?.message || String(err));
    };
    const onReconnectFailed = () => {
      console.error('[Socket.io] All reconnect attempts failed');
    };

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

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect', onReconnect);
    socket.on('reconnect_error', onReconnectError);
    socket.on('reconnect_failed', onReconnectFailed);
    socket.on('role_updated', onRoleUpdated);
    socket.on('permissions_updated', onPermissionsUpdated);
    socket.on('user_updated', onUserUpdated);
    socket.on('lead_updated', onLeadUpdated);
    socket.on('report_updated', onReportUpdated);

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect', onReconnect);
      socket.off('reconnect_error', onReconnectError);
      socket.off('reconnect_failed', onReconnectFailed);
      socket.off('role_updated', onRoleUpdated);
      socket.off('permissions_updated', onPermissionsUpdated);
      socket.off('user_updated', onUserUpdated);
      socket.off('lead_updated', onLeadUpdated);
      socket.off('report_updated', onReportUpdated);
    };
  }, [accessToken, isAuthenticated]);

  return null;
};

export default RealtimeSyncListener;
