// ===========================
// MOCK CLASSES DATA - COMPLETE SRD
// ===========================

import { DndClass } from "@/types/characterCreation";

export const mockClasses: DndClass[] = [
  // BÁRBARO
  {
    index: "barbarian",
    name: "Bárbaro",
    hit_die: 12,
    proficiencies: [
      { index: "light-armor", name: "Armaduras leves", url: "" },
      { index: "medium-armor", name: "Armaduras médias", url: "" },
      { index: "shields", name: "Escudos", url: "" },
      { index: "simple-weapons", name: "Armas simples", url: "" },
      { index: "martial-weapons", name: "Armas marciais", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha duas dentre Adestrar Animais, Atletismo, Intimidação, Natureza, Percepção e Sobrevivência",
        choose: 2,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "animal-handling", name: "Adestrar Animais", url: "" } },
            { option_type: "reference", item: { index: "athletics", name: "Atletismo", url: "" } },
            { option_type: "reference", item: { index: "intimidation", name: "Intimidação", url: "" } },
            { option_type: "reference", item: { index: "nature", name: "Natureza", url: "" } },
            { option_type: "reference", item: { index: "perception", name: "Percepção", url: "" } },
            { option_type: "reference", item: { index: "survival", name: "Sobrevivência", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "str", name: "Força", url: "" },
      { index: "con", name: "Constituição", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "greataxe", name: "Machado Grande", url: "" }, quantity: 1 },
      { equipment: { index: "handaxe", name: "Machadinha", url: "" }, quantity: 2 },
      { equipment: { index: "javelin", name: "Azagaia", url: "" }, quantity: 4 },
      { equipment: { index: "explorers-pack", name: "Pacote de Explorador", url: "" }, quantity: 1 }
    ],
    spellcasting: undefined,
    url: "/api/classes/barbarian",
  },

  // BARDO
  {
    index: "bard",
    name: "Bardo",
    hit_die: 8,
    proficiencies: [
      { index: "light-armor", name: "Armaduras leves", url: "" },
      { index: "simple-weapons", name: "Armas simples", url: "" },
      { index: "hand-crossbows", name: "Bestas de mão", url: "" },
      { index: "longswords", name: "Espadas longas", url: "" },
      { index: "rapiers", name: "Rapieiras", url: "" },
      { index: "shortswords", name: "Espadas curtas", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha três perícias quaisquer",
        choose: 3,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "all-skills", name: "Todas as perícias", url: "" } }
          ]
        }
      },
      {
        desc: "Escolha três instrumentos musicais",
        choose: 3,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "musical-instruments", name: "Instrumentos musicais", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "dex", name: "Destreza", url: "" },
      { index: "cha", name: "Carisma", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "rapier", name: "Rapieira", url: "" }, quantity: 1 },
      { equipment: { index: "leather-armor", name: "Armadura de Couro", url: "" }, quantity: 1 },
      { equipment: { index: "dagger", name: "Adaga", url: "" }, quantity: 1 },
      { equipment: { index: "entertainers-pack", name: "Pacote de Artista", url: "" }, quantity: 1 }
    ],
    spellcasting: {
      level: 1,
      spellcasting_ability: { index: "cha", name: "Carisma", url: "" }
    },
    url: "/api/classes/bard",
  },

  // CLÉRICO
  {
    index: "cleric",
    name: "Clérico",
    hit_die: 8,
    proficiencies: [
      { index: "light-armor", name: "Armaduras leves", url: "" },
      { index: "medium-armor", name: "Armaduras médias", url: "" },
      { index: "shields", name: "Escudos", url: "" },
      { index: "simple-weapons", name: "Armas simples", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha duas dentre História, Intuição, Medicina, Persuasão e Religião",
        choose: 2,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "history", name: "História", url: "" } },
            { option_type: "reference", item: { index: "insight", name: "Intuição", url: "" } },
            { option_type: "reference", item: { index: "medicine", name: "Medicina", url: "" } },
            { option_type: "reference", item: { index: "persuasion", name: "Persuasão", url: "" } },
            { option_type: "reference", item: { index: "religion", name: "Religião", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "wis", name: "Sabedoria", url: "" },
      { index: "cha", name: "Carisma", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "scale-mail", name: "Brunea", url: "" }, quantity: 1 },
      { equipment: { index: "shield", name: "Escudo", url: "" }, quantity: 1 },
      { equipment: { index: "mace", name: "Maça", url: "" }, quantity: 1 },
      { equipment: { index: "priests-pack", name: "Pacote de Sacerdote", url: "" }, quantity: 1 }
    ],
    spellcasting: {
      level: 1,
      spellcasting_ability: { index: "wis", name: "Sabedoria", url: "" }
    },
    url: "/api/classes/cleric",
  },

  // DRUIDA
  {
    index: "druid",
    name: "Druida",
    hit_die: 8,
    proficiencies: [
      { index: "light-armor", name: "Armaduras leves (não metálicas)", url: "" },
      { index: "medium-armor", name: "Armaduras médias (não metálicas)", url: "" },
      { index: "shields", name: "Escudos (não metálicos)", url: "" },
      { index: "clubs", name: "Clavas", url: "" },
      { index: "daggers", name: "Adagas", url: "" },
      { index: "darts", name: "Dardos", url: "" },
      { index: "javelins", name: "Azagaias", url: "" },
      { index: "maces", name: "Maças", url: "" },
      { index: "quarterstaffs", name: "Bordões", url: "" },
      { index: "scimitars", name: "Cimitarras", url: "" },
      { index: "sickles", name: "Foices", url: "" },
      { index: "slings", name: "Fundas", url: "" },
      { index: "spears", name: "Lanças", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha duas dentre Arcana, Adestrar Animais, Intuição, Medicina, Natureza, Percepção, Religião e Sobrevivência",
        choose: 2,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "arcana", name: "Arcana", url: "" } },
            { option_type: "reference", item: { index: "animal-handling", name: "Adestrar Animais", url: "" } },
            { option_type: "reference", item: { index: "insight", name: "Intuição", url: "" } },
            { option_type: "reference", item: { index: "medicine", name: "Medicina", url: "" } },
            { option_type: "reference", item: { index: "nature", name: "Natureza", url: "" } },
            { option_type: "reference", item: { index: "perception", name: "Percepção", url: "" } },
            { option_type: "reference", item: { index: "religion", name: "Religião", url: "" } },
            { option_type: "reference", item: { index: "survival", name: "Sobrevivência", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "int", name: "Inteligência", url: "" },
      { index: "wis", name: "Sabedoria", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "leather-armor", name: "Armadura de Couro", url: "" }, quantity: 1 },
      { equipment: { index: "shield", name: "Escudo", url: "" }, quantity: 1 },
      { equipment: { index: "scimitar", name: "Cimitarra", url: "" }, quantity: 1 },
      { equipment: { index: "explorers-pack", name: "Pacote de Explorador", url: "" }, quantity: 1 }
    ],
    spellcasting: {
      level: 1,
      spellcasting_ability: { index: "wis", name: "Sabedoria", url: "" }
    },
    url: "/api/classes/druid",
  },

  // GUERREIRO
  {
    index: "fighter",
    name: "Guerreiro",
    hit_die: 10,
    proficiencies: [
      { index: "all-armor", name: "Todas as armaduras", url: "" },
      { index: "shields", name: "Escudos", url: "" },
      { index: "simple-weapons", name: "Armas simples", url: "" },
      { index: "martial-weapons", name: "Armas marciais", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha duas dentre Acrobacia, Adestrar Animais, Atletismo, História, Intuição, Intimidação, Percepção e Sobrevivência",
        choose: 2,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "acrobatics", name: "Acrobacia", url: "" } },
            { option_type: "reference", item: { index: "animal-handling", name: "Adestrar Animais", url: "" } },
            { option_type: "reference", item: { index: "athletics", name: "Atletismo", url: "" } },
            { option_type: "reference", item: { index: "history", name: "História", url: "" } },
            { option_type: "reference", item: { index: "insight", name: "Intuição", url: "" } },
            { option_type: "reference", item: { index: "intimidation", name: "Intimidação", url: "" } },
            { option_type: "reference", item: { index: "perception", name: "Percepção", url: "" } },
            { option_type: "reference", item: { index: "survival", name: "Sobrevivência", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "str", name: "Força", url: "" },
      { index: "con", name: "Constituição", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "chain-mail", name: "Cota de Malha", url: "" }, quantity: 1 },
      { equipment: { index: "longsword", name: "Espada Longa", url: "" }, quantity: 1 },
      { equipment: { index: "shield", name: "Escudo", url: "" }, quantity: 1 },
      { equipment: { index: "dungeoneer-pack", name: "Pacote de Explorador de Masmorras", url: "" }, quantity: 1 }
    ],
    spellcasting: undefined,
    url: "/api/classes/fighter",
  },

  // MONGE
  {
    index: "monk",
    name: "Monge",
    hit_die: 8,
    proficiencies: [
      { index: "simple-weapons", name: "Armas simples", url: "" },
      { index: "shortswords", name: "Espadas curtas", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha duas dentre Acrobacia, Atletismo, História, Intuição, Religião e Furtividade",
        choose: 2,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "acrobatics", name: "Acrobacia", url: "" } },
            { option_type: "reference", item: { index: "athletics", name: "Atletismo", url: "" } },
            { option_type: "reference", item: { index: "history", name: "História", url: "" } },
            { option_type: "reference", item: { index: "insight", name: "Intuição", url: "" } },
            { option_type: "reference", item: { index: "religion", name: "Religião", url: "" } },
            { option_type: "reference", item: { index: "stealth", name: "Furtividade", url: "" } }
          ]
        }
      },
      {
        desc: "Escolha um tipo de kit de artesão ou um instrumento musical",
        choose: 1,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "artisan-tools", name: "Ferramentas de Artesão", url: "" } },
            { option_type: "reference", item: { index: "musical-instrument", name: "Instrumento Musical", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "str", name: "Força", url: "" },
      { index: "dex", name: "Destreza", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "shortsword", name: "Espada Curta", url: "" }, quantity: 1 },
      { equipment: { index: "dart", name: "Dardo", url: "" }, quantity: 10 },
      { equipment: { index: "dungeoneer-pack", name: "Pacote de Explorador de Masmorras", url: "" }, quantity: 1 }
    ],
    spellcasting: undefined,
    url: "/api/classes/monk",
  },

  // PALADINO
  {
    index: "paladin",
    name: "Paladino",
    hit_die: 10,
    proficiencies: [
      { index: "all-armor", name: "Todas as armaduras", url: "" },
      { index: "shields", name: "Escudos", url: "" },
      { index: "simple-weapons", name: "Armas simples", url: "" },
      { index: "martial-weapons", name: "Armas marciais", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha duas dentre Atletismo, Intuição, Intimidação, Medicina, Persuasão e Religião",
        choose: 2,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "athletics", name: "Atletismo", url: "" } },
            { option_type: "reference", item: { index: "insight", name: "Intuição", url: "" } },
            { option_type: "reference", item: { index: "intimidation", name: "Intimidação", url: "" } },
            { option_type: "reference", item: { index: "medicine", name: "Medicina", url: "" } },
            { option_type: "reference", item: { index: "persuasion", name: "Persuasão", url: "" } },
            { option_type: "reference", item: { index: "religion", name: "Religião", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "wis", name: "Sabedoria", url: "" },
      { index: "cha", name: "Carisma", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "chain-mail", name: "Cota de Malha", url: "" }, quantity: 1 },
      { equipment: { index: "shield", name: "Escudo", url: "" }, quantity: 1 },
      { equipment: { index: "longsword", name: "Espada Longa", url: "" }, quantity: 1 },
      { equipment: { index: "priests-pack", name: "Pacote de Sacerdote", url: "" }, quantity: 1 }
    ],
    spellcasting: {
      level: 2,
      spellcasting_ability: { index: "cha", name: "Carisma", url: "" }
    },
    url: "/api/classes/paladin",
  },

  // PATRULHEIRO (RANGER)
  {
    index: "ranger",
    name: "Patrulheiro",
    hit_die: 10,
    proficiencies: [
      { index: "light-armor", name: "Armaduras leves", url: "" },
      { index: "medium-armor", name: "Armaduras médias", url: "" },
      { index: "shields", name: "Escudos", url: "" },
      { index: "simple-weapons", name: "Armas simples", url: "" },
      { index: "martial-weapons", name: "Armas marciais", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha três dentre Adestrar Animais, Atletismo, Intuição, Investigação, Natureza, Percepção, Furtividade e Sobrevivência",
        choose: 3,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "animal-handling", name: "Adestrar Animais", url: "" } },
            { option_type: "reference", item: { index: "athletics", name: "Atletismo", url: "" } },
            { option_type: "reference", item: { index: "insight", name: "Intuição", url: "" } },
            { option_type: "reference", item: { index: "investigation", name: "Investigação", url: "" } },
            { option_type: "reference", item: { index: "nature", name: "Natureza", url: "" } },
            { option_type: "reference", item: { index: "perception", name: "Percepção", url: "" } },
            { option_type: "reference", item: { index: "stealth", name: "Furtividade", url: "" } },
            { option_type: "reference", item: { index: "survival", name: "Sobrevivência", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "str", name: "Força", url: "" },
      { index: "dex", name: "Destreza", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "scale-mail", name: "Brunea", url: "" }, quantity: 1 },
      { equipment: { index: "longsword", name: "Espada Longa", url: "" }, quantity: 1 },
      { equipment: { index: "longbow", name: "Arco Longo", url: "" }, quantity: 1 },
      { equipment: { index: "arrow", name: "Flecha", url: "" }, quantity: 20 },
      { equipment: { index: "explorers-pack", name: "Pacote de Explorador", url: "" }, quantity: 1 }
    ],
    spellcasting: {
      level: 2,
      spellcasting_ability: { index: "wis", name: "Sabedoria", url: "" }
    },
    url: "/api/classes/ranger",
  },

  // LADINO (ROGUE)
  {
    index: "rogue",
    name: "Ladino",
    hit_die: 8,
    proficiencies: [
      { index: "light-armor", name: "Armaduras leves", url: "" },
      { index: "simple-weapons", name: "Armas simples", url: "" },
      { index: "hand-crossbows", name: "Bestas de mão", url: "" },
      { index: "longswords", name: "Espadas longas", url: "" },
      { index: "rapiers", name: "Rapieiras", url: "" },
      { index: "shortswords", name: "Espadas curtas", url: "" },
      { index: "thieves-tools", name: "Ferramentas de Ladrão", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha quatro dentre Acrobacia, Atletismo, Enganação, Intuição, Intimidação, Investigação, Percepção, Atuação, Persuasão, Prestidigitação e Furtividade",
        choose: 4,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "acrobatics", name: "Acrobacia", url: "" } },
            { option_type: "reference", item: { index: "athletics", name: "Atletismo", url: "" } },
            { option_type: "reference", item: { index: "deception", name: "Enganação", url: "" } },
            { option_type: "reference", item: { index: "insight", name: "Intuição", url: "" } },
            { option_type: "reference", item: { index: "intimidation", name: "Intimidação", url: "" } },
            { option_type: "reference", item: { index: "investigation", name: "Investigação", url: "" } },
            { option_type: "reference", item: { index: "perception", name: "Percepção", url: "" } },
            { option_type: "reference", item: { index: "performance", name: "Atuação", url: "" } },
            { option_type: "reference", item: { index: "persuasion", name: "Persuasão", url: "" } },
            { option_type: "reference", item: { index: "sleight-of-hand", name: "Prestidigitação", url: "" } },
            { option_type: "reference", item: { index: "stealth", name: "Furtividade", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "dex", name: "Destreza", url: "" },
      { index: "int", name: "Inteligência", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "rapier", name: "Rapieira", url: "" }, quantity: 1 },
      { equipment: { index: "leather-armor", name: "Armadura de Couro", url: "" }, quantity: 1 },
      { equipment: { index: "dagger", name: "Adaga", url: "" }, quantity: 2 },
      { equipment: { index: "thieves-tools", name: "Ferramentas de Ladrão", url: "" }, quantity: 1 },
      { equipment: { index: "burglars-pack", name: "Pacote de Ladino", url: "" }, quantity: 1 }
    ],
    spellcasting: undefined,
    url: "/api/classes/rogue",
  },

  // FEITICEIRO (SORCERER)
  {
    index: "sorcerer",
    name: "Feiticeiro",
    hit_die: 6,
    proficiencies: [
      { index: "daggers", name: "Adagas", url: "" },
      { index: "darts", name: "Dardos", url: "" },
      { index: "slings", name: "Fundas", url: "" },
      { index: "quarterstaffs", name: "Bordões", url: "" },
      { index: "light-crossbows", name: "Bestas leves", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha duas dentre Arcana, Enganação, Intuição, Intimidação, Persuasão e Religião",
        choose: 2,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "arcana", name: "Arcana", url: "" } },
            { option_type: "reference", item: { index: "deception", name: "Enganação", url: "" } },
            { option_type: "reference", item: { index: "insight", name: "Intuição", url: "" } },
            { option_type: "reference", item: { index: "intimidation", name: "Intimidação", url: "" } },
            { option_type: "reference", item: { index: "persuasion", name: "Persuasão", url: "" } },
            { option_type: "reference", item: { index: "religion", name: "Religião", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "con", name: "Constituição", url: "" },
      { index: "cha", name: "Carisma", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "light-crossbow", name: "Besta Leve", url: "" }, quantity: 1 },
      { equipment: { index: "crossbow-bolt", name: "Virote", url: "" }, quantity: 20 },
      { equipment: { index: "dagger", name: "Adaga", url: "" }, quantity: 2 },
      { equipment: { index: "dungeoneer-pack", name: "Pacote de Explorador de Masmorras", url: "" }, quantity: 1 }
    ],
    spellcasting: {
      level: 1,
      spellcasting_ability: { index: "cha", name: "Carisma", url: "" }
    },
    url: "/api/classes/sorcerer",
  },

  // BRUXO (WARLOCK)
  {
    index: "warlock",
    name: "Bruxo",
    hit_die: 8,
    proficiencies: [
      { index: "light-armor", name: "Armaduras leves", url: "" },
      { index: "simple-weapons", name: "Armas simples", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha duas dentre Arcana, Enganação, História, Intimidação, Investigação, Natureza e Religião",
        choose: 2,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "arcana", name: "Arcana", url: "" } },
            { option_type: "reference", item: { index: "deception", name: "Enganação", url: "" } },
            { option_type: "reference", item: { index: "history", name: "História", url: "" } },
            { option_type: "reference", item: { index: "intimidation", name: "Intimidação", url: "" } },
            { option_type: "reference", item: { index: "investigation", name: "Investigação", url: "" } },
            { option_type: "reference", item: { index: "nature", name: "Natureza", url: "" } },
            { option_type: "reference", item: { index: "religion", name: "Religião", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "wis", name: "Sabedoria", url: "" },
      { index: "cha", name: "Carisma", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "light-crossbow", name: "Besta Leve", url: "" }, quantity: 1 },
      { equipment: { index: "crossbow-bolt", name: "Virote", url: "" }, quantity: 20 },
      { equipment: { index: "leather-armor", name: "Armadura de Couro", url: "" }, quantity: 1 },
      { equipment: { index: "dagger", name: "Adaga", url: "" }, quantity: 2 },
      { equipment: { index: "dungeoneer-pack", name: "Pacote de Explorador de Masmorras", url: "" }, quantity: 1 }
    ],
    spellcasting: {
      level: 1,
      spellcasting_ability: { index: "cha", name: "Carisma", url: "" }
    },
    url: "/api/classes/warlock",
  },

  // MAGO (WIZARD)
  {
    index: "wizard",
    name: "Mago",
    hit_die: 6,
    proficiencies: [
      { index: "daggers", name: "Adagas", url: "" },
      { index: "darts", name: "Dardos", url: "" },
      { index: "slings", name: "Fundas", url: "" },
      { index: "quarterstaffs", name: "Bordões", url: "" },
      { index: "light-crossbows", name: "Bestas leves", url: "" }
    ],
    proficiency_choices: [
      {
        desc: "Escolha duas dentre Arcana, História, Intuição, Investigação, Medicina e Religião",
        choose: 2,
        type: "proficiencies",
        from: {
          option_set_type: "options_array",
          options: [
            { option_type: "reference", item: { index: "arcana", name: "Arcana", url: "" } },
            { option_type: "reference", item: { index: "history", name: "História", url: "" } },
            { option_type: "reference", item: { index: "insight", name: "Intuição", url: "" } },
            { option_type: "reference", item: { index: "investigation", name: "Investigação", url: "" } },
            { option_type: "reference", item: { index: "medicine", name: "Medicina", url: "" } },
            { option_type: "reference", item: { index: "religion", name: "Religião", url: "" } }
          ]
        }
      }
    ],
    saving_throws: [
      { index: "int", name: "Inteligência", url: "" },
      { index: "wis", name: "Sabedoria", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "quarterstaff", name: "Bordão", url: "" }, quantity: 1 },
      { equipment: { index: "dagger", name: "Adaga", url: "" }, quantity: 1 },
      { equipment: { index: "scholars-pack", name: "Pacote de Acadêmico", url: "" }, quantity: 1 },
      { equipment: { index: "spellbook", name: "Livro de Magias", url: "" }, quantity: 1 }
    ],
    spellcasting: {
      level: 1,
      spellcasting_ability: { index: "int", name: "Inteligência", url: "" }
    },
    url: "/api/classes/wizard",
  },
];