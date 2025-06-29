// src/components/campaign-creation/CampaignCreationWizard.tsx
"use client";

import React from 'react';
import { useCreateCampaignContext } from '@/hooks/useCreateCampaign';
import BasicInfoStep from './steps/BasicInfoStep';
import WorldSettingStep from './steps/WorldSettingStep';
import PlayersConfigStep from './steps/PlayersConfigStep';
import AdditionalNotesStep from './steps/AdditionalNotesStep';
import ReviewStep from './steps/ReviewStep';
import { 
  Crown, 
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface CampaignCreationWizardProps {
  onComplete?: (campaignData: any) => void;
  onCancel?: () => void;
}

const CampaignCreationWizard: React.FC<CampaignCreationWizardProps> = ({ 
  onComplete, 
  onCancel 
}) => {
  const {
    formData,
    currentStep,
    setCurrentStep,
    steps,
    canProceedToNext,
    canGoBack,
    isLoading,
    createCampaign,
    resetForm,
    saveDraft
  } = useCreateCampaignContext();

  const [draftSaved, setDraftSaved] = React.useState(false);

  // Auto-save indicator
  React.useEffect(() => {
    if (formData.name || formData.description) {
      const timer = setTimeout(() => {
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.name, formData.description]);

  const handleNext = () => {
    if (canProceedToNext && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await createCampaign();
      if (result.success && onComplete) {
        onComplete(formData);
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
    }
  };

  const handleSaveDraft = () => {
    saveDraft();
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const renderCurrentStep = () => {
    switch (steps[currentStep]?.id) {
      case 'basic-info':
        return <BasicInfoStep />;
      case 'world-setting':
        return <WorldSettingStep />;
      case 'players-config':
        return <PlayersConfigStep />;
      case 'additional-notes':
        return <AdditionalNotesStep />;
      case 'review':
        return <ReviewStep />;
      default:
        return (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Step não encontrado</h3>
            <p className="text-gray-400">O step "{steps[currentStep]?.id}" não foi implementado.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onCancel && (
                <button 
                  onClick={onCancel}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Voltar às Campanhas</span>
                </button>
              )}
              <div className="w-px h-6 bg-gray-700" />
              <div className="flex items-center space-x-3">
                <Crown className="w-8 h-8 text-yellow-500" />
                <div>
                  <h1 className="text-xl font-bold text-white">Nova Campanha</h1>
                  <p className="text-gray-400 text-sm">Configure sua campanha épica</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {draftSaved && (
                <div className="flex items-center space-x-2 text-green-400 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Rascunho salvo</span>
                </div>
              )}
              
              <button 
                onClick={handleSaveDraft}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Rascunho</span>
              </button>
              
              <button 
                onClick={resetForm}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Resetar</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-80 bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50 min-h-screen">
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-lg font-bold text-white mb-2">Progresso da Criação</h2>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Etapa {currentStep + 1} de {steps.length}
                </p>
              </div>

              {/* Steps Navigation */}
              <nav className="space-y-3">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      index === currentStep
                        ? 'bg-blue-500/20 border border-blue-500/50'
                        : index < currentStep
                          ? 'bg-green-500/10 border border-green-500/30 hover:bg-green-500/20'
                          : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        index === currentStep
                          ? 'bg-blue-500 text-white'
                          : index < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-700 text-gray-400'
                      }`}>
                        {index < currentStep ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold ${
                          index === currentStep
                            ? 'text-white'
                            : index < currentStep
                              ? 'text-green-400'
                              : 'text-gray-400'
                        }`}>
                          {step.title}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {step.description}
                        </p>
                        {step.isValid && index <= currentStep && (
                          <div className="flex items-center mt-2">
                            <Check className="w-3 h-3 text-green-400 mr-1" />
                            <span className="text-green-400 text-xs">Válido</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Tips Section */}
              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h3 className="text-blue-400 font-semibold mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Dica
                </h3>
                <p className="text-gray-300 text-sm">
                  {currentStep === 0 && "Escolha um nome memorable e uma descrição que capture a essência da sua campanha."}
                  {currentStep === 1 && "O cenário define o tom da sua campanha. Escolha aquele que mais se adequa à sua visão."}
                  {currentStep === 2 && "Considere bem o número de jogadores. Grupos menores permitem mais roleplay individual."}
                  {currentStep === 3 && "Use tags para ajudar jogadores a encontrar sua campanha se ela for pública."}
                  {currentStep === 4 && "Revise todas as informações antes de criar sua campanha épica!"}
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">
            <div className="max-w-5xl mx-auto">
              {/* Step Content */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8">
                {renderCurrentStep()}
              </div>

              {/* Navigation Footer */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handleBack}
                  disabled={!canGoBack}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    canGoBack
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <div className="flex space-x-4">
                  {currentStep === steps.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || !canProceedToNext}
                      className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                        !isLoading && canProceedToNext
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/25'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Crown className="w-4 h-4" />
                      )}
                      <span>{isLoading ? 'Criando...' : 'Criar Campanha'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={!canProceedToNext}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                        canProceedToNext
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Próximo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CampaignCreationWizard;