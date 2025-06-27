// ===========================
// ABILITY SCORES STEP - COMPONENTE REFATORADO
// src/components/character-creation/steps/AbilityScoresStep.tsx
// ===========================

"use client";

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
  CheckCircle
} from "lucide-react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { useState } from "react";
import { AbilityScores, ABILITY_SCORE_NAMES, ABILITY_SCORE_ABBREVIATIONS } from "@/types/characterCreation";

type AbilityMethod = "standard" | "point_buy" | "roll";

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

      {/* Roll button para método roll */}
      {method === "roll" && (
        <div className="text-center">
          <button
            onClick={() => onAdjust(0)} // Trigger reroll
            className="w-full px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105"
          >
            <Dice1 className="w-4 h-4" />
            <span>Rolar</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function AbilityScoresStep() {
  const {
    characterData,
    updateCharacterData,
    getCombinedAbilityBonuses,
    getAbilityModifier,
    generateRandomAbilityScores,
    calculateAbilityScorePoints
  } = useCharacterCreationContext();

  const [method, setMethod] = useState<AbilityMethod>(characterData.abilityMethod);

  // getCombinedAbilityBonuses() retorna um objeto, não um array
  const racialBonuses = getCombinedAbilityBonuses();
  
  // Para point buy system
  const pointsUsed = calculateAbilityScorePoints(characterData.abilityScores);
  const maxPoints = 27;
  const remainingPoints = maxPoints - pointsUsed;

  // Point cost table para point buy
  const getPointCost = (score: number): number => {
    const pointCosts: Record<number, number> = {
      8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
    };
    return pointCosts[score] || 0;
  };

  const canIncrease = (ability: keyof AbilityScores): boolean => {
    const currentScore = characterData.abilityScores[ability];
    if (currentScore >= 15) return false;
    
    if (method === "point_buy") {
      const cost = getPointCost(currentScore + 1) - getPointCost(currentScore);
      return pointsUsed + cost <= maxPoints;
    }
    
    return true;
  };

  const canDecrease = (ability: keyof AbilityScores): boolean => {
    return characterData.abilityScores[ability] > 8;
  };

  // ===========================
  // METHOD HANDLERS
  // ===========================

  const handleMethodChange = (newMethod: AbilityMethod) => {
    setMethod(newMethod);
    updateCharacterData({ abilityMethod: newMethod });
    
    if (newMethod === "standard") {
      // Standard array: 15, 14, 13, 12, 10, 8
      updateCharacterData({
        abilityScores: {
          strength: 15,
          dexterity: 14,
          constitution: 13,
          intelligence: 12,
          wisdom: 10,
          charisma: 8,
        }
      });
    } else if (newMethod === "point_buy") {
      // Start with all 8s for point buy
      updateCharacterData({
        abilityScores: {
          strength: 8,
          dexterity: 8,
          constitution: 8,
          intelligence: 8,
          wisdom: 8,
          charisma: 8,
        }
      });
    }
  };

  const rollRandomScores = () => {
    const newScores = generateRandomAbilityScores();
    updateCharacterData({ abilityScores: newScores });
  };

  const resetToStandard = () => {
    updateCharacterData({
      abilityScores: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      }
    });
  };

  const adjustAbilityScore = (ability: keyof AbilityScores, delta: number) => {
    if (method === "roll" && delta === 0) {
      // Special case for rerolling individual ability
      const newScores = generateRandomAbilityScores();
      updateCharacterData({
        abilityScores: {
          ...characterData.abilityScores,
          [ability]: newScores[ability]
        }
      });
      return;
    }

    const currentScore = characterData.abilityScores[ability];
    const newScore = Math.max(8, Math.min(15, currentScore + delta));
    
    // For point buy, check if we have enough points
    if (method === "point_buy" && delta > 0) {
      const cost = getPointCost(newScore) - getPointCost(currentScore);
      if (pointsUsed + cost > maxPoints) {
        return; // Can't afford this increase
      }
    }
    
    updateCharacterData({
      abilityScores: {
        ...characterData.abilityScores,
        [ability]: newScore
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Method Selection */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold text-xl flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span>Método de Determinação</span>
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Standard Array */}
          <div
            onClick={() => handleMethodChange("standard")}
            className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              method === "standard"
                ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/25'
                : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              {method === "standard" && (
                <CheckCircle className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <h4 className="text-white font-semibold mb-2">Array Padrão</h4>
            <p className="text-gray-400 text-sm mb-3">Valores fixos balanceados</p>
            <div className="text-xs text-gray-300 font-mono">
              15, 14, 13, 12, 10, 8
            </div>
          </div>

          {/* Point Buy */}
          <div
            onClick={() => handleMethodChange("point_buy")}
            className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              method === "point_buy"
                ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/25'
                : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              {method === "point_buy" && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
            </div>
            <h4 className="text-white font-semibold mb-2">Compra de Pontos</h4>
            <p className="text-gray-400 text-sm mb-3">27 pontos para distribuir</p>
            <div className="text-xs text-gray-300">
              Customização completa
            </div>
          </div>

          {/* Random Roll */}
          <div
            onClick={() => handleMethodChange("roll")}
            className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              method === "roll"
                ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/25'
                : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Dice1 className="w-5 h-5 text-white" />
              </div>
              {method === "roll" && (
                <CheckCircle className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <h4 className="text-white font-semibold mb-2">Rolagem Aleatória</h4>
            <p className="text-gray-400 text-sm mb-3">4d6, descartar menor</p>
            <div className="text-xs text-gray-300">
              Totalmente aleatório
            </div>
          </div>
        </div>
      </div>

      {/* Point Buy Info */}
      {method === "point_buy" && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Pontos Restantes</span>
            </div>
            <div className={`text-2xl font-bold ${
              remainingPoints >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {remainingPoints}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-300">
            Cada ponto tem um custo diferente. Scores mais altos custam mais pontos.
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {method !== "standard" && (
        <div className="flex flex-wrap gap-3">
          {method === "roll" && (
            <button
              onClick={rollRandomScores}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-purple-500/25"
            >
              <Dice1 className="w-5 h-5" />
              <span>Rolar Todos</span>
            </button>
          )}
          
          <button
            onClick={resetToStandard}
            className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-all duration-200 flex items-center space-x-2 border border-gray-600/50"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Resetar</span>
          </button>
        </div>
      )}

      {/* Ability Score Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.keys(characterData.abilityScores) as Array<keyof AbilityScores>).map((ability) => {
          const baseScore = characterData.abilityScores[ability];
          const racialBonus = racialBonuses[ability] || 0;
          const finalScore = baseScore + racialBonus;
          const modifier = getAbilityModifier(finalScore);

          return (
            <AbilityScoreCard
              key={ability}
              ability={ability}
              baseScore={baseScore}
              racialBonus={racialBonus}
              finalScore={finalScore}
              modifier={modifier}
              onAdjust={(delta) => adjustAbilityScore(ability, delta)}
              canIncrease={canIncrease(ability)}
              canDecrease={canDecrease(ability)}
              method={method}
            />
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span>Resumo dos Atributos</span>
        </h4>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-gray-300 font-medium mb-3">Modificadores</h5>
            <div className="space-y-2">
              {(Object.keys(characterData.abilityScores) as Array<keyof AbilityScores>).map((ability) => {
                const finalScore = characterData.abilityScores[ability] + (racialBonuses[ability] || 0);
                const modifier = getAbilityModifier(finalScore);
                
                return (
                  <div key={ability} className="flex justify-between text-sm">
                    <span className="text-gray-400">{ABILITY_SCORE_NAMES[ability]}:</span>
                    <span className={`font-medium ${
                      modifier >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {modifier >= 0 ? '+' : ''}{modifier}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h5 className="text-gray-300 font-medium mb-3">Bônus Raciais</h5>
            <div className="space-y-2">
              {(Object.keys(racialBonuses) as Array<keyof AbilityScores>).map((ability) => {
                const bonus = racialBonuses[ability];
                
                return (
                  <div key={ability} className="flex justify-between text-sm">
                    <span className="text-gray-400">{ABILITY_SCORE_NAMES[ability]}:</span>
                    <span className={`font-medium ${
                      bonus > 0 ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {bonus > 0 ? `+${bonus}` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}