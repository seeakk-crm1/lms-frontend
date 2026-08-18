export interface WhatsAppVariableChip {
  label: string;
  variable: string;
  sampleValue: string;
}

export const WHATSAPP_TEMPLATE_VARIABLES: WhatsAppVariableChip[] = [
  { label: 'Lead Name', variable: '{{lead_name}}', sampleValue: 'Ahmed Khan' },
  { label: 'Mobile', variable: '{{mobile}}', sampleValue: '+91 98765 43210' },
  { label: 'Assigned User', variable: '{{assigned_user}}', sampleValue: 'Rahul Sharma' },
  { label: 'Company Name', variable: '{{company_name}}', sampleValue: 'SEEAKK Tech' },
  { label: 'Follow-up Date', variable: '{{followup_date}}', sampleValue: '20 Aug 2026' },
  { label: 'Follow-up Time', variable: '{{followup_time}}', sampleValue: '10:30 AM' },
  { label: 'Lead Stage', variable: '{{lead_stage}}', sampleValue: 'Potential' },
];

export interface RenderContext {
  leadName?: string | null;
  mobile?: string | null;
  assignedUser?: string | null;
  companyName?: string | null;
  followupDate?: string | null;
  followupTime?: string | null;
  leadStage?: string | null;
}

export const SAMPLE_PREVIEW_CONTEXT: RenderContext = {
  leadName: 'Ahmed Khan',
  mobile: '+91 98765 43210',
  assignedUser: 'Rahul Sharma',
  companyName: 'SEEAKK Tech',
  followupDate: '20 Aug 2026',
  followupTime: '10:30 AM',
  leadStage: 'Potential',
};

export const renderWhatsAppTemplate = (
  templateText: string | null | undefined,
  context: RenderContext = SAMPLE_PREVIEW_CONTEXT
): string => {
  if (!templateText) return '';

  return templateText.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, varName) => {
    switch (varName) {
      case 'lead_name':
        return context.leadName || match;
      case 'mobile':
        return context.mobile || match;
      case 'assigned_user':
        return context.assignedUser || match;
      case 'company_name':
        return context.companyName || match;
      case 'followup_date':
        return context.followupDate || match;
      case 'followup_time':
        return context.followupTime || match;
      case 'lead_stage':
        return context.leadStage || match;
      default:
        return match;
    }
  });
};

export const normalizePhoneForWhatsApp = (phone?: string | null): string | null => {
  if (!phone) return null;
  let cleaned = phone.trim().replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  cleaned = cleaned.replace(/^0+/, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  if (cleaned.length >= 7 && cleaned.length <= 15) {
    return cleaned;
  }
  return null;
};

export const buildWhatsAppClickToChatUrl = (phone?: string | null, message?: string | null): string | null => {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return null;
  const encoded = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${normalized}${encoded ? `?text=${encoded}` : ''}`;
};
