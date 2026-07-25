export interface UserFormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  roleId: string;
  departmentId: string;
  supervisorId: string;
  officeId: string;
  isActive: boolean;
  assignedTargetCycleId?: string;
  monthlySalary?: number | null;
  profileImageUrl?: string;
}
