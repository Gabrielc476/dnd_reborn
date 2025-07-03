// ===========================
// UTILITÁRIOS PARA SISTEMA DE NPCs COM DADOS
// utils/npcUtilities.ts
// ===========================

import { 
  DiceRoll, 
  RollResult, 
  EnhancedNPC, 
  NPCFormData, 
  NPCValidationResult, 
  NPCValidationError,
  NPCAttributes,
  ABILITY_SCORES,
  CHALLENGE_RATINGS
} from '@/types/enhancedNPC';

// ===========================
// FUNÇÕES DE ROLAGEM DE DADOS
// ===========================

/**
 * Rola um dado individual
 */
export function rollSingleDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Rola múltiplos dados
 */
export function rollMultipleDice(count: number, sides: number): number[] {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollSingleDie(sides));
  }
  return rolls;
}

/**
 * Executa uma rolagem completa de dados com modificadores
 */
export function rollDice(
  roll: DiceRoll, 
  advantage: boolean = false, 
  disadvantage: boolean = false
): RollResult {
  // Para vantagem/desvantagem, apenas aplicamos em d20
  const isD20 = roll.dice_count === 1 && roll.dice_sides === 20;
  
  let rolls: number[];
  let total: number;
  
  if (isD20 && (advantage || disadvantage)) {
    // Rolar dois d20s
    const roll1 = rollSingleDie(20);
    const roll2 = rollSingleDie(20);
    
    if (advantage) {
      total = Math.max(roll1, roll2) + roll.modifier;
      rolls = [roll1, roll2]; // Mostrar ambos os resultados
    } else { // disadvantage
      total = Math.min(roll1, roll2) + roll.modifier;
      rolls = [roll1, roll2];
    }
  } else {
    // Rolagem normal
    rolls = rollMultipleDice(roll.dice_count, roll.dice_sides);
    total = rolls.reduce((sum, roll) => sum + roll, 0) + roll.modifier;
  }
  
  const formula = formatDiceRoll(roll);
  
  return {
    total,
    rolls,
    modifier: roll.modifier,
    formula,
    timestamp: new Date()
  };
}

/**
 * Formata uma rolagem de dados como string (ex: "2d6+3")
 */
export function formatDiceRoll(roll: DiceRoll): string {
  const base = `${roll.dice_count}d${roll.dice_sides}`;
  if (roll.modifier === 0) return base;
  if (roll.modifier > 0) return `${base}+${roll.modifier}`;
  return `${base}${roll.modifier}`;
}

/**
 * Analisa uma string de dados e retorna um objeto DiceRoll
 */
export function parseDiceRoll(diceString: string): DiceRoll | null {
  // Regex para capturar formatos como "2d6+3", "1d20-1", "3d8"
  const regex = /^(\d+)d(\d+)([+-]\d+)?$/i;
  const match = diceString.trim().match(regex);
  
  if (!match) return null;
  
  const dice_count = parseInt(match[1]);
  const dice_sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;
  
  if (dice_count < 1 || dice_sides < 2) return null;
  
  return { dice_count, dice_sides, modifier };
}

// ===========================
// FUNÇÕES DE CÁLCULO D&D 5E
// ===========================

/**
 * Calcula o modificador de atributo baseado no valor
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calcula o bônus de proficiência baseado no Challenge Rating
 */
export function calculateProficiencyBonus(challengeRating: string): number {
  const cr = parseFloat(challengeRating) || 0;
  
  if (cr < 1) return 2;
  if (cr < 5) return 2;
  if (cr < 9) return 3;
  if (cr < 13) return 4;
  if (cr < 17) return 5;
  if (cr < 21) return 6;
  if (cr < 25) return 7;
  if (cr < 29) return 8;
  return 9;
}

/**
 * Calcula a CD de resistência de magias
 */
export function calculateSpellSaveDC(npc: EnhancedNPC): number {
  if (!npc.spellcasting?.is_spellcaster || !npc.spellcasting.spellcasting_ability) {
    return 8;
  }
  
  const profBonus = calculateProficiencyBonus(npc.challenge_rating || "0");
  const abilityMod = calculateModifier(npc.stats.attributes[npc.spellcasting.spellcasting_ability]);
  
  return 8 + profBonus + abilityMod;
}

/**
 * Calcula o bônus de ataque de magias
 */
export function calculateSpellAttackBonus(npc: EnhancedNPC): number {
  if (!npc.spellcasting?.is_spellcaster || !npc.spellcasting.spellcasting_ability) {
    return 0;
  }
  
  const profBonus = calculateProficiencyBonus(npc.challenge_rating || "0");
  const abilityMod = calculateModifier(npc.stats.attributes[npc.spellcasting.spellcasting_ability]);
  
  return profBonus + abilityMod;
}

/**
 * Calcula a Percepção Passiva
 */
export function calculatePassivePerception(npc: EnhancedNPC): number {
  const wisdomMod = calculateModifier(npc.stats.attributes.wisdom);
  const profBonus = npc.skills?.perception?.proficient 
    ? calculateProficiencyBonus(npc.challenge_rating || "0") 
    : 0;
  
  return 10 + wisdomMod + profBonus;
}

/**
 * Calcula a CA baseada no NPC (se não especificada)
 */
export function calculateArmorClass(npc: EnhancedNPC): number {
  // Se já tem CA definida, usar ela
  if (npc.stats.armor_class) return npc.stats.armor_class;
  
  // Caso contrário, usar Destreza + 10 como base
  const dexMod = calculateModifier(npc.stats.attributes.dexterity);
  return 10 + dexMod;
}

/**
 * Calcula o modificador de iniciativa
 */
export function calculateInitiativeModifier(npc: EnhancedNPC): number {
  return calculateModifier(npc.stats.attributes.dexterity);
}

/**
 * Calcula o modificador de um atributo específico
 */
export function getAttributeModifier(npc: EnhancedNPC, attribute: keyof NPCAttributes): number {
  return calculateModifier(npc.stats.attributes[attribute]);
}

/**
 * Calcula todos os modificadores de atributos
 */
export function getAllAttributeModifiers(npc: EnhancedNPC): Record<keyof NPCAttributes, number> {
  const modifiers: Record<keyof NPCAttributes, number> = {} as any;
  
  ABILITY_SCORES.forEach(attribute => {
    modifiers[attribute] = calculateModifier(npc.stats.attributes[attribute]);
  });
  
  return modifiers;
}

// ===========================
// FUNÇÕES DE VALIDAÇÃO
// ===========================

/**
 * Valida dados de NPC para criação/edição
 */
export function validateNPCData(data: NPCFormData): NPCValidationResult {
  const errors: NPCValidationError[] = [];
  const warnings: string[] = [];
  
  // Validações obrigatórias
  if (!data.name || data.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Nome deve ter pelo menos 2 caracteres',
      value: data.name
    });
  }
  
  if (data.name && data.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Nome deve ter no máximo 100 caracteres',
      value: data.name
    });
  }
  
  // Validações de atributos
  ABILITY_SCORES.forEach(attribute => {
    const value = data.stats?.attributes?.[attribute];
    if (value !== undefined) {
      if (value < 1 || value > 30) {
        errors.push({
          field: `stats.attributes.${attribute}`,
          message: `${attribute} deve estar entre 1 e 30`,
          value
        });
      }
      if (value < 8) {
        warnings.push(`${attribute} está abaixo do valor típico para NPCs (8+)`);
      }
    }
  });
  
  // Validações de estatísticas
  if (data.stats?.armor_class && (data.stats.armor_class < 1 || data.stats.armor_class > 30)) {
    errors.push({
      field: 'stats.armor_class',
      message: 'Classe de Armadura deve estar entre 1 e 30',
      value: data.stats.armor_class
    });
  }
  
  if (data.stats?.hit_points && data.stats.hit_points < 1) {
    errors.push({
      field: 'stats.hit_points',
      message: 'Pontos de Vida devem ser pelo menos 1',
      value: data.stats.hit_points
    });
  }
  
  // Validações de Challenge Rating
  if (data.challenge_rating && !CHALLENGE_RATINGS.includes(data.challenge_rating as any)) {
    warnings.push(`Challenge Rating "${data.challenge_rating}" não é um valor padrão`);
  }
  
  // Validações de ataques
  data.attacks?.forEach((attack, index) => {
    if (!attack.name || attack.name.trim().length === 0) {
      errors.push({
        field: `attacks[${index}].name`,
        message: 'Nome do ataque é obrigatório',
        value: attack.name
      });
    }
    
    if (!attack.damage) {
      errors.push({
        field: `attacks[${index}].damage`,
        message: 'Dano do ataque é obrigatório',
        value: attack.damage
      });
    } else {
      if (attack.damage.dice_count < 1) {
        errors.push({
          field: `attacks[${index}].damage.dice_count`,
          message: 'Quantidade de dados deve ser pelo menos 1',
          value: attack.damage.dice_count
        });
      }
      
      if (![4, 6, 8, 10, 12, 20, 100].includes(attack.damage.dice_sides)) {
        warnings.push(`Ataque ${index + 1}: ${attack.damage.dice_sides} não é um tipo de dado comum`);
      }
    }
  });
  
  // Validações de magias
  data.spells?.forEach((spell, index) => {
    if (!spell.name || spell.name.trim().length === 0) {
      errors.push({
        field: `spells[${index}].name`,
        message: 'Nome da magia é obrigatório',
        value: spell.name
      });
    }
    
    if (spell.level < 0 || spell.level > 9) {
      errors.push({
        field: `spells[${index}].level`,
        message: 'Nível da magia deve estar entre 0 e 9',
        value: spell.level
      });
    }
    
    if (spell.is_attack_spell && !spell.damage) {
      warnings.push(`Magia ${index + 1}: Marcada como ataque mas sem dano definido`);
    }
  });
  
  // Validações de conjuração
  if (data.spellcasting?.is_spellcaster) {
    if (!data.spellcasting.spellcasting_ability) {
      warnings.push('Conjurador sem atributo de conjuração definido');
    }
    
    if (data.spells && data.spells.length === 0) {
      warnings.push('Conjurador sem magias definidas');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida uma rolagem de dados específica
 */
export function validateDiceRoll(roll: DiceRoll): boolean {
  return (
    roll.dice_count >= 1 && 
    roll.dice_count <= 100 &&
    roll.dice_sides >= 2 && 
    roll.dice_sides <= 100 &&
    Number.isInteger(roll.dice_count) &&
    Number.isInteger(roll.dice_sides) &&
    Number.isInteger(roll.modifier)
  );
}

// ===========================
// FUNÇÕES DE FORMATAÇÃO
// ===========================

/**
 * Formata um modificador com sinal (ex: +3, -1, +0)
 */
export function formatModifier(modifier: number): string {
  if (modifier > 0) return `+${modifier}`;
  if (modifier < 0) return `${modifier}`;
  return '+0';
}

/**
 * Formata resultado de rolagem para exibição
 */
export function formatRollResult(result: RollResult): string {
  const rollsStr = result.rolls.join(', ');
  const modStr = result.modifier !== 0 ? ` ${formatModifier(result.modifier)}` : '';
  return `[${rollsStr}]${modStr} = ${result.total}`;
}

/**
 * Formata Challenge Rating para exibição
 */
export function formatChallengeRating(cr: string): string {
  if (!cr) return 'N/A';
  if (cr === '0') return '0';
  return `CR ${cr}`;
}

/**
 * Formata pontos de vida para exibição
 */
export function formatHitPoints(current: number, max?: number): string {
  if (max && max !== current) {
    return `${current}/${max}`;
  }
  return `${current}`;
}

// ===========================
// FUNÇÕES DE GERAÇÃO AUTOMÁTICA
// ===========================

/**
 * Gera atributos básicos baseados no Challenge Rating
 */
export function generateAttributesFromCR(cr: string): NPCAttributes {
  const crNumber = parseFloat(cr) || 0;
  
  // Valores base aumentam com CR
  let baseValue = 10;
  if (crNumber >= 1) baseValue = 12;
  if (crNumber >= 5) baseValue = 14;
  if (crNumber >= 10) baseValue = 16;
  if (crNumber >= 15) baseValue = 18;
  if (crNumber >= 20) baseValue = 20;
  
  return {
    strength: baseValue + Math.floor(Math.random() * 4) - 2,
    dexterity: baseValue + Math.floor(Math.random() * 4) - 2,
    constitution: baseValue + Math.floor(Math.random() * 4) - 2,
    intelligence: baseValue + Math.floor(Math.random() * 4) - 2,
    wisdom: baseValue + Math.floor(Math.random() * 4) - 2,
    charisma: baseValue + Math.floor(Math.random() * 4) - 2
  };
}

/**
 * Gera pontos de vida baseados no CR e tamanho
 */
export function generateHitPointsFromCR(cr: string, size: string = 'medium'): number {
  const crNumber = parseFloat(cr) || 0;
  
  let baseHP = 4;
  if (crNumber >= 0.25) baseHP = 8;
  if (crNumber >= 0.5) baseHP = 16;
  if (crNumber >= 1) baseHP = 32;
  if (crNumber >= 2) baseHP = 64;
  if (crNumber >= 5) baseHP = 96;
  if (crNumber >= 10) baseHP = 128;
  if (crNumber >= 15) baseHP = 192;
  if (crNumber >= 20) baseHP = 256;
  
  // Modificador por tamanho
  const sizeMultiplier: Record<string, number> = {
    tiny: 0.5,
    small: 0.75,
    medium: 1,
    large: 1.5,
    huge: 2,
    gargantuan: 3
  };
  
  const multiplier = sizeMultiplier[size.toLowerCase()] || 1;
  return Math.floor(baseHP * multiplier);
}

/**
 * Gera CA baseada no CR
 */
export function generateArmorClassFromCR(cr: string): number {
  const crNumber = parseFloat(cr) || 0;
  
  let baseAC = 10;
  if (crNumber >= 0.25) baseAC = 12;
  if (crNumber >= 1) baseAC = 13;
  if (crNumber >= 2) baseAC = 14;
  if (crNumber >= 5) baseAC = 15;
  if (crNumber >= 10) baseAC = 16;
  if (crNumber >= 15) baseAC = 17;
  if (crNumber >= 20) baseAC = 18;
  
  return baseAC + Math.floor(Math.random() * 3) - 1; // Variação de ±1
}

// ===========================
// FUNÇÕES DE BUSCA E FILTRO
// ===========================

/**
 * Filtra NPCs baseado em critérios
 */
export function filterNPCs(npcs: EnhancedNPC[], filters: any): EnhancedNPC[] {
  return npcs.filter(npc => {
    if (filters.name && !npc.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    
    if (filters.npc_type && filters.npc_type.length > 0 && !filters.npc_type.includes(npc.npc_type)) {
      return false;
    }
    
    if (filters.location && filters.location.length > 0 && 
        (!npc.location || !filters.location.includes(npc.location))) {
      return false;
    }
    
    if (filters.is_alive !== undefined && npc.is_alive !== filters.is_alive) {
      return false;
    }
    
    if (filters.is_active !== undefined && npc.is_active !== filters.is_active) {
      return false;
    }
    
    if (filters.has_attacks !== undefined) {
      const hasAttacks = npc.attacks && npc.attacks.length > 0;
      if (hasAttacks !== filters.has_attacks) return false;
    }
    
    if (filters.is_spellcaster !== undefined) {
      const isSpellcaster = npc.spellcasting?.is_spellcaster || false;
      if (isSpellcaster !== filters.is_spellcaster) return false;
    }
    
    return true;
  });
}

/**
 * Ordena NPCs por critério específico
 */
export function sortNPCs(npcs: EnhancedNPC[], sortBy: string, order: 'asc' | 'desc' = 'asc'): EnhancedNPC[] {
  const sorted = [...npcs].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'challenge_rating':
        aValue = parseFloat(a.challenge_rating || '0');
        bValue = parseFloat(b.challenge_rating || '0');
        break;
      case 'hit_points':
        aValue = a.stats.hit_points;
        bValue = b.stats.hit_points;
        break;
      case 'armor_class':
        aValue = a.stats.armor_class;
        bValue = b.stats.armor_class;
        break;
      case 'created_date':
        aValue = new Date(a.created_date);
        bValue = new Date(b.created_date);
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}

// ===========================
// EXPORT DAS FUNÇÕES
// ===========================

export const npcUtilities = {
  // Rolagem
  rollSingleDie,
  rollMultipleDice,
  rollDice,
  formatDiceRoll,
  parseDiceRoll,
  
  // Cálculos D&D
  calculateModifier,
  calculateProficiencyBonus,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
  calculatePassivePerception,
  calculateArmorClass,
  calculateInitiativeModifier,
  getAttributeModifier,
  getAllAttributeModifiers,
  
  // Validação
  validateNPCData,
  validateDiceRoll,
  
  // Formatação
  formatModifier,
  formatRollResult,
  formatChallengeRating,
  formatHitPoints,
  
  // Geração automática
  generateAttributesFromCR,
  generateHitPointsFromCR,
  generateArmorClassFromCR,
  
  // Busca e filtro
  filterNPCs,
  sortNPCs
};

export default npcUtilities;