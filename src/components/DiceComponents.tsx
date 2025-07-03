import React, { useState, useEffect } from 'react';
import { 
  Dice6, 
  Swords, 
  Zap, 
  Target, 
  Heart, 
  Shield, 
  Eye,
  Star,
  Wand2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  RotateCcw
} from 'lucide-react';

// ===========================
// TIPOS E INTERFACES
// ===========================

interface DiceRoll {
  dice_count: number;
  dice_sides: number;
  modifier: number;
}

interface RollResult {
  total: number;
  rolls: number[];
  modifier: number;
  formula: string;
  timestamp: Date;
}

interface Attack {
  id?: string;
  name: string;
  attack_bonus: number;
  damage: DiceRoll;
  damage_type: string;
  range: string;
  description?: string;
}

interface Spell {
  id?: string;
  name: string;
  level: number;
  school: string;
  description?: string;
  is_attack_spell: boolean;
  attack_bonus?: number;
  damage?: DiceRoll;
  damage_type?: string;
  save_dc?: number;
  save_ability?: string;
  range: string;
}

// ===========================
// UTILITÁRIOS DE DADOS
// ===========================

function rollSingleDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function rollMultipleDice(count: number, sides: number): number[] {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollSingleDie(sides));
  }
  return rolls;
}

function rollDice(
  roll: DiceRoll, 
  advantage: boolean = false, 
  disadvantage: boolean = false
): RollResult {
  const isD20 = roll.dice_count === 1 && roll.dice_sides === 20;
  
  let rolls: number[];
  let total: number;
  
  if (isD20 && (advantage || disadvantage)) {
    const roll1 = rollSingleDie(20);
    const roll2 = rollSingleDie(20);
    
    if (advantage) {
      total = Math.max(roll1, roll2) + roll.modifier;
      rolls = [roll1, roll2];
    } else {
      total = Math.min(roll1, roll2) + roll.modifier;
      rolls = [roll1, roll2];
    }
  } else {
    rolls = rollMultipleDice(roll.dice_count, roll.dice_sides);
    total = rolls.reduce((sum, roll) => sum + roll, 0) + roll.modifier;
  }
  
  const formula = formatDiceRoll(roll);
  
  return {
    total,
    rolls,
    modifier: roll.modifier,
    formula,
    timestamp: new Date()
  };
}

function formatDiceRoll(roll: DiceRoll): string {
  const base = `${roll.dice_count}d${roll.dice_sides}`;
  if (roll.modifier === 0) return base;
  if (roll.modifier > 0) return `${base}+${roll.modifier}`;
  return `${base}${roll.modifier}`;
}

function formatModifier(modifier: number): string {
  if (modifier > 0) return `+${modifier}`;
  if (modifier < 0) return `${modifier}`;
  return '+0';
}

// ===========================
// COMPONENTE DICE ROLLER
// ===========================

interface DiceRollerProps {
  roll: DiceRoll;
  label: string;
  onRoll?: (result: RollResult) => void;
  className?: string;
  disabled?: boolean;
  advantage?: boolean;
  disadvantage?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showResult?: boolean;
  autoHideResult?: boolean;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  roll,
  label,
  onRoll,
  className = '',
  disabled = false,
  advantage = false,
  disadvantage = false,
  variant = 'primary',
  size = 'md',
  showResult = true,
  autoHideResult = true
}) => {
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    if (disabled || isRolling) return;
    
    setIsRolling(true);
    
    // Simular animação de rolagem
    setTimeout(() => {
      const result = rollDice(roll, advantage, disadvantage);
      setLastRoll(result);
      setIsRolling(false);
      onRoll?.(result);
    }, 600);
  };

  // Auto-esconder resultado após alguns segundos
  useEffect(() => {
    if (autoHideResult && lastRoll) {
      const timer = setTimeout(() => {
        setLastRoll(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastRoll, autoHideResult]);

  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20',
      secondary: 'bg-gray-500/10 border-gray-500/30 text-gray-400 hover:bg-gray-500/20',
      success: 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20',
      warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20',
      danger: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
    };
    return variants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };
    return sizes[size];
  };

  const getIconSize = () => {
    const sizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };
    return sizes[size];
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleRoll}
        disabled={disabled || isRolling}
        className={`
          font-medium rounded-lg border transition-all duration-200 
          flex items-center space-x-1 hover:scale-105
          ${getSizeClasses()}
          ${disabled || isRolling 
            ? 'opacity-50 cursor-not-allowed' 
            : getVariantClasses()
          }
        `}
        title={`Rolar ${formatDiceRoll(roll)}${advantage ? ' (Vantagem)' : ''}${disadvantage ? ' (Desvantagem)' : ''}`}
      >
        <Dice6 className={`${getIconSize()} ${isRolling ? 'animate-spin' : ''}`} />
        <span>{formatDiceRoll(roll)}</span>
        {advantage && <TrendingUp className="w-3 h-3 text-green-400" />}
        {disadvantage && <TrendingDown className="w-3 h-3 text-red-400" />}
      </button>
      
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      
      {showResult && lastRoll && (
        <div className="flex items-center space-x-2">
          <div className="text-sm font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/30 flex items-center space-x-1">
            <span>{lastRoll.total}</span>
            {(advantage || disadvantage) && (
              <span className="text-xs text-gray-400">
                [{lastRoll.rolls.join(', ')}]
              </span>
            )}
          </div>
          
          {lastRoll.rolls.length === 1 && lastRoll.rolls[0] === 20 && roll.dice_sides === 20 && (
            <Star className="w-4 h-4 text-yellow-400 animate-pulse" title="Acerto Crítico!" />
          )}
          
          {lastRoll.rolls.length === 1 && lastRoll.rolls[0] === 1 && roll.dice_sides === 20 && (
            <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse" title="Falha Crítica!" />
          )}
        </div>
      )}
    </div>
  );
};

// ===========================
// COMPONENTE ATTACK CARD
// ===========================

interface AttackCardProps {
  attack: Attack;
  npcName?: string;
  onRoll?: (type: 'attack' | 'damage', result: RollResult) => void;
  onEdit?: (attack: Attack) => void;
  onDelete?: (attackId: string) => void;
  readOnly?: boolean;
  compact?: boolean;
}

export const AttackCard: React.FC<AttackCardProps> = ({
  attack,
  npcName = '',
  onRoll,
  onEdit,
  onDelete,
  readOnly = false,
  compact = false
}) => {
  const [rollHistory, setRollHistory] = useState<Array<{type: string, result: RollResult}>>([]);

  const handleRoll = (type: 'attack' | 'damage', result: RollResult) => {
    setRollHistory(prev => [...prev.slice(-4), { type, result }]);
    onRoll?.(type, result);
  };

  if (compact) {
    return (
      <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Swords className="w-4 h-4 text-orange-400" />
            <span className="font-medium text-white">{attack.name}</span>
            <span className="text-xs text-gray-400 bg-gray-600/50 px-2 py-1 rounded">
              {attack.damage_type}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <DiceRoller
            roll={{ dice_count: 1, dice_sides: 20, modifier: attack.attack_bonus }}
            label="Ataque"
            onRoll={(result) => handleRoll('attack', result)}
            variant="warning"
            size="sm"
          />
          
          <DiceRoller
            roll={attack.damage}
            label="Dano"
            onRoll={(result) => handleRoll('damage', result)}
            variant="danger"
            size="sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50 hover:border-gray-500/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <Swords className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h4 className="font-medium text-white">{attack.name}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{attack.range}</span>
              <span>•</span>
              <span className="bg-gray-600/50 px-2 py-1 rounded text-xs">
                {attack.damage_type}
              </span>
            </div>
          </div>
        </div>
        
        {!readOnly && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(attack)}
                className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                title="Editar ataque"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onDelete && attack.id && (
              <button
                onClick={() => onDelete(attack.id!)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="Remover ataque"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {attack.description && (
        <p className="text-sm text-gray-300 mb-3">{attack.description}</p>
      )}

      <div className="flex items-center space-x-4 mb-3">
        <DiceRoller
          roll={{ dice_count: 1, dice_sides: 20, modifier: attack.attack_bonus }}
          label="Ataque"
          onRoll={(result) => handleRoll('attack', result)}
          variant="warning"
        />
        
        <DiceRoller
          roll={attack.damage}
          label="Dano"
          onRoll={(result) => handleRoll('damage', result)}
          variant="danger"
        />
      </div>

      {/* Histórico de rolagens recentes */}
      {rollHistory.length > 0 && (
        <div className="border-t border-gray-600/50 pt-3">
          <h5 className="text-xs font-medium text-gray-400 mb-2">Últimas rolagens:</h5>
          <div className="flex flex-wrap gap-2">
            {rollHistory.map((entry, index) => (
              <div
                key={index}
                className={`text-xs px-2 py-1 rounded border ${
                  entry.type === 'attack' 
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {entry.type === 'attack' ? 'Ataque' : 'Dano'}: {entry.result.total}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ===========================
// COMPONENTE SPELL CARD
// ===========================

interface SpellCardProps {
  spell: Spell;
  npcName?: string;
  onRoll?: (type: 'spell_attack' | 'spell_damage', result: RollResult) => void;
  onCast?: (spell: Spell, level?: number) => void;
  onEdit?: (spell: Spell) => void;
  onDelete?: (spellId: string) => void;
  readOnly?: boolean;
  compact?: boolean;
  showSpellSlots?: boolean;
}

export const SpellCard: React.FC<SpellCardProps> = ({
  spell,
  npcName = '',
  onRoll,
  onCast,
  onEdit,
  onDelete,
  readOnly = false,
  compact = false,
  showSpellSlots = false
}) => {
  const [rollHistory, setRollHistory] = useState<Array<{type: string, result: RollResult}>>([]);
  const [castLevel, setCastLevel] = useState(spell.level);

  const handleRoll = (type: 'spell_attack' | 'spell_damage', result: RollResult) => {
    setRollHistory(prev => [...prev.slice(-4), { type, result }]);
    onRoll?.(type, result);
  };

  const handleCast = () => {
    onCast?.(spell, castLevel);
  };

  const getSchoolColor = () => {
    const colors: Record<string, string> = {
      'Abjuração': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      'Conjuração': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      'Adivinhação': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      'Encantamento': 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      'Evocação': 'text-red-400 bg-red-500/10 border-red-500/30',
      'Ilusão': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      'Necromancia': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
      'Transmutação': 'text-green-400 bg-green-500/10 border-green-500/30'
    };
    return colors[spell.school] || colors['Evocação'];
  };

  const getLevelLabel = () => {
    if (spell.level === 0) return 'Truque';
    return `${spell.level}º Nível`;
  };

  if (compact) {
    return (
      <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Wand2 className="w-4 h-4 text-purple-400" />
            <span className="font-medium text-white">{spell.name}</span>
            <span className={`text-xs px-2 py-1 rounded border ${getSchoolColor()}`}>
              {getLevelLabel()}
            </span>
          </div>
        </div>
        
        {spell.is_attack_spell && spell.damage && (
          <div className="flex items-center space-x-4">
            {spell.attack_bonus !== undefined && (
              <DiceRoller
                roll={{ dice_count: 1, dice_sides: 20, modifier: spell.attack_bonus }}
                label="Ataque Mágico"
                onRoll={(result) => handleRoll('spell_attack', result)}
                variant="primary"
                size="sm"
              />
            )}
            
            <DiceRoller
              roll={spell.damage}
              label="Dano Mágico"
              onRoll={(result) => handleRoll('spell_damage', result)}
              variant="danger"
              size="sm"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50 hover:border-gray-500/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="font-medium text-white">{spell.name}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span className={`px-2 py-1 rounded border text-xs ${getSchoolColor()}`}>
                {spell.school}
              </span>
              <span className="bg-gray-600/50 px-2 py-1 rounded text-xs">
                {getLevelLabel()}
              </span>
              <span>{spell.range}</span>
            </div>
          </div>
        </div>
        
        {!readOnly && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(spell)}
                className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                title="Editar magia"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onDelete && spell.id && (
              <button
                onClick={() => onDelete(spell.id!)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="Remover magia"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {spell.description && (
        <p className="text-sm text-gray-300 mb-3">{spell.description}</p>
      )}

      {/* Ações da magia */}
      <div className="space-y-3">
        {/* Informações de CD de resistência */}
        {spell.save_dc && spell.save_ability && (
          <div className="flex items-center space-x-2 text-sm">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">
              CD {spell.save_dc} {spell.save_ability} para resistir
            </span>
          </div>
        )}

        {/* Botões de rolagem para magias de ataque */}
        {spell.is_attack_spell && spell.damage && (
          <div className="flex items-center space-x-4">
            {spell.attack_bonus !== undefined && (
              <DiceRoller
                roll={{ dice_count: 1, dice_sides: 20, modifier: spell.attack_bonus }}
                label="Ataque Mágico"
                onRoll={(result) => handleRoll('spell_attack', result)}
                variant="primary"
              />
            )}
            
            <DiceRoller
              roll={spell.damage}
              label={`Dano ${spell.damage_type || 'mágico'}`}
              onRoll={(result) => handleRoll('spell_damage', result)}
              variant="danger"
            />
          </div>
        )}

        {/* Seletor de nível para conjuração em nível superior */}
        {spell.level > 0 && spell.level < 9 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">Conjurar no nível:</span>
            <select
              value={castLevel}
              onChange={(e) => setCastLevel(parseInt(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            >
              {Array.from({ length: 10 - spell.level }, (_, i) => spell.level + i).map(level => (
                <option key={level} value={level}>
                  {level}º
                </option>
              ))}
            </select>
            
            <button
              onClick={handleCast}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Conjurar</span>
            </button>
          </div>
        )}

        {/* Histórico de rolagens recentes */}
        {rollHistory.length > 0 && (
          <div className="border-t border-gray-600/50 pt-3">
            <h5 className="text-xs font-medium text-gray-400 mb-2">Últimas rolagens:</h5>
            <div className="flex flex-wrap gap-2">
              {rollHistory.map((entry, index) => (
                <div
                  key={index}
                  className={`text-xs px-2 py-1 rounded border ${
                    entry.type === 'spell_attack' 
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  {entry.type === 'spell_attack' ? 'Ataque' : 'Dano'}: {entry.result.total}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===========================
// COMPONENTE DE DEMONSTRAÇÃO
// ===========================

export const DiceSystemDemo: React.FC = () => {
  const [rollLog, setRollLog] = useState<Array<{type: string, result: RollResult, timestamp: Date}>>([]);

  const exampleAttack: Attack = {
    id: '1',
    name: 'Espada Longa',
    attack_bonus: 5,
    damage: { dice_count: 1, dice_sides: 8, modifier: 3 },
    damage_type: 'cortante',
    range: 'Corpo a corpo',
    description: 'Um ataque com espada longa bem equilibrada.'
  };

  const exampleSpell: Spell = {
    id: '1',
    name: 'Mísseis Mágicos',
    level: 1,
    school: 'Evocação',
    description: 'Três dardos de energia mágica atingem automaticamente seus alvos.',
    is_attack_spell: true,
    damage: { dice_count: 3, dice_sides: 4, modifier: 3 },
    damage_type: 'força',
    range: '120 ft'
  };

  const handleRoll = (type: string, result: RollResult) => {
    setRollLog(prev => [
      { type, result, timestamp: new Date() },
      ...prev.slice(0, 9)
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Sistema de Dados D&D 5e</h1>
          <p className="text-gray-400">
            Demonstração dos componentes de rolagem de dados para NPCs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Componentes de Dados */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Roladores de Dados</h2>
              <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                <DiceRoller
                  roll={{ dice_count: 1, dice_sides: 20, modifier: 5 }}
                  label="d20 + 5"
                  onRoll={(result) => handleRoll('D20+5', result)}
                />
                
                <DiceRoller
                  roll={{ dice_count: 2, dice_sides: 6, modifier: 3 }}
                  label="2d6 + 3"
                  onRoll={(result) => handleRoll('2d6+3', result)}
                  variant="danger"
                />
                
                <DiceRoller
                  roll={{ dice_count: 1, dice_sides: 20, modifier: 2 }}
                  label="Vantagem"
                  onRoll={(result) => handleRoll('Vantagem', result)}
                  advantage={true}
                  variant="success"
                />
                
                <DiceRoller
                  roll={{ dice_count: 1, dice_sides: 20, modifier: 2 }}
                  label="Desvantagem"
                  onRoll={(result) => handleRoll('Desvantagem', result)}
                  disadvantage={true}
                  variant="warning"
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Card de Ataque</h2>
              <AttackCard
                attack={exampleAttack}
                npcName="Guarda Elite"
                onRoll={(type, result) => handleRoll(`Ataque - ${type}`, result)}
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Card de Magia</h2>
              <SpellCard
                spell={exampleSpell}
                npcName="Mago Iniciante"
                onRoll={(type, result) => handleRoll(`Magia - ${type}`, result)}
                onCast={(spell, level) => console.log(`Conjurando ${spell.name} no nível ${level}`)}
              />
            </div>
          </div>

          {/* Log de Rolagens */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Log de Rolagens</h2>
            <div className="bg-gray-800 rounded-lg p-6 max-h-96 overflow-y-auto">
              {rollLog.length === 0 ? (
                <p className="text-gray-400 text-center">Nenhuma rolagem ainda</p>
              ) : (
                <div className="space-y-2">
                  {rollLog.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-700/50 rounded border border-gray-600/50"
                    >
                      <div>
                        <span className="font-medium text-white">{entry.type}</span>
                        <div className="text-sm text-gray-400">
                          {entry.result.formula} = [{entry.result.rolls.join(', ')}] 
                          {entry.result.modifier !== 0 && ` + ${entry.result.modifier}`}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-green-400">
                        {entry.result.total}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {rollLog.length > 0 && (
              <button
                onClick={() => setRollLog([])}
                className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Limpar Log
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};