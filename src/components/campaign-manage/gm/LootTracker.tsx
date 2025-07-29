import React, { useState, useEffect } from 'react';
import { Gift, Plus, Package, Coins, Star, Users, Eye, Edit, Trash2, UserCheck } from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { LootManagement, LootDistribution } from '@/types/manageCampaign';
import { ItemType, Rarity } from '@/types/createCampaign';

// Interface temporal para criação de loot (deve ser adicionada aos tipos)
interface CreateLootRequest {
  name: string;
  description?: string;
  item_type: ItemType;
  value?: number;
  quantity?: number;
  is_magic?: boolean;
  rarity?: Rarity;
  found_in_encounter?: string;
}

export const LootTracker: React.FC = () => {
  const { campaign, addLoot, assignLoot, isGM } = useManageCampaignContext();
  const [lootItems, setLootItems] = useState<LootManagement[]>([]);
  const [filterRarity, setFilterRarity] = useState<Rarity | 'all'>('all');
  const [filterAssigned, setFilterAssigned] = useState<'all' | 'assigned' | 'unassigned'>('all');

  useEffect(() => {
    if (campaign?.loot) {
      setLootItems(campaign.loot);
    }
  }, [campaign?.loot]);

  const handleAddLoot = async () => {
    const lootData: CreateLootRequest = {
      name: 'Novo Item',
      description: 'Descrição do item',
      item_type: ItemType.MISC,
      value: 10,
      quantity: 1
      // is_magic será false por padrão
      // rarity será COMMON por padrão na implementação
    };

    const success = await addLoot(lootData as any); // Cast temporário até atualizar os tipos
    
    if (success) {
      // Os dados serão atualizados automaticamente via contexto
    }
  };

  const handleAssignLoot = async (item: LootManagement) => {
    console.log('Abrir modal de distribuição para:', item.name);
    // Aqui abriria um modal para selecionar o jogador
    // Por enquanto, vamos simular uma atribuição
  };

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.COMMON:
        return 'bg-gray-500/10 text-gray-400';
      case Rarity.UNCOMMON:
        return 'bg-green-500/10 text-green-400';
      case Rarity.RARE:
        return 'bg-blue-500/10 text-blue-400';
      case Rarity.VERY_RARE:
        return 'bg-purple-500/10 text-purple-400';
      case Rarity.LEGENDARY:
        return 'bg-yellow-500/10 text-yellow-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getItemTypeIcon = (type: ItemType) => {
    switch (type) {
      case ItemType.WEAPON:
        return '⚔️';
      case ItemType.ARMOR:
        return '🛡️';
      case ItemType.CONSUMABLE:
        return '🧪';
      case ItemType.JEWELRY:
        return '💍';
      case ItemType.TOOL:
        return '🔧';
      case ItemType.MISC:
      default:
        return '📦';
    }
  };

  const filteredItems = lootItems.filter(item => {
    const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;
    const matchesAssigned = 
      filterAssigned === 'all' ||
      (filterAssigned === 'assigned' && item.assigned_to_player) ||
      (filterAssigned === 'unassigned' && !item.assigned_to_player);
    
    return matchesRarity && matchesAssigned;
  });

  // Calcular estatísticas
  const totalValue = lootItems.reduce((sum, item) => sum + (item.value * item.quantity), 0);
  const assignedItems = lootItems.filter(item => item.assigned_to_player).length;
  const unassignedItems = lootItems.filter(item => !item.assigned_to_player).length;
  const magicItems = lootItems.filter(item => item.is_magic).length;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Gift className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Tesouro do Grupo</h3>
          <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-sm rounded-full">
            {lootItems.length} itens
          </span>
        </div>
        
        {isGM && (
          <button
            onClick={handleAddLoot}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Item</span>
          </button>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <Package className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-yellow-400">{lootItems.length}</div>
          <div className="text-xs text-gray-400">Itens Total</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <UserCheck className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-green-400">{assignedItems}</div>
          <div className="text-xs text-gray-400">Distribuídos</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-blue-400">{unassignedItems}</div>
          <div className="text-xs text-gray-400">Não Atribuídos</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-amber-400">{totalValue.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Valor Total (PO)</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Filtro por Raridade */}
        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value as Rarity | 'all')}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
        >
          <option value="all">Todas as Raridades</option>
          <option value={Rarity.COMMON}>Comum</option>
          <option value={Rarity.UNCOMMON}>Incomum</option>
          <option value={Rarity.RARE}>Raro</option>
          <option value={Rarity.VERY_RARE}>Muito Raro</option>
          <option value={Rarity.LEGENDARY}>Lendário</option>
        </select>

        {/* Filtro por Status de Atribuição */}
        <select
          value={filterAssigned}
          onChange={(e) => setFilterAssigned(e.target.value as 'all' | 'assigned' | 'unassigned')}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
        >
          <option value="all">Todos os Itens</option>
          <option value="unassigned">Não Atribuídos</option>
          <option value="assigned">Atribuídos</option>
        </select>

        {magicItems > 0 && (
          <div className="px-3 py-2 bg-purple-500/10 text-purple-400 rounded-lg text-sm">
            ✨ {magicItems} itens mágicos
          </div>
        )}
      </div>

      {/* Lista de Itens */}
      <div className="space-y-3">
        {filteredItems.map((item, index) => (
          <div key={item.id || index} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">{getItemTypeIcon(item.item_type)}</span>
                  <h4 className="font-semibold text-white">{item.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${getRarityColor(item.rarity)}`}>
                    {item.rarity}
                  </span>
                  {item.is_magic && (
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full">
                      ✨ Mágico
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      Quantidade: {item.quantity}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">
                      {item.value} PO cada
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-amber-400">
                      Total: {(item.value * item.quantity).toLocaleString()} PO
                    </span>
                  </div>

                  {item.assigned_to_player && (
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">
                        Atribuído
                      </span>
                    </div>
                  )}

                  {item.found_in_encounter && (
                    <span className="text-xs text-blue-400">
                      📍 {item.found_in_encounter}
                    </span>
                  )}
                </div>
              </div>

              {isGM && (
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-blue-400 hover:text-blue-300 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  {!item.assigned_to_player && (
                    <button
                      onClick={() => handleAssignLoot(item)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                    >
                      Distribuir
                    </button>
                  )}
                  <button className="p-2 text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {lootItems.length === 0 ? 'Nenhum tesouro encontrado' : 'Nenhum item encontrado com os filtros aplicados'}
          </h3>
          <p className="text-gray-400">
            {lootItems.length === 0 
              ? 'Os itens e tesouros encontrados durante as aventuras aparecerão aqui'
              : 'Ajuste os filtros para ver outros itens'
            }
          </p>
        </div>
      )}
    </div>
  );
};