import React from 'react';
import { 
  Calendar,
  Clock,
  MapPin,
  Target,
  Users,
  TrendingUp,
  Dice6,
  Sun,
  Angry,
  DollarSign,
  PartyPopper,
  FileText,
  Sparkles,
  Crown,
  Award,
  Bed,
  Clock3,
  Eye,
  Zap,
  Plus,
  Gift,
  Map,
  Activity
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';

const CampaignOverview = () => {
  const {
    campaign,
    dashboard,
    createSession,
    addLoot,
    isGM,
    canPerformAction
  } = useManageCampaignContext();

  // Dados mockados para demonstração
  const nextSession = {
    date: "15 de Dezembro, 2024",
    time: "19:00",
    duration: "~4 horas",
    location: "Online"
  };

  const objectives = [
    "Encontrar a Mina Perdida de Phandelver",
    "Resgatar Sildar Hallwinter",
    "Lidar com os Goblins Cragmaw"
  ];

  const partyStatus = {
    location: "Covil dos Cragmaw",
    marchingOrder: "Aragorn, Legolas, Gimli, Gandalf",
    travelPace: "Normal",
    restStatus: "Bem descansado"
  };

  const quickActions = [
    { label: 'Encontro Aleatório', icon: Dice6, color: 'bg-blue-600' },
    { label: 'Clima', icon: Sun, color: 'bg-yellow-600' },
    { label: 'Reação NPC', icon: Angry, color: 'bg-red-600' },
    { label: 'Tabela de Loot', icon: DollarSign, color: 'bg-green-600' },
    { label: 'Evento Aleatório', icon: PartyPopper, color: 'bg-purple-600' },
    { label: 'Local Aleatório', icon: MapPin, color: 'bg-indigo-600' }
  ];

  const sessionManagement = [
    { label: 'Adicionar Notas', icon: FileText, action: () => {} },
    { label: 'Dar XP', icon: Sparkles, action: () => {} },
    { label: 'Level Milestone', icon: Crown, action: () => {} },
    { label: 'Conquista', icon: Award, action: () => {} }
  ];

  const restManagement = [
    { label: 'Descanso Curto', icon: Clock3, action: () => {} },
    { label: 'Descanso Longo', icon: Bed, action: () => {} },
    { label: 'Status Descanso', icon: Eye, action: () => {} },
    { label: 'Slots de Magia', icon: Zap, action: () => {} }
  ];

  const quickCreation = [
    { label: 'NPC Rápido', icon: Plus, action: () => {} },
    { label: 'Encontro Instantâneo', icon: Zap, action: () => {} },
    { label: 'Loot Aleatório', icon: Gift, action: () => {} },
    { label: 'Gerar Mapa', icon: Map, action: () => {} }
  ];

  return (
    <div className="space-y-6">
      {/* Next Session */}
      <div className="bg-blue-900 border border-blue-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">PRÓXIMA SESSÃO</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <span className="text-blue-400 text-sm">Data:</span>
            <div className="font-medium text-white">{nextSession.date}</div>
          </div>
          <div>
            <span className="text-blue-400 text-sm">Horário:</span>
            <div className="font-medium text-white">{nextSession.time}</div>
          </div>
          <div>
            <span className="text-blue-400 text-sm">Duração:</span>
            <div className="font-medium text-white">{nextSession.duration}</div>
          </div>
          <div>
            <span className="text-blue-400 text-sm">Local:</span>
            <div className="font-medium text-white">{nextSession.location}</div>
          </div>
        </div>

        {isGM() && (
          <div className="mt-4 flex space-x-2">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">
              Editar Sessão
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors">
              Iniciar Sessão
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Objectives */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">OBJETIVOS ATUAIS</h3>
          </div>
          
          <ul className="space-y-3">
            {objectives.map((objective, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-300">{objective}</span>
              </li>
            ))}
          </ul>

          {isGM() && (
            <button className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors flex items-center justify-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Adicionar Objetivo</span>
            </button>
          )}
        </div>

        {/* Party Status */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <MapPin className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">STATUS DO GRUPO</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-orange-400 text-sm">Localização:</span>
              <div className="font-medium text-white">{partyStatus.location}</div>
            </div>
            <div>
              <span className="text-orange-400 text-sm">Ordem de Marcha:</span>
              <div className="font-medium text-white">{partyStatus.marchingOrder}</div>
            </div>
            <div>
              <span className="text-orange-400 text-sm">Ritmo de Viagem:</span>
              <div className="font-medium text-white">{partyStatus.travelPace}</div>
            </div>
            <div>
              <span className="text-orange-400 text-sm">Status de Descanso:</span>
              <div className="font-medium text-green-400">{partyStatus.restStatus}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {isGM() && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Dice6 className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold text-white">AÇÕES INSTANTÂNEAS</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`${action.color} hover:opacity-80 p-3 rounded-lg transition-all flex flex-col items-center space-y-2`}
              >
                <action.icon className="w-5 h-5 text-white" />
                <span className="text-xs text-white text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Management Sections */}
      {isGM() && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Management */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-5 h-5 text-purple-400" />
              <h4 className="font-semibold text-white">GERENC. SESSÃO</h4>
            </div>
            
            <div className="space-y-2">
              {sessionManagement.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors flex items-center space-x-2"
                >
                  <action.icon className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rest Management */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Bed className="w-5 h-5 text-orange-400" />
              <h4 className="font-semibold text-white">GERENC. DESCANSO</h4>
            </div>
            
            <div className="space-y-2">
              {restManagement.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors flex items-center space-x-2"
                >
                  <action.icon className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Creation */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h4 className="font-semibold text-white">CRIAÇÃO RÁPIDA</h4>
            </div>
            
            <div className="space-y-2">
              {quickCreation.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors flex items-center space-x-2"
                >
                  <action.icon className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Campaign Stats */}
      {dashboard && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">ESTATÍSTICAS DA CAMPANHA</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{dashboard.total_sessions || 0}</div>
              <div className="text-sm text-gray-400">Sessões</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{dashboard.total_encounters || 0}</div>
              <div className="text-sm text-gray-400">Encontros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{dashboard.total_npcs || 0}</div>
              <div className="text-sm text-gray-400">NPCs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{dashboard.total_experience || 0}</div>
              <div className="text-sm text-gray-400">XP Total</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignOverview;