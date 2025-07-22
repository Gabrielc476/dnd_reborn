"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/hooks/useAuth';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { Character } from '@/types/manageCampaign';
import { 
  Shield, 
  Sparkles, 
  Crown,
  User,
  Settings,
  UserPlus,
  Heart
} from 'lucide-react';

const CharactersList = () => {
  const {
    campaign,
    characters,
    isLoading: isCampaignLoading,
    loadCharacters,
    isGM,
    isPlayer,
    canPerformAction
  } = useManageCampaignContext();

  const router = useRouter();
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [showGMOnlyActions, setShowGMOnlyActions] = useState(false);

  // Recarregar personagens quando solicitado
  useEffect(() => {
    if (campaign?.id && characters.length === 0 && !isCampaignLoading) {
      loadCharacters();
    }
  }, [campaign?.id, characters, isCampaignLoading, loadCharacters]);

  // Atualizar estado de carregamento
  useEffect(() => {
    if (!isCampaignLoading) {
      setIsLoading(false);
    }
  }, [isCampaignLoading]);

  const handleCreateCharacter = () => {
    if (!campaign?.id) return;
    router.push(`/campaign/${campaign.id}/create-character`);
  };

  const handleEditCharacter = (characterId: string) => {
    if (!campaign?.id) return;
    router.push(`/campaign/${campaign.id}/edit-character/${characterId}`);
  };

  const handleCharacterDetails = (characterId: string) => {
    router.push(`/characters/${characterId}`);
  };

  // Verificar se o usuário atual pode criar personagem
  const canCreateCharacter = () => {
    if (!user || !campaign) return false;
    
    // GM sempre pode criar personagens (para testes/NPCs)
    if (isGM) return true;
    
    // Jogador pode criar se não tem personagem ainda
    if (isPlayer) {
      const playerData = campaign.players.find(p => p.user_id === user.id);
      return !playerData?.character_id;
    }
    
    return false;
  };

  // Verificar se o usuário pode editar um personagem específico
  const canEditCharacter = (character: Character) => {
    if (!user || !campaign) return false;
    
    // GM pode editar qualquer personagem
    if (isGM) return true;
    
    // Jogador só pode editar seu próprio personagem
    if (isPlayer && character.user_id === user.id) {
      return true;
    }
    
    return false;
  };

  // Função para extrair a classe do personagem
  const getCharacterClass = (character: Character) => {
    return character.basic_info?.character_class || 'Desconhecido';
  };

  // Função para extrair a raça do personagem
  const getCharacterRace = (character: Character) => {
    return character.race_info?.display_name || 'Desconhecido';
  };

  // Função para obter pontos de vida
  const getHitPoints = (character: Character) => {
    return character.stats?.hit_points || 0;
  };

  // Função para obter classe de armadura
  const getArmorClass = (character: Character) => {
    return character.stats?.armor_class || 0;
  };

  // Renderizar estado de carregamento
  if (isCampaignLoading || isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Carregando personagens...</p>
      </div>
    );
  }

  // Calcular estatísticas
  const activeCharacters = characters.filter(c => c.is_active).length;
  const averageLevel = characters.length > 0 
    ? Math.round(characters.reduce((sum, c) => sum + (c.basic_info?.level || 1), 0) / characters.length)
    : 0;
  const remainingSlots = (campaign?.max_players || 0) - characters.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Personagens da Campanha</h2>
          <p className="text-gray-400">
            {characters.length} de {campaign?.max_players || 0} personagens criados
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isGM && (
            <button
              onClick={() => setShowGMOnlyActions(!showGMOnlyActions)}
              className={`px-3 py-2 text-sm rounded-lg ${
                showGMOnlyActions 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {showGMOnlyActions ? 'Ocultar Ações' : 'Ações de GM'}
            </button>
          )}
          
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
      </div>

      {/* Lista de Personagens */}
      {characters.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
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
              className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 hover:bg-gray-800/70 transition-all duration-200 relative"
            >
              {character.is_active ? (
                <span className="absolute top-3 right-3 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Ativo
                </span>
              ) : (
                <span className="absolute top-3 right-3 px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                  Inativo
                </span>
              )}
              
              <div className="flex items-start gap-4 mb-4">
                {character.avatar_url ? (
                  <img 
                    src={character.avatar_url} 
                    alt={character.basic_info?.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/50"
                  />
                ) : (
                  <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl w-16 h-16 flex items-center justify-center">
                    <User className="text-gray-500" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {character.basic_info?.name || 'Personagem sem nome'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {getCharacterRace(character)} • {getCharacterClass(character)} • Nível {character.basic_info?.level || 1}
                  </p>
                  {character.player_name && (
                    <p className="text-xs text-purple-400 mt-1">
                      Jogador: {character.player_name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-red-400">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">PV</span>
                  </div>
                  <div className="text-white font-mono mt-1">
                    {getHitPoints(character)}/{getHitPoints(character)}
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">CA</span>
                  </div>
                  <div className="text-white font-mono mt-1">
                    {getArmorClass(character)}
                  </div>
                </div>
              </div>
              
              {character.personality_traits && (
                <div className="bg-gray-800/40 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-400 italic line-clamp-2">
                    "{character.personality_traits}"
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleCharacterDetails(character.id)}
                  className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm"
                >
                  Ver Detalhes
                </button>
                
                {(showGMOnlyActions || canEditCharacter(character)) && (
                  <button 
                    onClick={() => handleEditCharacter(character.id)}
                    className="px-3 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-lg transition-colors"
                  >
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
                <User className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Personagens Ativos</p>
                <p className="text-xl font-bold text-white">
                  {activeCharacters}
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
                  {averageLevel}
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
                  {remainingSlots}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Ações de GM */}
      {isGM && showGMOnlyActions && (
        <div className="mt-8 p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
          <h3 className="text-lg font-semibold text-purple-400 mb-3">Ações de Game Master</h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 rounded-lg text-sm">
              Exportar Personagens
            </button>
            <button className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 rounded-lg text-sm">
              Gerenciar Acessos
            </button>
            <button className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 rounded-lg text-sm">
              Atribuir Itens em Massa
            </button>
            <button className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 rounded-lg text-sm">
              Recalcular Níveis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharactersList;