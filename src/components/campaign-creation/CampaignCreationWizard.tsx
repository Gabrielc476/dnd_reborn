// ===========================
// EXEMPLO DE USO DO HOOK ATUALIZADO
// src/components/campaign-creation/CampaignCreationWizard.tsx
// ===========================
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
  User,
  Shield,
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
    saveDraft,
    // ✨ NOVOS: Dados de autenticação
    user,
    isAuthenticated,
    isUserReady,
    getUserInfo,
    errors
  } = useCreateCampaignContext();

  const [draftSaved, setDraftSaved] = React.useState(false);

  // ===========================
  // VERIFICAÇÕES DE AUTENTICAÇÃO
  // ===========================

  // Se usuário não estiver pronto, mostrar loading ou erro
  if (!isUserReady) {
    return (
      <div className="max-w-4xl mx-auto text-center p-12">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Verificando Autenticação
        </h2>
        <p className="text-gray-400 mb-8">
          Aguarde enquanto validamos suas credenciais...
        </p>
        
        {/* Debug info se usuário não estiver pronto */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-800/50 rounded-lg p-4 text-left max-w-md mx-auto">
            <p className="text-gray-300 text-sm mb-2">Debug - Estado de Auth:</p>
            <pre className="text-gray-400 text-xs">
              {JSON.stringify({
                isAuthenticated,
                hasUser: !!user,
                isUserReady,
                userInfo: getUserInfo()
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

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
        // Incluir dados do usuário no resultado
        onComplete({
          ...formData,
          campaign_id: result.campaign?.id,
          created_by: user,
          timestamp: new Date().toISOString()
        });
      } else if (result.error) {
        console.error('Erro na criação:', result.error);
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
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Header com dados do usuário */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Crown className="w-8 h-8 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Criador de Campanhas</h1>
                <p className="text-gray-400 text-sm">
                  Criando como <strong className="text-blue-400">{user?.username}</strong>
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-sm">
                <p className="text-white font-medium">{user?.username}</p>
                <p className="text-blue-300 text-xs">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex-1 text-center ${
                  index <= currentStep ? 'text-blue-400' : 'text-gray-500'
                }`}
              >
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-700'
                }`}>
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <p className="font-medium">{step.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8">
          {renderCurrentStep()}
          
          {/* Erro geral */}
          {errors.general && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">{errors.general}</span>
              </div>
            </div>
          )}
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

          <div className="flex items-center space-x-4">
            {/* Draft Save Status */}
            {draftSaved && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                <Shield className="w-4 h-4" />
                <span>Rascunho salvo</span>
              </div>
            )}

            {/* Save Draft Button */}
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-sm"
            >
              Salvar Rascunho
            </button>

            {/* Next/Submit Button */}
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
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Próximo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Debug Panel - Desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <h3 className="text-white font-semibold mb-2">Debug - Dados do Hook</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400 mb-1">Usuário:</p>
                <pre className="text-gray-300 overflow-x-auto">
                  {JSON.stringify(getUserInfo(), null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Form Data:</p>
                <pre className="text-gray-300 overflow-x-auto">
                  {JSON.stringify({
                    name: formData.name,
                    setting: formData.setting,
                    max_players: formData.max_players,
                    is_public: formData.is_public,
                    tags: formData.tags
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignCreationWizard;