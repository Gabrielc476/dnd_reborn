import React, { useState } from 'react';
import {
  Users,
  Edit,
  Trash2,
  Eye,
  Heart,
  Skull,
  Target,
  Zap,
  Shield,
  Swords,
  TrendingUp,
  TrendingDown,
  Star,
  Activity,
  Settings,
  Copy,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Componentes shadcn/ui (simulados)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface NPCCardProps {
  npc: {
    id: string;
    name: string;
    npc_type: string;
    challenge_rating: string;
    is_alive: boolean;
    is_active: boolean;
    location?: string;
    stats: {
      armor_class: number;
      hit_points: number;
      current_hit_points?: number;
      speed: string;
    };
    attacks?: Array<{
      id: string;
      name: string;
      attack_bonus: number;
      damage: {
        dice_count: number;
        dice_sides: number;
        modifier: number;
      };
      damage_type: string;
      range: string;
    }>;
  };
  isGM: boolean;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  onKill?: () => void;
  onRevive?: () => void;
  onAttackRoll?: (attackId: string, options?: any) => void;
  onDamageRoll?: (attackId: string, options?: any) => void;
  onHPChange?: (newHP: number, tempHP?: number) => void;
  onHeal?: (amount: number) => void;
  onDamage?: (amount: number) => void;
  isRolling?: boolean;
}

const NPCCard: React.FC<NPCCardProps> = ({
  npc,
  isGM,
  onEdit,
  onView,
  onDelete,
  onKill,
  onRevive,
  onAttackRoll,
  onDamageRoll,
  onHPChange,
  onHeal,
  onDamage,
  isRolling = false
}) => {
  const [selectedAttack, setSelectedAttack] = useState<string | null>(null);
  const [tempHP, setTempHP] = useState(0);
  const [currentHP, setCurrentHP] = useState(
    npc.stats.current_hit_points ?? npc.stats.hit_points
  );
  const [attacksOpen, setAttacksOpen] = useState(false);

  const getNPCTypeColor = (type: string) => {
    const colors = {
      'neutro': 'border-gray-400 text-gray-400 bg-gray-400/10',
      'aliado': 'border-green-400 text-green-400 bg-green-400/10',
      'inimigo': 'border-red-400 text-red-400 bg-red-400/10',
      'mercador': 'border-yellow-400 text-yellow-400 bg-yellow-400/10',
    };
    return colors[type as keyof typeof colors] || colors['neutro'];
  };

  const getDamageTypeColor = (type: string) => {
    const colors = {
      'cortante': 'text-red-300 bg-red-400/10',
      'perfurante': 'text-yellow-300 bg-yellow-400/10',
      'contundente': 'text-blue-300 bg-blue-400/10',
      'fogo': 'text-orange-300 bg-orange-400/10',
      'frio': 'text-cyan-300 bg-cyan-400/10',
      'elétrico': 'text-purple-300 bg-purple-400/10',
    };
    return colors[type as keyof typeof colors] || 'text-gray-300 bg-gray-400/10';
  };

  const maxHP = npc.stats.hit_points;
  const hpPercentage = (currentHP / maxHP) * 100;

  // Funções de manipulação de HP
  const handleHeal = (amount: number) => {
    const newHP = Math.min(maxHP, currentHP + amount);
    setCurrentHP(newHP);
    onHeal?.(amount);
    onHPChange?.(newHP, tempHP);
  };

  const handleDamage = (amount: number) => {
    const newHP = Math.max(0, currentHP - amount);
    setCurrentHP(newHP);
    onDamage?.(amount);
    onHPChange?.(newHP, tempHP);
  };

  const handleTempHPChange = (value: number) => {
    const newTempHP = Math.max(0, value);
    setTempHP(newTempHP);
    onHPChange?.(currentHP, newTempHP);
  };

  // Funções padrão para ações
  const handleEdit = () => onEdit?.() || console.log(`Editar NPC: ${npc.id}`);
  const handleView = () => onView?.() || console.log(`Visualizar NPC: ${npc.id}`);
  const handleDelete = () => onDelete?.() || console.log(`Deletar NPC: ${npc.id}`);
  const handleKill = () => onKill?.() || console.log(`Matar NPC: ${npc.id}`);
  const handleRevive = () => onRevive?.() || console.log(`Reviver NPC: ${npc.id}`);
  
  const handleAttackRoll = (attackId: string, options?: any) => 
    onAttackRoll?.(attackId, options) || console.log(`Rolar ataque: ${attackId}`, options);
  
  const handleDamageRoll = (attackId: string, options?: any) => 
    onDamageRoll?.(attackId, options) || console.log(`Rolar dano: ${attackId}`, options);

  return (
    <Card className="border-gray-700 bg-gray-800 text-gray-100">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">{npc.name}</CardTitle>
              <div className={`w-2 h-2 rounded-full ${npc.is_alive ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getNPCTypeColor(npc.npc_type)}>
                {npc.npc_type}
              </Badge>
              <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                CR {npc.challenge_rating}
              </Badge>
            </div>

            {npc.location && (
              <CardDescription>{npc.location}</CardDescription>
            )}
          </div>

          {/* Botões de Ação Diretos */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleView} className="h-8 w-8 text-gray-400 hover:text-blue-400">
              <Eye className="h-4 w-4" />
            </Button>

            {isGM && (
              <>
                <Button variant="ghost" size="icon" onClick={handleEdit} className="h-8 w-8 text-gray-400 hover:text-green-400">
                  <Edit className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon" onClick={() => console.log(`Duplicar NPC: ${npc.id}`)} className="h-8 w-8 text-gray-400 hover:text-yellow-400">
                  <Copy className="h-4 w-4" />
                </Button>

                {npc.is_alive ? (
                  <Button variant="ghost" size="icon" onClick={handleKill} className="h-8 w-8 text-gray-400 hover:text-orange-400">
                    <Skull className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={handleRevive} className="h-8 w-8 text-gray-400 hover:text-green-400">
                    <Heart className="h-4 w-4" />
                  </Button>
                )}

                <Button variant="ghost" size="icon" onClick={handleDelete} className="h-8 w-8 text-gray-400 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Indicador de Carregamento */}
        {isRolling && (
          <div className="absolute inset-0 bg-gray-800/80 rounded-lg flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 animate-spin" />
              <span>Rolando dados...</span>
            </div>
          </div>
        )}

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center p-3 bg-gray-700 rounded-md">
            <div className="text-red-400 font-bold text-lg">{npc.stats.armor_class}</div>
            <div className="text-gray-400 text-xs">CA</div>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-gray-700 rounded-md">
            <div className="text-green-400 font-bold text-lg">{currentHP}</div>
            <div className="text-gray-400 text-xs">PV</div>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-gray-700 rounded-md">
            <div className="text-blue-400 font-bold text-lg">{npc.stats.speed}</div>
            <div className="text-gray-400 text-xs">VEL</div>
          </div>
        </div>

        {/* Seção de Ataques com Collapsible */}
        {npc.attacks && npc.attacks.length > 0 && (
          <Collapsible open={attacksOpen} onOpenChange={setAttacksOpen} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-red-400" />
                <h4 className="text-sm font-medium">Ataques</h4>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {attacksOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="space-y-2">
              {npc.attacks.map((attack) => (
                <Card
                  key={attack.id}
                  className={`border transition-colors ${
                    selectedAttack === attack.id
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                >
                  <CardContent className="p-3">
                    {/* Nome do Ataque e Informações */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{attack.name}</span>
                        <span className="text-xs text-gray-400">({attack.range})</span>
                      </div>
                      <Badge variant="outline" className={getDamageTypeColor(attack.damage_type)}>
                        {attack.damage_type}
                      </Badge>
                    </div>

                    {/* Estatísticas do Ataque */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-green-400" />
                          <span className="text-green-400">+{attack.attack_bonus}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-yellow-400" />
                          <span className="text-yellow-400">
                            {attack.damage.dice_count}d{attack.damage.dice_sides}+{attack.damage.modifier}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação do Ataque */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Rolagem de Ataque */}
                      <div className="space-y-1">
                        <Button
                          onClick={() => handleAttackRoll(attack.id)}
                          disabled={isRolling}
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                          size="sm"
                        >
                          <Target className="h-3 w-3 mr-1" />
                          Atacar
                        </Button>
                        
                        <div className="flex gap-1">
                          <Button
                            onClick={() => handleAttackRoll(attack.id, { advantage: true })}
                            disabled={isRolling}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            size="sm"
                            title="Vantagem"
                          >
                            <TrendingUp className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleAttackRoll(attack.id, { disadvantage: true })}
                            disabled={isRolling}
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                            size="sm"
                            title="Desvantagem"
                          >
                            <TrendingDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Rolagem de Dano */}
                      <div className="space-y-1">
                        <Button
                          onClick={() => handleDamageRoll(attack.id)}
                          disabled={isRolling}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                          size="sm"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Dano
                        </Button>
                        
                        <Button
                          onClick={() => handleDamageRoll(attack.id, { critical: true })}
                          disabled={isRolling}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          size="sm"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Crítico
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Sistema de Pontos de Vida Melhorado */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium">Pontos de Vida</span>
          </div>

          {/* Barra de HP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>HP Atual</span>
              <span className="text-green-400 font-semibold">{currentHP} / {maxHP}</span>
            </div>
            
            <Progress 
              value={hpPercentage} 
              className={`h-2 ${
                hpPercentage > 50 ? 'bg-green-500' :
                hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
          </div>

          {/* Botões de Dano/Cura */}
          <div className="grid grid-cols-6 gap-1">
            <Button variant="outline" size="sm" onClick={() => handleDamage(10)} className="bg-red-600 hover:bg-red-700 text-white">
              -10
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDamage(5)} className="bg-red-600 hover:bg-red-700 text-white">
              -5
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDamage(1)} className="bg-red-600 hover:bg-red-700 text-white">
              -1
            </Button>

            <Button variant="outline" size="sm" onClick={() => handleHeal(1)} className="bg-green-600 hover:bg-green-700 text-white">
              +1
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleHeal(5)} className="bg-green-600 hover:bg-green-700 text-white">
              +5
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleHeal(10)} className="bg-green-600 hover:bg-green-700 text-white">
              +10
            </Button>
          </div>

          {/* HP Temporário */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">HP Temporário</span>
              <span className="text-blue-400 text-sm">{tempHP}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleTempHPChange(tempHP - 1)} 
                className="h-8 w-8"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <Input
                type="number"
                value={tempHP}
                onChange={(e) => handleTempHPChange(parseInt(e.target.value) || 0)}
                className="text-center bg-gray-700 border-gray-600"
                min="0"
              />
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleTempHPChange(tempHP + 1)} 
                className="h-8 w-8"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTempHPChange(tempHP + 1)} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                +1
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTempHPChange(tempHP + 5)} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                +5
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NPCCard;