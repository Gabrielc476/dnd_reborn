// ===========================
// OPTIMIZED CHARACTER CREATION HOOK - VERSÃO CORRIGIDA + SISTEMA DE MESCLAGEM RESTAURADO
// src/hooks/useCharacterCreation.tsx
// 
// 🔧 CORREÇÕES APLICADAS:
// - Loop infinito resolvido (Maximum update depth exceeded)
// - Validação de ability scores corrigida com suporte a múltiplos formatos
// - Bônus raciais aplicados corretamente
// - Sistema de mesclagem API + dados locais restaurado
// - Subraças e subclasses carregadas por raça/classe específica
// - Sistema de sincronização de pontos restantes
// - Funções de debug adicionadas
//
// 🛠️ PARA TESTAR:
// Abra o console do navegador e use:
// - debugAbilityScores() - mostra informações detalhadas sobre os pontos
// - fixPointsRemaining() - força recálculo dos pontos restantes
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
  'fighter': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: 'int', isSpellcaster: false },
  'rogue': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: 'int', isSpellcaster: false },
  'barbarian': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: null, isSpellcaster: false },
  'monk': { cantripsKnown: 0, spellsKnown: 0, maxSpellLevel: 0, spellcastingAbility: null, isSpellcaster: false },
};

// ===========================
// FUNÇÕES DE VALIDAÇÃO DE MAGIAS
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
  abilityMethod: "point-buy", // ✅ CORRIGIDO: usar formato consistente
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
// INDIVIDUAL QUERY HOOKS - COM SISTEMA DE MESCLAGEM API + DADOS LOCAIS
// ===========================

