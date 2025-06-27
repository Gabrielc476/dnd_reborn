// ===========================
// OPTIMIZED CHARACTER CREATION HOOK - VERSÃO COM API REAL D&D
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

// Importar dados mock como fallback apenas se necessário (agora só para casos específicos)
// Os imports automáticos dentro das queries carregam os mocks quando necessário

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
// REACT QUERY HOOKS - COM API REAL
// ===========================

/**
 * Hook para buscar raças da API oficial do D&D
 */
function useRacesQuery() {
  return useQuery({
    queryKey: ["dnd", "races"],
    queryFn: async () => {
      try {
        // Tentar buscar da API oficial
        const races = await dndAPI.getRaces();
        console.log("✅ Raças carregadas da API oficial:", races.length);
        return races;
      } catch (error) {
        console.error("❌ Erro ao carregar raças da API:", error);
        
        // Em caso de erro, usar dados mock como fallback
        console.log("🔄 Usando dados mock como fallback...");
        const { mockRaces } = await import("@/data/mockRaces");
        return mockRaces;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (dados das raças não mudam frequentemente)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook para buscar sub-raças da API oficial do D&D
 */
function useSubracesQuery(enabled: boolean = true, raceIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "subraces", raceIndex],
    queryFn: async () => {
      try {
        if (raceIndex) {
          // Buscar sub-raças de uma raça específica
          const subraces = await dndAPI.getSubracesByRace(raceIndex);
          console.log(`✅ Sub-raças da raça ${raceIndex} carregadas:`, subraces.length);
          return subraces;
        } else {
          // Buscar todas as sub-raças
          const subraces = await dndAPI.getSubraces();
          console.log("✅ Todas as sub-raças carregadas:", subraces.length);
          return subraces;
        }
      } catch (error) {
        console.error("❌ Erro ao carregar sub-raças da API:", error);
        
        // Em caso de erro, usar dados mock como fallback
        console.log("🔄 Usando dados mock de sub-raças como fallback...");
        const { mockSubraces } = await import("@/data/mockSubRaces");
        
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

/**
 * Hook para buscar classes da API oficial do D&D
 */
function useClassesQuery() {
  return useQuery({
    queryKey: ["dnd", "classes"],
    queryFn: async () => {
      try {
        // Tentar buscar da API oficial
        const classes = await dndAPI.getClasses();
        console.log("✅ Classes carregadas da API oficial:", classes.length);
        return classes;
      } catch (error) {
        console.error("❌ Erro ao carregar classes da API:", error);
        
        // Em caso de erro, usar dados mock como fallback
        console.log("🔄 Usando dados mock de classes como fallback...");
        const { mockClasses } = await import("@/data/mockClasses");
        return mockClasses;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (dados das classes não mudam frequentemente)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook para buscar subclasses da API oficial do D&D
 */
function useSubclassesQuery(enabled: boolean = true, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "subclasses", classIndex],
    queryFn: async () => {
      try {
        if (classIndex) {
          // Buscar subclasses de uma classe específica
          const subclasses = await dndAPI.getSubclassesByClass(classIndex);
          console.log(`✅ Subclasses da classe ${classIndex} carregadas:`, subclasses.length);
          return subclasses;
        } else {
          // Buscar todas as subclasses
          const subclasses = await dndAPI.getSubclasses();
          console.log("✅ Todas as subclasses carregadas:", subclasses.length);
          return subclasses;
        }
      } catch (error) {
        console.error("❌ Erro ao carregar subclasses da API:", error);
        
        // Em caso de erro, usar dados mock como fallback
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

/**
 * Hook para buscar backgrounds da API oficial do D&D
 */
function useBackgroundsQuery() {
  return useQuery({
    queryKey: ["dnd", "backgrounds"],
    queryFn: async () => {
      try {
        // Tentar buscar da API oficial
        const backgrounds = await dndAPI.getBackgrounds();
        console.log("✅ Backgrounds carregados da API oficial:", backgrounds.length);
        return backgrounds;
      } catch (error) {
        console.error("❌ Erro ao carregar backgrounds da API:", error);
        
        // Em caso de erro, usar dados mock como fallback
        console.log("🔄 Usando dados mock de backgrounds como fallback...");
        const { mockBackgrounds } = await import("@/data/mockBackgrounds");
        return mockBackgrounds;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook para buscar magias da API oficial do D&D
 */
function useSpellsQuery(enabled: boolean = true, level?: number, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "spells", level, classIndex],
    queryFn: async () => {
      try {
        if (classIndex) {
          // Buscar magias de uma classe específica
          const spells = await dndAPI.getSpellsByClass(classIndex);
          console.log(`✅ Magias da classe ${classIndex} carregadas:`, spells.length);
          
          // Filtrar por nível se especificado
          if (level !== undefined) {
            return spells.filter(spell => spell.level === level);
          }
          return spells;
        } else if (level !== undefined) {
          // Buscar magias de um nível específico
          const spells = await dndAPI.getSpellsByLevel(level);
          console.log(`✅ Magias de nível ${level} carregadas:`, spells.length);
          return spells;
        } else {
          // Buscar todas as magias (cuidado: pode ser muitas!)
          const spells = await dndAPI.getSpells();
          console.log("✅ Todas as magias carregadas:", spells.length);
          return spells;
        }
      } catch (error) {
        console.error("❌ Erro ao carregar magias da API:", error);
        
        // Em caso de erro, usar dados mock como fallback
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
    // Para spells, usar cache mais longo pois são muitos dados
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

  // Data queries with React Query - AGORA COM API REAL PARA RAÇAS, CLASSES, BACKGROUNDS E MAGIAS
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

  const {
    data: backgroundsData = [],
    isLoading: backgroundsLoading,
    error: backgroundsError,
  } = useBackgroundsQuery();

  const {
    data: spellsData = [],
    isLoading: spellsLoading,
    error: spellsError,
  } = useSpellsQuery(
    characterData.isSpellcaster,
    undefined,
    characterData.selectedClass?.index
  );

  const {
    data: subclassesData = [],
    isLoading: subclassesLoading,
    error: subclassesError,
  } = useSubclassesQuery(
    true,
    characterData.selectedClass?.index
  );

  // BUSCAR SUB-RAÇAS DA API REAL
  const { data: subracesData = [], isLoading: subracesLoading } = useSubracesQuery(
    !!characterData.selectedRace,
    characterData.selectedRace?.index
  );

  // ===========================
  // FILTERED DATA WITH SEARCH
  // ===========================

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

  // ===========================
  // CHARACTER DATA UPDATES
  // ===========================

  const updateCharacterData = useCallback(
    (updates: Partial<CharacterCreationData>) => {
      setCharacterData(prev => ({ ...prev, ...updates }));
    },
    []
  );

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================

  /**
   * Calcula bônus combinados de habilidade (raça + sub-raça)
   */
  const getCombinedAbilityBonuses = useCallback(() => {
    const bonuses: Record<string, number> = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    };

    // Adicionar bônus da raça
    if (characterData.selectedRace?.ability_bonuses) {
      characterData.selectedRace.ability_bonuses.forEach(bonus => {
        const abilityKey = bonus.ability_score.index;
        const mappedKey = mapAbilityIndex(abilityKey);
        if (mappedKey && bonuses.hasOwnProperty(mappedKey)) {
          bonuses[mappedKey] += bonus.bonus;
        }
      });
    }

    // Adicionar bônus da sub-raça
    if (characterData.selectedSubrace?.ability_bonuses) {
      characterData.selectedSubrace.ability_bonuses.forEach(bonus => {
        const abilityKey = bonus.ability_score.index;
        const mappedKey = mapAbilityIndex(abilityKey);
        if (mappedKey && bonuses.hasOwnProperty(mappedKey)) {
          bonuses[mappedKey] += bonus.bonus;
        }
      });
    }

    return bonuses;
  }, [characterData.selectedRace, characterData.selectedSubrace]);

  /**
   * Mapeia índices de habilidade da API para as chaves usadas internamente
   */
  const mapAbilityIndex = (apiIndex: string): keyof AbilityScores | null => {
    const mapping: Record<string, keyof AbilityScores> = {
      'str': 'strength',
      'dex': 'dexterity', 
      'con': 'constitution',
      'int': 'intelligence',
      'wis': 'wisdom',
      'cha': 'charisma',
    };
    return mapping[apiIndex] || null;
  };

  /**
   * Calcula modificador de habilidade
   */
  const getAbilityModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  /**
   * Calcula pontos de vida baseados na classe e constituição
   */
  const calculateHitPoints = useCallback(() => {
    if (!characterData.selectedClass) return 0;
    
    const baseHP = characterData.selectedClass.hit_die;
    const conModifier = getAbilityModifier(characterData.abilityScores.constitution);
    const combinedBonuses = getCombinedAbilityBonuses();
    const totalCon = characterData.abilityScores.constitution + (combinedBonuses.constitution || 0);
    const finalConModifier = getAbilityModifier(totalCon);
    
    return Math.max(1, baseHP + finalConModifier);
  }, [characterData.selectedClass, characterData.abilityScores.constitution, getCombinedAbilityBonuses, getAbilityModifier]);

  /**
   * Calcula classe de armadura baseada na destreza
   */
  const calculateArmorClass = useCallback(() => {
    const combinedBonuses = getCombinedAbilityBonuses();
    const totalDex = characterData.abilityScores.dexterity + (combinedBonuses.dexterity || 0);
    const dexModifier = getAbilityModifier(totalDex);
    
    return 10 + dexModifier;
  }, [characterData.abilityScores.dexterity, getCombinedAbilityBonuses, getAbilityModifier]);

  /**
   * Atualiza HP e CA automaticamente quando relevante
   */
  useEffect(() => {
    const newHitPoints = calculateHitPoints();
    const newArmorClass = calculateArmorClass();
    
    if (newHitPoints !== characterData.hitPoints || newArmorClass !== characterData.armorClass) {
      updateCharacterData({
        hitPoints: newHitPoints,
        armorClass: newArmorClass,
      });
    }
  }, [
    characterData.selectedClass,
    characterData.abilityScores,
    characterData.selectedRace,
    characterData.selectedSubrace,
    calculateHitPoints,
    calculateArmorClass,
  ]);

  /**
   * Reseta sub-raça quando raça muda
   */
  useEffect(() => {
    if (characterData.selectedRace && characterData.selectedSubrace) {
      // Verificar se a sub-raça ainda é válida para a raça selecionada
      const isSubraceValid = subracesData.some(
        subrace => subrace.index === characterData.selectedSubrace?.index
      );
      
      if (!isSubraceValid) {
        updateCharacterData({ selectedSubrace: null });
      }
    }
  }, [characterData.selectedRace, characterData.selectedSubrace, subracesData, updateCharacterData]);

  /**
   * Atualiza se é conjurador baseado na classe selecionada
   */
  useEffect(() => {
    const spellcastingClasses = ['wizard', 'sorcerer', 'cleric', 'bard', 'druid', 'warlock', 'paladin', 'ranger'];
    const isSpellcaster = characterData.selectedClass ? 
      spellcastingClasses.includes(characterData.selectedClass.index) : false;
    
    if (isSpellcaster !== characterData.isSpellcaster) {
      updateCharacterData({ 
        isSpellcaster,
        spellcastingAbility: isSpellcaster ? getSpellcastingAbility(characterData.selectedClass?.index) : null
      });
    }
  }, [characterData.selectedClass, characterData.isSpellcaster, updateCharacterData]);

  /**
   * Determina a habilidade de conjuração baseada na classe
   */
  const getSpellcastingAbility = (classIndex?: string): keyof AbilityScores | null => {
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
  };

  // ===========================
  // ADDITIONAL UTILITY FUNCTIONS
  // ===========================

  /**
   * Retorna sub-raças disponíveis para a raça selecionada
   */
  const getAvailableSubraces = useCallback((): DndSubrace[] => {
    if (!characterData.selectedRace) {
      return [];
    }
    
    return subracesData.filter(subrace => 
      subrace.race.index === characterData.selectedRace?.index
    );
  }, [characterData.selectedRace, subracesData]);

  /**
   * Retorna subclasses disponíveis para a classe selecionada
   */
  const getAvailableSubclasses = useCallback((): DndSubclass[] => {
    if (!characterData.selectedClass) {
      return [];
    }
    
    return subclassesData.filter(subclass => 
      subclass.class.index === characterData.selectedClass?.index
    );
  }, [characterData.selectedClass, subclassesData]);

  /**
   * Retorna bônus de habilidade da sub-raça selecionada
   */
  const getSubraceAbilityBonuses = useCallback(() => {
    return characterData.selectedSubrace?.ability_bonuses || [];
  }, [characterData.selectedSubrace]);

  /**
   * Retorna features de subclasse para um nível específico
   */
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

  /**
   * Verifica se uma classe precisa escolher subclasse no nível atual
   */
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

  /**
   * Verifica se uma raça precisa escolher sub-raça
   */
  const needsSubrace = useCallback((): boolean => {
    if (!characterData.selectedRace) return false;
    
    // Raças que sempre precisam de sub-raça
    const alwaysNeedSubrace = ['elf', 'dwarf', 'halfling', 'gnome'];
    return alwaysNeedSubrace.includes(characterData.selectedRace.index);
  }, [characterData.selectedRace]);

  /**
   * Retorna skills disponíveis baseado na classe selecionada
   */
  const getAvailableSkills = useCallback(() => {
    if (!characterData.selectedClass) return SKILLS;
    
    // Por enquanto retorna todas as skills
    // TODO: Filtrar baseado nas proficiency_choices da classe
    return SKILLS;
  }, [characterData.selectedClass]);

  /**
   * Calcula número de skills que podem ser escolhidas
   */
  const getSkillChoices = useCallback((): number => {
    if (!characterData.selectedClass) return 0;
    
    // Número padrão baseado na classe (pode ser refinado com dados da API)
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

  /**
   * Atualiza automaticamente o número de skill choices quando classe muda
   */
  useEffect(() => {
    const availableChoices = getSkillChoices();
    if (availableChoices !== characterData.availableSkillChoices) {
      updateCharacterData({ 
        availableSkillChoices: availableChoices,
        selectedSkills: [] // Reset skills quando classe muda
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
          return !!(
            characterData.name.trim() &&
            characterData.selectedRace &&
            characterData.selectedClass &&
            characterData.selectedBackground
          );
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

  /**
   * Valida o step atual
   */
  const validateCurrentStep = useCallback((): boolean => {
    const currentStepData = steps[currentStep];
    return currentStepData ? validateStep(currentStepData.id) : false;
  }, [currentStep, steps, validateStep]);

  /**
   * Verifica se pode prosseguir para o próximo step
   */
  const canProceed = useCallback((): boolean => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  /**
   * Reseta o personagem para valores iniciais
   */
  const resetCharacter = useCallback(() => {
    setCharacterData(initialCharacterData);
    setCurrentStep(0);
  }, []);

  /**
   * Cria o personagem (placeholder para integração com API)
   */
  const createCharacter = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implementar criação via API
      console.log("Criando personagem:", characterData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Por enquanto, apenas log do sucesso
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
    
    if (subclassesError) {
      console.warn("Aviso: Erro ao carregar subclasses da API, usando fallback:", subclassesError);
      errors.push("subclasses");
    }
    
    if (errors.length > 0) {
      setError(`Algumas funcionalidades podem estar limitadas devido a problemas de conectividade (${errors.join(", ")}).`);
    } else {
      setError(null);
    }
  }, [racesError, classesError, backgroundsError, spellsError, subclassesError]);

  // ===========================
  // RETURN CONTEXT VALUE
  // ===========================

  return {
    // Step management
    currentStep,
    steps,
    nextStep,
    prevStep,
    goToStep,

    // Character data
    characterData,
    updateCharacterData,

    // Loading states
    loading: loading || racesLoading || classesLoading || backgroundsLoading || spellsLoading,
    error,

    // Data
    races: filteredRaces,
    classes: filteredClasses,
    backgrounds: backgroundsData,
    spells: filteredSpells,
    subclasses: subclassesData,
    subraces: subracesData, // VEM DA API REAL

    // Loading states for individual data types
    isLoadingRaces: racesLoading,
    isLoadingClasses: classesLoading,
    isLoadingBackgrounds: backgroundsLoading,
    isLoadingSpells: spellsLoading,
    isLoadingSubclasses: subclassesLoading,
    isLoadingSubraces: subracesLoading,

    // Search functionality
    raceSearch: raceSearchTerm,
    setRaceSearch: setRaceSearchTerm,
    classSearch: classSearchTerm,
    setClassSearch: setClassSearchTerm,
    spellSearch: spellSearchTerm,
    setSpellSearch: setSpellSearchTerm,

    // Validation
    validateStep,
    isStepValid: (stepId: string) => validateStep(stepId),
    validateCurrentStep, // FUNÇÃO QUE ESTAVA FALTANDO
    canProceed, // FUNÇÃO QUE ESTAVA FALTANDO

    // Actions
    resetCharacter, // NOVA FUNÇÃO
    createCharacter, // NOVA FUNÇÃO

    // Utility functions
    getCombinedAbilityBonuses,
    getAbilityModifier,
    calculateHitPoints,
    calculateArmorClass,
    getSpellcastingAbility,

    // ===========================
    // NOVAS FUNÇÕES PARA SUBRACES E SUBCLASSES
    // ===========================
    
    /**
     * Retorna sub-raças disponíveis para a raça selecionada
     */
    getAvailableSubraces, // ✅ FUNÇÃO QUE ESTAVA FALTANDO

    /**
     * Retorna subclasses disponíveis para a classe selecionada
     */
    getAvailableSubclasses, // ✅ FUNÇÃO QUE ESTAVA FALTANDO

    /**
     * Retorna bônus de habilidade da sub-raça selecionada
     */
    getSubraceAbilityBonuses, // ✅ NOVA FUNÇÃO

    /**
     * Retorna features de subclasse para um nível específico
     */
    getSubclassFeatures, // ✅ NOVA FUNÇÃO

    /**
     * Verifica se precisa escolher subclasse
     */
    needsSubclass, // ✅ NOVA FUNÇÃO

    /**
     * Verifica se precisa escolher sub-raça
     */
    needsSubrace, // ✅ NOVA FUNÇÃO

    /**
     * Retorna skills disponíveis
     */
    getAvailableSkills, // ✅ NOVA FUNÇÃO

    /**
     * Calcula número de skill choices
     */
    getSkillChoices, // ✅ NOVA FUNÇÃO

    // Additional utility functions
    getProficiencyBonus: (level: number) => Math.ceil(level / 4) + 1,
    getSkillModifier: (skill: string, scores: AbilityScores, isProficient = false) => {
      const skillInfo = SKILLS.find(s => s.key === skill);
      if (!skillInfo) return 0;
      
      const abilityScore = scores[skillInfo.ability];
      const abilityMod = getAbilityModifier(abilityScore);
      const profBonus = isProficient ? Math.ceil(characterData.level / 4) + 1 : 0;
      
      return abilityMod + profBonus;
    },
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
  };
};

// ===========================
// PROVIDER COMPONENT
// ===========================

// Componente interno que usa React Query
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

// Componente principal que configura React Query primeiro
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