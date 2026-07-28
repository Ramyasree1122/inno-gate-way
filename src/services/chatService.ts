import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";
import { axiosInstance } from "@/lib/axios";

const USER_ID = window.localStorage.getItem("USER_ID");
const AI_ID = window.localStorage.getItem("AI_ID");

export const chatService = {
  getUserInfo: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_USER_INFO, {
        headers: {
          Authorization: `Bearer ${AI_ID}`,
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
        API_ENDPOINTS.CHECK_USAGE.replace("{id}", USER_ID),
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
            Authorization: `Bearer ${AI_ID}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  },
};
