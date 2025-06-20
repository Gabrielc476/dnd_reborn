"use client";

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
} from "lucide-react";

export default function EquipmentStep() {
  const { characterData, updateCharacterData, getAbilityModifier } =
    useCharacterCreationContext();

  const constitutionMod = getAbilityModifier(
    characterData.abilityScores.constitution
  );
  const dexterityMod = getAbilityModifier(
    characterData.abilityScores.dexterity
  );

  // Calculate HP based on class, level, and constitution
  const calculateMaxHP = () => {
    if (!characterData.selectedClass) return 1;

    const hitDie = characterData.selectedClass.hit_die;
    const baseHP = hitDie + constitutionMod;
    const additionalLevels = characterData.level - 1;
    const avgPerLevel = Math.floor(hitDie / 2) + 1 + constitutionMod;

    return Math.max(1, baseHP + additionalLevels * avgPerLevel);
  };

  const calculateBaseAC = () => {
    return 10 + dexterityMod;
  };

  const maxHP = calculateMaxHP();
  const baseAC = calculateBaseAC();

  const adjustHP = (delta: number) => {
    const newHP = Math.max(1, characterData.hitPoints + delta);
    updateCharacterData({ hitPoints: newHP });
  };

  const adjustAC = (delta: number) => {
    const newAC = Math.max(10, characterData.armorClass + delta);
    updateCharacterData({ armorClass: newAC });
  };

  const resetToCalculated = () => {
    updateCharacterData({
      hitPoints: maxHP,
      armorClass: baseAC,
    });
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

                <div className="flex items-center justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustHP(-1)}
                    disabled={characterData.hitPoints <= 1}
                    className="w-8 h-8 p-0 bg-white/5 border-white/20"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustHP(1)}
                    className="w-8 h-8 p-0 bg-white/5 border-white/20"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="bg-black/20 rounded-lg p-3 text-sm">
                  <div className="text-purple-200">Sugerido (Média):</div>
                  <div className="text-white font-medium">{maxHP} HP</div>
                  <div className="text-gray-300 text-xs mt-1">
                    {characterData.selectedClass?.hit_die}d
                    {characterData.selectedClass?.hit_die} + CON (
                    {constitutionMod >= 0 ? "+" : ""}
                    {constitutionMod})
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

      {/* Calculation Helper */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-lg font-semibold">
                Valores Calculados
              </Label>
              <p className="text-purple-200 text-sm">
                Use os valores sugeridos baseados nos seus atributos
              </p>
            </div>

            <Button
              onClick={resetToCalculated}
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Usar Sugeridos
            </Button>
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
