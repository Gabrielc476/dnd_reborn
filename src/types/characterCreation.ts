// ===========================
// CHARACTER CREATION TYPES - UPDATED WITH SUBRACES
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
  duration: string;
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
  selectedSubrace: DndSubrace | null; // ← NOVA PROPRIEDADE
  selectedClass: DndClass | null;
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
  subraces: DndSubrace[]; // ← NOVA PROPRIEDADE

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

  // Utilitários
  getAbilityModifier: (score: number) => number;
  calculateAbilityScorePoints: (scores: AbilityScores) => number;
  generateRandomAbilityScores: () => AbilityScores;

  // Busca
  raceSearch: string;
  setRaceSearch: (search: string) => void;
  classSearch: string;
  setClassSearch: (search: string) => void;
  spellSearch: string;
  setSpellSearch: (search: string) => void;

  // Estados de carregamento
  isLoadingRaces: boolean;
  isLoadingClasses: boolean;
  isLoadingSpells: boolean;
  isLoadingSubraces: boolean; // ← NOVA PROPRIEDADE

  // Funções específicas para subraças
  getAvailableSubraces: () => DndSubrace[]; // ← NOVA FUNÇÃO
  getSubraceAbilityBonuses: () => Array<{
    ability_score: DndApiReference;
    bonus: number;
  }>; // ← NOVA FUNÇÃO
}

// ===========================
// VALIDATION TYPES
// ===========================

export interface ValidationRule {
  field: string;
  message: string;
  validator: (data: CharacterCreationData) => boolean;
}

export interface StepValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ===========================
// SKILL DEFINITIONS
// ===========================

export interface SkillDefinition {
  key: string;
  name: string;
  ability: keyof AbilityScores;
  description: string;
}

export const SKILLS: SkillDefinition[] = [
  {
    key: "athletics",
    name: "Atletismo",
    ability: "strength",
    description: "Escalar, saltar, nadar",
  },
  {
    key: "acrobatics",
    name: "Acrobacia",
    ability: "dexterity",
    description: "Equilibrar-se, rolar, virar cambalhotas",
  },
  {
    key: "sleight_of_hand",
    name: "Prestidigitação",
    ability: "dexterity",
    description: "Bater carteira, truques de mão",
  },
  {
    key: "stealth",
    name: "Furtividade",
    ability: "dexterity",
    description: "Esconder-se, mover-se silenciosamente",
  },
  {
    key: "arcana",
    name: "Arcano",
    ability: "intelligence",
    description: "Conhecimento sobre magias e itens mágicos",
  },
  {
    key: "history",
    name: "História",
    ability: "intelligence",
    description: "Conhecimento sobre eventos históricos",
  },
  {
    key: "investigation",
    name: "Investigação",
    ability: "intelligence",
    description: "Procurar pistas e fazer deduções",
  },
  {
    key: "nature",
    name: "Natureza",
    ability: "intelligence",
    description: "Conhecimento sobre o mundo natural",
  },
  {
    key: "religion",
    name: "Religião",
    ability: "intelligence",
    description: "Conhecimento sobre divindades e rituais",
  },
  {
    key: "animal_handling",
    name: "Lidar com Animais",
    ability: "wisdom",
    description: "Controlar e acalmar animais",
  },
  {
    key: "insight",
    name: "Intuição",
    ability: "wisdom",
    description: "Determinar as verdadeiras intenções",
  },
  {
    key: "medicine",
    name: "Medicina",
    ability: "wisdom",
    description: "Tratar ferimentos e doenças",
  },
  {
    key: "perception",
    name: "Percepção",
    ability: "wisdom",
    description: "Notar detalhes com os sentidos",
  },
  {
    key: "survival",
    name: "Sobrevivência",
    ability: "wisdom",
    description: "Rastrear, navegar e encontrar abrigo",
  },
  {
    key: "deception",
    name: "Enganação",
    ability: "charisma",
    description: "Mentir convincentemente",
  },
  {
    key: "intimidation",
    name: "Intimidação",
    ability: "charisma",
    description: "Influenciar através de ameaças",
  },
  {
    key: "performance",
    name: "Atuação",
    ability: "charisma",
    description: "Entreter uma audiência",
  },
  {
    key: "persuasion",
    name: "Persuasão",
    ability: "charisma",
    description: "Influenciar com tato e carisma",
  },
];

// ===========================
// ALIGNMENT OPTIONS
// ===========================

export const ALIGNMENTS = [
  {
    value: "lawful-good",
    label: "Leal e Bom",
    description: "Age com compaixão e honra",
  },
  {
    value: "neutral-good",
    label: "Neutro e Bom",
    description: "Faz o melhor que pode para ajudar outros",
  },
  {
    value: "chaotic-good",
    label: "Caótico e Bom",
    description: "Age conforme sua consciência",
  },
  {
    value: "lawful-neutral",
    label: "Leal e Neutro",
    description: "Age de acordo com lei e tradição",
  },
  {
    value: "true-neutral",
    label: "Neutro Verdadeiro",
    description: "Prefere manter-se fora de questões morais",
  },
  {
    value: "chaotic-neutral",
    label: "Caótico e Neutro",
    description: "Segue seus caprichos",
  },
  {
    value: "lawful-evil",
    label: "Leal e Mau",
    description: "Toma o que quer dentro dos limites da lei",
  },
  {
    value: "neutral-evil",
    label: "Neutro e Mau",
    description: "Faz o que pode escapar impune",
  },
  {
    value: "chaotic-evil",
    label: "Caótico e Mau",
    description: "Age com violência arbitrária",
  },
];

// ===========================
// EXPORT ALL
// ===========================

export type {
  DndApiReference,
  DndRace,
  DndSubrace,
  DndClass,
  DndBackground,
  DndSpell,
  CharacterCreationStep,
  AbilityScores,
  CharacterCreationData,
  CharacterCreationContextType,
  ValidationRule,
  StepValidation,
  SkillDefinition,
};
