// ===========================
// PLAYERS CONFIG STEP - ATUALIZADO
// src/components/campaign-creation/steps/PlayersConfigStep.tsx
// ===========================
"use client";

import React from 'react';
import { useCreateCampaignContext } from '@/hooks/useCreateCampaign';
import { 
  Users, 
  Eye, 
  EyeOff, 
  MessageCircle, 
  AlertCircle, 
  Info,
  UserPlus,
  Shield,
  Crown,
  User
} from 'lucide-react';

const PlayersConfigStep: React.FC = () => {
  const { 
    formData, 
    setFormData, 
    errors, 
    validateFieldRealTime, 
    clearFieldError,
    user
  } = useCreateCampaignContext();

  const playerCounts = [
    { count: 3, label: 'Íntimo', description: 'Mais roleplay, desenvolvimento profundo', icon: '👥' },
    { count: 4, label: 'Clássico', description: 'Equilíbrio perfeito de grupo', icon: '⚖️' },
    { count: 5, label: 'Dinâmico', description: 'Muitas interações, energia alta', icon: '⚡' },
    { count: 6, label: 'Épico', description: 'Grandes batalhas, múltiplas tramas', icon: '⚔️' },
    { count: 7, label: 'Desafio', description: 'Muitos personagens, narrativa complexa', icon: '🧠' },
    { count: 8, label: 'Extremo', description: 'Apenas para mestres experientes', icon: '🔥' },
  ];

  const handlePlayerCountSelect = (count: number) => {
    setFormData({ max_players: count });
    validateFieldRealTime('max_players', count);
    if (errors.max_players) {
      clearFieldError('max_players');
    }
  };

  const handlePublicToggle = (isPublic: boolean) => {
    setFormData({ is_public: isPublic });
    
    // Se tornar privada, limpar mensagem de recrutamento
    if (!isPublic) {
      setFormData({ is_public: false, recruitment_message: '' });
      clearFieldError('recruitment_message');
    }
  };

  const handleRecruitmentMessageChange = (value: string) => {
    setFormData({ recruitment_message: value });
    validateFieldRealTime('recruitment_message', value);
    if (errors.recruitment_message && value.trim()) {
      clearFieldError('recruitment_message');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Configuração de Jogadores</h2>
        <p className="text-gray-400 text-lg mb-4">
          Configure quantos adventureiros participarão da sua campanha
        </p>
        
        {/* Game Master info */}
        <div className="inline-flex items-center space-x-3 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
          <Crown className="w-5 h-5 text-yellow-500" />
          <span className="text-green-300 text-sm">
            <strong>{user?.username}</strong> como Mestre + jogadores
          </span>
        </div>
      </div>

      {/* Player Count Selection */}
      <div className="space-y-6">
        <div>
          <label className="block text-white font-semibold text-lg mb-4">
            Máximo de Jogadores <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {playerCounts.map((option) => (
              <div
                key={option.count}
                onClick={() => handlePlayerCountSelect(option.count)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 group ${
                  formData.max_players === option.count
                    ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/25'
                    : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-600/30'
                }`}
              >
                <div className="text-center space-y-3">
                  <div className="text-2xl">{option.icon}</div>
                  <div className={`text-2xl font-bold ${
                    formData.max_players === option.count ? 'text-green-400' : 'text-gray-200'
                  }`}>
                    {option.count}
                  </div>
                  <div>
                    <div className={`font-semibold ${
                      formData.max_players === option.count ? 'text-green-400' : 'text-gray-300'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {option.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.max_players && (
            <div className="flex items-center space-x-2 text-red-400 text-sm mt-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.max_players}</span>
            </div>
          )}
        </div>

        {/* Public/Private Toggle */}
        <div className="max-w-2xl mx-auto space-y-4">
          <label className="block text-white font-semibold text-lg">
            Visibilidade da Campanha
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Private Option */}
            <div
              onClick={() => handlePublicToggle(false)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                !formData.is_public
                  ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25'
                  : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500'
              }`}
            >
              <div className="text-center space-y-3">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${
                  !formData.is_public ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-400'
                }`}>
                  <EyeOff className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${
                    !formData.is_public ? 'text-blue-400' : 'text-gray-200'
                  }`}>
                    Privada
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Apenas jogadores convidados podem ver e participar
                  </p>
                </div>
              </div>
            </div>

            {/* Public Option */}
            <div
              onClick={() => handlePublicToggle(true)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                formData.is_public
                  ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/25'
                  : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500'
              }`}
            >
              <div className="text-center space-y-3">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${
                  formData.is_public ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-400'
                }`}>
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${
                    formData.is_public ? 'text-green-400' : 'text-gray-200'
                  }`}>
                    Pública
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Outros jogadores podem descobrir e se candidatar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recruitment Message (only if public) */}
        {formData.is_public && (
          <div className="max-w-2xl mx-auto space-y-2">
            <label className="block text-white font-semibold text-lg">
              Mensagem de Recrutamento <span className="text-red-400">*</span>
            </label>
            <p className="text-gray-400 text-sm">
              O que você quer dizer para atrair os jogadores ideais?
            </p>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                value={formData.recruitment_message}
                onChange={(e) => handleRecruitmentMessageChange(e.target.value)}
                placeholder="Procuramos jogadores que valorizem roleplay e trabalho em equipe. Sessões às quartas, 20h. Iniciantes são bem-vindos!"
                rows={4}
                maxLength={500}
                className={`w-full pl-12 pr-4 py-3 bg-gray-700/50 border-2 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none ${
                  errors.recruitment_message 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-600/50 focus:border-blue-500'
                }`}
              />
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {formData.recruitment_message.length}/500
              </div>
            </div>
            {errors.recruitment_message && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.recruitment_message}</span>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {formData.max_players > 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-green-400 font-semibold text-lg mb-2">
                    Configuração de Mesa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Mestre:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="text-white font-medium">{user?.username}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Jogadores:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">
                          Até {formData.max_players} jogadores
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Visibilidade:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {formData.is_public ? (
                          <>
                            <Eye className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-medium">Pública</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 font-medium">Privada</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Total na mesa:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-medium">
                          {formData.max_players + 1} pessoas
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="max-w-2xl mx-auto bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-orange-400 font-semibold mb-2">Dicas de Mesa</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• <strong>3-4 jogadores:</strong> Mais foco individual, roleplay profundo</li>
                <li>• <strong>5-6 jogadores:</strong> Equilíbrio ideal entre dinâmica e gestão</li>
                <li>• <strong>7-8 jogadores:</strong> Muita energia, mas requer experiência</li>
                <li>• <strong>Campanhas públicas:</strong> Atraem mais diversidade de jogadores</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Validation Status */}
        {formData.max_players > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium">
                Configuração de jogadores válida!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersConfigStep;