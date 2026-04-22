import api from '../../../services/api';

export interface ImportStatusResponse {
  success: boolean;
  data: {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    total: number;
    processed: number;
    success: number;
    failed: number;
    error_file_url: string | null;
  };
}

export const uploadLeadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<{ success: boolean; data: { job_id: string; status: string } }>(
    '/leads/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const fetchImportStatus = async (jobId: string) => {
  const response = await api.get<ImportStatusResponse>(`/leads/import/${jobId}`);
  return response.data;
};
