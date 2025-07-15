// ===========================
// NOVO PROVIDER USANDO O ORQUESTRADOR - CORRIGIDO
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
  // COMPATIBILITY LAYER - CORRIGIDO COM VERIFICAÇÕES DE SEGURANÇA
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
    
    // Skills & Proficiencies - COM VERIFICAÇÃO DE SEGURANÇA
    selectedSkills: orchestrator.skills.selectedSkills || [],
    availableSkillChoices: orchestrator.skills.availableChoices || 0,
    proficiencies: (orchestrator.skills.skillProficiencies || []).map(p => p.skill),
    languages: [], // TODO: implementar
    
    // Equipment - COM VERIFICAÇÃO DE SEGURANÇA
    selectedEquipment: (orchestrator.equipment.equipment || []).map(eq => eq.index),
    
    // Spellcasting - COM VERIFICAÇÃO DE SEGURANÇA
    isSpellcaster: orchestrator.spells.isSpellcaster || false,
    spellcastingAbility: orchestrator.spells.spellcastingAbility,
    selectedSpells: [
      ...(orchestrator.spells.selectedCantrips || []).map(s => s.index), 
      ...(orchestrator.spells.selectedSpells || []).map(s => s.index)
    ],
    knownSpells: orchestrator.spells.spellsKnown || 0,
    spellSlots: orchestrator.spells.spellSlots || {},
    
    // Personality - COM VERIFICAÇÃO DE SEGURANÇA
    personalityTraits: (orchestrator.personality.traits || []).map(t => t.text),
    ideals: (orchestrator.personality.ideals || []).map(i => i.text),
    bonds: (orchestrator.personality.bonds || []).map(b => b.text),
    flaws: (orchestrator.personality.flaws || []).map(f => f.text),
    
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

    // Bônus raciais - COM VERIFICAÇÃO DE SEGURANÇA
    if (orchestrator.basics.basics.selectedRace?.ability_bonuses) {
      orchestrator.basics.basics.selectedRace.ability_bonuses.forEach(bonus => {
        const ability = bonus.ability_score.index as keyof AbilityScores;
        bonuses[ability] += bonus.bonus;
      });
    }

    // Bônus sub-raciais - COM VERIFICAÇÃO DE SEGURANÇA
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
      orchestrator.api.useClassesQuery().data?.find(c => c.index === classIndex) : 
      orchestrator.basics.basics.selectedClass;
    
    return selectedClass?.spellcasting?.spellcasting_ability?.index as keyof AbilityScores || null;
  }, [orchestrator.api, orchestrator.basics.basics.selectedClass]);

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

  const updateAbilityScore = useCallback((ability: keyof AbilityScores, score: number) => {
    orchestrator.abilities.updateScore(ability, score);
  }, [orchestrator]);

  const toggleSkill = useCallback((skillKey: string) => {
    orchestrator.skills.toggleSkill(skillKey);
  }, [orchestrator]);

  const toggleSpell = useCallback((spellKey: string) => {
    // TODO: implementar quando spell management estiver pronto
    console.log('toggleSpell not implemented yet:', spellKey);
  }, []);

  // ===========================
  // VALIDATION
  // ===========================

  const validateStep = useCallback((stepIndex: number) => {
    return orchestrator.steps.steps[stepIndex]?.isValid || false;
  }, [orchestrator.steps.steps]);

  const validateCurrentStep = useCallback(() => {
    return validateStep(orchestrator.steps.currentStep);
  }, [validateStep, orchestrator.steps.currentStep]);

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
  // CONTEXT VALUE - CORRIGIDO PARA USAR STEPS CORRETAMENTE
  // ===========================

  const contextValue: CharacterCreationContextType = {
    // Step Management - CORRIGIDO
    currentStep: orchestrator.steps.currentStep, // Índice numérico
    steps: orchestrator.steps.steps, // Array de steps
    currentStepData: orchestrator.steps.currentStepData, // Dados do step atual
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

    // Loading States - COM VERIFICAÇÃO DE SEGURANÇA
    isLoading: orchestrator.isLoading || false,
    loading: orchestrator.isLoading || false,
    error: orchestrator.api?.error || null,

    // D&D Data - COM VERIFICAÇÃO DE SEGURANÇA
    races: orchestrator.queries?.races?.data || [],
    classes: orchestrator.queries?.classes?.data || [],
    backgrounds: orchestrator.queries?.backgrounds?.data || [],
    spells: [], // TODO: implementar busca de magias
    subclasses: [], // TODO: implementar
    subraces: [], // TODO: implementar

    // Individual Loading States - COM VERIFICAÇÃO DE SEGURANÇA
    isLoadingRaces: orchestrator.queries?.races?.isLoading || false,
    isLoadingClasses: orchestrator.queries?.classes?.isLoading || false,
    isLoadingBackgrounds: orchestrator.queries?.backgrounds?.isLoading || false,
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