// ===========================
// USE DND DATA HOOK
// ===========================
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CharacterCreationData, DndSubrace } from "@/types/characterCreation";
import { mockRaces } from "@/data/mockRaces";
import { mockClasses } from "@/data/mockClasses";
import { mockBackgrounds } from "@/data/mockBackgrounds";
import { mockSpells } from "@/data/mockSpells";
import { mockSubraces } from "@/data/mockSubRaces";
import { mockSubclasses } from "@/data/mockSubClasses";

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

function useSpellsQuery(enabled: boolean = true, level?: number, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "spells", level, classIndex],
    queryFn: () => mockSpells,
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

function useSubclassesQuery(enabled: boolean = true, classIndex?: string) {
  return useQuery({
    queryKey: ["dnd", "subclasses", classIndex],
    queryFn: () => {
      if (classIndex) {
        return mockSubclasses.filter(subclass => subclass.class.index === classIndex);
      }
      return mockSubclasses;
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// ===========================
// MAIN HOOK
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
  // Data queries
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
    data: spellsData = [], 
    isLoading: spellsLoading 
  } = useSpellsQuery(
    characterData.isSpellcaster,
    undefined,
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

  const filteredSpells = useMemo(() => {
    if (!searchTerms.debouncedSpellSearch) return spellsData;
    return spellsData.filter(spell =>
      spell.name.toLowerCase().includes(searchTerms.debouncedSpellSearch.toLowerCase())
    );
  }, [spellsData, searchTerms.debouncedSpellSearch]);

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

  // Helper functions
  const getAvailableSubraces = () => availableSubraces;
  const getAvailableSubclasses = () => availableSubclasses;

  const getSubclassFeatures = (level?: number) => {
    if (!characterData.selectedSubclass) return [];
    
    if (!characterData.selectedSubclass.subclass_levels || 
        !Array.isArray(characterData.selectedSubclass.subclass_levels)) {
      console.warn('subclass_levels is not a valid array:', characterData.selectedSubclass.subclass_levels);
      return [];
    }
    
    const targetLevel = level || characterData.level;
    const features = [];
    
    characterData.selectedSubclass.subclass_levels.forEach(levelData => {
      if (levelData && typeof levelData.level === 'number' && levelData.level <= targetLevel) {
        if (levelData.features && Array.isArray(levelData.features)) {
          features.push(...levelData.features);
        }
      }
    });
    
    return features;
  };

  return {
    // Raw data
    races: filteredRaces,
    classes: filteredClasses,
    backgrounds: filteredBackgrounds,
    spells: filteredSpells,
    subraces: availableSubraces,
    subclasses: availableSubclasses,

    // Helper functions
    getAvailableSubraces,
    getAvailableSubclasses,
    getSubclassFeatures,

    // Loading states
    isLoadingRaces: racesLoading,
    isLoadingClasses: classesLoading,
    isLoadingBackgrounds: backgroundsLoading,
    isLoadingSpells: spellsLoading,
    isLoadingSubraces: false,
    isLoadingSubclasses: subclassesLoading,

    // Errors
    racesError,
    classesError,
  };
};