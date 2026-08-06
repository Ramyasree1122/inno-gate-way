import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";

export const keymanagementService = {
  getAllWorkspaces: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_WORKSPACES);
      return response.data;
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      throw error;
    }
  },
  createWorkspace: async (workspaceName: string) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.GET_WORKSPACES,
        { name: workspaceName }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating workspace:", error);
      throw error;
    }
  },
  updateWorkspace: async (workspaceId: string, workspaceName: string) => {
    try {
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.GET_WORKSPACES}/${workspaceId}`,
        { name: workspaceName }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating workspace:", error);
      throw error;
    }
  },
  getAllAPIkeys: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_API_KEYS);
      return response.data;
    } catch (error) {
      console.error("Error fetching API keys:", error);
      throw error;
    }
  },
};
