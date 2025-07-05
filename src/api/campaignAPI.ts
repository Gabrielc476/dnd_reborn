// ===========================
// CAMPAIGN API CLIENT - VERSÃO ATUALIZADA COM ENHANCED NPCs
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

// ===========================
// IMPORTAÇÕES ENHANCED NPCs
// ===========================
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
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`📥 API Response:`, data);

      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ API Error: ${url}`, error);
      throw error;
    }
  }

  // ===========================
  // CAMPAIGN OPERATIONS
  // ===========================

  /**
   * Criar nova campanha
   */
  async createCampaign(data: CreateCampaignRequest): Promise<CreateCampaignResponse> {
    return this.request<CreateCampaignResponse>("/campaign", {
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
   * Buscar campanhas do GM
   */
  async getGMCampaigns(): Promise<CampaignListResponse> {
    return this.request<CampaignListResponse>("/campaign/gm");
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

  /**
   * Pesquisar campanhas
   */
  async searchCampaigns(request: CampaignSearchRequest): Promise<CampaignListResponse> {
    return this.request<CampaignListResponse>("/campaign/search", {
      method: "POST",
      body: JSON.stringify(request),
    });
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

  /**
   * Ingressar na campanha
   */
  async joinCampaign(id: string, data: JoinCampaignRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}/join`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Sair da campanha
   */
  async leaveCampaign(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${id}/leave`, {
      method: "POST",
    });
  }

  /**
   * Obter estatísticas da campanha
   */
  async getCampaignStats(id: string): Promise<CampaignStatsResponse> {
    return this.request<CampaignStatsResponse>(`/campaign/${id}/stats`);
  }

  // ===========================
  // PLAYER MANAGEMENT
  // ===========================

  /**
   * Adicionar jogador à campanha (GM only)
   */
  async addPlayer(id: string, userId: string, data: { character_id?: string; notes?: string }): Promise<{ success: boolean; message?: string; error?: string }> {
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
  // NPC MANAGEMENT - LEGACY METHODS
  // ===========================

  /**
   * Criar NPC (método legado)
   */
  async createNPC(campaignId: string, data: CreateNPCRequest): Promise<{ success: boolean; npc_id?: string; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Buscar NPCs da campanha (método legado)
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
   * Buscar NPC por ID (método legado)
   */
  async getNPCById(campaignId: string, npcId: string): Promise<{ success: boolean; npc?: NPC; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/${npcId}`);
  }

  /**
   * Atualizar NPC (método legado)
   */
  async updateNPC(campaignId: string, npcId: string, data: UpdateNPCRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/${npcId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Deletar NPC (método legado)
   */
  async deleteNPC(campaignId: string, npcId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/${npcId}`, {
      method: "DELETE",
    });
  }

  /**
   * Matar NPC
   */
  async killNPC(campaignId: string, npcId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/${npcId}/kill`, {
      method: "POST",
    });
  }

  /**
   * Reviver NPC
   */
  async reviveNPC(campaignId: string, npcId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/campaign/${campaignId}/npcs/${npcId}/revive`, {
      method: "POST",
    });
  }

  // ===========================
  // MÉTODOS ENHANCED NPCs
  // ===========================

  /**
   * Criar NPC Enhanced
   */
  async createEnhancedNPC(campaignId: string, data: CreateEnhancedNPCRequest): Promise<{ 
    success: boolean; 
    npc_id?: string; 
    message?: string; 
    error?: string 
  }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Buscar NPCs Enhanced
   */
  async getEnhancedNPCs(campaignId: string, filters?: NPCSearchFilters): Promise<{ 
    success: boolean; 
    npcs?: EnhancedNPC[]; 
    total?: number;
    error?: string 
  }> {
    let url = `/campaign/${campaignId}/npcs/enhanced`;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.npc_type) filters.npc_type.forEach(type => params.append('npc_type', type));
      if (filters.is_alive !== undefined) params.append('is_alive', filters.is_alive.toString());
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }

    return this.request(url);
  }

  /**
   * Buscar NPC Enhanced por ID
   */
  async getEnhancedNPCById(campaignId: string, npcId: string): Promise<{ 
    success: boolean; 
    npc?: EnhancedNPC; 
    error?: string 
  }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced/${npcId}`);
  }

  /**
   * Atualizar NPC Enhanced
   */
  async updateEnhancedNPC(campaignId: string, npcId: string, data: UpdateEnhancedNPCRequest): Promise<{ 
    success: boolean; 
    message?: string; 
    error?: string 
  }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced/${npcId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Deletar NPC Enhanced
   */
  async deleteEnhancedNPC(campaignId: string, npcId: string): Promise<{ 
    success: boolean; 
    message?: string; 
    error?: string 
  }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced/${npcId}`, {
      method: "DELETE",
    });
  }

  // ===========================
  // SISTEMA DE ROLAGEM
  // ===========================

  /**
   * Executar rolagem para NPC
   */
  async rollDiceForNPC(campaignId: string, npcId: string, rollData: DiceRollRequest): Promise<{ 
    success: boolean; 
    result?: RollResult; 
    error?: string 
  }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced/${npcId}/roll`, {
      method: "POST",
      body: JSON.stringify(rollData),
    });
  }

  /**
   * Conjurar magia
   */
  async castSpellForNPC(campaignId: string, npcId: string, spellData: CastSpellRequest): Promise<{ 
    success: boolean; 
    result?: RollResult; 
    message?: string;
    error?: string 
  }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced/${npcId}/cast-spell`, {
      method: "POST",
      body: JSON.stringify(spellData),
    });
  }

  /**
   * Atualizar pontos de vida
   */
  async updateNPCHitPoints(campaignId: string, npcId: string, hpData: UpdateHitPointsRequest): Promise<{ 
    success: boolean; 
    message?: string; 
    error?: string 
  }> {
    return this.request(`/campaign/${campaignId}/npcs/enhanced/${npcId}/hit-points`, {
      method: "PUT",
      body: JSON.stringify(hpData),
    });
  }

  // ===========================
  // ADAPTER METHODS (para transição suave)
  // ===========================

  /**
   * Método unificado para criar NPCs (detecta formato automaticamente)
   */
  async createNPCUnified(campaignId: string, data: any): Promise<any> {
    // Se tem campos Enhanced, usar Enhanced API
    if (data.spellcasting || data.attacks || data.abilities) {
      return this.createEnhancedNPC(campaignId, data);
    } else {
      // Usar API legada
      return this.createNPC(campaignId, data);
    }
  }

  /**
   * Método unificado para buscar NPCs
   */
  async getNPCsUnified(campaignId: string, useEnhanced: boolean = true): Promise<any> {
    if (useEnhanced) {
      try {
        return await this.getEnhancedNPCs(campaignId);
      } catch (error) {
        console.warn('Enhanced API falhou, usando legada:', error);
        return await this.getCampaignNPCs(campaignId);
      }
    } else {
      return await this.getCampaignNPCs(campaignId);
    }
  }

  // ===========================
  // ENCOUNTER MANAGEMENT - PLACEHOLDERS
  // ===========================

  async addEncounter(campaignId: string, data: AddEncounterRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    console.warn("⚠️ Encounter endpoints não implementados");
    return Promise.resolve({ success: false, error: "Encounter endpoints não implementados" });
  }

  async updateEncounter(campaignId: string, encounterName: string, data: UpdateEncounterRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    console.warn("⚠️ Encounter endpoints não implementados");
    return Promise.resolve({ success: false, error: "Encounter endpoints não implementados" });
  }

  async completeEncounter(campaignId: string, encounterName: string, data: CompleteEncounterRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    console.warn("⚠️ Encounter endpoints não implementados");
    return Promise.resolve({ success: false, error: "Encounter endpoints não implementados" });
  }

  async deleteEncounter(campaignId: string, encounterName: string): Promise<{ success: boolean; message?: string; error?: string }> {
    console.warn("⚠️ Encounter endpoints não implementados");
    return Promise.resolve({ success: false, error: "Encounter endpoints não implementados" });
  }

  // ===========================
  // LOOT MANAGEMENT - PLACEHOLDERS
  // ===========================

  async addLoot(campaignId: string, data: AddLootRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    console.warn("⚠️ Loot endpoints não implementados");
    return Promise.resolve({ success: false, error: "Loot endpoints não implementados" });
  }

  async updateLoot(campaignId: string, itemName: string, data: UpdateLootRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    console.warn("⚠️ Loot endpoints não implementados");
    return Promise.resolve({ success: false, error: "Loot endpoints não implementados" });
  }

  async assignLoot(campaignId: string, data: AssignLootRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    console.warn("⚠️ Loot endpoints não implementados");
    return Promise.resolve({ success: false, error: "Loot endpoints não implementados" });
  }

  async removeLoot(campaignId: string, itemName: string): Promise<{ success: boolean; message?: string; error?: string }> {
    console.warn("⚠️ Loot endpoints não implementados");
    return Promise.resolve({ success: false, error: "Loot endpoints não implementados" });
  }

  // ===========================
  // SESSION MANAGEMENT - PLACEHOLDERS
  // ===========================

  async createSession(campaignId: string, data: CreateSessionRequest): Promise<{ success: boolean; session_id?: string; message?: string; error?: string }> {
    console.warn("⚠️ Session endpoints não implementados");
    return Promise.resolve({ success: false, error: "Session endpoints não implementados" });
  }

  async updateSession(campaignId: string, sessionId: string, data: UpdateSessionRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    console.warn("⚠️ Session endpoints não implementados");
    return Promise.resolve({ success: false, error: "Session endpoints não implementados" });
  }

  async completeSession(campaignId: string, sessionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    console.warn("⚠️ Session endpoints não implementados");
    return Promise.resolve({ success: false, error: "Session endpoints não implementados" });
  }

  // ===========================
  // DASHBOARD E ANALYTICS - PLACEHOLDERS
  // ===========================

  /**
   * PLACEHOLDER - Dashboard não implementado no backend
   */
  async getCampaignDashboard(id: string): Promise<{ success: boolean; dashboard?: CampaignDashboard; error?: string }> {
    console.warn("⚠️ Dashboard endpoint não implementado");
    return Promise.resolve({ 
      success: false, 
      error: "Dashboard endpoint não implementado" 
    });
  }

  /**
   * PLACEHOLDER - Activity feed não implementado no backend
   */
  async getActivityFeed(id: string, page: number = 1, perPage: number = 20): Promise<{ success: boolean; activities?: ActivityFeed[]; total?: number; error?: string }> {
    console.warn("⚠️ Activity feed endpoint não implementado");
    return Promise.resolve({ 
      success: false, 
      activities: [], 
      error: "Activity feed endpoint não implementado" 
    });
  }

  /**
   * PLACEHOLDER - Export não implementado no backend
   */
  async exportCampaignData(id: string, format: "json" | "csv" = "json"): Promise<Blob> {
    console.warn("⚠️ Export endpoint não implementado");
    const data = JSON.stringify({ error: "Export não implementado" });
    return new Blob([data], { type: 'application/json' });
  }

  // ===========================
  // BULK OPERATIONS - PLACEHOLDERS
  // ===========================

  async bulkOperation(campaignId: string, operation: BulkOperation): Promise<BulkOperationResult> {
    console.warn("⚠️ Bulk operations não implementadas");
    return Promise.resolve({
      success: false,
      processed: 0,
      failed: 0,
      errors: ["Bulk operations não implementadas"]
    });
  }
}

// ===========================
// SINGLETON INSTANCE
// ===========================

/**
 * Instância única da API para uso em toda a aplicação
 */
export const campaignAPI = new CampaignAPI();

/**
 * Export da classe para casos especiais
 */
export { CampaignAPI };

/**
 * Export default da instância
 */
export default campaignAPI;