// ===========================
// OPTIMIZED CHARACTER CREATION HOOK - VERSÃO COMPLETA CORRIGIDA
// ===========================
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
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
  SKILLS,
} from "@/types/characterCreation";

// Importar API do D&D
import { dndAPI } from "@/api/dndAPI";

// ===========================
// QUERY CLIENT SETUP
// ===========================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

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
// REACT QUERY HOOKS
// ===========================

function useRacesQuery() {
  return useQuery({
    queryKey: ["dnd", "races"],
    queryFn: async () => {
      try {
        const races = await dndAPI.getRaces();
        console.log("✅ Raças carregadas da API oficial:", races.length);
        return races;
      } catch (error) {
        console.error("❌ Erro ao carregar raças da API:", error);
        console.log("🔄 Usando dados mock como fallback...");
        const { mockRaces } = await import("@/data/mockRaces");
        return mockRaces;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

function useSubracesQuery(enabled: boolean = true, raceIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "subraces", raceIndex],
    queryFn: async () => {
      try {
        if (raceIndex) {
          const subraces = await dndAPI.getSubracesByRace(raceIndex);
          console.log(`✅ Sub-raças da raça ${raceIndex} carregadas:`, subraces.length);
          return subraces;
        } else {
          const subraces = await dndAPI.getSubraces();
          console.log("✅ Todas as sub-raças carregadas:", subraces.length);
          return subraces;
        }
      } catch (error) {
        console.error("❌ Erro ao carregar sub-raças da API:", error);
        console.log("🔄 Usando dados mock de sub-raças como fallback...");
        const { mockSubraces } = await import("@/data/mockSubraces");
        if (raceIndex) {
          return mockSubraces.filter(subrace => subrace.race.index === raceIndex);
        }
        return mockSubraces;
      }
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

function useClassesQuery() {
  return useQuery({
    queryKey: ["dnd", "classes"],
    queryFn: async () => {
      try {
        const classes = await dndAPI.getClasses();
        console.log("✅ Classes carregadas da API oficial:", classes.length);
        return classes;
      } catch (error) {
        console.error("❌ Erro ao carregar classes da API:", error);
        console.log("🔄 Usando dados mock de classes como fallback...");
        const { mockClasses } = await import("@/data/mockClasses");
        return mockClasses;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

function useSubclassesQuery(enabled: boolean = true, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "subclasses", classIndex],
    queryFn: async () => {
      try {
        if (classIndex) {
          const subclasses = await dndAPI.getSubclassesByClass(classIndex);
          console.log(`✅ Subclasses da classe ${classIndex} carregadas:`, subclasses.length);
          return subclasses;
        } else {
          const subclasses = await dndAPI.getSubclasses();
          console.log("✅ Todas as subclasses carregadas:", subclasses.length);
          return subclasses;
        }
      } catch (error) {
        console.error("❌ Erro ao carregar subclasses da API:", error);
        console.log("🔄 Usando dados mock de subclasses como fallback...");
        const { mockSubclasses } = await import("@/data/mockSubClasses");
        if (classIndex) {
          return mockSubclasses.filter(subclass => subclass.class.index === classIndex);
        }
        return mockSubclasses;
      }
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

function useBackgroundsQuery() {
  return useQuery({
    queryKey: ["dnd", "backgrounds"],
    queryFn: async () => {
      try {
        const backgrounds = await dndAPI.getBackgrounds();
        console.log("✅ Backgrounds carregados da API oficial:", backgrounds.length);
        return backgrounds;
      } catch (error) {
        console.error("❌ Erro ao carregar backgrounds da API:", error);
        console.log("🔄 Usando dados mock de backgrounds como fallback...");
        const { mockBackgrounds } = await import("@/data/mockBackgrounds");
        return mockBackgrounds;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

function useSpellsQuery(enabled: boolean = true, level?: number, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "spells", level, classIndex],
    queryFn: async () => {
      try {
        if (classIndex) {
          const spells = await dndAPI.getSpellsByClass(classIndex);
          console.log(`✅ Magias da classe ${classIndex} carregadas:`, spells.length);
          if (level !== undefined) {
            return spells.filter(spell => spell.level === level);
          }
          return spells;
        } else if (level !== undefined) {
          const spells = await dndAPI.getSpellsByLevel(level);
          console.log(`✅ Magias de nível ${level} carregadas:`, spells.length);
          return spells;
        } else {
          const spells = await dndAPI.getAllSpells();
          console.log("✅ Todas as magias carregadas:", spells.length);
          return spells;
        }
      } catch (error) {
        console.error("❌ Erro ao carregar magias da API:", error);
        console.log("🔄 Usando dados mock de magias como fallback...");
        const { mockSpells } = await import("@/data/mockSpells");
        let spells = mockSpells;
        if (level !== undefined) {
          spells = spells.filter(spell => spell.level === level);
        }
        if (classIndex) {
          spells = spells.filter(spell => 
            spell.classes.some((cls: any) => cls.index === classIndex)
          );
        }
        return spells;
      }
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

// ===========================
// CONTEXT
// ===========================

const CharacterCreationContext = createContext<CharacterCreationContextType | null>(null);

// ===========================
// MAIN HOOK IMPLEMENTATION
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

  // ===========================
  // REACT QUERY HOOKS USAGE
  // ===========================

  const {
    data: racesData = [],
    isLoading: isLoadingRaces,
    error: racesError,
  } = useRacesQuery();

  const {
    data: subracesData = [],
    isLoading: isLoadingSubraces,
    error: subracesError,
  } = useSubracesQuery();

  const {
    data: classesData = [],
    isLoading: isLoadingClasses,
    error: classesError,
  } = useClassesQuery();

  const {
    data: subclassesData = [],
    isLoading: isLoadingSubclasses,
    error: subclassesError,
  } = useSubclassesQuery();

  const {
    data: backgroundsData = [],
    isLoading: isLoadingBackgrounds,
    error: backgroundsError,
  } = useBackgroundsQuery();

  const {
    data: spellsData = [],
    isLoading: isLoadingSpells,
    error: spellsError,
  } = useSpellsQuery();

  // ===========================
  // CHARACTER DATA MANAGEMENT
  // ===========================

  const updateCharacterData = useCallback((updates: Partial<CharacterCreationData>) => {
    setCharacterData(prev => ({ ...prev, ...updates }));
  }, []);

  // ===========================
  // CORE UTILITY FUNCTIONS
  // ===========================

  const getCombinedAbilityBonuses = useCallback(() => {
    const bonuses: Record<keyof AbilityScores, number> = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    };

    // Bônus da raça principal
    if (characterData.selectedRace?.ability_bonuses) {
      characterData.selectedRace.ability_bonuses.forEach(bonus => {
        const abilityKey = bonus.ability_score.index.toLowerCase() as keyof AbilityScores;
        if (abilityKey === 'str') bonuses.strength += bonus.bonus;
        else if (abilityKey === 'dex') bonuses.dexterity += bonus.bonus;
        else if (abilityKey === 'con') bonuses.constitution += bonus.bonus;
        else if (abilityKey === 'int') bonuses.intelligence += bonus.bonus;
        else if (abilityKey === 'wis') bonuses.wisdom += bonus.bonus;
        else if (abilityKey === 'cha') bonuses.charisma += bonus.bonus;
      });
    }

    // Bônus da sub-raça
    if (characterData.selectedSubrace?.ability_bonuses) {
      characterData.selectedSubrace.ability_bonuses.forEach(bonus => {
        const abilityKey = bonus.ability_score.index.toLowerCase() as keyof AbilityScores;
        if (abilityKey === 'str') bonuses.strength += bonus.bonus;
        else if (abilityKey === 'dex') bonuses.dexterity += bonus.bonus;
        else if (abilityKey === 'con') bonuses.constitution += bonus.bonus;
        else if (abilityKey === 'int') bonuses.intelligence += bonus.bonus;
        else if (abilityKey === 'wis') bonuses.wisdom += bonus.bonus;
        else if (abilityKey === 'cha') bonuses.charisma += bonus.bonus;
      });
    }

    return bonuses;
  }, [characterData.selectedRace, characterData.selectedSubrace]);

  const getAbilityModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  const calculateHitPoints = useCallback((): number => {
    if (!characterData.selectedClass) return 1;

    const hitDie = characterData.selectedClass.hit_die;
    const constitutionMod = getAbilityModifier(characterData.abilityScores.constitution);
    
    const baseHP = hitDie + constitutionMod;
    const additionalLevels = characterData.level - 1;
    const avgPerLevel = Math.floor(hitDie / 2) + 1 + constitutionMod;
    
    return Math.max(1, baseHP + (additionalLevels * avgPerLevel));
  }, [characterData.selectedClass, characterData.level, characterData.abilityScores.constitution, getAbilityModifier]);

  const calculateArmorClass = useCallback((): number => {
    const dexterityMod = getAbilityModifier(characterData.abilityScores.dexterity);
    return 10 + dexterityMod;
  }, [characterData.abilityScores.dexterity, getAbilityModifier]);

  const getSpellcastingAbility = useCallback((classIndex?: string): keyof AbilityScores | null => {
    const spellcastingAbilities: Record<string, keyof AbilityScores> = {
      'wizard': 'intelligence',
      'sorcerer': 'charisma',
      'warlock': 'charisma',
      'bard': 'charisma',
      'cleric': 'wisdom',
      'druid': 'wisdom',
      'paladin': 'charisma',
      'ranger': 'wisdom',
    };
    
    return classIndex ? spellcastingAbilities[classIndex] || null : null;
  }, []);

  // ===========================
  // SUBRACE/SUBCLASS FUNCTIONS
  // ===========================

  const getAvailableSubraces = useCallback((): DndSubrace[] => {
    if (!characterData.selectedRace) {
      return [];
    }
    return subracesData.filter(subrace => 
      subrace.race.index === characterData.selectedRace?.index
    );
  }, [characterData.selectedRace, subracesData]);

  const getAvailableSubclasses = useCallback((): DndSubclass[] => {
    if (!characterData.selectedClass) {
      return [];
    }
    return subclassesData.filter(subclass => 
      subclass.class.index === characterData.selectedClass?.index
    );
  }, [characterData.selectedClass, subclassesData]);

  const getSubraceAbilityBonuses = useCallback(() => {
    return characterData.selectedSubrace?.ability_bonuses || [];
  }, [characterData.selectedSubrace]);

  const getSubclassFeatures = useCallback((level?: number) => {
    if (!characterData.selectedSubclass) {
      return [];
    }
    
    if (!characterData.selectedSubclass.subclass_levels || 
        !Array.isArray(characterData.selectedSubclass.subclass_levels)) {
      console.warn('subclass_levels is not a valid array:', characterData.selectedSubclass.subclass_levels);
      return [];
    }
    
    const targetLevel = level || characterData.level;
    const features: DndApiReference[] = [];
    
    characterData.selectedSubclass.subclass_levels.forEach(levelData => {
      if (levelData && typeof levelData.level === 'number' && levelData.level <= targetLevel) {
        if (levelData.features && Array.isArray(levelData.features)) {
          features.push(...levelData.features);
        }
      }
    });
    
    return features;
  }, [characterData.selectedSubclass, characterData.level]);

  const needsSubclass = useCallback((): boolean => {
    if (!characterData.selectedClass) return false;
    
    const subclassLevels: Record<string, number> = {
      'cleric': 1,
      'sorcerer': 1,
      'warlock': 1,
      'wizard': 2,
      'druid': 2,
      'fighter': 3,
      'monk': 3,
      'paladin': 3,
      'ranger': 3,
      'rogue': 3,
      'barbarian': 3,
      'bard': 3,
    };
    
    const requiredLevel = subclassLevels[characterData.selectedClass.index] || 1;
    return characterData.level >= requiredLevel;
  }, [characterData.selectedClass, characterData.level]);

  const needsSubrace = useCallback((): boolean => {
    if (!characterData.selectedRace) return false;
    const alwaysNeedSubrace = ['elf', 'dwarf', 'halfling', 'gnome'];
    return alwaysNeedSubrace.includes(characterData.selectedRace.index);
  }, [characterData.selectedRace]);

  const getAvailableSkills = useCallback(() => {
    if (!characterData.selectedClass) return SKILLS;
    return SKILLS;
  }, [characterData.selectedClass]);

  const getSkillChoices = useCallback((): number => {
    if (!characterData.selectedClass) return 0;
    
    const skillChoicesByClass: Record<string, number> = {
      'barbarian': 2,
      'bard': 3,
      'cleric': 2,
      'druid': 2,
      'fighter': 2,
      'monk': 2,
      'paladin': 2,
      'ranger': 3,
      'rogue': 4,
      'sorcerer': 2,
      'warlock': 2,
      'wizard': 2,
    };
    
    return skillChoicesByClass[characterData.selectedClass.index] || 2;
  }, [characterData.selectedClass]);

  useEffect(() => {
    const availableChoices = getSkillChoices();
    if (availableChoices !== characterData.availableSkillChoices) {
      updateCharacterData({ 
        availableSkillChoices: availableChoices,
        selectedSkills: []
      });
    }
  }, [characterData.selectedClass, getSkillChoices, characterData.availableSkillChoices, updateCharacterData]);

  // ===========================
  // STEP VALIDATION
  // ===========================

  const validateStep = useCallback(
    (stepId: string): boolean => {
      switch (stepId) {
        case "basic-info":
          const hasBasicInfo = !!(
            characterData.name.trim() &&
            characterData.selectedRace &&
            characterData.selectedClass &&
            characterData.selectedBackground
          );

          if (!hasBasicInfo) return false;

          const hasValidLevel = characterData.level >= 1 && characterData.level <= 20;
          if (!hasValidLevel) return false;

          const raceNeedsSubrace = characterData.selectedRace && 
            ['elf', 'dwarf', 'halfling', 'gnome'].includes(characterData.selectedRace.index);
          
          if (raceNeedsSubrace && !characterData.selectedSubrace) {
            return false;
          }

          if (characterData.selectedClass) {
            const subclassLevels: Record<string, number> = {
              'cleric': 1,
              'sorcerer': 1,
              'warlock': 1,
              'wizard': 2,
              'druid': 2,
              'fighter': 3,
              'monk': 3,
              'paladin': 3,
              'ranger': 3,
              'rogue': 3,
              'barbarian': 3,
              'bard': 3,
            };
            
            const requiredSubclassLevel = subclassLevels[characterData.selectedClass.index] || 1;
            const needsSubclass = characterData.level >= requiredSubclassLevel;
            
            if (needsSubclass && !characterData.selectedSubclass) {
              return false;
            }
          }

          return true;
          
        case "ability-scores":
          const scores = Object.values(characterData.abilityScores);
          return scores.every(score => score >= 8 && score <= 15);
          
        case "skills":
          return characterData.selectedSkills.length >= characterData.availableSkillChoices;
          
        case "equipment":
          return characterData.hitPoints > 0;
          
        case "spells":
          return !characterData.isSpellcaster || characterData.selectedSpells.length > 0;
          
        case "personality":
          return (
            characterData.personalityTraits.length > 0 &&
            characterData.ideals.length > 0
          );
          
        default:
          return false;
      }
    },
    [characterData]
  );

  const validateCurrentStep = useCallback((): boolean => {
    const currentStepData = steps[currentStep];
    return currentStepData ? validateStep(currentStepData.id) : false;
  }, [currentStep, steps, validateStep]);

  const canProceed = useCallback((): boolean => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  const resetCharacter = useCallback(() => {
    setCharacterData(initialCharacterData);
    setCurrentStep(0);
  }, []);

  const createCharacter = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Criando personagem:", characterData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("✅ Personagem criado com sucesso!");
      
    } catch (error) {
      console.error("❌ Erro ao criar personagem:", error);
      setError(error instanceof Error ? error.message : "Erro ao criar personagem");
    } finally {
      setLoading(false);
    }
  }, [characterData]);

  // ===========================
  // STEP NAVIGATION
  // ===========================

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  }, [steps.length]);

  // ===========================
  // UPDATE STEP VALIDATION STATUS
  // ===========================

  useEffect(() => {
    setSteps(prev =>
      prev.map(step => ({
        ...step,
        isValid: validateStep(step.id),
        isCompleted: validateStep(step.id),
      }))
    );
  }, [characterData, validateStep]);

  // ===========================
  // ERROR HANDLING
  // ===========================

  useEffect(() => {
    const errors = [];
    
    if (racesError) {
      console.warn("Aviso: Erro ao carregar raças da API, usando fallback:", racesError);
      errors.push("raças");
    }
    
    if (classesError) {
      console.warn("Aviso: Erro ao carregar classes da API, usando fallback:", classesError);
      errors.push("classes");
    }
    
    if (backgroundsError) {
      console.warn("Aviso: Erro ao carregar backgrounds da API, usando fallback:", backgroundsError);
      errors.push("backgrounds");
    }
    
    if (spellsError) {
      console.warn("Aviso: Erro ao carregar magias da API, usando fallback:", spellsError);
      errors.push("magias");
    }

    if (subracesError) {
      console.warn("Aviso: Erro ao carregar sub-raças da API, usando fallback:", subracesError);
      errors.push("sub-raças");
    }

    if (subclassesError) {
      console.warn("Aviso: Erro ao carregar subclasses da API, usando fallback:", subclassesError);
      errors.push("subclasses");
    }
    
    if (errors.length > 0) {
      setError(`Alguns dados foram carregados do cache: ${errors.join(", ")}`);
    } else {
      setError(null);
    }
  }, [racesError, classesError, backgroundsError, spellsError, subracesError, subclassesError]);

  // ===========================
  // SPELL INFO CALCULATIONS
  // ===========================

  const spellInfo = useMemo(() => {
    if (!characterData.selectedClass || !characterData.isSpellcaster) {
      return {
        maxSpellLevel: 0,
        startingCantrips: 0,
        startingSpells: 0,
        availableCantrips: [],
        availableLevelSpells: [],
      };
    }

    const spellcastingClasses: Record<string, { cantrips: number; spells: number; maxLevel: number }> = {
      'wizard': { cantrips: 3, spells: 6, maxLevel: 1 },
      'sorcerer': { cantrips: 4, spells: 2, maxLevel: 1 },
      'cleric': { cantrips: 3, spells: 2, maxLevel: 1 },
      'bard': { cantrips: 2, spells: 4, maxLevel: 1 },
      'druid': { cantrips: 2, spells: 2, maxLevel: 1 },
      'warlock': { cantrips: 2, spells: 2, maxLevel: 1 },
    };

    const classInfo = spellcastingClasses[characterData.selectedClass.index];
    if (!classInfo) {
      return {
        maxSpellLevel: 0,
        startingCantrips: 0,
        startingSpells: 0,
        availableCantrips: [],
        availableLevelSpells: [],
      };
    }

    const availableCantrips = spellsData.filter(spell => 
      spell.level === 0 && 
      spell.classes.some(cls => cls.index === characterData.selectedClass?.index)
    );

    const availableLevelSpells = spellsData.filter(spell => 
      spell.level > 0 && 
      spell.level <= classInfo.maxLevel &&
      spell.classes.some(cls => cls.index === characterData.selectedClass?.index)
    );

    return {
      maxSpellLevel: classInfo.maxLevel,
      startingCantrips: classInfo.cantrips,
      startingSpells: classInfo.spells,
      availableCantrips,
      availableLevelSpells,
    };
  }, [characterData.selectedClass, characterData.isSpellcaster, spellsData]);

  // ===========================
  // CONTEXT VALUE - COMPLETO
  // ===========================

  return {
    // Step Management
    currentStep,
    steps,
    nextStep,
    prevStep,
    goToStep,

    // Character Data
    characterData,
    updateCharacterData,

    // Loading States
    loading,
    error,

    // D&D Data
    races: racesData,
    classes: classesData,
    backgrounds: backgroundsData,
    spells: spellsData,
    subclasses: subclassesData,
    subraces: subracesData,

    // Individual Loading States
    isLoadingRaces,
    isLoadingClasses,
    isLoadingBackgrounds,
    isLoadingSpells,
    isLoadingSubclasses,
    isLoadingSubraces,

    // Search Functionality
    raceSearch: debouncedRaceSearch,
    setRaceSearch: setRaceSearchTerm,
    classSearch: debouncedClassSearch,
    setClassSearch: setClassSearchTerm,
    spellSearch: debouncedSpellSearch,
    setSpellSearch: setSpellSearchTerm,

    // Validation
    validateStep,
    isStepValid: validateStep,
    validateCurrentStep,
    canProceed,

    // Utility Functions
    getCombinedAbilityBonuses,
    getAbilityModifier,
    calculateHitPoints,
    calculateArmorClass,
    getSpellcastingAbility,
    getProficiencyBonus: (level: number) => Math.ceil(level / 4) + 1,
    getSkillModifier: (skill: string, scores: AbilityScores, isProficient = false) => {
      const skillInfo = SKILLS.find(s => s.key === skill);
      if (!skillInfo) return 0;
      
      const abilityScore = scores[skillInfo.ability];
      const abilityMod = getAbilityModifier(abilityScore);
      const profBonus = isProficient ? Math.ceil(characterData.level / 4) + 1 : 0;
      
      return abilityMod + profBonus;
    },

    // Subrace/Subclass Functions
    getAvailableSubraces,
    getAvailableSubclasses,
    getSubraceAbilityBonuses,
    getSubclassFeatures,
    needsSubclass,
    needsSubrace,
    getAvailableSkills,
    getSkillChoices,

    // Actions
    resetCharacter,
    createCharacter,

    // Additional Utility Functions
    getSpellSaveDC: (spellcastingMod: number, proficiencyBonus: number) => 8 + spellcastingMod + proficiencyBonus,
    getSpellAttackBonus: (spellcastingMod: number, proficiencyBonus: number) => spellcastingMod + proficiencyBonus,
    getCarryingCapacity: (strength: number) => strength * 15,
    getInitiativeModifier: (dexModifier: number) => dexModifier,
    generateRandomAbilityScores: () => {
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
    },
    calculateAbilityScorePoints: (scores: AbilityScores) => {
      const pointCosts: Record<number, number> = {
        8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
      };
      
      return Object.values(scores).reduce((total, score) => {
        return total + (pointCosts[score] || 0);
      }, 0);
    },

    // Spell Info
    spellInfo,
    maxSpellLevel: spellInfo.maxSpellLevel,
    startingCantrips: spellInfo.startingCantrips,
    startingSpells: spellInfo.startingSpells,
    spellsError,
  };
};

// ===========================
// PROVIDER COMPONENT
// ===========================

const CharacterCreationInternalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const contextValue = useCharacterCreation();

  return (
    <CharacterCreationContext.Provider value={contextValue}>
      {children}
    </CharacterCreationContext.Provider>
  );
};

export const CharacterCreationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <CharacterCreationInternalProvider>
        {children}
      </CharacterCreationInternalProvider>
    </QueryClientProvider>
  );
};

// ===========================
// CONTEXT HOOK
// ===========================

export const useCharacterCreationContext = (): CharacterCreationContextType => {
  const context = useContext(CharacterCreationContext);
  if (!context) {
    throw new Error(
      "useCharacterCreationContext must be used within a CharacterCreationProvider"
    );
  }
  return context;
};

// Export individual hooks for flexibility
export {
  useRacesQuery,
  useSubracesQuery,
  useClassesQuery,
  useBackgroundsQuery,
  useSpellsQuery,
  useSubclassesQuery,
};