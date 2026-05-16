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

/** Matches backend `userHasActivatedAccount`. */
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

/** Matches backend `userIsInvitePending` — used for status badges. */
export const userIsInvitePending = (user: User): boolean => {
  if (userIsDeactivatedFormerMember(user)) return false;
  if (!hasRoleAssignment(user)) return false;
  return !userHasActivatedAccount(user);
};

/** Any user with a role may receive an invite; backend reprovisions active accounts when needed. */
export const canSendWorkspaceInvite = (user: User): boolean => {
  if (userIsDeactivatedFormerMember(user)) return false;
  return hasRoleAssignment(user);
};

export type InviteActionState =
  | { kind: 'SEND'; label: string; title: string }
  | { kind: 'RESEND'; label: string; title: string; inviteId: string }
  | { kind: 'HIDDEN'; label: string; title: string };

export const getInviteActionState = (
  user: User,
  options: { hasPendingInvite: boolean; pendingInviteId?: string | null },
): InviteActionState => {
  if (options.hasPendingInvite && options.pendingInviteId) {
    return {
      kind: 'RESEND',
      label: 'Resend Invite',
      title: 'Resend the current pending invite.',
      inviteId: options.pendingInviteId,
    };
  }

  if (!hasRoleAssignment(user)) {
    return {
      kind: 'HIDDEN',
      label: 'Unavailable',
      title: 'Assign a role before sending an invite.',
    };
  }

  if (userIsDeactivatedFormerMember(user)) {
    return {
      kind: 'HIDDEN',
      label: 'Deactivated',
      title: 'Reactivate this account or reset password instead of sending an invite.',
    };
  }

  if (canSendWorkspaceInvite(user)) {
    return {
      kind: 'SEND',
      label: userHasActivatedAccount(user) ? 'Re-invite' : 'Send Invite',
      title: userHasActivatedAccount(user)
        ? 'Send a new invitation email. They will set a fresh password when accepting.'
        : 'Send an onboarding invite to this user.',
    };
  }

  return {
    kind: 'HIDDEN',
    label: 'Unavailable',
    title: 'Invitation is not available for this user.',
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
