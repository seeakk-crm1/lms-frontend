import { toast } from 'react-hot-toast';
import { copyTextToClipboard } from './clipboard';

export type InviteDeliveryResponse = {
  message?: string;
  delivery?: 'EMAIL' | 'MANUAL';
  inviteLink?: string | null;
  deliveryErrorMessage?: string | null;
};

/**
 * Ensure the setup link is a full https URL the user can open from chat/email.
 * Falls back to the current admin UI origin when the API returns a relative path.
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

/**
 * Clipboard-first invite success: generate link on server, copy locally, simple toast.
 * Email delivery (if any) is best-effort and does not block copying.
 */
export const handleInviteDeliverySuccess = async (response: InviteDeliveryResponse): Promise<void> => {
  const setupLink = resolvePasswordSetupLink(response.inviteLink);

  if (!setupLink || !/^https?:\/\//i.test(setupLink)) {
    toast.error(
      response.deliveryErrorMessage?.trim() ||
        'Could not generate a password setup link. Check FRONTEND_URL on the server.',
      { duration: 8000 },
    );
    return;
  }

  const copied = await copyTextToClipboard(setupLink);
  if (copied) {
    toast.success('Password setup link copied successfully.', { duration: 7000 });
    return;
  }

  toast.error(`Copy failed. Open or share this link: ${setupLink}`, { duration: 12000 });
};
