import { useState, useEffect } from 'react';
import { EncounterDetail } from '@/types/encounter';
import { Button } from '@/components/ui/button';
import { Sword, Calendar, X, ChevronRight } from 'lucide-react';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/types/encounter';
import { campaignAPI } from '@/api/campaignAPI';
import { useRouter } from 'next/navigation';
import EnhancedNPCCard from "@/components/npc/EnhancedNPCCard"; // Importando o novo NPCCard

interface ActiveEncounterPanelProps {
  encounter: EncounterDetail;
  campaignId: string;
  isGM: boolean;
}

export default function ActiveEncounterPanel({ 
  encounter, 
  campaignId,
  isGM
}: ActiveEncounterPanelProps) {
  const router = useRouter();
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [npcs, setNpcs] = useState<any[]>([]);
  const [loadingNPCs, setLoadingNPCs] = useState(true);
  
  // Buscar os NPCs do encontro
  useEffect(() => {
    const fetchNPCs = async () => {
      if (!encounter.npcs || encounter.npcs.length === 0) {
        setLoadingNPCs(false);
        return;
      }
      
      try {
        setLoadingNPCs(true);
        
        const npcPromises = encounter.npcs.map(npcId => 
          campaignAPI.getEnhancedNPCById(campaignId, npcId)
        );
        
        const results = await Promise.all(npcPromises);
        const loadedNPCs = results
          .filter(result => result.success && result.npc)
          .map(result => result.npc!);
        
        setNpcs(loadedNPCs);
      } catch (error) {
        console.error("Erro ao buscar NPCs:", error);
      } finally {
        setLoadingNPCs(false);
      }
    };

    fetchNPCs();
  }, [campaignId, encounter.npcs]);

  const handleDeactivate = async () => {
    if (!window.confirm('Deseja desativar este encontro?')) return;
    
    try {
      setIsDeactivating(true);
      const result = await campaignAPI.updateEncounter(
        campaignId, 
        encounter.id, 
        { is_active: false }
      );
      
      if (result.success) {
        router.refresh();
      } else {
        alert(`Falha ao desativar: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      alert('Erro ao desativar encontro');
    } finally {
      setIsDeactivating(false);
    }
  };

  // Funções para manipulação de NPCs
  const handleEditNPC = (npcId: string) => {
    console.log(`Editar NPC: ${npcId}`);
    // Implementar lógica de edição
  };

  const handleDeleteNPC = (npcId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este NPC?')) {
      console.log(`Excluir NPC: ${npcId}`);
      // Implementar lógica de exclusão
    }
  };

  const handleKillNPC = (npcId: string) => {
    console.log(`Matar NPC: ${npcId}`);
    // Implementar lógica para marcar NPC como morto
  };

  const handleReviveNPC = (npcId: string) => {
    console.log(`Reviver NPC: ${npcId}`);
    // Implementar lógica para reviver NPC
  };

  const handleAttackRoll = (npcId: string, attackId: string, options?: any) => {
    console.log(`NPC ${npcId} rolou ataque ${attackId}`, options);
    // Implementar lógica de rolagem de ataque
  };

  const handleDamageRoll = (npcId: string, attackId: string, options?: any) => {
    console.log(`NPC ${npcId} rolou dano ${attackId}`, options);
    // Implementar lógica de rolagem de dano
  };

  const handleHealNPC = (npcId: string, amount: number) => {
    console.log(`Curar NPC ${npcId}: +${amount} PV`);
    // Implementar lógica de cura
  };

  const handleDamageNPC = (npcId: string, amount: number) => {
    console.log(`Dano no NPC ${npcId}: -${amount} PV`);
    // Implementar lógica de dano
  };

  const handleHPChange = (npcId: string, newHP: number, tempHP?: number) => {
    console.log(`Atualizar HP do NPC ${npcId}: ${newHP} | THP: ${tempHP}`);
    // Implementar lógica para atualizar PV
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sword className="w-6 h-6 text-white" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Encontro Ativo
              </h3>
              <p className="text-orange-100 text-sm">
                {encounter.name} está em andamento
              </p>
            </div>
          </div>
          <Button 
            variant="destructive"
            onClick={handleDeactivate}
            disabled={isDeactivating}
            className="px-3 py-1"
          >
            {isDeactivating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
            ) : (
              <>
                <X className="mr-1 w-4 h-4" />
                Desativar Encontro
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">{encounter.name}</h2>
            
            <div className="flex items-center gap-2">
              <span 
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  DIFFICULTY_COLORS[encounter.difficulty]
                }`}
              >
                {DIFFICULTY_LABELS[encounter.difficulty]}
              </span>
              
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                Ativo
              </span>
            </div>
          </div>
          
          <p className="text-gray-400 mb-4">
            {encounter.description || 'Sem descrição'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">NPCs</div>
              <div className="text-white font-semibold">
                {encounter.npcs?.length || 0}
              </div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Sessão</div>
              <div className="text-white font-semibold">
                {encounter.session_number || 'N/A'}
              </div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Status</div>
              <div className="text-yellow-400 font-semibold">
                {encounter.is_completed ? 'Completo' : 'Em andamento'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-700 rounded-lg border border-gray-600 p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                NPCs do Encontro
              </h3>
              
              {loadingNPCs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                  <p className="mt-2 text-gray-400">Carregando NPCs...</p>
                </div>
              ) : npcs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Nenhum NPC encontrado neste encontro.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {npcs.map(npc => (
                    <NPCCard 
                      key={npc.id}
                      npc={npc}
                      isGM={isGM}
                      onEdit={() => handleEditNPC(npc.id)}
                      onView={() => console.log(`Visualizar NPC: ${npc.id}`)}
                      onDelete={() => handleDeleteNPC(npc.id)}
                      onKill={() => handleKillNPC(npc.id)}
                      onRevive={() => handleReviveNPC(npc.id)}
                      onAttackRoll={(attackId, options) => 
                        handleAttackRoll(npc.id, attackId, options)
                      }
                      onDamageRoll={(attackId, options) => 
                        handleDamageRoll(npc.id, attackId, options)
                      }
                      onHPChange={(newHP, tempHP) => 
                        handleHPChange(npc.id, newHP, tempHP)
                      }
                      onHeal={(amount) => handleHealNPC(npc.id, amount)}
                      onDamage={(amount) => handleDamageNPC(npc.id, amount)}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Rastreador de Combate
              </h3>
              <div className="text-gray-400 text-center py-8">
                <Sword className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                <p>Rastreador de combate em desenvolvimento</p>
                <p className="text-sm mt-2">
                  Em breve você poderá gerenciar batalhas aqui
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-700 rounded-lg border border-gray-600 p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Ações Rápidas
              </h3>
              <div className="space-y-2">
                <Button className="w-full justify-between">
                  Adicionar NPC ao combate
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button className="w-full justify-between">
                  Lançar dados de iniciativa
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button className="w-full justify-between">
                  Registrar dano em grupo
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button className="w-full justify-between">
                  Conceder recompensas
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recursos do Encontro
              </h3>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full">
                  Ver detalhes do encontro
                </Button>
                <Button variant="secondary" className="w-full">
                  Editar encontro
                </Button>
                <Button variant="secondary" className="w-full">
                  Exportar para PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}