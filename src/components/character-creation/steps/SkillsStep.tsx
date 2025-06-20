"use client";

import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Target, CheckCircle, Circle, Info, RotateCcw } from "lucide-react";
import { SKILLS, AbilityScores } from "@/types/characterCreation";

export default function SkillsStep() {
  const { characterData, updateCharacterData, getAbilityModifier } =
    useCharacterCreationContext();

  const handleSkillToggle = (skillKey: string) => {
    const newSelectedSkills = characterData.selectedSkills.includes(skillKey)
      ? characterData.selectedSkills.filter((s) => s !== skillKey)
      : [...characterData.selectedSkills, skillKey];

    // Respect the skill choice limit
    if (newSelectedSkills.length <= characterData.availableSkillChoices) {
      updateCharacterData({ selectedSkills: newSelectedSkills });
    }
  };

  const clearAllSkills = () => {
    updateCharacterData({ selectedSkills: [] });
  };

  const getSkillModifier = (
    ability: keyof AbilityScores,
    isSelected: boolean
  ): number => {
    const abilityMod = getAbilityModifier(characterData.abilityScores[ability]);
    const proficiencyBonus = Math.floor((characterData.level - 1) / 4) + 2;

    return abilityMod + (isSelected ? proficiencyBonus : 0);
  };

  const canSelectMoreSkills =
    characterData.selectedSkills.length < characterData.availableSkillChoices;
  const selectedCount = characterData.selectedSkills.length;
  const maxSkills = characterData.availableSkillChoices;

  // Group skills by ability
  const skillsByAbility = SKILLS.reduce((acc, skill) => {
    if (!acc[skill.ability]) {
      acc[skill.ability] = [];
    }
    acc[skill.ability].push(skill);
    return acc;
  }, {} as Record<keyof AbilityScores, typeof SKILLS>);

  const abilityNames = {
    strength: "Força",
    dexterity: "Destreza",
    constitution: "Constituição",
    intelligence: "Inteligência",
    wisdom: "Sabedoria",
    charisma: "Carisma",
  };

  const abilityColors = {
    strength: "from-red-500 to-red-600",
    dexterity: "from-green-500 to-green-600",
    constitution: "from-orange-500 to-orange-600",
    intelligence: "from-blue-500 to-blue-600",
    wisdom: "from-purple-500 to-purple-600",
    charisma: "from-pink-500 to-pink-600",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Perícias</h2>
        <p className="text-purple-200">
          Escolha as perícias que seu personagem domina
        </p>
      </div>

      {/* Skills Counter */}
      <Card className="bg-white/5 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-lg font-semibold">
                Perícias Selecionadas
              </Label>
              <p className="text-purple-200 text-sm">
                Escolha {maxSkills} perícias para treinar
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    selectedCount === maxSkills
                      ? "text-green-400"
                      : selectedCount > maxSkills
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {selectedCount} / {maxSkills}
                </div>
              </div>

              {selectedCount > 0 && (
                <Button
                  onClick={clearAllSkills}
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills by Ability */}
      <div className="space-y-6">
        {(Object.keys(skillsByAbility) as Array<keyof AbilityScores>).map(
          (ability) => {
            const skills = skillsByAbility[ability];
            const abilityScore = characterData.abilityScores[ability];
            const abilityMod = getAbilityModifier(abilityScore);

            return (
              <Card key={ability} className="bg-white/5 border-white/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Ability Header */}
                    <div className="flex items-center space-x-3">
                      <div
                        className={`bg-gradient-to-r ${abilityColors[ability]} p-3 rounded-lg`}
                      >
                        <div className="text-white font-bold text-lg">
                          {abilityScore}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {abilityNames[ability]}
                        </h3>
                        <p className="text-purple-200 text-sm">
                          Modificador: {abilityMod >= 0 ? "+" : ""}
                          {abilityMod}
                        </p>
                      </div>
                    </div>

                    {/* Skills List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {skills.map((skill) => {
                        const isSelected =
                          characterData.selectedSkills.includes(skill.key);
                        const canSelect = isSelected || canSelectMoreSkills;
                        const skillMod = getSkillModifier(ability, isSelected);

                        return (
                          <div
                            key={skill.key}
                            className={`
                            p-4 rounded-lg border cursor-pointer transition-all duration-200
                            ${
                              isSelected
                                ? "bg-green-500/20 border-green-400/50"
                                : canSelect
                                ? "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30"
                                : "bg-gray-800/20 border-gray-600/20 cursor-not-allowed opacity-50"
                            }
                          `}
                            onClick={() =>
                              canSelect && handleSkillToggle(skill.key)
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  {isSelected ? (
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                  )}
                                  <div>
                                    <h4 className="text-white font-medium text-sm">
                                      {skill.name}
                                    </h4>
                                    <p className="text-purple-200 text-xs">
                                      {skill.description}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right ml-2">
                                <div
                                  className={`font-bold ${
                                    isSelected
                                      ? "text-green-400"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {skillMod >= 0 ? "+" : ""}
                                  {skillMod}
                                </div>
                                {isSelected && (
                                  <div className="text-xs text-green-300">
                                    Treinado
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>

      {/* Info Box */}
      <Card className="bg-blue-500/10 border-blue-400/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-blue-200 font-semibold text-sm">
                Como funcionam as Perícias
              </h4>
              <p className="text-blue-100 text-sm mt-1">
                Perícias representam talentos específicos do seu personagem. O
                modificador final é calculado como: Modificador do Atributo +
                Bônus de Proficiência (se treinado). Seu bônus de proficiência
                atual é +{Math.floor((characterData.level - 1) / 4) + 2}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Recommendations */}
      {characterData.selectedClass && (
        <Card className="bg-purple-500/10 border-purple-400/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <Target className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-purple-200 font-semibold text-sm">
                  Recomendações para {characterData.selectedClass.name}
                </h4>
                <p className="text-purple-100 text-sm mt-1">
                  Baseado na sua classe, considere perícias como Percepção,
                  Intuição, e perícias relacionadas ao seu atributo principal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
