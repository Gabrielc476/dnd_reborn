import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Eye, Heart, Skull, MapPin, Search } from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { campaignAPI } from '@/api/campaignAPI';
import { NPC, NPCType } from '@/types/manageCampaign';

export const NPCsList: React.FC = () => {
  const { campaign, createNPC, updateNPC, deleteNPC, killNPC, reviveNPC, isGM } = useManageCampaignContext();
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<NPCType | 'all'>('all');

  useEffect(() => {
    loadNPCs();
  }, [campaign?.id]);

  const loadNPCs = async () => {
    if (!campaign?.id) return;
    
    setIsLoading(true);
    try {
      const response = await campaignAPI.getCampaignNPCs(campaign.id);
      if (response.success) {
        setNpcs(response.npcs || []);
      }
    } catch (error) {
      console.error('Erro ao carregar NPCs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNPC = async () => {
    const npcId = await createNPC({
      name: 'Novo NPC',
      description: 'Descrição do NPC',
      npc_type: NPCType.NEUTRAL,
      location: campaign?.world_name || 'Localização'
    });
    
    if (npcId) {
      await loadNPCs();
    }
  };

  const handleEditNPC = (npc: NPC) => {
    console.log('Editar NPC:', npc.id);
    // Abrir modal de edição
  };

  const handleDeleteNPC = async (npc: NPC) => {
    if (window.confirm(`Deseja realmente excluir ${npc.name}?`)) {
      const success = await deleteNPC(npc.id!);
      if (success) {
        await loadNPCs();
      }
    }
  };

  const handleToggleLife = async (npc: NPC) => {
    const success = npc.is_alive ? await killNPC(npc.id!) : await reviveNPC(npc.id!);
    if (success) {
      await loadNPCs();
    }
  };

  const filteredNPCs = npcs.filter(npc => {
    const matchesSearch = npc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || npc.npc_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getNPCTypeColor = (type: NPCType) => {
    switch (type) {
      case NPCType.ALLY:
        return 'bg-green-500/10 text-green-400';
      case NPCType.ENEMY:
        return 'bg-red-500/10 text-red-400';
      case NPCType.MERCHANT:
        return 'bg-yellow-500/10 text-yellow-400';
      case NPCType.BOSS:
        return 'bg-purple-500/10 text-purple-400';
      case NPCType.QUEST_GIVER:
        return 'bg-blue-500/10 text-blue-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">NPCs da Campanha</h3>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full">
            {npcs.length} NPCs
          </span>
        </div>
        
        {isGM && (
          <button
            onClick={handleCreateNPC}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo NPC</span>
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar NPCs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as NPCType | 'all')}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="all">Todos</option>
          <option value={NPCType.ALLY}>Aliados</option>
          <option value={NPCType.ENEMY}>Inimigos</option>
          <option value={NPCType.NEUTRAL}>Neutros</option>
          <option value={NPCType.MERCHANT}>Comerciantes</option>
          <option value={NPCType.QUEST_GIVER}>Quest Givers</option>
          <option value={NPCType.BOSS}>Bosses</option>
        </select>
      </div>

      {/* Lista de NPCs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNPCs.map((npc) => (
          <div key={npc.id} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-white">{npc.name}</h4>
                <p className="text-sm text-gray-400">{npc.race} • {npc.occupation}</p>
                {npc.location && (
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-orange-400">{npc.location}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {npc.is_alive ? (
                  <Heart className="w-4 h-4 text-green-400" />
                ) : (
                  <Skull className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-3 line-clamp-2">
              {npc.description}
            </p>

            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs ${getNPCTypeColor(npc.npc_type)}`}>
                {npc.npc_type}
              </span>

              {isGM && (
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleEditNPC(npc)}
                    className="p-1 text-blue-400 hover:text-blue-300"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleEditNPC(npc)}
                    className="p-1 text-yellow-400 hover:text-yellow-300"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleToggleLife(npc)}
                    className={`p-1 ${npc.is_alive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                    title={npc.is_alive ? 'Matar' : 'Reviver'}
                  >
                    {npc.is_alive ? <Skull className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteNPC(npc)}
                    className="p-1 text-red-400 hover:text-red-300"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredNPCs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum NPC encontrado</h3>
          <p className="text-gray-400">
            {searchTerm ? 'Tente buscar com outros termos' : 'Crie seu primeiro NPC para a campanha'}
          </p>
        </div>
      )}
    </div>
  );
};