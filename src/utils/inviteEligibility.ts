import type { User } from '../types/user.types';

const hasRoleAssignment = (user: User): boolean => {
  const directRoleId = (user as { roleId?: string }).roleId;
  if (directRoleId && String(directRoleId).trim().length > 0) return true;

  if (user.role && typeof user.role === 'object' && !Array.isArray(user.role)) {
    const nestedRoleId = user.role.id;
    const nestedRoleName = user.role.name;
    if (nestedRoleId && String(nestedRoleId).trim().length > 0) return true;
    if (nestedRoleName && String(nestedRoleName).trim().length > 0) return true;
  }

  if (user.role && typeof user.role === 'string' && String(user.role).trim().length > 0) return true;
  return false;
};

/** Matches backend `userIsInvitePending` — inactive, unverified, with a role. */
export const userIsInvitePending = (user: User): boolean => {
  if (user.isActive === true) return false;
  if (user.isEmailVerified === true) return false;
  return hasRoleAssignment(user);
};

export const canSendWorkspaceInvite = (user: User): boolean => userIsInvitePending(user);
