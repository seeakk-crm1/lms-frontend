import api from '../../../services/api';

export interface ImportWarningItem {
  row: number;
  field: string;
  value: string;
  reason: string;
}

export interface ImportApprovalItem {
  row: number;
  leadName: string;
  stage: string;
  supervisor: string;
  status: string;
}

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
    warningCount?: number;
    approvalRequestsCount?: number;
    totalRevenueImported?: number;
    pendingApprovalCount?: number;
    warnings?: ImportWarningItem[];
    approvals?: ImportApprovalItem[];
    errors?: Array<{ row: number; error: string }>;
  };
}

export interface ValidationReport {
  rowsFound: number;
  readyToImport: number;
  rowsWithIssues: number;
  fieldIssuesSummary: Array<{ field: string; count: number }>;
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

export const validateLeadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<{ success: boolean; data: ValidationReport }>(
    '/leads/import/validate',
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
