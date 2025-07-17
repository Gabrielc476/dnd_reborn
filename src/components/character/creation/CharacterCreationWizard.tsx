// components/character/creation/CharacterCreationWizard.tsx
'use client';

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RacesCreation from "@/components/character/creation/steps/Races";
import ClassesCreation from "@/components/character/creation/steps/Classes";
import { AbilityScoresComponent } from "@/components/character/creation/steps/AbilityScores";

interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  completed?: boolean;
}

const steps: Step[] = [
  {
    id: "race",
    title: "Raça e Sub-raça",
    description: "Escolha a raça e sub-raça do seu personagem",
    component: RacesCreation
  },
  {
    id: "class",
    title: "Classe, Subclasse e Background",
    description: "Defina a classe, subclasse e background do personagem",
    component: ClassesCreation
  },
  {
    id: "abilities",
    title: "Atributos",
    description: "Distribua os pontos de atributo do personagem",
    component: AbilityScoresComponent
  },
  {
    id: "skills",
    title: "Perícias",
    description: "Escolha as perícias do seu personagem",
    component: () => <div className="p-8 text-center text-gray-500">Step de Perícias - Em desenvolvimento</div>
  },
  {
    id: "equipment",
    title: "Equipamentos",
    description: "Selecione o equipamento inicial",
    component: () => <div className="p-8 text-center text-gray-500">Step de Equipamentos - Em desenvolvimento</div>
  },
  {
    id: "review",
    title: "Revisão",
    description: "Revise e finalize seu personagem",
    component: () => <div className="p-8 text-center text-gray-500">Step de Revisão - Em desenvolvimento</div>
  }
];

export default function CharacterCreationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepValidations, setStepValidations] = useState<Record<number, boolean>>({});

  const isCurrentStepValid = () => {
    return stepValidations[currentStep] || false;
  };

  const currentStepValidationHandler = useCallback((isValid: boolean) => {
    setStepValidations(prev => ({
      ...prev,
      [currentStep]: isValid
    }));
  }, [currentStep]);

  const goToNextStep = () => {
    if (currentStep < steps.length - 1 && isCurrentStepValid()) {
      // Marca o step atual como completo
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    } else if (!isCurrentStepValid()) {
      console.warn('Tentativa de avançar step sem validação completa');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Deixa o componente gerenciar sua própria validação
    }
  };

  const goToStep = (stepIndex: number) => {
    // Só permite navegar para steps já visitados ou o próximo step
    if (stepIndex >= 0 && stepIndex <= Math.max(currentStep, Math.max(...completedSteps) + 1) && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      // Não limpa a validação, deixa o componente gerenciar
    }
  };

  const isStepAccessible = (stepIndex: number) => {
    return stepIndex <= Math.max(currentStep, Math.max(...completedSteps, -1) + 1);
  };

  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.has(stepIndex);
  };

  const CurrentStepComponent = steps[currentStep].component;
  const currentStepData = steps[currentStep];

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header do Wizard */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Criação de Personagem</h1>
        <p className="text-gray-600 mb-6">Siga os passos para criar seu personagem D&D 5e</p>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Passo {currentStep + 1} de {steps.length}: {currentStepData.title}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% completo
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {steps.map((step, index) => {
            const isCompleted = isStepCompleted(index);
            const isAccessible = isStepAccessible(index);
            const isCurrent = index === currentStep;
            const isValid = stepValidations[index] || false;
            
            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-left relative ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                    : isCompleted
                    ? 'border-green-500 bg-green-50 text-green-700 cursor-pointer hover:bg-green-100'
                    : isAccessible
                    ? 'border-gray-300 bg-white text-gray-700 cursor-pointer hover:bg-gray-50'
                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!isAccessible}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isCurrent
                      ? 'bg-blue-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : isAccessible
                      ? 'bg-gray-300 text-gray-600'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs truncate">{step.title}</div>
                    {/* Indicador de validação */}
                    {isCurrent && (
                      <div className="mt-1">
                        {isValid ? (
                          <span className="text-xs text-green-600">✓ Válido</span>
                        ) : (
                          <span className="text-xs text-orange-600">⚠ Incompleto</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Current step indicator */}
                {isCurrent && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600">
              {currentStepData.description}
            </p>
          </div>
          
          {/* Step Component */}
          <div className="min-h-[400px]">
            <CurrentStepComponent 
              onValidationChange={currentStepValidationHandler}
            />
          </div>
        </div>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          ← Anterior
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {completedSteps.size} de {steps.length} steps completos
          </span>
          
          {/* Status de validação do step atual */}
          {currentStep < steps.length - 1 && (
            <div className="flex items-center gap-2">
              {isCurrentStepValid() ? (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Step válido
                </span>
              ) : (
                <span className="text-sm text-orange-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Complete todas as seleções
                </span>
              )}
            </div>
          )}
          
          {currentStep === steps.length - 1 ? (
            <Button
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              onClick={() => {
                // Aqui você pode adicionar a lógica para finalizar a criação
                console.log("Finalizando criação do personagem...");
              }}
            >
              Finalizar Personagem
            </Button>
          ) : (
            <Button
              onClick={goToNextStep}
              disabled={!isCurrentStepValid()}
              className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!isCurrentStepValid() ? "Complete todas as seleções para continuar" : ""}
            >
              Próximo →
            </Button>
          )}
        </div>
      </div>

      {/* Debug Info (pode remover em produção) */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <p>Step atual: {currentStep + 1} ({currentStepData.id})</p>
        <p>Steps completos: [{Array.from(completedSteps).map(i => i + 1).join(', ')}]</p>
        <p>Progresso: {Math.round(((currentStep + 1) / steps.length) * 100)}%</p>
        <p>Step atual válido: {isCurrentStepValid() ? 'Sim' : 'Não'}</p>
        <p>Validações: {JSON.stringify(stepValidations)}</p>
      </div>
    </div>
  );
}