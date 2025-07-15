// ===========================
// useCharacterSkills.tsx - CORRIGIDO
// Hook para gerenciar habilidades do personagem
// ===========================

import { useState, useCallback, useMemo } from 'react';
import { Skill, SKILLS, AbilityScores, AbilityScoreKey } from '@/types/characterCreation';

// Interface para proficiências específicas do hook
export interface SkillProficiency {
  skill: string;
  source: 'class' | 'background' | 'race' | 'feat';
  proficient: boolean;
  expertise?: boolean;
}

export const useCharacterSkills = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availableChoices, setAvailableChoices] = useState(2);
  const [skillProficiencies, setSkillProficiencies] = useState<SkillProficiency[]>([]);
  const [expertiseSkills, setExpertiseSkills] = useState<string[]>([]);
  const [classSkillOptions, setClassSkillOptions] = useState<string[]>([]);
  const [backgroundSkills, setBackgroundSkillsState] = useState<string[]>([]);
  const [racialSkills, setRacialSkillsState] = useState<string[]>([]);

  // Adicionar proficiência por fonte
  const addSkillProficiency = useCallback((skill: string, source: 'class' | 'background' | 'race' | 'feat') => {
    setSkillProficiencies(prev => {
      const existing = prev.find(p => p.skill === skill);
      if (existing) {
        return prev.map(p => p.skill === skill ? { ...p, source, proficient: true } : p);
      } else {
        return [...prev, { skill, source, proficient: true }];
      }
    });

    // Adicionar à lista de skills selecionadas se não estiver
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills(prev => [...prev, skill]);
    }
  }, [selectedSkills]);

  // Remover proficiência
  const removeSkillProficiency = useCallback((skill: string, source?: 'class' | 'background' | 'race' | 'feat') => {
    setSkillProficiencies(prev => {
      if (source) {
        return prev.filter(p => !(p.skill === skill && p.source === source));
      } else {
        return prev.filter(p => p.skill !== skill);
      }
    });

    // Remover da lista de skills selecionadas se não tiver mais proficiências
    setSelectedSkills(prev => {
      const hasOtherProficiency = skillProficiencies.some(p => 
        p.skill === skill && p.source !== source
      );
      if (!hasOtherProficiency) {
        return prev.filter(s => s !== skill);
      }
      return prev;
    });
  }, [skillProficiencies]);

  // Toggle skill selection
  const toggleSkill = useCallback((skill: string) => {
    if (selectedSkills.includes(skill)) {
      removeSkillProficiency(skill, 'class');
    } else {
      addSkillProficiency(skill, 'class');
    }
  }, [selectedSkills, addSkillProficiency, removeSkillProficiency]);

  // Verificar se pode selecionar skill
  const canSelectSkill = useCallback((skill: string) => {
    // Se já está selecionada, pode remover
    if (selectedSkills.includes(skill)) {
      return true;
    }
    
    // Se não está selecionada, verificar se tem escolhas disponíveis
    const classSkillsSelected = selectedSkills.filter(s => 
      classSkillOptions.includes(s) && 
      skillProficiencies.some(p => p.skill === s && p.source === 'class')
    ).length;
    
    return classSkillsSelected < availableChoices && classSkillOptions.includes(skill);
  }, [selectedSkills, availableChoices, classSkillOptions, skillProficiencies]);

  // Configurar skills da classe
  const setClassSkills = useCallback((skillOptions: string[], choices: number = 2) => {
    setClassSkillOptions(skillOptions);
    setAvailableChoices(choices);
    
    // Remover skills de classe que não estão mais disponíveis
    const currentClassSkills = skillProficiencies.filter(
      p => p.source === 'class'
    ).map(p => p.skill);
    
    currentClassSkills.forEach(skill => {
      if (!skillOptions.includes(skill)) {
        removeSkillProficiency(skill, 'class');
      }
    });
  }, [skillProficiencies, removeSkillProficiency]);

  // Configurar skills do background - CORRIGIDO
  const setBackgroundSkills = useCallback((skills: string[]) => {
    // Remover skills antigas do background
    backgroundSkills.forEach(skill => {
      removeSkillProficiency(skill, 'background');
    });
    
    // Adicionar novas skills do background
    skills.forEach(skill => {
      addSkillProficiency(skill, 'background');
    });
    
    // Atualizar o estado do background skills
    setBackgroundSkillsState(skills);
  }, [backgroundSkills, removeSkillProficiency, addSkillProficiency]);

  // Configurar skills raciais - CORRIGIDO
  const setRacialSkills = useCallback((skills: string[]) => {
    // Remover skills antigas da raça
    racialSkills.forEach(skill => {
      removeSkillProficiency(skill, 'race');
    });
    
    // Adicionar novas skills da raça
    skills.forEach(skill => {
      addSkillProficiency(skill, 'race');
    });
    
    // Atualizar o estado das skills raciais
    setRacialSkillsState(skills);
  }, [racialSkills, removeSkillProficiency, addSkillProficiency]);

  // Adicionar expertise
  const addExpertise = useCallback((skillKey: string) => {
    if (selectedSkills.includes(skillKey) && !expertiseSkills.includes(skillKey)) {
      setExpertiseSkills(prev => [...prev, skillKey]);
    }
  }, [selectedSkills, expertiseSkills]);

  // Remover expertise
  const removeExpertise = useCallback((skillKey: string) => {
    setExpertiseSkills(prev => prev.filter(s => s !== skillKey));
  }, []);

  // Calcular bônus de skill
  const getSkillModifier = useCallback((
    skillKey: string, 
    abilityScores: AbilityScores,
    proficiencyBonus: number = 2
  ) => {
    const skill = SKILLS.find(s => s.key === skillKey);
    if (!skill) return 0;

    const abilityMod = Math.floor((abilityScores[skill.ability] - 10) / 2);
    const isProficient = skillProficiencies.some(p => p.skill === skillKey);
    const hasExpertise = expertiseSkills.includes(skillKey);

    let bonus = abilityMod;
    if (isProficient) {
      bonus += proficiencyBonus;
    }
    if (hasExpertise) {
      bonus += proficiencyBonus; // Expertise dobra o bônus de proficiência
    }

    return bonus;
  }, [skillProficiencies, expertiseSkills]);

  // Computed values
  const allProficiencies = useMemo(() => {
    return skillProficiencies.map(p => ({
      ...p,
      skillInfo: SKILLS.find(s => s.key === p.skill)
    }));
  }, [skillProficiencies]);

  // Validação
  const isValid = useMemo(() => {
    const classSkillsSelected = selectedSkills.filter(skill => 
      classSkillOptions.includes(skill) && 
      skillProficiencies.some(p => p.skill === skill && p.source === 'class')
    ).length;
    
    return classSkillsSelected === availableChoices;
  }, [selectedSkills, classSkillOptions, skillProficiencies, availableChoices]);

  // Reset
  const reset = useCallback(() => {
    setSelectedSkills([]);
    setAvailableChoices(2);
    setSkillProficiencies([]);
    setExpertiseSkills([]);
    setClassSkillOptions([]);
    setBackgroundSkillsState([]);
    setRacialSkillsState([]);
  }, []);

  // Helpers
  const getSkillsBySource = useCallback((source: 'class' | 'background' | 'race' | 'feat') => {
    return skillProficiencies
      .filter(p => p.source === source)
      .map(p => p.skill);
  }, [skillProficiencies]);

  const getSkillInfo = useCallback((skillKey: string): Skill | undefined => {
    return SKILLS.find(s => s.key === skillKey);
  }, []);

  const remainingChoices = useMemo(() => {
    const classSkillsSelected = selectedSkills.filter(skill => 
      classSkillOptions.includes(skill) && 
      skillProficiencies.some(p => p.skill === skill && p.source === 'class')
    ).length;
    
    return availableChoices - classSkillsSelected;
  }, [selectedSkills, classSkillOptions, skillProficiencies, availableChoices]);

  return {
    // State
    selectedSkills,
    availableChoices,
    skillProficiencies,
    expertiseSkills,
    classSkillOptions,
    backgroundSkills,
    racialSkills,
    
    // Actions
    toggleSkill,
    addSkillProficiency,
    removeSkillProficiency,
    setClassSkills,
    setBackgroundSkills,
    setRacialSkills,
    addExpertise,
    removeExpertise,
    
    // Validation
    canSelectSkill,
    isValid,
    
    // Utils
    reset,
    getSkillModifier,
    getSkillsBySource,
    getSkillInfo,
    
    // Computed values
    allProficiencies,
    remainingChoices,
    
    // Constants
    allSkills: SKILLS,
  };
};