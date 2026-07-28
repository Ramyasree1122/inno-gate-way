import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";
import { axiosInstance } from "@/lib/axios";

const USER_ID = "4502d331-0516-4725-a61e-e10f815ecf96";
const AI_ID = "inno_ai_sk_aORlR16Yg3_pZ-U_8GGpBQx84qUD_iIb_1784896189";

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
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.GET_CHAT_SESSIONS}?include_archived=false`,
          {
            headers: {
              Authorization: `Bearer ${AI_ID}`,
            },
          },
        );
        return response.data
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  }
};
