// ===========================
// useCharacterSpells.ts
// Hook para gerenciar magias do personagem
// ===========================

import { useState, useCallback, useMemo } from 'react';
import { 
  DndSpell, 
  AbilityScores, 
  AbilityScoreKey, 
  DndClass,
  SpellLevel
} from '@/types/characterCreation';

// Interface específica do hook que estende os tipos base
export interface SpellSlots {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  level6: number;
  level7: number;
  level8: number;
  level9: number;
}

export interface SpellcastingInfo {
  ability: AbilityScoreKey;
  spellSaveDC: number;
  spellAttackBonus: number;
  cantripsKnown: number;
  spellsKnown: number;
  spellSlots: SpellSlots;
  ritualCasting?: boolean;
  spellcastingFocus?: string;
}

const useCharacterSpells = () => {
  const [isSpellcaster, setIsSpellcaster] = useState(false);
  const [spellcastingAbility, setSpellcastingAbility] = useState<AbilityScoreKey | null>(null);
  const [selectedCantrips, setSelectedCantrips] = useState<DndSpell[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<DndSpell[]>([]);
  const [availableCantrips, setAvailableCantrips] = useState<DndSpell[]>([]);
  const [availableSpells, setAvailableSpells] = useState<DndSpell[]>([]);
  const [spellSlots, setSpellSlots] = useState<SpellSlots>({
    level1: 0, level2: 0, level3: 0, level4: 0, level5: 0,
    level6: 0, level7: 0, level8: 0, level9: 0,
  });
  const [cantripsKnown, setCantripsKnown] = useState(0);
  const [spellsKnown, setSpellsKnown] = useState(0);

  // Configurar conjuração baseado na classe
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
    setSpellcastingAbility(characterClass.spellcasting.spellcasting_ability.index as AbilityScoreKey);

    // Configurar slots baseado na progressão da classe
    const spellcasting = characterClass.spellcasting;
    if (spellcasting) {
      const newSpellSlots = calculateSpellSlots(characterClass.index, level);
      setSpellSlots(newSpellSlots);
    }

    // Configurar quantidade de magias/cantrips conhecidos
    const cantripsForLevel = getCantripsKnown(characterClass.index, level);
    const spellsForLevel = getSpellsKnown(characterClass.index, level);
    
    setCantripsKnown(cantripsForLevel);
    setSpellsKnown(spellsForLevel);
  }, []);

  // Calcular spell slots baseado na classe e nível
  const calculateSpellSlots = useCallback((classIndex: string, level: number): SpellSlots => {
    // Tabelas de progressão de spell slots por classe
    const spellSlotProgression: Record<string, Record<number, SpellSlots>> = {
      'wizard': {
        1: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
        2: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
        3: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
        4: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
        5: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
        // ... continuar para outros níveis
      },
      'sorcerer': {
        1: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
        2: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
        // ... continuar
      },
      // ... outras classes conjuradoras
    };

    return spellSlotProgression[classIndex]?.[level] || {
      level1: 0, level2: 0, level3: 0, level4: 0, level5: 0,
      level6: 0, level7: 0, level8: 0, level9: 0,
    };
  }, []);

  // Obter cantrips conhecidos por classe/nível
  const getCantripsKnown = useCallback((classIndex: string, level: number): number => {
    // Tabelas de progressão por classe
    const cantripProgression: Record<string, Record<number, number>> = {
      'wizard': { 1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5 },
      'sorcerer': { 1: 4, 2: 4, 3: 4, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5, 9: 5, 10: 6 },
      'warlock': { 1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4 },
      'bard': { 1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4 },
      'cleric': { 1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5 },
      'druid': { 1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4 },
    };

    return cantripProgression[classIndex]?.[level] || 0;
  }, []);

  // Obter magias conhecidas por classe/nível
  const getSpellsKnown = useCallback((classIndex: string, level: number): number => {
    // Para classes que conhecem magias (não preparadas)
    const spellsKnownProgression: Record<string, Record<number, number>> = {
      'sorcerer': { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11 },
      'warlock': { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10 },
      'bard': { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14 },
      'ranger': { 1: 0, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 6, 10: 6 },
    };

    // Para classes que preparam magias, retorna 0 (elas preparam baseado no nível + modificador)
    if (['wizard', 'cleric', 'druid', 'paladin'].includes(classIndex)) {
      return 0; // Será calculado baseado no nível + modificador de atributo
    }

    return spellsKnownProgression[classIndex]?.[level] || 0;
  }, []);

  // Adicionar cantrip
  const addCantrip = useCallback((cantrip: DndSpell) => {
    if (selectedCantrips.length >= cantripsKnown) return false;
    if (selectedCantrips.some(c => c.index === cantrip.index)) return false;
    if (cantrip.level !== 0) return false;

    setSelectedCantrips(prev => [...prev, cantrip]);
    return true;
  }, [selectedCantrips, cantripsKnown]);

  // Remover cantrip
  const removeCantrip = useCallback((cantripIndex: string) => {
    setSelectedCantrips(prev => prev.filter(c => c.index !== cantripIndex));
  }, []);

  // Adicionar magia
  const addSpell = useCallback((spell: DndSpell) => {
    if (selectedSpells.length >= spellsKnown) return false;
    if (selectedSpells.some(s => s.index === spell.index)) return false;
    if (spell.level === 0) return false; // Cantrips não vão aqui

    setSelectedSpells(prev => [...prev, spell]);
    return true;
  }, [selectedSpells, spellsKnown]);

  // Remover magia
  const removeSpell = useCallback((spellIndex: string) => {
    setSelectedSpells(prev => prev.filter(s => s.index !== spellIndex));
  }, []);

  // Definir magias disponíveis
  const setAvailableSpells = useCallback((spells: DndSpell[], characterClass: DndClass) => {
    // Filtrar por classe
    const classSpells = spells.filter(spell => 
      spell.classes.some(spellClass => spellClass.index === characterClass.index)
    );

    // Separar cantrips (nível 0) das magias
    const cantrips = classSpells.filter(spell => spell.level === 0);
    const regularSpells = classSpells.filter(spell => spell.level > 0);

    setAvailableCantrips(cantrips);
    setAvailableSpells(regularSpells);
  }, []);

  // Estado para valores dinâmicos vindos de outros hooks
  const [currentAbilityModifier, setCurrentAbilityModifier] = useState(0);
  const [currentProficiencyBonus, setCurrentProficiencyBonus] = useState(2);
  const [currentCharacterClass, setCurrentCharacterClass] = useState<DndClass | null>(null);

  // Atualizar valores dinâmicos
  const updateDynamicValues = useCallback((
    abilityModifier: number,
    proficiencyBonus: number,
    characterClass?: DndClass
  ) => {
    setCurrentAbilityModifier(abilityModifier);
    setCurrentProficiencyBonus(proficiencyBonus);
    if (characterClass) {
      setCurrentCharacterClass(characterClass);
    }
  }, []);

  // Calcular informações de conjuração com valores dinâmicos
  const spellcastingInfo = useMemo((): SpellcastingInfo | null => {
    if (!isSpellcaster || !spellcastingAbility) return null;

    // Determinar ritual casting baseado na classe
    const hasRitualCasting = currentCharacterClass ? 
      ['wizard', 'cleric', 'druid', 'warlock'].includes(currentCharacterClass.index) : false;

    // Determinar foco de conjuração baseado na classe
    const getSpellcastingFocus = () => {
      if (!currentCharacterClass) return 'arcane focus';
      
      const focusMap: Record<string, string> = {
        'wizard': 'arcane focus',
        'sorcerer': 'arcane focus',
        'warlock': 'arcane focus',
        'bard': 'musical instrument',
        'cleric': 'holy symbol',
        'druid': 'druidcraft focus',
        'paladin': 'holy symbol',
        'ranger': 'natural focus',
      };
      
      return focusMap[currentCharacterClass.index] || 'arcane focus';
    };

    return {
      ability: spellcastingAbility,
      spellSaveDC: 8 + currentProficiencyBonus + currentAbilityModifier,
      spellAttackBonus: currentProficiencyBonus + currentAbilityModifier,
      cantripsKnown,
      spellsKnown,
      spellSlots,
      ritualCasting: hasRitualCasting,
      spellcastingFocus: getSpellcastingFocus(),
    };
  }, [
    isSpellcaster, 
    spellcastingAbility, 
    currentAbilityModifier, 
    currentProficiencyBonus, 
    cantripsKnown, 
    spellsKnown, 
    spellSlots, 
    currentCharacterClass
  ]);

  // Calcular informações com dados reais dos outros hooks
  const calculateSpellcastingInfo = useCallback((
    abilityScores: AbilityScores,
    proficiencyBonus: number
  ): SpellcastingInfo | null => {
    if (!isSpellcaster || !spellcastingAbility) return null;

    const abilityModifier = Math.floor((abilityScores[spellcastingAbility] - 10) / 2);

    return {
      ability: spellcastingAbility,
      spellSaveDC: 8 + proficiencyBonus + abilityModifier,
      spellAttackBonus: proficiencyBonus + abilityModifier,
      cantripsKnown,
      spellsKnown,
      spellSlots,
      ritualCasting: true,
      spellcastingFocus: 'arcane focus',
    };
  }, [isSpellcaster, spellcastingAbility, cantripsKnown, spellsKnown, spellSlots]);

  // Obter magias por nível
  const getSpellsByLevel = useCallback((level: SpellLevel) => {
    if (level === 0) {
      return selectedCantrips;
    }
    return selectedSpells.filter(spell => spell.level === level);
  }, [selectedCantrips, selectedSpells]);

  // Verificar se pode aprender mais cantrips
  const canLearnMoreCantrips = useMemo(() => {
    return selectedCantrips.length < cantripsKnown;
  }, [selectedCantrips.length, cantripsKnown]);

  // Verificar se pode aprender mais magias
  const canLearnMoreSpells = useMemo(() => {
    return selectedSpells.length < spellsKnown;
  }, [selectedSpells.length, spellsKnown]);

  // Validação
  const isValid = useMemo(() => {
    if (!isSpellcaster) return true;
    
    // Para conjuradores, verificar se tem pelo menos os cantrips obrigatórios
    const requiredCantrips = Math.min(cantripsKnown, 1);
    return selectedCantrips.length >= requiredCantrips;
  }, [isSpellcaster, selectedCantrips.length, cantripsKnown]);

  // Reset
  const reset = useCallback(() => {
    setIsSpellcaster(false);
    setSpellcastingAbility(null);
    setSelectedCantrips([]);
    setSelectedSpells([]);
    setAvailableCantrips([]);
    setAvailableSpells([]);
    setSpellSlots({
      level1: 0, level2: 0, level3: 0, level4: 0, level5: 0,
      level6: 0, level7: 0, level8: 0, level9: 0,
    });
    setCantripsKnown(0);
    setSpellsKnown(0);
    setCurrentAbilityModifier(0);
    setCurrentProficiencyBonus(2);
    setCurrentCharacterClass(null);
  }, []);

  // Obter dados para API
  const getSpellsForAPI = useCallback(() => {
    return {
      cantrips: selectedCantrips.map(c => c.index),
      spells: selectedSpells.map(s => s.index),
      spellSlots,
      spellcastingAbility,
      isSpellcaster,
    };
  }, [selectedCantrips, selectedSpells, spellSlots, spellcastingAbility, isSpellcaster]);

  return {
    // State
    isSpellcaster,
    spellcastingAbility,
    selectedCantrips,
    selectedSpells,
    availableCantrips,
    availableSpells,
    cantripsKnown,
    spellsKnown,
    spellSlots,
    spellcastingInfo,
    
    // Actions
    configureSpellcasting,
    addCantrip,
    removeCantrip,
    addSpell,
    removeSpell,
    setAvailableSpells,
    updateDynamicValues,
    
    // Queries
    getSpellsByLevel,
    canLearnMoreCantrips,
    canLearnMoreSpells,
    
    // Computed
    remainingCantrips: cantripsKnown - selectedCantrips.length,
    remainingSpells: spellsKnown - selectedSpells.length,
    totalSpellsSelected: selectedCantrips.length + selectedSpells.length,
    
    // Validation
    isValid,
    
    // Utils
    reset,
    getSpellsForAPI,
    
    // Dynamic values (for debugging/inspection)
    currentAbilityModifier,
    currentProficiencyBonus,
    currentCharacterClass,
    
    // Helpers
    isKnownCantrip: (spellIndex: string) => selectedCantrips.some(c => c.index === spellIndex),
    isKnownSpell: (spellIndex: string) => selectedSpells.some(s => s.index === spellIndex),
    getMaxSpellLevel: () => {
      const slots = Object.entries(spellSlots);
      for (let i = slots.length - 1; i >= 0; i--) {
        if (slots[i][1] > 0) return i + 1;
      }
      return 0;
    },
    hasSpellSlots: (level: number) => {
      const slotKey = `level${level}` as keyof SpellSlots;
      return spellSlots[slotKey] > 0;
    },
  };
};

export default useCharacterSpells;