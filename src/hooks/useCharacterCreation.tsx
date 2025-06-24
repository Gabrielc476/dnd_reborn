// ===========================
// OPTIMIZED CHARACTER CREATION HOOK - VERSÃO COMPLETA COM SUBCLASSES
// ===========================
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
  useRef,
} from "react";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  CharacterCreationData,
  CharacterCreationContextType,
  CharacterCreationStep,
  AbilityScores,
  DndRace,
  DndSubrace,
  DndClass,
  DndSubclass,
  DndBackground,
  DndSpell,
  DndApiReference,
  StepValidation,
} from "@/types/characterCreation";

// ===========================
// QUERY CLIENT SETUP
// ===========================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (era cacheTime)
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

// ===========================
// OPTIMIZED D&D API SERVICE
// ===========================

class OptimizedDndApiService {
  private cache = new Map<string, any>();
  private abortControllers = new Map<string, AbortController>();

  private async fetchWithCache<T>(
    url: string,
    key: string,
    signal?: AbortSignal
  ): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    this.cache.set(key, data);
    return data;
  }

  private cancelPreviousRequest(key: string): AbortSignal {
    const existingController = this.abortControllers.get(key);
    if (existingController) {
      existingController.abort();
    }

    const newController = new AbortController();
    this.abortControllers.set(key, newController);
    return newController.signal;
  }

  async fetchRaces(): Promise<DndRace[]> {
    const signal = this.cancelPreviousRequest("races");

    try {
      const data = await this.fetchWithCache<any>(
        "https://www.dnd5eapi.co/api/races",
        "races",
        signal
      );

      const racePromises = data.results.map(async (race: any) => {
        const raceData = await this.fetchWithCache<DndRace>(
          `https://www.dnd5eapi.co${race.url}`,
          `race-${race.index}`,
          signal
        );
        return raceData;
      });

      return Promise.all(racePromises);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }
      console.warn("Failed to fetch races from API, using fallback");
      return this.getMockRaces();
    }
  }

  async fetchClasses(): Promise<DndClass[]> {
    const signal = this.cancelPreviousRequest("classes");

    try {
      const data = await this.fetchWithCache<any>(
        "https://www.dnd5eapi.co/api/classes",
        "classes",
        signal
      );

      const classPromises = data.results.map(async (cls: any) => {
        const classData = await this.fetchWithCache<DndClass>(
          `https://www.dnd5eapi.co${cls.url}`,
          `class-${cls.index}`,
          signal
        );
        return classData;
      });

      return Promise.all(classPromises);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }
      console.warn("Failed to fetch classes from API, using fallback");
      return this.getMockClasses();
    }
  }

  async fetchSpells(level?: number, className?: string): Promise<DndSpell[]> {
    const cacheKey = `spells-${level || "all"}-${className || "all"}`;
    const signal = this.cancelPreviousRequest(cacheKey);

    try {
      let url = "https://www.dnd5eapi.co/api/spells";
      const params = new URLSearchParams();

      if (level !== undefined) params.append("level", level.toString());
      if (className) params.append("class", className);

      if (params.toString()) url += `?${params.toString()}`;

      const data = await this.fetchWithCache<any>(url, cacheKey, signal);

      // Limit to 50 spells for performance
      const limitedResults = data.results.slice(0, 50);

      const spellPromises = limitedResults.map(async (spell: any) => {
        const spellData = await this.fetchWithCache<DndSpell>(
          `https://www.dnd5eapi.co${spell.url}`,
          `spell-${spell.index}`,
          signal
        );
        return spellData;
      });

      return Promise.all(spellPromises);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }
      console.warn("Failed to fetch spells from API, using fallback");
      return this.getMockSpells();
    }
  }

  async fetchSubclasses(classIndex?: string): Promise<DndSubclass[]> {
    const cacheKey = `subclasses-${classIndex || "all"}`;
    const signal = this.cancelPreviousRequest(cacheKey);

    try {
      let url = "https://www.dnd5eapi.co/api/subclasses";
      if (classIndex) {
        url += `?class=${classIndex}`;
      }

      const data = await this.fetchWithCache<any>(url, cacheKey, signal);

      const subclassPromises = data.results.map(async (subclass: any) => {
        const subclassData = await this.fetchWithCache<DndSubclass>(
          `https://www.dnd5eapi.co${subclass.url}`,
          `subclass-${subclass.index}`,
          signal
        );
        return subclassData;
      });

      return Promise.all(subclassPromises);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }
      console.warn("Failed to fetch subclasses from API, using fallback");
      return this.getMockSubclasses(classIndex);
    }
  }

  // Mock data methods - RAÇAS ATUALIZADAS
  private getMockRaces(): DndRace[] {
    return [
      {
        index: "human",
        name: "Humano",
        speed: 30,
        ability_bonuses: [
          { ability_score: { index: "str", name: "Força", url: "" }, bonus: 1 },
          { ability_score: { index: "dex", name: "Destreza", url: "" }, bonus: 1 },
          { ability_score: { index: "con", name: "Constituição", url: "" }, bonus: 1 },
          { ability_score: { index: "int", name: "Inteligência", url: "" }, bonus: 1 },
          { ability_score: { index: "wis", name: "Sabedoria", url: "" }, bonus: 1 },
          { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 1 },
        ],
        alignment: "Qualquer alinhamento",
        age: "Humanos atingem a idade adulta no final da adolescência",
        size: "Medium",
        size_description: "Humanos variam amplamente em altura e constituição",
        starting_proficiencies: [],
        languages: [],
        language_desc: "Comum e um idioma extra de sua escolha",
        traits: [],
        subraces: [
          { index: "variant-human", name: "Humano Variante", url: "/api/subraces/variant-human" }
        ],
        url: "/api/races/human",
      },
      {
        index: "elf",
        name: "Elfo",
        speed: 30,
        ability_bonuses: [
          { ability_score: { index: "dex", name: "Destreza", url: "" }, bonus: 2 },
        ],
        alignment: "Elfos amam a liberdade, variedade e auto-expressão",
        age: "Elfos amadurecem na mesma taxa que humanos, mas são considerados jovens até os 100 anos",
        size: "Medium",
        size_description: "Elfos variam de menos de 5 pés a mais de 6 pés de altura",
        starting_proficiencies: [],
        languages: [],
        language_desc: "Comum e Élfico",
        traits: [],
        subraces: [
          { index: "high-elf", name: "Alto Elfo", url: "/api/subraces/high-elf" },
          { index: "wood-elf", name: "Elfo da Floresta", url: "/api/subraces/wood-elf" },
          { index: "drow", name: "Elfo Negro (Drow)", url: "/api/subraces/drow" },
        ],
        url: "/api/races/elf",
      },
      {
        index: "dwarf",
        name: "Anão",
        speed: 25,
        ability_bonuses: [
          { ability_score: { index: "con", name: "Constituição", url: "" }, bonus: 2 },
        ],
        alignment: "Anões são leais e honrados",
        age: "Anões amadurecem na mesma taxa que humanos, mas são considerados jovens até os 50 anos",
        size: "Medium",
        size_description: "Anões têm entre 4 e 5 pés de altura",
        starting_proficiencies: [],
        languages: [],
        language_desc: "Comum e Anão",
        traits: [],
        subraces: [
          { index: "hill-dwarf", name: "Anão da Colina", url: "/api/subraces/hill-dwarf" },
          { index: "mountain-dwarf", name: "Anão da Montanha", url: "/api/subraces/mountain-dwarf" },
        ],
        url: "/api/races/dwarf",
      },
      {
        index: "halfling",
        name: "Halfling",
        speed: 25,
        ability_bonuses: [
          { ability_score: { index: "dex", name: "Destreza", url: "" }, bonus: 2 },
        ],
        alignment: "Halflings são bondosos e pacíficos",
        age: "Halflings atingem a idade adulta aos 20 anos e vivem cerca de 150 anos",
        size: "Small",
        size_description: "Halflings têm cerca de 3 pés de altura",
        starting_proficiencies: [],
        languages: [],
        language_desc: "Comum e Halfling",
        traits: [],
        subraces: [
          { index: "lightfoot-halfling", name: "Halfling Pés Leves", url: "/api/subraces/lightfoot-halfling" },
          { index: "stout-halfling", name: "Halfling Robusto", url: "/api/subraces/stout-halfling" },
        ],
        url: "/api/races/halfling",
      },
      {
        index: "gnome",
        name: "Gnomo",
        speed: 25,
        ability_bonuses: [
          { ability_score: { index: "int", name: "Inteligência", url: "" }, bonus: 2 },
        ],
        alignment: "Gnomos são bondosos e curiosos",
        age: "Gnomos amadurecem na mesma taxa que humanos e vivem entre 350 e 500 anos",
        size: "Small",
        size_description: "Gnomos têm entre 3 e 4 pés de altura",
        starting_proficiencies: [],
        languages: [],
        language_desc: "Comum e Gnômico",
        traits: [],
        subraces: [
          { index: "forest-gnome", name: "Gnomo da Floresta", url: "/api/subraces/forest-gnome" },
          { index: "rock-gnome", name: "Gnomo das Rochas", url: "/api/subraces/rock-gnome" },
        ],
        url: "/api/races/gnome",
      },
      {
        index: "dragonborn",
        name: "Dracônico",
        speed: 30,
        ability_bonuses: [
          { ability_score: { index: "str", name: "Força", url: "" }, bonus: 2 },
          { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 1 },
        ],
        alignment: "Dracônicos tendem ao extremos",
        age: "Dracônicos crescem rapidamente e vivem cerca de 80 anos",
        size: "Medium",
        size_description: "Dracônicos são mais altos e pesados que humanos",
        starting_proficiencies: [],
        languages: [],
        language_desc: "Comum e Dracônico",
        traits: [],
        subraces: [], // Sem subraces tradicionais
        url: "/api/races/dragonborn",
      },
      {
        index: "tiefling",
        name: "Tiefling",
        speed: 30,
        ability_bonuses: [
          { ability_score: { index: "int", name: "Inteligência", url: "" }, bonus: 1 },
          { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 2 },
        ],
        alignment: "Tieflings não têm tendência inerente ao mal",
        age: "Tieflings amadurecem na mesma taxa que humanos, mas vivem alguns anos a mais",
        size: "Medium",
        size_description: "Tieflings têm o mesmo tamanho e constituição que humanos",
        starting_proficiencies: [],
        languages: [],
        language_desc: "Comum e Infernal",
        traits: [],
        subraces: [], // Sem subraces tradicionais
        url: "/api/races/tiefling",
      },
    ];
  }

  private getMockClasses(): DndClass[] {
    return [
      {
        index: "fighter",
        name: "Guerreiro",
        hit_die: 10,
        proficiencies: [],
        proficiency_choices: [],
        saving_throws: [],
        starting_equipment: [],
        spellcasting: undefined,
        url: "/api/classes/fighter",
      },
      {
        index: "wizard",
        name: "Mago",
        hit_die: 6,
        proficiencies: [],
        proficiency_choices: [],
        saving_throws: [],
        starting_equipment: [],
        spellcasting: {
          level: 1,
          spellcasting_ability: { index: "int", name: "Inteligência", url: "" },
          info: []
        },
        url: "/api/classes/wizard",
      },
    ];
  }

  private getMockSpells(): DndSpell[] {
    return [
      {
        index: "fire-bolt",
        name: "Rajada de Fogo",
        desc: ["Você arremessa uma mote de fogo numa criatura ou objeto ao alcance."],
        higher_level: [],
        range: "120 pés",
        components: ["V", "S"],
        material: "",
        ritual: false,
        duration: "Instantâneo",
        concentration: false,
        casting_time: "1 ação",
        level: 0,
        attack_type: "ranged",
        damage: {
          damage_type: { index: "fire", name: "Fogo", url: "" },
          damage_at_slot_level: { "1": "1d10" }
        },
        school: { index: "evocation", name: "Evocação", url: "" },
        classes: [{ index: "wizard", name: "Mago", url: "" }],
        subclasses: [],
        url: "/api/spells/fire-bolt",
      },
    ];
  }

  private getMockSubclasses(classIndex?: string): DndSubclass[] {
    const allSubclasses = [
      // Wizard subclasses
      {
        index: "school-of-evocation",
        name: "Escola de Evocação",
        class: { index: "wizard", name: "Mago", url: "" },
        subclass_flavor: "Escola Arcana",
        desc: [
          "Focados em magias que manipulam energia e criam efeitos elementais.",
          "Especialistas em magias de dano e destruição."
        ],
        subclass_levels: [
          {
            level: 2,
            features: [
              { index: "evocation-savant", name: "Especialista em Evocação", url: "" },
              { index: "sculpt-spells", name: "Esculpir Magias", url: "" }
            ]
          }
        ],
        url: "/api/subclasses/school-of-evocation",
      },
      // Fighter subclasses
      {
        index: "champion",
        name: "Campeão",
        class: { index: "fighter", name: "Guerreiro", url: "" },
        subclass_flavor: "Arquétipo Marcial",
        desc: [
          "O epítome do guerreiro, focado em combate físico aprimorado.",
          "Especialistas em críticos e resistência."
        ],
        subclass_levels: [
          {
            level: 3,
            features: [
              { index: "improved-critical", name: "Crítico Aprimorado", url: "" }
            ]
          }
        ],
        url: "/api/subclasses/champion",
      },
    ];

    if (classIndex) {
      return allSubclasses.filter(subclass => subclass.class.index === classIndex);
    }

    return allSubclasses;
  }
}

