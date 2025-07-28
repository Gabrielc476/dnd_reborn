// components/character/creation/CharacterCreationWizard.tsx
'use client';

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, User, Shield, Zap, Target, Wand2, Package, Heart, CheckCircle } from "lucide-react";
import RacesCreation from "@/components/character/creation/steps/Races";
import ClassesCreation from "@/components/character/creation/steps/Classes";
import { AbilityScoresComponent } from "@/components/character/creation/steps/AbilityScores";
import { SkillsComponent } from "@/components/character/creation/steps/Skills";
import EquipmentComponent from "@/components/character/creation/steps/Equipment";
import SpellsComponent from "@/components/character/creation/steps/Spells";
import PersonalityStep from "@/components/character/creation/steps/Personality";
import Review from "@/components/character/creation/steps/Review";

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
// UTILITY - DADOS CONSOLIDADOS (SEGURO PARA SSR)
// ===========================

const getConsolidatedCharacterData = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const raceData = JSON.parse(localStorage.getItem('character_creation_race') || 'null');
    const subraceData = JSON.parse(localStorage.getItem('character_creation_subrace') || 'null');
    const classData = JSON.parse(localStorage.getItem('character_creation_class') || 'null');
    const subclassData = JSON.parse(localStorage.getItem('character_creation_subclass') || 'null');
    const backgroundData = JSON.parse(localStorage.getItem('character_creation_background') || 'null');
    const abilityMethod = JSON.parse(localStorage.getItem('character_creation_ability_method') || 'null');
    const abilityScores = JSON.parse(localStorage.getItem('character_creation_ability_scores') || '{}');
    const finalAbilityScores = JSON.parse(localStorage.getItem('character_creation_final_ability_scores') || '{}');
    const selectedSkills = JSON.parse(localStorage.getItem('character_creation_selected_skills') || '[]');
    const selectedEquipment = JSON.parse(localStorage.getItem('character_creation_selected_equipment') || '[]');
    const selectedSpells = JSON.parse(localStorage.getItem('character_creation_selected_spells') || '[]');
    const characterName = JSON.parse(localStorage.getItem('character_creation_name') || '""');
    const personalityTraits = JSON.parse(localStorage.getItem('character_creation_personality_traits') || '[]');
    const ideals = JSON.parse(localStorage.getItem('character_creation_ideals') || '[]');
    const bonds = JSON.parse(localStorage.getItem('character_creation_bonds') || '[]');
    const flaws = JSON.parse(localStorage.getItem('character_creation_flaws') || '[]');
    const backstory = JSON.parse(localStorage.getItem('character_creation_backstory') || '""');
    const notes = JSON.parse(localStorage.getItem('character_creation_notes') || '""');
    
    return {
      selectedRace: raceData,
      selectedSubrace: subraceData,
      selectedClass: classData,
      selectedSubclass: subclassData,
      selectedBackground: backgroundData,
      abilityMethod,
      abilityScores,
      finalAbilityScores,
      selectedSkills,
      selectedEquipment,
      selectedSpells,
      characterName,
      personalityTraits,
      ideals,
      bonds,
      flaws,
      backstory,
      notes
    };
  } catch (error) {
    console.error('Erro ao consolidar dados:', error);
    return null;
  }
};

const clearAllCharacterData = () => {
  if (typeof window === 'undefined') {
    return;
  }
  
  const keysToRemove = [
    'character_creation_race',
    'character_creation_subrace',
    'character_creation_races_cache',
    'character_creation_class',
    'character_creation_subclass',
    'character_creation_background',
    'character_creation_classes_cache',
    'character_creation_subclasses_cache',
    'character_creation_backgrounds_cache',
    'character_creation_ability_method',
    'character_creation_ability_scores',
    'character_creation_final_ability_scores',
    'character_creation_points_remaining',
    'character_creation_standard_assignments',
    'character_creation_rolled_arrays',
    'character_creation_selected_rolled',
    'standard_array_values',
    'character_creation_selected_skills',
    'character_creation_available_skill_choices',
    'character_creation_class_skill_options',
    'character_creation_background_skills',
    'character_creation_selected_equipment',
    'character_creation_equipment_cache',
    'character_creation_equipment_search',
    'character_creation_selected_spells',
    'character_creation_spells_cache',
    'character_creation_spells_validation',
    'character_creation_name',
    'character_creation_personality_traits',
    'character_creation_ideals',
    'character_creation_bonds',
    'character_creation_flaws',
    'character_creation_backstory',
    'character_creation_notes',
    'character_wizard_current_step',
    'character_wizard_completed_steps',
    'character_wizard_validations'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

// ===========================
// WRAPPER COMPONENT PARA MAGIAS (SIMPLIFICADO)
// ===========================

const SpellsStepWrapper = ({ onValidationChange }: { onValidationChange: (isValid: boolean) => void }) => {
  return (
    <div className="p-8">
      <SpellsComponent 
        selectedClass={loadFromStorage('character_creation_class', null)?.index} 
        onValidationChange={onValidationChange} 
      />
    </div>
  );
};

// ===========================
// WRAPPER COMPONENT PARA REVIEW
// ===========================

const ReviewStepWrapper = ({ onValidationChange }: { onValidationChange: (isValid: boolean) => void }) => {
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateCharacter = async () => {
    const characterData = getConsolidatedCharacterData();
    
    if (!characterData) {
      alert('Erro ao consolidar dados do personagem');
      return;
    }

    setIsCreating(true);
    console.log('📋 Dados finais do personagem:', characterData);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Personagem criado com sucesso! (simulado)\n\nDados salvos no console para inspeção.');
    } catch (error) {
      console.error('Erro ao criar personagem:', error);
      alert('Erro ao criar personagem');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Review 
      onValidationChange={onValidationChange}
      onCreateCharacter={handleCreateCharacter}
      isCreating={isCreating}
    />
  );
};

// ===========================
// STEPS CONFIGURATION - ATUALIZADO COM REVIEW
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
    component: SkillsComponent
  },
  {
    id: "spells",
    title: "Magias",
    description: "Selecione as magias iniciais do seu personagem",
    component: SpellsStepWrapper
  },
  {
    id: "equipment",
    title: "Equipamentos",
    description: "Selecione o equipamento inicial",
    component: EquipmentComponent
  },
  {
    id: "personality",
    title: "Personalidade",
    description: "Defina a personalidade e história do seu personagem",
    component: PersonalityStep
  },
  {
    id: "review",
    title: "Revisão",
    description: "Revise e finalize seu personagem",
    component: ReviewStepWrapper
  }
];

// Ícones para cada passo
const stepIcons: Record<string, React.ReactNode> = {
  race: <User className="w-4 h-4" />,
  class: <Shield className="w-4 h-4" />,
  abilities: <Zap className="w-4 h-4" />,
  skills: <Target className="w-4 h-4" />,
  spells: <Wand2 className="w-4 h-4" />,
  equipment: <Package className="w-4 h-4" />,
  personality: <Heart className="w-4 h-4" />,
  review: <CheckCircle className="w-4 h-4" />
};

// Função auxiliar para carregar do localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
  } catch (error) {
    console.error('Erro ao carregar do storage:', error);
  }
  return defaultValue;
};

// ===========================
// MAIN WIZARD COMPONENT
// ===========================

export default function CharacterCreationWizard() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(() => new Set<number>());
  const [stepValidations, setStepValidations] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const savedCurrentStep = loadWizardState(WIZARD_STORAGE_KEYS.CURRENT_STEP, 0);
    const savedCompletedSteps = new Set(loadWizardState(WIZARD_STORAGE_KEYS.COMPLETED_STEPS, []));
    const savedValidations = loadWizardState(WIZARD_STORAGE_KEYS.STEP_VALIDATIONS, {});
    
    setCurrentStep(savedCurrentStep);
    setCompletedSteps(savedCompletedSteps);
    setStepValidations(savedValidations);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    saveWizardState(WIZARD_STORAGE_KEYS.CURRENT_STEP, currentStep);
  }, [currentStep]);

  useEffect(() => {
    saveWizardState(WIZARD_STORAGE_KEYS.COMPLETED_STEPS, Array.from(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    saveWizardState(WIZARD_STORAGE_KEYS.STEP_VALIDATIONS, stepValidations);
  }, [stepValidations]);

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

  const CurrentStepComponent = steps[currentStep]?.component;
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="max-w-6xl w-full px-6">
          <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
            <div className="bg-slate-600 h-2 rounded-full w-1/4 animate-pulse" />
          </div>
          <Card className="bg-slate-800/80 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="h-4 w-4 bg-slate-600 rounded-full animate-pulse" />
                <div className="h-4 w-32 bg-slate-600 rounded animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header com navegação */}
      <div className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Criação de Personagem</h1>
            <div className="text-sm text-slate-400">
              Passo {currentStep + 1} de {steps.length}
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mb-4">
            <Progress value={progress} className="h-2 bg-slate-700" />
          </div>

          {/* Navegação por passos */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const isCurrent = index === currentStep;
              const isCompleted = isStepCompleted(index);
              const isAccessible = isStepAccessible(index);

              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  disabled={!isAccessible}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                    ${
                      isCurrent
                        ? "bg-blue-600 text-white"
                        : isCompleted
                          ? "bg-green-600/20 text-green-300 hover:bg-green-600/30"
                          : isAccessible
                            ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }
                  `}
                >
                  {stepIcons[step.id.split('.')[0]]}
                  <span>{step.title.split(' ')[0]}</span>
                  {isCompleted && <CheckCircle className="w-3 h-3" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card className="bg-slate-800/80 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              {stepIcons[currentStepData.id.split('.')[0]]}
              {currentStepData.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {CurrentStepComponent && (
              <CurrentStepComponent onValidationChange={currentStepValidationHandler} />
            )}
          </CardContent>
        </Card>

        {/* Navegação inferior */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            <Badge
              variant={isCurrentStepValid() ? "default" : "destructive"}
              className={
                isCurrentStepValid() ? "bg-green-600 text-green-100" : "bg-red-600 text-red-100"
              }
            >
              {isCurrentStepValid() ? "Válido" : "Incompleto"}
            </Badge>
          </div>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={goToNextStep}
              disabled={!isCurrentStepValid()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <span className="text-sm text-slate-500">
              Use o botão &quot;Criar Personagem&quot; na revisão para finalizar
            </span>
          )}
        </div>
      </div>
    </div>
  );
}