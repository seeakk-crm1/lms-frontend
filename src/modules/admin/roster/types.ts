export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type RosterType = 'HOLIDAY' | 'WEEKLY_OFF' | 'SHIFT' | 'SPECIAL_WORKING_DAY';
export type RosterStatus = 'ACTIVE' | 'INACTIVE';
export type AssignScope = 'SINGLE' | 'DEPARTMENT';
export type ShiftSession = 'DAY' | 'NIGHT';

export interface RosterUser {
  id: string;
  name: string;
  email: string;
  department: string | null;
  supervisor: string | null;
  status: UserStatus;
}

export interface RosterEntry {
  id: string;
  userId: string;
  rosterType: RosterType;
  name: string;
  startDate: string;
  endDate: string | null;
  shiftSession: ShiftSession | null;
  shiftStartTime: string | null;
  shiftEndTime: string | null;
  status: RosterStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RosterFilters {
  search: string;
  departmentId?: string;
  supervisorId?: string;
  status?: UserStatus;
}

export interface RosterPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RosterUsersApiResponse {
  success: boolean;
  message: string;
  data: RosterUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface RosterEntriesApiResponse {
  success: boolean;
  message: string;
  data: RosterEntry[];
}

export interface RosterMutationApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface RosterFormValues {
  rosterType: RosterType;
  name: string;
  startDate: string;
  endDate?: string;
  shiftSession?: ShiftSession;
  shiftStartTime?: string;
  shiftEndTime?: string;
  assignScope: AssignScope;
  status: RosterStatus;
}
