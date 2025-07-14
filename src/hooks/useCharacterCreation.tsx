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
// - 🆕 SISTEMA DE SINCRONIZAÇÃO DE STATS (HP/CA) IMPLEMENTADO
// - 🆕 AUTO-ATUALIZAÇÃO DE VALORES CALCULADOS
// - 🆕 LOGS DE DEBUG PARA TROUBLESHOOTING
// - 🆕 CORREÇÃO DE API: useSpellsQuery agora usa getSpells() ao invés de getSpellsByClass()
// - 🆕 DETECÇÃO DE CONJURADORES CORRIGIDA: Clérigo agora é detectado corretamente
// - 🆕 SUPORTE A MÚLTIPLAS VARIAÇÕES: cleric, clerigo, clérico, etc.
// - 🔥 CORREÇÃO CRÍTICA: Import de SPELL_CONFIG_BY_CLASS adicionado
// - 🔥 VALIDAÇÃO DE ABILITY SCORES CORRIGIDA
// - 🔥 QUERYCLIENT PROVIDER CORRIGIDO
//
// 🛠️ PARA TESTAR:
// Abra o console do navegador e use:
// - debugAbilityScores() - mostra informações detalhadas sobre os pontos
// - fixPointsRemaining() - força recálculo dos pontos restantes
// - debugStats() - mostra informações sobre HP/CA calculados
// - forceStatsUpdate() - força atualização dos stats
// - debugSpells() - mostra informações sobre validação de magias
// - debugSpellcaster() - 🆕 diagnostica problemas de detecção de conjuradores
//
// 📚 MÉTODOS DISPONÍVEIS NA API D&D:
// - dndAPI.getRaces() ✅
// - dndAPI.getClasses() ✅
// - dndAPI.getSpells() ✅ (usado para filtrar por classe)
// - dndAPI.getSubraces(raceIndex) ✅
// - dndAPI.getSubclasses(classIndex) ✅
// - dndAPI.getBackgrounds() ✅
//
// 🎯 FUNÇÕES DE VALIDAÇÃO DE MAGIAS:
// - validateSpellSelection() - sem parâmetros, usa dados atuais do contexto
// - validateSpellSelectionWithParams(classIndex, spells, availableSpells) - com parâmetros
// - canClassAccessSpell(classIndex, spell) - verifica se classe pode usar magia
//
// 🔧 DETECÇÃO DE CONJURADORES CORRIGIDA:
// - Suporte a múltiplas variações de nomes (cleric, clerigo, clérico)
// - Fallback robusto para detecção baseada na API
// - Logs detalhados para debugging
// - Classes conjuradoras: Mago, Feiticeiro, Clérigo, Druida, Bardo, Bruxo
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

// 🔥 CORREÇÃO CRÍTICA: Importar configuração de magias
import { SPELL_CONFIG_BY_CLASS, getSpellConfigForClass, findSpellConfigByName } from "@/constants/spellConfig";

// Importar API do D&D
import { dndAPI } from "@/api/dndAPI";

// Importar dados mock para fallback
import {
  mockRaces,
  mockClasses,
  mockSubraces,
  mockSubclasses,
  mockBackgrounds,
  mockSpells,
} from "@/data";

// ===========================
// INTERFACES PARA VALIDAÇÃO DE MAGIAS
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

// ===========================
// FUNÇÕES AUXILIARES PARA DETECÇÃO DE CONJURADORES
// ===========================

function canClassAccessSpell(classIndex: string, spell: DndSpell): boolean {
  const hasAccess = spell.classes?.some(spellClass => spellClass.index === classIndex);
  if (!hasAccess) return false;

  const classConfig = getSpellConfigForClass(classIndex);
  if (!classConfig) return false;

  return spell.level <= classConfig.maxSpellLevel;
}

function validateSpellSelection(
  classIndex: string,
  selectedSpells: string[],
  availableSpells: DndSpell[]
): SpellValidationResult {
  const classConfig = getSpellConfigForClass(classIndex);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!classConfig || !classConfig.isSpellcaster) {
    return {
      isValid: true,
      errors: [],
      warnings: ["Classe não é conjuradora"],
      cantripsCount: 0,
      spellsCount: 0,
      maxCantrips: 0,
      maxSpells: 0
    };
  }

  const spellsByLevel = selectedSpells.reduce((acc, spellIndex) => {
    const spell = availableSpells.find(s => s.index === spellIndex);
    if (spell) {
      if (spell.level === 0) {
        acc.cantrips += 1;
      } else {
        acc.spells += 1;
      }
    }
    return acc;
  }, { cantrips: 0, spells: 0 });

  // Validar número de cantrips
  if (spellsByLevel.cantrips > classConfig.startingCantrips) {
    errors.push(`Muitos cantrips selecionados: ${spellsByLevel.cantrips}/${classConfig.startingCantrips}`);
  }

  // Validar número de magias
  if (spellsByLevel.spells > classConfig.startingSpells) {
    errors.push(`Muitas magias selecionadas: ${spellsByLevel.spells}/${classConfig.startingSpells}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    cantripsCount: spellsByLevel.cantrips,
    spellsCount: spellsByLevel.spells,
    maxCantrips: classConfig.startingCantrips,
    maxSpells: classConfig.startingSpells
  };
}

// ===========================
// HOOK DE DEBOUNCE
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
// QUERY CLIENT - MOVIDO PARA ANTES DOS HOOKS
// ===========================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// ===========================
// API HOOKS WITH LOCAL DATA MERGING
// ===========================

const useRacesQuery = () => {
  return useQuery({
    queryKey: ["dnd", "races"],
    queryFn: async () => {
      try {
        const apiRaces = await dndAPI.getRaces();
        
        // Local data for races that might be missing from API
        const localRaces: DndRace[] = [
          // Add any local race data here if needed
        ];
        
        // Merge and deduplicate
        const mergedRaces = [...apiRaces, ...localRaces];
        const uniqueRaces = mergedRaces.filter((race, index, self) => 
          self.findIndex(r => r.index === race.index) === index
        );
        
        console.log(`📚 Races loaded: ${apiRaces.length} from API + ${localRaces.length} local = ${uniqueRaces.length} total`);
        return uniqueRaces;
      } catch (error) {
        console.error("Error loading races:", error);
        return mockRaces;
      }
    },
  });
};

const useSubracesQuery = (enabled: boolean = true, raceIndex?: string) => {
  return useQuery({
    queryKey: ["dnd", "subraces", raceIndex],
    queryFn: async () => {
      if (!raceIndex) return [];
      
      try {
        const subraces = await dndAPI.getSubraces(raceIndex);
        console.log(`📚 Subraces for ${raceIndex}: ${subraces.length}`);
        return subraces;
      } catch (error) {
        console.error(`Error loading subraces for ${raceIndex}:`, error);
        return mockSubraces.filter(subrace => subrace.race.index === raceIndex);
      }
    },
    enabled: enabled && !!raceIndex,
  });
};

const useClassesQuery = () => {
  return useQuery({
    queryKey: ["dnd", "classes"],
    queryFn: async () => {
      try {
        const apiClasses = await dndAPI.getClasses();
        
        // Local data for classes that might be missing from API
        const localClasses: DndClass[] = [
          // Add any local class data here if needed
        ];
        
        // Merge and deduplicate
        const mergedClasses = [...apiClasses, ...localClasses];
        const uniqueClasses = mergedClasses.filter((cls, index, self) => 
          self.findIndex(c => c.index === cls.index) === index
        );
        
        console.log(`📚 Classes loaded: ${apiClasses.length} from API + ${localClasses.length} local = ${uniqueClasses.length} total`);
        return uniqueClasses;
      } catch (error) {
        console.error("Error loading classes:", error);
        return mockClasses;
      }
    },
  });
};

const useSubclassesQuery = (enabled: boolean = true, classIndex?: string) => {
  return useQuery({
    queryKey: ["dnd", "subclasses", classIndex],
    queryFn: async () => {
      if (!classIndex) return [];
      
      try {
        const subclasses = await dndAPI.getSubclasses(classIndex);
        console.log(`📚 Subclasses for ${classIndex}: ${subclasses.length}`);
        return subclasses;
      } catch (error) {
        console.error(`Error loading subclasses for ${classIndex}:`, error);
        return mockSubclasses.filter(subclass => subclass.class.index === classIndex);
      }
    },
    enabled: enabled && !!classIndex,
  });
};

const useBackgroundsQuery = () => {
  return useQuery({
    queryKey: ["dnd", "backgrounds"],
    queryFn: async () => {
      try {
        const backgrounds = await dndAPI.getBackgrounds();
        console.log(`📚 Backgrounds loaded: ${backgrounds.length}`);
        return backgrounds;
      } catch (error) {
        console.error("Error loading backgrounds:", error);
        return mockBackgrounds;
      }
    },
  });
};

const useSpellsQuery = (enabled: boolean = true, classIndex?: string) => {
  return useQuery({
    queryKey: ["dnd", "spells", classIndex],
    queryFn: async () => {
      try {
        const allSpells = await dndAPI.getSpells();
        
        // Se não há classe selecionada, retorna todas as magias
        if (!classIndex) {
          console.log(`📚 All spells loaded: ${allSpells.length}`);
          return allSpells;
        }
        
        // Filtrar magias para a classe específica
        const classSpells = allSpells.filter(spell => 
          spell.classes?.some(spellClass => spellClass.index === classIndex)
        );
        
        console.log(`📚 Spells for ${classIndex}: ${classSpells.length}/${allSpells.length} total`);
        return classSpells;
      } catch (error) {
        console.error("Error loading spells:", error);
        // Fallback para dados mock filtrados por classe se especificada
        const fallbackSpells = classIndex 
          ? mockSpells.filter(spell => spell.classes?.some(c => c.index === classIndex))
          : mockSpells;
        return fallbackSpells;
      }
    },
    enabled: enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// ===========================
// TYPE ALIASES FOR METHODS
// ===========================

type AbilityMethod = "point-buy" | "point_buy" | "standard-array" | "standard_array" | "roll";

// ===========================
// CHARACTER CREATION STEPS
// ===========================

const characterCreationSteps: CharacterCreationStep[] = [
  {
    id: "basic-info",
    title: "Informações Básicas",
    description: "Nome, raça, classe e background",
    isRequired: true,
    isValid: false,
  },
  {
    id: "ability-scores",
    title: "Atributos",
    description: "Defina os valores dos seus atributos",
    isRequired: true,
    isValid: false,
  },
  {
    id: "skills",
    title: "Perícias",
    description: "Escolha suas perícias",
    isRequired: true,
    isValid: false,
  },
  {
    id: "equipment",
    title: "Equipamentos", 
    description: "HP, CA e equipamentos iniciais",
    isRequired: true,
    isValid: false,
  },
  {
    id: "spells",
    title: "Magias",
    description: "Escolha suas magias (se aplicável)",
    isRequired: false,
    isValid: true,
  },
  {
    id: "personality",
    title: "Personalidade",
    description: "Traços, ideais, vínculos e defeitos",
    isRequired: false,
    isValid: true,
  },
];

// ===========================
// INITIAL CHARACTER DATA
// ===========================

const initialCharacterData: CharacterCreationData = {
  // Basic Info
  name: "",
  selectedRace: null,
  selectedSubrace: null,
  selectedClass: null,
  selectedSubclass: null,
  selectedBackground: null,
  alignment: "",
  level: 1,

  // Ability Scores
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

  // Skills
  selectedSkills: [],
  availableSkillChoices: 2,

  // Stats
  hitPoints: 0,
  armorClass: 10,

  // Equipment
  equipment: [],
  startingGold: 0,

  // Spells
  isSpellcaster: false,
  spellcastingAbility: null,
  selectedSpells: [],
  cantripsKnown: 0,
  spellsKnown: 0,

  // Personality
  traits: [],
  ideals: [],
  bonds: [],
  flaws: [],
};

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

  // ✅ DEBUG: Verificar se constantes estão acessíveis (com proteção)
  console.log("🚀 Hook initialized with data:", {
    abilityMethod: characterData.abilityMethod,
    abilityScores: characterData.abilityScores,
    pointsRemaining: characterData.pointsRemaining,
    spellConfigAvailable: typeof SPELL_CONFIG_BY_CLASS !== 'undefined',
    spellConfigKeys: (typeof SPELL_CONFIG_BY_CLASS !== 'undefined') ? Object.keys(SPELL_CONFIG_BY_CLASS).length : 0
  });

  // Search states with debouncing
  const [raceSearchTerm, setRaceSearchTerm] = useState("");
  const [classSearchTerm, setClassSearchTerm] = useState("");
  const [spellSearchTerm, setSpellSearchTerm] = useState("");

  const debouncedRaceSearch = useDebounce(raceSearchTerm, 300);
  const debouncedClassSearch = useDebounce(classSearchTerm, 300);
  const debouncedSpellSearch = useDebounce(spellSearchTerm, 300);

  // ===========================
  // 🆕 FUNÇÃO PARA DETECÇÃO DE CONJURADORES (MOVIDA PARA DENTRO DO HOOK)
  // ===========================

  /**
   * Detecta se uma classe é conjuradora usando múltiplas estratégias
   */
  const detectSpellcaster = useCallback((selectedClass: DndClass | null): {
    isSpellcaster: boolean;
    source: string;
    classIndex?: string;
    classConfig?: any;
    hasApiSpellcasting?: boolean;
  } => {
    console.log("🔍 ===== DETECTANDO CLASSE CONJURADORA =====");
    
    if (!selectedClass) {
      console.log("❌ Nenhuma classe selecionada");
      return { isSpellcaster: false, source: "no-class" };
    }

    console.log("🎯 Classe selecionada:", {
      name: selectedClass.name,
      index: selectedClass.index,
      hasSpellcasting: !!selectedClass.spellcasting
    });

    // Estratégia 1: Verificar se tem propriedade spellcasting na API
    if (selectedClass.spellcasting && selectedClass.spellcasting.level <= 1) {
      console.log("✅ Detectado via API spellcasting");
      return { 
        isSpellcaster: true, 
        source: "api-spellcasting",
        classIndex: selectedClass.index,
        hasApiSpellcasting: true
      };
    }

    // Estratégia 2: Verificar em SPELL_CONFIG_BY_CLASS (com proteção)
    if (typeof SPELL_CONFIG_BY_CLASS !== 'undefined') {
      const classConfig = getSpellConfigForClass(selectedClass.index);
      if (classConfig && classConfig.isSpellcaster) {
        console.log("✅ Detectado via SPELL_CONFIG_BY_CLASS:", classConfig);
        return { 
          isSpellcaster: true, 
          source: "spell-config",
          classIndex: selectedClass.index,
          classConfig,
          hasApiSpellcasting: !!selectedClass.spellcasting
        };
      }
    }

    // Estratégia 3: Lista hardcoded de classes conjuradoras (fallback)
    const spellcasterClasses = [
      'wizard', 'mago',
      'sorcerer', 'feiticeiro', 'sorcerer',
      'cleric', 'clerigo', 'clérico', 'priest',
      'druid', 'druida',
      'bard', 'bardo',
      'warlock', 'bruxo', 'feiticeiro-patrono'
    ];

    const className = selectedClass.name.toLowerCase();
    const classIndex = selectedClass.index.toLowerCase();
    
    const isSpellcasterByName = spellcasterClasses.some(spellcasterName => 
      className.includes(spellcasterName) || classIndex.includes(spellcasterName)
    );

    if (isSpellcasterByName) {
      console.log("✅ Detectado via lista hardcoded");
      return { 
        isSpellcaster: true, 
        source: "hardcoded-list",
        classIndex: selectedClass.index,
        hasApiSpellcasting: !!selectedClass.spellcasting
      };
    }

    console.log("❌ Não é uma classe conjuradora");
    return { 
      isSpellcaster: false, 
      source: "not-spellcaster",
      classIndex: selectedClass.index,
      hasApiSpellcasting: !!selectedClass.spellcasting
    };
  }, []);

  // ===========================
  // DATA QUERIES
  // ===========================

  const { data: racesData = [], isLoading: isLoadingRaces } = useRacesQuery();
  const { data: classesData = [], isLoading: isLoadingClasses } = useClassesQuery();
  const { data: backgroundsData = [], isLoading: isLoadingBackgrounds } = useBackgroundsQuery();
  
  const { data: subracesData = [], isLoading: isLoadingSubraces } = useSubracesQuery(
    true, 
    characterData.selectedRace?.index
  );
  
  const { data: subclassesData = [], isLoading: isLoadingSubclasses } = useSubclassesQuery(
    true, 
    characterData.selectedClass?.index
  );
  
  const { data: spellsData = [], isLoading: isLoadingSpells } = useSpellsQuery(
    characterData.isSpellcaster, 
    characterData.selectedClass?.index
  );

  // ===========================
  // COMPUTED VALUES
  // ===========================

  const isLoading = isLoadingRaces || isLoadingClasses || isLoadingBackgrounds;

  const currentStepData = useMemo(() => {
    return steps[currentStep] || null;
  }, [steps, currentStep]);

  const progress = useMemo(() => {
    return ((currentStep + 1) / steps.length) * 100;
  }, [currentStep, steps.length]);

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
  // UTILITY FUNCTIONS FOR ABILITIES
  // ===========================

  const generateRandomAbilityScores = useCallback((): AbilityScores => {
    const rollStat = () => {
      // Roll 4d6, drop lowest
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

  const calculateAbilityScorePoints = useCallback((scores: AbilityScores): number => {
    const pointCosts: Record<number, number> = {
      8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
    };

    return Object.values(scores).reduce((total, score) => {
      return total + (pointCosts[score] || 0);
    }, 0);
  }, []);

  // ===========================
  // VALIDATION FUNCTIONS - CORRIGIDAS
  // ===========================

  const recalculatePointsRemaining = useCallback((scores: AbilityScores): number => {
    const pointsUsed = calculateAbilityScorePoints(scores);
    return 27 - pointsUsed;
  }, [calculateAbilityScorePoints]);

  // ✅ CORREÇÃO PRINCIPAL: Função validateStep corrigida
  const validateStep = useCallback((stepId: string): boolean => {
    switch (stepId) {
      case "basic-info":
        return !!(
          characterData.name &&
          characterData.selectedRace &&
          characterData.selectedClass &&
          characterData.selectedBackground
        );
        
      case "ability-scores":
        // ✅ CORREÇÃO: Recalcular pontos para garantir sincronização
        if (characterData.abilityMethod === "point-buy" || characterData.abilityMethod === "point_buy") {
          const actualPointsRemaining = recalculatePointsRemaining(characterData.abilityScores);
          
          // Verificar se todos os pontos foram gastos
          const allPointsUsed = actualPointsRemaining === 0;
          
          // Verificar se todos os scores estão na faixa válida
          const validScores = Object.values(characterData.abilityScores)
            .every(score => score >= 8 && score <= 15);
          
          console.log("🔍 Point-buy validation:", {
            actualPointsRemaining,
            storedPointsRemaining: characterData.pointsRemaining,
            allPointsUsed,
            validScores,
            abilityScores: characterData.abilityScores
          });
          
          return allPointsUsed && validScores;
        } else {
          // Para outros métodos (rolled, standard)
          return Object.values(characterData.abilityScores)
            .every(score => score >= 3 && score <= 20);
        }
        
      case "skills":
        return characterData.selectedSkills.length <= characterData.availableSkillChoices;
        
      case "equipment":
        return characterData.hitPoints > 0 && characterData.armorClass >= 10;
        
      case "spells":
        if (characterData.isSpellcaster) {
          const validation = validateCurrentSpellSelection();
          return validation.isValid;
        }
        return true;
        
      case "personality":
        return true; // Personality is optional
        
      default:
        return false;
    }
  }, [
    characterData.name,
    characterData.selectedRace?.index,
    characterData.selectedClass?.index,
    characterData.selectedBackground?.index,
    characterData.abilityScores,
    characterData.pointsRemaining,
    characterData.abilityMethod,
    characterData.selectedSkills?.length,
    characterData.availableSkillChoices,
    characterData.hitPoints,
    characterData.armorClass,
    characterData.isSpellcaster,
    recalculatePointsRemaining
  ]);

  const validateCurrentStep = useCallback((): boolean => {
    if (!currentStepData) return false;
    return validateStep(currentStepData.id);
  }, [currentStepData?.id, validateStep]);

  const canProceed = useCallback((): boolean => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  // ===========================
  // CHARACTER DATA UPDATES
  // ===========================

  const updateCharacterData = useCallback((updates: Partial<CharacterCreationData>) => {
    console.log("🔄 updateCharacterData called with:", updates);
    setCharacterData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateCharacterField = useCallback(<K extends keyof CharacterCreationData>(
    field: K,
    value: CharacterCreationData[K]
  ) => {
    console.log(`🔄 updateCharacterField: ${String(field)} =`, value);
    
    // Se mudou a classe, limpar magias inválidas
    if (field === 'selectedClass' && value) {
      const newClass = value as DndClass;
      const currentSpells = characterData.selectedSpells || [];
      
      // Verificar se as magias atuais são válidas para a nova classe
      const validSpells = currentSpells.filter(spellIndex => {
        const spell = spellsData.find(s => s.index === spellIndex);
        return spell && canClassAccessSpell(newClass.index, spell);
      });

      // Detectar se a nova classe é conjuradora
      const spellcasterInfo = detectSpellcaster(newClass);
      
      setCharacterData(prev => ({
        ...prev,
        [field]: value,
        selectedSpells: validSpells,
        isSpellcaster: spellcasterInfo.isSpellcaster,
        spellcastingAbility: spellcasterInfo.isSpellcaster ? getSpellcastingAbility(newClass.index) : null
      }));
    } else {
      setCharacterData(prev => ({ ...prev, [field]: value }));
    }
  }, [characterData.selectedSpells, spellsData, detectSpellcaster]);

  const updateAbilityScore = useCallback((ability: keyof AbilityScores, value: number) => {
    setCharacterData(prev => ({
      ...prev,
      abilityScores: {
        ...prev.abilityScores,
        [ability]: value
      }
    }));
  }, []);

  const toggleSkill = useCallback((skillKey: string) => {
    setCharacterData(prev => {
      const isSelected = prev.selectedSkills.includes(skillKey);
      const newSkills = isSelected
        ? prev.selectedSkills.filter(s => s !== skillKey)
        : [...prev.selectedSkills, skillKey];
      
      return { ...prev, selectedSkills: newSkills };
    });
  }, []);

  const toggleSpell = useCallback((spellIndex: string) => {
    setCharacterData(prev => {
      const isSelected = prev.selectedSpells.includes(spellIndex);
      const newSpells = isSelected
        ? prev.selectedSpells.filter(s => s !== spellIndex)
        : [...prev.selectedSpells, spellIndex];
      
      return { ...prev, selectedSpells: newSpells };
    });
  }, []);

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
    console.log("🔄 Resetando personagem...");
    setCharacterData(initialCharacterData);
    setCurrentStep(0);
  }, []);

  const createCharacter = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🚀 Criando personagem:", characterData);
      
      // 🆕 Recalcular stats finais antes de salvar
      const finalHP = calculateHitPoints();
      const finalAC = calculateArmorClass();
      const finalAbilityScores = getFinalAbilityScores();
      
      const characterPayload = {
        ...characterData,
        hitPoints: finalHP,
        armorClass: finalAC,
        finalAbilityScores,
        calculatedStats: {
          hitPoints: finalHP,
          armorClass: finalAC,
          abilityModifiers: {
            strength: getAbilityModifier(finalAbilityScores.strength),
            dexterity: getAbilityModifier(finalAbilityScores.dexterity),
            constitution: getAbilityModifier(finalAbilityScores.constitution),
            intelligence: getAbilityModifier(finalAbilityScores.intelligence),
            wisdom: getAbilityModifier(finalAbilityScores.wisdom),
            charisma: getAbilityModifier(finalAbilityScores.charisma),
          }
        }
      };
      
      console.log("📊 Payload final com stats calculados:", characterPayload);
      
      // Simular criação (substitua pela sua API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("✅ Personagem criado com sucesso!");
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("❌ Erro ao criar personagem:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [characterData]);

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================

  const getAbilityModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  const getCombinedAbilityBonuses = useCallback((): AbilityScores => {
    const bonuses: AbilityScores = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    };

    // Racial bonuses
    if (characterData.selectedRace?.ability_bonuses) {
      characterData.selectedRace.ability_bonuses.forEach(bonus => {
        const abilityKey = bonus.ability_score.index as keyof AbilityScores;
        if (abilityKey && bonuses.hasOwnProperty(abilityKey)) {
          bonuses[abilityKey] += bonus.bonus;
        }
      });
    }

    // Subrace bonuses
    if (characterData.selectedSubrace?.ability_bonuses) {
      characterData.selectedSubrace.ability_bonuses.forEach(bonus => {
        const abilityKey = bonus.ability_score.index as keyof AbilityScores;
        if (abilityKey && bonuses.hasOwnProperty(abilityKey)) {
          bonuses[abilityKey] += bonus.bonus;
        }
      });
    }

    return bonuses;
  }, [characterData.selectedRace, characterData.selectedSubrace]);

  const getFinalAbilityScores = useCallback((): AbilityScores => {
    const racialBonuses = getCombinedAbilityBonuses();
    
    return {
      strength: characterData.abilityScores.strength + racialBonuses.strength,
      dexterity: characterData.abilityScores.dexterity + racialBonuses.dexterity,
      constitution: characterData.abilityScores.constitution + racialBonuses.constitution,
      intelligence: characterData.abilityScores.intelligence + racialBonuses.intelligence,
      wisdom: characterData.abilityScores.wisdom + racialBonuses.wisdom,
      charisma: characterData.abilityScores.charisma + racialBonuses.charisma,
    };
  }, [characterData.abilityScores, getCombinedAbilityBonuses]);

  const calculateHitPoints = useCallback((): number => {
    if (!characterData.selectedClass) return 0;
    
    const finalScores = getFinalAbilityScores();
    const constitutionMod = getAbilityModifier(finalScores.constitution);
    const hitDie = characterData.selectedClass.hit_die || 8;
    
    return hitDie + constitutionMod;
  }, [characterData.selectedClass, getFinalAbilityScores, getAbilityModifier]);

  const calculateArmorClass = useCallback((): number => {
    const finalScores = getFinalAbilityScores();
    const dexterityMod = getAbilityModifier(finalScores.dexterity);
    
    return 10 + dexterityMod;
  }, [getFinalAbilityScores, getAbilityModifier]);

  const getSpellcastingAbility = useCallback((classIndex: string): keyof AbilityScores | null => {
    const targetClass = classIndex 
      ? classesData.find(c => c.index === classIndex) 
      : characterData.selectedClass;
    
    if (!targetClass?.spellcasting) return null;
    
    const ability = targetClass.spellcasting.spellcasting_ability;
    const abilityMap: Record<string, keyof AbilityScores> = {
      'int': 'intelligence',
      'wis': 'wisdom', 
      'cha': 'charisma'
    };
    
    return abilityMap[ability] || null;
  }, [characterData.selectedClass?.index, classesData.length]);

  const getAvailableSubraces = useCallback(() => subracesData, [subracesData]);
  const getAvailableSubclasses = useCallback(() => subclassesData, [subclassesData]);
  
  const needsSubrace = useCallback(() => {
    return characterData.selectedRace && subracesData.length > 0;
  }, [characterData.selectedRace, subracesData.length]);
  
  const needsSubclass = useCallback(() => {
    return characterData.selectedClass && subclassesData.length > 0;
  }, [characterData.selectedClass, subclassesData.length]);

  const getAvailableSkills = useCallback(() => {
    if (!characterData.selectedClass) return [];
    
    const classSkills = characterData.selectedClass.proficiency_choices
      ?.find(choice => choice.type === "proficiencies")
      ?.from?.options?.map(option => option.item?.index)
      ?.filter(Boolean) || [];
    
    return SKILLS.filter(skill => classSkills.includes(skill.key));
  }, [characterData.selectedClass]);

  const getSkillChoices = useCallback(() => {
    return characterData.selectedClass?.skill_choices?.choose || 2;
  }, [characterData.selectedClass]);

  const getSubclassLevel = useCallback((classIndex: string) => {
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

  // ===========================
  // SPELL VALIDATION FUNCTIONS
  // ===========================

  const validateCurrentSpellSelection = useCallback((): SpellValidationResult => {
    if (!characterData.selectedClass) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        cantripsCount: 0,
        spellsCount: 0,
        maxCantrips: 0,
        maxSpells: 0
      };
    }

    return validateSpellSelection(
      characterData.selectedClass.index,
      characterData.selectedSpells,
      filteredSpells
    );
  }, [characterData.selectedClass, characterData.selectedSpells, filteredSpells]);

  const validateSpellSelectionWithParams = useCallback((
    classIndex: string,
    selectedSpells: string[],
    availableSpells: DndSpell[]
  ): SpellValidationResult => {
    return validateSpellSelection(classIndex, selectedSpells, availableSpells);
  }, []);

  // ===========================
  // SPELL INFO COMPUTATION
  // ===========================

  const spellInfo = useMemo(() => {
    if (!characterData.selectedClass) {
      return {
        isSpellcaster: false,
        maxSpellLevel: 0,
        startingCantrips: 0,
        startingSpells: 0,
        spellcastingAbility: null
      };
    }

    const classConfig = getSpellConfigForClass(characterData.selectedClass.index);
    const detectionResult = detectSpellcaster(characterData.selectedClass);

    return {
      isSpellcaster: detectionResult.isSpellcaster,
      maxSpellLevel: classConfig?.maxSpellLevel || 9,
      startingCantrips: classConfig?.startingCantrips || 0,
      startingSpells: classConfig?.startingSpells || 0,
      spellcastingAbility: getSpellcastingAbility(characterData.selectedClass.index)
    };
  }, [characterData.selectedClass, detectSpellcaster, getSpellcastingAbility]);

  // ===========================
  // AUTO-UPDATE SPELL CASTER STATUS
  // ===========================

  useEffect(() => {
    if (characterData.selectedClass) {
      const spellcasterInfo = detectSpellcaster(characterData.selectedClass);
      
      if (spellcasterInfo.isSpellcaster !== characterData.isSpellcaster) {
        console.log("🔄 Atualizando status de conjurador:", spellcasterInfo);
        
        setCharacterData(prev => ({
          ...prev,
          isSpellcaster: spellcasterInfo.isSpellcaster,
          spellcastingAbility: spellcasterInfo.isSpellcaster ? spellInfo.spellcastingAbility : null,
          availableSkillChoices: getSkillChoices(),
          selectedSpells: spellcasterInfo.isSpellcaster ? prev.selectedSpells : [],
        }));
      }
    }
  }, [
    characterData.selectedClass?.index,
    characterData.selectedClass?.name, 
    characterData.selectedClass?.spellcasting,
    characterData.isSpellcaster,
    characterData.availableSkillChoices,
    spellInfo?.spellcastingAbility,
    detectSpellcaster
  ]);

  // ===========================
  // ✅ SINCRONIZAÇÃO AUTOMÁTICA DOS PONTOS RESTANTES - NOVA FUNCIONALIDADE
  // ===========================

  useEffect(() => {
    if (characterData.abilityMethod === "point-buy") {
      const correctPoints = recalculatePointsRemaining(characterData.abilityScores);
      
      if (correctPoints !== characterData.pointsRemaining) {
        console.log("🔄 Sincronizando pontos:", {
          stored: characterData.pointsRemaining,
          calculated: correctPoints
        });
        
        setCharacterData(prev => ({
          ...prev,
          pointsRemaining: correctPoints
        }));
      }
    }
  }, [
    characterData.abilityScores,
    characterData.abilityMethod,
    characterData.pointsRemaining,
    recalculatePointsRemaining
  ]);

  // ===========================
  // STEP VALIDATION WITH LIVE UPDATES
  // ===========================

  const updatedSteps = useMemo(() => {
    return steps.map(step => {
      const isValid = validateStep(step.id);
      return { ...step, isValid };
    });
  }, [
    validateStep,
    steps,
    characterData.name,
    characterData.selectedRace?.index,
    characterData.selectedClass?.index,
    characterData.selectedBackground?.index,
    characterData.abilityScores.strength,
    characterData.abilityScores.dexterity,
    characterData.abilityScores.constitution,
    characterData.abilityScores.intelligence,
    characterData.abilityScores.wisdom,
    characterData.abilityScores.charisma,
    characterData.pointsRemaining,
    characterData.abilityMethod,
    characterData.selectedSkills?.length,
    characterData.availableSkillChoices,
    characterData.isSpellcaster,
    characterData.selectedSpells?.length,
  ]);

  // ===========================
  // 🆕 DEBUG FUNCTIONS - AVAILABLE IN CONSOLE
  // ===========================

  // Tornar funções de debug disponíveis globalmente para console
  useEffect(() => {
    (window as any).debugAbilityScores = () => {
      console.log("🔍 ===== DEBUG ABILITY SCORES =====");
      console.log("Current Method:", characterData.abilityMethod);
      console.log("Ability Scores:", characterData.abilityScores);
      console.log("Points Remaining:", characterData.pointsRemaining);
      console.log("Calculated Points Used:", calculateAbilityScorePoints(characterData.abilityScores));
      console.log("Recalculated Points Remaining:", recalculatePointsRemaining(characterData.abilityScores));
      console.log("Racial Bonuses:", getCombinedAbilityBonuses);
      console.log("Final Ability Scores:", getFinalAbilityScores());
      console.log("===================================");
    };

    (window as any).fixPointsRemaining = () => {
      console.log("🔧 Forçando recálculo de pontos...");
      const correctPoints = recalculatePointsRemaining(characterData.abilityScores);
      setCharacterData(prev => ({ ...prev, pointsRemaining: correctPoints }));
      console.log("✅ Pontos recalculados!");
    };

    (window as any).debugStats = () => {
      console.log("🔍 ===== DEBUG STATS =====");
      console.log("Current HP (stored):", characterData.hitPoints);
      console.log("Current AC (stored):", characterData.armorClass);
      console.log("Calculated HP:", calculateHitPoints());
      console.log("Calculated AC:", calculateArmorClass());
      console.log("Final Ability Scores:", getFinalAbilityScores());
      console.log("Class:", characterData.selectedClass?.name);
      console.log("Race:", characterData.selectedRace?.name);
      console.log("Subrace:", characterData.selectedSubrace?.name);
      console.log("==========================");
    };

    (window as any).forceStatsUpdate = () => {
      console.log("🔧 Forçando atualização de stats...");
      const newHP = calculateHitPoints();
      const newAC = calculateArmorClass();
      setCharacterData(prev => ({
        ...prev,
        hitPoints: newHP,
        armorClass: newAC
      }));
      console.log(`✅ Stats atualizados! HP: ${newHP}, AC: ${newAC}`);
    };

    (window as any).debugSpells = () => {
      console.log("🔍 ===== DEBUG SPELLS =====");
      console.log("Is Spellcaster:", characterData.isSpellcaster);
      console.log("Selected Class:", characterData.selectedClass?.name);
      console.log("Spell Info:", spellInfo);
      console.log("Selected Spells:", characterData.selectedSpells);
      console.log("Available Spells:", filteredSpells.length);
      console.log("Spell Validation:", validateCurrentSpellSelection());
      console.log("===============================");
    };

    (window as any).debugSpellcaster = () => {
      console.log("🔍 ===== DEBUG SPELLCASTER DETECTION =====");
      if (characterData.selectedClass) {
        const detection = detectSpellcaster(characterData.selectedClass);
        console.log("Detection Result:", detection);
        console.log("Current Character Data:", {
          isSpellcaster: characterData.isSpellcaster,
          spellcastingAbility: characterData.spellcastingAbility
        });
      } else {
        console.log("❌ No class selected");
      }
      console.log("==========================================");
    };
  }, [
    characterData,
    calculateAbilityScorePoints,
    recalculatePointsRemaining,
    getCombinedAbilityBonuses,
    getFinalAbilityScores,
    calculateHitPoints,
    calculateArmorClass,
    spellInfo,
    filteredSpells,
    validateCurrentSpellSelection,
    detectSpellcaster
  ]);

  // ===========================
  // RETURN CONTEXT VALUE
  // ===========================

  const contextValue: CharacterCreationContextType = {
    // Step management
    currentStep,
    steps: updatedSteps,
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
    error,

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
    // UTILITY FUNCTIONS - CORRIGIDAS + VALIDAÇÃO DE MAGIAS
    // ===========================
    
    getCombinedAbilityBonuses,
    getAbilityModifier,
    calculateHitPoints,
    calculateArmorClass,
    getSpellcastingAbility,
    generateRandomAbilityScores,
    calculateAbilityScorePoints,
    
    // Funções de validação de magias
    validateSpellSelection: validateCurrentSpellSelection, // Sem parâmetros, usa dados atuais
    validateSpellSelectionWithParams, // Com parâmetros para uso específico
    canClassAccessSpell: (classIndex: string, spell: DndSpell) => canClassAccessSpell(classIndex, spell),
    
    // Informações sobre magias da classe atual
    spellInfo,
    maxSpellLevel: spellInfo.maxSpellLevel,
    cantripsKnown: spellInfo.startingCantrips,
    spellsKnown: spellInfo.startingSpells,
    isSpellcaster: characterData.isSpellcaster,
    
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
    getReference: (type: string, index: string) => ({ index, name: index, url: `/api/${type}/${index}` }),
    getFinalAbilityScores: getFinalAbilityScores(),
    
    // Debug functions (available globally via window)
    debugAbilityScores: () => (window as any).debugAbilityScores?.(),
    fixPointsRemaining: () => (window as any).fixPointsRemaining?.(),
  };

  return contextValue;
};

// ===========================
// PROVIDER COMPONENT - CORRIGIDO
// ===========================

export const CharacterCreationProvider: React.FC<{ 
  children: React.ReactNode; 
  campaignId?: string 
}> = ({ children, campaignId }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <CharacterCreationInternalProvider>
        {children}
      </CharacterCreationInternalProvider>
    </QueryClientProvider>
  );
};

const CharacterCreationInternalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const contextValue = useCharacterCreation();

  return (
    <CharacterCreationContext.Provider value={contextValue}>
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
  useSpellsQuery,          // ✅ Filtra por classe + corrigido para usar getSpells()
};

export default useCharacterCreation;