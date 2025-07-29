// ===========================
// CHARACTER CREATION TYPES - REFATORADO
// src/types/characterCreation.ts
// ===========================

import { 
  Character, 
  AbilityScores,
  Skills,
  Spell
} from "@/types/character";

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
  key: keyof Skills;
  name: string;
  ability: keyof AbilityScores;
}

export const SKILLS: Skill[] = [
  { key: "athletics", name: "Atletismo", ability: "strength" },
  { key: "acrobatics", name: "Acrobacia", ability: "dexterity" },
  { key: "sleight_of_hand", name: "Prestidigitação", ability: "dexterity" },
  { key: "stealth", name: "Furtividade", ability: "dexterity" },
  { key: "arcana", name: "Arcanismo", ability: "intelligence" },
  { key: "history", name: "História", ability: "intelligence" },
  { key: "investigation", name: "Investigação", ability: "intelligence" },
  { key: "nature", name: "Natureza", ability: "intelligence" },
  { key: "religion", name: "Religião", ability: "intelligence" },
  { key: "animal_handling", name: "Adestramento", ability: "wisdom" },
  { key: "insight", name: "Intuição", ability: "wisdom" },
  { key: "medicine", name: "Medicina", ability: "wisdom" },
  { key: "perception", name: "Percepção", ability: "wisdom" },
  { key: "survival", name: "Sobrevivência", ability: "wisdom" },
  { key: "deception", name: "Enganação", ability: "charisma" },
  { key: "intimidation", name: "Intimidação", ability: "charisma" },
  { key: "performance", name: "Atuação", ability: "charisma" },
  { key: "persuasion", name: "Persuasão", ability: "charisma" }
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
  userId: string;
  campaignId?: string;
  name: string;
  level: number;
  selectedRace: DndRace | null;
  selectedSubrace: DndSubrace | null;
  selectedClass: DndClass | null;
  selectedSubclass: DndSubclass | null;
  selectedBackground: DndBackground | null;
  alignment: string | null;
  abilityMethod: "point-buy" | "standard" | "rolled";
  abilityScores: AbilityScores;
  pointsRemaining: number;
  hitPoints: number;
  armorClass: number;
  selectedSkills: (keyof Skills)[];
  availableSkillChoices: number;
  equipment: string[];
  features: string[];
  languages: string[];
  proficiencies: string[];
  isSpellcaster: boolean;
  spellcastingAbility: keyof AbilityScores | null;
  selectedSpells: Spell[];
  spellSlots: Record<number, number>;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  backstory: string;
  appearance: string;
  playerName?: string;
  avatarUrl?: string;
}

// ===========================
// CONTEXT TYPE - REFATORADO
// ===========================

export interface CharacterCreationContextType {
  currentStep: number;
  steps: CharacterCreationStep[];
  currentStepData?: CharacterCreationStep;
  progress: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepIndex: number) => void;
  canProceed: () => boolean;

  characterData: CharacterCreationData;
  updateCharacterData: (updates: Partial<CharacterCreationData>) => void;
  updateCharacterField: <K extends keyof CharacterCreationData>(
    field: K,
    value: CharacterCreationData[K]
  ) => void;
  updateAbilityScore: (ability: keyof AbilityScores, value: number) => void;
  toggleSkill: (skillKey: keyof Skills) => void;
  toggleSpell: (spellId: string) => void;

  isLoading: boolean;
  loading: boolean;
  error: string | null;

  races: DndRace[];
  classes: DndClass[];
  backgrounds: DndBackground[];
  spells: DndSpell[];
  subclasses: DndSubclass[];
  subraces: DndSubrace[];

  isLoadingRaces: boolean;
  isLoadingClasses: boolean;
  isLoadingBackgrounds: boolean;
  isLoadingSpells: boolean;
  isLoadingSubclasses: boolean;
  isLoadingSubraces: boolean;

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

  validateStep: (stepId: string) => boolean;
  validateCurrentStep: () => boolean;
  isStepValid: (stepId: string) => boolean;

  resetCharacter: () => void;
  createCharacter: () => Promise<Character | null>;

  getCombinedAbilityBonuses: Record<keyof AbilityScores, number>;
  calculateModifier: (score: number) => number;
  getAbilityModifier: (score: number) => number;
  calculateHitPoints: () => number;
  calculateArmorClass: () => number;
  getSpellcastingAbility: (classIndex?: string) => DndReference | null;
  getProficiencyBonus: (level: number) => number;
  getSkillModifier: (skill: keyof Skills, isProficient: boolean) => number;
  getAvailableSubraces: () => DndSubrace[];
  getAvailableSubclasses: () => DndSubclass[];
  needsSubrace: () => boolean;
  needsSubclass: () => boolean;
  getAvailableSkills: () => Skill[];
  getSkillChoices: () => number;
  generateRandomAbilityScores: () => AbilityScores;
  calculateAbilityScorePoints: (scores: AbilityScores) => number;
  getSubclassLevel: () => number;
  debugAbilityScores: () => void;
  fixPointsRemaining: () => void;
  getFinalAbilityScores: AbilityScores;
}

// ===========================
// UTILITY TYPES
// ===========================

export interface CharacterCreationStep {
  id: string;
  title: string;
  description?: string;
  isValid: boolean;
  isCompleted: boolean;
}

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
// FUNÇÃO DE CONVERSÃO
// ===========================

export function convertCreationToCharacter(
  creationData: CharacterCreationData
): Character {
  return {
    id: "",
    user_id: creationData.userId,
    campaign_id: creationData.campaignId,
    basic_info: {
      name: creationData.name,
      race_info: {
        race_name: creationData.selectedRace?.name || "",
        race_index: creationData.selectedRace?.index || "",
        subrace_name: creationData.selectedSubrace?.name || undefined,
        subrace_index: creationData.selectedSubrace?.index || undefined,
        speed: creationData.selectedRace?.speed || 30,
        size: "Medium",
        ability_bonuses: getCombinedAbilityBonuses(creationData),
        racial_traits: [],
        languages: creationData.languages,
        proficiencies: creationData.proficiencies
      },
      class: creationData.selectedClass?.name || "",
      level: creationData.level,
      background: creationData.selectedBackground?.name || "",
      alignment: creationData.alignment || undefined
    },
    attributes: creationData.abilityScores,
    skills: createSkillsObject(creationData.selectedSkills),
    stats: {
      current_hp: creationData.hitPoints,
      max_hp: creationData.hitPoints,
      armor_class: creationData.armorClass,
      experience_points: 0,
      hit_dice: `${creationData.level}d${creationData.selectedClass?.hit_die || 8}`
    },
    combat: {
      attacks: []
    },
    magic: {
      spellcaster: creationData.isSpellcaster,
      spellcasting_ability: creationData.spellcastingAbility || undefined,
      known_spells: creationData.selectedSpells,
      spell_slots_1: creationData.spellSlots[1] || 0,
      spell_slots_2: creationData.spellSlots[2] || 0,
      spell_slots_3: creationData.spellSlots[3] || 0,
      spell_slots_4: creationData.spellSlots[4] || 0,
      spell_slots_5: creationData.spellSlots[5] || 0,
      spell_slots_6: creationData.spellSlots[6] || 0,
      spell_slots_7: creationData.spellSlots[7] || 0,
      spell_slots_8: creationData.spellSlots[8] || 0,
      spell_slots_9: creationData.spellSlots[9] || 0
    },
    details: {
      background: creationData.selectedBackground?.feature?.desc?.join("\n") || "",
      alignment: creationData.alignment || undefined,
      personality_traits: creationData.personalityTraits,
      ideals: creationData.ideals,
      bonds: creationData.bonds,
      flaws: creationData.flaws,
      backstory: creationData.backstory,
      appearance: creationData.appearance
    },
    equipment: creationData.equipment,
    features: creationData.features,
    languages: creationData.languages,
    proficiencies: creationData.proficiencies,
    player_name: creationData.playerName,
    is_active: true,
    avatar_url: creationData.avatarUrl
  };
}

function createSkillsObject(selectedSkills: (keyof Skills)[]): Skills {
  const skills: Skills = {
    athletics: false,
    acrobatics: false,
    sleight_of_hand: false,
    stealth: false,
    arcana: false,
    history: false,
    investigation: false,
    nature: false,
    religion: false,
    animal_handling: false,
    insight: false,
    medicine: false,
    perception: false,
    survival: false,
    deception: false,
    intimidation: false,
    performance: false,
    persuasion: false
  };

  selectedSkills.forEach(skillKey => {
    skills[skillKey] = true;
  });

  return skills;
}

function getCombinedAbilityBonuses(
  creationData: CharacterCreationData
): Record<string, number> {
  const bonuses: Record<string, number> = {};

  creationData.selectedRace?.ability_bonuses?.forEach(bonus => {
    const ability = bonus.ability_score.index;
    bonuses[ability] = (bonuses[ability] || 0) + bonus.bonus;
  });

  creationData.selectedSubrace?.ability_bonuses?.forEach(bonus => {
    const ability = bonus.ability_score.index;
    bonuses[ability] = (bonuses[ability] || 0) + bonus.bonus;
  });

  return bonuses;
}

// ===========================
// EXPORT DEFAULT
// ===========================

export default CharacterCreationData;