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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando campanha...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Campanha não encontrada</div>
      </div>
    );
  }

  if (!canPerformAction('view_campaign')) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Você não tem permissão para acessar esta campanha</div>
      </div>
    );
  }

  // Determinar se está em combate baseado no dashboard
  const isInCombat = dashboard?.active_encounter !== null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <CampaignHeader />
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar do GM */}
        {isGM() && (
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