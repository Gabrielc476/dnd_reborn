"use client";

import { useState } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { 
  User, 
  Zap, 
  Shield, 
  Sword, 
  Sparkles, 
  Heart,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Settings,
  Info,
  CheckCircle,
  Circle,
  Save,
  RotateCcw,
  Loader2
} from "lucide-react";
import BasicInfoStep from "./steps/BasicInfoStep";
import AbilityScoresStep from "./steps/AbilityScoresStep";
import SkillsStep from "./steps/SkillsStep";
import EquipmentStep from "./steps/EquipmentStep";
import SpellsStep from "./steps/SpellsStep";
import PersonalityStep from "./steps/PersonalityStep";

interface CharacterCreationWizardProps {
  onComplete?: (characterData: any) => void;
  onCancel?: () => void;
  campaignContext?: {
    id: string;
    name: string;
    setting?: string;
    world_name?: string;
  };
}

export default function CharacterCreationWizard({ 
  onComplete, 
  onCancel,
  campaignContext
}: CharacterCreationWizardProps) {
  const {
    currentStep,
    steps,
    nextStep,
    prevStep,
    goToStep,
    characterData,
    loading,
    error,
    validateCurrentStep,
    canProceed: contextCanProceed,
    validateStep,
    resetCharacter,
    createCharacter,
    calculateHitPoints,
    calculateArmorClass,
  } = useCharacterCreationContext();

  const [showSidebar, setShowSidebar] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  if (!steps || steps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Carregando wizard...</p>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const stepConfig = {
    "basics": {
      icon: User,
      color: "from-blue-500 to-indigo-600",
      gradient: "bg-gradient-to-br from-blue-500/20 to-indigo-600/20"
    },
    "abilities": {
      icon: Zap,
      color: "from-yellow-500 to-orange-600",
      gradient: "bg-gradient-to-br from-yellow-500/20 to-orange-600/20"
    },
    "skills": {
      icon: Shield,
      color: "from-green-500 to-emerald-600",
      gradient: "bg-gradient-to-br from-green-500/20 to-emerald-600/20"
    },
    "equipment": {
      icon: Sword,
      color: "from-purple-500 to-violet-600",
      gradient: "bg-gradient-to-br from-purple-500/20 to-violet-600/20"
    },
    "spells": {
      icon: Sparkles,
      color: "from-pink-500 to-rose-600",
      gradient: "bg-gradient-to-br from-pink-500/20 to-rose-600/20"
    },
    "personality": {
      icon: Heart,
      color: "from-red-500 to-pink-600",
      gradient: "bg-gradient-to-br from-red-500/20 to-pink-600/20"
    }
  };

  const handleNext = () => {
    console.log(contextCanProceed)
    if (contextCanProceed()) {
      nextStep();
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      prevStep();
    }
  };

  const handleFinish = async () => {
    setIsCreating(true);
    setCreationError(null);
    
    try {
      const result = await createCharacter();
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      setCreationError(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setIsCreating(false);
    }
  };

  const handleReset = () => {
    if (confirm("Tem certeza que deseja reiniciar? Todos os dados serão perdidos.")) {
      resetCharacter();
    }
  };

  const renderSidebarStep = (step: any, index: number) => {
    const isActive = index === currentStep;
    const isCompleted = step.isValid && step.isCompleted !== false;
    
    const stepInfo = stepConfig[step.id as keyof typeof stepConfig];
    if (!stepInfo) return null;
    
    const StepIcon = stepInfo.icon;

    return (
      <div
        key={step.id}
        onClick={() => goToStep(index)}
        className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all ${
          isActive 
            ? 'bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border border-purple-500/30' 
            : 'hover:bg-gray-700/30'
        }`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
          isActive 
            ? `bg-gradient-to-br ${stepInfo.color} shadow-lg` 
            : isCompleted 
              ? 'bg-green-500/20 border border-green-500/30' 
              : 'bg-gray-700/50'
        }`}>
          <StepIcon className={`w-6 h-6 ${
            isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-400'
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold transition-colors ${
            isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-400'
          }`}>
            {step.title}
          </h3>
          <p className={`text-sm transition-colors ${
            isActive ? 'text-gray-300' : 'text-gray-500'
          }`}>
            {step.description}
          </p>
        </div>

        <div className="ml-4">
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <Circle className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    if (!currentStepData) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Step não encontrado</h3>
          <p className="text-gray-400">Erro interno no wizard de criação.</p>
        </div>
      );
    }

    const stepInfo = stepConfig[currentStepData.id as keyof typeof stepConfig];
    if (!stepInfo) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Configuração não encontrada</h3>
          <p className="text-gray-400">O step "{currentStepData.id}" não possui configuração.</p>
        </div>
      );
    }

    const StepIcon = stepInfo.icon;

    return (
      <div className={`min-h-96 rounded-2xl border border-gray-700/50 p-8 ${stepInfo.gradient} backdrop-blur-sm`}>
        <div className="flex items-center space-x-4 mb-8">
          <div className={`w-16 h-16 bg-gradient-to-br ${stepInfo.color} rounded-2xl flex items-center justify-center shadow-lg`}>
            <StepIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{currentStepData.title}</h2>
            <p className="text-gray-300">{currentStepData.description}</p>
          </div>
        </div>
        
        <div className="bg-gray-900/20 rounded-xl p-6 backdrop-blur-sm border border-gray-700/30">
          {currentStepData.id === "basics" && <BasicInfoStep />}
          {currentStepData.id === "abilities" && <AbilityScoresStep />}
          {currentStepData.id === "skills" && <SkillsStep />}
          {currentStepData.id === "equipment" && <EquipmentStep />}
          {currentStepData.id === "spells" && <SpellsStep />}
          {currentStepData.id === "personality" && <PersonalityStep />}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="flex">
        {showSidebar && (
          <div className="w-80 bg-gray-800/50 border-r border-gray-700/50 backdrop-blur-sm min-h-screen">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-white">Criar Personagem</h1>
                  <p className="text-gray-400 text-sm">
                    {campaignContext?.name ? `${campaignContext.name}` : 'Personagem independente'}
                  </p>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-300" />
                </button>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-300">Progresso</span>
                  <span className="text-sm text-gray-400">
                    {Math.round(((currentStep + 1) / steps.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {steps.map((step, index) => renderSidebarStep(step, index))}
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reiniciar</span>
                </button>
                
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    <span>Cancelar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          {!showSidebar && (
            <div className="p-4">
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          )}

          <div className="flex-1 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-400">Erro</h3>
                    <p className="text-sm text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {creationError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-400">Erro ao criar personagem</h3>
                    <p className="text-sm text-red-300 mt-1">{creationError}</p>
                  </div>
                </div>
              </div>
            )}

            {renderCurrentStep()}

            <div className="mt-8 flex items-center justify-between">
              <div>
                {!isFirstStep && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-600/50 hover:bg-gray-500/50 text-gray-300 rounded-xl transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {!isLastStep ? (
                  <button
                    onClick={handleNext}
                    disabled={!contextCanProceed()}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg"
                  >
                    <span>Próximo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    disabled={!contextCanProceed() || isCreating}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Criando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Criar Personagem</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {!contextCanProceed() && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-300">
                    Complete todos os campos obrigatórios para continuar.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}