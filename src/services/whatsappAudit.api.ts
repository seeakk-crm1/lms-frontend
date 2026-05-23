import api from './api';

export type WhatsAppAuditEntityType = 'Lead' | 'User' | 'FollowUp';

export type LogWhatsAppClickPayload = {
  entityType: WhatsAppAuditEntityType;
  entityId: string;
  entityName?: string;
  phoneMasked?: string | null;
};

/** Fire-and-forget; never blocks UI. */
export const logWhatsAppClick = (payload: LogWhatsAppClickPayload): void => {
  void api
    .post('/audit/whatsapp-click', payload)
    .catch(() => {
      /* optional audit — ignore network failures */
    });
};
