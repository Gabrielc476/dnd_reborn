// components/encounter/ActiveEncounterPanel.tsx
import { useState, useEffect, useMemo } from 'react';
import { EncounterDetail } from '@/types/encounter';
import { Character } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sword, X, ChevronRight } from 'lucide-react';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/types/encounter';
import { campaignAPI } from '@/api/campaignAPI';
import { useRouter } from 'next/navigation';
import EnhancedNPCCard from "@/components/npc/EnhancedNPCCard";
import CharacterCard from '@/components/encounter/panel/CharacterCard';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CombatTracker from '@/components/encounter/panel/CombatTracker';
import { EnhancedNPC } from '@/types/enhancedNPC';
import {
  handleHeal,
  handleDamage,
  handleKill,
  handleRevive,
  handleEditNPC,
  handleDeleteNPC,
  handleAttackRoll,
  handleDamageRoll
} from '@/utils/encounter/PanelFunctions';

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
  const [npcs, setNpcs] = useState<EnhancedNPC[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loadingNPCs, setLoadingNPCs] = useState(true);
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const [initiatives, setInitiatives] = useState<Record<string, number>>({});
  const [currentTurn, setCurrentTurn] = useState(0);
  const [selectedNPC, setSelectedNPC] = useState<EnhancedNPC | undefined>();
  
  // Estados para gerenciar HP
  const [characterCurrentHP, setCharacterCurrentHP] = useState<Record<string, number>>({});
  const [npcCurrentHP, setNpcCurrentHP] = useState<Record<string, number>>({});
  const [characterMaxHP, setCharacterMaxHP] = useState<Record<string, number>>({});
  const [npcMaxHP, setNpcMaxHP] = useState<Record<string, number>>({});

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
        
        // Inicializar HP dos NPCs
        const initialNpcHP: Record<string, number> = {};
        const initialNpcMaxHP: Record<string, number> = {};
        
        loadedNPCs.forEach(npc => {
          initialNpcHP[npc.id] = npc.stats.hit_points || npc.stats.max_hit_points;
          initialNpcMaxHP[npc.id] = npc.stats.max_hit_points;
        });
        
        setNpcCurrentHP(initialNpcHP);
        setNpcMaxHP(initialNpcMaxHP);
      } catch (error) {
        console.error("Erro ao buscar NPCs:", error);
      } finally {
        setLoadingNPCs(false);
      }
    };

    fetchNPCs();
  }, [campaignId, encounter.npcs]);

  // Buscar personagens da campanha
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoadingCharacters(true);
        const response = await campaignAPI.getCampaignCharacters(campaignId);
        
        if (response.success && response.characters) {
          setCharacters(response.characters);
          
          // Inicializar HP dos personagens
          const initialCharacterHP: Record<string, number> = {};
          const initialCharacterMaxHP: Record<string, number> = {};
          
          response.characters.forEach(character => {
            initialCharacterHP[character.id] = character.stats.hit_points;
            initialCharacterMaxHP[character.id] = character.stats.hit_points;
          });
          
          setCharacterCurrentHP(initialCharacterHP);
          setCharacterMaxHP(initialCharacterMaxHP);
        } else {
          console.error("Falha ao buscar personagens:", response.error);
        }
      } catch (error) {
        console.error("Erro ao buscar personagens:", error);
      } finally {
        setLoadingCharacters(false);
      }
    };

    fetchCharacters();
  }, [campaignId]);

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

  const handleInitiativeChange = (characterId: string, initiative: number) => {
    setInitiatives(prev => ({
      ...prev,
      [characterId]: initiative
    }));
  };

  const handleNPCInitiativeChange = (npcId: string, initiative: number) => {
    setInitiatives(prev => ({
      ...prev,
      [npcId]: initiative
    }));
  };

  // Funções para manipulação de HP de personagens
 const handleHealCharacter = (characterId: string, amount: number) => {
  console.log(`Curando personagem ${characterId} com ${amount} de HP`);
  handleHeal(characterCurrentHP, setCharacterCurrentHP, characterId, amount, characterMaxHP);
};

const handleDamageCharacter = (characterId: string, amount: number) => {
  console.log(`Causando ${amount} de dano ao personagem ${characterId}`);
  handleDamage(characterCurrentHP, setCharacterCurrentHP, characterId, amount);
};

  // Funções para manipulação de NPCs
  const handleKillNPC = (npcId: string) => {
    handleKill(setNpcCurrentHP, npcId);
  };

  const handleReviveNPC = (npcId: string) => {
    handleRevive(setNpcCurrentHP, npcId, npcMaxHP[npcId] || 0);
  };

  const handleHealNPC = (npcId: string, amount: number) => {
    handleHeal(npcCurrentHP, setNpcCurrentHP, npcId, amount, npcMaxHP);
  };

  const handleDamageNPC = (npcId: string, amount: number) => {
    handleDamage(npcCurrentHP, setNpcCurrentHP, npcId, amount);
  };

  const handleHPChange = (npcId: string, newHP: number, tempHP?: number) => {
    setNpcCurrentHP(prev => ({
      ...prev,
      [npcId]: newHP
    }));
  };

  // A lista de combatentes agora é memoizada para performance e consistência
  const sortedCombatants = useMemo(() => {
    const allCombatants = [
      ...npcs.map(npc => ({
        id: npc.id,
        current_hit_points: npcCurrentHP[npc.id] ?? npc.stats.hit_points,
      })),
      ...characters.map(char => ({
        id: char.id,
        current_hit_points: characterCurrentHP[char.id] ?? char.stats.hit_points,
      })),
    ];

    return allCombatants
      .map(c => ({ ...c, initiative: initiatives[c.id] || 0 }))
      .sort((a, b) => b.initiative - a.initiative);
  }, [npcs, characters, initiatives, npcCurrentHP, characterCurrentHP]);

  // Lógica de avançar turno corrigida
  const handleNextTurn = () => {
    if (sortedCombatants.length === 0) return;

    let nextTurn = currentTurn;
    let attempts = 0;
    
    do {
      nextTurn = (nextTurn + 1) % sortedCombatants.length;
      attempts++;
    } while (
      sortedCombatants[nextTurn].current_hit_points <= 0 && 
      attempts < sortedCombatants.length
    );

    setCurrentTurn(nextTurn);
  };

  // Lógica de retroceder turno corrigida
  const handlePreviousTurn = () => {
    if (sortedCombatants.length === 0) return;
    
    let prevTurn = currentTurn;
    let attempts = 0;

    do {
      prevTurn = (prevTurn - 1 + sortedCombatants.length) % sortedCombatants.length;
      attempts++;
    } while (
      sortedCombatants[prevTurn].current_hit_points <= 0 && 
      attempts < sortedCombatants.length
    );

    setCurrentTurn(prevTurn);
  };
  
  // Função para rolar iniciativa para todos os combatentes
  const handleRollAllInitiatives = () => {
    const newInitiatives: Record<string, number> = {};

    const getDexMod = (stats: any) => Math.floor(((stats.dexterity || 10) - 10) / 2);

    npcs.forEach(npc => {
        const roll = Math.floor(Math.random() * 20) + 1;
        const dexMod = getDexMod(npc.stats);
        newInitiatives[npc.id] = roll + dexMod;
    });

    characters.forEach(character => {
        const roll = Math.floor(Math.random() * 20) + 1;
        const dexMod = getDexMod(character.stats);
        newInitiatives[character.id] = roll + dexMod;
    });

    setInitiatives(newInitiatives);
    setCurrentTurn(0); // Reseta o turno para o início da nova ordem
    alert("Iniciativas roladas para todos os combatentes!");
  };


  const handleAddNPC = () => {
    console.log("Adicionar NPC ao combate");
  };

  const handleSelectNPC = (npc: EnhancedNPC) => {
    setSelectedNPC(npc);
  };

  // Preparar dados para o rastreador de combate
  const combatNPCs = npcs.map(npc => {
    return {
      id: npc.id,
      name: npc.name,
      current_hit_points: npcCurrentHP[npc.id] || npc.stats.hit_points || npc.stats.max_hit_points,
      max_hit_points: npc.stats.max_hit_points,
      armor_class: npc.stats.armor_class
    };
  });

  const combatCharacters = characters.map(char => {
    return {
      id: char.id,
      name: char.basic_info.name,
      current_hit_points: characterCurrentHP[char.id] || char.stats.hit_points,
      max_hit_points: char.stats.hit_points,
      armor_class: char.stats.armor_class
    };
  });

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
        <Card className="bg-gray-700 border-gray-600 mb-6">
          <CardContent className="p-4">
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
          </CardContent>
        </Card>

        <Tabs defaultValue="npcs" className="mb-6">
          <TabsList className="bg-gray-800 p-1">
            <TabsTrigger value="npcs" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              NPCs
            </TabsTrigger>
            <TabsTrigger value="characters" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              Personagens
            </TabsTrigger>
            <TabsTrigger value="combat" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              Combate
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="npcs">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
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
                    {npcs.map(npc => {
                      const currentHP = npcCurrentHP[npc.id] || npc.stats.hit_points || npc.stats.max_hit_points;
                      const maxHP = npcMaxHP[npc.id] || npc.stats.max_hit_points;
                      
                      return (
                        <EnhancedNPCCard
                          key={npc.id}
                          npc={{ ...npc, current_hit_points: currentHP, max_hit_points: maxHP }}
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
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="characters">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Personagens da Campanha
                </h3>
                
                {loadingCharacters ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    <p className="mt-2 text-gray-400">Carregando personagens...</p>
                  </div>
                ) : characters.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Nenhum personagem encontrado na campanha.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {characters.map(character => (
                      <CharacterCard
                        key={character.id}
                        character={character}
                        initiative={initiatives[character.id]}
                        onInitiativeChange={handleInitiativeChange}
                        onHeal={isGM ? (amount) => handleHealCharacter(character.id, amount) : undefined}
                        onDamage={isGM ? (amount) => handleDamageCharacter(character.id, amount) : undefined}
                        isGM={isGM}
                        currentHP={characterCurrentHP[character.id] ?? character.stats.hit_points}
                        maxHP={characterMaxHP[character.id] ?? character.stats.hit_points}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="combat">
            <DndProvider backend={HTML5Backend}>
              <CombatTracker
                npcs={combatNPCs}
                characters={combatCharacters}
                initiatives={initiatives}
                onInitiativeChange={(id, initiative) => {
                  if (npcs.some(npc => npc.id === id)) {
                    handleNPCInitiativeChange(id, initiative);
                  } else {
                    handleInitiativeChange(id, initiative);
                  }
                }}
                onReorder={()=>{}}
                isGM={isGM}
                currentTurn={currentTurn}
                onNextTurn={handleNextTurn}
                onPreviousTurn={handlePreviousTurn}
                onAddNPC={handleAddNPC}
                onHeal={(id, amount) => {
                  if (npcs.some(npc => npc.id === id)) {
                    handleHealNPC(id, amount);
                  } else {
                    handleHealCharacter(id, amount);
                  }
                }}
                onDamage={(id, amount) => {
                  if (npcs.some(npc => npc.id === id)) {
                    handleDamageNPC(id, amount);
                  } else {
                    handleDamageCharacter(id, amount);
                  }
                }}
                onSelectNPC={handleSelectNPC}
                selectedNPC={selectedNPC}
                onRollAllInitiatives={handleRollAllInitiatives}
              />
            </DndProvider>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* O conteúdo das abas já está sendo renderizado acima */}
          </div>
          
          <div>
            <Card className="bg-gray-700 border-gray-600 mb-4">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Ações Rápidas
                </h3>
                <div className="space-y-2">
                  <Button className="w-full justify-between">
                    Adicionar NPC ao combate
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
              </CardContent>
            </Card>
            
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}