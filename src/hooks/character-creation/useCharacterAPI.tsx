// ===========================
// useCharacterAPI.tsx - VERSÃO COMPLETA COM REACT QUERY
// Hook para integração com API de personagens usando rotas reais do Flask
// ===========================

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dndAPI } from '@/api/dndAPI';
import {
  CharacterCreationData,
  DndRace,
  DndClass,
  DndBackground,
  DndSpell,
  APIResponse,
  CreateCharacterResponse
} from '@/types/characterCreation';

// ===========================
// CONFIGURAÇÕES DA API
// ===========================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

// ===========================
// INTERFACES
// ===========================

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

interface CharacterResponse {
  id: string;
  name: string;
  race: string;
  character_class: string;
  level: number;
  user_id: string;
  campaign_id?: string;
  created_at: string;
  updated_at: string;
  // Adicionar outros campos conforme necessário
}

// ===========================
// UTILITÁRIOS HTTP
// ===========================

class CharacterAPIClient {
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
      console.log(`🌐 Character API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`📥 Character API Response:`, data);

      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ Character API Error: ${url}`, error);
      throw error;
    }
  }

  // ===========================
  // MÉTODOS DE PERSONAGEM
  // ===========================

  /**
   * Criar novo personagem
   */
  async createCharacter(data: CreateCharacterRequest): Promise<{ character_id: string; message: string }> {
    return this.request('/characters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Buscar personagem por ID
   */
  async getCharacter(id: string): Promise<{ character: CharacterResponse }> {
    return this.request(`/characters/${id}`);
  }

  /**
   * Buscar todos os personagens do usuário
   */
  async getMyCharacters(): Promise<{ characters: CharacterResponse[]; count: number }> {
    return this.request('/characters');
  }

  /**
   * Buscar personagens de uma campanha
   */
  async getCampaignCharacters(campaignId: string): Promise<{ characters: CharacterResponse[]; count: number }> {
    return this.request(`/characters/campaign/${campaignId}`);
  }

  /**
   * Atualizar personagem
   */
  async updateCharacter(id: string, data: Partial<CreateCharacterRequest>): Promise<{ message: string }> {
    return this.request(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Deletar personagem
   */
  async deleteCharacter(id: string): Promise<{ message: string }> {
    return this.request(`/characters/${id}`, {
      method: 'DELETE',
    });
  }
}

// ===========================
// INSTÂNCIA DA API
// ===========================

const characterAPI = new CharacterAPIClient();

// ===========================
// HOOK PRINCIPAL
// ===========================

export const useCharacterAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // ===========================
  // QUERIES - DADOS D&D
  // ===========================

  const useRacesQuery = () => useQuery({
    queryKey: ['dnd', 'races'],
    queryFn: async () => {
      console.log('🔍 Buscando raças D&D...');
      return await dndAPI.getRaces();
    },
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });

  const useClassesQuery = () => useQuery({
    queryKey: ['dnd', 'classes'],
    queryFn: async () => {
      console.log('🔍 Buscando classes D&D...');
      return await dndAPI.getClasses();
    },
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });

  const useBackgroundsQuery = () => useQuery({
    queryKey: ['dnd', 'backgrounds'],
    queryFn: async () => {
      console.log('🔍 Buscando backgrounds D&D...');
      return await dndAPI.getBackgrounds();
    },
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });

  const useSpellsQuery = (classIndex?: string) => useQuery({
    queryKey: ['dnd', 'spells', classIndex],
    queryFn: async () => {
      console.log(`🔍 Buscando magias D&D para classe: ${classIndex || 'todas'}...`);
      return await dndAPI.getSpells(classIndex);
    },
    enabled: !!classIndex,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });

  // ===========================
  // QUERIES - PERSONAGENS
  // ===========================

  const useCharacterQuery = (id: string) => useQuery({
    queryKey: ['character', id],
    queryFn: async () => {
      const result = await characterAPI.getCharacter(id);
      return result.character;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  const useMyCharactersQuery = () => useQuery({
    queryKey: ['my-characters'],
    queryFn: async () => {
      const result = await characterAPI.getMyCharacters();
      return result.characters;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  const useCampaignCharactersQuery = (campaignId: string) => useQuery({
    queryKey: ['campaign-characters', campaignId],
    queryFn: async () => {
      const result = await characterAPI.getCampaignCharacters(campaignId);
      return result.characters;
    },
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  // ===========================
  // MUTATIONS - PERSONAGENS
  // ===========================

  const createCharacterMutation = useMutation({
    mutationFn: characterAPI.createCharacter,
    onSuccess: (data) => {
      console.log('✅ Personagem criado com sucesso:', data);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['my-characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
      
      // Limpar erro
      setError(null);
    },
    onError: (error) => {
      console.error('❌ Erro ao criar personagem:', error);
      setError(error instanceof Error ? error.message : 'Erro ao criar personagem');
    },
  });

  const updateCharacterMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCharacterRequest> }) => 
      characterAPI.updateCharacter(id, data),
    onSuccess: (data, variables) => {
      console.log('✅ Personagem atualizado com sucesso:', data);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['my-characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
      
      // Limpar erro
      setError(null);
    },
    onError: (error) => {
      console.error('❌ Erro ao atualizar personagem:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar personagem');
    },
  });

  const deleteCharacterMutation = useMutation({
    mutationFn: characterAPI.deleteCharacter,
    onSuccess: (data) => {
      console.log('✅ Personagem deletado com sucesso:', data);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['my-characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
      
      // Limpar erro
      setError(null);
    },
    onError: (error) => {
      console.error('❌ Erro ao deletar personagem:', error);
      setError(error instanceof Error ? error.message : 'Erro ao deletar personagem');
    },
  });

  // ===========================
  // ACTIONS
  // ===========================

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
        personality: data.personalityTraits && data.personalityTraits.length > 0 ? {
          traits: data.personalityTraits,
          ideals: data.ideals,
          bonds: data.bonds,
          flaws: data.flaws,
        } : undefined,
      };

      const result = await createCharacterMutation.mutateAsync(requestData);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [createCharacterMutation]);

  const updateCharacter = useCallback(async (id: string, data: Partial<CharacterCreationData>) => {
    setLoading(true);
    setError(null);
    
    try {
      const requestData: Partial<CreateCharacterRequest> = {
        name: data.name,
        race: data.selectedRace?.index,
        subrace: data.selectedSubrace?.index,
        character_class: data.selectedClass?.index,
        subclass: data.selectedSubclass?.index,
        background: data.selectedBackground?.index,
        alignment: data.alignment,
        level: data.level,
        ability_scores: data.abilityScores,
        skills: data.selectedSkills,
        hit_points: data.hitPoints,
        armor_class: data.armorClass,
        equipment: data.selectedEquipment,
        spells: data.selectedSpells,
        personality: data.personalityTraits && data.personalityTraits.length > 0 ? {
          traits: data.personalityTraits,
          ideals: data.ideals,
          bonds: data.bonds,
          flaws: data.flaws,
        } : undefined,
      };

      const result = await updateCharacterMutation.mutateAsync({ id, data: requestData });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [deleteCharacterMutation]);

  // ===========================
  // UTILIDADES
  // ===========================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refetchRaces = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dnd', 'races'] });
  }, [queryClient]);

  const refetchClasses = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dnd', 'classes'] });
  }, [queryClient]);

  const refetchBackgrounds = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dnd', 'backgrounds'] });
  }, [queryClient]);

  const refetchSpells = useCallback((classIndex?: string) => {
    queryClient.invalidateQueries({ 
      queryKey: ['dnd', 'spells', classIndex] 
    });
  }, [queryClient]);

  const refetchCharacter = useCallback((id: string) => {
    queryClient.invalidateQueries({ queryKey: ['character', id] });
  }, [queryClient]);

  const refetchMyCharacters = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['my-characters'] });
  }, [queryClient]);

  const refetchCampaignCharacters = useCallback((campaignId: string) => {
    queryClient.invalidateQueries({ queryKey: ['campaign-characters', campaignId] });
  }, [queryClient]);

  // ===========================
  // RETURN
  // ===========================

  return {
    // State
    loading: loading || createCharacterMutation.isPending || updateCharacterMutation.isPending || deleteCharacterMutation.isPending,
    error,
    
    // Actions
    createCharacter,
    updateCharacter,
    deleteCharacter,
    clearError,
    
    // Queries - D&D Data
    useRacesQuery,
    useClassesQuery,
    useBackgroundsQuery,
    useSpellsQuery,
    
    // Queries - Characters
    useCharacterQuery,
    useMyCharactersQuery,
    useCampaignCharactersQuery,
    
    // Mutation states
    isCreating: createCharacterMutation.isPending,
    isUpdating: updateCharacterMutation.isPending,
    isDeleting: deleteCharacterMutation.isPending,
    
    // Refetch utilities
    refetchRaces,
    refetchClasses,
    refetchBackgrounds,
    refetchSpells,
    refetchCharacter,
    refetchMyCharacters,
    refetchCampaignCharacters,
    
    // Access to raw query client for advanced usage
    queryClient,
  };
};