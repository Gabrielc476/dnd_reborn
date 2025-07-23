import { CharacterCreationData } from "@/types/characterCreation";

export interface Character {
  id: string;
  user_id: string;
  name?: string;
  class?: string;
  level?: number;
  hit_points?: number;
  max_hit_points?: number;
  armor_class?: number;
  conditions?: string[];
  notes?: string;
  race?: string;
  background?: string;
  alignment?: string;
  experience_points?: number;
  skills?: string[];
  inventory?: string[];
  spells?: string[];
  personality_traits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
}

export interface CharacterResponse {
  success: boolean;
  character?: Character;
  error?: string;
}

export interface CampaignCharactersResponse {
  success: boolean;
  characters?: Character[];
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

class CharacterAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

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
   * Mapeia os campos de um personagem de forma universal
   * Extrai dados tanto da raiz quanto de subobjetos como basic_info e stats
   */
  public mapCharacterFields(character: any): Character {
    // Função helper para obter valor de qualquer nível
    const getValue = (primaryPath: string, fallbackPaths: string[] = [], defaultValue: any = "") => {
      // Tenta o caminho principal primeiro
      if (character[primaryPath] !== undefined && character[primaryPath] !== null) {
        return character[primaryPath];
      }
      
      // Tenta caminhos alternativos
      for (const path of fallbackPaths) {
        const value = this.getNestedValue(character, path);
        if (value !== undefined && value !== null) return value;
      }
      
      // Valor padrão se não encontrar
      return defaultValue;
    };

    // Mapeamento de campos com prioridades
    return {
      ...character,
      id: character.id || "",
      user_id: character.user_id || "",
      name: getValue("name", ["basic_info.name"], "Personagem sem nome"),
      class: getValue("class", ["basic_info.character_class"], "Classe desconhecida"),
      level: getValue("level", ["basic_info.level"], 1),
      max_hit_points: getValue("max_hit_points", ["stats.max_hit_points", "stats.hit_points"], 0),
      armor_class: getValue("armor_class", ["stats.armor_class"], 0),
      conditions: character.conditions || [],
      race: getValue("race", ["basic_info.race_info.race_name"], ""),
      background: getValue("background", ["basic_info.background"], ""),
      alignment: getValue("alignment", ["basic_info.alignment"], ""),
      experience_points: getValue("experience_points", ["stats.experience_points"], 0)
    };
  }

  /**
   * Helper para obter valores aninhados em objetos
   * Ex: getNestedValue(char, "basic_info.race_info.race_name")
   */
  private getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => {
      if (acc === null || acc === undefined) return undefined;
      return acc[part];
    }, obj);
  }

  async getCharacterById(characterId: string): Promise<CharacterResponse> {
    try {
      const response = await this.request<CharacterResponse>(`/characters/${characterId}`);
      
      if (response.success && response.character) {
        return {
          success: true,
          character: this.mapCharacterFields(response.character)
        };
      }
      
      return response;
    } catch (error) {
      console.error("Erro ao buscar personagem:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao buscar personagem"
      };
    }
  }

  async getCampaignCharacters(campaignId: string): Promise<CampaignCharactersResponse> {
    try {
      const endpoint = `/characters/campaign/${campaignId}/characters`;
      console.log(`[characterAPI] GET ${endpoint}`);
      
      const response = await this.request<CampaignCharactersResponse>(endpoint);
      
      if (response.success && response.characters) {
        return {
          success: true,
          characters: response.characters.map(char => this.mapCharacterFields(char))
        };
      }
      
      return response;
    } catch (error) {
      console.error("Erro ao buscar personagens da campanha:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao buscar personagens"
      };
    }
  }

  validateCharacterData(characterData: CharacterCreationData): string[] {
    const errors: string[] = [];

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

    if (characterData.hitPoints <= 0) {
      errors.push("Pontos de vida devem ser maiores que 0");
    }

    if (characterData.armorClass < 10) {
      errors.push("Classe de armadura deve ser pelo menos 10");
    }

    if (characterData.availableSkillChoices > 0 && 
        characterData.selectedSkills.length !== characterData.availableSkillChoices) {
      errors.push(`Deve selecionar exatamente ${characterData.availableSkillChoices} perícias`);
    }

    if (characterData.isSpellcaster && !characterData.spellcastingAbility) {
      errors.push("Conjuradores devem ter uma habilidade de conjuração");
    }

    return errors;
  }

  async createCharacter(characterData: CharacterCreationData): Promise<CharacterResponse> {
    try {
      const validationErrors = this.validateCharacterData(characterData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: `Dados inválidos: ${validationErrors.join(", ")}`,
        };
      }

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

      const response = await this.request<CharacterResponse>("/characters", {
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

  async getCharacter(characterId: string): Promise<Character | null> {
    try {
      const character = await this.request<Character>(`/characters/${characterId}`);
      return this.mapCharacterFields(character);
    } catch (error) {
      console.error("Erro ao buscar personagem:", error);
      return null;
    }
  }

  async getCharacters(userId?: string): Promise<Character[]> {
    try {
      const endpoint = userId ? `/characters?userId=${userId}` : "/characters";
      const characters = await this.request<Character[]>(endpoint);
      return characters.map(this.mapCharacterFields);
    } catch (error) {
      console.error("Erro ao listar personagens:", error);
      return [];
    }
  }

  async updateCharacter(
    characterId: string, 
    updates: Partial<CharacterCreationData>
  ): Promise<CharacterResponse> {
    try {
      const response = await this.request<CharacterResponse>(`/characters/${characterId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      if (response.success && response.character) {
        return {
          success: true,
          character: this.mapCharacterFields(response.character)
        };
      }

      return response;
    } catch (error) {
      console.error("Erro ao atualizar personagem:", error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao atualizar personagem",
      };
    }
  }

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

  exportCharacter(characterData: CharacterCreationData): string {
    const exportData = {
      ...characterData,
      exportedAt: new Date().toISOString(),
      exportVersion: "1.0",
    };

    return JSON.stringify(exportData, null, 2);
  }

  importCharacter(jsonData: string): CharacterCreationData | null {
    try {
      const data = JSON.parse(jsonData);
      
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

export const characterAPI = new CharacterAPI();

export default characterAPI;
export { CharacterAPI };
export type { Character, CharacterResponse, CampaignCharactersResponse };