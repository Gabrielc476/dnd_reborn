// src/components/campaign-creation/steps/PlayersConfigStep.tsx
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
  Shield
} from 'lucide-react';

const PlayersConfigStep: React.FC = () => {
  const { 
    formData, 
    setFormData, 
    errors, 
    validateFieldRealTime, 
    clearFieldError 
  } = useCreateCampaignContext();

  const playerCounts = [
    { count: 3, label: 'Íntimo', description: 'Mais roleplay, desenvolvimento profundo' },
    { count: 4, label: 'Clássico', description: 'Equilíbrio perfeito de grupo' },
    { count: 5, label: 'Dinâmico', description: 'Muitas interações, energia alta' },
    { count: 6, label: 'Épico', description: 'Grandes batalhas, múltiplas tramas' },
    { count: 7, label: 'Desafio', description: 'Muitos personagens, narrativa complexa' },
    { count: 8, label: 'Extremo', description: 'Apenas para mestres experientes' },
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
        <p className="text-gray-400 text-lg">
          Configure quantos aventureiros farão parte da sua história
        </p>
      </div>

      {/* Player Count Selection */}
      <div className="space-y-6">
        <div>
          <label className="block text-white font-semibold text-lg mb-4">
            Número Máximo de Jogadores <span className="text-red-400">*</span>
          </label>
          <p className="text-gray-400 text-sm mb-6">
            Considere sua experiência como mestre e o tipo de campanha que quer conduzir
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {playerCounts.map((option) => (
              <div
                key={option.count}
                onClick={() => handlePlayerCountSelect(option.count)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 group ${
                  formData.max_players === option.count
                    ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/25'
                    : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-600/30'
                }`}
              >
                <div className="text-center space-y-3">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                    formData.max_players === option.count
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-600 text-gray-400 group-hover:bg-gray-500'
                  }`}>
                    <span className="text-xl font-bold">{option.count}</span>
                  </div>
                  
                  <div>
                    <h3 className={`font-bold text-lg transition-colors ${
                      formData.max_players === option.count ? 'text-green-400' : 'text-gray-200'
                    }`}>
                      {option.label}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                      {option.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-center space-x-1">
                    {Array.from({ length: option.count }, (_, i) => (
                      <Users 
                        key={i} 
                        className={`w-3 h-3 ${
                          formData.max_players === option.count ? 'text-green-400' : 'text-gray-500'
                        }`} 
                      />
                    ))}
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

        {/* Public Campaign Toggle */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start space-x-4 p-6 bg-gray-700/20 rounded-xl border border-gray-600/30">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              {formData.is_public ? <Eye className="w-6 h-6 text-white" /> : <EyeOff className="w-6 h-6 text-white" />}
            </div>
            <div className="flex-1">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => handlePublicToggle(e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                  formData.is_public ? 'bg-blue-500' : 'bg-gray-600'
                }`}>
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    formData.is_public ? 'transform translate-x-7' : ''
                  }`} />
                </div>
                <div className="ml-4">
                  <span className="text-white font-semibold text-lg">Campanha Pública</span>
                  <p className="text-gray-400 text-sm mt-1">
                    {formData.is_public 
                      ? 'Outros jogadores podem ver e se candidatar à sua campanha'
                      : 'Apenas jogadores convidados podem participar'
                    }
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Recruitment Message (only if public) */}
        {formData.is_public && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="space-y-2">
              <label className="block text-white font-semibold text-lg">
                Mensagem de Recrutamento
              </label>
              <p className="text-gray-400 text-sm">
                Explique que tipo de jogadores você procura e o que eles podem esperar
              </p>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                <textarea
                  value={formData.recruitment_message}
                  onChange={(e) => handleRecruitmentMessageChange(e.target.value)}
                  placeholder="Procuro jogadores experientes para uma campanha épica de high fantasy. Sessões semanais às sextas-feiras, 19h. Esperamos compromisso e muito roleplay!"
                  rows={4}
                  maxLength={500}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-700/50 border-2 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none ${
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

            {/* Tips for recruitment */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <UserPlus className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-blue-400 font-semibold mb-2 text-sm">Dicas para recrutamento</h3>
                  <ul className="text-gray-300 text-xs space-y-1">
                    <li>• Mencione o nível de experiência desejado</li>
                    <li>• Informe horários e frequência das sessões</li>
                    <li>• Deixe claro o tom da campanha (sério/casual)</li>
                    <li>• Mencione se há regras específicas da mesa</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Summary */}
        {formData.max_players && (
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-green-400 font-semibold text-lg mb-2">
                  Configuração de Mesa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Máximo de jogadores:</span>
                    <span className="text-white font-semibold ml-2">{formData.max_players}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Visibilidade:</span>
                    <span className="text-white font-semibold ml-2">
                      {formData.is_public ? 'Pública' : 'Privada'}
                    </span>
                  </div>
                  {formData.is_public && (
                    <div className="md:col-span-2">
                      <span className="text-gray-400">Recrutamento:</span>
                      <span className="text-white font-semibold ml-2">
                        {formData.recruitment_message ? 'Ativo' : 'Pendente'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="max-w-2xl mx-auto bg-gray-500/10 border border-gray-500/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-gray-400 font-semibold mb-1 text-sm">Lembre-se</h3>
              <p className="text-gray-300 text-xs">
                Você poderá alterar essas configurações depois da criação da campanha. 
                O importante é começar com um número que você se sinta confortável para mestrar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayersConfigStep;