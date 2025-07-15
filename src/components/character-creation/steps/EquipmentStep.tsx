// ===========================
// EQUIPMENT STEP - ATUALIZADO PARA USAR NOVOS HOOKS
// src/components/character-creation/steps/EquipmentStep.tsx
// ===========================

"use client";

import { useState, useMemo } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { 
  Sword, 
  Shield, 
  Package, 
  Coins, 
  Search, 
  Info, 
  Check, 
  X,
  Plus,
  Minus,
  ShoppingCart,
  Backpack,
  Wand2,
  Zap,
  Crown,
  Shirt,
  Gem,
  Hammer,
  Scroll,
  Potion,
  Compass,
  Lightbulb,
  Music,
  Key,
  Feather
} from "lucide-react";

// ===========================
// EQUIPMENT CATEGORIES E ICONS
// ===========================

const EQUIPMENT_CATEGORIES = {
  'weapon': { name: 'Armas', icon: Sword, color: 'from-red-500 to-red-600' },
  'armor': { name: 'Armaduras', icon: Shield, color: 'from-blue-500 to-blue-600' },
  'shield': { name: 'Escudos', icon: Shield, color: 'from-purple-500 to-purple-600' },
  'adventuring-gear': { name: 'Equipamentos', icon: Backpack, color: 'from-green-500 to-green-600' },
  'tools': { name: 'Ferramentas', icon: Hammer, color: 'from-orange-500 to-orange-600' },
  'mounts-and-vehicles': { name: 'Montarias', icon: Compass, color: 'from-indigo-500 to-indigo-600' },
  'trade-goods': { name: 'Mercadorias', icon: Gem, color: 'from-yellow-500 to-yellow-600' },
  'other': { name: 'Outros', icon: Package, color: 'from-gray-500 to-gray-600' }
};

const STARTING_EQUIPMENT_METHODS = [
  {
    id: 'starting-equipment',
    name: 'Equipamento Inicial',
    description: 'Receba o equipamento padrão da sua classe e background',
    icon: Package,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'buy-equipment',
    name: 'Comprar Equipamento',
    description: 'Comece com ouro e compre seus próprios equipamentos',
    icon: Coins,
    color: 'from-yellow-500 to-yellow-600'
  }
];

// ===========================
// EQUIPMENT ITEM COMPONENT
// ===========================

interface EquipmentItemProps {
  item: any; // Tipo do equipamento
  isSelected: boolean;
  onToggle: () => void;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  showQuantity?: boolean;
  disabled?: boolean;
}

function EquipmentItem({ 
  item, 
  isSelected, 
  onToggle, 
  quantity = 1,
  onQuantityChange,
  showQuantity = false,
  disabled = false
}: EquipmentItemProps) {
  const categoryInfo = EQUIPMENT_CATEGORIES[item.equipment_category?.index as keyof typeof EQUIPMENT_CATEGORIES] || EQUIPMENT_CATEGORIES.other;
  const CategoryIcon = categoryInfo.icon;

  return (
    <div
      onClick={!disabled ? onToggle : undefined}
      className={`p-4 rounded-xl border transition-all duration-200 ${
        disabled
          ? 'opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-700/50'
          : isSelected
          ? 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-400/50 shadow-lg cursor-pointer'
          : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/50 cursor-pointer'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Item Icon */}
          <div className={`p-2 rounded-lg bg-gradient-to-br ${categoryInfo.color} flex-shrink-0`}>
            <CategoryIcon className="w-4 h-4 text-white" />
          </div>

          {/* Item Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`font-medium transition-colors ${
                  isSelected ? 'text-white' : 'text-gray-300'
                }`}>
                  {item.name}
                </h3>
                
                {/* Category */}
                <p className="text-xs text-gray-400 mt-1">
                  {categoryInfo.name}
                  {item.weapon_category && ` • ${item.weapon_category}`}
                  {item.armor_category && ` • ${item.armor_category}`}
                </p>

                {/* Properties */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.damage && (
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                      {item.damage.damage_dice} {item.damage.damage_type?.name}
                    </span>
                  )}
                  
                  {item.armor_class && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      AC {item.armor_class.base}
                    </span>
                  )}
                  
                  {item.properties && item.properties.length > 0 && (
                    <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded">
                      {item.properties.length} propriedades
                    </span>
                  )}
                </div>
              </div>

              {/* Cost */}
              {item.cost && (
                <div className="text-right text-sm ml-3">
                  <div className="text-yellow-400 font-medium">
                    {item.cost.quantity} {item.cost.unit}
                  </div>
                  {item.weight && (
                    <div className="text-gray-500 text-xs">
                      {item.weight} lbs
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Controls */}
            {showQuantity && isSelected && onQuantityChange && (
              <div className="flex items-center space-x-2 mt-3">
                <span className="text-sm text-gray-400">Quantidade:</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuantityChange(Math.max(1, quantity - 1));
                  }}
                  className="w-6 h-6 rounded bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center"
                >
                  <Minus className="w-3 h-3 text-gray-400" />
                </button>
                <span className="w-8 text-center text-sm text-white">{quantity}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuantityChange(quantity + 1);
                  }}
                  className="w-6 h-6 rounded bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center"
                >
                  <Plus className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selection Status */}
        <div className="ml-3 flex-shrink-0">
          {isSelected ? (
            <Check className="w-5 h-5 text-green-400" />
          ) : (
            <div className="w-5 h-5 border-2 border-gray-500 rounded" />
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

export default function EquipmentStep() {
  const {
    characterData,
    updateCharacterField,
    // Note: Equipment será gerenciado através do contexto de compatibilidade
  } = useCharacterCreationContext();

  const [selectedMethod, setSelectedMethod] = useState<'starting-equipment' | 'buy-equipment'>('starting-equipment');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyAffordable, setShowOnlyAffordable] = useState(false);

  // Mock data - em produção, isso viria dos hooks específicos
  const [startingGold] = useState(100); // Seria do hook de equipment
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(characterData.selectedEquipment || []);
  const [equipmentQuantities, setEquipmentQuantities] = useState<Record<string, number>>({});

  // Mock equipment data - em produção viria da API
  const mockEquipment = [
    {
      index: 'longsword',
      name: 'Espada Longa',
      equipment_category: { index: 'weapon', name: 'Weapon' },
      weapon_category: 'Martial Melee',
      damage: { damage_dice: '1d8', damage_type: { name: 'Slashing' } },
      cost: { quantity: 15, unit: 'gp' },
      weight: 3,
      properties: [{ name: 'Versatile' }]
    },
    {
      index: 'chainmail',
      name: 'Cota de Malha',
      equipment_category: { index: 'armor', name: 'Armor' },
      armor_category: 'Heavy',
      armor_class: { base: 16 },
      cost: { quantity: 75, unit: 'gp' },
      weight: 55
    },
    {
      index: 'shield',
      name: 'Escudo',
      equipment_category: { index: 'shield', name: 'Shield' },
      armor_class: { base: 2 },
      cost: { quantity: 10, unit: 'gp' },
      weight: 6
    }
  ];

  // ===========================
  // COMPUTED VALUES
  // ===========================

  const filteredEquipment = useMemo(() => {
    let filtered = mockEquipment;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.equipment_category?.index === selectedCategory
      );
    }

    // Filter by affordability (only in buy mode)
    if (selectedMethod === 'buy-equipment' && showOnlyAffordable) {
      filtered = filtered.filter(item => 
        item.cost && item.cost.quantity <= startingGold
      );
    }

    return filtered;
  }, [mockEquipment, searchTerm, selectedCategory, selectedMethod, showOnlyAffordable, startingGold]);

  const totalCost = useMemo(() => {
    return selectedEquipment.reduce((total, itemIndex) => {
      const item = mockEquipment.find(eq => eq.index === itemIndex);
      const quantity = equipmentQuantities[itemIndex] || 1;
      return total + (item?.cost?.quantity || 0) * quantity;
    }, 0);
  }, [selectedEquipment, equipmentQuantities, mockEquipment]);

  const remainingGold = startingGold - totalCost;

  // ===========================
  // HANDLERS
  // ===========================

  const handleMethodChange = (method: 'starting-equipment' | 'buy-equipment') => {
    setSelectedMethod(method);
    setSelectedEquipment([]);
    setEquipmentQuantities({});
    updateCharacterField('selectedEquipment', []);
  };

  const handleToggleEquipment = (itemIndex: string) => {
    const newSelected = selectedEquipment.includes(itemIndex)
      ? selectedEquipment.filter(idx => idx !== itemIndex)
      : [...selectedEquipment, itemIndex];
    
    setSelectedEquipment(newSelected);
    updateCharacterField('selectedEquipment', newSelected);
    
    // Remove quantity if deselected
    if (!newSelected.includes(itemIndex)) {
      const newQuantities = { ...equipmentQuantities };
      delete newQuantities[itemIndex];
      setEquipmentQuantities(newQuantities);
    }
  };

  const handleQuantityChange = (itemIndex: string, quantity: number) => {
    setEquipmentQuantities(prev => ({
      ...prev,
      [itemIndex]: quantity
    }));
  };

  const canAfford = (item: any): boolean => {
    if (selectedMethod !== 'buy-equipment') return true;
    if (!item.cost) return true;
    
    const quantity = equipmentQuantities[item.index] || 1;
    const currentCost = selectedEquipment.includes(item.index) 
      ? (equipmentQuantities[item.index] || 1) * item.cost.quantity
      : 0;
    
    return remainingGold + currentCost >= item.cost.quantity * quantity;
  };

  // ===========================
  // STARTING EQUIPMENT SUGGESTIONS
  // ===========================

  const getStartingEquipmentSuggestions = () => {
    const suggestions = [];
    
    if (characterData.selectedClass) {
      const className = characterData.selectedClass.name;
      
      // Suggestions based on class
      switch (className.toLowerCase()) {
        case 'fighter':
          suggestions.push('Espada Longa', 'Cota de Malha', 'Escudo');
          break;
        case 'wizard':
          suggestions.push('Adaga', 'Grimório', 'Componente Arcano');
          break;
        case 'rogue':
          suggestions.push('Espada Curta', 'Armadura de Couro', 'Kit de Ladrão');
          break;
        default:
          suggestions.push('Equipamento básico de aventureiro');
      }
    }
    
    return suggestions;
  };

  // ===========================
  // RENDER PRINCIPAL
  // ===========================

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Método de Equipamento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STARTING_EQUIPMENT_METHODS.map((method) => {
            const isSelected = selectedMethod === method.id;
            const MethodIcon = method.icon;
            
            return (
              <div
                key={method.id}
                onClick={() => handleMethodChange(method.id)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-400/50 shadow-lg'
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${method.color}`}>
                    <MethodIcon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      isSelected ? 'text-white' : 'text-gray-300'
                    }`}>
                      {method.name}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {method.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Starting Equipment Suggestions */}
      {selectedMethod === 'starting-equipment' && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <h4 className="font-medium text-white mb-4">Equipamento Inicial Sugerido</h4>
          
          <div className="space-y-3">
            {getStartingEquipmentSuggestions().map((suggestion, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{suggestion}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-300">
                  O equipamento inicial é determinado pela sua classe e background. 
                  Você receberá automaticamente os itens apropriados.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy Equipment Interface */}
      {selectedMethod === 'buy-equipment' && (
        <>
          {/* Gold Status */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-white">Ouro Disponível</h4>
                <p className="text-sm text-gray-400">
                  Compre equipamentos dentro do seu orçamento
                </p>
              </div>
              
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  remainingGold >= 0 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {remainingGold} gp
                </div>
                <div className="text-sm text-gray-500">
                  de {startingGold} gp
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  remainingGold >= 0 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600' 
                    : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ 
                  width: `${Math.min(100, (totalCost / startingGold) * 100)}%` 
                }}
              />
            </div>

            {remainingGold < 0 && (
              <div className="mt-3 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                <p className="text-sm text-red-300">
                  Você excedeu seu orçamento! Remova alguns itens ou reduza as quantidades.
                </p>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar equipamentos..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">Todas as categorias</option>
                {Object.entries(EQUIPMENT_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.name}</option>
                ))}
              </select>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyAffordable}
                  onChange={(e) => setShowOnlyAffordable(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/50"
                />
                <span className="text-sm text-gray-300">Apenas acessíveis</span>
              </label>
            </div>
          </div>

          {/* Equipment List */}
          <div className="space-y-3">
            {filteredEquipment.map((item) => (
              <EquipmentItem
                key={item.index}
                item={item}
                isSelected={selectedEquipment.includes(item.index)}
                onToggle={() => handleToggleEquipment(item.index)}
                quantity={equipmentQuantities[item.index] || 1}
                onQuantityChange={(quantity) => handleQuantityChange(item.index, quantity)}
                showQuantity={selectedMethod === 'buy-equipment'}
                disabled={!canAfford(item)}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredEquipment.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-8 h-8 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                Nenhum equipamento encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </>
      )}

      {/* Selected Equipment Summary */}
      {selectedEquipment.length > 0 && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <h4 className="font-medium text-white mb-4">Equipamentos Selecionados</h4>
          
          <div className="space-y-3">
            {selectedEquipment.map(itemIndex => {
              const item = mockEquipment.find(eq => eq.index === itemIndex);
              if (!item) return null;
              
              const quantity = equipmentQuantities[itemIndex] || 1;
              const cost = (item.cost?.quantity || 0) * quantity;
              
              return (
                <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${EQUIPMENT_CATEGORIES[item.equipment_category?.index as keyof typeof EQUIPMENT_CATEGORIES]?.color || 'from-gray-500 to-gray-600'}`}>
                      <Sword className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-gray-300">{item.name}</span>
                      {quantity > 1 && (
                        <span className="text-gray-500 ml-2">x{quantity}</span>
                      )}
                    </div>
                  </div>
                  
                  {selectedMethod === 'buy-equipment' && (
                    <span className="text-yellow-400 font-medium">
                      {cost} gp
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total */}
          {selectedMethod === 'buy-equipment' && (
            <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between">
              <span className="text-gray-400">Total:</span>
              <span className="text-yellow-400 font-semibold">{totalCost} gp</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}