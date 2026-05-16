import { User } from '../types/user.types';

const normalizeRoleName = (role: User['role'] | undefined | null): string =>
  String(typeof role === 'object' && role !== null ? role.name || '' : role || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

export const getPermissionSet = (permissions: unknown): Set<string> => {
  if (!Array.isArray(permissions)) return new Set();
  return new Set(permissions.map((permission) => String(permission)));
};

export const isSuperAdmin = (user?: User | null): boolean => normalizeRoleName(user?.role) === 'superadmin';

export const hasPermission = (
  user: User | null | undefined,
  permissionKey: string,
  options?: { allowSuperAdmin?: boolean },
): boolean => {
  if (!user) return false;
  if (options?.allowSuperAdmin !== false && isSuperAdmin(user)) return true;
  return getPermissionSet(user.permissions).has(permissionKey);
};

export const hasAnyPermission = (
  user: User | null | undefined,
  permissionKeys: string[],
  options?: { allowSuperAdmin?: boolean },
): boolean => {
  if (!user) return false;
  if (options?.allowSuperAdmin !== false && isSuperAdmin(user)) return true;
  const permissions = getPermissionSet(user.permissions);
  return permissionKeys.some((permissionKey) => permissions.has(permissionKey));
};

export const hasAllPermissions = (
  user: User | null | undefined,
  permissionKeys: string[],
  options?: { allowSuperAdmin?: boolean },
): boolean => {
  if (!user) return false;
  if (options?.allowSuperAdmin !== false && isSuperAdmin(user)) return true;
  const permissions = getPermissionSet(user.permissions);
  return permissionKeys.every((permissionKey) => permissions.has(permissionKey));
};

export const getPrimaryRoleName = (user?: User | null): string => {
  if (typeof user?.role === 'object' && user.role !== null) {
    const name = user.role.name?.trim();
    return name || 'Member';
  }
  if (typeof user?.role === 'string' && user.role.trim()) return user.role.trim();
  return 'Member';
};

/**
 * Determines the best landing page for a user based on their permissions and onboarding status.
 */
export const getLandingPage = (user?: User | null): string => {
  if (!user) return '/login';
  if (!user.isOnboarded) return '/workspace/setup';

  // Super Admins or users who can manage core system data but don't handle leads land on User Management.
  if (
    isSuperAdmin(user) ||
    (hasPermission(user, 'USERS_VIEW') &&
      !hasAnyPermission(user, [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'LEADS_CREATE',
        'REPORTS_VIEW',
      ]))
  ) {
    return '/admin/users';
  }

  // Default landing for everyone else (Operations, Managers, Sales).
  return '/dashboard';
};
