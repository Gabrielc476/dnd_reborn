// ===========================
// DASHBOARD COMPONENT
// src/components/Dashboard.tsx
// ===========================

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Crown, 
  Users, 
  Plus, 
  Calendar, 
  BookOpen, 
  Sword, 
  Shield, 
  Sparkles,
  TrendingUp,
  Clock,
  PlayCircle,
  Edit,
  Eye,
  LogOut,
  Search,
  Filter,
  Gamepad2,
  Star,
  Zap,
  Target,
  User,
  Loader2,
  ArrowRight,
  Settings,
  Library,
  Scroll,
  Dice6
} from 'lucide-react';

// Imports das suas APIs e hooks reais
import { useAuthContext } from '@/hooks/useAuth';
import { campaignAPI } from '@/api/campaignAPI';
import { dndAPI } from '@/api/dndAPI';

// Interfaces para tipagem
interface CampaignData {
  id: string;
  name: string;
  status: string;
  player_count?: number;
  max_players?: number;
  world_name?: string;
  tags?: string[];
  total_sessions?: number;
  character_name?: string;
  character_class?: string;
  character_level?: number;
  game_master?: string;
}

interface CampaignsState {
  asMaster: CampaignData[];
  asPlayer: CampaignData[];
}

interface CompendiumStats {
  totalSpells: number;
  totalClasses: number;
  totalRaces: number;
  recentlyViewed: any[];
  status?: string;
}

// Dashboard Component usando as estruturas reais do projeto
const Dashboard: React.FC = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuthContext();
  
  // Estados do dashboard
  const [campaigns, setCampaigns] = useState<CampaignsState>({
    asMaster: [],
    asPlayer: []
  });
  const [compendiumStats, setCompendiumStats] = useState<CompendiumStats>({
    totalSpells: 0,
    totalClasses: 13,
    totalRaces: 9,
    recentlyViewed: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'master' | 'player'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Redirecionamento se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Carregamento dos dados reais das suas APIs
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setIsLoading(true);

        // Carrega campanhas do usuário usando sua API real
        const [gmCampaignsResponse, playerCampaignsResponse] = await Promise.all([
          campaignAPI.getGMCampaigns().catch(err => ({ campaigns: [], count: 0 })),
          campaignAPI.getPlayerCampaigns().catch(err => ({ campaigns: [], count: 0 }))
        ]);

        setCampaigns({
          asMaster: gmCampaignsResponse.campaigns || [],
          asPlayer: playerCampaignsResponse.campaigns || []
        });

        // Testa conexão com API D&D para estatísticas do compêndio
        try {
          const isApiHealthy = await dndAPI.healthCheck();
          if (isApiHealthy) {
            // Em produção você pode cachear essas informações
            setCompendiumStats(prev => ({
              ...prev,
              totalSpells: 300, // Você pode buscar o número real ou cachear
              status: 'online'
            }));
          }
        } catch (error) {
          console.warn('API D&D offline, usando dados locais');
          setCompendiumStats(prev => ({
            ...prev,
            status: 'offline'
          }));
        }

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, user]);

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <Sparkles className="w-8 h-8 text-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Carregando Dashboard</h2>
          <p className="text-gray-400">Preparando sua mesa de jogo...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  // Cálculos de estatísticas
  const totalActiveCampaigns = campaigns.asMaster.filter(c => c.status === 'ativo').length + 
                               campaigns.asPlayer.filter(c => c.status === 'ativo').length;

  // Handlers para navegação
  const handleCreateCampaign = () => {
    router.push('/campaign/new');
  };

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/campaign/${campaignId}`);
  };

  const handleCreateCharacter = () => {
    router.push('/character-create');
  };

  const handleCompendiumSection = (section: string) => {
    // Aqui você pode implementar navegação para seções específicas do compêndio
    console.log(`Navegando para: /compendium/${section}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">D&D Manager</h1>
                  <p className="text-gray-400 text-sm">Sua mesa de aventuras</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Busca global */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar campanhas, magias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-64"
                />
              </div>

              {/* Perfil do usuário */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.username ? user.username.slice(0, 2).toUpperCase() : 'US'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-white text-sm font-medium">
                    {user.username || user.email.split('@')[0]}
                  </p>
                  <p className="text-gray-400 text-xs">Mestre & Jogador</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Seção de boas-vindas */}
        <section className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Bem-vindo de volta, {user.username || 'Aventureiro'}!
            </h2>
            <p className="text-gray-300 text-lg">
              Pronto para mais uma sessão épica?
            </p>
          </div>

          {/* Cards de estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Campanhas Ativas</h3>
                  <p className="text-2xl font-bold text-blue-400">{totalActiveCampaigns}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Como Mestre</h3>
                  <p className="text-2xl font-bold text-purple-400">{campaigns.asMaster.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Como Jogador</h3>
                  <p className="text-2xl font-bold text-green-400">{campaigns.asPlayer.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Library className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Compêndio</h3>
                  <p className="text-2xl font-bold text-yellow-400">{compendiumStats.totalSpells}+</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ações rápidas */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={handleCreateCampaign}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-6 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <h4 className="font-semibold text-lg">Nova Campanha</h4>
                  <p className="text-white/80">Crie uma nova aventura épica</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleCreateCharacter}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-6 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <User className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <h4 className="font-semibold text-lg">Criar Personagem</h4>
                  <p className="text-white/80">Dê vida a um novo herói</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleCompendiumSection('spells')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-6 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <BookOpen className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <h4 className="font-semibold text-lg">Explorar Compêndio</h4>
                  <p className="text-white/80">Magias, monstros e mais</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Suas campanhas */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Suas Campanhas</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'overview' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('master')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'master' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                Como Mestre
              </button>
              <button
                onClick={() => setActiveTab('player')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'player' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                Como Jogador
              </button>
            </div>
          </div>

          {/* Conteúdo baseado na aba ativa */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Campanhas como Mestre */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-purple-400" />
                  <span>Como Mestre ({campaigns.asMaster.length})</span>
                </h4>
                {campaigns.asMaster.length > 0 ? (
                  <div className="space-y-4">
                    {campaigns.asMaster.slice(0, 3).map((campaign) => (
                      <div
                        key={campaign.id}
                        onClick={() => handleCampaignClick(campaign.id)}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                              {campaign.name}
                            </h5>
                            <p className="text-sm text-gray-400">
                              {campaign.player_count}/{campaign.max_players} jogadores • {campaign.status}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 border-2 border-dashed border-gray-600 rounded-lg">
                    <Crown className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhuma campanha como mestre ainda</p>
                    <button
                      onClick={handleCreateCampaign}
                      className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    >
                      Criar Primeira Campanha
                    </button>
                  </div>
                )}
              </div>

              {/* Campanhas como Jogador */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Gamepad2 className="w-5 h-5 text-green-400" />
                  <span>Como Jogador ({campaigns.asPlayer.length})</span>
                </h4>
                {campaigns.asPlayer.length > 0 ? (
                  <div className="space-y-4">
                    {campaigns.asPlayer.slice(0, 3).map((campaign) => (
                      <div
                        key={campaign.id}
                        onClick={() => handleCampaignClick(campaign.id)}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-green-500/50 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-white group-hover:text-green-400 transition-colors">
                              {campaign.name}
                            </h5>
                            <p className="text-sm text-gray-400">
                              {campaign.character_name} • Nível {campaign.character_level}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 border-2 border-dashed border-gray-600 rounded-lg">
                    <Gamepad2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhuma campanha como jogador ainda</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Procure campanhas públicas ou peça um convite
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'master' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.asMaster.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => handleCampaignClick(campaign.id)}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Crown className="w-6 h-6 text-purple-400" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'ativo' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <h5 className="font-semibold text-white group-hover:text-purple-400 transition-colors mb-2">
                    {campaign.name}
                  </h5>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>👥 {campaign.player_count}/{campaign.max_players} jogadores</p>
                    <p>🌍 {campaign.world_name || 'Mundo personalizado'}</p>
                    <p>📅 {campaign.total_sessions || 0} sessões</p>
                  </div>

                  {campaign.tags && campaign.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                      {campaign.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {campaign.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full">
                          +{campaign.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'player' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.asPlayer.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => handleCampaignClick(campaign.id)}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Gamepad2 className="w-6 h-6 text-green-400" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'ativo' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <h5 className="font-semibold text-white group-hover:text-green-400 transition-colors mb-2">
                    {campaign.name}
                  </h5>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>🎭 {campaign.character_name}</p>
                    <p>⚔️ {campaign.character_class} Nível {campaign.character_level}</p>
                    <p>👑 Mestre: {campaign.game_master}</p>
                    <p>📅 {campaign.total_sessions || 0} sessões</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Seção do Compêndio */}
        <section>
          <h3 className="text-xl font-bold text-white mb-6">Compêndio D&D</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => handleCompendiumSection('spells')}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-200 group text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                    Magias
                  </h4>
                  <p className="text-gray-400 text-sm">{compendiumStats.totalSpells}+ magias disponíveis</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleCompendiumSection('monsters')}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-red-500/50 transition-all duration-200 group text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-red-400 transition-colors">
                    Monstros
                  </h4>
                  <p className="text-gray-400 text-sm">Criaturas e bestiário completo</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleCompendiumSection('items')}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-200 group text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Sword className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                    Equipamentos
                  </h4>
                  <p className="text-gray-400 text-sm">Armas, armaduras e itens mágicos</p>
                </div>
              </div>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm mb-2">
            "A aventura começa quando você menos espera..."
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>D&D Manager v2.0</span>
            <span>•</span>
            <span>Feito para mestres e jogadores épicos</span>
            <span>•</span>
            <span>Usuário: {user.username || user.email}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;