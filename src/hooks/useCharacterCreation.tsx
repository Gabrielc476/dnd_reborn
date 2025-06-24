// ===========================
// OPTIMIZED CHARACTER CREATION HOOK - REFACTORED VERSION
// ===========================
"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { CharacterCreationContextType } from "@/types/characterCreation";

// Import refactored hooks
import { useCharacterData } from "@/hooks/reutilizaveis/useCharacterData";
import { useCharacterSteps } from "@/hooks/reutilizaveis/useCharacterSteps";
import { useCharacterSearch } from "@/hooks/reutilizaveis/useCharacterSearch";
import { useDndData } from "@/hooks/reutilizaveis/useDndData";
import { useCharacterCalculations } from "@/hooks/reutilizaveis/useCharacterCalculations";

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
// CONTEXT
// ===========================

const CharacterCreationContext = createContext<CharacterCreationContextType | null>(null);

// ===========================
// MAIN HOOK IMPLEMENTATION
// ===========================

export const useCharacterCreation = (): CharacterCreationContextType => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refactored hooks
  const {
    characterData,
    updateCharacterData,
    resetCharacterData,
    getCombinedAbilityBonuses,
    getSubraceAbilityBonuses,
  } = useCharacterData();

  const {
    currentStep,
    totalSteps,
    steps,
    validateCurrentStep,
    canProceed,
    nextStep,
    previousStep,
    goToStep,
    resetSteps,
    validateAllSteps,
    validateStep,
  } = useCharacterSteps(characterData);

  const {
    setRaceSearch,
    setClassSearch,
    setSpellSearch,
    setBackgroundSearch,
    raceSearch,
    classSearch,
    spellSearch,
    backgroundSearch,
    debouncedRaceSearch,
    debouncedClassSearch,
    debouncedSpellSearch,
    debouncedBackgroundSearch,
    clearAllSearches,
  } = useCharacterSearch();

  const {
    races,
    classes,
    backgrounds,
    spells,
    subraces,
    subclasses,
    getAvailableSubraces,
    getAvailableSubclasses,
    getSubclassFeatures,
    isLoadingRaces,
    isLoadingClasses,
    isLoadingBackgrounds,
    isLoadingSpells,
    isLoadingSubraces,
    isLoadingSubclasses,
    racesError,
    classesError,
  } = useDndData(characterData, {
    debouncedRaceSearch,
    debouncedClassSearch,
    debouncedSpellSearch,
    debouncedBackgroundSearch,
  });

  const {
    getAbilityModifier,
    calculateAbilityScorePoints,
    generateRandomAbilityScores,
    getProficiencyBonus,
    getSkillModifier,
    getSavingThrowModifier,
    calculateHitPoints,
    calculateArmorClass,
    getSpellAttackBonus,
    getSpellSaveDC,
    getCarryingCapacity,
    getInitiativeModifier,
  } = useCharacterCalculations();

  // ===========================
  // RESET FUNCTION
  // ===========================

  const resetCharacter = useCallback(() => {
    resetCharacterData();
    resetSteps();
    setError(null);
    clearAllSearches();
  }, [resetCharacterData, resetSteps, clearAllSearches]);

  // ===========================
  // CHARACTER CREATION
  // ===========================

  const createCharacter = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Validate all steps
      const validations = validateAllSteps();
      const hasErrors = validations.some(validation => !validation.isValid);
      
      if (hasErrors) {
        const errors = validations.flatMap((validation, index) => 
          validation.errors.map(error => `Passo ${index + 1}: ${error}`)
        );
        throw new Error(errors.join(", "));
      }

      // Import and use real API
      const { characterAPI } = await import("@/api/characterAPI");

      // Validate data before sending
      const validationErrors = characterAPI.validateCharacterData(characterData);
      if (validationErrors.length > 0) {
        throw new Error(`Dados inválidos: ${validationErrors.join(", ")}`);
      }

      // Create character via API
      const response = await characterAPI.createCharacter(characterData);

      if (!response.character) {
        throw new Error(response.error || "Erro ao criar personagem");
      }

      console.log("Personagem criado com sucesso:", response.character);

      // Reset form after success
      resetCharacter();
    } catch (err) {
      console.error("Erro ao criar personagem:", err);
      setError(err instanceof Error ? err.message : "Erro ao criar personagem");
    } finally {
      setLoading(false);
    }
  }, [characterData, validateAllSteps, resetCharacter]);

  // ===========================
  // EFFECTS FOR ERROR HANDLING
  // ===========================

  useEffect(() => {
    if (racesError || classesError) {
      setError("Erro ao carregar dados da API D&D. Usando dados locais.");
    }
  }, [racesError, classesError]);

  // Clear error when data changes
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [characterData, error]);

  // ===========================
  // RETURN STATEMENT
  // ===========================

  return {
    // State
    currentStep,
    totalSteps,
    steps,
    characterData,
    loading: loading || isLoadingRaces || isLoadingClasses || isLoadingBackgrounds,
    error,

    // API Data
    races,
    classes,
    backgrounds,
    spells,
    subraces,
    subclasses,

    // Search
    setRaceSearch,
    setClassSearch,
    setSpellSearch,
    setBackgroundSearch,
    raceSearch,
    classSearch,
    spellSearch,
    backgroundSearch,

    // Navigation
    nextStep,
    previousStep,
    goToStep,

    // Data management
    updateCharacterData,
    resetCharacter,

    // Validation
    validateCurrentStep,
    canProceed,

    // Finalization
    createCharacter,

    // Utilities
    getAbilityModifier,
    calculateAbilityScorePoints,
    generateRandomAbilityScores,
    getProficiencyBonus,
    getSkillModifier,
    getSavingThrowModifier,
    calculateHitPoints,
    calculateArmorClass,
    getSpellAttackBonus,
    getSpellSaveDC,
    getCarryingCapacity,
    getInitiativeModifier,

    // Subraces functions
    getAvailableSubraces,
    getCombinedAbilityBonuses,
    getSubraceAbilityBonuses,

    // Subclasses functions
    getAvailableSubclasses,
    getSubclassFeatures,

    // Loading states
    isLoadingRaces,
    isLoadingClasses,
    isLoadingSpells,
    isLoadingSubraces,
    isLoadingSubclasses,
  };
};

// ===========================
// PROVIDER COMPONENTS
// ===========================

interface CharacterCreationProviderProps {
  children: React.ReactNode;
}

export const CharacterCreationProvider: React.FC<CharacterCreationProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <CharacterCreationProviderInner>
        {children}
      </CharacterCreationProviderInner>
    </QueryClientProvider>
  );
};

const CharacterCreationProviderInner: React.FC<CharacterCreationProviderProps> = ({ children }) => {
  const characterCreation = useCharacterCreation();

  return (
    <CharacterCreationContext.Provider value={characterCreation}>
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
      "useCharacterCreationContext deve ser usado dentro de um CharacterCreationProvider"
    );
  }
  return context;
};

export default useCharacterCreation;