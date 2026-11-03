import React from 'react';
import { SummaryFilters } from '../../../../services/summaryReports.api';
import ExecutiveSummarySection from './ExecutiveSummarySection';
import LeadsSection from './LeadsSection';
import LeadUpdatesSection from './LeadUpdatesSection';
import FollowupActivitySection from './FollowupActivitySection';
import FollowupExtensionsSection from './FollowupExtensionsSection';
import FollowupHistoryTimelineSection from './FollowupHistoryTimelineSection';
import StageMovementsSection from './StageMovementsSection';
import RevenueActivitySection from './RevenueActivitySection';
import AttendanceActivitySection from './AttendanceActivitySection';
import TargetActivitySection from './TargetActivitySection';
import ApprovalActivitySection from './ApprovalActivitySection';
import AuditTrailSection from './AuditTrailSection';
import ActivityTimelineSection from './ActivityTimelineSection';
import { User as UserIcon } from 'lucide-react';

interface UserReportViewProps {
  filters: SummaryFilters;
  userName: string;
}

const UserReportView: React.FC<UserReportViewProps> = ({ filters, userName }) => {
  return (
    <div className="space-y-3.5 sm:space-y-4 break-before-page">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200/80">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80">
          <UserIcon size={15} />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-gray-900">User Activity Profile: {userName}</h2>
      </div>

      <ExecutiveSummarySection filters={filters} />
      <LeadsSection filters={filters} />
      <LeadUpdatesSection filters={filters} />
      <FollowupActivitySection filters={filters} />
      <FollowupExtensionsSection filters={filters} />
      <FollowupHistoryTimelineSection filters={filters} />
      <StageMovementsSection filters={filters} />
      <RevenueActivitySection filters={filters} />
      <AttendanceActivitySection filters={filters} hideIfEmpty />
      <TargetActivitySection filters={filters} />
      <ApprovalActivitySection filters={filters} />
      <AuditTrailSection filters={filters} />
      <ActivityTimelineSection filters={filters} />
    </div>
  );
};

export default UserReportView;
