"use client";

import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Zap,
  Target,
  Sword,
  Sparkles,
  Heart,
  CheckCircle,
  Circle,
  AlertTriangle,
  Crown,
  Info,
} from "lucide-react";

const STEP_ICONS = [
  User, // Basic Info
  Zap, // Ability Scores
  Target, // Skills
  Sword, // Equipment
  Sparkles, // Spells
  Heart, // Personality
];

export default function CharacterCreationProgress() {
  const {
    currentStep,
    steps,
    goToStep,
    characterData,
    getCombinedAbilityBonuses,
  } = useCharacterCreationContext();

  const getStepStatusIcon = (stepIndex: number) => {
    const step = steps[stepIndex];

    if (step.isCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    } else if (stepIndex === currentStep) {
      return <Circle className="w-5 h-5 text-purple-400 fill-current" />;
    } else if (!step.isValid && stepIndex < currentStep) {
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    } else {
      return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStepClassName = (stepIndex: number) => {
    const step = steps[stepIndex];
    const base =
      "flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer";

    if (stepIndex === currentStep) {
      return `${base} bg-purple-500/20 border border-purple-400/30`;
    } else if (step.isCompleted) {
      return `${base} bg-green-500/10 border border-green-400/20 hover:bg-green-500/20`;
    } else if (stepIndex < currentStep) {
      return `${base} bg-white/5 border border-white/10 hover:bg-white/10`;
    } else {
      return `${base} bg-gray-800/20 border border-gray-600/20 cursor-not-allowed opacity-60`;
    }
  };

  // Get combined ability bonuses
  const combinedBonuses = getCombinedAbilityBonuses();

  return (
    <div className="space-y-6">
      {/* Character Summary */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Seu Personagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-purple-200">Nome</p>
            <p className="text-white font-medium">
              {characterData.name || "Sem nome"}
            </p>
          </div>

          {characterData.selectedRace && (
            <div>
              <p className="text-sm text-purple-200">Raça</p>
              <div className="space-y-1">
                <p className="text-white font-medium">
                  {characterData.selectedRace.name}
                </p>
                {characterData.selectedSubrace && (
                  <div className="flex items-center space-x-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <p className="text-amber-200 text-sm">
                      {characterData.selectedSubrace.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {characterData.selectedClass && (
            <div>
              <p className="text-sm text-purple-200">Classe</p>
              <p className="text-white font-medium">
                {characterData.selectedClass.name}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-purple-200">Nível</p>
            <p className="text-white font-medium">{characterData.level}</p>
          </div>

          {/* Racial Bonuses Summary */}
          {combinedBonuses.length > 0 && (
            <div>
              <p className="text-sm text-purple-200">Bônus Raciais</p>
              <div className="space-y-1">
                {combinedBonuses.map((bonus, index) => (
                  <div key={index} className="text-xs text-green-300">
                    +{bonus.bonus} {bonus.ability_score.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Progresso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {steps.map((step, index) => {
            const StepIcon = STEP_ICONS[index];
            const canNavigate = index <= currentStep;

            return (
              <div
                key={step.id}
                className={getStepClassName(index)}
                onClick={() => canNavigate && goToStep(index)}
              >
                <div className="flex items-center justify-center w-10 h-10 bg-black/20 rounded-lg">
                  <StepIcon className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">
                    {step.title}
                  </h3>
                  <p className="text-purple-200 text-xs truncate">
                    {step.description}
                  </p>
                </div>

                <div className="flex-shrink-0">{getStepStatusIcon(index)}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Race & Subrace Details */}
      {(characterData.selectedRace || characterData.selectedSubrace) && (
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Ancestralidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {characterData.selectedRace && (
              <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <h4 className="text-purple-200 font-medium text-sm">
                    {characterData.selectedRace.name}
                  </h4>
                </div>
                <p className="text-purple-100 text-xs">
                  Velocidade: {characterData.selectedRace.speed} pés
                </p>
                {characterData.selectedRace.ability_bonuses.length > 0 && (
                  <p className="text-purple-100 text-xs">
                    Bônus:{" "}
                    {characterData.selectedRace.ability_bonuses
                      .map((b) => `+${b.bonus} ${b.ability_score.name}`)
                      .join(", ")}
                  </p>
                )}
              </div>
            )}

            {characterData.selectedSubrace && (
              <div className="bg-amber-500/10 border border-amber-400/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <h4 className="text-amber-200 font-medium text-sm">
                    {characterData.selectedSubrace.name}
                  </h4>
                </div>
                {characterData.selectedSubrace.ability_bonuses.length > 0 && (
                  <p className="text-amber-100 text-xs">
                    Bônus:{" "}
                    {characterData.selectedSubrace.ability_bonuses
                      .map((b) => `+${b.bonus} ${b.ability_score.name}`)
                      .join(", ")}
                  </p>
                )}
                <p className="text-amber-100 text-xs mt-1 line-clamp-2">
                  {characterData.selectedSubrace.desc.substring(0, 80)}...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {characterData.selectedClass && (
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-2xl font-bold text-red-400">
                  {characterData.hitPoints}
                </p>
                <p className="text-xs text-purple-200">HP</p>
              </div>

              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-400">
                  {characterData.armorClass}
                </p>
                <p className="text-xs text-purple-200">CA</p>
              </div>
            </div>

            {characterData.isSpellcaster && (
              <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-3 text-center">
                <p className="text-purple-200 text-xs">Conjurador</p>
                <p className="text-white font-medium">
                  {characterData.selectedSpells.length} magias
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Warnings/Alerts */}
      {characterData.selectedRace &&
        characterData.selectedRace.subraces.length > 0 &&
        !characterData.selectedSubrace && (
          <Card className="bg-yellow-500/10 border-yellow-400/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-200 text-sm font-medium">
                    Subraça Necessária
                  </p>
                  <p className="text-yellow-100 text-xs">
                    Escolha uma subraça para {characterData.selectedRace.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Tips */}
      <Card className="bg-blue-500/10 border-blue-400/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-blue-200 text-sm font-medium">Dica</p>
              <p className="text-blue-100 text-xs">
                Você pode voltar aos passos anteriores para fazer ajustes a
                qualquer momento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
