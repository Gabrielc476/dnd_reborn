// ===========================
// COMPONENTES DE ATAQUES MELHORADOS
// src/components/npc/AttackComponents.tsx
// ===========================

import React, { useState } from 'react';
import {
  Target,
  Sword,
  Zap,
  Star,
  TrendingUp,
  TrendingDown,
  Dice6,
  Plus,
  Minus,
  Settings,
  Activity,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Attack, RollResult, EnhancedNPC } from '@/types/enhancedNPC';

// ===========================
// INTERFACES
// ===========================

interface AttackButtonProps {
  attack: Attack;
  npc: EnhancedNPC;
  onRoll: (attackId: string, options?: AttackRollOptions) => void;
  onDamageRoll?: (attackId: string, options?: DamageRollOptions) => void;
  isRolling: boolean;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

interface AttackRollOptions {
  advantage?: boolean;
  disadvantage?: boolean;
  modifier?: number;
}

interface DamageRollOptions {
  critical?: boolean;
  modifier?: number;
  extraDice?: { count: number; sides: number };
}

interface AttackCardProps {
  attack: Attack;
  npc: EnhancedNPC;
  onAttackRoll: (attackId: string, options?: AttackRollOptions) => void;
  onDamageRoll: (attackId: string, options?: DamageRollOptions) => void;
  isRolling: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

// ===========================
// COMPONENTE: BOTÃO DE ATAQUE SIMPLES
// ===========================

export const AttackButton: React.FC<AttackButtonProps> = ({
  attack,
  npc,
  onRoll,
  onDamageRoll,
  isRolling,
  size = 'medium',
  showDetails = false
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [modifier, setModifier] = useState(0);

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  const handleQuickRoll = () => {
    onRoll(attack.id, { modifier });
  };

  const handleAdvantageRoll = () => {
    onRoll(attack.id, { advantage: true, modifier });
  };

  const handleDisadvantageRoll = () => {
    onRoll(attack.id, { disadvantage: true, modifier });
  };

  const handleDamageRoll = (critical: boolean = false) => {
    if (onDamageRoll) {
      onDamageRoll(attack.id, { critical, modifier });
    }
  };

  return (
    <div className="relative group">
      {/* Botão principal */}
      <button
        onClick={handleQuickRoll}
        disabled={isRolling}
        className={`
          flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 
          text-white rounded-lg transition-colors
          ${sizeClasses[size]}
          ${isRolling ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Target className={iconSizes[size]} />
        <span>{attack.name}</span>
        {showDetails && (
          <span className="text-red-200">
            +{attack.attack_bonus}
          </span>
        )}
        {isRolling && (
          <div className={`border border-white border-t-transparent rounded-full animate-spin ${iconSizes[size]}`} />
        )}
      </button>

      {/* Menu de opções avançadas */}
      <div className="absolute left-0 top-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20 min-w-52">
        <div className="p-3 space-y-2">
          {/* Título */}
          <div className="text-xs font-medium text-gray-300 border-b border-gray-600 pb-2">
            {attack.name} ({attack.range})
          </div>

          {/* Modificador personalizado */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Modificador:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setModifier(Math.max(-5, modifier - 1))}
                className="w-5 h-5 bg-gray-600 hover:bg-gray-500 rounded text-xs flex items-center justify-center"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center text-xs text-white">{modifier >= 0 ? '+' : ''}{modifier}</span>
              <button
                onClick={() => setModifier(Math.min(5, modifier + 1))}
                className="w-5 h-5 bg-gray-600 hover:bg-gray-500 rounded text-xs flex items-center justify-center"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-600 pt-2">
            <div className="grid grid-cols-1 gap-1">
              {/* Rolagem normal */}
              <button
                onClick={handleQuickRoll}
                disabled={isRolling}
                className="w-full px-2 py-1 text-left text-xs text-white hover:bg-gray-600 rounded flex items-center space-x-2"
              >
                <Target className="w-3 h-3" />
                <span>Ataque Normal</span>
                <span className="text-gray-400 ml-auto">1d20+{attack.attack_bonus + modifier}</span>
              </button>

              {/* Vantagem */}
              <button
                onClick={handleAdvantageRoll}
                disabled={isRolling}
                className="w-full px-2 py-1 text-left text-xs text-green-300 hover:bg-gray-600 rounded flex items-center space-x-2"
              >
                <TrendingUp className="w-3 h-3" />
                <span>Vantagem</span>
                <span className="text-gray-400 ml-auto">2d20kh1+{attack.attack_bonus + modifier}</span>
              </button>

              {/* Desvantagem */}
              <button
                onClick={handleDisadvantageRoll}
                disabled={isRolling}
                className="w-full px-2 py-1 text-left text-xs text-red-300 hover:bg-gray-600 rounded flex items-center space-x-2"
              >
                <TrendingDown className="w-3 h-3" />
                <span>Desvantagem</span>
                <span className="text-gray-400 ml-auto">2d20kl1+{attack.attack_bonus + modifier}</span>
              </button>

              {/* Separador de dano */}
              {onDamageRoll && (
                <>
                  <div className="border-t border-gray-600 my-1"></div>
                  
                  {/* Dano normal */}
                  <button
                    onClick={() => handleDamageRoll(false)}
                    disabled={isRolling}
                    className="w-full px-2 py-1 text-left text-xs text-yellow-300 hover:bg-gray-600 rounded flex items-center space-x-2"
                  >
                    <Sword className="w-3 h-3" />
                    <span>Dano</span>
                    <span className="text-gray-400 ml-auto">
                      {attack.damage.dice_count}d{attack.damage.dice_sides}+{attack.damage.modifier + modifier}
                    </span>
                  </button>

                  {/* Dano crítico */}
                  <button
                    onClick={() => handleDamageRoll(true)}
                    disabled={isRolling}
                    className="w-full px-2 py-1 text-left text-xs text-orange-300 hover:bg-gray-600 rounded flex items-center space-x-2"
                  >
                    <Star className="w-3 h-3" />
                    <span>Crítico</span>
                    <span className="text-gray-400 ml-auto">
                      {attack.damage.dice_count * 2}d{attack.damage.dice_sides}+{attack.damage.modifier + modifier}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Info do ataque */}
          {showDetails && attack.description && (
            <div className="border-t border-gray-600 pt-2">
              <div className="text-xs text-gray-400">
                {attack.description.substring(0, 100)}
                {attack.description.length > 100 && '...'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===========================
// COMPONENTE: CARD DE ATAQUE EXPANDIDO
// ===========================

export const AttackCard: React.FC<AttackCardProps> = ({
  attack,
  npc,
  onAttackRoll,
  onDamageRoll,
  isRolling,
  expanded = false,
  onToggleExpand
}) => {
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);

  const handleAttackRoll = async (options?: AttackRollOptions) => {
    await onAttackRoll(attack.id, options);
    // Aqui você poderia capturar o resultado se disponível
  };

  const handleDamageRoll = async (options?: DamageRollOptions) => {
    await onDamageRoll(attack.id, options);
    // Aqui você poderia capturar o resultado se disponível
  };

  const getDamageTypeColor = (type: string) => {
    const colors = {
      'cortante': 'text-red-400',
      'perfurante': 'text-yellow-400',
      'contundente': 'text-blue-400',
      'fogo': 'text-orange-400',
      'frio': 'text-cyan-400',
      'elétrico': 'text-purple-400',
      'ácido': 'text-green-400',
      'venenoso': 'text-emerald-400',
      'psíquico': 'text-pink-400',
      'necrótico': 'text-gray-400',
      'radiante': 'text-yellow-300',
      'força': 'text-blue-300',
      'sônico': 'text-indigo-400'
    };
    return colors[type as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      {/* Header do card */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Sword className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-white">{attack.name}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{attack.range}</span>
              <span>•</span>
              <span className={getDamageTypeColor(attack.damage_type)}>
                {attack.damage_type}
              </span>
            </div>
          </div>
        </div>

        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Estatísticas do ataque */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-700 rounded">
          <div className="text-green-400 font-semibold">+{attack.attack_bonus}</div>
          <div className="text-gray-400 text-xs">Bônus</div>
        </div>
        <div className="text-center p-2 bg-gray-700 rounded">
          <div className="text-red-400 font-semibold">
            {attack.damage.dice_count}d{attack.damage.dice_sides}+{attack.damage.modifier}
          </div>
          <div className="text-gray-400 text-xs">Dano</div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Ataque */}
        <div className="space-y-1">
          <button
            onClick={() => handleAttackRoll()}
            disabled={isRolling}
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors flex items-center justify-center space-x-2"
          >
            <Target className="w-4 h-4" />
            <span>Ataque</span>
          </button>
          
          <div className="flex space-x-1">
            <button
              onClick={() => handleAttackRoll({ advantage: true })}
              disabled={isRolling}
              className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
              title="Vantagem"
            >
              <TrendingUp className="w-3 h-3 mx-auto" />
            </button>
            <button
              onClick={() => handleAttackRoll({ disadvantage: true })}
              disabled={isRolling}
              className="flex-1 px-2 py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
              title="Desvantagem"
            >
              <TrendingDown className="w-3 h-3 mx-auto" />
            </button>
          </div>
        </div>

        {/* Dano */}
        <div className="space-y-1">
          <button
            onClick={() => handleDamageRoll()}
            disabled={isRolling}
            className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded transition-colors flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Dano</span>
          </button>
          
          <button
            onClick={() => handleDamageRoll({ critical: true })}
            disabled={isRolling}
            className="w-full px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors flex items-center justify-center space-x-1"
          >
            <Star className="w-3 h-3" />
            <span>Crítico</span>
          </button>
        </div>
      </div>

      {/* Descrição (se expandido) */}
      {expanded && attack.description && (
        <div className="pt-3 border-t border-gray-700">
          <p className="text-sm text-gray-300">{attack.description}</p>
        </div>
      )}

      {/* Último resultado */}
      {lastRoll && (
        <div className="pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Último resultado:</span>
            <span className="text-purple-400 font-semibold">
              {lastRoll.total}
              {lastRoll.rolls && ` (${lastRoll.rolls.join(', ')})`}
            </span>
          </div>
        </div>
      )}

      {/* Indicador de carregamento */}
      {isRolling && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-50 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2 text-white">
            <Dice6 className="w-5 h-5 animate-spin" />
            <span>Rolando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ===========================
// COMPONENTE: PAINEL DE ATAQUES
// ===========================

interface AttackPanelProps {
  npc: EnhancedNPC;
  onAttackRoll: (attackId: string, options?: AttackRollOptions) => void;
  onDamageRoll: (attackId: string, options?: DamageRollOptions) => void;
  isRolling: boolean;
  compact?: boolean;
}

export const AttackPanel: React.FC<AttackPanelProps> = ({
  npc,
  onAttackRoll,
  onDamageRoll,
  isRolling,
  compact = false
}) => {
  const [expandedAttack, setExpandedAttack] = useState<string | null>(null);

  if (!npc.attacks || npc.attacks.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        <Sword className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Nenhum ataque configurado</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
          <Swords className="w-4 h-4" />
          <span>Ataques ({npc.attacks.length})</span>
        </h4>
        
        <div className="flex flex-wrap gap-2">
          {npc.attacks.map(attack => (
            <AttackButton
              key={attack.id}
              attack={attack}
              npc={npc}
              onRoll={onAttackRoll}
              onDamageRoll={onDamageRoll}
              isRolling={isRolling}
              size="small"
              showDetails={false}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Swords className="w-5 h-5" />
          <span>Ataques</span>
        </h3>
        <span className="text-sm text-gray-400">{npc.attacks.length} disponíveis</span>
      </div>

      <div className="grid gap-4">
        {npc.attacks.map(attack => (
          <AttackCard
            key={attack.id}
            attack={attack}
            npc={npc}
            onAttackRoll={onAttackRoll}
            onDamageRoll={onDamageRoll}
            isRolling={isRolling}
            expanded={expandedAttack === attack.id}
            onToggleExpand={() => setExpandedAttack(
              expandedAttack === attack.id ? null : attack.id
            )}
          />
        ))}
      </div>
    </div>
  );
};

// ===========================
// COMPONENTE: MINI ATAQUE (para listas compactas)
// ===========================

interface MiniAttackButtonProps {
  attack: Attack;
  onRoll: () => void;
  isRolling: boolean;
}

export const MiniAttackButton: React.FC<MiniAttackButtonProps> = ({
  attack,
  onRoll,
  isRolling
}) => {
  return (
    <button
      onClick={onRoll}
      disabled={isRolling}
      className="group relative inline-flex items-center space-x-1 px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
      title={`${attack.name} (+${attack.attack_bonus} | ${attack.damage.dice_count}d${attack.damage.dice_sides}+${attack.damage.modifier})`}
    >
      <Target className="w-3 h-3" />
      <span className="truncate max-w-16">{attack.name}</span>
      {isRolling && <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
        {attack.name} | +{attack.attack_bonus} | {attack.damage.dice_count}d{attack.damage.dice_sides}+{attack.damage.modifier} {attack.damage_type}
      </div>
    </button>
  );
};