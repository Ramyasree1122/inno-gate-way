import { get, post } from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateAdminPayload {
  email: string;
  password: string;
  full_name: string;
}

export const adminUsersService = {
  getAdminUsers: async (): Promise<AdminUser[]> => {
    return get<AdminUser[]>(API_ENDPOINTS.ADMIN_USERS);
  },

  searchAdminUsers: async (query?: string): Promise<AdminUser[]> => {
    const params = query && query.trim() ? { params: { search: query.trim() } } : undefined;
    return get<AdminUser[]>(API_ENDPOINTS.ADMIN_USERS, params);
  },

  createAdmin: async (payload: CreateAdminPayload): Promise<AdminUser> => {
    return post<AdminUser>(API_ENDPOINTS.ADMIN_USERS, {
      email: payload.email,
      password: payload.password,
      full_name: payload.full_name,
    });
  },
};
