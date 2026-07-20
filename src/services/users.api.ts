import api from './api';
import { User, TargetSetting, TargetType } from '../types/user.types';
import type { Office } from '../types/admin/office/office.types';

export const getUsers = async (params: any) => {
  const { data } = await api.get('/admin/users', { params });
  return data.data; // { users, pagination }
};

export const getUserById = async (id: string) => {
  const { data } = await api.get(`/admin/users/${id}`);
  return data.data; // { user }
};

export const createUser = async (payload: any) => {
  const { data } = await api.post('/admin/users', payload);
  return data.data; // { user, generatedPassword }
};

export const updateUser = async (id: string, payload: any) => {
  const { data } = await api.put(`/admin/users/${id}`, payload);
  return data.data; // { user }
};

export const deleteUser = async (id: string) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

export const updateUserStatus = async (id: string, isActive: boolean) => {
  const { data } = await api.patch(`/admin/users/${id}/status`, { isActive });
  return data;
};

export const resetPassword = async (id: string, payload: any) => {
  const { data } = await api.post(`/admin/users/${id}/reset-password`, payload);
  return data;
};

export const sendAccessLink = async (userId: string) => {
  const response = await api.post(`/admin/users/${userId}/access-link`);
  return response.data;
};

export const uploadUserProfileImage = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post(`/admin/users/${userId}/profile-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const removeUserProfileImage = async (userId: string) => {
  const response = await api.delete(`/admin/users/${userId}/profile-image`);
  return response.data;
};

// Target Settings
export const getTargetTypes = async () => {
  const { data } = await api.get('/admin/users/meta/target-types');
  return data;
};

export const getUserTargets = async (userId: string) => {
  const { data } = await api.get(`/admin/users/${userId}/targets`);
  return data;
};

export const assignTarget = async (userId: string, payload: any) => {
  const { data } = await api.post(`/admin/users/${userId}/targets`, payload);
  return data;
};

export const updateTarget = async (userId: string, targetId: string, payload: any) => {
  const { data } = await api.put(`/admin/users/${userId}/targets/${targetId}`, payload);
  return data;
};

export const unlockUser = async (userId: string) => {
  const { data } = await api.post(`/admin/users/${userId}/unlock`);
  return data;
};

const officeToLocationOption = (office: Office) => ({
  id: office.id,
  name: office.name,
  type: 'OFFICE' as const,
  parentId: null,
  countryId: null,
  workspaceId: office.workspaceId,
});

export const getOffices = async () => {
  const { data } = await api.get('/admin/users/meta/offices');
  return data.data;
};

// Legacy hook compatibility: the Locations module was removed; use Office Locations metadata.
export const getLocationTree = async () => {
  const data = await getOffices();
  const tree = (data?.offices || []).filter((office: Office) => office.isActive !== false).map(officeToLocationOption);
  return { tree };
};

export const getAllLocations = async () => {
  const data = await getOffices();
  const locations = (data?.offices || []).filter((office: Office) => office.isActive !== false).map(officeToLocationOption);
  return { locations };
};

export const getRoles = async () => {
  const { data } = await api.get('/admin/users/meta/roles', {
    params: { includeInactive: true },
  });
  return data.data;
};

export const getDepartments = async () => {
  const { data } = await api.get('/admin/users/meta/departments');
  return data.data;
};

export const getSupervisors = async () => {
  const { data } = await api.get('/admin/users/meta/supervisors');
  return data.data;
};
