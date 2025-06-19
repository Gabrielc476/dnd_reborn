// ===========================
// USER TYPES - SIMPLIFICADO
// ===========================

/**
 * Interface base do usuário
 */
export interface User {
  id: string;
  email: string;
  username: string;
}

/**
 * Dados para registro
 */
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

/**
 * Dados para login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Resposta do registro
 */
export interface RegisterResponse {
  message: string;
  user_id: string;
}

/**
 * Resposta do login
 */
export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

/**
 * Context de autenticação
 */
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;

  // Utility functions
  formatUserName: () => string;
  getUserInitials: () => string;
  isValidEmail: (email: string) => boolean;
  isValidPassword: (password: string) => boolean;
  isValidUsername: (username: string) => boolean;
}

/**
 * Resposta padrão da API
 */
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}
