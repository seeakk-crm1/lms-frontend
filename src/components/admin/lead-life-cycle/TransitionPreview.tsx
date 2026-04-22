import React from 'react';
import { GitBranch } from 'lucide-react';
import type { LeadStageOption } from '../../../types/admin/lead-life-cycle/leadLifeCycle.types';

interface PreviewRow {
  fromStageId: string;
  toStageId: string;
  numberOfDays: number;
  expiryAction: 'AUTO_LOB' | 'WARN_AND_CHOOSE';
  warningDays: number;
  sortOrder: number;
}

interface Props {
  transitions: PreviewRow[];
  stageOptions: LeadStageOption[];
}

const TransitionPreview: React.FC<Props> = ({ transitions, stageOptions }) => {
  const stageMap = React.useMemo(
    () => new Map(stageOptions.map((stage) => [stage.id, stage.name])),
    [stageOptions],
  );

  if (transitions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Transition Preview</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {transitions
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((transition) => (
            <span
              key={`${transition.fromStageId}-${transition.toStageId}-${transition.sortOrder}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-700"
            >
              <GitBranch className="h-3.5 w-3.5" />
              {(stageMap.get(transition.fromStageId) || 'Unknown') + ' -> ' + (stageMap.get(transition.toStageId) || 'Unknown')}
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px]">{transition.numberOfDays}d</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                {transition.expiryAction === 'AUTO_LOB'
                  ? 'Auto move to LOB'
                  : `Warn ${transition.warningDays}d early + allow extension`}
              </span>
            </span>
          ))}
      </div>
    </div>
  );
};

export default React.memo(TransitionPreview);
