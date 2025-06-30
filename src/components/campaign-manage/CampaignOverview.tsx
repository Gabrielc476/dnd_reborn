// ===========================
// CAMPAIGN OVERVIEW - USANDO DADOS REAIS DA API
// src/components/campaign-manage/CampaignOverview.tsx
// ===========================

import React, { useState, useEffect } from 'react';
import { 
  Target,
  MapPin,
  Plus,
  Dice6,
  FileText,
  Bed,
  Sparkles,
  TrendingUp,
  Play,
  Pause,
  Calendar,
  Users,
  Sword,
  Crown,
  Heart,
  Shield,
  Zap,
  Clock,
  BookOpen,
  Trophy,
  Gift,
  Map,
  Eye,
  Activity,
  ChevronRight,
  Star
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';

const CampaignOverview = () => {
  const {
    campaign,
    dashboard,
    isGM,
    canPerformAction,
    createNPC,
    createEncounter,
    addLoot,
    createSession
  } = useManageCampaignContext();

  // Estado para dados específicos do overview
  const [currentSessionStatus, setCurrentSessionStatus] = useState<'active' | 'paused' | 'ended'>('ended');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // ===========================
  // DADOS REAIS DA CAMPANHA - SUBSTITUINDO MOCKS
  // ===========================

  // Objetivos vêm dos encontros não completados e notas do GM
  const objectives = React.useMemo(() => {
    if (!campaign) return [];
    
    const encounterObjectives = campaign.encounters
      ?.filter(encounter => !encounter.is_completed)
      .map(encounter => encounter.name || encounter.description)
      .filter(Boolean) || [];
    
    // Pode adicionar objetivos das notas do GM também
    const gmNotesObjectives = campaign.gm_notes
      ? [campaign.gm_notes]
      : [];
    
    return [...encounterObjectives, ...gmNotesObjectives].slice(0, 4); // Máximo 4 objetivos
  }, [campaign]);

  // Status do grupo baseado nos dados reais da campanha
  const partyStatus = React.useMemo(() => {
    if (!campaign || !dashboard) return null;
    
    return {
      location: campaign.world_name || "Localização não definida",
      playerCount: campaign.players?.length || 0,
      maxPlayers: campaign.max_players || 6,
      averageLevel: dashboard.average_level || 1,
      totalSessions: dashboard.total_sessions || 0,
      lastSessionDate: dashboard.last_session 
        ? new Date(dashboard.last_session).toLocaleDateString('pt-BR')
        : 'Nunca',
      campaignStatus: campaign.status || 'ativa'
    };
  }, [campaign, dashboard]);

  // Informações da sessão atual baseadas no dashboard
  const sessionInfo = React.useMemo(() => {
    if (!dashboard) return null;
    
    const now = new Date();
    const sessionDuration = sessionStartTime 
      ? Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000 / 60) // minutos
      : 0;
    
    return {
      currentSession: (dashboard.total_sessions || 0) + (currentSessionStatus === 'active' ? 1 : 0),
      duration: sessionDuration,
      status: currentSessionStatus === 'active' ? 'Em Andamento' : 
               currentSessionStatus === 'paused' ? 'Pausada' : 'Finalizada',
      startTime: sessionStartTime?.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) || '--:--'
    };
  }, [dashboard, currentSessionStatus, sessionStartTime]);

  // ===========================
  // AÇÕES FUNCIONAIS - SUBSTITUINDO CONSOLE.LOG
  // ===========================

  const quickActions = [
    { 
      label: 'Iniciar Sessão', 
      icon: Play, 
      color: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      action: () => {
        if (currentSessionStatus === 'ended') {
          setCurrentSessionStatus('active');
          setSessionStartTime(new Date());
        }
      },
      visible: currentSessionStatus === 'ended'
    },
    { 
      label: 'Pausar Sessão', 
      icon: Pause, 
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      action: () => setCurrentSessionStatus('paused'),
      visible: currentSessionStatus === 'active'
    },
    { 
      label: 'Finalizar Sessão', 
      icon: Clock, 
      color: 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      action: async () => {
        setCurrentSessionStatus('ended');
        setSessionStartTime(null);
        
        // Criar registro da sessão
        if (sessionStartTime) {
          await createSession({
            session_number: (dashboard?.total_sessions || 0) + 1,
            date: sessionStartTime.toISOString(),
            duration_minutes: Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60),
            summary: `Sessão ${(dashboard?.total_sessions || 0) + 1}`,
            notes: ''
          });
        }
      },
      visible: currentSessionStatus === 'active' || currentSessionStatus === 'paused'
    },
    { 
      label: 'Novo Encontro', 
      icon: Sword, 
      color: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      action: async () => {
        await createEncounter({
          name: `Encontro ${(campaign?.encounters?.length || 0) + 1}`,
          description: 'Novo encontro criado rapidamente',
          difficulty: 'medium'
        });
      }
    },
    { 
      label: 'Loot Rápido', 
      icon: Gift, 
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      action: async () => {
        await addLoot({
          name: 'Moedas de Ouro',
          description: 'Tesouro encontrado',
          item_type: 'gold',
          value: 50,
          quantity: 1
        });
      }
    },
    { 
      label: 'Criar NPC', 
      icon: Users, 
      color: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      action: async () => {
        await createNPC({
          name: `NPC ${(campaign?.npcs?.length || 0) + 1}`,
          description: 'NPC criado rapidamente',
          npc_type: 'neutral' as any,
          location: campaign?.world_name || 'Localização desconhecida'
        });
      }
    },
    { 
      label: 'Anotação Rápida', 
      icon: FileText, 
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      action: () => {
        // Abrir modal de anotação ou navegar para página de notas
        console.log('Abrir modal de anotações');
      }
    }
  ];

  // Filtrar ações visíveis
  const visibleQuickActions = quickActions.filter(action => 
    action.visible === undefined || action.visible === true
  );

  // ===========================
  // LOADING E ERROR STATES
  // ===========================

  if (!campaign) {
    return (
      <div className="space-y-8">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Status da Sessão - USANDO DADOS REAIS */}
      {sessionInfo && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Activity className={`w-8 h-8 ${
                  currentSessionStatus === 'active' ? 'text-green-400' : 
                  currentSessionStatus === 'paused' ? 'text-yellow-400' : 
                  'text-gray-400'
                }`} />
                {currentSessionStatus === 'active' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Sessão #{sessionInfo.currentSession}</h2>
                <p className="text-gray-400">
                  Status: <span className={`font-medium ${
                    currentSessionStatus === 'active' ? 'text-green-400' : 
                    currentSessionStatus === 'paused' ? 'text-yellow-400' : 
                    'text-gray-400'
                  }`}>{sessionInfo.status}</span>
                </p>
              </div>
            </div>

            {currentSessionStatus === 'active' && (
              <div className="text-right text-sm">
                <div className="text-gray-400">Início:</div>
                <div className="font-semibold text-white">{sessionInfo.startTime}</div>
                <div className="text-gray-400 mt-1">Duração:</div>
                <div className="font-semibold text-green-400">{sessionInfo.duration}min</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status do Grupo - USANDO DADOS REAIS */}
      {partyStatus && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <MapPin className="w-6 h-6 text-orange-400" />
              <h3 className="text-xl font-bold text-white">Status do Grupo</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-400 text-sm font-medium">Localização</span>
                  <MapPin className="w-4 h-4 text-orange-400" />
                </div>
                <div className="font-semibold text-white">{partyStatus.location}</div>
              </div>

              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 text-sm font-medium">Jogadores</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="font-semibold text-white">
                  {partyStatus.playerCount}/{partyStatus.maxPlayers} jogadores
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 text-sm font-medium">Nível Médio</span>
                  <Star className="w-4 h-4 text-purple-400" />
                </div>
                <div className="font-semibold text-white">Nível {partyStatus.averageLevel}</div>
              </div>

              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 text-sm font-medium">Status</span>
                  <Activity className="w-4 h-4 text-green-400" />
                </div>
                <div className="font-semibold text-green-400 capitalize">{partyStatus.campaignStatus}</div>
              </div>
            </div>
          </div>

          {/* Objetivos Atuais - USANDO DADOS REAIS */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">Objetivos Atuais</h3>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-400 text-sm rounded-full border border-green-500/20">
                {objectives.length} ativos
              </span>
            </div>
            
            <div className="space-y-4">
              {objectives.length > 0 ? (
                objectives.map((objective, index) => (
                  <div key={index} className="group">
                    <div className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-xl border border-gray-600/20 hover:bg-gray-700/50 transition-all duration-200">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                      <div className="flex-1">
                        <p className="text-gray-300 leading-relaxed">{objective}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum objetivo ativo</p>
                  <p className="text-sm text-gray-500">Encontros não completados aparecerão aqui</p>
                </div>
              )}
            </div>

            {isGM && (
              <button className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 hover:from-green-500/30 hover:to-green-600/30 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 text-green-400 hover:text-green-300">
                <Plus className="w-4 h-4" />
                <span className="font-medium">Adicionar Objetivo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ações Rápidas para GM - FUNCIONAIS */}
      {isGM && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Dice6 className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-white">Ações Instantâneas</h3>
            <span className="px-3 py-1 bg-red-500/10 text-red-400 text-sm rounded-full border border-red-500/20">
              Mestre
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {visibleQuickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} p-4 rounded-xl transition-all duration-200 flex flex-col items-center space-y-2 shadow-lg transform hover:scale-105 group`}
              >
                <action.icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                <span className="text-xs text-white text-center font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Estatísticas da Campanha - USANDO DADOS REAIS */}
      {dashboard && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Estatísticas da Campanha</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{dashboard.total_sessions || 0}</div>
                  <div className="text-blue-400 text-sm">Sessões</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{campaign.players?.length || 0}</div>
                  <div className="text-green-400 text-sm">Jogadores</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{dashboard.total_npcs || 0}</div>
                  <div className="text-purple-400 text-sm">NPCs</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Sword className="w-8 h-8 text-red-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{dashboard.total_encounters || 0}</div>
                  <div className="text-red-400 text-sm">Encontros</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{dashboard.total_experience?.toLocaleString() || 0}</div>
                  <div className="text-yellow-400 text-sm">XP Total</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-cyan-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{dashboard.average_level || 1}</div>
                  <div className="text-cyan-400 text-sm">Nível Médio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignOverview;