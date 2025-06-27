// ===========================
// CHARACTER CREATION WIZARD - COMPONENTE COMPLETO
// src/components/character-creation/CharacterCreationWizard.tsx
// ===========================

"use client";

import { 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Zap, 
  Shield, 
  Sword, 
  Sparkles, 
  Heart,
  RefreshCw,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { useState } from "react";

// Step Components
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
    nextStep,
    prevStep,
    goToStep,
    characterData,
    loading,
    error,
    
    // Validação
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

  // Ícones para cada step
  const stepIcons = {
    "basic-info": User,
    "ability-scores": Zap,
    "skills": Shield,
    "equipment": Sword,
    "spells": Sparkles,
    "personality": Heart,
  };

  // Cores para cada step
  const stepColors = {
    "basic-info": "from-blue-500 to-cyan-500",
    "ability-scores": "from-yellow-500 to-orange-500",
    "skills": "from-green-500 to-emerald-500",
    "equipment": "from-red-500 to-pink-500",
    "spells": "from-purple-500 to-violet-500",
    "personality": "from-rose-500 to-pink-500",
  };

  // Função para obter ícone do status do step
  const getStepStatusIcon = (stepIndex: number) => {
    const step = steps[stepIndex];
    
    if (stepIndex < currentStep || step.isCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    } else if (stepIndex === currentStep) {
      return validateCurrentStep() ? (
        <CheckCircle className="w-5 h-5 text-green-400" />
      ) : (
        <AlertCircle className="w-5 h-5 text-yellow-400" />
      );
    } else {
      return <div className="w-5 h-5 rounded-full border-2 border-gray-500 bg-gray-800" />;
    }
  };

  // Função para obter classe CSS do step
  const getStepClassName = (stepIndex: number) => {
    const step = steps[stepIndex];
    const baseClasses = "flex items-center space-x-3 p-4 rounded-xl transition-all cursor-pointer group";
    
    if (stepIndex === currentStep) {
      return `${baseClasses} bg-gradient-to-r ${stepColors[step.id as keyof typeof stepColors] || "from-purple-500 to-blue-500"} text-white shadow-lg transform scale-105`;
    } else if (stepIndex < currentStep || step.isCompleted) {
      return `${baseClasses} bg-green-600/20 text-green-300 hover:bg-green-600/30 border border-green-500/30`;
    } else {
      return `${baseClasses} bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700`;
    }
  };

  // Handler para finalizar criação
  const handleFinish = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsCreating(true);
    try {
      await createCharacter();
      onComplete?.(characterData);
    } catch (error) {
      console.error("❌ Erro ao criar personagem:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Renderizar conteúdo do step atual
  const renderStepContent = () => {
    const stepId = steps[currentStep]?.id;
    
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
          <div className="text-center text-white/70 py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-xl font-semibold mb-2">Step não encontrado</h3>
            <p>O step "{stepId}" ainda não foi implementado.</p>
          </div>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-300 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Carregando D&D</h2>
          <p className="text-white/70">Buscando dados das raças da API oficial...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-red-900/30 p-8 rounded-xl max-w-md border border-red-500/30">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-200 mb-4">Erro ao Carregar</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <div className="space-x-3">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Tentar Novamente
            </button>
            {onCancel && (
              <button 
                onClick={onCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Voltar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        
        {/* Sidebar - Steps Navigation */}
        {showSidebar && (
          <div className="w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Progresso</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-white/70 hover:text-white lg:hidden"
                >
                  <EyeOff className="w-5 h-5" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>Passo {currentStep + 1} de {steps.length}</span>
                  <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-3">
              {steps.map((step, index) => {
                const StepIcon = stepIcons[step.id as keyof typeof stepIcons] || User;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => goToStep(index)}
                    className={getStepClassName(index)}
                    disabled={index > currentStep && !validateStep(step.id)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="relative">
                        <StepIcon className="w-6 h-6" />
                        <div className="absolute -top-1 -right-1">
                          {getStepStatusIcon(index)}
                        </div>
                      </div>
                      
                      <div className="text-left flex-1">
                        <div className="font-semibold">{step.title}</div>
                        <div className="text-xs opacity-75">{step.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Character Summary */}
            {characterData.name && (
              <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {characterData.name}
                </h3>
                
                <div className="space-y-2 text-sm text-white/70">
                  {characterData.selectedRace && (
                    <div>
                      <strong>Raça:</strong> {characterData.selectedRace.name}
                      {characterData.selectedSubrace && (
                        <span> ({characterData.selectedSubrace.name})</span>
                      )}
                    </div>
                  )}
                  
                  {characterData.selectedClass && (
                    <div>
                      <strong>Classe:</strong> {characterData.selectedClass.name}
                      {characterData.selectedSubclass && (
                        <span> ({characterData.selectedSubclass.name})</span>
                      )}
                    </div>
                  )}
                  
                  {characterData.selectedBackground && (
                    <div><strong>Background:</strong> {characterData.selectedBackground.name}</div>
                  )}

                  <div className="pt-2 border-t border-white/10">
                    <div><strong>Nível:</strong> {characterData.level}</div>
                    <div><strong>PV:</strong> {calculateHitPoints()}</div>
                    <div><strong>CA:</strong> {calculateArmorClass()}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={resetCharacter}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recomeçar</span>
              </button>
              
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          
          {/* Header */}
          <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!showSidebar && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="text-white/70 hover:text-white lg:hidden"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                )}
                
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {steps[currentStep]?.title}
                  </h1>
                  <p className="text-white/70">
                    {steps[currentStep]?.description}
                  </p>
                </div>
              </div>

              {/* Validation Status */}
              <div className="flex items-center space-x-3">
                {validateCurrentStep() ? (
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Completo</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Incompleto</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderStepContent()}
          </div>

          {/* Footer Navigation */}
          <div className="bg-black/20 backdrop-blur-sm border-t border-white/10 p-6">
            <div className="flex items-center justify-between">
              
              {/* Previous Button */}
              <button
                onClick={prevStep}
                disabled={isFirstStep}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  isFirstStep
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600 hover:scale-105'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              {/* Step Indicator (Mobile) */}
              <div className="flex items-center space-x-2 lg:hidden">
                <span className="text-white/70 text-sm">
                  {currentStep + 1} / {steps.length}
                </span>
                <div className="w-20 bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-purple-500 h-1 rounded-full transition-all"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Next/Finish Button */}
              {isLastStep ? (
                <button
                  onClick={handleFinish}
                  disabled={!validateCurrentStep() || isCreating}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    validateCurrentStep() && !isCreating
                      ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Criando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Finalizar</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    canProceed()
                      ? 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>Próximo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm p-4 rounded-lg border border-white/20 max-w-xs">
          <details className="text-white/70">
            <summary className="cursor-pointer text-sm font-medium mb-2 text-white">
              🐛 Debug
            </summary>
            <div className="text-xs space-y-1">
              <div><strong>Step:</strong> {currentStep} ({steps[currentStep]?.id})</div>
              <div><strong>Valid:</strong> {validateCurrentStep() ? "✅" : "❌"}</div>
              <div><strong>Can Proceed:</strong> {canProceed() ? "✅" : "❌"}</div>
              <div><strong>Race:</strong> {characterData.selectedRace?.name || "None"}</div>
              <div><strong>Class:</strong> {characterData.selectedClass?.name || "None"}</div>
              <div><strong>HP:</strong> {calculateHitPoints()}</div>
              <div><strong>AC:</strong> {calculateArmorClass()}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}