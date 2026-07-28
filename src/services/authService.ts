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
    console.log(`Requesting OTP for email: ${email}`);
    return post(API_ENDPOINTS.AUTH.REQUEST_OTP, { email });
  },

  /**
   * Login user with OTP
   * Replace the endpoint with your actual backend URL when ready.
   */
  loginUser: async (email: string, otp: string) => {
    console.log(`Sending login request for email: ${email}`);
    // The backend expects the OTP to be sent in the 'code' field
    return post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, code: otp });
  },

  /**
   * Login admin with password
   */
  loginAdmin: async (email: string, password: string) => {
    console.log(`Sending admin login request for email: ${email}`);
    // TODO: Replace with your actual backend endpoint
    // return post(API_ENDPOINTS.AUTH.ADMIN_LOGIN, { email, password });
  },
};
