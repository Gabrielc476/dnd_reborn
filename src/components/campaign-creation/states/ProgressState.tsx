// src/components/campaign-creation/states/ProgressState.tsx
"use client";
import React from 'react';
import { Sparkles } from 'lucide-react';

interface CampaignCreationProgressProps {
  progress?: number;
}

export const CampaignCreationProgress: React.FC<CampaignCreationProgressProps> = ({ 
  progress = 0 
}) => {
  const steps = [
    'Validando informações...',
    'Criando estrutura da campanha...',
    'Configurando mundo...',
    'Preparando jogadores...',
    'Finalizando configuração...',
    'Quase pronto!'
  ];

  const currentStepIndex = Math.floor((progress / 100) * steps.length);
  const currentStep = steps[currentStepIndex] || steps[0];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md mx-auto border border-gray-700">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-8 h-8 text-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          
          <h3 className="text-white text-xl font-bold mb-2">Criando sua Campanha</h3>
          <p className="text-gray-400 mb-6">{currentStep}</p>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-gray-500 text-sm">{progress}% concluído</p>
        </div>
      </div>
    </div>
  );
};

export default CampaignCreationProgress;
