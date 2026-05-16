import { toast } from 'react-hot-toast';
import { copyTextToClipboard } from './clipboard';

export type InviteDeliveryResponse = {
  message?: string;
  delivery?: 'EMAIL' | 'MANUAL' | 'CLIPBOARD';
  inviteLink?: string | null;
  deliveryErrorMessage?: string | null;
};

/**
 * Ensure the setup link is a full https URL the user can open from chat or messaging apps.
 */
export const resolvePasswordSetupLink = (apiLink: string | null | undefined): string => {
  const trimmed = (apiLink || '').trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/') && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin.replace(/\/+$/, '')}${trimmed}`;
  }

  return trimmed;
};

/** Users table mail icon: copy access link only (no email, no active-account warnings). */
export const handleAccessLinkCopied = async (response: InviteDeliveryResponse): Promise<void> => {
  const setupLink = resolvePasswordSetupLink(response.inviteLink);

  if (!setupLink || !/^https?:\/\//i.test(setupLink)) {
    toast.error('Could not generate an access link. Check FRONTEND_URL on the server.', { duration: 8000 });
    return;
  }

  const copied = await copyTextToClipboard(setupLink);
  if (copied) {
    toast.success('Access link copied to clipboard', { duration: 7000 });
    return;
  }

  toast.error(`Copy failed. Open or share this link: ${setupLink}`, { duration: 12000 });
};

/** Create-user invite modal: may still send email when configured. */
export const handleInviteDeliverySuccess = async (response: InviteDeliveryResponse): Promise<void> => {
  if (response.delivery === 'CLIPBOARD') {
    await handleAccessLinkCopied(response);
    return;
  }

  const setupLink = resolvePasswordSetupLink(response.inviteLink);
  const emailSent = response.delivery === 'EMAIL';
  const copied = setupLink ? await copyTextToClipboard(setupLink) : false;

  if (emailSent) {
    if (copied) {
      toast.success('Invitation email sent. Invite link copied to clipboard.', { duration: 7000 });
      return;
    }

    toast.success(
      setupLink
        ? `${response.message || 'Invitation email sent.'} Copy link: ${setupLink}`
        : response.message || 'Invitation email sent.',
      { duration: setupLink ? 10000 : 5000 },
    );
    return;
  }

  const reason = response.deliveryErrorMessage?.trim();
  const baseMessage = [
    response.message || 'Invite is ready for manual sharing.',
    reason ? `Reason: ${reason}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  if (copied) {
    toast.success(`${baseMessage} Invite link copied to clipboard.`, { duration: 7000 });
    return;
  }

  if (setupLink) {
    toast(`${baseMessage} Link: ${setupLink}`, { duration: 10000 });
    return;
  }

  toast(baseMessage, { duration: 7000 });
};
