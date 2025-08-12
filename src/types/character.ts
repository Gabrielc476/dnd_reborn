export interface DiceRoll {
  dice_count: number;
  dice_sides: number;
  modifier: number;
}

export interface EquipmentItem {
  index: string;
  name: string;
  url: string;
  desc?: string[];
  equipment_category: {
    index: string;
    name: string;
    url: string;
  };
  gear_category?: {
    index: string;
    name: string;
    url: string;
  };
  cost: {
    quantity: number;
    unit: string;
  };
  weight?: number;
  
  // Campos específicos para armas
  weapon_category?: string;
  weapon_range?: string;
  category_range?: string;
  damage?: {
    damage_dice: string;
    damage_type: {
      index: string;
      name: string;
      url: string;
    };
  };
  range?: {
    normal: number;
    long: number | null;
  };
  properties?: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  
  // Campos específicos para armaduras
  armor_category?: string;
  armor_class?: {
    base: number;
    dex_bonus: boolean;
    max_bonus?: number | null;
  };
  str_minimum?: number;
  stealth_disadvantage?: boolean;
  
  // Campos para itens mágicos
  rarity?: {
    name: string;
  };
  attunement?: boolean;
  is_magical?: boolean;
  
  // Campos para kits de ferramentas
  tool_category?: string;
  
  // Campos para veículos
  vehicle_category?: string;
  speed?: {
    quantity: number;
    unit: string;
  };
  
  // Campos para itens com conteúdo
  contents?: Array<{
    item: {
      index: string;
      name: string;
      url: string;
    };
    quantity: number;
  }>;
  
  // Campos especiais
  special?: string[];
  capacity?: string;
}

export interface Attack {
  name: string;
  attack_bonus?: number;
  damage: DiceRoll;
  damage_type?: string;
  range?: string;
  description?: string;
}

export interface Spell {
  name: string;
  level: number;
  school: string;
  description?: string;
  is_attack_spell?: boolean;
  attack_bonus?: number;
  damage?: DiceRoll;
  damage_type?: string;
  save_dc?: number;
  save_ability?: string;
  range?: string;
}

export interface Attributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface RaceInfo {
  race_name: string;
  race_index: string;
  subrace_name?: string;
  subrace_index?: string;
  speed: number;
  size: string;
  ability_bonuses: Record<string, number>;
  racial_traits: string[];
  languages: string[];
  proficiencies: string[];
}

export interface APIReference {
  index: string;
  name: string;
  url?: string;
}

export interface ProficiencyChoice {
  choose: number;
  type?: string;
  from?: any[]; // normalmente array de APIReference ou objetos mais complexos
}

export interface StartingEquipmentItem {
  equipment: APIReference;
  quantity: number;
}

export interface StartingEquipmentOption {
  choose: number;
  type?: string;
  from?: any[];
}

export interface MultiClassingInfo {
  requirements?: any[];
  proficiencies?: APIReference[];
}


export interface DnDClass {
  index: string;
  name: string;
  hit_die?: number;
  desc?: string[]; // descrição em array, conforme a API
  proficiency_choices?: ProficiencyChoice[];
  proficiencies?: APIReference[];
  saving_throws?: APIReference[];
  starting_equipment?: StartingEquipmentItem[];
  starting_equipment_options?: StartingEquipmentOption[];
  class_levels?: string; // endpoint (ex: "/api/classes/wizard/levels")
  subclasses?: APIReference[]; // referências para subclasses
  multi_classing?: MultiClassingInfo;
  spellcasting?: any; // estrutura complexa — deixe any ou defina explicitamente se quiser
  url?: string;

  // Allow extra fields que a API pode retornar:
  [key: string]: any;
}

// ======= Tipos de Subclass (seu formato customizado) =======

export interface FeatureItem {
  index: string;
  name: string;
  description?: string; // aqui você guarda a descrição (substituindo a url)
  url?: string; // opcional — mantive para compatibilidade
}

export interface SubclassLevel {
  level: number;
  features: FeatureItem[];
}

/**
 * Atenção: o backend recebe o campo com o nome "class" (alias).
 * Em TypeScript é válido usar `class?: APIReference`, mas se preferir
 * acesse sempre como subclass["class"] no runtime para evitar conflitos.
 */
export interface Subclass {
  index: string;
  name: string;
  class?: APIReference; // campo vindo do backend (referência à class)
  desc?: string[];
  subclass_flavor?: string;
  subclass_levels: SubclassLevel[];
  url?: string;

  [key: string]: any;
}

export interface BasicInfo {
  name: string;
  race_info: RaceInfo;
  // agora o campo "character_class" é o objeto completo da API
  character_class: DnDClass;
  level: number;
  background: string;
  alignment?: string;
}

export interface Skills {
  athletics: boolean;
  acrobatics: boolean;
  sleight_of_hand: boolean;
  stealth: boolean;
  arcana: boolean;
  history: boolean;
  investigation: boolean;
  nature: boolean;
  religion: boolean;
  animal_handling: boolean;
  insight: boolean;
  medicine: boolean;
  perception: boolean;
  survival: boolean;
  deception: boolean;
  intimidation: boolean;
  performance: boolean;
  persuasion: boolean;
}

export interface Stats {
  hit_points: number;
  armor_class: number;
  experience_points?: number;
}

export interface Combat {
  attacks: Attack[];
}

export interface Magic {
  spellcaster: boolean;
  spellcasting_ability?: string;
  known_spells: Spell[];
  spell_slots_1: number;
  spell_slots_2: number;
  spell_slots_3: number;
  spell_slots_4: number;
  spell_slots_5: number;
  spell_slots_6: number;
  spell_slots_7: number;
  spell_slots_8: number;
  spell_slots_9: number;
}

export interface CharacterDetails {
  background: string;
  alignment?: string;
  personality_traits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;
  appearance?: string;
}

export interface CalculatedStats {
  ability_modifiers?: Record<string, number>;
  proficiency_bonus?: number;
  spellcasting_modifier?: number;
  spell_attack_bonus?: number;
  spell_save_dc?: number;
  initiative_bonus?: number;
  race_info?: {
    display_name: string;
    race_name: string;
    subrace_name?: string;
  };
  combined_bonuses?: Record<string, number>;
  racial_traits?: string[];
  languages?: string[];
  proficiencies?: string[];
  final_attributes?: Record<string, number>;
  base_attributes?: Record<string, number>;
}

export interface Character {
  id: string;
  campaign_id?: string;
  user_id?: string;

  basic_info: BasicInfo;

  attributes: Attributes;
  skills: Skills;

  stats: Stats;
  combat: Combat;

  magic: Magic;

  details: CharacterDetails;

  equipment: EquipmentItem[];
  features: string[];
  languages: string[];
  proficiencies: string[];

  player_name?: string;
  is_active: boolean;

  created_at?: string;
  updated_at?: string;
  avatar_url?: string;

  calculated_stats?: CalculatedStats;

  // subclasse conforme o backend -> objeto completo no seu formato
  chosen_subclass?: Subclass;

  // referência leve para subclasse (opcional)
  chosen_subclass_ref?: APIReference;
}

// Schema para listagem resumida de personagens
export interface CharacterSummary {
  id: string;
  user_id: string;
  campaign_id?: string;
  name: string;
  race_name: string;
  subrace_name?: string;
  // na listagem resumida, faz sentido devolver uma referência leve (APIReference)
  class: APIReference;
  level: number;
  player_name?: string;
  is_active: boolean;
  avatar_url?: string;
}