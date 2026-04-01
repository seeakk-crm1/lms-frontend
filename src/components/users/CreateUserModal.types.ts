export interface UserFormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
  roleId: string;
  departmentId: string;
  supervisorId: string;
  officeId: string;
  countryId: string;
  stateId: string;
  districtId: string;
  isActive: boolean;
  assignedLocationIds: string[];
  targetTypeId?: string;
  cycle?: 'MONTHLY' | 'WEEKLY' | 'QUARTERLY';
  monthlyTargetLeads?: number;
  dailyFollowupTarget?: number;
  revenueTarget?: number;
  startDate?: string;
}
