"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { useAuthContext } from '@/hooks/useAuth';
import CampaignHeader from '@/components/campaign-manage/gm/CampaignHeader';
import GMSidebar from '@/components/campaign-manage/gm/GMSidebar';
import PlayerSidebar from '@/components/campaign-manage/player/PlayerSidebar';
import CombatTracker from '@/components/campaign-manage/gm/CombatTracker';
import CampaignOverview from '@/components/campaign-manage/gm/CampaignOverview';
import PartyOverview from '@/components/campaign-manage/gm/PartyOverview';
import { NPCsList } from '@/components/campaign-manage/gm/NPCsList';
import SessionsHistory from '@/components/campaign-manage/gm/SessionsHistory';
import CharactersList from '@/components/campaign-manage/gm/CharactersList';
import EncountersList from '@/components/campaign-manage/gm/EncountersList';
import AttributesPanel from '@/components/character/panels/AttributesPanel';
import SkillsPanel from '@/components/character/panels/SkillsPanel';
import SpellsPanel from '@/components/character/panels/SpellsPanel'; // Importando o SpellsPanel
import { 
  Shield, 
  Sparkles, 
  AlertTriangle,
  Home,
  Users,
  Sword,
  Calendar,
  Map,
  Package,
  User,
  Activity,
} from 'lucide-react';
import { Character } from '@/api/characterAPI';
import { characterAPI } from '@/api/characterAPI';

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

export type PlayerSection = 
  | 'overview' 
  | 'character'
  | 'party' 
  | 'sessions' 
  | 'loot'
  | 'notes'
  | 'attributes'
  | 'spells'
  | 'skills'
  | 'inventory'
  | 'abilities'
  | 'attacks';

interface SectionConfig {
  id: CampaignSection | PlayerSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<{ character?: Character | null }>;
  gmOnly?: boolean;
  playerOnly?: boolean;
}

const CampaignManagerPage = () => {
  const router = useRouter();
  const {
    campaign,
    isLoading,
    isGM
  } = useManageCampaignContext();

  const { user } = useAuthContext();
  const [currentSection, setCurrentSection] = useState<CampaignSection | PlayerSection>('overview');
  const [playerCharacter, setPlayerCharacter] = useState<Character | null>(null);

  // Carregar o personagem do jogador
  useEffect(() => {
    const fetchPlayerCharacter = async () => {
      if (!isGM && user?.id && campaign?.id) {
        try {
          const response = await characterAPI.getCampaignCharacters(campaign.id);
          
          if (response.success && response.characters) {
            const userCharacter = response.characters.find(
              char => char.user_id === user.id
            );
            
            if (userCharacter) {
              setPlayerCharacter(userCharacter);
            } else {
              setPlayerCharacter(null);
            }
          } else {
            setPlayerCharacter(null);
          }
        } catch (error) {
          setPlayerCharacter(null);
        }
      } else {
        setPlayerCharacter(null);
      }
    };

    fetchPlayerCharacter();
  }, [isGM, user?.id, campaign?.id]);

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
      gmOnly: true
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
      component: () => campaign ? 
        <EncountersList campaignId={campaign.id} /> : 
        <div className="text-white">Carregando...</div>,
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
    },
    // Seções para jogadores
    {
      id: 'character',
      label: 'Meu Personagem',
      icon: User,
      component: ({ character }) => (
        <div className="text-white">
          <h2 className="text-2xl font-bold mb-4">Detalhes do Personagem</h2>
          <pre className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-[400px]">
            {JSON.stringify(character, null, 2)}
          </pre>
        </div>
      ),
      playerOnly: true
    },
    {
      id: 'attributes',
      label: 'Atributos',
      icon: () => <div className="w-5 h-5 flex items-center justify-center">STR</div>,
      component: ({ character }) => <AttributesPanel character={character} />,
      playerOnly: true
    },
    {
      id: 'spells',
      label: 'Magias',
      icon: Sparkles,
      component: ({ character }) => <SpellsPanel character={character} />, // Usando o SpellsPanel
      playerOnly: true
    },
    {
      id: 'skills',
      label: 'Perícias',
      icon: Activity,
      component: ({ character }) => <SkillsPanel character={character} />,
      playerOnly: true
    },
    {
      id: 'inventory',
      label: 'Inventário',
      icon: Package,
      component: ({ character }) => <div className="text-white">Inventário de {character?.name || "Personagem"}</div>,
      playerOnly: true
    },
    {
      id: 'abilities',
      label: 'Habilidades',
      icon: Sparkles,
      component: ({ character }) => <div className="text-white">Habilidades de {character?.name || "Personagem"}</div>,
      playerOnly: true
    },
    {
      id: 'attacks',
      label: 'Ataques',
      icon: Sword,
      component: ({ character }) => <div className="text-white">Ataques de {character?.name || "Personagem"}</div>,
      playerOnly: true
    }
  ];

  const availableSections = sections.filter(section => {
    if (isGM) {
      return !section.playerOnly;
    } else {
      return !section.gmOnly;
    }
  });

  const currentSectionConfig = availableSections.find(s => s.id === currentSection);

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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 flex h-screen">
        <div className="w-80 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 flex flex-col">
          {isGM ? (
            <GMSidebar 
              onNavigate={setCurrentSection} 
              currentSection={currentSection as CampaignSection} 
            />
          ) : (
            <PlayerSidebar 
              onNavigate={setCurrentSection} 
              currentSection={currentSection as PlayerSection}
              character={playerCharacter}
            />
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700/50">
            <CampaignHeader />
            
            {/* Tabs visíveis para todos os usuários */}
            <div className="px-6 py-4">
              <div className="flex flex-wrap gap-1 bg-gray-800/50 rounded-lg p-1">
                {availableSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(section.id)}
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

          <div className="flex-1 overflow-y-auto p-6">
            {currentSectionConfig && (
              <currentSectionConfig.component character={isGM ? null : playerCharacter} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignManagerPage;