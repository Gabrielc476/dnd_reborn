// ===========================
// CARDS DE NPC MELHORADOS COM FUNÇÕES INTERNAS
// ===========================

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
  Minus
} from 'lucide-react';

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

  const getNPCTypeColor = (type: string) => {
    const colors = {
      'neutro': 'text-gray-400 bg-gray-500/20',
      'aliado': 'text-green-400 bg-green-500/20',
      'inimigo': 'text-red-400 bg-red-500/20',
      'mercador': 'text-yellow-400 bg-yellow-500/20',
    };
    return colors[type as keyof typeof colors] || colors['neutro'];
  };

  const getDamageTypeColor = (type: string) => {
    const colors = {
      'cortante': 'text-red-300',
      'perfurante': 'text-yellow-300',
      'contundente': 'text-blue-300',
      'fogo': 'text-orange-300',
      'frio': 'text-cyan-300',
      'elétrico': 'text-purple-300',
    };
    return colors[type as keyof typeof colors] || 'text-gray-300';
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
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4 relative">
      {/* Indicador de Carregamento */}
      {isRolling && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-75 rounded-lg flex items-center justify-center z-10">
          <div className="flex items-center space-x-2 text-white">
            <Activity className="w-5 h-5 animate-spin" />
            <span>Rolando dados...</span>
          </div>
        </div>
      )}

      {/* Header com Nome e Status */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-white">{npc.name}</h3>
            <div className={`w-2 h-2 rounded-full ${npc.is_alive ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs rounded ${getNPCTypeColor(npc.npc_type)}`}>
              {npc.npc_type}
            </span>
            <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
              CR {npc.challenge_rating}
            </span>
          </div>

          {npc.location && (
            <p className="text-sm text-gray-400">{npc.location}</p>
          )}
        </div>

        {/* Botões de Ação Diretos */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleView}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
            title="Visualizar"
          >
            <Eye className="w-4 h-4" />
          </button>

          {isGM && (
            <>
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={() => console.log(`Duplicar NPC: ${npc.id}`)}
                className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors"
                title="Duplicar"
              >
                <Copy className="w-4 h-4" />
              </button>

              {npc.is_alive ? (
                <button
                  onClick={handleKill}
                  className="p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded transition-colors"
                  title="Matar"
                >
                  <Skull className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleRevive}
                  className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                  title="Reviver"
                >
                  <Heart className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                title="Deletar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-gray-700 rounded">
          <div className="text-red-400 font-bold text-lg">{npc.stats.armor_class}</div>
          <div className="text-gray-400 text-xs">CA</div>
        </div>
        <div className="text-center p-3 bg-gray-700 rounded">
          <div className="text-green-400 font-bold text-lg">{currentHP}</div>
          <div className="text-gray-400 text-xs">PV</div>
        </div>
        <div className="text-center p-3 bg-gray-700 rounded">
          <div className="text-blue-400 font-bold text-lg">{npc.stats.speed}</div>
          <div className="text-gray-400 text-xs">VEL</div>
        </div>
      </div>

      {/* Seção de Ataques Detalhada */}
      {npc.attacks && npc.attacks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Swords className="w-4 h-4 text-red-400" />
            <h4 className="text-sm font-medium text-white">Ataques</h4>
          </div>

          <div className="space-y-2">
            {npc.attacks.map((attack) => (
              <div
                key={attack.id}
                className={`p-3 rounded-lg border transition-colors ${
                  selectedAttack === attack.id
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
              >
                {/* Nome do Ataque e Informações */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white text-sm">{attack.name}</span>
                    <span className="text-xs text-gray-400">({attack.range})</span>
                  </div>
                  <span className={`text-xs ${getDamageTypeColor(attack.damage_type)}`}>
                    {attack.damage_type}
                  </span>
                </div>

                {/* Estatísticas do Ataque */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">+{attack.attack_bonus}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
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
                    <button
                      onClick={() => handleAttackRoll(attack.id)}
                      disabled={isRolling}
                      className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <Target className="w-3 h-3" />
                      <span>Atacar</span>
                    </button>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleAttackRoll(attack.id, { advantage: true })}
                        disabled={isRolling}
                        className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
                        title="Vantagem"
                      >
                        <TrendingUp className="w-3 h-3 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleAttackRoll(attack.id, { disadvantage: true })}
                        disabled={isRolling}
                        className="flex-1 px-2 py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
                        title="Desvantagem"
                      >
                        <TrendingDown className="w-3 h-3 mx-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Rolagem de Dano */}
                  <div className="space-y-1">
                    <button
                      onClick={() => handleDamageRoll(attack.id)}
                      disabled={isRolling}
                      className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Dano</span>
                    </button>
                    
                    <button
                      onClick={() => handleDamageRoll(attack.id, { critical: true })}
                      disabled={isRolling}
                      className="w-full px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <Star className="w-3 h-3" />
                      <span>Crítico</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sistema de Pontos de Vida Melhorado */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Pontos de Vida</span>
          </div>
        </div>

        {/* Barra de HP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white">HP Atual</span>
            <span className="text-green-400 font-semibold">{currentHP} / {maxHP}</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                hpPercentage > 50 ? 'bg-green-500' :
                hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.max(0, hpPercentage)}%` }}
            />
          </div>
        </div>

        {/* Botões de Dano/Cura */}
        <div className="grid grid-cols-6 gap-1">
          {/* Botões de Dano */}
          <button
            onClick={() => handleDamage(10)}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
          >
            -10
          </button>
          <button
            onClick={() => handleDamage(5)}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
          >
            -5
          </button>
          <button
            onClick={() => handleDamage(1)}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
          >
            -1
          </button>

          {/* Botões de Cura */}
          <button
            onClick={() => handleHeal(1)}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
          >
            +1
          </button>
          <button
            onClick={() => handleHeal(5)}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
          >
            +5
          </button>
          <button
            onClick={() => handleHeal(10)}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
          >
            +10
          </button>
        </div>

        {/* HP Temporário */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">HP Temporário</span>
            <span className="text-blue-400 text-sm">{tempHP}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleTempHPChange(tempHP - 1)}
              className="p-1 bg-gray-600 hover:bg-gray-500 rounded text-white"
            >
              <Minus className="w-3 h-3" />
            </button>
            
            <input
              type="number"
              value={tempHP}
              onChange={(e) => handleTempHPChange(parseInt(e.target.value) || 0)}
              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm"
              min="0"
            />
            
            <button
              onClick={() => handleTempHPChange(tempHP + 1)}
              className="p-1 bg-gray-600 hover:bg-gray-500 rounded text-white"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleTempHPChange(tempHP + 1)}
              className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
            >
              +1
            </button>
            <button
              onClick={() => handleTempHPChange(tempHP + 5)}
              className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
            >
              +5
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPCCard;