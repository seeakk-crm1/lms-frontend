import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { StageRule } from '../../../types/stageRule.types';

export interface StageRuleValueEntry {
  ruleId: string;
  value: string;
}

interface StageRulesTransitionModalProps {
  isOpen: boolean;
  rules: StageRule[];
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (values: StageRuleValueEntry[]) => void;
}

const inputClass =
  'w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

const StageRulesTransitionModal: React.FC<StageRulesTransitionModalProps> = ({
  isOpen,
  rules,
  isSubmitting = false,
  onClose,
  onConfirm,
}) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [rules],
  );

  useEffect(() => {
    if (!isOpen) return;
    const next: Record<string, string> = {};
    sortedRules.forEach((rule) => {
      next[rule.id] = '';
    });
    setValues(next);
    setTouched(false);
  }, [isOpen, sortedRules]);

  const setRuleValue = useCallback((ruleId: string, value: string) => {
    setValues((current) => ({ ...current, [ruleId]: value }));
  }, []);

  const missingRequired = useMemo(() => {
    if (!touched) return [];
    return sortedRules.filter((rule) => {
      if (!rule.required) return false;
      const raw = values[rule.id];
      return raw === undefined || raw === null || String(raw).trim() === '';
    });
  }, [sortedRules, touched, values]);

  const handleSubmit = useCallback(() => {
    setTouched(true);
    const nextMissing = sortedRules.filter((rule) => {
      if (!rule.required) return false;
      const raw = values[rule.id];
      return raw === undefined || raw === null || String(raw).trim() === '';
    });
    if (nextMissing.length > 0) return;

    for (const rule of sortedRules) {
      const raw = values[rule.id];
      const v = typeof raw === 'string' ? raw.trim() : '';
      if (!v) continue;
      const opts = rule.options || [];
      if ((rule.inputType === 'RADIO' || rule.inputType === 'SELECT') && opts.length > 0 && !opts.includes(v)) {
        toast.error(`Choose a valid option for “${rule.name}”.`);
        return;
      }
    }

    const payload: StageRuleValueEntry[] = sortedRules.map((rule) => ({
      ruleId: rule.id,
      value: typeof values[rule.id] === 'string' ? values[rule.id].trim() : '',
    }));
    onConfirm(payload);
  }, [onConfirm, sortedRules, values]);

  return (
    <AnimatePresence>
      {isOpen ? (
      <div className="fixed inset-0 z-[130] flex items-end justify-center bg-gray-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stage-rules-transition-title"
        >
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Stage transition</p>
                <h2 id="stage-rules-transition-title" className="text-lg font-black text-gray-900 sm:text-xl">
                  Additional information required
                </h2>
                <p className="mt-1 text-xs font-semibold text-gray-500">
                  Complete the fields below before this stage change is submitted.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            {sortedRules.map((rule) => {
              const opts = rule.options || [];
              const val = values[rule.id] ?? '';
              const showError = touched && rule.required && !String(val).trim();

              return (
                <div key={rule.id} className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                  <label className="mb-2 block text-sm font-black text-gray-900">
                    {rule.name}
                    {rule.required ? <span className="text-red-500"> *</span> : null}
                  </label>

                  {rule.inputType === 'TEXT' ? (
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setRuleValue(rule.id, e.target.value)}
                      className={inputClass}
                      placeholder={`Enter ${rule.name.toLowerCase()}`}
                    />
                  ) : null}

                  {rule.inputType === 'TEXTAREA' ? (
                    <textarea
                      value={val}
                      onChange={(e) => setRuleValue(rule.id, e.target.value)}
                      rows={4}
                      className={`${inputClass} resize-none`}
                      placeholder={`Enter ${rule.name.toLowerCase()}`}
                    />
                  ) : null}

                  {rule.inputType === 'RADIO' ? (
                    <div className="space-y-2">
                      {opts.map((opt) => (
                        <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-800">
                          <input
                            type="radio"
                            name={`rule-${rule.id}`}
                            value={opt}
                            checked={val === opt}
                            onChange={() => setRuleValue(rule.id, opt)}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : null}

                  {rule.inputType === 'SELECT' ? (
                    <select
                      value={val}
                      onChange={(e) => setRuleValue(rule.id, e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select…</option>
                      {opts.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : null}

                  {showError ? <p className="mt-2 text-xs font-bold text-rose-500">This field is required.</p> : null}
                </div>
              );
            })}

            {touched && missingRequired.length > 0 ? (
              <p className="text-center text-xs font-bold text-rose-500">Please complete all required fields.</p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continue
            </button>
          </div>
        </motion.div>
      </div>
      ) : null}
    </AnimatePresence>
  );
};

export default memo(StageRulesTransitionModal);
