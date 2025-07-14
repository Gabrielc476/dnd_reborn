// ===========================
// useAbilityScores.ts
// Hook para gerenciar atributos do personagem
// ===========================

import { useState, useCallback, useMemo } from 'react';

export type AbilityMethod = 'point-buy' | 'standard-array' | 'roll';

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface AbilityModifiers {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

const INITIAL_SCORES: AbilityScores = {
  strength: 8,
  dexterity: 8,
  constitution: 8,
  intelligence: 8,
  wisdom: 8,
  charisma: 8,
};

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5,
  14: 7, 15: 9
};

export const useAbilityScores = () => {
  const [method, setMethod] = useState<AbilityMethod>('point-buy');
  const [scores, setScores] = useState<AbilityScores>(INITIAL_SCORES);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [standardArrayAssigned, setStandardArrayAssigned] = useState<Record<string, number | null>>({
    strength: null,
    dexterity: null,
    constitution: null,
    intelligence: null,
    wisdom: null,
    charisma: null,
  });

  const maxPoints = 27;

  // Calcular modificadores
  const modifiers = useMemo((): AbilityModifiers => {
    const calculateModifier = (score: number) => Math.floor((score - 10) / 2);
    
    return {
      strength: calculateModifier(scores.strength),
      dexterity: calculateModifier(scores.dexterity),
      constitution: calculateModifier(scores.constitution),
      intelligence: calculateModifier(scores.intelligence),
      wisdom: calculateModifier(scores.wisdom),
      charisma: calculateModifier(scores.charisma),
    };
  }, [scores]);

  // Calcular pontos usados no point-buy
  const calculatePointsUsed = useCallback((currentScores: AbilityScores) => {
    return Object.values(currentScores).reduce((total, score) => {
      return total + (POINT_BUY_COSTS[score] || 0);
    }, 0);
  }, []);

  // Atualizar método
  const updateMethod = useCallback((newMethod: AbilityMethod) => {
    setMethod(newMethod);
    
    if (newMethod === 'point-buy') {
      setScores(INITIAL_SCORES);
      setPointsUsed(0);
    } else if (newMethod === 'standard-array') {
      setScores(INITIAL_SCORES);
      setStandardArrayAssigned({
        strength: null,
        dexterity: null,
        constitution: null,
        intelligence: null,
        wisdom: null,
        charisma: null,
      });
    }
  }, []);

  // Point Buy: Atualizar atributo específico
  const updateAbilityScore = useCallback((ability: keyof AbilityScores, newValue: number) => {
    if (method !== 'point-buy') return;

    const clampedValue = Math.max(8, Math.min(15, newValue));
    const newScores = { ...scores, [ability]: clampedValue };
    const newPointsUsed = calculatePointsUsed(newScores);
    
    if (newPointsUsed <= maxPoints) {
      setScores(newScores);
      setPointsUsed(newPointsUsed);
    }
  }, [method, scores, calculatePointsUsed, maxPoints]);

  // Point Buy: Incrementar/Decrementar
  const incrementAbility = useCallback((ability: keyof AbilityScores) => {
    updateAbilityScore(ability, scores[ability] + 1);
  }, [updateAbilityScore, scores]);

  const decrementAbility = useCallback((ability: keyof AbilityScores) => {
    updateAbilityScore(ability, scores[ability] - 1);
  }, [updateAbilityScore, scores]);

  // Standard Array: Atribuir valor
  const assignStandardArrayValue = useCallback((ability: keyof AbilityScores, value: number) => {
    if (method !== 'standard-array') return;

    // Remover valor anterior se existir
    const newAssigned = { ...standardArrayAssigned };
    const oldValue = newAssigned[ability];
    
    // Verificar se o valor já está sendo usado por outro atributo
    const valueInUse = Object.entries(newAssigned).find(([key, val]) => 
      key !== ability && val === value
    );
    
    if (valueInUse) return; // Valor já está em uso

    newAssigned[ability] = value;
    
    // Se havia um valor anterior, disponibilizar para reutilização
    if (oldValue !== null) {
      // O valor anterior agora está disponível
    }

    setStandardArrayAssigned(newAssigned);
    
    // Atualizar scores
    const newScores = { ...INITIAL_SCORES };
    Object.entries(newAssigned).forEach(([key, val]) => {
      if (val !== null) {
        newScores[key as keyof AbilityScores] = val;
      }
    });
    
    setScores(newScores);
  }, [method, standardArrayAssigned]);

  // Standard Array: Valores disponíveis
  const availableStandardArrayValues = useMemo(() => {
    const used = Object.values(standardArrayAssigned).filter(v => v !== null);
    return STANDARD_ARRAY.filter(value => !used.includes(value));
  }, [standardArrayAssigned]);

  // Roll: Gerar valores aleatórios
  const rollAbilityScores = useCallback(() => {
    if (method !== 'roll') return;

    const rollStat = () => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    const newScores: AbilityScores = {
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat(),
    };

    setScores(newScores);
  }, [method]);

  // Validação
  const isValid = useMemo(() => {
    if (method === 'point-buy') {
      return pointsUsed <= maxPoints;
    } else if (method === 'standard-array') {
      return Object.values(standardArrayAssigned).every(v => v !== null);
    } else if (method === 'roll') {
      return Object.values(scores).every(v => v >= 3 && v <= 18);
    }
    return false;
  }, [method, pointsUsed, maxPoints, standardArrayAssigned, scores]);

  // Reset
  const reset = useCallback(() => {
    setScores(INITIAL_SCORES);
    setPointsUsed(0);
    setStandardArrayAssigned({
      strength: null,
      dexterity: null,
      constitution: null,
      intelligence: null,
      wisdom: null,
      charisma: null,
    });
  }, []);

  // Aplicar bônus raciais
  const applyRacialBonuses = useCallback((racialBonuses: Partial<AbilityScores>) => {
    setScores(prev => {
      const newScores = { ...prev };
      Object.entries(racialBonuses).forEach(([ability, bonus]) => {
        if (bonus && ability in newScores) {
          newScores[ability as keyof AbilityScores] += bonus;
        }
      });
      return newScores;
    });
  }, []);

  // Obter atributos finais (com bônus raciais)
  const getFinalScores = useCallback((racialBonuses?: Partial<AbilityScores>): AbilityScores => {
    if (!racialBonuses) return scores;
    
    const finalScores = { ...scores };
    Object.entries(racialBonuses).forEach(([ability, bonus]) => {
      if (bonus && ability in finalScores) {
        finalScores[ability as keyof AbilityScores] += bonus;
      }
    });
    return finalScores;
  }, [scores]);

  return {
    // State
    method,
    scores,
    modifiers,
    pointsUsed,
    pointsRemaining: maxPoints - pointsUsed,
    standardArrayAssigned,
    availableStandardArrayValues,
    
    // Actions
    updateMethod,
    updateAbilityScore,
    incrementAbility,
    decrementAbility,
    assignStandardArrayValue,
    rollAbilityScores,
    applyRacialBonuses,
    
    // Utils
    isValid,
    reset,
    getFinalScores,
    
    // Constants
    maxPoints,
    STANDARD_ARRAY,
    POINT_BUY_COSTS,
    
    // Helpers
    canIncrement: (ability: keyof AbilityScores) => {
      if (method !== 'point-buy') return false;
      const currentScore = scores[ability];
      if (currentScore >= 15) return false;
      const newCost = POINT_BUY_COSTS[currentScore + 1] - POINT_BUY_COSTS[currentScore];
      return pointsUsed + newCost <= maxPoints;
    },
    
    canDecrement: (ability: keyof AbilityScores) => {
      return method === 'point-buy' && scores[ability] > 8;
    },
  };
};