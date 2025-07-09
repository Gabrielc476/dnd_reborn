"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { useAuthContext } from '@/hooks/useAuth';
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
  Package,
  User,
  Settings,
  UserPlus
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

interface SectionConfig {
  id: CampaignSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  gmOnly?: boolean;
}

// ===========================
// COMPONENTE DE LISTA DE PERSONAGENS
// ===========================

const CharactersList = () => {
  const {
    campaign,
    dashboard,
    permissions,
    isGM,
    canPerformAction
  } = useManageCampaignContext();

  const router = useRouter();
  const params = useParams();
  const campaignId = params?.id as string;
  const { user } = useAuthContext();

  const [characters, setCharacters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCharacters();
  }, [campaign?.players]);

  const loadCharacters = async () => {
    if (!campaign?.players) return;
    
    setIsLoading(true);
    try {
      // TODO: Implementar busca real de personagens
      // const charactersData = await Promise.all(
      //   campaign.players
      //     .filter(p => p.character_id)
      //     .map(p => characterAPI.getCharacterById(p.character_id))
      // );
      
      // Por enquanto, dados simulados
      const simulatedCharacters = campaign.players
        .filter(p => p.character_id)
        .map((p, index) => ({
          id: p.character_id,
          name: `Personagem ${index + 1}`,
          class: 'Guerreiro',
          level: 1,
          race: 'Humano',
          player_name: `Jogador ${index + 1}`,
          user_id: p.user_id,
          current_hp: 10,
          max_hp: 10,
          armor_class: 16,
          is_active: p.is_active
        }));
      
      setCharacters(simulatedCharacters);
    } catch (error) {
      console.error('Erro ao carregar personagens:', error);
      setCharacters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCharacter = () => {
    router.push(`/campaign/${campaignId}/create-character`);
  };

  // Verificar se o usuário atual pode criar personagem
  const canCreateCharacter = () => {
    if (!user || !campaign) return false;
    
    const isPlayer = campaign.players.some(p => p.user_id === user.id);
    const playerData = campaign.players.find(p => p.user_id === user.id);
    
    // GM sempre pode criar personagens (para testes/NPCs)
    if (isGM) return true;
    
    // Jogador pode criar se não tem personagem ainda
    return isPlayer && !playerData?.character_id;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Carregando personagens...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Personagens da Campanha</h2>
          <p className="text-gray-400">
            {characters.length} de {campaign?.max_players || 0} personagens criados
          </p>
        </div>
        
        {canCreateCharacter() && (
          <button
            onClick={handleCreateCharacter}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Criar Personagem
          </button>
        )}
      </div>

      {/* Lista de Personagens */}
      {characters.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum Personagem Criado</h3>
          <p className="text-gray-400 mb-6">
            {isGM 
              ? "Os jogadores ainda não criaram personagens para esta campanha."
              : "Você ainda não criou um personagem para esta campanha."
            }
          </p>
          {canCreateCharacter() && (
            <button
              onClick={handleCreateCharacter}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              Criar Primeiro Personagem
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <div
              key={character.id}
              className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 hover:bg-gray-800/70 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{character.name}</h3>
                  <p className="text-sm text-gray-400">
                    {character.race} {character.class} - Nível {character.level}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    character.is_active ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-xs text-gray-400">
                    {character.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <User className="w-4 h-4" />
                  <span>Jogador: {character.player_name}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>{character.current_hp}/{character.max_hp}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>CA {character.armor_class}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm">
                  Ver Detalhes
                </button>
                {isGM && (
                  <button className="px-3 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estatísticas */}
      {characters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Personagens Ativos</p>
                <p className="text-xl font-bold text-white">
                  {characters.filter(c => c.is_active).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Nível Médio</p>
                <p className="text-xl font-bold text-white">
                  {characters.length > 0 
                    ? Math.round(characters.reduce((sum, c) => sum + c.level, 0) / characters.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Crown className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Vagas Restantes</p>
                <p className="text-xl font-bold text-white">
                  {(campaign?.max_players || 0) - characters.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===========================
// COMPONENTE PRINCIPAL DA PÁGINA
// ===========================

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
      id: 'characters',
      label: 'Personagens',
      icon: User,
      component: CharactersList
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
    currentSection,
    isGM,
    isLoading
  });

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
            onClick={() => window.location.href = '/dashboard'}
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