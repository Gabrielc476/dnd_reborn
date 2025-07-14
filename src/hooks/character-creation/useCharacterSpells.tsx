// ===========================
// useCharacterSpells.ts
// Hook para gerenciar magias do personagem
// ===========================

import { useState, useCallback, useMemo } from 'react';

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  casting_time: string;
  range: string;
  components: string[];
  duration: string;
  description: string;
  classes: string[];
  ritual?: boolean;
  concentration?: boolean;
  damage?: {
    damage_type: string;
    damage_at_slot_level?: Record<string, string>;
  };
  higher_level?: string;
}

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
  ability: 'intelligence' | 'wisdom' | 'charisma';
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
  const [spellcastingAbility, setSpellcastingAbility] = useState<'intelligence' | 'wisdom' | 'charisma' | null>(null);
  const [selectedCantrips, setSelectedCantrips] = useState<Spell[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<Spell[]>([]);
  const [availableCantrips, setAvailableCantrips] = useState<Spell[]>([]);
  const [availableSpells, setAvailableSpells] = useState<Spell[]>([]);
  const [spellSlots, setSpellSlots] = useState<SpellSlots>({
    level1: 0, level2: 0, level3: 0, level4: 0, level5: 0,
    level6: 0, level7: 0, level8: 0, level9: 0,
  });
  const [cantripsKnown, setCantripsKnown] = useState(0);
  const [spellsKnown, setSpellsKnown] = useState(0);

  // Configurar conjuração baseado na classe
  const configureSpellcasting = useCallback((
    characterClass: any,
    level: number,
    abilityModifier: number
  ) => {
    if (!characterClass.spellcasting_ability) {
      setIsSpellcaster(false);
      return;
    }

    setIsSpellcaster(true);
    setSpellcastingAbility(characterClass.spellcasting_ability);

    // Configurar slots baseado na progressão da classe
    const spellcasting = characterClass.spellcasting;
    if (spellcasting) {
      // Aqui você configuraria os slots baseado na tabela da classe
      // Por exemplo, para um Wizard nível 1:
      if (level === 1) {
        setSpellSlots({
          level1: 2,
          level2: 0, level3: 0, level4: 0, level5: 0,
          level6: 0, level7: 0, level8: 0, level9: 0,
        });
      }
    }

    // Configurar quantidade de magias/cantrips conhecidos
    const cantripsForLevel = getCantripsKnown(characterClass.index, level);
    const spellsForLevel = getSpellsKnown(characterClass.index, level);
    
    setCantripsKnown(cantripsForLevel);
    setSpellsKnown(spellsForLevel);
  }, []);

  // Obter cantrips conhecidos por classe/nível
  const getCantripsKnown = useCallback((classIndex: string, level: number): number => {
    // Tabelas de progressão por classe
    const cantripProgression: Record<string, Record<number, number>> = {
      'wizard': { 1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 10: 5, 20: 5 },
      'sorcerer': { 1: 4, 2: 4, 3: 4, 4: 5, 5: 5, 10: 6, 20: 6 },
      'warlock': { 1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 10: 4, 20: 4 },
      'bard': { 1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 10: 4, 20: 4 },
      'cleric': { 1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 10: 5, 20: 5 },
      'druid': { 1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 10: 4, 20: 4 },
    };

    const progression = cantripProgression[classIndex];
    if (!progression) return 0;

    // Encontrar o nível mais próximo
    const levels = Object.keys(progression).map(Number).sort((a, b) => a - b);
    for (let i = levels.length - 1; i >= 0; i--) {
      if (level >= levels[i]) {
        return progression[levels[i]];
      }
    }
    return 0;
  }, []);

  // Obter magias conhecidas por classe/nível
  const getSpellsKnown = useCallback((classIndex: string, level: number): number => {
    // Similar ao cantrips, mas para magias
    const spellProgression: Record<string, Record<number, number>> = {
      'wizard': { 1: 6, 2: 8, 3: 10, 4: 12, 5: 14, 20: 44 }, // Wizards aprendem mais
      'sorcerer': { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 20: 15 },
      'warlock': { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 20: 11 },
      'bard': { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 20: 22 },
      'cleric': { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 20: 25 }, // Preparadas, não conhecidas
      'druid': { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 20: 25 }, // Preparadas, não conhecidas
    };

    const progression = spellProgression[classIndex];
    if (!progression) return 0;

    const levels = Object.keys(progression).map(Number).sort((a, b) => a - b);
    for (let i = levels.length - 1; i >= 0; i--) {
      if (level >= levels[i]) {
        return progression[levels[i]];
      }
    }
    return 0;
  }, []);

  // Adicionar cantip
  const addCantrip = useCallback((cantrip: Spell) => {
    if (selectedCantrips.length >= cantripsKnown) return false;
    if (selectedCantrips.some(c => c.id === cantrip.id)) return false;

    setSelectedCantrips(prev => [...prev, cantrip]);
    return true;
  }, [selectedCantrips, cantripsKnown]);

  // Remover cantrip
  const removeCantrip = useCallback((cantripId: string) => {
    setSelectedCantrips(prev => prev.filter(c => c.id !== cantripId));
  }, []);

  // Adicionar magia
  const addSpell = useCallback((spell: Spell) => {
    if (selectedSpells.length >= spellsKnown) return false;
    if (selectedSpells.some(s => s.id === spell.id)) return false;

    setSelectedSpells(prev => [...prev, spell]);
    return true;
  }, [selectedSpells, spellsKnown]);

  // Remover magia
  const removeSpell = useCallback((spellId: string) => {
    setSelectedSpells(prev => prev.filter(s => s.id !== spellId));
  }, []);

  // Definir magias disponíveis
  const setAvailableSpells = useCallback((spells: Spell[], characterClass: string) => {
    // Filtrar por classe
    const classSpells = spells.filter(spell => 
      spell.classes.includes(characterClass)
    );

    // Separar cantrips (nível 0) das magias
    const cantrips = classSpells.filter(spell => spell.level === 0);
    const regularSpells = classSpells.filter(spell => spell.level > 0);

    setAvailableCantrips(cantrips);
    setAvailableSpells(regularSpells);
  }, []);

  // Calcular informações de conjuração
  const spellcastingInfo = useMemo((): SpellcastingInfo | null => {
    if (!isSpellcaster || !spellcastingAbility) return null;

    // Assumindo que você tem os modificadores de atributo disponíveis
    // Em um caso real, isso viria do hook de abilities
    const abilityModifier = 3; // Placeholder
    const proficiencyBonus = 2; // Placeholder

    return {
      ability: spellcastingAbility,
      spellSaveDC: 8 + proficiencyBonus + abilityModifier,
      spellAttackBonus: proficiencyBonus + abilityModifier,
      cantripsKnown,
      spellsKnown,
      spellSlots,
      ritualCasting: true, // Dependeria da classe
      spellcastingFocus: 'arcane focus', // Dependeria da classe
    };
  }, [isSpellcaster, spellcastingAbility, cantripsKnown, spellsKnown, spellSlots]);

  // Obter magias por nível
  const getSpellsByLevel = useCallback((level: number) => {
    return selectedSpells.filter(spell => spell.level === level);
  }, [selectedSpells]);

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
    return selectedCantrips.length >= Math.min(cantripsKnown, 1);
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
  }, []);

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
    
    // Helpers
    isKnownCantrip: (spellId: string) => selectedCantrips.some(c => c.id === spellId),
    isKnownSpell: (spellId: string) => selectedSpells.some(s => s.id === spellId),
    getMaxSpellLevel: () => {
      const slots = Object.entries(spellSlots);
      for (let i = slots.length - 1; i >= 0; i--) {
        if (slots[i][1] > 0) return i + 1;
      }
      return 0;
    },
  };
};

export default useCharacterSpells;