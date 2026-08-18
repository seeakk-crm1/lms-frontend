import React, { useMemo } from 'react';
import { useWhatsAppTemplatesQuery } from '../../hooks/useWhatsAppTemplates';
import { renderWhatsAppTemplate, SAMPLE_PREVIEW_CONTEXT } from '../../utils/renderWhatsAppTemplate';
import { MessageSquare, Plus, CheckCircle2, Eye, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { hasAnyPermission } from '../../utils/permission.util';

interface WhatsAppTemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string | null) => void;
  reminderEnabled: boolean;
  onToggleReminder: (enabled: boolean) => void;
  className?: string;
  leadName?: string;
}

export const WhatsAppTemplateSelector: React.FC<WhatsAppTemplateSelectorProps> = ({
  selectedTemplateId,
  onSelectTemplate,
  reminderEnabled,
  onToggleReminder,
  className = '',
  leadName,
}) => {
  const { user } = useAuthStore();
  const canCreate = hasAnyPermission(user?.permissions || [], [
    'WHATSAPP_TEMPLATES_CREATE',
    'SYSTEM_CONFIG',
    'manage_followup_settings',
  ]);

  const { data: templates = [], isLoading } = useWhatsAppTemplatesQuery('ACTIVE');

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const previewMessage = useMemo(() => {
    if (!selectedTemplate) return '';
    const ctx = leadName ? { ...SAMPLE_PREVIEW_CONTEXT, leadName } : SAMPLE_PREVIEW_CONTEXT;
    return renderWhatsAppTemplate(selectedTemplate.message, ctx);
  }, [selectedTemplate, leadName]);

  return (
    <div className={`rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
          <MessageSquare className="h-4 w-4 text-emerald-600" />
          <span>WhatsApp Reminder (Optional)</span>
        </div>
        {canCreate && (
          <Link
            to="/settings/whatsapp-templates"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline decoration-emerald-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Template
          </Link>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            WhatsApp Template
          </label>
          <select
            value={selectedTemplateId || ''}
            onChange={(e) => {
              const val = e.target.value || null;
              onSelectTemplate(val);
              if (val && !reminderEnabled) {
                onToggleReminder(true);
              }
            }}
            disabled={isLoading}
            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-gray-100"
          >
            <option value="">-- No WhatsApp Template --</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name} ({tpl.category})
              </option>
            ))}
          </select>
          {templates.length === 0 && !isLoading && (
            <p className="mt-1 text-xs font-medium text-amber-700">
              No active WhatsApp templates available.{' '}
              {canCreate && (
                <Link to="/settings/whatsapp-templates" className="font-bold underline">
                  Create Template
                </Link>
              )}
            </p>
          )}
        </div>

        {selectedTemplate && (
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => onToggleReminder(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-gray-800">
              Ask me to send this message when the follow-up is due
            </span>
          </label>
        )}

        {selectedTemplate && previewMessage && (
          <div className="rounded-xl border border-emerald-200/80 bg-white p-3 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> Preview
              </span>
              <span className="text-gray-400 font-semibold">{selectedTemplate.name}</span>
            </div>
            <p className="text-xs text-gray-700 font-medium whitespace-pre-wrap leading-relaxed bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
              {previewMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppTemplateSelector;
