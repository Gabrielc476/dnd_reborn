// src/hooks/useCampaignWizardUtils.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCreateCampaignContext } from './useCreateCampaign';
import { CampaignFormData } from '@/types/createCampaign';

interface WizardUtilsOptions {
  autoSaveInterval?: number;
  enableBeforeUnload?: boolean;
  trackAnalytics?: boolean;
}

export const useCampaignWizardUtils = (options: WizardUtilsOptions = {}) => {
  const {
    autoSaveInterval = 30000, // 30 segundos
    enableBeforeUnload = true,
    trackAnalytics = false
  } = options;

  const { formData, currentStep, saveDraft } = useCreateCampaignContext();
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [sessionStartTime] = useState(new Date());
  const [stepTimeSpent, setStepTimeSpent] = useState<Record<number, number>>({});
  
  const lastFormDataRef = useRef<CampaignFormData>(formData);
  const stepStartTimeRef = useRef<Date>(new Date());

  // ===========================
  // AUTO-SAVE FUNCTIONALITY
  // ===========================

  const autoSave = useCallback(async () => {
    try {
      await saveDraft();
      setLastSaveTime(new Date());
      setHasUnsavedChanges(false);
      
      if (trackAnalytics) {
        console.log('📊 Auto-save completed', {
          step: currentStep,
          timestamp: new Date().toISOString(),
          formCompleteness: calculateFormCompleteness(formData)
        });
      }
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  }, [saveDraft, currentStep, formData, trackAnalytics]);

  // Track form changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(lastFormDataRef.current);
    if (hasChanges) {
      setHasUnsavedChanges(true);
      lastFormDataRef.current = formData;
    }
  }, [formData]);

  // Auto-save interval
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const interval = setInterval(() => {
      if (hasUnsavedChanges) {
        autoSave();
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, autoSave, autoSaveInterval]);

  // ===========================
  // NAVIGATION PROTECTION
  // ===========================

  useEffect(() => {
    if (!enableBeforeUnload) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Tem certeza que quer sair?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, enableBeforeUnload]);

  // ===========================
  // ANALYTICS & TIME TRACKING
  // ===========================

  useEffect(() => {
    if (!trackAnalytics) return;

    const stepStartTime = stepStartTimeRef.current;
    stepStartTimeRef.current = new Date();

    return () => {
      const timeSpent = new Date().getTime() - stepStartTime.getTime();
      setStepTimeSpent(prev => ({
        ...prev,
        [currentStep]: (prev[currentStep] || 0) + timeSpent
      }));
    };
  }, [currentStep, trackAnalytics]);

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================

  const calculateFormCompleteness = useCallback((data: CampaignFormData): number => {
    const fields = [
      data.name,
      data.description,
      data.setting,
      data.world_name,
      data.max_players,
      data.tags?.length > 0,
      data.recruitment_message || !data.is_public,
      data.gm_notes
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, []);

  const getSessionDuration = useCallback((): number => {
    return new Date().getTime() - sessionStartTime.getTime();
  }, [sessionStartTime]);

  const getStepAnalytics = useCallback(() => {
    if (!trackAnalytics) return null;

    return {
      totalSteps: 5,
      currentStep,
      completeness: calculateFormCompleteness(formData),
      timeSpentPerStep: stepTimeSpent,
      totalSessionTime: getSessionDuration(),
      lastSaveTime,
      hasUnsavedChanges
    };
  }, [currentStep, formData, stepTimeSpent, getSessionDuration, lastSaveTime, hasUnsavedChanges, calculateFormCompleteness, trackAnalytics]);

  const exportFormData = useCallback(() => {
    const dataToExport = {
      formData,
      metadata: {
        createdAt: sessionStartTime.toISOString(),
        lastModified: new Date().toISOString(),
        stepTimeSpent,
        completeness: calculateFormCompleteness(formData)
      }
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-draft-${formData.name || 'untitled'}-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [formData, sessionStartTime, stepTimeSpent, calculateFormCompleteness]);

  const importFormData = useCallback((file: File): Promise<CampaignFormData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data.formData || data);
        } catch (error) {
          reject(new Error('Arquivo inválido'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }, []);

  // ===========================
  // VALIDATION HELPERS
  // ===========================

  const getFieldStrength = useCallback((field: keyof CampaignFormData): 'weak' | 'medium' | 'strong' => {
    const value = formData[field];
    
    switch (field) {
      case 'name':
        if (!value || value.length < 3) return 'weak';
        if (value.length < 10) return 'medium';
        return 'strong';
        
      case 'description':
        if (!value || value.length < 20) return 'weak';
        if (value.length < 100) return 'medium';
        return 'strong';
        
      case 'tags':
        const tags = value as string[];
        if (!tags || tags.length === 0) return 'weak';
        if (tags.length < 3) return 'medium';
        return 'strong';
        
      default:
        return value ? 'strong' : 'weak';
    }
  }, [formData]);

  const getSuggestionForField = useCallback((field: keyof CampaignFormData): string[] => {
    const strength = getFieldStrength(field);
    if (strength === 'strong') return [];

    switch (field) {
      case 'name':
        return [
          'Use um nome que inspire aventura',
          'Evite nomes muito genéricos',
          'Considere incluir o local principal'
        ];
        
      case 'description':
        return [
          'Descreva o tom da campanha (épico, sombrio, cômico)',
          'Mencione o tipo de aventuras esperadas',
          'Inclua ganchos que interessem jogadores'
        ];
        
      case 'tags':
        return [
          'Adicione pelo menos 2-3 tags',
          'Use tags que descrevam o foco principal',
          'Considere o estilo de jogo preferido'
        ];
        
      default:
        return [];
    }
  }, [getFieldStrength]);

  // ===========================
  // RETURN INTERFACE
  // ===========================

  return {
    // State
    hasUnsavedChanges,
    lastSaveTime,
    
    // Actions
    autoSave,
    exportFormData,
    importFormData,
    
    // Analytics
    getSessionDuration,
    getStepAnalytics,
    
    // Validation
    calculateFormCompleteness: () => calculateFormCompleteness(formData),
    getFieldStrength,
    getSuggestionForField,
    
    // Utilities
    sessionStartTime,
    stepTimeSpent
  };
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

export const validateCampaignName = (name: string): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Nome é obrigatório' };
  }
  
  if (name.length < 3) {
    return { isValid: false, message: 'Nome deve ter pelo menos 3 caracteres' };
  }
  
  if (name.length > 100) {
    return { isValid: false, message: 'Nome não pode exceder 100 caracteres' };
  }
  
  if (!/^[a-zA-Z0-9\s\-_'.]+$/.test(name)) {
    return { isValid: false, message: 'Nome contém caracteres inválidos' };
  }
  
  return { isValid: true };
};

export const generateCampaignSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
};

export const estimateCampaignDifficulty = (formData: CampaignFormData): 'easy' | 'medium' | 'hard' => {
  let complexity = 0;
  
  // Mais jogadores = mais complexo
  if (formData.max_players > 6) complexity += 2;
  else if (formData.max_players > 4) complexity += 1;
  
  // Campanhas públicas = mais complexo
  if (formData.is_public) complexity += 1;
  
  // Mais tags = mais complexo
  if (formData.tags && formData.tags.length > 4) complexity += 1;
  
  // Certas tags aumentam complexidade
  const complexTags = ['political', 'intrigue', 'mystery'];
  if (formData.tags?.some(tag => complexTags.includes(tag))) complexity += 1;
  
  if (complexity >= 4) return 'hard';
  if (complexity >= 2) return 'medium';
  return 'easy';
};

export const getCampaignRecommendations = (formData: CampaignFormData): string[] => {
  const recommendations: string[] = [];
  
  if (!formData.description || formData.description.length < 50) {
    recommendations.push('Adicione mais detalhes à descrição da campanha');
  }
  
  if (!formData.tags || formData.tags.length < 2) {
    recommendations.push('Adicione mais tags para ajudar jogadores a encontrar sua campanha');
  }
  
  if (formData.max_players > 6) {
    recommendations.push('Considere um grupo menor para sessões mais íntimas');
  }
  
  if (formData.is_public && !formData.recruitment_message) {
    recommendations.push('Adicione uma mensagem de recrutamento para atrair os jogadores certos');
  }
  
  if (!formData.world_name && formData.setting === 'homebrew') {
    recommendations.push('Dê um nome ao seu mundo personalizado');
  }
  
  return recommendations;
};

// ===========================
// KEYBOARD SHORTCUTS HOOK
// ===========================

export const useCampaignKeyboardShortcuts = () => {
  const { setCurrentStep, currentStep, steps, canProceedToNext, canGoBack } = useCreateCampaignContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S para salvar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Trigger save
        document.dispatchEvent(new CustomEvent('campaign-save'));
      }
      
      // Ctrl/Cmd + Left Arrow para step anterior
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (canGoBack) {
          setCurrentStep(currentStep - 1);
        }
      }
      
      // Ctrl/Cmd + Right Arrow para próximo step
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        if (canProceedToNext && currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }
      
      // Escape para cancelar
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('campaign-cancel'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentStep, currentStep, steps.length, canProceedToNext, canGoBack]);
};

export default useCampaignWizardUtils;