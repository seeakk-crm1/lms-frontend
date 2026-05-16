import type { User } from '../types/user.types';

/** Matches backend `userHasActivatedAccount` — status badge only. */
export const userHasActivatedAccount = (user: User): boolean => {
  if (user.hasPassword === false) return false;
  if (user.isOnboarded === false) return false;
  if (user.hasPassword === true) {
    return user.isActive === true && user.isEmailVerified === true;
  }
  if (user.isOnboarded === true) return true;
  return user.isActive === true && user.isEmailVerified === true;
};

export const userIsDeactivatedFormerMember = (user: User): boolean =>
  user.isEmailVerified === true && user.isActive !== true;

const hasRoleAssignment = (user: User): boolean => {
  const directRoleId = (user as { roleId?: string }).roleId;
  if (directRoleId && String(directRoleId).trim().length > 0) return true;

  if (user.role && typeof user.role === 'object' && !Array.isArray(user.role)) {
    if (user.role.id && String(user.role.id).trim().length > 0) return true;
    if (user.role.name && String(user.role.name).trim().length > 0) return true;
  }

  if (user.role && typeof user.role === 'string' && String(user.role).trim().length > 0) return true;
  return false;
};

/** Status badge: pending onboarding. */
export const userIsInvitePending = (user: User): boolean => {
  if (userIsDeactivatedFormerMember(user)) return false;
  if (!hasRoleAssignment(user)) return false;
  return !userHasActivatedAccount(user);
};

export type InviteActionState =
  | { kind: 'SEND'; label: string; title: string }
  | { kind: 'RESEND'; label: string; title: string; inviteId: string };

/** Mail icon — always available; copies access link (no active-account gate). */
export const getInviteActionState = (
  _user: User,
  options: { hasPendingInvite: boolean; pendingInviteId?: string | null },
): InviteActionState => {
  if (options.hasPendingInvite && options.pendingInviteId) {
    return {
      kind: 'RESEND',
      label: 'Copy access link',
      title: 'Refresh access link and copy to clipboard',
      inviteId: options.pendingInviteId,
    };
  }

  return {
    kind: 'SEND',
    label: 'Copy access link',
    title: 'Generate access link and copy to clipboard',
  };
};

/** Status badge for the users table. */
export const getUserActivationStatus = (
  user: User,
): { label: string; tone: 'active' | 'inactive' | 'pending' } => {
  if (userIsInvitePending(user)) {
    return { label: 'Pending invite', tone: 'pending' };
  }
  if (user.isActive) {
    return { label: 'Active', tone: 'active' };
  }
  return { label: 'Inactive', tone: 'inactive' };
};
