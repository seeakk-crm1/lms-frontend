import React from 'react';

export type TargetLockDetailsData = {
  title?: string;
  message?: string;
  lockReason?: string | null;
  targetCycleName?: string | null;
  completionPercentage?: number;
  pendingTargetBalance?: number;
  lockDate?: string | null;
  lastPeriodLabel?: string | null;
  canSelfUnlock?: boolean;
};

type TargetLockDetailsProps = {
  lock: TargetLockDetailsData;
  onSelfUnlock?: () => void;
  isUnlocking?: boolean;
};

const formatLockDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const TargetLockDetails: React.FC<TargetLockDetailsProps> = ({ lock, onSelfUnlock, isUnlocking }) => (
  <div className="flex flex-col items-center p-8 text-center">
    <div className="mb-4 rounded-full bg-rose-50 p-5 text-rose-500">
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-bold text-gray-900">{lock.title || 'Your Account is Locked'}</h3>
    <p className="mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
      {lock.message ||
        'Your target for the current evaluation period has not been completed. Please contact your supervisor for assistance.'}
    </p>

    <div className="mt-6 w-full max-w-md rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left text-xs text-gray-600">
      <dl className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <dt className="font-bold uppercase tracking-wider text-gray-400">Lock Reason</dt>
          <dd className="text-right font-semibold text-gray-800">{lock.lockReason || 'TARGET_LOCKED'}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="font-bold uppercase tracking-wider text-gray-400">Target Cycle</dt>
          <dd className="text-right font-semibold text-gray-800">{lock.targetCycleName || '—'}</dd>
        </div>
        {lock.lastPeriodLabel ? (
          <div className="flex items-start justify-between gap-4">
            <dt className="font-bold uppercase tracking-wider text-gray-400">Period</dt>
            <dd className="text-right font-semibold text-gray-800">{lock.lastPeriodLabel}</dd>
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-4">
          <dt className="font-bold uppercase tracking-wider text-gray-400">Completion</dt>
          <dd className="text-right font-semibold text-gray-800">
            {typeof lock.completionPercentage === 'number' ? `${Math.round(lock.completionPercentage)}%` : '—'}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="font-bold uppercase tracking-wider text-gray-400">Pending Balance</dt>
          <dd className="text-right font-semibold text-gray-800">{lock.pendingTargetBalance ?? 0}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="font-bold uppercase tracking-wider text-gray-400">Lock Date</dt>
          <dd className="text-right font-semibold text-gray-800">{formatLockDate(lock.lockDate)}</dd>
        </div>
      </dl>
    </div>

    {lock.canSelfUnlock && onSelfUnlock && (
      <div className="mt-8 w-full max-w-md">
        <button
          onClick={onSelfUnlock}
          disabled={isUnlocking}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
        >
          {isUnlocking ? 'Unlocking...' : 'Self Unlock Account (1 Available)'}
        </button>
        <p className="mt-2 text-xs text-gray-500">
          You may use this one-time self unlock to restore access to your account.
        </p>
      </div>
    )}
  </div>
);

export default TargetLockDetails;
