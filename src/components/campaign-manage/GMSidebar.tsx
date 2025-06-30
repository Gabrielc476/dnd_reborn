// ===========================
// GM SIDEBAR - UI MELHORADA
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
  Coins
} from 'lucide-react';

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
  action: () => void;
  color?: string;
  bg?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const GMSidebar = () => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  // Configuração das seções principais
  const sidebarSections: SidebarSection[] = [
    {
      id: 'combat',
      title: 'COMBATE',
      icon: Sword,
      color: 'text-red-400',
      isCollapsible: true,
      items: [
        { label: 'Iniciar Combate', action: () => {}, icon: Sword, badge: 'NEW' },
        { label: 'Adicionar Inimigo', action: () => {}, icon: Plus },
        { label: 'Rolagem de Iniciativa', action: () => {}, icon: Dice6 },
        { label: 'Condições de Status', action: () => {}, icon: Heart },
        { label: 'Finalizar Combate', action: () => {}, icon: ShieldIcon }
      ]
    },
    {
      id: 'world',
      title: 'MUNDO & EXPLORAÇÃO',
      icon: MapPin,
      color: 'text-green-400',
      isCollapsible: true,
      items: [
        { label: 'Navegar Mapa', action: () => {}, icon: Map },
        { label: 'Tempo & Clima', action: () => {}, icon: Clock },
        { label: 'Locais de Interesse', action: () => {}, icon: Target },
        { label: 'Viagem Rápida', action: () => {}, icon: MapPin },
        { label: 'Eventos Aleatórios', action: () => {}, icon: Sparkles }
      ]
    },
    {
      id: 'npcs',
      title: 'NPCs & SOCIAL',
      icon: Users,
      color: 'text-blue-400',
      isCollapsible: true,
      items: [
        { label: 'Lista de NPCs', action: () => {}, icon: Users, badge: '12' },
        { label: 'Criar NPC Rápido', action: () => {}, icon: Plus },
        { label: 'Interações Sociais', action: () => {}, icon: Brain },
        { label: 'Relações & Facções', action: () => {}, icon: Activity },
        { label: 'Gerador de Nome', action: () => {}, icon: Sparkles }
      ]
    },
    {
      id: 'story',
      title: 'NARRATIVA',
      icon: BookOpen,
      color: 'text-purple-400',
      isCollapsible: true,
      items: [
        { label: 'Anotações da Sessão', action: () => {}, icon: FileText },
        { label: 'Arcos de História', action: () => {}, icon: BookOpen },
        { label: 'Secrets & Clues', action: () => {}, icon: Eye },
        { label: 'Handouts & Props', action: () => {}, icon: Gift },
        { label: 'Cronologia', action: () => {}, icon: Clock }
      ]
    }
  ];

  // Ações instantâneas
  const quickActions = [
    { label: 'Rolagem Rápida', icon: Dice6, action: () => {}, color: 'bg-red-600 hover:bg-red-700' },
    { label: 'Adicionar XP', icon: Sparkles, action: () => {}, color: 'bg-yellow-600 hover:bg-yellow-700' },
    { label: 'Level Milestone', icon: Crown, action: () => {}, color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Loot Instantâneo', icon: Coins, action: () => {}, color: 'bg-green-600 hover:bg-green-700' }
  ];

  // Ações de sessão
  const sessionActions = [
    { label: 'Pausar Sessão', icon: Clock, action: () => {} },
    { label: 'Salvar Estado', icon: FileText, action: () => {} },
    { label: 'Notas Rápidas', icon: Plus, action: () => {} },
    { label: 'Recap Anterior', icon: BookOpen, action: () => {} }
  ];

  // Ações de descanso
  const restActions = [
    { label: 'Descanso Curto', icon: Clock, action: () => {} },
    { label: 'Descanso Longo', icon: Bed, action: () => {} },
    { label: 'Status Descanso', icon: Eye, action: () => {} },
    { label: 'Restaurar Slots', icon: Zap, action: () => {} }
  ];

  // Ações de criação
  const creationActions = [
    { label: 'NPC Rápido', icon: Plus, action: () => {} },
    { label: 'Encontro Instantâneo', icon: Zap, action: () => {} },
    { label: 'Loot Aleatório', icon: Gift, action: () => {} },
    { label: 'Gerar Mapa', icon: Map, action: () => {} }
  ];

  return (
    <div className="h-full bg-gray-800/80 backdrop-blur-sm overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header do Sidebar */}
        <div className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30">
          <div className="flex items-center space-x-3 mb-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Mesa do Mestre</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Controles avançados para gerenciar sua campanha
          </p>
        </div>

        {/* Seções Principais */}
        {sidebarSections.map((section) => (
          <div key={section.id} className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-4 border border-gray-600/20">
            <button
              onClick={() => section.isCollapsible && toggleSection(section.id)}
              className="flex items-center justify-between w-full mb-3 group"
            >
              <div className="flex items-center space-x-2">
                <section.icon className={`w-5 h-5 ${section.color}`} />
                <h3 className={`text-sm font-semibold ${section.color} uppercase tracking-wide`}>
                  {section.title}
                </h3>
              </div>
              
              {section.isCollapsible && (
                <div className="text-gray-400 group-hover:text-white transition-colors">
                  {collapsedSections.has(section.id) ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </button>
            
            {(!section.isCollapsible || !collapsedSections.has(section.id)) && (
              <div className="space-y-1">
                {section.items.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-600/50 hover:text-white flex items-center justify-between group"
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

        {/* Ações Instantâneas */}
        <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-4 border border-gray-600/20">
          <div className="flex items-center space-x-2 mb-3">
            <Dice6 className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide">
              AÇÕES INSTANTÂNEAS
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} p-3 rounded-lg transition-all duration-200 flex flex-col items-center space-y-1 text-white`}
              >
                <action.icon className="w-4 h-4" />
                <span className="text-xs text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gerenciamento de Sessão */}
        <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-4 border border-gray-600/20">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">
              GERENC. SESSÃO
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {sessionActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center space-x-2 px-2 py-2 bg-gray-600/50 hover:bg-gray-600 rounded-lg text-xs transition-colors text-gray-300 hover:text-white"
              >
                <action.icon className="w-3 h-3" />
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gerenciamento de Descanso */}
        <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-4 border border-gray-600/20">
          <div className="flex items-center space-x-2 mb-3">
            <Bed className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wide">
              GERENC. DESCANSO
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {restActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center space-x-2 px-2 py-2 bg-gray-600/50 hover:bg-gray-600 rounded-lg text-xs transition-colors text-gray-300 hover:text-white"
              >
                <action.icon className="w-3 h-3" />
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Criação Rápida */}
        <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-4 border border-gray-600/20">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide">
              CRIAÇÃO RÁPIDA
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {creationActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center space-x-2 px-2 py-2 bg-gray-600/50 hover:bg-gray-600 rounded-lg text-xs transition-colors text-gray-300 hover:text-white"
              >
                <action.icon className="w-3 h-3" />
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Configurações */}
        <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-4 border border-gray-600/20">
          <button className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-600/50 hover:bg-gray-600 rounded-lg transition-colors text-gray-300 hover:text-white">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Configurações Avançadas</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GMSidebar;