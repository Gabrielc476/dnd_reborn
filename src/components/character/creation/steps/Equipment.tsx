// components/character/creation/steps/Equipment.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { DndBackground, DndClass, DndRace } from "@/types/characterCreation";
import { EquipmentItem } from "@/types/character";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Interface para dados básicos de equipamento
interface BasicEquipment {
  index: string;
  name: string;
  url: string;
  quantity: number;
}

// Interface para opções de equipamento
interface EquipmentOption {
  option_type: string;
  [key: string]: any;
}

// Interface para estratégias de opção de equipamento
interface EquipmentOptionStrategy {
  render(onSelect?: (selection: EquipmentItem) => void, isSelected?: boolean): JSX.Element;
  getEquipmentDetails(): BasicEquipment[];
}

// Estratégia para referências contadas
class CountedReferenceStrategy implements EquipmentOptionStrategy {
  constructor(private option: EquipmentOption) {}

  render(onSelect?: (selection: EquipmentItem) => void, isSelected?: boolean) {
    const item = this.option.of;
    if (!item) return <p className="text-red-500">Dados incompletos</p>;
    
    return (
      <div 
        className={`p-3 rounded-lg transition-all ${
          isSelected 
            ? 'bg-green-500/20 border border-green-500/30' 
            : 'bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600'
        }`}
        onClick={() => {
          if (!isSelected && onSelect) {
            onSelect(null as any);
          }
        }}
      >
        <p className={`font-medium ${isSelected ? 'text-green-300' : 'text-slate-200'}`}>
          {this.option.count || 1}x {item.name || 'Item desconhecido'}
        </p>
        {item.index && (
          <p className={`text-xs mt-1 ${isSelected ? 'text-green-400' : 'text-slate-400'}`}>
            {item.index}
          </p>
        )}
      </div>
    );
  }

  getEquipmentDetails() {
    if (!this.option.of) return [];
    return [{
      index: this.option.of.index,
      name: this.option.of.name,
      url: this.option.of.url,
      quantity: this.option.count || 1
    }];
  }
}

// Estratégia para múltiplos itens
class MultipleItemsStrategy implements EquipmentOptionStrategy {
  constructor(private option: EquipmentOption) {}

  render(onSelect?: (selection: EquipmentItem) => void, isSelected?: boolean) {
    if (!Array.isArray(this.option.items)) {
      return <p className="text-red-500">Dados de múltiplos itens inválidos</p>;
    }
    
    return (
      <div 
        className={`p-3 rounded-lg transition-all ${
          isSelected 
            ? 'bg-green-500/20 border border-green-500/30' 
            : 'bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600'
        }`}
        onClick={() => {
          if (!isSelected && onSelect) {
            onSelect(null as any);
          }
        }}
      >
        <p className={`font-medium ${isSelected ? 'text-green-300' : 'text-slate-200'}`}>
          Conjunto de Itens:
        </p>
        <div className="mt-2 space-y-2">
          {this.option.items.map((item: EquipmentOption, index: number) => {
            const strategy = createStrategy(item);
            return <div key={index}>{strategy.render()}</div>;
          })}
        </div>
      </div>
    );
  }

  getEquipmentDetails() {
    if (!Array.isArray(this.option.items)) {
      return [];
    }
    
    return this.option.items.flatMap((item: EquipmentOption) => {
      const strategy = createStrategy(item);
      return strategy.getEquipmentDetails();
    });
  }
}

// Estratégia para escolhas
class ChoiceStrategy implements EquipmentOptionStrategy {
  constructor(private option: EquipmentOption) {}

  render(onSelect?: (selection: EquipmentItem) => void, isSelected?: boolean) {
    return (
      <ChoiceStrategyComponent 
        option={this.option} 
        onSelect={onSelect}
        isSelected={isSelected}
      />
    );
  }

  getEquipmentDetails() {
    return [];
  }
}

// Estratégia para escolhas com referência contada
class ChoiceWithCountedReferenceStrategy implements EquipmentOptionStrategy {
  constructor(private option: EquipmentOption) {}

