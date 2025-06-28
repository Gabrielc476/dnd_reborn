// ===========================
// CHARACTER CREATION PROGRESS - COMPONENTE CORRIGIDO
// src/components/character-creation/CharacterCreationProgress.tsx
// ===========================

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
    getCombinedAbilityBonuses, // ✅ CORRIGIDO: é um valor, não uma função
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

  // ✅ CORRIGIDO: Get combined ability bonuses (removido os parênteses)
  const combinedBonuses = getCombinedAbilityBonuses;

  return (
    <div className="space-y-6">
      {/* Character Summary */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span>Progresso do Personagem</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Character Basic Info */}
          {characterData.name && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Nome:</span>
              <span className="text-white font-medium">{characterData.name}</span>
            </div>
          )}
          
          {characterData.selectedRace && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Raça:</span>
              <span className="text-white font-medium">
                {characterData.selectedRace.name}
                {characterData.selectedSubrace && ` (${characterData.selectedSubrace.name})`}
              </span>
            </div>
          )}
          
          {characterData.selectedClass && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Classe:</span>
              <span className="text-white font-medium">
                {characterData.selectedClass.name}
                {characterData.selectedSubclass && ` (${characterData.selectedSubclass.name})`}
              </span>
            </div>
          )}
          
          {characterData.selectedBackground && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Antecedente:</span>
              <span className="text-white font-medium">{characterData.selectedBackground.name}</span>
            </div>
          )}

          {/* Ability Bonuses Summary */}
          {characterData.selectedRace && combinedBonuses && (
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Bônus Raciais de Atributos:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(combinedBonuses).map(([ability, bonus]) => (
                  bonus > 0 && (
                    <div key={ability} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{ability}:</span>
                      <span className="text-green-400 font-medium">+{bonus}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Steps Progress */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-400" />
            <span>Etapas de Criação</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => {
              const StepIcon = STEP_ICONS[index] || Circle;
              const isClickable = index <= currentStep || step.isCompleted;
              
              return (
                <div
                  key={step.id}
                  className={getStepClassName(index)}
                  onClick={() => isClickable && goToStep(index)}
                  style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      {getStepStatusIcon(index)}
                    </div>
                    <div className="flex items-center space-x-2 flex-1">
                      <StepIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </div>
                  {index === currentStep && (
                    <div className="text-xs text-purple-400 font-medium">
                      Atual
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {characterData.selectedClass && (
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Estatísticas Rápidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Nível:</span>
                <span className="text-white font-medium">{characterData.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">PV:</span>
                <span className="text-white font-medium">{characterData.hitPoints || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">CA:</span>
                <span className="text-white font-medium">{characterData.armorClass || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Perícias:</span>
                <span className="text-white font-medium">
                  {characterData.selectedSkills?.length || 0} / {characterData.availableSkillChoices || 0}
                </span>
              </div>
            </div>
            
            {characterData.isSpellcaster && (
              <div className="border-t border-white/10 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Magias:</span>
                  <span className="text-white font-medium">
                    {characterData.selectedSpells?.length || 0} selecionadas
                  </span>
                </div>
                {characterData.spellcastingAbility && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Atributo de Conjuração:</span>
                    <span className="text-white font-medium capitalize">
                      {characterData.spellcastingAbility}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}