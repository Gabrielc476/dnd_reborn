// ===========================
// PARTY OVERVIEW - VERSÃO CORRIGIDA SEM DADOS MOCK
// src/components/campaign-manage/PartyOverview.tsx
// ===========================

import React, { useState, useEffect } from 'react';
import { 
  Users,
  Eye,
  Edit,
  MessageSquare,
  Settings,
  RefreshCw,
  Mail,
  Shield,
  Heart,
  Clock,
  UserPlus,
  BarChart3,
  Crown,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle,
  Sword,
  UserMinus,
  Star,
  Trophy,
  Loader2,
  Plus,
  Minus,
  Search,
  User
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { userAPI } from '@/api/userAPI';

interface PlayerStatus {
  id: string;
  user_id: string;
  character_id?: string;
  username: string;
  character_name?: string;
  character_class?: string;
  character_level?: number;
  current_hp?: number;
  max_hp?: number;
  armor_class?: number;
  is_active: boolean;
  last_active: string;
  is_online: boolean;
  status?: 'ready' | 'resting' | 'injured' | 'unconscious' | 'dead' | 'no_character';
  conditions?: string[];
  notes?: string;
  session_attendance?: number;
  total_sessions?: number;
  has_character: boolean;
}

const PartyOverview = () => {
  const {
    campaign,
    dashboard,
    updatePlayer,
    removePlayer,
    addPlayer,
    isGM,
    canPerformAction,
    refreshDashboard
  } = useManageCampaignContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [playersData, setPlayersData] = useState<PlayerStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStatus | null>(null);
  const [showPlayerDetails, setShowPlayerDetails] = useState(false);

  // Estado simplificado para adicionar jogador (APENAS USERNAME)
  const [newPlayerForm, setNewPlayerForm] = useState({
    username: ''
  });

  // ===========================
  // CARREGAR DADOS REAIS (SEM MOCK)
  // ===========================
  useEffect(() => {
    loadPlayersData();
  }, [campaign?.players]);

  const loadPlayersData = async () => {
    if (!campaign?.players || campaign.players.length === 0) {
      setPlayersData([]);
      return;
    }

    setIsLoading(true);
    try {
      // Buscar dados reais dos usuários e personagens
      const playersPromises = campaign.players.map(async (player, index) => {
        try {
          // Buscar dados do usuário
          const userResult = await userAPI.getUserById(player.user_id);
          
          let playerData: PlayerStatus = {
            id: player.user_id || `player-${index}`,
            user_id: player.user_id || '',
            character_id: player.character_id,
            username: userResult.success ? userResult.user?.username || `Usuário${index + 1}` : `Usuário${index + 1}`,
            is_active: player.is_active,
            last_active: new Date().toISOString(),
            is_online: false, // Pode ser implementado com WebSocket depois
            has_character: !!player.character_id,
            status: player.character_id ? 'ready' : 'no_character',
            notes: player.notes
          };

          // Se tem personagem, buscar dados do personagem
          if (player.character_id) {
            // TODO: Implementar busca de dados do personagem quando a API estiver pronta
            // const characterResult = await characterAPI.getCharacterById(player.character_id);
            // if (characterResult.success) {
            //   playerData.character_name = characterResult.character.name;
            //   playerData.character_class = characterResult.character.class;
            //   playerData.character_level = characterResult.character.level;
            //   playerData.current_hp = characterResult.character.current_hp;
            //   playerData.max_hp = characterResult.character.max_hp;
            //   playerData.armor_class = characterResult.character.armor_class;
            //   playerData.conditions = characterResult.character.conditions || [];
            // }
            
            // Por enquanto, apenas indicar que tem personagem
            playerData.character_name = "Personagem Criado";
            playerData.character_class = "Classe não carregada";
            playerData.character_level = 1;
          }

          return playerData;
        } catch (error) {
          console.error(`Erro ao carregar dados do jogador ${player.user_id}:`, error);
          return {
            id: player.user_id || `player-${index}`,
            user_id: player.user_id || '',
            character_id: player.character_id,
            username: `Usuário${index + 1}`,
            is_active: player.is_active,
            last_active: new Date().toISOString(),
            is_online: false,
            has_character: !!player.character_id,
            status: 'no_character' as const,
            notes: player.notes
          };
        }
      });

      const resolvedPlayers = await Promise.all(playersPromises);
      setPlayersData(resolvedPlayers);
    } catch (error) {
      console.error('Erro ao carregar dados dos jogadores:', error);
      setPlayersData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================
  // AÇÕES DE JOGADOR SIMPLIFICADAS
  // ===========================

  const handleAddPlayer = async () => {
    if (!newPlayerForm.username.trim()) {
      alert('Nome do usuário é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('🔍 Buscando usuário:', newPlayerForm.username);
      
      // 1. BUSCAR USUÁRIO REAL NO BANCO DE DADOS
      const userSearchResult = await userAPI.findUser(newPlayerForm.username.trim());
      
      if (!userSearchResult.success || !userSearchResult.user) {
        alert(`Usuário "${newPlayerForm.username}" não encontrado. Verifique o nome de usuário ou email.`);
        return;
      }
      
      const foundUser = userSearchResult.user;
      console.log('✅ Usuário encontrado:', foundUser);
      
      // 2. VERIFICAR SE JÁ ESTÁ NA CAMPANHA
      const isAlreadyInCampaign = campaign?.players.some(
        player => player.user_id === foundUser.id
      );
      
      if (isAlreadyInCampaign) {
        alert(`${foundUser.username} já está nesta campanha.`);
        return;
      }
      
      // 3. ADICIONAR À CAMPANHA (SEM DADOS DE PERSONAGEM)
      const success = await addPlayer({
        user_id: foundUser.id,
        character_id: undefined, // O jogador criará seu personagem depois
        notes: `Jogador adicionado: ${foundUser.username}`
      });
      
      if (success) {
        console.log('✅ Jogador adicionado com sucesso');
        
        // Limpar formulário
        setShowAddPlayer(false);
        setNewPlayerForm({
          username: ''
        });
        
        // Atualizar dados
        await refreshDashboard();
        
        // Mostrar sucesso
        alert(`${foundUser.username} foi adicionado à campanha! Agora ele pode criar seu personagem.`);
      } else {
        alert('Erro ao adicionar jogador à campanha. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar jogador:', error);
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePlayer = async (playerId: string, playerName: string) => {
    if (!window.confirm(`Remover ${playerName} da campanha?`)) {
      return;
    }

    try {
      const success = await removePlayer(playerId);
      if (success) {
        alert(`${playerName} foi removido da campanha.`);
        await refreshDashboard();
      } else {
        alert('Erro ao remover jogador. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      alert('Erro ao remover jogador.');
    }
  };

  // ===========================
  // RENDERIZAÇÃO
  // ===========================

  const getPlayerStatusColor = (player: PlayerStatus) => {
    if (!player.has_character) return 'text-yellow-400';
    if (!player.is_active) return 'text-gray-400';
    if (player.is_online) return 'text-green-400';
    return 'text-blue-400';
  };

  const getPlayerStatusText = (player: PlayerStatus) => {
    if (!player.has_character) return 'Precisa criar personagem';
    if (!player.is_active) return 'Inativo';
    if (player.is_online) return 'Online';
    return 'Offline';
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-white" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Grupo da Aventura
              </h3>
              <p className="text-blue-100 text-sm">
                {playersData.length} jogador{playersData.length !== 1 ? 'es' : ''} 
                {campaign?.max_players && ` / ${campaign.max_players} máximo`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isGM && (
              <button
                onClick={() => setShowAddPlayer(true)}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar Jogador - SIMPLIFICADO */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Adicionar Jogador</h4>
                <button
                  onClick={() => setShowAddPlayer(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Username ou Email *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={newPlayerForm.username}
                      onChange={(e) => setNewPlayerForm({ username: e.target.value })}
                      placeholder="Digite o username ou email do jogador"
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    O jogador poderá criar seu personagem após entrar na campanha.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddPlayer(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPlayer}
                  disabled={isLoading || !newPlayerForm.username.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {isLoading && playersData.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-400">Carregando jogadores...</p>
          </div>
        ) : playersData.length > 0 ? (
          <div className="space-y-3">
            {playersData.map((player) => (
              <div
                key={player.id}
                className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Info do Jogador */}
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      player.has_character 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                        : 'bg-gradient-to-br from-gray-500 to-gray-600'
                    }`}>
                      {player.has_character ? (
                        player.character_name?.[0] || player.username?.[0] || '?'
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-white">
                          {player.has_character ? player.character_name : player.username}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPlayerStatusColor(player)} bg-gray-600`}>
                          {getPlayerStatusText(player)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {player.has_character ? (
                          `${player.username} • ${player.character_class} Nível ${player.character_level}`
                        ) : (
                          `${player.username} • Aguardando criação de personagem`
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center space-x-2">
                    {player.has_character && (
                      <button
                        onClick={() => {
                          setSelectedPlayer(player);
                          setShowPlayerDetails(true);
                        }}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    
                    {isGM && (
                      <button
                        onClick={() => handleRemovePlayer(player.user_id, player.username)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-lg transition-colors"
                        title="Remover jogador"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandir detalhes quando há personagem */}
                {isExpanded && player.has_character && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">HP:</span>
                        <span className="text-white ml-2">
                          {player.current_hp || 0} / {player.max_hp || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">CA:</span>
                        <span className="text-white ml-2">{player.armor_class || 0}</span>
                      </div>
                    </div>
                    
                    {player.conditions && player.conditions.length > 0 && (
                      <div className="mt-2">
                        <span className="text-gray-400 text-sm">Condições:</span>
                        <span className="text-yellow-400 text-sm ml-2">
                          {player.conditions.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Mostrar aviso para jogadores sem personagem */}
                {isExpanded && !player.has_character && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Este jogador ainda não criou seu personagem.</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">Nenhum jogador ainda</h4>
            <p className="text-gray-400 mb-4">
              {isGM ? 'Convide jogadores para sua campanha' : 'Aguarde outros jogadores se juntarem'}
            </p>
            {isGM && (
              <button
                onClick={() => setShowAddPlayer(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25"
              >
                Buscar e Adicionar Primeiro Jogador
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Jogador - apenas para jogadores com personagem */}
      {showPlayerDetails && selectedPlayer && selectedPlayer.has_character && (
        <PlayerDetailsModal
          player={selectedPlayer}
          isOpen={showPlayerDetails}
          onClose={() => {
            setShowPlayerDetails(false);
            setSelectedPlayer(null);
          }}
          onUpdate={(playerId, updates) => {
            setPlayersData(prev => prev.map(p => 
              p.user_id === playerId ? { ...p, ...updates } : p
            ));
          }}
          canEdit={isGM}
        />
      )}
    </div>
  );
};

// Modal de detalhes do jogador (simplificado)
interface PlayerDetailsModalProps {
  player: PlayerStatus;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (playerId: string, updates: any) => void;
  canEdit: boolean;
}

const PlayerDetailsModal: React.FC<PlayerDetailsModalProps> = ({
  player,
  isOpen,
  onClose,
  onUpdate,
  canEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState(player);

  useEffect(() => {
    setEditedPlayer(player);
  }, [player]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(player.user_id, editedPlayer);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {player.character_name?.[0] || player.username?.[0] || '?'}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{player.character_name}</h3>
                <p className="text-gray-400">{player.username} • {player.character_class} Nível {player.character_level}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <Plus className="w-6 h-6 rotate-45" />
            </button>
          </div>

          {/* Status do Personagem */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-gray-300">Pontos de Vida</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {player.current_hp || 0} / {player.max_hp || 0}
              </p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Classe de Armadura</span>
              </div>
              <p className="text-2xl font-bold text-white">{player.armor_class || 0}</p>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Status</h4>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  player.is_online ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <span className="text-gray-300">
                  {player.is_online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {player.conditions && player.conditions.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Condições</h4>
                <div className="flex flex-wrap gap-2">
                  {player.conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-sm"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {player.notes && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Notas</h4>
                <p className="text-gray-300 bg-gray-700 rounded-lg p-3">
                  {player.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyOverview;