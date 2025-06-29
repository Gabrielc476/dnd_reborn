// src/components/campaign-creation/steps/BasicInfoStep.tsx
"use client";

import React from 'react';
import { useCreateCampaignContext } from '@/hooks/useCreateCampaign';
import { AlertCircle, BookOpen, FileText } from 'lucide-react';

const BasicInfoStep: React.FC = () => {
  const { 
    formData, 
    setFormData, 
    errors, 
    validateFieldRealTime, 
    clearFieldError 
  } = useCreateCampaignContext();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    // Atualizar valor
    setFormData({ [field]: value });
    
    // Validar em tempo real
    validateFieldRealTime(field, value);
    
    // Limpar erro se usuário começou a corrigir
    if (errors[field] && value.trim()) {
      clearFieldError(field);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Informações Básicas</h2>
        <p className="text-gray-400 text-lg">
          Vamos começar com as informações essenciais da sua campanha épica
        </p>
      </div>

      {/* Form Fields */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Nome da Campanha */}
        <div className="space-y-2">
          <label className="block text-white font-semibold text-lg">
            Nome da Campanha <span className="text-red-400">*</span>
          </label>
          <p className="text-gray-400 text-sm">
            Escolha um nome memorable que capture a essência da sua aventura
          </p>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: A Lenda dos Cinco Reinos, Crônicas de Pedraverde..."
              maxLength={100}
              className={`w-full px-4 py-4 bg-gray-700/50 border-2 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg ${
                errors.name 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-600/50 focus:border-blue-500'
              }`}
            />
            <div className="absolute bottom-2 right-3 text-xs text-gray-400">
              {formData.name.length}/100
            </div>
          </div>
          {errors.name && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.name}</span>
            </div>
          )}
        </div>

        {/* Descrição da Campanha */}
        <div className="space-y-2">
          <label className="block text-white font-semibold text-lg">
            Descrição da Campanha
          </label>
          <p className="text-gray-400 text-sm">
            Descreva o que os jogadores podem esperar desta campanha. Qual é o tom? Que tipo de aventuras os aguardam?
          </p>
          <div className="relative">
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Em um mundo onde a magia está desaparecendo, heróis improváveis devem descobrir o mistério por trás do fenômeno antes que seja tarde demais..."
              rows={5}
              maxLength={1000}
              className={`w-full px-4 py-4 bg-gray-700/50 border-2 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none ${
                errors.description 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-600/50 focus:border-blue-500'
              }`}
            />
            <div className="absolute bottom-2 right-3 text-xs text-gray-400">
              {formData.description.length}/1000
            </div>
          </div>
          {errors.description && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.description}</span>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <FileText className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-blue-400 font-semibold mb-2">Dicas para um bom início</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Use um nome que seja fácil de lembrar e pronunciar</li>
                <li>• Na descrição, mencione o tom (sério, cômico, épico, horror)</li>
                <li>• Dê uma ideia do tipo de aventuras (exploração, política, combate)</li>
                <li>• Evite spoilers! Deixe mistério para atrair jogadores</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Validation Status */}
        {formData.name && (
          <div className="text-center">
            {formData.name.length >= 3 ? (
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">Informações básicas válidas!</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm font-medium">Nome precisa ter pelo menos 3 caracteres</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInfoStep;