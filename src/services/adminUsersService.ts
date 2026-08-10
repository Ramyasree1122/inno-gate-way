import { get } from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export const adminUsersService = {
  getAdminUsers: async (): Promise<AdminUser[]> => {
    return get<AdminUser[]>(API_ENDPOINTS.ADMIN_USERS);
  },
};
