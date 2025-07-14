// ===========================
// CONFIGURAÇÃO DE MAGIAS POR CLASSE
// src/constants/spellConfig.ts
// ===========================

export interface SpellClassConfig {
  isSpellcaster: boolean;
  cantripsKnown: number;
  spellsKnown: number;
  maxSpellLevel: number;
  spellcastingAbility: 'int' | 'wis' | 'cha';
}

export const SPELL_CONFIG_BY_CLASS: Record<string, SpellClassConfig> = {
  // ===========================
  // CONJURADORES COMPLETOS
  // ===========================
  
  // Mago (Wizard)
  'wizard': {
    isSpellcaster: true,
    cantripsKnown: 3,
    spellsKnown: 6, // Livro de magias inicial
    maxSpellLevel: 1,
    spellcastingAbility: 'int'
  },
  'mago': {
    isSpellcaster: true,
    cantripsKnown: 3,
    spellsKnown: 6,
    maxSpellLevel: 1,
    spellcastingAbility: 'int'
  },

  // Feiticeiro (Sorcerer)
  'sorcerer': {
    isSpellcaster: true,
    cantripsKnown: 4,
    spellsKnown: 2,
    maxSpellLevel: 1,
    spellcastingAbility: 'cha'
  },
  'feiticeiro': {
    isSpellcaster: true,
    cantripsKnown: 4,
    spellsKnown: 2,
    maxSpellLevel: 1,
    spellcastingAbility: 'cha'
  },

  // Clérigo (Cleric)
  'cleric': {
    isSpellcaster: true,
    cantripsKnown: 3,
    spellsKnown: 2, // Preparadas = modificador WIS + nível
    maxSpellLevel: 1,
    spellcastingAbility: 'wis'
  },
  'clerigo': {
    isSpellcaster: true,
    cantripsKnown: 3,
    spellsKnown: 2,
    maxSpellLevel: 1,
    spellcastingAbility: 'wis'
  },
  'clérico': {
    isSpellcaster: true,
    cantripsKnown: 3,
    spellsKnown: 2,
    maxSpellLevel: 1,
    spellcastingAbility: 'wis'
  },

  // Druida (Druid)
  'druid': {
    isSpellcaster: true,
    cantripsKnown: 2,
    spellsKnown: 2, // Preparadas = modificador WIS + nível
    maxSpellLevel: 1,
    spellcastingAbility: 'wis'
  },
  'druida': {
    isSpellcaster: true,
    cantripsKnown: 2,
    spellsKnown: 2,
    maxSpellLevel: 1,
    spellcastingAbility: 'wis'
  },

  // ===========================
  // CONJURADORES PARCIAIS
  // ===========================

  // Bardo (Bard)
  'bard': {
    isSpellcaster: true,
    cantripsKnown: 2,
    spellsKnown: 4,
    maxSpellLevel: 1,
    spellcastingAbility: 'cha'
  },
  'bardo': {
    isSpellcaster: true,
    cantripsKnown: 2,
    spellsKnown: 4,
    maxSpellLevel: 1,
    spellcastingAbility: 'cha'
  },

  // Bruxo (Warlock)
  'warlock': {
    isSpellcaster: true,
    cantripsKnown: 2,
    spellsKnown: 2,
    maxSpellLevel: 1,
    spellcastingAbility: 'cha'
  },
  'bruxo': {
    isSpellcaster: true,
    cantripsKnown: 2,
    spellsKnown: 2,
    maxSpellLevel: 1,
    spellcastingAbility: 'cha'
  },

  // Paladino (Paladin) - Nível 2+
  'paladin': {
    isSpellcaster: false, // Só no nível 2+
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'cha'
  },
  'paladino': {
    isSpellcaster: false,
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'cha'
  },

  // Ranger - Nível 2+
  'ranger': {
    isSpellcaster: false, // Só no nível 2+
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'wis'
  },
  'batedor': {
    isSpellcaster: false,
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'wis'
  },

  // ===========================
  // SUBCLASSES CONJURADORAS
  // ===========================

  // Arcane Trickster (Rogue subclass)
  'arcane-trickster': {
    isSpellcaster: false, // Só no nível 3+
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'int'
  },

  // Eldritch Knight (Fighter subclass)
  'eldritch-knight': {
    isSpellcaster: false, // Só no nível 3+
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'int'
  },

  // ===========================
  // CLASSES NÃO-CONJURADORAS
  // ===========================

  // Guerreiro (Fighter)
  'fighter': {
    isSpellcaster: false,
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'int'
  },
  'guerreiro': {
    isSpellcaster: false,
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'int'
  },

  // Bárbaro (Barbarian)
  'barbarian': {
    isSpellcaster: false,
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'wis'
  },
  'barbaro': {
    isSpellcaster: false,
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'wis'
  },
  'bárbaro': {
    isSpellcaster: false,
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'wis'
  },

  // Ladino (Rogue)
  'rogue': {
    isSpellcaster: false,
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'int'
  },
  'ladino': {
    isSpellcaster: false,
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'int'
  },

  // Monge (Monk)
  'monk': {
    isSpellcaster: false,
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'wis'
  },
  'monge': {
    isSpellcaster: false,
    cantripsKnown: 0,
    spellsKnown: 0,
    maxSpellLevel: 0,
    spellcastingAbility: 'wis'
  },
};

// ===========================
// FUNÇÕES UTILITÁRIAS
// ===========================

/**
 * Busca configuração de magia para uma classe
 */
export function getSpellConfigForClass(classIndex: string): SpellClassConfig | null {
  const key = classIndex.toLowerCase();
  return SPELL_CONFIG_BY_CLASS[key] || null;
}

/**
 * Verifica se uma classe é conjuradora no nível 1
 */
export function isLevel1Spellcaster(classIndex: string): boolean {
  const config = getSpellConfigForClass(classIndex);
  return config?.isSpellcaster || false;
}

/**
 * Retorna todas as classes conjuradoras
 */
export function getSpellcasterClasses(): string[] {
  return Object.keys(SPELL_CONFIG_BY_CLASS).filter(
    key => SPELL_CONFIG_BY_CLASS[key].isSpellcaster
  );
}

/**
 * Busca configuração com fallback para nomes alternativos
 */
export function findSpellConfigByName(className: string): SpellClassConfig | null {
  if (!className) return null;

  const possibleKeys = [
    className.toLowerCase(),
    className.toLowerCase().replace(/[^a-z]/g, ''),
    className.toLowerCase().replace(/ç/g, 'c').replace(/ã/g, 'a').replace(/õ/g, 'o')
  ];

  for (const key of possibleKeys) {
    const config = SPELL_CONFIG_BY_CLASS[key];
    if (config) return config;
  }

  return null;
}