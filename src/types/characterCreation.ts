// ===========================
// CHARACTER CREATION TYPES - COMPLETO E CORRIGIDO
// src/types/characterCreation.ts
// 
// ✅ CORREÇÕES APLICADAS:
// - Propriedades faltantes adicionadas ao CharacterCreationContextType
// - Debug functions incluídas
// - Tipos consistentes para spellcastingAbility
// - Todas as utility functions definidas
// ===========================

// ===========================
// BASE INTERFACES
// ===========================

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface CharacterCreationStep {
  id: string;
  title: string;
  description?: string;
  isValid: boolean;
  isCompleted: boolean;
}

// ===========================
// ABILITY SCORE CONSTANTS
// ===========================

export const ABILITY_SCORE_NAMES: Record<keyof AbilityScores, string> = {
  strength: "Força",
  dexterity: "Destreza", 
  constitution: "Constituição",
  intelligence: "Inteligência",
  wisdom: "Sabedoria",
  charisma: "Carisma",
};

export const ABILITY_SCORE_ABBREVIATIONS: Record<keyof AbilityScores, string> = {
  strength: "FOR",
  dexterity: "DES",
  constitution: "CON", 
  intelligence: "INT",
  wisdom: "SAB",
  charisma: "CAR",
};

// ===========================
// SKILLS CONSTANTS
// ===========================

export interface Skill {
  key: string;
  name: string;
  ability: keyof AbilityScores;
}

export const SKILLS: Skill[] = [
  { key: "acrobatics", name: "Acrobacia", ability: "dexterity" },
  { key: "animal-handling", name: "Adestramento", ability: "wisdom" },
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
  { key: "survival", name: "Sobrevivência", ability: "wisdom" }
];

// ===========================
// D&D API REFERENCE TYPES
// ===========================

export interface DndReference {
  index: string;
  name: string;
  url: string;
}

export interface DndAbilityBonus {
  ability_score: DndReference;
  bonus: number;
}

export interface DndProficiencyChoice {
  desc: string;
  choose: number;
  type: string;
  from?: {
    option_set_type?: string;
    options?: Array<{
      option_type: string;
      item: DndReference;
    }>;
  };
}

export interface DndTrait {
  index: string;
  name: string;
  desc: string[];
  proficiencies?: DndReference[];
  proficiency_choices?: DndProficiencyChoice[];
  language_options?: {
    choose: number;
    from: {
      options: Array<{
        option_type: string;
        item: DndReference;
      }>;
    };
  };
  trait_specific?: {
    subtrait_options?: {
      choose: number;
      from: {
        options: Array<{
          option_type: string;
          item: DndReference;
        }>;
      };
    };
    spell_options?: {
      choose: number;
      from: {
        options: Array<{
          option_type: string;
          item: DndReference;
        }>;
      };
    };
  };
}

export interface DndRace {
  index: string;
  name: string;
  speed: number;
  ability_bonuses: DndAbilityBonus[];
  alignment: string;
  age: string;
  size: string;
  size_description: string;
  starting_proficiencies: DndReference[];
  starting_proficiency_options?: DndProficiencyChoice;
  languages: DndReference[];
  language_desc: string;
  traits: DndTrait[];
  subraces: DndReference[];
  url: string;
}

export interface DndSubrace {
  index: string;
  name: string;
  race: DndReference;
  desc: string;
  ability_bonuses: DndAbilityBonus[];
  starting_proficiencies: DndReference[];
  languages: DndReference[];
  racial_traits: DndTrait[];
  url: string;
}

export interface DndSpellcasting {
  level: number;
  info: Array<{
    name: string;
    desc: string[];
  }>;
  spellcasting_ability: DndReference;
}

export interface DndClass {
  index: string;
  name: string;
  hit_die: number;
  proficiency_choices: DndProficiencyChoice[];
  proficiencies: DndReference[];
  saving_throws: DndReference[];
  starting_equipment: Array<{
    equipment: DndReference;
    quantity: number;
  }>;
  starting_equipment_options: Array<{
    desc: string;
    choose: number;
    type: string;
    from: {
      option_set_type: string;
      equipment_category: DndReference;
    };
  }>;
  class_levels: string;
  multi_classing: {
    prerequisites: Array<{
      ability_score: DndReference;
      minimum_score: number;
    }>;
    proficiencies: DndReference[];
    proficiency_choices: DndProficiencyChoice[];
  };
  subclasses: DndReference[];
  spellcasting?: DndSpellcasting;
  spells?: string;
  url: string;
}

export interface DndSubclass {
  index: string;
  name: string;
  class: DndReference;
  subclass_flavor: string;
  desc: string[];
  subclass_levels: string;
  spells?: Array<{
    prerequisites: Array<{
      index: string;
      type: string;
      url: string;
    }>;
    spell: DndReference;
  }>;
  url: string;
}

export interface DndBackground {
  index: string;
  name: string;
  starting_proficiencies: DndReference[];
  language_options: {
    choose: number;
    type: string;
    from: {
      option_set_type: string;
      resource_list_url: string;
    };
  };
  starting_equipment: Array<{
    equipment: DndReference;
    quantity: number;
  }>;
  starting_equipment_options: Array<{
    desc: string;
    choose: number;
    type: string;
    from: {
      option_set_type: string;
      equipment_category: DndReference;
    };
  }>;
  feature: {
    name: string;
    desc: string[];
  };
  personality_traits: {
    choose: number;
    type: string;
    from: {
      option_set_type: string;
      options: Array<{
        option_type: string;
        string: string;
      }>;
    };
  };
  ideals: {
    choose: number;
    type: string;
    from: {
      option_set_type: string;
      options: Array<{
        option_type: string;
        desc: string;
        alignments: DndReference[];
      }>;
    };
  };
  bonds: {
    choose: number;
    type: string;
    from: {
      option_set_type: string;
      options: Array<{
        option_type: string;
        string: string;
      }>;
    };
  };
  flaws: {
    choose: number;
    type: string;
    from: {
      option_set_type: string;
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
    damage_type: DndReference;
    damage_at_slot_level?: Record<string, string>;
    damage_at_character_level?: Record<string, string>;
  };
  school: DndReference;
  classes: DndReference[];
  subclasses: DndReference[];
  url: string;
}

// ===========================
// CHARACTER CREATION DATA
// ===========================

export interface CharacterCreationData {
  // Basic Info
  name: string;
  level: number;
  experience: number;
  
  // Character Choices
  selectedRace: DndRace | null;
  selectedSubrace: DndSubrace | null;
  selectedClass: DndClass | null;
  selectedSubclass: DndSubclass | null;
  selectedBackground: DndBackground | null;
  alignment: string | null;
  
  // Ability Scores - ✅ CORRIGIDO: tipo consistente
  abilityMethod: "point-buy" | "standard" | "rolled";
  abilityScores: AbilityScores;
  pointsRemaining: number;
  
  // Combat Stats
  hitPoints: number;
  armorClass: number;
  
  // Skills & Proficiencies
  selectedSkills: string[];
  availableSkillChoices: number;
  proficiencies: string[];
  languages: string[];
  
  // Equipment
  selectedEquipment: string[];
  
  // Spellcasting - ✅ CORRIGIDO: tipo consistente
  isSpellcaster: boolean;
  spellcastingAbility: keyof AbilityScores | null;
  selectedSpells: string[];
  knownSpells: number;
  spellSlots: Record<string, number>;
  
  // Personality
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
  
  // Additional Info
  backstory: string;
  notes: string;
}

// ===========================
// API RESPONSE TYPES
// ===========================

export interface APIResponse<T> {
  count: number;
  results: T[];
}

export interface CreateCharacterResponse {
  success: boolean;
  character?: CharacterCreationData;
  error?: string;
}

// ===========================
// SPELL FILTERING & SEARCH
// ===========================

export interface SpellFilters {
  level?: number;
  school?: string;
  class?: string;
  ritual?: boolean;
  concentration?: boolean;
  searchTerm?: string;
}

export interface SpellSearchResult {
  spells: DndSpell[];
  availableLevelSpells?: DndSpell[];
}

// ===========================
// CONTEXT TYPE - COMPLETO E CORRIGIDO
// ===========================

export interface CharacterCreationContextType {
  // Step Management
  currentStep: number;
  steps: CharacterCreationStep[];
  currentStepData?: CharacterCreationStep;
  progress: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepIndex: number) => void;
  canProceed: () => boolean;

  // Character Data
  characterData: CharacterCreationData;
  updateCharacterData: (updates: Partial<CharacterCreationData>) => void;
  updateCharacterField: <K extends keyof CharacterCreationData>(
    field: K,
    value: CharacterCreationData[K]
  ) => void;
  updateAbilityScore: (ability: keyof AbilityScores, value: number) => void;
  toggleSkill: (skillKey: string) => void;
  toggleSpell: (spellIndex: string) => void;

  // Loading States
  isLoading: boolean;
  loading: boolean;
  error: string | null;

  // D&D Data
  races: DndRace[];
  classes: DndClass[];
  backgrounds: DndBackground[];
  spells: DndSpell[];
  subclasses: DndSubclass[];
  subraces: DndSubrace[];

  // Individual Loading States
  isLoadingRaces: boolean;
  isLoadingClasses: boolean;
  isLoadingBackgrounds: boolean;
  isLoadingSpells: boolean;
  isLoadingSubclasses: boolean;
  isLoadingSubraces: boolean;

