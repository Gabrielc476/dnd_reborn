// ===========================
// USE MANAGE CAMPAIGN HOOK
// hooks/useManageCampaign.ts
// ===========================
"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
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

/**
 * Determina as permissões do usuário na campanha
 */
const calculatePermissions = (
  campaign: Campaign | null,
  userId: string | null
): CampaignPermissions | null => {
  if (!campaign || !userId) return null;

  const isGM = campaign.game_master_id === userId;
  const isPlayer = campaign.players.some(p => p.user_id === userId);
  const isPublic = campaign.is_public;

  let role: CampaignRole;
  if (isGM) {
    role = CampaignRole.GAME_MASTER;
  } else if (isPlayer) {
    role = CampaignRole.PLAYER;
  } else if (isPublic) {
    role = CampaignRole.OBSERVER;
  } else {
    return null; // Sem acesso
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

/**
 * Cache para armazenar dados da campanha
 */
interface CampaignCache {
  campaign: Campaign | null;
  dashboard: CampaignDashboard | null;
  lastUpdated: number;
  isValid: boolean;
}

const createEmptyCache = (): CampaignCache => ({
  campaign: null,
  dashboard: null,
  lastUpdated: 0,
  isValid: false,
});

// ===========================
// MANAGE CAMPAIGN CONTEXT
// ===========================

const ManageCampaignContext = createContext<CampaignManagementContextType | null>(null);

// ===========================
// USE MANAGE CAMPAIGN HOOK
// ===========================

export const useManageCampaign = (campaignId?: string): CampaignManagementContextType => {
  const { user } = useAuthContext();
  
  // State management
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [dashboard, setDashboard] = useState<CampaignDashboard | null>(null);
  const [permissions, setPermissions] = useState<CampaignPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState<CampaignCache>(createEmptyCache());

  // ===========================
  // CAMPAIGN OPERATIONS
  // ===========================

  const loadCampaign = useCallback(async (id: string): Promise<void> => {
    if (!id) return;

    setIsLoading(true);
    
    try {
      // Verificar cache
      const now = Date.now();
      const cacheExpiry = 5 * 60 * 1000; // 5 minutos
      
      if (cache.isValid && cache.campaign?.id === id && (now - cache.lastUpdated) < cacheExpiry) {
        setCampaign(cache.campaign);
        setDashboard(cache.dashboard);
        setPermissions(calculatePermissions(cache.campaign, user?.id || null));
        setIsLoading(false);
        return;
      }

      // Buscar dados da API
      const [campaignResponse, dashboardResponse] = await Promise.all([
        campaignAPI.getCampaignById(id),
        campaignAPI.getCampaignDashboard(id).catch(() => ({ success: false })),
      ]);

      if (!campaignResponse) {
        throw new Error("Campanha não encontrada");
      }

      const campaignData = campaignResponse as Campaign;
      const dashboardData = dashboardResponse.success ? dashboardResponse.dashboard : null;

      // Atualizar state
      setCampaign(campaignData);
      setDashboard(dashboardData || null);
      setPermissions(calculatePermissions(campaignData, user?.id || null));

      // Atualizar cache
      setCache({
        campaign: campaignData,
        dashboard: dashboardData || null,
        lastUpdated: now,
        isValid: true,
      });

    } catch (error) {
      console.error("Erro ao carregar campanha:", error);
      setCampaign(null);
      setDashboard(null);
      setPermissions(null);
      setCache(createEmptyCache());
    } finally {
      setIsLoading(false);
    }
  }, [cache, user?.id]);

  const updateCampaign = useCallback(async (data: Partial<Campaign>): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_edit_campaign) {
      return false;
    }

    try {
      setIsLoading(true);

      const updateData: UpdateCampaignRequest = {
        name: data.name,
        description: data.description,
        status: data.status,
        max_players: data.max_players,
        setting: data.setting,
        world_name: data.world_name,
        tags: data.tags,
        is_public: data.is_public,
        recruitment_message: data.recruitment_message,
        gm_notes: data.gm_notes,
      };

      const response = await campaignAPI.updateCampaign(campaign.id, updateData);
      
      if (response) {
        // Atualizar state local
        setCampaign(prev => prev ? { ...prev, ...data } : null);
        
        // Invalidar cache
        setCache(prev => ({ ...prev, isValid: false }));
        
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao atualizar campanha:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [campaign?.id, permissions?.can_edit_campaign]);

  const deleteCampaign = useCallback(async (): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_edit_campaign) {
      return false;
    }

    try {
      setIsLoading(true);
      const response = await campaignAPI.deleteCampaign(campaign.id);
      
      if (response.success) {
        setCampaign(null);
        setDashboard(null);
        setPermissions(null);
        setCache(createEmptyCache());
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao deletar campanha:", error);
      return false;
    } finally {
      setIsLoading(false);
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
      // Nota: Esta função pode precisar ser implementada na API
      // Por enquanto, simularemos atualizando localmente
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
    if (!permissions?.can_create_npcs) {
      return false;
    }

    try {
      const response = await campaignAPI.updateNPC(id, data);

      if (response.success) {
        await refreshDashboard();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao atualizar NPC:", error);
      return false;
    }
  }, [permissions?.can_create_npcs]);

  const deleteNPC = useCallback(async (id: string): Promise<boolean> => {
    if (!permissions?.can_create_npcs) {
      return false;
    }

    try {
      const response = await campaignAPI.deleteNPC(id);

      if (response.success) {
        await refreshDashboard();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao deletar NPC:", error);
      return false;
    }
  }, [permissions?.can_create_npcs]);

  const killNPC = useCallback(async (id: string): Promise<boolean> => {
    if (!permissions?.can_create_npcs) {
      return false;
    }

    try {
      const response = await campaignAPI.killNPC(id);

      if (response.success) {
        await refreshDashboard();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao matar NPC:", error);
      return false;
    }
  }, [permissions?.can_create_npcs]);

  const reviveNPC = useCallback(async (id: string): Promise<boolean> => {
    if (!permissions?.can_create_npcs) {
      return false;
    }

    try {
      const response = await campaignAPI.reviveNPC(id);

      if (response.success) {
        await refreshDashboard();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao reviver NPC:", error);
      return false;
    }
  }, [permissions?.can_create_npcs]);

  // ===========================
  // ENCOUNTER MANAGEMENT
  // ===========================

  const createEncounter = useCallback(async (data: Encounter): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_manage_encounters) {
      return false;
    }

    try {
      const response = await campaignAPI.addEncounter(campaign.id, data);

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
      const response = await campaignAPI.removeEncounter(campaign.id, name);

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
      console.error("Erro ao adicionar loot:", error);
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
      console.error("Erro ao atualizar loot:", error);
      return false;
    }
  }, [campaign?.id, permissions?.can_assign_loot, loadCampaign]);

  const assignLoot = useCallback(async (itemName: string, playerId: string): Promise<boolean> => {
    if (!campaign?.id || !permissions?.can_assign_loot) {
      return false;
    }

    try {
      const response = await campaignAPI.assignLoot(campaign.id, {
        loot_item_name: itemName,
        player_id: playerId,
      });

      if (response.success) {
        await loadCampaign(campaign.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao atribuir loot:", error);
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
      console.error("Erro ao remover loot:", error);
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
        await refreshDashboard();
        return response.session_id;
      }

      return null;
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
      return null;
    }
  }, [campaign?.id, permissions?.can_manage_sessions]);

  const updateSession = useCallback(async (id: string, data: UpdateSessionRequest): Promise<boolean> => {
    if (!permissions?.can_manage_sessions) {
      return false;
    }

    try {
      const response = await campaignAPI.updateSession(id, data);

      if (response.success) {
        await refreshDashboard();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao atualizar sessão:", error);
      return false;
    }
  }, [permissions?.can_manage_sessions]);

  const completeSession = useCallback(async (id: string): Promise<boolean> => {
    if (!permissions?.can_manage_sessions) {
      return false;
    }

    try {
      const response = await campaignAPI.completeSession(id);

      if (response.success) {
        await refreshDashboard();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao completar sessão:", error);
      return false;
    }
  }, [permissions?.can_manage_sessions]);

  // ===========================
  // UTILITIES
  // ===========================

  const refreshDashboard = useCallback(async (): Promise<void> => {
    if (!campaign?.id) return;

    try {
      const response = await campaignAPI.getCampaignDashboard(campaign.id);
      
      if (response.success && response.dashboard) {
        setDashboard(response.dashboard);
        
        // Atualizar cache
        setCache(prev => ({
          ...prev,
          dashboard: response.dashboard || null,
          lastUpdated: Date.now(),
        }));
      }
    } catch (error) {
      console.error("Erro ao atualizar dashboard:", error);
    }
  }, [campaign?.id]);

  const getActivityFeed = useCallback(async (page: number = 1): Promise<ActivityFeed[]> => {
    if (!campaign?.id) return [];

    try {
      const response = await campaignAPI.getActivityFeed(campaign.id, page);
      
      if (response.success && response.activities) {
        return response.activities;
      }

      return [];
    } catch (error) {
      console.error("Erro ao buscar feed de atividades:", error);
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

  const isGM = useCallback((): boolean => {
    return permissions?.role === CampaignRole.GAME_MASTER || false;
  }, [permissions]);

  const isPlayer = useCallback((): boolean => {
    return permissions?.role === CampaignRole.PLAYER || false;
  }, [permissions]);

  const canPerformAction = useCallback((action: string): boolean => {
    if (!permissions) return false;

    switch (action) {
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

  // ===========================
  // EFFECTS
  // ===========================

  // Carregar campanha quando ID mudar
  useEffect(() => {
    if (campaignId && campaignId !== campaign?.id) {
      loadCampaign(campaignId);
    }
  }, [campaignId, campaign?.id, loadCampaign]);

  // ===========================
  // RETURN CONTEXT VALUE
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
// MANAGE CAMPAIGN PROVIDER
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

// ===========================
// USE MANAGE CAMPAIGN CONTEXT HOOK
// ===========================

export const useManageCampaignContext = (): CampaignManagementContextType => {
  const context = useContext(ManageCampaignContext);
  if (!context) {
    throw new Error("useManageCampaignContext deve ser usado dentro de um ManageCampaignProvider");
  }
  return context;
};

// ===========================
// EXPORTS
// ===========================

export {
  calculatePermissions,
  CampaignRole,
};

export default useManageCampaign;