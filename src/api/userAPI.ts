// src/api/userAPI.ts - Novo arquivo
import { User } from "@/types/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export interface UserSearchResult {
  success: boolean;
  users?: User[];
  count?: number;
  error?: string;
}

class UserAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Faz requisição HTTP genérica com autenticação
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Obter token do localStorage
    const token = localStorage.getItem("auth_token");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 User API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`📥 User API Response:`, data);

      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ User API Error: ${url}`, error);
      throw error;
    }
  }

  /**
   * Buscar usuários por query (username ou email)
   */
  async searchUsers(query: string): Promise<UserSearchResult> {
    const encodedQuery = encodeURIComponent(query);
    return this.request<UserSearchResult>(`/auth/search?q=${encodedQuery}`);
  }

  /**
   * Buscar usuário específico por username ou email
   */
  async findUser(identifier: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const result = await this.searchUsers(identifier);
      
      if (result.success && result.users && result.users.length > 0) {
        // Procurar correspondência exata
        const exactMatch = result.users.find(
          user => user.username === identifier || user.email === identifier
        );
        
        if (exactMatch) {
          return { success: true, user: exactMatch };
        }
        
        // Se não encontrar correspondência exata, retornar o primeiro resultado
        return { success: true, user: result.users[0] };
      }
      
      return { success: false, error: "Usuário não encontrado" };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro ao buscar usuário" 
      };
    }
  }
  /**
   * Buscar usuário por ID
   */
  async getUserById(userId: string): Promise<{ 
    success: boolean; 
    user?: User; 
    error?: string 
  }> {
    try {
      const response = await this.request<{ user: User }>(`/auth/users/${userId}`, {
        method: 'GET'
      });
      return { success: true, user: response.user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro ao buscar usuário por ID" 
      };
    }
  }
}

/**
 * Instância única da API para uso em toda a aplicação
 */
export const userAPI = new UserAPI();

/**
 * Export da classe para casos especiais
 */
export { UserAPI };

/**
 * Export default da instância
 */
export default userAPI;