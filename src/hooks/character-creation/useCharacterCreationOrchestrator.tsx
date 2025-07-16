// ===========================
// useCharacterCreationOrchestrator.tsx - CORRIGIDO
// Hook principal que orquestra todos os hooks de criação de personagem
// ===========================

import { useCallback, useMemo, useEffect, useRef } from 'react';
import { useCharacterBasics } from './useCharacterBasics';
// ✅ CORREÇÃO: Import corrigido
import * as AbilityScoresModule from './useAbilityScores';
import { useCharacterSkills } from './useCharacterSkills';
import useCharacterEquipment from './useCharacterEquipment';
import useCharacterPersonality from './useCharacterPersonality';
import useCharacterSpells from './useCharacterSpells';
import { useCharacterSteps } from './useCharacterSteps';
import { useCharacterAPI } from './useCharacterAPI';
import { 
  CharacterCreationData, 
  AbilityScores, 
  DndClass, 
  DndRace,
  DndSubrace,
  DndBackground,
  DndSubclass
} from '@/types/characterCreation';

// ✅ CORREÇÃO: Extrair o hook do módulo
const useAbilityScores = AbilityScoresModule.useAbilityScores;

export interface CharacterCreationOrchestrator {
  // Hooks individuais
  basics: ReturnType<typeof useCharacterBasics>;
  abilities: ReturnType<typeof useAbilityScores>;
  skills: ReturnType<typeof useCharacterSkills>;
  equipment: ReturnType<typeof useCharacterEquipment>;
  personality: ReturnType<typeof useCharacterPersonality>;
  spells: ReturnType<typeof useCharacterSpells>;
  steps: ReturnType<typeof useCharacterSteps>;
  api: ReturnType<typeof useCharacterAPI>;
  
  // Estado global
  isValid: boolean;
  isComplete: boolean;
  
  // Ações principais
  saveCharacter: (campaignId?: string) => Promise<any>;
  resetAll: () => void;
  validateAll: () => boolean;
  
  // Helpers computados
  computedStats: {
    hitPoints: number;
    armorClass: number;
    proficiencyBonus: number;
    savingThrows: Record<string, number>;
    skillBonuses: Record<string, number>;
  };
  
  // Data para API
  getAPIData: () => CharacterCreationData;
  
  // Queries para facilitar acesso
  queries: {
    races: any;
    classes: any;
    backgrounds: any;
  };
  
  // Loading states
  isLoading: boolean;
}

export const useCharacterCreationOrchestrator = (campaignId?: string): CharacterCreationOrchestrator => {
  // ===========================
  // INICIALIZAR TODOS OS HOOKS
  // ===========================
  const basics = useCharacterBasics();
  const abilities = useAbilityScores(); // ✅ Agora deve funcionar
  const skills = useCharacterSkills();
  const equipment = useCharacterEquipment();
  const personality = useCharacterPersonality();
  const spells = useCharacterSpells();
  const steps = useCharacterSteps();
  const api = useCharacterAPI();

  // Queries da API
  const racesQuery = api.useRacesQuery();
  const classesQuery = api.useClassesQuery();
  const backgroundsQuery = api.useBackgroundsQuery();

  // ===========================
  // REFS PARA EVITAR LOOPS
  // ===========================
  const lastValidityRef = useRef({
    basics: false,
    abilities: false,
    skills: false,
    equipment: false,
    personality: false,
    spells: false,
  });

  const lastSelectedClassRef = useRef<any>(null);
  const lastSelectedBackgroundRef = useRef<any>(null);

  // ===========================
  // EFEITOS DE SINCRONIZAÇÃO
  // ===========================

  // Sincronizar validade dos steps
  useEffect(() => {
    const currentValidity = {
      basics: basics.isValid,
      abilities: abilities.isValid,
      skills: skills.isValid,
      equipment: equipment.isValid,
      personality: personality.isValid,
      spells: spells.isValid,
    };

    // Só atualizar se a validade realmente mudou
    Object.entries(currentValidity).forEach(([stepId, isValid]) => {
      if (lastValidityRef.current[stepId as keyof typeof lastValidityRef.current] !== isValid) {
        steps.updateStepValidity(stepId, isValid);
        lastValidityRef.current[stepId as keyof typeof lastValidityRef.current] = isValid;
      }
    });
  }, [
    basics.isValid, 
    abilities.isValid, 
    skills.isValid, 
    equipment.isValid, 
    personality.isValid, 
    spells.isValid,
    steps
  ]);

  // Configurar steps baseado na classe selecionada
  useEffect(() => {
    const selectedClass = basics.basics.selectedClass;
    
    // Só processar se a classe realmente mudou e existe
    if (selectedClass && selectedClass !== lastSelectedClassRef.current) {
      console.log("Classe alterada:", selectedClass.name);
      lastSelectedClassRef.current = selectedClass;
      
      const isSpellcaster = !!selectedClass.spellcasting;
      
      // Atualizar steps
      steps.configureStepsForCharacter({ isSpellcaster });
      
      // Configurar conjuração se necessário
      if (isSpellcaster && spells.configureSpellcasting) {
        const spellcastingAbilityKey = selectedClass.spellcasting.spellcasting_ability.index as keyof AbilityScores;
        const abilityModifier = abilities.modifiers[spellcastingAbilityKey] || 0;
        
        spells.configureSpellcasting(
          selectedClass,
          basics.basics.level,
          abilityModifier
        );
      }
    }
  }, [basics.basics.selectedClass, steps, spells, abilities.modifiers, basics.basics.level]);

  // ===========================
  // COMPUTED STATS
  // ===========================

  const computedStats = useMemo(() => {
    const selectedClass = basics.basics.selectedClass;
    const constitutionModifier = abilities.modifiers.constitution;
    const dexterityModifier = abilities.modifiers.dexterity;
    const level = basics.basics.level;
    
    // Hit Points
    const hitDie = selectedClass?.hit_die || 8;
    const hitPoints = hitDie + constitutionModifier + ((level - 1) * (Math.floor(hitDie / 2) + 1 + constitutionModifier));
    
    // Armor Class (base)
    const armorClass = 10 + dexterityModifier;
    
    // Proficiency Bonus
    const proficiencyBonus = Math.ceil(level / 4) + 1;
    
    return {
      hitPoints: Math.max(1, hitPoints),
      armorClass,
      proficiencyBonus,
      savingThrows: {}, // TODO: implementar
      skillBonuses: {}, // TODO: implementar
    };
  }, [basics.basics.selectedClass, abilities.modifiers, basics.basics.level]);

  // ===========================
  // VALIDAÇÃO GLOBAL
  // ===========================

  const isValid = useMemo(() => {
    const requiredSteps = steps.steps.filter(step => step.isRequired);
    return requiredSteps.every(step => step.isValid);
  }, [steps.steps]);

  const isComplete = useMemo(() => {
    return steps.steps.every(step => step.isValid);
  }, [steps.steps]);

  // ===========================
  // AÇÕES PRINCIPAIS
  // ===========================

  const resetAll = useCallback(() => {
    basics.reset();
    abilities.reset();
    skills.reset();
    equipment.reset();
    personality.reset();
    spells.resetSpells?.();
    steps.reset();
  }, [basics, abilities, skills, equipment, personality, spells, steps]);

  const validateAll = useCallback(() => {
    return isValid;
  }, [isValid]);

  const saveCharacter = useCallback(async (campaignId?: string) => {
    if (!isValid) {
      throw new Error('Personagem inválido');
    }

    const characterData = getAPIData();
    
    try {
      const result = await api.createCharacter(characterData, campaignId);
      return result;
    } catch (error) {
      console.error('Erro ao salvar personagem:', error);
      throw error;
    }
  }, [isValid, api]);

  const getAPIData = useCallback((): CharacterCreationData => {
    return {
      // Basic Info
      name: basics.basics.name,
      level: basics.basics.level,
      selectedRace: basics.basics.selectedRace,
      selectedClass: basics.basics.selectedClass,
      selectedBackground: basics.basics.selectedBackground,
      alignment: basics.basics.alignment,
      characterClass: basics.basics.selectedClass,
      
      // Ability Scores
      abilityMethod: abilities.method,
      abilityScores: abilities.scores,
      pointsRemaining: abilities.remainingPoints,
      
      // Skills
      selectedSkills: skills.selectedSkills || [],
      availableSkillChoices: skills.availableChoices || 0,
      proficiencies: (skills.skillProficiencies || []).map(p => p.skill),
      languages: [],
      
      // Equipment
      selectedEquipment: (equipment.equipment || []).map(eq => eq.index),
      
      // Spellcasting
      isSpellcaster: spells.isSpellcaster || false,
      spellcastingAbility: spells.spellcastingAbility,
      selectedSpells: [
        ...(spells.selectedCantrips || []).map(s => s.index), 
        ...(spells.selectedSpells || []).map(s => s.index)
      ],
      knownSpells: spells.spellsKnown || 0,
      spellSlots: spells.spellSlots || {},
      
      // Personality
      personalityTraits: (personality.traits || []).map(t => t.text),
      ideals: (personality.ideals || []).map(i => i.text),
      bonds: (personality.bonds || []).map(b => b.text),
      flaws: (personality.flaws || []).map(f => f.text),
      
      // Additional
      backstory: '',
      notes: '',
    };
  }, [basics, abilities, skills, equipment, spells, personality]);

  // ===========================
  // RETURN
  // ===========================

  return {
    // Hooks individuais
    basics,
    abilities,
    skills,
    equipment,
    personality,
    spells,
    steps,
    api,
    
    // Estado global
    isValid,
    isComplete,
    
    // Ações principais
    saveCharacter,
    resetAll,
    validateAll,
    
    // Helpers computados
    computedStats,
    
    // Data para API
    getAPIData,
    
    // Queries para facilitar acesso
    queries: {
      races: racesQuery,
      classes: classesQuery,
      backgrounds: backgroundsQuery,
    },
    
    // Loading states
    isLoading: racesQuery.isLoading || classesQuery.isLoading || backgroundsQuery.isLoading,
  };
};