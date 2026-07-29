import { get, post } from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';

/**
 * Authentication Service
 * Holds all API calls related to authentication (login, logout, verification, etc.)
 */
export const authService = {
  /**
   * Request OTP
   * Sends an OTP to the provided email.
   */
  requestOTP: async (email: string) => {
    return post(API_ENDPOINTS.AUTH.REQUEST_OTP, { email });
  },

  /**
   * Login user with OTP
   * Replace the endpoint with your actual backend URL when ready.
   */
  loginUser: async (email: string, otp: string) => {
    // The backend expects the OTP to be sent in the 'code' field
    return post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, code: otp });
  },

  /**
   * Login admin with password
   */
  loginAdmin: async (email: string, password: string) => {
    // TODO: Replace with your actual backend endpoint
    // return post(API_ENDPOINTS.AUTH.ADMIN_LOGIN, { email, password });
  },

  /**
   * Logout user
   * Clears localStorage and redirects user to the login page.
   */
  logoutUser: async () => {
    try {
      await post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Failed to logout from backend:", error);
    } finally {
      window.localStorage.clear();
      window.location.href = "/login";
    }
  },
};
