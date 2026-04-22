import api from './api';
import { Role, RoleFilters, CreateRoleInput, UpdateRoleInput, Permission } from '../types/role.types';

export const getRoles = async (params?: RoleFilters & { page?: number; limit?: number }) => {
  const response = await api.get('/admin/roles', { params });
  return response.data;
};

export const getRoleById = async (id: string) => {
  const response = await api.get(`/admin/roles/${id}`);
  return response.data.data;
};

export const createRole = async (data: CreateRoleInput) => {
  const response = await api.post('/admin/roles', data);
  return response.data.data;
};

export const updateRole = async (id: string, data: UpdateRoleInput) => {
  const response = await api.put(`/admin/roles/${id}`, data);
  return response.data.data;
};

export const deleteRole = async (id: string) => {
  const response = await api.delete(`/admin/roles/${id}`);
  return response.data;
};

export const getPermissions = async () => {
  const response = await api.get('/admin/roles/meta/permissions');
  return response.data.data;
};
