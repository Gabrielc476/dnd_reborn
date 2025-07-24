// ===========================
// ENCOUNTER TYPES
// src/types/encounters.ts
// ===========================

// Importando apenas os tipos necessários
import { DifficultyLevel } from './createCampaign';
import type { EncounterParticipant, EncounterOutcome } from './manageCampaign';

// ===========================
// TIPOS PARA CRUD DE ENCOUNTERS
// ===========================

/**
 * Interface para resposta da API ao buscar um encounter específico
 */
export interface EncounterResponse {
  success: boolean;
  encounter?: EncounterDetail;
  error?: string;
}

/**
 * Interface para resposta da API ao listar encounters
 */
export interface EncountersListResponse {
  success: boolean;
  encounters?: EncounterSummary[];
  count?: number;
  error?: string;
}

/**
 * Interface para detalhes completos de um encounter (GET /:id)
 */
export interface EncounterDetail {
  id: string;
  campaign_id: string;
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  npcs: string[]; // IDs dos NPCs
  location?: string;
  rewards_xp: number;
  is_completed: boolean;
  session_number?: number;
  notes?: string;
  created_date: string; // ISO string
  updated_date?: string; // ISO string
  
  // Campos opcionais para encounters gerenciados
  participants?: EncounterParticipant[];
  duration_minutes?: number;
  outcome?: EncounterOutcome;
  treasure_found?: string[];
  casualties?: string[];
}

/**
 * Interface para sumário de encounters (GET / - listagem)
 */
export interface EncounterSummary {
  id: string;
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  is_completed: boolean;
  session_number?: number;
  created_date: string; // ISO string
  rewards_xp?: number;
  location?: string;
}

/**
 * Interface para criar um novo encounter
 */
export interface CreateEncounterRequest {
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  npcs?: string[]; // IDs dos NPCs
  location?: string;
  rewards_xp?: number;
  session_number?: number;
  notes?: string;
}

/**
 * Interface para atualizar um encounter existente (CRUD específico)
 */
export interface UpdateEncounterData {
  name?: string;
  description?: string;
  difficulty?: DifficultyLevel;
  location?: string;
  rewards_xp?: number;
  is_completed?: boolean;
  session_number?: number;
  notes?: string;
}

/**
 * Interface para resposta padrão das operações de CUD
 */
export interface EncounterOperationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ===========================
// FILTROS E BUSCA
// ===========================

/**
 * Filtros para buscar encounters
 */
export interface EncounterFilters {
  difficulty?: DifficultyLevel;
  is_completed?: boolean;
  session_number?: number;
  has_rewards?: boolean;
  search_term?: string; // Busca por nome ou descrição
}

/**
 * Request para buscar encounters com filtros
 */
export interface EncountersSearchRequest {
  filters?: EncounterFilters;
  page?: number;
  per_page?: number;
  sort_by?: 'name' | 'created_date' | 'difficulty' | 'rewards_xp' | 'session_number';
  sort_order?: 'asc' | 'desc';
}

// ===========================
// UTILITÁRIOS E HELPERS
// ===========================

/**
 * Mapeamento de dificuldades para exibição
 */
export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: 'Fácil',
  [DifficultyLevel.MEDIUM]: 'Médio',
  [DifficultyLevel.HARD]: 'Difícil',
  [DifficultyLevel.DEADLY]: 'Mortal'
};

/**
 * Mapeamento de dificuldades para cores
 */
export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: 'bg-green-500/10 text-green-600 border-green-200',
  [DifficultyLevel.MEDIUM]: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  [DifficultyLevel.HARD]: 'bg-orange-500/10 text-orange-600 border-orange-200',
  [DifficultyLevel.DEADLY]: 'bg-red-500/10 text-red-600 border-red-200'
};

/**
 * Número de estrelas por dificuldade
 */
export const DIFFICULTY_STARS: Record<DifficultyLevel, number> = {
  [DifficultyLevel.EASY]: 1,
  [DifficultyLevel.MEDIUM]: 2,
  [DifficultyLevel.HARD]: 3,
  [DifficultyLevel.DEADLY]: 4
};

// ===========================
// VALIDAÇÃO
// ===========================

/**
 * Validação para dados de criação de encounter
 */
export function validateCreateEncounterRequest(data: CreateEncounterRequest): string[] {
  const errors: string[] = [];

  // Nome é obrigatório
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (data.name && data.name.length > 100) {
    errors.push('Nome deve ter no máximo 100 caracteres');
  }

  // Descrição opcional, mas se fornecida deve ter tamanho válido
  if (data.description && data.description.length > 500) {
    errors.push('Descrição deve ter no máximo 500 caracteres');
  }

  // Rewards XP deve ser não negativo
  if (data.rewards_xp !== undefined && data.rewards_xp < 0) {
    errors.push('Recompensa de XP deve ser um valor não negativo');
  }

  // Session number deve ser positivo se fornecido
  if (data.session_number !== undefined && data.session_number < 1) {
    errors.push('Número da sessão deve ser positivo');
  }

  // Notas não podem ser muito longas
  if (data.notes && data.notes.length > 1000) {
    errors.push('Notas devem ter no máximo 1000 caracteres');
  }

  // Location não pode ser muito longa
  if (data.location && data.location.length > 200) {
    errors.push('Localização deve ter no máximo 200 caracteres');
  }

  return errors;
}

/**
 * Validação para dados de atualização de encounter
 */
export function validateUpdateEncounterData(data: UpdateEncounterData): string[] {
  const errors: string[] = [];

  // Se nome fornecido, deve ser válido
  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    if (data.name.length > 100) {
      errors.push('Nome deve ter no máximo 100 caracteres');
    }
  }

  // Se descrição fornecida, deve ter tamanho válido
  if (data.description !== undefined && data.description && data.description.length > 500) {
    errors.push('Descrição deve ter no máximo 500 caracteres');
  }

  // Se rewards XP fornecido, deve ser não negativo
  if (data.rewards_xp !== undefined && data.rewards_xp < 0) {
    errors.push('Recompensa de XP deve ser um valor não negativo');
  }

  // Se session number fornecido, deve ser positivo
  if (data.session_number !== undefined && data.session_number < 1) {
    errors.push('Número da sessão deve ser positivo');
  }

  // Se notas fornecidas, não podem ser muito longas
  if (data.notes !== undefined && data.notes && data.notes.length > 1000) {
    errors.push('Notas devem ter no máximo 1000 caracteres');
  }

  // Se location fornecida, não pode ser muito longa
  if (data.location !== undefined && data.location && data.location.length > 200) {
    errors.push('Localização deve ter no máximo 200 caracteres');
  }

  return errors;
}

// ===========================
// FUNÇÕES UTILITÁRIAS
// ===========================

/**
 * Obtém a label da dificuldade
 */
export function getDifficultyLabel(difficulty: DifficultyLevel): string {
  return DIFFICULTY_LABELS[difficulty] || 'Desconhecido';
}

/**
 * Obtém as classes CSS para a dificuldade
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  return DIFFICULTY_COLORS[difficulty] || 'bg-gray-500/10 text-gray-600 border-gray-200';
}

/**
 * Obtém o número de estrelas para a dificuldade
 */
export function getDifficultyStars(difficulty: DifficultyLevel): number {
  return DIFFICULTY_STARS[difficulty] || 1;
}

/**
 * Calcula o XP total de uma lista de encounters
 */
export function calculateTotalXP(encounters: (EncounterDetail | EncounterSummary)[]): number {
  return encounters.reduce((total, encounter) => {
    const xp = 'rewards_xp' in encounter ? encounter.rewards_xp : 0;
    return total + (xp || 0);
  }, 0);
}

/**
 * Filtra encounters por status de completude
 */
export function filterEncountersByCompletion<T extends { is_completed: boolean }>(
  encounters: T[], 
  completed?: boolean
): T[] {
  if (completed === undefined) return encounters;
  return encounters.filter(encounter => encounter.is_completed === completed);
}

/**
 * Agrupa encounters por dificuldade
 */
export function groupEncountersByDifficulty<T extends { difficulty: DifficultyLevel }>(
  encounters: T[]
): Record<DifficultyLevel, T[]> {
  return encounters.reduce((groups, encounter) => {
    const difficulty = encounter.difficulty;
    if (!groups[difficulty]) {
      groups[difficulty] = [];
    }
    groups[difficulty].push(encounter);
    return groups;
  }, {} as Record<DifficultyLevel, T[]>);
}

/**
 * Converte encounter detail para summary
 */
export function encounterDetailToSummary(detail: EncounterDetail): EncounterSummary {
  return {
    id: detail.id,
    name: detail.name,
    description: detail.description,
    difficulty: detail.difficulty,
    is_completed: detail.is_completed,
    session_number: detail.session_number,
    created_date: detail.created_date,
    rewards_xp: detail.rewards_xp,
    location: detail.location
  };
}

// ===========================
// TIPOS PARA HOOKS E CONTEXTOS
// ===========================

/**
 * Estado para hook de encounters
 */
export interface EncountersState {
  encounters: EncounterSummary[];
  loading: boolean;
  error: string | null;
  filters: EncounterFilters;
}

/**
 * Ações para hook de encounters
 */
export interface EncountersActions {
  loadEncounters: (campaignId: string) => Promise<void>;
  createEncounter: (campaignId: string, data: CreateEncounterRequest) => Promise<boolean>;
  updateEncounter: (campaignId: string, encounterId: string, data: UpdateEncounterData) => Promise<boolean>;
  deleteEncounter: (campaignId: string, encounterId: string) => Promise<boolean>;
  getEncounter: (campaignId: string, encounterId: string) => Promise<EncounterDetail | null>;
  setFilters: (filters: Partial<EncounterFilters>) => void;
  clearError: () => void;
  refresh: () => Promise<void>;
}

// ===========================
// RE-EXPORTS PARA COMPATIBILIDADE
// ===========================

// Re-exportando tipos que podem ser necessários em outros arquivos
export type { DifficultyLevel, EncounterParticipant, EncounterOutcome };