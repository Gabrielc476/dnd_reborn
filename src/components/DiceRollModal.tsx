import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Wand2, Dice6, Zap, Target, Shield, Sparkles } from 'lucide-react';

export interface DiceRollModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  diceRoll: number;
  modifier: number;
  total: number;
  isCritical: boolean;
  isCriticalFailure: boolean;
  attributeName: string;
  isProficient?: boolean;
  proficiencyBonus?: number;
  // Props adicionais para magias
  isSpell?: boolean;
  spellName?: string;
  spellLevel?: number;
  damage?: string;
  spellAttackBonus?: number;
  spellSaveDC?: number;
}

const DiceRollModal: React.FC<DiceRollModalProps> = ({
  isOpen,
  onClose,
  title,
  diceRoll,
  modifier,
  total,
  isCritical,
  isCriticalFailure,
  attributeName,
  isProficient = false,
  proficiencyBonus = 0,
  // Props de magia
  isSpell = false,
  spellName,
  spellLevel,
  damage,
  spellAttackBonus,
  spellSaveDC
}) => {
  const [rolling, setRolling] = useState(true);
  const [displayRoll, setDisplayRoll] = useState(0);
  
  useEffect(() => {
    if (!isOpen) return;

    setRolling(true);
    setDisplayRoll(0);

    let current = 0;
    const interval = setInterval(() => {
      current = (current % 20) + 1;
      setDisplayRoll(current);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      setRolling(false);
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, diceRoll]);

  if (!isOpen) return null;

  const bigNumber = rolling ? displayRoll : total;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-purple-500/50 shadow-2xl p-6 max-w-md w-full relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-center text-white mb-2 flex items-center justify-center gap-2">
          {isSpell ? <Wand2 className="w-6 h-6 text-purple-400" /> : <Dice6 className="w-6 h-6 text-blue-400" />}
          {title} {!isSpell && `– ${attributeName}`}
        </h2>

        {/* Renderização condicional para magias */}
        {isSpell && spellName && (
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-purple-300">{spellName}</h3>
            {spellLevel && (
              <p className="text-sm text-gray-400">
                {spellLevel === 0 ? 'Truque' : `Nível ${spellLevel}`}
              </p>
            )}
          </div>
        )}
        
        <div className="flex flex-col items-center my-8">
          <div className="relative">
            <div
              className={`text-7xl font-bold mb-4 transition-all duration-300 ${
                rolling
                  ? 'text-yellow-400 animate-bounce'
                  : isCritical
                    ? 'text-green-400'
                    : isCriticalFailure
                      ? 'text-red-400'
                      : 'text-white'
              }`}
            >
              {bigNumber}
            </div>
            
            {!rolling && (
              <div className="absolute -top-6 left-0 right-0 text-center">
                {isCritical && <span className="text-green-400 font-bold text-lg animate-pulse">🎯 CRÍTICO!</span>}
                {isCriticalFailure && <span className="text-red-400 font-bold text-lg animate-pulse">💥 FALHA CRÍTICA!</span>}
              </div>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-gray-300 text-lg mb-2">
              {diceRoll} {modifier >= 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`}
              {isProficient && <span> + {proficiencyBonus} (proficiência)</span>}
              <span> = </span>
              <span className="font-bold text-xl text-white">{total}</span>
            </div>
            
            {!isProficient && !isSpell && (
              <div className="text-yellow-500 text-sm mt-2">
                ⚠️ Não proficiente neste teste
              </div>
            )}
          </div>
        </div>

        {/* Seção adicional para magias */}
        {isSpell && !rolling && (
          <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Resultado da Magia
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
              {damage && (
                <div className="flex items-center justify-between bg-gray-800/50 rounded p-2">
                  <span className="text-gray-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-400" />
                    Dano:
                  </span>
                  <span className="text-red-400 font-bold">
                    {damage} {isCritical ? '(dobrado!)' : ''}
                  </span>
                </div>
              )}
              
              {spellAttackBonus !== undefined && (
                <div className="flex items-center justify-between bg-gray-800/50 rounded p-2">
                  <span className="text-gray-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    Ataque de Magia:
                  </span>
                  <span className="text-blue-400 font-bold">+{spellAttackBonus}</span>
                </div>
              )}
              
              {spellSaveDC && (
                <div className="flex items-center justify-between bg-gray-800/50 rounded p-2">
                  <span className="text-gray-300 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    CD de Resistência:
                  </span>
                  <span className="text-green-400 font-bold">{spellSaveDC}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-center mt-4">
          <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiceRollModal;