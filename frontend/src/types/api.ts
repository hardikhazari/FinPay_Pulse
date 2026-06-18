export interface RfmScore {
  customerId: string;
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  segment: string;
  computedAt: string;
}

export interface ChurnScore {
  customerId: string;
  churnProbability: number;
  riskTier: 'Low' | 'Medium' | 'High';
  computedAt: string;
}

export interface Forecast {
  month: string;
  predictedRevenue: number | string;
  modelUsed: string;
  computedAt: string;
}

export interface CohortMatrixRow {
  cohortMonth: string;
  [key: string]: string | number; // For M0, M1, etc. percentages
}

export interface UploadResponse {
  message: string;
  inserted: number;
  skipped: number;
  errors: Array<{ row: number; reason: string }>;
}
