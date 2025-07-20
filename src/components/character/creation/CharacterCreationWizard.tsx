// ===========================
// CHARACTER CREATION WIZARD - ATUALIZADO COM PERSONALITY STEP
// src/components/character/creation/CharacterCreationWizard.tsx
// ===========================
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
import PersonalityStep from "@/components/character/creation/steps/Personality"; // ✅ NOVO: Import do step de personalidade

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

  if (!isMounted) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando magias...</p>
      </div>
    );
  }

  const classData = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('character_creation_class') || 'null')
    : null;

  // Se a classe não conjura magias, mostrar mensagem
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
// STEPS CONFIGURATION - ATUALIZADO COM PERSONALITY
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
    id: "personality", // ✅ NOVO: Step de personalidade
    title: "Personalidade",
    description: "Defina a personalidade e história do seu personagem",
    component: PersonalityStep
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
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Informações Básicas</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Nome:</strong> {characterData.characterName || 'Não definido'}</p>
                    <p><strong>Raça:</strong> {characterData.selectedRace?.name || 'Não selecionada'}</p>
                    <p><strong>Sub-raça:</strong> {characterData.selectedSubrace?.name || 'Nenhuma'}</p>
                  </div>
                  <div>
                    <p><strong>Classe:</strong> {characterData.selectedClass?.name || 'Não selecionada'}</p>
                    <p><strong>Subclasse:</strong> {characterData.selectedSubclass?.name || 'Nenhuma'}</p>
                    <p><strong>Background:</strong> {characterData.selectedBackground?.name || 'Não selecionado'}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Atributos e Perícias</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Método:</strong> {characterData.abilityMethod || 'Não definido'}</p>
                  <p><strong>Perícias:</strong> {characterData.selectedSkills?.length || 0} selecionadas</p>
                  <p><strong>Magias:</strong> {characterData.selectedSpells?.length || 0} selecionadas</p>
                  <p><strong>Equipamentos:</strong> {characterData.selectedEquipment?.length || 0} selecionados</p>
                </div>
              </Card>

              {/* ✅ NOVO: Seção de personalidade */}
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Personalidade</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Traços:</strong> {characterData.personalityTraits?.length || 0} definidos</p>
                  <p><strong>Ideais:</strong> {characterData.ideals?.length || 0} definidos</p>
                  <p><strong>Vínculos:</strong> {characterData.bonds?.length || 0} definidos</p>
                  <p><strong>Defeitos:</strong> {characterData.flaws?.length || 0} definidos</p>
                  <p><strong>Backstory:</strong> {characterData.backstory ? 'Definida' : 'Não definida'}</p>
                </div>
              </Card>
              
              <Button 
                onClick={() => console.log('📋 Dados completos:', characterData)}
                className="w-full"
              >
                Ver Dados Completos (Console)
              </Button>
            </div>
          ) : (
            <p>Erro ao carregar dados do personagem</p>
          )}
        </div>
      );
    }
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
          <div className="border-b p-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3"></div>
          </div>
          
          <div className="min-h-[400px] p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

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
                <p>• Nome: {getConsolidatedCharacterData()?.characterName || 'N/A'}</p>
                <p>• Raça: {getConsolidatedCharacterData()?.selectedRace?.name || 'N/A'}</p>
                <p>• Classe: {getConsolidatedCharacterData()?.selectedClass?.name || 'N/A'}</p>
                <p>• Background: {getConsolidatedCharacterData()?.selectedBackground?.name || 'N/A'}</p>
                <p>• Método atributos: {getConsolidatedCharacterData()?.abilityMethod || 'N/A'}</p>
                <p>• Scores com bônus: {Object.keys(getConsolidatedCharacterData()?.finalAbilityScores || {}).length > 0 ? 'Sim' : 'Não'}</p>
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

      {/* Main Content */}
      <Card className="mb-8">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>
        
        <div className="min-h-[400px]">
          <CurrentStepComponent onValidationChange={currentStepValidationHandler} />
        </div>
      </Card>

      {/* Navigation */}
      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
            >
              ← Anterior
            </Button>

            <Button
              variant="outline"
              onClick={() => clearAllCharacterData()}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              🗑️ Limpar Tudo
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="text-sm">
              {isCurrentStepValid() ? (
                <span className="text-green-600">✓ Válido</span>
              ) : (
                <span className="text-yellow-600">⚠ Incompleto</span>
              )}
            </div>

            {/* Next/Finish Button */}
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleFinalizeCharacter}
                disabled={!isCurrentStepValid()}
                className="bg-green-600 hover:bg-green-700"
              >
                🎉 Finalizar Personagem
              </Button>
            ) : (
              <Button
                onClick={goToNextStep}
                disabled={!isCurrentStepValid()}
              >
                Próximo →
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}