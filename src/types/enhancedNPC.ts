// ===========================
// TIPOS ATUALIZADOS PARA NPCs COM SISTEMA DE DADOS
// types/enhancedNPC.ts
// ===========================

// ===========================
// TIPOS DE DADOS E ROLAGENS
// ===========================

export interface DiceRoll {
  dice_count: number;
  dice_sides: number;
  modifier: number;
}

export interface RollResult {
  total: number;
  rolls: number[];
  modifier: number;
  formula: string;
  timestamp: Date;
}

// ===========================
// TIPOS DE COMBATE
// ===========================

export interface Attack {
  id?: string;
  name: string;
  attack_bonus: number;
  damage: DiceRoll;
  damage_type: string;
  range: string;
  description?: string;
  is_magical?: boolean;
  reach?: number;
  versatile_damage?: DiceRoll;
}

export interface Spell {
  id?: string;
  name: string;
  level: number; // 0-9
  school: string;
  description?: string;
  casting_time?: string;
  range: string;
  components?: string;
  duration?: string;
  
  // Informações de ataque/dano (para magias ofensivas)
  is_attack_spell: boolean;
  attack_bonus?: number;
  damage?: DiceRoll;
  damage_type?: string;
  save_dc?: number;
  save_ability?: string;
  
  // Upcast damage
  higher_level?: string;
  upcast_damage?: DiceRoll;
}

export enum DamageType {
  ACID = "ácido",
  BLUDGEONING = "contundente", 
  COLD = "frio",
  FIRE = "fogo",
  FORCE = "força",
  LIGHTNING = "elétrico",
  NECROTIC = "necrótico",
  PIERCING = "perfurante",
  POISON = "venenoso",
  PSYCHIC = "psíquico",
  RADIANT = "radiante",
  SLASHING = "cortante",
  THUNDER = "sônico"
}

export enum SpellSchool {
  ABJURATION = "Abjuração",
  CONJURATION = "Conjuração", 
  DIVINATION = "Adivinhação",
  ENCHANTMENT = "Encantamento",
  EVOCATION = "Evocação",
  ILLUSION = "Ilusão",
  NECROMANCY = "Necromancia",
  TRANSMUTATION = "Transmutação"
}

// ===========================
// ATRIBUTOS E ESTATÍSTICAS
// ===========================

export interface NPCAttributes {
  strength: number;      // Força
  dexterity: number;     // Destreza  
  constitution: number;  // Constituição
  intelligence: number;  // Inteligência
  wisdom: number;        // Sabedoria
  charisma: number;      // Carisma
}

export interface NPCStats {
  armor_class: number;
  hit_points: number;
  max_hit_points?: number;
  temporary_hit_points?: number;
  speed: string;
  attributes: NPCAttributes;
  
  // Estatísticas derivadas (calculadas)
  proficiency_bonus?: number;
  passive_perception?: number;
  initiative_modifier?: number;
}

export interface NPCSkills {
  [skillName: string]: {
    proficient: boolean;
    modifier: number;
    expertise?: boolean;
  };
}

export interface NPCSavingThrows {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

// ===========================
// HABILIDADES E TRAÇOS
// ===========================

export interface NPCAbility {
  id?: string;
  name: string;
  description: string;
  usage?: string; // "1/dia", "recarga 5-6", "à vontade", etc.
  usage_type?: 'per_day' | 'recharge' | 'at_will' | 'per_short_rest' | 'per_long_rest';
  max_uses?: number;
  current_uses?: number;
  recharge_on?: number[]; // Para habilidades de recarga (ex: [5, 6])
}

export interface NPCLegendaryAction {
  name: string;
  cost: number; // Quantas ações lendárias custa
  description: string;
}

export interface NPCLair {
  description: string;
  actions: string[];
  initiative: number;
}

// ===========================
// SISTEMA DE CONJURAÇÃO
// ===========================

export interface NPCSpellcasting {
  is_spellcaster: boolean;
  spellcasting_ability?: keyof NPCAttributes;
  spell_save_dc?: number;
  spell_attack_bonus?: number;
  caster_level?: number;
  
  // Slots de magia por nível
  spell_slots?: {
    [level: number]: {
      max: number;
      current: number;
    };
  };
  
  // Magias conhecidas
  spells_known?: Spell[];
  cantrips_known?: Spell[];
  
  // Ritual casting
  ritual_casting?: boolean;
  
