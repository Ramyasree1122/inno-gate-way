import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";
import { axiosInstance } from "@/lib/axios";

const USER_ID = "ec05c87f-3e7a-4cd9-a4ba-2917c7369a07";

export const chatService = {
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
  getChatSessions:async ()=>{
    try{
        const response=await axiosInstance.get(`${API_ENDPOINTS.GET_CHAT_SESSIONS}?include_archived=false`);
        return response.data
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  }
};
