import React, { useState, useMemo } from 'react';
import { useCharacterCreationContext } from '@/hooks/useCharacterCreation';
import { AbilityScores } from '@/types/characterCreation';
import { 
  Target, 
  Shield, 
  Dice6, 
  Zap, 
  Heart, 
  Brain, 
  Eye, 
  Sparkles,
  Sword,
  Plus,
  Minus,
  Info
} from 'lucide-react';

// ===========================
// CONSTANTS
// ===========================

const ABILITY_INFO = {
  strength: {
    name: 'Força',
    description: 'Poder físico',
    icon: Sword,
    color: 'from-red-500 to-red-600',
    examples: 'Atletismo, saltos, escalada, levantamento de peso, ataques corpo a corpo'
  },
  dexterity: {
    name: 'Destreza',
    description: 'Agilidade',
    icon: Target,
    color: 'from-green-500 to-green-600',
    examples: 'Acrobacia, furtividade, prestidigitação, ataques à distância, reflexos'
  },
  constitution: {
    name: 'Constituição',
    description: 'Resistência',
    icon: Heart,
    color: 'from-orange-500 to-orange-600',
    examples: 'Pontos de vida, resistência física, concentração, resistir a doenças'
  },
  intelligence: {
    name: 'Inteligência',
    description: 'Raciocínio',
    icon: Brain,
    color: 'from-blue-500 to-blue-600',
    examples: 'Conhecimento, lógica, investigação, memória, análise, magias de mago'
  },
  wisdom: {
    name: 'Sabedoria',
    description: 'Percepção',
    icon: Eye,
    color: 'from-purple-500 to-purple-600',
    examples: 'Percepção, intuição, sobrevivência, medicina, magias de clérigo'
  },
  charisma: {
    name: 'Carisma',
    description: 'Força de personalidade',
    icon: Sparkles,
    color: 'from-pink-500 to-pink-600',
    examples: 'Persuasão, enganação, intimidação, liderança, magias de bardo'
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
    id: 'standard-array' as const,
    name: 'Array Padrão',
    description: 'Use os valores padrão: 15, 14, 13, 12, 10, 8',
    icon: Shield
  },
  {
    id: 'roll' as const,
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

  const handleMethodChange = (method: 'point-buy' | 'standard-array' | 'roll') => {
    updateCharacterField('abilityMethod', method);
    
    // Reset scores based on method
    if (method === 'standard-array') {
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
    } else if (method === 'roll') {
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
              <button
                key={method.id}
                onClick={() => handleMethodChange(method.id)}
                className={`p-4 rounded-xl border transition-all duration-200 text-left ${
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
              </button>
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
              <div className="text-sm text-gray-400">
                {remainingPoints === 0 ? 'Completo' : 'Restantes'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ability Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(ABILITY_INFO).map(ability => (
          <AbilityCard key={ability} ability={ability as keyof AbilityScores} />
        ))}
      </div>

      {/* Racial Bonuses Info */}
      {Object.values(abilityBonuses).some(bonus => bonus > 0) && (
        <div className="bg-green-900/20 rounded-xl p-4 border border-green-700/50">
          <h4 className="font-medium text-green-300 mb-2">Bônus Raciais</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(abilityBonuses).map(([ability, bonus]) => (
              bonus > 0 && (
                <div key={ability} className="text-green-400">
                  {ABILITY_INFO[ability as keyof AbilityScores].name}: +{bonus}
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
        <h4 className="font-medium text-white mb-3">Resumo dos Atributos</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {Object.entries(finalScores).map(([ability, score]) => {
            const modifier = calculateModifier(score);
            return (
              <div key={ability} className="flex justify-between">
                <span className="text-gray-400 capitalize">
                  {ABILITY_INFO[ability as keyof AbilityScores].name}
                </span>
                <span className="text-white font-medium">
                  {score} ({modifier >= 0 ? '+' : ''}{modifier})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}