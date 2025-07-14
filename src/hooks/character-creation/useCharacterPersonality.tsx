// ===========================
// useCharacterPersonality.ts
// Hook para gerenciar personalidade do personagem
// ===========================

import { useState, useCallback, useMemo } from 'react';

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

  // Definir opções do background
  const setBackgroundOptions = useCallback((options: PersonalityOptions) => {
    setAvailableOptions(options);
  }, []);

  // Adicionar entrada personalizada
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

  // Atualizar entrada personalizada
  const updateCustomEntry = useCallback((type: keyof PersonalityData, value: string) => {
    setCustomEntries(prev => ({
      ...prev,
      [type]: value,
    }));
  }, []);

  // Adicionar opção do background
  const addBackgroundOption = useCallback((type: keyof PersonalityData, text: string) => {
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

  // Gerar aleatoriamente do background
  const generateRandomFromBackground = useCallback((type: keyof PersonalityData) => {
    const options = availableOptions[type];
    if (options.length === 0) return;

    const randomOption = options[Math.floor(Math.random() * options.length)];
    addBackgroundOption(type, randomOption);
  }, [availableOptions, addBackgroundOption]);

  // Limpar seção
  const clearSection = useCallback((type: keyof PersonalityData) => {
    setPersonality(prev => ({
      ...prev,
      [type]: [],
    }));
  }, []);

  // Validação
  const isValid = useMemo(() => {
    // Personalidade é opcional, então sempre válida
    // Mas pode ter regras específicas se necessário
    return true;
  }, []);

  // Verificar se está completo (pelo menos um item em cada categoria)
  const isComplete = useMemo(() => {
    return (
      personality.traits.length > 0 &&
      personality.ideals.length > 0 &&
      personality.bonds.length > 0 &&
      personality.flaws.length > 0
    );
  }, [personality]);

  // Obter resumo
  const getSummary = useMemo(() => {
    return {
      traits: personality.traits.length,
      ideals: personality.ideals.length,
      bonds: personality.bonds.length,
      flaws: personality.flaws.length,
      total: personality.traits.length + personality.ideals.length + 
             personality.bonds.length + personality.flaws.length,
    };
  }, [personality]);

  // Reset
  const reset = useCallback(() => {
    setPersonality({
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
    setAvailableOptions({
      traits: [],
      ideals: [],
      bonds: [],
      flaws: [],
    });
  }, []);

  // Carregar dados existentes
  const loadPersonality = useCallback((data: Partial<PersonalityData>) => {
    setPersonality(prev => ({
      ...prev,
      ...data,
    }));
  }, []);

  // Exportar como strings (para API)
  const getPersonalityStrings = useMemo(() => {
    return {
      traits: personality.traits.map(t => t.text),
      ideals: personality.ideals.map(i => i.text),
      bonds: personality.bonds.map(b => b.text),
      flaws: personality.flaws.map(f => f.text),
    };
  }, [personality]);

  // Verificar se tem opções do background
  const hasBackgroundOptions = useMemo(() => {
    return Object.values(availableOptions).some(options => options.length > 0);
  }, [availableOptions]);

  // Obter opções não utilizadas
  const getUnusedBackgroundOptions = useCallback((type: keyof PersonalityData) => {
    const usedTexts = personality[type].map(item => item.text);
    return availableOptions[type].filter(option => !usedTexts.includes(option));
  }, [personality, availableOptions]);

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
    addCustomEntry,
    updateCustomEntry,
    addBackgroundOption,
    generateRandomFromBackground,
    clearSection,
    
    // Computed
    isValid,
    isComplete,
    summary: getSummary,
    personalityStrings: getPersonalityStrings,
    hasBackgroundOptions,
    
    // Helpers
    getUnusedBackgroundOptions,
    canAddCustom: (type: keyof PersonalityData) => customEntries[type].trim().length > 0,
    getItemsBySource: (type: keyof PersonalityData, source: 'background' | 'custom') => 
      personality[type].filter(item => item.source === source),
    
    // Utils
    reset,
    loadPersonality,
    
    // Constants
    maxRecommendedPerSection: 3,
    minRecommendedPerSection: 1,
  };
};

export default useCharacterPersonality;