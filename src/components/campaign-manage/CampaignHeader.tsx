import React from 'react';
import { 
  Castle, 
  Settings, 
  BarChart3, 
  Dice6, 
  Sword, 
  Download, 
  X 
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';

const CampaignHeader = () => {
  const {
    campaign,
    dashboard,
    exportCampaignData,
    isGM,
    canPerformAction
  } = useManageCampaignContext();

  const handleExport = async () => {
    try {
      const blob = await exportCampaignData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaign?.name || 'campaign'}-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar campanha:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-400';
      case 'Paused':
        return 'text-yellow-400';
      case 'Completed':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Campaign Info */}
        <div className="flex items-center space-x-4">
          <Castle className="w-6 h-6 text-purple-400" />
          <div>
            <h1 className="text-xl font-bold text-white">
              {campaign?.name || 'Campanha'}
            </h1>
            <div className="flex items-center space-x-4 text-sm">
              <span className={`font-medium ${getStatusColor(campaign?.status || 'Active')}`}>
                Status: {campaign?.status || 'Active'}
              </span>
              <span className="text-gray-400">
                Jogadores: {dashboard?.total_players || 0}/{campaign?.max_players || 6}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {isGM && (
            <>
              <button
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Configurações"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline">Configurações</span>
              </button>

              <button
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Estatísticas"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline">Stats</span>
              </button>
            </>
          )}

          <button
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            title="Rolar Dados"
          >
            <Dice6 className="w-4 h-4" />
            <span className="hidden md:inline">Dados</span>
          </button>

          {isGM && (
            <>
              <button
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                title="Ataque Rápido"
              >
                <Sword className="w-4 h-4" />
                <span className="hidden md:inline">Ataque</span>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                title="Exportar Campanha"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Exportar</span>
              </button>

              <button
                className="flex items-center space-x-2 px-3 py-2 bg-red-700 hover:bg-red-800 rounded-lg transition-colors"
                title="Encerrar Campanha"
              >
                <X className="w-4 h-4" />
                <span className="hidden md:inline">Encerrar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick Status Bar */}
      {dashboard && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-700 px-3 py-2 rounded">
            <span className="text-gray-400">Sessões:</span>
            <span className="ml-2 font-medium text-white">
              {dashboard.total_sessions || 0}
            </span>
          </div>
          
          <div className="bg-gray-700 px-3 py-2 rounded">
            <span className="text-gray-400">NPCs:</span>
            <span className="ml-2 font-medium text-white">
              {dashboard.total_npcs || 0}
            </span>
          </div>
          
          <div className="bg-gray-700 px-3 py-2 rounded">
            <span className="text-gray-400">Encontros:</span>
            <span className="ml-2 font-medium text-white">
              {dashboard.total_encounters || 0}
            </span>
          </div>
          
          <div className="bg-gray-700 px-3 py-2 rounded">
            <span className="text-gray-400">XP Total:</span>
            <span className="ml-2 font-medium text-white">
              {dashboard.total_experience || 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignHeader;