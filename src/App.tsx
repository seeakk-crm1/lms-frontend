import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import AccountabilityHook from './components/AccountabilityHook';
import WhySeeakk from './components/WhySeeakk';
import AttendanceSection from './components/AttendanceSection';
import TargetLockingSection from './components/TargetLockingSection';
import Productivity from './components/Productivity';
import Pricing from './components/Pricing';
import CTA from './components/CTA';
import Footer from './components/Footer';

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';
import { hasAnyPermission, canAccessPendingApproval } from './utils/permission.util';
import api, { handleSessionExpired } from './services/api';
import { queryClient } from './lib/queryClient';
import FollowUpReminderListener from './components/calendar/FollowUpReminderListener';
import AuthenticatedWorkflowGates from './components/AuthenticatedWorkflowGates';
import RealtimeSyncListener from './components/realtime/RealtimeSyncListener';
import LocationTrackingClient from './components/location/LocationTrackingClient';
import { shouldRunAuthenticatedWorkflow } from './utils/publicRoutes';
import Login from './pages/Login';
import InvitePage from './pages/InvitePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardRouter from './components/dashboard/DashboardRouter';
import WorkspaceSetup from './pages/WorkspaceSetup';
import AdminUsersPage from './pages/AdminUsersPage';
import UnlockStaffPage from './pages/admin/UnlockStaffPage';
import AdminRolesPage from './pages/AdminRolesPage';
import AdminDepartmentsPage from './pages/AdminDepartmentsPage';
import LeadSourceListPage from './pages/LeadSourceListPage';
import ProductListPage from './pages/ProductListPage';
import LeadStagesListPage from './pages/LeadStagesListPage';
import StageRulesListPage from './pages/StageRulesListPage';
import OrganisationChartPage from './modules/admin/organisation-chart/OrganisationChartPage';
import RosterPage from './modules/admin/roster/RosterPage';
import TargetCyclePage from './modules/admin/target-cycle/TargetCyclePage';
import LeadDynamicsPage from './modules/admin/lead-dynamics/LeadDynamicsPage';
import OfficePage from './pages/admin/office/OfficePage';
import LeadLifeCyclePage from './pages/admin/lead-life-cycle/LeadLifeCyclePage';
import HolidayPage from './pages/admin/holidays/HolidayPage';
import CalendarPage from './pages/calendar/CalendarPage';
import TodayFollowUps from './pages/calendar/TodayFollowUps';
import LeadsPage from './pages/leads/LeadsPage';
import ClosedLeadsPage from './pages/leads/ClosedLeadsPage';
import LeadImportPage from './pages/leads/import/LeadImportPage';
import BulkAssignPage from './pages/leads/BulkAssignPage';
import FollowUpSettingsPage from './pages/leads/FollowUpSettingsPage';
import PendingApprovalPage from './pages/admin/PendingApprovalPage';
import LOBAnalysisPage from './modules/lob-analysis/LOBAnalysisPage';
import ActivityReportsPage from './modules/reports/pages/ActivityReportsPage';
import ManagementSummaryPage from './modules/reports/pages/ManagementSummaryPage';
import RevenueReportsPage from './modules/reports/pages/RevenueReportsPage';
import LeadReportsPage from './modules/reports/pages/LeadReportsPage';
import FollowupReportsPage from './modules/reports/pages/FollowupReportsPage';
import AttendanceReportsPage from './modules/reports/pages/AttendanceReportsPage';
import ExportCenterPage from './modules/reports/pages/ExportCenterPage';
import LOBReasonsPage from './modules/lob-reasons/pages/LOBReasonsPage';
import FollowUpExtensionReasonsPage from './modules/followup-extension-reasons/pages/FollowUpExtensionReasonsPage';
import AttendancePage from './pages/attendance/AttendancePage';
import LocationTrackerPage from './pages/location/LocationTrackerPage';
import SheetsPage from './pages/sheets/SheetsPage';

interface RouteProps {
  children: ReactNode;
}

