// ===========================
// D&D API SERVICE - VERSÃO COMPLETA COM DADOS MOCK INTEGRADOS
// src/api/dndAPI.ts
// ===========================

import { DndRace, DndSubrace, DndClass, DndSubclass, DndBackground, DndSpell } from "@/types/characterCreation";

// 🎯 IMPORTAÇÕES DOS DADOS MOCK EXISTENTES
import { mockSubraces } from "@/data/mockSubRaces";
import { mockSubclasses } from "@/data/mockSubClasses";
import { mockBackgrounds } from "@/data/mockBackgrounds";

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

// 🎯 CONFIGURAÇÕES DOS DADOS MOCK
const USE_MOCK_DATA = true; // Controla se deve usar dados dos arquivos mock
const DEBUG_API = true; // 🎯 ATIVADO PARA DEBUG - Mude para false depois

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
  language_options?: {
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
  };
  starting_equipment: Array<{
    equipment: {
      index: string;
      name: string;
      url: string;
    };
    quantity: number;
  }>;
  starting_equipment_options?: Array<{
    desc: string;
    choose: number;
    type: string;
    from: {
      option_set_type: string;
      options: Array<{
        option_type: string;
        equipment: {
          index: string;
          name: string;
          url: string;
        };
        quantity?: number;
      }>;
    };
  }>;
  feature: {
    name: string;
    desc: string[];
  };
  personality_traits: {
    choose: number;
    from: {
      options: Array<{
        option_type: string;
        string: string;
      }>;
    };
  };
  ideals: {
    choose: number;
    from: {
      options: Array<{
        option_type: string;
        desc?: string;
        alignments?: Array<{
          index: string;
          name: string;
          url: string;
        }>;
      }>;
    };
  };
  bonds: {
    choose: number;
    from: {
      options: Array<{
        option_type: string;
        string: string;
      }>;
    };
  };
  flaws: {
    choose: number;
    from: {
      options: Array<{
        option_type: string;
        string: string;
      }>;
    };
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
// UTILITÁRIOS DE RATE LIMITING E RETRY
// ===========================

class RateLimiter {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private activeRequests = 0;

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
    if (this.processing || this.activeRequests >= RATE_LIMIT.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < RATE_LIMIT.maxConcurrent) {
      const fn = this.queue.shift();
      if (fn) {
        this.activeRequests++;
        fn().finally(() => {
          this.activeRequests--;
          this.process();
        });
        
        // Delay entre requisições
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.delayBetweenRequests));
        }
      }
    }

    this.processing = false;
  }
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = RATE_LIMIT.maxRetries): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      const delay = RATE_LIMIT.retryDelayBase * (RATE_LIMIT.maxRetries - retries + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
}

// ===========================
// 🎯 FUNÇÕES HELPER PARA DADOS MOCK
// ===========================

/**
 * Mescla subraças da API com dados dos arquivos mock
 */
function mergeSubraces(apiSubraces: DndSubrace[], raceIndex: string): DndSubrace[] {
  if (!USE_MOCK_DATA) return apiSubraces;

  // Buscar subraças desta raça nos dados mock
  const mockSubracesForRace = mockSubraces.filter(
    subrace => subrace.race.index === raceIndex
  );

  // Encontrar subraças que estão nos mocks mas não vieram da API
  const apiIndices = apiSubraces.map(subrace => subrace.index);
  const missingSubraces = mockSubracesForRace.filter(
    subrace => !apiIndices.includes(subrace.index)
  );

  if (DEBUG_API) {
    console.log(`🔧 ===== PROCESSO DE MERGE - SUBRAÇAS ${raceIndex.toUpperCase()} =====`);
    console.log("📥 DADOS RECEBIDOS DA API:");
    if (apiSubraces.length > 0) {
      apiSubraces.forEach((subrace, index) => {
        console.log(`   ${index + 1}. 🌐 ${subrace.name} (${subrace.index})`);
      });
    } else {
      console.log("   (Nenhuma subraça da API)");
    }
    
    console.log("📋 DADOS LOCAIS DISPONÍVEIS:");
    if (mockSubracesForRace.length > 0) {
      mockSubracesForRace.forEach((subrace, index) => {
        console.log(`   ${index + 1}. 📋 ${subrace.name} (${subrace.index})`);
      });
    } else {
      console.log("   (Nenhuma subraça local)");
    }
    
    console.log("➕ ADICIONANDO DOS DADOS LOCAIS:");
    if (missingSubraces.length > 0) {
      missingSubraces.forEach((subrace, index) => {
        console.log(`   ${index + 1}. ✅ ${subrace.name} (${subrace.index})`);
      });
    } else {
      console.log("   (Nenhuma subraça adicionada)");
    }
    
    console.log(`🎯 RESULTADO FINAL: ${apiSubraces.length + missingSubraces.length} subraças total`);
    console.log("===============================================");
  }

  return [...apiSubraces, ...missingSubraces];
}

/**
 * Mescla subclasses da API com dados dos arquivos mock
 */
function mergeSubclasses(apiSubclasses: DndSubclass[], classIndex: string): DndSubclass[] {
  if (!USE_MOCK_DATA) return apiSubclasses;

  // Buscar subclasses desta classe nos dados mock
  const mockSubclassesForClass = mockSubclasses.filter(
    subclass => subclass.class.index === classIndex
  );

  // Encontrar subclasses que estão nos mocks mas não vieram da API
  const apiIndices = apiSubclasses.map(subclass => subclass.index);
  const missingSubclasses = mockSubclassesForClass.filter(
    subclass => !apiIndices.includes(subclass.index)
  );

  if (DEBUG_API) {
    console.log(`🔧 ===== PROCESSO DE MERGE - SUBCLASSES ${classIndex.toUpperCase()} =====`);
    console.log("📥 DADOS RECEBIDOS DA API:");
    if (apiSubclasses.length > 0) {
      apiSubclasses.forEach((subclass, index) => {
        console.log(`   ${index + 1}. 🌐 ${subclass.name} (${subclass.index})`);
      });
    } else {
      console.log("   (Nenhuma subclasse da API)");
    }
    
    console.log("📋 DADOS LOCAIS DISPONÍVEIS:");
    if (mockSubclassesForClass.length > 0) {
      mockSubclassesForClass.forEach((subclass, index) => {
        console.log(`   ${index + 1}. 📋 ${subclass.name} (${subclass.index})`);
      });
    } else {
      console.log("   (Nenhuma subclasse local)");
    }
    
    console.log("➕ ADICIONANDO DOS DADOS LOCAIS:");
    if (missingSubclasses.length > 0) {
      missingSubclasses.forEach((subclass, index) => {
        console.log(`   ${index + 1}. ✅ ${subclass.name} (${subclass.index})`);
      });
    } else {
      console.log("   (Nenhuma subclasse adicionada)");
    }
    
    console.log(`🎯 RESULTADO FINAL: ${apiSubclasses.length + missingSubclasses.length} subclasses total`);
    console.log("===============================================");
  }

  return [...apiSubclasses, ...missingSubclasses];
}

/**
 * 🎯 NOVA FUNÇÃO: Mescla backgrounds da API com dados dos arquivos mock
 */
function mergeBackgrounds(apiBackgrounds: DndBackground[]): DndBackground[] {
  if (!USE_MOCK_DATA) return apiBackgrounds;

  // Encontrar backgrounds que estão nos mocks mas não vieram da API
  const apiIndices = apiBackgrounds.map(background => background.index);
  const missingBackgrounds = mockBackgrounds.filter(
    background => !apiIndices.includes(background.index)
  );

  if (DEBUG_API) {
    console.log(`🔧 ===== PROCESSO DE MERGE - BACKGROUNDS =====`);
    console.log("📥 DADOS RECEBIDOS DA API:");
    if (apiBackgrounds.length > 0) {
      apiBackgrounds.forEach((background, index) => {
        console.log(`   ${index + 1}. 🌐 ${background.name} (${background.index})`);
      });
    } else {
      console.log("   (Nenhum background da API)");
    }
    
    console.log("📋 DADOS LOCAIS DISPONÍVEIS:");
    if (mockBackgrounds.length > 0) {
      mockBackgrounds.forEach((background, index) => {
        console.log(`   ${index + 1}. 📋 ${background.name} (${background.index})`);
      });
    } else {
      console.log("   (Nenhum background local)");
    }
    
    console.log("➕ ADICIONANDO DOS DADOS LOCAIS:");
    if (missingBackgrounds.length > 0) {
      missingBackgrounds.forEach((background, index) => {
        console.log(`   ${index + 1}. ✅ ${background.name} (${background.index})`);
      });
    } else {
      console.log("   (Nenhum background adicionado)");
    }
    
    console.log(`🎯 RESULTADO FINAL: ${apiBackgrounds.length + missingBackgrounds.length} backgrounds total`);
    console.log("===============================================");
  }

  return [...apiBackgrounds, ...missingBackgrounds];
}

/**
 * Busca uma subraça nos dados mock
 */
function findMockSubrace(subraceIndex: string): DndSubrace | undefined {
  return mockSubraces.find(subrace => subrace.index === subraceIndex);
}

/**
 * Busca uma subclasse nos dados mock
 */
function findMockSubclass(subclassIndex: string): DndSubclass | undefined {
  return mockSubclasses.find(subclass => subclass.index === subclassIndex);
}

/**
 * 🎯 NOVA FUNÇÃO: Busca um background nos dados mock
 */
function findMockBackground(backgroundIndex: string): DndBackground | undefined {
  return mockBackgrounds.find(background => background.index === backgroundIndex);
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
  // MÉTODOS DE CONVERSÃO
  // ===========================

  private translateRaceName(name: string): string {
    const translations: Record<string, string> = {
      "Dragonborn": "Draconato",
      "Dwarf": "Anão",
      "Elf": "Elfo",
      "Gnome": "Gnomo",
      "Half-Elf": "Meio-Elfo",
      "Halfling": "Halfling",
      "Half-Orc": "Meio-Orc",
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

  private translateBackgroundName(name: string): string {
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
    };
    return translations[name] || name;
  }

  private convertRaceData(data: DndApiRace): DndRace {
    return {
      index: data.index,
      name: this.translateRaceName(data.name),
      speed: data.speed,
      ability_bonuses: data.ability_bonuses,
      alignment: data.alignment,
      age: data.age,
      size: data.size,
      size_description: data.size_description,
      starting_proficiencies: data.starting_proficiencies,
      languages: data.languages,
      language_desc: data.language_desc,
      traits: data.traits,
      subraces: data.subraces,
      url: data.url,
    };
  }

  private convertSubraceData(data: DndApiSubrace): DndSubrace {
    return {
      index: data.index,
      name: data.name,
      race: data.race,
      desc: data.desc,
      ability_bonuses: data.ability_bonuses,
      starting_proficiencies: data.starting_proficiencies,
      languages: data.languages,
      racial_traits: data.racial_traits,
      url: data.url,
    };
  }

  private convertClassData(data: DndApiClass): DndClass {
    return {
      index: data.index,
      name: this.translateClassName(data.name),
      hit_die: data.hit_die,
      proficiencies: data.proficiencies,
      proficiency_choices: data.proficiency_choices,
      saving_throws: data.saving_throws,
      starting_equipment: data.starting_equipment,
      class_levels: data.class_levels,
      multi_classing: data.multi_classing,
      subclasses: data.subclasses,
      spellcasting: data.spellcasting,
      url: data.url,
    };
  }

  private convertSubclassData(data: DndApiSubclass): DndSubclass {
    return {
      index: data.index,
      name: data.name,
      class: data.class,
      subclass_flavor: data.subclass_flavor,
      desc: data.desc,
      subclass_levels: data.subclass_levels,
      spells: data.spells,
      url: data.url,
    };
  }

  private convertBackgroundData(data: DndApiBackground): DndBackground {
    return {
      index: data.index,
      name: this.translateBackgroundName(data.name),
      starting_proficiencies: data.starting_proficiencies,
      language_options: data.language_options,
      starting_equipment: data.starting_equipment,
      starting_equipment_options: data.starting_equipment_options,
      feature: data.feature,
      personality_traits: data.personality_traits,
      ideals: data.ideals,
      bonds: data.bonds,
      flaws: data.flaws,
      url: data.url,
    };
  }

  private convertSpellData(data: DndApiSpell): DndSpell {
    return {
      index: data.index,
      name: data.name,
      desc: data.desc,
      higher_level: data.higher_level,
      range: data.range,
      components: data.components,
      material: data.material,
      ritual: data.ritual,
      duration: data.duration,
      concentration: data.concentration,
      casting_time: data.casting_time,
      level: data.level,
      attack_type: data.attack_type,
      damage: data.damage,
      school: data.school,
      classes: data.classes,
      subclasses: data.subclasses,
      url: data.url,
    };
  }

  // ===========================
  // MÉTODOS PÚBLICOS - RAÇAS
  // ===========================

  async getRaces(): Promise<DndRace[]> {
    try {
      const racesList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/races");
      
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
      
      const subracesData: DndApiSubrace[] = [];
      for (const subrace of subracesList.results) {
        const subraceData = await this.request<DndApiSubrace>(`/subraces/${subrace.index}`);
        subracesData.push(subraceData);
      }
      
      return subracesData.map(subrace => this.convertSubraceData(subrace));
    } catch (error) {
      console.error("Erro ao buscar subraças:", error);
      throw error;
    }
  }

  // 🎯 MÉTODO MODIFICADO - SUBRAÇAS POR RAÇA COM DADOS MOCK
  async getRaceSubraces(raceIndex: string): Promise<DndSubrace[]> {
    try {
      const data = await this.request<{results: {index: string, name: string, url: string}[]}>(`/races/${raceIndex}/subraces`);
      
      const subracePromises = data.results.map(async (subraceRef) => {
        const subraceData = await this.request<DndApiSubrace>(`/subraces/${subraceRef.index}`);
        return this.convertSubraceData(subraceData);
      });
      
      const apiSubraces = await Promise.all(subracePromises);

      // 🎯 AQUI É A MUDANÇA PRINCIPAL: mesclar com dados mock
      const completeSubraces = mergeSubraces(apiSubraces, raceIndex);
      
      return completeSubraces;
    } catch (error) {
      console.error(`Erro ao buscar subraças da raça ${raceIndex}:`, error);
      throw error;
    }
  }

  // 🎯 MÉTODO MODIFICADO - BUSCAR SUBRAÇA INDIVIDUAL COM FALLBACK PARA MOCK
  async getSubrace(subraceIndex: string): Promise<DndSubrace> {
    try {
      // Tentar buscar na API primeiro
      const data = await this.request<DndApiSubrace>(`/subraces/${subraceIndex}`);
      if (DEBUG_API) {
        console.log(`🌐 Subraça '${subraceIndex}' encontrada na API oficial`);
      }
      return this.convertSubraceData(data);
    } catch (error) {
      // Se não encontrou na API, buscar nos dados mock
      if (USE_MOCK_DATA) {
        const mockSubrace = findMockSubrace(subraceIndex);
        if (mockSubrace) {
          if (DEBUG_API) {
            console.log(`📋 ===== SUBRAÇA ENCONTRADA NOS DADOS LOCAIS =====`);
            console.log(`🔍 Procurando: ${subraceIndex}`);
            console.log(`✅ Encontrada: ${mockSubrace.name}`);
            console.log("===============================================");
          }
          return mockSubrace;
        }
      }
      
      console.error(`❌ Subraça '${subraceIndex}' não encontrada nem na API nem nos dados locais`);
      throw error;
    }
  }

  // 🎯 MÉTODO LEGADO PARA COMPATIBILIDADE - SUBSTITUI O EXISTENTE
  async getSubracesByRace(raceIndex: string): Promise<DndSubrace[]> {
    // Usar o novo método que tem dados mock
    return this.getRaceSubraces(raceIndex);
  }

  // ===========================
  // MÉTODOS PÚBLICOS - CLASSES
  // ===========================

  async getClasses(): Promise<DndClass[]> {
    try {
      const classesList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/classes");
      
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

  // 🎯 MÉTODO MODIFICADO - SUBCLASSES POR CLASSE COM DADOS MOCK
  async getClassSubclasses(classIndex: string): Promise<DndSubclass[]> {
    try {
      const data = await this.request<{results: {index: string, name: string, url: string}[]}>(`/classes/${classIndex}/subclasses`);
      
      const subclassPromises = data.results.map(async (subclassRef) => {
        const subclassData = await this.request<DndApiSubclass>(`/subclasses/${subclassRef.index}`);
        return this.convertSubclassData(subclassData);
      });
      
      const apiSubclasses = await Promise.all(subclassPromises);
      
      // 🎯 AQUI É A MUDANÇA PRINCIPAL: mesclar com dados mock
      const completeSubclasses = mergeSubclasses(apiSubclasses, classIndex);
      
      return completeSubclasses;
    } catch (error) {
      console.error(`Erro ao buscar subclasses da classe ${classIndex}:`, error);
      throw error;
    }
  }

  // 🎯 MÉTODO MODIFICADO - BUSCAR SUBCLASSE INDIVIDUAL COM FALLBACK PARA MOCK
  async getSubclass(subclassIndex: string): Promise<DndSubclass> {
    try {
      // Tentar buscar na API primeiro
      const data = await this.request<DndApiSubclass>(`/subclasses/${subclassIndex}`);
      if (DEBUG_API) {
        console.log(`🌐 Subclasse '${subclassIndex}' encontrada na API oficial`);
      }
      return this.convertSubclassData(data);
    } catch (error) {
      // Se não encontrou na API, buscar nos dados mock
      if (USE_MOCK_DATA) {
        const mockSubclass = findMockSubclass(subclassIndex);
        if (mockSubclass) {
          if (DEBUG_API) {
            console.log(`📋 ===== SUBCLASSE ENCONTRADA NOS DADOS LOCAIS =====`);
            console.log(`🔍 Procurando: ${subclassIndex}`);
            console.log(`✅ Encontrada: ${mockSubclass.name}`);
            console.log("===============================================");
          }
          return mockSubclass;
        }
      }
      
      console.error(`❌ Subclasse '${subclassIndex}' não encontrada nem na API nem nos dados locais`);
      throw error;
    }
  }

  // 🎯 MÉTODO LEGADO PARA COMPATIBILIDADE - SUBSTITUI O EXISTENTE
  async getSubclassesByClass(classIndex: string): Promise<DndSubclass[]> {
    // Usar o novo método que tem dados mock
    return this.getClassSubclasses(classIndex);
  }

  // ===========================
  // 🎯 MÉTODOS PÚBLICOS - BACKGROUNDS (MODIFICADOS COM MERGE)
  // ===========================

  async getBackgrounds(): Promise<DndBackground[]> {
    try {
      const backgroundsList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/backgrounds");
      
      const backgroundsData: DndApiBackground[] = [];
      for (const bg of backgroundsList.results) {
        const backgroundData = await this.request<DndApiBackground>(`/backgrounds/${bg.index}`);
        backgroundsData.push(backgroundData);
      }
      
      const apiBackgrounds = backgroundsData.map(bg => this.convertBackgroundData(bg));
      
      // 🎯 AQUI É A MUDANÇA PRINCIPAL: mesclar com dados mock
      const completeBackgrounds = mergeBackgrounds(apiBackgrounds);
      
      return completeBackgrounds;
    } catch (error) {
      console.error("Erro ao buscar backgrounds:", error);
      throw error;
    }
  }

  async getBackground(backgroundIndex: string): Promise<DndBackground> {
    try {
      // Tentar buscar na API primeiro
      const data = await this.request<DndApiBackground>(`/backgrounds/${backgroundIndex}`);
      if (DEBUG_API) {
        console.log(`🌐 Background '${backgroundIndex}' encontrado na API oficial`);
      }
      return this.convertBackgroundData(data);
    } catch (error) {
      // Se não encontrou na API, buscar nos dados mock
      if (USE_MOCK_DATA) {
        const mockBackground = findMockBackground(backgroundIndex);
        if (mockBackground) {
          if (DEBUG_API) {
            console.log(`📋 ===== BACKGROUND ENCONTRADO NOS DADOS LOCAIS =====`);
            console.log(`🔍 Procurando: ${backgroundIndex}`);
            console.log(`✅ Encontrado: ${mockBackground.name}`);
            console.log("===============================================");
          }
          return mockBackground;
        }
      }
      
      console.error(`❌ Background '${backgroundIndex}' não encontrado nem na API nem nos dados locais`);
      throw error;
    }
  }

  // ===========================
  // MÉTODOS PÚBLICOS - MAGIAS
  // ===========================

  async getSpells(): Promise<DndSpell[]> {
    try {
      const spellsList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/spells");
      
      const spellsData: DndApiSpell[] = [];
      for (const spell of spellsList.results) {
        const spellData = await this.request<DndApiSpell>(`/spells/${spell.index}`);
        spellsData.push(spellData);
      }
      
      return spellsData.map(spell => this.convertSpellData(spell));
    } catch (error) {
      console.error("Erro ao buscar magias:", error);
      throw error;
    }
  }

  async getSpell(spellIndex: string): Promise<DndSpell> {
    try {
      const spellData = await this.request<DndApiSpell>(`/spells/${spellIndex}`);
      return this.convertSpellData(spellData);
    } catch (error) {
      console.error(`Erro ao buscar magia ${spellIndex}:`, error);
      throw error;
    }
  }

  async getSpellsByLevel(level: number): Promise<DndSpell[]> {
    try {
      const spellsList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>(`/spells?level=${level}`);
      
      console.log(`📚 Carregando ${spellsList.results.length} magias de nível ${level}...`);
      
      const spellsData: DndApiSpell[] = [];
      const batchSize = 10;
      
      for (let i = 0; i < spellsList.results.length; i += batchSize) {
        const batch = spellsList.results.slice(i, i + batchSize);
        console.log(`📖 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(spellsList.results.length/batchSize)}...`);
        
        for (const spell of batch) {
          try {
            const spellData = await this.request<DndApiSpell>(`/spells/${spell.index}`);
            spellsData.push(spellData);
          } catch (error) {
            console.warn(`⚠️ Erro ao carregar magia ${spell.index}:`, error);
          }
        }
      }
      
      console.log(`✅ ${spellsData.length} magias de nível ${level} carregadas com sucesso`);
      return spellsData.map(spell => this.convertSpellData(spell));
      
    } catch (error) {
      console.error(`Erro ao buscar magias de nível ${level}:`, error);
      throw error;
    }
  }

  async getAllSpells(): Promise<DndSpell[]> {
    try {
      const spellsList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/spells");
      
      console.log(`📚 Carregando ${spellsList.results.length} magias...`);
      
      const spellsData: DndApiSpell[] = [];
      const batchSize = 20;
      
      for (let i = 0; i < spellsList.results.length; i += batchSize) {
        const batch = spellsList.results.slice(i, i + batchSize);
        console.log(`📖 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(spellsList.results.length/batchSize)}...`);
        
        for (const spell of batch) {
          try {
            const spellData = await this.request<DndApiSpell>(`/spells/${spell.index}`);
            spellsData.push(spellData);
          } catch (error) {
            console.warn(`⚠️ Erro ao carregar magia ${spell.index}:`, error);
          }
        }
        
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

  // ===========================
  // MÉTODOS UTILITÁRIOS
  // ===========================

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