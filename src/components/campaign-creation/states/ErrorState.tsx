// src/components/campaign-creation/states/ErrorState.tsx
"use client";
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface CampaignCreationErrorProps {
  error: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

export const CampaignCreationError: React.FC<CampaignCreationErrorProps> = ({ 
  error, 
  onRetry, 
  onGoBack 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-pink-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-16 h-16 text-red-400" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">Oops! Algo deu errado</h2>
        
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
        
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </button>
          )}
          
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200"
            >
              Voltar ao Início
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCreationError;