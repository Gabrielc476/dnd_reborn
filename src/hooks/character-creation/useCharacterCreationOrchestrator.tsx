// ===========================
// useCharacterCreationOrchestrator.ts
// Hook principal que orquestra todos os hooks de criação de personagem
// ===========================

import { useCallback, useMemo, useEffect } from 'react';
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
}

export const useCharacterCreationOrchestrator = (campaignId?: string): CharacterCreationOrchestrator => {
  // Inicializar todos os hooks
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
  // EFEITOS DE SINCRONIZAÇÃO
  // ===========================

  // Sincronizar validade dos steps
  useEffect(() => {
    steps.updateStepValidity('basics', basics.isValid);
  }, [basics.isValid, steps.updateStepValidity]);

  useEffect(() => {
    steps.updateStepValidity('abilities', abilities.isValid);
  }, [abilities.isValid, steps.updateStepValidity]);

  useEffect(() => {
    steps.updateStepValidity('skills', skills.isValid);
  }, [skills.isValid, steps.updateStepValidity]);

  useEffect(() => {
    steps.updateStepValidity('equipment', equipment.isValid);
  }, [equipment.isValid, steps.updateStepValidity]);

  useEffect(() => {
    steps.updateStepValidity('personality', personality.isValid);
  }, [personality.isValid, steps.updateStepValidity]);

  useEffect(() => {
    steps.updateStepValidity('spells', spells.isValid);
  }, [spells.isValid, steps.updateStepValidity]);

  // Configurar steps baseado nas escolhas (ex: magias)
  useEffect(() => {
    if (basics.basics.selectedClass) {
      const characterClass = basics.basics.selectedClass as DndClass;
      const isSpellcaster = !!characterClass.spellcasting;
      
      steps.configureStepsForCharacter({ 
        selectedClass: basics.basics.selectedClass,
        isSpellcaster 
      });
      
      // Configurar conjuração se for uma classe conjuradora
      if (isSpellcaster) {
        const spellcastingAbilityKey = characterClass.spellcasting.spellcasting_ability.index as AbilityScoreKey;
        const abilityModifier = abilities.modifiers[spellcastingAbilityKey];
        spells.configureSpellcasting(characterClass, basics.basics.level, abilityModifier);
      }
    }
  }, [basics.basics.selectedClass, basics.basics.level, abilities.modifiers, steps.configureStepsForCharacter, spells.configureSpellcasting]);

  // Atualizar valores dinâmicos do hook de spells
  useEffect(() => {
    if (spells.isSpellcaster && spells.spellcastingAbility) {
      const abilityModifier = abilities.modifiers[spells.spellcastingAbility];
      spells.updateDynamicValues(
        abilityModifier,
        basics.proficiencyBonus,
        basics.basics.selectedClass as DndClass
      );
    }
  }, [
    abilities.modifiers, 
    basics.proficiencyBonus, 
    basics.basics.selectedClass, 
    spells.isSpellcaster, 
    spells.spellcastingAbility,
    spells.updateDynamicValues
  ]);

  // Aplicar modificadores raciais quando raça muda
  useEffect(() => {
    if (basics.basics.selectedRace) {
      const race = basics.basics.selectedRace as DndRace;
      const subrace = basics.basics.selectedSubrace as DndSubrace;
      
      // Aqui você aplicaria os bônus raciais nos atributos
      // abilities.applyRacialBonuses(race.ability_bonuses, subrace?.ability_bonuses);
    }
  }, [basics.basics.selectedRace, basics.basics.selectedSubrace]);

  // Aplicar habilidades de classe quando classe muda
  useEffect(() => {
    if (basics.basics.selectedClass) {
      const characterClass = basics.basics.selectedClass as DndClass;
      const classSkills = characterClass.proficiency_choices?.[0]?.from?.options?.map(
        option => option.item.index
      ) || [];
      const choicesCount = characterClass.proficiency_choices?.[0]?.choose || 2;
      
      skills.setClassSkills(classSkills, choicesCount);
    }
  }, [basics.basics.selectedClass, skills.setClassSkills]);

  // Aplicar habilidades do background quando background muda
  useEffect(() => {
    if (basics.basics.selectedBackground) {
      const background = basics.basics.selectedBackground as DndBackground;
      const backgroundSkills = background.proficiencies?.map(prof => prof.index) || [];
      
      skills.setBackgroundSkills(backgroundSkills);
      
      // Configurar opções de personalidade do background se disponível
      if (background.personality_options) {
        personality.setBackgroundOptions(background.personality_options);
      }
    }
  }, [basics.basics.selectedBackground, skills.setBackgroundSkills, personality.setBackgroundOptions]);

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
    const armorClass = equipment.equippedArmorAC + modifiers.dexterity + (equipment.equippedShield ? 2 : 0);

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
    skills.allSkills.forEach(skill => {
      const modifier = skills.getSkillModifier(skill.key, finalAbilityScores, proficiencyBonus);
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
    const personalityData = personality.getPersonalityForAPI();
    const spellsData = spells.getSpellsForAPI();

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
      pointsRemaining: abilities.remainingPoints,
      
      // Combat Stats
      hitPoints: computedStats.hitPoints,
      armorClass: computedStats.armorClass,
      
      // Skills & Proficiencies
      selectedSkills: skills.selectedSkills,
      availableSkillChoices: skills.availableChoices,
      proficiencies: skills.skillProficiencies.map(p => p.skill),
      languages: [], // TODO: implementar languages
      
      // Equipment
      selectedEquipment: equipment.equipment.map(eq => eq.index),
      
      // Spellcasting
      isSpellcaster: spellsData.isSpellcaster,
      spellcastingAbility: spellsData.spellcastingAbility,
      selectedSpells: [...spellsData.cantrips, ...spellsData.spells],
      knownSpells: spells.spellsKnown,
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
    basics.reset();
    abilities.reset();
    skills.reset();
    equipment.reset();
    personality.reset();
    spells.reset();
    steps.reset();
  }, [basics, abilities, skills, equipment, personality, spells, steps]);

  // ===========================
  // RETURN OBJECT
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
    
    // Debugging (remover em produção)
    debug: {
      basicsData: basics.basics,
      abilitiesData: abilities.scores,
      skillsData: skills.allProficiencies,
      spellsData: spells.getSpellsForAPI(),
      stepsData: steps.steps,
    },
  };
};