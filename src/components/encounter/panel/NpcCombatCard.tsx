import { useDrag } from 'react-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, GripVertical, Sword, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { EnhancedNPC, NPCAttributes } from '@/types/enhancedNPC';
import { useEffect } from 'react';

interface NPCCombatCardProps {
  npc: EnhancedNPC;
  initiative?: number;
  onInitiativeChange?: (npcId: string, initiative: number) => void;
  isGM?: boolean;
  isCurrentTurn?: boolean;
  onSelect?: (npc: EnhancedNPC) => void;
}

export default function NPCCombatCard({ 
  npc, 
  initiative, 
  onInitiativeChange, 
  isGM = false,
  isCurrentTurn = false,
  onSelect
}: NPCCombatCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'npc',
    item: { 
      id: npc.id, 
      name: npc.name,
      type: 'npc'
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Garantir que o HP não seja negativo
  const currentHP = npc.current_hit_points || npc.stats.hit_points;
  const maxHP =  npc.max_hit_points
  const displayHP = Math.max(0, currentHP);
  const hpPercentage = Math.max(0, (displayHP / maxHP) * 100);

  // Calcular modificadores de atributo
  const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const getHPColor = () => {
    if (hpPercentage > 50) return 'bg-green-500';
    if (hpPercentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(npc);
    }
  };

  useEffect(() => {
    console.log(npc)
  }, [npc])

  return (
    <Card 
      ref={drag}
      className={`bg-gray-800 border-gray-700 hover:border-gray-500 transition-colors cursor-move ${isDragging ? 'opacity-50' : ''} ${isCurrentTurn ? 'ring-2 ring-yellow-400' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <GripVertical className="w-4 h-4 text-gray-500 mr-2" />
            <div>
              <h4 className="font-semibold text-white text-sm">{npc.name}</h4>
              <p className="text-xs text-gray-400">
                {npc.race} {npc.npc_class} • {npc.challenge_rating}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-xs text-gray-400 mr-2">Init:</span>
            {isGM ? (
              <input
                type="number"
                value={initiative || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && onInitiativeChange && npc.id) {
                    onInitiativeChange(npc.id, value);
                  }
                }}
                className="w-10 bg-gray-700 text-white text-center rounded py-1 px-1 border border-gray-600 text-xs"
                min="1"
                max="30"
              />
            ) : (
              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                {initiative || '?'}
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="flex items-center">
            <Heart className="w-3 h-3 text-red-400 mr-1" />
            <div>
              <div className="text-xs text-gray-400">PV</div>
              <div className="text-white text-xs font-medium">
                {displayHP}/{maxHP}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Shield className="w-3 h-3 text-blue-400 mr-1" />
            <div>
              <div className="text-xs text-gray-400">CA</div>
              <div className="text-white text-xs font-medium">
                {npc.armor_class}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Vida</span>
            <span className="text-xs text-gray-400">{Math.round(hpPercentage)}%</span>
          </div>
          <Progress value={hpPercentage} className={`h-1 ${getHPColor()}`} />
        </div>

        {/* Ataques rápidos */}
        {npc.attacks && npc.attacks.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Ataques</div>
            <div className="space-y-1">
              {npc.attacks.slice(0, 2).map((attack, index) => (
                <div key={index} className="flex items-center text-xs">
                  <Sword className="w-3 h-3 text-gray-400 mr-1" />
                  <span className="text-white">{attack.name}</span>
                  <span className="text-gray-400 ml-1">+{attack.attack_bonus}</span>
                </div>
              ))}
              {npc.attacks.length > 2 && (
                <div className="text-xs text-gray-400">+{npc.attacks.length - 2} mais...</div>
              )}
            </div>
          </div>
        )}

        {/* Magias rápidas */}
        {npc.spellcasting?.is_spellcaster && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Magias</div>
            <div className="flex items-center text-xs">
              <Zap className="w-3 h-3 text-yellow-400 mr-1" />
              <span className="text-white">CD {npc.spellcasting.spell_save_dc}</span>
              <span className="text-gray-400 ml-2">+{npc.spellcasting.spell_attack_bonus}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}