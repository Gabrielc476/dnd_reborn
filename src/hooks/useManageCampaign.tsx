// ===========================
// USE MANAGE CAMPAIGN HOOK - VERSÃO SIMPLIFICADA
// hooks/useManageCampaign.tsx - Sem endpoints inexistentes
// ===========================
"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useMemo,
} from "react";
import { campaignAPI } from "@/api/campaignAPI";
import { useAuthContext } from "@/hooks/useAuth";
import {
  Campaign,
  UpdateCampaignRequest,
} from "@/types/createCampaign";
import {
  CampaignManagementContextType,
  CampaignDashboard,
  CampaignPermissions,
  CampaignRole,
  AddPlayerRequest,
  UpdatePlayerRequest,
  CreateNPCRequest,
  UpdateNPCRequest,
  NPC,
  Encounter,
  UpdateEncounterRequest,
  CompleteEncounterRequest,
  LootItem,
  UpdateLootRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  GameSession,
  ActivityFeed,
} from "@/types/manageCampaign";

// ===========================
// UTILITIES
// ===========================

const normalizeCampaignData = (data: any): Campaign => {
  console.log("🔍 Normalizing campaign data:", data);
  
  const normalized = { ...data };
  
  // Garantir arrays
  if (!Array.isArray(normalized.players)) normalized.players = [];
  if (!Array.isArray(normalized.npcs)) normalized.npcs = [];
  if (!Array.isArray(normalized.encounters)) normalized.encounters = [];
  if (!Array.isArray(normalized.loot)) normalized.loot = [];
  if (!Array.isArray(normalized.tags)) normalized.tags = [];
  
  return normalized as Campaign;
};

const calculatePermissions = (
  campaign: Campaign | null,
  userId: string | null
): CampaignPermissions | null => {
  if (!campaign || !userId || !campaign.game_master_id) {
    return null;
  }

  const isGM = campaign.game_master_id === userId;
  const players = Array.isArray(campaign.players) ? campaign.players : [];
  const isPlayer = players.some(p => p && p.user_id === userId);
  const isPublic = Boolean(campaign.is_public);

  let role: CampaignRole;
  if (isGM) {
    role = CampaignRole.GAME_MASTER;
  } else if (isPlayer) {
    role = CampaignRole.PLAYER;
  } else if (isPublic) {
    role = CampaignRole.OBSERVER;
  } else {
    return null;
  }

  return {
    user_id: userId,
    role,
    can_view_campaign: true,
    can_edit_campaign: isGM,
    can_manage_players: isGM,
    can_create_npcs: isGM,
    can_manage_encounters: isGM,
    can_assign_loot: isGM,
    can_view_gm_notes: isGM,
    can_view_npc_secrets: isGM,
    can_manage_sessions: isGM,
  };
};

// ===========================
// CONTEXT
// ===========================

const ManageCampaignContext = createContext<CampaignManagementContextType | null>(null);

// ===========================
// HOOK PRINCIPAL - SIMPLIFICADO
// ===========================

export const useManageCampaign = (campaignId?: string): CampaignManagementContextType => {
  const { user } = useAuthContext();
  
  // States básicos
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [dashboard, setDashboard] = useState<CampaignDashboard | null>(null);
  const [permissions, setPermissions] = useState<CampaignPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ===========================
  // CAMPAIGN OPERATIONS - SIMPLIFICADO
  // ===========================

  const loadCampaign = useCallback(async (id: string): Promise<void> => {
    if (!id || isLoading) {
      console.log("🚫 Skipping loadCampaign:", { id, isLoading });
      return;
    }

    console.log("🚀 Loading campaign:", id);
    setIsLoading(true);
    
    try {
      // SIMPLIFICADO: Apenas carregar campanha básica
      console.log("🌐 Fetching campaign from API:", id);
      const response = await campaignAPI.getCampaignById(id);
      
      console.log("📥 Campaign response:", response);

      // Verificar se response tem os dados
      let campaignData = null;
      if (response.success && response.campaign) {
        campaignData = response.campaign;
      } else if (response.campaign) {
        campaignData = response.campaign;
      } else if (response.error) {
        throw new Error(response.error);
      } else {
        throw new Error("Formato de resposta inválido");
      }

      if (!campaignData) {
        throw new Error("Dados da campanha não encontrados");
      }

      // Normalizar e definir
      const normalized = normalizeCampaignData(campaignData);
      setCampaign(normalized);

      // Calcular permissões
      const newPermissions = calculatePermissions(normalized, user?.id || null);
      setPermissions(newPermissions);

      console.log("✅ Campaign loaded successfully:", {
        id: normalized.id,
        name: normalized.name,
        permissions: newPermissions?.role
      });

    } catch (error) {
      console.error("❌ Erro ao carregar campanha:", error);
      setCampaign(null);
      setPermissions(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const updateCampaign = useCallback(async (data: Partial<Campaign>): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_edit_campaign) {
      return false;
    }

    try {
      const response = await campaignAPI.updateCampaign(campaign.id, data as UpdateCampaignRequest);
      
      if (response) {
        setCampaign(prev => prev ? { ...prev, ...data } : null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao atualizar campanha:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_edit_campaign]);

  const deleteCampaign = useCallback(async (): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_edit_campaign) {
      return false;
    }

    try {
      const response = await campaignAPI.deleteCampaign(campaign.id);
      
      if (response.success) {
        setCampaign(null);
        setPermissions(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao deletar campanha:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_edit_campaign]);

  // ===========================
  // PLAYER MANAGEMENT
  // ===========================

  const addPlayer = useCallback(async (request: AddPlayerRequest): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_manage_players) {
      return false;
    }

    try {
      const response = await campaignAPI.addPlayer(campaign.id, request.user_id, {
        character_id: request.character_id,
        notes: request.notes,
      });

      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao adicionar jogador:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_manage_players, loadCampaign]);

  const removePlayer = useCallback(async (playerId: string): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_manage_players) {
      return false;
    }

    try {
      const response = await campaignAPI.removePlayer(campaign.id, playerId);

      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao remover jogador:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_manage_players, loadCampaign]);

  const updatePlayer = useCallback(async (playerId: string, data: UpdatePlayerRequest): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_manage_players) {
      return false;
    }

    try {
      // Update local state
      setCampaign(prev => {
        if (!prev) return null;
        
        const updatedPlayers = prev.players.map(player => 
          player.user_id === playerId 
            ? { ...player, ...data }
            : player
        );
        
        return { ...prev, players: updatedPlayers };
      });

      return true;
    } catch (error) {
      console.error("Erro ao atualizar jogador:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_manage_players]);

  // ===========================
  // NPC MANAGEMENT - CORRIGIDO
  // ===========================

  const createNPC = useCallback(async (data: CreateNPCRequest): Promise<string | null> => {
    if (!campaign?.id || !permissions?.can_create_npcs) {
      return null;
    }

    try {
      const response = await campaignAPI.createNPC(campaign.id, data);

      if (response.success && response.npc_id) {
        await loadCampaign(campaign.id);
        return response.npc_id;
      }
      return null;
    } catch (error) {
      console.error("Erro ao criar NPC:", error);
      return null;
    }
  }, [campaign?.id, permissions?.can_create_npcs, loadCampaign]);

  const updateNPC = useCallback(async (id: string, data: UpdateNPCRequest): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_create_npcs) {
      return false;
    }

    try {
      const response = await campaignAPI.updateNPC(campaign.id, id, data);

      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao atualizar NPC:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_create_npcs, loadCampaign]);

  const deleteNPC = useCallback(async (id: string): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_create_npcs) {
      return false;
    }

    try {
      const response = await campaignAPI.deleteNPC(campaign.id, id);

      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao deletar NPC:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_create_npcs, loadCampaign]);

  const killNPC = useCallback(async (id: string): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_create_npcs) {
      return false;
    }

    try {
      const response = await campaignAPI.killNPC(campaign.id, id);

      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao matar NPC:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_create_npcs, loadCampaign]);

  const reviveNPC = useCallback(async (id: string): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_create_npcs) {
      return false;
    }

    try {
      const response = await campaignAPI.reviveNPC(campaign.id, id);

      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao reviver NPC:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_create_npcs, loadCampaign]);

  // ===========================
  // ENCOUNTER MANAGEMENT - PLACEHOLDER
  // ===========================

  const createEncounter = useCallback(async (data: Encounter): Promise<boolean> => {
    // TODO: Implementar quando endpoint estiver disponível
    console.log("createEncounter não implementado ainda");
    return false;
  }, []);

  const updateEncounter = useCallback(async (name: string, data: UpdateEncounterRequest): Promise<boolean> => {
    // TODO: Implementar quando endpoint estiver disponível
    console.log("updateEncounter não implementado ainda");
    return false;
  }, []);

  const completeEncounter = useCallback(async (name: string, data: CompleteEncounterRequest): Promise<boolean> => {
    // TODO: Implementar quando endpoint estiver disponível
    console.log("completeEncounter não implementado ainda");
    return false;
  }, []);

  const deleteEncounter = useCallback(async (name: string): Promise<boolean> => {
    // TODO: Implementar quando endpoint estiver disponível
    console.log("deleteEncounter não implementado ainda");
    return false;
  }, []);

  // ===========================
  // LOOT MANAGEMENT - PLACEHOLDER
  // ===========================

  const addLoot = useCallback(async (data: LootItem): Promise<boolean> => {
    // TODO: Implementar quando endpoint estiver disponível
    console.log("addLoot não implementado ainda");
    return false;
  }, []);

  const updateLoot = useCallback(async (name: string, data: UpdateLootRequest): Promise<boolean> => {
    // TODO: Implementar quando endpoint estiver disponível
    console.log("updateLoot não implementado ainda");
    return false;
  }, []);

  const assignLoot = useCallback(async (itemName: string, playerId: string): Promise<boolean> => {
    // TODO: Implementar quando endpoint estiver disponível
    console.log("assignLoot não implementado ainda");
    return false;
  }, []);

  const removeLoot = useCallback(async (name: string): Promise<boolean> => {
    // TODO: Implementar quando endpoint estiver disponível
    console.log("removeLoot não implementado ainda");
    return false;
  }, []);

  // ===========================
  // SESSION MANAGEMENT - PLACEHOLDER
  // ===========================

  const createSession = useCallback(async (data: CreateSessionRequest): Promise<string | null> => {
    // TODO: Implementar quando endpoint estiver disponível
    console.log("createSession não implementado ainda");
    return null;
  }, []);

  const updateSession = useCallback(async (id: string, data: UpdateSessionRequest): Promise<boolean> => {
    // TODO: Implementar quando endpoint estiver disponível
    console.log("updateSession não implementado ainda");
    return false;
  }, []);

  const completeSession = useCallback(async (id: string): Promise<boolean> => {
    // TODO: Implementar quando endpoint estiver disponível
    console.log("completeSession não implementado ainda");
    return false;
  }, []);

  // ===========================
  // UTILITIES - SIMPLIFICADO
  // ===========================

  const refreshDashboard = useCallback(async (): Promise<void> => {
    if (!campaign?.id) return;
    
    try {
      // SIMPLIFICADO: Apenas recarregar campanha
      await loadCampaign(campaign.id);
    } catch (error) {
      console.error("Erro ao atualizar dashboard:", error);
    }
  }, [campaign?.id, loadCampaign]);

  const getActivityFeed = useCallback(async (page: number = 1): Promise<ActivityFeed[]> => {
    // TODO: Implementar quando endpoint estiver disponível
    console.log("getActivityFeed não implementado ainda");
    return [];
  }, []);

  const exportCampaignData = useCallback(async (): Promise<Blob> => {
    if (!campaign?.id) {
      throw new Error("Nenhuma campanha carregada");
    }

    try {
      return await campaignAPI.exportCampaignData(campaign.id);
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      throw error;
    }
  }, [campaign?.id]);

  // Utility functions
  const isGM = useMemo(() => {
    return permissions?.role === CampaignRole.GAME_MASTER || false;
  }, [permissions]);

  const isPlayer = useMemo(() => {
    return permissions?.role === CampaignRole.PLAYER || false;
  }, [permissions]);

  const canPerformAction = useCallback((action: string): boolean => {
    if (!permissions) return false;

    switch (action) {
      case "view_campaign":
        return permissions.can_view_campaign;
      case "edit_campaign":
        return permissions.can_edit_campaign;
      case "manage_players":
        return permissions.can_manage_players;
      case "create_npcs":
        return permissions.can_create_npcs;
      case "manage_encounters":
        return permissions.can_manage_encounters;
      case "assign_loot":
        return permissions.can_assign_loot;
      case "view_gm_notes":
        return permissions.can_view_gm_notes;
      case "manage_sessions":
        return permissions.can_manage_sessions;
      default:
        return false;
    }
  }, [permissions]);

  // Effect para carregar campanha
  useEffect(() => {
    if (campaignId && campaignId !== campaign?.id && !isLoading && user?.id) {
      console.log("🔄 Loading campaign from effect:", campaignId);
      loadCampaign(campaignId).catch(error => {
        console.error("Failed to load campaign:", error);
      });
    }
  }, [campaignId, user?.id]);

  // ===========================
  // RETURN
  // ===========================

  return {
    // Campaign Data
    campaign,
    dashboard,
    permissions,
    isLoading,

    // Campaign Operations
    loadCampaign,
    updateCampaign,
    deleteCampaign,

    // Player Management
    addPlayer,
    removePlayer,
    updatePlayer,

    // NPC Management
    createNPC,
    updateNPC,
    deleteNPC,
    killNPC,
    reviveNPC,

    // Encounter Management
    createEncounter,
    updateEncounter,
    completeEncounter,
    deleteEncounter,

    // Loot Management
    addLoot,
    updateLoot,
    assignLoot,
    removeLoot,

    // Session Management
    createSession,
    updateSession,
    completeSession,

    // Utilities
    refreshDashboard,
    getActivityFeed,
    exportCampaignData,
    isGM,
    isPlayer,
    canPerformAction,
  };
};

// ===========================
// PROVIDER & CONTEXT
// ===========================

interface ManageCampaignProviderProps {
  children: React.ReactNode;
  campaignId?: string;
}

export const ManageCampaignProvider: React.FC<ManageCampaignProviderProps> = ({ 
  children, 
  campaignId 
}) => {
  const campaignManagement = useManageCampaign(campaignId);

  return (
    <ManageCampaignContext.Provider value={campaignManagement}>
      {children}
    </ManageCampaignContext.Provider>
  );
};

export const useManageCampaignContext = (): CampaignManagementContextType => {
  const context = useContext(ManageCampaignContext);
  if (!context) {
    throw new Error("useManageCampaignContext deve ser usado dentro de um ManageCampaignProvider");
  }
  return context;
};

export { calculatePermissions, CampaignRole };
export default useManageCampaign;