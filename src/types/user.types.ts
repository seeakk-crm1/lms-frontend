export interface TargetType {
  id: string;
  name: string;
  description?: string;
}

export interface TargetSetting {
  id: string;
  userId: string;
  targetTypeId: string;
  targetType?: TargetType;
  cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
  monthlyTargetLeads: number;
  dailyFollowupTarget: number;
  revenueTarget: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export type LocationType = 'COUNTRY' | 'STATE' | 'DISTRICT' | 'CITY' | 'WARD' | 'CONSTITUENCY' | 'OFFICE';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  parentId?: string;
  children?: Location[];
}

export interface Office {
  id: string;
  name: string;
  address?: string;
}

export interface User {
  id: string;
  name: string | null;
  username?: string | null;
  email: string;
  phone?: string | null;
  isActive: boolean;
  isLocked: boolean;
  role?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  office?: Office | null;
  country?: Location | null;
  state?: Location | null;
  district?: Location | null;
  assignedLocations?: {
    location: Location;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  role?: string;
  department?: string;
  status?: string;
}
