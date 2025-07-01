// ===========================
// src/components/campaign-manage/NPCsList.tsx
// CORREÇÃO: Ajustar para formato real da API
// ===========================

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  Skull, 
  MapPin, 
  Search,
  RefreshCw,
  User,
  Target
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { campaignAPI } from '@/api/campaignAPI';
import { NPC, NPCType } from '@/types/manageCampaign';

// Importar o modal que criamos
import { NPCModal, NPCFormData } from './NPCModal';

// Função auxiliar para obter cor do tipo de NPC
const getNPCTypeColor = (type: NPCType) => {
  const colors = {
    [NPCType.ALLY]: 'text-green-400 bg-green-400/10 border-green-400/20',
    [NPCType.ENEMY]: 'text-red-400 bg-red-400/10 border-red-400/20',
    [NPCType.NEUTRAL]: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    [NPCType.MERCHANT]: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    [NPCType.QUEST_GIVER]: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    [NPCType.BACKGROUND]: 'text-purple-400 bg-purple-400/10 border-purple-400/20'
  };
  return colors[type] || colors[NPCType.NEUTRAL];
};

// Função auxiliar para obter label do tipo de NPC
const getNPCTypeLabel = (type: NPCType) => {
  const labels = {
    [NPCType.ALLY]: 'Aliado',
    [NPCType.ENEMY]: 'Inimigo',
    [NPCType.NEUTRAL]: 'Neutro',
    [NPCType.MERCHANT]: 'Mercador',
    [NPCType.QUEST_GIVER]: 'Quest Giver',
    [NPCType.BACKGROUND]: 'Background'
  };
  return labels[type] || 'Neutro';
};

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

  // Listener para abrir modal de criação via evento do sidebar
  useEffect(() => {
    const handleCreateNPCEvent = () => {
      if (isGM) {
        handleCreateNPC();
      }
    };

    document.addEventListener('create-npc-modal', handleCreateNPCEvent);
    
    return () => {
      document.removeEventListener('create-npc-modal', handleCreateNPCEvent);
    };
  }, [isGM]);

  const loadNPCs = async () => {
    if (!campaign?.id) {
      console.log('❌ Sem campaign.id, retornando');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔍 Chamando campaignAPI.getCampaignNPCs com ID:', campaign.id);
      
      const response = await campaignAPI.getCampaignNPCs(campaign.id);
      
      console.log('🔍 Resposta completa da API:', response);
      
      // 🔧 CORREÇÃO: A API retorna formato { count: number, npcs: NPC[] }
      // em vez de { success: boolean, npcs: NPC[] }
      if (response && response.npcs && Array.isArray(response.npcs)) {
        const npcsList = response.npcs;
        console.log('✅ NPCs carregados com sucesso:', npcsList);
        console.log('✅ Quantidade de NPCs:', npcsList.length);
        setNpcs(npcsList);
      } else if (response && response.success === false) {
        // Se a API retornar formato com success: false
        console.log('❌ API retornou erro:', response.error);
      } else {
        // Se não houver NPCs ou formato inesperado
        console.log('⚠️ Resposta inesperada da API ou sem NPCs');
        setNpcs([]);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      setNpcs([]);
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
          setShowModal(false);
          setEditingNPC(null);
        }
      } else {
        // Criar novo NPC
        const createData = convertFormDataToCreateRequest(formData);
        const npcId = await createNPC(createData);
        
        if (npcId) {
          await loadNPCs();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao salvar NPC:', error);
      throw error;
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

  // Filtrar NPCs
  const filteredNPCs = npcs.filter(npc => {
    const matchesSearch = !searchTerm || 
                         npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         npc.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         npc.occupation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || npc.npc_type === filterType;
    return matchesSearch && matchesType;
  });

  const npcTypeOptions = [
    { value: 'all', label: 'Todos os Tipos' },
    { value: NPCType.ALLY, label: getNPCTypeLabel(NPCType.ALLY) },
    { value: NPCType.ENEMY, label: getNPCTypeLabel(NPCType.ENEMY) },
    { value: NPCType.NEUTRAL, label: getNPCTypeLabel(NPCType.NEUTRAL) },
    { value: NPCType.MERCHANT, label: getNPCTypeLabel(NPCType.MERCHANT) },
    { value: NPCType.QUEST_GIVER, label: getNPCTypeLabel(NPCType.QUEST_GIVER) },
    { value: NPCType.BACKGROUND, label: getNPCTypeLabel(NPCType.BACKGROUND) }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-400" />
            <span>NPCs da Campanha</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Gerencie os personagens não-jogáveis da sua campanha
          </p>
        </div>

        {isGM && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => loadNPCs()}
              disabled={isLoading}
              className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={handleCreateNPC}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Criar NPC</span>
            </button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar NPCs por nome, localização ou ocupação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de Tipo */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as NPCType | 'all')}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              {npcTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {filteredNPCs.length} de {npcs.length} NPCs
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Carregando NPCs...</span>
          </div>
        </div>
      )}

      {/* Lista de NPCs */}
      {!isLoading && filteredNPCs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNPCs.map((npc) => (
            <div
              key={npc.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-200 group"
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                    {npc.name}
                  </h3>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getNPCTypeColor(npc.npc_type)}`}>
                      {getNPCTypeLabel(npc.npc_type)}
                    </span>
                    
                    <div className="flex items-center space-x-1">
                      {npc.is_alive ? (
                        <Heart className="w-4 h-4 text-green-400" />
                      ) : (
                        <Skull className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-xs ${npc.is_alive ? 'text-green-400' : 'text-red-400'}`}>
                        {npc.is_alive ? 'Vivo' : 'Morto'}
                      </span>
                    </div>
                  </div>

                  {npc.race && (
                    <p className="text-sm text-gray-400 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      {npc.race} {npc.npc_class && `- ${npc.npc_class}`}
                    </p>
                  )}

                  {npc.location && (
                    <p className="text-sm text-gray-400 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {npc.location}
                    </p>
                  )}

                  {npc.occupation && (
                    <p className="text-sm text-gray-400 mb-3">
                      <Target className="w-4 h-4 inline mr-1" />
                      {npc.occupation}
                    </p>
                  )}

                  {npc.description && (
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {npc.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Rápidas */}
              {npc.stats && (
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-700/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {npc.stats.armor_class}
                    </div>
                    <div className="text-xs text-gray-400">CA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-400">
                      {npc.stats.hit_points}
                    </div>
                    <div className="text-xs text-gray-400">HP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-yellow-400">
                      {npc.challenge_rating || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">CR</div>
                  </div>
                </div>
              )}

              {/* Ações */}
              {isGM && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditNPC(npc)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                      title="Editar NPC"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleToggleLife(npc)}
                      className={`p-2 rounded transition-colors ${
                        npc.is_alive 
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10' 
                          : 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                      }`}
                      title={npc.is_alive ? 'Matar NPC' : 'Reviver NPC'}
                    >
                      {npc.is_alive ? <Skull className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteNPC(npc)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                      title="Excluir NPC"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      console.log('Ver detalhes do NPC:', npc);
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                    title="Ver Detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Estado Vazio */}
      {!isLoading && filteredNPCs.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {npcs.length === 0 ? 'Nenhum NPC criado' : 'Nenhum NPC encontrado'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterType !== 'all'
              ? 'Tente ajustar os filtros de busca' 
              : 'Crie seu primeiro NPC para começar a povoar o mundo da campanha'
            }
          </p>
          {isGM && npcs.length === 0 && (
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