import type { User } from '../types/user.types';
import { hasAnyPermission, isSuperAdmin } from './permissions';

export const canUseOfficeFilter = (user?: User | null): boolean =>
  isSuperAdmin(user) ||
  hasAnyPermission(user, [
    'SYSTEM_CONFIG',
    'LEADS_VIEW_ALL',
    'USERS_VIEW',
    'REPORTS_VIEW',
    'REPORTS_GENERATE',
    'LOB_ANALYSIS_VIEW',
    'DASHBOARD_VIEW_OWN',
    'DASHBOARD_VIEW_ASSIGNED',
    'DASHBOARD_VIEW_ALL',
    'DASHBOARD_VIEW_OWN_OFFICE',
    'DASHBOARD_VIEW_ASSIGNED_OFFICES',
    'DASHBOARD_VIEW_ALL_OFFICES',
  ]);
