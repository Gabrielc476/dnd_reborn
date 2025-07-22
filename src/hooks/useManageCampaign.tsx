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
  Character,
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
// HOOK PRINCIPAL
// ===========================

export const useManageCampaign = (campaignId?: string): CampaignManagementContextType => {
  const { user } = useAuthContext();
  
  // States básicos
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [dashboard, setDashboard] = useState<CampaignDashboard | null>(null);
  const [permissions, setPermissions] = useState<CampaignPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);

  // ===========================
  // CAMPAIGN OPERATIONS
  // ===========================

  const loadCampaign = useCallback(async (id: string): Promise<void> => {
    if (!id || isLoading) {
      console.log("🚫 Skipping loadCampaign:", { id, isLoading });
      return;
    }

    console.log("🚀 Loading campaign:", id);
    setIsLoading(true);
    
    try {
      console.log("🌐 Fetching campaign from API:", id);
      const response = await campaignAPI.getCampaignById(id);
      
      console.log("📥 Campaign response:", response);

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

      const normalized = normalizeCampaignData(campaignData);
      setCampaign(normalized);

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
  // NPC MANAGEMENT
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
  // CHARACTER MANAGEMENT
  // ===========================

  const loadCharacters = useCallback(async (): Promise<void> => {
    if (!campaign?.id) return;
    
    setIsLoading(true);
    try {
      const response = await campaignAPI.getCampaignCharacters(campaign.id);
      if (response.success && response.characters) {
        setCharacters(response.characters);
      }
    } catch (error) {
      console.error("Erro ao carregar personagens:", error);
    } finally {
      setIsLoading(false);
    }
  }, [campaign?.id]);

  // ===========================
  // ENCOUNTER MANAGEMENT
  // ===========================

  const createEncounter = useCallback(async (data: Encounter): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_manage_encounters) {
      return false;
    }

    try {
      const response = await campaignAPI.createEncounter(campaign.id, data);
      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao criar encontro:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_manage_encounters, loadCampaign]);

  const updateEncounter = useCallback(async (name: string, data: UpdateEncounterRequest): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_manage_encounters) {
      return false;
    }

    try {
      const response = await campaignAPI.updateEncounter(campaign.id, name, data);
      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao atualizar encontro:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_manage_encounters, loadCampaign]);

  const completeEncounter = useCallback(async (name: string, data: CompleteEncounterRequest): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_manage_encounters) {
      return false;
    }

    try {
      const response = await campaignAPI.completeEncounter(campaign.id, name, data);
      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao completar encontro:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_manage_encounters, loadCampaign]);

  const deleteEncounter = useCallback(async (name: string): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_manage_encounters) {
      return false;
    }

    try {
      const response = await campaignAPI.deleteEncounter(campaign.id, name);
      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao deletar encontro:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_manage_encounters, loadCampaign]);

  // ===========================
  // LOOT MANAGEMENT
  // ===========================

  const addLoot = useCallback(async (data: LootItem): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_assign_loot) {
      return false;
    }

    try {
      const response = await campaignAPI.addLoot(campaign.id, data);
      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_assign_loot, loadCampaign]);

  const updateLoot = useCallback(async (name: string, data: UpdateLootRequest): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_assign_loot) {
      return false;
    }

    try {
      const response = await campaignAPI.updateLoot(campaign.id, name, data);
      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_assign_loot, loadCampaign]);

  const assignLoot = useCallback(async (itemName: string, playerId: string): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_assign_loot) {
      return false;
    }

    try {
      const response = await campaignAPI.assignLoot(campaign.id, itemName, playerId);
      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao atribuir item:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_assign_loot, loadCampaign]);

  const removeLoot = useCallback(async (name: string): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_assign_loot) {
      return false;
    }

    try {
      const response = await campaignAPI.removeLoot(campaign.id, name);
      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao remover item:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_assign_loot, loadCampaign]);

  // ===========================
  // SESSION MANAGEMENT
  // ===========================

  const createSession = useCallback(async (data: CreateSessionRequest): Promise<string | null> => {
    if (!campaign?.id || !permissions?.can_manage_sessions) {
      return null;
    }

    try {
      const response = await campaignAPI.createSession(campaign.id, data);
      if (response.success && response.session_id) {
        await loadCampaign(campaign.id);
        return response.session_id;
      }
      return null;
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
      return null;
    }
  }, [campaign?.id, permissions?.can_manage_sessions, loadCampaign]);

  const updateSession = useCallback(async (id: string, data: UpdateSessionRequest): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_manage_sessions) {
      return false;
    }

    try {
      const response = await campaignAPI.updateSession(campaign.id, id, data);
      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao atualizar sessão:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_manage_sessions, loadCampaign]);

  const completeSession = useCallback(async (id: string): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_manage_sessions) {
      return false;
    }

    try {
      const response = await campaignAPI.completeSession(campaign.id, id);
      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao completar sessão:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_manage_sessions, loadCampaign]);

  // ===========================
  // UTILITIES
  // ===========================

  const refreshDashboard = useCallback(async (): Promise<void> => {
    if (!campaign?.id) return;
    
    try {
      await loadCampaign(campaign.id);
    } catch (error) {
      console.error("Erro ao atualizar dashboard:", error);
    }
  }, [campaign?.id, loadCampaign]);

  const getActivityFeed = useCallback(async (page: number = 1): Promise<ActivityFeed[]> => {
    if (!campaign?.id) return [];
    
    try {
      const response = await campaignAPI.getActivityFeed(campaign.id, page);
      if (response.success && response.activities) {
        return response.activities;
      }
      return [];
    } catch (error) {
      console.error("Erro ao obter atividades:", error);
      return [];
    }
  }, [campaign?.id]);

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
    characters,

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
    loadCharacters,
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