// src/components/campaign-creation/steps/ReviewStep.tsx
"use client";

import React from 'react';
import { useCreateCampaignContext } from '@/hooks/useCreateCampaign';
import { 
  Crown, 
  CheckCircle, 
  Book, 
  Users, 
  Globe, 
  Tag, 
  FileText,
  Edit2,
  Star,
  Shield,
  Eye,
  EyeOff,
  MessageCircle,
  Scroll
} from 'lucide-react';

const ReviewStep: React.FC = () => {
  const { formData, setCurrentStep } = useCreateCampaignContext();

  const settingDisplayNames = {
    'forgotten-realms': 'Forgotten Realms',
    'homebrew': 'Mundo Próprio', 
    'eberron': 'Eberron',
    'ravenloft': 'Ravenloft',
    'dark-sun': 'Dark Sun',
    'other': 'Outro Cenário',
  };

  const getSectionCompleteness = () => {
    return {
      basicInfo: {
        complete: !!(formData.name && formData.name.length >= 3),
        items: [
          { label: 'Nome da campanha', value: formData.name, complete: !!(formData.name && formData.name.length >= 3) },
          { label: 'Descrição', value: formData.description, complete: !!formData.description },
        ]
      },
      worldSetting: {
        complete: !!formData.setting,
        items: [
          { label: 'Cenário', value: settingDisplayNames[formData.setting] || formData.setting, complete: !!formData.setting },
          { label: 'Nome do mundo', value: formData.world_name, complete: !!formData.world_name },
        ]
      },
      playersConfig: {
        complete: formData.max_players > 0,
        items: [
          { label: 'Máximo de jogadores', value: formData.max_players, complete: formData.max_players > 0 },
          { label: 'Visibilidade', value: formData.is_public ? 'Pública' : 'Privada', complete: true },
          { label: 'Mensagem de recrutamento', value: formData.recruitment_message, complete: !formData.is_public || !!formData.recruitment_message },
        ]
      },
      additional: {
        complete: true, // Sempre verdadeiro pois esta seção é opcional
        items: [
          { label: 'Tags', value: formData.tags?.length > 0 ? `${formData.tags.length} selecionadas` : 'Nenhuma', complete: true },
          { label: 'Notas do mestre', value: formData.gm_notes ? 'Preenchidas' : 'Vazias', complete: true },
        ]
      }
    };
  };

  const sections = getSectionCompleteness();
  const allComplete = Object.values(sections).every(section => section.complete);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Revisão Final</h2>
        <p className="text-gray-400 text-lg">
          Revise todas as informações antes de criar sua campanha épica
        </p>
      </div>

      {/* Campaign Summary Card */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h3 className="text-3xl font-bold text-white">{formData.name || 'Campanha Sem Nome'}</h3>
          </div>
          {formData.description && (
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
              {formData.description}
            </p>
          )}
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-semibold text-xl flex items-center">
                <Book className="w-6 h-6 mr-3 text-blue-400" />
                Informações Básicas
              </h4>
              <button
                onClick={() => setCurrentStep(0)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {sections.basicInfo.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">{item.label}:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${item.complete ? 'text-white' : 'text-gray-500'}`}>
                      {item.value || 'Não definido'}
                    </span>
                    <CheckCircle className={`w-4 h-4 ${item.complete ? 'text-green-400' : 'text-gray-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* World & Setting */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-semibold text-xl flex items-center">
                <Globe className="w-6 h-6 mr-3 text-purple-400" />
                Mundo e Ambientação
              </h4>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {sections.worldSetting.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">{item.label}:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${item.complete ? 'text-white' : 'text-gray-500'}`}>
                      {item.value || 'Não definido'}
                    </span>
                    <CheckCircle className={`w-4 h-4 ${item.complete ? 'text-green-400' : 'text-gray-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Players Configuration */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-semibold text-xl flex items-center">
                <Users className="w-6 h-6 mr-3 text-green-400" />
                Configuração de Jogadores
              </h4>
              <button
                onClick={() => setCurrentStep(2)}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {sections.playersConfig.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">{item.label}:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${item.complete ? 'text-white' : 'text-gray-500'}`}>
                      {item.value}
                    </span>
                    <CheckCircle className={`w-4 h-4 ${item.complete ? 'text-green-400' : 'text-gray-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-semibold text-xl flex items-center">
                <FileText className="w-6 h-6 mr-3 text-orange-400" />
                Notas Adicionais
              </h4>
              <button
                onClick={() => setCurrentStep(3)}
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {sections.additional.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">{item.label}:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${item.complete ? 'text-white' : 'text-gray-500'}`}>
                      {item.value}
                    </span>
                    <CheckCircle className={`w-4 h-4 ${item.complete ? 'text-green-400' : 'text-gray-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tags Display */}
        {formData.tags && formData.tags.length > 0 && (
          <div className="mb-8">
            <h4 className="text-white font-semibold text-lg flex items-center mb-4">
              <Tag className="w-5 h-5 mr-2" />
              Tags da Campanha
            </h4>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium border border-orange-500/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recruitment Message */}
        {formData.is_public && formData.recruitment_message && (
          <div className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
            <h4 className="text-green-400 font-semibold mb-3 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Mensagem de Recrutamento
            </h4>
            <p className="text-gray-300 leading-relaxed">{formData.recruitment_message}</p>
          </div>
        )}

        {/* GM Notes */}
        {formData.gm_notes && (
          <div className="mb-8 p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <h4 className="text-purple-400 font-semibold mb-3 flex items-center">
              <Scroll className="w-5 h-5 mr-2" />
              Notas do Mestre (Privadas)
            </h4>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{formData.gm_notes}</p>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="text-center">
        {allComplete ? (
          <div className="inline-flex items-center space-x-3 px-6 py-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
            <CheckCircle className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Tudo pronto para criar!</div>
              <div className="text-sm text-green-300">Sua campanha está completa e válida</div>
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center space-x-3 px-6 py-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
            <Shield className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Alguns campos obrigatórios faltam</div>
              <div className="text-sm text-yellow-300">Volte aos steps anteriores para completar</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setCurrentStep(0)}
          className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-colors"
        >
          <Book className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Básico</span>
        </button>
        <button
          onClick={() => setCurrentStep(1)}
          className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-colors"
        >
          <Globe className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Mundo</span>
        </button>
        <button
          onClick={() => setCurrentStep(2)}
          className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 hover:bg-green-500/20 transition-colors"
        >
          <Users className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Jogadores</span>
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 hover:bg-orange-500/20 transition-colors"
        >
          <FileText className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Notas</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;