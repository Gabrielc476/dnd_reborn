"use client";

import React, { useState } from 'react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import CampaignHeader from '@/components/campaign-manage/CampaignHeader';
import GMSidebar from '@/components/campaign-manage/GMSidebar';
import CombatTracker from '@/components/campaign-manage/CombatTracker';
import CampaignOverview from '@/components/campaign-manage/CampaignOverview';
import PartyOverview from '@/components/campaign-manage/PartyOverview';
import { NPCsList } from '@/components/campaign-manage/NPCsList';
import SessionsHistory from '@/components/campaign-manage/SessionsHistory';
import { 
  Shield, 
  Sparkles, 
  Crown,
  AlertTriangle,
  Loader2,
  Home,
  Users,
  Sword,
  Calendar,
  Map,
  Package
} from 'lucide-react';

// Definir as seções disponíveis
export type CampaignSection = 
  | 'overview' 
  | 'npcs' 
  | 'encounters' 
  | 'sessions' 
  | 'party' 
  | 'loot' 
  | 'world'
  | 'combat';

interface SectionConfig {
  id: CampaignSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  gmOnly?: boolean;
}

const CampaignManagerPage = () => {
  const {
    campaign,
    dashboard,
    permissions,
    isLoading,
    isGM,
    canPerformAction
  } = useManageCampaignContext();

  // Estado para controlar a seção atual
  const [currentSection, setCurrentSection] = useState<CampaignSection>('overview');

  // Configuração das seções
  const sections: SectionConfig[] = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: Home,
      component: CampaignOverview
    },
    {
      id: 'npcs',
      label: 'NPCs',
      icon: Users,
      component: NPCsList,
      gmOnly: true
    },
    {
      id: 'encounters',
      label: 'Encontros',
      icon: Sword,
      component: () => <div className="text-white">Seção de Encontros em desenvolvimento</div>,
      gmOnly: true
    },
    {
      id: 'sessions',
      label: 'Sessões',
      icon: Calendar,
      component: SessionsHistory
    },
    {
      id: 'party',
      label: 'Grupo',
      icon: Shield,
      component: PartyOverview
    },
    {
      id: 'loot',
      label: 'Tesouro',
      icon: Package,
      component: () => <div className="text-white">Seção de Tesouro em desenvolvimento</div>,
      gmOnly: true
    },
    {
      id: 'world',
      label: 'Mundo',
      icon: Map,
      component: () => <div className="text-white">Seção de Mundo em desenvolvimento</div>,
      gmOnly: true
    },
    {
      id: 'combat',
      label: 'Combate',
      icon: Sword,
      component: CombatTracker,
      gmOnly: true
    }
  ];

  // Filtrar seções baseado nas permissões
  const availableSections = sections.filter(section => 
    !section.gmOnly || isGM
  );

  // Função para navegar entre seções
  const navigateToSection = (sectionId: CampaignSection) => {
    setCurrentSection(sectionId);
  };

  // Encontrar a seção atual
  const currentSectionConfig = availableSections.find(s => s.id === currentSection);
  const CurrentSectionComponent = currentSectionConfig?.component ?? CampaignOverview;

  console.log("🎯 CampaignManagerPage render:", {
    campaign: !!campaign,
    campaignId: campaign?.id,
    campaignName: campaign?.name,
    isLoading,
    currentSection,
    availableSections: availableSections.map(s => s.id)
  });

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-500 rounded-full animate-pulse opacity-60"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-yellow-500 rounded-full animate-pulse opacity-60"></div>
            <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">Carregando Campanha...</h2>
          <p className="text-gray-300 text-lg mb-6">
            Preparando sua mesa de jogo
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>Sistema Inteligente</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Controles Seguros</span>
            </div>
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span>Mesa do Mestre</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Campanha não encontrada</h2>
            <p className="text-gray-300 text-lg">
              A campanha solicitada não existe ou você não tem permissão para acessá-la.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 flex flex-col">
          <GMSidebar onNavigate={navigateToSection} currentSection={currentSection} />
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700/50">
            <CampaignHeader />
            
            {/* Navegação por Tabs */}
            <div className="px-6 py-4">
              <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
                {availableSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => navigateToSection(section.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      currentSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Conteúdo da Seção */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <CurrentSectionComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignManagerPage;