import api from './api';
import { User, TargetSetting, TargetType } from '../types/user.types';

export const getUsers = async (params: any) => {
  const { data } = await api.get('/admin/users', { params });
  return data; // { success, message, data: { users, total, pages, currentPage } }
};

export const getUserById = async (id: string) => {
  const { data } = await api.get(`/admin/users/${id}`);
  return data; // { success, message, data: { user } }
};

export const createUser = async (payload: any) => {
  const { data } = await api.post('/admin/users', payload);
  return data;
};

export const updateUser = async (id: string, payload: any) => {
  const { data } = await api.put(`/admin/users/${id}`, payload);
  return data;
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

// Meta Data (Locations & Offices)
export const getLocationTree = async () => {
  const { data } = await api.get('/admin/users/meta/locations/tree');
  return data;
};

export const getAllLocations = async () => {
  const { data } = await api.get('/admin/users/meta/locations/all');
  return data;
};

export const getOffices = async () => {
  const { data } = await api.get('/admin/users/meta/offices');
  return data;
};

export const getRoles = async () => {
  const { data } = await api.get('/admin/users/meta/roles');
  return data;
};

export const getDepartments = async () => {
  const { data } = await api.get('/admin/users/meta/departments');
  return data;
};

export const getSupervisors = async () => {
  const { data } = await api.get('/admin/users/meta/supervisors');
  return data;
};
