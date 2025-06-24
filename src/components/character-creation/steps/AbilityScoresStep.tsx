"use client";

import { useState } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Zap,
  Dices,
  Calculator,
  RefreshCw,
  Plus,
  Minus,
  Info,
} from "lucide-react";
import { AbilityScores } from "@/types/characterCreation";

const ABILITY_INFO = {
  strength: {
    name: "Força",
    short: "FOR",
    description: "Poder físico, atletismo, ataques corpo a corpo",
    icon: "💪",
    color: "from-red-500 to-red-600",
  },
  dexterity: {
    name: "Destreza",
    short: "DES",
    description: "Agilidade, reflexos, CA, ataques à distância",
    icon: "🏃",
    color: "from-green-500 to-green-600",
  },
  constitution: {
    name: "Constituição",
    short: "CON",
    description: "Saúde, resistência, pontos de vida",
    icon: "❤️",
    color: "from-orange-500 to-orange-600",
  },
  intelligence: {
    name: "Inteligência",
    short: "INT",
    description: "Raciocínio, memória, conhecimento",
    icon: "🧠",
    color: "from-blue-500 to-blue-600",
  },
  wisdom: {
    name: "Sabedoria",
    short: "SAB",
    description: "Percepção, intuição, vontade",
    icon: "👁️",
    color: "from-purple-500 to-purple-600",
  },
  charisma: {
    name: "Carisma",
    short: "CAR",
    description: "Força de personalidade, liderança",
    icon: "⭐",
    color: "from-pink-500 to-pink-600",
  },
};

