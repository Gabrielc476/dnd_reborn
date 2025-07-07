// ===========================
// HP MANAGER COMPONENT - VERSÃO COMPLETA
// Adicione este código ao seu arquivo src/components/DiceComponents.tsx
// ===========================

import React, { useState, useCallback } from 'react';
import { Heart, Plus, Minus, Shield, RotateCcw } from 'lucide-react';

// ===========================
// INTERFACES DO HP MANAGER
// ===========================

interface HPManagerProps {
  currentHP: number;
  maxHP: number;
  tempHP?: number;
  onHPChange: (newHP: number, newTempHP?: number) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  showQuickActions?: boolean;
  showTempHP?: boolean;
}

// ===========================
// COMPONENTE HP MANAGER
// ===========================

export const HPManager: React.FC<HPManagerProps> = ({
  currentHP,
  maxHP,
  tempHP = 0,
  onHPChange,
  disabled = false,
  compact = false,
  className = '',
  showQuickActions = true,
  showTempHP = true
}) => {
  const [inputMode, setInputMode] = useState(false);
  const [inputValue, setInputValue] = useState(currentHP.toString());
  const [tempInputValue, setTempInputValue] = useState(tempHP.toString());

  // Calculate HP percentage for the bar
  const hpPercentage = maxHP > 0 ? Math.min((currentHP / maxHP) * 100, 100) : 0;

  // Get color based on HP percentage
  const getHPColor = useCallback(() => {
    if (currentHP === 0) return 'bg-gray-500';
    if (hpPercentage <= 25) return 'bg-red-500';
    if (hpPercentage <= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  }, [currentHP, hpPercentage]);

  const getHPTextColor = useCallback(() => {
    if (currentHP === 0) return 'text-gray-400';
    if (hpPercentage <= 25) return 'text-red-400';
    if (hpPercentage <= 50) return 'text-yellow-400';
    return 'text-green-400';
  }, [currentHP, hpPercentage]);

  const getHPBorderColor = useCallback(() => {
    if (currentHP === 0) return 'border-gray-500/30';
    if (hpPercentage <= 25) return 'border-red-500/30';
    if (hpPercentage <= 50) return 'border-yellow-500/30';
    return 'border-green-500/30';
  }, [currentHP, hpPercentage]);

  // Quick adjustment functions
  const adjustHP = useCallback((amount: number) => {
    if (disabled) return;
    const newHP = Math.max(0, Math.min(maxHP, currentHP + amount));
    onHPChange(newHP, tempHP);
  }, [currentHP, maxHP, tempHP, onHPChange, disabled]);

  const adjustTempHP = useCallback((amount: number) => {
    if (disabled) return;
    const newTempHP = Math.max(0, tempHP + amount);
    onHPChange(currentHP, newTempHP);
  }, [currentHP, tempHP, onHPChange, disabled]);

  // Handle direct input
  const handleHPInputSubmit = useCallback(() => {
    if (disabled) return;
    const newHP = Math.max(0, Math.min(maxHP, parseInt(inputValue) || 0));
    onHPChange(newHP, tempHP);
    setInputMode(false);
  }, [inputValue, maxHP, tempHP, onHPChange, disabled]);

  const handleTempHPInputSubmit = useCallback(() => {
    if (disabled) return;
    const newTempHP = Math.max(0, parseInt(tempInputValue) || 0);
    onHPChange(currentHP, newTempHP);
  }, [tempInputValue, currentHP, onHPChange, disabled]);

  // Handle key events
  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleHPInputSubmit();
    } else if (e.key === 'Escape') {
      setInputMode(false);
      setInputValue(currentHP.toString());
    }
  }, [handleHPInputSubmit, currentHP]);

  const handleTempInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTempHPInputSubmit();
    } else if (e.key === 'Escape') {
      setTempInputValue(tempHP.toString());
    }
  }, [handleTempHPInputSubmit, tempHP]);

  // Reset functions
  const resetToMax = useCallback(() => {
    if (disabled) return;
    onHPChange(maxHP, tempHP);
  }, [maxHP, tempHP, onHPChange, disabled]);

  const resetTempHP = useCallback(() => {
    if (disabled) return;
    onHPChange(currentHP, 0);
    setTempInputValue('0');
  }, [currentHP, onHPChange, disabled]);

  // ===========================
  // MODO COMPACTO
  // ===========================
  
  if (compact) {
    return (
      <div className={`bg-gray-800/50 rounded-lg p-3 border ${getHPBorderColor()} ${className}`}>
        {/* HP Display */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-gray-300">HP</span>
          </div>
          <div className={`text-sm font-bold ${getHPTextColor()}`}>
            {currentHP}/{maxHP}
            {showTempHP && tempHP > 0 && (
              <span className="text-blue-400"> (+{tempHP})</span>
            )}
          </div>
        </div>

        {/* HP Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-3 overflow-hidden">
          <div 
            className={`h-2 transition-all duration-300 ${getHPColor()}`}
            style={{ width: `${hpPercentage}%` }}
          />
        </div>

        {/* Quick Controls */}
        {showQuickActions && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => adjustHP(-5)}
                disabled={disabled || currentHP === 0}
                className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reduzir 5 HP"
              >
                -5
              </button>
              <button
                onClick={() => adjustHP(-1)}
                disabled={disabled || currentHP === 0}
                className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reduzir 1 HP"
              >
                -1
              </button>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => adjustHP(1)}
                disabled={disabled || currentHP >= maxHP}
                className="px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Adicionar 1 HP"
              >
                +1
              </button>
              <button
                onClick={() => adjustHP(5)}
                disabled={disabled || currentHP >= maxHP}
                className="px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Adicionar 5 HP"
              >
                +5
              </button>
            </div>
          </div>
        )}

        {/* Temp HP in compact mode */}
        {showTempHP && tempHP > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-gray-400">Temp</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-blue-400 font-medium">{tempHP}</span>
                <button
                  onClick={resetTempHP}
                  disabled={disabled}
                  className="p-0.5 text-gray-400 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remover HP temporário"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===========================
  // MODO COMPLETO
  // ===========================

  return (
    <div className={`bg-gray-800/50 rounded-lg p-4 border ${getHPBorderColor()} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-400" />
          <h4 className="text-lg font-semibold text-white">Pontos de Vida</h4>
        </div>
        <button
          onClick={resetToMax}
          disabled={disabled || currentHP === maxHP}
          className="p-1 text-gray-400 hover:text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Restaurar HP máximo"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Current HP Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">HP Atual</span>
          <div className="flex items-center space-x-2">
            {inputMode ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={handleHPInputSubmit}
                  onKeyDown={handleInputKeyDown}
                  className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm text-center focus:border-blue-500 focus:outline-none"
                  min="0"
                  max={maxHP}
                  disabled={disabled}
                  autoFocus
                />
                <span className="text-gray-400">/ {maxHP}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!disabled) {
                    setInputMode(true);
                    setInputValue(currentHP.toString());
                  }
                }}
                disabled={disabled}
                className={`text-lg font-bold ${getHPTextColor()} hover:text-white transition-colors disabled:cursor-not-allowed`}
                title="Clique para editar HP diretamente"
              >
                {currentHP} / {maxHP}
              </button>
            )}
          </div>
        </div>

        {/* HP Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
          <div 
            className={`h-3 transition-all duration-300 ${getHPColor()}`}
            style={{ width: `${hpPercentage}%` }}
          />
        </div>

        {/* HP Controls */}
        {showQuickActions && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => adjustHP(-10)}
                disabled={disabled || currentHP === 0}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reduzir 10 HP"
              >
                -10
              </button>
              <button
                onClick={() => adjustHP(-5)}
                disabled={disabled || currentHP === 0}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reduzir 5 HP"
              >
                -5
              </button>
              <button
                onClick={() => adjustHP(-1)}
                disabled={disabled || currentHP === 0}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reduzir 1 HP"
              >
                -1
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => adjustHP(1)}
                disabled={disabled || currentHP >= maxHP}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Adicionar 1 HP"
              >
                +1
              </button>
              <button
                onClick={() => adjustHP(5)}
                disabled={disabled || currentHP >= maxHP}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Adicionar 5 HP"
              >
                +5
              </button>
              <button
                onClick={() => adjustHP(10)}
                disabled={disabled || currentHP >= maxHP}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Adicionar 10 HP"
              >
                +10
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Temporary HP Section */}
      {showTempHP && (
        <div className="border-t border-gray-600/50 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">HP Temporário</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={tempInputValue}
                onChange={(e) => setTempInputValue(e.target.value)}
                onBlur={handleTempHPInputSubmit}
                onKeyDown={handleTempInputKeyDown}
                className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-blue-400 text-sm text-center focus:border-blue-500 focus:outline-none"
                min="0"
                disabled={disabled}
                placeholder="0"
                title="Digite o valor de HP temporário"
              />
              <button
                onClick={resetTempHP}
                disabled={disabled || tempHP === 0}
                className="p-1 text-gray-400 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remover HP temporário"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Temp HP Controls */}
          {showQuickActions && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => adjustTempHP(-5)}
                disabled={disabled || tempHP === 0}
                className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reduzir 5 HP temporário"
              >
                -5
              </button>
              <button
                onClick={() => adjustTempHP(-1)}
                disabled={disabled || tempHP === 0}
                className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reduzir 1 HP temporário"
              >
                -1
              </button>
              <button
                onClick={() => adjustTempHP(1)}
                disabled={disabled}
                className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Adicionar 1 HP temporário"
              >
                +1
              </button>
              <button
                onClick={() => adjustTempHP(5)}
                disabled={disabled}
                className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Adicionar 5 HP temporário"
              >
                +5
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status Info */}
      <div className="mt-4">
        {currentHP === 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm text-center font-medium flex items-center justify-center space-x-2">
              <span>💀</span>
              <span>Personagem inconsciente</span>
            </p>
          </div>
        )}
        
        {hpPercentage <= 25 && currentHP > 0 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm text-center font-medium flex items-center justify-center space-x-2">
              <span>⚠️</span>
              <span>HP baixo - situação crítica!</span>
            </p>
          </div>
        )}

        {hpPercentage <= 50 && hpPercentage > 25 && currentHP > 0 && (
          <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-orange-400 text-xs text-center font-medium">
              HP moderadamente baixo
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ===========================
// HOOK PARA HP MANAGER
// ===========================

interface UseHPManagerProps {
  initialHP: number;
  maxHP: number;
  initialTempHP?: number;
  onHPChange?: (newHP: number, newTempHP: number) => void;
}

export const useHPManager = ({
  initialHP,
  maxHP,
  initialTempHP = 0,
  onHPChange
}: UseHPManagerProps) => {
  const [currentHP, setCurrentHP] = useState(initialHP);
  const [tempHP, setTempHP] = useState(initialTempHP);

  const handleHPChange = useCallback((newHP: number, newTempHP: number = tempHP) => {
    setCurrentHP(newHP);
    setTempHP(newTempHP);
    onHPChange?.(newHP, newTempHP);
  }, [tempHP, onHPChange]);

  const healToMax = useCallback(() => {
    handleHPChange(maxHP, tempHP);
  }, [maxHP, tempHP, handleHPChange]);

  const takeDamage = useCallback((damage: number) => {
    let remainingDamage = damage;
    let newTempHP = tempHP;
    let newCurrentHP = currentHP;

    // First apply damage to temp HP
    if (newTempHP > 0) {
      const tempDamage = Math.min(remainingDamage, newTempHP);
      newTempHP -= tempDamage;
      remainingDamage -= tempDamage;
    }

    // Then apply remaining damage to current HP
    if (remainingDamage > 0) {
      newCurrentHP = Math.max(0, newCurrentHP - remainingDamage);
    }

    handleHPChange(newCurrentHP, newTempHP);
  }, [currentHP, tempHP, handleHPChange]);

  const heal = useCallback((amount: number) => {
    const newHP = Math.min(maxHP, currentHP + amount);
    handleHPChange(newHP, tempHP);
  }, [currentHP, maxHP, tempHP, handleHPChange]);

  const addTempHP = useCallback((amount: number) => {
    // Temporary HP doesn't stack, take the higher value
    const newTempHP = Math.max(tempHP, amount);
    handleHPChange(currentHP, newTempHP);
  }, [currentHP, tempHP, handleHPChange]);

  return {
    currentHP,
    tempHP,
    maxHP,
    handleHPChange,
    healToMax,
    takeDamage,
    heal,
    addTempHP,
    isAlive: currentHP > 0,
    isCritical: currentHP > 0 && (currentHP / maxHP) <= 0.25,
    isHealthy: (currentHP / maxHP) > 0.75
  };
};