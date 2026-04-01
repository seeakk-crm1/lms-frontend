import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Productivity from './components/Productivity';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';

import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkspaceSetup from './pages/WorkspaceSetup';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminRolesPage from './pages/AdminRolesPage';
import AdminDepartmentsPage from './pages/AdminDepartmentsPage';
import LeadSourceListPage from './pages/LeadSourceListPage';
import LeadStagesListPage from './pages/LeadStagesListPage';
import StageRulesListPage from './pages/StageRulesListPage';
import OrganisationChartPage from './modules/admin/organisation-chart/OrganisationChartPage';
import RosterPage from './modules/admin/roster/RosterPage';
import TargetCyclePage from './modules/admin/target-cycle/TargetCyclePage';
import LeadDynamicsPage from './modules/admin/lead-dynamics/LeadDynamicsPage';
import OfficePage from './pages/admin/office/OfficePage';
import LeadLifeCyclePage from './pages/admin/lead-life-cycle/LeadLifeCyclePage';
import CalendarPage from './pages/calendar/CalendarPage';
import TodayFollowUps from './pages/calendar/TodayFollowUps';
import LeadsPage from './pages/leads/LeadsPage';

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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

      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-white font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
            <Navbar />
            <main>
              <Hero />
              <Features />
              <Productivity />
              <Pricing />
              <Testimonials />
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

        <Route path="/workspace/setup" element={
          <OnboardingRoute>
            <WorkspaceSetup />
          </OnboardingRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute>
            <AdminUsersPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/roles" element={
          <ProtectedRoute>
            <AdminRolesPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/departments" element={
          <ProtectedRoute>
            <AdminDepartmentsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/lead-source" element={
          <ProtectedRoute>
            <LeadSourceListPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/lead-stages" element={
          <ProtectedRoute>
            <LeadStagesListPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/stage-rules" element={
          <ProtectedRoute>
            <StageRulesListPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/organisation-chart" element={
          <ProtectedRoute>
            <OrganisationChartPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/roster" element={
          <ProtectedRoute>
            <RosterPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/target-cycles" element={
          <ProtectedRoute>
            <TargetCyclePage />
          </ProtectedRoute>
        } />

        <Route path="/admin/lead-dynamics" element={
          <ProtectedRoute>
            <LeadDynamicsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/offices" element={
          <ProtectedRoute>
            <OfficePage />
          </ProtectedRoute>
        } />

        <Route path="/admin/lead-life-cycles" element={
          <ProtectedRoute>
            <LeadLifeCyclePage />
          </ProtectedRoute>
        } />

        <Route path="/calendar" element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        } />

        <Route path="/calendar/today" element={
          <ProtectedRoute>
            <TodayFollowUps />
          </ProtectedRoute>
        } />

        <Route path="/leads" element={
          <ProtectedRoute>
            <LeadsPage />
          </ProtectedRoute>
        } />

        <Route path="/master/stage-rules" element={<Navigate to="/admin/stage-rules" replace />} />
      </Routes>
    </>
  );
}

export default App;
