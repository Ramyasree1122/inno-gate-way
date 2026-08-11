export type Role = "User" | "Admin" | "Super Admin";

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (email: string, otp: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface GenerateAPIKeyPayload {
  access_anthropic: boolean;
  access_qwen: boolean;
  expires_at: string | null;
  owner: string;
  rate_limit_per_minute: number;
  workspace_id: string;
}
