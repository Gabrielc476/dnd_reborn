// ===========================
// CAMPAIGN API CLIENT
// api/campaignAPI.ts
// ===========================

import {
  Campaign,
  CreateCampaignRequest,
  CreateCampaignResponse,
  UpdateCampaignRequest,
  CampaignResponse,
  CampaignListResponse,
  CampaignStatsResponse,
  JoinCampaignRequest,
  AddEncounterRequest,
  AddLootRequest,
  AssignLootRequest,
  CampaignSearchRequest,
  CampaignFilters
} from "@/types/createCampaign";

import {
  CreateNPCRequest,
  UpdateNPCRequest,
  NPC,
  CreateSessionRequest,
  UpdateSessionRequest,
  GameSession,
  UpdateEncounterRequest,
  CompleteEncounterRequest,
  UpdateLootRequest,
  CampaignDashboard,
  ActivityFeed,
  BulkOperation,
  BulkOperationResult,
  CampaignContentFilters
} from "@/types/manageCampaign";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

/**
 * Classe para gerenciar chamadas da API de campanhas
 */
class CampaignAPI {
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
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro de conexão");
    }
  }

  // ===========================
  // CAMPAIGN BASIC OPERATIONS
  // ===========================

  /**
   * Criar nova campanha
   */
  async createCampaign(data: CreateCampaignRequest): Promise<CreateCampaignResponse> {
    return this.request<CreateCampaignResponse>("/campaign/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Buscar campanha por ID
   */
  async getCampaignById(id: string): Promise<CampaignResponse> {
    return this.request<CampaignResponse>(`/campaign/${id}`);
  }

  /**
   * Atualizar campanha
   */
  async updateCampaign(id: string, data: UpdateCampaignRequest): Promise<CampaignResponse> {
    return this.request<CampaignResponse>(`/campaign/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Deletar campanha
   */
  async deleteCampaign(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}`, {
      method: "DELETE",
    });
  }

  // ===========================
  // CAMPAIGN LISTS & SEARCH
  // ===========================

  /**
   * Buscar campanhas do GM
   */
  async getGMCampaigns(): Promise<CampaignListResponse> {
    return this.request<CampaignListResponse>("/campaign/my");
  }

  /**
   * Buscar campanhas do jogador
   */
  async getPlayerCampaigns(): Promise<CampaignListResponse> {
    return this.request<CampaignListResponse>("/campaign/player");
  }

  /**
   * Buscar campanhas públicas
   */
  async getPublicCampaigns(filters?: CampaignFilters): Promise<CampaignListResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => queryParams.append(key, item.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/campaign/public?${queryString}` : "/campaign/public";
    
    return this.request<CampaignListResponse>(endpoint);
  }

  /**
   * Buscar campanhas com filtros avançados
   */
  async searchCampaigns(searchRequest: CampaignSearchRequest): Promise<CampaignListResponse> {
    return this.request<CampaignListResponse>("/campaign/search", {
      method: "POST",
      body: JSON.stringify(searchRequest),
    });
  }

  // ===========================
  // PLAYER MANAGEMENT
  // ===========================

  /**
   * Entrar em uma campanha
   */
  async joinCampaign(id: string, data?: JoinCampaignRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}/join`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    });
  }

  /**
   * Sair de uma campanha
   */
  async leaveCampaign(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}/leave`, {
      method: "POST",
    });
  }

  /**
   * Adicionar jogador à campanha (GM only)
   */
  async addPlayer(id: string, userId: string, data?: { character_id?: string; notes?: string }): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}/players`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, ...data }),
    });
  }

  /**
   * Remover jogador da campanha (GM only)
   */
  async removePlayer(id: string, playerId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}/players/${playerId}`, {
      method: "DELETE",
    });
  }

  // ===========================
  // NPC MANAGEMENT
  // ===========================

  /**
   * Criar NPC
   */
  async createNPC(campaignId: string, data: CreateNPCRequest): Promise<{ success: boolean; npc_id?: string; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Buscar NPC por ID
   */
  async getNPCById(npcId: string): Promise<{ success: boolean; npc?: NPC; error?: string }> {
    return this.request(`/npc/${npcId}`);
  }

  /**
   * Buscar NPCs da campanha
   */
  async getCampaignNPCs(campaignId: string, filters?: CampaignContentFilters): Promise<{ success: boolean; npcs?: NPC[]; error?: string }> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/campaign/${campaignId}/npcs?${queryString}` : `/campaign/${campaignId}/npcs`;
    
    return this.request(endpoint);
  }

  /**
   * Atualizar NPC
   */
  async updateNPC(npcId: string, data: UpdateNPCRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/npc/${npcId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Deletar NPC
   */
  async deleteNPC(npcId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/npc/${npcId}`, {
      method: "DELETE",
    });
  }

  /**
   * Matar NPC
   */
  async killNPC(npcId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/npc/${npcId}/kill`, {
      method: "POST",
    });
  }

  /**
   * Reviver NPC
   */
  async reviveNPC(npcId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/npc/${npcId}/revive`, {
      method: "POST",
    });
  }

  // ===========================
  // ENCOUNTER MANAGEMENT
  // ===========================

  /**
   * Adicionar encontro
   */
  async addEncounter(campaignId: string, data: AddEncounterRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/encounters`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Atualizar encontro
   */
  async updateEncounter(campaignId: string, encounterName: string, data: UpdateEncounterRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/encounters/${encodeURIComponent(encounterName)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Completar encontro
   */
  async completeEncounter(campaignId: string, encounterName: string, data: CompleteEncounterRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/encounters/${encodeURIComponent(encounterName)}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Remover encontro
   */
  async removeEncounter(campaignId: string, encounterName: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/encounters/${encodeURIComponent(encounterName)}`, {
      method: "DELETE",
    });
  }

  // ===========================
  // LOOT MANAGEMENT
  // ===========================

  /**
   * Adicionar loot
   */
  async addLoot(campaignId: string, data: AddLootRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/loot`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Atualizar loot
   */
  async updateLoot(campaignId: string, lootName: string, data: UpdateLootRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/loot/${encodeURIComponent(lootName)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Atribuir loot a jogador
   */
  async assignLoot(campaignId: string, data: AssignLootRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/loot/assign`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Remover loot
   */
  async removeLoot(campaignId: string, lootName: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/loot/${encodeURIComponent(lootName)}`, {
      method: "DELETE",
    });
  }

  // ===========================
  // SESSION MANAGEMENT
  // ===========================

  /**
   * Criar sessão
   */
  async createSession(campaignId: string, data: CreateSessionRequest): Promise<{ success: boolean; session_id?: string; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/sessions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Buscar sessões da campanha
   */
  async getCampaignSessions(campaignId: string): Promise<{ success: boolean; sessions?: GameSession[]; error?: string }> {
    return this.request(`/campaign/${campaignId}/sessions`);
  }

  /**
   * Atualizar sessão
   */
  async updateSession(sessionId: string, data: UpdateSessionRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/session/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Completar sessão
   */
  async completeSession(sessionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/session/${sessionId}/complete`, {
      method: "POST",
    });
  }

  // ===========================
  // DASHBOARD & STATISTICS
  // ===========================

  /**
   * Buscar dashboard da campanha
   */
  async getCampaignDashboard(campaignId: string): Promise<{ success: boolean; dashboard?: CampaignDashboard; error?: string }> {
    return this.request(`/campaign/${campaignId}/dashboard`);
  }

  /**
   * Buscar estatísticas da campanha
   */
  async getCampaignStats(campaignId: string): Promise<CampaignStatsResponse> {
    return this.request<CampaignStatsResponse>(`/campaign/${campaignId}/stats`);
  }

  /**
   * Buscar feed de atividades
   */
  async getActivityFeed(campaignId: string, page: number = 1, perPage: number = 20): Promise<{ success: boolean; activities?: ActivityFeed[]; total?: number; error?: string }> {
    return this.request(`/campaign/${campaignId}/activity?page=${page}&per_page=${perPage}`);
  }

  // ===========================
  // BULK OPERATIONS
  // ===========================

  /**
   * Executar operação em massa
   */
  async bulkOperation(campaignId: string, operation: BulkOperation): Promise<BulkOperationResult> {
    return this.request<BulkOperationResult>(`/campaign/${campaignId}/bulk`, {
      method: "POST",
      body: JSON.stringify(operation),
    });
  }

  // ===========================
  // UTILITIES
  // ===========================

  /**
   * Exportar dados da campanha
   */
  async exportCampaignData(campaignId: string, format: "json" | "pdf" = "json"): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/campaign/${campaignId}/export?format=${format}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao exportar dados da campanha");
    }

    return response.blob();
  }

  /**
   * Verificar se o servidor está funcionando
   */
  async healthCheck(): Promise<{ message: string }> {
    return this.request<{ message: string }>("/");
  }
}

// Instância singleton da API
export const campaignAPI = new CampaignAPI();

export default campaignAPI;