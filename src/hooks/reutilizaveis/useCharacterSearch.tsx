// ===========================
// USE CHARACTER SEARCH HOOK - COMPLETE ORIGINAL VERSION FIXED
// ===========================
"use client";

import { useState, useEffect, useMemo } from "react";

// ===========================
// DEBOUNCE HOOK - ORIGINAL FUNCTIONALITY
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
// MAIN HOOK - COMPLETE ORIGINAL FUNCTIONALITY WITH SEARCH TERMS FIX
// ===========================

export const useCharacterSearch = () => {
  // Search states - ORIGINAL FUNCTIONALITY
  const [raceSearchTerm, setRaceSearchTerm] = useState("");
  const [classSearchTerm, setClassSearchTerm] = useState("");
  const [spellSearchTerm, setSpellSearchTerm] = useState("");
  const [backgroundSearchTerm, setBackgroundSearchTerm] = useState("");

  // Debounced search terms - ORIGINAL FUNCTIONALITY
  const debouncedRaceSearch = useDebounce(raceSearchTerm, 300);
  const debouncedClassSearch = useDebounce(classSearchTerm, 300);
  const debouncedSpellSearch = useDebounce(spellSearchTerm, 300);
  const debouncedBackgroundSearch = useDebounce(backgroundSearchTerm, 300);

  // CRITICAL FIX: Create searchTerms object with proper memoization
  const searchTerms = useMemo(() => ({
    debouncedRaceSearch,
    debouncedClassSearch,
    debouncedSpellSearch,
    debouncedBackgroundSearch,
  }), [
    debouncedRaceSearch,
    debouncedClassSearch,
    debouncedSpellSearch,
    debouncedBackgroundSearch,
  ]);

  // Search handlers - ORIGINAL FUNCTIONALITY WITH MEMOIZATION
  const searchHandlers = useMemo(
    () => ({
      // Setters - ORIGINAL
      setRaceSearch: setRaceSearchTerm,
      setClassSearch: setClassSearchTerm,
      setSpellSearch: setSpellSearchTerm,
      setBackgroundSearch: setBackgroundSearchTerm,
      
      // Current values - ORIGINAL
      raceSearch: raceSearchTerm,
      classSearch: classSearchTerm,
      spellSearch: spellSearchTerm,
      backgroundSearch: backgroundSearchTerm,
      
      // Debounced values - ORIGINAL
      debouncedRaceSearch,
      debouncedClassSearch,
      debouncedSpellSearch,
      debouncedBackgroundSearch,
    }),
    [
      raceSearchTerm,
      classSearchTerm,
      spellSearchTerm,
      backgroundSearchTerm,
      debouncedRaceSearch,
      debouncedClassSearch,
      debouncedSpellSearch,
      debouncedBackgroundSearch,
    ]
  );

  // Clear all searches - ORIGINAL FUNCTIONALITY WITH MEMOIZATION
  const clearAllSearches = useMemo(() => () => {
    console.log("🔄 Clearing all searches");
    setRaceSearchTerm("");
    setClassSearchTerm("");
    setSpellSearchTerm("");
    setBackgroundSearchTerm("");
  }, []);

  // ADDITIONAL SEARCH UTILITIES - ENHANCED FUNCTIONALITY

  const hasActiveSearches = useMemo(() => {
    return !!(
      debouncedRaceSearch || 
      debouncedClassSearch || 
      debouncedSpellSearch || 
      debouncedBackgroundSearch
    );
  }, [debouncedRaceSearch, debouncedClassSearch, debouncedSpellSearch, debouncedBackgroundSearch]);

  const getActiveSearchCount = useMemo(() => {
    let count = 0;
    if (debouncedRaceSearch) count++;
    if (debouncedClassSearch) count++;
    if (debouncedSpellSearch) count++;
    if (debouncedBackgroundSearch) count++;
    return count;
  }, [debouncedRaceSearch, debouncedClassSearch, debouncedSpellSearch, debouncedBackgroundSearch]);

  const getSearchSummary = useMemo(() => ({
    race: debouncedRaceSearch,
    class: debouncedClassSearch,
    spell: debouncedSpellSearch,
    background: debouncedBackgroundSearch,
    hasActiveSearches,
    activeCount: getActiveSearchCount,
  }), [
    debouncedRaceSearch,
    debouncedClassSearch,
    debouncedSpellSearch,
    debouncedBackgroundSearch,
    hasActiveSearches,
    getActiveSearchCount,
  ]);

  // Clear individual searches - ENHANCED FUNCTIONALITY
  const clearRaceSearch = useMemo(() => () => setRaceSearchTerm(""), []);
  const clearClassSearch = useMemo(() => () => setClassSearchTerm(""), []);
  const clearSpellSearch = useMemo(() => () => setSpellSearchTerm(""), []);
  const clearBackgroundSearch = useMemo(() => () => setBackgroundSearchTerm(""), []);

  // Batch search operations - ENHANCED FUNCTIONALITY
  const setMultipleSearches = useMemo(() => (searches: {
    race?: string;
    class?: string;
    spell?: string;
    background?: string;
  }) => {
    if (searches.race !== undefined) setRaceSearchTerm(searches.race);
    if (searches.class !== undefined) setClassSearchTerm(searches.class);
    if (searches.spell !== undefined) setSpellSearchTerm(searches.spell);
    if (searches.background !== undefined) setBackgroundSearchTerm(searches.background);
  }, []);

  // RETURN COMPLETE FUNCTIONALITY - ALL ORIGINAL + ENHANCED + CRITICAL FIX
  return {
    // Original search handlers - MAINTAINED
    ...searchHandlers,
    
    // Original clear function - MAINTAINED
    clearAllSearches,
    
    // CRITICAL FIX: Return searchTerms object
    searchTerms,
    
    // Enhanced functionality - ADDITIONAL
    hasActiveSearches,
    getActiveSearchCount,
    getSearchSummary,
    clearRaceSearch,
    clearClassSearch,
    clearSpellSearch,
    clearBackgroundSearch,
    setMultipleSearches,
  };
};