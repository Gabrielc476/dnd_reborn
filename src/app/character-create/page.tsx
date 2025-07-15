// ===========================
// CAMPAIGN CHARACTER CREATE PAGE - ATUALIZADA PARA USAR NOVOS HOOKS
// src/app/campaign/[id]/create-character/page.tsx
// ===========================

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthContext } from "@/hooks/useAuth";
import { CharacterCreationProvider } from "@/hooks/useCharacterCreation";
import { useManageCampaignContext } from "@/hooks/useManageCampaign";
import { 
  Wand2, 
  AlertTriangle, 
  ArrowLeft, 
  Users, 
  Crown, 
  Loader2, 
  CheckCircle,
  XCircle
} from "lucide-react";

// Character Creation Components
import CharacterCreationWizard from "@/components/character-creation/CharacterCreationWizard";

export default function CampaignCharacterCreatePage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.id as string;
  
  const { isAuthenticated, loading: authLoading, user } = useAuthContext();
  const { 
    campaign, 
    permissions, 
    isLoading: campaignLoading,
    loadCampaign 
  } = useManageCampaignContext();

  const [error, setError] = useState<string>("");
  const [creationResult, setCreationResult] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ===========================
  // LOAD CAMPAIGN DATA
  // ===========================
  useEffect(() => {
    if (campaignId && isAuthenticated) {
      loadCampaign(campaignId);
    }
  }, [campaignId, isAuthenticated, loadCampaign]);

  // ===========================
  // AUTHENTICATION AND PERMISSION CHECKS
  // ===========================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
      return;
    }

    // Check if user has permission to create characters in this campaign
    if (!campaignLoading && campaign && user) {
      const isPlayer = campaign.players.some(p => p.user_id === user.id);
      const isGM = campaign.game_master_id === user.id;
      
      if (!isPlayer && !isGM) {
        setError("Você não tem permissão para criar personagens nesta campanha.");
        return;
      }

      // Check if player already has character in campaign
      const playerData = campaign.players.find(p => p.user_id === user.id);
      if (playerData?.character_id) {
        setError("Você já possui um personagem nesta campanha.");
        return;
      }

      // Clear any previous errors
      setError("");
    }
  }, [authLoading, isAuthenticated, campaignLoading, campaign, user, router]);

  // ===========================
  // HANDLERS
  // ===========================

  const handleCharacterComplete = (characterData: any) => {
    console.log("✅ Personagem criado com sucesso para campanha:", characterData);
    setCreationResult(characterData);
    setShowSuccess(true);
    
    // Após 3 segundos, redirecionar para a página da campanha
    setTimeout(() => {
      router.push(`/campaign/${campaignId}`);
    }, 3000);
  };

  const handleCancel = () => {
    router.push(`/campaign/${campaignId}`);
  };

  // ===========================
  // LOADING STATE
  // ===========================
  if (authLoading || campaignLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/25">
            <Users className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Carregando Campanha</h2>
              <p className="text-gray-400 text-lg">Preparando a criação de personagem...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // ERROR STATE
  // ===========================
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6 max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-500/25">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Acesso Negado</h2>
            <p className="text-gray-400 text-lg">{error}</p>
            
            <div className="space-y-2">
              <button
                onClick={() => router.push(`/campaign/${campaignId}`)}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                Voltar à Campanha
              </button>
              
              <button
                onClick={() => router.push("/campaigns")}
                className="w-full px-6 py-3 bg-gray-600/50 hover:bg-gray-500/50 text-gray-300 font-semibold rounded-xl transition-all duration-200"
              >
                Minhas Campanhas
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // SUCCESS STATE
  // ===========================
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6 max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/25">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Personagem Criado!</h2>
            <p className="text-gray-400 text-lg">
              {creationResult?.name || 'Seu personagem'} foi adicionado à campanha
            </p>
            
            {/* Campaign Info */}
            {campaign && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-left">
                <h3 className="font-semibold text-white mb-3">Campanha</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nome:</span>
                    <span className="text-white">{campaign.name}</span>
                  </div>
                  {campaign.setting && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ambientação:</span>
                      <span className="text-white">{campaign.setting}</span>
                    </div>
                  )}
                  {campaign.world_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mundo:</span>
                      <span className="text-white">{campaign.world_name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Character Summary */}
            {creationResult && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-left">
                <h3 className="font-semibold text-white mb-3">Seu Personagem</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nome:</span>
                    <span className="text-white">{creationResult.name}</span>
                  </div>
                  {creationResult.selectedRace && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Raça:</span>
                      <span className="text-white">{creationResult.selectedRace.name}</span>
                    </div>
                  )}
                  {creationResult.selectedClass && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Classe:</span>
                      <span className="text-white">{creationResult.selectedClass.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nível:</span>
                    <span className="text-white">{creationResult.level}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-gray-500 text-sm">
                Redirecionando para a campanha...
              </p>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // MAIN RENDER
  // ===========================
  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Campanha não encontrada</h2>
          <p className="text-gray-400 mb-4">A campanha solicitada não existe ou você não tem acesso.</p>
          <button
            onClick={() => router.push("/campaigns")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Voltar às Campanhas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header with campaign info */}
      <div className="bg-gray-800/50 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/campaign/${campaignId}`)}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{campaign.name}</h1>
                  <p className="text-sm text-gray-400">Criação de Personagem</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {campaign.setting && (
                <div className="text-sm text-gray-400">
                  <span className="font-medium">Ambientação:</span> {campaign.setting}
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Crown className="w-4 h-4" />
                <span>GM: {campaign.game_master_name || campaign.game_master_id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Character creation component */}
      <CharacterCreationProvider campaignId={campaignId}>
        <CharacterCreationWizard 
          onComplete={handleCharacterComplete}
          onCancel={handleCancel}
          campaignContext={{
            id: campaign.id!,
            name: campaign.name,
            setting: campaign.setting,
            world_name: campaign.world_name
          }}
        />
      </CharacterCreationProvider>
    </div>
  );
}