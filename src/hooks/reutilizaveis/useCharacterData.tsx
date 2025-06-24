// ===========================
// USE CHARACTER DATA HOOK
// ===========================
"use client";

import { useState, useCallback } from "react";
import { CharacterCreationData } from "@/types/characterCreation";

// ===========================
// INITIAL DATA
// ===========================

export const initialCharacterData: CharacterCreationData = {
  name: "",
  selectedRace: null,
  selectedSubrace: null,
  selectedClass: null,
  selectedSubclass: null,
  selectedBackground: null,
  level: 1,
  alignment: "",
  abilityScores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  abilityMethod: "standard",
  selectedSkills: [],
  availableSkillChoices: 0,
  hitPoints: 0,
  armorClass: 10,
  selectedSpells: [],
  isSpellcaster: false,
  spellcastingAbility: null,
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
};

// ===========================
// HOOK
// ===========================

export const useCharacterData = () => {
  const [characterData, setCharacterData] = useState(initialCharacterData);

  const updateCharacterData = useCallback(
    (newData: Partial<CharacterCreationData>) => {
      setCharacterData((prev) => {
        const updated = { ...prev, ...newData };

        // Auto-calculations based on selections
        if (newData.selectedClass) {
          updated.isSpellcaster = !!newData.selectedClass.spellcasting;
          updated.spellcastingAbility =
            newData.selectedClass.spellcasting?.spellcasting_ability.index || null;
          updated.availableSkillChoices = 2; // Simplified

          // Reset subclass if class changed
          if (newData.selectedClass.index !== prev.selectedClass?.index) {
            updated.selectedSubclass = null;
          }
        }

        // Calculate hit points
        if (newData.selectedClass && updated.abilityScores && updated.level) {
          const conModifier = Math.floor((updated.abilityScores.constitution - 10) / 2);
          updated.hitPoints =
            newData.selectedClass.hit_die +
            conModifier +
            (updated.level - 1) *
              (Math.floor(newData.selectedClass.hit_die / 2) + 1 + conModifier);
        }

        // Calculate armor class
        if (newData.abilityScores) {
          const dexModifier = Math.floor((updated.abilityScores.dexterity - 10) / 2);
          updated.armorClass = 10 + dexModifier;
        }

        // Reset subrace if race changed
        if (newData.selectedRace && newData.selectedRace.index !== prev.selectedRace?.index) {
          updated.selectedSubrace = null;
        }

        return updated;
      });
    },
    []
  );

  const resetCharacterData = useCallback(() => {
    setCharacterData(initialCharacterData);
  }, []);

  const getCombinedAbilityBonuses = useCallback(() => {
    const bonusArray = [];
    
    // Add race bonuses
    if (characterData.selectedRace) {
      characterData.selectedRace.ability_bonuses.forEach((bonus) => {
        bonusArray.push(bonus);
      });
    }

    // Add subrace bonuses
    if (characterData.selectedSubrace) {
      characterData.selectedSubrace.ability_bonuses.forEach((bonus) => {
        bonusArray.push(bonus);
      });
    }

    return bonusArray;
  }, [characterData.selectedRace, characterData.selectedSubrace]);

  const getSubraceAbilityBonuses = useCallback(() => 
    characterData.selectedSubrace ? characterData.selectedSubrace.ability_bonuses : [],
    [characterData.selectedSubrace]
  );

  return {
    characterData,
    updateCharacterData,
    resetCharacterData,
    getCombinedAbilityBonuses,
    getSubraceAbilityBonuses,
  };
};