// src/components/campaign-creation/states/SuccessState.tsx
"use client";
import React from 'react';
import { CheckCircle, Crown, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

interface CampaignCreationSuccessProps {
  campaignName: string;
  onViewCampaign?: () => void;
  onCreateAnother?: () => void;
}

export const CampaignCreationSuccess: React.FC<CampaignCreationSuccessProps> = ({ 
  campaignName, 
  onViewCampaign, 
  onCreateAnother 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-20 h-20 text-green-400" />
          </div>
          
          <div className="absolute top-0 left-1/4 animate-bounce">
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="absolute top-10 right-1/4 animate-bounce animation-delay-1000">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          🎉 Campanha Criada com Sucesso!
        </h1>
        
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-green-400 mb-2">
            "{campaignName}"
          </h2>
          <p className="text-gray-300">
            Sua campanha épica está pronta para receber aventureiros! 
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onViewCampaign && (
            <button
              onClick={onViewCampaign}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25"
            >
              <Crown className="w-5 h-5" />
              <span>Ver Campanha</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          
          {onCreateAnother && (
            <button
              onClick={onCreateAnother}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Criar Outra Campanha</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCreationSuccess;