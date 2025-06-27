// ===========================
// D&D API SERVICE - VERSÃO COMPLETA COM DADOS MOCK INTEGRADOS
// src/api/dndAPI.ts
// ===========================

import { DndRace, DndSubrace, DndClass, DndSubclass, DndBackground, DndSpell } from "@/types/characterCreation";

// 🎯 IMPORTAÇÕES DOS DADOS MOCK EXISTENTES
import { mockSubraces } from "@/data/mockSubRaces";
import { mockSubclasses } from "@/data/mockSubClasses";

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
    prerequisites: Array<{
      index: string;
      type: string;
      name: string;
      url: string;
    }>;
    spell: {
      index: string;
      name: string;
      url: string;
    };
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
  language_options: {
    choose: number;
    type: string;
    from: Array<{
      index: string;
      name: string;
      url: string;
    }>;
  };
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
    type: string;
    from: string[];
  };
  ideals: {
    choose: number;
    type: string;
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
    type: string;
    from: string[];
  };
  flaws: {
    choose: number;
    type: string;
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
      ability_bonuses: apiRace.ability_bonuses.map(bonus => ({
        ability_score: {
          index: bonus.ability_score.index,
          name: bonus.ability_score.name,
          url: bonus.ability_score.url,
        },
        bonus: bonus.bonus,
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
      url: apiRace.url,
    };
  }

  private convertSubraceData(apiSubrace: DndApiSubrace): DndSubrace {
    return {
      index: apiSubrace.index,
      name: apiSubrace.name,
      race: apiSubrace.race,
      desc: apiSubrace.desc,
      ability_bonuses: apiSubrace.ability_bonuses.map(bonus => ({
        ability_score: {
          index: bonus.ability_score.index,
          name: bonus.ability_score.name,
          url: bonus.ability_score.url,
        },
        bonus: bonus.bonus,
      })),
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
      proficiency_choices: apiClass.proficiency_choices.map(choice => ({
        desc: choice.desc,
        choose: choice.choose,
        type: choice.type,
        from: {
          option_set_type: choice.from.option_set_type,
          options: choice.from.options.map(option => ({
            option_type: option.option_type,
            item: option.item,
          })),
        },
      })),
      saving_throws: apiClass.saving_throws,
      starting_equipment: apiClass.starting_equipment.map(item => ({
        equipment: item.equipment,
        quantity: item.quantity,
      })),
      class_levels: apiClass.class_levels,
      multi_classing: {
        prerequisites: apiClass.multi_classing.prerequisites,
        proficiencies: apiClass.multi_classing.proficiencies,
      },
      subclasses: apiClass.subclasses,
      spellcasting: apiClass.spellcasting ? {
        level: apiClass.spellcasting.level,
        spellcasting_ability: apiClass.spellcasting.spellcasting_ability,
        info: apiClass.spellcasting.info,
      } : undefined,
      url: apiClass.url,
    };
  }

  private convertSubclassData(apiSubclass: DndApiSubclass): DndSubclass {
    return {
      index: apiSubclass.index,
      name: apiSubclass.name,
      class: apiSubclass.class,
      subclass_flavor: apiSubclass.subclass_flavor,
      desc: apiSubclass.desc,
      subclass_levels: apiSubclass.subclass_levels,
      spells: apiSubclass.spells,
      url: apiSubclass.url,
    };
  }

  private convertBackgroundData(apiBackground: DndApiBackground): DndBackground {
    return {
      index: apiBackground.index,
      name: apiBackground.name,
      starting_proficiencies: apiBackground.starting_proficiencies,
      language_options: apiBackground.language_options,
      starting_equipment: apiBackground.starting_equipment,
      feature: apiBackground.feature,
      personality_traits: apiBackground.personality_traits,
      ideals: apiBackground.ideals,
      bonds: apiBackground.bonds,
      flaws: apiBackground.flaws,
      url: apiBackground.url,
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
      console.error("Erro ao buscar sub-raças:", error);
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
  // MÉTODOS PÚBLICOS - BACKGROUNDS
  // ===========================

  async getBackgrounds(): Promise<DndBackground[]> {
    try {
      const backgroundsList = await this.request<DndApiResponse<{index: string, name: string, url: string}>>("/backgrounds");
      
      const backgroundsData: DndApiBackground[] = [];
      for (const bg of backgroundsList.results) {
        const backgroundData = await this.request<DndApiBackground>(`/backgrounds/${bg.index}`);
        backgroundsData.push(backgroundData);
      }
      
      return backgroundsData.map(bg => this.convertBackgroundData(bg));
    } catch (error) {
      console.error("Erro ao buscar backgrounds:", error);
      throw error;
    }
  }

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