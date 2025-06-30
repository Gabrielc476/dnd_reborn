// ===========================
// CAMPAIGN OVERVIEW - UI MODERNA
// src/components/campaign-manage/CampaignOverview.tsx
// ===========================

import React, { useState } from 'react';
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
    canPerformAction
  } = useManageCampaignContext();

  const [isInCombat] = useState(false); // Para fins de exemplo

  // Dados de exemplo - substitua pelos dados reais da campanha
  const objectives = [
    "Investigar o desaparecimento de caravanas na Estrada do Norte",
    "Descobrir a verdade sobre os cultistas na cidade de Pedravale", 
    "Recuperar o artefato roubado do Templo de Lugh",
    "Formar uma aliança com os Elfos da Floresta Sombria"
  ];

  const partyStatus = {
    location: "Taverna do Javali Dourado, Pedravale",
    marchingOrder: "Tanque → DPS → Suporte → Arcano",
    travelPace: "Normal (3 milhas por hora)",
    restStatus: "Descansados",
    lastRest: "Há 4 horas"
  };

  const sessionInfo = {
    currentSession: 12,
    totalTime: "2h 30min",
    startTime: "19:30",
    status: isInCombat ? "Em Combate" : "Exploração Livre"
  };

  // Ações rápidas para o mestre
  const quickActions = [
    { 
      label: 'Rolagem de Grupo', 
      icon: Dice6, 
      color: 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      action: () => console.log('Rolagem de grupo')
    },
    { 
      label: 'Adicionar XP', 
      icon: Sparkles, 
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      action: () => console.log('Adicionar XP')
    },
    { 
      label: 'Novo Encontro', 
      icon: Sword, 
      color: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      action: () => console.log('Novo encontro')
    },
    { 
      label: 'Loot Rápido', 
      icon: Gift, 
      color: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      action: () => console.log('Loot rápido')
    },
    { 
      label: 'Criar NPC', 
      icon: Users, 
      color: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      action: () => console.log('Criar NPC')
    },
    { 
      label: 'Anotação', 
      icon: FileText, 
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      action: () => console.log('Anotação')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Status da Sessão */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Activity className="w-8 h-8 text-green-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Sessão #{sessionInfo.currentSession}</h2>
              <p className="text-gray-400">Status: <span className="text-green-400 font-medium">{sessionInfo.status}</span></p>
            </div>
          </div>

          {isGM && (
            <div className="flex items-center space-x-3">
              <div className="text-right text-sm">
                <div className="text-gray-400">Duração</div>
                <div className="text-white font-medium">{sessionInfo.totalTime}</div>
              </div>
              <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25">
                <Play className="w-5 h-5" />
                <span className="font-semibold">Continuar Sessão</span>
              </button>
            </div>
          )}
        </div>

        {/* Info da sessão em grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/30 backdrop-blur-sm rounded-lg p-3 border border-gray-600/20">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-xs text-gray-400">Iniciada às</div>
                <div className="font-medium text-white">{sessionInfo.startTime}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/30 backdrop-blur-sm rounded-lg p-3 border border-gray-600/20">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              <div>
                <div className="text-xs text-gray-400">Localização</div>
                <div className="font-medium text-white text-sm truncate">Pedravale</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-700/30 backdrop-blur-sm rounded-lg p-3 border border-gray-600/20">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-xs text-gray-400">Estado</div>
                <div className="font-medium text-green-400">Saudável</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-700/30 backdrop-blur-sm rounded-lg p-3 border border-gray-600/20">
            <div className="flex items-center space-x-2">
              <Bed className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs text-gray-400">Último Descanso</div>
                <div className="font-medium text-white text-sm">{partyStatus.lastRest}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Objetivos Atuais */}
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
            {objectives.map((objective, index) => (
              <div key={index} className="group">
                <div className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-xl border border-gray-600/20 hover:bg-gray-700/50 transition-all duration-200">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                  <div className="flex-1">
                    <p className="text-gray-300 leading-relaxed">{objective}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {isGM && (
            <button className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 hover:from-green-500/30 hover:to-green-600/30 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 text-green-400 hover:text-green-300">
              <Plus className="w-4 h-4" />
              <span className="font-medium">Adicionar Objetivo</span>
            </button>
          )}
        </div>

        {/* Status do Grupo */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <MapPin className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold text-white">Status do Grupo</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-400 text-sm font-medium">Localização Atual</span>
                <MapPin className="w-4 h-4 text-orange-400" />
              </div>
              <div className="font-semibold text-white">{partyStatus.location}</div>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-400 text-sm font-medium">Ordem de Marcha</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="font-semibold text-white text-sm">{partyStatus.marchingOrder}</div>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-400 text-sm font-medium">Ritmo de Viagem</span>
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <div className="font-semibold text-white text-sm">{partyStatus.travelPace}</div>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-400 text-sm font-medium">Status de Descanso</span>
                <Bed className="w-4 h-4 text-green-400" />
              </div>
              <div className="font-semibold text-green-400">{partyStatus.restStatus}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas para GM */}
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
            {quickActions.map((action, index) => (
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

      {/* Estatísticas da Campanha */}
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
                  <div className="text-2xl font-bold text-white">{dashboard.total_npcs || 0}</div>
                  <div className="text-green-400 text-sm">NPCs</div>
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

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Star className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{dashboard.average_level || 1}</div>
                  <div className="text-purple-400 text-sm">Nível Médio</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-orange-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{dashboard.story_arcs || 0}</div>
                  <div className="text-orange-400 text-sm">Arcos</div>
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