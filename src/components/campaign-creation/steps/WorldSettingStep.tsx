// src/components/campaign-creation/steps/WorldSettingStep.tsx
"use client";

import React from 'react';
import { useCreateCampaignContext } from '@/hooks/useCreateCampaign';
import { 
  Globe, 
  Star, 
  Settings, 
  Heart, 
  Shield, 
  Book, 
  MapPin,
  Sparkles,
  AlertCircle 
} from 'lucide-react';

const WorldSettingStep: React.FC = () => {
  const { 
    formData, 
    setFormData, 
    errors, 
    validateFieldRealTime, 
    clearFieldError 
  } = useCreateCampaignContext();

  const settingOptions = [
    { 
      id: 'forgotten-realms', 
      name: 'Forgotten Realms', 
      icon: Globe,
      description: 'O cenário clássico de D&D com Faerûn e suas nações épicas',
      features: ['Rico em lore', 'Muitos recursos', 'Familiar aos jogadores']
    },
    { 
      id: 'homebrew', 
      name: 'Mundo Próprio', 
      icon: Star,
      description: 'Crie seu próprio universo único e personalizado',
      features: ['Total liberdade criativa', 'Surpresas garantidas', 'Sua assinatura única']
    },
    { 
      id: 'eberron', 
      name: 'Eberron', 
      icon: Settings,
      description: 'Mundo de magia e tecnologia, noir e aventuras urbanas',
      features: ['Magia industrial', 'Intriga política', 'Tom noir']
    },
    { 
      id: 'ravenloft', 
      name: 'Ravenloft', 
      icon: Heart,
      description: 'Domínios de terror e horror gótico sombrio',
      features: ['Horror psicológico', 'Atmosfera dark', 'Escolhas morais']
    },
    { 
      id: 'dark-sun', 
      name: 'Dark Sun', 
      icon: Shield,
      description: 'Mundo pós-apocalíptico brutal e desértico',
      features: ['Sobrevivência extrema', 'Recursos escassos', 'Tom brutal']
    },
    { 
      id: 'other', 
      name: 'Outro Cenário', 
      icon: Book,
      description: 'Cenário de terceiros ou sistema personalizado',
      features: ['Flexibilidade total', 'Sistemas únicos', 'Adaptações criativas']
    },
  ];

  const handleSettingSelect = (settingId: string) => {
    setFormData({ setting: settingId });
    validateFieldRealTime('setting', settingId);
    if (errors.setting) {
      clearFieldError('setting');
    }
  };

  const handleWorldNameChange = (value: string) => {
    setFormData({ world_name: value });
    validateFieldRealTime('world_name', value);
    if (errors.world_name && value.trim()) {
      clearFieldError('world_name');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Mundo e Ambientação</h2>
        <p className="text-gray-400 text-lg">
          Escolha o cenário que melhor se adequa à sua visão épica
        </p>
      </div>

      {/* Setting Selection */}
      <div className="space-y-6">
        <div>
          <label className="block text-white font-semibold text-lg mb-4">
            Cenário da Campanha <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settingOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => handleSettingSelect(option.id)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 group ${
                  formData.setting === option.id
                    ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25'
                    : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-600/30'
                }`}
              >
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                    formData.setting === option.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-600 text-gray-400 group-hover:bg-gray-500'
                  }`}>
                    <option.icon className="w-6 h-6" />
                  </div>
                  
                  <div>
                    <h3 className={`font-bold text-lg transition-colors ${
                      formData.setting === option.id ? 'text-blue-400' : 'text-gray-200'
                    }`}>
                      {option.name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                      {option.description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {option.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                        <span className="text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.setting && (
            <div className="flex items-center space-x-2 text-red-400 text-sm mt-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.setting}</span>
            </div>
          )}
        </div>

        {/* World Name */}
        <div className="max-w-2xl mx-auto space-y-2">
          <label className="block text-white font-semibold text-lg">
            Nome do Mundo
          </label>
          <p className="text-gray-400 text-sm">
            Como os habitantes chamam este mundo? (Opcional)
          </p>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.world_name}
              onChange={(e) => handleWorldNameChange(e.target.value)}
              placeholder="Ex: Terra-média, Faerun, Athas, Meu Mundo..."
              maxLength={100}
              className={`w-full pl-12 pr-4 py-4 bg-gray-700/50 border-2 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                errors.world_name 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-600/50 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.world_name && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.world_name}</span>
            </div>
          )}
        </div>

        {/* Selected Setting Info */}
        {formData.setting && (
          <div className="max-w-3xl mx-auto">
            {(() => {
              const selectedSetting = settingOptions.find(s => s.id === formData.setting);
              if (!selectedSetting) return null;

              return (
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <selectedSetting.icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-purple-400 font-semibold text-lg mb-2">
                        {selectedSetting.name} Selecionado
                      </h3>
                      <p className="text-gray-300 mb-3">
                        {selectedSetting.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {selectedSetting.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="text-gray-400 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Validation Status */}
        {formData.setting && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium">Mundo configurado!</span>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="max-w-2xl mx-auto bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Book className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-indigo-400 font-semibold mb-2">Dica de Mestre</h3>
              <p className="text-gray-300 text-sm">
                O cenário define o tom da sua campanha. Se for sua primeira vez como mestre, 
                Forgotten Realms oferece muito material de apoio. Se quer total liberdade criativa, 
                vá de mundo próprio! Não há escolha errada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldSettingStep;