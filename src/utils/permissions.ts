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

export const getPrimaryRoleName = (user?: User | null): string =>
  typeof user?.role === 'object' && user.role !== null ? user.role.name || 'Administrator' : String(user?.role || 'Administrator');

