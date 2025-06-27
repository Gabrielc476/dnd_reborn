// ===========================
// ABILITY SCORES STEP - VERSÃO CORRIGIDA
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
  Target
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
  
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white">{abilityName}</h3>
        <p className="text-sm text-white/70">{abilityAbbr}</p>
      </div>

      {/* Score Display */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-white mb-2">
          {finalScore}
        </div>
        
        {/* Breakdown */}
        <div className="text-sm text-white/70 space-y-1">
          <div>Base: {baseScore}</div>
          {racialBonus > 0 && (
            <div className="text-green-400">
              Racial: +{racialBonus}
            </div>
          )}
          <div className="text-blue-400">
            Mod: {modifier >= 0 ? "+" : ""}{modifier}
          </div>
        </div>
      </div>

      {/* Controls */}
      {method !== "roll" && (
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={() => onAdjust(-1)}
            disabled={!canDecrease}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              canDecrease
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
          </button>
          
          <span className="text-white font-mono text-lg w-8 text-center">
            {baseScore}
          </span>
          
          <button
            onClick={() => onAdjust(1)}
            disabled={!canIncrease}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              canIncrease
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
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
    getCombinedAbilityBonuses, // ✅ Retorna Record<keyof AbilityScores, number>
    getAbilityModifier,
    generateRandomAbilityScores,
    calculateAbilityScorePoints
  } = useCharacterCreationContext();

  const [method, setMethod] = useState<AbilityMethod>(characterData.abilityMethod);

  // ===========================
  // USAR FUNÇÃO CORRETAMENTE - OBJETO, NÃO ARRAY
  // ===========================
  
  // getCombinedAbilityBonuses() retorna um objeto, não um array
  const racialBonuses = getCombinedAbilityBonuses(); // { strength: 0, dexterity: 2, ... }
  
  // Para point buy system
  const pointsUsed = calculateAbilityScorePoints(characterData.abilityScores);
  const maxPoints = 27;
  const remainingPoints = maxPoints - pointsUsed;

  // ===========================
  // ABILITY SCORE ADJUSTMENTS
  // ===========================

  const adjustAbilityScore = (ability: keyof AbilityScores, delta: number) => {
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

  // ===========================
  // CALCULATE FINAL STATS
  // ===========================

  const calculateFinalStats = () => {
    const stats = {
      totalScore: 0,
      totalModifier: 0,
      highestScore: 0,
      lowestScore: 20,
      averageScore: 0,
    };

    Object.entries(characterData.abilityScores).forEach(([ability, baseScore]) => {
      const racialBonus = racialBonuses[ability as keyof AbilityScores] || 0;
      const finalScore = baseScore + racialBonus;
      const modifier = getAbilityModifier(finalScore);
      
      stats.totalScore += finalScore;
      stats.totalModifier += modifier;
      stats.highestScore = Math.max(stats.highestScore, finalScore);
      stats.lowestScore = Math.min(stats.lowestScore, finalScore);
    });

    stats.averageScore = Math.round(stats.totalScore / 6);
    
    return stats;
  };

  const finalStats = calculateFinalStats();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Method Selection */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-6">
          <Calculator className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Método de Geração</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Standard Array */}
          <div
            onClick={() => handleMethodChange("standard")}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              method === "standard"
                ? 'bg-yellow-600/20 border-yellow-400 ring-2 ring-yellow-400/50'
                : 'bg-white/5 border-white/20 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Array Padrão</h3>
            </div>
            <p className="text-white/70 text-sm mb-2">
              Use valores predefinidos: 15, 14, 13, 12, 10, 8
            </p>
            <p className="text-white/50 text-xs">
              Recomendado para iniciantes
            </p>
          </div>

          {/* Point Buy */}
          <div
            onClick={() => handleMethodChange("point_buy")}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              method === "point_buy"
                ? 'bg-blue-600/20 border-blue-400 ring-2 ring-blue-400/50'
                : 'bg-white/5 border-white/20 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Compra por Pontos</h3>
            </div>
            <p className="text-white/70 text-sm mb-2">
              Distribua 27 pontos entre os atributos
            </p>
            <p className="text-white/50 text-xs">
              Máxima customização
            </p>
          </div>

          {/* Roll Dice */}
          <div
            onClick={() => handleMethodChange("roll")}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              method === "roll"
                ? 'bg-green-600/20 border-green-400 ring-2 ring-green-400/50'
                : 'bg-white/5 border-white/20 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Dice1 className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-white">Rolar Dados</h3>
            </div>
            <p className="text-white/70 text-sm mb-2">
              4d6, remove o menor (aleatório)
            </p>
            <p className="text-white/50 text-xs">
              Mais emocionante e imprevisível
            </p>
          </div>
        </div>

        {/* Method-specific controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {method === "point_buy" && (
              <div className="text-white">
                <span className="text-white/70">Pontos: </span>
                <span className={`font-bold ${remainingPoints < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {pointsUsed} / {maxPoints}
                </span>
                <span className="text-white/50 text-sm ml-2">
                  ({remainingPoints} restantes)
                </span>
              </div>
            )}

            {method === "roll" && (
              <div className="text-white/70 text-sm">
                Clique em "Rolar Novamente" para gerar novos valores
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            {method === "roll" && (
              <button
                onClick={rollRandomScores}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Dice1 className="w-4 h-4" />
                <span>Rolar Novamente</span>
              </button>
            )}

            <button
              onClick={resetToStandard}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Resetar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ability Scores Grid */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Pontuação de Atributos</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {Object.entries(characterData.abilityScores).map(([ability, baseScore]) => {
            const abilityKey = ability as keyof AbilityScores;
            const racialBonus = racialBonuses[abilityKey] || 0; // ✅ Acesso correto ao objeto
            const finalScore = baseScore + racialBonus;
            const modifier = getAbilityModifier(finalScore);

            return (
              <AbilityScoreCard
                key={ability}
                ability={abilityKey}
                baseScore={baseScore}
                racialBonus={racialBonus}
                finalScore={finalScore}
                modifier={modifier}
                onAdjust={(delta) => adjustAbilityScore(abilityKey, delta)}
                canIncrease={canIncrease(abilityKey)}
                canDecrease={canDecrease(abilityKey)}
                method={method}
              />
            );
          })}
        </div>
      </div>

      {/* Racial Bonuses Display */}
      {Object.values(racialBonuses).some(bonus => bonus > 0) && (
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-400/30">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-bold text-white">Bônus Raciais</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(racialBonuses).map(([ability, bonus]) => (
              bonus > 0 && (
                <div key={ability} className="flex items-center justify-between p-3 bg-green-600/20 rounded-lg">
                  <span className="text-white font-medium">
                    {ABILITY_SCORE_NAMES[ability as keyof AbilityScores]}
                  </span>
                  <span className="text-green-400 font-bold">
                    +{bonus}
                  </span>
                </div>
              )
            ))}
          </div>

          <div className="mt-4 text-sm text-white/70">
            {characterData.selectedRace && (
              <span>De <strong>{characterData.selectedRace.name}</strong></span>
            )}
            {characterData.selectedSubrace && (
              <span> e <strong>{characterData.selectedSubrace.name}</strong></span>
            )}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <Info className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Resumo dos Atributos</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{finalStats.totalScore}</div>
            <div className="text-sm text-white/70">Total</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {finalStats.totalModifier >= 0 ? "+" : ""}{finalStats.totalModifier}
            </div>
            <div className="text-sm text-white/70">Mod. Total</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{finalStats.averageScore}</div>
            <div className="text-sm text-white/70">Média</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {finalStats.highestScore}/{finalStats.lowestScore}
            </div>
            <div className="text-sm text-white/70">Maior/Menor</div>
          </div>
        </div>

        {/* Point Buy Warning */}
        {method === "point_buy" && remainingPoints < 0 && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-400/30 rounded-lg">
            <p className="text-red-300 text-sm">
              ⚠️ Você excedeu o limite de pontos! Remova {Math.abs(remainingPoints)} pontos.
            </p>
          </div>
        )}

        {/* Validation Status */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Status dos atributos:</span>
            
            {method !== "point_buy" || remainingPoints >= 0 ? (
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">Válido</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Excede limite</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}