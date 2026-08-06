import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";

const bearerToken = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

export const keymanagementService = {
  getAllWorkspaces: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_WORKSPACES, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  },
  createWorkspace: async (workspaceName: string) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.GET_WORKSPACES,
        { name: workspaceName },
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  },
  updateWorkspace: async (workspaceId: string, workspaceName: string) => {
    try {
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.GET_WORKSPACES}/${workspaceId}`,
        { name: workspaceName },
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  },
  getAllAPIkeys: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_API_KEYS, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  },
};
