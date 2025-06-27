// ===========================
// D&D API SERVICE - VERSÃO MELHORADA COM RATE LIMITING E RETRY
// src/api/dndAPI.ts
// ===========================

import { DndRace, DndSubrace, DndClass, DndSubclass, DndBackground, DndSpell } from "@/types/characterCreation";

// ===========================
// CONFIGURAÇÃO DA API
// ===========================

const DND_API_BASE_URL = "https://www.dnd5eapi.co/api";

// Configurações de rate limiting
const RATE_LIMIT = {
  maxConcurrent: 3, // Máximo de 3 requisições simultâneas
  delayBetweenRequests: 250, // 250ms entre requisições
  retryDelayBase: 1000, // Delay base para retry (1 segundo)
  maxRetries: 3, // Máximo de tentativas
};

// ===========================
// TIPOS DA API D&D
// ===========================

interface DndApiResponse<T> {
  count: number;
  results: T[];
}

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

// ===========================
// RATE LIMITING UTILITY
// ===========================

class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private running: number = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = RATE_LIMIT.maxConcurrent) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const fn = this.queue.shift()!;

    try {
      await fn();
    } finally {
      this.running--;
      // Delay between requests
      if (this.queue.length > 0) {
        setTimeout(() => this.process(), RATE_LIMIT.delayBetweenRequests);
      }
    }
  }
}

// ===========================
// RETRY UTILITY COM EXPONENTIAL BACKOFF
// ===========================

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = RATE_LIMIT.maxRetries,
  baseDelay: number = RATE_LIMIT.retryDelayBase
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Se não é um erro 429, não retry
      if (!error.message.includes("429")) {
        throw error;
      }

      // Se é a última tentativa, lança o erro
      if (attempt === maxRetries) {
        break;
      }

      // Calcula delay exponencial: baseDelay * 2^attempt + jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      
      console.warn(`Rate limited (429), retrying in ${Math.round(delay)}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// ===========================
// CLASSE PRINCIPAL DA API D&D - MELHORADA
// ===========================

class DndAPI {
  private baseURL: string;
  private rateLimiter: RateLimiter;

  constructor(baseURL: string = DND_API_BASE_URL) {
    this.baseURL = baseURL;
    this.rateLimiter = new RateLimiter();
  }

  /**
   * Faz requisição HTTP genérica com retry e rate limiting
   */
  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const makeRequest = async (): Promise<T> => {
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
    };

    // Aplicar rate limiting e retry
    return this.rateLimiter.add(() => retryWithBackoff(makeRequest));
  }

  // ===========================
  // MÉTODOS DE CONVERSÃO (mantidos iguais)
  // ===========================

  private translateRaceName(name: string): string {
    const translations: Record<string, string> = {
      "Dragonborn": "Draconato",
      "Dwarf": "Anão",
      "Elf": "Elfo",
      "Gnome": "Gnomo",
      "Half-Elf": "Meio-Elfo",
      "Half-Orc": "Meio-Orc",
      "Halfling": "Halfling",
      "Human": "Humano",
      "Tiefling": "Tiefling",
    };
    return translations[name] || name;
  }

  private translateClassName(name: string): string {
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
      "Wizard": "Mago",
    };
    return translations[name] || name;
  }

  private translateSchoolName(name: string): string {
    const translations: Record<string, string> = {
      "Abjuration": "Abjuração",
      "Conjuration": "Conjuração",
      "Divination": "Adivinhação",
      "Enchantment": "Encantamento",
      "Evocation": "Evocação",
      "Illusion": "Ilusão",
      "Necromancy": "Necromancia",
      "Transmutation": "Transmutação",
    };
    return translations[name] || name;
  }

  private convertRaceData(apiRace: DndApiRace): DndRace {
    return {
      index: apiRace.index,
      name: this.translateRaceName(apiRace.name),
      speed: apiRace.speed,
      ability_bonuses: apiRace.ability_bonuses,
      alignment: apiRace.alignment,
      age: apiRace.age,
      size: apiRace.size,
      size_description: apiRace.size_description,
      starting_proficiencies: apiRace.starting_proficiencies,
      languages: apiRace.languages,
      language_desc: apiRace.language_desc,
      traits: apiRace.traits,
      subraces: apiRace.subraces,
      url: apiRace.url,
    };
  }

  private convertSubraceData(apiSubrace: DndApiSubrace): DndSubrace {
    return {
      index: apiSubrace.index,
      name: apiSubrace.name,
      race: apiSubrace.race,
      desc: apiSubrace.desc,
      ability_bonuses: apiSubrace.ability_bonuses,
      starting_proficiencies: apiSubrace.starting_proficiencies,
      languages: apiSubrace.languages,
      racial_traits: apiSubrace.racial_traits,
      url: apiSubrace.url,
    };
  }

  private convertClassData(apiClass: DndApiClass): DndClass {
    return {
      index: apiClass.index,
      name: this.translateClassName(apiClass.name),
      hit_die: apiClass.hit_die,
      proficiencies: apiClass.proficiencies,
      proficiency_choices: apiClass.proficiency_choices,
      saving_throws: apiClass.saving_throws,
      starting_equipment: apiClass.starting_equipment,
      class_levels: apiClass.class_levels,
      multi_classing: apiClass.multi_classing,
      subclasses: apiClass.subclasses,
      spellcasting: apiClass.spellcasting,
      url: apiClass.url,
    };
  }

  private convertSubclassData(apiSubclass: DndApiSubclass): DndSubclass {
    return {
      index: apiSubclass.index,
      name: apiSubclass.name,
      class: {
        index: apiSubclass.class.index,
        name: this.translateClassName(apiSubclass.class.name),
        url: apiSubclass.class.url,
      },
      subclass_flavor: apiSubclass.subclass_flavor,
      desc: apiSubclass.desc,
      subclass_levels: apiSubclass.subclass_levels,
      spells: apiSubclass.spells,
      url: apiSubclass.url,
    };
  }

  private convertSpellData(apiSpell: DndApiSpell): DndSpell {
    return {
      index: apiSpell.index,
      name: apiSpell.name,
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
        url: apiSpell.school.url,
      },
      classes: apiSpell.classes.map(cls => ({
        index: cls.index,
        name: this.translateClassName(cls.name),
        url: cls.url,
      })),
      subclasses: apiSpell.subclasses,
      url: apiSpell.url,
    };
  }

  // ===========================
  // MÉTODOS PÚBLICOS - RAÇAS
  // ===========================

  async getRaces(): Promise<DndRace[]> {
    try {
      const racesList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/races");
      
      // Usar rate limiter para as requisições individuais
      const racesData: DndApiRace[] = [];
      for (const race of racesList.results) {
        const raceData = await this.request<DndApiRace>(`/races/${race.index}`);
        racesData.push(raceData);
      }
      
      return racesData.map(race => this.convertRaceData(race));
    } catch (error) {
      console.error("Erro ao buscar raças:", error);
      throw error;
    }
  }

  async getRace(raceIndex: string): Promise<DndRace> {
    try {
      const raceData = await this.request<DndApiRace>(`/races/${raceIndex}`);
      return this.convertRaceData(raceData);
    } catch (error) {
      console.error(`Erro ao buscar raça ${raceIndex}:`, error);
      throw error;
    }
  }

  async getSubraces(): Promise<DndSubrace[]> {
    try {
      const subracesList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/subraces");
      
      // Usar rate limiter para as requisições individuais
      const subracesData: DndApiSubrace[] = [];
      for (const subrace of subracesList.results) {
        const subraceData = await this.request<DndApiSubrace>(`/subraces/${subrace.index}`);
        subracesData.push(subraceData);
      }
      
      return subracesData.map(subrace => this.convertSubraceData(subrace));
    } catch (error) {
      console.error("Erro ao buscar sub-raças:", error);
      throw error;
    }
  }

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
  // MÉTODOS PÚBLICOS - CLASSES
  // ===========================

  async getClasses(): Promise<DndClass[]> {
    try {
      const classesList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/classes");
      
      // Usar rate limiter para as requisições individuais
      const classesData: DndApiClass[] = [];
      for (const cls of classesList.results) {
        const classData = await this.request<DndApiClass>(`/classes/${cls.index}`);
        classesData.push(classData);
      }
      
      return classesData.map(cls => this.convertClassData(cls));
    } catch (error) {
      console.error("Erro ao buscar classes:", error);
      throw error;
    }
  }

  async getClass(classIndex: string): Promise<DndClass> {
    try {
      const classData = await this.request<DndApiClass>(`/classes/${classIndex}`);
      return this.convertClassData(classData);
    } catch (error) {
      console.error(`Erro ao buscar classe ${classIndex}:`, error);
      throw error;
    }
  }

  async getSubclasses(): Promise<DndSubclass[]> {
    try {
      const subclassesList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/subclasses");
      
      // Usar rate limiter para as requisições individuais
      const subclassesData: DndApiSubclass[] = [];
      for (const subcls of subclassesList.results) {
        const subclassData = await this.request<DndApiSubclass>(`/subclasses/${subcls.index}`);
        subclassesData.push(subclassData);
      }
      
      return subclassesData.map(subcls => this.convertSubclassData(subcls));
    } catch (error) {
      console.error("Erro ao buscar subclasses:", error);
      throw error;
    }
  }

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
  // MÉTODOS PÚBLICOS - BACKGROUNDS
  // ===========================

  async getBackgrounds(): Promise<DndBackground[]> {
    try {
      const backgroundsList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/backgrounds");
      
      // Usar rate limiter para as requisições individuais
      const backgroundsData: DndApiBackground[] = [];
      for (const bg of backgroundsList.results) {
        const backgroundData = await this.request<DndApiBackground>(`/backgrounds/${bg.index}`);
        backgroundsData.push(backgroundData);
      }
      
      return backgroundsData.map(bg => ({
        index: bg.index,
        name: bg.name,
        starting_proficiencies: bg.starting_proficiencies,
        languages: bg.languages,
        starting_equipment: bg.starting_equipment,
        feature: bg.feature,
        personality_traits: bg.personality_traits,
        ideals: bg.ideals,
        bonds: bg.bonds,
        flaws: bg.flaws,
        url: bg.url,
      }));
    } catch (error) {
      console.error("Erro ao buscar backgrounds:", error);
      throw error;
    }
  }

  async getBackground(backgroundIndex: string): Promise<DndBackground> {
    try {
      const backgroundData = await this.request<DndApiBackground>(`/backgrounds/${backgroundIndex}`);
      return {
        index: backgroundData.index,
        name: backgroundData.name,
        starting_proficiencies: backgroundData.starting_proficiencies,
        languages: backgroundData.languages,
        starting_equipment: backgroundData.starting_equipment,
        feature: backgroundData.feature,
        personality_traits: backgroundData.personality_traits,
        ideals: backgroundData.ideals,
        bonds: backgroundData.bonds,
        flaws: backgroundData.flaws,
        url: backgroundData.url,
      };
    } catch (error) {
      console.error(`Erro ao buscar background ${backgroundIndex}:`, error);
      throw error;
    }
  }

  // ===========================
  // MÉTODOS PÚBLICOS - SPELLS (MELHORADO)
  // ===========================

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
   * Busca magias de uma classe específica - MÉTODO MELHORADO
   * Agora com rate limiting e processamento sequencial em lotes
   */
  async getSpellsByClass(classIndex: string): Promise<DndSpell[]> {
    try {
      const classData = await this.request<DndApiClass>(`/classes/${classIndex}`);
      if (!classData.spellcasting) {
        return []; // Classe não conjuradora
      }
      
      const classSpells = await this.request<DndApiResponse<{index: string, name: string, url: string}>>(`/classes/${classIndex}/spells`);
      
      console.log(`📚 Carregando ${classSpells.results.length} magias para ${classIndex}...`);
      
      // Processar magias em lotes sequenciais para evitar rate limiting
      const spellsData: DndApiSpell[] = [];
      const batchSize = 10; // Processar em lotes de 10
      
      for (let i = 0; i < classSpells.results.length; i += batchSize) {
        const batch = classSpells.results.slice(i, i + batchSize);
        console.log(`📖 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(classSpells.results.length/batchSize)}...`);
        
        // Processar cada spell do lote sequencialmente
        for (const spell of batch) {
          try {
            const spellData = await this.request<DndApiSpell>(`/spells/${spell.index}`);
            spellsData.push(spellData);
          } catch (error) {
            console.warn(`⚠️ Erro ao carregar magia ${spell.index}:`, error);
            // Continuar com as outras magias mesmo se uma falhar
          }
        }
      }
      
      console.log(`✅ ${spellsData.length} magias carregadas com sucesso para ${classIndex}`);
      return spellsData.map(spell => this.convertSpellData(spell));
      
    } catch (error) {
      console.error(`Erro ao buscar magias da classe ${classIndex}:`, error);
      throw error;
    }
  }

  /**
   * Busca magias por nível - MÉTODO MELHORADO
   */
  async getSpellsByLevel(level: number): Promise<DndSpell[]> {
    try {
      const spellsList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>(`/spells?level=${level}`);
      
      console.log(`📚 Carregando ${spellsList.results.length} magias de nível ${level}...`);
      
      // Processar magias sequencialmente
      const spellsData: DndApiSpell[] = [];
      for (const spell of spellsList.results) {
        try {
          const spellData = await this.request<DndApiSpell>(`/spells/${spell.index}`);
          if (spellData.level === level) {
            spellsData.push(spellData);
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao carregar magia ${spell.index}:`, error);
        }
      }
      
      console.log(`✅ ${spellsData.length} magias de nível ${level} carregadas com sucesso`);
      return spellsData.map(spell => this.convertSpellData(spell));
      
    } catch (error) {
      console.error(`Erro ao buscar magias de nível ${level}:`, error);
      throw error;
    }
  }

  /**
   * Busca todas as magias - MÉTODO MELHORADO
   * Implementa paginação interna para evitar sobrecarregar a API
   */
  async getAllSpells(): Promise<DndSpell[]> {
    try {
      const spellsList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/spells");
      
      console.log(`📚 Carregando ${spellsList.results.length} magias...`);
      
      // Processar magias em lotes sequenciais
      const spellsData: DndApiSpell[] = [];
      const batchSize = 20; // Lotes maiores para todas as magias
      
      for (let i = 0; i < spellsList.results.length; i += batchSize) {
        const batch = spellsList.results.slice(i, i + batchSize);
        console.log(`📖 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(spellsList.results.length/batchSize)}...`);
        
        // Processar cada spell do lote
        for (const spell of batch) {
          try {
            const spellData = await this.request<DndApiSpell>(`/spells/${spell.index}`);
            spellsData.push(spellData);
          } catch (error) {
            console.warn(`⚠️ Erro ao carregar magia ${spell.index}:`, error);
          }
        }
        
        // Pequena pausa entre lotes para ser gentil com a API
        if (i + batchSize < spellsList.results.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log(`✅ ${spellsData.length} magias carregadas com sucesso`);
      return spellsData.map(spell => this.convertSpellData(spell));
      
    } catch (error) {
      console.error("Erro ao buscar todas as magias:", error);
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