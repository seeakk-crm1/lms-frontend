export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: string | { id?: string; name?: string; status?: string; isSystemRole?: boolean } | null;
  permissions?: string[];
  isOnboarded: boolean;
  workspaceId?: string;
  isActive?: boolean;
  department?: string | { id?: string; name?: string } | null;
  supervisor?: string | { id?: string; name?: string; email?: string } | null;
  office?: string | { id?: string; name?: string } | null;
  assignedLocations?: any[];
  workspace?: {
    id: string;
    companyName: string;
    logoUrl?: string | null;
  } | null;
  receivedInvites?: Array<{
    id: string;
    expiresAt: string;
    usedAt?: string | null;
    createdAt: string;
  }>;
  [key: string]: any;
}

export interface Location {
  id: string;
  name: string;
  type: 'COUNTRY' | 'STATE' | 'DISTRICT' | 'CITY' | 'WARD' | 'CONSTITUENCY';
  parentId?: string;
  countryId?: string | null;
  levelId?: string | null;
  level?: {
    id: string;
    levelName: string;
    levelOrder: number;
  } | null;
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
