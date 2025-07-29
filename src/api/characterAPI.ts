import { CharacterCreationData } from "@/types/characterCreation";
import { 
  Character, 
  CharacterSummary, 
  BasicInfo, 
  RaceInfo, 
  Attributes, 
  Skills, 
  Stats, 
  Combat, 
  Magic, 
  CharacterDetails,
  DiceRoll,
  Attack,
  Spell
} from "@/types/character";

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

  async getCharacterById(characterId: string): Promise<CharacterResponse> {
    try {
      const response = await this.request<CharacterResponse>(`/characters/${characterId}`);
      
      if (response.success && response.character) {
        return {
          success: true,
          character: response.character
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
          characters: response.characters
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

      // Mapear para a nova estrutura de personagem
      const characterPayload: Character = {
        id: "", // Será gerado pelo backend
        user_id: characterData.userId,
        campaign_id: characterData.campaignId,
        basic_info: {
          name: characterData.name.trim(),
          race_info: {
            race_name: characterData.selectedRace?.name || "",
            race_index: characterData.selectedRace?.index || "",
            subrace_name: characterData.selectedSubrace?.name,
            subrace_index: characterData.selectedSubrace?.index,
            speed: 30, // Valor padrão, pode ser ajustado
            size: "Medium", // Valor padrão
            ability_bonuses: characterData.raceAbilityBonuses || {},
            racial_traits: characterData.racialTraits || [],
            languages: characterData.languages || [],
            proficiencies: characterData.raceProficiencies || []
          },
          class: characterData.selectedClass?.name || "",
          level: characterData.level || 1,
          background: characterData.selectedBackground?.name || "",
          alignment: characterData.alignment || ""
        },
        attributes: {
          strength: characterData.abilityScores?.strength || 10,
          dexterity: characterData.abilityScores?.dexterity || 10,
          constitution: characterData.abilityScores?.constitution || 10,
          intelligence: characterData.abilityScores?.intelligence || 10,
          wisdom: characterData.abilityScores?.wisdom || 10,
          charisma: characterData.abilityScores?.charisma || 10
        },
        skills: this.mapSkills(characterData.selectedSkills),
        stats: {
          current_hp: characterData.hitPoints || 0,
          max_hp: characterData.hitPoints || 0,
          armor_class: characterData.armorClass || 10,
          experience_points: 0
        },
        combat: {
          attacks: characterData.attacks || []
        },
        magic: {
          spellcaster: characterData.isSpellcaster || false,
          spellcasting_ability: characterData.spellcastingAbility,
          known_spells: characterData.selectedSpells.map(spell => ({
            name: spell.name,
            level: spell.level,
            school: spell.school || "",
            description: spell.description,
            is_attack_spell: spell.isAttack,
            attack_bonus: spell.attackBonus,
            damage: spell.damage ? {
              dice_count: spell.damage.diceCount,
              dice_sides: spell.damage.diceSides,
              modifier: spell.damage.modifier
            } : undefined,
            damage_type: spell.damageType,
            save_dc: spell.saveDC,
            save_ability: spell.saveAbility,
            range: spell.range || "Toque"
          })),
          spell_slots_1: characterData.spellSlots?.[1] || 0,
          spell_slots_2: characterData.spellSlots?.[2] || 0,
          spell_slots_3: characterData.spellSlots?.[3] || 0,
          spell_slots_4: characterData.spellSlots?.[4] || 0,
          spell_slots_5: characterData.spellSlots?.[5] || 0,
          spell_slots_6: characterData.spellSlots?.[6] || 0,
          spell_slots_7: characterData.spellSlots?.[7] || 0,
          spell_slots_8: characterData.spellSlots?.[8] || 0,
          spell_slots_9: characterData.spellSlots?.[9] || 0
        },
        details: {
          background: characterData.selectedBackground?.description || "",
          alignment: characterData.alignment || "",
          personality_traits: characterData.personalityTraits || "",
          ideals: characterData.ideals || "",
          bonds: characterData.bonds || "",
          flaws: characterData.flaws || "",
          backstory: characterData.backstory || "",
          appearance: characterData.appearance || ""
        },
        equipment: characterData.equipment || [],
        features: characterData.features || [],
        languages: characterData.languages || [],
        proficiencies: characterData.proficiencies || [],
        player_name: characterData.playerName,
        is_active: true,
        avatar_url: characterData.avatarUrl || ""
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

  // Helper para mapear skills para o novo formato
  private mapSkills(selectedSkills: string[]): Skills {
    const skills: Skills = {
      athletics: false,
      acrobatics: false,
      sleight_of_hand: false,
      stealth: false,
      arcana: false,
      history: false,
      investigation: false,
      nature: false,
      religion: false,
      animal_handling: false,
      insight: false,
      medicine: false,
      perception: false,
      survival: false,
      deception: false,
      intimidation: false,
      performance: false,
      persuasion: false
    };

    selectedSkills.forEach(skill => {
      const skillKey = skill.toLowerCase().replace(/[\s-]+/g, '_') as keyof Skills;
      if (skills.hasOwnProperty(skillKey)) {
        skills[skillKey] = true;
      }
    });

    return skills;
  }

  async getCharacter(characterId: string): Promise<Character | null> {
    try {
      return await this.request<Character>(`/characters/${characterId}`);
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
export type { Character, CharacterResponse, CampaignCharactersResponse };