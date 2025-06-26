// ===========================
// USE DND DATA HOOK - COMPLETO COM SISTEMA DE MAGIAS OTIMIZADO
// src/hooks/reutilizaveis/useDndData.tsx
// ===========================
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CharacterCreationData } from "@/types/characterCreation";
import { mockRaces } from "@/data/mockRaces";
import { mockClasses } from "@/data/mockClasses";
import { mockBackgrounds } from "@/data/mockBackgrounds";
import { mockSubraces } from "@/data/mockSubRaces";
import { mockSubclasses } from "@/data/mockSubClasses";

// IMPORTAR O NOVO HOOK DE MAGIAS OTIMIZADO
import { useCharacterSpells } from "@/hooks/reutilizaveis/useSpells";

// ===========================
// REACT QUERY HOOKS PARA DADOS BÁSICOS
// ===========================

function useRacesQuery() {
  return useQuery({
    queryKey: ["dnd", "races"],
    queryFn: () => mockRaces,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

function useClassesQuery() {
  return useQuery({
    queryKey: ["dnd", "classes"],
    queryFn: () => mockClasses,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

function useBackgroundsQuery() {
  return useQuery({
    queryKey: ["dnd", "backgrounds"],
    queryFn: () => mockBackgrounds,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

function useSubclassesQuery(enabled: boolean = true, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "subclasses", classIndex],
    queryFn: () => {
      // Usar dados mockados
      return mockSubclasses.filter(
        subclass => !classIndex || subclass.class.index === classIndex
      );
    },
    enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Retorna o nível máximo de magia para um personagem
 */
function getMaxSpellLevelForCharacter(characterData: CharacterCreationData): number {
  if (!characterData.isSpellcaster || !characterData.selectedClass) return 0;

  const classIndex = characterData.selectedClass.index;
  const characterLevel = characterData.level;

  switch (classIndex) {
    case "wizard":
    case "sorcerer":
    case "cleric":
    case "druid":
    case "bard":
      // Conjuradores completos
      if (characterLevel >= 17) return 9;
      if (characterLevel >= 15) return 8;
      if (characterLevel >= 13) return 7;
      if (characterLevel >= 11) return 6;
      if (characterLevel >= 9) return 5;
      if (characterLevel >= 7) return 4;
      if (characterLevel >= 5) return 3;
      if (characterLevel >= 3) return 2;
      return 1;
    
    case "paladin":
    case "ranger":
      // Meio-conjuradores
      if (characterLevel < 2) return 0;
      return Math.min(5, Math.ceil((characterLevel - 1) / 4) + 1);
    
    case "warlock":
      // Warlock tem progressão especial
      if (characterLevel >= 9) return 5;
      if (characterLevel >= 7) return 4;
      if (characterLevel >= 5) return 3;
      if (characterLevel >= 3) return 2;
      return 1;
    
    case "rogue":
      // Ladino Trapaceiro Arcano
      if (characterData.selectedSubclass?.index === "arcane-trickster") {
        if (characterLevel < 3) return 0;
        return Math.min(4, Math.ceil((characterLevel - 1) / 6) + 1);
      }
      return 0;
    
    case "fighter":
      // Guerreiro Cavaleiro Arcano
      if (characterData.selectedSubclass?.index === "eldritch-knight") {
        if (characterLevel < 3) return 0;
        return Math.min(4, Math.ceil((characterLevel - 1) / 6) + 1);
      }
      return 0;
    
    default:
      return 0;
  }
}

/**
 * Retorna magias disponíveis para o nível 1 da classe
 */
function getStartingSpellsForClass(classIndex: string): { cantrips: number; spells: number } {
  switch (classIndex) {
    case "wizard":
      return { cantrips: 3, spells: 6 }; // 6 magias no grimório
    case "sorcerer":
      return { cantrips: 4, spells: 2 };
    case "cleric":
    case "druid":
      return { cantrips: 3, spells: 2 };
    case "bard":
      return { cantrips: 2, spells: 4 };
    case "warlock":
      return { cantrips: 2, spells: 2 };
    case "paladin":
    case "ranger":
      return { cantrips: 0, spells: 0 }; // Começam no nível 2
    case "rogue":
    case "fighter":
      return { cantrips: 0, spells: 0 }; // Subclasses começam no nível 3
    default:
      return { cantrips: 0, spells: 0 };
  }
}

// ===========================
// MAIN HOOK - OTIMIZADO COM NOVO SISTEMA DE MAGIAS
// ===========================

export const useDndData = (
  characterData: CharacterCreationData,
  searchTerms: {
    debouncedRaceSearch: string;
    debouncedClassSearch: string;
    debouncedSpellSearch: string;
    debouncedBackgroundSearch: string;
  }
) => {
  // ===========================
  // QUERIES PARA DADOS BÁSICOS (RÁPIDOS)
  // ===========================

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
    isLoading: backgroundsLoading 
  } = useBackgroundsQuery();

  const { 
    data: subclassesData = [], 
    isLoading: subclassesLoading 
  } = useSubclassesQuery(
    true,
    characterData.selectedClass?.index
  );

  // ===========================
  // NOVO SISTEMA DE MAGIAS OTIMIZADO
  // ===========================

  const {
    spells: spellsData,
    isLoading: spellsLoading,
    error: spellsError,
    fetchSpells,
    maxSpellLevel,
    canCastSpells
  } = useCharacterSpells({
    selectedClass: characterData.selectedClass,
    level: characterData.level,
    isSpellcaster: characterData.isSpellcaster
  });

  // ===========================
  // FILTROS EM MEMÓRIA PARA DADOS CARREGADOS
  // ===========================

  // Filtrar raças por busca
  const filteredRaces = useMemo(() => {
    if (!searchTerms.debouncedRaceSearch) return racesData;
    return racesData.filter(race =>
      race.name.toLowerCase().includes(searchTerms.debouncedRaceSearch.toLowerCase())
    );
  }, [racesData, searchTerms.debouncedRaceSearch]);

  // Filtrar classes por busca
  const filteredClasses = useMemo(() => {
    if (!searchTerms.debouncedClassSearch) return classesData;
    return classesData.filter(cls =>
      cls.name.toLowerCase().includes(searchTerms.debouncedClassSearch.toLowerCase())
    );
  }, [classesData, searchTerms.debouncedClassSearch]);

  // Filtrar backgrounds por busca
  const filteredBackgrounds = useMemo(() => {
    if (!searchTerms.debouncedBackgroundSearch) return backgroundsData;
    return backgroundsData.filter(bg =>
      bg.name.toLowerCase().includes(searchTerms.debouncedBackgroundSearch.toLowerCase())
    );
  }, [backgroundsData, searchTerms.debouncedBackgroundSearch]);

  // Filtro adicional de magias por busca (além do filtro do hook useSpells)
  const filteredSpells = useMemo(() => {
    if (!searchTerms.debouncedSpellSearch) return spellsData;
    
    return spellsData.filter(spell =>
      spell.name.toLowerCase().includes(searchTerms.debouncedSpellSearch.toLowerCase()) ||
      spell.desc.some(desc => 
        desc.toLowerCase().includes(searchTerms.debouncedSpellSearch.toLowerCase())
      )
    );
  }, [spellsData, searchTerms.debouncedSpellSearch]);

  // ===========================
  // SUBRACES E SUBCLASSES DISPONÍVEIS
  // ===========================

  // Subraças disponíveis baseadas na raça selecionada
  const availableSubraces = useMemo(() => {
    if (!characterData.selectedRace) return [];
    return mockSubraces.filter(
      subrace => subrace.race.index === characterData.selectedRace?.index
    );
  }, [characterData.selectedRace]);

  // Subclasses disponíveis baseadas na classe selecionada
  const availableSubclasses = useMemo(() => {
    if (!characterData.selectedClass) return [];
    return subclassesData.filter(
      subclass => subclass.class.index === characterData.selectedClass?.index
    );
  }, [characterData.selectedClass, subclassesData]);

  // ===========================
  // INFORMAÇÕES SOBRE MAGIAS
  // ===========================

  // Informações sobre magias para criação de personagem
  const spellInfo = useMemo(() => {
    if (!characterData.selectedClass) {
      return { cantrips: 0, spells: 0, maxSpellLevel: 0 };
    }

    const startingSpells = getStartingSpellsForClass(characterData.selectedClass.index);
    const calculatedMaxSpellLevel = getMaxSpellLevelForCharacter(characterData);

    return {
      ...startingSpells,
      maxSpellLevel: calculatedMaxSpellLevel,
      availableCantrips: filteredSpells.filter(spell => spell.level === 0),
      availableLevelSpells: filteredSpells.filter(spell => 
        spell.level > 0 && spell.level <= calculatedMaxSpellLevel
      )
    };
  }, [characterData.selectedClass, characterData.level, filteredSpells, characterData]);

  // ===========================
  // HELPER FUNCTIONS
  // ===========================

  const getAvailableSubraces = () => availableSubraces;
  const getAvailableSubclasses = () => availableSubclasses;

  const getSubclassFeatures = (level: number = 1) => {
    if (!characterData.selectedSubclass) return [];
    
    const relevantLevels = characterData.selectedSubclass.subclass_levels.filter(
      levelInfo => levelInfo.level <= level
    );
    
    return relevantLevels.flatMap(levelInfo => levelInfo.features);
  };

  const getCombinedAbilityBonuses = () => {
    const bonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
    
    if (characterData.selectedRace) {
      characterData.selectedRace.ability_bonuses.forEach(bonus => {
        const abilityKey = bonus.ability_score.index as keyof typeof bonuses;
        bonuses[abilityKey] += bonus.bonus;
      });
    }
    
    if (characterData.selectedSubrace) {
      characterData.selectedSubrace.ability_bonuses.forEach(bonus => {
        const abilityKey = bonus.ability_score.index as keyof typeof bonuses;
        bonuses[abilityKey] += bonus.bonus;
      });
    }
    
    return bonuses;
  };

  const getSubraceAbilityBonuses = () => {
    if (!characterData.selectedSubrace) return [];
    return characterData.selectedSubrace.ability_bonuses;
  };

  // ===========================
  // RETURN - INTERFACE COMPLETA
  // ===========================

  return {
    // ===========================
    // DADOS PRINCIPAIS
    // ===========================
    races: filteredRaces,
    classes: filteredClasses,
    backgrounds: filteredBackgrounds,
    spells: filteredSpells, // Magias otimizadas
    subraces: availableSubraces,
    subclasses: availableSubclasses,

    // ===========================
    // ESTADOS DE LOADING
    // ===========================
    isLoadingRaces: racesLoading,
    isLoadingClasses: classesLoading,
    isLoadingBackgrounds: backgroundsLoading,
    isLoadingSpells: spellsLoading, // Novo loading otimizado
    isLoadingSubraces: false, // Sempre false pois usa dados locais
    isLoadingSubclasses: subclassesLoading,

    // ===========================
    // ERROS
    // ===========================
    racesError,
    classesError,
    spellsError, // Novo tratamento de erro

    // ===========================
    // FUNÇÕES HELPER ORIGINAIS
    // ===========================
    getAvailableSubraces,
    getAvailableSubclasses,
    getSubclassFeatures,
    getCombinedAbilityBonuses,
    getSubraceAbilityBonuses,

    // ===========================
    // NOVAS FUNÇÕES PARA MAGIAS OTIMIZADAS
    // ===========================
    fetchSpells, // Função para carregar magias sob demanda
    maxSpellLevel, // Nível máximo de magia calculado
    canCastSpells, // Se o personagem pode conjurar magias

    // ===========================
    // INFORMAÇÕES SOBRE MAGIAS (COMPATIBILIDADE)
    // ===========================
    spellInfo, // Objeto completo com informações de magias
    startingCantrips: spellInfo.cantrips, // Truques iniciais
    startingSpells: spellInfo.spells, // Magias iniciais
  };
};

// ===========================
// DEFAULT EXPORT PARA COMPATIBILIDADE
// ===========================

export default useDndData;