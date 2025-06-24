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
    // Check memory cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    try {
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      this.cache.set(key, data);
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }
      console.error(`Error fetching ${key}:`, error);
      throw error;
    }
  }

  // Cancel previous request if new one is made
  private cancelPreviousRequest(key: string) {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
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
        "races-list",
        signal
      );

      // Fetch detailed race info with parallel requests
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
        "classes-list",
        signal
      );

      const classPromises = data.results.map(async (classItem: any) => {
        const classData = await this.fetchWithCache<DndClass>(
          `https://www.dnd5eapi.co${classItem.url}`,
          `class-${classItem.index}`,
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
        url = `https://www.dnd5eapi.co/api/classes/${classIndex}/subclasses`;
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

  // Mock data methods
  private getMockRaces(): DndRace[] {
    return [
      {
        index: "human",
        name: "Humano",
        speed: 30,
        ability_bonuses: [
          { ability_score: { index: "str", name: "Força", url: "" }, bonus: 1 },
          {
            ability_score: { index: "dex", name: "Destreza", url: "" },
            bonus: 1,
          },
          {
            ability_score: { index: "con", name: "Constituição", url: "" },
            bonus: 1,
          },
          {
            ability_score: { index: "int", name: "Inteligência", url: "" },
            bonus: 1,
          },
          {
            ability_score: { index: "wis", name: "Sabedoria", url: "" },
            bonus: 1,
          },
          {
            ability_score: { index: "cha", name: "Carisma", url: "" },
            bonus: 1,
          },
        ],
        alignment: "Qualquer",
        age: "Humanos atingem a maioridade aos 18 anos e vivem menos de um século.",
        size: "Medium",
        size_description: "Humanos variam muito em altura e constituição.",
        starting_proficiencies: [],
        languages: [],
        language_desc: "Comum e uma linguagem extra de sua escolha",
        traits: [],
        subraces: [],
        url: "/api/races/human",
      },
      {
        index: "elf",
        name: "Elfo",
        speed: 30,
        ability_bonuses: [
          { ability_score: { index: "dex", name: "Destreza", url: "" }, bonus: 2 },
        ],
        alignment: "Caótico Bom",
        age: "Elfos atingem a maturidade física aos 20 anos, mas não são considerados adultos até os 100 anos.",
        size: "Medium",
        size_description: "Elfos são ligeiramente menores que humanos.",
        starting_proficiencies: [],
        languages: [],
        language_desc: "Comum e Élfico",
        traits: [],
        subraces: [
          { index: "high-elf", name: "Alto Elfo", url: "/api/subraces/high-elf" },
          { index: "wood-elf", name: "Elfo da Floresta", url: "/api/subraces/wood-elf" },
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
        alignment: "Leal",
        age: "Anões atingem a maturidade aos 50 anos e vivem cerca de 350 anos.",
        size: "Medium",
        size_description: "Anões são baixos e robustos.",
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
        alignment: "Leal Bom",
        age: "Halflings atingem a maturidade aos 20 anos e vivem cerca de 150 anos.",
        size: "Small",
        size_description: "Halflings são pequenos e ágeis.",
        starting_proficiencies: [],
        languages: [],
        language_desc: "Comum e Halfling",
        traits: [],
        subraces: [],
        url: "/api/races/halfling",
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
        saving_throws: [
          { index: "str", name: "Força", url: "" },
          { index: "con", name: "Constituição", url: "" },
        ],
        starting_equipment: [],
        url: "/api/classes/fighter",
      },
      {
        index: "wizard",
        name: "Mago",
        hit_die: 6,
        proficiencies: [],
        proficiency_choices: [],
        saving_throws: [
          { index: "int", name: "Inteligência", url: "" },
          { index: "wis", name: "Sabedoria", url: "" },
        ],
        starting_equipment: [],
        spellcasting: {
          level: 1,
          spellcasting_ability: { index: "int", name: "Inteligência", url: "" },
        },
        url: "/api/classes/wizard",
      },
      {
        index: "rogue",
        name: "Ladino",
        hit_die: 8,
        proficiencies: [],
        proficiency_choices: [],
        saving_throws: [
          { index: "dex", name: "Destreza", url: "" },
          { index: "int", name: "Inteligência", url: "" },
        ],
        starting_equipment: [],
        url: "/api/classes/rogue",
      },
    ];
  }

  private getMockSpells(): DndSpell[] {
    return [
      {
        index: "magic-missile",
        name: "Míssil Mágico",
        level: 1,
        school: { index: "evocation", name: "Evocação", url: "" },
        casting_time: "1 ação",
        range: "120 pés",
        components: ["V", "S"],
        duration: "Instantâneo",
        damage: {
          damage_type: { index: "force", name: "Força", url: "" },
          damage_at_slot_level: {
            "1": "1d4 + 1",
            "2": "2d4 + 2",
            "3": "3d4 + 3",
          },
        },
        desc: ["Você cria três dardos brilhantes de força mágica."],
        url: "/api/spells/magic-missile",
      },
      {
        index: "fire-bolt",
        name: "Raio de Fogo",
        level: 0,
        school: { index: "evocation", name: "Evocação", url: "" },
        casting_time: "1 ação",
        range: "120 pés",
        components: ["V", "S"],
        duration: "Instantâneo",
        damage: {
          damage_type: { index: "fire", name: "Fogo", url: "" },
          damage_at_slot_level: {
            "0": "1d10",
          },
        },
        desc: ["Você arremessa uma mote de fogo em uma criatura ou objeto."],
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
      {
        index: "school-of-abjuration",
        name: "Escola de Abjuração",
        class: { index: "wizard", name: "Mago", url: "" },
        subclass_flavor: "Escola Arcana",
        desc: [
          "Especialistas em magias protetivas e de banimento.",
          "Mestres em defender a si mesmos e aliados."
        ],
        subclass_levels: [
          {
            level: 2,
            features: [
              { index: "abjuration-savant", name: "Especialista em Abjuração", url: "" },
              { index: "arcane-ward", name: "Proteção Arcana", url: "" }
            ]
          }
        ],
        url: "/api/subclasses/school-of-abjuration",
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
      {
        index: "battle-master",
        name: "Mestre de Batalha",
        class: { index: "fighter", name: "Guerreiro", url: "" },
        subclass_flavor: "Arquétipo Marcial",
        desc: [
          "Guerreiros táticos que usam manobras especiais em combate.",
          "Especialistas em controle de campo de batalha."
        ],
        subclass_levels: [
          {
            level: 3,
            features: [
              { index: "combat-superiority", name: "Superioridade em Combate", url: "" },
              { index: "maneuvers", name: "Manobras", url: "" }
            ]
          }
        ],
        url: "/api/subclasses/battle-master",
      },
      // Rogue subclasses
      {
        index: "thief",
        name: "Ladrão",
        class: { index: "rogue", name: "Ladino", url: "" },
        subclass_flavor: "Arquétipo de Ladino",
        desc: [
          "Especialistas em roubo, escalada e uso de objetos mágicos.",
          "Mestres em infiltração e agilidade."
        ],
        subclass_levels: [
          {
            level: 3,
            features: [
              { index: "fast-hands", name: "Mãos Rápidas", url: "" },
              { index: "second-story-work", name: "Especialista em Escalada", url: "" }
            ]
          }
        ],
        url: "/api/subclasses/thief",
      },
      {
        index: "assassin",
        name: "Assassino",
        class: { index: "rogue", name: "Ladino", url: "" },
        subclass_flavor: "Arquétipo de Ladino",
        desc: [
          "Mestres em eliminar alvos rapidamente e com discrição.",
          "Especialistas em ataques surpresa e venenos."
        ],
        subclass_levels: [
          {
            level: 3,
            features: [
              { index: "bonus-proficiencies", name: "Proficiências Extras", url: "" },
              { index: "assassinate", name: "Assassinar", url: "" }
            ]
          }
        ],
        url: "/api/subclasses/assassin",
      },
    ];

    // Filter by class if specified
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
      // Simulate async for consistency
      await new Promise((resolve) => setTimeout(resolve, 100));
      return [
        {
          index: "acolyte",
          name: "Acólito",
          starting_proficiencies: [],
          starting_equipment: [],
          feature: {
            name: "Abrigo dos Fiéis",
            desc: [
              "Você tem acesso a um templo onde pode encontrar abrigo e cuidados.",
            ],
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
                  string:
                    "Eu morreria para recuperar uma relíquia da minha fé.",
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
                  string:
                    "Eu julgo outros duramente, e a mim mesmo ainda mais.",
                },
              ],
            },
          },
          url: "/api/backgrounds/acolyte",
        },
        {
          index: "criminal",
          name: "Criminoso",
          starting_proficiencies: [],
          starting_equipment: [],
          feature: {
            name: "Contato Criminal",
            desc: [
              "Você tem um contato confiável e fidedigno que atua como seu ligação para uma rede de outros criminosos.",
            ],
          },
          personality_traits: {
            choose: 2,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu sempre tenho um plano para o que fazer quando as coisas dão errado.",
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
                  desc: "Liberdade. Correntes são feitas para serem quebradas.",
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
                  string: "Eu sou culpado de um crime terrível. Espero que eu possa me redimir por isso.",
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
                  string: "Quando vejo algo valioso, não consigo pensar em nada além de como roubá-lo.",
                },
              ],
            },
          },
          url: "/api/backgrounds/criminal",
        },
        {
          index: "folk-hero",
          name: "Herói do Povo",
          starting_proficiencies: [],
          starting_equipment: [],
          feature: {
            name: "Hospitalidade Rústica",
            desc: [
              "Como você vem das fileiras do povo comum, você se encaixa entre eles com facilidade.",
            ],
          },
          personality_traits: {
            choose: 2,
            from: {
              options: [
                {
                  option_type: "string",
                  string: "Eu julgo as pessoas por suas ações, não por suas palavras.",
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
                  desc: "Respeito. As pessoas merecem ser tratadas com dignidade e respeito.",
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
                  string: "Eu protejo aqueles que não podem se proteger.",
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
                  string: "A pessoa tirânica que governa minha terra natal não vai parar por nada para me ver morto.",
                },
              ],
            },
          },
          url: "/api/backgrounds/folk-hero",
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

  const totalSteps = steps.length;

  // ===========================
  // MEMOIZED COMPUTED VALUES
  // ===========================

  // Filtered races with search
  const filteredRaces = useMemo(() => {
    if (!debouncedRaceSearch) return racesData;
    return racesData.filter((race) =>
      race.name.toLowerCase().includes(debouncedRaceSearch.toLowerCase())
    );
  }, [racesData, debouncedRaceSearch]);

  // Filtered classes with search
  const filteredClasses = useMemo(() => {
    if (!debouncedClassSearch) return classesData;
    return classesData.filter((cls) =>
      cls.name.toLowerCase().includes(debouncedClassSearch.toLowerCase())
    );
  }, [classesData, debouncedClassSearch]);

  // Filtered spells with search
  const filteredSpells = useMemo(() => {
    if (!debouncedSpellSearch) return spellsData;
    return spellsData.filter((spell) =>
      spell.name.toLowerCase().includes(debouncedSpellSearch.toLowerCase())
    );
  }, [spellsData, debouncedSpellSearch]);

  // Available subraces for selected race
  const availableSubraces = useMemo(() => {
    if (!characterData.selectedRace || !characterData.selectedRace.subraces) {
      return [];
    }

    // For now, return mock subraces - in a real app, you'd fetch these from the API
    const raceIndex = characterData.selectedRace.index;
    
    if (raceIndex === "elf") {
      return [
        {
          index: "high-elf",
          name: "Alto Elfo",
          race: { index: "elf", name: "Elfo", url: "" },
          desc: "Altos elfos são os mais mágicos dos elfos, com uma afinidade natural com magias arcanas.",
          ability_bonuses: [
            { ability_score: { index: "int", name: "Inteligência", url: "" }, bonus: 1 }
          ],
          starting_proficiencies: [],
          languages: [],
          racial_traits: [],
          url: "/api/subraces/high-elf",
        },
        {
          index: "wood-elf",
          name: "Elfo da Floresta",
          race: { index: "elf", name: "Elfo", url: "" },
          desc: "Elfos da floresta são rápidos e furtivos, com uma conexão profunda com a natureza.",
          ability_bonuses: [
            { ability_score: { index: "wis", name: "Sabedoria", url: "" }, bonus: 1 }
          ],
          starting_proficiencies: [],
          languages: [],
          racial_traits: [],
          url: "/api/subraces/wood-elf",
        },
      ];
    }

    if (raceIndex === "dwarf") {
      return [
        {
          index: "hill-dwarf",
          name: "Anão da Colina",
          race: { index: "dwarf", name: "Anão", url: "" },
          desc: "Anões da colina são resistentes e práticos, com uma constituição robusta.",
          ability_bonuses: [
            { ability_score: { index: "wis", name: "Sabedoria", url: "" }, bonus: 1 }
          ],
          starting_proficiencies: [],
          languages: [],
          racial_traits: [],
          url: "/api/subraces/hill-dwarf",
        },
        {
          index: "mountain-dwarf",
          name: "Anão da Montanha",
          race: { index: "dwarf", name: "Anão", url: "" },
          desc: "Anões da montanha são guerreiros natos, treinados no uso de armaduras desde jovens.",
          ability_bonuses: [
            { ability_score: { index: "str", name: "Força", url: "" }, bonus: 2 }
          ],
          starting_proficiencies: [],
          languages: [],
          racial_traits: [],
          url: "/api/subraces/mountain-dwarf",
        },
      ];
    }

    return [];
  }, [characterData.selectedRace]);

  // Available subclasses for selected class
  const availableSubclasses = useMemo(() => {
    if (!characterData.selectedClass) {
      return [];
    }

    return subclassesData.filter(
      (subclass) => subclass.class.index === characterData.selectedClass?.index
    );
  }, [characterData.selectedClass, subclassesData]);

  // Combined ability bonuses from race and subrace
  const combinedAbilityBonuses = useMemo(() => {
    const bonuses: Array<{
      ability_score: DndApiReference;
      bonus: number;
    }> = [];

    // Add race bonuses
    if (characterData.selectedRace) {
      bonuses.push(...characterData.selectedRace.ability_bonuses);
    }

    // Add subrace bonuses
    if (characterData.selectedSubrace) {
      bonuses.push(...characterData.selectedSubrace.ability_bonuses);
    }

    return bonuses;
  }, [characterData.selectedRace, characterData.selectedSubrace]);

  // ===========================
  // UTILITY FUNCTIONS (MEMOIZED)
  // ===========================

  const getAbilityModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  const calculateAbilityScorePoints = useMemo(() => {
    return (scores: AbilityScores): number => {
      const pointCosts: Record<number, number> = {
        8: 0,
        9: 1,
        10: 2,
        11: 3,
        12: 4,
        13: 5,
        14: 7,
        15: 9,
      };

      return Object.values(scores).reduce((total, score) => {
        return total + (pointCosts[score] || 0);
      }, 0);
    };
  }, []);

  const generateRandomAbilityScores = useCallback((): AbilityScores => {
    const rollAbility = () => {
      const rolls = Array.from(
        { length: 4 },
        () => Math.floor(Math.random() * 6) + 1
      );
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    return {
      strength: rollAbility(),
      dexterity: rollAbility(),
      constitution: rollAbility(),
      intelligence: rollAbility(),
      wisdom: rollAbility(),
      charisma: rollAbility(),
    };
  }, []);

  // ===========================
  // VALIDATION (MEMOIZED)
  // ===========================

  const validateStep = useMemo(() => {
    return (stepIndex: number, data: CharacterCreationData): StepValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      switch (stepIndex) {
        case 0: // Basic Info
          if (!data.name.trim()) errors.push("Nome é obrigatório");
          if (!data.selectedRace) errors.push("Raça é obrigatória");
          if (!data.selectedClass) errors.push("Classe é obrigatória");
          if (!data.selectedBackground) errors.push("Background é obrigatório");
          
          // Check if race requires subrace
          if (data.selectedRace && data.selectedRace.subraces.length > 0 && !data.selectedSubrace) {
            errors.push("Subraça é obrigatória para esta raça");
          }

          // Check if class has subclasses and level is sufficient
          if (data.selectedClass && data.level >= 3) {
            // Most classes get subclasses at level 3
            const hasAvailableSubclasses = availableSubclasses.length > 0;
            if (hasAvailableSubclasses && !data.selectedSubclass) {
              warnings.push("Considere escolher uma subclasse para seu nível");
            }
          }
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
    };
  }, [calculateAbilityScorePoints, availableSubclasses]);

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
  // NAVIGATION (WITH CALLBACKS)
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
  // DATA MANAGEMENT (WITH CALLBACKS)
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
    getSubclassFeatures: (level?: number) => {
      if (!characterData.selectedSubclass) return [];
      
      const targetLevel = level || characterData.level;
      const features: DndApiReference[] = [];
      
      characterData.selectedSubclass.subclass_levels.forEach(levelData => {
        if (levelData.level <= targetLevel) {
          features.push(...levelData.features);
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