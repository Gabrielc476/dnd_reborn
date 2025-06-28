// ===========================
// EQUIPMENT STEP - COMPONENTE COMPLETO CORRIGIDO
// src/components/character-creation/steps/EquipmentStep.tsx
// ===========================

"use client";

import { useState, useEffect } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { 
  Sword, 
  Shield, 
  Shirt,
  Package,
  Search,
  CheckCircle,
  Circle,
  Info,
  Star,
  Coins,
  Backpack,
  Zap,
  Target,
  Crown
} from "lucide-react";

interface EquipmentCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  items: EquipmentItem[];
}

interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  damage?: string;
  armorClass?: number;
  properties?: string[];
  description: string;
  weight?: number;
  cost?: string;
}

// Mock data - em produção virá da API
const mockEquipment: EquipmentCategory[] = [
  {
    id: 'weapons',
    name: 'Armas',
    icon: Sword,
    color: 'from-red-500 to-red-600',
    items: [
      {
        id: 'longsword',
        name: 'Espada Longa',
        type: 'Arma Corpo a Corpo',
        rarity: 'common',
        damage: '1d8 cortante',
        properties: ['Versátil (1d10)'],
        description: 'Uma espada clássica de lâmina longa e reta.',
        weight: 3,
        cost: '15 po'
      },
      {
        id: 'shortbow',
        name: 'Arco Curto',
        type: 'Arma à Distância',
        rarity: 'common',
        damage: '1d6 perfurante',
        properties: ['Munição', 'Alcance (80/320)'],
        description: 'Um arco compacto ideal para combate rápido.',
        weight: 2,
        cost: '25 po'
      },
      {
        id: 'dagger',
        name: 'Punhal',
        type: 'Arma Corpo a Corpo',
        rarity: 'common',
        damage: '1d4 perfurante',
        properties: ['Finesse', 'Leve', 'Arremesso (20/60)'],
        description: 'Uma lâmina curta e afiada.',
        weight: 1,
        cost: '2 po'
      },
      {
        id: 'greataxe',
        name: 'Machado Gigante',
        type: 'Arma Corpo a Corpo',
        rarity: 'common',
        damage: '1d12 cortante',
        properties: ['Pesada', 'Duas Mãos'],
        description: 'Um machado massivo que requer duas mãos.',
        weight: 7,
        cost: '30 po'
      },
      {
        id: 'crossbow-light',
        name: 'Besta Leve',
        type: 'Arma à Distância',
        rarity: 'common',
        damage: '1d8 perfurante',
        properties: ['Munição', 'Alcance (80/320)', 'Carregamento', 'Leve'],
        description: 'Uma besta compacta e fácil de usar.',
        weight: 5,
        cost: '25 po'
      }
    ]
  },
  {
    id: 'armor',
    name: 'Armaduras',
    icon: Shield,
    color: 'from-blue-500 to-blue-600',
    items: [
      {
        id: 'leather-armor',
        name: 'Armadura de Couro',
        type: 'Armadura Leve',
        rarity: 'common',
        armorClass: 11,
        description: 'Proteção básica feita de couro endurecido.',
        weight: 10,
        cost: '10 po'
      },
      {
        id: 'studded-leather',
        name: 'Couro Batido',
        type: 'Armadura Leve',
        rarity: 'common',
        armorClass: 12,
        description: 'Couro reforçado com tachas metálicas.',
        weight: 13,
        cost: '45 po'
      },
      {
        id: 'chain-mail',
        name: 'Cota de Malha',
        type: 'Armadura Média',
        rarity: 'common',
        armorClass: 13,
        description: 'Anéis de metal entrelaçados oferecendo boa proteção.',
        weight: 20,
        cost: '50 po'
      },
      {
        id: 'scale-mail',
        name: 'Cota de Escamas',
        type: 'Armadura Média',
        rarity: 'common',
        armorClass: 14,
        description: 'Armadura feita de escamas metálicas sobrepostas.',
        weight: 45,
        cost: '50 po'
      },
      {
        id: 'plate-armor',
        name: 'Armadura de Placas',
        type: 'Armadura Pesada',
        rarity: 'uncommon',
        armorClass: 18,
        description: 'A melhor proteção disponível, feita de placas de aço.',
        weight: 65,
        cost: '1500 po'
      }
    ]
  },
  {
    id: 'gear',
    name: 'Equipamentos',
    icon: Backpack,
    color: 'from-green-500 to-green-600',
    items: [
      {
        id: 'adventuring-pack',
        name: 'Kit do Aventureiro',
        type: 'Kit de Equipamentos',
        rarity: 'common',
        description: 'Mochila, saco de dormir, kit de refeição, corda (50 pés), 10 tochas.',
        weight: 30,
        cost: '15 po'
      },
      {
        id: 'thieves-tools',
        name: 'Ferramentas de Ladrão',
        type: 'Ferramenta',
        rarity: 'common',
        description: 'Um conjunto de pequenas ferramentas para abrir fechaduras.',
        weight: 1,
        cost: '25 po'
      },
      {
        id: 'rope',
        name: 'Corda de Cânhamo',
        type: 'Equipamento de Aventura',
        rarity: 'common',
        description: 'Corda resistente de 50 pés.',
        weight: 10,
        cost: '2 po'
      },
      {
        id: 'healing-potion',
        name: 'Poção de Cura',
        type: 'Poção',
        rarity: 'common',
        description: 'Restaura 2d4+2 pontos de vida quando consumida.',
        weight: 0.5,
        cost: '50 po'
      },
      {
        id: 'torch',
        name: 'Tocha',
        type: 'Equipamento de Aventura',
        rarity: 'common',
        description: 'Fornece luz em um raio de 20 pés por 1 hora.',
        weight: 1,
        cost: '1 cp'
      },
      {
        id: 'bedroll',
        name: 'Saco de Dormir',
        type: 'Equipamento de Aventura',
        rarity: 'common',
        description: 'Um saco confortável para dormir ao ar livre.',
        weight: 7,
        cost: '5 sp'
      }
    ]
  },
  {
    id: 'tools',
    name: 'Ferramentas',
    icon: Target,
    color: 'from-purple-500 to-purple-600',
    items: [
      {
        id: 'smiths-tools',
        name: 'Ferramentas de Ferreiro',
        type: 'Ferramentas de Artesão',
        rarity: 'common',
        description: 'Martelos, tenazes e outras ferramentas para trabalhar metal.',
        weight: 8,
        cost: '20 po'
      },
      {
        id: 'herbalism-kit',
        name: 'Kit de Herbalismo',
        type: 'Kit',
        rarity: 'common',
        description: 'Ferramentas para identificar e usar plantas medicinais.',
        weight: 3,
        cost: '5 po'
      },
      {
        id: 'disguise-kit',
        name: 'Kit de Disfarce',
        type: 'Kit',
        rarity: 'common',
        description: 'Cosméticos, tintas e pequenos acessórios para disfarces.',
        weight: 3,
        cost: '25 po'
      }
    ]
  }
];

function EquipmentCard({ 
  item, 
  isSelected, 
  onToggle 
}: { 
  item: EquipmentItem; 
  isSelected: boolean; 
  onToggle: () => void; 
}) {
  const rarityColors = {
    common: 'border-gray-500/50 text-gray-300',
    uncommon: 'border-green-500/50 text-green-400',
    rare: 'border-blue-500/50 text-blue-400',
    epic: 'border-purple-500/50 text-purple-400',
    legendary: 'border-orange-500/50 text-orange-400'
  };

  const rarityBgs = {
    common: 'bg-gray-500/10',
    uncommon: 'bg-green-500/10',
    rare: 'bg-blue-500/10',
    epic: 'bg-purple-500/10',
    legendary: 'bg-orange-500/10'
  };

  return (
    <div
      onClick={onToggle}
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
        isSelected
          ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
          : 'bg-gray-800/50 border-gray-600/50 hover:border-gray-500/50'
      }`}
    >
      {/* Header with name and selection indicator */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm">{item.name}</h4>
          <p className="text-gray-400 text-xs">{item.type}</p>
        </div>
        {isSelected ? (
          <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </div>

      {/* Rarity badge */}
      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mb-2 ${rarityBgs[item.rarity]} ${rarityColors[item.rarity]}`}>
        <Crown className="w-3 h-3 mr-1" />
        {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
      </div>

      {/* Stats */}
      <div className="space-y-1 mb-3">
        {item.damage && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Dano:</span>
            <span className="text-red-400 text-xs font-mono">{item.damage}</span>
          </div>
        )}
        {item.armorClass && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">CA:</span>
            <span className="text-blue-400 text-xs font-mono">{item.armorClass}</span>
          </div>
        )}
        {item.weight && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Peso:</span>
            <span className="text-yellow-400 text-xs font-mono">{item.weight} lb</span>
          </div>
        )}
        {item.cost && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Custo:</span>
            <span className="text-green-400 text-xs font-mono">{item.cost}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-300 text-xs mb-3 leading-relaxed">{item.description}</p>

      {/* Properties */}
      {item.properties && item.properties.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-600/50">
          <div className="flex flex-wrap gap-1">
            {item.properties.map((prop, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30"
              >
                {prop}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EquipmentStep() {
  const { characterData, updateCharacterData } = useCharacterCreationContext();
  
  const [selectedCategory, setSelectedCategory] = useState('weapons');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // ===========================
  // 🔥 CORREÇÃO 1: Sincronizar estado local com global
  // ===========================
  
  // Inicializar estado local com dados salvos
  useEffect(() => {
    if (characterData.selectedEquipment && characterData.selectedEquipment.length > 0) {
      setSelectedEquipment(characterData.selectedEquipment);
    }
  }, []);

  // Salvar equipamentos no estado global sempre que mudar
  useEffect(() => {
    updateCharacterData({ 
      selectedEquipment: selectedEquipment 
    });
  }, [selectedEquipment, updateCharacterData]);

  // ===========================
  // HANDLERS
  // ===========================

  const handleEquipmentToggle = (itemId: string) => {
    setSelectedEquipment(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const clearAllEquipment = () => {
    setSelectedEquipment([]);
  };

  // ===========================
  // COMPUTED VALUES
  // ===========================

  const currentCategory = mockEquipment.find(cat => cat.id === selectedCategory);
  const filteredItems = currentCategory?.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const selectedItems = mockEquipment
    .flatMap(cat => cat.items)
    .filter(item => selectedEquipment.includes(item.id));

  const totalWeight = selectedItems.reduce((sum, item) => sum + (item.weight || 0), 0);
  const carryingCapacity = (characterData.abilityScores.strength || 10) * 15; // 15 lbs per STR point

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Equipamentos Iniciais</h3>
              <p className="text-red-200 text-sm mt-1">
                Escolha suas armas, armaduras e equipamentos
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{selectedEquipment.length}</div>
            <div className="text-red-400 text-sm">Itens</div>
          </div>
        </div>
        
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-red-200 text-sm">Peso Total:</span>
            <span className={`font-medium ${
              totalWeight > carryingCapacity ? 'text-red-400' : 'text-green-400'
            }`}>
              {totalWeight} / {carryingCapacity} lb
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-red-200 text-sm">Capacidade:</span>
            <span className="text-blue-400 font-medium">
              {Math.round((totalWeight / carryingCapacity) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2">
        {mockEquipment.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all font-medium ${
                isActive
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 border border-gray-600/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar equipamentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* Equipment Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>
              {currentCategory?.name} ({filteredItems.length} disponível
              {filteredItems.length !== 1 ? 'is' : ''}
              {selectedEquipment.length > 0 && (
                <>, {selectedEquipment.length} selecionado{selectedEquipment.length !== 1 ? 's' : ''}</>
              )}
              )
            </span>
          </h4>
          
          {selectedEquipment.length > 0 && (
            <button
              onClick={clearAllEquipment}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-medium rounded-xl transition-all duration-200"
            >
              Limpar Seleção
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <EquipmentCard
              key={item.id}
              item={item}
              isSelected={selectedEquipment.includes(item.id)}
              onToggle={() => handleEquipmentToggle(item.id)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-gray-400 font-medium mb-2">Nenhum item encontrado</h3>
            <p className="text-gray-500">
              Tente ajustar sua busca ou selecionar outra categoria
            </p>
          </div>
        )}
      </div>

      {/* Selected Equipment Summary */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-white font-semibold">Equipamentos Selecionados</h4>
          </div>
          
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-blue-400 text-xs uppercase tracking-wide">Total de Itens</div>
                <div className="text-white font-bold text-lg">{selectedItems.length}</div>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="text-yellow-400 text-xs uppercase tracking-wide">Peso Total</div>
                <div className="text-white font-bold text-lg">{totalWeight} lb</div>
              </div>
              <div className={`text-center p-3 rounded-lg border ${
                totalWeight > carryingCapacity 
                  ? 'bg-red-500/10 border-red-500/20' 
                  : 'bg-green-500/10 border-green-500/20'
              }`}>
                <div className={`text-xs uppercase tracking-wide ${
                  totalWeight > carryingCapacity ? 'text-red-400' : 'text-green-400'
                }`}>
                  Status de Carga
                </div>
                <div className={`font-bold text-lg ${
                  totalWeight > carryingCapacity ? 'text-red-400' : 'text-green-400'
                }`}>
                  {totalWeight > carryingCapacity ? 'Sobrecarga' : 'Normal'}
                </div>
              </div>
            </div>

            {/* Selected Items List */}
            <div className="grid md:grid-cols-2 gap-3">
              {selectedItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
                >
                  <div className="flex-1">
                    <h5 className="text-white font-medium text-sm">{item.name}</h5>
                    <p className="text-gray-400 text-xs">{item.type}</p>
                  </div>
                  <div className="text-right">
                    {item.weight && (
                      <div className="text-yellow-400 text-xs font-mono">{item.weight} lb</div>
                    )}
                    {item.cost && (
                      <div className="text-green-400 text-xs font-mono">{item.cost}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Weight Warning */}
            {totalWeight > carryingCapacity && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-red-400" />
                  <h5 className="text-red-400 font-semibold">Sobrecarga Detectada</h5>
                </div>
                <p className="text-red-300 text-sm mt-1">
                  Seu personagem está carregando mais peso do que sua força permite. 
                  Isso pode resultar em penalidades de movimento e outras desvantagens.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-blue-400 font-semibold text-sm">Dicas de Equipamentos</h5>
            <ul className="text-gray-300 text-sm mt-1 space-y-1">
              <li>• Selecione pelo menos uma arma para combate</li>
              <li>• Considere uma armadura adequada ao seu personagem</li>
              <li>• Não esqueça de equipamentos básicos como corda e tochas</li>
              <li>• Fique atento ao limite de peso baseado na sua Força</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}