// ===========================
// CUSTOM HOOKS FOR DATA FETCHING
// ===========================

const apiService = new OptimizedDndApiService();

function useRacesQuery() {
  return useQuery({
    queryKey: ["dnd", "races"],
    queryFn: () => apiService.fetchRaces(),
    staleTime: 30 * 60 * 1000, // 30 minutes - rarely changes
  });
}

function useClassesQuery() {
  return useQuery({
    queryKey: ["dnd", "classes"],
    queryFn: () => apiService.fetchClasses(),
    staleTime: 30 * 60 * 1000,
  });
}

function useBackgroundsQuery() {
  return useQuery({
    queryKey: ["dnd", "backgrounds"],
    queryFn: async (): Promise<DndBackground[]> => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return [
        {
          index: "acolyte",
          name: "Acólito",
          starting_proficiencies: [],
          starting_equipment: [],
          feature: {
            name: "Abrigo dos Fiéis",
            desc: ["Você tem acesso a um templo onde pode encontrar abrigo e cuidados."],
          },
          personality_traits: {
            choose: 2,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu idolatro um herói particular da minha fé.",
                },
              ],
            },
          },
          ideals: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  alignments: [],
                  desc: "Tradição. As tradições antigas devem ser preservadas.",
                },
              ],
            },
          },
          bonds: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu morreria para recuperar uma relíquia da minha fé.",
                },
              ],
            },
          },
          flaws: {
            choose: 1,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu julgo outros duramente, e a mim mesmo ainda mais.",
                },
              ],
            },
          },
          url: "/api/backgrounds/acolyte",
        },
      ];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

