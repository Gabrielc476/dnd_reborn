// ===========================
// MODAL DE DETALHES DO JOGADOR
// src/components/campaign-manage/PlayerDetailsModal.tsx
// ===========================

import { Shield, Heart, Zap, Users, Calendar, Trophy, Settings } from 'lucide-react';

interface PlayerDetailsModalProps {
  player: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (playerId: string, updates: any) => void;
  canEdit: boolean;
}

export const PlayerDetailsModal: React.FC<PlayerDetailsModalProps> = ({
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
      onUpdate(player.id, editedPlayer);
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
                <h3 className="text-xl font-bold text-white">
                  {player.character_name || 'Sem Personagem'}
                </h3>
                <p className="text-gray-400">{player.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {canEdit && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Classe & Nível</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPlayer.character_class || ''}
                    onChange={(e) => setEditedPlayer(prev => ({ ...prev, character_class: e.target.value }))}
                    className="w-full px-2 py-1 bg-gray-600 rounded text-white text-sm"
                  />
                ) : (
                  <div className="text-white font-medium">
                    {player.character_class || 'Indefinido'} Nível {player.character_level || 1}
                  </div>
                )}
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Entrou em</span>
                </div>
                <div className="text-white font-medium">
                  {new Date(player.joined_date || Date.now()).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-400">Status</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {player.current_hp || 'N/A'}/{player.max_hp || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">Pontos de Vida</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {player.armor_class || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">Classe de Armadura</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-lg font-bold ${player.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {player.is_active ? 'Ativo' : 'Inativo'}
                  </div>
                  <div className="text-xs text-gray-400">Status</div>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Notas</span>
              </div>
              
              {isEditing ? (
                <textarea
                  value={editedPlayer.notes || ''}
                  onChange={(e) => setEditedPlayer(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-600 rounded text-white text-sm resize-y"
                  placeholder="Notas sobre o jogador..."
                />
              ) : (
                <div className="text-white text-sm">
                  {player.notes || 'Nenhuma nota registrada'}
                </div>
              )}
            </div>

            {/* Estatísticas */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Estatísticas</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sessões participadas:</span>
                  <span className="text-white">{player.session_attendance || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total de sessões:</span>
                  <span className="text-white">{player.total_sessions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxa de presença:</span>
                  <span className="text-white">
                    {player.total_sessions 
                      ? Math.round((player.session_attendance / player.total_sessions) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Última atividade:</span>
                  <span className="text-white">
                    {player.last_active 
                      ? new Date(player.last_active).toLocaleDateString('pt-BR')
                      : 'Nunca'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          {isEditing && (
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedPlayer(player);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
              >
                Salvar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};