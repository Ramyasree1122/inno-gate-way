import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";
import { axiosInstance } from "@/lib/axios";

export const chatService = {
  getUserInfo: async () => {
    try {
      const aiId = typeof window !== "undefined" ? window.localStorage.getItem("AI_ID") : null;
      const response = await axiosInstance.get(API_ENDPOINTS.GET_USER_INFO, {
        headers: {
          Authorization: `Bearer ${aiId}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  },
  getCheckUsage: async () => {
    try {
      const userId = typeof window !== "undefined" ? window.localStorage.getItem("USER_ID") : null;
      const response = await axiosInstance.get(
        API_ENDPOINTS.CHECK_USAGE.replace("{id}", userId || ""),
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  },
  getChatSessions: async () => {
    try {
      const aiId = typeof window !== "undefined" ? window.localStorage.getItem("AI_ID") : null;
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.GET_CHAT_SESSIONS}?include_archived=false`,
        {
          headers: {
            Authorization: `Bearer ${aiId}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  },
};
