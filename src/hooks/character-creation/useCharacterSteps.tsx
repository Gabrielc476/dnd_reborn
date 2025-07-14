// ===========================
// useCharacterSteps.ts
// Hook para gerenciar navegação dos steps do wizard
// ===========================

import { useState, useCallback, useMemo } from 'react';

export interface CharacterStep {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isValid: boolean;
  isCompleted?: boolean;
  icon?: string;
  component?: string;
}

export const defaultSteps: CharacterStep[] = [
  {
    id: "basics",
    title: "Informações Básicas",
    description: "Nome, raça, classe e antecedente",
    isRequired: true,
    isValid: false,
    icon: "User",
  },
  {
    id: "abilities",
    title: "Atributos",
    description: "Força, destreza, constituição, etc.",
    isRequired: true,
    isValid: false,
    icon: "Zap",
  },
  {
    id: "skills",
    title: "Habilidades",
    description: "Proficiências em habilidades",
    isRequired: true,
    isValid: false,
    icon: "Target",
  },
  {
    id: "equipment",
    title: "Equipamentos",
    description: "Armas, armaduras e itens",
    isRequired: false,
    isValid: true,
    icon: "Package",
  },
  {
    id: "spells",
    title: "Magias",
    description: "Escolha suas magias (se aplicável)",
    isRequired: false,
    isValid: true,
    icon: "Sparkles",
  },
  {
    id: "personality",
    title: "Personalidade",
    description: "Traços, ideais, vínculos e defeitos",
    isRequired: false,
    isValid: true,
    icon: "Heart",
  },
];

export const useCharacterSteps = (initialSteps: CharacterStep[] = defaultSteps) => {
  const [steps, setSteps] = useState<CharacterStep[]>(initialSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set(['basics']));

  // Step atual
  const currentStep = useMemo(() => {
    return steps[currentStepIndex] || null;
  }, [steps, currentStepIndex]);

  // Atualizar validade de um step
  const updateStepValidity = useCallback((stepId: string, isValid: boolean) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, isValid } : step
    ));
  }, []);

  // Marcar step como completado
  const markStepCompleted = useCallback((stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    updateStepValidity(stepId, true);
  }, [updateStepValidity]);

  // Desmarcar step como completado
  const markStepIncomplete = useCallback((stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepId);
      return newSet;
    });
  }, []);

  // Navegar para step específico
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStepIndex(stepIndex);
      setVisitedSteps(prev => new Set([...prev, steps[stepIndex].id]));
    }
  }, [steps]);

  // Navegar para step por ID
  const goToStepById = useCallback((stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      goToStep(stepIndex);
    }
  }, [steps, goToStep]);

  // Próximo step
  const nextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      goToStep(nextIndex);
      return true;
    }
    return false;
  }, [currentStepIndex, steps.length, goToStep]);

  // Step anterior
  const previousStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      goToStep(prevIndex);
      return true;
    }
    return false;
  }, [currentStepIndex, goToStep]);

  // Verificar se pode navegar para step
  const canNavigateToStep = useCallback((stepIndex: number) => {
    if (stepIndex <= currentStepIndex) return true;
    
    // Verificar se todos os steps obrigatórios anteriores estão válidos
    for (let i = 0; i < stepIndex; i++) {
      const step = steps[i];
      if (step.isRequired && !step.isValid) {
        return false;
      }
    }
    return true;
  }, [currentStepIndex, steps]);

  // Verificar se pode ir para próximo step
  const canGoNext = useMemo(() => {
    if (!currentStep) return false;
    if (currentStep.isRequired && !currentStep.isValid) return false;
    return currentStepIndex < steps.length - 1;
  }, [currentStep, currentStepIndex, steps.length]);

  // Verificar se pode voltar
  const canGoPrevious = useMemo(() => {
    return currentStepIndex > 0;
  }, [currentStepIndex]);

  // Verificar se o wizard está completo
  const isWizardComplete = useMemo(() => {
    return steps.every(step => !step.isRequired || step.isValid);
  }, [steps]);

  // Verificar se step foi visitado
  const isStepVisited = useCallback((stepId: string) => {
    return visitedSteps.has(stepId);
  }, [visitedSteps]);

  // Verificar se step está completo
  const isStepCompleted = useCallback((stepId: string) => {
    return completedSteps.has(stepId);
  }, [completedSteps]);

  // Obter status do step
  const getStepStatus = useCallback((stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return 'unknown';
    
    if (step.id === currentStep?.id) return 'current';
    if (isStepCompleted(stepId)) return 'completed';
    if (isStepVisited(stepId)) return 'visited';
    if (step.isValid) return 'valid';
    if (step.isRequired && !step.isValid) return 'invalid';
    return 'pending';
  }, [steps, currentStep, isStepCompleted, isStepVisited]);

  // Obter progresso do wizard
  const getProgress = useMemo(() => {
    const totalSteps = steps.length;
    const completedCount = steps.filter(step => 
      !step.isRequired || step.isValid
    ).length;
    const requiredSteps = steps.filter(step => step.isRequired).length;
    const completedRequiredSteps = steps.filter(step => 
      step.isRequired && step.isValid
    ).length;
    
    return {
      current: currentStepIndex + 1,
      total: totalSteps,
      completed: completedCount,
      percentage: Math.round((completedCount / totalSteps) * 100),
      requiredCompleted: completedRequiredSteps,
      requiredTotal: requiredSteps,
      requiredPercentage: requiredSteps > 0 ? Math.round((completedRequiredSteps / requiredSteps) * 100) : 100,
    };
  }, [steps, currentStepIndex]);

  // Resetar wizard
  const reset = useCallback(() => {
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setVisitedSteps(new Set(['basics']));
    setSteps(prev => prev.map(step => ({ 
      ...step, 
      isValid: !step.isRequired,
      isCompleted: false 
    })));
  }, []);

  // Validar step atual
  const validateCurrentStep = useCallback((isValid: boolean) => {
    if (currentStep) {
      updateStepValidity(currentStep.id, isValid);
      if (isValid) {
        markStepCompleted(currentStep.id);
      } else {
        markStepIncomplete(currentStep.id);
      }
    }
  }, [currentStep, updateStepValidity, markStepCompleted, markStepIncomplete]);

  // Configurar steps dinâmicos (baseado nas escolhas do usuário)
  const configureStepsForCharacter = useCallback((characterData: any) => {
    setSteps(prev => prev.map(step => {
      if (step.id === 'spells') {
        // Mostrar step de magias apenas se for conjurador
        const isSpellcaster = characterData?.selectedClass?.spellcasting_ability;
        return {
          ...step,
          isRequired: isSpellcaster,
          isValid: !isSpellcaster || step.isValid,
        };
      }
      return step;
    }));
  }, []);

  return {
    // State
    steps,
    currentStep,
    currentStepIndex,
    completedSteps: Array.from(completedSteps),
    visitedSteps: Array.from(visitedSteps),
    
    // Navigation
    goToStep,
    goToStepById,
    nextStep,
    previousStep,
    
    // Validation
    canNavigateToStep,
    canGoNext,
    canGoPrevious,
    isWizardComplete,
    validateCurrentStep,
    
    // Step status
    isStepVisited,
    isStepCompleted,
    getStepStatus,
    
    // Step management
    updateStepValidity,
    markStepCompleted,
    markStepIncomplete,
    configureStepsForCharacter,
    
    // Progress
    progress: getProgress,
    
    // Utils
    reset,
    
    // Computed
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    hasRequiredErrors: steps.some(step => step.isRequired && !step.isValid),
  };
};