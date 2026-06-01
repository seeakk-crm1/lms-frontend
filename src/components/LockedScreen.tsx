import React from 'react';
import TargetLockDetails, { type TargetLockDetailsData } from './TargetLockDetails';

type LockedScreenProps = {
  targetLock?: TargetLockDetailsData | null;
  isTargetLocked?: boolean;
};

const LockedScreen: React.FC<LockedScreenProps> = ({ targetLock, isTargetLocked }) => {
  if (isTargetLocked && targetLock) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
        <div className="bg-white rounded-3xl p-2 max-w-md w-full border border-red-50 border-t-4 border-t-red-500 shadow-[0_20px_50px_rgba(239,68,68,0.1)]">
          <TargetLockDetails lock={targetLock} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-red-50 border-t-4 border-t-red-500 shadow-[0_20px_50px_rgba(239,68,68,0.1)]">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 text-red-500 mb-6 animate-bounce">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Account Locked</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Your account is temporarily locked due to incomplete targets.
        </p>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500 font-medium leading-relaxed">
          Please complete your designated targets or contact your supervisor/admin with unlock privileges to restore
          access.
        </div>
      </div>
    </div>
  );
};

export default LockedScreen;
