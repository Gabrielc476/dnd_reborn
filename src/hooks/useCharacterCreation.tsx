// ===========================
// OPTIMIZED CHARACTER CREATION HOOK - COMPLETE VERSION WITH FIXED API IMPORT
// ===========================
"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useMemo,
  useRef,
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
// MAIN HOOK IMPLEMENTATION - COMPLETE VERSION
// ===========================

export const useCharacterCreation = (): CharacterCreationContextType => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // CRITICAL FIX: Refs to prevent infinite loops
  const isUpdatingRef = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // FIX: Handle searchTerms properly
  const searchHookData = useCharacterSearch();
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
    debouncedRaceSearch,
    debouncedClassSearch,
    debouncedSpellSearch,
    debouncedBackgroundSearch,
  } = searchHookData;

  // Create searchTerms object manually - MEMOIZED
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

  // COMPLETE DND DATA - ALL ORIGINAL FUNCTIONALITY
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

  // COMPLETE CALCULATIONS - ALL ORIGINAL FUNCTIONALITY
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
  // HELPER FUNCTIONS - ORIGINAL FUNCTIONALITY MAINTAINED
  // ===========================

  const getSpellcastingAbility = useCallback((classIndex: string): string | null => {
    switch (classIndex) {
      case 'wizard':
        return 'intelligence';
      case 'sorcerer':
      case 'bard':
      case 'warlock':
        return 'charisma';
      case 'cleric':
      case 'druid':
      case 'ranger':
        return 'wisdom';
      case 'paladin':
        return 'charisma';
      case 'fighter': // Eldritch Knight
      case 'rogue': // Arcane Trickster
        return 'intelligence';
      default:
        return null;
    }
  }, []);

  // ===========================
  // VALIDATION HELPER - ORIGINAL FUNCTIONALITY
  // ===========================

  const validateAllSteps = useCallback(() => {
    const validations = [];
    for (let i = 0; i < totalSteps; i++) {
      validations.push(validateStepFunction(i, characterData));
    }
    return validations;
  }, [totalSteps, validateStepFunction, characterData]);

  // ===========================
  // VALIDATION FUNCTIONS - ORIGINAL FUNCTIONALITY
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
  // RESET FUNCTION - ORIGINAL FUNCTIONALITY
  // ===========================

  const resetCharacter = useCallback(() => {
    resetCharacterData();
    resetSteps();
    setError(null);
    clearAllSearches();
  }, [resetCharacterData, resetSteps, clearAllSearches]);

  // ===========================
  // CHARACTER CREATION - FIXED API IMPORT
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

      // FIXED: Dynamic import with proper error handling
      try {
        const { characterAPI } = await import("@/api/characterAPI");

        // Validate data before sending
        const validationErrors = characterAPI.validateCharacterData(characterData);
        if (validationErrors.length > 0) {
          throw new Error(`Dados inválidos: ${validationErrors.join(", ")}`);
        }

        // Create character via API
        const response = await characterAPI.createCharacter(characterData);

        if (!response.success) {
          throw new Error(response.error || "Erro ao criar personagem");
        }

        console.log("Personagem criado com sucesso:", response.character);

        // Reset form after success
        resetCharacter();

      } catch (apiError) {
        // If API is not available, save locally or show alternative message
        console.warn("API não disponível, salvando dados localmente:", apiError);
        
        // Save character data to localStorage as fallback
        const characterExportData = {
          ...characterData,
          createdAt: new Date().toISOString(),
          id: `local_${Date.now()}`,
        };
        
        localStorage.setItem(
          `character_${characterExportData.id}`, 
          JSON.stringify(characterExportData)
        );

        console.log("Personagem salvo localmente:", characterExportData);
        
        // Show success message even without API
        alert(`Personagem "${characterData.name}" criado e salvo localmente!`);
        
        // Reset form after success
        resetCharacter();
      }

    } catch (err) {
      console.error("Erro ao criar personagem:", err);
      setError(err instanceof Error ? err.message : "Erro ao criar personagem");
    } finally {
      setLoading(false);
    }
  }, [characterData, validateAllSteps, resetCharacter]);

  // ===========================
  // SAFE UPDATE FUNCTION - FIX FOR INFINITE LOOPS
  // ===========================

  const safeUpdateCharacterData = useCallback((
    newData: Parameters<typeof updateCharacterData>[0],
    source: string = "unknown"
  ) => {
    if (isUpdatingRef.current) {
      console.log(`🔄 Skipping update from ${source} - already updating`);
      return;
    }

    console.log(`🔄 Safe update from ${source}:`, newData);
    isUpdatingRef.current = true;

    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Update the data
    updateCharacterData(newData);

    // Reset the flag after a short delay
    updateTimeoutRef.current = setTimeout(() => {
      isUpdatingRef.current = false;
      console.log(`✅ Update from ${source} completed`);
    }, 100);
  }, [updateCharacterData]);

  // ===========================
  // EFFECTS FOR ERROR HANDLING - ORIGINAL FUNCTIONALITY
  // ===========================

  useEffect(() => {
    if (racesError || classesError) {
      setError("Erro ao carregar dados da API D&D. Usando dados locais.");
    }
  }, [racesError, classesError]);

  // Clear error when data changes - SAFE VERSION
  useEffect(() => {
    if (error && characterData) {
      setError(null);
    }
  }, [characterData, error]);

  // ===========================
  // AUTO-UPDATE SPELLCASTER STATUS - FIXED TO PREVENT LOOPS
  // ===========================

  useEffect(() => {
    if (!characterData.selectedClass) return;

    const classIndex = characterData.selectedClass.index;
    const subclassIndex = characterData.selectedSubclass?.index;

    // Determine if character is a spellcaster
    const isSpellcaster = ![
      'barbarian', 'fighter', 'monk', 'rogue'
    ].includes(classIndex) || 
    (classIndex === 'fighter' && subclassIndex === 'eldritch-knight') ||
    (classIndex === 'rogue' && subclassIndex === 'arcane-trickster');

    const spellcastingAbility = getSpellcastingAbility(classIndex);

    // Only update if values actually changed - CRITICAL FIX
    if (
      characterData.isSpellcaster !== isSpellcaster || 
      characterData.spellcastingAbility !== spellcastingAbility
    ) {
      safeUpdateCharacterData({
        isSpellcaster,
        spellcastingAbility,
        selectedSpells: isSpellcaster ? characterData.selectedSpells : []
      }, "spellcaster-status");
    }
  }, [
    characterData.selectedClass, 
    characterData.selectedSubclass,
    characterData.isSpellcaster,
    characterData.spellcastingAbility,
    getSpellcastingAbility,
    safeUpdateCharacterData
  ]);

  // ===========================
  // AUTO-UPDATE SKILL CHOICES - FIXED TO PREVENT LOOPS
  // ===========================

  useEffect(() => {
    if (!characterData.selectedClass) return;

    const skillChoices = characterData.selectedClass.proficiency_choices?.find(
      choice => choice.type === "proficiencies"
    )?.choose || 2; // Default to 2 if not specified

    // Only update if value actually changed - CRITICAL FIX
    if (characterData.availableSkillChoices !== skillChoices) {
      safeUpdateCharacterData({
        availableSkillChoices: skillChoices,
        selectedSkills: characterData.selectedSkills.slice(0, skillChoices)
      }, "skill-choices");
    }
  }, [
    characterData.selectedClass,
    characterData.availableSkillChoices,
    characterData.selectedSkills,
    safeUpdateCharacterData
  ]);

  // ===========================
  // AUTO-CALCULATE STATS - FIXED TO PREVENT LOOPS
  // ===========================

  useEffect(() => {
    if (!characterData.selectedClass || !characterData.abilityScores) return;

    const conModifier = getAbilityModifier(characterData.abilityScores.constitution);
    const dexModifier = getAbilityModifier(characterData.abilityScores.dexterity);
    
    const hitPoints = calculateHitPoints(
      characterData.selectedClass.hit_die || 8,
      characterData.level,
      characterData.abilityScores.constitution
    );
    
    const armorClass = calculateArmorClass(
      characterData.abilityScores.dexterity
    );

    // Only update if values actually changed - CRITICAL FIX
    if (
      characterData.hitPoints !== hitPoints || 
      characterData.armorClass !== armorClass
    ) {
      safeUpdateCharacterData({
        hitPoints,
        armorClass
      }, "calculated-stats");
    }
  }, [
    characterData.selectedClass,
    characterData.abilityScores,
    characterData.level,
    characterData.hitPoints,
    characterData.armorClass,
    getAbilityModifier,
    calculateHitPoints,
    calculateArmorClass,
    safeUpdateCharacterData
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // ===========================
  // RETURN STATEMENT - COMPLETE ORIGINAL FUNCTIONALITY
  // ===========================

  return {
    // State
    currentStep,
    totalSteps,
    steps,
    characterData,
    loading: loading || isLoadingRaces || isLoadingClasses || isLoadingBackgrounds || isLoadingSpells,
    error,

    // API Data - ALL ORIGINAL
    races,
    classes,
    backgrounds,
    spells,
    subraces,
    subclasses,

    // Loading states - ALL ORIGINAL
    isLoadingRaces,
    isLoadingClasses,
    isLoadingBackgrounds,
    isLoadingSpells,
    isLoadingSubraces,
    isLoadingSubclasses,

    // Errors - ALL ORIGINAL
    racesError,
    classesError,
    spellsError,

    // Search - ALL ORIGINAL
    setRaceSearch,
    setClassSearch,
    setSpellSearch,
    setBackgroundSearch,
    raceSearch,
    classSearch,
    spellSearch,
    backgroundSearch,

    // Navigation - ALL ORIGINAL
    nextStep,
    previousStep,
    goToStep,

    // Data management - ALL ORIGINAL
    updateCharacterData,
    resetCharacter,

    // Validation - ALL ORIGINAL
    validateCurrentStep,
    canProceed,

    // Finalization - ALL ORIGINAL
    createCharacter,

    // Utilities - ALL ORIGINAL
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

    // Subraces functions - ALL ORIGINAL
    getAvailableSubraces,
    getCombinedAbilityBonuses,
    getSubraceAbilityBonuses,

    // Subclasses functions - ALL ORIGINAL
    getAvailableSubclasses,
    getSubclassFeatures,

    // Spell information - ALL ORIGINAL
    spellInfo,
    maxSpellLevel,
    startingCantrips,
    startingSpells,
  };
};

// ===========================
// PROVIDER COMPONENTS - ORIGINAL
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
// CONTEXT HOOK - ORIGINAL
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