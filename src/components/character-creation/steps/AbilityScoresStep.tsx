// ===========================
// ABILITY SCORES STEP - ATUALIZADO PARA USAR NOVOS HOOKS
// src/components/character-creation/steps/AbilityScoresStep.tsx
// ===========================

"use client";

import { useState, useMemo } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { 
  Zap, 
  Plus, 
  Minus, 
  RotateCcw, 
  Info, 
  Dice6,
  Target,
  Shield,
  Heart,
  Brain,
  Eye,
  Users
} from "lucide-react";
import { AbilityScores, AbilityScoreKey } from "@/types/characterCreation";

// ===========================
// CONFIGURAÇÕES DAS HABILIDADES
// ===========================

const ABILITY_INFO = {
  strength: {
    name: 'Força',
    icon: Zap,
    color: 'from-red-500 to-red-600',
    description: 'Medida do poder físico',
    examples: 'Atletismo, escalar, saltar, nadar'
  },
  dexterity: {
    name: 'Destreza',
    icon: Target,
    color: 'from-green-500 to-green-600',
    description: 'Medida de agilidade',
    examples: 'Acrobacia, furtividade, prestidigitação'
  },
  constitution: {
    name: 'Constituição',
    icon: Shield,
    color: 'from-orange-500 to-orange-600',
    description: 'Medida de resistência',
    examples: 'Pontos de vida, resistência a venenos'
  },
  intelligence: {
    name: 'Inteligência',
    icon: Brain,
    color: 'from-blue-500 to-blue-600',
    description: 'Medida de raciocínio',
    examples: 'Arcanismo, história, investigação'
  },
  wisdom: {
    name: 'Sabedoria',
    icon: Eye,
    color: 'from-purple-500 to-purple-600',
    description: 'Medida de percepção',
    examples: 'Percepção, intuição, medicina'
  },
  charisma: {
    name: 'Carisma',
    icon: Users,
    color: 'from-pink-500 to-pink-600',
    description: 'Medida de força de personalidade',
    examples: 'Persuasão, enganação, intimidação'
  }
};

const ABILITY_METHODS = [
  {
    id: 'point-buy' as const,
    name: 'Compra de Pontos',
    description: 'Distribua 27 pontos entre as habilidades (8-15)',
    icon: Target
  },
  {
    id: 'standard' as const,
    name: 'Array Padrão',
    description: 'Use os valores padrão: 15, 14, 13, 12, 10, 8',
    icon: Shield
  },
  {
    id: 'rolled' as const,
    name: 'Rolagem',
    description: 'Role 4d6, descarte o menor (simulado)',
    icon: Dice6
  }
];

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

