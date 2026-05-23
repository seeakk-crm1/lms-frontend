import React, { useCallback, useMemo } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { hasAnyPermission } from '../../utils/permission.util';
import {
  maskPhoneForAudit,
  normalizePhoneForWhatsApp,
  openWhatsAppChat,
  type OpenWhatsAppOptions,
} from '../../utils/whatsapp';
import {
  logWhatsAppClick,
  type LogWhatsAppClickPayload,
  type WhatsAppAuditEntityType,
} from '../../services/whatsappAudit.api';
import WhatsAppIcon from './WhatsAppIcon';

export type WhatsAppActionVariant = 'table' | 'inline' | 'compact' | 'cta';

export type WhatsAppActionButtonProps = {
  phone?: string | null;
  variant?: WhatsAppActionVariant;
  className?: string;
  disabled?: boolean;
  stopPropagation?: boolean;
  /** Hide entirely when user lacks permission */
  requiredPermissions?: readonly string[];
  audit?: Omit<LogWhatsAppClickPayload, 'phoneMasked'> & { entityType: WhatsAppAuditEntityType };
  openOptions?: OpenWhatsAppOptions;
  title?: string;
};

const variantClasses: Record<WhatsAppActionVariant, string> = {
  table:
    'rounded-2xl bg-green-50 p-2 text-green-600 transition-all hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-green-50',
  inline:
    'inline-flex items-center justify-center rounded-lg p-1 text-green-600 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40',
  compact:
    'inline-flex items-center justify-center rounded-xl bg-green-50 p-1.5 text-green-600 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-40',
  cta:
    'inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-500',
};

const WhatsAppActionButton: React.FC<WhatsAppActionButtonProps> = ({
  phone,
  variant = 'table',
  className = '',
  disabled = false,
  stopPropagation = true,
  requiredPermissions,
  audit,
  openOptions,
  title,
}) => {
  const permissions = useAuthStore((s) => s.user?.permissions || []);

  const canUse = useMemo(() => {
    if (!requiredPermissions?.length) return true;
    return hasAnyPermission(permissions, [...requiredPermissions]);
  }, [permissions, requiredPermissions]);

  const digits = useMemo(() => normalizePhoneForWhatsApp(phone, openOptions), [phone, openOptions]);
  const hasNumber = Boolean(digits);
  const isDisabled = disabled || !hasNumber;

  const tooltip = useMemo(() => {
    if (title) return title;
    if (!hasNumber) return 'No WhatsApp number available';
    return 'Chat on WhatsApp';
  }, [hasNumber, title]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (stopPropagation) {
        event.stopPropagation();
        event.preventDefault();
      }
      if (!hasNumber) return;

      const opened = openWhatsAppChat(phone, openOptions);
      if (!opened) return;

      if (audit?.entityId) {
        logWhatsAppClick({
          ...audit,
          phoneMasked: maskPhoneForAudit(phone),
        });
      }
    },
    [audit, hasNumber, openOptions, phone, stopPropagation],
  );

  if (!canUse) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`${variantClasses[variant]} ${className}`.trim()}
      title={tooltip}
      aria-label={tooltip}
    >
      <WhatsAppIcon className={variant === 'inline' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {variant === 'cta' ? <span>Chat on WhatsApp</span> : null}
    </button>
  );
};

export default React.memo(WhatsAppActionButton);
