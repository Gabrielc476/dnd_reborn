// ===========================
// OPTIMIZED CHARACTER CREATION HOOK - COMPLETE VERSION WITH API INTEGRATION
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

  // Use refactored hooks - CHARACTER DATA FIRST
  const {
    characterData,
    updateCharacterData,
    resetCharacterData,
  } = useCharacterData();

  const {
    currentStep,
    totalSteps,
    steps,
    nextStep,
    previousStep,
    goToStep,
    resetSteps,
    updateStepCompletion,
    validateStep: validateStepFunction,
    canProceed: canProceedFunction,
  } = useCharacterSteps();

  const {
    raceSearch,
    classSearch,
    spellSearch,
    backgroundSearch,
    setRaceSearch,
    setClassSearch,
    setSpellSearch,
    setBackgroundSearch,
    clearAllSearches,
    searchTerms,
  } = useCharacterSearch();

  const {
    races,
    classes,
    backgrounds,
    spells,
    subraces,
    subclasses,
    isLoadingRaces,
    isLoadingClasses,
    isLoadingBackgrounds,
    isLoadingSpells,
    isLoadingSubraces,
    isLoadingSubclasses,
    racesError,
    classesError,
    spellsError,
    getAvailableSubraces,
    getAvailableSubclasses,
    getSubclassFeatures,
    getCombinedAbilityBonuses,
    getSubraceAbilityBonuses,
    spellInfo,
    maxSpellLevel,
    startingCantrips,
    startingSpells,
  } = useDndData(characterData, searchTerms);

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
  // VALIDATION HELPER
  // ===========================

  const validateAllSteps = useCallback(() => {
    const validations = [];
    for (let i = 0; i < totalSteps; i++) {
      validations.push(validateStepFunction(i, characterData));
    }
    return validations;
  }, [totalSteps, validateStepFunction, characterData]);

  // ===========================
  // VALIDATION FUNCTIONS
  // ===========================

  const validateCurrentStep = useCallback((): boolean => {
    const validation = validateStepFunction(currentStep, characterData);
    updateStepCompletion(currentStep, validation.isValid);
    return validation.isValid;
  }, [currentStep, characterData, validateStepFunction, updateStepCompletion]);

  const canProceed = useCallback((): boolean => {
    return canProceedFunction(characterData);
  }, [canProceedFunction, characterData]);

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
  // AUTO-UPDATE SPELLCASTER STATUS
  // ===========================

  useEffect(() => {
    if (characterData.selectedClass) {
      const isSpellcaster = !!characterData.selectedClass.spellcasting || 
                           (characterData.selectedSubclass && 
                            ['arcane-trickster', 'eldritch-knight'].includes(characterData.selectedSubclass.index));
      
      const spellcastingAbility = characterData.selectedClass.spellcasting?.spellcasting_ability.index || null;

      if (characterData.isSpellcaster !== isSpellcaster || 
          characterData.spellcastingAbility !== spellcastingAbility) {
        updateCharacterData({
          isSpellcaster,
          spellcastingAbility,
          selectedSpells: isSpellcaster ? characterData.selectedSpells : []
        });
      }
    }
  }, [characterData.selectedClass, characterData.selectedSubclass, updateCharacterData]);

  // ===========================
  // AUTO-UPDATE SKILL CHOICES
  // ===========================

  useEffect(() => {
    if (characterData.selectedClass) {
      const skillChoices = characterData.selectedClass.proficiency_choices?.find(
        choice => choice.type === "proficiencies"
      )?.choose || 0;

      if (characterData.availableSkillChoices !== skillChoices) {
        updateCharacterData({
          availableSkillChoices: skillChoices,
          selectedSkills: characterData.selectedSkills.slice(0, skillChoices)
        });
      }
    }
  }, [characterData.selectedClass, updateCharacterData]);

  // ===========================
  // AUTO-CALCULATE STATS
  // ===========================

  useEffect(() => {
    if (characterData.selectedClass && characterData.abilityScores) {
      const conModifier = getAbilityModifier(characterData.abilityScores.constitution);
      const dexModifier = getAbilityModifier(characterData.abilityScores.dexterity);
      
      const hitPoints = calculateHitPoints(
        characterData.selectedClass,
        characterData.level,
        conModifier
      );
      
      const armorClass = calculateArmorClass(dexModifier);

      if (characterData.hitPoints !== hitPoints || characterData.armorClass !== armorClass) {
        updateCharacterData({
          hitPoints,
          armorClass
        });
      }
    }
  }, [
    characterData.selectedClass,
    characterData.abilityScores,
    characterData.level,
    getAbilityModifier,
    calculateHitPoints,
    calculateArmorClass,
    updateCharacterData
  ]);

  // ===========================
  // RETURN STATEMENT
  // ===========================

  return {
    // State
    currentStep,
    totalSteps,
    steps,
    characterData,
    loading: loading || isLoadingRaces || isLoadingClasses || isLoadingBackgrounds || isLoadingSpells,
    error,

    // API Data
    races,
    classes,
    backgrounds,
    spells,
    subraces,
    subclasses,

    // Loading states
    isLoadingRaces,
    isLoadingClasses,
    isLoadingBackgrounds,
    isLoadingSpells,
    isLoadingSubraces,
    isLoadingSubclasses,

    // Errors
    racesError,
    classesError,
    spellsError,

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

    // Spell information (NEW)
    spellInfo,
    maxSpellLevel,
    startingCantrips,
    startingSpells,
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