import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Sword, Calendar, Skull, Play } from 'lucide-react'; // Adicione o ícone Play
import { encounterAPI } from '@/api/encounterAPI';
import { campaignAPI } from '@/api/campaignAPI';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/types/encounter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { useState, useEffect } from 'react';

interface EncounterSummary {
  id: string;
  name: string;
  description?: string;
  difficulty: keyof typeof DIFFICULTY_LABELS;
  npcs?: number;
  session_number?: number;
  is_active: boolean; // Adicionado campo is_active
  is_completed: boolean;
}

interface EncountersListProps {
  campaignId: string;
}

export default function EncountersList({ campaignId }: EncountersListProps) {
  const { isGM } = useManageCampaignContext();
  const [encounters, setEncounters] = useState<EncounterSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null); // Estado para controle de ativação

  const loadEncounters = async () => {
    try {
      setIsLoading(true);
      const response = await encounterAPI.getEncounters(campaignId);
      if (response.success && response.encounters) {
        setEncounters(response.encounters);
      } else {
        setError(response.error || 'Erro ao carregar encontros');
      }
    } catch (error) {
      setError('Erro na requisição');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      loadEncounters();
    }
  }, [campaignId]);

  const handleDeleteEncounter = async (encounterId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este encontro?')) return;
    
    try {
      setDeleting(encounterId);
      const result = await campaignAPI.deleteEncounter(campaignId, encounterId);
      
      if (result.success) {
        setEncounters(prev => prev.filter(e => e.id !== encounterId));
      } else {
        alert(`Falha ao excluir: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      alert('Erro ao excluir encontro');
    } finally {
      setDeleting(null);
    }
  };

  const handleActivateEncounter = async (encounterId: string) => {
    if (!window.confirm('Deseja ativar este encontro?')) return;
    
    try {
      setActivating(encounterId);
      const result = await campaignAPI.updateEncounter(
        campaignId, 
        encounterId, 
        { is_active: true }
      );
      
      if (result.success) {
        // Forçar refresh da página
        window.location.reload();
      } else {
        alert(`Falha ao ativar: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      alert('Erro ao ativar encontro');
    } finally {
      setActivating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5" />
            <div className="flex justify-between mt-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 text-red-400 p-4 rounded-lg border border-red-800">
        <p>{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()} 
          className="mt-2 border-red-700 text-red-400 hover:bg-red-800/20"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sword className="w-6 h-6 text-white" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Encontros da Campanha
              </h3>
              <p className="text-blue-100 text-sm">
                {encounters.length} encontro{encounters.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isGM && (
              <Link href={`/campaign/${campaignId}/encounters/create`}>
                <Button className="px-3 py-1 bg-green-500 hover:bg-green-600">
                  <Plus className="mr-1 w-4 h-4" />
                  Novo Encontro
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {encounters.length === 0 ? (
          <div className="text-center py-8">
            <Skull className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">
              Nenhum encontro criado ainda
            </h4>
            <p className="text-gray-400 mb-4">
              {isGM ? 'Crie encontros para sua campanha' : 'Aguarde o Mestre criar encontros'}
            </p>
            {isGM && (
              <Link href={`/campaign/${campaignId}/encounters/create`}>
                <Button className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  <Plus className="mr-2 w-4 h-4" />
                  Criar Primeiro Encontro
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {encounters.map(encounter => (
              <div 
                key={encounter.id} 
                className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">
                    {encounter.name}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        DIFFICULTY_COLORS[encounter.difficulty]
                      }`}
                    >
                      {DIFFICULTY_LABELS[encounter.difficulty]}
                    </span>
                    
                    {encounter.is_active && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Ativo
                      </span>
                    )}
                    
                    {isGM && (
                      <div className="flex gap-1">
                        {!encounter.is_active && (
                          <Button 
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:bg-green-500/20 hover:text-green-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivateEncounter(encounter.id);
                            }}
                            disabled={activating === encounter.id}
                            title="Ativar encontro"
                          >
                            {activating === encounter.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-500/20 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEncounter(encounter.id);
                          }}
                          disabled={deleting === encounter.id}
                          title="Excluir encontro"
                        >
                          {deleting === encounter.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-400 mt-2 line-clamp-2">
                  {encounter.description || 'Sem descrição'}
                </p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center text-sm text-gray-400">
                      <Sword className="mr-1 w-4 h-4" />
                      NPCs: {encounter.npcs ?? 0}
                    </span>
                    
                    {encounter.session_number && (
                      <span className="inline-flex items-center text-sm text-gray-400">
                        <Calendar className="mr-1 w-4 h-4" />
                        Sessão {encounter.session_number}
                      </span>
                    )}
                  </div>
                  
                  {encounter.is_completed ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                      Completo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400">
                      Pendente
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}