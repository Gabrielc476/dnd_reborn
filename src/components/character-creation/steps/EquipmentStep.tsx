// ===========================
// EQUIPMENT STEP - COMPONENTE COMPLETO CORRIGIDO
// src/components/character-creation/steps/EquipmentStep.tsx
// ===========================

"use client";

import React, { useState } from "react";
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
  Crown,
  Hammer,
  Scroll,
  Gem
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

// ===========================
// MOCK EQUIPMENT DATA COMPLETO
// ===========================

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
      },
      {
        id: 'rapier',
        name: 'Rapieira',
        type: 'Arma Corpo a Corpo',
        rarity: 'common',
        damage: '1d8 perfurante',
        properties: ['Finesse'],
        description: 'Uma espada elegante e precisa.',
        weight: 2,
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
        description: 'Armadura feita de couro sobreposto.',
        weight: 10,
        cost: '10 po'
      },
      {
        id: 'studded-leather',
        name: 'Couro Batido',
        type: 'Armadura Leve',
        rarity: 'common',
        armorClass: 12,
        description: 'Armadura de couro reforçada com tachas.',
        weight: 13,
        cost: '45 po'
      },
      {
        id: 'chain-mail',
        name: 'Cota de Malha',
        type: 'Armadura Média',
        rarity: 'common',
        armorClass: 16,
        description: 'Armadura de anéis metálicos entrelaçados.',
        weight: 55,
        cost: '75 po'
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
      },
      {
        id: 'scale-mail',
        name: 'Armadura de Escamas',
        type: 'Armadura Média',
        rarity: 'common',
        armorClass: 14,
        description: 'Armadura feita de escamas metálicas sobrepostas.',
        weight: 45,
        cost: '50 po'
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
        id: 'rope',
        name: 'Corda de Cânhamo',
        type: 'Equipamento de Aventura',
        rarity: 'common',
        description: 'Equipamento de Aventura',
        weight: 10,
        cost: '2 po'
      },
      {
        id: 'thieves-tools',
        name: 'Ferramentas de Ladrão',
        type: 'Ferramentas',
        rarity: 'common',
        description: 'Conjunto de ferramentas para arrombamento.',
        weight: 1,
        cost: '25 po'
      },
      {
        id: 'healers-kit',
        name: 'Kit de Curandeiro',
        type: 'Kit',
        rarity: 'common',
        description: 'Kit médico para primeiros socorros.',
        weight: 3,
        cost: '5 po'
      },
      {
        id: 'backpack',
        name: 'Mochila',
        type: 'Container',
        rarity: 'common',
        description: 'Mochila de couro para carregar equipamentos.',
        weight: 5,
        cost: '2 po'
      },
      {
        id: 'bedroll',
        name: 'Saco de Dormir',
        type: 'Equipamento de Acampamento',
        rarity: 'common',
        description: 'Saco de dormir portátil.',
        weight: 7,
        cost: '1 po'
      },
      {
        id: 'tinderbox',
        name: 'Caixa de Fogo',
        type: 'Equipamento de Aventura',
        rarity: 'common',
        description: 'Kit para acender fogueiras.',
        weight: 1,
        cost: '5 mo'
      }
    ]
  },
  {
    id: 'tools',
    name: 'Ferramentas',
    icon: Hammer,
    color: 'from-yellow-500 to-orange-500',
    items: [
      {
        id: 'smiths-tools',
        name: 'Ferramentas de Ferreiro',
        type: 'Ferramentas de Artesão',
        rarity: 'common',
        description: 'Ferramentas para trabalhar com metal.',
        weight: 8,
        cost: '20 po'
      },
      {
        id: 'alchemists-supplies',
        name: 'Suprimentos de Alquimista',
        type: 'Ferramentas de Artesão',
        rarity: 'common',
        description: 'Equipamentos para criar poções e elixires.',
        weight: 8,
        cost: '50 po'
      },
      {
        id: 'carpenters-tools',
        name: 'Ferramentas de Carpinteiro',
        type: 'Ferramentas de Artesão',
        rarity: 'common',
        description: 'Ferramentas para trabalhar com madeira.',
        weight: 6,
        cost: '8 po'
      }
    ]
  }
];

// ===========================
// EQUIPMENT CARD COMPONENT
// ===========================

