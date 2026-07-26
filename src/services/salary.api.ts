import api from './api';
import {
  SalaryRecord,
  SalaryApprovalStage,
  GenerateSalaryParams,
  SalaryRecordStatus,
} from '../types/salary.types';

export const salaryApi = {
  // Salary Calculations
  getCalculations: async (params?: {
    month?: number;
    year?: number;
    departmentId?: string;
    officeId?: string;
    status?: SalaryRecordStatus;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get('/salary/calculation', { params });
    return response.data;
  },

  generateSalary: async (data: GenerateSalaryParams) => {
    const response = await api.post('/salary/calculation/generate', data);
    return response.data;
  },

  submitForApproval: async (salaryRecordIds: string[]) => {
    const response = await api.post('/salary/calculation/submit', { salaryRecordIds });
    return response.data;
  },

  updateCalculation: async (
    id: string,
    data: { bonus?: number; deduction?: number; advanceAmount?: number; remarks?: string },
  ) => {
    const response = await api.put(`/salary/calculation/${id}`, data);
    return response.data;
  },

  deleteCalculation: async (id: string) => {
    const response = await api.delete(`/salary/calculation/${id}`);
    return response.data;
  },

  // Approval Stages
  getStages: async () => {
    const response = await api.get('/salary/stages');
    return response.data;
  },

  createStage: async (data: {
    name: string;
    order?: number;
    approverUserId: string;
    designation?: string;
    isMandatory?: boolean;
    isActive?: boolean;
  }) => {
    const response = await api.post('/salary/stages', data);
    return response.data;
  },

  updateStage: async (
    id: string,
    data: {
      name?: string;
      order?: number;
      approverUserId?: string;
      designation?: string;
      isMandatory?: boolean;
      isActive?: boolean;
    },
  ) => {
    const response = await api.put(`/salary/stages/${id}`, data);
    return response.data;
  },

  deleteStage: async (id: string) => {
    const response = await api.delete(`/salary/stages/${id}`);
    return response.data;
  },

  reorderStages: async (stages: { id: string; order: number }[]) => {
    const response = await api.put('/salary/stages/reorder', { stages });
    return response.data;
  },

  updateReleaseSetting: async (salaryReleaseDay: number) => {
    const response = await api.put('/salary/stages/setting', { salaryReleaseDay });
    return response.data;
  },

  // Pending Approvals
  getPendingApprovals: async (params?: {
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get('/salary/approvals/pending', { params });
    return response.data;
  },

  processApprovalAction: async (
    id: string,
    action: 'APPROVE' | 'REJECT' | 'RETURN',
    remarks?: string,
  ) => {
    const response = await api.post(`/salary/approvals/${id}/action`, { action, remarks });
    return response.data;
  },

  editSalaryBeforeApproval: async (
    id: string,
    data: {
      bonus?: number;
      deduction?: number;
      advanceAmount?: number;
      finalSalary?: number;
      reason: string;
    },
  ) => {
    const response = await api.put(`/salary/approvals/${id}/edit`, data);
    return response.data;
  },

  getSalaryHistory: async (id: string) => {
    const response = await api.get(`/salary/${id}/history`);
    return response.data;
  },
};
