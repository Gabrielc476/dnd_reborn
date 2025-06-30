// ===========================
// PARTY OVERVIEW - UI CORRIGIDA E MODERNA
// src/components/campaign-manage/PartyOverview.tsx
// ===========================

import React, { useState } from 'react';
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
  CheckCircle
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

  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  // Dados dos membros do grupo - em produção viriam do dashboard
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
      case 'Ready':
        return 'text-green-400';
      case 'Resting':
        return 'text-yellow-400';
      case 'Injured':
        return 'text-red-400';
      case 'Unconscious':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getHpBarColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 75) return 'bg-green-500';
    if (percentage > 50) return 'bg-yellow-500';
    if (percentage > 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ready':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Resting':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'Injured':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const calculateAverageLevel = () => {
    return Math.round(partyMembers.reduce((sum, member) => sum + member.level, 0) / partyMembers.length);
  };

  const calculateTotalHp = () => {
    const current = partyMembers.reduce((sum, member) => sum + member.hp, 0);
    const max = partyMembers.reduce((sum, member) => sum + member.maxHp, 0);
    return { current, max };
  };

  const totalHp = calculateTotalHp();
  const onlineCount = partyMembers.filter(m => m.isOnline).length;
  const readyCount = partyMembers.filter(m => m.status === 'Ready').length;

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50">
      {/* Header Compacto */}
      <div className="px-6 py-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between group hover:bg-gray-700/30 rounded-lg p-2 transition-all duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>MEMBROS DO GRUPO ({partyMembers.length}/6)</span>
                </h3>
                <p className="text-sm text-gray-400">
                  {onlineCount} online • {readyCount} prontos
                </p>
              </div>
            </div>

            {/* Stats rápidos */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-700/50 rounded-lg">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white">Nível {calculateAverageLevel()}</span>
              </div>
              
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-700/50 rounded-lg">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm text-white">{totalHp.current}/{totalHp.max}</span>
              </div>

              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-700/50 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">{onlineCount} Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isGM && (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddPlayer(true);
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Mensagem Grupo</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors text-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Stats Grupo</span>
                </button>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                refreshDashboard?.();
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-600/50 rounded-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="text-gray-400 group-hover:text-white transition-colors">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* Grid de Membros */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {partyMembers.map((member) => (
              <div key={member.id} className="bg-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4 hover:bg-gray-700/70 transition-all duration-200">
                {/* Header do membro */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Shield className="w-8 h-8 text-blue-400" />
                      {member.isGMControlled && (
                        <Crown className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{member.name}</h4>
                      <p className="text-sm text-gray-400">
                        {member.isGMControlled ? member.player : `Jogador: ${member.player}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${member.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                    <span className="text-xs text-gray-400">
                      {member.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Info do personagem */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Classe</div>
                    <div className="font-medium text-white text-sm">{member.class}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Nível</div>
                    <div className="font-bold text-blue-400">{member.level}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">CA</div>
                    <div className="font-bold text-white">{member.ac}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Status</div>
                    <div className="flex items-center justify-center">
                      {getStatusIcon(member.status)}
                    </div>
                  </div>
                </div>

                {/* Barra de HP */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400 flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>HP</span>
                    </span>
                    <span className="text-white font-medium">{member.hp}/{member.maxHp}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getHpBarColor(member.hp, member.maxHp)}`}
                      style={{ width: `${Math.max((member.hp / member.maxHp) * 100, 0)}%` }}
                    />
                  </div>
                </div>

                {/* Última atividade */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Última atividade: {member.lastActive}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(member.status)} bg-current/10`}>
                    {member.status}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors text-sm flex-1 justify-center">
                    <Eye className="w-3 h-3" />
                    <span>Ver</span>
                  </button>
                  
                  {(isGM || member.isGMControlled) && (
                    <button className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors text-sm flex-1 justify-center">
                      <Edit className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  )}
                  
                  <button className="flex items-center space-x-1 px-3 py-1 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors text-sm">
                    <MessageSquare className="w-3 h-3" />
                    <span>Mensagem</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Ações de Grupo (apenas para GM) */}
          {isGM && (
            <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-4 border border-gray-600/20">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Ações de Grupo</span>
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 hover:from-green-500/30 hover:to-green-600/30 rounded-lg transition-all duration-200 text-green-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Dar XP</span>
                </button>
                
                <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 hover:from-red-500/30 hover:to-red-600/30 rounded-lg transition-all duration-200 text-red-400">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">Curar Todos</span>
                </button>
                
                <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-purple-600/30 rounded-lg transition-all duration-200 text-purple-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Descanso Longo</span>
                </button>
                
                <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 hover:from-yellow-500/30 hover:to-yellow-600/30 rounded-lg transition-all duration-200 text-yellow-400">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">Level Up</span>
                </button>
              </div>
            </div>
          )}

          {/* Placeholder para grupo vazio */}
          {partyMembers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhum membro no grupo</h3>
              <p className="text-gray-400 mb-4">Convide jogadores para sua campanha</p>
              {isGM && (
                <button
                  onClick={() => setShowAddPlayer(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25"
                >
                  Convidar Primeiro Jogador
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PartyOverview;