// ===========================
// USE CHARACTER CALCULATIONS HOOK
// ===========================
"use client";

import { useCallback } from "react";
import { AbilityScores } from "@/types/characterCreation";

// ===========================
// HOOK
// ===========================

export const useCharacterCalculations = () => {
  // Calculate ability modifier
  const getAbilityModifier = useCallback((abilityScore: number): number => {
    return Math.floor((abilityScore - 10) / 2);
  }, []);

  // Calculate ability score points using point-buy system
  const calculateAbilityScorePoints = useCallback((scores: AbilityScores): number => {
    let totalPoints = 0;
    
    Object.values(scores).forEach(score => {
      if (score >= 8 && score <= 15) {
        if (score <= 13) {
          totalPoints += score - 8;
        } else if (score === 14) {
          totalPoints += 7;
        } else if (score === 15) {
          totalPoints += 9;
        }
      }
    });
    
    return totalPoints;
  }, []);

  // Generate random ability scores (4d6, drop lowest)
  const generateRandomAbilityScores = useCallback((): AbilityScores => {
    const rollAbility = () => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    return {
      strength: rollAbility(),
      dexterity: rollAbility(),
      constitution: rollAbility(),
      intelligence: rollAbility(),
      wisdom: rollAbility(),
      charisma: rollAbility(),
    };
  }, []);

  // Calculate proficiency bonus based on level
  const getProficiencyBonus = useCallback((level: number): number => {
    return Math.floor((level - 1) / 4) + 2;
  }, []);

  // Calculate skill modifier
  const getSkillModifier = useCallback((
    abilityScore: number,
    isProficient: boolean,
    level: number
  ): number => {
    const abilityMod = getAbilityModifier(abilityScore);
    const proficiencyBonus = isProficient ? getProficiencyBonus(level) : 0;
    return abilityMod + proficiencyBonus;
  }, [getAbilityModifier, getProficiencyBonus]);

  // Calculate saving throw modifier
  const getSavingThrowModifier = useCallback((
    abilityScore: number,
    isProficient: boolean,
    level: number
  ): number => {
    return getSkillModifier(abilityScore, isProficient, level);
  }, [getSkillModifier]);

  // Calculate hit points based on class, level, and constitution
  const calculateHitPoints = useCallback((
    hitDie: number,
    level: number,
    constitutionScore: number,
    isMaxAtFirstLevel: boolean = true
  ): number => {
    const conModifier = getAbilityModifier(constitutionScore);
    
    if (level === 1) {
      return isMaxAtFirstLevel 
        ? hitDie + conModifier 
        : Math.floor(Math.random() * hitDie) + 1 + conModifier;
    }

    // First level max HP + additional levels
    const firstLevelHP = hitDie + conModifier;
    const additionalLevels = level - 1;
    const averageHP = Math.floor(hitDie / 2) + 1;
    
    return firstLevelHP + (additionalLevels * (averageHP + conModifier));
  }, [getAbilityModifier]);

  // Calculate armor class
  const calculateArmorClass = useCallback((
    dexterityScore: number,
    armorBonus: number = 0,
    shieldBonus: number = 0,
    magicBonus: number = 0
  ): number => {
    const dexModifier = getAbilityModifier(dexterityScore);
    return 10 + dexModifier + armorBonus + shieldBonus + magicBonus;
  }, [getAbilityModifier]);

  // Calculate spell attack bonus
  const getSpellAttackBonus = useCallback((
    spellcastingAbility: number,
    level: number
  ): number => {
    const abilityMod = getAbilityModifier(spellcastingAbility);
    const proficiencyBonus = getProficiencyBonus(level);
    return abilityMod + proficiencyBonus;
  }, [getAbilityModifier, getProficiencyBonus]);

  // Calculate spell save DC
  const getSpellSaveDC = useCallback((
    spellcastingAbility: number,
    level: number
  ): number => {
    const abilityMod = getAbilityModifier(spellcastingAbility);
    const proficiencyBonus = getProficiencyBonus(level);
    return 8 + abilityMod + proficiencyBonus;
  }, [getAbilityModifier, getProficiencyBonus]);

  // Calculate carrying capacity
  const getCarryingCapacity = useCallback((strengthScore: number): number => {
    return strengthScore * 15; // pounds
  }, []);

  // Calculate initiative modifier
  const getInitiativeModifier = useCallback((dexterityScore: number): number => {
    return getAbilityModifier(dexterityScore);
  }, [getAbilityModifier]);

  return {
    getAbilityModifier,
    calculateAbilityScorePoints,
    generateRandomAbilityScores,
    getProficiencyBonus,
    getSkillModifier,
    getSavingThrowModifier,
    calculateHitPoints,
    calculateArmorClass,
    getSpellAttackBonus,
    getSpellSaveDC,
    getCarryingCapacity,
    getInitiativeModifier,
  };
};