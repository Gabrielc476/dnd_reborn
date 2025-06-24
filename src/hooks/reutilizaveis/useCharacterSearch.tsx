// ===========================
// USE CHARACTER SEARCH HOOK
// ===========================
"use client";

import { useState, useEffect, useMemo } from "react";

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
// HOOK
// ===========================

export const useCharacterSearch = () => {
  // Search states
  const [raceSearchTerm, setRaceSearchTerm] = useState("");
  const [classSearchTerm, setClassSearchTerm] = useState("");
  const [spellSearchTerm, setSpellSearchTerm] = useState("");
  const [backgroundSearchTerm, setBackgroundSearchTerm] = useState("");

  // Debounced search terms
  const debouncedRaceSearch = useDebounce(raceSearchTerm, 300);
  const debouncedClassSearch = useDebounce(classSearchTerm, 300);
  const debouncedSpellSearch = useDebounce(spellSearchTerm, 300);
  const debouncedBackgroundSearch = useDebounce(backgroundSearchTerm, 300);

  // Search handlers
  const searchHandlers = useMemo(
    () => ({
      // Setters
      setRaceSearch: setRaceSearchTerm,
      setClassSearch: setClassSearchTerm,
      setSpellSearch: setSpellSearchTerm,
      setBackgroundSearch: setBackgroundSearchTerm,
      
      // Current values
      raceSearch: raceSearchTerm,
      classSearch: classSearchTerm,
      spellSearch: spellSearchTerm,
      backgroundSearch: backgroundSearchTerm,
      
      // Debounced values
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

  const clearAllSearches = () => {
    setRaceSearchTerm("");
    setClassSearchTerm("");
    setSpellSearchTerm("");
    setBackgroundSearchTerm("");
  };

  return {
    ...searchHandlers,
    clearAllSearches,
  };
};