// ===========================
// CAMPAIGN MANAGER PAGE - UI APRIMORADA
// src/app/campaign/[id]/page.tsx
// ===========================

"use client";

import React from 'react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import CampaignHeader from '@/components/campaign-manage/CampaignHeader';
import GMSidebar from '@/components/campaign-manage/GMSidebar';
import CombatTracker from '@/components/campaign-manage/CombatTracker';
import CampaignOverview from '@/components/campaign-manage/CampaignOverview';
import PartyOverview from '@/components/campaign-manage/PartyOverview';
import { 
  Shield, 
  Sparkles, 
  Crown,
  AlertTriangle,
  Loader2 
} from 'lucide-react';

const CampaignManagerPage = () => {
  const {
    campaign,
    dashboard,
    permissions,
    isLoading,
    isGM,
    canPerformAction
  } = useManageCampaignContext();

  console.log("🎯 CampaignManagerPage render:", {
    campaign: !!campaign,
    campaignId: campaign?.id,
    campaignName: campaign?.name,
    isLoading,
    permissions: !permissions
  });

  // Loading State - Seguindo o padrão das outras páginas
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

  // Error State - Seguindo o padrão das outras páginas
  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="relative inline-block mb-6">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-500 rounded-full animate-pulse opacity-60"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-orange-500 rounded-full animate-pulse opacity-60"></div>
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Campanha Não Encontrada</h2>
            <p className="text-gray-400 text-lg">
              A campanha solicitada não existe ou você não tem permissão para acessá-la
            </p>
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Background Effects - Similar ao character creation */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10" />
      <div className="fixed top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
      <div className="fixed top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
      <div className="fixed -bottom-8 left-20 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />

      {/* Header - Seguindo o padrão estabelecido */}
      <CampaignHeader />
      
      <div className="relative z-10 flex">
        {/* Sidebar do GM - Seguindo o padrão das outras páginas */}
        {isGM && (
          <div className="w-80 min-h-screen bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50">
            <GMSidebar />
          </div>
        )}
        
        {/* Área de conteúdo principal */}
        <div className="flex-1 min-h-screen flex flex-col bg-gray-900/50 backdrop-blur-sm">
          {/* Combat Tracker ou Campaign Overview */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {/* Hero Section personalizada - Similar ao campaign/new */}
              <section className="relative mb-8">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-500 rounded-full animate-pulse opacity-60"></div>
                    <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-yellow-500 rounded-full animate-pulse opacity-60"></div>
                    <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Mesa de {campaign.name}
                  </h1>
                  
                  <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                    {isGM ? 'Gerencie sua campanha com controle total' : 'Bem-vindo à aventura'}
                  </p>

                  {/* Status da campanha */}
                  <div className="inline-flex items-center space-x-4 px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-300 text-sm">
                        Status: <strong>{campaign.status || 'Ativo'}</strong>
                      </span>
                    </div>
                    <div className="w-px h-4 bg-blue-500/30"></div>
                    <div className="text-blue-300 text-sm">
                      {isGM ? 'Mestre' : 'Jogador'}
                    </div>
                  </div>

                  {/* Indicadores de qualidade */}
                  <div className="flex items-center justify-center space-x-8 text-sm text-gray-400 mt-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                      <span>Sistema Avançado</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      <span>Controles Inteligentes</span>
                    </div>
                    {isGM && (
                      <div className="flex items-center space-x-2">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span>Ferramentas do Mestre</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Conteúdo principal */}
              {/* Se estiver em combate, mostra o Combat Tracker */}
              {/* Caso contrário, mostra o Campaign Overview */}
              <CampaignOverview />
            </div>
          </div>
          
          {/* Party Overview - Agora colapsável e não fixado */}
          <PartyOverview />
        </div>
      </div>

      {/* Footer inspiracional - Similar ao campaign/new */}
      <footer className="relative z-10 border-t border-gray-700/50 bg-gray-900/80 backdrop-blur-sm py-6">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="text-gray-400 text-sm mb-2">
            "Cada sessão é uma nova página na história que vocês estão escrevendo juntos."
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>Campanha: <strong className="text-gray-400">{campaign.name}</strong></span>
            <span>•</span>
            <span>{isGM ? 'Mesa do Mestre' : 'Área do Jogador'}</span>
            <span>•</span>
            <span>D&D Manager v2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CampaignManagerPage;