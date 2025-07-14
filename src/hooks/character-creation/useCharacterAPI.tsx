// ===========================
// useCharacterAPI.ts
// Hook para integração com API de personagens
// ===========================

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Tipos
interface CreateCharacterData {
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
  equipment?: any[];
  spells?: any[];
  personality?: {
    traits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  };
  campaign_id?: string;
}

interface UpdateCharacterData extends Partial<CreateCharacterData> {
  id: string;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Simulação de API - substitua pelas suas chamadas reais
const characterAPI = {
  // Criar personagem
  async createCharacter(data: CreateCharacterData): Promise<APIResponse<any>> {
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
  async updateCharacter(data: UpdateCharacterData): Promise<APIResponse<any>> {
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
  async deleteCharacter(id: string): Promise<APIResponse<boolean>> {
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return { success: true, data: true };
    } catch (error) {
      console.error('Erro ao deletar personagem:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // Listar personagens de uma campanha
  async getCampaignCharacters(campaignId: string): Promise<APIResponse<any[]>> {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/characters`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao obter personagens da campanha:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // Obter dados D&D 5e
  async getRaces(): Promise<APIResponse<any[]>> {
    try {
      const response = await fetch('/api/dnd/races');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  async getClasses(): Promise<APIResponse<any[]>> {
    try {
      const response = await fetch('/api/dnd/classes');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  async getBackgrounds(): Promise<APIResponse<any[]>> {
    try {
      const response = await fetch('/api/dnd/backgrounds');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  async getSpells(classIndex?: string): Promise<APIResponse<any[]>> {
    try {
      const url = classIndex ? `/api/dnd/spells?class=${classIndex}` : '/api/dnd/spells';
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },
};

export const useCharacterAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Mutation para criar personagem
  const createCharacterMutation = useMutation({
    mutationFn: characterAPI.createCharacter,
    onSuccess: (data) => {
      if (data.success) {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['characters'] });
        queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
      }
    },
  });

  // Mutation para atualizar personagem
  const updateCharacterMutation = useMutation({
    mutationFn: characterAPI.updateCharacter,
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['characters'] });
      }
    },
  });

  // Mutation para deletar personagem
  const deleteCharacterMutation = useMutation({
    mutationFn: characterAPI.deleteCharacter,
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
    },
  });

  // Criar personagem
  const createCharacter = useCallback(async (data: CreateCharacterData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createCharacterMutation.mutateAsync(data);
      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar personagem');
      }
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createCharacterMutation]);

  // Atualizar personagem
  const updateCharacter = useCallback(async (data: UpdateCharacterData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateCharacterMutation.mutateAsync(data);
      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar personagem');
      }
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateCharacterMutation]);

  // Deletar personagem
  const deleteCharacter = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteCharacterMutation.mutateAsync(id);
      if (!result.success) {
        throw new Error(result.error || 'Erro ao deletar personagem');
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteCharacterMutation]);

  // Queries para dados D&D
  const useRacesQuery = () => useQuery({
    queryKey: ['dnd', 'races'],
    queryFn: async () => {
      const result = await characterAPI.getRaces();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const useClassesQuery = () => useQuery({
    queryKey: ['dnd', 'classes'],
    queryFn: async () => {
      const result = await characterAPI.getClasses();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const useBackgroundsQuery = () => useQuery({
    queryKey: ['dnd', 'backgrounds'],
    queryFn: async () => {
      const result = await characterAPI.getBackgrounds();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const useSpellsQuery = (classIndex?: string) => useQuery({
    queryKey: ['dnd', 'spells', classIndex],
    queryFn: async () => {
      const result = await characterAPI.getSpells(classIndex);
      if (!result.success) throw new Error(result.error);
      return result.data;
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
      return result.data;
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
    refetchCharacter: (id: string) => queryClient.invalidateQueries({ queryKey: ['character', id] }),
  };
};