// ===========================
// MOCK SUBCLASSES DATA
// ===========================

import { DndSubclass } from "@/types/characterCreation";

export const mockSubclasses: DndSubclass[] = [
  // Clérigo
  {
    index: "life-domain",
    name: "Domínio da Vida",
    class: { index: "cleric", name: "Clérico", url: "/api/classes/cleric" },
    desc: "O domínio da Vida se concentra na energia positiva vibrante - uma das forças fundamentais do universo - que sustenta toda a vida.",
    subclass_flavor: "Deuses da vida promovem vitalidade e saúde através da cura dos doentes e feridos.",
    subclass_levels: [
      {
        level: 1,
        features: [
          { index: "bonus-proficiency", name: "Proficiência Adicional", url: "" },
          { index: "disciple-of-life", name: "Discípulo da Vida", url: "" }
        ]
      },
      {
        level: 2,
        features: [
          { index: "channel-divinity-preserve-life", name: "Canalizar Divindade: Preservar Vida", url: "" }
        ]
      }
    ],
    url: "/api/subclasses/life-domain",
  },
  {
    index: "light-domain",
    name: "Domínio da Luz",
    class: { index: "cleric", name: "Clérico", url: "/api/classes/cleric" },
    desc: "Deuses da luz promovem os ideais de renascimento e renovação, verdade, vigilância e beleza.",
    subclass_flavor: "Eles detestam mentiras, quebra de promessas e trevas.",
    subclass_levels: [
      {
        level: 1,
        features: [
          { index: "bonus-cantrip", name: "Truque Adicional", url: "" },
          { index: "warding-flare", name: "Clarão Protetor", url: "" }
        ]
      }
    ],
    url: "/api/subclasses/light-domain",
  },
  // Guerreiro
  {
    index: "champion",
    name: "Campeão",
    class: { index: "fighter", name: "Guerreiro", url: "/api/classes/fighter" },
    desc: "O arquétipo do Campeão foca na excelência física pura.",
    subclass_flavor: "Campeões combinam treinamento rigoroso com excelência física.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "improved-critical", name: "Crítico Aprimorado", url: "" }
        ]
      },
      {
        level: 7,
        features: [
          { index: "remarkable-athlete", name: "Atleta Notável", url: "" }
        ]
      }
    ],
    url: "/api/subclasses/champion",
  },
  {
    index: "battle-master",
    name: "Mestre de Batalha",
    class: { index: "fighter", name: "Guerreiro", url: "/api/classes/fighter" },
    desc: "Aqueles que emulam o arquétipo do Mestre de Batalha empregam técnicas marciais.",
    subclass_flavor: "Para um mestre de batalha, o combate é um campo acadêmico.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "combat-superiority", name: "Superioridade em Combate", url: "" },
          { index: "maneuvers", name: "Manobras", url: "" }
        ]
      }
    ],
    url: "/api/subclasses/battle-master",
  },
  // Ladino
  {
    index: "thief",
    name: "Ladrão",
    class: { index: "rogue", name: "Ladino", url: "/api/classes/rogue" },
    desc: "Você aprimora suas habilidades nas artes ladinas.",
    subclass_flavor: "Ladrões são especialistas em infiltração e roubo.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "fast-hands", name: "Mãos Rápidas", url: "" },
          { index: "second-story-work", name: "Trabalho de Segundo Andar", url: "" }
        ]
      }
    ],
    url: "/api/subclasses/thief",
  },
  {
    index: "assassin",
    name: "Assassino",
    class: { index: "rogue", name: "Ladino", url: "/api/classes/rogue" },
    desc: "Você se foca na arte do assassinato.",
    subclass_flavor: "Assassinos são mestres da morte rápida e silenciosa.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "bonus-proficiencies", name: "Proficiências Adicionais", url: "" },
          { index: "assassinate", name: "Assassinar", url: "" }
        ]
      }
    ],
    url: "/api/subclasses/assassin",
  },
  // Mago
  {
    index: "evocation",
    name: "Escola de Evocação",
    class: { index: "wizard", name: "Mago", url: "/api/classes/wizard" },
    desc: "Você foca no estudo da evocação.",
    subclass_flavor: "Evocadores são mestres da magia elemental.",
    subclass_levels: [
      {
        level: 2,
        features: [
          { index: "evocation-savant", name: "Especialista em Evocação", url: "" },
          { index: "sculpt-spells", name: "Esculpir Magias", url: "" }
        ]
      }
    ],
    url: "/api/subclasses/evocation",
  },
  {
    index: "abjuration",
    name: "Escola de Abjuração",
    class: { index: "wizard", name: "Mago", url: "/api/classes/wizard" },
    desc: "Você foca no estudo da abjuração.",
    subclass_flavor: "Abjuradores são mestres da magia protetiva.",
    subclass_levels: [
      {
        level: 2,
        features: [
          { index: "abjuration-savant", name: "Especialista em Abjuração", url: "" },
          { index: "arcane-ward", name: "Proteção Arcana", url: "" }
        ]
      }
    ],
    url: "/api/subclasses/abjuration",
  },
  // Bárbaro
  {
    index: "berserker",
    name: "Berserker",
    class: { index: "barbarian", name: "Bárbaro", url: "/api/classes/barbarian" },
    desc: "Para alguns bárbaros, a fúria é um meio para um fim - esse fim sendo a violência.",
    subclass_flavor: "Berserkers são guerreiros furiosos que entram em frenesi.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "frenzy", name: "Frenesi", url: "" }
        ]
      }
    ],
    url: "/api/subclasses/berserker",
  },
  // Feiticeiro
  {
    index: "draconic-bloodline",
    name: "Linhagem Dracônica",
    class: { index: "sorcerer", name: "Feiticeiro", url: "/api/classes/sorcerer" },
    desc: "Sua magia inata vem de magia dracônica misturada com seu sangue.",
    subclass_flavor: "Feiticeiros de linhagem dracônica possuem resistência e poder dos dragões.",
    subclass_levels: [
      {
        level: 1,
        features: [
          { index: "dragon-ancestor", name: "Ancestral Dragão", url: "" },
          { index: "draconic-resilience", name: "Resistência Dracônica", url: "" }
        ]
      }
    ],
    url: "/api/subclasses/draconic-bloodline",
  },
];