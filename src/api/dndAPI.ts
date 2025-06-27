// ===========================
// D&D API SERVICE - INTEGRAÇÃO COMPLETA (RAÇAS + CLASSES + SUBCLASSES)
// src/api/dndAPI.ts
// ===========================

import { DndRace, DndSubrace, DndClass, DndSubclass, DndBackground, DndSpell } from "@/types/characterCreation";

// ===========================
// CONFIGURAÇÃO DA API
// ===========================

const DND_API_BASE_URL = "https://www.dnd5eapi.co/api";

// ===========================
// TIPOS DA API D&D - EXPANDIDOS
// ===========================

interface DndApiRace {
  index: string;
  name: string;
  speed: number;
  ability_bonuses: Array<{
    ability_score: {
      index: string;
      name: string;
      url: string;
    };
    bonus: number;
  }>;
  alignment: string;
  age: string;
  size: string;
  size_description: string;
  starting_proficiencies: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  languages: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  language_desc: string;
  traits: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  subraces: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  url: string;
}

interface DndApiSubrace {
  index: string;
  name: string;
  race: {
    index: string;
    name: string;
    url: string;
  };
  desc: string;
  ability_bonuses: Array<{
    ability_score: {
      index: string;
      name: string;
      url: string;
    };
    bonus: number;
  }>;
  starting_proficiencies: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  languages: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  racial_traits: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  url: string;
}

interface DndApiClass {
  index: string;
  name: string;
  hit_die: number;
  proficiencies: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  proficiency_choices: Array<{
    desc: string;
    choose: number;
    type: string;
    from: {
      option_set_type: string;
      options: Array<{
        option_type: string;
        item: {
          index: string;
          name: string;
          url: string;
        };
      }>;
    };
  }>;
  saving_throws: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  starting_equipment: Array<{
    equipment: {
      index: string;
      name: string;
      url: string;
    };
    quantity: number;
  }>;
  class_levels: string;
  multi_classing: {
    prerequisites?: Array<{
      ability_score: {
        index: string;
        name: string;
        url: string;
      };
      minimum_score: number;
    }>;
    proficiencies?: Array<{
      index: string;
      name: string;
      url: string;
    }>;
  };
  subclasses: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  spellcasting?: {
    level: number;
    spellcasting_ability: {
      index: string;
      name: string;
      url: string;
    };
    info: Array<{
      name: string;
      desc: string[];
    }>;
  };
  url: string;
}

interface DndApiSubclass {
  index: string;
  name: string;
  class: {
    index: string;
    name: string;
    url: string;
  };
  subclass_flavor: string;
  desc: string[];
  subclass_levels: Array<{
    level: number;
    features: Array<{
      index: string;
      name: string;
      url: string;
    }>;
  }>;
  spells?: Array<{
    level: number;
    spells: Array<{
      index: string;
      name: string;
      url: string;
    }>;
  }>;
  url: string;
}

interface DndApiBackground {
  index: string;
  name: string;
  starting_proficiencies: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  languages: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  starting_equipment: Array<{
    equipment: {
      index: string;
      name: string;
      url: string;
    };
    quantity: number;
  }>;
  feature: {
    name: string;
    desc: string[];
  };
  personality_traits: {
    choose: number;
    from: string[];
  };
  ideals: {
    choose: number;
    from: Array<{
      desc: string;
      alignments: Array<{
        index: string;
        name: string;
        url: string;
      }>;
    }>;
  };
  bonds: {
    choose: number;
    from: string[];
  };
  flaws: {
    choose: number;
    from: string[];
  };
  url: string;
}

interface DndApiSpell {
  index: string;
  name: string;
  desc: string[];
  higher_level?: string[];
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  attack_type?: string;
  damage?: {
    damage_type: {
      index: string;
      name: string;
      url: string;
    };
    damage_at_slot_level?: Record<string, string>;
    damage_at_character_level?: Record<string, string>;
  };
  school: {
    index: string;
    name: string;
    url: string;
  };
  classes: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  subclasses: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  url: string;
}

interface DndApiResponse<T> {
  count: number;
  results: T[];
}

// ===========================
// CLASSE PRINCIPAL DA API D&D - EXPANDIDA
// ===========================

class DndAPI {
  private baseURL: string;

