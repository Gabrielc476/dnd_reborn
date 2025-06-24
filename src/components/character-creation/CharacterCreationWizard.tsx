"use client";

import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// Step Components
import BasicInfoStep from "./steps/basicInfoStep";
import AbilityScoresStep from "./steps/AbilityScoresStep";
import SkillsStep from "./steps/SkillsStep";
import EquipmentStep from "./steps/EquipmentStep";
import SpellsStep from "./steps/SpellsStep";
import PersonalityStep from "./steps/PersonalityStep";

const STEP_COMPONENTS = [
  BasicInfoStep,
  AbilityScoresStep,
  SkillsStep,
  EquipmentStep,
  SpellsStep,
  PersonalityStep,
];

export default function CharacterCreationWizard() {
  const {
    currentStep,
    totalSteps,
    characterData,
    loading,
    error,
    nextStep,
    previousStep,
    canProceed,
    createCharacter,
    validateCurrentStep,
  } = useCharacterCreationContext();

  const CurrentStepComponent = STEP_COMPONENTS[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      createCharacter();
    } else {
      nextStep();
    }
  };

  const getNextButtonText = () => {
    if (loading) return "Salvando...";
    if (isLastStep) return "Criar Personagem";
    return "Próximo";
  };

  const getNextButtonIcon = () => {
    if (loading) return null;
    if (isLastStep) return Save;
    return ChevronRight;
  };

  const NextButtonIcon = getNextButtonIcon();

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-500/20 border-red-400/30">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Card */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
        <CardContent className="p-8">
          {/* Step Content */}
          <div className="min-h-[500px]">
            <CurrentStepComponent />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousStep}
          disabled={isFirstStep || loading}
          className="bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 text-white"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center space-x-4">
          {/* Validation Status */}
          <div className="flex items-center space-x-2">
            {validateCurrentStep() ? (
              <div className="flex items-center space-x-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Pronto</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Incompleto</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canProceed || loading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              NextButtonIcon && <NextButtonIcon className="w-4 h-4 mr-2" />
            )}
            {getNextButtonText()}
          </Button>
        </div>
      </div>

      {/* Character Preview (Debug - pode ser removido em produção) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <details>
              <summary className="text-white cursor-pointer text-sm">
                Debug: Dados do Personagem
              </summary>
              <pre className="text-xs text-gray-300 mt-2 overflow-auto">
                {JSON.stringify(characterData, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
