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
    <div className="space-y-6 mt-8 break-before-page">
      <div className="flex items-center gap-3 border-b-2 border-emerald-500 pb-3 mb-6">
        <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
          <UserIcon size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Activity Report: {userName}</h2>
      </div>

      <ExecutiveSummarySection filters={filters} />
      <LeadsSection filters={filters} />
      <LeadUpdatesSection filters={filters} />
      <FollowupActivitySection filters={filters} />
      <FollowupExtensionsSection filters={filters} />
      <FollowupHistoryTimelineSection filters={filters} />
      <StageMovementsSection filters={filters} />
      <RevenueActivitySection filters={filters} />
      <AttendanceActivitySection filters={filters} />
      <TargetActivitySection filters={filters} />
      <ApprovalActivitySection filters={filters} />
      <AuditTrailSection filters={filters} />
      <ActivityTimelineSection filters={filters} />
    </div>
  );
};

export default UserReportView;
