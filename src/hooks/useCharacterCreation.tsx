import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useCharacterCreationOrchestrator } from './character-creation/useCharacterCreationOrchestrator';
import { CharacterCreationContextType, CharacterCreationData, AbilityScores } from '@/types/characterCreation';

// ===========================
// CONTEXT CREATION
// ===========================

const CharacterCreationContext = createContext<CharacterCreationContextType | undefined>(undefined);

export const useCharacterCreationContext = () => {
  const context = useContext(CharacterCreationContext);
  if (!context) {
    throw new Error('useCharacterCreationContext must be used within a CharacterCreationProvider');
  }
  return context;
};

// ===========================
// PROVIDER COMPONENT
// ===========================

interface CharacterCreationProviderProps {
  children: React.ReactNode;
  campaignId?: string;
}

export const CharacterCreationProvider: React.FC<CharacterCreationProviderProps> = ({ 
  children, 
  campaignId 
}) => {
  const orchestrator = useCharacterCreationOrchestrator(campaignId);

  // ===========================
  // COMPUTED CHARACTER DATA
  // ===========================

  const characterData = useMemo((): CharacterCreationData => ({
    // Basic Info - COM VERIFICAÇÃO DE SEGURANÇA
    name: orchestrator.basics.basics.name,
    level: orchestrator.basics.basics.level,
    selectedRace: orchestrator.basics.basics.selectedRace,
    selectedClass: orchestrator.basics.basics.selectedClass,
    selectedBackground: orchestrator.basics.basics.selectedBackground,
    alignment: orchestrator.basics.basics.alignment,
    characterClass: orchestrator.basics.basics.selectedClass,
    
    // Ability Scores - COM VERIFICAÇÃO DE SEGURANÇA
    abilityScores: orchestrator.abilities.scores,
    
    // Skills - COM VERIFICAÇÃO DE SEGURANÇA
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
        const abilityName = bonus.ability_score.index as keyof AbilityScores;
        bonuses[abilityName] += bonus.bonus;
      });
    }

    // Bônus de sub-raça - COM VERIFICAÇÃO DE SEGURANÇA
    if (orchestrator.basics.basics.selectedSubrace?.ability_bonuses) {
      orchestrator.basics.basics.selectedSubrace.ability_bonuses.forEach(bonus => {
        const abilityName = bonus.ability_score.index as keyof AbilityScores;
        bonuses[abilityName] += bonus.bonus;
      });
    }

    return bonuses;
  }, [orchestrator.basics.basics.selectedRace, orchestrator.basics.basics.selectedSubrace]);

  const calculateModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  const calculateHitPoints = useCallback(() => {
    const selectedClass = orchestrator.basics.basics.selectedClass;
    const constitutionModifier = calculateModifier(orchestrator.abilities.scores.constitution);
    const level = orchestrator.basics.basics.level;
    
    if (!selectedClass) return 0;
    
    const hitDie = selectedClass.hit_die;
    const baseHP = hitDie + constitutionModifier; // Máximo no nível 1
    const additionalHP = (level - 1) * (Math.floor(hitDie / 2) + 1 + constitutionModifier);
    
    return Math.max(1, baseHP + additionalHP);
  }, [orchestrator.basics.basics.selectedClass, orchestrator.abilities.scores.constitution, orchestrator.basics.basics.level, calculateModifier]);

  const calculateArmorClass = useCallback(() => {
    const dexterityModifier = calculateModifier(orchestrator.abilities.scores.dexterity);
    return 10 + dexterityModifier; // AC base sem armadura
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
    // ✅ CORREÇÃO: Tratamento simplificado para abilityMethod
    if (updates.abilityMethod !== undefined) {
      orchestrator.abilities.changeMethod(updates.abilityMethod as any);
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
  }, [orchestrator.abilities]);

  const toggleSkill = useCallback((skillKey: string) => {
    orchestrator.skills.toggleSkill(skillKey);
  }, [orchestrator]);

  const toggleSpell = useCallback((spellKey: string) => {
    // TODO: implementar quando spell management estiver pronto
    console.log('toggleSpell not implemented yet:', spellKey);
  }, []);

  // ===========================
  // VALIDATION - CORRIGIDO PARA USAR A FUNÇÃO DO STEPS
  // ===========================

  const validateStep = useCallback((stepIndex: number) => {
    return orchestrator.steps.steps[stepIndex]?.isValid || false;
  }, [orchestrator.steps.steps]);

  const validateCurrentStep = useCallback(() => {
    return validateStep(orchestrator.steps.currentStep);
  }, [validateStep, orchestrator.steps.currentStep]);

  // ✅ CORREÇÃO: Usar a função canProceed do steps em vez de duplicar a lógica
  const canProceed = useCallback((): boolean => {
    return orchestrator.steps.canProceed();
  }, [orchestrator.steps]);

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
    canProceed, // ✅ CORRIGIDO: Agora usa a função do steps

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
    isLoadingSpells: false, // TODO: implementar
    isLoadingSubclasses: false, // TODO: implementar
    isLoadingSubraces: false, // TODO: implementar

    // Search Functionality
    raceSearch: '',
    setRaceSearch: () => {},
    classSearch: '',
    setClassSearch: () => {},
    spellSearch: '',
    setSpellSearch: () => {},
    raceSearchTerm: '',
    setRaceSearchTerm: () => {},
    classSearchTerm: '',
    setClassSearchTerm: () => {},
    spellSearchTerm: '',
    setSpellSearchTerm: () => {},

    // Validation
    validateStep: (stepId: string) => {
      const stepIndex = orchestrator.steps.steps.findIndex(s => s.id === stepId);
      return stepIndex >= 0 ? validateStep(stepIndex) : false;
    },
    validateCurrentStep,
    isStepValid: (stepId: string) => {
      const step = orchestrator.steps.steps.find(s => s.id === stepId);
      return step?.isValid || false;
    },

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
// CUSTOM HOOK FOR EASIER USAGE
// ===========================

export const useCharacterCreation = () => {
  return useCharacterCreationContext();
};