import { toast } from 'react-hot-toast';
import { copyTextToClipboard } from './clipboard';

export type InviteDeliveryResponse = {
  message?: string;
  delivery?: 'EMAIL' | 'MANUAL';
  inviteLink?: string | null;
  deliveryErrorMessage?: string | null;
};

/** After send/resend/create invite: copy link when present and show a clear toast. */
export const handleInviteDeliverySuccess = async (response: InviteDeliveryResponse): Promise<void> => {
  const inviteLink = response?.inviteLink?.trim() || '';
  const emailSent = response.delivery === 'EMAIL';
  const copied = inviteLink ? await copyTextToClipboard(inviteLink) : false;

  if (emailSent) {
    if (copied) {
      toast.success('Invitation email sent. Invite link copied to clipboard.', { duration: 7000 });
      return;
    }

    toast.success(
      inviteLink
        ? `${response.message || 'Invitation email sent.'} Copy link: ${inviteLink}`
        : response.message || 'Invitation email sent.',
      { duration: inviteLink ? 10000 : 5000 },
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

  if (inviteLink) {
    toast(`${baseMessage} Link: ${inviteLink}`, { duration: 10000 });
    return;
  }

  toast(baseMessage, { duration: 7000 });
};