// Protect routes that require login AND onboarding
const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !user.isOnboarded) return <Navigate to="/workspace/setup" replace />;
  return <>{children}</>;
};

// Protect routes that require specific permissions
const PermissionRoute: React.FC<RouteProps & { permissions: string[] }> = ({ children, permissions }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !user.isOnboarded) return <Navigate to="/workspace/setup" replace />;
  if (!hasAnyPermission(user?.permissions || [], permissions)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Protect pending approval routes
const PendingApprovalRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !user.isOnboarded) return <Navigate to="/workspace/setup" replace />;
  if (!canAccessPendingApproval(user?.permissions || [])) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Protect routes that require login but ONLY IF they aren't onboarded yet
const OnboardingRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && user.isOnboarded) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Protect login page from authenticated users
const PublicRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user?.isOnboarded) return <Navigate to="/dashboard" replace />;
  if (isAuthenticated && !user?.isOnboarded) return <Navigate to="/workspace/setup" replace />;
  return <>{children}</>;
};

function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isOnboarded = useAuthStore((state) => state.user?.isOnboarded);
  const updateUser = useAuthStore((state) => state.updateUser);
  const workflowEnabled = shouldRunAuthenticatedWorkflow(
    isAuthenticated,
    isOnboarded,
    location.pathname,
  );

  useEffect(() => {
    if (!workflowEnabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    api
      .get('/auth/me')
      .then((response) => {
        if (cancelled || !response.data?.user) return;
        updateUser(response.data.user);
        const session = response.data?.session;
        if (session?.mandatoryFollowupRequired) {
          useAuthStore.getState().setMandatoryFollowupBlock(true, session.mandatoryFollowupCount ?? 0);
          void queryClient.invalidateQueries({ queryKey: ['followups', 'mandatory-continuation'] });
        } else {
          useAuthStore.getState().clearMandatoryFollowupBlock();
        }
      })
      .catch((error) => {
        if (cancelled) return;
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          handleSessionExpired();
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [updateUser, workflowEnabled]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'text-sm font-bold',
          style: {
            borderRadius: '16px',
            background: '#ffffff',
            color: '#111827',
            padding: '12px 24px',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-emerald-500 font-bold tracking-widest uppercase text-sm animate-pulse">
                Loading Workspace
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthenticatedWorkflowGates>
      {workflowEnabled ? <FollowUpReminderListener /> : null}
      {workflowEnabled ? <RealtimeSyncListener /> : null}
      {workflowEnabled ? <LocationTrackingClient /> : null}
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-white font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
            <Navbar />
            <main>
              <Hero />
              <AccountabilityHook />
              <Features />
              <WhySeeakk />
              <AttendanceSection />
              <TargetLockingSection />
              <Productivity />
              <Pricing />
              <CTA />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/login/dashboard" element={<Navigate to="/login" replace />} />

        <Route path="/activate-account" element={<InvitePage />} />
        <Route path="/invite" element={<InvitePage />} />
        <Route path="/invite/accept" element={<InvitePage />} />

        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/workspace/setup" element={
          <OnboardingRoute>
            <WorkspaceSetup />
          </OnboardingRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <PermissionRoute permissions={['USERS_VIEW']}>
            <AdminUsersPage />
          </PermissionRoute>
        } />

        <Route path="/unlock-staff" element={
          <PermissionRoute permissions={['USERS_UNLOCK', 'unlock_target_locked_users', 'SYSTEM_CONFIG']}>
            <UnlockStaffPage />
          </PermissionRoute>
        } />

        <Route path="/admin/roles" element={
          <PermissionRoute permissions={['ROLES_VIEW']}>
            <AdminRolesPage />
          </PermissionRoute>
        } />

        <Route path="/admin/departments" element={
          <PermissionRoute permissions={['DEPARTMENTS_VIEW']}>
            <AdminDepartmentsPage />
          </PermissionRoute>
        } />

        <Route path="/admin/lead-source" element={
          <PermissionRoute permissions={['LEAD_SOURCES_VIEW', 'SYSTEM_CONFIG']}>
            <LeadSourceListPage />
          </PermissionRoute>
        } />
        <Route path="/admin/products" element={
          <PermissionRoute permissions={['PRODUCTS_VIEW', 'SYSTEM_CONFIG']}>
            <ProductListPage />
          </PermissionRoute>
        } />

        <Route path="/admin/lead-stages" element={
          <PermissionRoute permissions={['LEAD_STAGES_VIEW', 'SYSTEM_CONFIG']}>
            <LeadStagesListPage />
          </PermissionRoute>
        } />

        <Route path="/admin/stage-rules" element={
          <PermissionRoute permissions={['LEAD_STAGE_RULES_VIEW', 'SYSTEM_CONFIG']}>
            <StageRulesListPage />
          </PermissionRoute>
        } />

        <Route path="/admin/organisation-chart" element={
          <PermissionRoute permissions={['USERS_VIEW', 'DEPARTMENTS_VIEW']}>
            <OrganisationChartPage />
          </PermissionRoute>
        } />

        <Route path="/admin/roster" element={
          <PermissionRoute permissions={['USERS_VIEW', 'SYSTEM_CONFIG']}>
            <RosterPage />
          </PermissionRoute>
        } />

        <Route path="/admin/target-cycles" element={
          <PermissionRoute permissions={['TARGET_CYCLES_VIEW', 'SYSTEM_CONFIG']}>
            <TargetCyclePage />
          </PermissionRoute>
        } />

        <Route path="/admin/lead-dynamics" element={
          <PermissionRoute permissions={['LEAD_DYNAMICS_VIEW', 'SYSTEM_CONFIG']}>
            <LeadDynamicsPage />
          </PermissionRoute>
        } />

        <Route path="/admin/offices" element={
          <PermissionRoute permissions={['SYSTEM_CONFIG']}>
            <OfficePage />
          </PermissionRoute>
        } />

        <Route path="/admin/lead-life-cycles" element={
          <PermissionRoute permissions={['SYSTEM_CONFIG']}>
            <LeadLifeCyclePage />
          </PermissionRoute>
        } />

        <Route path="/calendar" element={
          <PermissionRoute permissions={['LEADS_VIEW_ALL', 'LEADS_VIEW_OWN', 'LEADS_VIEW_TEAM', 'SYSTEM_CONFIG']}>
            <CalendarPage />
          </PermissionRoute>
        } />

        <Route path="/calendar/today" element={
          <PermissionRoute permissions={['LEADS_VIEW_ALL', 'LEADS_VIEW_OWN', 'LEADS_VIEW_TEAM', 'SYSTEM_CONFIG']}>
            <TodayFollowUps />
          </PermissionRoute>
        } />

        <Route path="/admin/holidays" element={
          <PermissionRoute permissions={['SYSTEM_CONFIG']}>
            <HolidayPage />
          </PermissionRoute>
        } />

        <Route path="/reports" element={<Navigate to="/reports/activity" replace />} />
        <Route path="/reports/activity" element={
          <PermissionRoute permissions={['REPORTS_VIEW', 'REPORTS_GENERATE']}>
            <ActivityReportsPage />
          </PermissionRoute>
        } />
        <Route path="/reports/summary" element={
          <PermissionRoute permissions={['REPORTS_VIEW', 'REPORTS_GENERATE']}>
            <ManagementSummaryPage />
          </PermissionRoute>
        } />
        <Route path="/reports/revenue" element={
          <PermissionRoute permissions={['REPORTS_VIEW', 'REPORTS_GENERATE']}>
            <RevenueReportsPage />
          </PermissionRoute>
        } />
        <Route path="/reports/leads" element={
          <PermissionRoute permissions={['REPORTS_VIEW', 'REPORTS_GENERATE']}>
            <LeadReportsPage />
          </PermissionRoute>
        } />
        <Route path="/reports/followups" element={
          <PermissionRoute permissions={['REPORTS_VIEW', 'REPORTS_GENERATE']}>
            <FollowupReportsPage />
          </PermissionRoute>
        } />
        <Route path="/reports/attendance" element={
          <PermissionRoute permissions={['REPORTS_VIEW', 'REPORTS_GENERATE']}>
            <AttendanceReportsPage />
          </PermissionRoute>
        } />
        <Route path="/reports/export" element={
          <PermissionRoute permissions={['REPORTS_VIEW', 'REPORTS_GENERATE']}>
            <ExportCenterPage />
          </PermissionRoute>
        } />
        <Route path="/reports/download" element={<Navigate to="/reports/export" replace />} />
        <Route path="/reports/types" element={<Navigate to="/reports/activity" replace />} />
        <Route path="/admin/report-types" element={<Navigate to="/reports/activity" replace />} />

        <Route path="/admin/lob-reasons" element={
          <PermissionRoute permissions={['LOB_REASONS_VIEW', 'SYSTEM_CONFIG']}>
            <LOBReasonsPage />
          </PermissionRoute>
        } />

        <Route path="/admin/followup-extension-reasons" element={
          <PermissionRoute permissions={['view_followup_extension_reasons', 'SYSTEM_CONFIG']}>
            <FollowUpExtensionReasonsPage />
          </PermissionRoute>
        } />

        <Route path="/lob-analysis" element={
          <PermissionRoute permissions={['LOB_ANALYSIS_VIEW']}>
            <LOBAnalysisPage />
          </PermissionRoute>
        } />

        <Route path="/sheets" element={
          <PermissionRoute permissions={['SHEETS_VIEW']}>
            <SheetsPage />
          </PermissionRoute>
        } />

        <Route path="/leads" element={
          <PermissionRoute permissions={['LEADS_VIEW_ALL', 'LEADS_VIEW_OWN', 'LEADS_VIEW_TEAM', 'LEADS_CREATE']}>
            <LeadsPage />
          </PermissionRoute>
        } />

        <Route path="/leads/import" element={
          <PermissionRoute permissions={['LEADS_CREATE']}>
            <LeadImportPage />
          </PermissionRoute>
        } />

        <Route path="/leads/closed" element={
          <PermissionRoute permissions={['LEADS_CLOSE', 'LEADS_REOPEN', 'LEADS_VIEW_ALL', 'LEADS_VIEW_OWN', 'LEADS_VIEW_TEAM']}>
            <ClosedLeadsPage />
          </PermissionRoute>
        } />

        <Route path="/leads/bulk-assign" element={
          <PermissionRoute permissions={['LEADS_BULK_ASSIGN', 'LEADS_ASSIGN']}>
            <BulkAssignPage />
          </PermissionRoute>
        } />

        <Route path="/leads/settings" element={
          <PermissionRoute
            permissions={['manage_followup_settings', 'view_followup_capacity', 'bulk_extend_followups']}
          >
            <FollowUpSettingsPage />
          </PermissionRoute>
        } />

        <Route path="/leads/pending-approval" element={
          <PendingApprovalRoute>
            <PendingApprovalPage />
          </PendingApprovalRoute>
        } />


        <Route path="/attendance" element={
          <PermissionRoute permissions={['view_attendance', 'mark_attendance']}>
            <AttendancePage />
          </PermissionRoute>
        } />

        <Route path="/location-tracker" element={
          <PermissionRoute
            permissions={[
              'LOCATION_TRACKING_VIEW_LIVE',
              'LOCATION_TRACKING_VIEW_HISTORY',
              'LOCATION_TRACKING_REPLAY',
              'LOCATION_TRACKING_VIEW_ALL',
              'LOCATION_TRACKING_VIEW_ASSIGNED',
              'SYSTEM_CONFIG',
            ]}
          >
            <LocationTrackerPage />
          </PermissionRoute>
        } />

        <Route path="/master/stage-rules" element={<Navigate to="/admin/stage-rules" replace />} />
      </Routes>
      </AuthenticatedWorkflowGates>
    </>
  );
}

export default App;
