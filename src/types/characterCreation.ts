// ===========================
// CHARACTER CREATION TYPES - ARQUIVO COMPLETO CORRIGIDO
// src/types/characterCreation.ts
// ===========================

// ===========================
// D&D API REFERENCE TYPES
// ===========================

export interface DndApiReference {
  index: string;
  name: string;
  url: string;
}

// ===========================
// D&D CORE ENTITY TYPES
// ===========================

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
  class_levels: string;
  multi_classing: {
    prerequisites?: Array<{
      ability_score: DndApiReference;
      minimum_score: number;
    }>;
    proficiencies?: DndApiReference[];
  };
  subclasses: DndApiReference[];
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
  // Basic Information
  name: string;
  selectedRace: DndRace | null;
  selectedSubrace: DndSubrace | null;
  selectedClass: DndClass | null;
  selectedSubclass: DndSubclass | null;
  selectedBackground: DndBackground | null;
  level: number;
  alignment: string;

  // Ability Scores
  abilityScores: AbilityScores;
  abilityMethod: "standard" | "point_buy" | "roll";

  // Skills and Proficiencies
  selectedSkills: string[];
  availableSkillChoices: number;

  // Combat Stats
  hitPoints: number;
  armorClass: number;

  // Spellcasting
  selectedSpells: DndSpell[];
  isSpellcaster: boolean;
  spellcastingAbility: keyof AbilityScores | null;

  // Personality
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
// CONTEXT TYPE (CORRIGIDO)
// ===========================

export interface CharacterCreationContextType {
  // Step Management
  currentStep: number;
  steps: CharacterCreationStep[];
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepIndex: number) => void;

  // Character Data
  characterData: CharacterCreationData;
  updateCharacterData: (updates: Partial<CharacterCreationData>) => void;

  // Loading States
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

  // Validation
  validateStep: (stepId: string) => boolean;
  isStepValid: (stepId: string) => boolean;

  // ===========================
  // UTILITY FUNCTIONS (CORRIGIDO)
  // ===========================

  /**
   * ✅ CORRIGIDO: Bônus combinados de habilidade (raça + sub-raça)
   * É um valor computado, não uma função
   */
  getCombinedAbilityBonuses: Record<keyof AbilityScores, number>;

  /**
   * Calcula modificador de habilidade
   */
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
  getSpellcastingAbility: (classIndex?: string) => keyof AbilityScores | null;

  /**
   * Calcula bônus de proficiência baseado no nível
   */
  getProficiencyBonus: (level: number) => number;

  /**
   * Calcula modificador de perícia
   */
  getSkillModifier: (skill: string, scores: AbilityScores, isProficient?: boolean) => number;

  /**
   * Calcula DC de teste de magia
   */
  getSpellSaveDC: (spellcastingMod: number, proficiencyBonus: number) => number;

  /**
   * Calcula bônus de ataque mágico
   */
  getSpellAttackBonus: (spellcastingMod: number, proficiencyBonus: number) => number;

  /**
   * Calcula capacidade de carga
   */
  getCarryingCapacity: (strength: number) => number;

  /**
   * Calcula modificador de iniciativa
   */
  getInitiativeModifier: (dexModifier: number) => number;

  /**
   * Gera atributos aleatórios (4d6, remove menor)
   */
  generateRandomAbilityScores: () => AbilityScores;

  /**
   * Calcula pontos gastos no sistema point buy
   */
  calculateAbilityScorePoints: (scores: AbilityScores) => number;

  // ===========================
  // FUNÇÕES PARA SUBRACES E SUBCLASSES
  // ===========================

  /**
   * Retorna sub-raças disponíveis para a raça selecionada
   */
  getAvailableSubraces: () => DndSubrace[];

  /**
   * Retorna subclasses disponíveis para a classe selecionada
   */
  getAvailableSubclasses: () => DndSubclass[];

  /**
   * Retorna bônus de habilidade da sub-raça selecionada
   */
  getSubraceAbilityBonuses: () => Array<{
    ability_score: DndApiReference;
    bonus: number;
  }>;

  /**
   * Retorna features de subclasse para um nível específico
   */
  getSubclassFeatures: (level?: number) => DndApiReference[];

  /**
   * Verifica se precisa escolher subclasse no nível atual
   */
  needsSubclass: () => boolean;

  /**
   * Verifica se precisa escolher sub-raça
   */
  needsSubrace: () => boolean;

  /**
   * Retorna skills disponíveis baseado na classe
   */
  getAvailableSkills: () => Skill[];

  /**
   * Calcula número de skill choices baseado na classe
   */
  getSkillChoices: () => number;

  // ===========================
  // ACTIONS
  // ===========================

  /**
   * Reseta o personagem para valores iniciais
   */
  resetCharacter: () => void;

  /**
   * Finaliza a criação do personagem
   */
  createCharacter: () => Promise<void>;
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

export interface Skill {
  key: string;
  name: string;
  ability: keyof AbilityScores;
  description?: string;
}

export interface Alignment {
  value: string;
  label: string;
  short: string;
  description?: string;
}

export interface ProficiencyChoice {
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
}

// ===========================
// CONSTANTS
// ===========================

export const ALIGNMENTS: Alignment[] = [
  { 
    value: "lawful-good", 
    label: "Leal e Bom", 
    short: "LB",
    description: "Criaturas que podem ser contadas para fazer a coisa certa como esperado pela sociedade. Dragões dourados, paladinos e a maioria dos anões são leais e bons."
  },
  { 
    value: "neutral-good", 
    label: "Neutro e Bom", 
    short: "NB",
    description: "Pessoas que fazem o melhor que podem para ajudar outras pessoas de acordo com suas necessidades. Muitos celestiais, alguns gigantes das nuvens e a maioria dos gnomos são neutros e bons."
  },
  { 
    value: "chaotic-good", 
    label: "Caótico e Bom", 
    short: "CB",
    description: "Criaturas que agem de acordo com sua consciência, com pouca consideração para o que os outros esperam. Dragões de cobre, muitos elfos e unicórnios são caóticos e bons."
  },
  { 
    value: "lawful-neutral", 
    label: "Leal e Neutro", 
    short: "LN",
    description: "Indivíduos que agem de acordo com a lei, tradição ou códigos pessoais. Muitos monges e alguns magos são leais e neutros."
  },
  { 
    value: "neutral", 
    label: "Neutro", 
    short: "N",
    description: "O alinhamento daqueles que preferem ficar fora de questões morais e não tomam partido, fazendo o que parece melhor no momento. Druidas, muitos humanos e a maioria dos animais são neutros."
  },
  { 
    value: "chaotic-neutral", 
    label: "Caótico e Neutro", 
    short: "CN",
    description: "Criaturas que seguem seus caprichos, valorizando sua liberdade pessoal acima de tudo. Muitos bárbaros e ladinos, e alguns bardos, são caóticos e neutros."
  },
  { 
    value: "lawful-evil", 
    label: "Leal e Mau", 
    short: "LM",
    description: "Criaturas que conseguem metodicamente tomar o que querem, dentro dos limites de um código de tradição, lealdade ou ordem. Diabos, dragões azuis e hobgoblins são leais e maus."
  },
  { 
    value: "neutral-evil", 
    label: "Neutro e Mau", 
    short: "NM",
    description: "O alinhamento daqueles que fazem qualquer coisa que conseguem fazer sem compaixão ou remorso. Muitos drow, alguns gigantes das nuvens e yugoloths são neutros e maus."
  },
  { 
    value: "chaotic-evil", 
    label: "Caótico e Mau", 
    short: "CM",
    description: "Criaturas que agem com violência arbitrária, estimuladas por sua ganância, ódio ou sede de sangue. Demônios, dragões vermelhos e orcs são caóticos e maus."
  },
];

export const SKILLS: Skill[] = [
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
// UTILITY FUNCTIONS
// ===========================

/**
 * Verifica se uma classe pode ter subclasse
 */
export const canHaveSubclass = (classIndex: string): boolean => {
  const classesWithSubclasses = [
    'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk',
    'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'
  ];
  return classesWithSubclasses.includes(classIndex);
};

/**
 * Retorna o nível em que uma classe ganha subclasse
 */
export const getSubclassLevel = (classIndex: string): number => {
  const subclassLevels: Record<string, number> = {
    'barbarian': 3,
    'bard': 3,
    'cleric': 1,
    'druid': 2,
    'fighter': 3,
    'monk': 3,
    'paladin': 3,
    'ranger': 3,
    'rogue': 3,
    'sorcerer': 1,
    'warlock': 1,
    'wizard': 2,
  };
  
  return subclassLevels[classIndex] || 1;
};

/**
 * Verifica se o personagem pode escolher subclasse no nível atual
 */
export const canChooseSubclass = (classIndex: string, level: number): boolean => {
  if (!canHaveSubclass(classIndex)) return false;
  return level >= getSubclassLevel(classIndex);
};

/**
 * Retorna informações sobre o alinhamento
 */
export const getAlignmentInfo = (alignmentValue: string): Alignment | undefined => {
  return ALIGNMENTS.find(alignment => alignment.value === alignmentValue);
};

/**
 * Retorna informações sobre uma perícia
 */
export const getSkillInfo = (skillKey: string): Skill | undefined => {
  return SKILLS.find(skill => skill.key === skillKey);
};

/**
 * Filtra perícias por habilidade
 */
export const getSkillsByAbility = (ability: keyof AbilityScores): Skill[] => {
  return SKILLS.filter(skill => skill.ability === ability);
};

/**
 * Calcula modificador de habilidade
 */
export const calculateAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Calcula bônus de proficiência por nível
 */
export const calculateProficiencyBonus = (level: number): number => {
  return Math.ceil(level / 4) + 1;
};

// ===========================
// EXPORT ALL TYPES FOR EXTERNAL USE
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
  CharacterCreationContextType,
  AbilityScores,
  StepValidation,
  SpellInfo,
  Skill,
  Alignment,
  Equipment,
  AbilityBonus,
  ProficiencyChoice,
};