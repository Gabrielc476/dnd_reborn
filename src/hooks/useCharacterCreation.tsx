// ===========================
// NOVO PROVIDER USANDO O ORQUESTRADOR
// src/hooks/useCharacterCreation.tsx
// ===========================

"use client";

import React, { createContext, useContext, useMemo, useCallback, useState } from 'react';
import { useCharacterCreationOrchestrator } from './character-creation/useCharacterCreationOrchestrator';
import { 
  CharacterCreationContextType, 
  CharacterCreationData,
  AbilityScores,
  DndSpell
} from '@/types/characterCreation';

// ===========================
// CONTEXTO
// ===========================

const CharacterCreationContext = createContext<CharacterCreationContextType | null>(null);

// ===========================
// PROVIDER USANDO O ORQUESTRADOR
// ===========================

interface CharacterCreationProviderProps {
  children: React.ReactNode;
  campaignId?: string;
}

export const CharacterCreationProvider: React.FC<CharacterCreationProviderProps> = ({ 
  children, 
  campaignId 
}) => {
  // Hook orquestrador principal
  const orchestrator = useCharacterCreationOrchestrator(campaignId);
  
  // Estados de busca (mantidos para compatibilidade)
  const [raceSearch, setRaceSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [spellSearch, setSpellSearch] = useState('');

  // ===========================
  // COMPATIBILITY LAYER
  // ===========================

  // Mapear dados do orquestrador para a interface antiga
  const characterData: CharacterCreationData = useMemo(() => ({
    // Basic Info
    name: orchestrator.basics.basics.name,
    level: orchestrator.basics.basics.level,
    experience: 0,
    
    // Character Choices
    selectedRace: orchestrator.basics.basics.selectedRace,
    selectedSubrace: orchestrator.basics.basics.selectedSubrace,
    selectedClass: orchestrator.basics.basics.selectedClass,
    selectedSubclass: orchestrator.basics.basics.selectedSubclass,
    selectedBackground: orchestrator.basics.basics.selectedBackground,
    alignment: orchestrator.basics.basics.alignment,
    
    // Ability Scores
    abilityMethod: orchestrator.abilities.method,
    abilityScores: orchestrator.abilities.scores,
    pointsRemaining: orchestrator.abilities.pointsRemaining,
    
    // Combat Stats
    hitPoints: orchestrator.computedStats.hitPoints,
    armorClass: orchestrator.computedStats.armorClass,
    
    // Skills & Proficiencies
    selectedSkills: orchestrator.skills.selectedSkills,
    availableSkillChoices: orchestrator.skills.availableChoices,
    proficiencies: orchestrator.skills.skillProficiencies.map(p => p.skill),
    languages: [], // TODO: implementar
    
    // Equipment
    selectedEquipment: orchestrator.equipment.equipment.map(eq => eq.index),
    
    // Spellcasting
    isSpellcaster: orchestrator.spells.isSpellcaster,
    spellcastingAbility: orchestrator.spells.spellcastingAbility,
    selectedSpells: [...orchestrator.spells.selectedCantrips.map(s => s.index), ...orchestrator.spells.selectedSpells.map(s => s.index)],
    knownSpells: orchestrator.spells.spellsKnown,
    spellSlots: orchestrator.spells.spellSlots,
    
    // Personality
    personalityTraits: orchestrator.personality.traits.map(t => t.text),
    ideals: orchestrator.personality.ideals.map(i => i.text),
    bonds: orchestrator.personality.bonds.map(b => b.text),
    flaws: orchestrator.personality.flaws.map(f => f.text),
    
    // Additional Info
    backstory: '',
    notes: '',
  }), [orchestrator]);

  // ===========================
  // HELPER FUNCTIONS
  // ===========================

  const getCombinedAbilityBonuses = useMemo(() => {
    const bonuses: Record<keyof AbilityScores, number> = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    };

    // Bônus raciais
    if (orchestrator.basics.basics.selectedRace?.ability_bonuses) {
      orchestrator.basics.basics.selectedRace.ability_bonuses.forEach(bonus => {
        const ability = bonus.ability_score.index as keyof AbilityScores;
        bonuses[ability] += bonus.bonus;
      });
    }

    // Bônus sub-raciais
    if (orchestrator.basics.basics.selectedSubrace?.ability_bonuses) {
      orchestrator.basics.basics.selectedSubrace.ability_bonuses.forEach(bonus => {
        const ability = bonus.ability_score.index as keyof AbilityScores;
        bonuses[ability] += bonus.bonus;
      });
    }

    return bonuses;
  }, [orchestrator.basics.basics.selectedRace, orchestrator.basics.basics.selectedSubrace]);

  const calculateModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  const calculateHitPoints = useCallback((): number => {
    if (!orchestrator.basics.basics.selectedClass) return 0;
    
    const hitDie = orchestrator.basics.basics.selectedClass.hit_die || 8;
    const conModifier = calculateModifier(orchestrator.abilities.scores.constitution);
    
    return hitDie + conModifier;
  }, [orchestrator.basics.basics.selectedClass, orchestrator.abilities.scores.constitution, calculateModifier]);

  const calculateArmorClass = useCallback((): number => {
    const dexModifier = calculateModifier(orchestrator.abilities.scores.dexterity);
    return 10 + dexModifier; // AC base + mod DES
  }, [orchestrator.abilities.scores.dexterity, calculateModifier]);

  const getSpellcastingAbility = useCallback((classIndex?: string) => {
    const selectedClass = classIndex ? 
      orchestrator.queries.classes.data?.find(c => c.index === classIndex) : 
      orchestrator.basics.basics.selectedClass;
    
    return selectedClass?.spellcasting?.spellcasting_ability?.index as keyof AbilityScores || null;
  }, [orchestrator.queries.classes.data, orchestrator.basics.basics.selectedClass]);

  // ===========================
  // UPDATE FUNCTIONS
  // ===========================

  const updateCharacterData = useCallback((updates: Partial<CharacterCreationData>) => {
    // Mapear updates para os hooks específicos
    if (updates.name !== undefined) {
      orchestrator.basics.updateName(updates.name);
    }
    if (updates.selectedRace !== undefined) {
      orchestrator.basics.updateRace(updates.selectedRace);
    }
    if (updates.selectedClass !== undefined) {
      orchestrator.basics.updateClass(updates.selectedClass);
    }
    if (updates.selectedBackground !== undefined) {
      orchestrator.basics.updateBackground(updates.selectedBackground);
    }
    if (updates.alignment !== undefined) {
      orchestrator.basics.updateAlignment(updates.alignment);
    }
    if (updates.abilityScores !== undefined) {
      Object.entries(updates.abilityScores).forEach(([ability, score]) => {
        orchestrator.abilities.updateScore(ability as keyof AbilityScores, score);
      });
    }
  }, [orchestrator]);

  const updateCharacterField = useCallback(<K extends keyof CharacterCreationData>(
    field: K,
    value: CharacterCreationData[K]
  ) => {
    updateCharacterData({ [field]: value } as Partial<CharacterCreationData>);
  }, [updateCharacterData]);

  const updateAbilityScore = useCallback((ability: keyof AbilityScores, value: number) => {
    orchestrator.abilities.updateScore(ability, value);
  }, [orchestrator.abilities]);

  const toggleSkill = useCallback((skillKey: string) => {
    orchestrator.skills.toggleSkill(skillKey);
  }, [orchestrator.skills]);

  const toggleSpell = useCallback((spellIndex: string) => {
    // Encontrar a magia pelo índice
    const allSpells = [
      ...(orchestrator.queries.races.data || []).flatMap(r => r.spells || []),
      // Adicionar outras fontes de magias conforme necessário
    ];
    
    const spell = allSpells.find(s => s.index === spellIndex);
    if (spell) {
      if (spell.level === 0) {
        orchestrator.spells.toggleCantrip(spell);
      } else {
        orchestrator.spells.toggleSpell(spell);
      }
    }
  }, [orchestrator.spells, orchestrator.queries]);

  // ===========================
  // VALIDATION FUNCTIONS
  // ===========================

  const validateStep = useCallback((stepId: string): boolean => {
    const step = orchestrator.steps.steps.find(s => s.id === stepId);
    return step?.isValid || false;
  }, [orchestrator.steps.steps]);

  const validateCurrentStep = useCallback((): boolean => {
    const currentStepData = orchestrator.steps.steps[orchestrator.steps.currentStep];
    return currentStepData?.isValid || false;
  }, [orchestrator.steps]);

  const canProceed = useCallback((): boolean => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  // ===========================
  // ACTIONS
  // ===========================

  const resetCharacter = useCallback(() => {
    orchestrator.resetAll();
  }, [orchestrator]);

  const createCharacter = useCallback(async () => {
    try {
      return await orchestrator.saveCharacter(campaignId);
    } catch (error) {
      console.error('Erro ao criar personagem:', error);
      throw error;
    }
  }, [orchestrator, campaignId]);

  // ===========================
  // CONTEXT VALUE
  // ===========================

  const contextValue: CharacterCreationContextType = {
    // Step Management
    currentStep: orchestrator.steps.currentStep,
    steps: orchestrator.steps.steps,
    currentStepData: orchestrator.steps.steps[orchestrator.steps.currentStep],
    progress: ((orchestrator.steps.currentStep + 1) / orchestrator.steps.steps.length) * 100,
    nextStep: orchestrator.steps.nextStep,
    prevStep: orchestrator.steps.prevStep,
    goToStep: orchestrator.steps.goToStep,
    canProceed,

    // Character Data
    characterData,
    updateCharacterData,
    updateCharacterField,
    updateAbilityScore,
    toggleSkill,
    toggleSpell,

    // Loading States
    isLoading: orchestrator.isLoading,
    loading: orchestrator.isLoading,
    error: orchestrator.api.error,

    // D&D Data
    races: orchestrator.queries.races.data || [],
    classes: orchestrator.queries.classes.data || [],
    backgrounds: orchestrator.queries.backgrounds.data || [],
    spells: [], // TODO: implementar busca de magias
    subclasses: [], // TODO: implementar
    subraces: [], // TODO: implementar

    // Individual Loading States
    isLoadingRaces: orchestrator.queries.races.isLoading,
    isLoadingClasses: orchestrator.queries.classes.isLoading,
    isLoadingBackgrounds: orchestrator.queries.backgrounds.isLoading,
    isLoadingSpells: false, // TODO
    isLoadingSubclasses: false, // TODO
    isLoadingSubraces: false, // TODO

    // Search Functionality
    raceSearch,
    setRaceSearch,
    classSearch,
    setClassSearch,
    spellSearch,
    setSpellSearch,
    raceSearchTerm: raceSearch,
    setRaceSearchTerm: setRaceSearch,
    classSearchTerm: classSearch,
    setClassSearchTerm: setClassSearch,
    spellSearchTerm: spellSearch,
    setSpellSearchTerm: setSpellSearch,

    // Validation
    validateStep,
    validateCurrentStep,
    isStepValid: validateStep,

    // Actions
    resetCharacter,
    createCharacter,

    // Utility Functions
    getCombinedAbilityBonuses,
    calculateModifier,
    getAbilityModifier: calculateModifier,
    calculateHitPoints,
    calculateArmorClass,
    getSpellcastingAbility,
  };

  return (
    <CharacterCreationContext.Provider value={contextValue}>
      {children}
    </CharacterCreationContext.Provider>
  );
};

// ===========================
// HOOK DE CONTEXTO
// ===========================

export const useCharacterCreationContext = (): CharacterCreationContextType => {
  const context = useContext(CharacterCreationContext);
  if (!context) {
    throw new Error('useCharacterCreationContext deve ser usado dentro de um CharacterCreationProvider');
  }
  return context;
};

// ===========================
// EXPORTS
// ===========================

export default CharacterCreationProvider;