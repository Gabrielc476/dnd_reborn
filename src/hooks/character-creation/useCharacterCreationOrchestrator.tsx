// ===========================
// useCharacterCreationOrchestrator.tsx - DEPENDÊNCIAS CORRIGIDAS
// Hook principal que orquestra todos os hooks de criação de personagem
// ===========================

import { useCallback, useMemo, useEffect, useRef } from 'react';
import { useCharacterBasics } from './useCharacterBasics';
import { useAbilityScores } from './useAbilityScores';
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
  const abilities = useAbilityScores();
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
  // REFS PARA EVITAR LOOPS - SOLUÇÃO PARA O ERRO
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
  // EFEITOS DE SINCRONIZAÇÃO - CORRIGIDOS
  // ===========================

  // Sincronizar validade dos steps - USANDO REF PARA EVITAR LOOPS
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
    spells.isValid
    // Removemos steps.updateStepValidity das dependências para evitar loop
  ]);

  // Configurar steps baseado na classe selecionada - USANDO REF
  useEffect(() => {
    const selectedClass = basics.basics.selectedClass;
    
    // Só processar se a classe realmente mudou
    if (selectedClass && selectedClass !== lastSelectedClassRef.current) {
      lastSelectedClassRef.current = selectedClass;
      
      const characterClass = selectedClass as DndClass;
      const isSpellcaster = !!characterClass.spellcasting;
      
      // Configurar steps
      steps.configureStepsForCharacter({ isSpellcaster });
      
      // Configurar conjuração se for uma classe conjuradora
      if (isSpellcaster && spells.configureSpellcasting) {
        const spellcastingAbilityKey = characterClass.spellcasting.spellcasting_ability.index as keyof AbilityScores;
        const abilityModifier = abilities.modifiers[spellcastingAbilityKey];
        spells.configureSpellcasting(characterClass, basics.basics.level, abilityModifier);
      }

      // Configurar skills de classe
      const classSkills = characterClass.proficiency_choices?.[0]?.from?.options?.map(
        option => option.item.index
      ) || [];
      const choicesCount = characterClass.proficiency_choices?.[0]?.choose || 2;
      
      if (skills.setClassSkills) {
        skills.setClassSkills(classSkills, choicesCount);
      }
    }
  }, [
    basics.basics.selectedClass,
    basics.basics.level,
    abilities.modifiers
    // Removemos as funções das dependências para evitar loops
  ]);

  // Configurar background - USANDO REF
  useEffect(() => {
    const selectedBackground = basics.basics.selectedBackground;
    
    // Só processar se o background realmente mudou
    if (selectedBackground && selectedBackground !== lastSelectedBackgroundRef.current) {
      lastSelectedBackgroundRef.current = selectedBackground;
      
      const background = selectedBackground as DndBackground;
      const backgroundSkills = background.starting_proficiencies?.map(prof => prof.index) || [];
      
      if (skills.setBackgroundSkills) {
        skills.setBackgroundSkills(backgroundSkills);
      }
      
      // Configurar opções de personalidade do background se disponível
      if (background.personality_traits && personality.setBackgroundOptions) {
        // personality.setBackgroundOptions(background.personality_options);
      }
    }
  }, [
    basics.basics.selectedBackground
    // Removemos as funções das dependências
  ]);

  // ===========================
  // COMPUTED VALUES
  // ===========================

  // Calcular estatísticas finais
  const computedStats = useMemo(() => {
    const level = basics.basics.level;
    const proficiencyBonus = basics.proficiencyBonus;
    const finalAbilityScores = abilities.scores;
    const modifiers = abilities.modifiers;

    // Hit Points
    const hitDie = (basics.basics.selectedClass as DndClass)?.hit_die || 8;
    const hitPoints = hitDie + modifiers.constitution + ((level - 1) * (Math.floor(hitDie / 2) + 1 + modifiers.constitution));

    // Armor Class (base)
    const baseAC = 10 + modifiers.dexterity;
    const armorClass = (equipment.equippedArmorAC || 0) + modifiers.dexterity + (equipment.equippedShield ? 2 : 0);

    // Saving Throws
    const classProfs = (basics.basics.selectedClass as DndClass)?.saving_throws || [];
    const savingThrows: Record<string, number> = {};
    Object.keys(finalAbilityScores).forEach(ability => {
      const modifier = modifiers[ability as keyof AbilityScores];
      const isProficient = classProfs.some(prof => prof.index === ability);
      savingThrows[ability] = modifier + (isProficient ? proficiencyBonus : 0);
    });

    // Skill Bonuses
    const skillBonuses: Record<string, number> = {};
    (skills.allSkills || []).forEach(skill => {
      const modifier = skills.getSkillModifier ? 
        skills.getSkillModifier(skill.key, finalAbilityScores, proficiencyBonus) : 0;
      skillBonuses[skill.key] = modifier;
    });

    return {
      hitPoints,
      armorClass,
      proficiencyBonus,
      savingThrows,
      skillBonuses,
    };
  }, [
    basics.basics.level,
    basics.basics.selectedClass,
    basics.proficiencyBonus,
    abilities.scores,
    abilities.modifiers,
    equipment.equippedArmorAC,
    equipment.equippedShield,
    skills.allSkills,
    skills.getSkillModifier,
  ]);

  // Validação geral
  const validateAll = useCallback(() => {
    return (
      basics.isValid &&
      abilities.isValid &&
      skills.isValid &&
      equipment.isValid &&
      personality.isValid &&
      spells.isValid
    );
  }, [basics.isValid, abilities.isValid, skills.isValid, equipment.isValid, personality.isValid, spells.isValid]);

  const isValid = useMemo(() => {
    return validateAll();
  }, [validateAll]);

  const isComplete = useMemo(() => {
    return steps.isComplete;
  }, [steps.isComplete]);

  // ===========================
  // DATA CONVERSION
  // ===========================

  // Converter dados para formato da API
  const getAPIData = useCallback((): CharacterCreationData => {
    const basicsData = basics.basics;
    const personalityData = personality.getPersonalityForAPI ? 
      personality.getPersonalityForAPI() : 
      { traits: [], ideals: [], bonds: [], flaws: [] };
    const spellsData = spells.getSpellsForAPI ? 
      spells.getSpellsForAPI() : 
      { cantrips: [], spells: [], isSpellcaster: false, spellcastingAbility: null, spellSlots: {} };

    return {
      // Basic Info
      name: basicsData.name,
      level: basicsData.level,
      experience: 0,
      
      // Character Choices
      selectedRace: basicsData.selectedRace,
      selectedSubrace: basicsData.selectedSubrace,
      selectedClass: basicsData.selectedClass,
      selectedSubclass: basicsData.selectedSubclass,
      selectedBackground: basicsData.selectedBackground,
      alignment: basicsData.alignment || null,
      
      // Ability Scores
      abilityMethod: abilities.method,
      abilityScores: abilities.scores,
      pointsRemaining: abilities.remainingPoints || 0,
      
      // Combat Stats
      hitPoints: computedStats.hitPoints,
      armorClass: computedStats.armorClass,
      
      // Skills & Proficiencies
      selectedSkills: skills.selectedSkills || [],
      availableSkillChoices: skills.availableChoices || 0,
      proficiencies: (skills.skillProficiencies || []).map(p => p.skill),
      languages: [], // TODO: implementar languages
      
      // Equipment
      selectedEquipment: (equipment.equipment || []).map(eq => eq.index),
      
      // Spellcasting
      isSpellcaster: spellsData.isSpellcaster,
      spellcastingAbility: spellsData.spellcastingAbility,
      selectedSpells: [...(spellsData.cantrips || []), ...(spellsData.spells || [])],
      knownSpells: spells.spellsKnown || 0,
      spellSlots: spellsData.spellSlots,
      
      // Personality
      personalityTraits: personalityData.traits,
      ideals: personalityData.ideals,
      bonds: personalityData.bonds,
      flaws: personalityData.flaws,
      
      // Additional Info
      backstory: '',
      notes: '',
    };
  }, [basics.basics, abilities, skills, equipment, personality, spells, computedStats]);

  // ===========================
  // MAIN ACTIONS
  // ===========================

  // Salvar personagem
  const saveCharacter = useCallback(async (campaignIdOverride?: string) => {
    if (!validateAll()) {
      throw new Error('Personagem inválido. Verifique todos os campos obrigatórios.');
    }
    
    const characterData = getAPIData();
    if (campaignIdOverride || campaignId) {
      // characterData.campaign_id = campaignIdOverride || campaignId;
    }
    
    return await api.createCharacter(characterData);
  }, [validateAll, getAPIData, campaignId, api.createCharacter]);

  const resetAll = useCallback(() => {
    // Reset dos refs também
    lastValidityRef.current = {
      basics: false,
      abilities: false,
      skills: false,
      equipment: false,
      personality: false,
      spells: false,
    };
    lastSelectedClassRef.current = null;
    lastSelectedBackgroundRef.current = null;

    // Reset dos hooks
    basics.reset();
    abilities.reset();
    skills.reset();
    equipment.reset();
    personality.reset();
    spells.reset();
    steps.reset();
  }, [basics, abilities, skills, equipment, personality, spells, steps]);

  // ===========================
  // RETURN OBJECT COMPLETO
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
    
    // Queries úteis
    queries: {
      races: racesQuery,
      classes: classesQuery,
      backgrounds: backgroundsQuery,
    },
    
    // Estado de loading
    isLoading: api.loading || racesQuery.isLoading || classesQuery.isLoading || backgroundsQuery.isLoading,
  };
};