// ===========================
// useCharacterSkills.ts
// Hook para gerenciar habilidades do personagem
// ===========================

import { useState, useCallback, useMemo } from 'react';

export interface Skill {
  name: string;
  ability: string;
  description?: string;
}

export interface SkillProficiency {
  skill: string;
  source: 'class' | 'background' | 'race' | 'feat';
  proficient: boolean;
  expertise?: boolean;
}

// Lista de todas as habilidades D&D 5e
export const ALL_SKILLS: Skill[] = [
  { name: 'Acrobacia', ability: 'dexterity', description: 'Equilíbrio e agilidade' },
  { name: 'Arcanismo', ability: 'intelligence', description: 'Conhecimento de magia' },
  { name: 'Atletismo', ability: 'strength', description: 'Força física e resistência' },
  { name: 'Atuação', ability: 'charisma', description: 'Entretenimento e performance' },
  { name: 'Blefe', ability: 'charisma', description: 'Enganar e persuadir' },
  { name: 'Furtividade', ability: 'dexterity', description: 'Mover-se sem ser detectado' },
  { name: 'História', ability: 'intelligence', description: 'Conhecimento histórico' },
  { name: 'Intimidação', ability: 'charisma', description: 'Coerção e medo' },
  { name: 'Intuição', ability: 'wisdom', description: 'Ler intenções e motivações' },
  { name: 'Investigação', ability: 'intelligence', description: 'Encontrar pistas e evidências' },
  { name: 'Lidar com Animais', ability: 'wisdom', description: 'Interagir com animais' },
  { name: 'Medicina', ability: 'wisdom', description: 'Cuidados médicos' },
  { name: 'Natureza', ability: 'intelligence', description: 'Conhecimento natural' },
  { name: 'Percepção', ability: 'wisdom', description: 'Detectar perigos e detalhes' },
  { name: 'Persuasão', ability: 'charisma', description: 'Convencer e influenciar' },
  { name: 'Prestidigitação', ability: 'dexterity', description: 'Truques manuais' },
  { name: 'Religião', ability: 'intelligence', description: 'Conhecimento religioso' },
  { name: 'Sobrevivência', ability: 'wisdom', description: 'Rastreamento e vida selvagem' },
];

export const useCharacterSkills = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availableChoices, setAvailableChoices] = useState(2);
  const [skillProficiencies, setSkillProficiencies] = useState<SkillProficiency[]>([]);
  const [expertiseSkills, setExpertiseSkills] = useState<string[]>([]);

  // Adicionar proficiência por fonte
  const addSkillProficiency = useCallback((skill: string, source: 'class' | 'background' | 'race' | 'feat') => {
    setSkillProficiencies(prev => {
      const existing = prev.find(p => p.skill === skill);
      if (existing) {
        return prev.map(p => p.skill === skill ? { ...p, proficient: true } : p);
      }
      return [...prev, { skill, source, proficient: true }];
    });
  }, []);

  // Remover proficiência
  const removeSkillProficiency = useCallback((skill: string) => {
    setSkillProficiencies(prev => prev.filter(p => p.skill !== skill));
  }, []);

  // Adicionar/Remover habilidade selecionada (escolhas de classe)
  const toggleSelectedSkill = useCallback((skill: string) => {
    setSelectedSkills(prev => {
      const isSelected = prev.includes(skill);
      if (isSelected) {
        return prev.filter(s => s !== skill);
      } else if (prev.length < availableChoices) {
        return [...prev, skill];
      }
      return prev;
    });
  }, [availableChoices]);

  // Definir escolhas disponíveis (baseado na classe)
  const setAvailableSkillChoices = useCallback((choices: number) => {
    setAvailableChoices(choices);
  }, []);

  // Aplicar proficiências de classe
  const applyClassProficiencies = useCallback((classSkills: string[], choicesCount: number) => {
    setAvailableChoices(choicesCount);
    // Limpar seleções anteriores de classe
    setSelectedSkills([]);
  }, []);

  // Aplicar proficiências de background
  const applyBackgroundProficiencies = useCallback((backgroundSkills: string[]) => {
    // Remover proficiências anteriores de background
    setSkillProficiencies(prev => prev.filter(p => p.source !== 'background'));
    
    // Adicionar novas proficiências de background
    backgroundSkills.forEach(skill => {
      addSkillProficiency(skill, 'background');
    });
  }, [addSkillProficiency]);

  // Aplicar proficiências raciais
  const applyRacialProficiencies = useCallback((racialSkills: string[]) => {
    // Remover proficiências anteriores de raça
    setSkillProficiencies(prev => prev.filter(p => p.source !== 'race'));
    
    // Adicionar novas proficiências raciais
    racialSkills.forEach(skill => {
      addSkillProficiency(skill, 'race');
    });
  }, [addSkillProficiency]);

  // Adicionar expertise (dobra bônus de proficiência)
  const addExpertise = useCallback((skill: string) => {
    setExpertiseSkills(prev => {
      if (!prev.includes(skill)) {
        return [...prev, skill];
      }
      return prev;
    });
  }, []);

  // Remover expertise
  const removeExpertise = useCallback((skill: string) => {
    setExpertiseSkills(prev => prev.filter(s => s !== skill));
  }, []);

  // Verificar se tem proficiência em uma habilidade
  const isProficient = useCallback((skill: string) => {
    const hasProficiency = skillProficiencies.some(p => p.skill === skill && p.proficient);
    const isSelected = selectedSkills.includes(skill);
    return hasProficiency || isSelected;
  }, [skillProficiencies, selectedSkills]);

  // Verificar se tem expertise em uma habilidade
  const hasExpertise = useCallback((skill: string) => {
    return expertiseSkills.includes(skill);
  }, [expertiseSkills]);

  // Calcular bônus de habilidade
  const getSkillBonus = useCallback((skill: string, abilityModifiers: Record<string, number>, proficiencyBonus: number) => {
    const skillData = ALL_SKILLS.find(s => s.name === skill);
    if (!skillData) return 0;

    const abilityMod = abilityModifiers[skillData.ability] || 0;
    let bonus = abilityMod;

    if (isProficient(skill)) {
      bonus += proficiencyBonus;
    }

    if (hasExpertise(skill)) {
      bonus += proficiencyBonus; // Expertise dobra o bônus
    }

    return bonus;
  }, [isProficient, hasExpertise]);

  // Obter todas as proficiências (combinadas)
  const getAllProficiencies = useMemo(() => {
    const allProfs = new Set<string>();
    
    // Adicionar proficiências fixas
    skillProficiencies.forEach(p => {
      if (p.proficient) {
        allProfs.add(p.skill);
      }
    });
    
    // Adicionar escolhas de classe
    selectedSkills.forEach(skill => {
      allProfs.add(skill);
    });
    
    return Array.from(allProfs);
  }, [skillProficiencies, selectedSkills]);

  // Habilidades disponíveis para escolha (classe)
  const availableSkills = useMemo(() => {
    return ALL_SKILLS.filter(skill => {
      // Não mostrar se já tem proficiência por outra fonte
      const hasOtherProficiency = skillProficiencies.some(p => 
        p.skill === skill.name && p.source !== 'class' && p.proficient
      );
      return !hasOtherProficiency;
    });
  }, [skillProficiencies]);

  // Validação
  const isValid = useMemo(() => {
    return selectedSkills.length <= availableChoices;
  }, [selectedSkills.length, availableChoices]);

  // Reset
  const reset = useCallback(() => {
    setSelectedSkills([]);
    setSkillProficiencies([]);
    setExpertiseSkills([]);
    setAvailableChoices(2);
  }, []);

  // Obter resumo das proficiências por fonte
  const getProficienciesBySource = useMemo(() => {
    const bySource: Record<string, string[]> = {
      class: selectedSkills,
      background: skillProficiencies.filter(p => p.source === 'background').map(p => p.skill),
      race: skillProficiencies.filter(p => p.source === 'race').map(p => p.skill),
      feat: skillProficiencies.filter(p => p.source === 'feat').map(p => p.skill),
    };
    return bySource;
  }, [selectedSkills, skillProficiencies]);

  return {
    // State
    selectedSkills,
    availableChoices,
    remainingChoices: Math.max(0, availableChoices - selectedSkills.length),
    skillProficiencies,
    expertiseSkills,
    allProficiencies: getAllProficiencies,
    
    // Actions
    toggleSelectedSkill,
    setAvailableSkillChoices,
    addSkillProficiency,
    removeSkillProficiency,
    applyClassProficiencies,
    applyBackgroundProficiencies,
    applyRacialProficiencies,
    addExpertise,
    removeExpertise,
    
    // Queries
    isProficient,
    hasExpertise,
    getSkillBonus,
    availableSkills,
    getProficienciesBySource,
    
    // Validation
    isValid,
    canSelectMore: selectedSkills.length < availableChoices,
    
    // Utils
    reset,
    ALL_SKILLS,
  };
};