import { useState, useEffect } from "react";
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

// Funções relacionadas ao storage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no storage:', { key, error });
  }
};

const loadFromStorage = (key: string, defaultValue: any): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Erro ao carregar do storage:', { key, error });
    return defaultValue;
  }
};

const getConsolidatedCharacterData = () => {
  try {
    return {
      selectedRace: JSON.parse(localStorage.getItem('character_creation_race') || 'null') as DndRace | null,
      selectedClass: JSON.parse(localStorage.getItem('character_creation_class') || 'null') as DndClass | null,
      selectedBackground: JSON.parse(localStorage.getItem('character_creation_background') || 'null') as DndBackground | null,
      finalAbilityScores: JSON.parse(localStorage.getItem('character_creation_final_ability_scores') || '{}') as Record<string, number>
    };
  } catch (error) {
    console.error('Erro ao buscar dados consolidados:', error);
    return {
      selectedRace: null,
      selectedClass: null,
      selectedBackground: null,
      finalAbilityScores: {}
    };
  }
};

// Interface Strategy
interface EquipmentOptionStrategy {
  render(onSelect?: (selection: any) => void, isSelected?: boolean): JSX.Element;
  getEquipmentDetails(): { 
    index: string; 
    name: string; 
    url: string; 
    quantity: number 
  }[];
}

// Implementações concretas das estratégias
class CountedReferenceStrategy implements EquipmentOptionStrategy {
  constructor(private option: any) {}

  render(onSelect?: (selection: any) => void, isSelected?: boolean) {
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
            console.log(`[Strategy] CountedReference clicado: ${item.name}`);
            onSelect(null);
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

class MultipleItemsStrategy implements EquipmentOptionStrategy {
  constructor(private option: any) {}

  render(onSelect?: (selection: any) => void, isSelected?: boolean) {
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
            console.log(`[Strategy] MultipleItems clicado: ${this.option.items.length} itens`);
            onSelect(null);
          }
        }}
      >
        <p className={`font-medium ${isSelected ? 'text-green-300' : 'text-slate-200'}`}>
          Conjunto de Itens:
        </p>
        <div className="mt-2 space-y-2">
          {this.option.items.map((item: any, index: number) => {
            const strategy = createStrategy(item);
            return <div key={index}>{strategy.render()}</div>;
          })}
        </div>
      </div>
    );
  }

  getEquipmentDetails() {
    if (!Array.isArray(this.option.items)) {
      console.error('[Strategy] Dados inválidos em múltiplos itens');
      return [];
    }
    
    return this.option.items.flatMap((item: any) => {
      const strategy = createStrategy(item);
      return strategy.getEquipmentDetails();
    });
  }
}

class ChoiceStrategy implements EquipmentOptionStrategy {
  constructor(private option: any) {}

  render(onSelect?: (selection: any) => void, isSelected?: boolean) {
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

// Nova estratégia para combinação de choice + counted reference
class ChoiceWithCountedReferenceStrategy implements EquipmentOptionStrategy {
  constructor(private option: any) {}

  render(onSelect?: (selection: any) => void, isSelected?: boolean) {
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

// Componente React para Choice Strategy
const ChoiceStrategyComponent = ({ 
  option, 
  onSelect,
  isSelected
}: { 
  option: any; 
  onSelect?: (selection: any) => void;
  isSelected?: boolean;
}) => {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se é parte de uma opção múltipla
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
        console.error('[Strategy] Falha ao buscar equipamentos:', err);
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

  // Função para lidar com a confirmação da escolha
  const handleConfirmation = () => {
    const selected = equipmentList.find(item => item.index === selectedItem);
    
    if (!selected) {
      console.error('[Strategy] Item selecionado não encontrado');
      return;
    }

    // Log detalhado do item escolhido
    console.log('[Equipamento Escolhido]', {
      nome: selected.name,
      índice: selected.index,
      url: selected.url,
      categoria: option.choice.from.equipment_category.name
    });

    // Chama a função externa de seleção se existir
    if (onSelect) {
      onSelect(selected);
    }
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

// Componente para Choice + CountedReference
const ChoiceWithCountedReferenceComponent = ({ 
  option, 
  onSelect,
  isSelected
}: { 
  option: any; 
  onSelect?: (selection: any) => void;
  isSelected?: boolean;
}) => {
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
        console.error('[Strategy] Falha ao buscar equipamentos:', err);
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
    
    if (!selected) {
      console.error('[Strategy] Item selecionado não encontrado');
      return;
    }

    // Log detalhado da seleção
    console.log('[Equipamento Escolhido + Item Fixo]', {
      item_escolhido: {
        nome: selected.name,
        índice: selected.index,
        url: selected.url,
        categoria: option.choice.from.equipment_category.name
      },
      item_fixo: {
        nome: option.counted_reference.of.name,
        índice: option.counted_reference.of.index,
        quantidade: option.counted_reference.count
      }
    });

    // Chama a função externa de seleção se existir
    if (onSelect) {
      onSelect(selected);
    }
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
      
      {/* Parte de escolha (arma marcial) */}
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
      
      {/* Parte de item fixo (escudo) */}
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

// Factory para criar estratégias
function createStrategy(option: any): EquipmentOptionStrategy {
  if (!option || !option.option_type) {
    console.error('[Strategy] Opção inválida');
    return {
      render: () => <p className="text-red-500">Opção inválida</p>,
      getEquipmentDetails: () => []
    };
  }
  
  // Nova detecção para opções combinadas
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
      console.warn(`[Strategy] Tipo desconhecido: ${option.option_type}`);
      return {
        render: () => <p className="text-red-500">Tipo desconhecido</p>,
        getEquipmentDetails: () => []
      };
  }
}

// Função para mesclar itens de equipamento duplicados
const mergeEquipmentItems = (items: any[]) => {
  const merged: Record<string, any> = {};
  
  items.forEach(item => {
    const key = item.index;
    if (merged[key]) {
      merged[key].quantity += item.quantity;
    } else {
      merged[key] = { ...item };
    }
  });
  
  const result = Object.values(merged);
  console.log('[Itens Selecionados]', result);
  return result;
};

// Função para processar uma opção e retornar os itens de equipamento
const processOption = (option: any, userSelection?: any) => {
  console.log('[ProcessOption]', { 
    optionType: option.option_type, 
    userSelection: userSelection ? userSelection.name : null 
  });

  // Tratamento especial para opções de escolha
  if (option.option_type === 'choice' && userSelection) {
    return [{
      index: userSelection.index,
      name: userSelection.name,
      url: userSelection.url,
      quantity: 1
    }];
  }

  // Tratamento especial para opções combinadas
  if (option.option_type === 'choice' && option.counted_reference && userSelection) {
    return [
      {
        index: userSelection.index,
        name: userSelection.name,
        url: userSelection.url,
        quantity: 1
      },
      {
        index: option.counted_reference.of.index,
        name: option.counted_reference.of.name,
        url: option.counted_reference.of.url,
        quantity: option.counted_reference.count || 1
      }
    ];
  }

  const strategy = createStrategy(option);
  let baseDetails = strategy.getEquipmentDetails();

  // Tratamento especial para opções múltiplas com itens aninhados
  if (option.option_type === 'multiple' && Array.isArray(option.items)) {
    baseDetails = option.items.flatMap((item: any) => {
      // Se o item for uma escolha e tivermos uma seleção, usamos-a
      if (item.option_type === 'choice' && userSelection) {
        return processOption(item, userSelection);
      }
      return processOption(item);
    });
  }

  return baseDetails;
};

const EquipmentComponent = () => {
  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, { optionIndex: number }>>({});
  const [userSelections, setUserSelections] = useState<Record<string, { optionIndex: number, selection?: any }>>({});
  
  useEffect(() => {
    const data = getConsolidatedCharacterData();
    const startingEquipmentOptions = data.selectedClass?.starting_equipment_options || [];
    
    setEquipmentOptions(startingEquipmentOptions);
    
    // Carregar equipamentos fixos
    const fixedEquipment = data.selectedClass?.starting_equipment || [];
    const fixedItems = fixedEquipment.map(item => ({
      index: item.equipment.index,
      name: item.equipment.name,
      url: item.equipment.url,
      quantity: item.quantity || 1,
      source: 'Equipamento fixo'
    }));
    
    setSelectedItems(fixedItems);
  }, []);

  // Função para salvar os equipamentos no localStorage
  const saveCharacterEquipment = (equipment: any[]) => {
    const equipmentToSave = equipment.map(item => ({
      index: item.index,
      name: item.name,
      url: item.url,
      quantity: item.quantity
    }));
    
    saveToStorage('character_creation_equipment', equipmentToSave);
    console.log('[Equipamentos Salvos]', equipmentToSave);
  };

  const handleSelectOption = (optionGroupIndex: number, optionIndex: number, selection?: any) => {
    console.log(`[Seleção] Grupo: ${optionGroupIndex}, Opção: ${optionIndex}`, selection);
    
    const groupKey = `group-${optionGroupIndex}`;
    const optionGroup = equipmentOptions[optionGroupIndex];
    const option = optionGroup?.from?.options?.[optionIndex];
    
    if (!option) {
      console.error('[Strategy] Opção não encontrada');
      return;
    }

    // Armazenar seleção do usuário
    setUserSelections(prev => ({
      ...prev,
      [groupKey]: { optionIndex, selection }
    }));

    // Processar a opção para obter os itens
    const newItems = processOption(option, selection).map(detail => ({
      ...detail,
      source: `Opção ${optionGroupIndex + 1}`
    }));

    console.log('[Novos Itens]', newItems);

    setSelectedItems(prev => {
      // Remover itens antigos deste grupo
      const filteredItems = prev.filter(item => item.source !== `Opção ${optionGroupIndex + 1}`);
      
      // Adicionar novos itens
      const updatedItems = [...filteredItems, ...newItems];
      
      console.log('[Itens Atualizados]', updatedItems);
      
      // Salvar os equipamentos atualizados
      const mergedItems = mergeEquipmentItems(updatedItems);
      saveCharacterEquipment(mergedItems);
      
      return updatedItems;
    });

    setSelectedChoices(prev => ({
      ...prev,
      [groupKey]: { optionIndex }
    }));
  };

  const getIsOptionSelected = (groupIndex: number, optionIndex: number) => {
    const groupKey = `group-${groupIndex}`;
    return selectedChoices[groupKey]?.optionIndex === optionIndex;
  };

  const getSelectedChoice = (groupIndex: number) => {
    const groupKey = `group-${groupIndex}`;
    return userSelections[groupKey]?.selection;
  };

  const mergedSelectedItems = mergeEquipmentItems(selectedItems);

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
                      {selectedItems
                        .filter(item => item.source === `Opção ${groupIndex + 1}`)
                        .map((item, index) => (
                          <div key={index} className="flex items-center">
                            <div className="bg-green-500/20 rounded-full p-1 mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-green-200">
                              {item.quantity}x {item.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {mergedSelectedItems.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-green-300 mb-4">Equipamentos Selecionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mergedSelectedItems.map((item, index) => (
                  <div key={index} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-green-300">{item.name}</p>
                        <p className="text-sm text-green-400">
                          {item.quantity}x | {item.source}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">{item.index}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EquipmentComponent;