// ===========================
// OPTIMIZED CHARACTER CREATION HOOK - VERSÃO ORIGINAL + MAGIAS
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
// CONFIGURAÇÕES DE MAGIAS POR CLASSE - ✨ NOVO
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
  'fighter': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: 'int', isSpellcaster: false },
  'rogue': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: 'int', isSpellcaster: false },
  'barbarian': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: null, isSpellcaster: false },
  'monk': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: null, isSpellcaster: false },
};

// ===========================
// FUNÇÕES DE VALIDAÇÃO DE MAGIAS - ✨ NOVO
// ===========================

interface SpellValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  cantripsCount: number;
  spellsCount: number;
  maxCantrips: number;
  maxSpells: number;
}

function canClassAccessSpell(classIndex: string, spell: DndSpell): boolean {
  const hasAccess = spell.classes?.some(spellClass => spellClass.index === classIndex);
  if (!hasAccess) return false;

  const classConfig = SPELL_CONFIG_BY_CLASS[classIndex];
  if (!classConfig) return false;

  return spell.level <= classConfig.maxSpellLevel;
}

function validateSpellSelection(
  classIndex: string,
  selectedSpells: string[],
  availableSpells: DndSpell[]
): SpellValidationResult {
  const classConfig = SPELL_CONFIG_BY_CLASS[classIndex];
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!classConfig || !classConfig.isSpellcaster) {
    return { isValid: false, errors: ["Classe não é conjuradora"], warnings: [], cantripsCount: 0, spellsCount: 0, maxCantrips: 0, maxSpells: 0 };
  }

  let cantripsCount = 0;
  let spellsCount = 0;

  for (const spellIndex of selectedSpells) {
    const spell = availableSpells.find(s => s.index === spellIndex);
    if (!spell) continue;
    if (!canClassAccessSpell(classIndex, spell)) continue;

    if (spell.level === 0) cantripsCount++;
    else spellsCount++;
  }

  if (cantripsCount > classConfig.cantripsKnown) {
    errors.push(`Muitos cantrips: ${cantripsCount}/${classConfig.cantripsKnown}`);
  }
  if (spellsCount > classConfig.spellsKnown) {
    errors.push(`Muitas magias: ${spellsCount}/${classConfig.spellsKnown}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    cantripsCount,
    spellsCount,
    maxCantrips: classConfig.cantripsKnown,
    maxSpells: classConfig.spellsKnown,
  };
}

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
        const subclasses = await dndAPI.getSubclasses();
        console.log("🌐 ===== SUBCLASSES CARREGADAS (API + DADOS LOCAIS) =====");
        console.log(`📊 Total: ${subclasses.length} subclasses`);
        return subclasses;
      } catch (error) {
        console.error("❌ Erro ao carregar subclasses da API:", error);
        const { mockSubclasses } = await import("@/data/mockSubClasses");
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
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

// ===========================
// HOOK DE MAGIAS CORRIGIDO - ✨ NOVO
// ===========================
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

  // Loading state
  const isLoading = useMemo(() => {
    return isLoadingRaces || isLoadingClasses || isLoadingBackgrounds || isLoadingSpells || isLoadingSubclasses || isLoadingSubraces;
  }, [isLoadingRaces, isLoadingClasses, isLoadingBackgrounds, isLoadingSpells, isLoadingSubclasses, isLoadingSubraces]);

  // Progress calculation
  const progress = useMemo(() => {
    return Math.round((currentStep / (steps.length - 1)) * 100);
  }, [currentStep, steps.length]);

  // Current step data
  const currentStepData = useMemo(() => {
    return steps[currentStep];
  }, [currentStep, steps]);

  // Filter data by search terms
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
      spell.name.toLowerCase().includes(debouncedSpellSearch.toLowerCase()) ||
      (Array.isArray(spell.desc) ? spell.desc.join(' ') : spell.desc || '')
        .toLowerCase().includes(debouncedSpellSearch.toLowerCase())
    );
  }, [spellsData, debouncedSpellSearch]);

  // ===========================
  // INFORMAÇÕES DE MAGIAS PARA CLASSE ATUAL - ✨ NOVO
  // ===========================

  const spellInfo = useMemo(() => {
    if (!characterData.selectedClass || !characterData.selectedClass.spellcasting) {
      return { maxSpellLevel: 0, startingCantrips: 0, startingSpells: 0 };
    }

    const classIndex = characterData.selectedClass.index;
    const classConfig = SPELL_CONFIG_BY_CLASS[classIndex];
    
    if (!classConfig) {
      return { maxSpellLevel: 0, startingCantrips: 0, startingSpells: 0 };
    }

    return {
      maxSpellLevel: classConfig.maxSpellLevel,
      startingCantrips: classConfig.cantripsKnown,
      startingSpells: classConfig.spellsKnown,
    };
  }, [characterData.selectedClass]);

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
    // Se mudou a classe, limpar magias inválidas - ✨ ADICIONADO
    if (field === 'selectedClass' && value) {
      const newClass = value as DndClass;
      const currentSpells = characterData.selectedSpells || [];
      
      if (currentSpells.length > 0) {
        console.log(`🔄 Classe mudou para ${newClass.name}, validando magias...`);
        
        // Filtrar magias válidas para a nova classe
        const validSpells = currentSpells.filter(spellIndex => {
          const spell = spellsData.find(s => s.index === spellIndex);
          return spell && canClassAccessSpell(newClass.index, spell);
        });
        
        if (validSpells.length !== currentSpells.length) {
          console.log(`⚠️ ${currentSpells.length - validSpells.length} magia(s) removida(s) por incompatibilidade`);
          
          setCharacterData(prev => ({
            ...prev,
            [field]: value,
            selectedSpells: validSpells,
          }));
          return;
        }
      }
    }

    setCharacterData(prev => ({ ...prev, [field]: value }));
  }, [characterData.selectedSpells, spellsData]);

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

  // ===========================
  // FUNÇÃO PARA TOGGLE DE MAGIAS - ✨ NOVO
  // ===========================

  const toggleSpell = useCallback((spellIndex: string) => {
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
  // UTILITY FUNCTIONS - CORRIGIDAS
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
  // STEP VALIDATION - ORIGINAL COM MAGIAS ADICIONADAS
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
        // ✨ NOVA VALIDAÇÃO DE MAGIAS
        if (!characterData.selectedClass) {
          console.log("🔧 spells: Nenhuma classe selecionada");
          return false;
        }
        
        const classIndex = characterData.selectedClass.index;
        const classConfig = SPELL_CONFIG_BY_CLASS[classIndex];
        
        if (!classConfig || !classConfig.isSpellcaster) {
          console.log("🔧 spells: Classe não é conjuradora - válido");
          return true;
        }
        
        const currentSelection = characterData.selectedSpells || [];
        const validation = validateSpellSelection(classIndex, currentSelection, spellsData);
        
        console.log("🔧 spells validation:", {
          valid: validation.isValid,
          cantrips: `${validation.cantripsCount}/${classConfig.cantripsKnown}`,
          spells: `${validation.spellsCount}/${classConfig.spellsKnown}`,
          errors: validation.errors
        });
        
        return validation.isValid;

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
  }, [
    // 🔥 DEPENDÊNCIAS ESPECÍFICAS ao invés de characterData completo para evitar loop
    characterData.name,
    characterData.selectedRace,
    characterData.selectedClass,
    characterData.selectedBackground,
    characterData.selectedSkills,
    characterData.selectedEquipment,
    characterData.selectedSpells,
    characterData.personalityTraits,
    characterData.ideals,
    characterData.bonds,
    characterData.flaws,
    characterData.abilityScores,
    characterData.availableSkillChoices,
    characterData.isSpellcaster,
    spellsData
  ]);

  const validateCurrentStep = useCallback((): boolean => {
    return currentStepData ? validateStep(currentStepData.id) : false;
  }, [currentStepData?.id, validateStep]); // 🔥 APENAS o ID, não o objeto completo

  const canProceed = useCallback((): boolean => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  // ===========================
  // STEP NAVIGATION - ORIGINAL
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
  // CHARACTER ACTIONS - ORIGINAL
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
  // UPDATE STEP VALIDATION STATUS - CORRIGIDO SEM LOOP INFINITO
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
  }, [
    // 🔥 APENAS as propriedades que realmente importam para validação
    characterData.name,
    characterData.selectedRace?.index,
    characterData.selectedClass?.index,
    characterData.selectedBackground?.index,
    characterData.selectedSkills?.length,
    characterData.selectedEquipment?.length,
    characterData.selectedSpells?.length,
    characterData.personalityTraits?.length,
    characterData.ideals?.length,
    characterData.bonds?.length,
    characterData.flaws?.length,
    JSON.stringify(characterData.abilityScores),
    // 🔥 REMOVIDO validateStep para quebrar o ciclo
  ]);

  // 🔥 FORÇAR VALIDAÇÃO IMEDIATA QUANDO EQUIPMENTS MUDAM - CORRIGIDO
  useEffect(() => {
    console.log("⚡ ===== EQUIPMENT CHANGED - FORCING VALIDATION =====");
    console.log("⚡ selectedEquipment:", characterData.selectedEquipment);
    
    // Forçar validação do step equipment usando lógica inline
    const equipmentValid = characterData.selectedEquipment && 
                          Array.isArray(characterData.selectedEquipment) &&
                          characterData.selectedEquipment.length > 0;
    console.log("⚡ Equipment validation result:", equipmentValid);
    
    console.log("⚡ ================================================");
  }, [characterData.selectedEquipment?.length]); // 🔥 APENAS o tamanho, não validateStep

  // ===========================
  // ERROR HANDLING - ORIGINAL
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
  // AUTO-UPDATE EFFECT FOR CLASS CHANGES - CORRIGIDO
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
  }, [characterData.selectedClass?.index]); // 🔥 APENAS o index para evitar loop

  // ===========================
  // RETURN CONTEXT VALUE - ORIGINAL + MAGIAS
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
    toggleSpell, // ✨ NOVO

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
    // UTILITY FUNCTIONS (PRINCIPAIS) - TODAS ORIGINAIS
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
    // UTILITY FUNCTIONS (ADICIONAIS) - ORIGINAIS
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

    // ===========================
    // INFORMAÇÕES DE MAGIAS - ✨ NOVO
    // ===========================
    
    spellInfo,
    maxSpellLevel: spellInfo.maxSpellLevel,
    startingCantrips: spellInfo.startingCantrips,
    startingSpells: spellInfo.startingSpells,
    
    // Dados de magias filtrados por classe - ✨ NOVO
    availableSpells: spellsData,
    isSpellcaster: characterData.isSpellcaster,
    cantripsKnown: spellInfo.startingCantrips,
    spellsKnown: spellInfo.startingSpells,
    
    // Funções de validação de magias - ✨ NOVO
    validateSpellSelection: (spells?: string[]) => {
      const selection = spells || characterData.selectedSpells || [];
      const classIndex = characterData.selectedClass?.index;
      if (!classIndex) return { isValid: false, errors: ["Nenhuma classe selecionada"], warnings: [], cantripsCount: 0, spellsCount: 0, maxCantrips: 0, maxSpells: 0 };
      
      return validateSpellSelection(classIndex, selection, spellsData);
    },
    
    getSpellSelectionSummary: () => {
      const selection = characterData.selectedSpells || [];
      return {
        total: selection.length,
        cantrips: selection.filter(spellIndex => {
          const spell = spellsData.find(s => s.index === spellIndex);
          return spell?.level === 0;
        }).length,
        levelSpells: selection.filter(spellIndex => {
          const spell = spellsData.find(s => s.index === spellIndex);
          return spell && spell.level > 0;
        }).length,
      };
    },

    error,
  };

  // 🚨 TESTE DIRETO - VALIDAÇÃO EQUIPMENT (dentro da função) - ORIGINAL
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
// PROVIDER COMPONENT - ORIGINAL
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
// CONTEXT HOOK - ORIGINAL
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

// Export individual hooks for flexibility - ORIGINAL
export {
  useRacesQuery,
  useSubracesQuery,
  useClassesQuery,
  useBackgroundsQuery,
  useSpellsQuery,
  useSubclassesQuery,
};