  constructor(baseURL: string = DND_API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Faz requisição HTTP genérica para a API do D&D
   */
  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Erro ao buscar ${endpoint}:`, error);
      throw new Error(`Falha ao carregar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Traduz nomes de atributos do inglês para português
   */
  private translateAbilityName(englishName: string): string {
    const translations: Record<string, string> = {
      "STR": "Força",
      "DEX": "Destreza", 
      "CON": "Constituição",
      "INT": "Inteligência",
      "WIS": "Sabedoria",
      "CHA": "Carisma",
      "Strength": "Força",
      "Dexterity": "Destreza",
      "Constitution": "Constituição", 
      "Intelligence": "Inteligência",
      "Wisdom": "Sabedoria",
      "Charisma": "Carisma"
    };
    
    return translations[englishName] || englishName;
  }

  /**
   * Traduz nomes de raças do inglês para português
   */
  private translateRaceName(englishName: string): string {
    const translations: Record<string, string> = {
      "Human": "Humano",
      "Elf": "Elfo", 
      "Dwarf": "Anão",
      "Halfling": "Halfling",
      "Dragonborn": "Draconato",
      "Gnome": "Gnomo",
      "Half-Elf": "Meio-Elfo",
      "Half-Orc": "Meio-Orc",
      "Tiefling": "Tiefling"
    };
    
    return translations[englishName] || englishName;
  }

  /**
   * Traduz nomes de sub-raças do inglês para português
   */
  private translateSubraceName(englishName: string): string {
    const translations: Record<string, string> = {
      "High Elf": "Alto Elfo",
      "Wood Elf": "Elfo da Floresta", 
      "Dark Elf (Drow)": "Elfo Negro (Drow)",
      "Hill Dwarf": "Anão da Colina",
      "Mountain Dwarf": "Anão da Montanha",
      "Lightfoot Halfling": "Halfling Pés Leves",
      "Stout Halfling": "Halfling Robusto",
      "Forest Gnome": "Gnomo da Floresta",
      "Rock Gnome": "Gnomo das Rochas"
    };
    
    return translations[englishName] || englishName;
  }

  /**
   * Traduz nomes de classes do inglês para português
   */
  private translateClassName(englishName: string): string {
    const translations: Record<string, string> = {
      "Barbarian": "Bárbaro",
      "Bard": "Bardo",
      "Cleric": "Clérico",
      "Druid": "Druida",
      "Fighter": "Guerreiro",
      "Monk": "Monge",
      "Paladin": "Paladino",
      "Ranger": "Patrulheiro",
      "Rogue": "Ladino",
      "Sorcerer": "Feiticeiro",
      "Warlock": "Bruxo",
      "Wizard": "Mago"
    };
    
    return translations[englishName] || englishName;
  }

  /**
   * Traduz nomes de subclasses do inglês para português
   */
  private translateSubclassName(englishName: string): string {
    const translations: Record<string, string> = {
      // Bárbaro
      "Path of the Berserker": "Caminho do Berserker",
      "Path of the Totem Warrior": "Caminho do Guerreiro Totêmico",
      
      // Bardo
      "College of Lore": "Colégio do Conhecimento",
      "College of Valor": "Colégio da Bravura",
      
      // Clérico
      "Life Domain": "Domínio da Vida",
      "Light Domain": "Domínio da Luz",
      "Nature Domain": "Domínio da Natureza",
      "Knowledge Domain": "Domínio do Conhecimento",
      "Trickery Domain": "Domínio da Trapaça",
      "War Domain": "Domínio da Guerra",
      "Tempest Domain": "Domínio da Tempestade",
      
      // Druida
      "Circle of the Land": "Círculo da Terra",
      "Circle of the Moon": "Círculo da Lua",
      
      // Guerreiro
      "Champion": "Campeão",
      "Battle Master": "Mestre de Batalha",
      "Eldritch Knight": "Cavaleiro Élfico",
      
      // Monge
      "Way of the Open Hand": "Caminho da Mão Aberta",
      "Way of Shadow": "Caminho da Sombra",
      "Way of the Four Elements": "Caminho dos Quatro Elementos",
      
      // Paladino
      "Oath of Devotion": "Juramento de Devoção",
      "Oath of the Ancients": "Juramento dos Antigos",
      "Oath of Vengeance": "Juramento de Vingança",
      
      // Patrulheiro
      "Hunter": "Caçador",
      "Beast Master": "Mestre das Feras",
      
      // Ladino
      "Thief": "Ladrão",
      "Assassin": "Assassino",
      "Arcane Trickster": "Trapaceiro Arcano",
      
      // Feiticeiro
      "Draconic Bloodline": "Linhagem Dracônica",
      "Wild Magic": "Magia Selvagem",
      
      // Bruxo
      "The Archfey": "O Arquifada",
      "The Fiend": "O Demônio",
      "The Great Old One": "O Grande Antigo",
      
      // Mago
      "School of Abjuration": "Escola de Abjuração",
      "School of Conjuration": "Escola de Conjuração",
      "School of Divination": "Escola de Adivinhação",
      "School of Enchantment": "Escola de Encantamento",
      "School of Evocation": "Escola de Evocação",
      "School of Illusion": "Escola de Ilusão",
      "School of Necromancy": "Escola de Necromancia",
      "School of Transmutation": "Escola de Transmutação"
    };
    
    return translations[englishName] || englishName;
  }

  /**
   * Traduz nomes de backgrounds do inglês para português
   */
  private translateBackgroundName(englishName: string): string {
    const translations: Record<string, string> = {
      "Acolyte": "Acólito",
      "Criminal": "Criminoso",
      "Folk Hero": "Herói do Povo",
      "Noble": "Nobre",
      "Sage": "Sábio",
      "Soldier": "Soldado",
      "Charlatan": "Charlatão",
      "Entertainer": "Artista",
      "Guild Artisan": "Artesão de Guilda",
      "Hermit": "Eremita",
      "Outlander": "Forasteiro",
      "Sailor": "Marinheiro",
      "Urchin": "Órfão"
    };
    
    return translations[englishName] || englishName;
  }

  /**
   * Traduz nomes de magias do inglês para português
   */
  private translateSpellName(englishName: string): string {
    const translations: Record<string, string> = {
      // Cantrips (Nível 0)
      "Acid Splash": "Borrifo Ácido",
      "Chill Touch": "Toque Gélido",
      "Dancing Lights": "Luzes Dançantes",
      "Fire Bolt": "Dardo Ígneo",
      "Light": "Luz",
      "Mage Hand": "Mão de Mago",
      "Minor Illusion": "Ilusão Menor",
      "Prestidigitation": "Prestidigitação",
      "Ray of Frost": "Raio Gélido",
      "Shocking Grasp": "Toque Chocante",
      
      // Nível 1
      "Magic Missile": "Míssil Mágico",
      "Shield": "Escudo",
      "Burning Hands": "Mãos Flamejantes",
      "Cure Wounds": "Curar Ferimentos",
      "Healing Word": "Palavra de Cura",
      "Sleep": "Sono",
      "Charm Person": "Enfeitiçar Pessoa",
      "Thunderwave": "Onda Trovejante",
      
      // Nível 2
      "Fireball": "Bola de Fogo",
      "Lightning Bolt": "Relâmpago",
      "Misty Step": "Passo Sombrio",
      "Scorching Ray": "Raio Ardente",
      "Web": "Teia",
      
      // Nível 3+
      "Counterspell": "Contra-feitiço",
      "Dispel Magic": "Dissipar Magia",
      "Fly": "Voar",
      "Haste": "Velocidade",
      "Slow": "Lentidão",
      "Teleport": "Teletransporte",
      "Wish": "Desejo"
    };
    
    return translations[englishName] || englishName;
  }

  /**
   * Traduz escolas de magia do inglês para português
   */
  private translateSchoolName(englishName: string): string {
    const translations: Record<string, string> = {
      "Abjuration": "Abjuração",
      "Conjuration": "Conjuração",
      "Divination": "Adivinhação",
      "Enchantment": "Encantamento",
      "Evocation": "Evocação",
      "Illusion": "Ilusão",
      "Necromancy": "Necromancia",
      "Transmutation": "Transmutação"
    };
    
    return translations[englishName] || englishName;
  }

  /**
   * Converte dados da API de raça para o formato da aplicação
   */
  private convertRaceData(apiRace: DndApiRace): DndRace {
    return {
      index: apiRace.index,
      name: this.translateRaceName(apiRace.name),
      speed: apiRace.speed,
      ability_bonuses: apiRace.ability_bonuses.map(bonus => ({
        ability_score: {
          index: bonus.ability_score.index,
          name: this.translateAbilityName(bonus.ability_score.name),
          url: bonus.ability_score.url
        },
        bonus: bonus.bonus
      })),
      alignment: apiRace.alignment,
      age: apiRace.age,
      size: apiRace.size,
      size_description: apiRace.size_description,
      starting_proficiencies: apiRace.starting_proficiencies,
      languages: apiRace.languages,
      language_desc: apiRace.language_desc,
      traits: apiRace.traits,
      subraces: apiRace.subraces,
      url: apiRace.url
    };
  }

  /**
   * Converte dados de sub-raça da API para o formato da aplicação
   */
  private convertSubraceData(apiSubrace: DndApiSubrace): DndSubrace {
    return {
      index: apiSubrace.index,
      name: this.translateSubraceName(apiSubrace.name),
      race: {
        index: apiSubrace.race.index,
        name: this.translateRaceName(apiSubrace.race.name),
        url: apiSubrace.race.url
      },
      desc: apiSubrace.desc,
      ability_bonuses: apiSubrace.ability_bonuses.map(bonus => ({
        ability_score: {
          index: bonus.ability_score.index,
          name: this.translateAbilityName(bonus.ability_score.name),
          url: bonus.ability_score.url
        },
        bonus: bonus.bonus
      })),
      starting_proficiencies: apiSubrace.starting_proficiencies,
      languages: apiSubrace.languages,
      racial_traits: apiSubrace.racial_traits,
      url: apiSubrace.url
    };
  }

  /**
   * Converte dados de classe da API para o formato da aplicação
   */
  private convertClassData(apiClass: DndApiClass): DndClass {
    return {
      index: apiClass.index,
      name: this.translateClassName(apiClass.name),
      hit_die: apiClass.hit_die,
      proficiencies: apiClass.proficiencies,
      proficiency_choices: apiClass.proficiency_choices,
      saving_throws: apiClass.saving_throws.map(save => ({
        index: save.index,
        name: this.translateAbilityName(save.name),
        url: save.url
      })),
      starting_equipment: apiClass.starting_equipment,
      class_levels: apiClass.class_levels,
      multi_classing: apiClass.multi_classing,
      subclasses: apiClass.subclasses,
      spellcasting: apiClass.spellcasting ? {
        level: apiClass.spellcasting.level,
        spellcasting_ability: {
          index: apiClass.spellcasting.spellcasting_ability.index,
          name: this.translateAbilityName(apiClass.spellcasting.spellcasting_ability.name),
          url: apiClass.spellcasting.spellcasting_ability.url
        },
        info: apiClass.spellcasting.info
      } : undefined,
      url: apiClass.url
    };
  }

  /**
   * Converte dados de subclasse da API para o formato da aplicação
   */
  private convertSubclassData(apiSubclass: DndApiSubclass): DndSubclass {
    return {
      index: apiSubclass.index,
      name: this.translateSubclassName(apiSubclass.name),
      class: {
        index: apiSubclass.class.index,
        name: this.translateClassName(apiSubclass.class.name),
        url: apiSubclass.class.url
      },
      subclass_flavor: apiSubclass.subclass_flavor,
      desc: apiSubclass.desc,
      subclass_levels: apiSubclass.subclass_levels,
      spells: apiSubclass.spells,
      url: apiSubclass.url
    };
  }

  /**
   * Converte dados de background da API para o formato da aplicação
   */
  private convertBackgroundData(apiBackground: DndApiBackground): DndBackground {
    return {
      index: apiBackground.index,
      name: this.translateBackgroundName(apiBackground.name),
      starting_proficiencies: apiBackground.starting_proficiencies,
      languages: apiBackground.languages,
      starting_equipment: apiBackground.starting_equipment,
      feature: apiBackground.feature,
      personality_traits: apiBackground.personality_traits,
      ideals: apiBackground.ideals,
      bonds: apiBackground.bonds,
      flaws: apiBackground.flaws,
      url: apiBackground.url
    };
  }

  /**
   * Converte dados de magia da API para o formato da aplicação
   */
  private convertSpellData(apiSpell: DndApiSpell): DndSpell {
    return {
      index: apiSpell.index,
      name: this.translateSpellName(apiSpell.name),
      desc: apiSpell.desc,
      higher_level: apiSpell.higher_level,
      range: apiSpell.range,
      components: apiSpell.components,
      material: apiSpell.material,
      ritual: apiSpell.ritual,
      duration: apiSpell.duration,
      concentration: apiSpell.concentration,
      casting_time: apiSpell.casting_time,
      level: apiSpell.level,
      attack_type: apiSpell.attack_type,
      damage: apiSpell.damage,
      school: {
        index: apiSpell.school.index,
        name: this.translateSchoolName(apiSpell.school.name),
        url: apiSpell.school.url
      },
      classes: apiSpell.classes.map(cls => ({
        index: cls.index,
        name: this.translateClassName(cls.name),
        url: cls.url
      })),
      subclasses: apiSpell.subclasses,
      url: apiSpell.url
    };
  }

  // ===========================
  // MÉTODOS PÚBLICOS - RAÇAS
  // ===========================

  /**
   * Busca todas as raças disponíveis
   */
  async getRaces(): Promise<DndRace[]> {
    try {
      const racesList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/races");
      const racesPromises = racesList.results.map(race => 
        this.request<DndApiRace>(`/races/${race.index}`)
      );
      const racesData = await Promise.all(racesPromises);
      return racesData.map(race => this.convertRaceData(race));
    } catch (error) {
      console.error("Erro ao buscar raças:", error);
      throw error;
    }
  }

  /**
   * Busca uma raça específica por index
   */
  async getRace(raceIndex: string): Promise<DndRace> {
    try {
      const raceData = await this.request<DndApiRace>(`/races/${raceIndex}`);
      return this.convertRaceData(raceData);
    } catch (error) {
      console.error(`Erro ao buscar raça ${raceIndex}:`, error);
      throw error;
    }
  }

  /**
   * Busca todas as sub-raças disponíveis
   */
  async getSubraces(): Promise<DndSubrace[]> {
    try {
      const subracesList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/subraces");
      const subracesPromises = subracesList.results.map(subrace => 
        this.request<DndApiSubrace>(`/subraces/${subrace.index}`)
      );
      const subracesData = await Promise.all(subracesPromises);
      return subracesData.map(subrace => this.convertSubraceData(subrace));
    } catch (error) {
      console.error("Erro ao buscar sub-raças:", error);
      throw error;
    }
  }

  /**
   * Busca sub-raças de uma raça específica
   */
  async getSubracesByRace(raceIndex: string): Promise<DndSubrace[]> {
    try {
      const allSubraces = await this.getSubraces();
      return allSubraces.filter(subrace => subrace.race.index === raceIndex);
    } catch (error) {
      console.error(`Erro ao buscar sub-raças da raça ${raceIndex}:`, error);
      throw error;
    }
  }

  // ===========================
  // MÉTODOS PÚBLICOS - CLASSES (NOVO)
  // ===========================

  /**
   * Busca todas as classes disponíveis
   */
  async getClasses(): Promise<DndClass[]> {
    try {
      const classesList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/classes");
      const classesPromises = classesList.results.map(cls => 
        this.request<DndApiClass>(`/classes/${cls.index}`)
      );
      const classesData = await Promise.all(classesPromises);
      return classesData.map(cls => this.convertClassData(cls));
    } catch (error) {
      console.error("Erro ao buscar classes:", error);
      throw error;
    }
  }

  /**
   * Busca uma classe específica por index
   */
  async getClass(classIndex: string): Promise<DndClass> {
    try {
      const classData = await this.request<DndApiClass>(`/classes/${classIndex}`);
      return this.convertClassData(classData);
    } catch (error) {
      console.error(`Erro ao buscar classe ${classIndex}:`, error);
      throw error;
    }
  }

  /**
   * Busca todas as subclasses disponíveis
   */
  async getSubclasses(): Promise<DndSubclass[]> {
    try {
      const subclassesList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/subclasses");
      const subclassesPromises = subclassesList.results.map(subcls => 
        this.request<DndApiSubclass>(`/subclasses/${subcls.index}`)
      );
      const subclassesData = await Promise.all(subclassesPromises);
      return subclassesData.map(subcls => this.convertSubclassData(subcls));
    } catch (error) {
      console.error("Erro ao buscar subclasses:", error);
      throw error;
    }
  }

  /**
   * Busca subclasses de uma classe específica
   */
  async getSubclassesByClass(classIndex: string): Promise<DndSubclass[]> {
    try {
      const allSubclasses = await this.getSubclasses();
      return allSubclasses.filter(subclass => subclass.class.index === classIndex);
    } catch (error) {
      console.error(`Erro ao buscar subclasses da classe ${classIndex}:`, error);
      throw error;
    }
  }

  // ===========================
  // MÉTODOS PÚBLICOS - BACKGROUNDS (NOVO)
  // ===========================

  /**
   * Busca todos os backgrounds disponíveis
   */
  async getBackgrounds(): Promise<DndBackground[]> {
    try {
      const backgroundsList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/backgrounds");
      const backgroundsPromises = backgroundsList.results.map(bg => 
        this.request<DndApiBackground>(`/backgrounds/${bg.index}`)
      );
      const backgroundsData = await Promise.all(backgroundsPromises);
      return backgroundsData.map(bg => this.convertBackgroundData(bg));
    } catch (error) {
      console.error("Erro ao buscar backgrounds:", error);
      throw error;
    }
  }

  /**
   * Busca um background específico por index
   */
  async getBackground(backgroundIndex: string): Promise<DndBackground> {
    try {
      const backgroundData = await this.request<DndApiBackground>(`/backgrounds/${backgroundIndex}`);
      return this.convertBackgroundData(backgroundData);
    } catch (error) {
      console.error(`Erro ao buscar background ${backgroundIndex}:`, error);
      throw error;
    }
  }

  // ===========================
  // MÉTODOS PÚBLICOS - MAGIAS (NOVO)
  // ===========================

  /**
   * Busca todas as magias disponíveis
   */
  async getSpells(): Promise<DndSpell[]> {
    try {
      const spellsList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/spells");
      
      // Para performance, vamos buscar em lotes de 50 magias
      const batchSize = 50;
      const spells: DndSpell[] = [];
      
      for (let i = 0; i < spellsList.results.length; i += batchSize) {
        const batch = spellsList.results.slice(i, i + batchSize);
        const spellsPromises = batch.map(spell => 
          this.request<DndApiSpell>(`/spells/${spell.index}`)
        );
        const spellsData = await Promise.all(spellsPromises);
        spells.push(...spellsData.map(spell => this.convertSpellData(spell)));
        
        // Log de progresso
        console.log(`📚 Carregadas ${Math.min(i + batchSize, spellsList.results.length)} de ${spellsList.results.length} magias`);
      }
      
      return spells;
    } catch (error) {
      console.error("Erro ao buscar magias:", error);
      throw error;
    }
  }

  /**
   * Busca uma magia específica por index
   */
  async getSpell(spellIndex: string): Promise<DndSpell> {
    try {
      const spellData = await this.request<DndApiSpell>(`/spells/${spellIndex}`);
      return this.convertSpellData(spellData);
    } catch (error) {
      console.error(`Erro ao buscar magia ${spellIndex}:`, error);
      throw error;
    }
  }

  /**
   * Busca magias de uma classe específica
   */
  async getSpellsByClass(classIndex: string): Promise<DndSpell[]> {
    try {
      const classData = await this.request<DndApiClass>(`/classes/${classIndex}`);
      if (!classData.spellcasting) {
        return []; // Classe não conjuradora
      }
      
      const classSpells = await this.request<DndApiResponse<{index: string, name: string, url: string}>>(`/classes/${classIndex}/spells`);
      const spellsPromises = classSpells.results.map(spell => 
        this.request<DndApiSpell>(`/spells/${spell.index}`)
      );
      const spellsData = await Promise.all(spellsPromises);
      
      return spellsData.map(spell => this.convertSpellData(spell));
    } catch (error) {
      console.error(`Erro ao buscar magias da classe ${classIndex}:`, error);
      throw error;
    }
  }

  /**
   * Busca magias por nível
   */
  async getSpellsByLevel(level: number): Promise<DndSpell[]> {
    try {
      const spellsList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>(`/spells?level=${level}`);
      const spellsPromises = spellsList.results.map(spell => 
        this.request<DndApiSpell>(`/spells/${spell.index}`)
      );
      const spellsData = await Promise.all(spellsPromises);
      
      return spellsData
        .filter(spell => spell.level === level)
        .map(spell => this.convertSpellData(spell));
    } catch (error) {
      console.error(`Erro ao buscar magias de nível ${level}:`, error);
      throw error;
    }
  }

  /**
   * Testa a conectividade com a API
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.request("/");
      return true;
    } catch (error) {
      console.error("API D&D não está acessível:", error);
      return false;
    }
  }
}

// ===========================
// INSTÂNCIA SINGLETON
// ===========================

export const dndAPI = new DndAPI();

export default dndAPI;