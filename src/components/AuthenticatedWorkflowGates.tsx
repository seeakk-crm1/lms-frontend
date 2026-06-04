import React from 'react';
import MandatoryOverdueFollowUpGate from './calendar/MandatoryOverdueFollowUpGate';
import MandatoryFollowUpContinuationGate from './calendar/MandatoryFollowUpContinuationGate';
import MandatoryAttendanceGate from './MandatoryAttendanceGate';
import { useAuthenticatedWorkflowEnabled } from '../hooks/useAuthenticatedWorkflowEnabled';

interface Props {
  children: React.ReactNode;
}

/**
 * Mounts mandatory attendance / follow-up gates only after login on app routes.
 * Public landing and auth pages render children with no workflow checks.
 */
const AuthenticatedWorkflowGates: React.FC<Props> = ({ children }) => {
  const workflowEnabled = useAuthenticatedWorkflowEnabled();

  if (!workflowEnabled) {
    return <>{children}</>;
  }

  return (
    <MandatoryOverdueFollowUpGate>
      <MandatoryFollowUpContinuationGate>
        <MandatoryAttendanceGate>{children}</MandatoryAttendanceGate>
      </MandatoryFollowUpContinuationGate>
    </MandatoryOverdueFollowUpGate>
  );
};

export default AuthenticatedWorkflowGates;
