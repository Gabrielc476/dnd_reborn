//components/character/creation/CharacterCreationWizard.tsx - ATUALIZADO COM REVIEW
'use client';

import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RacesCreation from "@/components/character/creation/steps/Races";
import ClassesCreation from "@/components/character/creation/steps/Classes";
import { AbilityScoresComponent } from "@/components/character/creation/steps/AbilityScores";
import { SkillsComponent } from "@/components/character/creation/steps/Skills";
import EquipmentComponent from "@/components/character/creation/steps/Equipment";
import SpellsComponent from "@/components/character/creation/steps/Spells";
import PersonalityStep from "@/components/character/creation/steps/Personality";
import Review from "@/components/character/creation/steps/Review"; // ✅ NOVO: Import do componente Review

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
  // Retornar null se estamos no servidor ou ainda não hidratou
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    // Buscar dados de cada step individualmente
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
    
    // ✅ NOVO: Dados de personalidade
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
      abilityScores, // Scores base
      finalAbilityScores, // Scores finais com bônus racial
      selectedSkills, // Perícias selecionadas
      selectedEquipment, // Equipamentos selecionados
      selectedSpells, // Magias selecionadas
      // ✅ NOVO: Dados de personalidade
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
  // Só executar no cliente
  if (typeof window === 'undefined') {
    return;
  }
  
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
    'character_creation_final_ability_scores',
    'character_creation_points_remaining',
    'character_creation_standard_assignments',
    'character_creation_rolled_arrays',
    'character_creation_selected_rolled',
    'standard_array_values',
    
    // Skills step
    'character_creation_selected_skills',
    'character_creation_available_skill_choices',
    'character_creation_class_skill_options',
    'character_creation_background_skills',

    // Equipment step
    'character_creation_selected_equipment',
    'character_creation_equipment_cache',
    'character_creation_equipment_search',

    // Spells step
    'character_creation_selected_spells',
    'character_creation_spells_cache',
    'character_creation_spells_validation',
    
    // ✅ NOVO: Personality step
    'character_creation_name',
    'character_creation_personality_traits',
    'character_creation_ideals',
    'character_creation_bonds',
    'character_creation_flaws',
    'character_creation_backstory',
    'character_creation_notes',
    
    // Wizard state
    'character_wizard_current_step',
    'character_wizard_completed_steps',
    'character_wizard_validations'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  console.log('🧹 Todos os dados de criação de personagem foram limpos (incluindo personalidade)');
};

// ===========================
// WRAPPER COMPONENT PARA MAGIAS
// ===========================

const SpellsStepWrapper = ({ onValidationChange }: { onValidationChange: (isValid: boolean) => void }) => {
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Carregar dados do localStorage apenas no cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('character_creation_selected_spells');
      if (saved) {
        setSelectedSpells(JSON.parse(saved));
      }
      setIsMounted(true);
    }
  }, []);

  // Simular validação de magias
  useEffect(() => {
    const classData = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('character_creation_class') || 'null')
      : null;
    
    if (isMounted) {
      // Se a classe não conjura magias, step é sempre válido
      if (!classData || !['wizard', 'sorcerer', 'warlock', 'bard'].includes(classData.index)) {
        onValidationChange(true);
        return;
      }
      
      // Para conjuradores, validar se tem magias suficientes
      const spellConfig = {
        maxCantrips: 2,
        maxLevel1Spells: 1
      };
      
      const isValid = selectedSpells.length >= spellConfig.maxCantrips + spellConfig.maxLevel1Spells;
      onValidationChange(isValid);
    }
  }, [selectedSpells, onValidationChange, isMounted]);

  const handleSpellSelect = (spell: any) => {
    setSelectedSpells(prev => {
      const isSelected = prev.includes(spell.index);
      const newSpells = isSelected 
        ? prev.filter(s => s !== spell.index)
        : [...prev, spell.index];
      
      // Salvar no localStorage
      localStorage.setItem('character_creation_selected_spells', JSON.stringify(newSpells));
      return newSpells;
    });
  };

  // Verificar se classe conjura magias
  const classData = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('character_creation_class') || 'null')
    : null;
  
  if (!isMounted) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  if (!classData || !['wizard', 'sorcerer', 'warlock', 'bard'].includes(classData.index)) {
    const spellConfig = {
      maxCantrips: 2,
      maxLevel1Spells: 1
    };
    
    return (
      <div className="p-8">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Não é Conjurador</h3>
          <p className="text-gray-600 mb-4">
            Sua classe ({classData?.name || 'Não selecionada'}) não tem acesso a magias no 1º nível.
          </p>
          <p className="text-sm text-green-600">
            Você pode prosseguir para o próximo passo.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <SpellsComponent
        selectedClass={classData?.index}
        onSpellSelect={handleSpellSelect}
        selectedSpells={selectedSpells}
        maxCantrips={2}
        maxLevel1Spells={1}
        showSelection={true}
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
      // TODO: Implementar chamada para a API
      // const response = await createCharacterAPI(characterData);
      
      // Simulando delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Personagem criado com sucesso! (simulado)\n\nDados salvos no console para inspeção.');
      
      // Opcional: Limpar dados após sucesso
      // clearAllCharacterData();
      
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
    id: "review", // ✅ NOVO: Step de review integrado
    title: "Revisão",
    description: "Revise e finalize seu personagem",
    component: ReviewStepWrapper
  }
];

// ===========================
// MAIN WIZARD COMPONENT
// ===========================

export default function CharacterCreationWizard() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(() => new Set<number>());
  const [stepValidations, setStepValidations] = useState<Record<number, boolean>>({});

  // Carregar estado do wizard apenas no cliente
  useEffect(() => {
    // Carregar dados do sessionStorage apenas no cliente
    const savedCurrentStep = loadWizardState(WIZARD_STORAGE_KEYS.CURRENT_STEP, 0);
    const savedCompletedSteps = new Set(loadWizardState(WIZARD_STORAGE_KEYS.COMPLETED_STEPS, []));
    const savedValidations = loadWizardState(WIZARD_STORAGE_KEYS.STEP_VALIDATIONS, {});
    
    setCurrentStep(savedCurrentStep);
    setCompletedSteps(savedCompletedSteps);
    setStepValidations(savedValidations);
    setIsMounted(true);
  }, []);

  // Salvar estado do wizard
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

  const CurrentStepComponent = steps[currentStep]?.component;
  const currentStepData = steps[currentStep];

  // Não renderizar o wizard até a hidratação estar completa
  if (!isMounted) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Criação de Personagem D&D 5e</h1>
          <p className="text-gray-600 mb-6">
            Carregando wizard de criação...
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-gray-400 h-2 rounded-full w-1/4 animate-pulse" />
          </div>
        </div>

        <Card className="mb-8">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Criação de Personagem D&D 5e</h1>
        <p className="text-gray-600 mb-6">
          Siga os passos para criar seu personagem
        </p>

        {/* Quick Info Panel */}
        {getConsolidatedCharacterData() && (
          <Card className="mb-6 bg-blue-50">
            <div className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Progresso Atual:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <p>• Nome: {getConsolidatedCharacterData()?.characterName || 'Não definido'}</p>
                <p>• Raça: {getConsolidatedCharacterData()?.selectedRace?.name || 'Não selecionada'}</p>
                <p>• Classe: {getConsolidatedCharacterData()?.selectedClass?.name || 'Não selecionada'}</p>
                <p>• Atributos: {getConsolidatedCharacterData()?.finalAbilityScores ? 'Sim' : 'Não'}</p>
                <p>• Perícias: {getConsolidatedCharacterData()?.selectedSkills?.length || 0}</p>
                <p>• Magias: {getConsolidatedCharacterData()?.selectedSpells?.length || 0}</p>
                <p>• Equipamentos: {getConsolidatedCharacterData()?.selectedEquipment?.length || 0}</p>
                <p>• Personalidade: {(getConsolidatedCharacterData()?.personalityTraits?.length || 0) + (getConsolidatedCharacterData()?.ideals?.length || 0) + (getConsolidatedCharacterData()?.bonds?.length || 0) + (getConsolidatedCharacterData()?.flaws?.length || 0)} traços</p>
              </div>
            </div>
          </Card>
        )}
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        
        {/* Step Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              disabled={!isStepAccessible(index)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                index === currentStep
                  ? 'bg-blue-600 text-white'
                  : isStepCompleted(index)
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : isStepAccessible(index)
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isStepCompleted(index) && '✓ '}
              {index + 1}. {step.title}
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{currentStepData?.title}</h2>
              <p className="text-gray-600 text-sm mt-1">{currentStepData?.description}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">
                Passo {currentStep + 1} de {steps.length}
              </span>
              {isCurrentStepValid() && (
                <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded">
                  ✓ Válido
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Step Component */}
        {CurrentStepComponent && (
          <CurrentStepComponent onValidationChange={currentStepValidationHandler} />
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
        >
          Anterior
        </Button>
        
        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button 
              onClick={goToNextStep}
              disabled={!isCurrentStepValid()}
            >
              Próximo
            </Button>
          ) : (
            // No último step (Review), o botão de criação está dentro do componente
            <span className="text-sm text-gray-500">
              Use o botão "Criar Personagem" acima para finalizar
            </span>
          )}
        </div>
      </div>

      {/* Debug Panel (desenvolvimento) */}
      <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
        <details>
          <summary className="cursor-pointer font-medium">Debug Info</summary>
          <div className="mt-2 space-y-1">
            <p>Step atual: {currentStep} ({steps[currentStep]?.id})</p>
            <p>Step válido: {isCurrentStepValid() ? 'Sim' : 'Não'}</p>
            <p>Steps completos: [{Array.from(completedSteps).join(', ')}]</p>
            <p>Validações: {JSON.stringify(stepValidations)}</p>
          </div>
        </details>
      </div>
    </div>
  );
}