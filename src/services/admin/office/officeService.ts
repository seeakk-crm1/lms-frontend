import api from '../../api';
import type {
  ListOfficesApiResponse,
  LocationOption,
  OfficeFormValues,
  OfficeMutationResponse,
} from '../../../types/admin/office/office.types';

interface GetOfficesParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  countryId?: string;
  stateId?: string;
  districtId?: string;
}

export const getOffices = async (params: GetOfficesParams): Promise<ListOfficesApiResponse> => {
  const response = await api.get('/admin/offices', { params });
  return response.data;
};

export const createOffice = async (payload: OfficeFormValues): Promise<OfficeMutationResponse> => {
  const response = await api.post('/admin/offices', payload);
  return response.data;
};

export const updateOffice = async (
  id: string,
  payload: OfficeFormValues,
): Promise<OfficeMutationResponse> => {
  const response = await api.put(`/admin/offices/${id}`, payload);
  return response.data;
};

export const deleteOffice = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/offices/${id}`);
  return response.data;
};

export const toggleStatus = async (
  id: string,
  isActive: boolean,
): Promise<OfficeMutationResponse> => {
  const response = await api.patch(`/admin/offices/${id}/status`, { isActive });
  return response.data;
};

export const getAllLocations = async (): Promise<LocationOption[]> => {
  const response = await api.get('/admin/users/meta/locations/all');
  return response.data?.data?.locations || [];
};
