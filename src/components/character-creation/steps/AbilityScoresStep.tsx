// ===========================
// ABILITY SCORES STEP - COMPLETO CORRIGIDO
// src/components/character-creation/steps/AbilityScoresStep.tsx
// 
// 🔧 CORREÇÕES APLICADAS:
// - Point-buy validation corrigida
// - Sincronização automática de pontos
// - Interface visual melhorada
// - Sistema de debug implementado
// - Prevenção de loops infinitos
// - Cálculo correto de pontos restantes
// ===========================

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Zap, 
  Dice1, 
  Calculator, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown,
  Info,
  Sparkles,
  Target,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Shuffle
} from "lucide-react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { AbilityScores, ABILITY_SCORE_NAMES, ABILITY_SCORE_ABBREVIATIONS } from "@/types/characterCreation";

// ===========================
// TYPE DEFINITIONS
// ===========================

type AbilityMethod = "standard" | "point-buy" | "roll";

interface AbilityScoreCardProps {
  ability: keyof AbilityScores;
  baseScore: number;
  racialBonus: number;
  finalScore: number;
  modifier: number;
  onAdjust: (delta: number) => void;
  canIncrease: boolean;
  canDecrease: boolean;
  method: AbilityMethod;
}

// ===========================
// ABILITY SCORE CARD COMPONENT
// ===========================

function AbilityScoreCard({
  ability,
  baseScore,
  racialBonus,
  finalScore,
  modifier,
  onAdjust,
  canIncrease,
  canDecrease,
  method
}: AbilityScoreCardProps) {
  const abilityName = ABILITY_SCORE_NAMES[ability];
  const abilityAbbr = ABILITY_SCORE_ABBREVIATIONS[ability];
  
  // Cores diferentes para cada atributo
  const abilityColors = {
    strength: 'from-red-500 to-red-600',
    dexterity: 'from-green-500 to-green-600', 
    constitution: 'from-orange-500 to-orange-600',
    intelligence: 'from-blue-500 to-blue-600',
    wisdom: 'from-purple-500 to-purple-600',
    charisma: 'from-pink-500 to-pink-600'
  };
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-200">
      {/* Header com ícone */}
      <div className="text-center mb-6">
        <div className={`w-12 h-12 bg-gradient-to-br ${abilityColors[ability]} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
          <Zap className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white">{abilityName}</h3>
        <p className="text-sm text-gray-400">{abilityAbbr}</p>
      </div>

      {/* Score Display */}
      <div className="text-center mb-6">
        <div className="relative">
          <div className="text-4xl font-bold text-white mb-2 font-mono">
            {finalScore}
          </div>
          <div className={`text-lg font-semibold ${
            modifier >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {modifier >= 0 ? '+' : ''}{modifier}
          </div>
        </div>
        
        {/* Breakdown */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Base:</span>
            <span className="text-white font-medium">{baseScore}</span>
          </div>
          {racialBonus > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Racial:</span>
              <span className="text-green-400 font-medium">+{racialBonus}</span>
            </div>
          )}
          <div className="border-t border-gray-600/50 pt-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-gray-300">Total:</span>
              <span className="text-white">{finalScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {method !== "roll" && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => onAdjust(-1)}
            disabled={!canDecrease}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              canDecrease
                ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 hover:scale-105 shadow-lg shadow-red-500/25'
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/50'
            }`}
          >
            <Minus className="w-5 h-5" />
          </button>
          
          <div className="text-center min-w-[60px]">
            <div className="text-2xl font-bold text-white font-mono">{baseScore}</div>
            <div className="text-xs text-gray-400">Base</div>
          </div>
          
          <button
            onClick={() => onAdjust(1)}
            disabled={!canIncrease}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              canIncrease
                ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 hover:scale-105 shadow-lg shadow-green-500/25'
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/50'
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Roll button for random method */}
      {method === "roll" && (
        <div className="text-center">
          <button
            onClick={() => onAdjust(0)}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-purple-500/25"
          >
            <Shuffle className="w-4 h-4 inline mr-2" />
            Rolar
          </button>
        </div>
      )}
    </div>
  );
}

// ===========================
// MAIN COMPONENT
// ===========================

export default function AbilityScoresStep() {
  const { 
    characterData, 
    updateCharacterData, 
    generateRandomAbilityScores,
    getAbilityModifier,
    getCombinedAbilityBonuses,
    getFinalAbilityScores,
    calculateAbilityScorePoints,
  } = useCharacterCreationContext();

  const [method, setMethod] = useState<AbilityMethod>(characterData.abilityMethod as AbilityMethod);

  // ===========================
  // POINT CALCULATIONS - CORRIGIDAS
  // ===========================

  // ✅ CORREÇÃO: Tabela de custos correta
  const getPointCost = useCallback((score: number): number => {
    const pointCosts: Record<number, number> = {
      8: 0,   // Base: 8 = 0 pontos
      9: 1,   // 9 = 1 ponto
      10: 2,  // 10 = 2 pontos
      11: 3,  // 11 = 3 pontos
      12: 4,  // 12 = 4 pontos
      13: 5,  // 13 = 5 pontos
      14: 7,  // 14 = 7 pontos (custo aumenta)
      15: 9   // 15 = 9 pontos (custo aumenta)
    };
    return pointCosts[score] || 0;
  }, []);

  // ✅ CORREÇÃO: Cálculo preciso dos pontos usados
  const calculatePointsUsed = useCallback((scores: AbilityScores): number => {
    return Object.values(scores).reduce((total, score) => {
      return total + getPointCost(score);
    }, 0);
  }, [getPointCost]);

  // ✅ SINCRONIZAÇÃO COM O CONTEXTO
  const maxPoints = 27;
  const pointsUsed = calculatePointsUsed(characterData.abilityScores);
  const remainingPoints = maxPoints - pointsUsed;

  // ===========================
  // DERIVED VALUES
  // ===========================

  const racialBonuses = getCombinedAbilityBonuses;
  const finalAbilityScores = getFinalAbilityScores;

  // ===========================
  // POINT-BUY LOGIC - CORRIGIDA
  // ===========================

  // ✅ SINCRONIZAÇÃO AUTOMÁTICA DOS PONTOS
  useEffect(() => {
    if (method === "point-buy") {
      const actualRemaining = maxPoints - calculatePointsUsed(characterData.abilityScores);
      
      if (actualRemaining !== characterData.pointsRemaining) {
        console.log("🔄 Sincronizando pontos no AbilityScoresStep:", {
          calculated: actualRemaining,
          stored: characterData.pointsRemaining
        });
        
        updateCharacterData({
          pointsRemaining: actualRemaining
        });
      }
    }
  }, [characterData.abilityScores, method, characterData.pointsRemaining, updateCharacterData, calculatePointsUsed, maxPoints]);

  // ✅ CORREÇÃO: Verificação de pontos disponíveis
  const handleAbilityScoreChange = useCallback((ability: keyof AbilityScores, delta: number) => {
    if (method === "roll" && delta === 0) {
      const newScores = generateRandomAbilityScores();
      updateCharacterData({
        abilityScores: newScores
      });
      return;
    }

    const currentScore = characterData.abilityScores[ability];
    const newScore = Math.max(8, Math.min(15, currentScore + delta));
    
    if (method === "point-buy") {
      const currentCost = getPointCost(currentScore);
      const newCost = getPointCost(newScore);
      const costDifference = newCost - currentCost;
      
      // ✅ VERIFICAÇÃO CORRETA: usar remainingPoints calculado localmente
      if (remainingPoints - costDifference < 0) {
        console.log("❌ Não há pontos suficientes:", {
          remaining: remainingPoints,
          costDiff: costDifference,
          currentScore,
          newScore
        });
        return;
      }
    }

    const newAbilityScores = {
      ...characterData.abilityScores,
      [ability]: newScore
    };

    // ✅ ATUALIZAR SCORES E PONTOS SIMULTANEAMENTE
    const newPointsRemaining = maxPoints - calculatePointsUsed(newAbilityScores);
    
    updateCharacterData({
      abilityScores: newAbilityScores,
      pointsRemaining: newPointsRemaining
    });
  }, [
    method, 
    characterData.abilityScores, 
    generateRandomAbilityScores, 
    updateCharacterData, 
    getPointCost, 
    remainingPoints, 
    calculatePointsUsed, 
    maxPoints
  ]);

  // ✅ CORREÇÃO: Verificação de botões
  const canModifyScore = useCallback((ability: keyof AbilityScores, delta: number): boolean => {
    if (method !== "point-buy") return true;
    
    const currentScore = characterData.abilityScores[ability];
    const newScore = currentScore + delta;
    
    // Verificar limites
    if (newScore < 8 || newScore > 15) return false;
    
    // Para aumentar, verificar se há pontos
    if (delta > 0) {
      const currentCost = getPointCost(currentScore);
      const newCost = getPointCost(newScore);
      const costDifference = newCost - currentCost;
      return remainingPoints >= costDifference;
    }
    
    // Para diminuir, sempre permitir (acima de 8)
    return newScore >= 8;
  }, [method, characterData.abilityScores, getPointCost, remainingPoints]);

  // ===========================
  // METHOD CHANGE HANDLER
  // ===========================

  const handleMethodChange = useCallback((newMethod: AbilityMethod) => {
    setMethod(newMethod);
    
    let newScores: AbilityScores;
    
    switch (newMethod) {
      case "standard":
        newScores = {
          strength: 15,
          dexterity: 14,
          constitution: 13,
          intelligence: 12,
          wisdom: 10,
          charisma: 8,
        };
        break;
      case "point-buy":
        newScores = {
          strength: 8,
          dexterity: 8,
          constitution: 8,
          intelligence: 8,
          wisdom: 8,
          charisma: 8,
        };
        break;
      case "roll":
        newScores = generateRandomAbilityScores();
        break;
      default:
        newScores = characterData.abilityScores;
    }

    updateCharacterData({
      abilityMethod: newMethod,
      abilityScores: newScores,
      pointsRemaining: newMethod === "point-buy" ? 27 : 0
    });
  }, [generateRandomAbilityScores, updateCharacterData, characterData.abilityScores]);

  // ===========================
  // DEBUG LOGGING
  // ===========================

  useEffect(() => {
    console.log("📊 AbilityScoresStep Debug:", {
      method,
      abilityScores: characterData.abilityScores,
      pointsUsed,
      remainingPoints,
      storedRemaining: characterData.pointsRemaining,
      isValid: remainingPoints === 0 && Object.values(characterData.abilityScores).every(s => s >= 8 && s <= 15)
    });
  }, [characterData.abilityScores, pointsUsed, remainingPoints, method, characterData.pointsRemaining]);

  // ===========================
  // RENDER
  // ===========================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Distribuição de Atributos</h2>
        <p className="text-gray-400 text-lg">
          Defina os valores dos seus atributos básicos
        </p>
      </div>

      {/* Method Selection */}
      <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Target className="w-6 h-6 mr-2 text-blue-400" />
          Método de Distribuição
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => handleMethodChange("standard")}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              method === "standard"
                ? 'border-blue-400 bg-blue-500/20 text-blue-400'
                : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
            }`}
          >
            <Calculator className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold">Array Padrão</div>
            <div className="text-sm opacity-75">15, 14, 13, 12, 10, 8</div>
          </button>
          
          <button
            onClick={() => handleMethodChange("point-buy")}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              method === "point-buy"
                ? 'border-purple-400 bg-purple-500/20 text-purple-400'
                : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
            }`}
          >
            <Sparkles className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold">Point Buy</div>
            <div className="text-sm opacity-75">27 pontos para distribuir</div>
          </button>
          
          <button
            onClick={() => handleMethodChange("roll")}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              method === "roll"
                ? 'border-yellow-400 bg-yellow-500/20 text-yellow-400'
                : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
            }`}
          >
            <Dice1 className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold">Rolar Dados</div>
            <div className="text-sm opacity-75">4d6, descarta menor</div>
          </button>
        </div>
      </div>

      {/* Point Buy Info - MELHORADO */}
      {method === "point-buy" && (
        <div className={`border rounded-xl p-4 ${
          remainingPoints === 0 
            ? 'bg-green-500/10 border-green-500/30' 
            : remainingPoints < 0 
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-purple-500/10 border-purple-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-purple-400" />
              <span className="font-medium">
                {remainingPoints === 0 ? '✅ Todos os pontos gastos!' : 
                 remainingPoints < 0 ? '❌ Pontos excedidos!' : 
                 '📊 Pontos Disponíveis'}
              </span>
            </div>
            <div className="text-2xl font-bold">
              {remainingPoints} / {maxPoints}
            </div>
          </div>
          {remainingPoints < 0 && (
            <div className="text-red-400 text-sm mt-2">
              Você excedeu o limite de pontos! Reduza alguns atributos.
            </div>
          )}
          {remainingPoints === 0 && (
            <div className="text-green-400 text-sm mt-2">
              Perfeito! Todos os pontos foram distribuídos.
            </div>
          )}
        </div>
      )}

      {/* Ability Score Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.keys(characterData.abilityScores) as Array<keyof AbilityScores>).map((ability) => {
          const baseScore = characterData.abilityScores[ability];
          const racialBonus = racialBonuses[ability] || 0;
          const finalScore = baseScore + racialBonus;
          const modifier = getAbilityModifier(finalScore);
          
          // Lógica para habilitar/desabilitar botões
          const canIncrease = canModifyScore(ability, 1);
          const canDecrease = canModifyScore(ability, -1);
          
          return (
            <AbilityScoreCard
              key={ability}
              ability={ability}
              baseScore={baseScore}
              racialBonus={racialBonus}
              finalScore={finalScore}
              modifier={modifier}
              onAdjust={(delta) => handleAbilityScoreChange(ability, delta)}
              canIncrease={canIncrease}
              canDecrease={canDecrease}
              method={method}
            />
          );
        })}
      </div>

      {/* Roll All Button for Random */}
      {method === "roll" && (
        <div className="text-center">
          <button
            onClick={() => {
              const newScores = generateRandomAbilityScores();
              updateCharacterData({ abilityScores: newScores });
            }}
            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-2xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-yellow-500/25"
          >
            <RotateCcw className="w-5 h-5 inline mr-2" />
            Rolar Todos os Atributos
          </button>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Modifiers Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h4 className="text-blue-400 font-semibold mb-3 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Modificadores
          </h4>
          <div className="space-y-2 text-sm">
            <p className="text-gray-300">
              Os <span className="text-blue-400 font-medium">modificadores</span> são calculados como: 
              <span className="font-mono text-white"> (Atributo - 10) ÷ 2</span>
            </p>
            <p className="text-gray-300">
              Eles afetam suas jogadas de ataque, perícias, testes de resistência e muito mais.
            </p>
          </div>
        </div>

        {/* Point Buy Info */}
        {method === "point-buy" && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <h4 className="text-purple-400 font-semibold mb-3 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Custos Point Buy
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { score: 8, cost: 0 }, { score: 9, cost: 1 },
                { score: 10, cost: 2 }, { score: 11, cost: 3 },
                { score: 12, cost: 4 }, { score: 13, cost: 5 },
                { score: 14, cost: 7 }, { score: 15, cost: 9 }
              ].map(({ score, cost }) => (
                <div key={score} className="flex justify-between text-gray-300">
                  <span>{score}:</span>
                  <span className="font-mono text-purple-400">{cost} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standard Array Info */}
        {method === "standard" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <h4 className="text-green-400 font-semibold mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Array Padrão
            </h4>
            <div className="text-sm text-gray-300">
              <p className="mb-2">Valores fixos balanceados:</p>
              <div className="font-mono text-green-400">
                15, 14, 13, 12, 10, 8
              </div>
              <p className="mt-2">Distribua estes valores entre os atributos conforme sua estratégia.</p>
            </div>
          </div>
        )}

        {/* Random Roll Info */}
        {method === "roll" && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h4 className="text-yellow-400 font-semibold mb-3 flex items-center">
              <Dice1 className="w-5 h-5 mr-2" />
              Rolagem de Dados
            </h4>
            <div className="text-sm text-gray-300">
              <p className="mb-2">Cada atributo é determinado por:</p>
              <div className="font-mono text-yellow-400 mb-2">
                4d6, descarta o menor resultado
              </div>
              <p>Resultados variam de 3 a 18, criando personagens únicos e imprevisíveis!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}