function useRacesQuery() {
  return useQuery({
    queryKey: ["dnd", "races"],
    queryFn: async () => {
      try {
        // 🎯 A API automaticamente mescla dados da API oficial com dados locais
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
        // 🎯 USAR O MÉTODO COM MESCLAGEM DE DADOS API + LOCAL
        const subraces = await dndAPI.getRaceSubraces(raceIndex);
        console.log("🌐 ===== SUB-RAÇAS CARREGADAS (API + DADOS LOCAIS) =====");
        console.log(`📊 Total: ${subraces.length} sub-raças para ${raceIndex}`);
        return subraces;
      } catch (error) {
        console.error("❌ Erro ao carregar sub-raças da API:", error);
        const { mockSubraces } = await import("@/data/mockSubRaces");
        
        // Filtrar por raça específica nos dados mock
        const filteredSubraces = mockSubraces.filter(
          subrace => subrace.race?.index === raceIndex
        );
        
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        console.log(`📊 Total: ${filteredSubraces.length} sub-raças dos dados locais para ${raceIndex}`);
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
        // 🎯 USAR O MÉTODO COM MESCLAGEM DE DADOS API + LOCAL
        const subclasses = await dndAPI.getClassSubclasses(classIndex);
        console.log("🌐 ===== SUBCLASSES CARREGADAS (API + DADOS LOCAIS) =====");
        console.log(`📊 Total: ${subclasses.length} subclasses para ${classIndex}`);
        return subclasses;
      } catch (error) {
        console.error("❌ Erro ao carregar subclasses da API:", error);
        const { mockSubclasses } = await import("@/data/mockSubClasses");
        
        // Filtrar por classe específica nos dados mock
        const filteredSubclasses = mockSubclasses.filter(
          subclass => subclass.class?.index === classIndex
        );
        
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        console.log(`📊 Total: ${filteredSubclasses.length} subclasses dos dados locais para ${classIndex}`);
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
        // 🎯 USAR O MÉTODO COM MESCLAGEM DE DADOS API + LOCAL
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
        
        // 🎯 A API já mescla dados oficiais com dados locais automaticamente
        const allSpells = await dndAPI.getSpells();
        console.log(`📊 Total de magias da API (com mesclagem): ${allSpells.length}`);
        
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
        
        console.log(`📊 Total de magias mock: ${mockSpells.length}`);
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

  // ✅ DEBUG: Log inicial dos dados
  console.log("🚀 Hook initialized with data:", {
    abilityMethod: characterData.abilityMethod,
    abilityScores: characterData.abilityScores,
    pointsRemaining: characterData.pointsRemaining
  });

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
  // INFORMAÇÕES DE MAGIAS PARA CLASSE ATUAL
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
    // Se mudou a classe, limpar magias inválidas
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
  }, [characterData.selectedSpells?.length, spellsData.length]);

  // Ability Scores - VERSÃO SIMPLIFICADA E ROBUSTA
  const updateAbilityScore = useCallback((ability: keyof AbilityScores, value: number) => {
    console.log(`🔧 updateAbilityScore called: ${ability} = ${value}`);
    
    setCharacterData(prev => {
      const newScore = Math.max(8, Math.min(15, value)); // Point buy range
      const oldScore = prev.abilityScores[ability];
      
      console.log(`🔧 Score change: ${ability} ${oldScore} → ${newScore}`);
      
      // Point costs for point-buy system
      const pointCosts: Record<number, number> = {
        8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
      };
      
      let newPointsRemaining = prev.pointsRemaining;
      
      // Only calculate point costs for point-buy method
      if (prev.abilityMethod === "point-buy" || prev.abilityMethod === "point_buy") {
        const oldCost = pointCosts[oldScore] || 0;
        const newCost = pointCosts[newScore] || 0;
        const costDiff = newCost - oldCost;
        
        // Check if we have enough points
        if (prev.pointsRemaining - costDiff < 0) {
          console.log(`🔧 Not enough points: need ${costDiff}, have ${prev.pointsRemaining}`);
          return prev; // Not enough points
        }
        
        newPointsRemaining = prev.pointsRemaining - costDiff;
        console.log(`🔧 Point calculation: ${oldCost} → ${newCost} (diff: ${costDiff}), remaining: ${prev.pointsRemaining} → ${newPointsRemaining}`);
      }
      
      const newState = {
        ...prev,
        abilityScores: {
          ...prev.abilityScores,
          [ability]: newScore,
        },
        pointsRemaining: newPointsRemaining,
      };
      
      console.log(`🔧 New state:`, {
        abilityScores: newState.abilityScores,
        pointsRemaining: newState.pointsRemaining,
        method: newState.abilityMethod
      });
      
      return newState;
    });
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
  // FUNÇÃO PARA TOGGLE DE MAGIAS
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
  }, [characterData.selectedSpells?.length, characterData.selectedClass?.index, spellsData.length, updateCharacterData]);

  // ===========================
  // UTILITY FUNCTIONS - CORRIGIDAS
  // ===========================

  const getAbilityModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  // ✅ FUNÇÃO CORRIGIDA: Calcula bônus raciais e aplica aos scores finais
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
  }, [characterData.selectedRace?.index, characterData.selectedSubrace?.index]);

  // ✅ FUNÇÃO AUXILIAR: Calcula scores finais (para uso interno)
  const getFinalAbilityScores = useCallback((): AbilityScores => {
    const bonuses = getCombinedAbilityBonuses;
    return {
      strength: characterData.abilityScores.strength + bonuses.strength,
      dexterity: characterData.abilityScores.dexterity + bonuses.dexterity,
      constitution: characterData.abilityScores.constitution + bonuses.constitution,
      intelligence: characterData.abilityScores.intelligence + bonuses.intelligence,
      wisdom: characterData.abilityScores.wisdom + bonuses.wisdom,
      charisma: characterData.abilityScores.charisma + bonuses.charisma,
    };
  }, [
    characterData.abilityScores.strength,
    characterData.abilityScores.dexterity,
    characterData.abilityScores.constitution,
    characterData.abilityScores.intelligence,
    characterData.abilityScores.wisdom,
    characterData.abilityScores.charisma,
    getCombinedAbilityBonuses
  ]);

  const calculateHitPoints = useCallback((): number => {
    if (!characterData.selectedClass) return 0;
    
    // Aplicar bônus raciais diretamente
    const bonuses = getCombinedAbilityBonuses;
    const finalConstitution = characterData.abilityScores.constitution + bonuses.constitution;
    const level = characterData.level;
    const hitDie = characterData.selectedClass.hit_die;
    
    const conModifier = getAbilityModifier(finalConstitution);
    const baseHP = hitDie + conModifier; // Max HP at level 1
    const additionalHP = (level - 1) * (Math.floor(hitDie / 2) + 1 + conModifier); // Average HP per level after 1st
    
    return Math.max(1, baseHP + additionalHP);
  }, [
    characterData.selectedClass?.index, 
    characterData.selectedClass?.hit_die, 
    characterData.level, 
    characterData.abilityScores.constitution,
    characterData.selectedRace?.index,
    characterData.selectedSubrace?.index,
    getCombinedAbilityBonuses,
    getAbilityModifier
  ]);

  const calculateArmorClass = useCallback((): number => {
    // Aplicar bônus raciais diretamente
    const bonuses = getCombinedAbilityBonuses;
    const finalDexterity = characterData.abilityScores.dexterity + bonuses.dexterity;
    const dexModifier = getAbilityModifier(finalDexterity);
    
    // Base AC (10 + Dex modifier for no armor)
    return 10 + dexModifier;
  }, [
    characterData.abilityScores.dexterity,
    characterData.selectedRace?.index,
    characterData.selectedSubrace?.index,
    getCombinedAbilityBonuses,
    getAbilityModifier
  ]);

  const getSpellcastingAbility = useCallback((classIndex?: string): keyof AbilityScores | null => {
    const targetClass = classIndex 
      ? classesData.find(c => c.index === classIndex)
      : characterData.selectedClass;
      
    if (!targetClass?.spellcasting) return null;
    
    return targetClass.spellcasting.spellcasting_ability.index as keyof AbilityScores;
  }, [characterData.selectedClass?.index, characterData.selectedClass?.spellcasting, classesData.length]);

  // Função auxiliar para subrace/subclass - CORRIGIDAS PARA USAR DADOS JÁ FILTRADOS
  const getAvailableSubraces = useCallback(() => {
    if (!characterData.selectedRace) return [];
    // Os dados já vêm filtrados pela raceIndex na query
    return subracesData;
  }, [characterData.selectedRace?.index, subracesData]);

  const getAvailableSubclasses = useCallback(() => {
    if (!characterData.selectedClass) return [];
    // Os dados já vêm filtrados pela classIndex na query
    return subclassesData;
  }, [characterData.selectedClass?.index, subclassesData]);

  const needsSubrace = useCallback(() => {
    return characterData.selectedRace && characterData.selectedRace.subraces?.length > 0;
  }, [characterData.selectedRace?.index, characterData.selectedRace?.subraces?.length]);

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
  }, [characterData.selectedClass?.index, characterData.level, getSubclassLevel]);

  const getAvailableSkills = useCallback(() => {
    if (!characterData.selectedClass) return [];
    
    const classSkills = characterData.selectedClass.proficiency_choices?.[0]?.from?.options || [];
    return classSkills
      .filter(option => option.option_type === "reference")
      .map(option => option.item)
      .filter(Boolean);
  }, [characterData.selectedClass?.index, characterData.selectedClass?.proficiency_choices]);

  const getSkillChoices = useCallback(() => {
    return characterData.selectedClass?.proficiency_choices?.[0]?.choose || 0;
  }, [characterData.selectedClass?.proficiency_choices]);

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

  // Função para calcular pontos usados no point buy - ✅ ADICIONADA
  const calculateAbilityScorePoints = useCallback((scores: AbilityScores) => {
    const pointCosts: Record<number, number> = {
      8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
    };
    
    return Object.values(scores).reduce((total, score) => {
      return total + (pointCosts[score] || 0);
    }, 0);
  }, []);

  // ✅ NOVA FUNÇÃO: Recalcular pontos restantes baseado nos scores atuais
  const recalculatePointsRemaining = useCallback((scores: AbilityScores): number => {
    const usedPoints = calculateAbilityScorePoints(scores);
    return 27 - usedPoints;
  }, [calculateAbilityScorePoints]);

  // ===========================
  // STEP VALIDATION - OTIMIZADA PARA EVITAR LOOPS
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
        // ✅ VALIDAÇÃO CORRIGIDA COM MÚLTIPLOS FORMATOS E LOGS DETALHADOS
        console.log(`🔧 ability-scores debug:`, {
          method: characterData.abilityMethod,
          scores: characterData.abilityScores,
          pointsRemaining: characterData.pointsRemaining
        });
        
        if (characterData.abilityMethod === "standard") {
          const totalPoints = Object.values(characterData.abilityScores).reduce((sum, score) => sum + score, 0);
          const standardValid = totalPoints === 72;
          console.log("🔧 ability-scores (standard) valid:", standardValid, "totalPoints:", totalPoints);
          return standardValid;
        } else if (characterData.abilityMethod === "point-buy" || characterData.abilityMethod === "point_buy") {
          const pointBuyValid = characterData.pointsRemaining === 0;
          console.log("🔧 ability-scores (point-buy) valid:", pointBuyValid, "pointsRemaining:", characterData.pointsRemaining);
          return pointBuyValid;
        } else if (characterData.abilityMethod === "rolled" || characterData.abilityMethod === "roll") {
          const allScoresValid = Object.values(characterData.abilityScores).every(score => score >= 3 && score <= 18);
          console.log("🔧 ability-scores (rolled) valid:", allScoresValid);
          return allScoresValid;
        } else {
          // ✅ FALLBACK: assumir point-buy se método for desconhecido
          console.log(`🔧 ability-scores: método desconhecido '${characterData.abilityMethod}', assumindo point-buy`);
          const fallbackValid = characterData.pointsRemaining === 0;
          console.log("🔧 ability-scores (fallback point-buy) valid:", fallbackValid);
          return fallbackValid;
        }

      case "skills":
        const skillsValid = characterData.selectedSkills.length === characterData.availableSkillChoices;
        console.log("🔧 skills valid:", skillsValid, "selected:", characterData.selectedSkills.length, "available:", characterData.availableSkillChoices);
        return skillsValid;

      case "equipment":
        const equipmentValid = characterData.selectedEquipment && 
                              Array.isArray(characterData.selectedEquipment) &&
                              characterData.selectedEquipment.length > 0;
        
        console.log("🔧 equipment valid:", equipmentValid);
        return equipmentValid;

      case "spells":
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
        
        const hasMinimumCantrips = validation.cantripsCount >= classConfig.cantripsKnown;
        const hasMinimumSpells = validation.spellsCount >= classConfig.spellsKnown;
        const spellsValid = hasMinimumCantrips && hasMinimumSpells && validation.isValid;
        
        console.log("🔧 spells validation:", {
          valid: spellsValid,
          cantrips: `${validation.cantripsCount}/${classConfig.cantripsKnown}`,
          spells: `${validation.spellsCount}/${classConfig.spellsKnown}`,
          errors: validation.errors
        });
        
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
  }, [
    // Dependências mínimas e estáveis
    characterData.name,
    characterData.selectedRace?.index,
    characterData.selectedClass?.index,
    characterData.selectedBackground?.index,
    characterData.selectedSkills.length,
    characterData.availableSkillChoices,
    characterData.selectedEquipment?.length,
    characterData.selectedSpells?.length,
    characterData.personalityTraits.length,
    characterData.ideals.length,
    characterData.bonds.length,
    characterData.flaws.length,
    characterData.abilityMethod,
    characterData.pointsRemaining,
    characterData.abilityScores.strength,
    characterData.abilityScores.dexterity,
    characterData.abilityScores.constitution,
    characterData.abilityScores.intelligence,
    characterData.abilityScores.wisdom,
    characterData.abilityScores.charisma,
    spellsData.length
  ]);

  const validateCurrentStep = useCallback((): boolean => {
    if (!currentStepData) return false;
    return validateStep(currentStepData.id);
  }, [currentStepData?.id, validateStep]);

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
  // UPDATE STEP VALIDATION STATUS - SEM DEPENDÊNCIAS CIRCULARES
  // ===========================

  useEffect(() => {
    console.log("🔄 ===== UPDATING STEP VALIDATION =====");
    
    setSteps(prev =>
      prev.map(step => {
        // Validação inline para evitar dependências circulares
        let isValid = false;
        
        switch (step.id) {
          case "basic-info":
            isValid = !!(
              characterData.name.trim() &&
              characterData.selectedRace &&
              characterData.selectedClass &&
              characterData.selectedBackground
            );
            break;

          case "ability-scores":
            // ✅ VALIDAÇÃO CORRIGIDA COM MÚLTIPLOS FORMATOS E FALLBACK
            if (characterData.abilityMethod === "standard") {
              // Standard array: scores should total 72 (15+14+13+12+10+8)
              const totalPoints = Object.values(characterData.abilityScores).reduce((sum, score) => sum + score, 0);
              isValid = totalPoints === 72;
              console.log(`🔧 ability-scores (standard): total=${totalPoints}, valid=${isValid}`);
            } else if (characterData.abilityMethod === "point-buy" || characterData.abilityMethod === "point_buy") {
              // Point buy: all points should be used
              isValid = characterData.pointsRemaining === 0;
              console.log(`🔧 ability-scores (point-buy): remaining=${characterData.pointsRemaining}, valid=${isValid}`);
            } else if (characterData.abilityMethod === "rolled" || characterData.abilityMethod === "roll") {
              // Rolled: any valid scores are acceptable
              const allScoresValid = Object.values(characterData.abilityScores).every(score => score >= 3 && score <= 18);
              isValid = allScoresValid;
              console.log(`🔧 ability-scores (rolled): valid=${isValid}`);
            } else {
              // ✅ FALLBACK: assumir point-buy se método for desconhecido
              console.log(`🔧 ability-scores: método desconhecido '${characterData.abilityMethod}', assumindo point-buy`);
              isValid = characterData.pointsRemaining === 0;
              console.log(`🔧 ability-scores (fallback): remaining=${characterData.pointsRemaining}, valid=${isValid}`);
            }
            break;

          case "skills":
            isValid = characterData.selectedSkills.length === characterData.availableSkillChoices;
            break;

          case "equipment":
            isValid = characterData.selectedEquipment && 
                     Array.isArray(characterData.selectedEquipment) &&
                     characterData.selectedEquipment.length > 0;
            break;

          case "spells":
            if (!characterData.selectedClass) {
              isValid = false;
            } else {
              const classIndex = characterData.selectedClass.index;
              const classConfig = SPELL_CONFIG_BY_CLASS[classIndex];
              
              if (!classConfig || !classConfig.isSpellcaster) {
                isValid = true; // Classe não é conjuradora
              } else {
                const currentSelection = characterData.selectedSpells || [];
                const validation = validateSpellSelection(classIndex, currentSelection, spellsData);
                const hasMinimumCantrips = validation.cantripsCount >= classConfig.cantripsKnown;
                const hasMinimumSpells = validation.spellsCount >= classConfig.spellsKnown;
                isValid = hasMinimumCantrips && hasMinimumSpells && validation.isValid;
              }
            }
            break;

          case "personality":
            isValid = (
              characterData.personalityTraits.length > 0 &&
              characterData.ideals.length > 0 &&
              characterData.bonds.length > 0 &&
              characterData.flaws.length > 0
            );
            break;

          default:
            isValid = false;
        }
        
        console.log(`🔄 Step ${step.id}: ${isValid ? '✅' : '❌'}`);
        
        return {
          ...step,
          isValid: isValid,
          isCompleted: isValid,
        };
      })
    );
  }, [
    // Apenas dependências primitivas para evitar loops
    characterData.name,
    characterData.selectedRace?.index,
    characterData.selectedClass?.index,
    characterData.selectedBackground?.index,
    characterData.selectedSkills.length,
    characterData.availableSkillChoices,
    characterData.selectedEquipment?.length,
    characterData.selectedSpells?.length,
    characterData.personalityTraits.length,
    characterData.ideals.length,
    characterData.bonds.length,
    characterData.flaws.length,
    characterData.abilityMethod,
    characterData.pointsRemaining,
    JSON.stringify(characterData.abilityScores),
    spellsData.length // Apenas o length, não o array completo
  ]);

  // ===========================
  // ERROR HANDLING E SISTEMA DE MESCLAGEM - RESTAURADO
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
      fallbacks.push("📋 Backgrounds: dados locais (com mesclagem)");
    }
    
    if (spellsError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR MAGIAS DA API =====");
      errors.push("magias");
      fallbacks.push("📋 Magias: dados locais");
    }

    if (subracesError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR SUB-RAÇAS DA API =====");
      errors.push("sub-raças");
      fallbacks.push("📋 Sub-raças: dados locais (com mesclagem)");
    }

    if (subclassesError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR SUBCLASSES DA API =====");
      errors.push("subclasses");
      fallbacks.push("📋 Subclasses: dados locais (com mesclagem)");
    }

    if (fallbacks.length > 0) {
      console.log("🛡️ ===== RESUMO DOS FALLBACKS =====");
      console.log("📊 Sistema de mesclagem API + dados locais ativo:");
      fallbacks.forEach(fallback => console.log(fallback));
      console.log("🔧 A API automaticamente combina dados oficiais com dados customizados");
      console.log("===============================================");
    }

    if (errors.length === 0) {
      console.log("✅ ===== TODOS OS DADOS CARREGADOS DA API =====");
      console.log("🌐 Conexão com API D&D funcionando perfeitamente!");
      console.log("🔧 Sistema de mesclagem API + dados locais funcionando!");
      console.log("===============================================");
    }
  }, [racesError, classesError, backgroundsError, spellsError, subracesError, subclassesError]);

  // ===========================
  // SINCRONIZAÇÃO DE PONTOS RESTANTES - ✅ NOVO (COM PROTEÇÃO CONTRA LOOPS)
  // ===========================

  useEffect(() => {
    // Recalcular pontos restantes quando ability scores mudarem (apenas para point-buy)
    if (characterData.abilityMethod === "point-buy" || characterData.abilityMethod === "point_buy") {
      const correctPointsRemaining = recalculatePointsRemaining(characterData.abilityScores);
      
      // Só atualizar se realmente houver diferença significativa
      if (Math.abs(correctPointsRemaining - characterData.pointsRemaining) > 0) {
        console.log(`🔧 Sincronizando pontos: ${characterData.pointsRemaining} → ${correctPointsRemaining}`);
        
        // Usar timeout para evitar loop imediato
        const timeoutId = setTimeout(() => {
          setCharacterData(prev => {
            // Double-check se ainda precisa da atualização
            const currentCorrect = recalculatePointsRemaining(prev.abilityScores);
            if (currentCorrect !== prev.pointsRemaining) {
              return {
                ...prev,
                pointsRemaining: currentCorrect
              };
            }
            return prev;
          });
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [
    // Apenas os ability scores individuais para detectar mudanças
    characterData.abilityScores.strength,
    characterData.abilityScores.dexterity,
    characterData.abilityScores.constitution,
    characterData.abilityScores.intelligence,
    characterData.abilityScores.wisdom,
    characterData.abilityScores.charisma,
    characterData.abilityMethod
    // NÃO incluir pointsRemaining aqui para evitar loop
  ]);

  useEffect(() => {
    if (characterData.selectedClass) {
      const isSpellcaster = !!characterData.selectedClass.spellcasting;
      const skillChoices = characterData.selectedClass.proficiency_choices?.[0]?.choose || 2;
      
      // Só atualizar se realmente mudou para evitar loops
      if (characterData.isSpellcaster !== isSpellcaster || 
          characterData.availableSkillChoices !== skillChoices) {
        
        setCharacterData(prev => ({
          ...prev,
          isSpellcaster,
          spellcastingAbility: isSpellcaster ? characterData.selectedClass?.spellcasting?.spellcasting_ability || null : null,
          availableSkillChoices: skillChoices,
          selectedSpells: isSpellcaster ? prev.selectedSpells : [],
        }));
      }
    }
  }, [
    characterData.selectedClass?.index, // Apenas o index
    characterData.selectedClass?.spellcasting, // E spellcasting info
    characterData.isSpellcaster, // Estado atual para comparação
    characterData.availableSkillChoices // Estado atual para comparação
  ]);

  // ===========================
  // RETURN CONTEXT VALUE
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
    // UTILITY FUNCTIONS - CORRIGIDAS
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
    
    // Additional utility functions
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
    // INFORMAÇÕES DE MAGIAS
    // ===========================
    
    spellInfo,
    maxSpellLevel: spellInfo.maxSpellLevel,
    startingCantrips: spellInfo.startingCantrips,
    startingSpells: spellInfo.startingSpells,
    
    // Dados de magias filtrados por classe
    availableSpells: spellsData,
    isSpellcaster: characterData.isSpellcaster,
    cantripsKnown: spellInfo.startingCantrips,
    spellsKnown: spellInfo.startingSpells,
    
    // Funções de validação de magias
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

    // ✅ FUNÇÕES DE DEBUG SIMPLIFICADAS
    debugAbilityScores: () => {
      const pointCosts: Record<number, number> = {
        8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
      };
      
      const usedPoints = Object.values(characterData.abilityScores).reduce((total, score) => {
        return total + (pointCosts[score] || 0);
      }, 0);
      
      const correctRemaining = 27 - usedPoints;
      const isValid = characterData.pointsRemaining === 0;
      
      console.log("🔧 ===== DEBUG ABILITY SCORES =====");
      console.log("Method:", characterData.abilityMethod);
      console.log("Scores:", characterData.abilityScores);
      console.log("Points used:", usedPoints);
      console.log("Points remaining (stored):", characterData.pointsRemaining);
      console.log("Points remaining (calculated):", correctRemaining);
      console.log("Is valid:", isValid);
      console.log("Step validation result:", validateStep("ability-scores"));
      console.log("==================================");
      
      return {
        method: characterData.abilityMethod,
        scores: characterData.abilityScores,
        usedPoints,
        storedRemaining: characterData.pointsRemaining,
        calculatedRemaining: correctRemaining,
        isValid,
        stepValid: validateStep("ability-scores")
      };
    },

    // ✅ FUNÇÃO PARA FORÇAR RECÁLCULO DOS PONTOS
    fixPointsRemaining: () => {
      const pointCosts: Record<number, number> = {
        8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
      };
      
      const usedPoints = Object.values(characterData.abilityScores).reduce((total, score) => {
        return total + (pointCosts[score] || 0);
      }, 0);
      
      const correctRemaining = 27 - usedPoints;
      
      console.log(`🔧 Corrigindo pontos: ${characterData.pointsRemaining} → ${correctRemaining}`);
      
      updateCharacterData({ pointsRemaining: correctRemaining });
      
      return correctRemaining;
    },

    recalculatePointsRemaining,

    error,
  };

  // ✅ EXPOR FUNÇÕES DE DEBUG GLOBALMENTE PARA TESTE
  if (typeof window !== 'undefined') {
    (window as any).debugAbilityScores = contextValue.debugAbilityScores;
    (window as any).fixPointsRemaining = contextValue.fixPointsRemaining;
    console.log("🔧 Debug functions available: debugAbilityScores(), fixPointsRemaining()");
  }

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

// Export individual hooks for flexibility - COM SISTEMA DE MESCLAGEM RESTAURADO
export {
  useRacesQuery,           // ✅ Mescla dados da API com dados locais
  useSubracesQuery,        // ✅ Filtra por raça específica + mesclagem
  useClassesQuery,         // ✅ Mescla dados da API com dados locais
  useSubclassesQuery,      // ✅ Filtra por classe específica + mesclagem
  useBackgroundsQuery,     // ✅ Mescla dados da API com dados locais
  useSpellsQuery,          // ✅ Filtra por classe + mesclagem de dados
};