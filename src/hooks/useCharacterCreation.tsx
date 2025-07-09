// ===========================
// CHARACTER CREATION HOOK - VERSÃO CORRIGIDA SEM LOOP INFINITO
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
// INTERFACES PARA CAMPANHA (NOVO)
// ===========================

export interface CampaignContext {
  id: string;
  name: string;
  setting?: string;
  world_name?: string;
}

interface CharacterCreationProviderProps {
  children: React.ReactNode;
  campaignId?: string;
  campaignContext?: CampaignContext;
}

// ===========================
// CONFIGURAÇÕES DE MAGIAS POR CLASSE
// ===========================

const SPELL_CONFIG_BY_CLASS: Record<string, {
  cantripsKnown: number;
  spellsKnown: number;
  maxSpellLevel: number;
  spellcastingAbility: 'int' | 'wis' | 'cha' | null;
  isSpellcaster: boolean;
}> = {
  'wizard': { cantripsKnown: 3, spellsKnown: 6, maxSpellLevel: 1, spellcastingAbility: 'int', isSpellcaster: true },
  'sorcerer': { cantripsKnown: 4, spellsKnown: 2, maxSpellLevel: 1, spellcastingAbility: 'cha', isSpellcaster: true },
  'cleric': { cantripsKnown: 3, spellsKnown: 2, maxSpellLevel: 1, spellcastingAbility: 'wis', isSpellcaster: true },
  'druid': { cantripsKnown: 2, spellsKnown: 2, maxSpellLevel: 1, spellcastingAbility: 'wis', isSpellcaster: true },
  'bard': { cantripsKnown: 2, spellsKnown: 4, maxSpellLevel: 1, spellcastingAbility: 'cha', isSpellcaster: true },
  'warlock': { cantripsKnown: 2, spellsKnown: 2, maxSpellLevel: 1, spellcastingAbility: 'cha', isSpellcaster: true },
  'ranger': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: 'wis', isSpellcaster: false },
  'paladin': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: 'cha', isSpellcaster: false },
  'fighter': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: null, isSpellcaster: false },
  'rogue': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: null, isSpellcaster: false },
  'barbarian': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: null, isSpellcaster: false },
  'monk': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: null, isSpellcaster: false },
};

// ===========================
// QUERY CLIENT CONFIGURATION
// ===========================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
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
  // Basic Information
  name: "",
  characterName: "",
  selectedRace: null,
  selectedSubrace: null,
  selectedClass: null,
  selectedSubclass: null,
  selectedBackground: null,
  level: 1,

  // Ability Scores
  abilityScores: {
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  },
  abilityMethod: "point-buy",
  pointsRemaining: 27,

  // Skills
  selectedSkills: [],
  availableSkills: [],
  availableSkillChoices: 0,

  // Spellcasting
  isSpellcaster: false,
  spellcastingAbility: null,
  selectedCantrips: [],
  selectedSpells: [],
  availableCantrips: [],
  availableSpells: [],

  // Equipment
  selectedEquipment: [],
  startingGold: 0,

  // Final Details
  hitPoints: 0,
  armorClass: 10,
  proficiencyBonus: 2,
  savingThrows: [],
  featuresAndTraits: [],
  
  // Personality
  personalityTraits: "",
  ideals: "",
  bonds: "",
  flaws: "",
  backstory: "",
};

const characterCreationSteps: CharacterCreationStep[] = [
  { id: "basic-info", title: "Informações Básicas", isValid: false },
  { id: "ability-scores", title: "Atributos", isValid: false },
  { id: "skills", title: "Perícias", isValid: false },
  { id: "spells", title: "Magias", isValid: false },
  { id: "equipment", title: "Equipamentos", isValid: false },
  { id: "personality", title: "Personalidade", isValid: false },
  { id: "review", title: "Revisão", isValid: false },
];

// ===========================
// API QUERY HOOKS COM MERGE/FALLBACK
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
      if (!raceIndex) return [];
      
      try {
        const subraces = await dndAPI.getRaceSubraces(raceIndex);
        console.log("🌐 ===== SUB-RAÇAS CARREGADAS (API + DADOS LOCAIS) =====");
        console.log(`📊 Total: ${subraces.length} sub-raças`);
        return subraces;
      } catch (error) {
        console.error("❌ Erro ao carregar sub-raças da API:", error);
        const { mockSubraces } = await import("@/data/mockSubRaces");
        
        // Filtrar por raça específica
        const filteredSubraces = mockSubraces.filter(
          subrace => subrace.race?.index === raceIndex
        );
        
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        console.log(`📊 Total: ${filteredSubraces.length} sub-raças dos dados locais`);
        return filteredSubraces;
      }
    },
    enabled: enabled && !!raceIndex,
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
      if (!classIndex) return [];
      
      try {
        const subclasses = await dndAPI.getClassSubclasses(classIndex);
        console.log("🌐 ===== SUBCLASSES CARREGADAS (API + DADOS LOCAIS) =====");
        console.log(`📊 Total: ${subclasses.length} subclasses`);
        return subclasses;
      } catch (error) {
        console.error("❌ Erro ao carregar subclasses da API:", error);
        const { mockSubclasses } = await import("@/data/mockSubClasses");
        
        // Filtrar por classe específica
        const filteredSubclasses = mockSubclasses.filter(
          subclass => subclass.class?.index === classIndex
        );
        
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        console.log(`📊 Total: ${filteredSubclasses.length} subclasses dos dados locais`);
        return filteredSubclasses;
      }
    },
    enabled: enabled && !!classIndex,
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
        console.log(`🔍 ===== CARREGANDO MAGIAS PARA ${classIndex || 'TODAS AS CLASSES'} =====`);
        
        const allSpells = await dndAPI.getSpells();
        console.log(`📊 Total de magias da API: ${allSpells.length}`);
        
        if (classIndex) {
          const classSpells = allSpells.filter(spell => {
            const hasClass = spell.classes?.some(cls => cls.index === classIndex);
            return hasClass;
          });
          
          console.log(`🎯 Magias filtradas para ${classIndex}: ${classSpells.length}`);
          return classSpells;
        }
        
        return allSpells;
        
      } catch (error) {
        console.error("❌ Erro ao carregar magias da API:", error);
        const { mockSpells } = await import("@/data/mockSpells");
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        
        if (classIndex) {
          const classSpells = mockSpells.filter(spell => 
            spell.classes?.some(cls => cls.index === classIndex)
          );
          console.log(`📊 Magias mock para ${classIndex}: ${classSpells.length}`);
          return classSpells;
        }
        
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
// SPELL VALIDATION HELPER
// ===========================

const validateSpellSelection = (classIndex: string, selectedSpells: string[], availableSpells: DndSpell[]) => {
  const cantrips = selectedSpells.filter(spellIndex => {
    const spell = availableSpells.find(s => s.index === spellIndex);
    return spell?.level === 0;
  });
  
  const spells = selectedSpells.filter(spellIndex => {
    const spell = availableSpells.find(s => s.index === spellIndex);
    return spell && spell.level > 0;
  });

  return {
    cantripsCount: cantrips.length,
    spellsCount: spells.length,
    selectedCantrips: cantrips,
    selectedSpells: spells
  };
};

// ===========================
// MAIN HOOK IMPLEMENTATION
// ===========================

export const useCharacterCreation = (
  campaignId?: string,
  campaignContext?: CampaignContext
): CharacterCreationContextType => {
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

  // Campaign flags (NOVO)
  const isForCampaign = Boolean(campaignId);

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
  } = useSpellsQuery(true, characterData.selectedClass?.index);

  // ===========================
  // FALLBACK STATUS MONITORING (RECUPERADO)
  // ===========================

  useEffect(() => {
    const errors: string[] = [];
    const fallbacks: string[] = [];

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
  // COMPUTED VALUES
  // ===========================

  const currentStepData = useMemo(() => {
    return steps[currentStep];
  }, [steps, currentStep]);

  const progress = useMemo(() => {
    return ((currentStep + 1) / steps.length) * 100;
  }, [currentStep, steps.length]);

  const isLoading = useMemo(() => {
    return isLoadingRaces || isLoadingClasses || isLoadingBackgrounds || isLoadingSpells || loading;
  }, [isLoadingRaces, isLoadingClasses, isLoadingBackgrounds, isLoadingSpells, loading]);

  // ===========================
  // DATA UPDATE FUNCTIONS
  // ===========================

  const updateCharacterData = useCallback(
    (updates: Partial<CharacterCreationData>) => {
      setCharacterData(prev => ({ ...prev, ...updates }));
    },
    []
  );

  const updateCharacterField = useCallback(
    <K extends keyof CharacterCreationData>(
      field: K,
      value: CharacterCreationData[K]
    ) => {
      setCharacterData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateAbilityScore = useCallback(
    (ability: keyof AbilityScores, value: number) => {
      setCharacterData(prev => ({
        ...prev,
        abilityScores: {
          ...prev.abilityScores,
          [ability]: value,
        },
      }));
    },
    []
  );

  const toggleSkill = useCallback((skillKey: string) => {
    console.log(`🔧 Toggle skill: ${skillKey}`);
    
    const currentSkills = characterData.selectedSkills || [];
    const isSelected = currentSkills.includes(skillKey);
    const skillChoices = characterData.availableSkillChoices || 0;
    
    let newSkills: string[];
    
    if (isSelected) {
      newSkills = currentSkills.filter(skill => skill !== skillKey);
      console.log(`🗑️ Skill ${skillKey} removida`);
    } else {
      if (currentSkills.length >= skillChoices) {
        console.warn(`⚠️ Limite de skills atingido (${skillChoices})`);
        return;
      }
      newSkills = [...currentSkills, skillKey];
      console.log(`✅ Skill ${skillKey} adicionada`);
    }
    
    updateCharacterData({ selectedSkills: newSkills });
  }, [characterData.selectedSkills, characterData.availableSkillChoices, updateCharacterData]);

  const toggleSpell = useCallback((spellIndex: string) => {
    console.log(`🔧 Toggle spell: ${spellIndex}`);
    
    const currentSelection = characterData.selectedSpells || [];
    const isSelected = currentSelection.includes(spellIndex);
    
    if (isSelected) {
      const newSelection = currentSelection.filter(s => s !== spellIndex);
      updateCharacterData({ selectedSpells: newSelection });
      console.log(`🗑️ Magia ${spellIndex} removida`);
    } else {
      const spell = spellsData.find(s => s.index === spellIndex);
      if (!spell) {
        console.error(`❌ Magia ${spellIndex} não encontrada`);
        return;
      }

      const classIndex = characterData.selectedClass?.index;
      if (!classIndex) {
        console.error("❌ Nenhuma classe selecionada");
        return;
      }

      const validation = validateSpellSelection(classIndex, currentSelection, spellsData);
      const classConfig = SPELL_CONFIG_BY_CLASS[classIndex];
      
      if (!classConfig) {
        console.error(`❌ Configuração não encontrada para classe ${classIndex}`);
        return;
      }
      
      if (spell.level === 0) {
        if (validation.cantripsCount >= classConfig.cantripsKnown) {
          console.warn(`⚠️ Limite de cantrips atingido (${classConfig.cantripsKnown})`);
          return;
        }
      } else {
        if (validation.spellsCount >= classConfig.spellsKnown) {
          console.warn(`⚠️ Limite de magias atingido (${classConfig.spellsKnown})`);
          return;
        }
      }

      const newSelection = [...currentSelection, spellIndex];
      updateCharacterData({ selectedSpells: newSelection });
      console.log(`✅ Magia ${spell.name} adicionada`);
    }
  }, [characterData.selectedSpells, characterData.selectedClass, spellsData, updateCharacterData]);

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================

  const getAbilityModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  const getCombinedAbilityBonuses = useMemo((): Record<keyof AbilityScores, number> => {
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
    
    const abilityIndex = targetClass.spellcasting.spellcasting_ability?.index;
    if (!abilityIndex) return null;
    
    const abilityMap: Record<string, keyof AbilityScores> = {
      'str': 'strength',
      'dex': 'dexterity', 
      'con': 'constitution',
      'int': 'intelligence',
      'wis': 'wisdom',
      'cha': 'charisma'
    };
    
    return abilityMap[abilityIndex] || null;
  }, [characterData.selectedClass, classesData]);

  const getAvailableSubraces = useCallback(() => {
    return subracesData || [];
  }, [subracesData]);

  const getAvailableSubclasses = useCallback(() => {
    return subclassesData || [];
  }, [subclassesData]);

  const needsSubrace = useCallback(() => {
    return characterData.selectedRace && subracesData.length > 0;
  }, [characterData.selectedRace, subracesData]);

  const needsSubclass = useCallback(() => {
    return characterData.selectedClass && subclassesData.length > 0;
  }, [characterData.selectedClass, subclassesData]);

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

  const getSubclassLevel = useCallback(() => {
    return characterData.selectedClass?.subclass_level || 1;
  }, [characterData.selectedClass]);

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

  const calculateAbilityScorePoints = useCallback((scores: AbilityScores) => {
    const pointCosts: Record<number, number> = {
      8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
    };
    
    return Object.values(scores).reduce((total, score) => {
      return total + (pointCosts[score] || 0);
    }, 0);
  }, []);

  const calculateModifier = useCallback((score: number) => Math.floor((score - 10) / 2), []);

  const getProficiencyBonus = useCallback((level: number) => Math.ceil(level / 4) + 1, []);

  const getSkillModifier = useCallback((skill: string, scores: AbilityScores, isProficient = false) => {
    const skillInfo = SKILLS.find(s => s.key === skill);
    if (!skillInfo) return 0;
    
    const abilityScore = scores[skillInfo.ability];
    const abilityMod = getAbilityModifier(abilityScore);
    const profBonus = isProficient ? getProficiencyBonus(characterData.level) : 0;
    
    return abilityMod + profBonus;
  }, [getAbilityModifier, getProficiencyBonus, characterData.level]);

  // ===========================
  // VALIDATION LOGIC INLINE (SEM CIRCULAR DEPENDENCIES)
  // ===========================

  const validateStepInline = useCallback((stepId: string): boolean => {
    switch (stepId) {
      case "basic-info":
        return !!(
          characterData.name.trim() &&
          characterData.selectedRace &&
          characterData.selectedClass &&
          characterData.selectedBackground
        );

      case "ability-scores":
        const totalPoints = Object.values(characterData.abilityScores).reduce((sum, score) => sum + score, 0);
        return characterData.abilityMethod === "standard" ? 
          totalPoints === 72 : 
          characterData.pointsRemaining === 0;

      case "skills":
        return characterData.selectedSkills.length === characterData.availableSkillChoices;

      case "spells":
        if (!characterData.isSpellcaster) return true;
        
        const classIndex = characterData.selectedClass?.index;
        if (!classIndex) return false;
        
        const validation = validateSpellSelection(classIndex, characterData.selectedSpells, spellsData);
        const classConfig = SPELL_CONFIG_BY_CLASS[classIndex];
        
        if (!classConfig) return false;
        
        return validation.cantripsCount >= classConfig.cantripsKnown &&
               validation.spellsCount >= classConfig.spellsKnown;

      case "equipment":
        return characterData.selectedEquipment && 
               Array.isArray(characterData.selectedEquipment) && 
               characterData.selectedEquipment.length > 0;

      case "personality":
        return true; // Personalidade é opcional

      case "review":
        return steps.slice(0, -1).every(step => step.isValid);

      default:
        return false;
    }
  }, [
    characterData.name,
    characterData.selectedRace,
    characterData.selectedClass,
    characterData.selectedBackground,
    characterData.abilityScores,
    characterData.abilityMethod,
    characterData.pointsRemaining,
    characterData.selectedSkills.length,
    characterData.availableSkillChoices,
    characterData.isSpellcaster,
    characterData.selectedSpells,
    characterData.selectedEquipment,
    spellsData,
    steps
  ]);

  const validateCurrentStep = useCallback((): boolean => {
    const currentStepData = steps[currentStep];
    return currentStepData ? validateStepInline(currentStepData.id) : false;
  }, [currentStep, steps, validateStepInline]);

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
      
      // Preparar dados do personagem (ATUALIZADO PARA CAMPANHAS)
      const characterPayload = {
        ...characterData,
        campaign_id: campaignId || null,
        created_for_campaign: isForCampaign
      };
      
      console.log("Criando personagem:", characterPayload);
      
      if (isForCampaign && campaignId) {
        console.log(`🎯 Personagem será vinculado à campanha: ${campaignId}`);
      }
      
      // TODO: Implementar chamada real da API
      // const result = await characterAPI.createCharacter(characterPayload);
      
      // Simulação por enquanto
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("✅ Personagem criado com sucesso!");
      
    } catch (error) {
      console.error("❌ Erro ao criar personagem:", error);
      setError(error instanceof Error ? error.message : "Erro ao criar personagem");
    } finally {
      setLoading(false);
    }
  }, [characterData, campaignId, isForCampaign]);

  // ===========================
  // EFFECTS (CORRIGIDOS SEM CIRCULAR DEPENDENCIES)
  // ===========================

  // Update class-dependent data when class changes
  useEffect(() => {
    if (characterData.selectedClass) {
      console.log("🔧 Classe selecionada:", characterData.selectedClass.name);
      
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
  }, [characterData.selectedClass?.index]); // 🔥 APENAS o index

  // Update step validation status (SEM CIRCULAR DEPENDENCIES)
  useEffect(() => {
    console.log("🔄 ===== UPDATING STEP VALIDATION =====");
    
    setSteps(prev =>
      prev.map(step => {
        const isValid = validateStepInline(step.id);
        console.log(`🔄 Step ${step.id}: ${isValid ? '✅' : '❌'}`);
        return { ...step, isValid };
      })
    );
  }, [
    // 🔥 DEPENDÊNCIAS ESPECÍFICAS E PRIMITIVAS - SEM OBJETOS QUE MUDAM
    characterData.name,
    characterData.selectedRace?.index,
    characterData.selectedClass?.index, 
    characterData.selectedBackground?.index,
    characterData.selectedSkills.length,
    characterData.availableSkillChoices,
    characterData.isSpellcaster,
    characterData.selectedSpells.length,
    characterData.selectedEquipment?.length,
    characterData.abilityMethod,
    characterData.pointsRemaining,
    JSON.stringify(characterData.abilityScores), // Serializar para evitar referência
    spellsData.length
  ]);

  // ===========================
  // CONTEXT VALUE
  // ===========================

  const contextValue: CharacterCreationContextType = {
    // Step Management
    currentStep,
    steps,
    currentStepData,
    progress,
    nextStep,
    prevStep,
    goToStep,
    canProceed,

    // Character Data
    characterData,
    updateCharacterData,
    updateCharacterField,
    updateAbilityScore,
    toggleSkill,
    toggleSpell,

    // Loading States
    isLoading,
    loading,
    error,

    // D&D Data
    races: filteredRaces,
    subraces: subracesData,
    classes: filteredClasses,
    subclasses: subclassesData,
    backgrounds: backgroundsData,
    spells: filteredSpells,

    // Loading States for Data
    isLoadingRaces,
    isLoadingSubraces,
    isLoadingClasses,
    isLoadingSubclasses,
    isLoadingBackgrounds,
    isLoadingSpells,

    // Search Functions
    raceSearchTerm,
    setRaceSearchTerm,
    classSearchTerm,
    setClassSearchTerm,
    spellSearchTerm,
    setSpellSearchTerm,
    
    // Duplicate search functions for backward compatibility
    raceSearch: raceSearchTerm,
    setRaceSearch: setRaceSearchTerm,
    classSearch: classSearchTerm,
    setClassSearch: setClassSearchTerm,
    spellSearch: spellSearchTerm,
    setSpellSearch: setSpellSearchTerm,

    // Actions
    resetCharacter,
    createCharacter,

    // Validation (USANDO A VERSÃO INLINE)
    validateStep: validateStepInline,
    validateCurrentStep,
    isStepValid: validateStepInline,

    // Utility Functions
    getCombinedAbilityBonuses,
    getAbilityModifier,
    calculateHitPoints,
    calculateArmorClass,
    getSpellcastingAbility,
    generateRandomAbilityScores,
    calculateAbilityScorePoints,
    getAvailableSubraces,
    getAvailableSubclasses,
    needsSubrace,
    needsSubclass,
    getAvailableSkills,
    getSkillChoices,
    getSubclassLevel,
    calculateModifier,
    getProficiencyBonus,
    getSkillModifier,

    // Campaign Context (NOVO)
    campaignId,
    campaignContext,
    isForCampaign,

    // Spell Configuration (NOVO)
    getSpellConfigForClass: (classIndex: string) => SPELL_CONFIG_BY_CLASS[classIndex] || null,
  };

  return contextValue;
};

// ===========================
// PROVIDER COMPONENT
// ===========================

const CharacterCreationInternalProvider: React.FC<{ 
  children: React.ReactNode;
  campaignId?: string;
  campaignContext?: CampaignContext;
}> = ({ children, campaignId, campaignContext }) => {
  const contextValue = useCharacterCreation(campaignId, campaignContext);

  return (
    <CharacterCreationContext.Provider value={contextValue}>
      {children}
    </CharacterCreationContext.Provider>
  );
};

export const CharacterCreationProvider: React.FC<CharacterCreationProviderProps> = ({
  children,
  campaignId,
  campaignContext
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <CharacterCreationInternalProvider 
        campaignId={campaignId}
        campaignContext={campaignContext}
      >
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

// ===========================
// SPECIALIZED HOOK FOR CAMPAIGN CONTEXT (NOVO)
// ===========================

export const useCampaignCharacterCreation = () => {
  const context = useCharacterCreationContext();
  
  if (!context.isForCampaign) {
    throw new Error('useCampaignCharacterCreation deve ser usado apenas em contexto de campanha');
  }
  
  return {
    ...context,
    campaignId: context.campaignId!,
    campaignContext: context.campaignContext!
  };
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