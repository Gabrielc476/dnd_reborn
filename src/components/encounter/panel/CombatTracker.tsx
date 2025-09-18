// components/encounter/panel/CombatTracker.tsx
import { useDrop } from 'react-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sword, Users, Clock, Plus, Minus, Dices } from 'lucide-react';
import NPCCombatCard from './NpcCombatCard';
import { EnhancedNPC } from '@/types/enhancedNPC';

interface CombatTrackerProps {
  npcs: any[];
  characters: any[];
  initiatives: Record<string, number>;
  onInitiativeChange: (id: string, initiative: number) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  isGM: boolean;
  currentTurn: number;
  onNextTurn: () => void;
  onPreviousTurn: () => void;
  onAddNPC: () => void;
  onHeal: (id: string, amount: number) => void;
  onDamage: (id: string, amount: number) => void;
  onSelectNPC: (npc: any) => void;
  selectedNPC?: any;
  onRollAllInitiatives: () => void;
}

export default function CombatTracker({
  npcs,
  characters,
  initiatives,
  onInitiativeChange,
  onReorder,
  isGM,
  currentTurn,
  onNextTurn,
  onPreviousTurn,
  onAddNPC,
  onHeal,
  onDamage,
  onSelectNPC,
  selectedNPC,
  onRollAllInitiatives
}: CombatTrackerProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'npc',
    drop: (item: { id: string, type: string }) => {
      console.log(`Dropped ${item.type} ${item.id} in combat tracker`);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Combinar NPCs e personagens e ordenar por iniciativa
  const combatants = [
    ...npcs.map(npc => ({
      ...npc,
      type: 'npc' as const,
      initiative: initiatives[npc.id!] || 0
    })),
    ...characters.map(char => ({
      ...char,
      type: 'character' as const,
      initiative: initiatives[char.id] || 0
    }))
  ].sort((a, b) => b.initiative - a.initiative);

  // Obter o combatente atual
  const currentCombatant = combatants[currentTurn];

  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Sword className="mr-2 w-5 h-5" />
            Rastreador de Combate
          </h3>
          
          <div className="flex items-center space-x-2">
            {isGM && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRollAllInitiatives}
                className="h-8 px-2"
              >
                <Dices className="w-4 h-4 mr-1" />
                Iniciativas
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={onPreviousTurn}
              className="h-8 w-8 p-0"
            >
              <Clock className="w-4 h-4 transform -scale-x-100" />
            </Button>
            <span className="text-sm text-white bg-gray-800 px-3 py-1 rounded">
              Turno {combatants.length > 0 ? currentTurn + 1 : 0}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onNextTurn}
              className="h-8 w-8 p-0"
            >
              <Clock className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Combatente atual */}
        {currentCombatant && (
          <div className="bg-gray-800 p-3 rounded-lg mb-4">
            <div className="text-sm text-gray-400 mb-2">Turno atual</div>
            <div className="flex justify-between items-center">
              <div className="text-white font-semibold">
                {currentCombatant.name}
              </div>
              <div className="text-gray-400 text-sm">
                Iniciativa: {currentCombatant.initiative}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center text-sm text-gray-400 mb-2">
              <Users className="w-4 h-4 mr-1" />
              Personagens: {characters.length}
            </div>
            <div className="text-white font-semibold">
              {characters.filter(c => c.current_hit_points > 0).length} ativos
            </div>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center text-sm text-gray-400 mb-2">
              <Sword className="w-4 h-4 mr-1" />
              NPCs: {npcs.length}
            </div>
            <div className="text-white font-semibold">
              {npcs.filter(n => n.current_hit_points > 0).length} ativos
            </div>
          </div>
        </div>

        {isGM && (
          <div className="mb-4">
            <Button 
              onClick={onAddNPC}
              variant="outline"
              className="w-full bg-gray-800 hover:bg-gray-700 border-gray-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar NPC ao Combate
            </Button>
          </div>
        )}

        <div 
          ref={drop}
          className={`space-y-3 min-h-[200px] p-2 rounded-lg ${isOver ? 'bg-gray-600' : ''}`}
        >
          {combatants.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Nenhum combatente no encontro.
            </div>
          ) : (
            combatants.map((combatant, index) => (
              <NPCCombatCard
                key={`${combatant.type}-${combatant.id}`}
                npc={combatant}
                initiative={combatant.initiative}
                onInitiativeChange={onInitiativeChange}
                isGM={isGM}
                isCurrentTurn={index === currentTurn}
                onSelect={onSelectNPC}
              />
            ))
          )}
        </div>

        {combatants.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-400 mb-2">Ordem de Iniciativa</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {combatants.map((combatant, index) => (
                <div 
                  key={`order-${combatant.type}-${combatant.id}`} 
                  className={`flex justify-between items-center text-xs p-1 rounded ${index === currentTurn ? 'bg-gray-800' : ''}`}
                >
                  <span className={`${index === currentTurn ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
                    {index + 1}. {combatant.name}
                  </span>
                  <span className="text-gray-400">{combatant.initiative}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controles de HP rápidos para o NPC selecionado */}
        {selectedNPC && isGM && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-400 mb-2">Controle de Vida: {selectedNPC.name}</div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-red-600/20 hover:bg-red-600/40 border-red-700 text-red-300"
                onClick={() => onDamage(selectedNPC.id!, 5)}
              >
                <Minus className="w-4 h-4 mr-1" />
                -5 PV
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-green-600/20 hover:bg-green-600/40 border-green-700 text-green-300"
                onClick={() => onHeal(selectedNPC.id!, 5)}
              >
                <Plus className="w-4 h-4 mr-1" />
                +5 PV
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}