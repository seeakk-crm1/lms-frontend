export const hasPermission = (permissions: string[] = [], key: string) => {
  if (!permissions) return false;
  if (permissions.includes("SUPERADMIN")) return true;
  return permissions.includes(key);
};

export const hasAnyPermission = (permissions: string[] = [], keys: string[]) => {
  return keys.some(k => hasPermission(permissions, k));
};

export const hasAllPermissions = (permissions: string[] = [], keys: string[]) => {
  return keys.every(k => hasPermission(permissions, k));
};

export const canAccessPendingApproval = (permissions: string[] = []) => {
  return hasPermission(permissions, 'LEAD_APPROVAL_VIEW');
};

export const FOLLOW_UP_SETTINGS_ROUTE_PERMISSIONS = [
  'manage_followup_settings',
  'view_followup_capacity',
  'bulk_extend_followups',
] as const;

export const canAccessFollowUpSettings = (permissions: string[] = []) =>
  hasAnyPermission(permissions, [...FOLLOW_UP_SETTINGS_ROUTE_PERMISSIONS]);

export const canManageFollowUpSettings = (permissions: string[] = []) =>
  hasPermission(permissions, 'manage_followup_settings');

export const canGrantBulkExtensionAccess = (permissions: string[] = []) =>
  hasPermission(permissions, 'grant_bulk_extension_access');

export const canUseBulkFollowUpExtension = (permissions: string[] = []) =>
  hasPermission(permissions, 'bulk_extend_followups');

