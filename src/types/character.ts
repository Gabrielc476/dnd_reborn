export interface DiceRoll {
  dice_count: number;
  dice_sides: number;
  modifier: number;
}

export interface EquipmentItem {
  index: string;
  name: string;
  equipment_category: string;
  gear_category?: string;
  cost: {
    quantity: number;
    unit: string;
  };
  weight?: number;
  description?: string;
  
  // Campos específicos para armas
  weapon_category?: string;
  weapon_range?: string;
  category_range?: string;
  damage?: DiceRoll;
  damage_type?: string;
  range?: {
    normal: number;
    long: number | null;
  };
  properties?: Array<{
    index: string;
    name: string;
    url?: string;
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
  rarity?: string;
  attunement?: boolean;
  is_magical?: boolean;
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

export interface BasicInfo {
  name: string;
  race_info: RaceInfo;
  character_class: string;
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
  
  // Informações básicas
  basic_info: BasicInfo;
  
  // Atributos e habilidades
  attributes: Attributes;
  skills: Skills;
  
  // Status e combate
  stats: Stats;
  combat: Combat;
  
  // Sistema mágico
  magic: Magic;
  
  // Detalhes descritivos
  details: CharacterDetails;
  
  // Itens e características
  equipment: EquipmentItem[];  // Alterado para usar EquipmentItem
  features: string[];
  languages: string[];
  proficiencies: string[];
  
  // Informações do jogador
  player_name?: string;
  is_active: boolean;
  
  // Metadados
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
  
  // Estatísticas calculadas
  calculated_stats?: CalculatedStats;
}

// Schema para listagem resumida de personagens
export interface CharacterSummary {
  id: string;
  user_id: string;
  campaign_id?: string;
  name: string;
  race_name: string;
  subrace_name?: string;
  class: string;
  level: number;
  player_name?: string;
  is_active: boolean;
  avatar_url?: string;
}