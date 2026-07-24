import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create a configured axios instance
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '', // Assuming you have an API URL in env
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for tokens if needed
axiosInstance.interceptors.request.use(
  (config) => {
    // You can inject authorization tokens here
    // const token = localStorage.getItem('token');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors like 401 Unauthorized, etc.
    return Promise.reject(error);
  }
);

/**
 * Common GET function using axios
 * @param url The endpoint URL
 * @param config Optional Axios request configuration (params, headers, etc)
 * @returns The response data
 */
export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.get(url, config);
    return response.data;
  } catch (error) {
    // You can add generic error logging here
    console.error(`[GET] Error fetching ${url}:`, error);
    throw error;
  }
};

/**
 * Common POST function using axios
 * @param url The endpoint URL
 * @param data The payload data
 * @param config Optional Axios request configuration
 * @returns The response data
 */
export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.post(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`[POST] Error fetching ${url}:`, error);
    throw error;
  }
};

/**
 * Common PUT function using axios
 * @param url The endpoint URL
 * @param data The payload data
 * @param config Optional Axios request configuration
 * @returns The response data
 */
export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.put(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`[PUT] Error fetching ${url}:`, error);
    throw error;
  }
};

/**
 * Common PATCH function using axios
 * @param url The endpoint URL
 * @param data The payload data
 * @param config Optional Axios request configuration
 * @returns The response data
 */
export const patch = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.patch(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`[PATCH] Error fetching ${url}:`, error);
    throw error;
  }
};

/**
 * Common DELETE function using axios
 * @param url The endpoint URL
 * @param config Optional Axios request configuration
 * @returns The response data
 */
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.delete(url, config);
    return response.data;
  } catch (error) {
    console.error(`[DELETE] Error fetching ${url}:`, error);
    throw error;
  }
};
