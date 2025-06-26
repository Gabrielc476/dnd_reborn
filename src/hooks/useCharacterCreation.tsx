// ===========================
// CHARACTER CREATION HOOK - SEM REACT QUERY
// ===========================
"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useMemo,
} from "react";
import { CharacterCreationContextType, AbilityScores } from "@/types/characterCreation";

// Import hooks refatorados SEM React Query
import { useCharacterData } from "@/hooks/reutilizaveis/useCharacterData";
import { useCharacterSteps } from "@/hooks/reutilizaveis/useCharacterSteps";
import { useCharacterSearch } from "@/hooks/reutilizaveis/useCharacterSearch";
import { useDndData } from "@/hooks/reutilizaveis/useDndData";
import { useCharacterCalculations } from "@/hooks/reutilizaveis/useCharacterCalculations";

// ===========================
// CONTEXT
// ===========================

const CharacterCreationContext = createContext<CharacterCreationContextType | null>(null);

// ===========================
// MAIN HOOK - SEM REACT QUERY
// ===========================

export const useCharacterCreation = (): CharacterCreationContextType => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Character data
  const {
    characterData,
    updateCharacterData,
    resetCharacterData,
  } = useCharacterData();

  // Steps management
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

  // Search functionality
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
  } = useCharacterSearch();

  // Create searchTerms object
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

  // DND Data (races, classes, etc.)
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
    fetchSpells,
    canCastSpells,
  } = useDndData(characterData, searchTerms);

  // Calculations
  const {
    getAbilityModifier,
    calculateAbilityScorePoints,
    generateRandomAbilityScores,
    getProficiencyBonus,
    getSkillModifier: baseGetSkillModifier,
    getSavingThrowModifier: baseGetSavingThrowModifier,
    calculateHitPoints: baseCalculateHitPoints,
    calculateArmorClass,
    getSpellAttackBonus,
    getSpellSaveDC,
    getCarryingCapacity,
    getInitiativeModifier,
  } = useCharacterCalculations();

  // ===========================
  // WRAPPER FUNCTIONS
  // ===========================

  const getSkillModifier = useCallback((skill: string, scores: AbilityScores): number => {
    const skillToAbility: Record<string, keyof AbilityScores> = {
      "acrobatics": "dexterity",
      "animal-handling": "wisdom",
      "arcana": "intelligence",
      "athletics": "strength",
      "deception": "charisma",
      "history": "intelligence",
      "insight": "wisdom",
      "intimidation": "charisma",
      "investigation": "intelligence",
      "medicine": "wisdom",
      "nature": "intelligence",
      "perception": "wisdom",
      "performance": "charisma",
      "persuasion": "charisma",
      "religion": "intelligence",
      "sleight-of-hand": "dexterity",
      "stealth": "dexterity",
      "survival": "wisdom",
    };

    const ability = skillToAbility[skill];
    if (!ability) return 0;

    return baseGetSkillModifier(skill, scores[ability]);
  }, [baseGetSkillModifier]);

  const getSavingThrowModifier = useCallback((ability: keyof AbilityScores): number => {
    const abilityScore = characterData.abilityScores[ability];
    return baseGetSavingThrowModifier(ability, abilityScore);
  }, [baseGetSavingThrowModifier, characterData.abilityScores]);

  const calculateHitPoints = useCallback((selectedClass: any, level: number, constitutionModifier: number): number => {
    if (!selectedClass) return 0;
    
    const hitDie = selectedClass.hit_die || 8;
    const constitutionScore = characterData.abilityScores.constitution;
    
    return baseCalculateHitPoints(hitDie, level, constitutionScore, true);
  }, [baseCalculateHitPoints, characterData.abilityScores]);

  // ===========================
  // AUTO-UPDATE SPELLCASTER STATUS
  // ===========================

  useEffect(() => {
    if (!characterData.selectedClass) return;

    const isSpellcaster = !['barbarian', 'fighter', 'monk', 'rogue'].includes(
      characterData.selectedClass.index
    );
    
    if (characterData.isSpellcaster !== isSpellcaster) {
      updateCharacterData({
        isSpellcaster,
        spellcastingAbility: isSpellcaster 
          ? getSpellcastingAbility(characterData.selectedClass.index) 
          : null,
        selectedSpells: isSpellcaster ? characterData.selectedSpells : []
      });
    }
  }, [characterData.selectedClass, characterData.isSpellcaster, updateCharacterData]);

  // ===========================
  // AUTO-UPDATE SKILL CHOICES
  // ===========================

  useEffect(() => {
    if (!characterData.selectedClass) return;

    const skillChoices = characterData.selectedClass.proficiency_choices?.find(
      choice => choice.type === "proficiencies"
    )?.choose || 2;

    if (characterData.availableSkillChoices !== skillChoices) {
      updateCharacterData({
        availableSkillChoices: skillChoices,
        selectedSkills: characterData.selectedSkills.slice(0, skillChoices)
      });
    }
  }, [characterData.selectedClass, characterData.availableSkillChoices, updateCharacterData]);

  // ===========================
  // AUTO-CALCULATE STATS
  // ===========================

  useEffect(() => {
    if (!characterData.selectedClass || !characterData.abilityScores) return;

    const hitPoints = calculateHitPoints(
      characterData.selectedClass,
      characterData.level,
      getAbilityModifier(characterData.abilityScores.constitution)
    );
    
    const armorClass = calculateArmorClass(
      characterData.abilityScores.dexterity
    );

    if (characterData.hitPoints !== hitPoints || characterData.armorClass !== armorClass) {
      updateCharacterData({
        hitPoints,
        armorClass
      });
    }
  }, [
    characterData.selectedClass,
    characterData.abilityScores,
    characterData.level,
    calculateHitPoints,
    calculateArmorClass,
    getAbilityModifier,
    updateCharacterData
  ]);

  // ===========================
  // HELPER FUNCTIONS
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
      case 'fighter':
      case 'rogue':
        return 'intelligence';
      default:
        return null;
    }
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    const validation = validateStepFunction(currentStep, characterData);
    updateStepCompletion(currentStep, validation.isValid);
    return validation.isValid;
  }, [currentStep, characterData, validateStepFunction, updateStepCompletion]);

  const canProceed = useCallback((): boolean => {
    return canProceedFunction(characterData);
  }, [canProceedFunction, characterData]);

  const resetCharacter = useCallback(() => {
    resetCharacterData();
    resetSteps();
    setError(null);
    clearAllSearches();
  }, [resetCharacterData, resetSteps, clearAllSearches]);

  const createCharacter = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular criação do personagem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Personagem criado:', characterData);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar personagem';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [characterData]);

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

    // Spell information
    spellInfo,
    maxSpellLevel,
    startingCantrips,
    startingSpells,
    fetchSpells,
    canCastSpells,
  };
};

// ===========================
// PROVIDER COMPONENTS - SEM REACT QUERY
// ===========================

interface CharacterCreationProviderProps {
  children: React.ReactNode;
}

export const CharacterCreationProvider: React.FC<CharacterCreationProviderProps> = ({ children }) => {
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