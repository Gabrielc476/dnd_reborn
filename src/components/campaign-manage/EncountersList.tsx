import React, { useState, useEffect } from 'react';
import { Sword, Plus, CheckCircle, Clock, Eye, Edit, Trash2, Users, Star } from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { EncounterManagement, CompleteEncounterRequest, EncounterOutcome } from '@/types/manageCampaign';
import { DifficultyLevel } from '@/types/createCampaign';

// Interface temporal para criação de encontros (deve ser adicionada aos tipos)
interface CreateEncounterRequest {
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  npcs?: string[];
  location?: string;
  rewards_xp?: number;
  session_number?: number;
  notes?: string;
}

export const EncountersList: React.FC = () => {
  const { campaign, createEncounter, completeEncounter, isGM } = useManageCampaignContext();
  const [encounters, setEncounters] = useState<EncounterManagement[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    // Carregar encontros dos dados da campanha
    if (campaign?.encounters) {
      setEncounters(campaign.encounters);
    }
  }, [campaign?.encounters]);

  const handleCreateEncounter = async () => {
    const encounterData: CreateEncounterRequest = {
      name: 'Novo Encontro',
      description: 'Descrição do encontro',
      difficulty: DifficultyLevel.MEDIUM,
      location: 'Local do encontro',
      rewards_xp: 100
      // npcs será array vazio por padrão
      // is_completed será false por padrão na implementação
    };

    const encounterId = await createEncounter(encounterData as any); // Cast temporário até atualizar os tipos
    
    if (encounterId) {
      // Os dados serão atualizados automaticamente via contexto
    }
  };

  const handleCompleteEncounter = async (encounter: EncounterManagement) => {
    const completeData: CompleteEncounterRequest = {
      outcome: EncounterOutcome.VICTORY,
      rewards_xp: encounter.rewards_xp || 100,
      notes: 'Encontro completado com sucesso'
    };

    const success = await completeEncounter(encounter.name, completeData);
    if (success) {
      // Os dados serão atualizados automaticamente
    }
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 'bg-green-500/10 text-green-400';
      case DifficultyLevel.MEDIUM:
        return 'bg-yellow-500/10 text-yellow-400';
      case DifficultyLevel.HARD:
        return 'bg-orange-500/10 text-orange-400';
      case DifficultyLevel.DEADLY:
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getDifficultyStars = (difficulty: DifficultyLevel) => {
    const count = {
      [DifficultyLevel.EASY]: 1,
      [DifficultyLevel.MEDIUM]: 2,
      [DifficultyLevel.HARD]: 3,
      [DifficultyLevel.DEADLY]: 4
    }[difficulty] || 1;

    return Array.from({ length: 4 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < count ? 'text-yellow-400 fill-current' : 'text-gray-500'}`}
      />
    ));
  };

  const filteredEncounters = encounters.filter(encounter => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return encounter.is_completed;
    if (filterStatus === 'pending') return !encounter.is_completed;
    return true;
  });

  const completedCount = encounters.filter(e => e.is_completed).length;
  const pendingCount = encounters.filter(e => !e.is_completed).length;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Sword className="w-6 h-6 text-red-400" />
          <h3 className="text-xl font-bold text-white">Encontros</h3>
          <span className="px-3 py-1 bg-red-500/10 text-red-400 text-sm rounded-full">
            {encounters.length} encontros
          </span>
        </div>
        
        {isGM && (
          <button
            onClick={handleCreateEncounter}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Encontro</span>
          </button>
        )}
      </div>

      {/* Estatísticas e Filtros */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{encounters.length}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-400">{completedCount}</div>
          <div className="text-xs text-gray-400">Completados</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-yellow-400">{pendingCount}</div>
          <div className="text-xs text-gray-400">Pendentes</div>
        </div>
      </div>

      {/* Filtro de Status */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            filterStatus === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            filterStatus === 'pending' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            filterStatus === 'completed' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Completados
        </button>
      </div>

      {/* Lista de Encontros */}
      <div className="space-y-4">
        {filteredEncounters.map((encounter, index) => (
          <div key={encounter.id || index} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-white">{encounter.name}</h4>
                  {encounter.is_completed ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                
                <p className="text-sm text-gray-400 mb-3">{encounter.description}</p>
                
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-400">Dificuldade:</span>
                    <div className="flex items-center space-x-1">
                      {getDifficultyStars(encounter.difficulty)}
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(encounter.difficulty)}`}>
                    {encounter.difficulty}
                  </span>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">
                      {encounter.rewards_xp || 0} XP
                    </span>
                  </div>
                  
                  {encounter.npcs && encounter.npcs.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-400">
                        {encounter.npcs.length} NPCs
                      </span>
                    </div>
                  )}

                  {encounter.location && (
                    <span className="text-sm text-gray-400">
                      📍 {encounter.location}
                    </span>
                  )}

                  <span className={`text-sm ${encounter.is_completed ? 'text-green-400' : 'text-gray-400'}`}>
                    {encounter.is_completed ? 'Completado' : 'Pendente'}
                  </span>
                </div>

                {encounter.outcome && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-400">Resultado: </span>
                    <span className={`text-xs ${
                      encounter.outcome === EncounterOutcome.VICTORY ? 'text-green-400' :
                      encounter.outcome === EncounterOutcome.DEFEAT ? 'text-red-400' :
                      encounter.outcome === EncounterOutcome.RETREAT ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {encounter.outcome}
                    </span>
                  </div>
                )}
              </div>

              {isGM && (
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-blue-400 hover:text-blue-300 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  {!encounter.is_completed && (
                    <button
                      onClick={() => handleCompleteEncounter(encounter)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                    >
                      Completar
                    </button>
                  )}
                  <button className="p-2 text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEncounters.length === 0 && (
        <div className="text-center py-12">
          <Sword className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {filterStatus === 'all' ? 'Nenhum encontro criado' : 
             filterStatus === 'completed' ? 'Nenhum encontro completado' :
             'Nenhum encontro pendente'}
          </h3>
          <p className="text-gray-400">
            {filterStatus === 'all' 
              ? 'Crie seu primeiro encontro para a campanha'
              : 'Ajuste os filtros para ver outros encontros'
            }
          </p>
        </div>
      )}
    </div>
  );
};