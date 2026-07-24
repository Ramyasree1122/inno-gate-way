export type Role = 'User' | 'Admin' | 'Super Admin';

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
