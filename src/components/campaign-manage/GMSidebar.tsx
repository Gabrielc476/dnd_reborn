// ===========================
// GM SIDEBAR - USANDO AÇÕES REAIS DA API
// src/components/campaign-manage/GMSidebar.tsx
// ===========================

import React, { useState } from 'react';
import { 
  Dice6,
  Sword,
  Users,
  BookOpen,
  MapPin,
  Clock,
  Bed,
  Zap,
  Plus,
  Gift,
  Map,
  Eye,
  Target,
  Crown,
  Sparkles,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Activity,
  Heart,
  Brain,
  Shield as ShieldIcon,
  Coins,
  Play,
  Pause,
  Square,
  Volume2,
  BarChart3,
  Calendar,
  MessageCircle,
  Archive,
  Download,
  Share2
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';

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
}

const GMSidebar = () => {
  const {
    campaign,
    dashboard,
    createNPC,
    createEncounter,
    addLoot,
    createSession,
    updateCampaign,
    exportCampaignData,
    canPerformAction
  } = useManageCampaignContext();

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [isCreatingContent, setIsCreatingContent] = useState(false);

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
      const npcCount = campaign?.npcs?.length || 0;
      await createNPC({
        name: `NPC Rápido ${npcCount + 1}`,
        description: 'NPC criado rapidamente durante a sessão',
        npc_type: 'neutral',
        location: campaign?.world_name || 'Localização desconhecida'
      });
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
      const encounterCount = campaign?.encounters?.length || 0;
      await createEncounter({
        name: `Encontro ${encounterCount + 1}`,
        description: 'Encontro criado durante a sessão',
        difficulty: 'medium'
      });
    } catch (error) {
      console.error('Erro ao criar encontro:', error);
    } finally {
      setIsCreatingContent(false);
    }
  };

  const handleAddQuickLoot = async () => {
    if (!canPerformAction('assign_loot')) return;
    
    setIsCreatingContent(true);
    try {
      await addLoot({
        name: 'Tesouro Encontrado',
        description: 'Item adicionado rapidamente durante a sessão',
        item_type: 'misc',
        value: Math.floor(Math.random() * 100) + 10,
        quantity: 1,
        rarity: 'common'
      });
    } catch (error) {
      console.error('Erro ao adicionar loot:', error);
    } finally {
      setIsCreatingContent(false);
    }
  };

  const handleStartNewSession = async () => {
    if (!canPerformAction('manage_sessions')) return;
    
    setIsCreatingContent(true);
    try {
      const sessionNumber = (dashboard?.total_sessions || 0) + 1;
      await createSession({
        title: `Sessão ${sessionNumber}`,
        summary: `Sessão iniciada em ${new Date().toLocaleDateString('pt-BR')}`,
        date: new Date().toISOString(),
        duration_minutes: 0
      });
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
    } finally {
      setIsCreatingContent(false);
    }
  };

  const handleQuickDiceRoll = () => {
    const result = Math.floor(Math.random() * 20) + 1;
    // Em uma implementação real, isso poderia abrir um modal ou enviar para um chat
    alert(`🎲 Rolagem: ${result}`);
  };

  const handleExportCampaign = async () => {
    try {
      const blob = await exportCampaignData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaign?.name || 'campaign'}-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar campanha:', error);
    }
  };

  // ===========================
  // CONFIGURAÇÃO DAS SEÇÕES COM AÇÕES REAIS
  // ===========================

  const sidebarSections: SidebarSection[] = [
    {
      id: 'combat',
      title: 'COMBATE',
      icon: Sword,
      color: 'text-red-400',
      isCollapsible: true,
      items: [
        { 
          label: 'Iniciar Combate', 
          action: handleCreateQuickEncounter,
          icon: Sword, 
          badge: dashboard?.active_encounters?.length || 0,
          disabled: isCreatingContent
        },
        { 
          label: 'Adicionar Inimigo', 
          action: handleCreateQuickNPC, 
          icon: Plus,
          disabled: isCreatingContent
        },
        { 
          label: 'Rolagem Rápida', 
          action: handleQuickDiceRoll, 
          icon: Dice6 
        },
        { 
          label: 'Condições de Status', 
          action: () => console.log('Abrir painel de condições'), 
          icon: Heart 
        },
        { 
          label: 'Finalizar Combate', 
          action: () => console.log('Finalizar combate ativo'), 
          icon: ShieldIcon,
          disabled: !dashboard?.active_encounters?.length
        }
      ]
    },
    {
      id: 'world',
      title: 'MUNDO & EXPLORAÇÃO',
      icon: MapPin,
      color: 'text-green-400',
      isCollapsible: true,
      items: [
        { 
          label: 'Navegar Mapa', 
          action: () => console.log('Abrir mapa interativo'), 
          icon: Map 
        },
        { 
          label: 'Tempo & Clima', 
          action: () => console.log('Controles de tempo e clima'), 
          icon: Clock 
        },
        { 
          label: 'Locais de Interesse', 
          action: () => console.log('Gerenciar locais'), 
          icon: Target 
        },
        { 
          label: 'Viagem Rápida', 
          action: () => console.log('Sistema de viagem'), 
          icon: MapPin 
        },
        { 
          label: 'Eventos Aleatórios', 
          action: () => console.log('Gerar evento aleatório'), 
          icon: Sparkles 
        }
      ]
    },
    {
      id: 'npcs',
      title: 'NPCs & SOCIAL',
      icon: Users,
      color: 'text-blue-400',
      isCollapsible: true,
      items: [
        { 
          label: 'Lista de NPCs', 
          action: () => console.log('Abrir lista de NPCs'), 
          icon: Users, 
          badge: dashboard?.total_npcs || 0
        },
        { 
          label: 'Criar NPC Rápido', 
          action: handleCreateQuickNPC, 
          icon: Plus,
          disabled: isCreatingContent
        },
        { 
          label: 'Gerador de Nomes', 
          action: () => console.log('Gerador de nomes'), 
          icon: Brain 
        },
        { 
          label: 'Relações & Facções', 
          action: () => console.log('Gerenciar relações'), 
          icon: MessageCircle 
        },
        { 
          label: 'Diálogos Rápidos', 
          action: () => console.log('Templates de diálogo'), 
          icon: Volume2 
        }
      ]
    },
    {
      id: 'loot',
      title: 'TESOURO & ECONOMIA',
      icon: Gift,
      color: 'text-yellow-400',
      isCollapsible: true,
      items: [
        { 
          label: 'Adicionar Tesouro', 
          action: handleAddQuickLoot, 
          icon: Gift,
          disabled: isCreatingContent
        },
        { 
          label: 'Distribuir Loot', 
          action: () => console.log('Distribuir loot'), 
          icon: Share2 
        },
        { 
          label: 'Gerador de Itens', 
          action: () => console.log('Gerar itens mágicos'), 
          icon: Sparkles 
        },
        { 
          label: 'Economia & Preços', 
          action: () => console.log('Tabelas de preços'), 
          icon: Coins 
        },
        { 
          label: 'Inventário do Grupo', 
          action: () => console.log('Ver inventário'), 
          icon: Archive 
        }
      ]
    },
    {
      id: 'session',
      title: 'GESTÃO DE SESSÃO',
      icon: Calendar,
      color: 'text-purple-400',
      isCollapsible: true,
      items: [
        { 
          label: 'Nova Sessão', 
          action: handleStartNewSession, 
          icon: Play,
          disabled: isCreatingContent
        },
        { 
          label: 'Pausar Sessão', 
          action: () => console.log('Pausar sessão atual'), 
          icon: Pause 
        },
        { 
          label: 'Finalizar Sessão', 
          action: () => console.log('Finalizar sessão'), 
          icon: Square 
        },
        { 
          label: 'Notas da Sessão', 
          action: () => console.log('Abrir notas'), 
          icon: FileText 
        },
        { 
          label: 'Estatísticas', 
          action: () => console.log('Ver estatísticas'), 
          icon: BarChart3 
        }
      ]
    },
    {
      id: 'tools',
      title: 'FERRAMENTAS',
      icon: Settings,
      color: 'text-gray-400',
      isCollapsible: true,
      items: [
        { 
          label: 'Exportar Campanha', 
          action: handleExportCampaign, 
          icon: Download 
        },
        { 
          label: 'Configurações', 
          action: () => console.log('Configurações da campanha'), 
          icon: Settings 
        },
        { 
          label: 'Backup Automático', 
          action: () => console.log('Configurar backup'), 
          icon: Archive 
        }
      ]
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-900/80 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center space-x-3">
          <Crown className="w-6 h-6 text-yellow-400" />
          <div>
            <h2 className="font-bold text-white">Mesa do Mestre</h2>
            <p className="text-sm text-gray-400">Controles da Sessão</p>
          </div>
        </div>
      </div>

      {/* Status da Campanha */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Status</span>
            <Activity className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-lg font-semibold text-white capitalize">
            {campaign?.status || 'Ativa'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Sessão {(dashboard?.total_sessions || 0) + 1}
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="p-4 border-b border-gray-700/50">
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
      </div>

      {/* Seções de Ferramentas */}
      <div className="p-4 space-y-4">
        {sidebarSections.map((section) => (
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
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {item.icon && <item.icon className="w-4 h-4" />}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
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

      {/* Indicador de Ação */}
      {isCreatingContent && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Criando conteúdo...</span>
        </div>
      )}
    </div>
  );
};

export default GMSidebar;