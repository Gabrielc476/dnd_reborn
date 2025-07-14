// ===========================
// useCharacterEquipment.ts
// Hook para gerenciar equipamentos do personagem
// ===========================

import { useState, useCallback, useMemo } from 'react';
import { EquipmentItem, DndReference } from '@/types/characterCreation';

// Interface específica do hook que estende EquipmentItem
export interface Equipment extends EquipmentItem {
  quantity: number;
  equipped?: boolean;
  proficient?: boolean;
  source?: 'class' | 'background' | 'race' | 'purchased' | 'custom';
}

export interface StartingEquipment {
  classEquipment: Equipment[];
  backgroundEquipment: Equipment[];
  racialEquipment: Equipment[];
  purchasedEquipment: Equipment[];
}

const useCharacterEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [startingGold, setStartingGold] = useState(0);
  const [useStartingEquipment, setUseStartingEquipment] = useState(true);
  const [remainingGold, setRemainingGold] = useState(0);

  // Adicionar equipamento
  const addEquipment = useCallback((item: Omit<Equipment, 'quantity'> & { quantity?: number }) => {
    const newItem: Equipment = {
      ...item,
      quantity: item.quantity || 1,
      equipped: false,
    };

    setEquipment(prev => {
      const existingIndex = prev.findIndex(eq => eq.index === item.index);
      if (existingIndex >= 0) {
        // Se já existe, aumentar quantidade
        return prev.map((eq, index) => 
          index === existingIndex 
            ? { ...eq, quantity: eq.quantity + newItem.quantity }
            : eq
        );
      } else {
        // Adicionar novo item
        return [...prev, newItem];
      }
    });
  }, []);

  // Remover equipamento
  const removeEquipment = useCallback((index: string, quantityToRemove?: number) => {
    setEquipment(prev => {
      return prev.reduce((acc, item) => {
        if (item.index === index) {
          const newQuantity = item.quantity - (quantityToRemove || item.quantity);
          if (newQuantity > 0) {
            acc.push({ ...item, quantity: newQuantity, equipped: false });
          }
          // Se quantity <= 0, item é removido (não é adicionado ao acc)
        } else {
          acc.push(item);
        }
        return acc;
      }, [] as Equipment[]);
    });
  }, []);

  // Atualizar quantidade
  const updateQuantity = useCallback((index: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeEquipment(index);
      return;
    }

    setEquipment(prev => prev.map(item => 
      item.index === index ? { ...item, quantity: newQuantity } : item
    ));
  }, [removeEquipment]);

  // Toggle equipado
  const toggleEquipped = useCallback((index: string) => {
    setEquipment(prev => prev.map(item => {
      if (item.index === index) {
        const newEquipped = !item.equipped;
        
        // Lógica para desequipar outros itens do mesmo tipo se necessário
        if (newEquipped && item.equipment_category) {
          // Para armaduras, desequipar outras armaduras
          if (item.equipment_category.index === 'armor') {
            return prev.map(eq => 
              eq.equipment_category?.index === 'armor' && eq.index !== index
                ? { ...eq, equipped: false }
                : eq.index === index
                ? { ...eq, equipped: newEquipped }
                : eq
            );
          }
        }
        
        return { ...item, equipped: newEquipped };
      }
      return item;
    }));
  }, []);

  // Configurar equipamento da classe
  const setClassEquipment = useCallback((classEquipment: Equipment[]) => {
    // Remover equipamentos antigos da classe
    setEquipment(prev => prev.filter(item => item.source !== 'class'));
    
    // Adicionar novos equipamentos da classe
    const equipmentWithSource = classEquipment.map(item => ({
      ...item,
      source: 'class' as const
    }));
    
    setEquipment(prev => [...prev, ...equipmentWithSource]);
  }, []);

  // Configurar equipamento do background
  const setBackgroundEquipment = useCallback((backgroundEquipment: Equipment[]) => {
    // Remover equipamentos antigos do background
    setEquipment(prev => prev.filter(item => item.source !== 'background'));
    
    // Adicionar novos equipamentos do background
    const equipmentWithSource = backgroundEquipment.map(item => ({
      ...item,
      source: 'background' as const
    }));
    
    setEquipment(prev => [...prev, ...equipmentWithSource]);
  }, []);

  // Configurar equipamento racial
  const setRacialEquipment = useCallback((racialEquipment: Equipment[]) => {
    // Remover equipamentos antigos da raça
    setEquipment(prev => prev.filter(item => item.source !== 'race'));
    
    // Adicionar novos equipamentos da raça
    const equipmentWithSource = racialEquipment.map(item => ({
      ...item,
      source: 'race' as const
    }));
    
    setEquipment(prev => [...prev, ...equipmentWithSource]);
  }, []);

  // Comprar equipamento
  const purchaseEquipment = useCallback((item: Equipment) => {
    const cost = item.cost?.quantity || 0;
    
    if (remainingGold >= cost) {
      setRemainingGold(prev => prev - cost);
      addEquipment({ ...item, source: 'purchased' });
      return true;
    }
    
    return false;
  }, [remainingGold, addEquipment]);

  // Vender equipamento
  const sellEquipment = useCallback((index: string, quantity: number = 1) => {
    const item = equipment.find(eq => eq.index === index);
    if (!item || item.quantity < quantity) return false;
    
    const sellPrice = Math.floor((item.cost?.quantity || 0) * 0.5); // 50% do valor
    setRemainingGold(prev => prev + (sellPrice * quantity));
    
    if (item.quantity === quantity) {
      removeEquipment(index);
    } else {
      updateQuantity(index, item.quantity - quantity);
    }
    
    return true;
  }, [equipment, removeEquipment, updateQuantity]);

  // Toggle método de equipamento
  const toggleEquipmentMethod = useCallback(() => {
    setUseStartingEquipment(prev => !prev);
    
    if (!useStartingEquipment) {
      // Mudando para starting equipment - limpar compras
      setEquipment(prev => prev.filter(item => item.source !== 'purchased'));
      setRemainingGold(0);
    } else {
      // Mudando para gold - definir gold inicial
      setRemainingGold(startingGold);
    }
  }, [useStartingEquipment, startingGold]);

  // Helpers para conversão de moeda
  const convertToGold = useCallback((cost: { quantity: number; unit: string }) => {
    const conversions: Record<string, number> = {
      'cp': 0.01,
      'sp': 0.1,
      'ep': 0.5,
      'gp': 1,
      'pp': 10
    };
    
    return cost.quantity * (conversions[cost.unit] || 1);
  }, []);

  // Computed values
  const totalWeight = useMemo(() => {
    return equipment.reduce((total, item) => {
      return total + ((item.weight || 0) * item.quantity);
    }, 0);
  }, [equipment]);

  const totalValue = useMemo(() => {
    return equipment.reduce((total, item) => {
      if (item.cost) {
        return total + (convertToGold(item.cost) * item.quantity);
      }
      return total;
    }, 0);
  }, [equipment, convertToGold]);

  const equippedArmorAC = useMemo(() => {
    const equippedArmor = equipment.find(item => 
      item.equipped && 
      item.equipment_category?.index === 'armor' &&
      item.armor_class
    );
    
    return equippedArmor?.armor_class?.base || 10;
  }, [equipment]);

  const equippedShield = useMemo(() => {
    return equipment.find(item => 
      item.equipped && 
      item.equipment_category?.index === 'armor' &&
      item.gear_category?.index === 'shields'
    );
  }, [equipment]);

  const equippedWeapons = useMemo(() => {
    return equipment.filter(item => 
      item.equipped && 
      item.equipment_category?.index === 'weapon'
    );
  }, [equipment]);

  const equipmentByType = useMemo(() => {
    return equipment.reduce((acc, item) => {
      const category = item.equipment_category?.index || 'misc';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, Equipment[]>);
  }, [equipment]);

  // Capacidade de carga
  const getCarryingCapacity = useCallback((strengthScore: number) => {
    return strengthScore * 15; // Regra básica do D&D 5e
  }, []);

  // Reset
  const reset = useCallback(() => {
    setEquipment([]);
    setStartingGold(0);
    setRemainingGold(0);
    setUseStartingEquipment(true);
  }, []);

  // Validação
  const isValid = useMemo(() => {
    if (useStartingEquipment) {
      // Com equipamento inicial, sempre válido
      return true;
    } else {
      // Com compra, verificar se tem pelo menos uma arma e armadura
      const hasWeapon = equipment.some(item => item.equipment_category?.index === 'weapon');
      const hasArmor = equipment.some(item => 
        item.equipment_category?.index === 'armor' || 
        item.gear_category?.index === 'shields'
      );
      return hasWeapon && hasArmor;
    }
  }, [useStartingEquipment, equipment]);

  return {
    // State
    equipment,
    startingGold,
    remainingGold,
    useStartingEquipment,
    
    // Actions
    addEquipment,
    removeEquipment,
    updateQuantity,
    toggleEquipped,
    setClassEquipment,
    setBackgroundEquipment,
    setRacialEquipment,
    purchaseEquipment,
    sellEquipment,
    toggleEquipmentMethod,
    
    // Computed values
    totalWeight,
    totalValue,
    equippedArmorAC,
    equippedShield,
    equippedWeapons,
    equipmentByType,
    
    // Helpers
    convertToGold,
    getCarryingCapacity,
    
    // Validation
    isValid,
    
    // Utils
    reset,
    
    // Filters
    getEquipmentByType: (type: string) => equipment.filter(item => item.equipment_category?.index === type),
    getEquippedItems: () => equipment.filter(item => item.equipped),
    hasEquipment: (index: string) => equipment.some(item => item.index === index),
  };
};

export default useCharacterEquipment;