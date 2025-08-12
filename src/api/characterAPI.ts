import { Character, EquipmentItem } from "@/types/character";

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
        const errorData = await response
          .json()
          .catch(() => ({ error: "Erro na requisição" }));
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

  // Retorna Character (ou null) consultando o endpoint que devolve um CharacterResponse
  async getCharacterById(characterId: string): Promise<CharacterResponse> {
    try {
      const response = await this.request<CharacterResponse>(`/characters/${characterId}`);

      if (response.success && response.character) {
        return {
          success: true,
          character: response.character,
        };
      }

      return response;
    } catch (error) {
      console.error("Erro ao buscar personagem:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao buscar personagem",
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
          characters: response.characters,
        };
      }

      return response;
    } catch (error) {
      console.error("Erro ao buscar personagens da campanha:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao buscar personagens",
      };
    }
  }

  // Valida utilizando apenas o tipo Character (já no formato do backend)
  validateCharacterData(characterData: Character): string[] {
    const errors: string[] = [];

    if (!characterData.basic_info?.name?.trim()) {
      errors.push("Nome é obrigatório");
    }

    if (!characterData.basic_info?.race_info?.race_name) {
      errors.push("Raça é obrigatória");
    }

    if (!characterData.basic_info?.character_class) {
      errors.push("Classe é obrigatória");
    }

    // Background pode estar em details ou em basic_info dependendo do schema; checamos basic_info primeiro
    if (!characterData.basic_info?.background) {
      errors.push("Background é obrigatório");
    }

    // Atributos
    const abilities = characterData.attributes;
    if (abilities) {
      const allowedRange = { min: 1, max: 30 };
      (Object.entries(abilities) as [string, number][]).forEach(([ability, score]) => {
        if (typeof score !== 'number' || score < allowedRange.min || score > allowedRange.max) {
          errors.push(`${ability} deve estar entre ${allowedRange.min} e ${allowedRange.max}`);
        }
      });
    } else {
      errors.push("Atributos são obrigatórios");
    }

    if (!characterData.stats || typeof characterData.stats.hit_points !== 'number' || characterData.stats.hit_points <= 0) {
      errors.push("Pontos de vida devem ser maiores que 0");
    }

    if (!characterData.stats || typeof characterData.stats.armor_class !== 'number' || characterData.stats.armor_class < 10) {
      errors.push("Classe de armadura deve ser pelo menos 10");
    }

    if (characterData.magic?.spellcaster && !characterData.magic?.spellcasting_ability) {
      errors.push("Conjuradores devem ter uma habilidade de conjuração");
    }

    return errors;
  }

  // Agora createCharacter recebe diretamente um Character (já formatado para o backend)
  async createCharacter(characterData: Character): Promise<CharacterResponse> {
    try {
      const validationErrors = this.validateCharacterData(characterData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: `Dados inválidos: ${validationErrors.join(', ')}`,
        };
      }

      // Preparamos payload para enviar ao backend. Permitimos que o backend gere o id.
      const payload: Partial<Character> = {
        ...characterData,
        id: undefined as any, // removemos id para o backend gerar
        is_active: characterData.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = await this.request<CharacterResponse>("/characters", {
        method: "POST",
        body: JSON.stringify(payload),
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

  // Busca simples retornando Character (usa getCharacterById internamente)
  async getCharacter(characterId: string): Promise<Character | null> {
    try {
      const resp = await this.getCharacterById(characterId);
      return resp.success && resp.character ? resp.character : null;
    } catch (error) {
      console.error("Erro ao buscar personagem:", error);
      return null;
    }
  }

  async getCharacters(userId?: string): Promise<Character[]> {
    try {
      const endpoint = userId ? `/characters?userId=${userId}` : "/characters";
      return await this.request<Character[]>(endpoint);
    } catch (error) {
      console.error("Erro ao listar personagens:", error);
      return [];
    }
  }

  async updateCharacter(
    characterId: string,
    updates: Partial<Character>
  ): Promise<CharacterResponse> {
    try {
      const response = await this.request<CharacterResponse>(`/characters/${characterId}`, {
        method: "PUT",
        body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
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
      return await this.request<{ status: string; message?: string }>("/health");
    } catch (error) {
      console.error("Erro no health check:", error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Servidor indisponível",
      };
    }
  }

  exportCharacter(characterData: Character): string {
    const exportData = {
      ...characterData,
      exportedAt: new Date().toISOString(),
      exportVersion: "1.0",
    };

    return JSON.stringify(exportData, null, 2);
  }

  importCharacter(jsonData: string): Character | null {
    try {
      const data = JSON.parse(jsonData);

      if (!data.basic_info?.name || !data.basic_info?.race_info) {
        throw new Error("Dados de personagem inválidos");
      }

      return data as Character;
    } catch (error) {
      console.error("Erro ao importar personagem:", error);
      return null;
    }
  }
}

export const characterAPI = new CharacterAPI();

export default characterAPI;
export { CharacterAPI };
