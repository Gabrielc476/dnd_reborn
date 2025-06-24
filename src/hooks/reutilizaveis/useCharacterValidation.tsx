// ===========================
// USE CHARACTER VALIDATION HOOK
// ===========================
"use client";

import { useCallback, useMemo } from "react";
import { CharacterCreationData, StepValidation, AbilityScores } from "@/types/characterCreation";

// ===========================
// VALIDATION RULES
// ===========================

const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  ABILITY_MIN_SCORE: 8,
  ABILITY_MAX_SCORE: 15,
  POINT_BUY_TOTAL: 27,
  MIN_HIT_POINTS: 1,
  MIN_ARMOR_CLASS: 8,
  MIN_SKILLS: 0,
  MAX_SKILLS_PER_CLASS: 4,
} as const;

// ===========================
// VALIDATION FUNCTIONS
// ===========================

export const useCharacterValidation = () => {
  // Validate character name
  const validateName = useCallback((name: string): string[] => {
    const errors: string[] = [];
    
    if (!name || !name.trim()) {
      errors.push("Nome é obrigatório");
    } else if (name.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
      errors.push(`Nome deve ter pelo menos ${VALIDATION_RULES.NAME_MIN_LENGTH} caracteres`);
    } else if (name.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH) {
      errors.push(`Nome deve ter no máximo ${VALIDATION_RULES.NAME_MAX_LENGTH} caracteres`);
    }
    
    // Check for invalid characters
    if (name && !/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name.trim())) {
      errors.push("Nome contém caracteres inválidos");
    }
    
    return errors;
  }, []);

  // Validate ability scores using point buy system
  const validateAbilityScores = useCallback((scores: AbilityScores): string[] => {
    const errors: string[] = [];
    const scoreValues = Object.values(scores);
    
    // Check individual score limits
    scoreValues.forEach((score, index) => {
      const abilityNames = ['Força', 'Destreza', 'Constituição', 'Inteligência', 'Sabedoria', 'Carisma'];
      if (score < VALIDATION_RULES.ABILITY_MIN_SCORE) {
        errors.push(`${abilityNames[index]} não pode ser menor que ${VALIDATION_RULES.ABILITY_MIN_SCORE}`);
      }
      if (score > VALIDATION_RULES.ABILITY_MAX_SCORE) {
        errors.push(`${abilityNames[index]} não pode ser maior que ${VALIDATION_RULES.ABILITY_MAX_SCORE}`);
      }
    });
    
    // Calculate point buy cost
    const calculatePointCost = (score: number): number => {
      if (score <= 13) return score - 8;
      if (score === 14) return 7;
      if (score === 15) return 9;
      return 0;
    };
    
    const totalCost = scoreValues.reduce((total, score) => total + calculatePointCost(score), 0);
    
    if (totalCost > VALIDATION_RULES.POINT_BUY_TOTAL) {
      errors.push(`Total de pontos excede o limite (${totalCost}/${VALIDATION_RULES.POINT_BUY_TOTAL})`);
    }
    
    return errors;
  }, []);

  // Validate race and subrace combination
  const validateRaceSelection = useCallback((characterData: CharacterCreationData): string[] => {
    const errors: string[] = [];
    
    if (!characterData.selectedRace) {
      errors.push("Raça é obrigatória");
    }
    
    // If subrace is selected, check if it matches the race
    if (characterData.selectedSubrace && characterData.selectedRace) {
      if (characterData.selectedSubrace.race.index !== characterData.selectedRace.index) {
        errors.push("Subraça não é compatível com a raça selecionada");
      }
    }
    
    return errors;
  }, []);

  // Validate class and subclass combination
  const validateClassSelection = useCallback((characterData: CharacterCreationData): string[] => {
    const errors: string[] = [];
    
    if (!characterData.selectedClass) {
      errors.push("Classe é obrigatória");
    }
    
    // If subclass is selected, check if it matches the class
    if (characterData.selectedSubclass && characterData.selectedClass) {
      if (characterData.selectedSubclass.class.index !== characterData.selectedClass.index) {
        errors.push("Subclasse não é compatível com a classe selecionada");
      }
    }
    
    return errors;
  }, []);

  // Validate skills selection
  const validateSkills = useCallback((characterData: CharacterCreationData): string[] => {
    const errors: string[] = [];
    
    if (characterData.selectedSkills.length < characterData.availableSkillChoices) {
      errors.push(`Selecione ${characterData.availableSkillChoices} perícias`);
    }
    
    if (characterData.selectedSkills.length > characterData.availableSkillChoices) {
      errors.push(`Muitas perícias selecionadas (${characterData.selectedSkills.length}/${characterData.availableSkillChoices})`);
    }
    
    // Check for duplicate skills
    const uniqueSkills = new Set(characterData.selectedSkills);
    if (uniqueSkills.size !== characterData.selectedSkills.length) {
      errors.push("Perícias duplicadas detectadas");
    }
    
    return errors;
  }, []);

  // Validate spells for spellcasters
  const validateSpells = useCallback((characterData: CharacterCreationData): string[] => {
    const errors: string[] = [];
    
    if (characterData.isSpellcaster) {
      if (characterData.selectedSpells.length === 0) {
        errors.push("Classe conjuradora deve ter pelo menos uma magia");
      }
      
      // Validate spell levels for character level
      const maxSpellLevel = Math.min(9, Math.ceil(characterData.level / 2));
      const invalidSpells = characterData.selectedSpells.filter(spell => spell.level > maxSpellLevel);
      
      if (invalidSpells.length > 0) {
        errors.push(`Algumas magias são de nível muito alto para seu personagem`);
      }
    }
    
    return errors;
  }, []);

  // Validate combat stats
  const validateCombatStats = useCallback((characterData: CharacterCreationData): string[] => {
    const errors: string[] = [];
    
    if (characterData.hitPoints < VALIDATION_RULES.MIN_HIT_POINTS) {
      errors.push("Pontos de vida devem ser pelo menos 1");
    }
    
    if (characterData.armorClass < VALIDATION_RULES.MIN_ARMOR_CLASS) {
      errors.push("Classe de armadura muito baixa");
    }
    
    return errors;
  }, []);

  // Validate personality traits
  const validatePersonality = useCallback((characterData: CharacterCreationData): string[] => {
    const errors: string[] = [];
    
    if (characterData.personalityTraits.length === 0) {
      errors.push("Selecione pelo menos um traço de personalidade");
    }
    
    if (characterData.ideals.length === 0) {
      errors.push("Selecione pelo menos um ideal");
    }
    
    if (characterData.bonds.length === 0) {
      errors.push("Selecione pelo menos um vínculo");
    }
    
    if (characterData.flaws.length === 0) {
      errors.push("Selecione pelo menos um defeito");
    }
    
    return errors;
  }, []);

  // Main validation function for specific steps
  const validateStep = useCallback((stepIndex: number, characterData: CharacterCreationData): StepValidation => {
    let allErrors: string[] = [];

    switch (stepIndex) {
      case 0: // Basic Info
        allErrors = [
          ...validateName(characterData.name),
          ...validateRaceSelection(characterData),
          ...validateClassSelection(characterData),
          ...(characterData.selectedBackground ? [] : ["Background é obrigatório"]),
        ];
        break;

      case 1: // Ability Scores
        allErrors = validateAbilityScores(characterData.abilityScores);
        break;

      case 2: // Skills
        allErrors = validateSkills(characterData);
        break;

      case 3: // Equipment/Combat Stats
        allErrors = validateCombatStats(characterData);
        break;

      case 4: // Spells
        allErrors = validateSpells(characterData);
        break;

      case 5: // Personality
        allErrors = validatePersonality(characterData);
        break;

      default:
        allErrors = ["Passo inválido"];
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }, [
    validateName,
    validateRaceSelection,
    validateClassSelection,
    validateAbilityScores,
    validateSkills,
    validateCombatStats,
    validateSpells,
    validatePersonality,
  ]);

  // Validate entire character for final submission
  const validateCompleteCharacter = useCallback((characterData: CharacterCreationData): StepValidation => {
    const allErrors: string[] = [];
    
    // Validate all steps
    for (let i = 0; i < 6; i++) {
      const stepValidation = validateStep(i, characterData);
      allErrors.push(...stepValidation.errors);
    }
    
    // Additional cross-step validations
    if (characterData.selectedClass && characterData.selectedClass.spellcasting && !characterData.isSpellcaster) {
      allErrors.push("Classe conjuradora deve ter isSpellcaster = true");
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }, [validateStep]);

  // Get validation summary
  const getValidationSummary = useCallback((characterData: CharacterCreationData) => {
    const stepValidations = [];
    for (let i = 0; i < 6; i++) {
      stepValidations.push(validateStep(i, characterData));
    }
    
    const totalErrors = stepValidations.reduce((total, validation) => total + validation.errors.length, 0);
    const completedSteps = stepValidations.filter(validation => validation.isValid).length;
    
    return {
      stepValidations,
      totalErrors,
      completedSteps,
      totalSteps: 6,
      isComplete: totalErrors === 0,
      completionPercentage: Math.round((completedSteps / 6) * 100),
    };
  }, [validateStep]);

  return {
    // Individual validators
    validateName,
    validateAbilityScores,
    validateRaceSelection,
    validateClassSelection,
    validateSkills,
    validateSpells,
    validateCombatStats,
    validatePersonality,
    
    // Step validation
    validateStep,
    validateCompleteCharacter,
    
    // Summary
    getValidationSummary,
    
    // Constants
    VALIDATION_RULES,
  };
};