  // Search Functionality
  raceSearch: string;
  setRaceSearch: (search: string) => void;
  classSearch: string;
  setClassSearch: (search: string) => void;
  spellSearch: string;
  setSpellSearch: (search: string) => void;
  raceSearchTerm: string;
  setRaceSearchTerm: (search: string) => void;
  classSearchTerm: string;
  setClassSearchTerm: (search: string) => void;
  spellSearchTerm: string;
  setSpellSearchTerm: (search: string) => void;

  // Validation
  validateStep: (stepId: string) => boolean;
  validateCurrentStep: () => boolean;
  isStepValid: (stepId: string) => boolean;

  // Actions
  resetCharacter: () => void;
  createCharacter: () => Promise<void>;

  // ===========================
  // UTILITY FUNCTIONS - TODAS IMPLEMENTADAS
  // ===========================

  /**
   * Bônus combinados de habilidade (raça + sub-raça)
   */
  getCombinedAbilityBonuses: Record<keyof AbilityScores, number>;

  /**
   * Calcula modificador de habilidade
   */
  calculateModifier: (score: number) => number;
  getAbilityModifier: (score: number) => number;

  /**
   * Calcula pontos de vida baseados na classe e constituição
   */
  calculateHitPoints: () => number;

  /**
   * Calcula classe de armadura baseada na destreza
   */
  calculateArmorClass: () => number;

  /**
   * Determina a habilidade de conjuração baseada na classe
   */
  getSpellcastingAbility: (classIndex?: string) => DndReference | null;

  /**
   * Calcula bônus de proficiência baseado no nível
   */
  getProficiencyBonus: (level: number) => number;

  /**
   * Calcula modificador de perícia
   */
  getSkillModifier: (skill: string, scores: AbilityScores, isProficient?: boolean) => number;

  /**
   * Funções para sub-raças e sub-classes
   */
  getAvailableSubraces: () => DndSubrace[];
  getAvailableSubclasses: () => DndSubclass[];
  needsSubrace: () => boolean; // ✅ CORRIGIDO: agora retorna boolean
  needsSubclass: () => boolean;

  /**
   * Funções para perícias
   */
  getAvailableSkills: () => Skill[];
  getSkillChoices: () => number;

  /**
   * Geração de atributos
   */
  generateRandomAbilityScores: () => AbilityScores;
  calculateAbilityScorePoints: (scores: AbilityScores) => number;

  /**
   * Funções auxiliares
   */
  getSubclassLevel: () => number;

  /**
   * ✅ DEBUG FUNCTIONS - IMPLEMENTADAS
   */
  debugAbilityScores: () => void;
  fixPointsRemaining: () => void;

  /**
   * Final ability scores with racial bonuses applied
   */
  getFinalAbilityScores: AbilityScores;
}

// ===========================
// UTILITY TYPES
// ===========================

export type AbilityScoreKey = keyof AbilityScores;

export type StepId = 
  | "basic-info" 
  | "race"
  | "class"
  | "abilities" 
  | "skills" 
  | "background"
  | "equipment" 
  | "spells" 
  | "personality";

export type AlignmentType = 
  | "lawful-good" 
  | "neutral-good" 
  | "chaotic-good"
  | "lawful-neutral" 
  | "true-neutral" 
  | "chaotic-neutral"
  | "lawful-evil" 
  | "neutral-evil" 
  | "chaotic-evil";

export type SizeType = "tiny" | "small" | "medium" | "large" | "huge" | "gargantuan";

export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type RarityType = "common" | "uncommon" | "rare" | "very-rare" | "legendary" | "artifact";

// ===========================
// FORM VALIDATION TYPES
// ===========================

export interface ValidationError {
  field: string;
  message: string;
}

export interface StepValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface StepValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

// ===========================
// EQUIPMENT TYPES
// ===========================

export interface EquipmentItem {
  index: string;
  name: string;
  equipment_category: DndReference;
  gear_category?: DndReference;
  cost?: {
    quantity: number;
    unit: string;
  };
  weight?: number;
  desc?: string[];
  properties?: string[];
  damage?: {
    damage_dice: string;
    damage_type: DndReference;
  };
  range?: {
    normal: number;
    long?: number;
  };
  throw_range?: {
    normal: number;
    long: number;
  };
  armor_category?: string;
  armor_class?: {
    base: number;
    dex_bonus?: boolean;
    max_bonus?: number;
  };
  str_minimum?: number;
  stealth_disadvantage?: boolean;
  url: string;
}

export interface WeaponProperty {
  index: string;
  name: string;
  desc: string[];
  url: string;
}

// ===========================
// BACKGROUND FEATURE TYPES
// ===========================

export interface BackgroundFeature {
  name: string;
  description: string[];
}

export interface PersonalityOption {
  trait?: string;
  ideal?: {
    description: string;
    alignments: string[];
  };
  bond?: string;
  flaw?: string;
}

// ===========================
// EXPORT LEGACY INTERFACE
// ===========================

export interface DndApiReference extends DndReference {}

// ===========================
// EXPORT ALL
// ===========================

export default CharacterCreationData;