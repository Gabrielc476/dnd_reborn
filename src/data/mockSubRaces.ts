// ===========================
// MOCK SUBRACES DATA - COMPLETE SRD
// ===========================

import { DndSubrace } from "@/types/characterCreation";

export const mockSubraces: DndSubrace[] = [
  // ===========================
  // ELFOS SUBRACES
  // ===========================
  {
    index: "high-elf",
    name: "Alto Elfo",
    race: { index: "elf", name: "Elfo", url: "/api/races/elf" },
    desc: "Como um alto elfo, você tem uma mente aguçada e domina pelo menos o básico da magia. Em muitos mundos de D&D, existem dois tipos de altos elfos. Uns (que incluem os elfos cinzentos e elfos do vale de Greyhawk, os Silvanesti de Dragonlance e os elfos do sol de Forgotten Realms) são arrogantes e reclusos, acreditando que são superiores aos não-elfos e até mesmo outros elfos. Os outros (incluindo os altos elfos de Greyhawk, os Qualinesti de Dragonlance e os elfos da lua de Forgotten Realms) são mais comuns e amigáveis, e frequentemente encontrados entre humanos e outras raças.",
    ability_bonuses: [
      { ability_score: { index: "int", name: "Inteligência", url: "" }, bonus: 1 },
    ],
    starting_proficiencies: [
      { index: "longswords", name: "Espadas longas", url: "" },
      { index: "shortswords", name: "Espadas curtas", url: "" },
      { index: "shortbows", name: "Arcos curtos", url: "" },
      { index: "longbows", name: "Arcos longos", url: "" }
    ],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "elvish", name: "Élfico", url: "" }
    ],
    racial_traits: [
      { index: "elf-weapon-training", name: "Treinamento Élfico com Armas", url: "" },
      { index: "cantrip", name: "Truque", url: "" },
      { index: "extra-language", name: "Idioma Extra", url: "" }
    ],
    url: "/api/subraces/high-elf",
  },

  {
    index: "wood-elf",
    name: "Elfo da Floresta",
    race: { index: "elf", name: "Elfo", url: "/api/races/elf" },
    desc: "Como um elfo da floresta, você tem sentidos aguçados e intuição, e seus pés ligeiros o carregam rapidamente e furtivamente através de suas florestas nativas. Esta categoria inclui os elfos selvagens (grugach) de Greyhawk e os Kagonesti de Dragonlance, bem como as raças chamadas elfos da madeira em Greyhawk e elfos selvagens em Forgotten Realms. Na Forgotten Realms, os elfos da floresta (também chamados elfos selvagens, elfos verdes ou elfos da floresta) são reclusos e desconfiados dos não-elfos.",
    ability_bonuses: [
      { ability_score: { index: "wis", name: "Sabedoria", url: "" }, bonus: 1 },
    ],
    starting_proficiencies: [
      { index: "longswords", name: "Espadas longas", url: "" },
      { index: "shortswords", name: "Espadas curtas", url: "" },
      { index: "shortbows", name: "Arcos curtos", url: "" },
      { index: "longbows", name: "Arcos longos", url: "" }
    ],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "elvish", name: "Élfico", url: "" }
    ],
    racial_traits: [
      { index: "elf-weapon-training", name: "Treinamento Élfico com Armas", url: "" },
      { index: "fleet-of-foot", name: "Pés Ligeiros", url: "" },
      { index: "mask-of-the-wild", name: "Máscara da Natureza", url: "" }
    ],
    url: "/api/subraces/wood-elf",
  },

  {
    index: "dark-elf-drow",
    name: "Elfo Sombrio (Drow)",
    race: { index: "elf", name: "Elfo", url: "/api/races/elf" },
    desc: "Descendentes de uma subraça anterior de elfos de pele escura, os drow foram banidos da superfície do mundo por seguirem a deusa Lolth pelo caminho do mal e corrupção. Agora eles construíram sua própria civilização nas profundezas do Subterrâneo, padronizada no Caminho de Lolth. Também chamados elfos sombrios, os drow têm pele preta que se assemelha ao ônix polido e cabelos brancos ou amarelos claros. Eles comumente têm olhos muito pálidos (tão pálidos a ponto de serem confundidos com brancos) em tons de lilás, prata, rosa, vermelho e azul.",
    ability_bonuses: [
      { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 1 },
    ],
    starting_proficiencies: [
      { index: "rapiers", name: "Rapieiras", url: "" },
      { index: "shortswords", name: "Espadas curtas", url: "" },
      { index: "hand-crossbows", name: "Bestas de mão", url: "" }
    ],
    languages: [
      { index: "common", name: "Comum", url: "" },
      { index: "elvish", name: "Élfico", url: "" }
    ],
    racial_traits: [
      { index: "superior-darkvision", name: "Visão no Escuro Superior", url: "" },
      { index: "sunlight-sensitivity", name: "Sensibilidade à Luz Solar", url: "" },
      { index: "drow-weapon-training", name: "Treinamento Drow com Armas", url: "" },
      { index: "drow-magic", name: "Magia Drow", url: "" }
    ],
    url: "/api/subraces/dark-elf-drow",
  },

  // ===========================
  // ANÕES SUBRACES
  // ===========================
  {
    index: "hill-dwarf",
    name: "Anão da Colina",
    race: { index: "dwarf", name: "Anão", url: "/api/races/dwarf" },
    desc: "Como um anão da colina, você tem sentidos aguçados, intuição profunda e notável resistência. Os anões dourados de Dragonlance e os anões do escudo de Forgotten Realms são anões da colina, assim como os banidos Neidar e os degradados Klar de Dragonlance.",
    ability_bonuses: [
      { ability_score: { index: "wis", name: "Sabedoria", url: "" }, bonus: 1 },
    ],
    starting_proficiencies: [],
    languages: [],
    racial_traits: [
      { index: "dwarven-toughness", name: "Resistência Anã", url: "" }
    ],
    url: "/api/subraces/hill-dwarf",
  },

  {
    index: "mountain-dwarf",
    name: "Anão da Montanha",
    race: { index: "dwarf", name: "Anão", url: "/api/races/dwarf" },
    desc: "Como um anão da montanha, você é forte e resistente, acostumado a uma vida difícil em terreno acidentado. Você é provavelmente alto (para um anão) e tende a ter uma coloração mais clara. Os anões do escudo do norte de Forgotten Realms, bem como o clã governante Hylar e o clã nobre Daewar de Dragonlance, são anões da montanha.",
    ability_bonuses: [
      { ability_score: { index: "str", name: "Força", url: "" }, bonus: 2 },
    ],
    starting_proficiencies: [
      { index: "light-armor", name: "Armaduras leves", url: "" },
      { index: "medium-armor", name: "Armaduras médias", url: "" }
    ],
    languages: [],
    racial_traits: [
      { index: "armor-proficiency", name: "Proficiência em Armaduras", url: "" }
    ],
    url: "/api/subraces/mountain-dwarf",
  },

  // ===========================
  // HALFLINGS SUBRACES
  // ===========================
  {
    index: "lightfoot-halfling",
    name: "Halfling Pés Leves",
    race: { index: "halfling", name: "Halfling", url: "/api/races/halfling" },
    desc: "Como um halfling pés leves, você pode facilmente se esconder das atenções, até mesmo usando outras pessoas como cobertura. Você é inclinado a ser afável e se dar bem com outros. Nos Forgotten Realms, os pés leves são a variedade mais comum de halflings. Os pés leves são mais propensos ao desejo de viajar do que os outros halflings, e frequentemente vivem ao lado de outras raças ou assumem uma vida nômade.",
    ability_bonuses: [
      { ability_score: { index: "cha", name: "Carisma", url: "" }, bonus: 1 },
    ],
    starting_proficiencies: [],
    languages: [],
    racial_traits: [
      { index: "naturally-stealthy", name: "Furtividade Natural", url: "" }
    ],
    url: "/api/subraces/lightfoot-halfling",
  },

  {
    index: "stout-halfling",
    name: "Halfling Robusto",
    race: { index: "halfling", name: "Halfling", url: "/api/races/halfling" },
    desc: "Como um halfling robusto, você é mais resistente que a média e tem alguma resistência a veneno. Alguns dizem que os robustos têm sangue anão. Nos Forgotten Realms, esses halflings são chamados corações fortes, e são mais comuns no sul.",
    ability_bonuses: [
      { ability_score: { index: "con", name: "Constituição", url: "" }, bonus: 1 },
    ],
    starting_proficiencies: [],
    languages: [],
    racial_traits: [
      { index: "stout-resilience", name: "Resistência Robusta", url: "" }
    ],
    url: "/api/subraces/stout-halfling",
  },

  // ===========================
  // GNOMOS SUBRACES
  // ===========================
  {
    index: "forest-gnome",
    name: "Gnomo da Floresta",
    race: { index: "gnome", name: "Gnomo", url: "/api/races/gnome" },
    desc: "Como um gnomo da floresta, você tem um instinto natural para ilusão e habilidade inerente com feras e criaturas feéricas. Os gnomos da floresta tendem a ser raros e reservados. Eles se reúnem em comunidades ocultas nas florestas, usando ilusões e pegadinhas para se esconder de ameaças ou para se esconder dos intrusos. Os gnomos da floresta tendem a ser amigáveis com outros habitantes bondosos da floresta, e eles consideram elfos e feéricos bondosos como seus aliados mais importantes.",
    ability_bonuses: [
      { ability_score: { index: "dex", name: "Destreza", url: "" }, bonus: 1 },
    ],
    starting_proficiencies: [],
    languages: [],
    racial_traits: [
      { index: "natural-illusionist", name: "Ilusionista Natural", url: "" },
      { index: "speak-with-small-beasts", name: "Falar com Pequenas Feras", url: "" }
    ],
    url: "/api/subraces/forest-gnome",
  },

  {
    index: "rock-gnome",
    name: "Gnomo da Rocha",
    race: { index: "gnome", name: "Gnomo", url: "/api/races/gnome" },
    desc: "Como um gnomo da rocha, você tem uma inventividade natural e resistência mais além da de outros gnomos. A maioria dos gnomos nos mundos de D&D são gnomos da rocha, incluindo os gnomos tinker de Dragonlance.",
    ability_bonuses: [
      { ability_score: { index: "con", name: "Constituição", url: "" }, bonus: 1 },
    ],
    starting_proficiencies: [
      { index: "tinkers-tools", name: "Ferramentas de Funileiro", url: "" }
    ],
    languages: [],
    racial_traits: [
      { index: "artificers-lore", name: "Conhecimento de Artífice", url: "" },
      { index: "tinker", name: "Funileiro", url: "" }
    ],
    url: "/api/subraces/rock-gnome",
  },
];