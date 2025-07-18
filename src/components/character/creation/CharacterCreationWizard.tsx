// components/character/creation/CharacterCreationWizard.tsx
// WIZARD COMPLETO - Storage local simples em cada step
'use client';

import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RacesCreation from "@/components/character/creation/steps/Races";
import ClassesCreation from "@/components/character/creation/steps/Classes";
import { AbilityScoresComponent } from "@/components/character/creation/steps/AbilityScores";
import { SkillsComponent } from "@/components/character/creation/steps/Skills";

interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  completed?: boolean;
}

// ===========================
// STORAGE SIMPLES PARA NAVEGAÇÃO
// ===========================

const WIZARD_STORAGE_KEYS = {
  CURRENT_STEP: 'character_wizard_current_step',
  COMPLETED_STEPS: 'character_wizard_completed_steps',
  STEP_VALIDATIONS: 'character_wizard_validations'
};

const saveWizardState = (key: string, data: any) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar estado do wizard:', error);
  }
};

const loadWizardState = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = sessionStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
  } catch (error) {
    console.error('Erro ao carregar estado do wizard:', error);
  }
  return defaultValue;
};

// ===========================
// UTILITY - DADOS CONSOLIDADOS
// ===========================

const getConsolidatedCharacterData = () => {
  try {
    // Buscar dados de cada step individualmente
    const raceData = JSON.parse(localStorage.getItem('character_creation_race') || 'null');
    const subraceData = JSON.parse(localStorage.getItem('character_creation_subrace') || 'null');
    const classData = JSON.parse(localStorage.getItem('character_creation_class') || 'null');
    const subclassData = JSON.parse(localStorage.getItem('character_creation_subclass') || 'null');
    const backgroundData = JSON.parse(localStorage.getItem('character_creation_background') || 'null');
    const abilityMethod = JSON.parse(localStorage.getItem('character_creation_ability_method') || 'null');
    const abilityScores = JSON.parse(localStorage.getItem('character_creation_ability_scores') || '{}');
    const finalAbilityScores = JSON.parse(localStorage.getItem('character_creation_final_ability_scores') || '{}'); // ✅ NOVO: Scores com bônus racial
    const selectedSkills = JSON.parse(localStorage.getItem('character_creation_selected_skills') || '[]'); // ✅ NOVO: Perícias
    
    return {
      selectedRace: raceData,
      selectedSubrace: subraceData,
      selectedClass: classData,
      selectedSubclass: subclassData,
      selectedBackground: backgroundData,
      abilityMethod,
      abilityScores, // Scores base
      finalAbilityScores, // ✅ NOVO: Scores finais com bônus racial
      selectedSkills, // ✅ NOVO: Perícias selecionadas
      // Adicionar outros dados conforme necessário
    };
  } catch (error) {
    console.error('Erro ao consolidar dados:', error);
    return null;
  }
};

const clearAllCharacterData = () => {
  // Limpar dados de todos os steps implementados
  const keysToRemove = [
    // Race step
    'character_creation_race',
    'character_creation_subrace',
    'character_creation_races_cache',
    
    // Class step  
    'character_creation_class',
    'character_creation_subclass',
    'character_creation_background',
    'character_creation_classes_cache',
    'character_creation_subclasses_cache',
    'character_creation_backgrounds_cache',
    
    // Ability scores step
    'character_creation_ability_method',
    'character_creation_ability_scores',
    'character_creation_final_ability_scores', // ✅ NOVO: Scores finais com bônus
    'character_creation_points_remaining',
    'character_creation_standard_assignments',
    'character_creation_rolled_arrays',
    'character_creation_selected_rolled',
    'standard_array_values',
    
    // Skills step ✅ NOVO
    'character_creation_selected_skills',
    'character_creation_available_skill_choices',
    'character_creation_class_skill_options',
    'character_creation_background_skills',
    
    // Wizard state
    'character_wizard_current_step',
    'character_wizard_completed_steps',
    'character_wizard_validations'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  console.log('🧹 Todos os dados de criação de personagem foram limpos (incluindo perícias)');
};

// ===========================
// STEPS CONFIGURATION
// ===========================

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
    component: SkillsComponent // ✅ ATUALIZADO: Usando o componente real
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
    component: () => {
      const characterData = getConsolidatedCharacterData();
      return (
        <div className="p-8">
          <h3 className="text-lg font-bold mb-4">Revisão do Personagem</h3>
          {characterData ? (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">📝 Informações Básicas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Raça:</strong> {characterData.selectedRace?.name || 'N/A'}
                    {characterData.selectedSubrace && (
                      <span> ({characterData.selectedSubrace.name})</span>
                    )}
                  </div>
                  <div>
                    <strong>Classe:</strong> {characterData.selectedClass?.name || 'N/A'}
                    {characterData.selectedSubclass && (
                      <span> ({characterData.selectedSubclass.name})</span>
                    )}
                  </div>
                  <div>
                    <strong>Background:</strong> {characterData.selectedBackground?.name || 'N/A'}
                  </div>
                  <div>
                    <strong>Método de Atributos:</strong> {characterData.abilityMethod || 'N/A'}
                  </div>
                </div>
              </Card>

              {/* Atributos Finais */}
              {characterData.finalAbilityScores && Object.keys(characterData.finalAbilityScores).length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">💪 Atributos Finais (com bônus raciais)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(characterData.finalAbilityScores).map(([ability, score]) => (
                      <div key={ability} className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium capitalize text-sm">{ability}</div>
                        <div className="text-xl font-bold text-blue-600">{score as number}</div>
                        <div className="text-xs text-gray-600">
                          {Math.floor(((score as number) - 10) / 2) >= 0 ? '+' : ''}{Math.floor(((score as number) - 10) / 2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Perícias */}
              {characterData.selectedSkills && characterData.selectedSkills.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">🎯 Perícias Selecionadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {characterData.selectedSkills.map((skillKey: string) => (
                      <span 
                        key={skillKey}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skillKey}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Instruções */}
              <Card className="p-4 bg-green-50">
                <h4 className="font-semibold mb-2 text-green-800">✅ Personagem Pronto!</h4>
                <p className="text-sm text-green-700">
                  Seu personagem está configurado com todas as informações básicas. 
                  Os dados estão salvos no localStorage do navegador.
                  Você pode fechar o navegador e retornar posteriormente que seus dados estarão salvos.
                </p>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nenhum dado encontrado</p>
              <p className="text-sm text-gray-400">
                Complete os steps anteriores para ver a revisão do personagem
              </p>
            </div>
          )}
        </div>
      );
    }
  }
];

export default function CharacterCreationWizard() {
  // ===========================
  // STATES COM SESSION STORAGE
  // ===========================
  
  const [currentStep, setCurrentStep] = useState(() => 
    loadWizardState<number>(WIZARD_STORAGE_KEYS.CURRENT_STEP, 0)
  );
  
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => 
    new Set(loadWizardState<number[]>(WIZARD_STORAGE_KEYS.COMPLETED_STEPS, []))
  );
  
  const [stepValidations, setStepValidations] = useState<Record<number, boolean>>(() => 
    loadWizardState<Record<number, boolean>>(WIZARD_STORAGE_KEYS.STEP_VALIDATIONS, {})
  );

  // ===========================
  // SAVE WIZARD STATE
  // ===========================

  useEffect(() => {
    saveWizardState(WIZARD_STORAGE_KEYS.CURRENT_STEP, currentStep);
  }, [currentStep]);

  useEffect(() => {
    saveWizardState(WIZARD_STORAGE_KEYS.COMPLETED_STEPS, Array.from(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    saveWizardState(WIZARD_STORAGE_KEYS.STEP_VALIDATIONS, stepValidations);
  }, [stepValidations]);

  // ===========================
  // VALIDATION LOGIC
  // ===========================

  const isCurrentStepValid = () => {
    return stepValidations[currentStep] || false;
  };

  const currentStepValidationHandler = useCallback((isValid: boolean) => {
    setStepValidations(prev => ({
      ...prev,
      [currentStep]: isValid
    }));
  }, [currentStep]);

  // ===========================
  // NAVIGATION
  // ===========================

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
    }
  };

  const goToStep = (stepIndex: number) => {
    // Só permite navegar para steps já visitados ou o próximo step
    if (stepIndex >= 0 && stepIndex <= Math.max(currentStep, Math.max(...completedSteps) + 1) && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const isStepAccessible = (stepIndex: number) => {
    return stepIndex <= Math.max(currentStep, Math.max(...completedSteps, -1) + 1);
  };

  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.has(stepIndex);
  };

  // ===========================
  // FINAL ACTION
  // ===========================

  const handleFinalizeCharacter = async () => {
    const characterData = getConsolidatedCharacterData();
    
    if (!characterData) {
      alert('Erro ao consolidar dados do personagem');
      return;
    }

    console.log('📋 Dados finais do personagem:', characterData);
    
    // Aqui você faria a chamada para a API
    try {
      // const response = await createCharacterAPI(characterData);
      alert('Personagem criado com sucesso! (simulado)\n\nDados salvos no console para inspeção.');
      
      // Opcional: Limpar dados após sucesso
      // clearAllCharacterData();
      // setCurrentStep(0);
      // setCompletedSteps(new Set());
      // setStepValidations({});
      
    } catch (error) {
      console.error('Erro ao criar personagem:', error);
      alert('Erro ao criar personagem');
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  const currentStepData = steps[currentStep];

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header do Wizard */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Criação de Personagem D&D 5e</h1>
        <p className="text-gray-600 mb-6">
          Sistema com storage local - Dados salvos automaticamente
        </p>
        
        {/* Debug Info Global */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="p-4 bg-yellow-50 mb-4">
            <h4 className="font-bold text-sm mb-2">Debug - Estado Global:</h4>
            <div className="text-xs space-y-1">
              <p>Step atual: {currentStep + 1}/{steps.length}</p>
              <p>Steps completos: {Array.from(completedSteps).join(', ')}</p>
              <p>Dados consolidados disponíveis:</p>
              <div className="ml-2 space-y-0.5">
                <p>• Raça: {getConsolidatedCharacterData()?.selectedRace?.name || 'N/A'}</p>
                <p>• Classe: {getConsolidatedCharacterData()?.selectedClass?.name || 'N/A'}</p>
                <p>• Background: {getConsolidatedCharacterData()?.selectedBackground?.name || 'N/A'}</p>
                <p>• Método atributos: {getConsolidatedCharacterData()?.abilityMethod || 'N/A'}</p>
                <p>• Scores com bônus: {Object.keys(getConsolidatedCharacterData()?.finalAbilityScores || {}).length > 0 ? 'Sim' : 'Não'}</p>
                <p>• Perícias: {getConsolidatedCharacterData()?.selectedSkills?.length || 0} selecionadas</p>
              </div>
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={clearAllCharacterData}
                >
                  Limpar Tudo
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    const data = getConsolidatedCharacterData();
                    console.log('Dados consolidados:', data);
                  }}
                >
                  Ver Dados
                </Button>
              </div>
            </div>
          </Card>
        )}
        
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
                          <span className="text-green-600 text-xs">✓ Válido</span>
                        ) : (
                          <span className="text-orange-600 text-xs">⚠ Incompleto</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <Card className="min-h-[600px]">
        {/* Step Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {currentStepData.title}
          </h2>
          {currentStepData.description && (
            <p className="text-gray-600 mt-1">{currentStepData.description}</p>
          )}
        </div>

        {/* Step Content */}
        <div className="p-6">
          <CurrentStepComponent onValidationChange={currentStepValidationHandler} />
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            ← Anterior
          </Button>

          <div className="flex items-center gap-3">
            {/* Validation Status */}
            <div className="text-sm">
              {isCurrentStepValid() ? (
                <span className="text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Passo válido
                </span>
              ) : (
                <span className="text-orange-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Complete os campos obrigatórios
                </span>
              )}
            </div>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={goToNextStep}
                disabled={!isCurrentStepValid()}
                className="flex items-center gap-2"
              >
                Próximo →
              </Button>
            ) : (
              <Button
                onClick={handleFinalizeCharacter}
                disabled={!isCurrentStepValid()}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                ✓ Finalizar Personagem
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}