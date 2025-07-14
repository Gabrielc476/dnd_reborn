// ===========================
// useCharacterAPI.ts
// Hook para integração com API de personagens
// ===========================

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CharacterCreationData,
  DndRace,
  DndClass,
  DndBackground,
  DndSpell,
  APIResponse,
  CreateCharacterResponse
} from '@/types/characterCreation';

// Interface para dados de criação que vai para a API
interface CreateCharacterRequest {
  name: string;
  race: string;
  subrace?: string;
  character_class: string;
  subclass?: string;
  background: string;
  alignment: string;
  level: number;
  ability_scores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: string[];
  hit_points: number;
  armor_class: number;
  equipment?: string[];
  spells?: string[];
  personality?: {
    traits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  };
  campaign_id?: string;
}

interface UpdateCharacterRequest extends Partial<CreateCharacterRequest> {
  id: string;
}

// Simulação de API - substitua pelas suas chamadas reais
const characterAPI = {
  // Criar personagem
  async createCharacter(data: CreateCharacterRequest): Promise<APIResponse<any>> {
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao criar personagem:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // Atualizar personagem
  async updateCharacter(data: UpdateCharacterRequest): Promise<APIResponse<any>> {
    try {
      const response = await fetch(`/api/characters/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao atualizar personagem:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // Obter personagem
  async getCharacter(id: string): Promise<APIResponse<any>> {
    try {
      const response = await fetch(`/api/characters/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao obter personagem:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // Deletar personagem
  async deleteCharacter(id: string): Promise<APIResponse<any>> {
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar personagem:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // API D&D - Raças
  async getRaces(): Promise<APIResponse<DndRace[]>> {
    try {
      const response = await fetch('/api/dnd/races');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // API D&D - Classes
  async getClasses(): Promise<APIResponse<DndClass[]>> {
    try {
      const response = await fetch('/api/dnd/classes');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // API D&D - Backgrounds
  async getBackgrounds(): Promise<APIResponse<DndBackground[]>> {
    try {
      const response = await fetch('/api/dnd/backgrounds');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // API D&D - Magias
  async getSpells(classIndex?: string): Promise<APIResponse<DndSpell[]>> {
    try {
      const url = classIndex ? `/api/dnd/spells?class=${classIndex}` : '/api/dnd/spells';
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // Obter personagens de uma campanha
  async getCampaignCharacters(campaignId: string): Promise<APIResponse<any[]>> {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/characters`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },
};

export const useCharacterAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Mutations
  const createCharacterMutation = useMutation({
    mutationFn: characterAPI.createCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
    },
  });

  const updateCharacterMutation = useMutation({
    mutationFn: characterAPI.updateCharacter,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
    },
  });

  const deleteCharacterMutation = useMutation({
    mutationFn: characterAPI.deleteCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
    },
  });

  // Actions
  const createCharacter = useCallback(async (data: CharacterCreationData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Converter CharacterCreationData para CreateCharacterRequest
      const requestData: CreateCharacterRequest = {
        name: data.name,
        race: data.selectedRace?.index || '',
        subrace: data.selectedSubrace?.index,
        character_class: data.selectedClass?.index || '',
        subclass: data.selectedSubclass?.index,
        background: data.selectedBackground?.index || '',
        alignment: data.alignment || '',
        level: data.level,
        ability_scores: data.abilityScores,
        skills: data.selectedSkills,
        hit_points: data.hitPoints,
        armor_class: data.armorClass,
        equipment: data.selectedEquipment,
        spells: data.selectedSpells,
        personality: data.personalityTraits.length > 0 ? {
          traits: data.personalityTraits,
          ideals: data.ideals,
          bonds: data.bonds,
          flaws: data.flaws,
        } : undefined,
      };

      const result = await createCharacterMutation.mutateAsync(requestData);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar personagem';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [createCharacterMutation]);

  const updateCharacter = useCallback(async (id: string, data: Partial<CharacterCreationData>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updateData: UpdateCharacterRequest = {
        id,
        name: data.name,
        race: data.selectedRace?.index,
        subrace: data.selectedSubrace?.index,
        character_class: data.selectedClass?.index,
        subclass: data.selectedSubclass?.index,
        background: data.selectedBackground?.index,
        alignment: data.alignment || undefined,
        level: data.level,
        ability_scores: data.abilityScores,
        skills: data.selectedSkills,
        hit_points: data.hitPoints,
        armor_class: data.armorClass,
        equipment: data.selectedEquipment,
        spells: data.selectedSpells,
      };

      const result = await updateCharacterMutation.mutateAsync(updateData);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar personagem';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateCharacterMutation]);

  const deleteCharacter = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteCharacterMutation.mutateAsync(id);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar personagem';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [deleteCharacterMutation]);

  // Queries
  const useRacesQuery = () => useQuery({
    queryKey: ['dnd', 'races'],
    queryFn: async () => {
      const result = await characterAPI.getRaces();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const useClassesQuery = () => useQuery({
    queryKey: ['dnd', 'classes'],
    queryFn: async () => {
      const result = await characterAPI.getClasses();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const useBackgroundsQuery = () => useQuery({
    queryKey: ['dnd', 'backgrounds'],
    queryFn: async () => {
      const result = await characterAPI.getBackgrounds();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const useSpellsQuery = (classIndex?: string) => useQuery({
    queryKey: ['dnd', 'spells', classIndex],
    queryFn: async () => {
      const result = await characterAPI.getSpells(classIndex);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!classIndex,
    staleTime: 5 * 60 * 1000,
  });

  const useCharacterQuery = (id: string) => useQuery({
    queryKey: ['character', id],
    queryFn: async () => {
      const result = await characterAPI.getCharacter(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!id,
  });

  const useCampaignCharactersQuery = (campaignId: string) => useQuery({
    queryKey: ['campaign-characters', campaignId],
    queryFn: async () => {
      const result = await characterAPI.getCampaignCharacters(campaignId);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!campaignId,
  });

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading: loading || createCharacterMutation.isPending || updateCharacterMutation.isPending || deleteCharacterMutation.isPending,
    error,
    
    // Actions
    createCharacter,
    updateCharacter,
    deleteCharacter,
    clearError,
    
    // Queries
    useRacesQuery,
    useClassesQuery,
    useBackgroundsQuery,
    useSpellsQuery,
    useCharacterQuery,
    useCampaignCharactersQuery,
    
    // Mutation states
    isCreating: createCharacterMutation.isPending,
    isUpdating: updateCharacterMutation.isPending,
    isDeleting: deleteCharacterMutation.isPending,
    
    // Utils
    refetchRaces: () => queryClient.invalidateQueries({ queryKey: ['dnd', 'races'] }),
    refetchClasses: () => queryClient.invalidateQueries({ queryKey: ['dnd', 'classes'] }),
    refetchBackgrounds: () => queryClient.invalidateQueries({ queryKey: ['dnd', 'backgrounds'] }),
    refetchSpells: (classIndex?: string) => queryClient.invalidateQueries({ 
      queryKey: ['dnd', 'spells', classIndex] 
    }),
    refetchCharacter: (id: string) => queryClient.invalidateQueries({ queryKey: ['character', id] }),
  };
};