export interface LOBAnalysisFilters {
  dateFrom?: string;
  dateTo?: string;
  stage?: string;
  reasonId?: string;
  userId?: string;
  locationId?: string;
}

export interface LOBSummaryStageItem {
  stage: string;
  count: number;
}

export interface LOBSummaryReasonItem {
  reason: string;
  count: number;
}

export interface LOBAnalysisSummary {
  total_leads: number;
  total_lob_leads: number;
  lob_percentage: number;
  stage_wise: LOBSummaryStageItem[];
  top_reasons: LOBSummaryReasonItem[];
}

export interface LOBStageBreakdown {
  labels: string[];
  lob_counts: number[];
  total_reference: number;
}

export interface LOBAuditItem {
  lead_id: string;
  lead_name: string;
  from_stage: string;
  reason: string;
  changed_by: string;
  comment?: string | null;
  created_at: string;
}

export interface LOBAuditResponse {
  success: boolean;
  data: LOBAuditItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
