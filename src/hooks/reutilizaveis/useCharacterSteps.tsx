// ===========================
// USE CHARACTER STEPS HOOK - FIXED WITH SAFETY CHECKS
// ===========================
"use client";

import { useState, useCallback, useMemo } from "react";
import { CharacterCreationStep, CharacterCreationData, StepValidation } from "@/types/characterCreation";

// ===========================
// CONSTANTS
// ===========================

const TOTAL_STEPS = 6;
const STEP_DEFINITIONS: Omit<CharacterCreationStep, 'isCompleted' | 'isValid'>[] = [
  {
    id: "basic-info",
    title: "Informações Básicas",
    description: "Nome, raça, classe e background"
  },
  {
    id: "abilities",
    title: "Atributos", 
    description: "Força, destreza, constituição, inteligência, sabedoria e carisma"
  },
  {
    id: "skills",
    title: "Perícias",
    description: "Escolha suas perícias"
  },
  {
    id: "equipment",
    title: "Equipamentos",
    description: "Armas, armaduras e itens"
  },
  {
    id: "spells",
    title: "Magias",
    description: "Truques e magias (se aplicável)"
  },
  {
    id: "personality",
    title: "Personalização",
    description: "Traços, ideais, vínculos e defeitos"
  }
];

// ===========================
// VALIDATION FUNCTIONS
// ===========================

function validateStep(stepIndex: number, characterData: CharacterCreationData | null): StepValidation {
  const errors: string[] = [];

  // Safety check - return valid if characterData is null/undefined
  if (!characterData) {
    return { isValid: true, errors: [] };
  }

  switch (stepIndex) {
    case 0: // Basic Info
      if (!characterData.name?.trim()) errors.push("Nome é obrigatório");
      if (!characterData.selectedRace) errors.push("Raça é obrigatória");
      if (!characterData.selectedClass) errors.push("Classe é obrigatória");
      if (!characterData.selectedBackground) errors.push("Background é obrigatório");
      break;

    case 1: // Abilities
      const abilities = characterData.abilityScores;
      if (!abilities) {
        errors.push("Atributos devem ser definidos");
        break;
      }
      
      const minScore = 8;
      const maxScore = 15;
      const totalPoints = Object.values(abilities).reduce((sum, score) => sum + score, 0);
      
      if (Object.values(abilities).some(score => score < minScore)) {
        errors.push(`Todos os atributos devem ser pelo menos ${minScore}`);
      }
      if (Object.values(abilities).some(score => score > maxScore + 2)) { // +2 for racial bonuses
        errors.push(`Nenhum atributo pode exceder ${maxScore + 2}`);
      }
      if (totalPoints < 70) {
        errors.push("Total de pontos de atributo muito baixo");
      }
      break;

    case 2: // Skills
      if (!characterData.selectedClass) {
        errors.push("Classe deve ser selecionada primeiro");
        break;
      }
      
      const requiredSkills = characterData.availableSkillChoices || 0;
      const selectedSkills = characterData.selectedSkills?.length || 0;
      
      if (selectedSkills < requiredSkills) {
        errors.push(`Selecione ${requiredSkills} perícias`);
      }
      if (selectedSkills > requiredSkills) {
        errors.push(`Muitas perícias selecionadas (${selectedSkills}/${requiredSkills})`);
      }
      break;

    case 3: // Equipment
      if (!characterData.selectedClass) {
        errors.push("Classe deve ser selecionada primeiro");
        break;
      }
      
      if (characterData.hitPoints <= 0) {
        errors.push("Pontos de vida devem ser calculados");
      }
      if (characterData.armorClass < 10) {
        errors.push("Classe de armadura deve ser calculada");
      }
      break;

    case 4: // Spells
      if (characterData.isSpellcaster) {
        const selectedSpells = characterData.selectedSpells?.length || 0;
        if (selectedSpells === 0) {
          errors.push("Classe conjuradora deve ter pelo menos uma magia ou truque");
        }
        
        // Validate spell levels if spells are selected
        if (characterData.selectedSpells && characterData.selectedSpells.length > 0) {
          const maxSpellLevel = getMaxSpellLevelForCharacter(characterData);
          const invalidSpells = characterData.selectedSpells.filter(spell => spell.level > maxSpellLevel);
          
          if (invalidSpells.length > 0) {
            errors.push(`Algumas magias são de nível muito alto para seu personagem`);
          }
        }
      }
      break;

    case 5: // Personality
      if (!characterData.personalityTraits?.length) {
        errors.push("Selecione pelo menos um traço de personalidade");
      }
      if (!characterData.ideals?.length) {
        errors.push("Selecione pelo menos um ideal");
      }
      if (!characterData.bonds?.length) {
        errors.push("Selecione pelo menos um vínculo");
      }
      if (!characterData.flaws?.length) {
        errors.push("Selecione pelo menos um defeito");
      }
      break;

    default:
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function getMaxSpellLevelForCharacter(characterData: CharacterCreationData): number {
  if (!characterData.isSpellcaster || !characterData.selectedClass) {
    return 0;
  }

  const characterLevel = characterData.level;
  const classIndex = characterData.selectedClass.index;

  // Different classes have different magic progressions
  switch (classIndex) {
    case "wizard":
    case "sorcerer":
    case "cleric":
    case "druid":
    case "bard":
      // Full casters
      return Math.min(9, Math.ceil(characterLevel / 2));
    
    case "warlock":
      // Warlocks have unique progression
      if (characterLevel >= 9) return 5;
      if (characterLevel >= 7) return 4;
      if (characterLevel >= 5) return 3;
      if (characterLevel >= 3) return 2;
      return 1;
    
    case "paladin":
    case "ranger":
      // Half casters
      if (characterLevel < 2) return 0;
      return Math.min(5, Math.ceil((characterLevel - 1) / 4) + 1);
    
    case "rogue":
      // Arcane Trickster
      if (characterData.selectedSubclass?.index === "arcane-trickster") {
        if (characterLevel < 3) return 0;
        return Math.min(4, Math.ceil((characterLevel - 1) / 6) + 1);
      }
      return 0;
    
    case "fighter":
      // Eldritch Knight
      if (characterData.selectedSubclass?.index === "eldritch-knight") {
        if (characterLevel < 3) return 0;
        return Math.min(4, Math.ceil((characterLevel - 1) / 6) + 1);
      }
      return 0;
    
    default:
      return 0;
  }
}

// ===========================
// MAIN HOOK
// ===========================

export const useCharacterSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepCompletions, setStepCompletions] = useState<Record<number, boolean>>({});

  // Initialize steps with completion status
  const steps = useMemo((): CharacterCreationStep[] => {
    return STEP_DEFINITIONS.map((step, index) => ({
      ...step,
      isCompleted: stepCompletions[index] || false,
      isValid: stepCompletions[index] || false
    }));
  }, [stepCompletions]);

  // Navigation functions
  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS - 1));
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      setCurrentStep(step);
    }
  }, []);

  // Step completion management
  const updateStepCompletion = useCallback((stepIndex: number, isCompleted: boolean) => {
    setStepCompletions(prev => ({
      ...prev,
      [stepIndex]: isCompleted
    }));
  }, []);

  const resetSteps = useCallback(() => {
    setCurrentStep(0);
    setStepCompletions({});
  }, []);

  // Can proceed check with safety
  const canProceed = useCallback((characterData: CharacterCreationData | null) => {
    if (!characterData) return false;
    const validation = validateStep(currentStep, characterData);
    return validation.isValid;
  }, [currentStep]);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    steps,
    nextStep,
    previousStep,
    goToStep,
    updateStepCompletion,
    resetSteps,
    validateStep,
    canProceed
  };
};