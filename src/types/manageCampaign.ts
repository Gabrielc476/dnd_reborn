// ===========================
// CAMPAIGN MANAGEMENT TYPES
// types/manageCampaign.ts
// ===========================

import { 
  Campaign, 
  CampaignPlayer, 
  Encounter, 
  LootItem, 
  CampaignStatus,
  DifficultyLevel,
  ItemType,
  Rarity 
} from './createCampaign';

// ===========================
// CHARACTER TYPE
// ===========================
export interface Character {
  id: string;
  campaign_id: string;
  user_id?: string;  // ID do jogador associado
  name: string;
  race: string;
  class: string;
  level: number;
  background?: string;
  alignment?: string;
  experience?: number;
  armor_class: number;
  current_hp: number;
  max_hp: number;
  hit_dice?: string;
  speed?: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  skills?: Record<string, boolean>; // { "Acrobatics": true, "Stealth": false }
  proficiencies?: string[];
  languages?: string[];
  equipment?: string[];
  spells?: string[];
  features?: string[];
  personality_traits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;
  appearance?: string;
  player_name?: string; // Nome do jogador (não do personagem)
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
}

// ===========================
// PLAYER MANAGEMENT
// ===========================

export interface PlayerManagementAction {
  action: "add" | "remove" | "update_status" | "update_notes" | "promote_to_gm";
  player_id: string;
  character_id?: string;
  notes?: string;
  is_active?: boolean;
}

export interface AddPlayerRequest {
  user_id: string;
  character_id?: string;
  notes?: string;
}

export interface UpdatePlayerRequest {
  character_id?: string;
  notes?: string;
  is_active?: boolean;
}

export interface PlayerDetails extends CampaignPlayer {
  username?: string;
  character_name?: string;
  character_level?: number;
  character_class?: string;
  last_active?: string;
  session_attendance?: number;
  total_sessions?: number;
}

// ===========================
// NPC MANAGEMENT
// ===========================

export interface NPCReference {
  id: string;
  name: string;
  npc_type: NPCType;
  location?: string;
  is_alive: boolean;
  is_active: boolean;
}

export enum NPCType {
  ALLY = "aliado",
  ENEMY = "inimigo", 
  NEUTRAL = "neutro",
  MERCHANT = "mercador",
  QUEST_GIVER = "missões",
  BACKGROUND = "cenário"
}

export interface NPCStats {
  armor_class: number;
  hit_points: number;
  speed: string; // string, não number
  // Atributos opcionais
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

export interface NPCAbility {
  name: string;
  description: string;
  usage?: string; // "1/dia", "recarga 5-6", etc.
}


export interface NPC {
  id?: string;
  campaign_id: string;
  
  // Informações básicas
  name: string;
  description?: string;
  race?: string;
  npc_class?: string; // "class" no backend vira "npc_class" no frontend
  
  // Tipo e comportamento
  npc_type: NPCType;
  alignment?: string;
  
  // Localização e contexto
  location?: string;
  occupation?: string;
  faction?: string;
  
  // Estatísticas (opcional para NPCs narrativos)
  stats?: NPCStats;
  challenge_rating?: string; // "1/4", "1", "5", etc.
  
  // Habilidades especiais
  abilities: NPCAbility[];
  
  // Relacionamentos
  relationships?: Record<string, string>; // {"player_name": "amigo", "outro_npc": "rival"}
  
  // Informações de roleplay
  personality_traits: string[];
  goals?: string;
  secrets?: string; // Apenas GM
  
  // Status
  is_alive: boolean;
  is_active: boolean; // Se está ativo na campanha atual
  
  // Notas do mestre
  gm_notes?: string; // Apenas GM
  
  // Metadados
  created_date: string;
  updated_date: string;
}

export interface CreateNPCRequest {
  name: string;
  description?: string;
  race?: string;
  npc_class?: string;
  npc_type: NPCType;
  alignment?: string;
  location?: string;
  occupation?: string;
  faction?: string;
  stats?: NPCStats;
  challenge_rating?: string;
  abilities?: NPCAbility[];
  relationships?: Record<string, string>;
  personality_traits?: string[];
  goals?: string;
  secrets?: string;
  gm_notes?: string;
}

export interface UpdateNPCRequest {
  name?: string;
  description?: string;
  race?: string;
  npc_class?: string;
  npc_type?: NPCType;
  alignment?: string;
  location?: string;
  occupation?: string;
  faction?: string;
  stats?: NPCStats;
  challenge_rating?: string;
  abilities?: NPCAbility[];
  relationships?: Record<string, string>;
  personality_traits?: string[];
  goals?: string;
  secrets?: string;
  gm_notes?: string;
  is_alive?: boolean;
  is_active?: boolean;
}

export interface NPCFormData {
  name: string;
  description?: string;
  race?: string;
  npc_class?: string;
  npc_type: NPCType;
  alignment?: string;
  location?: string;
  occupation?: string;
  faction?: string;
  stats?: NPCStats;
  challenge_rating?: string;
  abilities: NPCAbility[];
  personality_traits: string[];
  goals?: string;
  secrets?: string;
  gm_notes?: string;
  is_alive: boolean;
  is_active: boolean;
}

// Utilitários para conversão de dados
export const NPCTypeLabels: Record<NPCType, string> = {
  [NPCType.ALLY]: 'Aliado',
  [NPCType.ENEMY]: 'Inimigo',
  [NPCType.NEUTRAL]: 'Neutro',
  [NPCType.MERCHANT]: 'Mercador',
  [NPCType.QUEST_GIVER]: 'Doador de Missões',
  [NPCType.BACKGROUND]: 'Cenário'
};

export const NPCTypeColors: Record<NPCType, string> = {
  [NPCType.ALLY]: 'bg-green-500/10 text-green-400',
  [NPCType.ENEMY]: 'bg-red-500/10 text-red-400',
  [NPCType.NEUTRAL]: 'bg-gray-500/10 text-gray-400',
  [NPCType.MERCHANT]: 'bg-yellow-500/10 text-yellow-400',
  [NPCType.QUEST_GIVER]: 'bg-blue-500/10 text-blue-400',
  [NPCType.BACKGROUND]: 'bg-purple-500/10 text-purple-400'
};

// Constantes para o formulário
export const ALIGNMENT_OPTIONS = [
  'Leal e Bom', 'Neutro e Bom', 'Caótico e Bom',
  'Leal e Neutro', 'Verdadeiro Neutro', 'Caótico e Neutro',
  'Leal e Mau', 'Neutro e Mau', 'Caótico e Mau'
];

export const CHALLENGE_RATING_OPTIONS = [
  '0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', 
  '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', 
  '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '30'
];

// Funções utilitárias
export function convertNPCToFormData(npc: NPC): NPCFormData {
  return {
    name: npc.name,
    description: npc.description,
    race: npc.race,
    npc_class: npc.npc_class,
    npc_type: npc.npc_type,
    alignment: npc.alignment,
    location: npc.location,
    occupation: npc.occupation,
    faction: npc.faction,
    stats: npc.stats,
    challenge_rating: npc.challenge_rating,
    abilities: npc.abilities || [],
    personality_traits: npc.personality_traits || [],
    goals: npc.goals,
    secrets: npc.secrets,
    gm_notes: npc.gm_notes,
    is_alive: npc.is_alive,
    is_active: npc.is_active
  };
}

export function convertFormDataToCreateRequest(formData: NPCFormData): CreateNPCRequest {
  return {
    name: formData.name,
    description: formData.description,
    race: formData.race,
    npc_class: formData.npc_class,
    npc_type: formData.npc_type,
    alignment: formData.alignment,
    location: formData.location,
    occupation: formData.occupation,
    faction: formData.faction,
    stats: formData.stats,
    challenge_rating: formData.challenge_rating,
    abilities: formData.abilities,
    personality_traits: formData.personality_traits,
    goals: formData.goals,
    secrets: formData.secrets,
    gm_notes: formData.gm_notes
  };
}

export function convertFormDataToUpdateRequest(formData: NPCFormData): UpdateNPCRequest {
  return {
    name: formData.name,
    description: formData.description,
    race: formData.race,
    npc_class: formData.npc_class,
    npc_type: formData.npc_type,
    alignment: formData.alignment,
    location: formData.location,
    occupation: formData.occupation,
    faction: formData.faction,
    stats: formData.stats,
    challenge_rating: formData.challenge_rating,
    abilities: formData.abilities,
    personality_traits: formData.personality_traits,
    goals: formData.goals,
    secrets: formData.secrets,
    gm_notes: formData.gm_notes,
    is_alive: formData.is_alive,
    is_active: formData.is_active
  };
}

// Função de validação
export function validateNPCData(data: NPCFormData): string[] {
  const errors: string[] = [];
  
  // Nome obrigatório
  if (!data.name.trim()) {
    errors.push('Nome é obrigatório');
  }
  
  if (data.name.length > 100) {
    errors.push('Nome deve ter no máximo 100 caracteres');
  }
  
  // Validar descrição
  if (data.description && data.description.length > 500) {
    errors.push('Descrição deve ter no máximo 500 caracteres');
  }
  
  // Validar estatísticas se fornecidas
  if (data.stats) {
    if (data.stats.armor_class < 1 || data.stats.armor_class > 30) {
      errors.push('Classe de Armadura deve estar entre 1 e 30');
    }
    
    if (data.stats.hit_points < 1) {
      errors.push('Pontos de Vida devem ser pelo menos 1');
    }
    
    // Validar atributos se fornecidos
    const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
    for (const attr of attributes) {
      const value = data.stats[attr];
      if (value !== undefined && (value < 1 || value > 30)) {
        errors.push(`${attr} deve estar entre 1 e 30`);
      }
    }
  }
  
  // Validar habilidades
  for (let i = 0; i < data.abilities.length; i++) {
    const ability = data.abilities[i];
    if (!ability.name.trim()) {
      errors.push(`Habilidade ${i + 1}: Nome é obrigatório`);
    }
    if (!ability.description.trim()) {
      errors.push(`Habilidade ${i + 1}: Descrição é obrigatória`);
    }
    if (ability.name.length > 50) {
      errors.push(`Habilidade ${i + 1}: Nome deve ter no máximo 50 caracteres`);
    }
    if (ability.description.length > 300) {
      errors.push(`Habilidade ${i + 1}: Descrição deve ter no máximo 300 caracteres`);
    }
  }
  
  // Validar notas do GM
  if (data.gm_notes && data.gm_notes.length > 1000) {
    errors.push('Notas do GM devem ter no máximo 1000 caracteres');
  }
  
  return errors;
}

// Função para obter cor do tipo de NPC
export function getNPCTypeColor(type: NPCType): string {
  return NPCTypeColors[type] || 'bg-gray-500/10 text-gray-400';
}

// Função para obter label do tipo de NPC
export function getNPCTypeLabel(type: NPCType): string {
  return NPCTypeLabels[type] || 'Desconhecido';
}

// ===========================
// ENCOUNTER MANAGEMENT
// ===========================

export interface EncounterManagement extends Encounter {
  participants?: EncounterParticipant[];
  duration_minutes?: number;
  treasure_found?: string[];
  casualties?: string[];
  outcome?: EncounterOutcome;
}

export interface EncounterParticipant {
  id: string;
  name: string;
  type: "player" | "npc" | "monster";
  initiative?: number;
  current_hp?: number;
  max_hp?: number;
  status_effects?: string[];
  is_conscious: boolean;
}

export enum EncounterOutcome {
  VICTORY = "victory",
  DEFEAT = "defeat",
  RETREAT = "retreat",
  NEGOTIATION = "negotiation",
  ONGOING = "ongoing"
}

export interface UpdateEncounterRequest {
  name?: string;
  description?: string;
  difficulty?: DifficultyLevel;
  npcs?: string[];
  location?: string;
  rewards_xp?: number;
  is_completed?: boolean;
  session_number?: number;
  notes?: string;
  participants?: EncounterParticipant[];
  duration_minutes?: number;
  outcome?: EncounterOutcome;
}

export interface CompleteEncounterRequest {
  outcome: EncounterOutcome;
  rewards_xp: number;
  treasure_found?: string[];
  casualties?: string[];
  notes?: string;
}

// ===========================
// LOOT MANAGEMENT
// ===========================

export interface LootManagement extends LootItem {
  history?: LootHistory[];
}

export interface LootHistory {
  action: "found" | "assigned" | "traded" | "lost" | "sold";
  player_id?: string;
  player_name?: string;
  date: string;
  notes?: string;
  value?: number;
}

export interface UpdateLootRequest {
  name?: string;
  description?: string;
  item_type?: ItemType;
  value?: number;
  quantity?: number;
  is_magic?: boolean;
  rarity?: Rarity;
  found_in_encounter?: string;
  assigned_to_player?: string;
}

export interface LootDistribution {
  item_name: string;
  recipient_id: string;
  recipient_name: string;
  method: "random" | "choice" | "need" | "gm_decision";
  notes?: string;
}

export interface LootSummary {
  total_items: number;
  total_value: number;
  assigned_items: number;
  unassigned_items: number;
  by_rarity: Record<Rarity, number>;
  by_type: Record<ItemType, number>;
  most_valuable_item?: LootItem;
}

// ===========================
// SESSION MANAGEMENT
// ===========================

export interface GameSession {
  id?: string;
  campaign_id: string;
  session_number: number;
  title: string;
  summary?: string;
  date: string;
  duration_minutes: number;
  players_present: string[]; // player IDs
  npcs_encountered: string[]; // NPC IDs
  encounters_completed: string[]; // encounter names
  loot_found: string[]; // loot item names
  experience_awarded: number;
  gm_notes?: string;
  player_notes?: Record<string, string>; // player_id -> notes
  next_session_date?: string;
  next_session_preview?: string;
  is_completed: boolean;
}

export interface CreateSessionRequest {
  title: string;
  summary?: string;
  date: string;
  duration_minutes?: number;
  players_present?: string[];
  gm_notes?: string;
}

export interface UpdateSessionRequest {
  title?: string;
  summary?: string;
  date?: string;
  duration_minutes?: number;
  players_present?: string[];
  npcs_encountered?: string[];
  encounters_completed?: string[];
  loot_found?: string[];
  experience_awarded?: number;
  gm_notes?: string;
  next_session_date?: string;
  next_session_preview?: string;
  is_completed?: boolean;
}

// ===========================
// CAMPAIGN STATISTICS
// ===========================

export interface CampaignStats {
  basic: BasicStats;
  players: PlayerStats;
  encounters: EncounterStats;
  loot: LootStats;
  sessions: SessionStats;
  npcs: NPCStats_Summary;
}

export interface BasicStats {
  total_players: number;
  active_players: number;
  max_players: number;
  campaign_age_days: number;
  last_session_date?: string;
  next_session_date?: string;
}

export interface PlayerStats {
  attendance_rate: number;
  average_level: number;
  most_active_player?: {
    id: string;
    name: string;
    sessions_attended: number;
  };
  class_distribution: Record<string, number>;
  level_distribution: Record<number, number>;
}

export interface EncounterStats {
  total_encounters: number;
  completed_encounters: number;
  pending_encounters: number;
  total_xp_awarded: number;
  average_encounter_difficulty: string;
  victory_rate: number;
  deadliest_encounter?: {
    name: string;
    casualties: number;
  };
}

export interface LootStats {
  total_items: number;
  total_value: number;
  assigned_items: number;
  unassigned_items: number;
  most_valuable_item?: {
    name: string;
    value: number;
    owner?: string;
  };
  rarity_distribution: Record<Rarity, number>;
}

export interface SessionStats {
  total_sessions: number;
  total_playtime_hours: number;
  average_session_length: number;
  sessions_per_month: number;
  longest_session?: {
    title: string;
    duration_minutes: number;
    date: string;
  };
}

export interface NPCStats_Summary {
  total_npcs: number;
  living_npcs: number;
  active_npcs: number;
  by_type: Record<NPCType, number>;
  by_location: Record<string, number>;
  most_encountered?: {
    name: string;
    encounters: number;
  };
}

// ===========================
// PERMISSIONS & ACCESS
// ===========================

export interface CampaignPermissions {
  user_id: string;
  role: CampaignRole;
  can_view_campaign: boolean;
  can_edit_campaign: boolean;
  can_manage_players: boolean;
  can_create_npcs: boolean;
  can_manage_encounters: boolean;
  can_assign_loot: boolean;
  can_view_gm_notes: boolean;
  can_view_npc_secrets: boolean;
  can_manage_sessions: boolean;
}

export enum CampaignRole {
  GAME_MASTER = "gm",
  PLAYER = "player",
  OBSERVER = "observer",
  CO_GM = "co_gm"
}

export interface AccessLevel {
  level: "public" | "players" | "gm_only" | "private";
  description: string;
}

// ===========================
// CAMPAIGN DASHBOARD
// ===========================

export interface CampaignDashboard {
  campaign: Campaign;
  permissions: CampaignPermissions;
  stats: CampaignStats;
  recent_activity: ActivityFeed[];
  upcoming_sessions: GameSession[];
  active_encounters: EncounterManagement[];
  party_members: PlayerDetails[];
  recent_npcs: NPCReference[];
  unassigned_loot: LootItem[];
  gm_reminders?: string[];
}

export interface ActivityFeed {
  id: string;
  type: ActivityType;
  actor_id: string;
  actor_name: string;
  action: string;
  target?: string;
  timestamp: string;
  details?: Record<string, any>;
  visibility: AccessLevel["level"];
}

export enum ActivityType {
  PLAYER_JOINED = "player_joined",
  PLAYER_LEFT = "player_left",
  ENCOUNTER_COMPLETED = "encounter_completed",
  NPC_CREATED = "npc_created",
  NPC_KILLED = "npc_killed",
  LOOT_FOUND = "loot_found",
  LOOT_ASSIGNED = "loot_assigned",
  SESSION_COMPLETED = "session_completed",
  CAMPAIGN_UPDATED = "campaign_updated"
}

// ===========================
// BULK OPERATIONS
// ===========================

export interface BulkOperation {
  type: "encounters" | "npcs" | "loot" | "players";
  action: "create" | "update" | "delete" | "assign";
  items: any[];
  options?: Record<string, any>;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  created_ids?: string[];
}

// ===========================
// API RESPONSES
// ===========================

export interface CampaignManagementResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export interface CampaignDashboardResponse {
  success: boolean;
  dashboard?: CampaignDashboard;
  error?: string;
}

export interface ActivityFeedResponse {
  success: boolean;
  activities?: ActivityFeed[];
  total?: number;
  page?: number;
  per_page?: number;
  error?: string;
}

// ===========================
// CONTEXT TYPES
// ===========================

export interface CampaignManagementContextType {
  // ========== CAMPAIGN DATA ==========
  campaign: Campaign | null;
  dashboard: CampaignDashboard | null;
  permissions: CampaignPermissions | null;
  isLoading: boolean;
  characters: Character[]; // Adicionado

  // ========== CAMPAIGN OPERATIONS ==========
  loadCampaign: (id: string) => Promise<void>;
  updateCampaign: (data: Partial<Campaign>) => Promise<boolean>;
  deleteCampaign: () => Promise<boolean>;

  // ========== PLAYER MANAGEMENT ==========
  addPlayer: (request: AddPlayerRequest) => Promise<boolean>;
  removePlayer: (playerId: string) => Promise<boolean>;
  updatePlayer: (playerId: string, data: UpdatePlayerRequest) => Promise<boolean>;

  // ========== NPC MANAGEMENT ==========
  createNPC: (data: CreateNPCRequest) => Promise<string | null>;
  updateNPC: (id: string, data: UpdateNPCRequest) => Promise<boolean>;
  deleteNPC: (id: string) => Promise<boolean>;
  killNPC: (id: string) => Promise<boolean>;
  reviveNPC: (id: string) => Promise<boolean>;

  // ========== ENCOUNTER MANAGEMENT ==========
  createEncounter: (data: Encounter) => Promise<boolean>;
  updateEncounter: (name: string, data: UpdateEncounterRequest) => Promise<boolean>;
  completeEncounter: (name: string, data: CompleteEncounterRequest) => Promise<boolean>;
  deleteEncounter: (name: string) => Promise<boolean>;

