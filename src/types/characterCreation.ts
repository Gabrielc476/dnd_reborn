// ===========================
// CHARACTER CREATION TYPES - UPDATED WITH SUBRACES & SUBCLASSES & API INTEGRATION
// src/types/characterCreation.ts
// ===========================

// ===========================
// D&D API TYPES
// ===========================

export interface DndApiReference {
  index: string;
  name: string;
  url: string;
}

export interface DndSubrace {
  index: string;
  name: string;
  race: DndApiReference;
  desc: string;
  ability_bonuses: Array<{
    ability_score: DndApiReference;
    bonus: number;
  }>;
  starting_proficiencies: DndApiReference[];
  languages: DndApiReference[];
  racial_traits: DndApiReference[];
  url: string;
}

export interface DndRace {
  index: string;
  name: string;
  speed: number;
  ability_bonuses: Array<{
    ability_score: DndApiReference;
    bonus: number;
  }>;
  alignment: string;
  age: string;
  size: string;
  size_description: string;
  starting_proficiencies: DndApiReference[];
  languages: DndApiReference[];
  language_desc: string;
  traits: DndApiReference[];
  subraces: DndApiReference[];
  url: string;
}

export interface DndSubclass {
  index: string;
  name: string;
  class: DndApiReference;
  subclass_flavor: string;
  desc: string[];
  subclass_levels: Array<{
    level: number;
    features: DndApiReference[];
  }>;
  spells?: Array<{
    level: number;
    spells: DndApiReference[];
  }>;
  url: string;
}

export interface DndClass {
  index: string;
  name: string;
  hit_die: number;
  proficiencies: DndApiReference[];
  proficiency_choices: Array<{
    desc: string;
    choose: number;
    type: string;
    from: {
      option_set_type: string;
      options: Array<{
        option_type: string;
        item: DndApiReference;
      }>;
    };
  }>;
  saving_throws: DndApiReference[];
  starting_equipment: Array<{
    equipment: DndApiReference;
    quantity: number;
  }>;
  spellcasting?: {
    level: number;
    spellcasting_ability: DndApiReference;
  };
  url: string;
}

export interface DndBackground {
  index: string;
  name: string;
  starting_proficiencies: DndApiReference[];
  starting_equipment: Array<{
    equipment: DndApiReference;
    quantity: number;
  }>;
  feature: {
    name: string;
    desc: string[];
  };
  personality_traits: {
    choose: number;
    from: {
      options: Array<{
        option_type: string;
        string: string;
      }>;
    };
  };
  ideals: {
    choose: number;
    from: {
      options: Array<{
        option_type: string;
        alignments: DndApiReference[];
        desc: string;
      }>;
    };
  };
  bonds: {
    choose: number;
    from: {
      options: Array<{
        option_type: string;
        string: string;
      }>;
    };
  };
  flaws: {
    choose: number;
    from: {
      options: Array<{
        option_type: string;
        string: string;
      }>;
    };
  };
  url: string;
}

export interface DndSpell {
  index: string;
  name: string;
  level: number;
  school: DndApiReference;
  casting_time: string;
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  damage?: {
    damage_type: DndApiReference;
    damage_at_slot_level?: Record<string, string>;
  };
  attack_type?: string;
  dc?: {
    dc_type: DndApiReference;
    dc_success: string;
  };
  desc: string[];
  higher_level?: string[];
  classes: DndApiReference[];
  subclasses: DndApiReference[];
  url: string;
}

// ===========================
// CHARACTER CREATION TYPES
// ===========================

