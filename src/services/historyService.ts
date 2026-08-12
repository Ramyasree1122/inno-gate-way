import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";

export const historyService = {
  getHistory: async (params?: Record<string, any>) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_HISTORY, {
        params,
        paramsSerializer: (p) => {
          const searchParams = new URLSearchParams();
          for (const key in p) {
            if (p[key] === null || p[key] === undefined) continue;
            if (Array.isArray(p[key])) {
              p[key].forEach((val) => searchParams.append(key, val));
            } else {
              searchParams.append(key, p[key]);
            }
          }
          return searchParams.toString();
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  },
};
