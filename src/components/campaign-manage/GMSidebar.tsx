// ===========================
// src/components/campaign-manage/GMSidebar.tsx
// SIDEBAR COMPLETO COM SISTEMA DE NAVEGAÇÃO
// ===========================

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Dice6, 
  Heart, 
  Shield as ShieldIcon,
  MapPin,
  Map,
  Clock,
  Target,
  Sparkles,
  User,
  Settings,
  ChevronDown,
  ChevronRight,
  Crown,
  Sword,
  Home,
  Calendar,
  Package,
  FileText,
  Activity,
  Download,
  Upload,
  BarChart3,
  Zap,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';

// Tipo para as seções de navegação
export type CampaignSection = 
  | 'overview' 
  | 'npcs' 
  | 'encounters' 
  | 'sessions' 
  | 'party' 
  | 'loot' 
  | 'world'
  | 'combat';

interface GMSidebarProps {
  onNavigate: (section: CampaignSection) => void;
  currentSection: CampaignSection;
}

interface SidebarSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SidebarItem[];
  color: string;
  isCollapsible?: boolean;
}

interface SidebarItem {
  label: string;
  action: () => void | Promise<void>;
  color?: string;
  bg?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
  highlight?: boolean;
}

const GMSidebar: React.FC<GMSidebarProps> = ({ onNavigate, currentSection }) => {
  const {
    campaign,
    dashboard,
    createNPC,
    createEncounter,
    addLoot,
    createSession,
    updateCampaign,
    exportCampaignData,
    canPerformAction,
    isGM,
    isPlayer
  } = useManageCampaignContext();

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [isCreatingContent, setIsCreatingContent] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  // ===========================
  // AÇÕES FUNCIONAIS REAIS
  // ===========================

  const handleCreateQuickNPC = async () => {
    if (!canPerformAction('create_npcs')) return;
    
    setIsCreatingContent(true);
    try {
      // Navegar para seção NPCs e disparar evento para criar NPC
      onNavigate('npcs');
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('create-npc-modal'));
      }, 200);
    } catch (error) {
      console.error('Erro ao criar NPC:', error);
    } finally {
      setIsCreatingContent(false);
    }
  };

  const handleCreateQuickEncounter = async () => {
    if (!canPerformAction('manage_encounters')) return;
    
    setIsCreatingContent(true);
    try {
      onNavigate('encounters');
      // Aqui você pode adicionar lógica para criar encontro
    } catch (error) {
      console.error('Erro ao criar encontro:', error);
    } finally {
      setIsCreatingContent(false);
    }
  };

  const handleQuickDiceRoll = () => {
    // Implementar sistema de rolagem rápida
    const diceResults = {
      d20: Math.floor(Math.random() * 20) + 1,
      d12: Math.floor(Math.random() * 12) + 1,
      d10: Math.floor(Math.random() * 10) + 1,
      d8: Math.floor(Math.random() * 8) + 1,
      d6: Math.floor(Math.random() * 6) + 1,
      d4: Math.floor(Math.random() * 4) + 1
    };
    
    console.log('🎲 Rolagem rápida:', diceResults);
    // Aqui você pode mostrar um toast ou modal com os resultados
  };

  const handleExportCampaign = async () => {
    try {
      const data = await exportCampaignData();
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaign?.name || 'campanha'}_export.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar campanha:', error);
    }
  };

  // ===========================
  // CONFIGURAÇÃO DAS SEÇÕES
  // ===========================

  const sidebarSections: SidebarSection[] = [
    // NAVEGAÇÃO PRINCIPAL
    {
      id: 'navigation',
      title: 'NAVEGAÇÃO',
      icon: Home,
      color: 'text-blue-400',
      isCollapsible: true,
      items: [
        { 
          label: 'Visão Geral', 
          action: () => onNavigate('overview'), 
          icon: Home,
          highlight: currentSection === 'overview'
        },
        { 
          label: 'Lista de NPCs', 
          action: () => onNavigate('npcs'), 
          icon: Users, 
          badge: dashboard?.total_npcs || 0,
          highlight: currentSection === 'npcs'
        },
        { 
          label: 'Encontros', 
          action: () => onNavigate('encounters'), 
          icon: Sword, 
          badge: dashboard?.total_encounters || 0,
          highlight: currentSection === 'encounters',
          disabled: !isGM
        },
        { 
          label: 'Histórico de Sessões', 
          action: () => onNavigate('sessions'), 
          icon: Calendar,
          badge: dashboard?.total_sessions || 0,
          highlight: currentSection === 'sessions'
        },
        { 
          label: 'Grupo de Aventureiros', 
          action: () => onNavigate('party'), 
          icon: ShieldIcon,
          badge: campaign?.players?.length || 0,
          highlight: currentSection === 'party'
        },
        { 
          label: 'Tesouro & Loot', 
          action: () => onNavigate('loot'), 
          icon: Package,
          highlight: currentSection === 'loot',
          disabled: !isGM
        },
        { 
          label: 'Mundo & Locais', 
          action: () => onNavigate('world'), 
          icon: Map,
          highlight: currentSection === 'world',
          disabled: !isGM
        }
      ].filter(item => !item.disabled) // Filtrar items desabilitados
    },

    // AÇÕES RÁPIDAS
    {
      id: 'quick_actions',
      title: 'AÇÕES RÁPIDAS',
      icon: Zap,
      color: 'text-green-400',
      isCollapsible: true,
      items: [
        { 
          label: 'Criar NPC', 
          action: handleCreateQuickNPC, 
          icon: Users,
          disabled: isCreatingContent || !isGM,
          bg: 'hover:bg-green-600/20'
        },
        { 
          label: 'Novo Encontro', 
          action: handleCreateQuickEncounter, 
          icon: Sword,
          disabled: isCreatingContent || !isGM,
          bg: 'hover:bg-red-600/20'
        },
        { 
          label: 'Registrar Sessão', 
          action: () => onNavigate('sessions'), 
          icon: Calendar,
          disabled: isCreatingContent || !isGM,
          bg: 'hover:bg-blue-600/20'
        },
        { 
          label: 'Anotação Rápida', 
          action: () => {
            // Implementar modal de anotação rápida
            console.log('Abrir modal de anotação');
          }, 
          icon: FileText,
          bg: 'hover:bg-purple-600/20'
        }
      ].filter(item => !item.disabled) // Filtrar items desabilitados
    },

    // COMBATE E SESSÃO ATIVA
    {
      id: 'combat',
      title: 'COMBATE & SESSÃO',
      icon: Sword,
      color: 'text-red-400',
      isCollapsible: true,
      items: [
        { 
          label: 'Tracker de Combate', 
          action: () => onNavigate('combat'), 
          icon: Sword, 
          badge: dashboard?.active_encounters?.length || 0,
          disabled: isCreatingContent,
          highlight: currentSection === 'combat'
        },
        { 
          label: 'Rolagem Rápida', 
          action: handleQuickDiceRoll, 
          icon: Dice6,
          bg: 'hover:bg-yellow-600/20'
        },
        { 
          label: 'Condições de Status', 
          action: () => {
            console.log('Abrir painel de condições');
            // Implementar modal de condições
          }, 
          icon: Heart,
          bg: 'hover:bg-pink-600/20'
        },
        { 
          label: 'Finalizar Combate', 
          action: () => {
            console.log('Finalizar combate ativo');
            // Implementar finalização de combate
          }, 
          icon: CheckCircle,
          disabled: !dashboard?.active_encounters?.length,
          bg: 'hover:bg-green-600/20'
        }
      ]
    },

    // MUNDO E EXPLORAÇÃO
    {
      id: 'world',
      title: 'MUNDO & EXPLORAÇÃO',
      icon: MapPin,
      color: 'text-green-400',
      isCollapsible: true,
      items: [
        { 
          label: 'Navegar Mapa', 
          action: () => onNavigate('world'), 
          icon: Map,
          highlight: currentSection === 'world'
        },
        { 
          label: 'Tempo & Clima', 
          action: () => {
            console.log('Controles de tempo e clima');
            // Implementar controles de tempo
          }, 
          icon: Clock,
          bg: 'hover:bg-blue-600/20'
        },
        { 
          label: 'Locais de Interesse', 
          action: () => {
            console.log('Gerenciar locais');
            // Implementar gestão de locais
          }, 
          icon: Target,
          bg: 'hover:bg-purple-600/20'
        },
        { 
          label: 'Viagem Rápida', 
          action: () => {
            console.log('Sistema de viagem');
            // Implementar viagem rápida
          }, 
          icon: MapPin,
          bg: 'hover:bg-indigo-600/20'
        },
        { 
          label: 'Eventos Aleatórios', 
          action: () => {
            console.log('Gerar evento aleatório');
            // Implementar eventos aleatórios
          }, 
          icon: Sparkles,
          bg: 'hover:bg-yellow-600/20'
        }
      ]
    },

    // GESTÃO E ADMINISTRAÇÃO
    {
      id: 'management',
      title: 'GESTÃO & ADMIN',
      icon: Settings,
      color: 'text-purple-400',
      isCollapsible: true,
      items: [
        { 
          label: 'Estatísticas', 
          action: () => {
            console.log('Ver estatísticas da campanha');
            // Implementar dashboard de estatísticas
          }, 
          icon: BarChart3,
          bg: 'hover:bg-indigo-600/20'
        },
        { 
          label: 'Exportar Dados', 
          action: handleExportCampaign, 
          icon: Download,
          bg: 'hover:bg-green-600/20'
        },
        { 
          label: 'Importar Conteúdo', 
          action: () => {
            console.log('Importar conteúdo');
            // Implementar importação
          }, 
          icon: Upload,
          bg: 'hover:bg-blue-600/20'
        },
        { 
          label: 'Configurações', 
          action: () => {
            console.log('Configurações da campanha');
            // Implementar configurações
          }, 
          icon: Settings,
          bg: 'hover:bg-gray-600/20'
        }
      ]
    }
  ];

  // Filtrar seções baseado nas permissões
  const visibleSections = sidebarSections.filter(section => {
    // Se não é GM, esconder seções que requerem permissões GM
    if (!isGM && ['quick_actions', 'combat', 'world', 'management'].includes(section.id)) {
      return false;
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-gray-800/30 backdrop-blur-sm">
      {/* Header da Campanha */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">
              {campaign?.name || 'Campanha'}
            </h2>
            <p className="text-sm text-gray-400 truncate">
              {isGM ? 'Mesa do Mestre' : 'Aventureiro'}
            </p>
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">
              {campaign?.players?.length || 0}
            </div>
            <div className="text-xs text-gray-400">Jogadores</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-400">
              {dashboard?.total_encounters || 0}
            </div>
            <div className="text-xs text-gray-400">Encontros</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-400">
              {dashboard?.total_npcs || 0}
            </div>
            <div className="text-xs text-gray-400">NPCs</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-400">
              {dashboard?.total_sessions || 0}
            </div>
            <div className="text-xs text-gray-400">Sessões</div>
          </div>
        </div>

        {/* Status da Sessão Ativa */}
        {dashboard?.active_encounters && dashboard.active_encounters.length > 0 && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-sm font-medium text-red-400">
                Combate Ativo
              </span>
            </div>
            <p className="text-xs text-red-300 mt-1">
              {dashboard.active_encounters.length} encontro(s) em andamento
            </p>
          </div>
        )}
      </div>

      {/* Seções de Ferramentas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {visibleSections.map((section) => (
          <div key={section.id} className="bg-gray-800/30 rounded-lg overflow-hidden">
            {/* Header da Seção */}
            <button
              onClick={() => section.isCollapsible && toggleSection(section.id)}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <section.icon className={`w-5 h-5 ${section.color}`} />
                <span className="text-sm font-semibold text-gray-300">
                  {section.title}
                </span>
              </div>
              {section.isCollapsible && (
                <div className="text-gray-500">
                  {collapsedSections.has(section.id) ? 
                    <ChevronRight className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </div>
              )}
            </button>

            {/* Items da Seção */}
            {(!section.isCollapsible || !collapsedSections.has(section.id)) && (
              <div className="p-2 space-y-1">
                {section.items.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    disabled={item.disabled}
                    className={`w-full p-2 rounded text-left text-sm transition-colors flex items-center justify-between group ${
                      item.disabled 
                        ? 'text-gray-500 cursor-not-allowed' 
                        : item.highlight 
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : `text-gray-300 hover:text-white ${item.bg || 'hover:bg-gray-700/50'}`
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon && (
                        <item.icon className={`w-4 h-4 ${
                          item.highlight ? 'text-blue-400' : ''
                        }`} />
                      )}
                      <span className={item.highlight ? 'font-medium' : ''}>
                        {item.label}
                      </span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.highlight 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer com informações da sessão */}
      <div className="p-4 border-t border-gray-700/50">
        {isCreatingContent && (
          <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-xs text-blue-400">Criando conteúdo...</span>
            </div>
          </div>
        )}
        
        <div className="text-center text-xs text-gray-500">
          <p>Sessão ativa: {dashboard?.current_session || 'Nenhuma'}</p>
          <p className="mt-1">
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GMSidebar;