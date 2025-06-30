import React, { useState } from 'react';
import { 
  BarChart3,
  Users,
  Sword,
  Coins,
  Calendar,
  Dice6,
  Music,
  Plus,
  Play,
  Pause,
  Square,
  FileText,
  Eye,
  Settings,
  MapPin,
  Shield,
  Crown,
  Gift,
  Map,
  Sparkles,
  Sun,
  Angry,
  DollarSign,
  PartyPopper,
  Clock,
  Bed,
  Zap,
  Target
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';

const GMSidebar = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const {
    dashboard,
    createEncounter,
    createNPC,
    createSession,
    addLoot,
    canPerformAction
  } = useManageCampaignContext();

  const sidebarSections = [
    {
      id: 'overview',
      title: 'VISÃO GERAL',
      icon: BarChart3,
      items: [
        { label: 'Dashboard', action: () => setActiveSection('overview') },
        { label: 'Estatísticas Rápidas', action: () => {} },
        { label: 'Atividade Recente', action: () => {} }
      ]
    },
    {
      id: 'npcs',
      title: 'NPCs & MUNDO',
      icon: Users,
      items: [
        { label: 'Criar NPC', action: () => createNPC },
        { label: 'Gerenciar Locais', action: () => {} },
        { label: 'Facções', action: () => {} },
        { label: 'Templates de NPC', action: () => {} }
      ]
    },
    {
      id: 'encounters',
      title: 'ENCONTROS',
      icon: Sword,
      items: [
        { label: 'Planejar Encontro', action: () => {} },
        { label: 'Encontros Ativos', action: () => {} },
        { label: 'Iniciar Combate', action: () => {}, color: 'text-red-400', bg: 'bg-red-900' },
        { label: 'Pausar Combate', action: () => {}, color: 'text-yellow-400', bg: 'bg-yellow-900' },
        { label: 'Encerrar Combate', action: () => {}, color: 'text-gray-400', bg: 'bg-gray-700' }
      ]
    },
    {
      id: 'loot',
      title: 'LOOT & RECOMPENSAS',
      icon: Coins,
      items: [
        { label: 'Tesouro Encontrado', action: () => {} },
        { label: 'Atribuir aos Jogadores', action: () => {} },
        { label: 'Itens Mágicos', action: () => {} },
        { label: 'Tabelas de Loot', action: () => {} }
      ]
    },
    {
      id: 'players',
      title: 'GERENC. JOGADORES',
      icon: Shield,
      items: [
        { label: 'Visão do Grupo', action: () => {} },
        { label: 'Fichas de Personagem', action: () => {} },
        { label: 'Adicionar/Remover', action: () => {} },
        { label: 'Permissões', action: () => {} }
      ]
    },
    {
      id: 'sessions',
      title: 'PLANEJAMENTO',
      icon: Calendar,
      items: [
        { label: 'Agendar Próxima', action: () => {} },
        { label: 'Prep. da Sessão', action: () => {} },
        { label: 'Notas & Lembretes', action: () => {} },
        { label: 'Construtor de Encontros', action: () => {} }
      ]
    },
    {
      id: 'dice',
      title: 'DADOS & ROLAGENS',
      icon: Dice6,
      items: [
        { label: 'Rolagens Rápidas', action: () => {} },
        { label: 'Dados Customizados', action: () => {} },
        { label: 'Salvar/Recuperar', action: () => {} },
        { label: 'Rolagens em Massa', action: () => {} }
      ]
    },
    {
      id: 'roleplay',
      title: 'FERRAMENTAS RP',
      icon: Music,
      items: [
        { label: 'Geradores Aleatórios', action: () => {} },
        { label: 'Notas de Voz NPC', action: () => {} },
        { label: 'Humor/Ambiente', action: () => {} },
        { label: 'Playlists Musicais', action: () => {} }
      ]
    }
  ];

  const quickActions = [
    { label: 'Encontro Aleatório', icon: Dice6, action: () => {} },
    { label: 'Clima', icon: Sun, action: () => {} },
    { label: 'Reação NPC', icon: Angry, action: () => {} },
    { label: 'Tabela de Loot', icon: DollarSign, action: () => {} },
    { label: 'Evento Aleatório', icon: PartyPopper, action: () => {} },
    { label: 'Local Aleatório', icon: MapPin, action: () => {} }
  ];

  const sessionActions = [
    { label: 'Adicionar Notas', icon: FileText, action: () => {} },
    { label: 'Dar XP', icon: Sparkles, action: () => {} },
    { label: 'Level Milestone', icon: Crown, action: () => {} },
    { label: 'Conquista', icon: Target, action: () => {} }
  ];

  const restActions = [
    { label: 'Descanso Curto', icon: Clock, action: () => {} },
    { label: 'Descanso Longo', icon: Bed, action: () => {} },
    { label: 'Status Descanso', icon: Eye, action: () => {} },
    { label: 'Slots de Magia', icon: Zap, action: () => {} }
  ];

  const creationActions = [
    { label: 'NPC Rápido', icon: Plus, action: () => {} },
    { label: 'Encontro Instantâneo', icon: Zap, action: () => {} },
    { label: 'Loot Aleatório', icon: Gift, action: () => {} },
    { label: 'Gerar Mapa', icon: Map, action: () => {} }
  ];

  return (
    <div className="h-full bg-gray-800 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Main Sections */}
        {sidebarSections.map((section) => (
          <div key={section.id}>
            <div className="flex items-center space-x-2 mb-3">
              <section.icon className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                {section.title}
              </h3>
            </div>
            
            <div className="space-y-1 ml-6">
              {section.items.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className={`block w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                    item.color || 'text-gray-300'
                  } ${
                    item.bg || 'hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3">
            🎲 AÇÕES INSTANTÂNEAS
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center space-x-2 px-2 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
              >
                <action.icon className="w-3 h-3" />
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Session Management */}
        <div>
          <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wide mb-3">
            📝 GERENC. SESSÃO
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            {sessionActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center space-x-2 px-2 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
              >
                <action.icon className="w-3 h-3" />
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rest Management */}
        <div>
          <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wide mb-3">
            🛌 GERENC. DESCANSO
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            {restActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center space-x-2 px-2 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
              >
                <action.icon className="w-3 h-3" />
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Creation */}
        <div>
          <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide mb-3">
            🧙‍♂️ CRIAÇÃO RÁPIDA
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            {creationActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center space-x-2 px-2 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
              >
                <action.icon className="w-3 h-3" />
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GMSidebar;