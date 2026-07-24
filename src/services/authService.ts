import { get, post } from '@/lib/axios';

/**
 * A test function to verify that our GET API method is working correctly.
 * It hits a free, open public API and logs the response to the console.
 */
export const testOpenGetApi = async () => {
  try {
    console.log('Calling open test API...');
    const response = await get('https://jsonplaceholder.typicode.com/todos/1');
    console.log('✅ Open API Test Success! Response:', response);
    return response;
  } catch (error) {
    console.error('❌ Open API Test Failed:', error);
    throw error;
  }
};

/**
 * Authentication Service
 * Holds all API calls related to authentication (login, logout, verification, etc.)
 */
export const authService = {
  /**
   * Login user with OTP
   * Replace the endpoint with your actual backend URL when ready.
   */
  loginUser: async (email: string, otp: string) => {
    console.log(`Sending login request for email: ${email}`);
    // TODO: Replace with your actual backend endpoint
    // return post('/api/v1/auth/login', { email, otp });
  },

  /**
   * Login admin with password
   */
  loginAdmin: async (email: string, password: string) => {
    console.log(`Sending admin login request for email: ${email}`);
    // TODO: Replace with your actual backend endpoint
    // return post('/api/v1/admin/login', { email, password });
  },
  
  // Expose the test function on the service for easy importing
  testOpenGetApi,
};
