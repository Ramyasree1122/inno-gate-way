import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";
import { axiosInstance } from "@/lib/axios";

// Helper functions defined at the top
const getAiId = () => typeof window !== "undefined" ? window.localStorage.getItem("AI_ID") : null;
const getUserId = () => typeof window !== "undefined" ? window.localStorage.getItem("USER_ID") : null;

export const chatService = {
  getUserInfo: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_USER_INFO, {
        headers: {
          Authorization: `Bearer ${getAiId()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  },
  
  getCheckUsage: async () => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.CHECK_USAGE.replace("{id}", getUserId() || ""),
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  },

  getChatSessions: async () => {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.GET_CHAT_SESSIONS}?include_archived=false`,
        {
          headers: {
            Authorization: `Bearer ${getAiId()}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  },
  getChatById: async (id:string) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_CHAT_BY_ID.replace("{id}", id), {
        headers: {
          Authorization: `Bearer ${getAiId()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  },
};