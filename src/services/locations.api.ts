import api from './api';

export interface LocationActor {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  displayName?: string | null;
}

export interface Country {
  id: string;
  workspaceId: string;
  name: string;
  code?: string | null;
  isActive: boolean;
  createdById?: string | null;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: LocationActor | null;
  updatedBy?: LocationActor | null;
}

export interface LocationLevel {
  id: string;
  workspaceId: string;
  countryId: string;
  levelName: string;
  levelOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: LocationActor | null;
  updatedBy?: LocationActor | null;
}

export interface LocationRecord {
  id: string;
  workspaceId: string;
  name: string;
  type: string;
  countryId?: string | null;
  levelId?: string | null;
  isActive: boolean;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  country?: {
    id: string;
    name: string;
    code?: string | null;
    isActive: boolean;
  } | null;
  level?: {
    id: string;
    levelName: string;
    levelOrder: number;
    isActive: boolean;
  } | null;
  parent?: {
    id: string;
    name: string;
    levelId?: string | null;
  } | null;
}

export interface CountriesResponse {
  data: Country[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListCountriesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface ListLocationsParams {
  countryId?: string;
  parentId?: string;
  levelOrder?: number;
}

export interface CreateCountryPayload {
  name: string;
  code?: string;
  isActive?: boolean;
}

export interface UpdateCountryPayload extends Partial<CreateCountryPayload> {}

export interface ConfigureLevelsPayload {
  countryId: string;
  levels: Array<{
    name: string;
    order: number;
    isActive?: boolean;
  }>;
}

export interface CreateLocationPayload {
  countryId: string;
  levelId: string;
  parentId?: string;
  name: string;
  isActive?: boolean;
}

export interface UpdateLocationPayload {
  name?: string;
  parentId?: string;
  isActive?: boolean;
}

export const getCountries = async (params: ListCountriesParams = {}): Promise<CountriesResponse> => {
  const { data } = await api.get('/locations/countries', { params });
  return data;
};

export const createCountry = async (payload: CreateCountryPayload): Promise<Country> => {
  const { data } = await api.post('/locations/countries', payload);
  return data.data;
};

export const updateCountry = async (id: string, payload: UpdateCountryPayload): Promise<Country> => {
  const { data } = await api.put(`/locations/countries/${id}`, payload);
  return data.data;
};

export const deleteCountry = async (id: string): Promise<Country> => {
  const { data } = await api.delete(`/locations/countries/${id}`);
  return data.data;
};

export const getLocationLevels = async (countryId?: string): Promise<{ data: LocationLevel[] }> => {
  const { data } = await api.get('/locations/levels', {
    params: countryId ? { countryId } : undefined,
  });
  return data;
};

export const configureLocationLevels = async (
  payload: ConfigureLevelsPayload,
): Promise<{ country: Country; levels: LocationLevel[] }> => {
  const { data } = await api.post('/locations/levels', payload);
  return data.data;
};

export const getLocations = async (params: ListLocationsParams): Promise<{ data: LocationRecord[] }> => {
  const { data } = await api.get('/locations', { params });
  return data;
};

export const createLocation = async (payload: CreateLocationPayload): Promise<LocationRecord> => {
  const { data } = await api.post('/locations', payload);
  return data.data;
};

export const updateLocation = async (id: string, payload: UpdateLocationPayload): Promise<LocationRecord> => {
  const { data } = await api.put(`/locations/${id}`, payload);
  return data.data;
};

export const deleteLocation = async (id: string): Promise<LocationRecord> => {
  const { data } = await api.delete(`/locations/${id}`);
  return data.data;
};

export const getLocationTree = async (countryId: string): Promise<{ success: boolean; data: { country: Country; root: LocationRecord; tree: LocationRecord[] } }> => {
  const { data } = await api.get('/locations/tree', { params: { countryId } });
  return data;
};
