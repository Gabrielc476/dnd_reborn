// ===========================
// OPTIMIZED CHARACTER CREATION HOOK
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
  DndClass,
  DndBackground,
  DndSpell,
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

  // Mock data methods (same as before)
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
      // ... other mock races
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
      // ... other mock classes
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
      // ... other mock spells
    ];
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
        // ... other backgrounds
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
  selectedClass: null,
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
  }, [calculateAbilityScorePoints]);

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

    // Loading states
    isLoadingRaces: racesLoading,
    isLoadingClasses: classesLoading,
    isLoadingSpells: spellsLoading,
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