export default function AbilityScoresStep() {
  const {
    characterData,
    updateCharacterField,
    updateAbilityScore,
    getCombinedAbilityBonuses,
    calculateModifier,
  } = useCharacterCreationContext();

  const [showInfo, setShowInfo] = useState<string | null>(null);

  // ===========================
  // COMPUTED VALUES
  // ===========================

  const abilityBonuses = getCombinedAbilityBonuses;
  
  const finalScores = useMemo(() => {
    const final: Record<keyof AbilityScores, number> = {} as any;
    
    Object.keys(characterData.abilityScores).forEach(ability => {
      const abilityKey = ability as keyof AbilityScores;
      final[abilityKey] = characterData.abilityScores[abilityKey] + (abilityBonuses[abilityKey] || 0);
    });
    
    return final;
  }, [characterData.abilityScores, abilityBonuses]);

  const pointBuyCost = useMemo(() => {
    if (characterData.abilityMethod !== 'point-buy') return 0;
    
    let totalCost = 0;
    Object.values(characterData.abilityScores).forEach(score => {
      if (score <= 13) {
        totalCost += score - 8;
      } else if (score === 14) {
        totalCost += 7;
      } else if (score === 15) {
        totalCost += 9;
      }
    });
    
    return totalCost;
  }, [characterData.abilityScores, characterData.abilityMethod]);

  const remainingPoints = 27 - pointBuyCost;

  // ===========================
  // HANDLERS
  // ===========================

  const handleMethodChange = (method: 'point-buy' | 'standard' | 'rolled') => {
    updateCharacterField('abilityMethod', method);
    
    // Reset scores based on method
    if (method === 'standard') {
      const standardArray = [15, 14, 13, 12, 10, 8];
      const abilities: (keyof AbilityScores)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
      
      abilities.forEach((ability, index) => {
        updateAbilityScore(ability, standardArray[index]);
      });
    } else if (method === 'point-buy') {
      // Reset to base values
      const abilities: (keyof AbilityScores)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
      abilities.forEach(ability => {
        updateAbilityScore(ability, 8);
      });
    } else if (method === 'rolled') {
      // Simulate rolling 4d6 drop lowest
      const abilities: (keyof AbilityScores)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
      abilities.forEach(ability => {
        const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
        rolls.sort((a, b) => b - a);
        const score = rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
        updateAbilityScore(ability, score);
      });
    }
  };

  const canIncreaseAbility = (ability: keyof AbilityScores): boolean => {
    if (characterData.abilityMethod !== 'point-buy') return false;
    
    const currentScore = characterData.abilityScores[ability];
    if (currentScore >= 15) return false;
    
    const costToIncrease = currentScore === 13 ? 2 : 1;
    return remainingPoints >= costToIncrease;
  };

  const canDecreaseAbility = (ability: keyof AbilityScores): boolean => {
    if (characterData.abilityMethod !== 'point-buy') return false;
    return characterData.abilityScores[ability] > 8;
  };

  const handleAbilityChange = (ability: keyof AbilityScores, delta: number) => {
    if (characterData.abilityMethod !== 'point-buy') return;
    
    const currentScore = characterData.abilityScores[ability];
    const newScore = Math.max(8, Math.min(15, currentScore + delta));
    
    // Check if we can afford the change
    if (delta > 0 && !canIncreaseAbility(ability)) return;
    if (delta < 0 && !canDecreaseAbility(ability)) return;
    
    updateAbilityScore(ability, newScore);
  };

  // ===========================
  // ABILITY CARD COMPONENT
  // ===========================

  const AbilityCard = ({ ability }: { ability: keyof AbilityScores }) => {
    const info = ABILITY_INFO[ability];
    const AbilityIcon = info.icon;
    const baseScore = characterData.abilityScores[ability];
    const bonus = abilityBonuses[ability] || 0;
    const finalScore = finalScores[ability];
    const modifier = calculateModifier(finalScore);
    const isPointBuy = characterData.abilityMethod === 'point-buy';

    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${info.color}`}>
              <AbilityIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{info.name}</h3>
              <p className="text-xs text-gray-400">{info.description}</p>
            </div>
          </div>

          <button
            onClick={() => setShowInfo(showInfo === ability ? null : ability)}
            className="p-1 rounded hover:bg-gray-700/50 transition-colors"
          >
            <Info className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Info expandida */}
        {showInfo === ability && (
          <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
            <p className="text-sm text-gray-300">{info.examples}</p>
          </div>
        )}

        {/* Score Display */}
        <div className="flex items-center justify-center space-x-4">
          {/* Decrease Button */}
          {isPointBuy && (
            <button
              onClick={() => handleAbilityChange(ability, -1)}
              disabled={!canDecreaseAbility(ability)}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4 text-red-400" />
            </button>
          )}

          {/* Score Box */}
          <div className="flex-1 max-w-32">
            <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-600/30">
              <div className="space-y-2">
                {/* Base Score */}
                <div className="text-2xl font-bold text-white">
                  {baseScore}
                  {bonus > 0 && (
                    <span className="text-sm text-green-400 ml-1">+{bonus}</span>
                  )}
                </div>
                
                {/* Final Score (if different) */}
                {bonus > 0 && (
                  <div className="text-lg font-semibold text-blue-400">
                    = {finalScore}
                  </div>
                )}
                
                {/* Modifier */}
                <div className="text-sm text-gray-400">
                  Mod: {modifier >= 0 ? '+' : ''}{modifier}
                </div>
              </div>
            </div>
          </div>

          {/* Increase Button */}
          {isPointBuy && (
            <button
              onClick={() => handleAbilityChange(ability, 1)}
              disabled={!canIncreaseAbility(ability)}
              className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4 text-green-400" />
            </button>
          )}
        </div>

        {/* Point Cost (Point Buy only) */}
        {isPointBuy && (
          <div className="text-center">
            <span className="text-xs text-gray-500">
              Custo: {baseScore <= 13 ? baseScore - 8 : baseScore === 14 ? 7 : 9} pontos
            </span>
          </div>
        )}
      </div>
    );
  };

  // ===========================
  // RENDER PRINCIPAL
  // ===========================

  return (
    <div className="space-y-8">
      {/* Method Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Método de Geração</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ABILITY_METHODS.map((method) => {
            const isSelected = characterData.abilityMethod === method.id;
            const MethodIcon = method.icon;
            
            return (
              <div
                key={method.id}
                onClick={() => handleMethodChange(method.id)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-400/50 shadow-lg shadow-blue-500/25'
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'bg-gray-700/50 text-gray-400'
                  }`}>
                    <MethodIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      isSelected ? 'text-blue-300' : 'text-white'
                    }`}>
                      {method.name}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {method.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Point Buy Status */}
      {characterData.abilityMethod === 'point-buy' && (
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Pontos de Habilidade</h4>
              <p className="text-sm text-gray-400">
                Distribua pontos entre as habilidades (custo: 8-13 = 1:1, 14 = 7, 15 = 9)
              </p>
            </div>
            
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                remainingPoints > 0 ? 'text-blue-400' : 
                remainingPoints === 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {remainingPoints}
              </div>
              <div className="text-sm text-gray-500">restantes</div>
            </div>
          </div>
          
          {remainingPoints < 0 && (
            <div className="mt-3 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
              <p className="text-sm text-red-300">
                Você excedeu o limite de pontos! Reduza algumas habilidades.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Ability Scores Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Pontuações de Habilidade</h3>
          
          {characterData.abilityMethod === 'rolled' && (
            <button
              onClick={() => handleMethodChange('rolled')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Rolar Novamente</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Object.keys(ABILITY_INFO) as (keyof AbilityScores)[]).map((ability) => (
            <AbilityCard key={ability} ability={ability} />
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h4 className="font-medium text-white mb-4">Resumo das Habilidades</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {(Object.keys(ABILITY_INFO) as (keyof AbilityScores)[]).map((ability) => {
            const info = ABILITY_INFO[ability];
            const finalScore = finalScores[ability];
            const modifier = calculateModifier(finalScore);
            
            return (
              <div key={ability} className="flex justify-between items-center">
                <span className="text-gray-400">{info.name}:</span>
                <span className="text-white font-medium">
                  {finalScore} ({modifier >= 0 ? '+' : ''}{modifier})
                </span>
              </div>
            );
          })}
        </div>

        {/* Total Modifier */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total de Modificadores:</span>
            <span className="text-blue-400 font-semibold">
              {Object.values(finalScores).reduce((sum, score) => sum + calculateModifier(score), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}