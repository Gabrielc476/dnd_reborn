// ===========================
// USE DND DATA HOOK - UPDATED WITH OFFICIAL D&D API FOR SPELLS - FIXED EXPORT
// ===========================
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CharacterCreationData, DndSubrace, DndSpell } from "@/types/characterCreation";
import { mockRaces } from "@/data/mockRaces";
import { mockClasses } from "@/data/mockClasses";
import { mockBackgrounds } from "@/data/mockBackgrounds";
import { mockSubraces } from "@/data/mockSubRaces";
import { mockSubclasses } from "@/data/mockSubClasses";

// ===========================
// D&D API CONSTANTS
// ===========================

const DND_API_BASE_URL = "https://www.dnd5eapi.co/api";

// ===========================
// D&D API FUNCTIONS
// ===========================

/**
 * Função para fazer requisições à API oficial D&D 5e
 */
async function fetchFromDndAPI<T>(endpoint: string): Promise<T> {
  const url = `${DND_API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar dados da API D&D: ${endpoint}`, error);
    throw new Error(`Erro ao carregar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Busca todas as magias da API oficial
 */
async function fetchAllSpells(): Promise<DndSpell[]> {
  try {
    // Primeiro busca a lista de magias
    const spellsList = await fetchFromDndAPI<{
      results: Array<{ index: string; name: string; url: string }>;
    }>('/spells');

    // Depois busca os detalhes de cada magia em batches para evitar sobrecarga
    const batchSize = 20;
    const allSpells: DndSpell[] = [];
    
    for (let i = 0; i < spellsList.results.length; i += batchSize) {
      const batch = spellsList.results.slice(i, i + batchSize);
      const batchPromises = batch.map(spell => 
        fetchFromDndAPI<DndSpell>(`/spells/${spell.index}`)
      );
      
      const batchResults = await Promise.all(batchPromises);
      allSpells.push(...batchResults);
    }

    return allSpells;
  } catch (error) {
    console.error('Erro ao buscar magias da API oficial:', error);
    throw error;
  }
}

/**
 * Busca magias por classe da API oficial
 */
async function fetchSpellsByClass(classIndex: string): Promise<DndSpell[]> {
  try {
    const classSpells = await fetchFromDndAPI<{
      results: Array<{ index: string; name: string; url: string }>;
    }>(`/classes/${classIndex}/spells`);

    // Busca detalhes das magias em batches
    const batchSize = 15;
    const spells: DndSpell[] = [];
    
    for (let i = 0; i < classSpells.results.length; i += batchSize) {
      const batch = classSpells.results.slice(i, i + batchSize);
      const batchPromises = batch.map(spell => 
        fetchFromDndAPI<DndSpell>(`/spells/${spell.index}`)
      );
      
      const batchResults = await Promise.all(batchPromises);
      spells.push(...batchResults);
    }

    return spells;
  } catch (error) {
    console.error(`Erro ao buscar magias da classe ${classIndex}:`, error);
    throw error;
  }
}

// ===========================
// REACT QUERY HOOKS
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

/**
 * Hook para buscar magias da API oficial com filtros
 */
function useSpellsQuery(enabled: boolean = true, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "spells", classIndex],
    queryFn: () => {
      if (classIndex) {
        return fetchSpellsByClass(classIndex);
      }
      return fetchAllSpells();
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook para buscar subclasses da API oficial
 */
function useSubclassesQuery(enabled: boolean = true, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "subclasses", classIndex],
    queryFn: () => {
      // Usar dados mockados por enquanto
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
 * Filtra magias disponíveis para um personagem
 */
function filterSpellsForCharacter(spells: DndSpell[], characterData: CharacterCreationData): DndSpell[] {
  if (!characterData.isSpellcaster || !characterData.selectedClass) {
    return [];
  }

  // Filtrar por classe
  return spells.filter(spell => 
    spell.classes.some(cls => cls.index === characterData.selectedClass?.index)
  );
}

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
    case "warlock":
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
// MAIN HOOK - PROPERLY EXPORTED
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
  // Data queries usando mock data para tudo exceto magias
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

  // Magias da API oficial com filtros por classe
  const { 
    data: spellsData = [], 
    isLoading: spellsLoading,
    error: spellsError
  } = useSpellsQuery(
    characterData.isSpellcaster,
    characterData.selectedClass?.index
  );

  const { 
    data: subclassesData = [], 
    isLoading: subclassesLoading 
  } = useSubclassesQuery(
    true,
    characterData.selectedClass?.index
  );

  // Filtered data based on search terms
  const filteredRaces = useMemo(() => {
    if (!searchTerms.debouncedRaceSearch) return racesData;
    return racesData.filter(race =>
      race.name.toLowerCase().includes(searchTerms.debouncedRaceSearch.toLowerCase())
    );
  }, [racesData, searchTerms.debouncedRaceSearch]);

  const filteredClasses = useMemo(() => {
    if (!searchTerms.debouncedClassSearch) return classesData;
    return classesData.filter(cls =>
      cls.name.toLowerCase().includes(searchTerms.debouncedClassSearch.toLowerCase())
    );
  }, [classesData, searchTerms.debouncedClassSearch]);

  const filteredBackgrounds = useMemo(() => {
    if (!searchTerms.debouncedBackgroundSearch) return backgroundsData;
    return backgroundsData.filter(bg =>
      bg.name.toLowerCase().includes(searchTerms.debouncedBackgroundSearch.toLowerCase())
    );
  }, [backgroundsData, searchTerms.debouncedBackgroundSearch]);

  // Filtros avançados para magias
  const filteredSpells = useMemo(() => {
    let spells = spellsData;

    // Filtro por classe e nível do personagem
    spells = filterSpellsForCharacter(spells, characterData);

    // Filtro por busca
    if (searchTerms.debouncedSpellSearch) {
      spells = spells.filter(spell =>
        spell.name.toLowerCase().includes(searchTerms.debouncedSpellSearch.toLowerCase()) ||
        spell.desc.some(desc => 
          desc.toLowerCase().includes(searchTerms.debouncedSpellSearch.toLowerCase())
        )
      );
    }

    return spells;
  }, [spellsData, searchTerms.debouncedSpellSearch, characterData]);

  // Available subraces based on selected race
  const availableSubraces = useMemo(() => {
    if (!characterData.selectedRace) return [];
    return mockSubraces.filter(
      subrace => subrace.race.index === characterData.selectedRace?.index
    );
  }, [characterData.selectedRace]);

  // Available subclasses based on selected class
  const availableSubclasses = useMemo(() => {
    if (!characterData.selectedClass) return [];
    return subclassesData.filter(
      subclass => subclass.class.index === characterData.selectedClass?.index
    );
  }, [characterData.selectedClass, subclassesData]);

  // Spell information for character creation
  const spellInfo = useMemo(() => {
    if (!characterData.selectedClass) {
      return { cantrips: 0, spells: 0, maxSpellLevel: 0 };
    }

    const startingSpells = getStartingSpellsForClass(characterData.selectedClass.index);
    const maxSpellLevel = getMaxSpellLevelForCharacter(characterData);

    return {
      ...startingSpells,
      maxSpellLevel,
      availableCantrips: filteredSpells.filter(spell => spell.level === 0),
      availableLevelSpells: filteredSpells.filter(spell => spell.level > 0 && spell.level <= maxSpellLevel)
    };
  }, [characterData.selectedClass, characterData.level, filteredSpells]);

  // Helper functions
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

  return {
    // Dados principais
    races: filteredRaces,
    classes: filteredClasses,
    backgrounds: filteredBackgrounds,
    spells: filteredSpells,
    subraces: availableSubraces,
    subclasses: availableSubclasses,

    // Estados de loading
    isLoadingRaces: racesLoading,
    isLoadingClasses: classesLoading,
    isLoadingBackgrounds: backgroundsLoading,
    isLoadingSpells: spellsLoading,
    isLoadingSubraces: false,
    isLoadingSubclasses: subclassesLoading,

    // Erros
    racesError,
    classesError,
    spellsError,

    // Funções helper
    getAvailableSubraces,
    getAvailableSubclasses,
    getSubclassFeatures,
    getCombinedAbilityBonuses,
    getSubraceAbilityBonuses,

    // Informações sobre magias
    spellInfo,
    maxSpellLevel: spellInfo.maxSpellLevel,
    startingCantrips: spellInfo.cantrips,
    startingSpells: spellInfo.spells,
  };
};

// ===========================
// DEFAULT EXPORT FOR BACKWARD COMPATIBILITY
// ===========================

export default useDndData;