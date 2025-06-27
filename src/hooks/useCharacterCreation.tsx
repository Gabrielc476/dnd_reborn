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
        console.log("🌐 ===== RAÇAS CARREGADAS DA API OFICIAL =====");
        console.log(`📊 Total: ${races.length} raças`);
        console.log("📋 Lista:", races.map(r => r.name).join(", "));
        console.log("===============================================");
        return races;
      } catch (error) {
        console.error("❌ Erro ao carregar raças da API:", error);
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        const { mockRaces } = await import("@/data/mockRaces");
        console.log(`📊 Total: ${mockRaces.length} raças dos dados locais`);
        console.log("📋 Lista:", mockRaces.map(r => r.name).join(", "));
        console.log("===============================================");
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
          console.log(`🔍 ===== BUSCANDO SUBRAÇAS PARA ${raceIndex.toUpperCase()} =====`);
          const subraces = await dndAPI.getSubracesByRace(raceIndex);
          console.log(`📊 Total encontrado: ${subraces.length} subraças`);
          
          // Verificar quais vieram da API e quais dos mocks
          const { mockSubraces } = await import("@/data/mockSubRaces");
          const mockSubracesForRace = mockSubraces.filter(sr => sr.race.index === raceIndex);
          const mockIndices = mockSubracesForRace.map(sr => sr.index);
          
          const fromAPI = subraces.filter(sr => !mockIndices.includes(sr.index));
          const fromMock = subraces.filter(sr => mockIndices.includes(sr.index));
          
          console.log("📋 DETALHAMENTO POR FONTE:");
          if (fromAPI.length > 0) {
            console.log(`🌐 Da API oficial (${fromAPI.length}):`);
            fromAPI.forEach((subrace, index) => {
              console.log(`   ${index + 1}. ${subrace.name} (${subrace.index})`);
            });
          } else {
            console.log("🌐 Da API oficial: Nenhuma");
          }
          
          if (fromMock.length > 0) {
            console.log(`📋 Dos dados locais (${fromMock.length}):`);
            fromMock.forEach((subrace, index) => {
              console.log(`   ${index + 1}. ${subrace.name} (${subrace.index})`);
            });
          } else {
            console.log("📋 Dos dados locais: Nenhuma");
          }
          
          console.log("✅ LISTA FINAL COMPLETA:");
          subraces.forEach((subrace, index) => {
            const source = mockIndices.includes(subrace.index) ? "📋" : "🌐";
            console.log(`   ${index + 1}. ${source} ${subrace.name}`);
          });
          console.log("===============================================");
          return subraces;
        } else {
          const subraces = await dndAPI.getSubraces();
          console.log("🌐 ===== TODAS AS SUBRAÇAS DA API =====");
          console.log(`📊 Total: ${subraces.length} subraças`);
          console.log("===============================================");
          return subraces;
        }
      } catch (error) {
        console.error("❌ Erro ao carregar sub-raças da API:", error);
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        // 🎯 CORREÇÃO AQUI - IMPORTAÇÃO CORRETA:
        const { mockSubraces } = await import("@/data/mockSubRaces");
        if (raceIndex) {
          const raceSubraces = mockSubraces.filter(subrace => subrace.race.index === raceIndex);
          console.log(`📊 Total: ${raceSubraces.length} subraças de ${raceIndex} dos dados locais`);
          console.log("📋 LISTA DETALHADA:");
          raceSubraces.forEach((subrace, index) => {
            console.log(`   ${index + 1}. ${subrace.name} (${subrace.index})`);
          });
          console.log("===============================================");
          return raceSubraces;
        }
        console.log(`📊 Total: ${mockSubraces.length} subraças dos dados locais`);
        console.log("===============================================");
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
        console.log("🌐 ===== CLASSES CARREGADAS DA API OFICIAL =====");
        console.log(`📊 Total: ${classes.length} classes`);
        console.log("📋 Lista:", classes.map(c => c.name).join(", "));
        console.log("===============================================");
        return classes;
      } catch (error) {
        console.error("❌ Erro ao carregar classes da API:", error);
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        const { mockClasses } = await import("@/data/mockClasses");
        console.log(`📊 Total: ${mockClasses.length} classes dos dados locais`);
        console.log("📋 Lista:", mockClasses.map(c => c.name).join(", "));
        console.log("===============================================");
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
          console.log(`🔍 ===== BUSCANDO SUBCLASSES PARA ${classIndex.toUpperCase()} =====`);
          const subclasses = await dndAPI.getSubclassesByClass(classIndex);
          console.log(`📊 Total encontrado: ${subclasses.length} subclasses`);
          
          // Verificar quais vieram da API e quais dos mocks
          const { mockSubclasses } = await import("@/data/mockSubClasses");
          const mockSubclassesForClass = mockSubclasses.filter(sc => sc.class.index === classIndex);
          const mockIndices = mockSubclassesForClass.map(sc => sc.index);
          
          const fromAPI = subclasses.filter(sc => !mockIndices.includes(sc.index));
          const fromMock = subclasses.filter(sc => mockIndices.includes(sc.index));
          
          console.log("📋 DETALHAMENTO POR FONTE:");
          if (fromAPI.length > 0) {
            console.log(`🌐 Da API oficial (${fromAPI.length}):`);
            fromAPI.forEach((subclass, index) => {
              console.log(`   ${index + 1}. ${subclass.name} (${subclass.index})`);
            });
          } else {
            console.log("🌐 Da API oficial: Nenhuma");
          }
          
          if (fromMock.length > 0) {
            console.log(`📋 Dos dados locais (${fromMock.length}):`);
            fromMock.forEach((subclass, index) => {
              console.log(`   ${index + 1}. ${subclass.name} (${subclass.index})`);
            });
          } else {
            console.log("📋 Dos dados locais: Nenhuma");
          }
          
          console.log("✅ LISTA FINAL COMPLETA:");
          subclasses.forEach((subclass, index) => {
            const source = mockIndices.includes(subclass.index) ? "📋" : "🌐";
            console.log(`   ${index + 1}. ${source} ${subclass.name}`);
          });
          console.log("===============================================");
          return subclasses;
        } else {
          const subclasses = await dndAPI.getSubclasses();
          console.log("🌐 ===== TODAS AS SUBCLASSES DA API =====");
          console.log(`📊 Total: ${subclasses.length} subclasses`);
          console.log("===============================================");
          return subclasses;
        }
      } catch (error) {
        console.error("❌ Erro ao carregar subclasses da API:", error);
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        // 🎯 CORREÇÃO AQUI - IMPORTAÇÃO CORRETA:
        const { mockSubclasses } = await import("@/data/mockSubClasses");
        if (classIndex) {
          const classSubclasses = mockSubclasses.filter(subclass => subclass.class.index === classIndex);
          console.log(`📊 Total: ${classSubclasses.length} subclasses de ${classIndex} dos dados locais`);
          console.log("📋 LISTA DETALHADA:");
          classSubclasses.forEach((subclass, index) => {
            console.log(`   ${index + 1}. ${subclass.name} (${subclass.index})`);
          });
          console.log("===============================================");
          return classSubclasses;
        }
        console.log(`📊 Total: ${mockSubclasses.length} subclasses dos dados locais`);
        console.log("===============================================");
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
        console.log("🌐 ===== BACKGROUNDS CARREGADOS DA API OFICIAL =====");
        console.log(`📊 Total: ${backgrounds.length} backgrounds`);
        console.log("📋 Lista:", backgrounds.map(b => b.name).join(", "));
        console.log("===============================================");
        return backgrounds;
      } catch (error) {
        console.error("❌ Erro ao carregar backgrounds da API:", error);
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        const { mockBackgrounds } = await import("@/data/mockBackgrounds");
        console.log(`📊 Total: ${mockBackgrounds.length} backgrounds dos dados locais`);
        console.log("📋 Lista:", mockBackgrounds.map(b => b.name).join(", "));
        console.log("===============================================");
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
        if (classIndex) {
          console.log(`🔍 ===== BUSCANDO MAGIAS PARA ${classIndex.toUpperCase()} =====`);
          const spells = await dndAPI.getSpells();
          const classSpells = spells.filter(spell => 
            spell.classes.some(cls => cls.index === classIndex)
          );
          console.log(`📊 Total encontrado: ${classSpells.length} magias para ${classIndex}`);
          console.log("📋 Níveis disponíveis:", [...new Set(classSpells.map(s => s.level))].sort().join(", "));
          console.log("===============================================");
          return classSpells;
        } else {
          const spells = await dndAPI.getSpells();
          console.log("🌐 ===== TODAS AS MAGIAS DA API =====");
          console.log(`📊 Total: ${spells.length} magias`);
          console.log("📋 Níveis disponíveis:", [...new Set(spells.map(s => s.level))].sort().join(", "));
          console.log("===============================================");
          return spells;
        }
      } catch (error) {
        console.error("❌ Erro ao carregar magias da API:", error);
        console.log("🔄 ===== USANDO DADOS MOCK COMO FALLBACK =====");
        const { mockSpells } = await import("@/data/mockSpells");
        if (classIndex) {
          const classSpells = mockSpells.filter(spell => 
            spell.classes.some(cls => cls.index === classIndex)
          );
          console.log(`📊 Total: ${classSpells.length} magias de ${classIndex} dos dados locais`);
          console.log("📋 Níveis disponíveis:", [...new Set(classSpells.map(s => s.level))].sort().join(", "));
          console.log("===============================================");
          return classSpells;
        }
        console.log(`📊 Total: ${mockSpells.length} magias dos dados locais`);
        console.log("📋 Níveis disponíveis:", [...new Set(mockSpells.map(s => s.level))].sort().join(", "));
        console.log("===============================================");
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

  // 🎯 BUSCAR SUBRAÇAS BASEADO NA RAÇA SELECIONADA
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

  // 🎯 BUSCAR SUBCLASSES BASEADO NA CLASSE SELECIONADA
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
  // CHARACTER DATA MANAGEMENT
  // ===========================

  const updateCharacterData = useCallback((updates: Partial<CharacterCreationData>) => {
    console.log("🔄 ===== ATUALIZANDO DADOS DO PERSONAGEM =====");
    console.log("📝 Atualizações recebidas:", Object.keys(updates));
    
    // Log específico para seleção de raça
    if (updates.selectedRace) {
      console.log(`🧝 Nova raça selecionada: ${updates.selectedRace.name} (${updates.selectedRace.index})`);
      console.log("🔍 Isso deve triggerar busca de subraças...");
    }
    
    // Log específico para seleção de classe
    if (updates.selectedClass) {
      console.log(`⚔️ Nova classe selecionada: ${updates.selectedClass.name} (${updates.selectedClass.index})`);
      console.log("🔍 Isso deve triggerar busca de subclasses...");
    }
    
    setCharacterData(prev => {
      const newData = { ...prev, ...updates };
      console.log("✅ Dados atualizados com sucesso");
      console.log("===============================================");
      return newData;
    });
  }, []);

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================

  const getAbilityModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  const getCombinedAbilityBonuses = useMemo(() => {
    const bonuses: Record<string, number> = {};

    // Race bonuses
    if (characterData.selectedRace) {
      characterData.selectedRace.ability_bonuses.forEach(bonus => {
        const key = bonus.ability_score.index;
        bonuses[key] = (bonuses[key] || 0) + bonus.bonus;
      });
    }

    // Subrace bonuses
    if (characterData.selectedSubrace) {
      characterData.selectedSubrace.ability_bonuses.forEach(bonus => {
        const key = bonus.ability_score.index;
        bonuses[key] = (bonuses[key] || 0) + bonus.bonus;
      });
    }

    return bonuses;
  }, [characterData.selectedRace, characterData.selectedSubrace]);

  const calculateHitPoints = useCallback((constitution: number, level: number, hitDie: number): number => {
    const conModifier = getAbilityModifier(constitution);
    const baseHP = hitDie + conModifier;
    const additionalHP = (level - 1) * (Math.floor(hitDie / 2) + 1 + conModifier);
    return Math.max(1, baseHP + additionalHP);
  }, [getAbilityModifier]);

  const calculateArmorClass = useCallback((dexterity: number): number => {
    const dexModifier = getAbilityModifier(dexterity);
    return 10 + dexModifier;
  }, [getAbilityModifier]);

  const getSpellcastingAbility = useCallback((classIndex: string): string | null => {
    const spellcastingAbilities: Record<string, string> = {
      'wizard': 'int',
      'sorcerer': 'cha',
      'warlock': 'cha',
      'bard': 'cha',
      'cleric': 'wis',
      'druid': 'wis',
      'ranger': 'wis',
      'paladin': 'cha',
    };
    return spellcastingAbilities[classIndex] || null;
  }, []);

  // ===========================
  // SUBRACE & SUBCLASS FUNCTIONS
  // ===========================

  const getAvailableSubraces = useMemo(() => {
    if (!characterData.selectedRace) {
      console.log("🔍 Nenhuma raça selecionada para buscar subraças");
      return [];
    }
    
    console.log(`🔍 Buscando subraças para raça: ${characterData.selectedRace.name} (${characterData.selectedRace.index})`);
    console.log(`📊 Dados de subraças disponíveis: ${subracesData.length} itens`);
    
    const availableSubraces = subracesData.filter(subrace => 
      subrace.race.index === characterData.selectedRace?.index
    );
    
    console.log(`✅ Subraças filtradas para ${characterData.selectedRace.name}: ${availableSubraces.length}`);
    if (availableSubraces.length > 0) {
      console.log("📋 Lista:", availableSubraces.map(sr => `${sr.name} (${sr.index})`).join(", "));
    }
    
    return availableSubraces;
  }, [characterData.selectedRace, subracesData]);

  const getAvailableSubclasses = useMemo(() => {
    if (!characterData.selectedClass) {
      console.log("🔍 Nenhuma classe selecionada para buscar subclasses");
      return [];
    }
    
    console.log(`🔍 Buscando subclasses para classe: ${characterData.selectedClass.name} (${characterData.selectedClass.index})`);
    console.log(`📊 Dados de subclasses disponíveis: ${subclassesData.length} itens`);
    
    const availableSubclasses = subclassesData.filter(subclass => 
      subclass.class.index === characterData.selectedClass?.index
    );
    
    console.log(`✅ Subclasses filtradas para ${characterData.selectedClass.name}: ${availableSubclasses.length}`);
    if (availableSubclasses.length > 0) {
      console.log("📋 Lista:", availableSubclasses.map(sc => `${sc.name} (${sc.index})`).join(", "));
    }
    
    return availableSubclasses;
  }, [characterData.selectedClass, subclassesData]);

  const needsSubrace = useMemo(() => {
    return characterData.selectedRace && 
      ['elf', 'dwarf', 'halfling', 'gnome'].includes(characterData.selectedRace.index);
  }, [characterData.selectedRace]);

  const needsSubclass = useMemo(() => {
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

  const getAvailableSkills = useMemo(() => {
    if (!characterData.selectedClass) return [];
    
    // Get class skill proficiencies
    const classSkills = characterData.selectedClass.proficiency_choices
      .find(choice => choice.type === "proficiencies")?.from.options
      .map(option => option.item.index) || [];
    
    return classSkills;
  }, [characterData.selectedClass]);

  const getSkillChoices = useMemo(() => {
    if (!characterData.selectedClass) return 0;
    
    const skillChoice = characterData.selectedClass.proficiency_choices
      .find(choice => choice.type === "proficiencies");
    
    return skillChoice?.choose || 0;
  }, [characterData.selectedClass]);

  // ===========================
  // VALIDATION
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
    const fallbacks = [];
    
    if (racesError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR RAÇAS DA API =====");
      console.warn("📋 Detalhes:", racesError);
      console.warn("🔄 Usando dados mock como fallback");
      console.warn("===============================================");
      errors.push("raças");
      fallbacks.push("📋 Raças: dados locais");
    }
    
    if (classesError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR CLASSES DA API =====");
      console.warn("📋 Detalhes:", classesError);
      console.warn("🔄 Usando dados mock como fallback");
      console.warn("===============================================");
      errors.push("classes");
      fallbacks.push("📋 Classes: dados locais");
    }
    
    if (backgroundsError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR BACKGROUNDS DA API =====");
      console.warn("📋 Detalhes:", backgroundsError);
      console.warn("🔄 Usando dados mock como fallback");
      console.warn("===============================================");
      errors.push("backgrounds");
      fallbacks.push("📋 Backgrounds: dados locais");
    }
    
    if (spellsError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR MAGIAS DA API =====");
      console.warn("📋 Detalhes:", spellsError);
      console.warn("🔄 Usando dados mock como fallback");
      console.warn("===============================================");
      errors.push("magias");
      fallbacks.push("📋 Magias: dados locais");
    }

    if (subracesError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR SUB-RAÇAS DA API =====");
      console.warn("📋 Detalhes:", subracesError);
      console.warn("🔄 Usando dados mock como fallback");
      console.warn("===============================================");
      errors.push("sub-raças");
      fallbacks.push("📋 Sub-raças: dados locais");
    }

    if (subclassesError) {
      console.warn("⚠️ ===== ERRO AO CARREGAR SUBCLASSES DA API =====");
      console.warn("📋 Detalhes:", subclassesError);
      console.warn("🔄 Usando dados mock como fallback");
      console.warn("===============================================");
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
  // SPELL INFO CALCULATION
  // ===========================

  const spellInfo = useMemo(() => {
    if (!characterData.isSpellcaster || !characterData.selectedClass) {
      return {
        maxSpellLevel: 0,
        startingCantrips: 0,
        startingSpells: 0,
        availableCantrips: [],
        availableLevelSpells: [],
      };
    }

    // Spell progression by class and level
    const spellProgression: Record<string, { maxLevel: number; cantrips: number; spells: number }> = {
      'wizard': { maxLevel: 1, cantrips: 3, spells: 6 },
      'sorcerer': { maxLevel: 1, cantrips: 4, spells: 2 },
      'warlock': { maxLevel: 1, cantrips: 2, spells: 1 },
      'bard': { maxLevel: 1, cantrips: 2, spells: 4 },
      'cleric': { maxLevel: 1, cantrips: 3, spells: 2 },
      'druid': { maxLevel: 1, cantrips: 2, spells: 2 },
      'ranger': { maxLevel: 0, cantrips: 0, spells: 0 },
      'paladin': { maxLevel: 0, cantrips: 0, spells: 0 },
    };

    const classInfo = spellProgression[characterData.selectedClass.index] || 
      { maxLevel: 0, cantrips: 0, spells: 0 };

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
    getSubraceAbilityBonuses: getCombinedAbilityBonuses,
    getSubclassFeatures: (subclassIndex: string) => {
      const subclass = subclassesData.find(sc => sc.index === subclassIndex);
      return subclass?.subclass_levels.find(level => level.level <= characterData.level)?.features || [];
    },
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