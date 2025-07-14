// ===========================
// useCharacterSteps.ts
// Hook para gerenciar navegação dos steps do wizard
// ===========================

import { useState, useCallback, useMemo } from 'react';
import { CharacterCreationStep, StepId, DndClass } from '@/types/characterCreation';

// Interface específica do hook que estende os tipos base
export interface CharacterStep extends CharacterCreationStep {
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
  const updateStepValidity = useCallback((stepId: StepId, isValid: boolean) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, isValid } : step
    ));

    // Marcar como completo se válido
    if (isValid) {
      setCompletedSteps(prev => new Set([...prev, stepId]));
    } else {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(stepId);
        return newSet;
      });
    }
  }, []);

  // Navegar para step anterior
  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  // Navegar para próximo step
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      const nextStepId = steps[nextIndex].id;
      
      setCurrentStepIndex(nextIndex);
      setVisitedSteps(prev => new Set([...prev, nextStepId]));
    }
  }, [currentStepIndex, steps]);

  // Navegar para step específico
  const goToStep = useCallback((stepId: StepId) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex >= 0) {
      setCurrentStepIndex(stepIndex);
      setVisitedSteps(prev => new Set([...prev, stepId]));
    }
  }, [steps]);

  // Configurar steps baseado na classe selecionada
  const configureStepsForCharacter = useCallback((config: {
    selectedClass: DndClass;
    isSpellcaster?: boolean;
  }) => {
    setSteps(prev => prev.map(step => {
      if (step.id === 'spells') {
        return {
          ...step,
          isRequired: !!config.isSpellcaster,
          isValid: !config.isSpellcaster, // Se não for conjurador, step é automaticamente válido
        };
      }
      return step;
    }));
  }, []);

  // Verificar se pode prosseguir
  const canProceed = useCallback(() => {
    const currentStepData = currentStep;
    if (!currentStepData) return false;
    
    // Para steps obrigatórios, deve ser válido
    if (currentStepData.isRequired) {
      return currentStepData.isValid;
    }
    
    // Steps opcionais sempre podem prosseguir
    return true;
  }, [currentStep]);

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
      requiredPercentage: requiredSteps > 0 ? 
        Math.round((completedRequiredSteps / requiredSteps) * 100) : 100,
    };
  }, [steps, currentStepIndex]);

  // Verificar se wizard está completo
  const isComplete = useMemo(() => {
    const requiredSteps = steps.filter(step => step.isRequired);
    return requiredSteps.every(step => step.isValid);
  }, [steps]);

  // Reset do wizard
  const reset = useCallback(() => {
    setSteps(initialSteps);
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setVisitedSteps(new Set(['basics']));
  }, [initialSteps]);

  // Obter steps disponíveis para navegação
  const availableSteps = useMemo(() => {
    return steps.map((step, index) => ({
      ...step,
      index,
      canNavigate: index <= currentStepIndex || isStepVisited(step.id),
      status: getStepStatus(step.id),
    }));
  }, [steps, currentStepIndex, isStepVisited, getStepStatus]);

  // Obter próximo step inválido
  const getNextInvalidStep = useCallback(() => {
    return steps.find(step => step.isRequired && !step.isValid);
  }, [steps]);

  return {
    // State
    steps,
    currentStep,
    currentStepIndex,
    completedSteps: Array.from(completedSteps),
    visitedSteps: Array.from(visitedSteps),
    
    // Navigation
    goToNextStep,
    goToPreviousStep,
    goToStep,
    canProceed,
    
    // Configuration
    configureStepsForCharacter,
    updateStepValidity,
    
    // Status
    isStepVisited,
    isStepCompleted,
    getStepStatus,
    availableSteps,
    
    // Progress
    progress: getProgress,
    isComplete,
    
    // Utils
    reset,
    getNextInvalidStep,
    
    // Computed
    hasNextStep: currentStepIndex < steps.length - 1,
    hasPreviousStep: currentStepIndex > 0,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    
    // Helpers
    getStepById: (stepId: StepId) => steps.find(step => step.id === stepId),
    getStepIndexById: (stepId: StepId) => steps.findIndex(step => step.id === stepId),
    getAllRequiredSteps: () => steps.filter(step => step.isRequired),
    getAllValidSteps: () => steps.filter(step => step.isValid),
    getAllInvalidRequiredSteps: () => steps.filter(step => step.isRequired && !step.isValid),
  };
};