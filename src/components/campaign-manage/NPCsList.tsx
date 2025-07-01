import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Eye, Heart, Skull, MapPin, Search } from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { campaignAPI } from '@/api/campaignAPI';
import { NPC, NPCType } from '@/types/manageCampaign';

// Importar o modal que criamos
import { NPCModal, NPCFormData } from './NPCModal';

export const NPCsList: React.FC = () => {
  const { campaign, createNPC, updateNPC, deleteNPC, killNPC, reviveNPC, isGM } = useManageCampaignContext();
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<NPCType | 'all'>('all');
  
  // Estados para o modal
  const [showModal, setShowModal] = useState(false);
  const [editingNPC, setEditingNPC] = useState<NPC | null>(null);

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

  // Função para converter NPC para NPCFormData
  const convertNPCToFormData = (npc: NPC): NPCFormData => {
    return {
      name: npc.name,
      description: npc.description,
      race: npc.race,
      npc_class: npc.npc_class,
      npc_type: npc.npc_type,
      alignment: npc.alignment,
      location: npc.location,
      occupation: npc.occupation,
      faction: npc.faction,
      stats: npc.stats,
      challenge_rating: npc.challenge_rating,
      abilities: npc.abilities || [],
      personality_traits: npc.personality_traits || [],
      goals: npc.goals,
      secrets: npc.secrets,
      gm_notes: npc.gm_notes,
      is_alive: npc.is_alive,
      is_active: npc.is_active
    };
  };

  // Função para converter NPCFormData para CreateNPCRequest
  const convertFormDataToCreateRequest = (formData: NPCFormData) => {
    return {
      name: formData.name,
      description: formData.description,
      race: formData.race,
      npc_class: formData.npc_class,
      npc_type: formData.npc_type,
      alignment: formData.alignment,
      location: formData.location,
      occupation: formData.occupation,
      faction: formData.faction,
      stats: formData.stats,
      challenge_rating: formData.challenge_rating,
      abilities: formData.abilities,
      personality_traits: formData.personality_traits,
      goals: formData.goals,
      secrets: formData.secrets,
      gm_notes: formData.gm_notes
    };
  };

  const handleCreateNPC = () => {
    setEditingNPC(null);
    setShowModal(true);
  };

  const handleEditNPC = (npc: NPC) => {
    setEditingNPC(npc);
    setShowModal(true);
  };

  const handleSaveNPC = async (formData: NPCFormData) => {
    try {
      if (editingNPC) {
        // Atualizar NPC existente
        const updateData = convertFormDataToCreateRequest(formData);
        const success = await updateNPC(editingNPC.id!, updateData);
        if (success) {
          await loadNPCs();
        }
      } else {
        // Criar novo NPC
        const createData = convertFormDataToCreateRequest(formData);
        const npcId = await createNPC(createData);
        if (npcId) {
          await loadNPCs();
        }
      }
    } catch (error) {
      console.error('Erro ao salvar NPC:', error);
      throw error; // Re-throw para que o modal possa mostrar erro
    }
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
      case NPCType.QUEST_GIVER:
        return 'bg-blue-500/10 text-blue-400';
      case NPCType.BACKGROUND:
        return 'bg-purple-500/10 text-purple-400';
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
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as NPCType | 'all')}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Tipos</option>
          <option value="aliado">Aliados</option>
          <option value="inimigo">Inimigos</option>
          <option value="neutro">Neutros</option>
          <option value="mercador">Mercadores</option>
          <option value="missões">Doadores de Missões</option>
          <option value="cenário">NPCs de Cenário</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Lista de NPCs */}
      <div className="space-y-4">
        {filteredNPCs.map((npc) => (
          <div
            key={npc.id}
            className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50 hover:border-gray-500/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {npc.name[0]}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="text-lg font-semibold text-white">{npc.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getNPCTypeColor(npc.npc_type)}`}>
                      {npc.npc_type.charAt(0).toUpperCase() + npc.npc_type.slice(1)}
                    </span>
                    
                    {!npc.is_alive && (
                      <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs font-medium">
                        Morto
                      </span>
                    )}
                    
                    {!npc.is_active && (
                      <span className="px-2 py-1 bg-gray-500/10 text-gray-400 rounded text-xs font-medium">
                        Inativo
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    {npc.race && (
                      <span>{npc.race}</span>
                    )}
                    {npc.npc_class && (
                      <span>{npc.npc_class}</span>
                    )}
                    {npc.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{npc.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {npc.description && (
                    <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                      {npc.description}
                    </p>
                  )}
                </div>
              </div>
              
              {isGM && (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditNPC(npc)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleToggleLife(npc)}
                    className={`p-2 hover:bg-gray-600/50 rounded transition-colors ${
                      npc.is_alive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
                    }`}
                    title={npc.is_alive ? 'Matar' : 'Reviver'}
                  >
                    {npc.is_alive ? <Skull className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteNPC(npc)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
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

      {/* Estado vazio */}
      {filteredNPCs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchTerm || filterType !== 'all' ? 'Nenhum NPC encontrado' : 'Nenhum NPC criado'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'Tente ajustar os filtros de busca' 
              : 'Crie seu primeiro NPC para começar a povoar o mundo da campanha'
            }
          </p>
          {isGM && !searchTerm && filterType === 'all' && (
            <button
              onClick={handleCreateNPC}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Criar Primeiro NPC</span>
            </button>
          )}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <NPCModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingNPC(null);
        }}
        onSave={handleSaveNPC}
        npc={editingNPC ? convertNPCToFormData(editingNPC) : null}
        campaignId={campaign?.id || ''}
      />
    </div>
  );
};