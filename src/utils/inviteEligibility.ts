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
  if (user.isOnboarded === true) return true;
  if (user.isOnboarded === false) return false;
  return user.isActive === true && user.isEmailVerified === true;
};

export const userIsDeactivatedFormerMember = (user: User): boolean =>
  user.isEmailVerified === true && user.isActive !== true;

/** Matches backend `userIsInvitePending`. */
export const userIsInvitePending = (user: User): boolean => {
  if (userIsDeactivatedFormerMember(user)) return false;
  if (!hasRoleAssignment(user)) return false;
  return !userHasActivatedAccount(user);
};

export const canSendWorkspaceInvite = (user: User): boolean => userIsInvitePending(user);

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

  if (canSendWorkspaceInvite(user)) {
    return {
      kind: 'SEND',
      label: 'Send Invite',
      title: 'Send an onboarding invite to this user.',
    };
  }

  if (userHasActivatedAccount(user)) {
    return {
      kind: 'HIDDEN',
      label: 'Active',
      title:
        'This user has already activated their account. Use reset password if they need access.',
    };
  }

  if (userIsDeactivatedFormerMember(user)) {
    return {
      kind: 'HIDDEN',
      label: 'Deactivated',
      title: 'Reactivate this account or reset password instead of sending an invite.',
    };
  }

  return {
    kind: 'HIDDEN',
    label: 'Unavailable',
    title: 'Assign a role before sending an invite.',
  };
};

/** Status badge for the users table — avoids showing "Active" before onboarding completes. */
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
