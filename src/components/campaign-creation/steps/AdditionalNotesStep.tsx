// src/components/campaign-creation/steps/AdditionalNotesStep.tsx
"use client";

import React from 'react';
import { useCreateCampaignContext } from '@/hooks/useCreateCampaign';
import { CAMPAIGN_TAGS } from '@/types/createCampaign';
import { 
  FileText, 
  Tags, 
  X, 
  AlertCircle,
  Users,
  Sword,
  Globe,
  Crown,
  Eye,
  Heart,
  Zap,
  Shield,
  MapPin,
  Trees,
  Anchor,
  Lightbulb,
  CheckCircle
} from 'lucide-react';

const AdditionalNotesStep: React.FC = () => {
  const { 
    formData, 
    setFormData, 
    errors, 
    validateFieldRealTime, 
    clearFieldError 
  } = useCreateCampaignContext();

  // Mapeamento de ícones para tags (baseado nas CAMPAIGN_TAGS atuais)
  const tagIcons = {
    'roleplay': Users,
    'combat': Sword,
    'exploration': Globe,
    'political': Crown,
    'mystery': Eye,
    'horror': Heart,
    'comedy': Zap,
    'intrigue': Shield,
    'urban': MapPin,
    'wilderness': Trees,
    'dungeon': Shield,
    'seafaring': Anchor,
  };

  const tagDescriptions = {
    'roleplay': 'Foco em interpretação e desenvolvimento de personagem',
    'combat': 'Batalhas táticas e encontros desafiadores',
    'exploration': 'Descoberta de novos lugares e mistérios',
    'political': 'Intriga, diplomacia e jogos de poder',
    'mystery': 'Enigmas para resolver e segredos para descobrir',
    'horror': 'Atmosfera sombria e elementos de terror',
    'comedy': 'Tom leve, humor e diversão',
    'intrigue': 'Conspirações, espionagem e traições',
    'urban': 'Aventuras em cidades e centros urbanos',
    'wilderness': 'Sobrevivência e exploração selvagem',
    'dungeon': 'Exploração de masmorras e ruínas antigas',
    'seafaring': 'Aventuras marítimas e exploração oceânica',
  };

  const availableTags = CAMPAIGN_TAGS.map(tag => ({
    id: tag,
    name: tag.charAt(0).toUpperCase() + tag.slice(1),
    icon: tagIcons[tag] || Tags,
    description: tagDescriptions[tag] || 'Estilo de campanha',
  }));

  const selectedTags = formData.tags || [];

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(t => t !== tagId)
      : [...selectedTags, tagId];
    
    setFormData({ tags: newTags });
    validateFieldRealTime('tags', newTags);
  };

  const handleNotesChange = (value: string) => {
    setFormData({ gm_notes: value });
    validateFieldRealTime('gm_notes', value);
    if (errors.gm_notes && value.trim()) {
      clearFieldError('gm_notes');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Notas e Finalização</h2>
        <p className="text-gray-400 text-lg">
          Adicione tags e suas anotações pessoais para finalizar sua campanha
        </p>
      </div>

      {/* Tags Selection */}
      <div className="space-y-6">
        <div>
          <label className="block text-white font-semibold text-lg mb-4">
            Tags da Campanha
          </label>
          <p className="text-gray-400 text-sm mb-6">
            Selecione tags que descrevam o estilo e foco da sua campanha. Isso ajudará jogadores a encontrar exatamente o que procuram.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 hover:scale-105 border-2 ${
                  selectedTags.includes(tag.id)
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-lg shadow-orange-500/25'
                    : 'bg-gray-700/30 border-gray-600/50 text-gray-300 hover:bg-gray-600/30 hover:border-gray-500'
                }`}
              >
                <tag.icon className="w-5 h-5 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-medium text-sm">{tag.name}</div>
                  <div className="text-xs opacity-75 truncate">{tag.description}</div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <h3 className="text-orange-400 font-semibold mb-3 text-sm">Tags Selecionadas ({selectedTags.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tagId) => {
                  const tag = availableTags.find(t => t.id === tagId);
                  return tag ? (
                    <span
                      key={tagId}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm border border-orange-500/30"
                    >
                      <tag.icon className="w-3 h-3" />
                      <span>{tag.name}</span>
                      <button
                        onClick={() => toggleTag(tagId)}
                        className="hover:text-orange-300 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
          
          {errors.tags && (
            <div className="flex items-center space-x-2 text-red-400 text-sm mt-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.tags}</span>
            </div>
          )}
        </div>

        {/* GM Notes */}
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="space-y-2">
            <label className="block text-white font-semibold text-lg">
              Notas do Mestre
            </label>
            <p className="text-gray-400 text-sm">
              Suas anotações pessoais sobre a campanha. Apenas você poderá ver estas informações.
            </p>
            <div className="relative">
              <textarea
                value={formData.gm_notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Anote suas ideias iniciais, ganchos para aventuras, NPCs importantes, segredos do mundo, ou qualquer coisa que queira lembrar mais tarde..."
                rows={8}
                maxLength={2000}
                className={`w-full px-4 py-4 bg-gray-700/50 border-2 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none ${
                  errors.gm_notes 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-600/50 focus:border-blue-500'
                }`}
              />
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {formData.gm_notes.length}/2000
              </div>
            </div>
            {errors.gm_notes && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.gm_notes}</span>
              </div>
            )}
          </div>

          {/* Tips for GM Notes */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-purple-400 font-semibold mb-2">Ideias para suas notas</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• <strong>NPCs principais:</strong> Nomes, personalidades e motivações</li>
                  <li>• <strong>Ganchos iniciais:</strong> Como os personagens se conhecem</li>
                  <li>• <strong>Segredos do mundo:</strong> Mistérios que só você conhece</li>
                  <li>• <strong>Arcos narrativos:</strong> Onde quer que a história vá</li>
                  <li>• <strong>Regras da mesa:</strong> Adaptações ou house rules</li>
                  <li>• <strong>Inspirações:</strong> Filmes, livros ou jogos que inspiraram</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Status */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              {selectedTags.length > 0 || formData.gm_notes.length > 0 
                ? 'Seção personalizada concluída!' 
                : 'Personalize sua campanha com tags e notas'
              }
            </span>
          </div>
        </div>

        {/* Pre-creation Summary */}
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
          <div className="text-center mb-4">
            <h3 className="text-blue-400 font-semibold text-lg">Sua campanha está quase pronta!</h3>
            <p className="text-gray-400 text-sm mt-1">
              No próximo passo você poderá revisar todas as informações antes de criar oficialmente sua campanha.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-gray-400">Informações básicas</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-gray-400">Mundo configurado</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-gray-400">Jogadores definidos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalNotesStep;