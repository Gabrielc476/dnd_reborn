// ===========================
// CHARACTER CREATION WIZARD - COMPONENTE REFATORADO
// src/components/character-creation/CharacterCreationWizard.tsx
// ===========================

"use client";

import { 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Zap, 
  Shield, 
  Sword, 
  Sparkles, 
  Heart,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Crown,
  Wand2,
  Check,
  Circle,
  Dice6
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
    nextStep: nextStepAction,
    prevStep: prevStepAction,
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

  // Handler para finalizar criação
  const handleComplete = async () => {
    if (!canProceed()) return;
    
    setIsCreating(true);
    try {
      const newCharacter = await createCharacter(characterData);
      if (onComplete) {
        onComplete(newCharacter);
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
              ? 'bg-gradient-to-b from-emerald-400 to-emerald-500' 
              : 'bg-gray-600'
          }`} />
        )}
        
        {/* Step Circle */}
        <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isActive 
            ? `bg-gradient-to-br ${stepInfo.color} shadow-lg shadow-blue-500/25 border-2 border-white/20` 
            : isCompleted
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25'
            : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
        }`}>
          {isCompleted && !isActive ? (
            <Check className="w-6 h-6 text-white" />
          ) : (
            <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-300'}`} />
          )}
          
          {/* Active Ring */}
          {isActive && (
            <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-pulse" />
          )}
        </div>
        
        {/* Step Info */}
        <div className="ml-4 flex-1">
          <h3 className={`font-semibold transition-colors ${
            isActive ? 'text-white' : isCompleted ? 'text-gray-200' : 'text-gray-400'
          }`}>
            {step.title}
          </h3>
          <p className={`text-sm mt-1 transition-colors ${
            isActive ? 'text-gray-300' : 'text-gray-500'
          }`}>
            {step.description}
          </p>
        </div>
      </div>
    );
  };

  // Componente do resumo do personagem
  const CharacterSummaryCard = () => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Resumo do Personagem</h3>
          <p className="text-gray-400 text-sm">Visualização em tempo real</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Nome</span>
            <span className="text-white font-semibold">
              {characterData.name || "Sem nome"}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="text-blue-400 text-xs uppercase tracking-wide">Raça</div>
            <div className="text-white font-medium">
              {characterData.selectedRace?.name || "Não selecionada"}
            </div>
            {characterData.selectedSubrace && (
              <div className="text-blue-300 text-sm">
                {characterData.selectedSubrace.name}
              </div>
            )}
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-green-400 text-xs uppercase tracking-wide">Classe</div>
            <div className="text-white font-medium">
              {characterData.selectedClass?.name || "Não selecionada"}
            </div>
            {characterData.selectedSubclass && (
              <div className="text-green-300 text-sm">
                {characterData.selectedSubclass.name}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-gray-700/20 rounded-lg">
            <div className="text-gray-400 text-xs">Nível</div>
            <div className="text-white font-bold text-lg">{characterData.level}</div>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="text-red-400 text-xs">PV</div>
            <div className="text-white font-bold text-lg">{calculateHitPoints()}</div>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="text-yellow-400 text-xs">CA</div>
            <div className="text-white font-bold text-lg">{calculateArmorClass()}</div>
          </div>
        </div>

        {characterData.selectedBackground && (
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="text-purple-400 text-xs uppercase tracking-wide">Background</div>
            <div className="text-white font-medium">{characterData.selectedBackground.name}</div>
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar conteúdo do step atual
  const renderStepContent = () => {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Carregando D&D</h2>
            <p className="text-gray-400">Buscando dados das raças da API oficial...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center bg-red-900/30 p-8 rounded-xl max-w-md border border-red-700/50 backdrop-blur-sm">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erro ao Carregar</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <div className={`lg:w-96 bg-gray-800/30 backdrop-blur-xl border-r border-gray-700/50 p-6 space-y-6 transition-all duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Criação de Personagem</h1>
            <p className="text-gray-400">Configure seu herói épico</p>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progresso</span>
              <span className="text-white font-medium">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <StepIndicator
                key={step.id}
                step={step}
                index={index}
                isActive={currentStep === index}
                isCompleted={step.isCompleted || index < currentStep}
              />
            ))}
          </div>
          
          {/* Character Summary */}
          <CharacterSummaryCard />
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25"
              disabled={isCreating}
            >
              <Save className="w-5 h-5" />
              <span>Salvar Rascunho</span>
            </button>
            <button 
              onClick={resetCharacter}
              className="w-full px-4 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-600/50"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Recomeçar</span>
            </button>
            {onCancel && (
              <button 
                onClick={onCancel}
                className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-xl transition-all duration-200 border border-red-600/30"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-gray-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-white border border-gray-700/50"
        >
          {showSidebar ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </button>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Area */}
          <div className="flex-1 p-6">
            {renderStepContent()}
          </div>
          
          {/* Navigation Footer */}
          <div className="bg-gray-800/30 backdrop-blur-xl border-t border-gray-700/50 p-6">
            <div className="flex justify-between items-center">
              <button 
                onClick={prevStepAction}
                disabled={isFirstStep}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isFirstStep 
                    ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-700/50 hover:bg-gray-700 text-white shadow-lg'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Anterior</span>
              </button>
              
              <div className="flex items-center space-x-2 text-gray-400">
                <span>{currentStep + 1}</span>
                <span>de</span>
                <span>{steps.length}</span>
              </div>
              
              {isLastStep ? (
                <button 
                  onClick={handleComplete}
                  disabled={!canProceed() || isCreating}
                  className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                    canProceed() && !isCreating
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-emerald-500/25'
                      : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Criando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Finalizar</span>
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={nextStepAction}
                  disabled={!validateCurrentStep()}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                    validateCurrentStep()
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/25'
                      : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>Próximo</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}