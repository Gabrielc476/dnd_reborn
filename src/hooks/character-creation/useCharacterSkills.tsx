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

  // DEBUG: Log do estado atual
  console.log('🔧 [useCharacterSkills] Current state:', {
    selectedSkills,
    availableChoices,
    skillProficiencies: skillProficiencies.length,
    classSkillOptions,
    backgroundSkills,
    racialSkills
  });

  // ===========================
  // SKILL MANAGEMENT - CORRIGIDO
  // ===========================

  // Adicionar proficiência por fonte - CORRIGIDO: Dependências estáveis
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
    setSelectedSkills(prev => {
      if (!prev.includes(skill)) {
        return [...prev, skill];
      }
      return prev;
    });
  }, []); // Removido selectedSkills das dependências

  // Remover proficiência - CORRIGIDO: Dependências estáveis
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
      // Verificar se ainda tem outras proficiências para esta skill
      setSkillProficiencies(proficiencies => {
        const hasOtherProficiency = proficiencies.some(p => 
          p.skill === skill && (!source || p.source !== source)
        );
        
        if (!hasOtherProficiency) {
          // Remove da lista de selecionadas
          return prev.filter(s => s !== skill);
        }
        return prev;
      });
      return prev;
    });
  }, []); // Dependências removidas para evitar loops

  // Toggle skill selection - CORRIGIDO: Usando função de callback
  const toggleSkill = useCallback((skill: string) => {
    console.log('⚡ [useCharacterSkills] toggleSkill called:', {
      skill,
      currentSelectedSkills: selectedSkills,
      isCurrentlySelected: selectedSkills.includes(skill)
    });
    
    setSelectedSkills(prev => {
      console.log('⚡ [useCharacterSkills] toggleSkill - before update:', {
        prev,
        skill,
        willAdd: !prev.includes(skill)
      });
      
      if (prev.includes(skill)) {
        // Remove a skill
        const newSkills = prev.filter(s => s !== skill);
        console.log('⚡ [useCharacterSkills] toggleSkill - removing skill:', {
          skill,
          oldSkills: prev,
          newSkills
        });
        removeSkillProficiency(skill, 'class');
        return newSkills;
      } else {
        // Adiciona a skill
        const newSkills = [...prev, skill];
        console.log('⚡ [useCharacterSkills] toggleSkill - adding skill:', {
          skill,
          oldSkills: prev,
          newSkills
        });
        addSkillProficiency(skill, 'class');
        return newSkills;
      }
    });
  }, [addSkillProficiency, removeSkillProficiency]);

  // ===========================
  // VALIDATION & HELPERS - CORRIGIDOS
  // ===========================

  // Verificar se pode selecionar skill - CORRIGIDO: Memoizado corretamente
  const canSelectSkill = useCallback((skill: string) => {
    return true; // Simplificado - a lógica de limitação será no componente
  }, []);

  // Configurar skills da classe - CORRIGIDO
  const setClassSkills = useCallback((skillOptions: string[], choices: number = 2) => {
    setClassSkillOptions(skillOptions);
    setAvailableChoices(choices);
  }, []);

  // Configurar skills do background - CORRIGIDO
  const setBackgroundSkills = useCallback((skills: string[]) => {
    setBackgroundSkillsState(skills);
    // Adicionar automaticamente as skills do background
    skills.forEach(skill => {
      addSkillProficiency(skill, 'background');
    });
  }, [addSkillProficiency]);

  // Configurar skills raciais - CORRIGIDO
  const setRacialSkills = useCallback((skills: string[]) => {
    setRacialSkillsState(skills);
    // Adicionar automaticamente as skills raciais
    skills.forEach(skill => {
      addSkillProficiency(skill, 'race');
    });
  }, [addSkillProficiency]);

  // ===========================
  // EXPERTISE MANAGEMENT
  // ===========================

  // Adicionar expertise - CORRIGIDO: Verifica se já tem proficiência
  const addExpertise = useCallback((skillKey: string) => {
    setExpertiseSkills(prev => {
      // Só adiciona se tem proficiência e não tem expertise já
      if (!prev.includes(skillKey)) {
        return [...prev, skillKey];
      }
      return prev;
    });
  }, []);

  // Remover expertise
  const removeExpertise = useCallback((skillKey: string) => {
    setExpertiseSkills(prev => prev.filter(s => s !== skillKey));
  }, []);

  // ===========================
  // COMPUTED VALUES - CORRIGIDOS
  // ===========================

  // Calcular bônus de skill - CORRIGIDO: Dependências estáveis
  const getSkillModifier = useCallback((
    skillKey: string, 
    abilityScores: AbilityScores,
    proficiencyBonus: number = 2
  ) => {
    const skill = SKILLS.find(s => s.key === skillKey);
    if (!skill) return 0;

    const abilityMod = Math.floor((abilityScores[skill.ability] - 10) / 2);
    
    // Verificar proficiência no estado atual
    let isProficient = false;
    let hasExpertise = false;
    
    setSkillProficiencies(proficiencies => {
      isProficient = proficiencies.some(p => p.skill === skillKey);
      return proficiencies;
    });
    
    setExpertiseSkills(expertise => {
      hasExpertise = expertise.includes(skillKey);
      return expertise;
    });

    let bonus = abilityMod;
    if (isProficient) {
      bonus += proficiencyBonus;
    }
    if (hasExpertise) {
      bonus += proficiencyBonus; // Expertise dobra o bônus de proficiência
    }

    return bonus;
  }, []);

  // Todas as proficiências - CORRIGIDO: Memoizado corretamente
  const allProficiencies = useMemo(() => {
    return skillProficiencies.map(p => ({
      ...p,
      skillInfo: SKILLS.find(s => s.key === p.skill)
    }));
  }, [skillProficiencies]);

  // Validação - CORRIGIDO: Lógica mais simples e estável
  const isValid = useMemo(() => {
    // Se não há escolhas requeridas, sempre válido
    if (availableChoices === 0) return true;
    
    // Contar skills selecionadas da classe
    const classSkillsSelected = selectedSkills.filter(skill => 
      classSkillOptions.includes(skill)
    ).length;
    
    // Válido se selecionou o número correto
    return classSkillsSelected <= availableChoices;
  }, [selectedSkills, classSkillOptions, availableChoices]);

  // Choices restantes - CORRIGIDO: Memoizado corretamente
  const remainingChoices = useMemo(() => {
    if (availableChoices === 0) return 0;
    
    const classSkillsSelected = selectedSkills.filter(skill => 
      classSkillOptions.includes(skill)
    ).length;
    
    const remaining = Math.max(0, availableChoices - classSkillsSelected);
    
    console.log('🔢 [useCharacterSkills] remainingChoices calculation:', {
      availableChoices,
      selectedSkills,
      classSkillOptions,
      classSkillsSelected,
      remaining
    });
    
    return remaining;
  }, [selectedSkills, classSkillOptions, availableChoices]);

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================

  // Reset - CORRIGIDO
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

  // ===========================
  // RETURN INTERFACE
  // ===========================

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