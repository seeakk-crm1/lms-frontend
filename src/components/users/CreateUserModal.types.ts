export interface UserFormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  roleId: string;
  departmentId: string;
  supervisorId: string;
  officeId: string;
  countryId: string;
  stateId: string;
  districtId: string;
  isActive: boolean;
  assignedLocationIds: string[];
  assignedTargetCycleId?: string;
  profileImageUrl?: string;
}
