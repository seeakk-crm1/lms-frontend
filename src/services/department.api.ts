import api from './api';
import { 
  Department, 
  DepartmentFilters, 
  CreateDepartmentInput, 
  UpdateDepartmentInput 
} from '../types/department.types';

export const getDepartments = async (params?: DepartmentFilters & { page?: number; limit?: number }) => {
  const response = await api.get('/admin/departments', { params });
  return response.data;
};

export const getActiveDepartments = async () => {
    const response = await api.get('/admin/departments/active');
    return response.data.data;
};

export const createDepartment = async (data: CreateDepartmentInput) => {
  const response = await api.post('/admin/departments', data);
  return response.data.data;
};

export const updateDepartment = async (id: string, data: UpdateDepartmentInput) => {
  const response = await api.put(`/admin/departments/${id}`, data);
  return response.data.data;
};

export const deleteDepartment = async (id: string) => {
  const response = await api.delete(`/admin/departments/${id}`);
  return response.data;
};
