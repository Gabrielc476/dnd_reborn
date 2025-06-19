// ===========================
// AUTH API - CHAMADAS HTTP
// ===========================

import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  User,
} from "../types/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Classe para gerenciar chamadas da API de autenticação
 */
class AuthAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Faz requisição HTTP genérica
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro na requisição");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro de conexão");
    }
  }

  /**
   * Login do usuário
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Registro de novo usuário
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  /**
   * Buscar perfil do usuário
   */
  async getProfile(userId: string, token: string): Promise<{ user: User }> {
    return this.request<{ user: User }>(`/auth/profile/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Verifica se o servidor está funcionando
   */
  async healthCheck(): Promise<{ message: string }> {
    return this.request<{ message: string }>("/");
  }
}

// Instância singleton da API
export const authAPI = new AuthAPI();

export default authAPI;
