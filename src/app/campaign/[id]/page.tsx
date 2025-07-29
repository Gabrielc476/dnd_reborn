"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { useAuthContext } from '@/hooks/useAuth';
import CampaignHeader from '@/components/campaign-manage/gm/CampaignHeader';
import GMSidebar from '@/components/campaign-manage/gm/GMSidebar';
import PlayerSidebar from '@/components/campaign-manage/player/PlayerSidebar'; // Importe o PlayerSidebar
import CombatTracker from '@/components/campaign-manage/gm/CombatTracker';
import CampaignOverview from '@/components/campaign-manage/gm/CampaignOverview';
import PartyOverview from '@/components/campaign-manage/gm/PartyOverview';
import { NPCsList } from '@/components/campaign-manage/gm/NPCsList';
import SessionsHistory from '@/components/campaign-manage/gm/SessionsHistory';
import CharactersList from '@/components/campaign-manage/gm/CharactersList';
import EncountersList from '@/components/campaign-manage/gm/EncountersList';
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
  Package,
  User,
  Settings,
  UserPlus,
  Heart
} from 'lucide-react';

// Definir as seções disponíveis
export type CampaignSection = 
  | 'overview' 
  | 'characters'
  | 'npcs' 
  | 'encounters' 
  | 'sessions' 
  | 'party' 
  | 'loot' 
  | 'world'
  | 'combat';

// Definir as seções para jogadores
export type PlayerSection = 
  | 'overview' 
  | 'character'
  | 'party' 
  | 'sessions' 
  | 'loot'
  | 'notes';

interface SectionConfig {
  id: CampaignSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  gmOnly?: boolean;
}

// ===========================
// COMPONENTE PRINCIPAL DA PÁGINA
// ===========================

const CampaignManagerPage = () => {
  const router = useRouter();
  const {
    campaign,
    isLoading,
    isGM
  } = useManageCampaignContext();

  const { user } = useAuthContext();

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
      id: 'characters',
      label: 'Personagens',
      icon: User,
      component: CharactersList,
      gmOnly: false // Apenas GM vê todos os personagens
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
      component: () => campaign ? <EncountersList campaignId={campaign.id} /> : <div className="text-white">Carregando...</div>,
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

  // Função para navegação de jogadores
  const navigatePlayerSection = (playerSection: PlayerSection) => {
    // Mapear seções de jogador para seções da campanha
    switch (playerSection) {
      case 'character':
        setCurrentSection('characters');
        break;
      default:
        setCurrentSection(playerSection as CampaignSection);
    }
  };

  // Encontrar a seção atual
  const currentSectionConfig = availableSections.find(s => s.id === currentSection);
  const CurrentSectionComponent = currentSectionConfig?.component ?? CampaignOverview;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-white mb-2">Carregando Campanha</h2>
          <p className="text-gray-400">Preparando os dados da campanha...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Campanha Não Encontrada</h2>
          <p className="text-gray-400 mb-6">
            A campanha solicitada não foi encontrada ou você não tem permissão para acessá-la.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200"
          >
            Voltar ao Dashboard
          </button>
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
        {/* Sidebar: GM ou Player */}
        <div className="w-80 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 flex flex-col">
          {isGM ? (
            <GMSidebar onNavigate={navigateToSection} currentSection={currentSection} />
          ) : (
            <PlayerSidebar 
              onNavigate={navigatePlayerSection} 
              currentSection={currentSection as PlayerSection} 
            />
          )}
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700/50">
            <CampaignHeader />
            
            {/* Navegação por Tabs */}
            <div className="px-6 py-4">
              <div className="flex flex-wrap gap-1 bg-gray-800/50 rounded-lg p-1">
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
          <div className="flex-1 overflow-y-auto p-6">
            <CurrentSectionComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignManagerPage;