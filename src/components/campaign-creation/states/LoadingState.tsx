// src/components/campaign-creation/states/LoadingState.tsx
"use client";
import React from 'react';
import { Crown, Loader2 } from 'lucide-react';

export const CampaignCreationLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <Crown className="w-12 h-12 text-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Preparando o Criador de Campanhas</h2>
        <p className="text-gray-400">Carregando suas ferramentas épicas...</p>
        
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-200"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCreationLoading;