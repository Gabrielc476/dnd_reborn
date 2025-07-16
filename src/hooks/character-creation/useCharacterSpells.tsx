import { useState, useEffect, useCallback, useMemo } from 'react';
import { DndClass, DndSpell, AbilityScores } from '@/types/characterCreation';

export default function useCharacterSpells() {
  const [availableCantrips, setAvailableCantrips] = useState<DndSpell[]>([]);
  const [availableSpells, setAvailableSpells] = useState<DndSpell[]>([]);
  const [selectedCantrips, setSelectedCantrips] = useState<DndSpell[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<DndSpell[]>([]);
  const [isSpellcaster, setIsSpellcaster] = useState(false);
  const [spellcastingAbility, setSpellcastingAbility] = useState<keyof AbilityScores | null>(null);
  const [cantripsKnown, setCantripsKnown] = useState(0);
  const [spellsKnown, setSpellsKnown] = useState(0);
  const [spellSlots, setSpellSlots] = useState<Record<number, number>>({});
  const [spellSaveDC, setSpellSaveDC] = useState(0);
  const [spellAttackBonus, setSpellAttackBonus] = useState(0);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const valid = selectedCantrips.length === cantripsKnown && selectedSpells.length === spellsKnown;
    setIsValid(valid);
  }, [selectedCantrips, selectedSpells, cantripsKnown, spellsKnown]);

  const configureSpellcasting = useCallback((
    characterClass: DndClass,
    level: number,
    abilityModifier: number
  ) => {
    if (!characterClass.spellcasting) {
      setIsSpellcaster(false);
      return;
    }

    setIsSpellcaster(true);
    const ability = characterClass.spellcasting.spellcasting_ability.index as keyof AbilityScores;
    setSpellcastingAbility(ability);
    const proficiencyBonus = Math.ceil(level / 4) + 1;
    setSpellSaveDC(8 + proficiencyBonus + abilityModifier);
    setSpellAttackBonus(proficiencyBonus + abilityModifier);

    if (characterClass.index === 'wizard') {
      setCantripsKnown(level >= 1 ? 3 : 0);
      setSpellsKnown(level >= 1 ? 6 : 0);
      setSpellSlots({ 1: level >= 1 ? 2 : 0 });
    } else if (characterClass.index === 'cleric') {
      setCantripsKnown(level >= 1 ? 3 : 0);
      setSpellsKnown(level >= 1 ? Math.min(level + 1, 10) : 0);
      setSpellSlots({ 1: level >= 1 ? 2 : 0 });
    }
  }, []);

  const updateDynamicValues = useCallback((
    abilityModifier: number,
    proficiencyBonus: number,
    characterClass: DndClass
  ) => {
    if (!spellcastingAbility || !characterClass.spellcasting) return;
    setSpellSaveDC(8 + proficiencyBonus + abilityModifier);
    setSpellAttackBonus(proficiencyBonus + abilityModifier);
  }, [spellcastingAbility]);

  // FIX: Renamed this function to avoid conflict with the useState setter.
  const filterAndSetAvailableSpells = useCallback((spells: DndSpell[], characterClass?: DndClass) => {
    const cantrips = spells.filter(spell => spell.level === 0);
    const leveledSpells = spells.filter(spell => spell.level > 0);
    setAvailableCantrips(cantrips);
    setAvailableSpells(leveledSpells);
  }, [setAvailableCantrips, setAvailableSpells]); // Added stable setters to dependency array for clarity

  const addCantrip = useCallback((spell: DndSpell) => {
    if (selectedCantrips.length >= cantripsKnown) return;
    setSelectedCantrips(prev => [...prev, spell]);
  }, [cantripsKnown, selectedCantrips.length]);

  const removeCantrip = useCallback((spellIndex: string) => {
    setSelectedCantrips(prev => prev.filter(s => s.index !== spellIndex));
  }, []);

  const isKnownCantrip = useCallback((spellIndex: string) => {
    return selectedCantrips.some(s => s.index === spellIndex);
  }, [selectedCantrips]);

  const addSpell = useCallback((spell: DndSpell) => {
    if (selectedSpells.length >= spellsKnown) return;
    setSelectedSpells(prev => [...prev, spell]);
  }, [spellsKnown, selectedSpells.length]);

  const removeSpell = useCallback((spellIndex: string) => {
    setSelectedSpells(prev => prev.filter(s => s.index !== spellIndex));
  }, []);

  const isKnownSpell = useCallback((spellIndex: string) => {
    return selectedSpells.some(s => s.index === spellIndex);
  }, [selectedSpells]);

  const canLearnMoreCantrips = useMemo(() => {
    return selectedCantrips.length < cantripsKnown;
  }, [selectedCantrips.length, cantripsKnown]);

  const canLearnMoreSpells = useMemo(() => {
    return selectedSpells.length < spellsKnown;
  }, [selectedSpells.length, spellsKnown]);

  const getSpellsForAPI = useCallback(() => {
    return {
      isSpellcaster,
      spellcastingAbility,
      cantrips: selectedCantrips.map(s => s.index),
      spells: selectedSpells.map(s => s.index),
      spellSlots,
    };
  }, [isSpellcaster, spellcastingAbility, selectedCantrips, selectedSpells, spellSlots]);

  return {
    isSpellcaster,
    spellcastingAbility,
    cantripsKnown,
    spellsKnown,
    spellSlots,
    availableCantrips,
    availableSpells,
    selectedCantrips,
    selectedSpells,
    spellSaveDC,
    spellAttackBonus,
    spellcastingInfo: {
      ability: spellcastingAbility,
      spellSaveDC,
      spellAttackBonus,
      slots: spellSlots
    },
    isValid,
    configureSpellcasting,
    updateDynamicValues,
    // FIX: Exported the renamed function under the original desired name.
    setAvailableSpells: filterAndSetAvailableSpells,
    addCantrip,
    removeCantrip,
    isKnownCantrip,
    addSpell,
    removeSpell,
    isKnownSpell,
    getSpellsForAPI,
    canLearnMoreCantrips,
    canLearnMoreSpells,
    setIsValid
  };
}
