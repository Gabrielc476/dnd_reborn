// ===========================
// OPTIMIZED CHARACTER CREATION HOOK - VERSÃO COMPLETA CORRIGIDA
// src/hooks/useCharacterCreation.tsx
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
  experience: 0,
  alignment: "",
  abilityMethod: "point-buy",
  abilityScores: {
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  },
  pointsRemaining: 27,
  selectedSkills: [],
  availableSkillChoices: 0,
  proficiencies: [],
  languages: [],
  selectedEquipment: [],
  hitPoints: 0,
  armorClass: 10,
  selectedSpells: [],
  isSpellcaster: false,
  spellcastingAbility: null,
  knownSpells: 0,
  spellSlots: {},
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
  backstory: "",
  notes: "",
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
    title: "Personalidade",
    description: "Traços, ideais, vínculos e defeitos",
    isCompleted: false,
    isValid: false,
  },
];

// ===========================
// INDIVIDUAL QUERY HOOKS
// ===========================

function useRacesQuery() {
  return useQuery({
    queryKey: ["dnd", "races"],
    queryFn: async () => {
      try {
        const races = await dndAPI.getRaces();
        console.log("🌐 ===== RAÇAS CARREGADAS (API + DADOS LOCAIS) =====");
        console.log(`📊 Total: ${races.length} raças`);
        return races;
      } catch (error) {
        console.error("❌ Erro ao carregar raças da API:", error);
        const { mockRaces } = await import("@/data/mockRaces");
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        console.log(`📊 Total: ${mockRaces.length} raças dos dados locais`);
        return mockRaces;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

function useSubracesQuery(enabled: boolean = true, raceIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "subraces", raceIndex],
    queryFn: async () => {
      try {
        const subraces = await dndAPI.getSubraces();
        console.log("🌐 ===== SUB-RAÇAS CARREGADAS (API + DADOS LOCAIS) =====");
        console.log(`📊 Total: ${subraces.length} sub-raças`);
        return subraces;
      } catch (error) {
        console.error("❌ Erro ao carregar sub-raças da API:", error);
        const { mockSubraces } = await import("@/data/mockSubRaces");
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        console.log(`📊 Total: ${mockSubraces.length} sub-raças dos dados locais`);
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
        console.log("🌐 ===== CLASSES CARREGADAS (API + DADOS LOCAIS) =====");
        console.log(`📊 Total: ${classes.length} classes`);
        return classes;
      } catch (error) {
        console.error("❌ Erro ao carregar classes da API:", error);
        const { mockClasses } = await import("@/data/mockClasses");
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        console.log(`📊 Total: ${mockClasses.length} classes dos dados locais`);
        return mockClasses;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

function useSubclassesQuery(enabled: boolean = true, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "subclasses", classIndex],
    queryFn: async () => {
      try {
        if (classIndex) {
          // Usar o método específico para classe se existir
          const classSubclasses = await dndAPI.getSubclassesByClass(classIndex);
          console.log("🌐 ===== SUBCLASSES CARREGADAS DA API =====");
          console.log(`📊 Total: ${classSubclasses.length} subclasses para ${classIndex}`);
          return classSubclasses;
        }
        
        // Buscar todas as subclasses se não há classe específica
        const allSubclasses = await dndAPI.getSubclasses();
        console.log("🌐 ===== TODAS SUBCLASSES CARREGADAS DA API =====");
        console.log(`📊 Total: ${allSubclasses.length} subclasses`);
        return allSubclasses;
      } catch (error) {
        console.error("❌ Erro ao carregar subclasses da API:", error);
        const { mockSubclasses } = await import("@/data/mockSubclasses");
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        
        if (classIndex) {
          // Filtrar subclasses mock por classe
          const classSubclasses = mockSubclasses.filter(subclass => 
            subclass.class.index === classIndex
          );
          console.log(`📊 Total: ${classSubclasses.length} subclasses para ${classIndex} dos dados locais`);
          return classSubclasses;
        }
        
        console.log(`📊 Total: ${mockSubclasses.length} subclasses dos dados locais`);
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
        console.log("🌐 ===== BACKGROUNDS CARREGADOS (API + DADOS LOCAIS) =====");
        console.log(`📊 Total: ${backgrounds.length} backgrounds`);
        return backgrounds;
      } catch (error) {
        console.error("❌ Erro ao carregar backgrounds da API:", error);
        const { mockBackgrounds } = await import("@/data/mockBackgrounds");
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        console.log(`📊 Total: ${mockBackgrounds.length} backgrounds dos dados locais`);
        return mockBackgrounds;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

function useSpellsQuery(enabled: boolean = true, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "spells", classIndex],
    queryFn: async () => {
      try {
        // Buscar todas as magias da API primeiro
        const allSpells = await dndAPI.getSpells();
        console.log("🌐 ===== MAGIAS CARREGADAS DA API =====");
        
        if (classIndex) {
          // Filtrar magias por classe
          const classSpells = allSpells.filter(spell => 
            spell.classes.some(cls => cls.index === classIndex)
          );
          console.log(`📊 Total: ${classSpells.length} magias para ${classIndex}`);
          return classSpells;
        }
        
        console.log(`📊 Total: ${allSpells.length} magias carregadas`);
        return allSpells;
      } catch (error) {
        console.error("❌ Erro ao carregar magias da API:", error);
        const { mockSpells } = await import("@/data/mockSpells");
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        
        if (classIndex) {
          // Filtrar magias mock por classe
          const classSpells = mockSpells.filter(spell => 
            spell.classes.some(cls => cls.index === classIndex)
          );
          console.log(`📊 Total: ${classSpells.length} magias para ${classIndex} dos dados locais`);
          return classSpells;
        }
        
        console.log(`📊 Total: ${mockSpells.length} magias dos dados locais`);
        return mockSpells;
      }
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// ===========================
// CHARACTER CREATION CONTEXT
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
  } = useSubracesQuery(true, characterData.selectedRace?.index);

  const {
    data: classesData = [],
    isLoading: isLoadingClasses,
    error: classesError,
  } = useClassesQuery();

  const {
    data: subclassesData = [],
    isLoading: isLoadingSubclasses,
    error: subclassesError,
  } = useSubclassesQuery(true, characterData.selectedClass?.index);

  const {
    data: backgroundsData = [],
    isLoading: isLoadingBackgrounds,
    error: backgroundsError,
  } = useBackgroundsQuery();

  const {
    data: spellsData = [],
    isLoading: isLoadingSpells,
    error: spellsError,
  } = useSpellsQuery(characterData.isSpellcaster, characterData.selectedClass?.index);

  // ===========================
  // COMPUTED VALUES
  // ===========================

  const isLoading = useMemo(() => {
    return isLoadingRaces || isLoadingClasses || isLoadingBackgrounds || 
           (characterData.selectedRace && isLoadingSubraces) ||
           (characterData.selectedClass && isLoadingSubclasses) ||
           (characterData.isSpellcaster && isLoadingSpells);
  }, [
    isLoadingRaces, 
    isLoadingClasses, 
    isLoadingBackgrounds, 
    isLoadingSubraces, 
    isLoadingSubclasses, 
    isLoadingSpells,
    characterData.selectedRace,
    characterData.selectedClass,
    characterData.isSpellcaster
  ]);

  // Filtered data
  const filteredRaces = useMemo(() => {
    return racesData.filter(race => 
      race.name.toLowerCase().includes(debouncedRaceSearch.toLowerCase())
    );
  }, [racesData, debouncedRaceSearch]);

  const filteredClasses = useMemo(() => {
    return classesData.filter(cls => 
      cls.name.toLowerCase().includes(debouncedClassSearch.toLowerCase())
    );
  }, [classesData, debouncedClassSearch]);

  const filteredSpells = useMemo(() => {
    return spellsData.filter(spell => 
      spell.name.toLowerCase().includes(debouncedSpellSearch.toLowerCase())
    );
  }, [spellsData, debouncedSpellSearch]);

  // Progress tracking
  const currentStepData = useMemo(() => {
    return steps[currentStep];
  }, [steps, currentStep]);

  const progress = useMemo(() => {
    return Math.round(((currentStep + 1) / steps.length) * 100);
  }, [currentStep, steps.length]);

  // Spell Info
  const spellInfo = useMemo(() => {
    if (!characterData.selectedClass?.spellcasting) {
      return {
        maxSpellLevel: 0,
        startingCantrips: 0,
        startingSpells: 0,
      };
    }

    return {
      maxSpellLevel: characterData.level >= 17 ? 9 : characterData.level >= 15 ? 8 : characterData.level >= 13 ? 7 : characterData.level >= 11 ? 6 : characterData.level >= 9 ? 5 : characterData.level >= 7 ? 4 : characterData.level >= 5 ? 3 : characterData.level >= 3 ? 2 : 1,
      startingCantrips: characterData.level >= 10 ? 4 : characterData.level >= 4 ? 3 : 2,
      startingSpells: characterData.level + 1,
    };
  }, [characterData.selectedClass, characterData.level]);

  // ===========================
  // CHARACTER DATA UPDATES
  // ===========================

  const updateCharacterData = useCallback((updates: Partial<CharacterCreationData>) => {
    setCharacterData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateCharacterField = useCallback(<K extends keyof CharacterCreationData>(
    field: K,
    value: CharacterCreationData[K]
  ) => {
    setCharacterData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Ability Scores
  const updateAbilityScore = useCallback((ability: keyof AbilityScores, value: number) => {
    setCharacterData(prev => ({
      ...prev,
      abilityScores: {
        ...prev.abilityScores,
        [ability]: Math.max(1, Math.min(20, value)),
      },
    }));
  }, []);

  // Skills
  const toggleSkill = useCallback((skillKey: string) => {
    setCharacterData(prev => {
      const isSelected = prev.selectedSkills.includes(skillKey);
      
      if (isSelected) {
        return {
          ...prev,
          selectedSkills: prev.selectedSkills.filter(s => s !== skillKey),
        };
      } else if (prev.selectedSkills.length < prev.availableSkillChoices) {
        return {
          ...prev,
          selectedSkills: [...prev.selectedSkills, skillKey],
        };
      }
      
      return prev;
    });
  }, []);

  // Spells
  const toggleSpell = useCallback((spellIndex: string) => {
    setCharacterData(prev => {
      const isSelected = prev.selectedSpells.includes(spellIndex);
      
      if (isSelected) {
        return {
          ...prev,
          selectedSpells: prev.selectedSpells.filter(s => s !== spellIndex),
        };
      } else {
        return {
          ...prev,
          selectedSpells: [...prev.selectedSpells, spellIndex],
        };
      }
    });
  }, []);

  // ===========================
  // UTILITY FUNCTIONS - CORRIGIDAS
  // ===========================

  const getAbilityModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  const getCombinedAbilityBonuses = useCallback((): Record<keyof AbilityScores, number> => {
    const bonuses: Record<keyof AbilityScores, number> = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    };

    // Race bonuses
    if (characterData.selectedRace) {
      characterData.selectedRace.ability_bonuses.forEach(bonus => {
        const key = bonus.ability_score.index as keyof AbilityScores;
        bonuses[key] = (bonuses[key] || 0) + bonus.bonus;
      });
    }

    // Subrace bonuses
    if (characterData.selectedSubrace) {
      characterData.selectedSubrace.ability_bonuses.forEach(bonus => {
        const key = bonus.ability_score.index as keyof AbilityScores;
        bonuses[key] = (bonuses[key] || 0) + bonus.bonus;
      });
    }

    return bonuses;
  }, [characterData.selectedRace, characterData.selectedSubrace]);

  const calculateHitPoints = useCallback((): number => {
    if (!characterData.selectedClass) return 0;
    
    const constitution = characterData.abilityScores.constitution;
    const level = characterData.level;
    const hitDie = characterData.selectedClass.hit_die;
    
    const conModifier = getAbilityModifier(constitution);
    const baseHP = hitDie + conModifier; // Max HP at level 1
    const additionalHP = (level - 1) * (Math.floor(hitDie / 2) + 1 + conModifier); // Average HP per level after 1st
    
    return Math.max(1, baseHP + additionalHP);
  }, [characterData.selectedClass, characterData.abilityScores.constitution, characterData.level, getAbilityModifier]);

  const calculateArmorClass = useCallback((): number => {
    const dexterity = characterData.abilityScores.dexterity;
    const dexModifier = getAbilityModifier(dexterity);
    
    // Base AC (10 + Dex modifier for no armor)
    return 10 + dexModifier;
  }, [characterData.abilityScores.dexterity, getAbilityModifier]);

  const getSpellcastingAbility = useCallback((classIndex?: string): keyof AbilityScores | null => {
    const targetClass = classIndex 
      ? classesData.find(c => c.index === classIndex)
      : characterData.selectedClass;
      
    if (!targetClass?.spellcasting) return null;
    
    return targetClass.spellcasting.spellcasting_ability.index as keyof AbilityScores;
  }, [characterData.selectedClass, classesData]);

  // Função auxiliar para subrace/subclass
  const getAvailableSubraces = useCallback(() => {
    if (!characterData.selectedRace) return [];
    return subracesData.filter(subrace => 
      subrace.race.index === characterData.selectedRace?.index
    );
  }, [characterData.selectedRace, subracesData]);

  const getAvailableSubclasses = useCallback(() => {
    if (!characterData.selectedClass) return [];
    return subclassesData.filter(subclass => 
      subclass.class.index === characterData.selectedClass?.index
    );
  }, [characterData.selectedClass, subclassesData]);

  const needsSubrace = useCallback(() => {
    return characterData.selectedRace && characterData.selectedRace.subraces?.length > 0;
  }, [characterData.selectedRace]);

  const getSubclassLevel = useCallback((classIndex?: string) => {
    if (!classIndex) return 3;
    
    const subclassLevels: Record<string, number> = {
      'sorcerer': 1,
      'warlock': 1,
      'cleric': 1,
      'druid': 2,
      'wizard': 2,
      'bard': 3,
      'fighter': 3,
      'ranger': 3,
      'rogue': 3,
      'barbarian': 3,
      'monk': 3,
      'paladin': 3,
    };
    
    return subclassLevels[classIndex] || 3;
  }, []);

  const needsSubclass = useCallback(() => {
    if (!characterData.selectedClass) return false;
    const subclassLevel = getSubclassLevel(characterData.selectedClass.index);
    return characterData.level >= subclassLevel;
  }, [characterData.selectedClass, characterData.level, getSubclassLevel]);

  const getAvailableSkills = useCallback(() => {
    if (!characterData.selectedClass) return [];
    
    const classSkills = characterData.selectedClass.proficiency_choices?.[0]?.from?.options || [];
    return classSkills
      .filter(option => option.option_type === "reference")
      .map(option => option.item)
      .filter(Boolean);
  }, [characterData.selectedClass]);

  const getSkillChoices = useCallback(() => {
    return characterData.selectedClass?.proficiency_choices?.[0]?.choose || 0;
  }, [characterData.selectedClass]);

  // Função para gerar scores aleatórios
  const generateRandomAbilityScores = useCallback(() => {
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

  // Função para calcular pontos usados no point buy
  const calculateAbilityScorePoints = useCallback((scores: AbilityScores) => {
    const pointCosts: Record<number, number> = {
      8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
    };
    
    return Object.values(scores).reduce((total, score) => {
      return total + (pointCosts[score] || 0);
    }, 0);
  }, []);

  // ===========================
  // STEP VALIDATION - 🔥 CORRIGIDO COM LOGS
  // ===========================

  const validateStep = useCallback((stepId: string): boolean => {
    console.log(`🔧 ===== VALIDATING STEP: ${stepId} =====`);
    
    switch (stepId) {
      case "basic-info":
        const basicInfoValid = !!(
          characterData.name.trim() &&
          characterData.selectedRace &&
          characterData.selectedClass &&
          characterData.selectedBackground
        );
        console.log("🔧 basic-info valid:", basicInfoValid);
        return basicInfoValid;

      case "ability-scores":
        const totalPoints = Object.values(characterData.abilityScores).reduce((sum, score) => sum + score, 0);
        const abilityValid = characterData.abilityMethod === "standard" ? totalPoints === 75 : totalPoints >= 60;
        console.log("🔧 ability-scores valid:", abilityValid, "totalPoints:", totalPoints);
        return abilityValid;

      case "skills":
        const skillsValid = characterData.selectedSkills.length === characterData.availableSkillChoices;
        console.log("🔧 skills valid:", skillsValid, "selected:", characterData.selectedSkills.length, "available:", characterData.availableSkillChoices);
        return skillsValid;

      case "equipment":
        console.log("🔧 ===== EQUIPMENT VALIDATION DETAILED =====");
        console.log("🔧 characterData.selectedEquipment:", characterData.selectedEquipment);
        console.log("🔧 Type:", typeof characterData.selectedEquipment);
        console.log("🔧 Is Array:", Array.isArray(characterData.selectedEquipment));
        console.log("🔧 Length:", characterData.selectedEquipment?.length);
        console.log("🔧 Truthy check:", !!characterData.selectedEquipment);
        console.log("🔧 Length > 0 check:", (characterData.selectedEquipment?.length || 0) > 0);
        
        const equipmentValid = characterData.selectedEquipment && 
                              Array.isArray(characterData.selectedEquipment) &&
                              characterData.selectedEquipment.length > 0;
        
        console.log("🔧 Final equipment valid result:", equipmentValid);
        console.log("🔧 ============================================");
        return equipmentValid;

      case "spells":
        if (!characterData.isSpellcaster) {
          console.log("🔧 spells valid: true (not a spellcaster)");
          return true;
        }
        const spellsValid = characterData.selectedSpells.length > 0;
        console.log("🔧 spells valid:", spellsValid, "selected spells:", characterData.selectedSpells.length);
        return spellsValid;

      case "personality":
        const personalityValid = (
          characterData.personalityTraits.length > 0 &&
          characterData.ideals.length > 0 &&
          characterData.bonds.length > 0 &&
          characterData.flaws.length > 0
        );
        console.log("🔧 personality valid:", personalityValid);
        return personalityValid;

      default:
        console.log("🔧 Unknown step, returning false");
        return false;
    }
  }, [characterData]);

  const validateCurrentStep = useCallback((): boolean => {
    return currentStepData ? validateStep(currentStepData.id) : false;
  }, [currentStep, steps, validateStep]);

  const canProceed = useCallback((): boolean => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

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
  // CHARACTER ACTIONS
  // ===========================

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
  // UPDATE STEP VALIDATION STATUS - 🔥 COM LOGS
  // ===========================

  useEffect(() => {
    console.log("🔄 ===== UPDATING STEP VALIDATION =====");
    console.log("🔄 characterData.selectedEquipment:", characterData.selectedEquipment);
    
    setSteps(prev =>
      prev.map(step => {
        const isValid = validateStep(step.id);
        console.log(`🔄 Step ${step.id}: ${isValid ? '✅' : '❌'}`);
        
        return {
          ...step,
          isValid: isValid,
          isCompleted: isValid,
        };
      })
    );
    
    console.log("🔄 =====================================");
  }, [characterData, validateStep]);

  // 🔥 FORÇAR VALIDAÇÃO IMEDIATA QUANDO EQUIPMENTS MUDAM
  useEffect(() => {
    console.log("⚡ ===== EQUIPMENT CHANGED - FORCING VALIDATION =====");
    console.log("⚡ selectedEquipment:", characterData.selectedEquipment);
    
    // Forçar validação do step equipment
    const equipmentValid = validateStep("equipment");
    console.log("⚡ Equipment validation result:", equipmentValid);
    
    console.log("⚡ ================================================");
  }, [characterData.selectedEquipment, validateStep]);

  // ===========================
  // ERROR HANDLING
  // ===========================

  useEffect(() => {
    const errors = [];
    const fallbacks = [];
    
    if (racesError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR RAÇAS DA API =====");
      errors.push("raças");
      fallbacks.push("📋 Raças: dados locais");
    }
    
    if (classesError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR CLASSES DA API =====");
      errors.push("classes");
      fallbacks.push("📋 Classes: dados locais");
    }
    
    if (backgroundsError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR BACKGROUNDS DA API =====");
      errors.push("backgrounds");
      fallbacks.push("📋 Backgrounds: dados locais");
    }
    
    if (spellsError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR MAGIAS DA API =====");
      errors.push("magias");
      fallbacks.push("📋 Magias: dados locais");
    }

    if (subracesError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR SUB-RAÇAS DA API =====");
      errors.push("sub-raças");
      fallbacks.push("📋 Sub-raças: dados locais");
    }

    if (subclassesError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR SUBCLASSES DA API =====");
      errors.push("subclasses");
      fallbacks.push("📋 Subclasses: dados locais");
    }

    if (fallbacks.length > 0) {
      console.log("🛡️ ===== RESUMO DOS FALLBACKS =====");
      console.log("📊 Dados sendo usados dos arquivos locais:");
      fallbacks.forEach(fallback => console.log(fallback));
      console.log("===============================================");
    }

    if (errors.length === 0) {
      console.log("✅ ===== TODOS OS DADOS CARREGADOS DA API =====");
      console.log("🌐 Conexão com API D&D funcionando perfeitamente!");
      console.log("===============================================");
    }
  }, [racesError, classesError, backgroundsError, spellsError, subracesError, subclassesError]);

  // ===========================
  // AUTO-UPDATE EFFECT FOR CLASS CHANGES
  // ===========================

  useEffect(() => {
    if (characterData.selectedClass) {
      const isSpellcaster = !!characterData.selectedClass.spellcasting;
      const skillChoices = characterData.selectedClass.proficiency_choices?.[0]?.choose || 2;
      
      setCharacterData(prev => ({
        ...prev,
        isSpellcaster,
        spellcastingAbility: isSpellcaster ? characterData.selectedClass?.spellcasting?.spellcasting_ability || null : null,
        availableSkillChoices: skillChoices,
        selectedSpells: isSpellcaster ? prev.selectedSpells : [],
      }));
    }
  }, [characterData.selectedClass]);

  // ===========================
  // RETURN CONTEXT VALUE - CORRIGIDO
  // ===========================

  const contextValue: CharacterCreationContextType = {
    // Step management
    currentStep,
    steps,
    currentStepData,
    progress,
    nextStep,
    prevStep,
    goToStep,
    canProceed,

    // Character data
    characterData,
    updateCharacterData,
    updateCharacterField,
    updateAbilityScore,
    toggleSkill,
    toggleSpell,

    // Data from API
    races: filteredRaces,
    subraces: subracesData,
    classes: filteredClasses,
    subclasses: subclassesData,
    backgrounds: backgroundsData,
    spells: filteredSpells,

    // Loading states
    isLoading,
    loading,
    isLoadingRaces,
    isLoadingClasses,
    isLoadingBackgrounds,
    isLoadingSpells,
    isLoadingSubclasses,
    isLoadingSubraces,

    // Search
    raceSearchTerm,
    setRaceSearchTerm,
    classSearchTerm,
    setClassSearchTerm,
    spellSearchTerm,
    setSpellSearchTerm,
    raceSearch: raceSearchTerm,
    setRaceSearch: setRaceSearchTerm,
    classSearch: classSearchTerm,
    setClassSearch: setClassSearchTerm,
    spellSearch: spellSearchTerm,
    setSpellSearch: setSpellSearchTerm,

    // Actions
    resetCharacter,
    createCharacter,

    // Validation
    validateStep,
    validateCurrentStep,
    isStepValid: validateStep,

    // ===========================
    // UTILITY FUNCTIONS (PRINCIPAIS) - TODAS CORRIGIDAS
    // ===========================
    
    getCombinedAbilityBonuses,
    getAbilityModifier,
    calculateHitPoints,
    calculateArmorClass,
    getSpellcastingAbility,
    generateRandomAbilityScores,
    calculateAbilityScorePoints,
    
    // Subrace/Subclass Functions
    getAvailableSubraces,
    getAvailableSubclasses,
    needsSubrace,
    needsSubclass,
    getAvailableSkills,
    getSkillChoices,
    getSubclassLevel,
    
    // ===========================
    // UTILITY FUNCTIONS (ADICIONAIS)
    // ===========================
    
    calculateModifier: (score: number) => Math.floor((score - 10) / 2),
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
    rollAbilityScores: () => {
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

    // Spell Info
    spellInfo,
    maxSpellLevel: spellInfo.maxSpellLevel,
    startingCantrips: spellInfo.startingCantrips,
    startingSpells: spellInfo.startingSpells,
    error,
  };

  // 🚨 TESTE DIRETO - VALIDAÇÃO EQUIPMENT (dentro da função)
  console.log("🧪 ===== TESTE DIRETO - EQUIPMENT VALIDATION =====");
  console.log("🧪 characterData.selectedEquipment:", characterData.selectedEquipment);
  console.log("🧪 Equipment valid?", 
    characterData.selectedEquipment && 
    Array.isArray(characterData.selectedEquipment) && 
    characterData.selectedEquipment.length > 0
  );
  console.log("🧪 ================================================");

  return contextValue;
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