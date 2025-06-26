// ===========================
// CHARACTER API - COMPLETE IMPLEMENTATION
// src/api/characterAPI.ts
// ===========================

import { CharacterCreationData } from "@/types/characterCreation";

// ===========================
// API TYPES
// ===========================

export interface CreateCharacterResponse {
  success: boolean;
  character?: CreatedCharacter;
  error?: string;
}

export interface CreatedCharacter {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  hitPoints: number;
  armorClass: number;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ===========================
// API CONFIGURATION
// ===========================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

// ===========================
// CHARACTER API CLASS
// ===========================

class CharacterAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Faz requisição HTTP genérica
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro na requisição" }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na requisição:", error);
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro de conexão");
    }
  }

  /**
   * Valida dados do personagem antes de enviar
   */
  validateCharacterData(characterData: CharacterCreationData): string[] {
    const errors: string[] = [];

    // Validações básicas
    if (!characterData.name?.trim()) {
      errors.push("Nome é obrigatório");
    }

    if (!characterData.selectedRace) {
      errors.push("Raça é obrigatória");
    }

    if (!characterData.selectedClass) {
      errors.push("Classe é obrigatória");
    }

    if (!characterData.selectedBackground) {
      errors.push("Background é obrigatório");
    }

    if (!characterData.alignment) {
      errors.push("Alinhamento é obrigatório");
    }

    // Validação de atributos
    const abilities = characterData.abilityScores;
    if (abilities) {
      Object.entries(abilities).forEach(([ability, score]) => {
        if (score < 8 || score > 15) {
          errors.push(`${ability} deve estar entre 8 e 15`);
        }
      });
    } else {
      errors.push("Atributos são obrigatórios");
    }

    // Validação de HP e AC
    if (characterData.hitPoints <= 0) {
      errors.push("Pontos de vida devem ser maiores que 0");
    }

    if (characterData.armorClass < 10) {
      errors.push("Classe de armadura deve ser pelo menos 10");
    }

    // Validação de perícias
    if (characterData.availableSkillChoices > 0 && 
        characterData.selectedSkills.length !== characterData.availableSkillChoices) {
      errors.push(`Deve selecionar exatamente ${characterData.availableSkillChoices} perícias`);
    }

    // Validação de magias para conjuradores
    if (characterData.isSpellcaster && !characterData.spellcastingAbility) {
      errors.push("Conjuradores devem ter uma habilidade de conjuração");
    }

    return errors;
  }

  /**
   * Cria um novo personagem
   */
  async createCharacter(characterData: CharacterCreationData): Promise<CreateCharacterResponse> {
    try {
      // Validar dados localmente primeiro
      const validationErrors = this.validateCharacterData(characterData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: `Dados inválidos: ${validationErrors.join(", ")}`,
        };
      }

      // Preparar dados para envio
      const characterPayload = {
        name: characterData.name.trim(),
        race: {
          index: characterData.selectedRace?.index,
          name: characterData.selectedRace?.name,
        },
        subrace: characterData.selectedSubrace ? {
          index: characterData.selectedSubrace.index,
          name: characterData.selectedSubrace.name,
        } : null,
        class: {
          index: characterData.selectedClass?.index,
          name: characterData.selectedClass?.name,
        },
        subclass: characterData.selectedSubclass ? {
          index: characterData.selectedSubclass.index,
          name: characterData.selectedSubclass.name,
        } : null,
        background: {
          index: characterData.selectedBackground?.index,
          name: characterData.selectedBackground?.name,
        },
        level: characterData.level,
        alignment: characterData.alignment,
        abilityScores: characterData.abilityScores,
        abilityMethod: characterData.abilityMethod,
        selectedSkills: characterData.selectedSkills,
        hitPoints: characterData.hitPoints,
        armorClass: characterData.armorClass,
        isSpellcaster: characterData.isSpellcaster,
        spellcastingAbility: characterData.spellcastingAbility,
        selectedSpells: characterData.selectedSpells.map(spell => ({
          index: spell.index,
          name: spell.name,
          level: spell.level,
        })),
        personalityTraits: characterData.personalityTraits,
        ideals: characterData.ideals,
        bonds: characterData.bonds,
        flaws: characterData.flaws,
      };

      // Enviar para API
      const response = await this.request<CreateCharacterResponse>("/characters", {
        method: "POST",
        body: JSON.stringify(characterPayload),
      });

      return response;

    } catch (error) {
      console.error("Erro ao criar personagem:", error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao criar personagem",
      };
    }
  }

  /**
   * Busca um personagem por ID
   */
  async getCharacter(characterId: string): Promise<CreatedCharacter | null> {
    try {
      const character = await this.request<CreatedCharacter>(`/characters/${characterId}`);
      return character;
    } catch (error) {
      console.error("Erro ao buscar personagem:", error);
      return null;
    }
  }

  /**
   * Lista personagens do usuário
   */
  async getCharacters(userId?: string): Promise<CreatedCharacter[]> {
    try {
      const endpoint = userId ? `/characters?userId=${userId}` : "/characters";
      const characters = await this.request<CreatedCharacter[]>(endpoint);
      return characters;
    } catch (error) {
      console.error("Erro ao listar personagens:", error);
      return [];
    }
  }

  /**
   * Atualiza um personagem
   */
  async updateCharacter(
    characterId: string, 
    updates: Partial<CharacterCreationData>
  ): Promise<CreateCharacterResponse> {
    try {
      const response = await this.request<CreateCharacterResponse>(`/characters/${characterId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      return response;
    } catch (error) {
      console.error("Erro ao atualizar personagem:", error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao atualizar personagem",
      };
    }
  }

  /**
   * Deleta um personagem
   */
  async deleteCharacter(characterId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.request(`/characters/${characterId}`, {
        method: "DELETE",
      });

      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar personagem:", error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao deletar personagem",
      };
    }
  }

  /**
   * Verifica se o servidor está funcionando
   */
  async healthCheck(): Promise<{ status: string; message?: string }> {
    try {
      const response = await this.request<{ status: string; message?: string }>("/health");
      return response;
    } catch (error) {
      console.error("Erro no health check:", error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Servidor indisponível",
      };
    }
  }

  /**
   * Exporta personagem para formato JSON
   */
  exportCharacter(characterData: CharacterCreationData): string {
    const exportData = {
      ...characterData,
      exportedAt: new Date().toISOString(),
      exportVersion: "1.0",
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Importa personagem de formato JSON
   */
  importCharacter(jsonData: string): CharacterCreationData | null {
    try {
      const data = JSON.parse(jsonData);
      
      // Validar se tem os campos necessários
      if (!data.name || !data.selectedRace || !data.selectedClass) {
        throw new Error("Dados de personagem inválidos");
      }

      return data as CharacterCreationData;
    } catch (error) {
      console.error("Erro ao importar personagem:", error);
      return null;
    }
  }
}

// ===========================
// INSTÂNCIA SINGLETON
// ===========================

export const characterAPI = new CharacterAPI();

// ===========================
// EXPORTS
// ===========================

export default characterAPI;
export { CharacterAPI };
export type { CreateCharacterResponse, CreatedCharacter };