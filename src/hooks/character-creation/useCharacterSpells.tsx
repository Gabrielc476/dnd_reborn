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

  // ✅ VALIDAÇÃO MELHORADA COM DEBUG
  useEffect(() => {
    console.log('🔍 [useCharacterSpells] Validation check:', {
      isSpellcaster,
      selectedCantrips: selectedCantrips.length,
      cantripsKnown,
      selectedSpells: selectedSpells.length,
      spellsKnown,
      cantripsMatch: selectedCantrips.length === cantripsKnown,
      spellsMatch: selectedSpells.length === spellsKnown,
    });

    if (!isSpellcaster) {
      // Se não é conjurador, é sempre válido
      console.log('✅ [useCharacterSpells] Not a spellcaster, valid = true');
      setIsValid(true);
      return;
    }

    // Se é conjurador, verificar se selecionou a quantidade correta
    const cantripsComplete = selectedCantrips.length === cantripsKnown;
    const spellsComplete = selectedSpells.length === spellsKnown;
    const valid = cantripsComplete && spellsComplete;

    console.log('🔍 [useCharacterSpells] Spellcaster validation:', {
      cantripsComplete,
      spellsComplete,
      valid,
    });

    setIsValid(valid);
  }, [isSpellcaster, selectedCantrips, selectedSpells, cantripsKnown, spellsKnown]);

  const configureSpellcasting = useCallback((
    characterClass: DndClass,
    level: number,
    abilityModifier: number
  ) => {
    console.log('🔧 [useCharacterSpells] Configuring spellcasting:', {
      className: characterClass.name,
      hasSpellcasting: !!characterClass.spellcasting,
      level,
      abilityModifier,
    });

    if (!characterClass.spellcasting) {
      console.log('❌ [useCharacterSpells] Class has no spellcasting, setting isSpellcaster = false');
      setIsSpellcaster(false);
      setSpellcastingAbility(null);
      setCantripsKnown(0);
      setSpellsKnown(0);
      setSpellSlots({});
      return;
    }

    setIsSpellcaster(true);
    const ability = characterClass.spellcasting.spellcasting_ability.index as keyof AbilityScores;
    setSpellcastingAbility(ability);
    const proficiencyBonus = Math.ceil(level / 4) + 1;
    setSpellSaveDC(8 + proficiencyBonus + abilityModifier);
    setSpellAttackBonus(proficiencyBonus + abilityModifier);

    // Configurar magias por classe
    if (characterClass.index === 'wizard') {
      const cantrips = level >= 1 ? 3 : 0;
      const spells = level >= 1 ? 6 : 0;
      
      console.log('🧙 [useCharacterSpells] Wizard configuration:', {
        cantrips,
        spells,
        slots: { 1: level >= 1 ? 2 : 0 }
      });

      setCantripsKnown(cantrips);
      setSpellsKnown(spells);
      setSpellSlots({ 1: level >= 1 ? 2 : 0 });
    } else if (characterClass.index === 'cleric') {
      const cantrips = level >= 1 ? 3 : 0;
      const spells = level >= 1 ? Math.min(level + 1, 10) : 0;
      
      console.log('🛐 [useCharacterSpells] Cleric configuration:', {
        cantrips,
        spells,
        slots: { 1: level >= 1 ? 2 : 0 }
      });

      setCantripsKnown(cantrips);
      setSpellsKnown(spells);
      setSpellSlots({ 1: level >= 1 ? 2 : 0 });
    } else if (characterClass.index === 'sorcerer') {
      const cantrips = level >= 1 ? 4 : 0;
      const spells = level >= 1 ? 2 : 0;
      
      console.log('🔮 [useCharacterSpells] Sorcerer configuration:', {
        cantrips,
        spells,
        slots: { 1: level >= 1 ? 2 : 0 }
      });

      setCantripsKnown(cantrips);
      setSpellsKnown(spells);
      setSpellSlots({ 1: level >= 1 ? 2 : 0 });
    } else if (characterClass.index === 'warlock') {
      const cantrips = level >= 1 ? 2 : 0;
      const spells = level >= 1 ? 2 : 0;
      
      console.log('🦹 [useCharacterSpells] Warlock configuration:', {
        cantrips,
        spells,
        slots: { 1: level >= 1 ? 1 : 0 }
      });

      setCantripsKnown(cantrips);
      setSpellsKnown(spells);
      setSpellSlots({ 1: level >= 1 ? 1 : 0 });
    } else if (characterClass.index === 'bard') {
      const cantrips = level >= 1 ? 2 : 0;
      const spells = level >= 1 ? 4 : 0;
      
      console.log('🎵 [useCharacterSpells] Bard configuration:', {
        cantrips,
        spells,
        slots: { 1: level >= 1 ? 2 : 0 }
      });

      setCantripsKnown(cantrips);
      setSpellsKnown(spells);
      setSpellSlots({ 1: level >= 1 ? 2 : 0 });
    } else {
      // Classe conjuradora genérica
      const cantrips = level >= 1 ? 2 : 0;
      const spells = level >= 1 ? 2 : 0;
      
      console.log('🎭 [useCharacterSpells] Generic spellcaster configuration:', {
        cantrips,
        spells,
        slots: { 1: level >= 1 ? 2 : 0 }
      });

      setCantripsKnown(cantrips);
      setSpellsKnown(spells);
      setSpellSlots({ 1: level >= 1 ? 2 : 0 });
    }
  }, []);

  const updateDynamicValues = useCallback((
    abilityModifier: number,
    proficiencyBonus: number,
    characterClass: DndClass
  ) => {
    if (!spellcastingAbility || !characterClass.spellcasting) return;
    
    console.log('🔄 [useCharacterSpells] Updating dynamic values:', {
      abilityModifier,
      proficiencyBonus,
      newSpellSaveDC: 8 + proficiencyBonus + abilityModifier,
      newSpellAttackBonus: proficiencyBonus + abilityModifier,
    });

    setSpellSaveDC(8 + proficiencyBonus + abilityModifier);
    setSpellAttackBonus(proficiencyBonus + abilityModifier);
  }, [spellcastingAbility]);

  const filterAndSetAvailableSpells = useCallback((spells: DndSpell[], characterClass?: DndClass) => {
    console.log('🎯 [useCharacterSpells] Filtering spells:', {
      totalSpells: spells.length,
      className: characterClass?.name || 'unknown',
    });

    const cantrips = spells.filter(spell => spell.level === 0);
    const leveledSpells = spells.filter(spell => spell.level > 0);
    
    console.log('📚 [useCharacterSpells] Filtered spells:', {
      cantrips: cantrips.length,
      leveledSpells: leveledSpells.length,
    });

    setAvailableCantrips(cantrips);
    setAvailableSpells(leveledSpells);
  }, []);

  const addCantrip = useCallback((spell: DndSpell) => {
    if (selectedCantrips.length >= cantripsKnown) {
      console.log('❌ [useCharacterSpells] Cannot add cantrip, limit reached:', {
        current: selectedCantrips.length,
        max: cantripsKnown,
      });
      return;
    }

    console.log('➕ [useCharacterSpells] Adding cantrip:', {
      spell: spell.name,
      newTotal: selectedCantrips.length + 1,
      max: cantripsKnown,
    });

    setSelectedCantrips(prev => [...prev, spell]);
  }, [cantripsKnown, selectedCantrips.length]);

  const removeCantrip = useCallback((spellIndex: string) => {
    console.log('➖ [useCharacterSpells] Removing cantrip:', spellIndex);
    setSelectedCantrips(prev => prev.filter(s => s.index !== spellIndex));
  }, []);

  const isKnownCantrip = useCallback((spellIndex: string) => {
    return selectedCantrips.some(s => s.index === spellIndex);
  }, [selectedCantrips]);

  const addSpell = useCallback((spell: DndSpell) => {
    if (selectedSpells.length >= spellsKnown) {
      console.log('❌ [useCharacterSpells] Cannot add spell, limit reached:', {
        current: selectedSpells.length,
        max: spellsKnown,
      });
      return;
    }

    console.log('➕ [useCharacterSpells] Adding spell:', {
      spell: spell.name,
      level: spell.level,
      newTotal: selectedSpells.length + 1,
      max: spellsKnown,
    });

    setSelectedSpells(prev => [...prev, spell]);
  }, [spellsKnown, selectedSpells.length]);

  const removeSpell = useCallback((spellIndex: string) => {
    console.log('➖ [useCharacterSpells] Removing spell:', spellIndex);
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
    const apiData = {
      isSpellcaster,
      spellcastingAbility,
      cantrips: selectedCantrips.map(s => s.index),
      spells: selectedSpells.map(s => s.index),
      spellSlots,
    };

    console.log('📤 [useCharacterSpells] API data:', apiData);
    return apiData;
  }, [isSpellcaster, spellcastingAbility, selectedCantrips, selectedSpells, spellSlots]);

  // ✅ RESET FUNCTION - ADICIONADO PARA CASOS DE MUDANÇA DE CLASSE
  const resetSpells = useCallback(() => {
    console.log('🔄 [useCharacterSpells] Resetting spells');
    setSelectedCantrips([]);
    setSelectedSpells([]);
    setIsValid(false);
  }, []);

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
    setIsValid,
    resetSpells, // ✅ NOVO MÉTODO PARA RESET
  };
}