// ===========================
// useCharacterEquipment.ts
// Hook para gerenciar equipamentos do personagem
// ===========================

import { useState, useCallback, useMemo } from 'react';

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'shield' | 'tool' | 'item' | 'adventuring-gear';
  description?: string;
  cost?: {
    quantity: number;
    unit: 'gp' | 'sp' | 'cp' | 'ep' | 'pp';
  };
  weight?: number;
  properties?: string[];
  damage?: {
    dice_count: number;
    dice_sides: number;
    type: string;
  };
  armor_class?: {
    base: number;
    dex_bonus?: boolean;
    max_bonus?: number;
  };
  quantity: number;
  equipped?: boolean;
  proficient?: boolean;
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
      const existingIndex = prev.findIndex(eq => eq.id === item.id);
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
  const removeEquipment = useCallback((id: string, quantityToRemove?: number) => {
    setEquipment(prev => {
      return prev.reduce((acc, item) => {
        if (item.id === id) {
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
  const updateQuantity = useCallback((id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeEquipment(id);
      return;
    }

    setEquipment(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  }, [removeEquipment]);

  // Equipar/Desequipar item
  const toggleEquipped = useCallback((id: string) => {
    setEquipment(prev => prev.map(item => {
      if (item.id === id) {
        const newEquipped = !item.equipped;
        
        // Lógica especial para armaduras - só uma pode estar equipada
        if (newEquipped && item.type === 'armor') {
          // Desequipar outras armaduras
          return prev.map(eq => ({
            ...eq,
            equipped: eq.id === id ? true : (eq.type === 'armor' ? false : eq.equipped)
          }));
        }
        
        return { ...item, equipped: newEquipped };
      }
      return item;
    }));
  }, []);

  // Definir equipamento inicial de classe
  const setClassEquipment = useCallback((classEquipment: Equipment[]) => {
    // Remover equipamentos anteriores de classe
    setEquipment(prev => prev.filter(item => 
      !classEquipment.some(classItem => classItem.id === item.id)
    ));
    
    // Adicionar novos equipamentos de classe
    classEquipment.forEach(item => {
      addEquipment(item);
    });
  }, [addEquipment]);

  // Definir equipamento inicial de background
  const setBackgroundEquipment = useCallback((backgroundEquipment: Equipment[]) => {
    backgroundEquipment.forEach(item => {
      addEquipment(item);
    });
  }, [addEquipment]);

  // Definir equipamento racial
  const setRacialEquipment = useCallback((racialEquipment: Equipment[]) => {
    racialEquipment.forEach(item => {
      addEquipment(item);
    });
  }, [addEquipment]);

  // Comprar equipamento com ouro
  const purchaseEquipment = useCallback((item: Equipment, quantity: number = 1) => {
    if (!item.cost) return false;
    
    const totalCost = convertToGold(item.cost) * quantity;
    if (totalCost > remainingGold) return false;
    
    setRemainingGold(prev => prev - totalCost);
    addEquipment({ ...item, quantity });
    return true;
  }, [remainingGold, addEquipment]);

  // Vender equipamento
  const sellEquipment = useCallback((id: string, quantity: number = 1) => {
    const item = equipment.find(eq => eq.id === id);
    if (!item || !item.cost || item.quantity < quantity) return false;
    
    const sellPrice = (convertToGold(item.cost) * quantity) / 2; // Metade do preço
    setRemainingGold(prev => prev + sellPrice);
    removeEquipment(id, quantity);
    return true;
  }, [equipment, removeEquipment]);

  // Converter preço para ouro
  const convertToGold = useCallback((cost: Equipment['cost']): number => {
    if (!cost) return 0;
    
    const rates = {
      cp: 0.01,
      sp: 0.1,
      ep: 0.5,
      gp: 1,
      pp: 10,
    };
    
    return cost.quantity * (rates[cost.unit] || 0);
  }, []);

  // Calcular peso total
  const totalWeight = useMemo(() => {
    return equipment.reduce((total, item) => {
      return total + ((item.weight || 0) * item.quantity);
    }, 0);
  }, [equipment]);

  // Calcular valor total
  const totalValue = useMemo(() => {
    return equipment.reduce((total, item) => {
      if (!item.cost) return total;
      return total + (convertToGold(item.cost) * item.quantity);
    }, 0);
  }, [equipment, convertToGold]);

  // Obter AC da armadura equipada
  const equippedArmorAC = useMemo(() => {
    const equippedArmor = equipment.find(item => 
      item.type === 'armor' && item.equipped && item.armor_class
    );
    return equippedArmor?.armor_class || null;
  }, [equipment]);

  // Obter escudo equipado
  const equippedShield = useMemo(() => {
    return equipment.find(item => 
      item.type === 'shield' && item.equipped
    );
  }, [equipment]);

  // Obter armas equipadas
  const equippedWeapons = useMemo(() => {
    return equipment.filter(item => 
      item.type === 'weapon' && item.equipped
    );
  }, [equipment]);

  // Agrupar por tipo
  const equipmentByType = useMemo(() => {
    const grouped: Record<string, Equipment[]> = {};
    equipment.forEach(item => {
      if (!grouped[item.type]) {
        grouped[item.type] = [];
      }
      grouped[item.type].push(item);
    });
    return grouped;
  }, [equipment]);

  // Calcular capacidade de carga (baseado na força)
  const getCarryingCapacity = useCallback((strengthScore: number) => {
    return {
      normal: strengthScore * 15,
      push: strengthScore * 30,
      maximum: strengthScore * 30,
    };
  }, []);

  // Alternar entre equipamento inicial e compra com ouro
  const toggleEquipmentMethod = useCallback((useStarting: boolean) => {
    setUseStartingEquipment(useStarting);
    if (useStarting) {
      // Limpar equipamentos comprados
      setEquipment(prev => prev.filter(item => 
        !equipmentByType.purchasedEquipment?.includes(item)
      ));
    } else {
      // Limpar equipamentos iniciais e definir ouro
      setEquipment([]);
      // Definir ouro inicial baseado na classe (isso deveria vir da classe selecionada)
      setRemainingGold(startingGold);
    }
  }, [equipmentByType, startingGold]);

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
      const hasWeapon = equipment.some(item => item.type === 'weapon');
      const hasArmor = equipment.some(item => item.type === 'armor') || 
                      equipment.some(item => item.type === 'shield');
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
    getEquipmentByType: (type: Equipment['type']) => equipment.filter(item => item.type === type),
    getEquippedItems: () => equipment.filter(item => item.equipped),
    hasEquipment: (id: string) => equipment.some(item => item.id === id),
  };
};

export default useCharacterEquipment;