  // ========== LOOT MANAGEMENT ==========
  addLoot: (data: LootItem) => Promise<boolean>;
  updateLoot: (name: string, data: UpdateLootRequest) => Promise<boolean>;
  assignLoot: (itemName: string, playerId: string) => Promise<boolean>;
  removeLoot: (name: string) => Promise<boolean>;

  // ========== SESSION MANAGEMENT ==========
  createSession: (data: CreateSessionRequest) => Promise<string | null>;
  updateSession: (id: string, data: UpdateSessionRequest) => Promise<boolean>;
  completeSession: (id: string) => Promise<boolean>;

  // ========== UTILITIES ==========
  refreshDashboard: () => Promise<void>;
  getActivityFeed: (page?: number) => Promise<ActivityFeed[]>;
  exportCampaignData: () => Promise<Blob>;
  isGM: boolean; // Alterado de função para booleano
  isPlayer: boolean; // Alterado de função para booleano
  canPerformAction: (action: string) => boolean;
  loadCharacters: () => Promise<void>; // Adicionado
}

// ===========================
// FILTERS & SEARCH
// ===========================

export interface CampaignContentFilters {
  // NPCs
  npc_type?: NPCType;
  npc_location?: string;
  npc_is_alive?: boolean;
  npc_is_active?: boolean;
  
  // Encounters
  encounter_difficulty?: DifficultyLevel;
  encounter_completed?: boolean;
  encounter_session?: number;
  
  // Loot
  loot_assigned?: boolean;
  loot_rarity?: Rarity;
  loot_type?: ItemType;
  
  // Sessions
  session_date_from?: string;
  session_date_to?: string;
  session_completed?: boolean;
  
  // General
  search_term?: string;
}

export interface CampaignContentSearchResult {
  npcs?: NPC[];
  encounters?: EncounterManagement[];
  loot?: LootManagement[];
  sessions?: GameSession[];
  total_results: number;
}