const POINT_BUY_COSTS = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export default function AbilityScoresStep() {
  const {
    characterData,
    updateCharacterData,
    getAbilityModifier,
    calculateAbilityScorePoints,
    generateRandomAbilityScores,
    getCombinedAbilityBonuses,
  } = useCharacterCreationContext();

  const handleMethodChange = (method: "standard" | "point_buy" | "roll") => {
    let newScores: AbilityScores;

    switch (method) {
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
      case "point_buy":
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
      abilityMethod: method,
      abilityScores: newScores,
    });
  };

  const adjustAbilityScore = (ability: keyof AbilityScores, delta: number) => {
    const current = characterData.abilityScores[ability];
    const newValue = Math.max(3, Math.min(20, current + delta));

    updateCharacterData({
      abilityScores: {
        ...characterData.abilityScores,
        [ability]: newValue,
      },
    });
  };

  const canAdjustUp = (ability: keyof AbilityScores): boolean => {
    if (characterData.abilityMethod !== "point_buy") return true;

    const current = characterData.abilityScores[ability];
    if (current >= 15) return false;

    const currentPoints = calculateAbilityScorePoints(
      characterData.abilityScores
    );
    const costDifference =
      (POINT_BUY_COSTS[(current + 1) as keyof typeof POINT_BUY_COSTS] || 0) -
      (POINT_BUY_COSTS[current as keyof typeof POINT_BUY_COSTS] || 0);

    return currentPoints + costDifference <= 27;
  };

  const canAdjustDown = (ability: keyof AbilityScores): boolean => {
    if (characterData.abilityMethod !== "point_buy") return true;
    return characterData.abilityScores[ability] > 8;
  };

  const totalPoints = calculateAbilityScorePoints(characterData.abilityScores);
  const remainingPoints = 27 - totalPoints;

  // Get combined bonuses from race and subrace
  const combinedBonuses = getCombinedAbilityBonuses();

  const applyRacialBonuses = () => {
    const bonusedScores = { ...characterData.abilityScores };

    // Apply all combined bonuses (race + subrace)
    combinedBonuses.forEach((bonus) => {
      const abilityKey = bonus.ability_score.index as keyof AbilityScores;
      if (abilityKey in bonusedScores) {
        bonusedScores[abilityKey] += bonus.bonus;
      }
    });

    return bonusedScores;
  };

  const finalScores = applyRacialBonuses();

  // Helper function to get total bonus for an ability
  const getTotalBonusForAbility = (ability: keyof AbilityScores): number => {
    return combinedBonuses
      .filter((bonus) => bonus.ability_score.index === ability)
      .reduce((total, bonus) => total + bonus.bonus, 0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Atributos</h2>
        <p className="text-purple-200">
          Defina os valores dos atributos do seu personagem
        </p>
      </div>

      {/* Top Section: Method Selection + Point Counter */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Method Selection */}
        <div className="xl:col-span-4">
          <Card className="bg-white/5 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">Método de Distribuição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant={
                    characterData.abilityMethod === "standard"
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleMethodChange("standard")}
                  className="h-auto p-4 text-left flex flex-col items-start space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-5 h-5" />
                    <span className="font-semibold">Array Padrão</span>
                  </div>
                  <p className="text-xs opacity-80">
                    15, 14, 13, 12, 10, 8 - Balanceado
                  </p>
                </Button>

                <Button
                  variant={
                    characterData.abilityMethod === "point_buy"
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleMethodChange("point_buy")}
                  className="h-auto p-4 text-left flex flex-col items-start space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold">Compra de Pontos</span>
                  </div>
                  <p className="text-xs opacity-80">27 pontos para distribuir</p>
                </Button>

                <Button
                  variant={
                    characterData.abilityMethod === "roll" ? "default" : "outline"
                  }
                  onClick={() => handleMethodChange("roll")}
                  className="h-auto p-4 text-left flex flex-col items-start space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <Dices className="w-5 h-5" />
                    <span className="font-semibold">Rolagem</span>
                  </div>
                  <p className="text-xs opacity-80">4d6, descarte o menor</p>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Point Counter */}
        {characterData.abilityMethod === "point_buy" && (
          <div className="xl:col-span-1">
            <Card className="bg-blue-500/20 border-blue-400/30 h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="text-blue-200 text-sm mb-2">Pontos Restantes</div>
                <div
                  className={`text-4xl font-bold ${
                    remainingPoints === 0
                      ? "text-green-400"
                      : remainingPoints < 0
                      ? "text-red-400"
                      : "text-blue-400"
                  }`}
                >
                  {remainingPoints}
                </div>
                <div className="text-blue-200 text-xs mt-1">de 27</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Main Content: Ability Scores in Horizontal Grid */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Valores dos Atributos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
            {(Object.keys(ABILITY_INFO) as Array<keyof AbilityScores>).map(
              (ability) => {
                const info = ABILITY_INFO[ability];
                const baseScore = characterData.abilityScores[ability];
                const finalScore = finalScores[ability];
                const modifier = getAbilityModifier(finalScore);
                const totalBonus = getTotalBonusForAbility(ability);
                const hasRacialBonus = totalBonus > 0;

                return (
                  <div key={ability} className="space-y-3">
                    {/* Header with Icon */}
                    <div className="text-center">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl mb-2`}
                      >
                        <span className="text-xl">{info.icon}</span>
                      </div>
                      <h3 className="text-white font-semibold text-sm">{info.short}</h3>
                      <p className="text-purple-200 text-xs leading-tight">
                        {info.name}
                      </p>
                    </div>

                    {/* Score Display */}
                    <div className="text-center">
                      <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                        <div className="flex items-center justify-center space-x-1">
                          <span className="text-2xl font-bold text-white">
                            {baseScore}
                          </span>
                          {hasRacialBonus && (
                            <span className="text-green-400 text-lg font-bold">
                              +{totalBonus}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-purple-200 mt-1">
                          {hasRacialBonus ? `Final: ${finalScore}` : 'Base'}
                        </div>
                      </div>
                    </div>

                    {/* Modifier */}
                    <div className="text-center">
                      <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-2">
                        <div className="text-purple-200 text-xs">Mod</div>
                        <div className="text-white font-bold text-lg">
                          {modifier >= 0 ? "+" : ""}
                          {modifier}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => adjustAbilityScore(ability, -1)}
                        disabled={!canAdjustDown(ability)}
                        className="w-7 h-7 p-0 bg-white/5 border border-white/20 text-white hover:bg-white/10"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => adjustAbilityScore(ability, 1)}
                        disabled={!canAdjustUp(ability)}
                        className="w-7 h-7 p-0 bg-white/5 border border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section: Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Combined Racial Bonuses Info */}
        {combinedBonuses.length > 0 && (
          <Card className="bg-green-500/10 border-green-400/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-200 text-lg flex items-center space-x-2">
                <Info className="w-5 h-5 text-green-400" />
                <span>Bônus Raciais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {characterData.selectedRace && (
                  <div>
                    <p className="text-green-200 font-medium text-sm">
                      {characterData.selectedRace.name}:
                    </p>
                    <p className="text-green-100 text-sm">
                      {characterData.selectedRace.ability_bonuses
                        .map(
                          (bonus) =>
                            `+${bonus.bonus} ${bonus.ability_score.name}`
                        )
                        .join(", ")}
                    </p>
                  </div>
                )}
                {characterData.selectedSubrace && (
                  <div>
                    <p className="text-green-200 font-medium text-sm">
                      {characterData.selectedSubrace.name}:
                    </p>
                    <p className="text-green-100 text-sm">
                      {characterData.selectedSubrace.ability_bonuses
                        .map(
                          (bonus) =>
                            `+${bonus.bonus} ${bonus.ability_score.name}`
                        )
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-green-400/20">
                <p className="text-green-100 text-sm font-bold">
                  Total: {combinedBonuses
                    .map(
                      (bonus) => `+${bonus.bonus} ${bonus.ability_score.name}`
                    )
                    .join(", ")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions and Info */}
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {characterData.abilityMethod === "roll" && (
              <Button
                onClick={() =>
                  updateCharacterData({
                    abilityScores: generateRandomAbilityScores(),
                  })
                }
                className="w-full bg-white/5 border border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Rolar Novamente
              </Button>
            )}
            
            <div className="text-center">
              <p className="text-purple-200 text-sm">
                {characterData.abilityMethod === "standard" && 
                  "Usando array padrão balanceado"}
                {characterData.abilityMethod === "point_buy" && 
                  `Distribua ${remainingPoints} pontos restantes`}
                {characterData.abilityMethod === "roll" && 
                  "Valores rolados aleatoriamente"}
              </p>
            </div>

            {/* Ability Descriptions */}
            <div className="space-y-2 mt-4">
              <p className="text-purple-200 text-xs font-medium">Lembre-se:</p>
              {Object.values(ABILITY_INFO).map((info, index) => (
                <p key={index} className="text-purple-100 text-xs">
                  <span className="font-medium">{info.short}:</span> {info.description}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}