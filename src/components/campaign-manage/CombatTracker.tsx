import React, { useState } from 'react';
import { 
  Sword,
  ChevronUp,
  ChevronDown,
  Plus,
  Heart,
  Shield,
  Skull,
  Zap,
  Dice6,
  Target,
  SkipForward,
  Minus,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useManageCampaignContext } from '@/hooks/useManageCampaign';

const CombatTracker = () => {
  const {
    dashboard,
    updateEncounter,
    completeEncounter,
    canPerformAction
  } = useManageCampaignContext();

  // Estado local para combate
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);

  // Dados mockados para demonstração - em produção viriam do dashboard
  const combatants = [
    { 
      id: 1, 
      name: "Aragorn", 
      type: "player", 
      class: "Fighter", 
      hp: 45, 
      maxHp: 60, 
      ac: 18, 
      initiative: 20,
      status: "ready",
      conditions: [],
      tempHp: 0
    },
    { 
      id: 2, 
      name: "Goblin Chief", 
      type: "enemy", 
      class: "Enemy", 
      hp: 8, 
      maxHp: 15, 
      ac: 16, 
      initiative: 15,
      status: "injured",
      conditions: ["bleeding"],
      tempHp: 0
    },
    { 
      id: 3, 
      name: "Legolas", 
      type: "player", 
      class: "Ranger", 
      hp: 38, 
      maxHp: 45, 
      ac: 15, 
      initiative: 18,
      status: "ready",
      conditions: [],
      tempHp: 3
    },
    { 
      id: 4, 
      name: "Goblin Warrior", 
      type: "enemy", 
      class: "Enemy", 
      hp: 0, 
      maxHp: 12, 
      ac: 14, 
      initiative: 12,
      status: "dead",
      conditions: ["dead"],
      tempHp: 0
    }
  ];

  const getHpBarColor = (hp: number, maxHp: number) => {
    const percentage = (hp / maxHp) * 100;
    if (percentage > 70) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    if (percentage > 0) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-400';
      case 'injured': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      case 'dead': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  const handleDamage = (id: number, amount: number) => {
    // Lógica para aplicar dano
    console.log(`Aplicando ${amount} de dano ao combatente ${id}`);
  };

  const handleHeal = (id: number, amount: number) => {
    // Lógica para curar
    console.log(`Curando ${amount} HP do combatente ${id}`);
  };

  const nextTurn = () => {
    const aliveCombatants = combatants.filter(c => c.status !== 'dead');
    if (currentTurn >= aliveCombatants.length - 1) {
      setCurrentTurn(0);
      setRound(prev => prev + 1);
    } else {
      setCurrentTurn(prev => prev + 1);
    }
  };

  const moveCombatant = (id: number, direction: 'up' | 'down') => {
    // Lógica para reordenar iniciativa
    console.log(`Movendo combatente ${id} para ${direction}`);
  };

  const addCondition = (id: number) => {
    // Lógica para adicionar condição
    console.log(`Adicionando condição ao combatente ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Combat Header */}
      <div className="bg-red-900 border border-red-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Sword className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">CENTRO DE CONTROLE DE COMBATE</h2>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-red-400">Rodada: {round}</span>
            <span className="text-red-400">
              Turno: {combatants.find((_, index) => index === currentTurn)?.name || 'N/A'}
            </span>
          </div>
        </div>

        {/* Combat Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button 
            onClick={nextTurn}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            <SkipForward className="w-4 h-4" />
            <span>Próximo Turno</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors">
            <Sword className="w-4 h-4" />
            <span>Ataque Rápido</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors">
            <Dice6 className="w-4 h-4" />
            <span>Rolagens em Massa</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors">
            <Heart className="w-4 h-4" />
            <span>Curar Todos</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turn Order */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>Ordem de Turno</span>
          </h3>
          
          <div className="space-y-2">
            {combatants
              .filter(c => c.status !== 'dead')
              .sort((a, b) => b.initiative - a.initiative)
              .map((combatant, index) => (
              <div 
                key={combatant.id}
                className={`flex items-center justify-between p-3 rounded transition-colors ${
                  index === currentTurn ? 'bg-blue-900 border border-blue-600' : 'bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono text-gray-400">
                    {index === currentTurn ? '→' : '  '} {index + 1}.
                  </span>
                  <div>
                    <div className="font-medium text-white">
                      {combatant.name} ({combatant.class})
                    </div>
                    <div className="text-sm text-gray-400">
                      Iniciativa: {combatant.initiative}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => moveCombatant(combatant.id, 'up')}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => moveCombatant(combatant.id, 'down')}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 px-3 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Adicionar Combatente</span>
          </button>
        </div>

        {/* Life Tracker */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-400" />
            <span>Rastreador de Vida</span>
          </h3>
          
          <div className="space-y-4">
            {combatants.map((combatant) => (
              <div key={combatant.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {combatant.type === 'player' ? (
                      <Shield className="w-4 h-4 text-blue-400" />
                    ) : combatant.status === 'dead' ? (
                      <Skull className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Target className="w-4 h-4 text-red-400" />
                    )}
                    <span className="font-medium text-white">{combatant.name}</span>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    AC: {combatant.ac}
                  </div>
                </div>
                
                {/* HP Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={getStatusColor(combatant.status)}>
                      {combatant.hp}/{combatant.maxHp} HP
                    </span>
                    {combatant.tempHp > 0 && (
                      <span className="text-blue-400">+{combatant.tempHp} temp</span>
                    )}
                  </div>
                  
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getHpBarColor(combatant.hp, combatant.maxHp)}`}
                      style={{ width: `${Math.max(0, (combatant.hp / combatant.maxHp) * 100)}%` }}
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleDamage(combatant.id, 5)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                    >
                      -5
                    </button>
                    <button 
                      onClick={() => handleHeal(combatant.id, 5)}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
                    >
                      +5
                    </button>
                    <button className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors">
                      Full
                    </button>
                    {combatant.status !== 'dead' && (
                      <button 
                        onClick={() => addCondition(combatant.id)}
                        className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Condição</span>
                      </button>
                    )}
                  </div>
                  
                  {combatant.status === 'dead' && (
                    <button className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs transition-colors">
                      Reviver
                    </button>
                  )}
                </div>
                
                {/* Conditions */}
                {combatant.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {combatant.conditions.map((condition, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-purple-900 text-purple-300 rounded text-xs flex items-center space-x-1"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>{condition}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* End Combat Button */}
      <div className="flex justify-center">
        <button 
          onClick={() => completeEncounter(dashboard?.active_encounter?.id || '')}
          className="px-6 py-3 bg-red-700 hover:bg-red-800 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Square className="w-5 h-5" />
          <span>Encerrar Combate</span>
        </button>
      </div>
    </div>
  );
};

export default CombatTracker;