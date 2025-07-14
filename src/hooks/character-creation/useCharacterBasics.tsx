// ===========================
// useCharacterBasics.ts
// Hook para gerenciar informações básicas do personagem
// ===========================

import { useState, useCallback } from 'react';

export interface CharacterBasics {
  name: string;
  selectedRace: any | null;
  selectedSubrace: any | null;
  selectedClass: any | null;
  selectedSubclass: any | null;
  selectedBackground: any | null;
  alignment: string;
  level: number;
}

const initialBasics: CharacterBasics = {
  name: "",
  selectedRace: null,
  selectedSubrace: null,
  selectedClass: null,
  selectedSubclass: null,
  selectedBackground: null,
  alignment: "",
  level: 1,
};

export const useCharacterBasics = () => {
  const [basics, setBasics] = useState<CharacterBasics>(initialBasics);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualizar nome
  const updateName = useCallback((name: string) => {
    setBasics(prev => ({ ...prev, name }));
    if (errors.name && name.trim()) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  }, [errors.name]);

  // Atualizar raça
  const updateRace = useCallback((race: any) => {
    setBasics(prev => ({ 
      ...prev, 
      selectedRace: race,
      selectedSubrace: null // Reset subrace quando muda raça
    }));
    if (errors.race) {
      setErrors(prev => ({ ...prev, race: '' }));
    }
  }, [errors.race]);

  // Atualizar sub-raça
  const updateSubrace = useCallback((subrace: any) => {
    setBasics(prev => ({ ...prev, selectedSubrace: subrace }));
  }, []);

  // Atualizar classe
  const updateClass = useCallback((characterClass: any) => {
    setBasics(prev => ({ 
      ...prev, 
      selectedClass: characterClass,
      selectedSubclass: null // Reset subclass quando muda classe
    }));
    if (errors.class) {
      setErrors(prev => ({ ...prev, class: '' }));
    }
  }, [errors.class]);

  // Atualizar subclasse
  const updateSubclass = useCallback((subclass: any) => {
    setBasics(prev => ({ ...prev, selectedSubclass: subclass }));
  }, []);

  // Atualizar background
  const updateBackground = useCallback((background: any) => {
    setBasics(prev => ({ ...prev, selectedBackground: background }));
    if (errors.background) {
      setErrors(prev => ({ ...prev, background: '' }));
    }
  }, [errors.background]);

  // Atualizar alinhamento
  const updateAlignment = useCallback((alignment: string) => {
    setBasics(prev => ({ ...prev, alignment }));
  }, []);

  // Atualizar level
  const updateLevel = useCallback((level: number) => {
    setBasics(prev => ({ ...prev, level: Math.max(1, Math.min(20, level)) }));
  }, []);

  // Validação
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!basics.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }
    
    if (!basics.selectedRace) {
      newErrors.race = "Raça é obrigatória";
    }
    
    if (!basics.selectedClass) {
      newErrors.class = "Classe é obrigatória";
    }
    
    if (!basics.selectedBackground) {
      newErrors.background = "Antecedente é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [basics]);

  // Verificar se está válido
  const isValid = useCallback(() => {
    return !!(
      basics.name.trim() && 
      basics.selectedRace && 
      basics.selectedClass && 
      basics.selectedBackground
    );
  }, [basics]);

  // Reset
  const reset = useCallback(() => {
    setBasics(initialBasics);
    setErrors({});
  }, []);

  // Carregar dados (útil para edição)
  const loadData = useCallback((data: Partial<CharacterBasics>) => {
    setBasics(prev => ({ ...prev, ...data }));
  }, []);

  return {
    // State
    basics,
    errors,
    
    // Actions
    updateName,
    updateRace,
    updateSubrace,
    updateClass,
    updateSubclass,
    updateBackground,
    updateAlignment,
    updateLevel,
    
    // Validation
    validate,
    isValid: isValid(),
    
    // Utils
    reset,
    loadData,
    
    // Computed values
    modifierBonus: Math.floor((basics.level - 1) / 4) + 2,
    canChooseSubrace: !!basics.selectedRace?.subraces?.length,
    canChooseSubclass: basics.level >= 3 && !!basics.selectedClass?.subclasses?.length,
  };
};