// ===========================
// useCharacterPersonality.ts
// Hook para gerenciar personalidade do personagem
// ===========================

import { useState, useCallback, useMemo } from 'react';
import { PersonalityOption } from '@/types/characterCreation';

// Interface específica do hook para traits de personalidade
export interface PersonalityTrait {
  id: string;
  text: string;
  source?: 'background' | 'custom';
}

export interface PersonalityData {
  traits: PersonalityTrait[];
  ideals: PersonalityTrait[];
  bonds: PersonalityTrait[];
  flaws: PersonalityTrait[];
}

export interface PersonalityOptions {
  traits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

const useCharacterPersonality = () => {
  const [personality, setPersonality] = useState<PersonalityData>({
    traits: [],
    ideals: [],
    bonds: [],
    flaws: [],
  });
  
  const [availableOptions, setAvailableOptions] = useState<PersonalityOptions>({
    traits: [],
    ideals: [],
    bonds: [],
    flaws: [],
  });

  const [customEntries, setCustomEntries] = useState<{
    traits: string;
    ideals: string;
    bonds: string;
    flaws: string;
  }>({
    traits: '',
    ideals: '',
    bonds: '',
    flaws: '',
  });

  // Adicionar traço de personalidade
  const addTrait = useCallback((text: string, source: 'background' | 'custom' = 'custom') => {
    const newTrait: PersonalityTrait = {
      id: `trait-${Date.now()}-${Math.random()}`,
      text: text.trim(),
      source,
    };

    setPersonality(prev => ({
      ...prev,
      traits: [...prev.traits, newTrait],
    }));
  }, []);

  // Adicionar ideal
  const addIdeal = useCallback((text: string, source: 'background' | 'custom' = 'custom') => {
    const newIdeal: PersonalityTrait = {
      id: `ideal-${Date.now()}-${Math.random()}`,
      text: text.trim(),
      source,
    };

    setPersonality(prev => ({
      ...prev,
      ideals: [...prev.ideals, newIdeal],
    }));
  }, []);

  // Adicionar vínculo
  const addBond = useCallback((text: string, source: 'background' | 'custom' = 'custom') => {
    const newBond: PersonalityTrait = {
      id: `bond-${Date.now()}-${Math.random()}`,
      text: text.trim(),
      source,
    };

    setPersonality(prev => ({
      ...prev,
      bonds: [...prev.bonds, newBond],
    }));
  }, []);

  // Adicionar defeito
  const addFlaw = useCallback((text: string, source: 'background' | 'custom' = 'custom') => {
    const newFlaw: PersonalityTrait = {
      id: `flaw-${Date.now()}-${Math.random()}`,
      text: text.trim(),
      source,
    };

    setPersonality(prev => ({
      ...prev,
      flaws: [...prev.flaws, newFlaw],
    }));
  }, []);

  // Remover item de personalidade
  const removePersonalityItem = useCallback((type: keyof PersonalityData, id: string) => {
    setPersonality(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== id),
    }));
  }, []);

  // Atualizar item de personalidade
  const updatePersonalityItem = useCallback((type: keyof PersonalityData, id: string, newText: string) => {
    setPersonality(prev => ({
      ...prev,
      [type]: prev[type].map(item => 
        item.id === id ? { ...item, text: newText.trim() } : item
      ),
    }));
  }, []);

  // Configurar opções do background
  const setBackgroundOptions = useCallback((backgroundPersonality: PersonalityOption[]) => {
    const options: PersonalityOptions = {
      traits: [],
      ideals: [],
      bonds: [],
      flaws: [],
    };

    backgroundPersonality.forEach(option => {
      if (option.trait) {
        options.traits.push(option.trait);
      }
      if (option.ideal) {
        options.ideals.push(option.ideal.description);
      }
      if (option.bond) {
        options.bonds.push(option.bond);
      }
      if (option.flaw) {
        options.flaws.push(option.flaw);
      }
    });

    setAvailableOptions(options);
  }, []);

  // Adicionar personalidade do background
  const addBackgroundPersonality = useCallback((
    type: keyof PersonalityData,
    text: string
  ) => {
    switch (type) {
      case 'traits':
        addTrait(text, 'background');
        break;
      case 'ideals':
        addIdeal(text, 'background');
        break;
      case 'bonds':
        addBond(text, 'background');
        break;
      case 'flaws':
        addFlaw(text, 'background');
        break;
    }
  }, [addTrait, addIdeal, addBond, addFlaw]);

  // Atualizar entrada customizada
  const updateCustomEntry = useCallback((
    type: keyof PersonalityData,
    value: string
  ) => {
    setCustomEntries(prev => ({
      ...prev,
      [type]: value,
    }));
  }, []);

  // Adicionar entrada customizada
  const addCustomEntry = useCallback((type: keyof PersonalityData) => {
    const text = customEntries[type].trim();
    if (!text) return;

    switch (type) {
      case 'traits':
        addTrait(text, 'custom');
        break;
      case 'ideals':
        addIdeal(text, 'custom');
        break;
      case 'bonds':
        addBond(text, 'custom');
        break;
      case 'flaws':
        addFlaw(text, 'custom');
        break;
    }

    // Limpar entrada
    setCustomEntries(prev => ({
      ...prev,
      [type]: '',
    }));
  }, [customEntries, addTrait, addIdeal, addBond, addFlaw]);

  // Gerar personalidade aleatória do background
  const generateRandomPersonality = useCallback(() => {
    const getRandomItem = (array: string[]) => {
      return array[Math.floor(Math.random() * array.length)];
    };

    // Limpar personalidade atual do background
    setPersonality(prev => ({
      traits: prev.traits.filter(t => t.source !== 'background'),
      ideals: prev.ideals.filter(t => t.source !== 'background'),
      bonds: prev.bonds.filter(t => t.source !== 'background'),
      flaws: prev.flaws.filter(t => t.source !== 'background'),
    }));

    // Adicionar itens aleatórios
    if (availableOptions.traits.length > 0) {
      addBackgroundPersonality('traits', getRandomItem(availableOptions.traits));
    }
    if (availableOptions.ideals.length > 0) {
      addBackgroundPersonality('ideals', getRandomItem(availableOptions.ideals));
    }
    if (availableOptions.bonds.length > 0) {
      addBackgroundPersonality('bonds', getRandomItem(availableOptions.bonds));
    }
    if (availableOptions.flaws.length > 0) {
      addBackgroundPersonality('flaws', getRandomItem(availableOptions.flaws));
    }
  }, [availableOptions, addBackgroundPersonality]);

  // Validação
  const isValid = useMemo(() => {
    // Verificar se há pelo menos um item de cada tipo
    return (
      personality.traits.length > 0 &&
      personality.ideals.length > 0 &&
      personality.bonds.length > 0 &&
      personality.flaws.length > 0
    );
  }, [personality]);

  // Reset
  const reset = useCallback(() => {
    setPersonality({
      traits: [],
      ideals: [],
      bonds: [],
      flaws: [],
    });
    setAvailableOptions({
      traits: [],
      ideals: [],
      bonds: [],
      flaws: [],
    });
    setCustomEntries({
      traits: '',
      ideals: '',
      bonds: '',
      flaws: '',
    });
  }, []);

  // Helpers para obter estatísticas
  const getPersonalityStats = useMemo(() => {
    return {
      totalTraits: personality.traits.length,
      totalIdeals: personality.ideals.length,
      totalBonds: personality.bonds.length,
      totalFlaws: personality.flaws.length,
      totalItems: personality.traits.length + personality.ideals.length + 
                  personality.bonds.length + personality.flaws.length,
      backgroundItems: [
        ...personality.traits.filter(t => t.source === 'background'),
        ...personality.ideals.filter(t => t.source === 'background'),
        ...personality.bonds.filter(t => t.source === 'background'),
        ...personality.flaws.filter(t => t.source === 'background'),
      ].length,
      customItems: [
        ...personality.traits.filter(t => t.source === 'custom'),
        ...personality.ideals.filter(t => t.source === 'custom'),
        ...personality.bonds.filter(t => t.source === 'custom'),
        ...personality.flaws.filter(t => t.source === 'custom'),
      ].length,
    };
  }, [personality]);

  // Obter personalidade em formato simplificado para API
  const getPersonalityForAPI = useCallback(() => {
    return {
      traits: personality.traits.map(t => t.text),
      ideals: personality.ideals.map(t => t.text),
      bonds: personality.bonds.map(t => t.text),
      flaws: personality.flaws.map(t => t.text),
    };
  }, [personality]);

  return {
    // State
    personality,
    availableOptions,
    customEntries,
    
    // Actions
    addTrait,
    addIdeal,
    addBond,
    addFlaw,
    removePersonalityItem,
    updatePersonalityItem,
    setBackgroundOptions,
    addBackgroundPersonality,
    updateCustomEntry,
    addCustomEntry,
    generateRandomPersonality,
    
    // Validation
    isValid,
    
    // Utils
    reset,
    getPersonalityStats,
    getPersonalityForAPI,
    
    // Helpers
    hasBackgroundOptions: Object.values(availableOptions).some(arr => arr.length > 0),
    canAddCustom: (type: keyof PersonalityData) => customEntries[type].trim().length > 0,
  };
};

export default useCharacterPersonality;