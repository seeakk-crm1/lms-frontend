/** Permissions required to show WhatsApp actions for leads / follow-ups. */
export const LEAD_WHATSAPP_PERMISSIONS = [
  'LEADS_VIEW_ALL',
  'LEADS_VIEW_OWN',
  'LEADS_VIEW_TEAM',
  'LEADS_CREATE',
  'SYSTEM_CONFIG',
  'SUPERADMIN',
] as const;

/** Permissions required to show WhatsApp actions on admin user list. */
export const USER_WHATSAPP_PERMISSIONS = ['USERS_VIEW', 'SYSTEM_CONFIG', 'SUPERADMIN'] as const;
