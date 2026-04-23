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
