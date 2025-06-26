// ===========================
// CHARACTER CREATION TYPES - COMPLETE WITH CONSTANTS AND UTILITIES
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
    info: Array<{
      name: string;
      desc: string[];
    }>;
  };
  url: string;
}

export interface DndBackground {
  index: string;
  name: string;
  starting_proficiencies: DndApiReference[];
  languages: DndApiReference[];
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
    from: string[];
  };
  ideals: {
    choose: number;
    from: Array<{
      desc: string;
      alignments: DndApiReference[];
    }>;
  };
  bonds: {
    choose: number;
    from: string[];
  };
  flaws: {
    choose: number;
    from: string[];
  };
  url: string;
}

export interface DndSpell {
  index: string;
  name: string;
  desc: string[];
  higher_level?: string[];
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  attack_type?: string;
  damage?: {
    damage_type: DndApiReference;
    damage_at_slot_level?: Record<string, string>;
    damage_at_character_level?: Record<string, string>;
  };
  school: DndApiReference;
  classes: DndApiReference[];
  subclasses: DndApiReference[];
  url: string;
}

// ===========================
// CHARACTER CREATION TYPES
// ===========================

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface CharacterCreationData {
  name: string;
  selectedRace: DndRace | null;
  selectedSubrace: DndSubrace | null;
  selectedClass: DndClass | null;
  selectedSubclass: DndSubclass | null;
  selectedBackground: DndBackground | null;
  level: number;
  alignment: string;
  abilityScores: AbilityScores;
  abilityMethod: "standard" | "point_buy" | "roll";
  selectedSkills: string[];
  availableSkillChoices: number;
  hitPoints: number;
  armorClass: number;
  selectedSpells: DndSpell[];
  isSpellcaster: boolean;
  spellcastingAbility: string | null;
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

export interface CharacterCreationStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isValid: boolean;
}

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
  // State
  currentStep: number;
  totalSteps: number;
  steps: CharacterCreationStep[];
  characterData: CharacterCreationData;
  loading: boolean;
  error: string | null;

  // API Data
  races: DndRace[];
  classes: DndClass[];
  backgrounds: DndBackground[];
  spells: DndSpell[];
  subraces: DndSubrace[];
  subclasses: DndSubclass[];

  // Loading states
  isLoadingRaces: boolean;
  isLoadingClasses: boolean;
  isLoadingBackgrounds: boolean;
  isLoadingSpells: boolean;
  isLoadingSubraces: boolean;
  isLoadingSubclasses: boolean;

  // Errors
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

  // Informações sobre magias
  spellInfo: SpellInfo;
  maxSpellLevel: number;
  startingCantrips: number;
  startingSpells: number;
}

// ===========================
// CONSTANTS - MISSING EXPORTS
// ===========================

export const ALIGNMENTS = [
  { value: "lawful-good", label: "Leal e Bom", short: "LB" },
  { value: "neutral-good", label: "Neutro e Bom", short: "NB" },
  { value: "chaotic-good", label: "Caótico e Bom", short: "CB" },
  { value: "lawful-neutral", label: "Leal e Neutro", short: "LN" },
  { value: "true-neutral", label: "Neutro Absoluto", short: "N" },
  { value: "chaotic-neutral", label: "Caótico e Neutro", short: "CN" },
  { value: "lawful-evil", label: "Leal e Mau", short: "LM" },
  { value: "neutral-evil", label: "Neutro e Mau", short: "NM" },
  { value: "chaotic-evil", label: "Caótico e Mau", short: "CM" },
];

export const SKILLS = [
  { key: "acrobatics", name: "Acrobacia", ability: "dexterity" },
  { key: "animal-handling", name: "Lidar com Animais", ability: "wisdom" },
  { key: "arcana", name: "Arcanismo", ability: "intelligence" },
  { key: "athletics", name: "Atletismo", ability: "strength" },
  { key: "deception", name: "Enganação", ability: "charisma" },
  { key: "history", name: "História", ability: "intelligence" },
  { key: "insight", name: "Intuição", ability: "wisdom" },
  { key: "intimidation", name: "Intimidação", ability: "charisma" },
  { key: "investigation", name: "Investigação", ability: "intelligence" },
  { key: "medicine", name: "Medicina", ability: "wisdom" },
  { key: "nature", name: "Natureza", ability: "intelligence" },
  { key: "perception", name: "Percepção", ability: "wisdom" },
  { key: "performance", name: "Atuação", ability: "charisma" },
  { key: "persuasion", name: "Persuasão", ability: "charisma" },
  { key: "religion", name: "Religião", ability: "intelligence" },
  { key: "sleight-of-hand", name: "Prestidigitação", ability: "dexterity" },
  { key: "stealth", name: "Furtividade", ability: "dexterity" },
  { key: "survival", name: "Sobrevivência", ability: "wisdom" },
];

// ===========================
// UTILITY FUNCTIONS - MISSING EXPORTS
// ===========================

/**
 * Verifica se uma classe pode ter subclasse
 */
export const canHaveSubclass = (classIndex: string): boolean => {
  // Classes que têm subclasses
  const classesWithSubclasses = [
    "barbarian", "bard", "cleric", "druid", "fighter", 
    "monk", "paladin", "ranger", "rogue", "sorcerer", 
    "warlock", "wizard"
  ];
  
  return classesWithSubclasses.includes(classIndex);
};

/**
 * Retorna o nível em que uma classe ganha subclasse
 */
export const getSubclassLevel = (classIndex: string): number => {
  const subclassLevels: Record<string, number> = {
    "barbarian": 3,
    "bard": 3,
    "cleric": 1,
    "druid": 2,
    "fighter": 3,
    "monk": 3,
    "paladin": 3,
    "ranger": 3,
    "rogue": 3,
    "sorcerer": 1,
    "warlock": 1,
    "wizard": 2,
  };
  
  return subclassLevels[classIndex] || 1;
};

/**
 * Verifica se um personagem pode escolher subclasse no nível atual
 */
export const canChooseSubclass = (classIndex: string, level: number): boolean => {
  if (!canHaveSubclass(classIndex)) return false;
  return level >= getSubclassLevel(classIndex);
};

/**
 * Retorna informações sobre o alinhamento
 */
export const getAlignmentInfo = (alignmentValue: string) => {
  return ALIGNMENTS.find(alignment => alignment.value === alignmentValue);
};

/**
 * Retorna informações sobre uma perícia
 */
export const getSkillInfo = (skillKey: string) => {
  return SKILLS.find(skill => skill.key === skillKey);
};

/**
 * Filtra perícias por habilidade
 */
export const getSkillsByAbility = (ability: string) => {
  return SKILLS.filter(skill => skill.ability === ability);
};

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

export interface Skill {
  key: string;
  name: string;
  ability: string;
}

export interface Alignment {
  value: string;
  label: string;
  short: string;
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
  Skill,
  Alignment,
};