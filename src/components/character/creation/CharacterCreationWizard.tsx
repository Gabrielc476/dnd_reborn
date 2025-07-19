// components/character/creation/CharacterCreationWizard.tsx
// WIZARD COMPLETO - Storage local simples em cada step com MAGIAS
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
    const finalAbilityScores = JSON.parse(localStorage.getItem('character_creation_final_ability_scores') || '{}'); // ✅ NOVO: Scores com bônus racial
    const selectedSkills = JSON.parse(localStorage.getItem('character_creation_selected_skills') || '[]'); // ✅ NOVO: Perícias
    const selectedEquipment = JSON.parse(localStorage.getItem('character_creation_selected_equipment') || '[]'); // ✅ NOVO: Equipamentos
    const selectedSpells = JSON.parse(localStorage.getItem('character_creation_selected_spells') || '[]'); // ✅ NOVO: Magias selecionadas
    
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
      selectedEquipment, // ✅ NOVO: Equipamentos selecionados
      selectedSpells, // ✅ NOVO: Magias selecionadas
      // Adicionar outros dados conforme necessário
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

    // Equipment step ✅ NOVO
    'character_creation_selected_equipment',
    'character_creation_equipment_cache',
    'character_creation_equipment_search',

    // Spells step ✅ NOVO - MAGIAS
    'character_creation_selected_spells',
    'character_creation_spells_cache',
    'character_creation_spells_validation',
    
    // Wizard state
    'character_wizard_current_step',
    'character_wizard_completed_steps',
    'character_wizard_validations'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  console.log('🧹 Todos os dados de criação de personagem foram limpos (incluindo perícias, equipamentos e magias)');
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
    }
    setIsMounted(true);
  }, []);

  // Buscar dados da classe selecionada (seguro para SSR)
  const getClassData = () => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('character_creation_class') || 'null');
    } catch {
      return null;
    }
  };

  const classData = getClassData();

  // Verificar se a classe é conjuradora
  const isSpellcaster = classData && ['wizard', 'mago', 'sorcerer', 'feiticeiro', 'cleric', 'clerigo', 'clérico', 'druid', 'druida', 'bard', 'bardo', 'warlock', 'bruxo'].includes(classData.index?.toLowerCase() || '');

  // Configuração de magias por classe
  const getSpellConfig = (classIndex: string) => {
    const spellConfigs: Record<string, { maxCantrips: number; maxLevel1Spells: number }> = {
      'wizard': { maxCantrips: 3, maxLevel1Spells: 6 },
      'mago': { maxCantrips: 3, maxLevel1Spells: 6 },
      'sorcerer': { maxCantrips: 4, maxLevel1Spells: 2 },
      'feiticeiro': { maxCantrips: 4, maxLevel1Spells: 2 },
      'cleric': { maxCantrips: 3, maxLevel1Spells: 2 },
      'clerigo': { maxCantrips: 3, maxLevel1Spells: 2 },
      'clérico': { maxCantrips: 3, maxLevel1Spells: 2 },
      'druid': { maxCantrips: 2, maxLevel1Spells: 2 },
      'druida': { maxCantrips: 2, maxLevel1Spells: 2 },
      'bard': { maxCantrips: 2, maxLevel1Spells: 4 },
      'bardo': { maxCantrips: 2, maxLevel1Spells: 4 },
      'warlock': { maxCantrips: 2, maxLevel1Spells: 2 },
      'bruxo': { maxCantrips: 2, maxLevel1Spells: 2 },
    };
    
    return spellConfigs[classIndex?.toLowerCase()] || { maxCantrips: 0, maxLevel1Spells: 0 };
  };

  const spellConfig = classData ? getSpellConfig(classData.index) : { maxCantrips: 0, maxLevel1Spells: 0 };

  // Função para validar seleção de magias
  const validateSpellSelection = (spells: string[]) => {
    if (!isSpellcaster) {
      return true; // Classes não conjuradoras são válidas por padrão
    }

    // Para uma validação mais realista, vamos assumir que:
    // - Se não há magias selecionadas e os limites são > 0, não é válido
    // - Se há magias, deve estar dentro dos limites
    const totalRequired = spellConfig.maxCantrips + spellConfig.maxLevel1Spells;
    
    if (totalRequired > 0 && spells.length === 0) {
      return false; // Deve selecionar pelo menos algumas magias
    }
    
    // Validação simples - na prática, isso seria feito com dados reais das magias
    return spells.length <= totalRequired;
  };

  // Atualizar validação quando magias mudarem (apenas no cliente)
  useEffect(() => {
    if (!isMounted) return;
    
    const isValid = validateSpellSelection(selectedSpells);
    onValidationChange(isValid);
    
    // Salvar no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('character_creation_selected_spells', JSON.stringify(selectedSpells));
    }
  }, [selectedSpells, onValidationChange, isMounted]);

  // Não renderizar até hidratação estar completa
  if (!isMounted) {
    return (
      <div className="p-8">
        <Card className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔮</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Carregando...
            </h3>
            <p className="text-gray-600">
              Preparando seleção de magias
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const handleSpellSelect = (spellIndex: string, isSelected: boolean) => {
    setSelectedSpells(prev => {
      if (isSelected) {
        return [...prev, spellIndex];
      } else {
        return prev.filter(spell => spell !== spellIndex);
      }
    });
  };

  // Se não é conjurador, mostrar mensagem informativa
  if (!isSpellcaster) {
    return (
      <div className="p-8">
        <Card className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚔️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Classe Não Conjuradora
            </h3>
            <p className="text-gray-600">
              {classData?.name || 'Esta classe'} não possui magias no 1º nível.
              Você pode prosseguir para o próximo passo.
            </p>
          </div>
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
        maxCantrips={spellConfig.maxCantrips}
        maxLevel1Spells={spellConfig.maxLevel1Spells}
        showSelection={true}
      />
    </div>
  );
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
    id: "spells", // ✅ NOVO: Passo de magias
    title: "Magias",
    description: "Selecione as magias iniciais do seu personagem",
    component: SpellsStepWrapper
  },
  {
    id: "equipment",
    title: "Equipamentos",
    description: "Selecione o equipamento inicial",
    component: EquipmentComponent // ✅ NOVO: Componente de equipamentos com tabela
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
              <Card className="p-6">
                <h4 className="font-semibold mb-4">Informações Básicas</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Raça:</strong> {characterData.selectedRace?.name || 'N/A'}</p>
                    <p><strong>Sub-raça:</strong> {characterData.selectedSubrace?.name || 'Nenhuma'}</p>
                  </div>
                  <div>
                    <p><strong>Classe:</strong> {characterData.selectedClass?.name || 'N/A'}</p>
                    <p><strong>Subclasse:</strong> {characterData.selectedSubclass?.name || 'Nenhuma'}</p>
                  </div>
                  <div>
                    <p><strong>Background:</strong> {characterData.selectedBackground?.name || 'N/A'}</p>
                  </div>
                </div>
              </Card>

              {/* Atributos */}
              <Card className="p-6">
                <h4 className="font-semibold mb-4">Atributos Finais</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {Object.entries(characterData.finalAbilityScores || {}).map(([attr, value]) => (
                    <div key={attr} className="text-center p-2 bg-gray-50 rounded">
                      <p className="font-medium capitalize">{attr.replace('_', ' ')}</p>
                      <p className="text-lg font-bold">{value as number}</p>
                      <p className="text-xs text-gray-500">
                        Mod: {Math.floor(((value as number) - 10) / 2) >= 0 ? '+' : ''}{Math.floor(((value as number) - 10) / 2)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Perícias */}
              <Card className="p-6">
                <h4 className="font-semibold mb-4">Perícias Selecionadas</h4>
                <div className="flex flex-wrap gap-2">
                  {characterData.selectedSkills?.length > 0 ? 
                    characterData.selectedSkills.map((skill: string) => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {skill}
                      </span>
                    )) :
                    <p className="text-gray-500 text-sm">Nenhuma perícia selecionada</p>
                  }
                </div>
              </Card>

              {/* Magias */}
              {characterData.selectedSpells?.length > 0 && (
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">Magias Selecionadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {characterData.selectedSpells.map((spell: string) => (
                      <span key={spell} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                        {spell}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Equipamentos */}
              <Card className="p-6">
                <h4 className="font-semibold mb-4">Equipamentos</h4>
                <div className="flex flex-wrap gap-2">
                  {characterData.selectedEquipment?.length > 0 ? 
                    characterData.selectedEquipment.map((equipment: any) => (
                      <span key={equipment.index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {equipment.name}
                      </span>
                    )) :
                    <p className="text-gray-500 text-sm">Nenhum equipamento selecionado</p>
                  }
                </div>
              </Card>

              {/* Estatísticas Calculadas */}
              <Card className="p-6">
                <h4 className="font-semibold mb-4">Estatísticas de Combate</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <p className="font-medium text-blue-800">Classe de Armadura</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {(() => {
                        const dexScore = characterData.finalAbilityScores?.dexterity || 10;
                        const dexMod = Math.floor((dexScore - 10) / 2);
                        
                        // Lógica simplificada para CA
                        const baseAC = characterData.selectedEquipment?.some((item: any) => 
                          item.armor_category
                        );
                        
                        if (baseAC) {
                          const armorAC = 13; // Armor de couro, por exemplo
                          const maxBonus = 2; // Limite para armaduras médias
                          const dexBonus = dexMod > maxBonus ? 
                            Math.min(dexMod, maxBonus) : dexMod;
                          return armorAC + dexBonus;
                        }
                        return 10 + dexMod;
                      })()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded">
                    <p className="font-medium text-red-800">Pontos de Vida</p>
                    <p className="text-3xl font-bold text-red-600">
                      {(() => {
                        const conScore = characterData.finalAbilityScores?.constitution || 10;
                        const conMod = Math.floor((conScore - 10) / 2);
                        const hitDie = characterData.selectedClass?.hit_die || 8;
                        return hitDie + conMod;
                      })()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded">
                    <p className="font-medium text-green-800">Bônus de Proficiência</p>
                    <p className="text-3xl font-bold text-green-600">+2</p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <p className="text-gray-500">Erro ao carregar dados do personagem</p>
          )}
        </div>
      );
    }
  }
];

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

const CharacterCreationWizard = () => {
  // Estado para controlar hidratação
  const [isMounted, setIsMounted] = useState(false);
  
  // Estados do wizard
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
        
        {/* Debug Info Global - APENAS APÓS HIDRATAÇÃO */}
        {process.env.NODE_ENV === 'development' && isMounted && (
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
                <p>• Perícias: {getConsolidatedCharacterData()?.selectedSkills?.length || 0}</p>
                <p>• Magias: {getConsolidatedCharacterData()?.selectedSpells?.length || 0}</p>
                <p>• Equipamentos: {getConsolidatedCharacterData()?.selectedEquipment?.length || 0}</p>
              </div>
            </div>
          </Card>
        )}
        
        {/* Progress Bar - APENAS APÓS HIDRATAÇÃO */}
        {isMounted && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        )}
        
        {/* Step Navigation - APENAS APÓS HIDRATAÇÃO */}
        {isMounted && (
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
        )}
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
                <span className="text-green-600 font-medium">✓ Step válido</span>
              ) : (
                <span className="text-orange-600 font-medium">⚠ Complete as informações</span>
              )}
            </div>

            {/* Next/Finish Button */}
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleFinalizeCharacter}
                disabled={!isCurrentStepValid()}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                🎉 Finalizar Personagem
              </Button>
            ) : (
              <Button
                onClick={goToNextStep}
                disabled={!isCurrentStepValid()}
                className="flex items-center gap-2"
              >
                Próximo →
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CharacterCreationWizard;