// src/components/campaign-creation/feedback/ValidationComponents.tsx
"use client";

import React, { useState } from 'react';
import { 
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  X,
  Lightbulb,
  Target,
  Users,
  Zap,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Indicador de força da campanha
export const CampaignStrengthIndicator: React.FC<{ formData: any }> = ({ formData }) => {
  const calculateStrength = () => {
    let score = 0;
    let maxScore = 10;
    
    // Nome (obrigatório)
    if (formData.name && formData.name.length >= 3) score += 2;
    
    // Descrição
    if (formData.description && formData.description.length >= 50) score += 2;
    
    // Cenário
    if (formData.setting) score += 1;
    
    // Nome do mundo
    if (formData.world_name) score += 1;
    
    // Configuração de jogadores
    if (formData.max_players >= 3 && formData.max_players <= 8) score += 1;
    
    // Mensagem de recrutamento (se pública)
    if (!formData.is_public || formData.recruitment_message) score += 1;
    
    // Tags
    if (formData.tags && formData.tags.length >= 2) score += 1;
    
    // Notas do mestre
    if (formData.gm_notes && formData.gm_notes.length >= 20) score += 1;
    
    return { score, maxScore };
  };

  const { score, maxScore } = calculateStrength();
  const percentage = (score / maxScore) * 100;
  
  const getStrengthLevel = () => {
    if (percentage >= 90) return { level: 'Épica', color: 'text-purple-400', bg: 'bg-purple-500' };
    if (percentage >= 70) return { level: 'Forte', color: 'text-green-400', bg: 'bg-green-500' };
    if (percentage >= 50) return { level: 'Boa', color: 'text-blue-400', bg: 'bg-blue-500' };
    if (percentage >= 30) return { level: 'Básica', color: 'text-yellow-400', bg: 'bg-yellow-500' };
    return { level: 'Incompleta', color: 'text-red-400', bg: 'bg-red-500' };
  };

  const strength = getStrengthLevel();

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-400" />
          Qualidade da Campanha
        </h3>
        <span className={`text-sm font-bold ${strength.color}`}>
          {strength.level}
        </span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${strength.bg}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-400">
        {score}/{maxScore} elementos completos ({Math.round(percentage)}%)
      </div>
    </div>
  );
};

// Tooltip informativo
export const InfoTooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ 
  content, 
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs border border-gray-700 shadow-lg">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Validador de campo em tempo real
export const FieldValidator: React.FC<{ 
  value: any; 
  rules: Array<{ test: (value: any) => boolean; message: string; type: 'error' | 'warning' | 'success' }>;
  showWhen?: 'always' | 'touched' | 'error';
}> = ({ value, rules, showWhen = 'always' }) => {
  const results = rules.map(rule => ({
    ...rule,
    passed: rule.test(value)
  }));

  const hasErrors = results.some(r => r.type === 'error' && !r.passed);
  const hasWarnings = results.some(r => r.type === 'warning' && !r.passed);
  const allPassed = results.every(r => r.passed);

  if (showWhen === 'error' && !hasErrors) return null;
  if (showWhen === 'touched' && !value) return null;

  return (
    <div className="space-y-1 mt-2">
      {results.map((result, index) => (
        <div key={index} className={`flex items-center space-x-2 text-xs ${
          result.passed 
            ? result.type === 'success' ? 'text-green-400' : 'text-gray-500'
            : result.type === 'error' ? 'text-red-400' : 'text-yellow-400'
        }`}>
          {result.passed ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          <span>{result.message}</span>
        </div>
      ))}
    </div>
  );
};

// Sugestões inteligentes
export const SmartSuggestions: React.FC<{ 
  field: string; 
  value: string; 
  onSuggestionClick: (suggestion: string) => void;
}> = ({ field, value, onSuggestionClick }) => {
  const getSuggestions = () => {
    switch (field) {
      case 'name':
        if (value.length < 3) {
          return [
            'Crônicas de Pedraverde',
            'A Lenda dos Cinco Reinos',
            'Sombras do Norte',
            'Guardiões da Floresta Antiga',
            'Segredos da Torre de Cristal'
          ];
        }
        return [];
        
      case 'description':
        if (value.length < 20) {
          return [
            'Uma jornada épica através de terras místicas...',
            'Heróis improváveis devem unir forças para...',
            'Em um mundo onde a magia está desaparecendo...',
            'Antigas profecias falam de aventureiros corajosos...'
          ];
        }
        return [];
        
      case 'world_name':
        if (!value) {
          return [
            'Aerindale',
            'Valerium',
            'Drakmoor',
            'Elisande',
            'Thornwick'
          ];
        }
        return [];
        
      default:
        return [];
    }
  };

  const suggestions = getSuggestions();
  
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        <Lightbulb className="w-4 h-4 text-blue-400" />
        <span className="text-blue-400 text-sm font-medium">Sugestões</span>
      </div>
      <div className="space-y-1">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="block w-full text-left text-sm text-gray-300 hover:text-white hover:bg-blue-500/20 px-2 py-1 rounded transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

// Indicador de progresso por seção
export const SectionProgress: React.FC<{ sections: Array<{ name: string; completed: boolean; total: number; current: number }> }> = ({ sections }) => {
  return (
    <div className="space-y-3">
      {sections.map((section, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            section.completed ? 'bg-green-500' : 'bg-gray-700'
          }`}>
            {section.completed ? (
              <CheckCircle className="w-4 h-4 text-white" />
            ) : (
              <span className="text-xs font-bold text-gray-400">{section.current}</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm font-medium ${
                section.completed ? 'text-green-400' : 'text-gray-300'
              }`}>
                {section.name}
              </span>
              <span className="text-xs text-gray-400">
                {section.current}/{section.total}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  section.completed ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${(section.current / section.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Alerta contextual
export const ContextualAlert: React.FC<{ 
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
}> = ({ type, title, message, dismissible = false, onDismiss, action }) => {
  const getStyles = () => {
    switch (type) {
      case 'info':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          text: 'text-blue-400',
          icon: Info
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          text: 'text-yellow-400',
          icon: AlertCircle
        };
      case 'error':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          text: 'text-red-400',
          icon: AlertCircle
        };
      case 'success':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          text: 'text-green-400',
          icon: CheckCircle
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.icon;

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-xl p-4`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 ${styles.text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${styles.text} mb-1`}>{title}</h3>
          <p className="text-gray-300 text-sm">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-sm font-medium ${styles.text} hover:underline`}
            >
              {action.label}
            </button>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`${styles.text} hover:text-gray-300 transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Dicas expansíveis
export const ExpandableTips: React.FC<{ tips: Array<{ title: string; content: string; category?: string }> }> = ({ tips }) => {
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      <h3 className="text-white font-semibold text-sm flex items-center">
        <HelpCircle className="w-4 h-4 mr-2 text-blue-400" />
        Dicas Úteis
      </h3>
      
      {tips.map((tip, index) => (
        <div key={index} className="border border-gray-700/50 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedTip(expandedTip === index ? null : index)}
            className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
          >
            <span className="text-gray-300 text-sm font-medium">{tip.title}</span>
            {expandedTip === index ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {expandedTip === index && (
            <div className="p-3 pt-0 border-t border-gray-700/50 bg-gray-800/30">
              <p className="text-gray-400 text-sm leading-relaxed">{tip.content}</p>
              {tip.category && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  {tip.category}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Medidor de completude
export const CompletenessGauge: React.FC<{ 
  completedItems: number; 
  totalItems: number; 
  requiredItems: number;
}> = ({ completedItems, totalItems, requiredItems }) => {
  const completionPercentage = (completedItems / totalItems) * 100;
  const requiredPercentage = (requiredItems / totalItems) * 100;
  const isMinimumMet = completedItems >= requiredItems;

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-400" />
          Completude
        </h3>
        <span className={`text-sm font-bold ${
          isMinimumMet ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {completedItems}/{totalItems}
        </span>
      </div>
      
      <div className="relative w-full bg-gray-700 rounded-full h-3 mb-2">
        {/* Required threshold line */}
        <div 
          className="absolute top-0 h-3 w-0.5 bg-white/50"
          style={{ left: `${requiredPercentage}%` }}
        />
        
        {/* Completion bar */}
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${
            isMinimumMet ? 'bg-green-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-400">
        <span>Mínimo: {requiredItems}</span>
        <span>{Math.round(completionPercentage)}% completo</span>
      </div>
    </div>
  );
};

// Validação de nome único
export const UniqueNameValidator: React.FC<{ 
  name: string; 
  onCheckComplete: (isUnique: boolean) => void;
}> = ({ name, onCheckComplete }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isUnique, setIsUnique] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (name.length < 3) {
      setIsUnique(null);
      return;
    }

    setIsChecking(true);
    
    // Simular verificação de nome único
    const timer = setTimeout(() => {
      const unique = !['test', 'admin', 'default'].includes(name.toLowerCase());
      setIsUnique(unique);
      setIsChecking(false);
      onCheckComplete(unique);
    }, 1000);

    return () => clearTimeout(timer);
  }, [name, onCheckComplete]);

  if (name.length < 3) return null;

  return (
    <div className="flex items-center space-x-2 mt-1">
      {isChecking ? (
        <>
          <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-blue-400 text-xs">Verificando disponibilidade...</span>
        </>
      ) : isUnique !== null ? (
        <>
          {isUnique ? (
            <CheckCircle className="w-3 h-3 text-green-400" />
          ) : (
            <AlertCircle className="w-3 h-3 text-red-400" />
          )}
          <span className={`text-xs ${isUnique ? 'text-green-400' : 'text-red-400'}`}>
            {isUnique ? 'Nome disponível' : 'Nome já existe'}
          </span>
        </>
      ) : null}
    </div>
  );
};

export default {
  CampaignStrengthIndicator,
  InfoTooltip,
  FieldValidator,
  SmartSuggestions,
  SectionProgress,
  ContextualAlert,
  ExpandableTips,
  CompletenessGauge,
  UniqueNameValidator
};