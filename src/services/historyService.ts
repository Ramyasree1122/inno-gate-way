import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";

export const historyService = {
  getHistory: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_HISTORY);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  },
};
