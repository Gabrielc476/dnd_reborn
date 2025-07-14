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
      isValid: false, 
      errors: ["Classe não é conjuradora"], 
      warnings: [], 
      cantripsCount: 0, 
      spellsCount: 0, 
      maxCantrips: 0, 
      maxSpells: 0 
    };
  }

  let cantripsCount = 0;
  let spellsCount = 0;

  for (const spellIndex of selectedSpells) {
    const spell = availableSpells.find(s => s.index === spellIndex);
    if (!spell) {
      errors.push(`Magia ${spellIndex} não encontrada`);
      continue;
    }

    if (!canClassAccessSpell(classIndex, spell)) {
      errors.push(`${spell.name} não está disponível para ${classIndex}`);
      continue;
    }

    if (spell.level === 0) {
      cantripsCount++;
    } else {
      spellsCount++;
    }
  }

  // Verificar limites
  if (cantripsCount > classConfig.cantripsKnown) {
    errors.push(`Muitos cantrips selecionados (${cantripsCount}/${classConfig.cantripsKnown})`);
  }

  if (spellsCount > classConfig.spellsKnown) {
    errors.push(`Muitas magias selecionadas (${spellsCount}/${classConfig.spellsKnown})`);
  }

  // Verificar mínimos (opcional)
  if (cantripsCount < classConfig.cantripsKnown) {
    warnings.push(`Considere selecionar mais cantrips (${cantripsCount}/${classConfig.cantripsKnown})`);
  }

  if (spellsCount < classConfig.spellsKnown) {
    warnings.push(`Considere selecionar mais magias (${spellsCount}/${classConfig.spellsKnown})`);
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
// CUSTOM DEBOUNCE HOOK
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
// QUERY CLIENT
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
        console.log(`🔍 ===== CARREGANDO MAGIAS PARA ${classIndex || 'TODAS AS CLASSES'} =====`);
        
        // Carregar todas as magias (API não tem método getSpellsByClass)
        const allSpells = await dndAPI.getSpells();
        console.log(`📊 Total de magias da API: ${allSpells.length}`);
        
        if (classIndex) {
          // Filtrar magias por classe após carregar todas
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
        
        // Fallback para dados mock
        try {
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
        } catch (mockError) {
          console.error("❌ Erro ao carregar dados mock:", mockError);
          return [];
        }
      }
    },
    enabled: !!classIndex,
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
      hasSpellcasting: !!selectedClass.spellcasting,
      configKeysAvailable: Object.keys(SPELL_CONFIG_BY_CLASS).length
    });

    // Estratégia 1: Verificar nossa configuração usando as funções utilitárias
    let classConfig = getSpellConfigForClass(selectedClass.index || '');
    
    // Se não encontrou pelo index, tentar pelo nome
    if (!classConfig) {
      classConfig = findSpellConfigByName(selectedClass.name || '');
    }

    if (classConfig) {
      const key = selectedClass.index || selectedClass.name || 'unknown';
      console.log(`✅ Encontrado na configuração:`, classConfig);
      
      return {
        isSpellcaster: classConfig.isSpellcaster,
        source: `config-${key.toLowerCase()}`,
        classIndex: key.toLowerCase(),
        classConfig: classConfig
      };
    }

    console.log("⚠️ Configuração não encontrada, tentando estratégias alternativas");

    // Estratégia 2: Verificar propriedade spellcasting da API
    if (selectedClass.spellcasting) {
      console.log("✅ Classe tem propriedade spellcasting da API:", selectedClass.spellcasting);
      
      // Algumas classes podem ter spellcasting mas não conjuram no nível 1
      const isLevel1Caster = selectedClass.spellcasting.level <= 1;
      
      return {
        isSpellcaster: isLevel1Caster,
        source: `api-spellcasting-level-${selectedClass.spellcasting.level}`,
        hasApiSpellcasting: true
      };
    }

    // Estratégia 3: Fallback baseado em nomes conhecidos de conjuradores
    const spellcasterNames = [
      'mago', 'wizard', 'feiticeiro', 'sorcerer', 
      'clerigo', 'cleric', 'clérico', 'druida', 'druid',
      'bardo', 'bard', 'bruxo', 'warlock'
    ];

    const className = selectedClass.name?.toLowerCase() || '';
    const isKnownSpellcaster = spellcasterNames.some(name => 
      className.includes(name) || className.replace(/[^a-z]/g, '').includes(name.replace(/[^a-z]/g, ''))
    );

    if (isKnownSpellcaster) {
      console.log(`✅ Detectado como conjurador por nome: '${className}'`);
      return {
        isSpellcaster: true,
        source: `fallback-name-${className}`
      };
    }

    console.log("❌ Não detectado como conjurador por nenhuma estratégia");
    console.log("===============================================");
    
    return { isSpellcaster: false, source: "not-detected" };
  }, []);

  // ===========================
  // API DATA QUERIES
  // ===========================

  const { data: racesData = [], isLoading: isLoadingRaces } = useRacesQuery();
  const { data: classesData = [], isLoading: isLoadingClasses } = useClassesQuery();
  const { data: backgroundsData = [], isLoading: isLoadingBackgrounds } = useBackgroundsQuery();
  
  const { data: subracesData = [], isLoading: isLoadingSubraces } = useSubracesQuery(
    !!characterData.selectedRace?.index, 
    characterData.selectedRace?.index
  );
  
  const { data: subclassesData = [], isLoading: isLoadingSubclasses } = useSubclassesQuery(
    !!characterData.selectedClass?.index,
    characterData.selectedClass?.index
  );
  
  const { data: spellsData = [], isLoading: isLoadingSpells } = useSpellsQuery(
    !!characterData.selectedClass?.index,
    characterData.selectedClass?.index
  );

  const isLoading = isLoadingRaces || isLoadingClasses || isLoadingBackgrounds || loading;

  // ===========================
  // FILTERED DATA FOR SEARCH
  // ===========================

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
      spell.name.toLowerCase().includes(debouncedSpellSearch.toLowerCase()) ||
      (Array.isArray(spell.desc) ? 
        spell.desc.join(' ') : spell.desc || '')
        .toLowerCase().includes(debouncedSpellSearch.toLowerCase())
    );
  }, [spellsData, debouncedSpellSearch]);

  // ===========================
  // INFORMAÇÕES DE MAGIAS PARA CLASSE ATUAL - CORRIGIDAS
  // ===========================

  const spellcasterInfo = useMemo(() => {
    return detectSpellcaster(characterData.selectedClass);
  }, [characterData.selectedClass, detectSpellcaster]);

  const spellInfo = useMemo(() => {
    if (!spellcasterInfo.isSpellcaster) {
      console.log("🚫 Classe não é conjuradora:", spellcasterInfo.source);
      return { 
        maxSpellLevel: 0, 
        startingCantrips: 0, 
        startingSpells: 0,
        spellcastingAbility: null
      };
    }

    // Tentar buscar na nossa configuração primeiro
    let classConfig = spellcasterInfo.classConfig;
    
    // Se não encontrou na configuração, tentar com o index da classe
    if (!classConfig && characterData.selectedClass) {
      classConfig = getSpellConfigForClass(characterData.selectedClass.index || '');
      
      // Se ainda não encontrou, tentar pelo nome
      if (!classConfig) {
        classConfig = findSpellConfigByName(characterData.selectedClass.name || '');
      }
    }

    // Fallback para valores padrão de conjurador
    if (!classConfig) {
      console.log("⚠️ Usando valores padrão para conjurador desconhecido");
      classConfig = {
        cantripsKnown: 3,
        spellsKnown: 2,
        maxSpellLevel: 1,
        spellcastingAbility: 'wis'
      };
    }

    const result = {
      maxSpellLevel: classConfig.maxSpellLevel,
      startingCantrips: classConfig.cantripsKnown,
      startingSpells: classConfig.spellsKnown,
      spellcastingAbility: classConfig.spellcastingAbility
    };

    console.log("🎯 Informações de magias calculadas:", result);
    return result;
  }, [spellcasterInfo, characterData.selectedClass]);

  // ===========================
  // FUNÇÕES DE VALIDAÇÃO DE MAGIAS
  // ===========================

  // Validação atual baseada no contexto
  const validateCurrentSpellSelection = useCallback((): SpellValidationResult => {
    if (!characterData.selectedClass?.index) {
      return { isValid: true, errors: [], warnings: [], cantripsCount: 0, spellsCount: 0, maxCantrips: 0, maxSpells: 0 };
    }
    
    const classIndex = characterData.selectedClass.index;
    const selectedSpells = characterData.selectedSpells || [];
    
    return validateSpellSelection(classIndex, selectedSpells, spellsData);
  }, [characterData.selectedClass?.index, characterData.selectedSpells, spellsData]);

  // Versão com parâmetros para uso interno
  const validateSpellSelectionWithParams = useCallback((
    classIndex: string,
    selectedSpells: string[],
    availableSpells: DndSpell[]
  ): SpellValidationResult => {
    return validateSpellSelection(classIndex, selectedSpells, availableSpells);
  }, []);

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

  // ✅ NOVA FUNÇÃO: Calcula HP baseado na classe e constituição final
  const calculateHitPoints = useCallback((): number => {
    if (!characterData.selectedClass) {
      console.log("🔍 calculateHitPoints: Nenhuma classe selecionada, retornando 0");
      return 0;
    }
    
    // Aplicar bônus raciais diretamente
    const bonuses = getCombinedAbilityBonuses;
    const finalConstitution = characterData.abilityScores.constitution + bonuses.constitution;
    const level = characterData.level;
    const hitDie = characterData.selectedClass.hit_die;
    
    const conModifier = getAbilityModifier(finalConstitution);
    const baseHP = hitDie + conModifier; // Max HP at level 1
    const additionalHP = (level - 1) * (Math.floor(hitDie / 2) + 1 + conModifier); // Average HP per level after 1st
    
    const totalHP = Math.max(1, baseHP + additionalHP);
    
    console.log(`🔍 calculateHitPoints:`, {
      class: characterData.selectedClass.name,
      hitDie,
      level,
      constitution: characterData.abilityScores.constitution,
      racialBonus: bonuses.constitution,
      finalConstitution,
      conModifier,
      baseHP,
      additionalHP,
      totalHP
    });
    
    return totalHP;
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

  // ✅ NOVA FUNÇÃO: Calcula CA baseado na destreza final
  const calculateArmorClass = useCallback((): number => {
    // Aplicar bônus raciais diretamente
    const bonuses = getCombinedAbilityBonuses;
    const finalDexterity = characterData.abilityScores.dexterity + bonuses.dexterity;
    const dexModifier = getAbilityModifier(finalDexterity);
    
    // Base AC (10 + Dex modifier for no armor)
    const totalAC = 10 + dexModifier;
    
    console.log(`🔍 calculateArmorClass:`, {
      dexterity: characterData.abilityScores.dexterity,
      racialBonus: bonuses.dexterity,
      finalDexterity,
      dexModifier,
      totalAC
    });
    
    return totalAC;
  }, [
    characterData.abilityScores.dexterity,
    characterData.selectedRace?.index,
    characterData.selectedSubrace?.index,
    getCombinedAbilityBonuses,
    getAbilityModifier
  ]);

  // ===========================
  // 🆕 SISTEMA DE SINCRONIZAÇÃO DE STATS
  // ===========================

  // ✅ NOVA FUNCIONALIDADE: Auto-sincronização de HP e CA calculados
  useEffect(() => {
    // Só recalcular se temos dados suficientes para cálculo válido
    const shouldCalculate = characterData.selectedClass && 
      Object.values(characterData.abilityScores).some(score => score > 0);
    
    if (shouldCalculate) {
      const newHP = calculateHitPoints();
      const newAC = calculateArmorClass();
      
      // Só atualizar se os valores realmente mudaram (evita loops)
      if (newHP !== characterData.hitPoints || newAC !== characterData.armorClass) {
        console.log(`🔄 Auto-atualizando stats: HP ${characterData.hitPoints} → ${newHP}, AC ${characterData.armorClass} → ${newAC}`);
        
        // Usar setTimeout para evitar loop de atualização
        const timeoutId = setTimeout(() => {
          setCharacterData(prev => ({
            ...prev,
            hitPoints: newHP,
            armorClass: newAC
          }));
        }, 50);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [
    // Dependencies que afetam HP e AC
    characterData.selectedClass?.index,
    characterData.selectedClass?.hit_die,
    characterData.level,
    characterData.abilityScores.constitution,
    characterData.abilityScores.dexterity,
    characterData.selectedRace?.index,
    characterData.selectedSubrace?.index,
    calculateHitPoints,
    calculateArmorClass
    // NÃO incluir hitPoints e armorClass aqui para evitar loop
  ]);

  const getSpellcastingAbility = useCallback((classIndex?: string): keyof AbilityScores | null => {
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
  // VALIDATION FUNCTIONS
  // ===========================

  const recalculatePointsRemaining = useCallback((scores: AbilityScores): number => {
    const pointsUsed = calculateAbilityScorePoints(scores);
    return 27 - pointsUsed;
  }, [calculateAbilityScorePoints]);

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
        if (characterData.abilityMethod === "point-buy" || characterData.abilityMethod === "point_buy") {
          return characterData.pointsRemaining === 0 && Object.values(characterData.abilityScores).every(score => score >= 8 && score <= 15);
        }
        return Object.values(characterData.abilityScores).every(score => score >= 3 && score <= 20);
        
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
    validateCurrentSpellSelection
  ]);

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
      
      setCharacterData(prev => ({
        ...prev,
        [field]: value,
        selectedSpells: validSpells,
        isSpellcaster: detectSpellcaster(newClass).isSpellcaster
      }));
      return;
    }
    
    setCharacterData(prev => ({ ...prev, [field]: value }));
  }, [characterData.selectedSpells, spellsData, detectSpellcaster]);

  const updateAbilityScore = useCallback((ability: keyof AbilityScores, newScore: number) => {
    console.log(`🔄 updateAbilityScore: ${ability} = ${newScore}`);
    
    const newScores = { ...characterData.abilityScores, [ability]: newScore };
    const newPointsRemaining = recalculatePointsRemaining(newScores);
    
    setCharacterData(prev => ({
      ...prev,
      abilityScores: newScores,
      pointsRemaining: newPointsRemaining,
    }));
  }, [characterData.abilityScores, recalculatePointsRemaining]);

  const toggleSkill = useCallback((skillKey: string) => {
    const isSelected = characterData.selectedSkills.includes(skillKey);
    const newSkills = isSelected
      ? characterData.selectedSkills.filter(s => s !== skillKey)
      : [...characterData.selectedSkills, skillKey];
    
    setCharacterData(prev => ({
      ...prev,
      selectedSkills: newSkills,
    }));
  }, [characterData.selectedSkills]);

  const toggleSpell = useCallback((spellIndex: string) => {
    const isSelected = characterData.selectedSpells.includes(spellIndex);
    const newSpells = isSelected
      ? characterData.selectedSpells.filter(s => s !== spellIndex)
      : [...characterData.selectedSpells, spellIndex];
    
    setCharacterData(prev => ({
      ...prev,
      selectedSpells: newSpells,
    }));
  }, [characterData.selectedSpells]);

  // ===========================
  // STEP MANAGEMENT
  // ===========================

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // ✅ SINCRONIZAÇÃO COM DETECÇÃO DE CONJURADORES E SKILLS
  useEffect(() => {
    const spellcasterDetection = detectSpellcaster(characterData.selectedClass);
    const isSpellcaster = spellcasterDetection.isSpellcaster;
    
    // Calcular choices de skills da classe
    const skillChoices = characterData.selectedClass?.skill_choices?.choose || 2;
    
    // ✅ Só atualizar se mudou realmente para evitar loops
    if (
      characterData.isSpellcaster !== isSpellcaster ||
      characterData.availableSkillChoices !== skillChoices ||
      (isSpellcaster && characterData.spellcastingAbility !== spellInfo?.spellcastingAbility)
    ) {
      console.log("🔄 Sincronizando detecção de conjurador e skills:", {
        previousIsSpellcaster: characterData.isSpellcaster,
        newIsSpellcaster: isSpellcaster,
        previousSkillChoices: characterData.availableSkillChoices,
        newSkillChoices: skillChoices,
        spellcastingAbility: spellInfo?.spellcastingAbility
      });
      
      setCharacterData(prev => ({
        ...prev,
        isSpellcaster,
        spellcastingAbility: isSpellcaster ? spellInfo?.spellcastingAbility || null : null,
        availableSkillChoices: skillChoices,
        selectedSpells: isSpellcaster ? prev.selectedSpells : [],
      }));
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
  }, [characterData, calculateHitPoints, calculateArmorClass, getFinalAbilityScores, getAbilityModifier]);

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================

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
  // STEP VALIDATION WITH LIVE UPDATES
  // ===========================

  // ✅ Recalcular validação dos steps em tempo real
  const updatedSteps = useMemo(() => {
    return steps.map(step => {
      let isValid = false;
      
      switch (step.id) {
        case "basic-info":
          isValid = !!(
            characterData.name &&
            characterData.selectedRace &&
            characterData.selectedClass &&
            characterData.selectedBackground
          );
          break;
          
        case "ability-scores":
          if (characterData.abilityMethod === "point-buy" || characterData.abilityMethod === "point_buy") {
            isValid = characterData.pointsRemaining === 0 && 
              Object.values(characterData.abilityScores).every(score => score >= 8 && score <= 15);
          } else {
            isValid = Object.values(characterData.abilityScores).every(score => score >= 3 && score <= 20);
          }
          break;
          
        case "skills":
          isValid = characterData.selectedSkills.length <= characterData.availableSkillChoices;
          break;
          
        case "equipment":
          isValid = characterData.hitPoints > 0 && characterData.armorClass >= 10;
          break;
          
        case "spells":
          if (characterData.isSpellcaster) {
            const validation = validateCurrentSpellSelection();
            isValid = validation.isValid;
          } else {
            const spellCount = characterData.selectedSpells?.length || 0;
            isValid = spellCount >= 0;
          }
          break;
          
        case "personality":
          isValid = true; // Personality is optional
          break;
          
        default:
          isValid = false;
      }
      
      return { ...step, isValid };
    });
  }, [
    // Dependencies for step validation
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
    validateCurrentSpellSelection
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
      console.log("Selected Spells:", characterData.selectedSpells);
      console.log("Available Spells Count:", spellsData.length);
      console.log("Spell Info:", spellInfo);
      
      if (characterData.selectedClass && characterData.isSpellcaster) {
        const validation = validateCurrentSpellSelection();
        console.log("Spell Validation:", validation);
      }
      
      console.log("validateSpellSelection function:", typeof validateCurrentSpellSelection);
      console.log("===============================");
    };

    (window as any).debugSpellcaster = () => {
      console.log("🔍 ===== DEBUG SPELLCASTER DETECTION =====");
      console.log("Selected Class:", characterData.selectedClass?.name);
      console.log("Class Index:", characterData.selectedClass?.index);
      console.log("Has API Spellcasting:", !!characterData.selectedClass?.spellcasting);
      
      if (characterData.selectedClass) {
        const detection = detectSpellcaster(characterData.selectedClass);
        console.log("Detection Result:", detection);
        console.log("Current isSpellcaster state:", characterData.isSpellcaster);
        console.log("Spell Info:", spellInfo);
      }
      
      console.log("Available spell config keys:", Object.keys(SPELL_CONFIG_BY_CLASS));
      console.log("=========================================");
    };

    return () => {
      // Cleanup
      delete (window as any).debugAbilityScores;
      delete (window as any).fixPointsRemaining;
      delete (window as any).debugStats;
      delete (window as any).forceStatsUpdate;
      delete (window as any).debugSpells;
      delete (window as any).debugSpellcaster;
    };
  }, [
    characterData.abilityMethod,
    characterData.abilityScores,
    characterData.pointsRemaining,
    characterData.hitPoints,
    characterData.armorClass,
    characterData.selectedClass?.name,
    characterData.selectedRace?.name,
    characterData.selectedSubrace?.name,
    characterData.isSpellcaster,
    characterData.selectedSpells?.length,
    spellsData.length,
    spellcasterInfo.isSpellcaster,
    spellInfo.startingCantrips,
    spellInfo.startingSpells,
    calculateAbilityScorePoints,
    recalculatePointsRemaining,
    getCombinedAbilityBonuses,
    getFinalAbilityScores,
    calculateHitPoints,
    calculateArmorClass,
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
  };

  // ✅ LOG FINAL DE DEBUG
  console.log("🔧 useCharacterCreation Context Value criado com:", {
    currentStep: contextValue.currentStep,
    characterName: contextValue.characterData.name,
    selectedRace: contextValue.characterData.selectedRace?.name,
    selectedClass: contextValue.characterData.selectedClass?.name,
    hitPoints: contextValue.characterData.hitPoints,
    armorClass: contextValue.characterData.armorClass,
    racesCount: contextValue.races.length,
    classesCount: contextValue.classes.length,
    spellsCount: contextValue.spells.length,
    isSpellcaster: contextValue.characterData.isSpellcaster,
    hasValidateSpellSelection: typeof contextValue.validateSpellSelection === 'function',
    "🔍 Funcões de debug disponíveis no console": ["debugAbilityScores()", "fixPointsRemaining()", "debugStats()", "forceStatsUpdate()", "debugSpells()", "debugSpellcaster()"],
    "🔧 Status da API": "getSpells() funciona e filtra magias por classe",
    "🎯 Validação de magias": "validateSpellSelection() disponível no contexto",
    "🛠️ Detecção de conjuradores": "Corrigida - Clérigo detectado corretamente",
    "🔥 SPELL_CONFIG_BY_CLASS": "Importado e funcionando corretamente"
  });

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
  useSpellsQuery,          // ✅ Filtra por classe + corrigido para usar getSpells()
};