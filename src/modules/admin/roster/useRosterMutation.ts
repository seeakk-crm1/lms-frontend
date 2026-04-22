import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import type { RosterFormValues, RosterMutationApiResponse } from './types';

interface CreatePayload {
  userId: string;
  rosterType: RosterFormValues['rosterType'];
  name: string;
  startDate: string;
  endDate?: string | null;
  shiftSession?: RosterFormValues['shiftSession'];
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
  status: RosterFormValues['status'];
}

interface UpdatePayload {
  id: string;
  data: Partial<CreatePayload>;
}

interface BulkDepartmentPayload {
  departmentId: string;
  rosterType: RosterFormValues['rosterType'];
  name: string;
  startDate: string;
  endDate?: string | null;
  shiftSession?: RosterFormValues['shiftSession'];
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
  status: RosterFormValues['status'];
}

const createRosterEntry = async (payload: CreatePayload): Promise<RosterMutationApiResponse> => {
  const response = await api.post('/admin/roster', payload);
  return response.data;
};

const updateRosterEntry = async ({ id, data }: UpdatePayload): Promise<RosterMutationApiResponse> => {
  const response = await api.put(`/admin/roster/${id}`, data);
  return response.data;
};

const deleteRosterEntry = async (id: string): Promise<RosterMutationApiResponse> => {
  const response = await api.delete(`/admin/roster/${id}`);
  return response.data;
};

const bulkAssignDepartment = async (payload: BulkDepartmentPayload): Promise<RosterMutationApiResponse> => {
  const response = await api.post('/admin/roster/bulk/department', payload);
  return response.data;
};

export const useCreateRosterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRosterEntry,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roster-entries', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['roster-users'] });
      toast.success(response?.message || 'Roster created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create roster');
    },
  });
};

export const useUpdateRosterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRosterEntry,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['roster-entries'] });
      queryClient.invalidateQueries({ queryKey: ['roster-users'] });
      toast.success(response?.message || 'Roster updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update roster');
    },
  });
};

export const useDeleteRosterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRosterEntry,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['roster-entries'] });
      toast.success(response?.message || 'Roster deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete roster');
    },
  });
};

export const useBulkRosterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkAssignDepartment,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['roster-users'] });
      queryClient.invalidateQueries({ queryKey: ['roster-entries'] });
      toast.success(response?.message || 'Roster assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to assign roster');
    },
  });
};
