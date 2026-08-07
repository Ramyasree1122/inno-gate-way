import { get } from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';

export interface DashboardSummaryResponse {
  total_requests: number;
  total_tokens: number;
  optimizer_saved_tokens: number;
  active_api_keys: number;
  active_users: number;
  error_rate: number;
  avg_latency_ms: number;
}

export interface DailyAnalyticsResponse {
  period: string;
  requests: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  optimizer_saved_tokens: number;
  errors: number;
  avg_latency_ms: number;
}

export interface TopUserResponse {
  owner: string;
  requests: number;
  total_tokens: number;
}

export interface TokensByModelResponse {
  model: string;
  requests: number;
  total_tokens: number;
  avg_latency_ms: number;
}

export const dashboardService = {
  getDashboardSummary: async (): Promise<DashboardSummaryResponse> => {
    return get<DashboardSummaryResponse>(API_ENDPOINTS.DASHBOARD_SUMMARY);
  },
  getDailyAnalytics: async (): Promise<DailyAnalyticsResponse[]> => {
    return get<DailyAnalyticsResponse[]>(API_ENDPOINTS.DASHBOARD_DAILY);
  },
  getTopUsers: async (period: string = "all"): Promise<TopUserResponse[]> => {
    return get<TopUserResponse[]>(`${API_ENDPOINTS.DASHBOARD_TOP_USERS}?period=${period}`);
  },
  getTokensByModel: async (): Promise<TokensByModelResponse[]> => {
    return get<TokensByModelResponse[]>(API_ENDPOINTS.DASHBOARD_TOKENS_BY_MODEL);
  },
  getProviders: async (): Promise<any[]> => {
    return get<any[]>(API_ENDPOINTS.AUTH.PROVIDERS);
  },
};
