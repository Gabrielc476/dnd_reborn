"use client";

import React from 'react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import CampaignHeader from '@/components/campaign-manage/CampaignHeader';
import GMSidebar from '@/components/campaign-manage/GMSidebar';
import CombatTracker from '@/components/campaign-manage/CombatTracker';
import CampaignOverview from '@/components/campaign-manage/CampaignOverview';
import PartyOverview from '@/components/campaign-manage/PartyOverview';

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
    permissions: !!permissions,
    permissionsRole: permissions?.role
  });

  // 🔥 CORREÇÃO: Só mostrar loading enquanto está carregando
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Carregando campanha...</div>
        </div>
      </div>
    );
  }

  // 🔥 CORREÇÃO: Só verificar se campanha não existe DEPOIS do loading terminar
  if (!isLoading && !campaign) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Campanha não encontrada</div>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // 🔥 CORREÇÃO: Verificar permissões apenas se temos campanha
  if (campaign && !canPerformAction('view_campaign')) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Você não tem permissão para acessar esta campanha</div>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // 🔥 CORREÇÃO: Se ainda não temos campanha mas não está loading, aguardar mais um pouco
  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Preparando campanha...</div>
        </div>
      </div>
    );
  }

  // Determinar se está em combate baseado no dashboard
  const isInCombat = dashboard?.active_encounter !== null;

  console.log("✅ Rendering campaign successfully:", {
    campaignName: campaign.name,
    isInCombat,
    isGM: isGM, // 🔥 CORREÇÃO: isGM é um valor, não uma função
    hasPermissions: !!permissions
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <CampaignHeader />
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar do GM */}
        {isGM && ( // 🔥 CORREÇÃO: usar isGM diretamente
          <div className="w-80 border-r border-gray-700">
            <GMSidebar />
          </div>
        )}
        
        {/* Área de conteúdo principal */}
        <div className="flex-1 flex flex-col">
          {/* Combat Tracker ou Campaign Overview */}
          <div className="flex-1 p-6">
            {isInCombat ? (
              <CombatTracker />
            ) : (
              <CampaignOverview />
            )}
          </div>
          
          {/* Party Overview */}
          <div className="border-t border-gray-700">
            <PartyOverview />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignManagerPage;