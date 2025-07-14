// ===========================
// useCharacterSkills.ts
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
  const [backgroundSkills, setBackgroundSkills] = useState<string[]>([]);
  const [racialSkills, setRacialSkills] = useState<string[]>([]);

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

    // Remover da lista de selecionadas se não há mais proficiências
    const remainingProficiencies = skillProficiencies.filter(p => 
      p.skill === skill && (!source || p.source !== source)
    );
    
    if (remainingProficiencies.length === 0) {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    }
  }, [skillProficiencies]);

  // Toggle skill selection (para escolhas de classe)
  const toggleSkill = useCallback((skillKey: string) => {
    const isCurrentlySelected = selectedSkills.includes(skillKey);
    
    if (isCurrentlySelected) {
      // Remover skill se for de escolha da classe
      const skillProf = skillProficiencies.find(p => p.skill === skillKey && p.source === 'class');
      if (skillProf) {
        removeSkillProficiency(skillKey, 'class');
      }
    } else {
      // Adicionar skill se há escolhas disponíveis
      const classSkillsSelected = selectedSkills.filter(skill => 
        classSkillOptions.includes(skill)
      ).length;
      
      if (classSkillsSelected < availableChoices && classSkillOptions.includes(skillKey)) {
        addSkillProficiency(skillKey, 'class');
      }
    }
  }, [selectedSkills, skillProficiencies, removeSkillProficiency, addSkillProficiency, classSkillOptions, availableChoices]);

  // Configurar skills da classe
  const setClassSkills = useCallback((skillOptions: string[], choicesCount: number) => {
    setClassSkillOptions(skillOptions);
    setAvailableChoices(choicesCount);
    
    // Remover skills de classe que não estão mais disponíveis
    const currentClassSkills = selectedSkills.filter(skill => 
      skillProficiencies.some(p => p.skill === skill && p.source === 'class')
    );
    
    currentClassSkills.forEach(skill => {
      if (!skillOptions.includes(skill)) {
        removeSkillProficiency(skill, 'class');
      }
    });
  }, [selectedSkills, skillProficiencies, removeSkillProficiency]);

  // Configurar skills do background
  const setBackgroundSkills = useCallback((skills: string[]) => {
    // Remover skills antigas do background
    backgroundSkills.forEach(skill => {
      removeSkillProficiency(skill, 'background');
    });
    
    // Adicionar novas skills do background
    skills.forEach(skill => {
      addSkillProficiency(skill, 'background');
    });
    
    setBackgroundSkills(skills);
  }, [backgroundSkills, removeSkillProficiency, addSkillProficiency]);

  // Configurar skills raciais
  const setRacialSkills = useCallback((skills: string[]) => {
    // Remover skills antigas da raça
    racialSkills.forEach(skill => {
      removeSkillProficiency(skill, 'race');
    });
    
    // Adicionar novas skills da raça
    skills.forEach(skill => {
      addSkillProficiency(skill, 'race');
    });
    
    setRacialSkills(skills);
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
    proficiencyBonus: number
  ) => {
    const skill = SKILLS.find(s => s.key === skillKey);
    if (!skill) return 0;

    const abilityModifier = Math.floor((abilityScores[skill.ability] - 10) / 2);
    const isProficient = selectedSkills.includes(skillKey);
    const hasExpertise = expertiseSkills.includes(skillKey);

    let bonus = abilityModifier;
    if (isProficient) {
      bonus += proficiencyBonus;
    }
    if (hasExpertise) {
      bonus += proficiencyBonus; // Expertise = dobro do proficiency bonus
    }

    return bonus;
  }, [selectedSkills, expertiseSkills]);

  // Obter todas as proficiências
  const allProficiencies = useMemo(() => {
    return skillProficiencies.reduce((acc, prof) => {
      if (!acc[prof.skill]) {
        acc[prof.skill] = [];
      }
      acc[prof.skill].push(prof.source);
      return acc;
    }, {} as Record<string, string[]>);
  }, [skillProficiencies]);

  // Verificar se skill está disponível para seleção
  const canSelectSkill = useCallback((skillKey: string) => {
    if (!classSkillOptions.includes(skillKey)) return false;
    if (selectedSkills.includes(skillKey)) return true;
    
    const classSkillsSelected = selectedSkills.filter(skill => 
      classSkillOptions.includes(skill) && 
      skillProficiencies.some(p => p.skill === skill && p.source === 'class')
    ).length;
    
    return classSkillsSelected < availableChoices;
  }, [classSkillOptions, selectedSkills, skillProficiencies, availableChoices]);

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
    setBackgroundSkills([]);
    setRacialSkills([]);
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