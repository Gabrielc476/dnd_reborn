// ===========================
// CAMPAIGN CREATION TYPES
// types/createCampaign.ts
// ===========================
import { User } from "@/types/user";


// ===========================
// ENUMS & CONSTANTS
// ===========================

export enum CampaignStatus {
  ACTIVE = "ativa",
  PAUSED = "pausada", 
  COMPLETED = "finalizada",
  RECRUITING = "recrutando"
}

export enum DifficultyLevel {
  EASY = "easy",
  MEDIUM = "medium", 
  HARD = "hard",
  DEADLY = "deadly"
}

export enum ItemType {
  WEAPON = "weapon",
  ARMOR = "armor",
  MAGIC = "magic",
  MISC = "misc",
  GOLD = "gold"
}

export enum Rarity {
  COMMON = "common",
  UNCOMMON = "uncommon",
  RARE = "rare",
  VERY_RARE = "very_rare",
  LEGENDARY = "legendary"
}

export const CAMPAIGN_TAGS = [
  "roleplay",
  "combat", 
  "exploration",
  "political",
  "mystery",
  "horror",
  "comedy",
  "intrigue",
  "urban",
  "wilderness",
  "dungeon",
  "seafaring"
] as const;

export type CampaignTag = typeof CAMPAIGN_TAGS[number];

// ===========================
// BASE INTERFACES
// ===========================

export interface CampaignPlayer {
  user_id: string;
  character_id?: string;
  joined_date: string;
  is_active: boolean;
  notes?: string;
}

export interface Encounter {
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  npcs: string[]; // IDs dos NPCs
  location?: string;
  rewards_xp: number;
  is_completed: boolean;
  session_number?: number;
  notes?: string;
  created_date?: string;
}

export interface LootItem {
  name: string;
  description?: string;
  item_type: ItemType;
  value: number; // Valor em moedas de ouro
  quantity: number;
  is_magic: boolean;
  rarity: Rarity;
  found_in_encounter?: string;
  assigned_to_player?: string; // ID do jogador
}

// ===========================
// CAMPAIGN STRUCTURE
// ===========================

export interface Campaign {
  id?: string;
  name: string;
  description?: string;
  game_master_id: string;
  players: CampaignPlayer[];
  max_players: number;
  status: CampaignStatus;
  setting?: string; // "Forgotten Realms", "Homebrew", etc.
  world_name?: string;
  npcs: string[]; // IDs dos NPCs da campanha
  encounters: Encounter[];
  loot: LootItem[];
  created_date: string;
  updated_date: string;
  tags: CampaignTag[];
  is_public: boolean;
  recruitment_message?: string;
  gm_notes?: string;
}

// ===========================
// API REQUEST TYPES
// ===========================

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  max_players?: number;
  setting?: string;
  world_name?: string;
  tags?: CampaignTag[];
  is_public?: boolean;
  recruitment_message?: string;
  gm_notes?: string;
  // ✨ NOVO: Automaticamente preenchido pelo hook
  game_master_id?: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  max_players?: number;
  setting?: string;
  world_name?: string;
  tags?: CampaignTag[];
  is_public?: boolean;
  recruitment_message?: string;
  gm_notes?: string;
}

export interface JoinCampaignRequest {
  character_id?: string;
  notes?: string;
}

export interface AddEncounterRequest {
  name: string;
  description?: string;
  difficulty?: DifficultyLevel;
  npcs?: string[];
  location?: string;
  rewards_xp?: number;
  session_number?: number;
  notes?: string;
}

export interface AddLootRequest {
  name: string;
  description?: string;
  item_type?: ItemType;
  value?: number;
  quantity?: number;
  is_magic?: boolean;
  rarity?: Rarity;
  found_in_encounter?: string;
}

export interface AssignLootRequest {
  loot_item_name: string;
  player_id: string;
}

// ===========================
// API RESPONSE TYPES
// ===========================

export interface CampaignResponse {
  id: string;
  name: string;
  description?: string;
  game_master_id: string;
  players: CampaignPlayer[];
  max_players: number;
  status: CampaignStatus;
  setting?: string;
  world_name?: string;
  npcs: string[];
  encounters: Encounter[];
  loot: LootItem[];
  created_date: string;
  updated_date: string;
  tags: CampaignTag[];
  is_public: boolean;
  recruitment_message?: string;
  gm_notes?: string;
}

export interface CreateCampaignResponse {
  success: boolean;
  message?: string;
  campaign_id?: string;
  error?: string;
}

export interface CampaignListResponse {
  success: boolean;
  campaigns?: CampaignResponse[];
  total?: number;
  page?: number;
  per_page?: number;
  error?: string;
}

export interface CampaignStatsResponse {
  success: boolean;
  stats?: {
    total_players: number;
    active_players: number;
    total_encounters: number;
    completed_encounters: number;
    total_xp_awarded: number;
    total_loot_value: number;
    sessions_played: number;
    avg_session_length?: number;
  };
  error?: string;
}

// ===========================
// SEARCH & FILTER TYPES
// ===========================

export interface CampaignFilters {
  status?: CampaignStatus;
  is_public?: boolean;
  tags?: CampaignTag[];
  setting?: string;
  min_players?: number;
  max_players?: number;
  has_openings?: boolean;
  search_term?: string;
}

export interface CampaignSearchRequest {
  filters?: CampaignFilters;
  page?: number;
  per_page?: number;
  sort_by?: "created_date" | "updated_date" | "name" | "player_count";
  sort_order?: "asc" | "desc";
}

// ===========================
// FORM & UI TYPES
// ===========================

export interface CampaignFormData {
  name: string;
  description: string;
  setting: string;
  world_name: string;
  max_players: number;
  tags: CampaignTag[];
  is_public: boolean;
  recruitment_message: string;
  gm_notes: string;
}

export interface CampaignFormErrors {
  name?: string;
  description?: string;
  setting?: string;
  world_name?: string;
  max_players?: string;
  tags?: string;
  recruitment_message?: string;
  gm_notes?: string;
  general?: string;
}

export interface CampaignFormStep {
  id: string;
  title: string;
  description: string;
  isValid: boolean;
  isCompleted: boolean;
}

// ===========================
// CONTEXT TYPES
// ===========================

export interface CampaignCreationContextType {
  // Form Data
  formData: CampaignFormData;
  setFormData: (data: Partial<CampaignFormData>) => void;
  
  // Form Validation
  errors: CampaignFormErrors;
  setErrors: (errors: Partial<CampaignFormErrors>) => void;
  validateField: (field: keyof CampaignFormData, value: any) => string | null;
  validateFieldRealTime: (field: keyof CampaignFormData, value: any) => string | null;
  validateForm: () => boolean;
  clearFieldError: (field: keyof CampaignFormData) => void;
  
  // Steps Management
  currentStep: number;
  setCurrentStep: (step: number) => void;
  steps: CampaignFormStep[];
  canProceedToNext: boolean;
  canGoBack: boolean;
  
  // API Operations
  isLoading: boolean;
  createCampaign: () => Promise<CreateCampaignResponse>;
  
  // Utilities
  resetForm: () => void;
  loadDraft: () => void;
  saveDraft: () => void;
  previewCampaign: () => CampaignResponse;

  // ✨ NOVOS: Authentication Integration
  getUserInfo: () => UserInfo | null;
  isUserReady: boolean;
  user: User | null;
  isAuthenticated: boolean;
}

// ===========================
// NOVOS TIPOS PARA AUTENTICAÇÃO
// ===========================

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  isAuthenticated: boolean;
  hasValidToken: boolean;
}

// ===========================
// UTILITY TYPES
// ===========================

export interface CampaignPreview {
  name: string;
  description?: string;
  setting?: string;
  world_name?: string;
  max_players: number;
  tags: CampaignTag[];
  is_public: boolean;
  estimated_duration?: string;
  difficulty_level?: string;
}

export interface CampaignDraft {
  id: string;
  formData: CampaignFormData;
  created_at: string;
  updated_at: string;
}

// ===========================
// API CLIENT TYPES
// ===========================

export interface CampaignApiClient {
  create: (data: CreateCampaignRequest) => Promise<CreateCampaignResponse>;
  getById: (id: string) => Promise<CampaignResponse>;
  getGMCampaigns: () => Promise<CampaignListResponse>;
  getPlayerCampaigns: () => Promise<CampaignListResponse>;
  getPublicCampaigns: (filters?: CampaignFilters) => Promise<CampaignListResponse>;
  search: (request: CampaignSearchRequest) => Promise<CampaignListResponse>;
  update: (id: string, data: UpdateCampaignRequest) => Promise<CampaignResponse>;
  delete: (id: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  join: (id: string, data: JoinCampaignRequest) => Promise<{ success: boolean; message?: string; error?: string }>;
  leave: (id: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  addEncounter: (id: string, data: AddEncounterRequest) => Promise<{ success: boolean; message?: string; error?: string }>;
  addLoot: (id: string, data: AddLootRequest) => Promise<{ success: boolean; message?: string; error?: string }>;
  assignLoot: (id: string, data: AssignLootRequest) => Promise<{ success: boolean; message?: string; error?: string }>;
  getStats: (id: string) => Promise<CampaignStatsResponse>;
}