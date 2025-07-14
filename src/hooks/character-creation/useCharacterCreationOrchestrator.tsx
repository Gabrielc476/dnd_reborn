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
import { useCharacterSteps } from './useCharacterSteps';
import { useCharacterAPI } from './useCharacterAPI';

export interface CharacterCreationOrchestrator {
  // Hooks individuais
  basics: ReturnType<typeof useCharacterBasics>;
  abilities: ReturnType<typeof useAbilityScores>;
  skills: ReturnType<typeof useCharacterSkills>;
  equipment: ReturnType<typeof useCharacterEquipment>;
  personality: ReturnType<typeof useCharacterPersonality>;
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
  getAPIData: () => any;
}

export const useCharacterCreationOrchestrator = (campaignId?: string): CharacterCreationOrchestrator => {
  // Inicializar todos os hooks
  const basics = useCharacterBasics();
  const abilities = useAbilityScores();
  const skills = useCharacterSkills();
  const equipment = useCharacterEquipment();
  const personality = useCharacterPersonality();
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

  // Configurar steps baseado nas escolhas (ex: magias)
  useEffect(() => {
    if (basics.basics.selectedClass) {
      const isSpellcaster = !!basics.basics.selectedClass.spellcasting_ability;
      steps.configureStepsForCharacter({ selectedClass: basics.basics.selectedClass });
    }
  }, [basics.basics.selectedClass, steps.configureStepsForCharacter]);

  // Aplicar modificadores raciais quando raça muda
  useEffect(() => {
    if (basics.basics.selectedRace) {
      // Aqui você aplicaria os bônus raciais nos atributos
      // Exemplo: abilities.applyRacialBonuses(basics.basics.selectedRace.ability_bonuses);
    }
  }, [basics.basics.selectedRace]);

  // Aplicar habilidades de classe quando classe muda
  useEffect(() => {
    if (basics.basics.selectedClass) {
      const classSkills = basics.basics.selectedClass.proficiency_choices?.[0]?.from?.options || [];
      const choicesCount = basics.basics.selectedClass.proficiency_choices?.[0]?.choose || 2;
      skills.applyClassProficiencies(classSkills, choicesCount);
    }
  }, [basics.basics.selectedClass]);

  // Aplicar habilidades de background quando background muda
  useEffect(() => {
    if (basics.basics.selectedBackground) {
      const backgroundSkills = basics.basics.selectedBackground.skill_proficiencies || [];
      skills.applyBackgroundProficiencies(backgroundSkills);
      
      // Aplicar opções de personalidade do background
      if (basics.basics.selectedBackground.personality_options) {
        personality.setBackgroundOptions(basics.basics.selectedBackground.personality_options);
      }
    }
  }, [basics.basics.selectedBackground]);

  // ===========================
  // COMPUTED VALUES
  // ===========================

  const computedStats = useMemo(() => {
    const proficiencyBonus = Math.ceil(basics.basics.level / 4) + 1;
    const finalAbilities = abilities.getFinalScores(basics.basics.selectedRace?.ability_bonuses);
    const constitutionMod = Math.floor((finalAbilities.constitution - 10) / 2);
    
    // Hit Points
    const baseHP = basics.basics.selectedClass?.hit_die || 8;
    const hitPoints = baseHP + constitutionMod + ((basics.basics.level - 1) * (Math.floor(baseHP / 2) + 1 + constitutionMod));
    
    // Armor Class
    let armorClass = 10 + abilities.modifiers.dexterity;
    if (equipment.equippedArmorAC) {
      const armor = equipment.equippedArmorAC;
      armorClass = armor.base;
      if (armor.dex_bonus) {
        const dexBonus = armor.max_bonus ? 
          Math.min(abilities.modifiers.dexterity, armor.max_bonus) : 
          abilities.modifiers.dexterity;
        armorClass += dexBonus;
      }
    }
    if (equipment.equippedShield) {
      armorClass += 2; // Escudo adiciona +2
    }
    
    // Saving Throws
    const savingThrows: Record<string, number> = {};
    Object.entries(abilities.modifiers).forEach(([ability, modifier]) => {
      savingThrows[ability] = modifier;
      // Adicionar proficiência se a classe der
      if (basics.basics.selectedClass?.saving_throws?.includes(ability)) {
        savingThrows[ability] += proficiencyBonus;
      }
    });
    
    // Skill Bonuses
    const skillBonuses: Record<string, number> = {};
    skills.ALL_SKILLS.forEach(skill => {
      skillBonuses[skill.name] = skills.getSkillBonus(skill.name, abilities.modifiers, proficiencyBonus);
    });
    
    return {
      hitPoints,
      armorClass,
      proficiencyBonus,
      savingThrows,
      skillBonuses,
    };
  }, [basics.basics, abilities, equipment.equippedArmorAC, equipment.equippedShield, skills]);

  // ===========================
  // VALIDAÇÃO GLOBAL
  // ===========================

  const isValid = useMemo(() => {
    return basics.isValid && abilities.isValid && skills.isValid && equipment.isValid && personality.isValid;
  }, [basics.isValid, abilities.isValid, skills.isValid, equipment.isValid, personality.isValid]);

  const isComplete = useMemo(() => {
    return steps.isWizardComplete;
  }, [steps.isWizardComplete]);

  // ===========================
  // AÇÕES PRINCIPAIS
  // ===========================

  const validateAll = useCallback(() => {
    const basicsValid = basics.validate();
    const abilitiesValid = abilities.isValid;
    const skillsValid = skills.isValid;
    const equipmentValid = equipment.isValid;
    const personalityValid = personality.isValid;
    
    return basicsValid && abilitiesValid && skillsValid && equipmentValid && personalityValid;
  }, [basics, abilities.isValid, skills.isValid, equipment.isValid, personality.isValid]);

  const getAPIData = useCallback(() => {
    const finalAbilities = abilities.getFinalScores(basics.basics.selectedRace?.ability_bonuses);
    
    return {
      name: basics.basics.name,
      race: basics.basics.selectedRace?.index,
      subrace: basics.basics.selectedSubrace?.index,
      character_class: basics.basics.selectedClass?.index,
      subclass: basics.basics.selectedSubclass?.index,
      background: basics.basics.selectedBackground?.index,
      alignment: basics.basics.alignment,
      level: basics.basics.level,
      ability_scores: finalAbilities,
      skills: skills.allProficiencies,
      hit_points: computedStats.hitPoints,
      armor_class: computedStats.armorClass,
      equipment: equipment.equipment,
      personality: personality.personalityStrings,
      campaign_id: campaignId,
    };
  }, [basics.basics, abilities, skills.allProficiencies, computedStats, equipment.equipment, personality.personalityStrings, campaignId]);

  const saveCharacter = useCallback(async (campaignIdOverride?: string) => {
    if (!validateAll()) {
      throw new Error('Personagem inválido. Verifique todos os campos obrigatórios.');
    }
    
    const characterData = getAPIData();
    if (campaignIdOverride) {
      characterData.campaign_id = campaignIdOverride;
    }
    
    return await api.createCharacter(characterData);
  }, [validateAll, getAPIData, api.createCharacter]);

  const resetAll = useCallback(() => {
    basics.reset();
    abilities.reset();
    skills.reset();
    equipment.reset();
    personality.reset();
    steps.reset();
  }, [basics, abilities, skills, equipment, personality, steps]);

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
      stepsData: steps.steps,
    },
  };
};