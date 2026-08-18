export type WhatsAppTemplateCategory =
  | 'Follow-up'
  | 'Meeting'
  | 'Quotation'
  | 'Payment'
  | 'New Enquiry'
  | 'Thank You'
  | 'General'
  | 'Custom';

export type WhatsAppTemplateStatus = 'ACTIVE' | 'INACTIVE';

export interface WhatsAppTemplate {
  id: string;
  workspaceId: string;
  name: string;
  category: WhatsAppTemplateCategory;
  message: string;
  status: WhatsAppTemplateStatus;
  createdByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface CreateWhatsAppTemplatePayload {
  name: string;
  category: WhatsAppTemplateCategory;
  message: string;
  status?: WhatsAppTemplateStatus;
}

export interface UpdateWhatsAppTemplatePayload {
  name?: string;
  category?: WhatsAppTemplateCategory;
  message?: string;
  status?: WhatsAppTemplateStatus;
}