function EquipmentCard({ 
  item, 
  isSelected, 
  onToggle 
}: { 
  item: EquipmentItem; 
  isSelected: boolean; 
  onToggle: () => void; 
}) {
  // 🚨 DEBUG LOG para EquipmentCard
  if (item.id === 'longsword') { // Log apenas para longsword
    console.log(`📋 EQUIPMENT CARD (${item.name}) - isSelected: ${isSelected}`);
  }

  const rarityColors = {
    common: 'from-gray-500 to-gray-600',
    uncommon: 'from-green-500 to-green-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-yellow-500 to-orange-500'
  };

  const rarityBorders = {
    common: 'border-gray-500/50',
    uncommon: 'border-green-500/50',
    rare: 'border-blue-500/50',
    epic: 'border-purple-500/50',
    legendary: 'border-yellow-500/50'
  };

  return (
    <div 
      onClick={() => {
        console.log(`📋 CARD ONCLICK: ${item.name}, calling onToggle`);
        onToggle();
      }}
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
        isSelected
          ? `bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/25`
          : `bg-gray-800/50 ${rarityBorders[item.rarity]} hover:border-gray-500/50`
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm mb-1">{item.name}</h4>
          <p className="text-gray-400 text-xs">{item.type}</p>
        </div>
        <div className="ml-3 flex-shrink-0">
          {isSelected ? (
            <CheckCircle className="w-5 h-5 text-blue-400" />
          ) : (
            <Circle className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>

      {/* Rarity Badge */}
      <div className={`inline-flex items-center px-2 py-1 rounded-lg bg-gradient-to-r ${rarityColors[item.rarity]} text-white text-xs font-medium mb-2`}>
        {item.rarity === 'common' && 'Comum'}
        {item.rarity === 'uncommon' && 'Incomum'}
        {item.rarity === 'rare' && 'Raro'}
        {item.rarity === 'epic' && 'Épico'}
        {item.rarity === 'legendary' && 'Lendário'}
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-3">
        {item.damage && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Dano:</span>
            <span className="text-red-400 font-medium">{item.damage}</span>
          </div>
        )}
        {item.armorClass && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">CA:</span>
            <span className="text-blue-400 font-medium">{item.armorClass}</span>
          </div>
        )}
        {item.weight && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Peso:</span>
            <span className="text-yellow-400 font-medium">{item.weight} lb</span>
          </div>
        )}
        {item.cost && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Custo:</span>
            <span className="text-green-400 font-medium">{item.cost}</span>
          </div>
        )}
      </div>

      {/* Properties */}
      {item.properties && item.properties.length > 0 && (
        <div className="mb-3">
          <p className="text-gray-400 text-xs mb-1">Propriedades:</p>
          <div className="flex flex-wrap gap-1">
            {item.properties.map((prop, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded"
              >
                {prop}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <p className="text-gray-400 text-xs leading-relaxed">
        {item.description}
      </p>
    </div>
  );
}

// ===========================
// MAIN COMPONENT - 🔥 CORRIGIDO
// ===========================

export default function EquipmentStep() {
  const { characterData, updateCharacterData } = useCharacterCreationContext();
  
  const [selectedCategory, setSelectedCategory] = useState('weapons');
  const [searchTerm, setSearchTerm] = useState('');

  // 🔥 CORREÇÃO: Usar diretamente o estado global
  const selectedEquipment = characterData.selectedEquipment || [];

  // ===========================
  // 🚨 DEBUG LOGS - DIAGNÓSTICO
  // ===========================
  
  console.log("🔍 ===== EQUIPMENT STEP DEBUG =====");
  console.log("📦 characterData.selectedEquipment:", characterData.selectedEquipment);
  console.log("📦 selectedEquipment (local):", selectedEquipment);
  console.log("📦 selectedEquipment.length:", selectedEquipment.length);
  console.log("📦 Type of selectedEquipment:", typeof selectedEquipment);
  console.log("📦 Is Array:", Array.isArray(selectedEquipment));
  console.log("📦 Full characterData keys:", Object.keys(characterData));
  console.log("📦 updateCharacterData type:", typeof updateCharacterData);
  console.log("=====================================");

  // ===========================
  // HANDLERS CORRIGIDOS
  // ===========================

  const handleEquipmentToggle = (itemId: string) => {
    console.log("🎯 ===== HANDLE EQUIPMENT TOGGLE =====");
    console.log("🎯 Item ID:", itemId);
    console.log("🎯 Current selectedEquipment:", selectedEquipment);
    console.log("🎯 Is item currently selected:", selectedEquipment.includes(itemId));
    
    const newSelectedEquipment = selectedEquipment.includes(itemId)
      ? selectedEquipment.filter(id => id !== itemId)
      : [...selectedEquipment, itemId];
    
    console.log("🎯 New selectedEquipment:", newSelectedEquipment);
    console.log("🎯 Calling updateCharacterData with:", { selectedEquipment: newSelectedEquipment });
    
    // Atualizar diretamente o estado global
    updateCharacterData({ 
      selectedEquipment: newSelectedEquipment 
    });
    
    console.log("🎯 updateCharacterData called");
    console.log("=====================================");
  };

  const clearAllEquipment = () => {
    console.log("🧹 ===== CLEAR ALL EQUIPMENT =====");
    console.log("🧹 Before clear:", selectedEquipment);
    
    updateCharacterData({ 
      selectedEquipment: [] 
    });
    
    console.log("🧹 Clear all called");
    console.log("=====================================");
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

  const loadStatus = totalWeight > carryingCapacity ? 'Sobrecarregado' : 
                    totalWeight > carryingCapacity * 0.75 ? 'Pesado' : 'Normal';

  // ===========================
  // 🚨 DEBUG LOGS - COMPUTED VALUES
  // ===========================
  
  console.log("🧮 ===== COMPUTED VALUES DEBUG =====");
  console.log("🧮 selectedItems:", selectedItems);
  console.log("🧮 selectedItems.length:", selectedItems.length);
  console.log("🧮 totalWeight:", totalWeight);
  console.log("🧮 carryingCapacity:", carryingCapacity);
  console.log("🧮 loadStatus:", loadStatus);
  console.log("=====================================");

  // ===========================
  // 🚨 DEBUG LOGS - EFFECT PARA MONITORAR MUDANÇAS
  // ===========================
  
  React.useEffect(() => {
    console.log("⚡ ===== EQUIPMENT CHANGED EFFECT =====");
    console.log("⚡ selectedEquipment changed to:", selectedEquipment);
    console.log("⚡ characterData.selectedEquipment:", characterData.selectedEquipment);
    console.log("⚡ Are they equal?", JSON.stringify(selectedEquipment) === JSON.stringify(characterData.selectedEquipment));
    console.log("=========================================");
  }, [selectedEquipment, characterData.selectedEquipment]);

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
        
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="text-red-400 text-xs uppercase tracking-wide">Total de Itens</div>
            <div className="text-white font-bold text-lg">{selectedEquipment.length}</div>
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
            <div className="text-white font-bold text-lg">{loadStatus}</div>
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
          {filteredItems.map((item) => {
            const isSelected = selectedEquipment.includes(item.id);
            
            // 🚨 DEBUG LOG para cada item
            if (item.id === 'longsword') { // Log apenas para longsword para não poluir
              console.log(`🗡️ LONGSWORD DEBUG - isSelected: ${isSelected}, selectedEquipment:`, selectedEquipment);
            }
            
            return (
              <EquipmentCard
                key={item.id}
                item={item}
                isSelected={isSelected}
                onToggle={() => {
                  console.log(`🎯 CARD CLICKED: ${item.name} (${item.id})`);
                  handleEquipmentToggle(item.id);
                }}
              />
            );
          })}
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
          
          <div className="grid md:grid-cols-2 gap-4">
            {selectedItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
              >
                <div>
                  <div className="text-white font-medium text-sm">{item.name}</div>
                  <div className="text-blue-400 text-xs">{item.type}</div>
                </div>
                <div className="text-right">
                  {item.weight && (
                    <div className="text-yellow-400 text-xs">{item.weight} lb</div>
                  )}
                  {item.cost && (
                    <div className="text-green-400 text-xs">{item.cost}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dicas de Equipamentos */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Info className="w-5 h-5 text-blue-400" />
          <h4 className="text-white font-semibold">Dicas de Equipamentos</h4>
        </div>
        
        <div className="space-y-2 text-blue-200 text-sm">
          <p>• Selecione pelo menos uma arma para combate</p>
          <p>• Considere uma armadura adequada ao seu personagem</p>
          <p>• Não esqueça de equipamentos básicos como corda e tochas</p>
          <p>• Fique atento ao limite de peso baseado na sua Força</p>
        </div>
      </div>

      {/* 🚨 DEBUG INFO VISUAL */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
        <h4 className="text-purple-400 font-semibold mb-2">🚨 DEBUG INFO</h4>
        <div className="space-y-1 text-xs font-mono">
          <div className="text-white">Selected Equipment: <span className="text-yellow-400">{JSON.stringify(selectedEquipment)}</span></div>
          <div className="text-white">Array Length: <span className="text-green-400">{selectedEquipment.length}</span></div>
          <div className="text-white">Is Valid: <span className="text-blue-400">{selectedEquipment.length > 0 ? 'TRUE' : 'FALSE'}</span></div>
          <div className="text-white">Character Data Equipment: <span className="text-cyan-400">{JSON.stringify(characterData.selectedEquipment)}</span></div>
        </div>
      </div>
    </div>
  );
}