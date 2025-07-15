// ===========================
// useCharacterSteps.tsx - CORRIGIDO
// Hook para gerenciar navegação dos steps do wizard
// ===========================

import { useState, useCallback, useMemo } from 'react';

// Interface para os steps do character creation
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

// Steps padrão com IDs corretos
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
    isValid: true, // Opcionais começam como válidos
    icon: "Package",
  },
  {
    id: "spells",
    title: "Magias",
    description: "Escolha suas magias (se aplicável)",
    isRequired: false,
    isValid: true, // Opcionais começam como válidos
    icon: "Sparkles",
  },
  {
    id: "personality",
    title: "Personalidade",
    description: "Traços, ideais, vínculos e defeitos",
    isRequired: false,
    isValid: true, // Opcionais começam como válidos
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
    return currentStepIndex;
  }, [currentStepIndex]);

  // Dados do step atual
  const currentStepData = useMemo(() => {
    return steps[currentStepIndex] || null;
  }, [steps, currentStepIndex]);

  // ===========================
  // NAVIGATION FUNCTIONS
  // ===========================

  // Navegar para próximo step
  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      const nextStepId = steps[nextIndex].id;
      
      setCurrentStepIndex(nextIndex);
      setVisitedSteps(prev => new Set([...prev, nextStepId]));
    }
  }, [currentStepIndex, steps]);

  // Navegar para step anterior
  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  // Navegar para step específico por índice
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStepIndex(stepIndex);
      setVisitedSteps(prev => new Set([...prev, steps[stepIndex].id]));
    }
  }, [steps]);

  // Navegar para step específico por ID
  const goToStepById = useCallback((stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex >= 0) {
      setCurrentStepIndex(stepIndex);
      setVisitedSteps(prev => new Set([...prev, stepId]));
    }
  }, [steps]);

  // ===========================
  // STEP MANAGEMENT
  // ===========================

  // Atualizar validade de um step
  const updateStepValidity = useCallback((stepId: string, isValid: boolean) => {
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

  // Configurar steps baseado na classe selecionada
  const configureStepsForCharacter = useCallback((config: {
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

  // ===========================
  // VALIDATION FUNCTIONS
  // ===========================

  // Verificar se pode prosseguir do step atual
  const canProceed = useCallback(() => {
    const currentStepData = steps[currentStepIndex];
    if (!currentStepData) return false;
    
    // Para steps obrigatórios, deve ser válido
    if (currentStepData.isRequired) {
      return currentStepData.isValid;
    }
    
    // Steps opcionais sempre podem prosseguir
    return true;
  }, [steps, currentStepIndex]);

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
    
    if (step.id === currentStepData?.id) return 'current';
    if (isStepCompleted(stepId)) return 'completed';
    if (isStepVisited(stepId)) return 'visited';
    if (step.isValid) return 'valid';
    if (step.isRequired && !step.isValid) return 'invalid';
    return 'pending';
  }, [steps, currentStepData, isStepCompleted, isStepVisited]);

  // ===========================
  // COMPUTED VALUES
  // ===========================

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

  // Obter steps disponíveis para navegação
  const availableSteps = useMemo(() => {
    return steps.map((step, index) => ({
      ...step,
      index,
      canNavigate: index <= currentStepIndex || isStepVisited(step.id),
      status: getStepStatus(step.id),
    }));
  }, [steps, currentStepIndex, isStepVisited, getStepStatus]);

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================

  // Reset do wizard
  const reset = useCallback(() => {
    setSteps(defaultSteps);
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setVisitedSteps(new Set(['basics']));
  }, []);

  // Obter próximo step inválido
  const getNextInvalidStep = useCallback(() => {
    return steps.find(step => step.isRequired && !step.isValid);
  }, [steps]);

  // Obter step por ID
  const getStepById = useCallback((stepId: string) => {
    return steps.find(step => step.id === stepId);
  }, [steps]);

  // Obter índice do step por ID
  const getStepIndexById = useCallback((stepId: string) => {
    return steps.findIndex(step => step.id === stepId);
  }, [steps]);

  return {
    // ===========================
    // STATE
    // ===========================
    steps,
    currentStep, // Índice numérico
    currentStepData, // Dados do step atual
    currentStepIndex,
    completedSteps: Array.from(completedSteps),
    visitedSteps: Array.from(visitedSteps),
    
    // ===========================
    // NAVIGATION
    // ===========================
    nextStep,
    prevStep,
    goToStep,
    goToStepById,
    canProceed,
    
    // ===========================
    // STEP MANAGEMENT
    // ===========================
    configureStepsForCharacter,
    updateStepValidity,
    
    // ===========================
    // STATUS CHECKS
    // ===========================
    isStepVisited,
    isStepCompleted,
    getStepStatus,
    availableSteps,
    
    // ===========================
    // PROGRESS
    // ===========================
    progress: getProgress,
    isComplete,
    
    // ===========================
    // UTILITIES
    // ===========================
    reset,
    getNextInvalidStep,
    getStepById,
    getStepIndexById,
    
    // ===========================
    // COMPUTED FLAGS
    // ===========================
    hasNextStep: currentStepIndex < steps.length - 1,
    hasPreviousStep: currentStepIndex > 0,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    
    // ===========================
    // HELPER FUNCTIONS
    // ===========================
    getAllRequiredSteps: () => steps.filter(step => step.isRequired),
    getAllValidSteps: () => steps.filter(step => step.isValid),
    getAllInvalidRequiredSteps: () => steps.filter(step => step.isRequired && !step.isValid),
  };
};