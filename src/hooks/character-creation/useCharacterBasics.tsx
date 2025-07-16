// ===========================
// useCharacterBasics.ts
// Hook para gerenciar informações básicas do personagem - CORRIGIDO
// ===========================

import { useState, useCallback, useMemo } from 'react';
import { 
  AbilityScores, 
  DndRace, 
  DndSubrace, 
  DndClass, 
  DndSubclass, 
  DndBackground,
  AlignmentType 
} from '@/types/characterCreation';

// Interface atualizada com selectedClassIndex
export interface CharacterBasics {
  name: string;
  selectedRace: DndRace | null;
  selectedSubrace: DndSubrace | null;
  selectedClass: DndClass | null;
  selectedClassIndex: string | null; // Adicionado
  selectedSubclass: DndSubclass | null;
  selectedBackground: DndBackground | null;
  alignment: AlignmentType | '';
  level: number;
}

const initialBasics: CharacterBasics = {
  name: "",
  selectedRace: null,
  selectedSubrace: null,
  selectedClass: null,
  selectedClassIndex: null, // Adicionado
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
  const updateRace = useCallback((race: DndRace | null) => {
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
  const updateSubrace = useCallback((subrace: DndSubrace | null) => {
    setBasics(prev => ({ ...prev, selectedSubrace: subrace }));
  }, []);

  // Atualizar classe - CORREÇÃO APLICADA
  const updateClass = useCallback((characterClass: DndClass | null) => {
    console.log("Atualizando classe:", characterClass?.name);
    
    setBasics(prev => ({ 
      ...prev, 
      selectedClass: characterClass,
      selectedClassIndex: characterClass?.index || null,
      selectedSubclass: null
    }));
    
    if (errors.class) {
      setErrors(prev => ({ ...prev, class: '' }));
    }
  }, [errors.class]);

  // Atualizar subclasse
  const updateSubclass = useCallback((subclass: DndSubclass | null) => {
    setBasics(prev => ({ ...prev, selectedSubclass: subclass }));
  }, []);

  // Atualizar background
  const updateBackground = useCallback((background: DndBackground | null) => {
    setBasics(prev => ({ ...prev, selectedBackground: background }));
    if (errors.background) {
      setErrors(prev => ({ ...prev, background: '' }));
    }
  }, [errors.background]);

  // Atualizar alinhamento
  const updateAlignment = useCallback((alignment: AlignmentType | '') => {
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
  const isValid = useMemo(() => {
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

  // Helpers computados
  const canChooseSubrace = useMemo(() => {
    return !!(basics.selectedRace?.subraces && basics.selectedRace.subraces.length > 0);
  }, [basics.selectedRace]);

  const canChooseSubclass = useMemo(() => {
    return basics.level >= 3 && !!(basics.selectedClass?.subclasses && basics.selectedClass.subclasses.length > 0);
  }, [basics.level, basics.selectedClass]);

  const proficiencyBonus = useMemo(() => {
    return Math.floor((basics.level - 1) / 4) + 2;
  }, [basics.level]);

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
    isValid,
    
    // Utils
    reset,
    loadData,
    
    // Computed values
    proficiencyBonus,
    canChooseSubrace,
    canChooseSubclass,
  };
};