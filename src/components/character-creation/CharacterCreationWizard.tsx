// ===========================
// CHARACTER CREATION WIZARD - ARQUIVO COMPLETO CORRIGIDO
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
  Circle
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
}

export default function CharacterCreationWizard({ 
  onComplete, 
  onCancel 
}: CharacterCreationWizardProps) {
  const {
    currentStep,
    steps,
    nextStep: nextStepAction,
    prevStep: prevStepAction,
    goToStep,
    characterData,
    loading,
    error,
    
    // Validação - 🔥 ESTAS FUNÇÕES AGORA FUNCIONAM CORRETAMENTE
    validateCurrentStep,
    canProceed,
    validateStep,
    
    // Ações
    resetCharacter,
    createCharacter,
    
    // Utilitários
    getCombinedAbilityBonuses,
    calculateHitPoints,
    calculateArmorClass,
  } = useCharacterCreationContext();

  const [showSidebar, setShowSidebar] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Configuração dos steps com novo design
  const stepConfig = {
    "basic-info": {
      icon: User,
      color: "from-blue-500 to-indigo-600",
      gradient: "bg-gradient-to-br from-blue-500/20 to-indigo-600/20"
    },
    "ability-scores": {
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      gradient: "bg-gradient-to-br from-yellow-500/20 to-orange-500/20"
    },
    "skills": {
      icon: Shield,
      color: "from-green-500 to-emerald-500",
      gradient: "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
    },
    "equipment": {
      icon: Sword,
      color: "from-red-500 to-rose-500",
      gradient: "bg-gradient-to-br from-red-500/20 to-rose-500/20"
    },
    "spells": {
      icon: Sparkles,
      color: "from-purple-500 to-violet-500",
      gradient: "bg-gradient-to-br from-purple-500/20 to-violet-500/20"
    },
    "personality": {
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      gradient: "bg-gradient-to-br from-pink-500/20 to-rose-500/20"
    }
  };

  // ===========================
  // 🔥 NAVEGAÇÃO CORRIGIDA
  // ===========================

  const handleNextStep = () => {
    // Agora a validação funciona corretamente para o step de equipment
    if (canProceed()) {
      nextStepAction();
    } else {
      // Debug para identificar problemas
      console.warn("❌ Não é possível prosseguir:", {
        currentStep: steps[currentStep]?.title,
        stepId: steps[currentStep]?.id,
        isValid: validateCurrentStep(),
        characterData: {
          selectedEquipment: characterData.selectedEquipment,
          equipmentCount: characterData.selectedEquipment?.length || 0
        }
      });
    }
  };

  const handlePrevStep = () => {
    prevStepAction();
  };

  // Handler para finalizar criação
  const handleComplete = async () => {
    if (!canProceed()) return;
    
    setIsCreating(true);
    try {
      await createCharacter();
      if (onComplete) {
        onComplete(characterData);
      }
    } catch (error) {
      console.error("❌ Erro ao criar personagem:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Componente do indicador de step
  const StepIndicator = ({ step, index, isActive, isCompleted }) => {
    const stepInfo = stepConfig[step.id] || stepConfig["basic-info"];
    const Icon = stepInfo.icon;
    
    return (
      <div 
        className={`relative flex items-center cursor-pointer transition-all duration-300 ${
          isActive ? 'scale-105' : 'hover:scale-102'
        }`}
        onClick={() => goToStep(index)}
      >
        {/* Connection Line */}
        {index < steps.length - 1 && (
          <div className={`absolute left-8 top-8 w-px h-16 transition-colors duration-300 ${
            isCompleted || index < currentStep
              ? 'bg-green-400'
              : 'bg-gray-600'
          }`} />
        )}

        {/* Step Circle */}
        <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isActive
            ? `bg-gradient-to-br ${stepInfo.color} shadow-lg shadow-blue-500/25`
            : isCompleted
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25'
              : 'bg-gray-700/80 border border-gray-600/50'
        }`}>
          {isCompleted && !isActive ? (
            <CheckCircle className="w-8 h-8 text-white" />
          ) : (
            <Icon className={`w-8 h-8 ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`} />
          )}
        </div>

        {/* Step Info */}
        <div className="ml-4 flex-1">
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

        {/* Validation Status */}
        <div className="ml-4">
          {validateStep(step.id) ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <Circle className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>
    );
  };

  // Renderizar componente do step atual
  const renderCurrentStep = () => {
    const stepId = steps[currentStep]?.id;
    const stepInfo = stepConfig[stepId] || stepConfig["basic-info"];
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
                    <h3 className="text-white font-semibold text-lg mb-2">Step não encontrado</h3>
                    <p className="text-gray-400">O step "{stepId}" ainda não foi implementado.</p>
                  </div>
                );
            }
          })()}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Carregando...</h2>
          <p className="text-gray-400">Preparando o criador de personagens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      {/* Main Layout */}
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50 p-6 overflow-y-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">Criador de Personagem</h1>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="bg-gray-700/50 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
              
              <p className="text-gray-400 text-sm">
                Step {currentStep + 1} de {steps.length}
              </p>
            </div>

            {/* Steps List */}
            <div className="space-y-6">
              {steps.map((step, index) => (
                <StepIndicator
                  key={step.id}
                  step={step}
                  index={index}
                  isActive={index === currentStep}
                  isCompleted={step.isCompleted}
                />
              ))}
            </div>

            {/* Character Summary */}
            {characterData.name && (
              <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <h3 className="text-white font-semibold mb-3">Resumo do Personagem</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nome:</span>
                    <span className="text-white">{characterData.name}</span>
                  </div>
                  {characterData.selectedRace && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Raça:</span>
                      <span className="text-white">{characterData.selectedRace.name}</span>
                    </div>
                  )}
                  {characterData.selectedClass && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Classe:</span>
                      <span className="text-white">{characterData.selectedClass.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nível:</span>
                    <span className="text-white">{characterData.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">PV:</span>
                    <span className="text-white">{characterData.hitPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">CA:</span>
                    <span className="text-white">{characterData.armorClass}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <button
                onClick={resetCharacter}
                className="w-full px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-xl transition-all border border-gray-600/50"
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Resetar Personagem
              </button>
              
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all border border-red-500/50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Sidebar Toggle (when hidden) */}
          {!showSidebar && (
            <div className="p-4">
              <button
                onClick={() => setShowSidebar(true)}
                className="p-3 bg-gray-900/80 backdrop-blur-sm text-white rounded-xl border border-gray-700/50 hover:bg-gray-800/80 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step Content */}
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <h3 className="text-red-400 font-semibold">Atenção</h3>
                  </div>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              )}

              {renderCurrentStep()}
            </div>
          </div>

          {/* Footer Navigation - 🔥 CORRIGIDO */}
          <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 p-6">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              {/* Progress Info */}
              <div className="text-gray-300">
                <span className="text-sm">
                  Step {currentStep + 1} de {steps.length}
                </span>
                {/* 🔥 INDICADOR DE VALIDAÇÃO VISUAL */}
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${validateCurrentStep() ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-xs">
                    {validateCurrentStep() ? 'Completo' : 'Incompleto'}
                  </span>
                  {/* Debug info para equipment step */}
                  {steps[currentStep]?.id === 'equipment' && (
                    <span className="text-xs text-gray-400 ml-2">
                      ({characterData.selectedEquipment?.length || 0} equipamentos)
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4">
                {/* Botão Anterior */}
                <button
                  onClick={handlePrevStep}
                  disabled={isFirstStep}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    isFirstStep
                      ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 border border-gray-600/50 hover:border-gray-500/50'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 inline mr-2" />
                  Anterior
                </button>

                {/* Botão Próximo/Finalizar - 🔥 CORRIGIDO */}
                {isLastStep ? (
                  <button
                    onClick={handleComplete}
                    disabled={!canProceed() || isCreating}
                    className={`px-8 py-3 rounded-xl font-medium transition-all ${
                      canProceed() && !isCreating
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
                        : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isCreating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Criando...</span>
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Finalizar
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNextStep}
                    disabled={!canProceed()}
                    className={`px-8 py-3 rounded-xl font-medium transition-all ${
                      canProceed()
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'
                        : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4 inline ml-2" />
                  </button>
                )}
              </div>
            </div>

            {/* 🔥 DEBUG INFO - REMOVER EM PRODUÇÃO */}
            {process.env.NODE_ENV === 'development' && (
              <div className="max-w-4xl mx-auto mt-4 p-3 bg-gray-800/50 rounded-lg text-xs text-gray-400">
                <strong>Debug Info:</strong> Step "{steps[currentStep]?.id}" | 
                Valid: {validateCurrentStep() ? '✅' : '❌'} | 
                {steps[currentStep]?.id === 'equipment' && (
                  <>Equipment: {characterData.selectedEquipment?.length || 0} items | </>
                )}
                Can Proceed: {canProceed() ? '✅' : '❌'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}