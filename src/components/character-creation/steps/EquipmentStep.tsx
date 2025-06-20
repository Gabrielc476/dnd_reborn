"use client";

import { useState, useEffect } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sword,
  Shield,
  Heart,
  Calculator,
  Plus,
  Minus,
  Dices,
  Info,
  TrendingUp,
  BarChart3,
} from "lucide-react";

type HPMethod = "average" | "roll";

export default function EquipmentStep() {
  const { characterData, updateCharacterData, getAbilityModifier } =
    useCharacterCreationContext();

  const [hpMethod, setHpMethod] = useState<HPMethod>("average");
  const [rollResults, setRollResults] = useState<number[]>([]);
  const [initialized, setInitialized] = useState(false);

  const constitutionMod = getAbilityModifier(
    characterData.abilityScores.constitution
  );
  const dexterityMod = getAbilityModifier(
    characterData.abilityScores.dexterity
  );

  // Initialize HP on first load
  useEffect(() => {
    if (
      !initialized &&
      characterData.selectedClass &&
      characterData.hitPoints === 0
    ) {
      const initialHP = calculateAverageHP();
      updateCharacterData({
        hitPoints: initialHP,
        armorClass: calculateBaseAC(),
      });
      setInitialized(true);
    }
  }, [characterData.selectedClass, initialized]);

  // Calculate HP based on different methods
  const calculateAverageHP = () => {
    if (!characterData.selectedClass) return 1;

    const hitDie = characterData.selectedClass.hit_die;
    const baseHP = hitDie + constitutionMod;
    const additionalLevels = characterData.level - 1;
    const avgPerLevel = Math.floor(hitDie / 2) + 1 + constitutionMod;

    return Math.max(1, baseHP + additionalLevels * avgPerLevel);
  };

  const rollForHP = () => {
    if (!characterData.selectedClass) return 1;

    const hitDie = characterData.selectedClass.hit_die;
    const newRolls: number[] = [];

    // First level is always max
    let totalHP = hitDie + constitutionMod;
    newRolls.push(hitDie);

    // Roll for additional levels
    for (let i = 1; i < characterData.level; i++) {
      const roll = Math.floor(Math.random() * hitDie) + 1;
      const hpGain = Math.max(1, roll + constitutionMod); // Minimum 1 HP per level
      totalHP += hpGain;
      newRolls.push(roll);
    }

    setRollResults(newRolls);
    return Math.max(1, totalHP);
  };

  const calculateBaseAC = () => {
    return 10 + dexterityMod;
  };

  const baseAC = calculateBaseAC();

  const adjustAC = (delta: number) => {
    const newAC = Math.max(10, characterData.armorClass + delta);
    updateCharacterData({ armorClass: newAC });
  };

  const applyHPMethod = (method: HPMethod) => {
    setHpMethod(method);

    const calculatedHP =
      method === "average" ? calculateAverageHP() : rollForHP();
    updateCharacterData({ hitPoints: calculatedHP });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4">
          <Sword className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Equipamentos</h2>
        <p className="text-purple-200">
          Configure os pontos de vida, classe de armadura e equipamentos
        </p>
      </div>

      {/* HP Method Selection */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Label className="text-white text-lg font-semibold">
              Método para Calcular Pontos de Vida
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant={hpMethod === "average" ? "default" : "outline"}
                onClick={() => applyHPMethod("average")}
                className="h-auto p-4 text-left flex flex-col items-start space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-semibold text-sm">Média</span>
                </div>
                <p className="text-xs opacity-80">
                  {calculateAverageHP()} HP - Balanceado e previsível
                </p>
              </Button>

              <Button
                variant={hpMethod === "roll" ? "default" : "outline"}
                onClick={() => applyHPMethod("roll")}
                className="h-auto p-4 text-left flex flex-col items-start space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <Dices className="w-5 h-5" />
                  <span className="font-semibold text-sm">Rolagem</span>
                </div>
                <p className="text-xs opacity-80">
                  Rolar dados - Tradicional e aleatório
                </p>
              </Button>
            </div>

            {/* Roll Results Display */}
            {hpMethod === "roll" && rollResults.length > 0 && (
              <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Dices className="w-4 h-4 text-green-400" />
                  <span className="text-green-200 font-medium text-sm">
                    Resultados das Rolagens
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {rollResults.map((roll, index) => (
                    <div
                      key={index}
                      className="bg-black/30 rounded px-2 py-1 text-sm"
                    >
                      <span className="text-gray-300">Nv.{index + 1}:</span>
                      <span className="text-green-400 font-bold ml-1">
                        {index === 0
                          ? characterData.selectedClass?.hit_die
                          : roll}
                        {index === 0 ? " (máx)" : ""}
                      </span>
                      <span className="text-gray-400 text-xs ml-1">
                        +{constitutionMod} CON
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applyHPMethod("roll")}
                  className="mt-3 bg-green-500/20 border-green-400/30 text-green-200 hover:bg-green-500/30"
                >
                  <Dices className="w-4 h-4 mr-2" />
                  Rolar Novamente
                </Button>
              </div>
            )}

            {/* Method Explanation */}
            <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
              <div className="text-blue-200 text-sm">
                {hpMethod === "average" && (
                  <>
                    <strong>Média:</strong> Primeiro nível = d
                    {characterData.selectedClass?.hit_die || "X"} máximo + CON.
                    Níveis seguintes ={" "}
                    {Math.floor(
                      (characterData.selectedClass?.hit_die || 6) / 2
                    ) + 1}{" "}
                    + CON por nível.
                  </>
                )}
                {hpMethod === "roll" && (
                  <>
                    <strong>Rolagem:</strong> Primeiro nível = máximo. Níveis
                    seguintes = 1d{characterData.selectedClass?.hit_die || "X"}{" "}
                    + CON (mín. 1 por nível).
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vital Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hit Points */}
        <Card className="bg-white/5 border-white/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-6 h-6 text-red-400" />
                <Label className="text-white text-lg font-semibold">
                  Pontos de Vida
                </Label>
              </div>

              <div className="text-center space-y-4">
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                  <div className="text-4xl font-bold text-red-400 mb-2">
                    {characterData.hitPoints}
                  </div>
                  <div className="text-red-200 text-sm">HP Atual</div>
                </div>

                {/* Method info display */}
                <div className="bg-black/20 rounded-lg p-3 text-sm">
                  <div className="text-purple-200">
                    {hpMethod === "average" && "Método: Média"}
                    {hpMethod === "roll" && "Método: Rolagem"}
                  </div>
                  <div className="text-white font-medium">
                    Nível {characterData.level} - d
                    {characterData.selectedClass?.hit_die || "X"} + CON
                  </div>
                  <div className="text-gray-300 text-xs mt-1">
                    CON: {constitutionMod >= 0 ? "+" : ""}
                    {constitutionMod}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Armor Class */}
        <Card className="bg-white/5 border-white/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-400" />
                <Label className="text-white text-lg font-semibold">
                  Classe de Armadura
                </Label>
              </div>

              <div className="text-center space-y-4">
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {characterData.armorClass}
                  </div>
                  <div className="text-blue-200 text-sm">CA Atual</div>
                </div>

                <div className="flex items-center justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustAC(-1)}
                    disabled={characterData.armorClass <= 10}
                    className="w-8 h-8 p-0 bg-white/5 border-white/20"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustAC(1)}
                    className="w-8 h-8 p-0 bg-white/5 border-white/20"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="bg-black/20 rounded-lg p-3 text-sm">
                  <div className="text-purple-200">Sem Armadura:</div>
                  <div className="text-white font-medium">{baseAC} CA</div>
                  <div className="text-gray-300 text-xs mt-1">
                    10 + DES ({dexterityMod >= 0 ? "+" : ""}
                    {dexterityMod})
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reset Helper */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-lg font-semibold">
                Recalcular Valores
              </Label>
              <p className="text-purple-200 text-sm">
                Aplique novamente os valores baseados no método selecionado
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  const calculatedHP =
                    hpMethod === "average" ? calculateAverageHP() : rollForHP();
                  updateCharacterData({ hitPoints: calculatedHP });
                }}
                variant="outline"
                size="sm"
                className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
              >
                <Heart className="w-4 h-4 mr-2" />
                Recalcular HP
              </Button>

              <Button
                onClick={() => updateCharacterData({ armorClass: baseAC })}
                variant="outline"
                size="sm"
                className="bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30"
              >
                <Shield className="w-4 h-4 mr-2" />
                Resetar CA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Starting Equipment Info */}
      {characterData.selectedClass && (
        <Card className="bg-white/5 border-white/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Label className="text-white text-lg font-semibold">
                Equipamentos Iniciais ({characterData.selectedClass.name})
              </Label>

              <div className="bg-black/20 rounded-lg p-4">
                <p className="text-purple-200 text-sm mb-3">
                  Equipamentos básicos sugeridos para sua classe:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-medium text-sm mb-2">
                      Armas
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Arma simples de sua escolha</li>
                      <li>• Dardos ou projéteis (20)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-white font-medium text-sm mb-2">
                      Equipamentos
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Mochila de aventureiro</li>
                      <li>• Kit de ferramentas</li>
                      <li>• 2d4 × 10 moedas de ouro</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Armor Options */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Label className="text-white text-lg font-semibold">
              Opções de Armadura
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <div className="text-white font-medium mb-2">Sem Armadura</div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {10 + dexterityMod}
                </div>
                <div className="text-gray-300 text-xs">10 + DEX</div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 text-center">
                <div className="text-white font-medium mb-2">
                  Armadura de Couro
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {11 + dexterityMod}
                </div>
                <div className="text-gray-300 text-xs">11 + DEX</div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 text-center">
                <div className="text-white font-medium mb-2">Cota de Malha</div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {13 + Math.min(2, dexterityMod)}
                </div>
                <div className="text-gray-300 text-xs">13 + DEX (máx 2)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HP Methods Comparison */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Label className="text-white text-lg font-semibold">
              Comparação de Métodos de HP
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <div className="text-blue-400 font-medium mb-2">Média</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {calculateAverageHP()}
                </div>
                <div className="text-gray-300 text-xs">
                  Balanceado e previsível
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 text-center">
                <div className="text-yellow-400 font-medium mb-2">Rolagem</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {rollResults.length > 0 ? characterData.hitPoints : "?"}
                </div>
                <div className="text-gray-300 text-xs">
                  Tradicional e aleatório
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
              <div className="text-blue-200 text-sm">
                <strong>Média:</strong> Mais consistente e recomendado para
                jogadores iniciantes.
                <strong>Rolagem:</strong> Tradicional do D&D, mas pode resultar
                em valores muito altos ou baixos.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card className="bg-blue-500/10 border-blue-400/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-blue-200 font-semibold text-sm">
                Sobre Equipamentos
              </h4>
              <p className="text-blue-100 text-sm mt-1">
                Os valores podem ser ajustados conforme você adquire melhores
                equipamentos, magias de proteção, ou outras fontes de bônus
                durante o jogo. Consulte seu Mestre sobre equipamentos
                específicos disponíveis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