  // Innate spellcasting
  innate_spellcasting?: {
    [frequency: string]: Spell[];
  };
}

// ===========================
// TIPOS PRINCIPAIS DO NPC
// ===========================

export enum NPCType {
  ALLY = "aliado",
  ENEMY = "inimigo", 
  NEUTRAL = "neutro",
  MERCHANT = "mercador",
  QUEST_GIVER = "missões",
  BACKGROUND = "cenário"
}

export enum NPCSize {
  TINY = "Minúsculo",
  SMALL = "Pequeno", 
  MEDIUM = "Médio",
  LARGE = "Grande",
  HUGE = "Enorme",
  GARGANTUAN = "Colossal"
}

export enum NPCCreatureType {
  ABERRATION = "Aberração",
  BEAST = "Besta",
  CELESTIAL = "Celestial",
  CONSTRUCT = "Constructo",
  DRAGON = "Dragão",
  ELEMENTAL = "Elemental",
  FEY = "Feérico",
  FIEND = "Demônio",
  GIANT = "Gigante",
  HUMANOID = "Humanoide",
  MONSTROSITY = "Monstrosidade",
  OOZE = "Gosma",
  PLANT = "Planta",
  UNDEAD = "Morto-vivo"
}

// ===========================
// INTERFACE PRINCIPAL DO NPC
// ===========================

export interface EnhancedNPC {
  id?: string;
  campaign_id: string;
  
  // Informações básicas
  name: string;
  description?: string;
  race?: string;
  npc_class?: string;
  size?: NPCSize;
  creature_type?: NPCCreatureType;
  
  // Tipo e comportamento
  npc_type: NPCType;
  alignment?: string;
  
  // Localização e contexto
  location?: string;
  occupation?: string;
  faction?: string;
  
  // Estatísticas completas
  stats: NPCStats;
  challenge_rating?: string;
  experience_points?: number;
  
  // Habilidades de combate
  attacks: Attack[];
  spellcasting: NPCSpellcasting;
  abilities: NPCAbility[];
  legendary_actions?: NPCLegendaryAction[];
  lair_actions?: NPCLair;
  
  // Proficiências
  skills?: NPCSkills;
  saving_throws?: NPCSavingThrows;
  damage_resistances?: string[];
  damage_immunities?: string[];
  condition_immunities?: string[];
  senses?: string[];
  languages?: string[];
  
  // Relacionamentos
  relationships?: Record<string, string>;
  
  // Informações de roleplay
  personality_traits: string[];
  ideals?: string[];
  bonds?: string[];
  flaws?: string[];
  goals?: string;
  secrets?: string;
  
  // Status de jogo
  is_alive: boolean;
  is_active: boolean;
  current_hit_points?: number;
  
  // Notas do mestre
  gm_notes?: string;
  
  // Metadados
  created_date: string;
  updated_date: string;
  created_by?: string;
  
  // Imagem e representação visual
  avatar_url?: string;
  token_url?: string;
  
  // Configurações de exibição
  show_to_players?: boolean;
  is_important?: boolean;
  tags?: string[];
}

// ===========================
// SCHEMAS PARA CRIAÇÃO E EDIÇÃO
// ===========================

export interface CreateEnhancedNPCRequest {
  campaign_id: string;
  name: string;
  description?: string;
  race?: string;
  npc_class?: string;
  size?: NPCSize;
  creature_type?: NPCCreatureType;
  npc_type: NPCType;
  alignment?: string;
  location?: string;
  occupation?: string;
  faction?: string;
  stats: NPCStats;
  challenge_rating?: string;
  attacks?: Attack[];
  spellcasting?: NPCSpellcasting;
  abilities?: NPCAbility[];
  skills?: NPCSkills;
  saving_throws?: NPCSavingThrows;
  damage_resistances?: string[];
  damage_immunities?: string[];
  condition_immunities?: string[];
  senses?: string[];
  languages?: string[];
  relationships?: Record<string, string>;
  personality_traits?: string[];
  ideals?: string[];
  bonds?: string[];
  flaws?: string[];
  goals?: string;
  secrets?: string;
  gm_notes?: string;
  avatar_url?: string;
  token_url?: string;
  show_to_players?: boolean;
  is_important?: boolean;
  tags?: string[];
}

export interface UpdateEnhancedNPCRequest extends Partial<CreateEnhancedNPCRequest> {
  id: string;
}

// ===========================
// TIPOS PARA O FORMULÁRIO
// ===========================

export interface NPCFormData extends Omit<EnhancedNPC, 'id' | 'campaign_id' | 'created_date' | 'updated_date'> {
  // Campos específicos do formulário que podem ser diferentes da API
}

// ===========================
// TIPOS PARA VALIDAÇÃO
// ===========================

export interface NPCValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface NPCValidationResult {
  isValid: boolean;
  errors: NPCValidationError[];
  warnings: string[];
}

// ===========================
// TIPOS PARA OPERAÇÕES DE DADOS
// ===========================

export interface DiceRollOperation {
  type: 'attack' | 'damage' | 'spell_attack' | 'spell_damage' | 'ability_check' | 'saving_throw';
  target_id: string; // ID do NPC
  action_id?: string; // ID do ataque/magia específica
  roll: DiceRoll;
  modifier_name?: string;
  advantage?: boolean;
  disadvantage?: boolean;
}

export interface CombatAction {
  npc_id: string;
  action_type: 'attack' | 'spell' | 'ability' | 'movement';
  action_id?: string;
  target?: string;
  result?: RollResult;
  description?: string;
  timestamp: Date;
}

// ===========================
// TIPOS PARA PESQUISA E FILTROS
// ===========================

export interface NPCSearchFilters {
  name?: string;
  npc_type?: NPCType[];
  location?: string[];
  faction?: string[];
  challenge_rating_min?: number;
  challenge_rating_max?: number;
  is_alive?: boolean;
  is_active?: boolean;
  has_attacks?: boolean;
  is_spellcaster?: boolean;
  tags?: string[];
}

export interface NPCSearchResult {
  npcs: EnhancedNPC[];
  total: number;
  page: number;
  per_page: number;
  filters_applied: NPCSearchFilters;
}

// ===========================
// TIPOS PARA COMPONENTES
// ===========================

export interface DiceRollerProps {
  roll: DiceRoll;
  label: string;
  onRoll?: (result: RollResult) => void;
  className?: string;
  disabled?: boolean;
  advantage?: boolean;
  disadvantage?: boolean;
}

export interface AttackCardProps {
  attack: Attack;
  npc: EnhancedNPC;
  onRoll?: (result: RollResult) => void;
  onEdit?: (attack: Attack) => void;
  onDelete?: (attackId: string) => void;
  readOnly?: boolean;
}

export interface SpellCardProps {
  spell: Spell;
  npc: EnhancedNPC;
  onRoll?: (result: RollResult) => void;
  onCast?: (spell: Spell, level?: number) => void;
  onEdit?: (spell: Spell) => void;
  onDelete?: (spellId: string) => void;
  readOnly?: boolean;
}

// ===========================
// TIPOS PARA HOOKS E CONTEXTO
// ===========================

export interface NPCContextData {
  npcs: EnhancedNPC[];
  selectedNPC: EnhancedNPC | null;
  isLoading: boolean;
  error: string | null;
  
  // Operações CRUD
  createNPC: (data: CreateEnhancedNPCRequest) => Promise<EnhancedNPC>;
  updateNPC: (id: string, data: UpdateEnhancedNPCRequest) => Promise<EnhancedNPC>;
  deleteNPC: (id: string) => Promise<void>;
  
  // Operações de combate
  rollAttack: (npcId: string, attackId: string, options?: { advantage?: boolean; disadvantage?: boolean }) => Promise<RollResult>;
  rollDamage: (npcId: string, attackId: string) => Promise<RollResult>;
  castSpell: (npcId: string, spellId: string, level?: number) => Promise<RollResult>;
  
  // Operações de status
  updateHitPoints: (npcId: string, newHp: number) => Promise<void>;
  killNPC: (npcId: string) => Promise<void>;
  reviveNPC: (npcId: string) => Promise<void>;
  
  // Busca e filtros
  searchNPCs: (filters: NPCSearchFilters) => Promise<NPCSearchResult>;
  setSelectedNPC: (npc: EnhancedNPC | null) => void;
}

// ===========================
// UTILITÁRIOS E HELPERS
// ===========================

export interface NPCUtilities {
  calculateModifier: (score: number) => number;
  calculateProficiencyBonus: (challengeRating: string) => number;
  calculateSpellSaveDC: (npc: EnhancedNPC) => number;
  calculateSpellAttackBonus: (npc: EnhancedNPC) => number;
  calculatePassivePerception: (npc: EnhancedNPC) => number;
  calculateArmorClass: (npc: EnhancedNPC) => number;
  formatDiceRoll: (roll: DiceRoll) => string;
  parseDiceRoll: (diceString: string) => DiceRoll | null;
  rollDice: (roll: DiceRoll, advantage?: boolean, disadvantage?: boolean) => RollResult;
  validateNPCData: (data: NPCFormData) => NPCValidationResult;
}

// ===========================
// CONSTANTES
// ===========================

export const DICE_SIDES = [4, 6, 8, 10, 12, 20, 100] as const;
export const CHALLENGE_RATINGS = [
  "0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", 
  "24", "25", "26", "27", "28", "29", "30"
] as const;

export const ABILITY_SCORES = [
  'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'
] as const;

export const ABILITY_LABELS = {
  strength: 'Força',
  dexterity: 'Destreza', 
  constitution: 'Constituição',
  intelligence: 'Inteligência',
  wisdom: 'Sabedoria',
  charisma: 'Carisma'
} as const;

// ===========================
// EXPORT PRINCIPAL
// ===========================

export type {
  DiceRoll,
  RollResult,
  Attack,
  Spell,
  NPCAttributes,
  NPCStats,
  NPCAbility,
  EnhancedNPC,
  NPCFormData,
  CreateEnhancedNPCRequest,
  UpdateEnhancedNPCRequest,
  NPCValidationResult,
  DiceRollerProps,
  NPCContextData,
  NPCUtilities
};

export {
  NPCType,
  NPCSize,
  NPCCreatureType,
  DamageType,
  SpellSchool,
  DICE_SIDES,
  CHALLENGE_RATINGS,
  ABILITY_SCORES,
  ABILITY_LABELS
};