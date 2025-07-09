// ===========================
// CRIAÇÃO DE PERSONAGEM VINCULADA À CAMPANHA
// src/app/campaign/[id]/create-character/page.tsx
// ===========================

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthContext } from "@/hooks/useAuth";
import { CharacterCreationProvider } from "@/hooks/useCharacterCreation";
import { useManageCampaignContext } from "@/hooks/useManageCampaign";
import { Wand2, AlertTriangle, ArrowLeft, Users, Crown } from "lucide-react";

// Character Creation Components
import CharacterCreationWizard from "@/components/character-creation/CharacterCreationWizard";

interface CampaignCharacterCreatePageProps {
  params: {
    id: string;
  };
}

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

  // ===========================
  // CARREGAR DADOS DA CAMPANHA
  // ===========================
  useEffect(() => {
    if (campaignId && isAuthenticated) {
      loadCampaign(campaignId);
    }
  }, [campaignId, isAuthenticated, loadCampaign]);

  // ===========================
  // VERIFICAÇÕES DE AUTENTICAÇÃO E PERMISSÃO
  // ===========================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
      return;
    }

    // Verificar se o usuário tem permissão para criar personagens nesta campanha
    if (!campaignLoading && campaign && user) {
      const isPlayer = campaign.players.some(p => p.user_id === user.id);
      const isGM = campaign.game_master_id === user.id;
      
      if (!isPlayer && !isGM) {
        setError("Você não tem permissão para criar personagens nesta campanha.");
        return;
      }

      // Verificar se o jogador já tem personagem na campanha
      const playerData = campaign.players.find(p => p.user_id === user.id);
      if (playerData?.character_id) {
        setError("Você já possui um personagem nesta campanha.");
        return;
      }
    }
  }, [isAuthenticated, authLoading, campaign, campaignLoading, user, router]);

  // ===========================
  // ESTADOS DE LOADING
  // ===========================
  if (authLoading || campaignLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/25">
            <Wand2 className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <div className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Carregando Campanha</h2>
              <p className="text-gray-400 text-lg">Verificando permissões e dados da campanha...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // ESTADOS DE ERRO
  // ===========================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6 max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-500/25">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Acesso Necessário</h2>
            <p className="text-gray-400 text-lg">
              Você precisa estar logado para criar personagens
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6 max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-500/25">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Acesso Negado</h2>
            <p className="text-gray-400 text-lg">{error}</p>
            <button
              onClick={() => router.push(`/campaign/${campaignId}`)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para a Campanha
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6 max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/25">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Campanha Não Encontrada</h2>
            <p className="text-gray-400 text-lg">
              A campanha solicitada não foi encontrada ou você não tem acesso a ela.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              Ir para Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // HANDLERS PARA CRIAÇÃO DE PERSONAGEM
  // ===========================
  const handleCharacterComplete = async (characterData: any) => {
    console.log("✅ Personagem criado com sucesso para campanha:", campaignId, characterData);
    
    try {
      // TODO: Implementar API call para vincular personagem à campanha
      // await campaignAPI.updatePlayer(campaignId, user.id, {
      //   character_id: characterData.id
      // });
      
      // Redirecionar para a página da campanha
      router.push(`/campaign/${campaignId}`);
    } catch (error) {
      console.error("Erro ao vincular personagem à campanha:", error);
      // Mostrar erro mas ainda redirecionar
      router.push(`/campaign/${campaignId}`);
    }
  };

  const handleCancel = () => {
    router.push(`/campaign/${campaignId}`);
  };

  // ===========================
  // RENDERIZAÇÃO PRINCIPAL
  // ===========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header com informações da campanha */}
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

            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Crown className="w-4 h-4" />
              <span>GM: {campaign.game_master_id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Componente de criação de personagem */}
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