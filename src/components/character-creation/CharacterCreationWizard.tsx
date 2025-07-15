// ===========================
// CHARACTER CREATION WIZARD - ATUALIZADO PARA USAR NOVOS HOOKS
// src/components/character-creation/CharacterCreationWizard.tsx
// ===========================

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

// Step components
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
    // Step management via context
    currentStep,
    steps,
    nextStep,
    prevStep,
    goToStep,
    
    // Character data
    characterData,
    
    // Loading e errors
    loading,
    error,
    
    // Validation - usando as funções do contexto
    validateCurrentStep,
    canProceed,
    validateStep,
    
    // Actions
    resetCharacter,
    createCharacter,
    
    // Utility functions
    calculateHitPoints,
    calculateArmorClass,
  } = useCharacterCreationContext();

  const [showSidebar, setShowSidebar] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // ===========================
  // STEP CONFIGURATION
  // ===========================

  const stepConfig = {
    "basic-info": {
      icon: User,
      color: "from-blue-500 to-indigo-600",
      gradient: "bg-gradient-to-br from-blue-500/20 to-indigo-600/20"
    },
    "ability-scores": {
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

  // ===========================
  // HANDLERS
  // ===========================

  const handleNext = () => {
    if (canProceed()) {
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
      console.log("✅ Personagem criado:", result);
      
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error("❌ Erro ao criar personagem:", error);
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

  // ===========================
  // SIDEBAR STEP COMPONENT
  // ===========================

  const SidebarStep = ({ step, index }: { step: any; index: number }) => {
    const isActive = index === currentStep;
    const isCompleted = validateStep(step.id);
    const isPast = index < currentStep;
    const config = stepConfig[step.id as keyof typeof stepConfig] || stepConfig["basic-info"];
    const StepIcon = config.icon;

    return (
      <div
        onClick={() => goToStep(index)}
        className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 cursor-pointer group ${
          isActive
            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-400/30 shadow-lg'
            : isCompleted
            ? 'bg-green-500/10 border border-green-400/20 hover:bg-green-500/20'
            : isPast
            ? 'bg-gray-800/50 border border-gray-700/30 hover:bg-gray-700/50'
            : 'bg-gray-800/30 border border-gray-700/20 opacity-60'
        }`}
      >
        {/* Step Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isActive
            ? `bg-gradient-to-br ${config.color} shadow-lg`
            : isCompleted
            ? 'bg-green-500/20 text-green-400'
            : 'bg-gray-700/50 text-gray-400'
        }`}>
          <StepIcon className="w-5 h-5 text-white" />
        </div>

        {/* Step Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium transition-colors ${
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

        {/* Validation Status */}
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

  // ===========================
  // RENDER CURRENT STEP
  // ===========================

  const renderCurrentStep = () => {
    const stepId = steps[currentStep]?.id;
    const stepInfo = stepConfig[stepId as keyof typeof stepConfig] || stepConfig["basic-info"];
    const StepIcon = stepInfo.icon;

    return (
      <div className={`min-h-96 rounded-2xl border border-gray-700/50 p-8 ${stepInfo.gradient} backdrop-blur-sm`}>
        <div className="flex items-center space-x-4 mb-8">
          <div className={`w-16 h-16 bg-gradient-to-br ${stepInfo.color} rounded-2xl flex items-center justify-center shadow-lg`}>
            <StepIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{steps[currentStep]?.title}</h2>
            <p className="text-gray-300">{steps[currentStep]?.description}</p>
          </div>
        </div>
        
        {/* Renderizar componente do step */}
        <div className="bg-gray-900/20 rounded-xl p-6 backdrop-blur-sm border border-gray-700/30">
          {(() => {
            switch (stepId) {
              case "basic-info":
                return <BasicInfoStep />;
              case "ability-scores":
                return <AbilityScoresStep />;
              case "skills":
                return <SkillsStep />;
              case "equipment":
                return <EquipmentStep />;
              case "spells":
                return <SpellsStep />;
              case "personality":
                return <PersonalityStep />;
              default:
                return (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Step não encontrado</h3>
                    <p className="text-gray-500">O step "{stepId}" não está implementado.</p>
                  </div>
                );
            }
          })()}
        </div>
      </div>
    );
  };

  // ===========================
  // RENDER PRINCIPAL
  // ===========================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />
      
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Criar Personagem</h1>
                  {campaignContext && (
                    <p className="text-sm text-gray-400">{campaignContext.name}</p>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progresso</span>
                  <span>{currentStep + 1} de {steps.length}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              {steps.map((step, index) => (
                <SidebarStep key={step.id} step={step} index={index} />
              ))}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-700/50 space-y-3">
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
                  className="w-full px-4 py-2 bg-gray-600/50 hover:bg-gray-500/50 text-gray-300 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                </button>
                
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {steps[currentStep]?.title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Passo {currentStep + 1} de {steps.length}
                  </p>
                </div>
              </div>

              {/* Character Summary */}
              <div className="flex items-center space-x-6 text-sm">
                {characterData.name && (
                  <div>
                    <span className="text-gray-400">Nome:</span>
                    <span className="text-white ml-1 font-medium">{characterData.name}</span>
                  </div>
                )}
                
                {characterData.selectedRace && (
                  <div>
                    <span className="text-gray-400">Raça:</span>
                    <span className="text-white ml-1">{characterData.selectedRace.name}</span>
                  </div>
                )}
                
                {characterData.selectedClass && (
                  <div>
                    <span className="text-gray-400">Classe:</span>
                    <span className="text-white ml-1">{characterData.selectedClass.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                  <p className="text-gray-400">Carregando...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 max-w-md">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-red-300 mb-2">Erro</h3>
                    <p className="text-gray-400">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              renderCurrentStep()
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700/50 p-6">
            {creationError && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-300">Erro ao criar personagem</h4>
                    <p className="text-sm text-red-400 mt-1">{creationError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={isFirstStep}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="flex items-center space-x-3">
                {!isLastStep ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg"
                  >
                    <span>Próximo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    disabled={!canProceed() || isCreating}
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

            {/* Validation Info */}
            {!canProceed() && (
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