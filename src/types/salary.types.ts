export type SalaryRecordStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'RETURNED';
export type SalaryApprovalAction = 'APPROVED' | 'REJECTED' | 'RETURNED' | 'EDITED';

export interface SalaryRecordUser {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  profileImageUrl: string | null;
  department?: { id: string; name: string } | null;
  office?: { id: string; name: string } | null;
}

export interface SalaryApproval {
  id: string;
  salaryRecordId: string;
  stageOrder: number;
  approverUserId: string;
  action: SalaryApprovalAction;
  remarks: string | null;
  createdAt: string;
  approverUser?: {
    id: string;
    name: string | null;
    email: string;
    role?: { id: string; name: string } | null;
  };
}

export interface SalaryHistory {
  id: string;
  salaryRecordId: string;
  editedById: string;
  action: string;
  previousValue?: any;
  newValue?: any;
  reason?: string | null;
  createdAt: string;
  editedBy?: {
    id: string;
    name: string | null;
    email: string;
    role?: { id: string; name: string } | null;
  };
}

export interface SalaryRecord {
  id: string;
  workspaceId: string;
  userId: string;
  month: number;
  year: number;
  monthlySalary: number;
  workingDays: number;
  attendanceDays: number;
  leaveDays: number;
  lopDays: number;
  overtimeHours: number;
  bonus: number;
  deduction: number;
  advanceAmount: number;
  finalSalary: number;
  status: SalaryRecordStatus;
  currentStageOrder: number;
  remarks: string | null;
  generatedById: string;
  createdAt: string;
  updatedAt: string;
  user?: SalaryRecordUser;
  generatedBy?: {
    id: string;
    name: string | null;
    email: string;
  };
  approvals?: SalaryApproval[];
  histories?: SalaryHistory[];
}

export interface SalaryApprovalStage {
  id: string;
  workspaceId: string;
  name: string;
  order: number;
  approverUserId: string;
  designation: string | null;
  isMandatory: boolean;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  approverUser?: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    profileImageUrl: string | null;
    role?: { id: string; name: string } | null;
    department?: { id: string; name: string } | null;
  };
}

export interface GenerateSalaryParams {
  month: number;
  year: number;
  scope: 'SINGLE' | 'DEPARTMENT' | 'OFFICE' | 'COMPANY' | 'employee' | 'department' | 'office' | 'company';
  targetId?: string;
  userId?: string;
  departmentId?: string;
  officeId?: string;
  workingDays?: number;
}
