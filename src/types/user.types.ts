export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: string | { id: string; name: string };
  isOnboarded: boolean;
  workspaceId?: string;
  isActive?: boolean;
  department?: string;
  supervisor?: string;
  office?: string;
  assignedLocations?: any[];
  [key: string]: any;
}

export interface Location {
  id: string;
  name: string;
  type: 'COUNTRY' | 'STATE' | 'DISTRICT' | 'CITY' | 'WARD' | 'CONSTITUENCY';
  parentId?: string;
  children?: Location[];
}

export interface UserFilters {
  role?: string;
  department?: string;
  office?: string;
  isActive?: boolean;
}

export interface TargetType {
  id: string;
  name: string;
  description?: string;
}

export interface TargetSetting {
  id: string;
  userId: string;
  targetTypeId: string;
  cycle: string;
  monthlyTargetLeads: number;
  dailyFollowupTarget: number;
  revenueTarget: number;
  startDate: string;
}
