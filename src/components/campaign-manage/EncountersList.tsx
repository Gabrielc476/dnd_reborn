import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { encounterAPI } from '@/api/encounterAPI';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/types/encounter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';
import { useState, useEffect } from 'react';

// Definir um tipo para o encontro
interface EncounterSummary {
  id: string;
  name: string;
  description?: string;
  difficulty: keyof typeof DIFFICULTY_LABELS;
  npcs?: { id: string }[];
  session_number?: number;
  is_completed: boolean;
}

interface EncountersListProps {
  campaignId: string;
}

export default function EncountersList({ campaignId }: EncountersListProps) {
  const { isGM } = useManageCampaignContext();
  
  // Estado para os encontros
  const [encounters, setEncounters] = useState<EncounterSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar encontros da campanha
  useEffect(() => {
    console.log(campaignId)
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

    if (campaignId) {
      loadEncounters();
    }
  }, [campaignId]);

  // Se estiver carregando
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Se houver erro
  if (error) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded-lg">
        <p>{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Botão de criação apenas para o mestre */}
      {isGM && (
        <div className="flex justify-end mb-4">
          <Link href={`/campaign/${campaignId}/encounters/create`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Encontro
            </Button>
          </Link>
        </div>
      )}

      {/* Mensagem quando não há encontros */}
      {encounters.length === 0 ? (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg">
          <p>Nenhum encontro criado ainda.</p>
          {isGM && (
            <Link href={`/campaign/${campaignId}/encounters/create`}>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar primeiro encontro
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {encounters.map(encounter => (
            <Card 
              key={encounter.id} 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {encounter.name}
                  </CardTitle>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      DIFFICULTY_COLORS[encounter.difficulty as keyof typeof DIFFICULTY_COLORS]
                    }`}
                  >
                    {DIFFICULTY_LABELS[encounter.difficulty]}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                  {encounter.description || 'Sem descrição'}
                </p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                      NPCs: {encounter.npcs?.length || 0}
                    </span>
                    
                    {encounter.session_number && (
                      <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                        Sessão {encounter.session_number}
                      </span>
                    )}
                  </div>
                  
                  {encounter.is_completed ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pendente
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}