function useSpellsQuery(enabled: boolean, level?: number, className?: string) {
  return useQuery({
    queryKey: ["dnd", "spells", level, className],
    queryFn: () => apiService.fetchSpells(level, className),
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

function useSubclassesQuery(enabled: boolean, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "subclasses", classIndex],
    queryFn: () => apiService.fetchSubclasses(classIndex),
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// ===========================
// DEBOUNCE HOOK
// ===========================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ===========================
// INITIAL DATA
// ===========================

const initialCharacterData: CharacterCreationData = {
  name: "",
  selectedRace: null,
  selectedSubrace: null,
  selectedClass: null,
  selectedSubclass: null,
  selectedBackground: null,
  level: 1,
  alignment: "",
  abilityScores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  abilityMethod: "standard",
  selectedSkills: [],
  availableSkillChoices: 0,
  hitPoints: 0,
  armorClass: 10,
  selectedSpells: [],
  isSpellcaster: false,
  spellcastingAbility: null,
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
};

const characterCreationSteps: CharacterCreationStep[] = [
  {
    id: "basic-info",
    title: "Informações Básicas",
    description: "Nome, raça, classe e background",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "ability-scores",
    title: "Atributos",
    description: "Defina os valores dos seus atributos",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "skills",
    title: "Perícias",
    description: "Escolha suas perícias",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "equipment",
    title: "Equipamentos",
    description: "HP, CA e equipamentos iniciais",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "spells",
    title: "Magias",
    description: "Escolha suas magias (se aplicável)",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "personality",
    title: "Personalização",
    description: "Traços, ideais, vínculos e defeitos",
    isCompleted: false,
    isValid: false,
  },
];

// ===========================
// CONTEXT
// ===========================

const CharacterCreationContext =
  createContext<CharacterCreationContextType | null>(null);

// ===========================
// OPTIMIZED HOOK IMPLEMENTATION
// ===========================

export const useCharacterCreation = (): CharacterCreationContextType => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(characterCreationSteps);
  const [characterData, setCharacterData] = useState(initialCharacterData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search states with debouncing
  const [raceSearchTerm, setRaceSearchTerm] = useState("");
  const [classSearchTerm, setClassSearchTerm] = useState("");
  const [spellSearchTerm, setSpellSearchTerm] = useState("");

  const debouncedRaceSearch = useDebounce(raceSearchTerm, 300);
  const debouncedClassSearch = useDebounce(classSearchTerm, 300);
  const debouncedSpellSearch = useDebounce(spellSearchTerm, 300);

  // Data queries with React Query
  const {
    data: racesData = [],
    isLoading: racesLoading,
    error: racesError,
  } = useRacesQuery();

  const {
    data: classesData = [],
    isLoading: classesLoading,
    error: classesError,
  } = useClassesQuery();

  const { data: backgroundsData = [], isLoading: backgroundsLoading } =
    useBackgroundsQuery();

  const { data: spellsData = [], isLoading: spellsLoading } = useSpellsQuery(
    characterData.isSpellcaster,
    undefined,
    characterData.selectedClass?.index
  );

  const { data: subclassesData = [], isLoading: subclassesLoading } = useSubclassesQuery(
    !!characterData.selectedClass,
    characterData.selectedClass?.index
  );

  // ===========================
  // COMPUTED VALUES
  // ===========================

  const totalSteps = steps.length;

  // Filter data based on search terms
  const filteredRaces = useMemo(() => {
    if (!debouncedRaceSearch) return racesData;
    return racesData.filter(race =>
      race.name.toLowerCase().includes(debouncedRaceSearch.toLowerCase())
    );
  }, [racesData, debouncedRaceSearch]);

  const filteredClasses = useMemo(() => {
    if (!debouncedClassSearch) return classesData;
    return classesData.filter(cls =>
      cls.name.toLowerCase().includes(debouncedClassSearch.toLowerCase())
    );
  }, [classesData, debouncedClassSearch]);

  const filteredSpells = useMemo(() => {
    if (!debouncedSpellSearch) return spellsData;
    return spellsData.filter(spell =>
      spell.name.toLowerCase().includes(debouncedSpellSearch.toLowerCase())
    );
  }, [spellsData, debouncedSpellSearch]);

  // Get available subraces based on selected race
  const availableSubraces = useMemo(() => {
    if (!characterData.selectedRace || !characterData.selectedRace.subraces.length) {
      return [];
    }
    // For now, return mock subraces
    return [
      {
        index: "high-elf",
        name: "Alto Elfo",
        race: characterData.selectedRace,
        desc: "Elfos nobres com magia inata",
        ability_bonuses: [
          { ability_score: { index: "int", name: "Inteligência", url: "" }, bonus: 1 },
        ],
        starting_proficiencies: [],
        languages: [],
        racial_traits: [],
        url: "/api/subraces/high-elf",
      }
    ];
  }, [characterData.selectedRace]);

  // Get available subclasses - CORRIGIDO: filtra por classe selecionada
  const availableSubclasses = useMemo(() => {
    if (!characterData.selectedClass) {
      return [];
    }

    // Filtra subclasses apenas da classe selecionada
    return subclassesData.filter(
      (subclass) => subclass.class.index === characterData.selectedClass?.index
    );
  }, [characterData.selectedClass, subclassesData]);

  // Combined ability bonuses from race and subrace
  const combinedAbilityBonuses = useMemo(() => {
    const bonuses: { [key: string]: number } = {};
    
    // Add race bonuses
    characterData.selectedRace?.ability_bonuses.forEach(bonus => {
      bonuses[bonus.ability_score.index] = (bonuses[bonus.ability_score.index] || 0) + bonus.bonus;
    });
    
    // Add subrace bonuses
    characterData.selectedSubrace?.ability_bonuses.forEach(bonus => {
      bonuses[bonus.ability_score.index] = (bonuses[bonus.ability_score.index] || 0) + bonus.bonus;
    });
    
    return bonuses;
  }, [characterData.selectedRace, characterData.selectedSubrace]);

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================

  const getAbilityModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  const calculateAbilityScorePoints = useCallback((scores: AbilityScores): number => {
    const costs = [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 7, 9];
    return Object.values(scores).reduce((total, score) => {
      return total + (costs[score] || 0);
    }, 0);
  }, []);

  const generateRandomAbilityScores = useCallback((): AbilityScores => {
    const rollStat = () => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    return {
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat(),
    };
  }, []);

  // ===========================
  // VALIDATION
  // ===========================

  const validateStep = useCallback(
    (stepIndex: number, data: CharacterCreationData): StepValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      switch (stepIndex) {
        case 0: // Basic Info
          if (!data.name.trim()) errors.push("Nome é obrigatório");
          if (!data.selectedRace) errors.push("Raça é obrigatória");
          if (!data.selectedClass) errors.push("Classe é obrigatória");
          if (!data.selectedBackground) errors.push("Background é obrigatório");
          if (!data.alignment) warnings.push("Escolha um alinhamento");
          break;

        case 1: // Ability Scores
          const totalPoints = calculateAbilityScorePoints(data.abilityScores);
          if (data.abilityMethod === "point_buy" && totalPoints !== 27) {
            errors.push(
              `Você deve usar exatamente 27 pontos (atual: ${totalPoints})`
            );
          }
          break;

        case 2: // Skills
          if (data.selectedSkills.length !== data.availableSkillChoices) {
            errors.push(`Selecione ${data.availableSkillChoices} perícias`);
          }
          break;

        case 3: // Equipment
          if (data.hitPoints <= 0) errors.push("HP deve ser maior que 0");
          if (data.armorClass < 10) warnings.push("CA muito baixa");
          break;

        case 4: // Spells
          if (data.isSpellcaster && data.selectedSpells.length === 0) {
            warnings.push("Conjuradores geralmente começam com algumas magias");
          }
          break;

        case 5: // Personality
          if (data.personalityTraits.length === 0) {
            warnings.push("Adicione alguns traços de personalidade");
          }
          break;
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
    [calculateAbilityScorePoints]
  );

  const validateCurrentStep = useCallback((): boolean => {
    const validation = validateStep(currentStep, characterData);
    return validation.isValid;
  }, [currentStep, characterData, validateStep]);

  const canProceed = useCallback((): boolean => {
    return (
      validateCurrentStep() && !loading && !racesLoading && !classesLoading
    );
  }, [validateCurrentStep, loading, racesLoading, classesLoading]);

  // ===========================
  // NAVIGATION
  // ===========================

  const nextStep = useCallback(() => {
    if (canProceed() && currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);

      // Mark current step as completed
      setSteps((prev) =>
        prev.map((step, index) =>
          index === currentStep
            ? { ...step, isCompleted: true, isValid: true }
            : step
        )
      );
    }
  }, [canProceed, currentStep, totalSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  // ===========================
  // DATA MANAGEMENT
  // ===========================

  const updateCharacterData = useCallback(
    (newData: Partial<CharacterCreationData>) => {
      setCharacterData((prev) => {
        const updated = { ...prev, ...newData };

        // Auto-calculations based on selections
        if (newData.selectedClass) {
          updated.isSpellcaster = !!newData.selectedClass.spellcasting;
          updated.spellcastingAbility =
            newData.selectedClass.spellcasting?.spellcasting_ability.index ||
            null;
          updated.availableSkillChoices = 2; // Simplified

          // Reset subclass if class changed
          if (newData.selectedClass.index !== prev.selectedClass?.index) {
            updated.selectedSubclass = null;
          }
        }

        if (newData.selectedClass && updated.abilityScores && updated.level) {
          const conModifier = getAbilityModifier(
            updated.abilityScores.constitution
          );
          updated.hitPoints =
            newData.selectedClass.hit_die +
            conModifier +
            (updated.level - 1) *
              (Math.floor(newData.selectedClass.hit_die / 2) + 1 + conModifier);
        }

        if (newData.abilityScores) {
          const dexModifier = getAbilityModifier(
            updated.abilityScores.dexterity
          );
          updated.armorClass = 10 + dexModifier;
        }

        return updated;
      });

      // Clear error when data changes
      if (error) setError(null);
    },
    [getAbilityModifier, error]
  );

  const resetCharacter = useCallback(() => {
    setCharacterData(initialCharacterData);
    setCurrentStep(0);
    setSteps(characterCreationSteps);
    setError(null);
    setRaceSearchTerm("");
    setClassSearchTerm("");
    setSpellSearchTerm("");
  }, []);

  // ===========================
  // SEARCH HANDLERS
  // ===========================

  const searchHandlers = useMemo(
    () => ({
      setRaceSearch: setRaceSearchTerm,
      setClassSearch: setClassSearchTerm,
      setSpellSearch: setSpellSearchTerm,
      raceSearch: raceSearchTerm,
      classSearch: classSearchTerm,
      spellSearch: spellSearchTerm,
    }),
    [raceSearchTerm, classSearchTerm, spellSearchTerm]
  );

  // ===========================
  // CHARACTER CREATION
  // ===========================

  const createCharacter = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Validate all steps
      for (let i = 0; i < totalSteps; i++) {
        const validation = validateStep(i, characterData);
        if (!validation.isValid) {
          throw new Error(
            `Erro no passo ${i + 1}: ${validation.errors.join(", ")}`
          );
        }
      }

      // Import and use real API
      const { characterAPI } = await import("@/api/characterAPI");

      // Validate data before sending
      const validationErrors =
        characterAPI.validateCharacterData(characterData);
      if (validationErrors.length > 0) {
        throw new Error(`Dados inválidos: ${validationErrors.join(", ")}`);
      }

      // Create character via API
      const response = await characterAPI.createCharacter(characterData);

      if (!response.character) {
        throw new Error(response.error || "Erro ao criar personagem");
      }

      console.log("Personagem criado com sucesso:", response.character);

      // Reset form after success
      resetCharacter();
    } catch (err) {
      console.error("Erro ao criar personagem:", err);
      setError(err instanceof Error ? err.message : "Erro ao criar personagem");
    } finally {
      setLoading(false);
    }
  }, [characterData, totalSteps, validateStep, resetCharacter]);

  // ===========================
  // EFFECTS FOR AUTO-RESET
  // ===========================

  // Reset subrace when race changes and the new race doesn't support the current subrace
  useEffect(() => {
    if (characterData.selectedRace && characterData.selectedSubrace) {
      // Check if current subrace belongs to the selected race
      const currentSubraceIsValid = characterData.selectedSubrace.race.index === characterData.selectedRace.index;
      
      if (!currentSubraceIsValid) {
        // Reset subrace if it doesn't match the selected race
        setCharacterData(prev => ({
          ...prev,
          selectedSubrace: null
        }));
      }
    }
  }, [characterData.selectedRace?.index]);

  // Reset subclass when class changes and the new class doesn't support the current subclass
  useEffect(() => {
    if (characterData.selectedClass && characterData.selectedSubclass) {
      // Check if current subclass belongs to the selected class
      const currentSubclassIsValid = characterData.selectedSubclass.class.index === characterData.selectedClass.index;
      
      if (!currentSubclassIsValid) {
        // Reset subclass if it doesn't match the selected class
        setCharacterData(prev => ({
          ...prev,
          selectedSubclass: null
        }));
      }
    }
  }, [characterData.selectedClass?.index]);

  // ===========================
  // EFFECT FOR ERROR HANDLING
  // ===========================

  useEffect(() => {
    if (racesError || classesError) {
      setError("Erro ao carregar dados da API D&D. Usando dados locais.");
    }
  }, [racesError, classesError]);

  return {
    // State
    currentStep,
    totalSteps,
    steps,
    characterData,
    loading: loading || racesLoading || classesLoading || backgroundsLoading,
    error,

    // API Data (filtered)
    races: filteredRaces,
    classes: filteredClasses,
    backgrounds: backgroundsData,
    spells: filteredSpells,
    subraces: availableSubraces,
    subclasses: availableSubclasses,

    // Search
    ...searchHandlers,

    // Navigation
    nextStep,
    previousStep,
    goToStep,

    // Data management
    updateCharacterData,
    resetCharacter,

    // Validation
    validateCurrentStep,
    canProceed,

    // Finalization
    createCharacter,

    // Utilities
    getAbilityModifier,
    calculateAbilityScorePoints,
    generateRandomAbilityScores,

    // Subraces functions
    getAvailableSubraces: () => availableSubraces,
    getCombinedAbilityBonuses: () => combinedAbilityBonuses,
    getSubraceAbilityBonuses: () => 
      characterData.selectedSubrace ? characterData.selectedSubrace.ability_bonuses : [],

    // Subclasses functions
    getAvailableSubclasses: () => availableSubclasses,
    // CORREÇÃO APLICADA: Função getSubclassFeatures com tratamento de erro
    getSubclassFeatures: (level?: number) => {
      // Verificar se selectedSubclass existe
      if (!characterData.selectedSubclass) {
        return [];
      }
      
      // Verificar se subclass_levels existe e é um array
      if (!characterData.selectedSubclass.subclass_levels || 
          !Array.isArray(characterData.selectedSubclass.subclass_levels)) {
        console.warn('subclass_levels is not a valid array:', characterData.selectedSubclass.subclass_levels);
        return [];
      }
      
      const targetLevel = level || characterData.level;
      const features: DndApiReference[] = [];
      
      characterData.selectedSubclass.subclass_levels.forEach(levelData => {
        // Verificação adicional de segurança para levelData
        if (levelData && typeof levelData.level === 'number' && levelData.level <= targetLevel) {
          // Verificar se features existe e é um array antes de espalhar
          if (levelData.features && Array.isArray(levelData.features)) {
            features.push(...levelData.features);
          }
        }
      });
      
      return features;
    },

    // Loading states
    isLoadingRaces: racesLoading,
    isLoadingClasses: classesLoading,
    isLoadingSpells: spellsLoading,
    isLoadingSubraces: false, // Since we're using mock data for now
    isLoadingSubclasses: subclassesLoading,
  };
};

// ===========================
// PROVIDER COMPONENTS
// ===========================

interface CharacterCreationProviderProps {
  children: React.ReactNode;
}

export const CharacterCreationProvider: React.FC<
  CharacterCreationProviderProps
> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <CharacterCreationProviderInner>
        {children}
      </CharacterCreationProviderInner>
    </QueryClientProvider>
  );
};

const CharacterCreationProviderInner: React.FC<
  CharacterCreationProviderProps
> = ({ children }) => {
  const characterCreation = useCharacterCreation();

  return (
    <CharacterCreationContext.Provider value={characterCreation}>
      {children}
    </CharacterCreationContext.Provider>
  );
};

// ===========================
// CONTEXT HOOK
// ===========================

export const useCharacterCreationContext = (): CharacterCreationContextType => {
  const context = useContext(CharacterCreationContext);
  if (!context) {
    throw new Error(
      "useCharacterCreationContext deve ser usado dentro de um CharacterCreationProvider"
    );
  }
  return context;
};

export default useCharacterCreation;