export interface CharacterCreationStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isValid: boolean;
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface CharacterCreationData {
  // Passo 1: Informações Básicas
  name: string;
  selectedRace: DndRace | null;
  selectedSubrace: DndSubrace | null;
  selectedClass: DndClass | null;
  selectedSubclass: DndSubclass | null;
  selectedBackground: DndBackground | null;
  level: number;
  alignment: string;

  // Passo 2: Atributos
  abilityScores: AbilityScores;
  abilityMethod: "standard" | "point_buy" | "roll";

  // Passo 3: Perícias
  selectedSkills: string[];
  availableSkillChoices: number;

  // Passo 4: Equipamentos
  hitPoints: number;
  armorClass: number;

  // Passo 5: Magias (se aplicável)
  selectedSpells: DndSpell[];
  isSpellcaster: boolean;
  spellcastingAbility: string | null;

  // Passo 6: Personalização
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

// ===========================
// VALIDATION TYPES
// ===========================

export interface StepValidation {
  isValid: boolean;
  errors: string[];
}

export interface SpellInfo {
  cantrips: number;
  spells: number;
  maxSpellLevel: number;
  availableCantrips?: DndSpell[];
  availableLevelSpells?: DndSpell[];
}

// ===========================
// CONTEXT TYPE
// ===========================

export interface CharacterCreationContextType {
  // Estado
  currentStep: number;
  totalSteps: number;
  steps: CharacterCreationStep[];
  characterData: CharacterCreationData;
  loading: boolean;
  error: string | null;

  // Dados da API
  races: DndRace[];
  classes: DndClass[];
  backgrounds: DndBackground[];
  spells: DndSpell[];
  subraces: DndSubrace[];
  subclasses: DndSubclass[];

  // Estados de loading
  isLoadingRaces: boolean;
  isLoadingClasses: boolean;
  isLoadingBackgrounds: boolean;
  isLoadingSpells: boolean;
  isLoadingSubraces: boolean;
  isLoadingSubclasses: boolean;

  // Erros
  racesError?: Error | null;
  classesError?: Error | null;
  spellsError?: Error | null;

  // Busca
  raceSearch: string;
  classSearch: string;
  spellSearch: string;
  backgroundSearch: string;
  setRaceSearch: (search: string) => void;
  setClassSearch: (search: string) => void;
  setSpellSearch: (search: string) => void;
  setBackgroundSearch: (search: string) => void;

  // Ações de navegação
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;

  // Ações de dados
  updateCharacterData: (data: Partial<CharacterCreationData>) => void;
  resetCharacter: () => void;

  // Validações
  validateCurrentStep: () => boolean;
  canProceed: () => boolean;

  // Finalização
  createCharacter: () => Promise<void>;

  // Utilidades
  getAbilityModifier: (score: number) => number;
  calculateAbilityScorePoints: (scores: AbilityScores) => number;
  generateRandomAbilityScores: () => AbilityScores;
  getProficiencyBonus: (level: number) => number;
  getSkillModifier: (skill: string, scores: AbilityScores) => number;
  getSavingThrowModifier: (ability: string, scores: AbilityScores) => number;
  calculateHitPoints: (characterClass: DndClass, level: number, conModifier: number) => number;
  calculateArmorClass: (dexModifier: number, armor?: any) => number;
  getSpellAttackBonus: (spellcastingMod: number, proficiencyBonus: number) => number;
  getSpellSaveDC: (spellcastingMod: number, proficiencyBonus: number) => number;
  getCarryingCapacity: (strength: number) => number;
  getInitiativeModifier: (dexModifier: number) => number;

  // Funções de subraças
  getAvailableSubraces: () => DndSubrace[];
  getCombinedAbilityBonuses: () => Record<string, number>;
  getSubraceAbilityBonuses: () => Array<{ ability_score: DndApiReference; bonus: number }>;

  // Funções de subclasses
  getAvailableSubclasses: () => DndSubclass[];
  getSubclassFeatures: (level?: number) => DndApiReference[];

  // Informações sobre magias (NOVO)
  spellInfo: SpellInfo;
  maxSpellLevel: number;
  startingCantrips: number;
  startingSpells: number;
}

// ===========================
// UTILITY TYPES
// ===========================

export type AbilityKey = keyof AbilityScores;

export interface AbilityBonus {
  ability_score: DndApiReference;
  bonus: number;
}

export interface Equipment {
  equipment: DndApiReference;
  quantity: number;
}

// ===========================
// EXPORT TYPES FOR EXTERNAL USE
// ===========================

export type {
  DndApiReference,
  DndRace,
  DndSubrace,
  DndClass,
  DndSubclass,
  DndBackground,
  DndSpell,
  CharacterCreationData,
  CharacterCreationStep,
  AbilityScores,
  StepValidation,
  SpellInfo,
};