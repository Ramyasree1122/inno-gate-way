import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";

export const keymanagementService = {
  /** Workspace Management */
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
      const response = await axiosInstance.post(API_ENDPOINTS.GET_WORKSPACES, {
        name: workspaceName,
      });
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
        { name: workspaceName },
      );
      return response.data;
    } catch (error) {
      console.error("Error updating workspace:", error);
      throw error;
    }
  },
  deleteWorkspace: async (workspaceId: string) => {
    try {
      const response = await axiosInstance.delete(
        `${API_ENDPOINTS.GET_WORKSPACES}/${workspaceId}`,
      );
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Error deleting workspace:", error);
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

  changeWorkspace: async (apiKeyId: string, workspaceId: string) => {
    try {
      const response = await axiosInstance.patch(
        `/api/api-keys/${apiKeyId}`,
        { workspace_id: workspaceId }
      );
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Error changing workspace:", error);
      throw error;
    }
  },
  extendKeyDuration: async (apiKeyId: string, days: number = 30) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.EXTEND_API_KEY_DURATION(apiKeyId),
        { days }
      );
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Error extending API key duration:", error);
      throw error;
    }
  },
  regenerateKey: async (apiKeyId: string) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.REGENERATE_API_KEY(apiKeyId)
      );
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Error regenerating API key:", error);
      throw error;
    }
  },
  disableKey: async (apiKeyId: string, isActive: boolean) => {
    try {
      const response = await axiosInstance.patch(
        API_ENDPOINTS.DISABLE_API_KEY(apiKeyId),
        { is_active: isActive }
      );
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Error updating API key active status:", error);
      throw error;
    }
  },
  deleteKey: async (apiKeyId: string) => {
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.DELETE_API_KEY(apiKeyId)
      );
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Error deleting API key:", error);
      throw error;
    }
  },
};
