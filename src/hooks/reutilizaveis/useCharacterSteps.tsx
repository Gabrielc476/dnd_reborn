// ===========================
// USE CHARACTER STEPS HOOK
// ===========================
"use client";

import { useState, useCallback, useMemo } from "react";
import { CharacterCreationStep, CharacterCreationData, StepValidation } from "@/types/characterCreation";

// ===========================
// INITIAL STEPS DATA
// ===========================

export const characterCreationSteps: CharacterCreationStep[] = [
  {
    id: "basic-info",
    title: "Informações Básicas",
    description: "Nome, raça, classe e background",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "ability-scores",
    title: "Atributos",
    description: "Defina os valores dos seus atributos",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "skills",
    title: "Perícias",
    description: "Escolha suas perícias",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "equipment",
    title: "Equipamentos",
    description: "HP, CA e equipamentos iniciais",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "spells",
    title: "Magias",
    description: "Escolha suas magias (se aplicável)",
    isCompleted: false,
    isValid: false,
  },
  {
    id: "personality",
    title: "Personalização",
    description: "Traços, ideais, vínculos e defeitos",
    isCompleted: false,
    isValid: false,
  },
];

// ===========================
// VALIDATION FUNCTIONS
// ===========================

const validateStep = (stepIndex: number, characterData: CharacterCreationData): StepValidation => {
  const errors: string[] = [];

  switch (stepIndex) {
    case 0: // Basic Info
      if (!characterData.name?.trim()) errors.push("Nome é obrigatório");
      if (!characterData.selectedRace) errors.push("Raça é obrigatória");
      if (!characterData.selectedClass) errors.push("Classe é obrigatória");
      if (!characterData.selectedBackground) errors.push("Background é obrigatório");
      break;

    case 1: // Ability Scores
      const total = Object.values(characterData.abilityScores).reduce((sum, val) => sum + val, 0);
      if (total < 70 || total > 78) {
        errors.push("Total de pontos de atributo inválido");
      }
      break;

    case 2: // Skills
      if (characterData.selectedSkills.length < characterData.availableSkillChoices) {
        errors.push(`Selecione ${characterData.availableSkillChoices} perícias`);
      }
      break;

    case 3: // Equipment
      if (characterData.hitPoints <= 0) errors.push("Pontos de vida inválidos");
      break;

    case 4: // Spells
      if (characterData.isSpellcaster && characterData.selectedSpells.length === 0) {
        errors.push("Selecione pelo menos uma magia");
      }
      break;

    case 5: // Personality
      if (characterData.personalityTraits.length === 0) {
        errors.push("Selecione pelo menos um traço de personalidade");
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ===========================
// HOOK
// ===========================

export const useCharacterSteps = (characterData: CharacterCreationData) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(characterCreationSteps);

  const totalSteps = steps.length;

  // Validate current step
  const validateCurrentStep = useCallback((): StepValidation => {
    return validateStep(currentStep, characterData);
  }, [currentStep, characterData]);

  // Check if can proceed to next step
  const canProceed = useMemo(() => {
    const validation = validateStep(currentStep, characterData);
    return validation.isValid;
  }, [currentStep, characterData]);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1 && canProceed) {
      setCurrentStep((prev) => prev + 1);
      
      // Mark current step as completed
      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === currentStep
            ? { ...step, isCompleted: true, isValid: true }
            : step
        )
      );
    }
  }, [canProceed, currentStep, totalSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  const resetSteps = useCallback(() => {
    setCurrentStep(0);
    setSteps(characterCreationSteps);
  }, []);

  // Validate all steps for final submission
  const validateAllSteps = useCallback(() => {
    const allValidations = [];
    for (let i = 0; i < totalSteps; i++) {
      allValidations.push(validateStep(i, characterData));
    }
    return allValidations;
  }, [characterData, totalSteps]);

  return {
    currentStep,
    totalSteps,
    steps,
    setSteps,
    validateCurrentStep,
    canProceed,
    nextStep,
    previousStep,
    goToStep,
    resetSteps,
    validateAllSteps,
    validateStep: (stepIndex: number) => validateStep(stepIndex, characterData),
  };
};