// ===========================
// useAbilityScores.ts
// Hook para gerenciar atributos do personagem
// ===========================

import { useState, useCallback, useMemo } from 'react';
import { AbilityScores, AbilityScoreKey } from '@/types/characterCreation';

export type AbilityMethod = 'point-buy' | 'standard-array' | 'roll';

// Tipos específicos do hook que estendem os tipos base
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
  const [standardArrayAssigned, setStandardArrayAssigned] = useState<Record<AbilityScoreKey, number | null>>({
    strength: null,
    dexterity: null,
    constitution: null,
    intelligence: null,
    wisdom: null,
    charisma: null,
  });
  const [rolledScores, setRolledScores] = useState<number[]>([]);

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

  // Calcular pontos gastos no Point Buy
  const calculatePointsUsed = useCallback((abilityScores: AbilityScores) => {
    return Object.values(abilityScores).reduce((total, score) => {
      return total + (POINT_BUY_COSTS[score] || 0);
    }, 0);
  }, []);

  // Atualizar pontos gastos quando scores mudam
  useMemo(() => {
    if (method === 'point-buy') {
      const newPointsUsed = calculatePointsUsed(scores);
      setPointsUsed(newPointsUsed);
    }
  }, [scores, method, calculatePointsUsed]);

  // Atualizar score individual (Point Buy)
  const updateScore = useCallback((ability: AbilityScoreKey, newScore: number) => {
    if (method !== 'point-buy') return;

    const clampedScore = Math.max(8, Math.min(15, newScore));
    const tempScores = { ...scores, [ability]: clampedScore };
    const tempPointsUsed = calculatePointsUsed(tempScores);

    if (tempPointsUsed <= maxPoints) {
      setScores(tempScores);
    }
  }, [method, scores, calculatePointsUsed, maxPoints]);

  // Incrementar score
  const incrementScore = useCallback((ability: AbilityScoreKey) => {
    updateScore(ability, scores[ability] + 1);
  }, [updateScore, scores]);

  // Decrementar score
  const decrementScore = useCallback((ability: AbilityScoreKey) => {
    updateScore(ability, scores[ability] - 1);
  }, [updateScore, scores]);

  // Verificar se pode incrementar
  const canIncrement = useCallback((ability: AbilityScoreKey) => {
    if (method !== 'point-buy') return false;
    
    const currentScore = scores[ability];
    if (currentScore >= 15) return false;
    
    const nextCost = POINT_BUY_COSTS[currentScore + 1] || 0;
    const currentCost = POINT_BUY_COSTS[currentScore] || 0;
    const additionalCost = nextCost - currentCost;
    
    return pointsUsed + additionalCost <= maxPoints;
  }, [method, scores, pointsUsed, maxPoints]);

  // Verificar se pode decrementar
  const canDecrement = useCallback((ability: AbilityScoreKey) => {
    if (method !== 'point-buy') return false;
    return scores[ability] > 8;
  }, [method, scores]);

  // Assignar valor do Standard Array
  const assignStandardArrayValue = useCallback((ability: AbilityScoreKey, value: number) => {
    if (method !== 'standard-array') return;

    // Remover o valor de qualquer habilidade que já o tenha
    const newAssigned = { ...standardArrayAssigned };
    Object.keys(newAssigned).forEach(key => {
      if (newAssigned[key as AbilityScoreKey] === value) {
        newAssigned[key as AbilityScoreKey] = null;
      }
    });

    // Assignar o novo valor
    newAssigned[ability] = value;
    setStandardArrayAssigned(newAssigned);

    // Atualizar scores
    const newScores = { ...INITIAL_SCORES };
    Object.entries(newAssigned).forEach(([key, val]) => {
      if (val !== null) {
        newScores[key as AbilityScoreKey] = val;
      }
    });
    setScores(newScores);
  }, [method, standardArrayAssigned]);

  // Gerar scores aleatórios
  const rollAbilityScores = useCallback(() => {
    const rollOneStat = () => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    const newRolledScores = Array.from({ length: 6 }, rollOneStat);
    setRolledScores(newRolledScores);

    // Assignar automaticamente aos atributos
    const newScores: AbilityScores = {
      strength: newRolledScores[0],
      dexterity: newRolledScores[1],
      constitution: newRolledScores[2],
      intelligence: newRolledScores[3],
      wisdom: newRolledScores[4],
      charisma: newRolledScores[5],
    };
    setScores(newScores);
  }, []);

  // Trocar método
  const changeMethod = useCallback((newMethod: AbilityMethod) => {
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
    } else if (newMethod === 'roll') {
      rollAbilityScores();
    }
  }, [rollAbilityScores]);

  // Validação
  const isValid = useMemo(() => {
    if (method === 'point-buy') {
      return pointsUsed <= maxPoints;
    } else if (method === 'standard-array') {
      return Object.values(standardArrayAssigned).every(val => val !== null);
    } else if (method === 'roll') {
      return rolledScores.length === 6;
    }
    return false;
  }, [method, pointsUsed, maxPoints, standardArrayAssigned, rolledScores]);

  // Reset
  const reset = useCallback(() => {
    setMethod('point-buy');
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
    setRolledScores([]);
  }, []);

  // Helpers
  const getRemainingPoints = useMemo(() => {
    return maxPoints - pointsUsed;
  }, [maxPoints, pointsUsed]);

  const getAvailableStandardArrayValues = useMemo(() => {
    const assigned = Object.values(standardArrayAssigned).filter(val => val !== null);
    return STANDARD_ARRAY.filter(val => !assigned.includes(val));
  }, [standardArrayAssigned]);

  return {
    // State
    method,
    scores,
    pointsUsed,
    standardArrayAssigned,
    rolledScores,
    modifiers,
    
    // Actions
    updateScore,
    incrementScore,
    decrementScore,
    assignStandardArrayValue,
    rollAbilityScores,
    changeMethod,
    
    // Validation
    canIncrement,
    canDecrement,
    isValid,
    
    // Utils
    reset,
    
    // Computed values
    remainingPoints: getRemainingPoints,
    availableStandardArrayValues: getAvailableStandardArrayValues,
    
    // Constants
    maxPoints,
    standardArray: STANDARD_ARRAY,
    pointBuyCosts: POINT_BUY_COSTS,
  };
};