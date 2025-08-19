// ===========================
// CAMPAIGN API CLIENT - VERSÃO COMPLETA
// src/api/campaignAPI.ts
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

import {
  EnhancedNPC,
  CreateEnhancedNPCRequest,
  UpdateEnhancedNPCRequest,
  NPCSearchFilters,
  DiceRollRequest,
  RollResult,
  CastSpellRequest,
  UpdateHitPointsRequest
} from '@/types/enhancedNPC';

import {
  EncounterDetail,
  EncounterSummary,
  CreateEncounterRequest,
  UpdateEncounterData,
  CompleteEncounterRequest as CompleteEncounterReq
} from '@/types/encounter';

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
      console.error(`API Error: ${url}`, error);
      throw error;
    }
  }

  // ===========================
  // CAMPAIGN OPERATIONS
  // ===========================

  async createCampaign(data: CreateCampaignRequest): Promise<CreateCampaignResponse> {
    return this.request<CreateCampaignResponse>("/campaign", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCampaignById(id: string): Promise<CampaignResponse> {
    return this.request<CampaignResponse>(`/campaign/${id}`);
  }

  async getGMCampaigns(): Promise<CampaignListResponse> {
    return this.request<CampaignListResponse>("/campaign/my");
  }

  async getPlayerCampaigns(): Promise<CampaignListResponse> {
    return this.request<CampaignListResponse>("/campaign/joined");
  }

  async getPublicCampaigns(filters?: CampaignFilters): Promise<CampaignListResponse> {
    let url = "/campaign/public";
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }
    return this.request<CampaignListResponse>(url);
  }

  async searchCampaigns(request: CampaignSearchRequest): Promise<CampaignListResponse> {
    return this.request<CampaignListResponse>("/campaign/search", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async updateCampaign(id: string, data: UpdateCampaignRequest): Promise<CampaignResponse> {
    return this.request<CampaignResponse>(`/campaign/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCampaign(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}`, {
      method: "DELETE",
    });
  }

  async joinCampaign(id: string, data: JoinCampaignRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}/join`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async leaveCampaign(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}/leave`, {
      method: "POST",
    });
  }

  async getCampaignStats(id: string): Promise<CampaignStatsResponse> {
    return this.request<CampaignStatsResponse>(`/campaign/${id}/stats`);
  }

  // ===========================
  // PLAYER MANAGEMENT
  // ===========================

  async addPlayer(id: string, userId: string, data: { character_id?: string; notes?: string }): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}/players`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, ...data }),
    });
  }

  async removePlayer(id: string, playerId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}/players/${playerId}`, {
      method: "DELETE",
    });
  }

  async getCampaignCharacters(campaignId: string): Promise<{ success: boolean; characters?: any[]; error?: string }> {
    return this.request(`/characters/campaign/${campaignId}/characters`);
  }

  // ===========================
  // NPC MANAGEMENT
  // ===========================

  async createNPC(campaignId: string, data: CreateNPCRequest): Promise<{ success: boolean; npc_id?: string; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

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

  async getNPCById(campaignId: string, npcId: string): Promise<{ success: boolean; npc?: NPC; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/${npcId}`);
  }

  async updateNPC(campaignId: string, npcId: string, data: UpdateNPCRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/${npcId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteNPC(campaignId: string, npcId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/${npcId}`, {
      method: "DELETE",
    });
  }

  async killNPC(campaignId: string, npcId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/${npcId}/kill`, {
      method: "POST",
    });
  }

  async reviveNPC(campaignId: string, npcId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/${npcId}/revive`, {
      method: "POST",
    });
  }

  // ===========================
  // ENHANCED NPC METHODS
  // ===========================

  async createEnhancedNPC(campaignId: string, data: CreateEnhancedNPCRequest): Promise<{ success: boolean; npc_id?: string; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getEnhancedNPCs(
    campaignId: string, 
    filters?: NPCSearchFilters, 
    page: number = 1, 
    perPage: number = 50
  ): Promise<{ success: boolean; npcs?: EnhancedNPC[]; total?: number; page?: number; per_page?: number; error?: string }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/campaign/${campaignId}/npcs/enhanced?${queryString}` : `/campaign/${campaignId}/npcs/enhanced`;
    
    return this.request(endpoint);
  }

  async getEnhancedNPCById(campaignId: string, npcId: string): Promise<{ success: boolean; npc?: EnhancedNPC; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced/${npcId}`);
  }

  async updateEnhancedNPC(campaignId: string, npcId: string, data: UpdateEnhancedNPCRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced/${npcId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteEnhancedNPC(campaignId: string, npcId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced/${npcId}`, {
      method: "DELETE",
    });
  }

  async rollDiceForNPC(campaignId: string, npcId: string, rollRequest: DiceRollRequest): Promise<{ success: boolean; result?: RollResult; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced/${npcId}/roll`, {
      method: "POST",
      body: JSON.stringify(rollRequest),
    });
  }

  async castSpellForNPC(campaignId: string, npcId: string, spellRequest: CastSpellRequest): Promise<{ success: boolean; result?: RollResult; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced/${npcId}/cast-spell`, {
      method: "POST",
      body: JSON.stringify(spellRequest),
    });
  }

  async updateNPCHitPoints(campaignId: string, npcId: string, hpRequest: UpdateHitPointsRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced/${npcId}/hit-points`, {
      method: "PUT",
      body: JSON.stringify(hpRequest),
    });
  }

  // ===========================
  // ENCOUNTER MANAGEMENT (FULLY IMPLEMENTED)
  // ===========================

  /**
   * Adicionar encontro à campanha
   */
  async addEncounter(campaignId: string, data: CreateEncounterRequest): Promise<{ success: boolean; encounter_id?: string; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/encounters`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Buscar encontros da campanha
   */
  async getEncounters(campaignId: string): Promise<{ success: boolean; encounters?: EncounterSummary[]; error?: string }> {
    return this.request(`/campaign/${campaignId}/encounters`);
  }

  /**
   * Buscar detalhes de um encontro
   */
  async getEncounterById(campaignId: string, encounterId: string): Promise<{ success: boolean; encounter?: EncounterDetail; error?: string }> {
    return this.request(`/campaign/${campaignId}/encounters/${encounterId}`);
  }

  /**
   * Atualizar encontro
   */
  async updateEncounter(
    campaignId: string, 
    encounterId: string, 
    data: UpdateEncounterData
  ): Promise<{ 
    success: boolean; 
    message?: string; 
    error?: string 
  }> {
    return this.request(`/campaign/${campaignId}/encounters/${encounterId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Completar encontro
   */
  async completeEncounter(
    campaignId: string, 
    encounterId: string, 
    data: CompleteEncounterReq
  ): Promise<{ 
    success: boolean; 
    message?: string; 
    error?: string 
  }> {
    return this.updateEncounter(campaignId, encounterId, {
      ...data,
      is_completed: true
    });
  }

  /**
   * Deletar encontro da campanha
   */
  async deleteEncounter(
    campaignId: string, 
    encounterId: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/encounters/${encounterId}`, {
      method: "DELETE",
    });
  }

  // ===========================
  // LOOT MANAGEMENT
  // ===========================

  async addLoot(id: string, data: AddLootRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}/loot`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async assignLoot(id: string, lootName: string, playerId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}/loot/${lootName}/assign`, {
      method: "POST",
      body: JSON.stringify({ player_id: playerId }),
    });
  }

  async updateLoot(campaignId: string, lootId: string, data: UpdateLootRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/loot/${lootId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ===========================
  // SESSION MANAGEMENT (PLACEHOLDERS)
  // ===========================

  async createSession(campaignId: string, data: CreateSessionRequest): Promise<{ success: boolean; session_id?: string; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/sessions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSession(campaignId: string, sessionId: string, data: UpdateSessionRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/sessions/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getSessions(campaignId: string): Promise<{ success: boolean; sessions?: GameSession[]; error?: string }> {
    return this.request(`/campaign/${campaignId}/sessions`);
  }

  async deleteSession(campaignId: string, sessionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }

  async completeSession(campaignId: string, sessionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/sessions/${sessionId}/complete`, {
      method: "POST",
    });
  }

  // ===========================
  // DASHBOARD & ANALYTICS
  // ===========================

  async getCampaignDashboard(id: string): Promise<{ success: boolean; dashboard?: CampaignDashboard; error?: string }> {
    return this.request(`/campaign/${id}/dashboard`);
  }

  async getActivityFeed(id: string, page: number = 1, perPage: number = 20): Promise<{ success: boolean; activities?: ActivityFeed[]; total?: number; error?: string }> {
    return this.request(`/campaign/${id}/activity?page=${page}&per_page=${perPage}`);
  }

  async exportCampaignData(id: string, format: "json" | "csv" = "json"): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/campaign/${id}/export?format=${format}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Falha ao exportar dados');
    }
    
    return response.blob();
  }

  // ===========================
  // BULK OPERATIONS
  // ===========================

  async bulkOperation(campaignId: string, operation: BulkOperation): Promise<BulkOperationResult> {
    return this.request(`/campaign/${campaignId}/bulk`, {
      method: "POST",
      body: JSON.stringify(operation),
    });
  }
}

// ===========================
// SINGLETON INSTANCE
// ===========================

export const campaignAPI = new CampaignAPI();
export { CampaignAPI };
export default campaignAPI;