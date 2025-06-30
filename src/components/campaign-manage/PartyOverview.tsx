import React, { useState } from 'react';
import { 
  Users,
  Eye,
  Edit,
  MessageSquare,
  Settings,
  RefreshCw,
  Mail,
  Circle,
  Shield,
  Heart,
  Clock,
  UserPlus,
  BarChart3,
  Crown,
  Sparkles
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';

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

  const [showAddPlayer, setShowAddPlayer] = useState(false);

  // Dados mockados para demonstração - em produção viriam do dashboard
  const partyMembers = [
    {
      id: 1,
      name: "Aragorn",
      player: "You manage",
      class: "Fighter",
      level: 3,
      hp: 45,
      maxHp: 60,
      ac: 18,
      status: "Ready",
      lastActive: "2 min ago",
      isOnline: true,
      isGMControlled: true
    },
    {
      id: 2,
      name: "Legolas",
      player: "John",
      class: "Ranger",
      level: 3,
      hp: 38,
      maxHp: 45,
      ac: 15,
      status: "Ready",
      lastActive: "1 min ago",
      isOnline: true,
      isGMControlled: false
    },
    {
      id: 3,
      name: "Gimli",
      player: "Mike",
      class: "Cleric",
      level: 3,
      hp: 32,
      maxHp: 40,
      ac: 16,
      status: "Resting",
      lastActive: "15 min ago",
      isOnline: false,
      isGMControlled: false
    },
    {
      id: 4,
      name: "Gandalf",
      player: "Sarah",
      class: "Wizard",
      level: 3,
      hp: 28,
      maxHp: 28,
      ac: 12,
      status: "Ready",
      lastActive: "30s ago",
      isOnline: true,
      isGMControlled: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready': return 'text-green-400';
      case 'Resting': return 'text-yellow-400';
      case 'Injured': return 'text-red-400';
      case 'Unconscious': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getHpBarColor = (hp: number, maxHp: number) => {
    const percentage = (hp / maxHp) * 100;
    if (percentage > 70) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleSendMessage = (playerId: number) => {
    console.log(`Enviando mensagem para jogador ${playerId}`);
  };

  const handleManagePlayer = (playerId: number) => {
    console.log(`Gerenciando jogador ${playerId}`);
  };

  const handleAddPlayer = () => {
    setShowAddPlayer(true);
  };

  const calculateAverageLevel = () => {
    return Math.round(partyMembers.reduce((sum, member) => sum + member.level, 0) / partyMembers.length);
  };

  const calculateTotalHp = () => {
    return {
      current: partyMembers.reduce((sum, member) => sum + member.hp, 0),
      max: partyMembers.reduce((sum, member) => sum + member.maxHp, 0)
    };
  };

  const totalHp = calculateTotalHp();

  return (
    <div className="bg-gray-800 p-6">
      <div className="mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">
              MEMBROS DO GRUPO ({partyMembers.length}/{campaign?.max_players || 6})
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {isGM() && (
              <>
                <button
                  onClick={handleAddPlayer}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>

                <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>Mensagem Grupo</span>
                </button>

                <button className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors">
                  <BarChart3 className="w-4 h-4" />
                  <span>Stats Grupo</span>
                </button>
              </>
            )}

            <button
              onClick={refreshDashboard}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Party Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 px-4 py-3 rounded-lg text-center">
            <div className="text-lg font-bold text-white">{calculateAverageLevel()}</div>
            <div className="text-sm text-gray-400">Nível Médio</div>
          </div>
          
          <div className="bg-gray-700 px-4 py-3 rounded-lg text-center">
            <div className="text-lg font-bold text-white">{totalHp.current}/{totalHp.max}</div>
            <div className="text-sm text-gray-400">HP Total</div>
          </div>
          
          <div className="bg-gray-700 px-4 py-3 rounded-lg text-center">
            <div className="text-lg font-bold text-green-400">
              {partyMembers.filter(m => m.isOnline).length}
            </div>
            <div className="text-sm text-gray-400">Online</div>
          </div>
          
          <div className="bg-gray-700 px-4 py-3 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-400">
              {partyMembers.filter(m => m.status === 'Ready').length}
            </div>
            <div className="text-sm text-gray-400">Prontos</div>
          </div>
        </div>
      </div>

      {/* Party Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {partyMembers.map((member) => (
          <div key={member.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
            {/* Member Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Shield className="w-8 h-8 text-blue-400" />
                  {member.isGMControlled && (
                    <Crown className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-gray-400">
                    {member.isGMControlled ? member.player : `Jogador: ${member.player}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${member.isOnline ? 'bg-green-400' : 'bg-gray-500'}`} />
                <span className="text-xs text-gray-400">
                  {member.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Character Info */}
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <span className="text-xs text-gray-400">Classe</span>
                <div className="font-medium text-white">{member.class} {member.level}</div>
              </div>
              <div>
                <span className="text-xs text-gray-400">CA</span>
                <div className="font-medium text-white">{member.ac}</div>
              </div>
              <div>
                <span className="text-xs text-gray-400">Status</span>
                <div className={`font-medium ${getStatusColor(member.status)}`}>
                  {member.status}
                </div>
              </div>
            </div>

            {/* HP Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">HP</span>
                <span className="text-white">{member.hp}/{member.maxHp}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getHpBarColor(member.hp, member.maxHp)}`}
                  style={{ width: `${(member.hp / member.maxHp) * 100}%` }}
                />
              </div>
            </div>

            {/* Last Active */}
            <div className="flex items-center space-x-2 mb-3 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Última atividade: {member.lastActive}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {}}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  <span>Ver</span>
                </button>

                {(isGM() || member.isGMControlled) && (
                  <button
                    onClick={() => handleManagePlayer(member.id)}
                    className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                )}
              </div>

              {!member.isGMControlled && (
                <button
                  onClick={() => handleSendMessage(member.id)}
                  className="flex items-center space-x-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Mensagem</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add Player Card */}
        {isGM() && partyMembers.length < (campaign?.max_players || 6) && (
          <div className="bg-gray-700 border-2 border-dashed border-gray-500 rounded-lg p-8 flex flex-col items-center justify-center text-center">
            <UserPlus className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Adicionar Jogador</h3>
            <p className="text-sm text-gray-500 mb-4">
              Convide novos jogadores para sua campanha
            </p>
            <button
              onClick={handleAddPlayer}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors text-white"
            >
              Convidar Jogador
            </button>
          </div>
        )}
      </div>

      {/* Group Actions */}
      {isGM() && (
        <div className="mt-6 pt-6 border-t border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">Ações do Grupo</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded transition-colors">
              <Sparkles className="w-4 h-4" />
              <span>Dar XP</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors">
              <Heart className="w-4 h-4" />
              <span>Curar Todos</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded transition-colors">
              <Clock className="w-4 h-4" />
              <span>Descanso Longo</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors">
              <Crown className="w-4 h-4" />
              <span>Level Up</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyOverview;