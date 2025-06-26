// ===========================
// MOCK SUBCLASSES DATA - COMPLETE SRD
// ===========================

import { DndSubclass } from "@/types/characterCreation";

export const mockSubclasses: DndSubclass[] = [
  // ===========================
  // BÁRBARO SUBCLASSES
  // ===========================
  {
    index: "berserker",
    name: "Caminho do Berserker",
    class: { index: "barbarian", name: "Bárbaro", url: "/api/classes/barbarian" },
    desc: ["Para alguns bárbaros, a raiva é um meio para um fim – esse fim sendo a violência. O Caminho do Berserker é um caminho de fúria desenfreada, escorrendo sangue."],
    subclass_flavor: "Quando você entra na sua fúria em batalha, você se desloca em direção a um berserker, e o caos reina.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "frenzy", name: "Frenesi", url: "/api/features/frenzy" }
        ]
      },
      {
        level: 6,
        features: [
          { index: "mindless-rage", name: "Fúria Irracional", url: "/api/features/mindless-rage" }
        ]
      },
      {
        level: 10,
        features: [
          { index: "intimidating-presence", name: "Presença Intimidante", url: "/api/features/intimidating-presence" }
        ]
      },
      {
        level: 14,
        features: [
          { index: "retaliation", name: "Retaliação", url: "/api/features/retaliation" }
        ]
      }
    ],
    url: "/api/subclasses/berserker",
  },

  // ===========================
  // BARDO SUBCLASSES
  // ===========================
  {
    index: "college-of-lore",
    name: "Colégio do Conhecimento",
    class: { index: "bard", name: "Bardo", url: "/api/classes/bard" },
    desc: ["Os bardos do Colégio do Conhecimento sabem um pouco sobre tudo, coletando pedaços de conhecimento de fontes tão diversas quanto tomos acadêmicos e contos de camponeses."],
    subclass_flavor: "Seja cantando baladas populares em tavernas ou composições elaboradas em cortes reais, esses bardos usam suas dádivas para manter as audiências cativadas.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "bonus-proficiencies", name: "Proficiências Adicionais", url: "/api/features/bonus-proficiencies" },
          { index: "cutting-words", name: "Palavras Cortantes", url: "/api/features/cutting-words" }
        ]
      },
      {
        level: 6,
        features: [
          { index: "additional-magical-secrets", name: "Segredos Mágicos Adicionais", url: "/api/features/additional-magical-secrets" }
        ]
      },
      {
        level: 14,
        features: [
          { index: "peerless-skill", name: "Perícia Inigualável", url: "/api/features/peerless-skill" }
        ]
      }
    ],
    url: "/api/subclasses/college-of-lore",
  },

  {
    index: "college-of-valor",
    name: "Colégio da Bravura",
    class: { index: "bard", name: "Bardo", url: "/api/classes/bard" },
    desc: ["Os bardos do Colégio da Bravura são audaciosos contadores de histórias cujos contos mantêm viva a memória dos grandes heróis do passado."],
    subclass_flavor: "Esses bardos se reúnem em halls de hidromel ou ao redor de grandes fogueiras para cantar as façanhas dos poderosos, tanto do passado quanto do presente.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "bonus-proficiencies-valor", name: "Proficiências Adicionais", url: "/api/features/bonus-proficiencies-valor" },
          { index: "combat-inspiration", name: "Inspiração em Combate", url: "/api/features/combat-inspiration" }
        ]
      },
      {
        level: 6,
        features: [
          { index: "extra-attack", name: "Ataque Extra", url: "/api/features/extra-attack" }
        ]
      },
      {
        level: 14,
        features: [
          { index: "combat-inspiration-improved", name: "Inspiração em Combate (Aprimorada)", url: "/api/features/combat-inspiration-improved" }
        ]
      }
    ],
    url: "/api/subclasses/college-of-valor",
  },

  // ===========================
  // CLÉRICO SUBCLASSES
  // ===========================
  {
    index: "life-domain",
    name: "Domínio da Vida",
    class: { index: "cleric", name: "Clérico", url: "/api/classes/cleric" },
    desc: ["O domínio da Vida se concentra na energia positiva vibrante – uma das forças fundamentais do universo – que sustenta toda a vida."],
    subclass_flavor: "Os deuses da vida promovem vitalidade e saúde através da cura dos doentes e feridos, cuidando dos necessitados e afastando as forças da morte e mortos-vivos.",
    subclass_levels: [
      {
        level: 1,
        features: [
          { index: "bonus-proficiency-life", name: "Proficiência Adicional", url: "/api/features/bonus-proficiency-life" },
          { index: "disciple-of-life", name: "Discípulo da Vida", url: "/api/features/disciple-of-life" }
        ]
      },
      {
        level: 2,
        features: [
          { index: "channel-divinity-preserve-life", name: "Canalizar Divindade: Preservar Vida", url: "/api/features/channel-divinity-preserve-life" }
        ]
      },
      {
        level: 6,
        features: [
          { index: "blessed-healer", name: "Curandeiro Abençoado", url: "/api/features/blessed-healer" }
        ]
      },
      {
        level: 8,
        features: [
          { index: "divine-strike", name: "Golpe Divino", url: "/api/features/divine-strike" }
        ]
      },
      {
        level: 17,
        features: [
          { index: "supreme-healing", name: "Cura Suprema", url: "/api/features/supreme-healing" }
        ]
      }
    ],
    spells: [
      {
        level: 1,
        spells: [
          { index: "bless", name: "Bênção", url: "/api/spells/bless" },
          { index: "cure-wounds", name: "Curar Ferimentos", url: "/api/spells/cure-wounds" }
        ]
      },
      {
        level: 3,
        spells: [
          { index: "lesser-restoration", name: "Restauração Menor", url: "/api/spells/lesser-restoration" },
          { index: "spiritual-weapon", name: "Arma Espiritual", url: "/api/spells/spiritual-weapon" }
        ]
      },
      {
        level: 5,
        spells: [
          { index: "beacon-of-hope", name: "Sinal de Esperança", url: "/api/spells/beacon-of-hope" },
          { index: "revivify", name: "Revivificar", url: "/api/spells/revivify" }
        ]
      },
      {
        level: 7,
        spells: [
          { index: "death-ward", name: "Proteção contra a Morte", url: "/api/spells/death-ward" },
          { index: "guardian-of-faith", name: "Guardião da Fé", url: "/api/spells/guardian-of-faith" }
        ]
      },
      {
        level: 9,
        spells: [
          { index: "mass-cure-wounds", name: "Curar Ferimentos em Massa", url: "/api/spells/mass-cure-wounds" },
          { index: "raise-dead", name: "Levantar Morto", url: "/api/spells/raise-dead" }
        ]
      }
    ],
    url: "/api/subclasses/life-domain",
  },

  {
    index: "light-domain",
    name: "Domínio da Luz",
    class: { index: "cleric", name: "Clérico", url: "/api/classes/cleric" },
    desc: ["Deuses da luz – incluindo Helm, Lathander, Pholtus, Branchala, a Chama Prateada, Belenus, Apolo e Re-Horakhty – promovem os ideais de renascimento e renovação, verdade, vigilância e beleza."],
    subclass_flavor: "Alguns desses deuses são retratados como o próprio sol ou como um cocheiro que guia o sol pelo céu. Outros são sentinelas incansáveis cujos olhos perfuram toda sombra e veem através de todo engano.",
    subclass_levels: [
      {
        level: 1,
        features: [
          { index: "bonus-cantrip-light", name: "Truque Adicional", url: "/api/features/bonus-cantrip-light" },
          { index: "warding-flare", name: "Clarão Protetor", url: "/api/features/warding-flare" }
        ]
      },
      {
        level: 2,
        features: [
          { index: "channel-divinity-radiance-of-dawn", name: "Canalizar Divindade: Radiância do Amanhecer", url: "/api/features/channel-divinity-radiance-of-dawn" }
        ]
      },
      {
        level: 6,
        features: [
          { index: "improved-flare", name: "Clarão Aprimorado", url: "/api/features/improved-flare" }
        ]
      },
      {
        level: 8,
        features: [
          { index: "potent-spellcasting", name: "Conjuração Potente", url: "/api/features/potent-spellcasting" }
        ]
      },
      {
        level: 17,
        features: [
          { index: "corona-of-light", name: "Coroa de Luz", url: "/api/features/corona-of-light" }
        ]
      }
    ],
    spells: [
      {
        level: 1,
        spells: [
          { index: "burning-hands", name: "Mãos Flamejantes", url: "/api/spells/burning-hands" },
          { index: "faerie-fire", name: "Fogo das Fadas", url: "/api/spells/faerie-fire" }
        ]
      },
      {
        level: 3,
        spells: [
          { index: "flaming-sphere", name: "Esfera Flamejante", url: "/api/spells/flaming-sphere" },
          { index: "scorching-ray", name: "Raio Ardente", url: "/api/spells/scorching-ray" }
        ]
      },
      {
        level: 5,
        spells: [
          { index: "daylight", name: "Luz do Dia", url: "/api/spells/daylight" },
          { index: "fireball", name: "Bola de Fogo", url: "/api/spells/fireball" }
        ]
      },
      {
        level: 7,
        spells: [
          { index: "guardian-of-faith", name: "Guardião da Fé", url: "/api/spells/guardian-of-faith" },
          { index: "wall-of-fire", name: "Muralha de Fogo", url: "/api/spells/wall-of-fire" }
        ]
      },
      {
        level: 9,
        spells: [
          { index: "flame-strike", name: "Coluna de Chamas", url: "/api/spells/flame-strike" },
          { index: "scrying", name: "Vidência", url: "/api/spells/scrying" }
        ]
      }
    ],
    url: "/api/subclasses/light-domain",
  },

  // ===========================
  // DRUIDA SUBCLASSES
  // ===========================
  {
    index: "circle-of-the-land",
    name: "Círculo da Terra",
    class: { index: "druid", name: "Druida", url: "/api/classes/druid" },
    desc: ["O Círculo da Terra é composto de místicos e sábios que salvaguardam o conhecimento antigo e ritos através de uma vasta tradição oral."],
    subclass_flavor: "Esses druidas se encontram em círculos de árvores sagradas ou pedras eretas para sussurrar segredos primordiais em Druídico.",
    subclass_levels: [
      {
        level: 2,
        features: [
          { index: "bonus-cantrip-land", name: "Truque Adicional", url: "/api/features/bonus-cantrip-land" },
          { index: "natural-recovery", name: "Recuperação Natural", url: "/api/features/natural-recovery" }
        ]
      },
      {
        level: 3,
        features: [
          { index: "circle-spells", name: "Magias do Círculo", url: "/api/features/circle-spells" }
        ]
      },
      {
        level: 6,
        features: [
          { index: "lands-stride", name: "Passos da Terra", url: "/api/features/lands-stride" }
        ]
      },
      {
        level: 10,
        features: [
          { index: "natures-ward", name: "Proteção da Natureza", url: "/api/features/natures-ward" }
        ]
      },
      {
        level: 14,
        features: [
          { index: "natures-sanctuary", name: "Santuário da Natureza", url: "/api/features/natures-sanctuary" }
        ]
      }
    ],
    url: "/api/subclasses/circle-of-the-land",
  },

  {
    index: "circle-of-the-moon",
    name: "Círculo da Lua",
    class: { index: "druid", name: "Druida", url: "/api/classes/druid" },
    desc: ["Os druidas do Círculo da Lua são ferozes guardiões da natureza selvagem. Sua ordem se reúne sob a lua cheia para compartilhar notícias e trocar avisos."],
    subclass_flavor: "Eles assombram as regiões selvagens mais profundas, onde podem ficar semanas sem encontrar outro humanoide, muito menos outro druida.",
    subclass_levels: [
      {
        level: 2,
        features: [
          { index: "combat-wild-shape", name: "Forma Selvagem de Combate", url: "/api/features/combat-wild-shape" },
          { index: "circle-forms", name: "Formas do Círculo", url: "/api/features/circle-forms" }
        ]
      },
      {
        level: 4,
        features: [
          { index: "primal-strike", name: "Ataque Primitivo", url: "/api/features/primal-strike" }
        ]
      },
      {
        level: 6,
        features: [
          { index: "elemental-wild-shape", name: "Forma Selvagem Elemental", url: "/api/features/elemental-wild-shape" }
        ]
      },
      {
        level: 10,
        features: [
          { index: "thousand-forms", name: "Mil Formas", url: "/api/features/thousand-forms" }
        ]
      }
    ],
    url: "/api/subclasses/circle-of-the-moon",
  },

  // ===========================
  // GUERREIRO SUBCLASSES
  // ===========================
  {
    index: "champion",
    name: "Campeão",
    class: { index: "fighter", name: "Guerreiro", url: "/api/classes/fighter" },
    desc: ["O arquétipo do Campeão foca na excelência física pura. Aqueles que seguem esse arquétipo combinam treinamento rigoroso com excelência física para produzir feitos marciais devastadores."],
    subclass_flavor: "Campeões combinam treinamento rigoroso com excelência física para atingir feitos de guerra devastadores.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "improved-critical", name: "Crítico Aprimorado", url: "/api/features/improved-critical" }
        ]
      },
      {
        level: 7,
        features: [
          { index: "remarkable-athlete", name: "Atleta Notável", url: "/api/features/remarkable-athlete" }
        ]
      },
      {
        level: 10,
        features: [
          { index: "additional-fighting-style", name: "Estilo de Luta Adicional", url: "/api/features/additional-fighting-style" }
        ]
      },
      {
        level: 15,
        features: [
          { index: "superior-critical", name: "Crítico Superior", url: "/api/features/superior-critical" }
        ]
      },
      {
        level: 18,
        features: [
          { index: "survivor", name: "Sobrevivente", url: "/api/features/survivor" }
        ]
      }
    ],
    url: "/api/subclasses/champion",
  },

  {
    index: "battle-master",
    name: "Mestre de Batalha",
    class: { index: "fighter", name: "Guerreiro", url: "/api/classes/fighter" },
    desc: ["Aqueles que emulam o arquétipo do Mestre de Batalha empregam técnicas marciais passadas através de gerações. Para um mestre de batalha, o combate é um campo acadêmico."],
    subclass_flavor: "Para um mestre de batalha, o combate é um campo acadêmico, algumas vezes incluindo temas além da batalha como metalurgia, caligrafia e carpintaria.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "combat-superiority", name: "Superioridade em Combate", url: "/api/features/combat-superiority" },
          { index: "maneuvers", name: "Manobras", url: "/api/features/maneuvers" },
          { index: "student-of-war", name: "Estudante da Guerra", url: "/api/features/student-of-war" }
        ]
      },
      {
        level: 7,
        features: [
          { index: "know-your-enemy", name: "Conheça Seu Inimigo", url: "/api/features/know-your-enemy" }
        ]
      },
      {
        level: 10,
        features: [
          { index: "improved-combat-superiority", name: "Superioridade em Combate Aprimorada", url: "/api/features/improved-combat-superiority" }
        ]
      },
      {
        level: 15,
        features: [
          { index: "relentless", name: "Implacável", url: "/api/features/relentless" }
        ]
      },
      {
        level: 18,
        features: [
          { index: "ultimate-combat-superiority", name: "Superioridade em Combate Suprema", url: "/api/features/ultimate-combat-superiority" }
        ]
      }
    ],
    url: "/api/subclasses/battle-master",
  },

  {
    index: "eldritch-knight",
    name: "Cavaleiro Élfico",
    class: { index: "fighter", name: "Guerreiro", url: "/api/classes/fighter" },
    desc: ["O arquétipo de Cavaleiro Élfico combina a maestria marcial comum a todos os guerreiros com um estudo cuidadoso da magia."],
    subclass_flavor: "Cavaleiros Élficos usam técnicas mágicas similares àquelas praticadas por magos. Eles focam seu estudo em duas das oito escolas de magia: abjuração e evocação.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "spellcasting-ek", name: "Conjuração", url: "/api/features/spellcasting-ek" },
          { index: "weapon-bond", name: "Ligação com Arma", url: "/api/features/weapon-bond" }
        ]
      },
      {
        level: 7,
        features: [
          { index: "war-magic", name: "Magia de Guerra", url: "/api/features/war-magic" }
        ]
      },
      {
        level: 10,
        features: [
          { index: "eldritch-strike", name: "Golpe Élfico", url: "/api/features/eldritch-strike" }
        ]
      },
      {
        level: 15,
        features: [
          { index: "arcane-charge", name: "Investida Arcana", url: "/api/features/arcane-charge" }
        ]
      },
      {
        level: 18,
        features: [
          { index: "improved-war-magic", name: "Magia de Guerra Aprimorada", url: "/api/features/improved-war-magic" }
        ]
      }
    ],
    url: "/api/subclasses/eldritch-knight",
  },

  // ===========================
  // MONGE SUBCLASSES
  // ===========================
  {
    index: "way-of-the-open-hand",
    name: "Caminho da Mão Aberta",
    class: { index: "monk", name: "Monge", url: "/api/classes/monk" },
    desc: ["Os monges do Caminho da Mão Aberta são os mestres supremos das artes de combate marcial, armados e desarmados."],
    subclass_flavor: "Eles aprendem técnicas para empurrar e derrubar seus oponentes, manipular ki para curar danos em seus corpos e praticar meditação avançada que pode protegê-los de dano.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "open-hand-technique", name: "Técnica da Mão Aberta", url: "/api/features/open-hand-technique" }
        ]
      },
      {
        level: 6,
        features: [
          { index: "wholeness-of-body", name: "Plenitude do Corpo", url: "/api/features/wholeness-of-body" }
        ]
      },
      {
        level: 11,
        features: [
          { index: "tranquility", name: "Tranquilidade", url: "/api/features/tranquility" }
        ]
      },
      {
        level: 17,
        features: [
          { index: "quivering-palm", name: "Palma Vibrante", url: "/api/features/quivering-palm" }
        ]
      }
    ],
    url: "/api/subclasses/way-of-the-open-hand",
  },

  // ===========================
  // PALADINO SUBCLASSES
  // ===========================
  {
    index: "oath-of-devotion",
    name: "Juramento da Devoção",
    class: { index: "paladin", name: "Paladino", url: "/api/classes/paladin" },
    desc: ["O Juramento da Devoção vincula um paladino aos mais altos ideais de justiça, virtude e ordem."],
    subclass_flavor: "Às vezes chamados cavaleiros, cavaleiros brancos ou guerreiros sagrados, esses paladinos atendem ao ideal do cavaleiro em armadura brilhante.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "channel-divinity-devotion", name: "Canalizar Divindade", url: "/api/features/channel-divinity-devotion" }
        ]
      },
      {
        level: 7,
        features: [
          { index: "aura-of-devotion", name: "Aura da Devoção", url: "/api/features/aura-of-devotion" }
        ]
      },
      {
        level: 15,
        features: [
          { index: "purity-of-spirit", name: "Pureza de Espírito", url: "/api/features/purity-of-spirit" }
        ]
      },
      {
        level: 20,
        features: [
          { index: "holy-nimbus", name: "Nimbo Sagrado", url: "/api/features/holy-nimbus" }
        ]
      }
    ],
    spells: [
      {
        level: 3,
        spells: [
          { index: "protection-from-evil-and-good", name: "Proteção contra o Bem e Mal", url: "/api/spells/protection-from-evil-and-good" },
          { index: "sanctuary", name: "Santuário", url: "/api/spells/sanctuary" }
        ]
      },
      {
        level: 5,
        spells: [
          { index: "lesser-restoration", name: "Restauração Menor", url: "/api/spells/lesser-restoration" },
          { index: "zone-of-truth", name: "Zona da Verdade", url: "/api/spells/zone-of-truth" }
        ]
      },
      {
        level: 9,
        spells: [
          { index: "beacon-of-hope", name: "Sinal de Esperança", url: "/api/spells/beacon-of-hope" },
          { index: "dispel-magic", name: "Dissipar Magia", url: "/api/spells/dispel-magic" }
        ]
      },
      {
        level: 13,
        spells: [
          { index: "freedom-of-movement", name: "Liberdade de Movimento", url: "/api/spells/freedom-of-movement" },
          { index: "guardian-of-faith", name: "Guardião da Fé", url: "/api/spells/guardian-of-faith" }
        ]
      },
      {
        level: 17,
        spells: [
          { index: "commune", name: "Comunhão", url: "/api/spells/commune" },
          { index: "flame-strike", name: "Coluna de Chamas", url: "/api/spells/flame-strike" }
        ]
      }
    ],
    url: "/api/subclasses/oath-of-devotion",
  },

  // ===========================
  // PATRULHEIRO SUBCLASSES
  // ===========================
  {
    index: "beast-master",
    name: "Mestre das Feras",
    class: { index: "ranger", name: "Patrulheiro", url: "/api/classes/ranger" },
    desc: ["O arquétipo de Mestre das Feras incorpora uma amizade entre a raça civilizada e as feras do mundo."],
    subclass_flavor: "Unidos em foco, fera e patrulheiro trabalham como um para lutar contra os monstros ameaçadores que ameaçam a civilização e a natureza.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "rangers-companion", name: "Companheiro do Patrulheiro", url: "/api/features/rangers-companion" }
        ]
      },
      {
        level: 7,
        features: [
          { index: "exceptional-training", name: "Treinamento Excepcional", url: "/api/features/exceptional-training" }
        ]
      },
      {
        level: 11,
        features: [
          { index: "bestial-fury", name: "Fúria Bestial", url: "/api/features/bestial-fury" }
        ]
      },
      {
        level: 15,
        features: [
          { index: "share-spells", name: "Compartilhar Magias", url: "/api/features/share-spells" }
        ]
      }
    ],
    url: "/api/subclasses/beast-master",
  },

  {
    index: "hunter",
    name: "Caçador",
    class: { index: "ranger", name: "Patrulheiro", url: "/api/classes/ranger" },
    desc: ["Guerreiros da natureza, os patrulheiros se especializam em caçar os monstros que ameaçam as bordas da civilização."],
    subclass_flavor: "O arquétipo de Caçador refina suas habilidades para desenvolver uma especialização mortal.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "hunters-prey", name: "Presa do Caçador", url: "/api/features/hunters-prey" }
        ]
      },
      {
        level: 7,
        features: [
          { index: "defensive-tactics", name: "Táticas Defensivas", url: "/api/features/defensive-tactics" }
        ]
      },
      {
        level: 11,
        features: [
          { index: "multiattack", name: "Ataque Múltiplo", url: "/api/features/multiattack" }
        ]
      },
      {
        level: 15,
        features: [
          { index: "superior-hunters-defense", name: "Defesa Superior do Caçador", url: "/api/features/superior-hunters-defense" }
        ]
      }
    ],
    url: "/api/subclasses/hunter",
  },

  // ===========================
  // LADINO SUBCLASSES
  // ===========================
  {
    index: "thief",
    name: "Ladino",
    class: { index: "rogue", name: "Ladino", url: "/api/classes/rogue" },
    desc: ["Você aprimora suas habilidades nas artes ladinas. Ladrões, bandidos, batedores de carteira e outros criminosos tipicamente seguem esse arquétipo."],
    subclass_flavor: "Mas também o fazem patrulheiros dispostos a explorar ruínas antigas perigosas, membros de sociedades secretas e investigadores privados.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "fast-hands", name: "Mãos Rápidas", url: "/api/features/fast-hands" },
          { index: "second-story-work", name: "Trabalho de Segundo Andar", url: "/api/features/second-story-work" }
        ]
      },
      {
        level: 9,
        features: [
          { index: "supreme-sneak", name: "Furtividade Suprema", url: "/api/features/supreme-sneak" }
        ]
      },
      {
        level: 13,
        features: [
          { index: "use-magic-device", name: "Usar Dispositivo Mágico", url: "/api/features/use-magic-device" }
        ]
      },
      {
        level: 17,
        features: [
          { index: "thiefs-reflexes", name: "Reflexos de Ladrão", url: "/api/features/thiefs-reflexes" }
        ]
      }
    ],
    url: "/api/subclasses/thief",
  },

  {
    index: "assassin",
    name: "Assassino",
    class: { index: "rogue", name: "Ladino", url: "/api/classes/rogue" },
    desc: ["Você se foca na arte do assassinato. Aqueles que aderem a esse arquétipo são assassinos profissionais, espiões, caçadores de recompensas e outros que dependem de furtividade, veneno e disfarces."],
    subclass_flavor: "Nem todos os assassinos são assassinos sem alma. Muitos são apenas profissionais que fazem um trabalho que outros não podem ou não farão.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "bonus-proficiencies-assassin", name: "Proficiências Adicionais", url: "/api/features/bonus-proficiencies-assassin" },
          { index: "assassinate", name: "Assassinar", url: "/api/features/assassinate" }
        ]
      },
      {
        level: 9,
        features: [
          { index: "infiltration-expertise", name: "Especialização em Infiltração", url: "/api/features/infiltration-expertise" }
        ]
      },
      {
        level: 13,
        features: [
          { index: "impostor", name: "Impostor", url: "/api/features/impostor" }
        ]
      },
      {
        level: 17,
        features: [
          { index: "death-strike", name: "Golpe Mortal", url: "/api/features/death-strike" }
        ]
      }
    ],
    url: "/api/subclasses/assassin",
  },

  {
    index: "arcane-trickster",
    name: "Trapaceiro Arcano",
    class: { index: "rogue", name: "Ladino", url: "/api/classes/rogue" },
    desc: ["Alguns ladinos aprimoram suas habilidades furtivas com magia, aprendendo truques de encantamento e ilusão."],
    subclass_flavor: "Esses ladinos incluem batedores de carteira e assaltantes, mas também brincalhões, travessos e um número significativo de aventureiros.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { index: "spellcasting-at", name: "Conjuração", url: "/api/features/spellcasting-at" },
          { index: "mage-hand-legerdemain", name: "Prestidigitação de Mão de Mago", url: "/api/features/mage-hand-legerdemain" }
        ]
      },
      {
        level: 9,
        features: [
          { index: "magical-ambush", name: "Emboscada Mágica", url: "/api/features/magical-ambush" }
        ]
      },
      {
        level: 13,
        features: [
          { index: "versatile-trickster", name: "Trapaceiro Versátil", url: "/api/features/versatile-trickster" }
        ]
      },
      {
        level: 17,
        features: [
          { index: "spell-thief", name: "Ladrão de Magias", url: "/api/features/spell-thief" }
        ]
      }
    ],
    url: "/api/subclasses/arcane-trickster",
  },

  // ===========================
  // FEITICEIRO SUBCLASSES
  // ===========================
  {
    index: "draconic-bloodline",
    name: "Linhagem Dracônica",
    class: { index: "sorcerer", name: "Feiticeiro", url: "/api/classes/sorcerer" },
    desc: ["Sua magia inata vem do poder dracônico que foi misturado ao seu sangue ou ao de seus ancestrais."],
    subclass_flavor: "Mais frequentemente, feiticeiros com essa origem traçam sua descendência de volta para um poderoso feiticeiro dos tempos antigos que fez um acordo com um dragão ou que pode até mesmo ter tido um pai dragão.",
    subclass_levels: [
      {
        level: 1,
        features: [
          { index: "dragon-ancestor", name: "Ancestral Dracônico", url: "/api/features/dragon-ancestor" },
          { index: "draconic-resilience", name: "Resistência Dracônica", url: "/api/features/draconic-resilience" }
        ]
      },
      {
        level: 6,
        features: [
          { index: "elemental-affinity", name: "Afinidade Elemental", url: "/api/features/elemental-affinity" }
        ]
      },
      {
        level: 14,
        features: [
          { index: "dragon-wings", name: "Asas de Dragão", url: "/api/features/dragon-wings" }
        ]
      },
      {
        level: 18,
        features: [
          { index: "draconic-presence", name: "Presença Dracônica", url: "/api/features/draconic-presence" }
        ]
      }
    ],
    url: "/api/subclasses/draconic-bloodline",
  },

  {
    index: "wild-magic",
    name: "Magia Selvagem",
    class: { index: "sorcerer", name: "Feiticeiro", url: "/api/classes/sorcerer" },
    desc: ["Sua magia inata vem das forças selvagens do caos que subjazem a ordem da criação."],
    subclass_flavor: "Você pode ter sofrido exposição a alguma forma de magia bruta, talvez através de um portal planar liderando ao Limbo, os Planos Elementais ou os distantes Reinos Feéricos.",
    subclass_levels: [
      {
        level: 1,
        features: [
          { index: "wild-magic-surge", name: "Surto de Magia Selvagem", url: "/api/features/wild-magic-surge" },
          { index: "tides-of-chaos", name: "Marés do Caos", url: "/api/features/tides-of-chaos" }
        ]
      },
      {
        level: 6,
        features: [
          { index: "bend-luck", name: "Dobrar a Sorte", url: "/api/features/bend-luck" }
        ]
      },
      {
        level: 14,
        features: [
          { index: "controlled-chaos", name: "Caos Controlado", url: "/api/features/controlled-chaos" }
        ]
      },
      {
        level: 18,
        features: [
          { index: "spell-bombardment", name: "Bombardeio de Magias", url: "/api/features/spell-bombardment" }
        ]
      }
    ],
    url: "/api/subclasses/wild-magic",
  },

  // ===========================
  // BRUXO SUBCLASSES
  // ===========================
  {
    index: "the-fiend",
    name: "O Corruptor",
    class: { index: "warlock", name: "Bruxo", url: "/api/classes/warlock" },
    desc: ["Você fez um pacto com um corruptor dos planos inferiores de existência, um ser cujos objetivos são o mal, mesmo se você lutar contra esses objetivos."],
    subclass_flavor: "Tais seres desejam a corrupção ou destruição de todas as coisas, em última análise incluindo você.",
    subclass_levels: [
      {
        level: 1,
        features: [
          { index: "dark-ones-blessing", name: "Bênção do Sombrio", url: "/api/features/dark-ones-blessing" }
        ]
      },
      {
        level: 6,
        features: [
          { index: "dark-ones-own-luck", name: "Sorte do Sombrio", url: "/api/features/dark-ones-own-luck" }
        ]
      },
      {
        level: 10,
        features: [
          { index: "fiendish-resilience", name: "Resistência Demoníaca", url: "/api/features/fiendish-resilience" }
        ]
      },
      {
        level: 14,
        features: [
          { index: "hurl-through-hell", name: "Arremessar através do Inferno", url: "/api/features/hurl-through-hell" }
        ]
      }
    ],
    spells: [
      {
        level: 1,
        spells: [
          { index: "burning-hands", name: "Mãos Flamejantes", url: "/api/spells/burning-hands" },
          { index: "command", name: "Comando", url: "/api/spells/command" }
        ]
      },
      {
        level: 3,
        spells: [
          { index: "blindness-deafness", name: "Cegueira/Surdez", url: "/api/spells/blindness-deafness" },
          { index: "scorching-ray", name: "Raio Ardente", url: "/api/spells/scorching-ray" }
        ]
      },
      {
        level: 5,
        spells: [
          { index: "fireball", name: "Bola de Fogo", url: "/api/spells/fireball" },
          { index: "stinking-cloud", name: "Nuvem Fedorenta", url: "/api/spells/stinking-cloud" }
        ]
      },
      {
        level: 7,
        spells: [
          { index: "fire-shield", name: "Escudo de Fogo", url: "/api/spells/fire-shield" },
          { index: "wall-of-fire", name: "Muralha de Fogo", url: "/api/spells/wall-of-fire" }
        ]
      },
      {
        level: 9,
        spells: [
          { index: "flame-strike", name: "Coluna de Chamas", url: "/api/spells/flame-strike" },
          { index: "hallow", name: "Consagrar", url: "/api/spells/hallow" }
        ]
      }
    ],
    url: "/api/subclasses/the-fiend",
  },

  // ===========================
  // MAGO SUBCLASSES
  // ===========================
  {
    index: "school-of-abjuration",
    name: "Escola de Abjuração",
    class: { index: "wizard", name: "Mago", url: "/api/classes/wizard" },
    desc: ["A Escola de Abjuração enfatiza magias que bloqueiam, banem ou protegem."],
    subclass_flavor: "Detratores dessa escola dizem que sua tradição é sobre negação, negação ao invés de afirmação positiva. Você entende, no entanto, que terminar efeitos prejudiciais, proteger os fracos e banir influências malignas é tudo menos uma vocação filosófica vazia.",
    subclass_levels: [
      {
        level: 2,
        features: [
          { index: "abjuration-savant", name: "Especialista em Abjuração", url: "/api/features/abjuration-savant" },
          { index: "arcane-ward", name: "Proteção Arcana", url: "/api/features/arcane-ward" }
        ]
      },
      {
        level: 6,
        features: [
          { index: "projected-ward", name: "Proteção Projetada", url: "/api/features/projected-ward" }
        ]
      },
      {
        level: 10,
        features: [
          { index: "improved-abjuration", name: "Abjuração Aprimorada", url: "/api/features/improved-abjuration" }
        ]
      },
      {
        level: 14,
        features: [
          { index: "spell-resistance", name: "Resistência a Magias", url: "/api/features/spell-resistance" }
        ]
      }
    ],
    url: "/api/subclasses/school-of-abjuration",
  },

  {
    index: "school-of-evocation",
    name: "Escola de Evocação",
    class: { index: "wizard", name: "Mago", url: "/api/classes/wizard" },
    desc: ["Você foca seu estudo em magia que cria efeitos elementais poderosos como frio cortante, chama abrasadora, trovão estrondoso, relâmpago crepitante e ácido ardente."],
    subclass_flavor: "Alguns evocadores encontram emprego em forças militares, servindo como artilharia para explodir fileiras inimigas de longe. Outros usam seu poder espetacular para proteger os fracos, enquanto alguns buscam seu próprio ganho como bandidos, aventureiros ou aspirantes a tiranos.",
    subclass_levels: [
      {
        level: 2,
        features: [
          { index: "evocation-savant", name: "Especialista em Evocação", url: "/api/features/evocation-savant" },
          { index: "sculpt-spells", name: "Esculpir Magias", url: "/api/features/sculpt-spells" }
        ]
      },
      {
        level: 6,
        features: [
          { index: "potent-cantrip", name: "Truque Potente", url: "/api/features/potent-cantrip" }
        ]
      },
      {
        level: 10,
        features: [
          { index: "empowered-evocation", name: "Evocação Fortalecida", url: "/api/features/empowered-evocation" }
        ]
      },
      {
        level: 14,
        features: [
          { index: "overchannel", name: "Sobrecanalizar", url: "/api/features/overchannel" }
        ]
      }
    ],
    url: "/api/subclasses/school-of-evocation",
  },
];