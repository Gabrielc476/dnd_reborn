// ===========================
// ENCOUNTER API CLIENT
// src/api/encounterAPI.ts
// ===========================

import {
  EncounterResponse,
  EncountersListResponse,
  EncounterDetail,
  EncounterSummary,
  CreateEncounterRequest,
  UpdateEncounterData,
  EncounterOperationResponse,
  EncounterFilters,
  EncountersSearchRequest
} from '@/types/encounter';

// ===========================
// CONFIGURAÇÃO DA API
// ===========================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

// ===========================
// CLIENTE ENCOUNTER API
// ===========================

class EncounterAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Método privado para fazer requisições HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Obter token de autenticação
    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: "Erro na requisição" 
        }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição ${endpoint}:`, error);
      throw error instanceof Error ? error : new Error('Erro desconhecido na requisição');
    }
  }

  // ===========================
  // MÉTODOS CRUD PARA ENCOUNTERS
  // ===========================

  /**
   * Lista todos os encounters de uma campanha
   */
  async getEncounters(campaignId: string): Promise<EncountersListResponse> {
    return this.request<EncountersListResponse>(
      `/campaign/${campaignId}/encounters`
    );
  }

  /**
   * Busca um encounter específico
   */
  async getEncounter(campaignId: string, encounterId: string): Promise<EncounterResponse> {
    return this.request<EncounterResponse>(
      `/campaign/${campaignId}/encounters/${encounterId}`
    );
  }

  /**
   * Cria um novo encounter
   */
  async createEncounter(
    campaignId: string, 
    data: CreateEncounterRequest
  ): Promise<EncounterOperationResponse> {
    return this.request<EncounterOperationResponse>(
      `/campaign/${campaignId}/encounters`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Atualiza um encounter existente
   */
  async updateEncounter(
    campaignId: string,
    encounterId: string,
    data: UpdateEncounterData
  ): Promise<EncounterOperationResponse> {
    return this.request<EncounterOperationResponse>(
      `/campaign/${campaignId}/encounters/${encounterId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Deleta um encounter
   */
  async deleteEncounter(
    campaignId: string,
    encounterId: string
  ): Promise<EncounterOperationResponse> {
    return this.request<EncounterOperationResponse>(
      `/campaign/${campaignId}/encounters/${encounterId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // ===========================
  // MÉTODOS DE BUSCA E FILTROS
  // ===========================

  /**
   * Busca encounters com filtros
   */
  async searchEncounters(
    campaignId: string,
    searchRequest: EncountersSearchRequest
  ): Promise<EncountersListResponse> {
    const params = new URLSearchParams();
    
    if (searchRequest.page) {
      params.append('page', searchRequest.page.toString());
    }
    
    if (searchRequest.per_page) {
      params.append('per_page', searchRequest.per_page.toString());
    }
    
    if (searchRequest.sort_by) {
      params.append('sort_by', searchRequest.sort_by);
    }
    
    if (searchRequest.sort_order) {
      params.append('sort_order', searchRequest.sort_order);
    }

    // Adicionar filtros como parâmetros de query
    if (searchRequest.filters) {
      const { filters } = searchRequest;
      
      if (filters.difficulty) {
        params.append('difficulty', filters.difficulty);
      }
      
      if (filters.is_completed !== undefined) {
        params.append('is_completed', filters.is_completed.toString());
      }
      
      if (filters.session_number) {
        params.append('session_number', filters.session_number.toString());
      }
      
      if (filters.has_rewards !== undefined) {
        params.append('has_rewards', filters.has_rewards.toString());
      }
      
      if (filters.search_term) {
        params.append('search_term', filters.search_term);
      }
    }

    const queryString = params.toString();
    const endpoint = queryString 
      ? `/campaign/${campaignId}/encounters?${queryString}`
      : `/campaign/${campaignId}/encounters`;

    return this.request<EncountersListResponse>(endpoint);
  }

  /**
   * Busca encounters por dificuldade
   */
  async getEncountersByDifficulty(
    campaignId: string,
    difficulty: string
  ): Promise<EncountersListResponse> {
    return this.searchEncounters(campaignId, {
      filters: { difficulty: difficulty as any }
    });
  }

  /**
   * Busca encounters completos ou pendentes
   */
  async getEncountersByCompletion(
    campaignId: string,
    completed: boolean
  ): Promise<EncountersListResponse> {
    return this.searchEncounters(campaignId, {
      filters: { is_completed: completed }
    });
  }

  /**
   * Busca encounters por sessão
   */
  async getEncountersBySession(
    campaignId: string,
    sessionNumber: number
  ): Promise<EncountersListResponse> {
    return this.searchEncounters(campaignId, {
      filters: { session_number: sessionNumber }
    });
  }

  // ===========================
  // MÉTODOS DE CONVENIÊNCIA
  // ===========================

  /**
   * Marca um encounter como completo
   */
  async completeEncounter(
    campaignId: string,
    encounterId: string,
    rewards_xp?: number
  ): Promise<EncounterOperationResponse> {
    return this.updateEncounter(campaignId, encounterId, {
      is_completed: true,
      ...(rewards_xp && { rewards_xp })
    });
  }

  /**
   * Marca um encounter como pendente
   */
  async uncompleteEncounter(
    campaignId: string,
    encounterId: string
  ): Promise<EncounterOperationResponse> {
    return this.updateEncounter(campaignId, encounterId, {
      is_completed: false
    });
  }

  /**
   * Atualiza apenas o XP de recompensa
   */
  async updateEncounterXP(
    campaignId: string,
    encounterId: string,
    rewards_xp: number
  ): Promise<EncounterOperationResponse> {
    return this.updateEncounter(campaignId, encounterId, {
      rewards_xp
    });
  }

  /**
   * Atualiza apenas as notas do encounter
   */
  async updateEncounterNotes(
    campaignId: string,
    encounterId: string,
    notes: string
  ): Promise<EncounterOperationResponse> {
    return this.updateEncounter(campaignId, encounterId, {
      notes
    });
  }

  // ===========================
  // MÉTODOS DE UTILIDADE
  // ===========================

  /**
   * Verifica se um encounter existe
   */
  async encounterExists(campaignId: string, encounterId: string): Promise<boolean> {
    try {
      const response = await this.getEncounter(campaignId, encounterId);
      return response.success && !!response.encounter;
    } catch {
      return false;
    }
  }

  /**
   * Obtém estatísticas rápidas dos encounters
   */
  async getEncountersStats(campaignId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    totalXP: number;
  }> {
    try {
      const response = await this.getEncounters(campaignId);
      
      if (!response.success || !response.encounters) {
        return { total: 0, completed: 0, pending: 0, totalXP: 0 };
      }

      const encounters = response.encounters;
      const completed = encounters.filter(e => e.is_completed);
      const pending = encounters.filter(e => !e.is_completed);
      const totalXP = encounters.reduce((sum, e) => sum + (e.rewards_xp || 0), 0);

      return {
        total: encounters.length,
        completed: completed.length,
        pending: pending.length,
        totalXP
      };
    } catch {
      return { total: 0, completed: 0, pending: 0, totalXP: 0 };
    }
  }

  /**
   * Duplica um encounter existente
   */
  async duplicateEncounter(
    campaignId: string,
    encounterId: string,
    newName?: string
  ): Promise<EncounterOperationResponse> {
    try {
      // Buscar encounter original
      const originalResponse = await this.getEncounter(campaignId, encounterId);
      
      if (!originalResponse.success || !originalResponse.encounter) {
        throw new Error('Encounter original não encontrado');
      }

      const original = originalResponse.encounter;
      
      // Criar novo encounter baseado no original
      const newEncounterData: CreateEncounterRequest = {
        name: newName || `${original.name} (Cópia)`,
        description: original.description,
        difficulty: original.difficulty,
        npcs: original.npcs,
        location: original.location,
        rewards_xp: original.rewards_xp,
        session_number: original.session_number,
        notes: original.notes
      };

      return this.createEncounter(campaignId, newEncounterData);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Erro ao duplicar encounter');
    }
  }

  // ===========================
  // MÉTODOS DE VALIDAÇÃO
  // ===========================

  /**
   * Valida dados antes de criar encounter
   */
  private validateCreateData(data: CreateEncounterRequest): void {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Nome do encounter deve ter pelo menos 2 caracteres');
    }
    
    if (data.rewards_xp !== undefined && data.rewards_xp < 0) {
      throw new Error('XP de recompensa deve ser não negativo');
    }
  }

  /**
   * Valida dados antes de atualizar encounter
   */
  private validateUpdateData(data: UpdateEncounterData): void {
    if (data.name !== undefined && (!data.name || data.name.trim().length < 2)) {
      throw new Error('Nome do encounter deve ter pelo menos 2 caracteres');
    }
    
    if (data.rewards_xp !== undefined && data.rewards_xp < 0) {
      throw new Error('XP de recompensa deve ser não negativo');
    }
  }
}

// ===========================
// INSTÂNCIA SINGLETON
// ===========================

/**
 * Instância singleton do cliente API
 */
export const encounterAPI = new EncounterAPI();

/**
 * Exportar também a classe para casos onde é necessária uma instância personalizada
 */
export { EncounterAPI };

/**
 * Hook personalizado para usar a API com tratamento de loading/error
 */
export function useEncounterAPI() {
  return {
    api: encounterAPI,
    
    // Métodos com tratamento de loading automático podem ser adicionados aqui
    async safeGetEncounters(campaignId: string) {
      try {
        return await encounterAPI.getEncounters(campaignId);
      } catch (error) {
        console.error('Erro ao carregar encounters:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          encounters: [],
          count: 0
        };
      }
    },

    async safeGetEncounter(campaignId: string, encounterId: string) {
      try {
        return await encounterAPI.getEncounter(campaignId, encounterId);
      } catch (error) {
        console.error('Erro ao carregar encounter:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
      }
    }
  };
}

// ===========================
// TIPOS PARA RESPONSE CACHING
// ===========================

/**
 * Interface para cache de responses (pode ser usado com React Query, SWR, etc.)
 */
export interface EncounterCacheConfig {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
}

/**
 * Configuração padrão para cache
 */
export const defaultCacheConfig: EncounterCacheConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000, // 10 minutos
  refetchOnWindowFocus: false,
  refetchInterval: 0
};

export default encounterAPI;