  render(onSelect?: (selection: EquipmentItem) => void, isSelected?: boolean) {
    return (
      <ChoiceWithCountedReferenceComponent 
        option={this.option} 
        onSelect={onSelect}
        isSelected={isSelected}
      />
    );
  }

  getEquipmentDetails() {
    return [];
  }
}

// Interface para props do componente de estratégia de escolha
interface ChoiceStrategyProps {
  option: EquipmentOption;
  onSelect?: (selection: EquipmentItem) => void;
  isSelected?: boolean;
}

// Componente para estratégia de escolha
const ChoiceStrategyComponent = ({ 
  option, 
  onSelect,
  isSelected
}: ChoiceStrategyProps) => {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPartOfMultiple = option.option_type === 'choice' && 
                          option.choice?.from?.equipment_category?.index === 'martial-weapons';

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!option.choice?.from?.equipment_category?.url) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `https://www.dnd5eapi.co${option.choice.from.equipment_category.url}`
        );
        
        if (!response.ok) {
          throw new Error('Falha ao carregar equipamentos');
        }
        
        const data = await response.json();
        setEquipmentList(data.equipment || []);
      } catch (err) {
        setError('Falha ao carregar equipamentos da categoria');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [option]);

  const handleSelect = (value: string) => {
    setSelectedItem(value);
  };

  const handleConfirmation = () => {
    const selected = equipmentList.find(item => item.index === selectedItem);
    if (!selected) return;
    if (onSelect) onSelect(selected);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        <span className="ml-2 text-slate-300">Carregando equipamentos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 bg-red-500/10 rounded border border-red-500/30">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (!option.choice || !option.choice.from || !option.choice.from.equipment_category) {
    return (
      <div className="p-2 bg-red-500/10 rounded border border-red-500/30">
        <p className="text-red-300">Dados de escolha incompletos</p>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg transition-all ${
      isSelected 
        ? 'bg-green-500/20 border border-green-500/30' 
        : 'bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600'
    }`}>
      <p className={`font-medium ${isSelected ? 'text-green-300' : 'text-slate-200'}`}>
        {isPartOfMultiple ? "Escolha uma arma marcial" : "Escolha:"}
      </p>
      <p className={`mb-3 text-sm ${isSelected ? 'text-green-400' : 'text-slate-400'}`}>
        {option.choice.desc}
      </p>
      
      <div className="mb-2">
        <Select 
          onValueChange={handleSelect} 
          value={selectedItem}
          disabled={isSelected}
        >
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
            <SelectValue placeholder="Selecione um equipamento">
              {selectedItem ? equipmentList.find(e => e.index === selectedItem)?.name : "Selecione um equipamento"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {equipmentList.map((equipment) => (
              <SelectItem 
                key={equipment.index} 
                value={equipment.index}
                className="hover:bg-slate-700 cursor-pointer"
              >
                {equipment.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedItem && !isSelected && (
        <Button 
          size="sm"
          onClick={handleConfirmation}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full"
        >
          Confirmar Escolha
        </Button>
      )}
      
      {isSelected && (
        <div className="mt-2 text-green-400 text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Selecionado
        </div>
      )}
      
      {isPartOfMultiple && (
        <p className="text-xs text-slate-400 mt-2">
          Esta escolha é parte de uma opção maior que inclui outros itens
        </p>
      )}
    </div>
  );
};

// Componente para estratégia de escolha com referência contada
const ChoiceWithCountedReferenceComponent = ({ 
  option, 
  onSelect,
  isSelected
}: ChoiceStrategyProps) => {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!option.choice?.from?.equipment_category?.url) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `https://www.dnd5eapi.co${option.choice.from.equipment_category.url}`
        );
        
        if (!response.ok) {
          throw new Error('Falha ao carregar equipamentos');
        }
        
        const data = await response.json();
        setEquipmentList(data.equipment || []);
      } catch (err) {
        setError('Falha ao carregar equipamentos da categoria');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [option]);

  const handleSelect = (value: string) => {
    setSelectedItem(value);
  };

  const handleConfirmation = () => {
    const selected = equipmentList.find(item => item.index === selectedItem);
    if (!selected) return;
    if (onSelect) onSelect(selected);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        <span className="ml-2 text-slate-300">Carregando equipamentos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 bg-red-500/10 rounded border border-red-500/30">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (!option.choice || !option.choice.from || !option.choice.from.equipment_category || 
      !option.counted_reference || !option.counted_reference.of) {
    return (
      <div className="p-2 bg-red-500/10 rounded border border-red-500/30">
        <p className="text-red-300">Dados incompletos para escolha combinada</p>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg transition-all ${
      isSelected 
        ? 'bg-green-500/20 border border-green-500/30' 
        : 'bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600'
    }`}>
      <p className={`font-medium ${isSelected ? 'text-green-300' : 'text-slate-200'}`}>
        Escolha uma arma marcial e receba um escudo
      </p>
      
      <div className="mb-4">
        <p className="mb-3 text-sm text-slate-400">
          {option.choice.desc}
        </p>
        
        <div className="mb-2">
          <Select 
            onValueChange={handleSelect} 
            value={selectedItem}
            disabled={isSelected}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
              <SelectValue placeholder="Selecione uma arma marcial">
                {selectedItem ? equipmentList.find(e => e.index === selectedItem)?.name : "Selecione uma arma"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {equipmentList.map((equipment) => (
                <SelectItem 
                  key={equipment.index} 
                  value={equipment.index}
                  className="hover:bg-slate-700 cursor-pointer"
                >
                  {equipment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="p-3 bg-slate-700/40 rounded-lg border border-slate-600">
        <p className="font-medium text-blue-300">
          Item adicional incluído:
        </p>
        <div className="mt-2 flex items-center">
          <div className="bg-blue-500/20 rounded-full p-1 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-blue-200">
            {option.counted_reference.count}x {option.counted_reference.of.name}
          </span>
        </div>
      </div>
      
      {selectedItem && !isSelected && (
        <Button 
          size="sm"
          onClick={handleConfirmation}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full mt-4"
        >
          Confirmar Escolha
        </Button>
      )}
      
      {isSelected && (
        <div className="mt-3 text-green-400 text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Selecionado
        </div>
      )}
    </div>
  );
};

// Criador de estratégias
function createStrategy(option: EquipmentOption): EquipmentOptionStrategy {
  if (!option || !option.option_type) {
    return {
      render: () => <p className="text-red-500">Opção inválida</p>,
      getEquipmentDetails: () => []
    };
  }
  
  if (option.option_type === 'choice' && option.counted_reference) {
    return new ChoiceWithCountedReferenceStrategy(option);
  }
  
  switch (option.option_type) {
    case 'counted_reference':
      return new CountedReferenceStrategy(option);
    case 'multiple':
      return new MultipleItemsStrategy(option);
    case 'choice':
      return new ChoiceStrategy(option);
    default:
      return {
        render: () => <p className="text-red-500">Tipo desconhecido</p>,
        getEquipmentDetails: () => []
      };
  }
}

// Função para buscar item completo na API
const fetchFullEquipmentItem = async (index: string): Promise<EquipmentItem> => {
  const response = await fetch(`https://www.dnd5eapi.co/api/equipment/${index}`);
  if (!response.ok) throw new Error('Failed to fetch equipment details');
  return response.json();
};

// Funções de armazenamento
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Erro ao salvar no localStorage", error);
  }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Erro ao carregar do localStorage", error);
    return defaultValue;
  }
};

// Chaves de armazenamento para o componente de equipamentos
const STORAGE_KEYS = {
  SELECTED_EQUIPMENT: 'character_creation_selected_equipment',
  SELECTED_CHOICES: 'character_creation_selected_choices',
  USER_SELECTIONS: 'character_creation_user_selections',
  EQUIPMENT_VALIDATION: 'character_creation_equipment_validation'
};

// Componente principal de equipamentos
const EquipmentComponent = ({ onValidationChange }: { onValidationChange?: (isValid: boolean) => void }) => {
  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, { optionIndex: number }>>({});
  const [userSelections, setUserSelections] = useState<Record<string, { optionIndex: number, selection?: any }>>({});
  const [showDebug, setShowDebug] = useState(false);
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

  const getConsolidatedCharacterData = () => {
    try {
      return {
        selectedRace: JSON.parse(localStorage.getItem('character_creation_race') || 'null') as DndRace | null,
        selectedClass: JSON.parse(localStorage.getItem('character_creation_class') || 'null') as DndClass | null,
        selectedBackground: JSON.parse(localStorage.getItem('character_creation_background') || 'null') as DndBackground | null,
        finalAbilityScores: JSON.parse(localStorage.getItem('character_creation_final_ability_scores') || '{}') as Record<string, number>
      };
    } catch (error) {
      return {
        selectedRace: null,
        selectedClass: null,
        selectedBackground: null,
        finalAbilityScores: {}
      };
    }
  };

  useEffect(() => {
    const data = getConsolidatedCharacterData();
    const startingEquipmentOptions = data.selectedClass?.starting_equipment_options || [];
    setEquipmentOptions(startingEquipmentOptions);
    
    // Carregar equipamentos fixos como EquipmentItems completos
    const loadFixedEquipment = async () => {
      const fixedEquipment = data.selectedClass?.starting_equipment || [];
      const fixedItems: EquipmentItem[] = [];
      
      for (const item of fixedEquipment) {
        try {
          const fullItem = await fetchFullEquipmentItem(item.equipment.index);
          // Adicionar múltiplas cópias se quantity > 1
          for (let i = 0; i < (item.quantity || 1); i++) {
            fixedItems.push(fullItem);
          }
        } catch (error) {
          console.error(`Error loading fixed equipment ${item.equipment.index}:`, error);
        }
      }
      
      setSelectedEquipment(fixedItems);
      saveToStorage(STORAGE_KEYS.SELECTED_EQUIPMENT, fixedItems);
    };
    
    loadFixedEquipment();
  }, []);

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedEquipment = loadFromStorage<EquipmentItem[]>(STORAGE_KEYS.SELECTED_EQUIPMENT, []);
    const savedChoices = loadFromStorage<Record<string, { optionIndex: number }>>(STORAGE_KEYS.SELECTED_CHOICES, {});
    const savedSelections = loadFromStorage<Record<string, { optionIndex: number, selection?: any }>>(STORAGE_KEYS.USER_SELECTIONS, {});

    if (savedEquipment.length > 0) {
      setSelectedEquipment(savedEquipment);
    }
    
    setSelectedChoices(savedChoices);
    setUserSelections(savedSelections);
  }, []);

  // Agrupar itens por tipo e quantidade
  const groupedEquipment = useMemo(() => {
    const merged: Record<string, { item: EquipmentItem, quantity: number }> = {};
    
    selectedEquipment.forEach(item => {
      const key = item.index;
      if (merged[key]) {
        merged[key].quantity += 1;
      } else {
        merged[key] = { item, quantity: 1 };
      }
    });
    
    return Object.values(merged);
  }, [selectedEquipment]);

  // Salvar equipamentos no localStorage
  const saveCharacterEquipment = (equipment: EquipmentItem[]) => {
    saveToStorage(STORAGE_KEYS.SELECTED_EQUIPMENT, equipment);
  };

  // Função de validação
  const validateEquipment = useCallback(() => {
    return equipmentOptions.every((_, index) => {
      const groupKey = `group-${index}`;
      return selectedChoices[groupKey] !== undefined;
    });
  }, [equipmentOptions, selectedChoices]);

  // Efeito para salvar dados e validar
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SELECTED_EQUIPMENT, selectedEquipment);
    saveToStorage(STORAGE_KEYS.SELECTED_CHOICES, selectedChoices);
    saveToStorage(STORAGE_KEYS.USER_SELECTIONS, userSelections);
    
    const isValid = validateEquipment();
    onValidationChange?.(isValid);
    saveToStorage(STORAGE_KEYS.EQUIPMENT_VALIDATION, isValid);
  }, [selectedEquipment, selectedChoices, userSelections, validateEquipment, onValidationChange]);

  // Lidar com seleção de opção
  const handleSelectOption = async (optionGroupIndex: number, optionIndex: number, selection?: EquipmentItem) => {
    const groupKey = `group-${optionGroupIndex}`;
    const optionGroup = equipmentOptions[optionGroupIndex];
    
    if (!optionGroup || !optionGroup.from || !optionGroup.from.options) return;

    const option = optionGroup.from.options[optionIndex];
    
    if (!option) return;

    setUserSelections(prev => ({
      ...prev,
      [groupKey]: { optionIndex, selection }
    }));

    // Processar a opção para obter os índices dos itens
    const strategy = createStrategy(option);
    const baseDetails = strategy.getEquipmentDetails();
    
    // Buscar todos os itens completos em paralelo
    const newItemsPromises = baseDetails.map(async detail => {
      setLoadingItems(prev => ({ ...prev, [detail.index]: true }));
      try {
        const fullItem = await fetchFullEquipmentItem(detail.index);
        // Retornar múltiplas cópias se quantity > 1
        return Array(detail.quantity).fill(fullItem);
      } catch (error) {
        console.error(`Error fetching equipment ${detail.index}:`, error);
        return [];
      } finally {
        setLoadingItems(prev => ({ ...prev, [detail.index]: false }));
      }
    });

    // Se houver seleção do usuário (para opções do tipo choice)
    if (selection) {
      setLoadingItems(prev => ({ ...prev, [selection.index]: true }));
      try {
        const fullItem = await fetchFullEquipmentItem(selection.index);
        newItemsPromises.push(Promise.resolve([fullItem]));
      } catch (error) {
        console.error(`Error fetching selected equipment ${selection.index}:`, error);
      } finally {
        setLoadingItems(prev => ({ ...prev, [selection.index]: false }));
      }
    }

    const newItemsArrays = await Promise.all(newItemsPromises);
    const newItems = newItemsArrays.flat();

    setSelectedEquipment(prev => {
      // Remover itens da mesma opção
      const filteredItems = prev.filter(item => 
        !newItems.some(newItem => newItem.index === item.index)
      );
      
      // Adicionar novos itens
      const updatedItems = [...filteredItems, ...newItems];
      
      saveToStorage(STORAGE_KEYS.SELECTED_EQUIPMENT, updatedItems);
      return updatedItems;
    });

    setSelectedChoices(prev => ({
      ...prev,
      [groupKey]: { optionIndex }
    }));
  };

  // Verificar se uma opção está selecionada
  const getIsOptionSelected = (groupIndex: number, optionIndex: number) => {
    const groupKey = `group-${groupIndex}`;
    return selectedChoices[groupKey]?.optionIndex === optionIndex;
  };

  // Obter escolha selecionada
  const getSelectedChoice = (groupIndex: number) => {
    const groupKey = `group-${groupIndex}`;
    return userSelections[groupKey]?.selection;
  };

  // Copiar dados de debug
  const copyDebugData = () => {
    const debugData = {
      equipmentOptions,
      selectedEquipment,
      selectedChoices,
      userSelections,
      groupedEquipment
    };
    navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Escolha de Equipamento Inicial</h1>
      
      {equipmentOptions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-300">Nenhuma opção de equipamento disponível</p>
        </div>
      ) : (
        <div className="space-y-8">
          {equipmentOptions.map((optionGroup, groupIndex) => {
            if (!optionGroup.from || !Array.isArray(optionGroup.from.options)) {
              return (
                <div key={groupIndex} className="border border-red-500/30 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-red-300 mb-4">
                    Grupo de opções inválido
                  </h2>
                  <p className="text-slate-300">{optionGroup.desc || "Descrição indisponível"}</p>
                </div>
              );
            }
            
            return (
              <div key={groupIndex} className="border border-blue-500/30 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-300 mb-4">
                  {optionGroup.desc}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optionGroup.from.options.map((option: any, optionIndex: number) => {
                    const strategy = createStrategy(option);
                    const isSelected = getIsOptionSelected(groupIndex, optionIndex);
                    const userSelection = isSelected ? getSelectedChoice(groupIndex) : null;
                    
                    return (
                      <div 
                        key={optionIndex}
                        className={isSelected ? "cursor-default" : "cursor-pointer"}
                        onClick={!isSelected && option.option_type !== 'choice' && !option.counted_reference ? 
                          () => handleSelectOption(groupIndex, optionIndex) : 
                          undefined
                        }
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${isSelected ? 'text-green-400' : 'text-blue-400'}`}>
                            Opção {optionIndex + 1}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            isSelected 
                              ? 'bg-green-500/30 text-green-300' 
                              : 'bg-slate-600 text-slate-300'
                          }`}>
                            {option.counted_reference ? "Escolha + Item" : option.option_type || "tipo desconhecido"}
                          </span>
                        </div>
                        
                        {strategy.render(
                          (option.option_type === 'choice' || option.counted_reference) ? 
                            (selection) => handleSelectOption(groupIndex, optionIndex, selection) : 
                            undefined,
                          isSelected
                        )}
                        
                        {isSelected && userSelection && (
                          <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                            <p className="text-green-300 text-sm font-medium">Item escolhido:</p>
                            <p className="text-green-200">{userSelection.name}</p>
                          </div>
                        )}
                        
                        {isSelected && (
                          <div className="mt-2 text-green-400 text-sm flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Selecionado
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {selectedChoices[`group-${groupIndex}`] && (
                  <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <p className="font-medium text-green-300">Opção selecionada:</p>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {selectedEquipment
                        .filter((_, index) => index >= selectedEquipment.length - equipmentOptions[groupIndex]?.from.options[selectedChoices[`group-${groupIndex}`].optionIndex].items?.length)
                        .map((item, index) => (
                          <div key={index} className="flex items-center">
                            <div className="bg-green-500/20 rounded-full p-1 mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-green-200">
                              {item.name}
                              {loadingItems[item.index] && (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-400 inline-block ml-2" />
                              )}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {groupedEquipment.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-green-300 mb-4">Equipamentos Selecionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groupedEquipment.map((group, index) => {
                  const item = group.item;
                  return (
                    <div key={index} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <div className="flex justify-between">
                        <div className="w-4/5">
                          <p className="font-medium text-green-300">{item.name}</p>
                          <p className="text-sm text-green-400">
                            {group.quantity}x
                          </p>
                          
                          {/* Categoria de equipamento */}
                          {item.equipment_category && (
                            <p className="text-xs mt-1 text-slate-400">
                              Categoria: {item.equipment_category.name}
                            </p>
                          )}
                          
                          {/* Categoria de engrenagem */}
                          {item.gear_category && (
                            <p className="text-xs text-slate-400">
                              Tipo: {item.gear_category.name}
                            </p>
                          )}
                          
                          {/* Custo */}
                          {item.cost && (
                            <p className="text-xs text-slate-400">
                              Custo: {item.cost.quantity} {item.cost.unit}
                            </p>
                          )}
                          
                          {/* Peso */}
                          {item.weight !== undefined && (
                            <p className="text-xs text-slate-400">
                              Peso: {item.weight} lbs
                            </p>
                          )}
                          
                          {/* Detalhes específicos de armas */}
                          {item.weapon_category && (
                            <div className="mt-1">
                              <p className="text-xs text-slate-400">
                                Tipo: {item.weapon_category} ({item.weapon_range})
                              </p>
                              {item.damage && (
                                <p className="text-xs text-slate-400">
                                  Dano: {item.damage.damage_dice} {item.damage.damage_type?.name}
                                </p>
                              )}
                              {item.range && (
                                <p className="text-xs text-slate-400">
                                  Alcance: {item.range.normal}/{item.range.long || '-'} ft
                                </p>
                              )}
                              {item.properties && item.properties.length > 0 && (
                                <p className="text-xs text-slate-400">
                                  Propriedades: {item.properties.map(p => p.name).join(', ')}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Detalhes específicos de armaduras */}
                          {item.armor_category && (
                            <div className="mt-1">
                              <p className="text-xs text-slate-400">
                                Categoria: {item.armor_category}
                              </p>
                              {item.armor_class && (
                                <p className="text-xs text-slate-400">
                                  CA: {item.armor_class.base} {item.armor_class.dex_bonus ? `+ Dex` : ''}
                                  {item.armor_class.max_bonus ? ` (max +${item.armor_class.max_bonus})` : ''}
                                </p>
                              )}
                              {item.str_minimum !== undefined && (
                                <p className="text-xs text-slate-400">
                                  Força mínima: {item.str_minimum}
                                </p>
                              )}
                              {item.stealth_disadvantage && (
                                <p className="text-xs text-red-400">
                                  Desvantagem em Furtividade
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Detalhes para itens mágicos */}
                          {item.rarity && (
                            <p className="text-xs text-purple-400 mt-1">
                              Raridade: {item.rarity.name}
                            </p>
                          )}
                          {item.attunement && (
                            <p className="text-xs text-purple-400">
                              Requer sintonização
                            </p>
                          )}
                          
                          {/* Descrição */}
                          {item.desc && (
                            <div className="mt-1">
                              {item.desc.map((desc, idx) => (
                                <p key={idx} className="text-xs text-slate-400">
                                  {desc}
                                </p>
                              ))}
                            </div>
                          )}
                          
                          {/* Conteúdo (para pacotes/kits) */}
                          {item.contents && item.contents.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-slate-300">Contém:</p>
                              <ul className="list-disc pl-5 text-xs text-slate-400">
                                {item.contents.map((content, idx) => (
                                  <li key={idx}>
                                    {content.quantity}x {content.item.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Detalhes para veículos */}
                          {item.vehicle_category && (
                            <div className="mt-1">
                              <p className="text-xs text-slate-400">
                                Categoria de veículo: {item.vehicle_category}
                              </p>
                              {item.speed && (
                                <p className="text-xs text-slate-400">
                                  Velocidade: {item.speed.quantity} {item.speed.unit}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Capacidade */}
                          {item.capacity && (
                            <p className="text-xs text-slate-400">
                              Capacidade: {item.capacity}
                            </p>
                          )}
                        </div>
                        <div className="text-right w-1/5">
                          <p className="text-xs text-slate-400">{item.index}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botão para mostrar/ocultar debug */}
      <div className="mt-6 flex justify-end">
        <Button 
          size="sm"
          variant="outline"
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs bg-slate-700 hover:bg-slate-600 border-slate-600"
        >
          {showDebug ? "Ocultar Debug" : "Mostrar Debug"}
        </Button>
      </div>

      {/* Seção de Debug */}
      {showDebug && (
        <div className="mt-6 p-4 bg-slate-900/80 rounded-lg border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-yellow-400">Debug Information</h3>
            <Button 
              size="sm"
              onClick={copyDebugData}
              className="text-xs bg-yellow-700 hover:bg-yellow-600"
            >
              Copiar Dados
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <h4 className="text-slate-400 font-medium mb-1">Equipment Options</h4>
              <pre className="bg-slate-800 p-2 rounded max-h-40 overflow-auto text-slate-300">
                {JSON.stringify(equipmentOptions, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="text-slate-400 font-medium mb-1">Selected Equipment</h4>
              <pre className="bg-slate-800 p-2 rounded max-h-40 overflow-auto text-slate-300">
                {JSON.stringify(selectedEquipment, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="text-slate-400 font-medium mb-1">Selected Choices</h4>
              <pre className="bg-slate-800 p-2 rounded max-h-40 overflow-auto text-slate-300">
                {JSON.stringify(selectedChoices, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="text-slate-400 font-medium mb-1">User Selections</h4>
              <pre className="bg-slate-800 p-2 rounded max-h-40 overflow-auto text-slate-300">
                {JSON.stringify(userSelections, null, 2)}
              </pre>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-slate-400 font-medium mb-1">Grouped Equipment</h4>
            <pre className="bg-slate-800 p-2 rounded max-h-40 overflow-auto text-green-300">
              {JSON.stringify(groupedEquipment, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentComponent;