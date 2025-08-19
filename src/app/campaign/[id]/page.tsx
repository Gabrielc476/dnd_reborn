"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import SpellsPanel from '@/components/character/panels/SpellsPanel';
import CharacterPanel from '@/components/character/panels/CharacterPanel';
import AbilitesPanel from '@/components/character/panels/AbilitiesPanel';
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
import { Character } from '@/types/character';
import { characterAPI } from '@/api/characterAPI';
import InventoryPanel from '@/components/character/panels/InventoryPanel';
import AttacksPanel from '@/components/character/panels/AttacksPanel';
import ActiveEncounterPanel from '@/components/encounter/panel/EncounterPanel';
import { EncounterDetail, EncounterSummary } from '@/types/encounter';
import { campaignAPI } from '@/api/campaignAPI';

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
  const [campaignEncounters, setCampaignEncounters] = useState<EncounterDetail[]>([]);
  const [loadingEncounters, setLoadingEncounters] = useState(true);
  const [encountersError, setEncountersError] = useState<string | null>(null);
  
  // Carregar encontros completos da campanha
  const loadEncounters = async (campaignId: string) => {
    console.log(`[loadEncounters] Iniciando carregamento de encontros para campanha: ${campaignId}`);
    setLoadingEncounters(true);
    try {
      const response = await campaignAPI.getEncounters(campaignId);
      console.log("[loadEncounters] Resposta da API:", response);
      
      if (response.success && response.encounters) {
        console.log(`[loadEncounters] ${response.encounters.length} encontros carregados`);
        setCampaignEncounters(response.encounters);
      } else {
        const errorMsg = response.error || 'Erro ao carregar encontros';
        console.error(`[loadEncounters] ${errorMsg}`);
        setEncountersError(errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Erro na requisição de encontros';
      console.error(`[loadEncounters] ${errorMsg}:`, error);
      setEncountersError(errorMsg);
    } finally {
      setLoadingEncounters(false);
    }
  };

  // Log completo da campanha
  useEffect(() => {
    console.log("==================== CAMPAIGN DATA ====================");
    console.log("Campaign object:", campaign);
    
    if (campaign) {
      console.log("Campaign ID:", campaign.id);
      console.log("Campaign name:", campaign.name);
      console.log("Game Master ID:", campaign.game_master_id);
      console.log("Is GM:", isGM);
      console.log("Players count:", campaign.players?.length || 0);
      
      // Carregar encontros completos
      if (campaign.id) {
        loadEncounters(campaign.id);
      }
    }
  }, [campaign, isGM]);

  // Verificar se há um encontro ativo
  const activeEncounter = useMemo(() => {
    console.log("[activeEncounter] Verificando encontros ativos...");
    console.log("Total de encontros:", campaignEncounters.length);
    
    const active = campaignEncounters.find(e => e.is_active);
    
    if (active) {
      console.log("Encontro ativo encontrado:", {
        id: active.id,
        name: active.name,
        is_active: active.is_active,
        is_completed: active.is_completed
      });
    } else {
      console.log("Nenhum encontro ativo encontrado");
    }
    
    return active || null;
  }, [campaignEncounters]);

  // Carregar o personagem do jogador
  useEffect(() => {
    console.log("==================== PLAYER CHARACTER LOADING ====================");
    console.log("isGM:", isGM);
    console.log("User ID:", user?.id);
    console.log("Campaign ID:", campaign?.id);
    
    const fetchPlayerCharacter = async () => {
      if (!isGM && user?.id && campaign?.id) {
        console.log("Fetching player character...");
        
        try {
          const response = await characterAPI.getCampaignCharacters(campaign.id);
          console.log("Character API response:", response);
          
          if (response.success && response.characters) {
            console.log("Characters found:", response.characters.length);
            
            const userCharacter = response.characters.find(
              char => char.user_id === user.id
            );
            
            if (userCharacter) {
              console.log("Player character found:", userCharacter.name);
              setPlayerCharacter(userCharacter);
            } else {
              console.log("No character found for current user");
              setPlayerCharacter(null);
            }
          } else {
            console.log("Failed to fetch characters:", response.error);
            setPlayerCharacter(null);
          }
        } catch (error) {
          console.error("Error fetching player character:", error);
          setPlayerCharacter(null);
        }
      } else {
        console.log("Skipping player character fetch (GM or missing data)");
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
      // Renderiza ActiveEncounterPanel se houver encontro ativo
      component: () => {
        console.log("Rendering encounters section...");
        console.log("Campaign exists:", !!campaign);
        console.log("Loading encounters:", loadingEncounters);
        console.log("Encounters error:", encountersError);
        console.log("Active encounter:", activeEncounter);
        
        if (!campaign) {
          return <div className="text-white">Carregando campanha...</div>;
        }
        
        if (loadingEncounters) {
          return (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-6 w-48 bg-gray-700 rounded animate-pulse" />
                    <div className="h-6 w-24 bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-full mb-2 bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-gray-700 rounded animate-pulse" />
                  <div className="flex justify-between mt-4">
                    <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          );
        }
        
        if (encountersError) {
          return (
            <div className="bg-red-900/30 text-red-400 p-4 rounded-lg border border-red-800">
              <p>{encountersError}</p>
              <Button 
                variant="outline" 
                onClick={() => loadEncounters(campaign.id)} 
                className="mt-2 border-red-700 text-red-400 hover:bg-red-800/20"
              >
                Tentar novamente
              </Button>
            </div>
          );
        }
        
        if (activeEncounter) {
          console.log("Rendering ActiveEncounterPanel");
          return (
            <ActiveEncounterPanel 
              encounter={activeEncounter} 
              campaignId={campaign.id} 
              onEncounterUpdated={() => {
                console.log("Encounter updated - reloading data");
                loadEncounters(campaign.id);
              }}
            />
          );
        } else {
          console.log("Rendering EncountersList");
          return (
            <EncountersList 
              campaignId={campaign.id} 
              encounters={campaignEncounters}
              onEncounterUpdated={() => {
                console.log("Encounter updated - reloading data");
                loadEncounters(campaign.id);
              }}
            />
          );
        }
      },
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
      component: ({ character }) => <CharacterPanel character={character} campaignId={campaign?.id || ""}  />,
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
      component: ({ character }) => <SpellsPanel character={character} />,
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
      component: ({ character }) => <InventoryPanel character={character}/>,
      playerOnly: true
    },
    {
      id: 'abilities',
      label: 'Habilidades',
      icon: Sparkles,
      component: ({ character }) => <AbilitesPanel character={character}/>,
      playerOnly: true
    },
    {
      id: 'attacks',
      label: 'Ataques',
      icon: Sword,
      component: ({ character }) => <AttacksPanel character={character}/>,
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
    console.log("Campaign loading...");
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
    console.log("Campaign not found");
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

  console.log("Rendering campaign page with section:", currentSection);
  console.log("Available sections:", availableSections.map(s => s.id));

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
                    onClick={() => {
                      console.log("Navigating to section:", section.id);
                      setCurrentSection(section.id);
                    }}
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
              <>
                <div className="hidden">
                  {/* Debug info */}
                  Current section: {currentSectionConfig.id} | 
                  Component: {currentSectionConfig.component.name}
                </div>
                <currentSectionConfig.component character={isGM ? null : playerCharacter} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignManagerPage;