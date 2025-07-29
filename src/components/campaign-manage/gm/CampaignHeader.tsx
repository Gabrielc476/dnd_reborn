// ===========================
// CAMPAIGN HEADER - UI CONSISTENTE (shadcn refactor)
// src/components/campaign-manage/CampaignHeader.tsx
// ===========================

import React from 'react';
import { 
  Castle, 
  Settings, 
  BarChart3, 
  Dice6, 
  Sword, 
  Download, 
  X,
  Crown,
  Shield,
  Users,
  Calendar,
  Trophy,
  LogOut
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { useAuthContext } from '@/hooks/useAuth';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';

const CampaignHeader = () => {
  const {
    campaign,
    dashboard,
    exportCampaignData,
    isGM,
    canPerformAction
  } = useManageCampaignContext();

  const { user, logout } = useAuthContext();

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
      case 'Active': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Paused': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Completed': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatUserName = () => {
    if (!user?.username) return 'Usuário';
    return user.username.charAt(0).toUpperCase() + user.username.slice(1);
  };

  return (
    <Card className="bg-gray-800 border-b border-gray-700 rounded-none relative z-20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          {/* Campaign Info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Castle className="w-8 h-8 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
            
            <div>
              <CardTitle className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-white">
                  {campaign?.name || 'Campanha'}
                </span>
                <Badge className={`px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor(campaign?.status || 'Active')}`}>
                  {campaign?.status || 'Active'}
                </Badge>
              </CardTitle>
              
              <CardDescription className="flex items-center space-x-4 mt-1 text-sm">
                <span className="text-gray-400">
                  Sistema: <span className="text-blue-400 font-medium">D&D 5e</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">
                  Criada em: <span className="text-gray-300">
                    {campaign?.created_at ? new Date(campaign.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </span>
              </CardDescription>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              {/* Role Badge */}
              {isGM ? (
                <Badge className="flex items-center space-x-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-400 font-semibold text-sm">Mestre</span>
                </Badge>
              ) : (
                <Badge className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="text-blue-400 font-semibold text-sm">Jogador</span>
                </Badge>
              )}

              {/* User Name */}
              <div className="text-right">
                <div className="text-white font-medium">{formatUserName()}</div>
                <div className="text-gray-400 text-xs">{user?.email}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isGM && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost"
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-300" />
                        <span className="hidden md:inline text-gray-300">Config</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Configurações</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost"
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 text-gray-300" />
                        <span className="hidden md:inline text-gray-300">Dashboard</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Dashboard</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost"
                        className="flex items-center space-x-2 px-3 py-2 bg-green-700 hover:bg-green-800 rounded-lg transition-colors"
                        onClick={handleExport}
                      >
                        <Download className="w-4 h-4 text-gray-300" />
                        <span className="hidden md:inline text-gray-300">Exportar</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Exportar Campanha</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost"
                        className="flex items-center space-x-2 px-3 py-2 bg-red-700 hover:bg-red-800 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-300" />
                        <span className="hidden md:inline text-gray-300">Encerrar</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Encerrar Campanha</TooltipContent>
                  </Tooltip>
                </>
              )}

              {/* Logout */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost"
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                    onClick={logout}
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sair</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Quick Status Bar */}
      {dashboard && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Card className="bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/30">
              <CardContent className="flex items-center space-x-2 p-3">
                <Calendar className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-xs text-gray-400">Sessões</div>
                  <div className="font-semibold text-white">{dashboard.total_sessions || 0}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/30">
              <CardContent className="flex items-center space-x-2 p-3">
                <Users className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-xs text-gray-400">NPCs</div>
                  <div className="font-semibold text-white">{dashboard.total_npcs || 0}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/30">
              <CardContent className="flex items-center space-x-2 p-3">
                <Sword className="w-4 h-4 text-red-400" />
                <div>
                  <div className="text-xs text-gray-400">Encontros</div>
                  <div className="font-semibold text-white">{dashboard.total_encounters || 0}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/30">
              <CardContent className="flex items-center space-x-2 p-3">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <div>
                  <div className="text-xs text-gray-400">XP Total</div>
                  <div className="font-semibold text-white">{dashboard.total_experience?.toLocaleString() || 0}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/30">
              <CardContent className="flex items-center space-x-2 p-3">
                <Dice6 className="w-4 h-4 text-green-400" />
                <div>
                  <div className="text-xs text-gray-400">Última Sessão</div>
                  <div className="font-semibold text-white text-xs">
                    {dashboard.last_session ? new Date(dashboard.last_session).toLocaleDateString('pt-BR') : 'Nunca'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/30">
              <CardContent className="flex items-center space-x-2 p-3">
                <Shield className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs text-gray-400">Nível Médio</div>
                  <div className="font-semibold text-white">{dashboard.average_level || 1}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default CampaignHeader;