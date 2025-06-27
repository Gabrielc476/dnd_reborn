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
  {
  index: "totem-warrior",
  name: "Caminho do Guerreiro Totêmico",
  class: { index: "barbarian", name: "Bárbaro", url: "/api/classes/barbarian" },
  desc: [
    "O Caminho do Guerreiro Totêmico é uma jornada espiritual, pois o bárbaro aceita um espírito animal como guia, protetor e inspiração.",
    "Em batalha, seu espírito totêmico preenche você com força sobrenatural, adicionando combustível mágico à sua fúria bárbara."
  ],
  subclass_flavor: "A maioria das tribos bárbaras considera um espírito animal totêmico como parente de um clã particular. Em tais casos, é incomum para um indivíduo ter mais de um espírito animal totêmico, embora existam exceções.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "spirit-seeker", name: "Buscador de Espíritos", url: "/api/features/spirit-seeker" },
        { index: "totem-spirit", name: "Espírito Totêmico", url: "/api/features/totem-spirit" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "aspect-of-the-beast", name: "Aspecto da Fera", url: "/api/features/aspect-of-the-beast" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "spirit-walker", name: "Andarilho Espiritual", url: "/api/features/spirit-walker" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "totemic-attunement", name: "Sintonia Totêmica", url: "/api/features/totemic-attunement" }
      ]
    }
  ],
  url: "/api/subclasses/totem-warrior",
},

// ===========================
// 🎲 OPCIONAIS - SUBCLASSES ADICIONAIS (Tasha's Cauldron e Xanathar's Guide)
// ===========================
// Estas subclasses NÃO são do SRD básico, mas são muito populares:
// Você pode incluí-las se quiser expandir o conteúdo do seu projeto

{
  index: "wild-magic-barbarian",
  name: "Caminho da Magia Selvagem",
  class: { index: "barbarian", name: "Bárbaro", url: "/api/classes/barbarian" },
  desc: [
    "Muitas terras no multiverso abrigam sua própria forma de magia bárbara. Em reinos como o Feywild, ou em certas regiões da Shadowfell, a mágica se infiltra em tudo.",
    "Alguns bárbaros dessas terras desenvolvem uma relação primitiva com a magia que existe em sua terra natal, canalizando-a em seus ataques de fúria."
  ],
  subclass_flavor: "Esses bárbaros da magia selvagem encontram sua fúria infundida com magia primitiva, permitindo que conjurem feitiços e efeitos mágicos enquanto estão furiosos.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "magic-awareness", name: "Consciência Mágica", url: "/api/features/magic-awareness" },
        { index: "wild-surge", name: "Surto Selvagem", url: "/api/features/wild-surge" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "bolstering-magic", name: "Magia Fortalecedora", url: "/api/features/bolstering-magic" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "unstable-backlash", name: "Reação Instável", url: "/api/features/unstable-backlash" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "controlled-surge", name: "Surto Controlado", url: "/api/features/controlled-surge" }
      ]
    }
  ],
  url: "/api/subclasses/wild-magic-barbarian",
},

{
  index: "zealot",
  name: "Caminho do Zelote",
  class: { index: "barbarian", name: "Bárbaro", url: "/api/classes/barbarian" },
  desc: [
    "Alguns deuses enxergam os bárbaros como seus escolhidos, empregando esses guerreiros furiosos como instrumentos divinos para semear destruição.",
    "Esses bárbaros são conhecidos como zelotes, e veem sua fúria como uma benção divina - um estado de êxtase religioso que os conecta aos deuses."
  ],
  subclass_flavor: "Para um zelote, a batalha é um ato de devoção, uma oração violenta oferecida em honra aos deuses da guerra e da morte.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "divine-fury", name: "Fúria Divina", url: "/api/features/divine-fury" },
        { index: "warrior-of-the-gods", name: "Guerreiro dos Deuses", url: "/api/features/warrior-of-the-gods" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "fanatical-focus", name: "Foco Fanático", url: "/api/features/fanatical-focus" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "zealous-presence", name: "Presença Zelosa", url: "/api/features/zealous-presence" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "rage-beyond-death", name: "Fúria Além da Morte", url: "/api/features/rage-beyond-death" }
      ]
    }
  ],
  url: "/api/subclasses/zealot",
},

{
  index: "ancestral-guardian",
  name: "Caminho do Guardião Ancestral",
  class: { index: "barbarian", name: "Bárbaro", url: "/api/classes/barbarian" },
  desc: [
    "Alguns bárbaros são visitados pelos espíritos de ancestrais mortos que os guiam e protegem.",
    "Quando um bárbaro que segue esse caminho entra em fúria, o bárbaro faz contato com o mundo dos espíritos e convoca esses guardiões."
  ],
  subclass_flavor: "Os bárbaros que seguem o Caminho do Guardião Ancestral veem suas tradições como uma ligação vital com seu passado, honrando a memória daqueles que vieram antes.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "ancestral-protectors", name: "Protetores Ancestrais", url: "/api/features/ancestral-protectors" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "spirit-shield", name: "Escudo Espiritual", url: "/api/features/spirit-shield" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "consult-the-spirits", name: "Consultar os Espíritos", url: "/api/features/consult-the-spirits" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "vengeful-ancestors", name: "Ancestrais Vingativos", url: "/api/features/vengeful-ancestors" }
      ]
    }
  ],
  url: "/api/subclasses/ancestral-guardian",
},

  // ===========================
  // BARDO SUBCLASSES
  // ===========================
  

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

  // 🎭 SUBCLASSES DO XANATHAR'S GUIDE TO EVERYTHING:

{
  index: "college-of-glamour",
  name: "Colégio do Glamour",
  class: { index: "bard", name: "Bardo", url: "/api/classes/bard" },
  desc: [
    "O Colégio do Glamour é o lar de bardos que dominaram suas artes no reino vibrante das fadas ou sob a tutela de alguém que residiu lá.",
    "Instruídos por sátiros, eladrin e outras criaturas feéricas, esses bardos aprendem a usar sua magia para deleitar e cativar outros."
  ],
  subclass_flavor: "Os membros deste colégio são considerados cativantes e carismáticos, embora muitos também sejam considerados egocêntricos e perigosos.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "mantle-of-inspiration", name: "Manto da Inspiração", url: "/api/features/mantle-of-inspiration" },
        { index: "enthralling-performance", name: "Performance Cativante", url: "/api/features/enthralling-performance" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "extra-magical-secrets", name: "Segredos Mágicos Extras", url: "/api/features/extra-magical-secrets" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "unbreakable-majesty", name: "Majestade Inquebrantável", url: "/api/features/unbreakable-majesty" }
      ]
    }
  ],
  url: "/api/subclasses/college-of-glamour",
},

{
  index: "college-of-swords",
  name: "Colégio das Espadas",
  class: { index: "bard", name: "Bardo", url: "/api/classes/bard" },
  desc: [
    "Os bardos do Colégio das Espadas são chamados de lâminas, e entretêm através de façanhas de proeza marcial.",
    "As lâminas realizam acrobacias como engolir espadas, arremesso de punhais e exibições de esgrima."
  ],
  subclass_flavor: "Embora usem sua magia para criar efeitos extraordinários, uma lâmina verdadeira confia na sua arma tanto quanto na sua sagacidade.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "fighting-style-bard", name: "Estilo de Luta", url: "/api/features/fighting-style-bard" },
        { index: "blade-flourish", name: "Floreio de Lâmina", url: "/api/features/blade-flourish" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "extra-attack-bard", name: "Ataque Extra", url: "/api/features/extra-attack-bard" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "masters-flourish", name: "Floreio do Mestre", url: "/api/features/masters-flourish" }
      ]
    }
  ],
  url: "/api/subclasses/college-of-swords",
},

{
  index: "college-of-whispers",
  name: "Colégio dos Sussurros",
  class: { index: "bard", name: "Bardo", url: "/api/classes/bard" },
  desc: [
    "A maioria das pessoas fica feliz em receber um bardo em uma taverna ou numa fogueira de acampamento.",
    "Afinal, bardos trazem notícias, músicas e contos de terras distantes. Mas nem todo bardo é tão benigno."
  ],
  subclass_flavor: "O Colégio dos Sussurros ensina que música e palavras são não apenas para diversão, mas também armas poderosas.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "psychic-blades", name: "Lâminas Psíquicas", url: "/api/features/psychic-blades" },
        { index: "words-of-terror", name: "Palavras de Terror", url: "/api/features/words-of-terror" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "mantle-of-whispers", name: "Manto dos Sussurros", url: "/api/features/mantle-of-whispers" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "shadow-lore", name: "Conhecimento Sombrio", url: "/api/features/shadow-lore" }
      ]
    }
  ],
  url: "/api/subclasses/college-of-whispers",
},

// 🎪 SUBCLASSES DO TASHA'S CAULDRON OF EVERYTHING:

{
  index: "college-of-eloquence",
  name: "Colégio da Eloquência",
  class: { index: "bard", name: "Bardo", url: "/api/classes/bard" },
  desc: [
    "Aderentes ao Colégio da Eloquência dominam a arte da oratória.",
    "Persuasão é considerada uma alta arte, e um bardo bem versado é respeitado nos salões de poder."
  ],
  subclass_flavor: "Esses bardos exercem uma mistura de lógica e performance teatral, ganhando força das verdades universais da retórica e do drama.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "silver-tongue", name: "Língua de Prata", url: "/api/features/silver-tongue" },
        { index: "unsettling-words", name: "Palavras Perturbadoras", url: "/api/features/unsettling-words" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "universal-speech", name: "Fala Universal", url: "/api/features/universal-speech" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "infectious-inspiration", name: "Inspiração Contagiosa", url: "/api/features/infectious-inspiration" }
      ]
    }
  ],
  url: "/api/subclasses/college-of-eloquence",
},

{
  index: "college-of-creation",
  name: "Colégio da Criação",
  class: { index: "bard", name: "Bardo", url: "/api/classes/bard" },
  desc: [
    "Bardos acreditam que o cosmos é uma obra de arte - as criações dos primeiros dragões e deuses.",
    "Esse conceito de origem criativa alimenta a filosofia do Colégio da Criação."
  ],
  subclass_flavor: "Os bardos deste colégio acreditam que o multiverso é literalmente uma performance que ainda está sendo escrita, e buscam deixar sua marca nesta grande obra.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "note-of-potential", name: "Nota de Potencial", url: "/api/features/note-of-potential" },
        { index: "performance-of-creation", name: "Performance da Criação", url: "/api/features/performance-of-creation" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "animating-performance", name: "Performance Animadora", url: "/api/features/animating-performance" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "creative-crescendo", name: "Crescendo Criativo", url: "/api/features/creative-crescendo" }
      ]
    }
  ],
  url: "/api/subclasses/college-of-creation",
},

// 🔮 SUBCLASSE DO VAN RICHTEN'S GUIDE TO RAVENLOFT:

{
  index: "college-of-spirits",
  name: "Colégio dos Espíritos",
  class: { index: "bard", name: "Bardo", url: "/api/classes/bard" },
  desc: [
    "Os bardos do Colégio dos Espíritos buscam contos com espíritos mortos.",
    "Usando rituais rituais e seances, esses bardos chamam os espíritos dos mortos."
  ],
  subclass_flavor: "Esses bardos usam suas canções e contos para invocar espíritos que compartilham conhecimento esquecido e auxiliam o bardo em suas aventuras.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "guiding-whispers", name: "Sussurros Orientadores", url: "/api/features/guiding-whispers" },
        { index: "spiritual-focus", name: "Foco Espiritual", url: "/api/features/spiritual-focus" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "tales-from-beyond", name: "Contos do Além", url: "/api/features/tales-from-beyond" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "spirit-session", name: "Sessão Espiritual", url: "/api/features/spirit-session" }
      ]
    }
  ],
  url: "/api/subclasses/college-of-spirits",
},

  // ===========================
  // CLÉRICO SUBCLASSES
  // ===========================
  

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
  {
  index: "knowledge-domain",
  name: "Domínio do Conhecimento",
  class: { index: "cleric", name: "Clérico", url: "/api/classes/cleric" },
  desc: [
    "Os deuses do conhecimento – incluindo Oghma, Boccob, Gilean, Aureon e Thoth – valorizam o aprendizado e o entendimento acima de tudo.",
    "Alguns ensinam que o conhecimento deve ser reunido e compartilhado em bibliotecas e universidades, ou promovem o conhecimento prático do artesanato e da invenção."
  ],
  subclass_flavor: "Alguns deuses acumulam conhecimento e os mantêm em segredo para si mesmos, outros prometem conceder aos seus seguidores acesso a uma grande biblioteca mística.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "blessings-of-knowledge", name: "Bênçãos do Conhecimento", url: "/api/features/blessings-of-knowledge" }
      ]
    },
    {
      level: 2,
      features: [
        { index: "channel-divinity-knowledge-of-ages", name: "Canalizar Divindade: Conhecimento das Eras", url: "/api/features/channel-divinity-knowledge-of-ages" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "channel-divinity-read-thoughts", name: "Canalizar Divindade: Ler Pensamentos", url: "/api/features/channel-divinity-read-thoughts" }
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
        { index: "visions-of-the-past", name: "Visões do Passado", url: "/api/features/visions-of-the-past" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "command", name: "Comando", url: "/api/spells/command" },
        { index: "identify", name: "Identificar", url: "/api/spells/identify" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "augury", name: "Augúrio", url: "/api/spells/augury" },
        { index: "suggestion", name: "Sugestão", url: "/api/spells/suggestion" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "nondetection", name: "Indetectabilidade", url: "/api/spells/nondetection" },
        { index: "speak-with-dead", name: "Falar com os Mortos", url: "/api/spells/speak-with-dead" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "arcane-eye", name: "Olho Arcano", url: "/api/spells/arcane-eye" },
        { index: "confusion", name: "Confusão", url: "/api/spells/confusion" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "legend-lore", name: "Conhecimento Lendário", url: "/api/spells/legend-lore" },
        { index: "scrying", name: "Vidência", url: "/api/spells/scrying" }
      ]
    }
  ],
  url: "/api/subclasses/knowledge-domain",
},

{
  index: "nature-domain",
  name: "Domínio da Natureza",
  class: { index: "cleric", name: "Clérico", url: "/api/classes/cleric" },
  desc: [
    "Deuses da natureza são diversos quanto o mundo natural em si, de divindades benignas associadas com bosques particulares para divindades cruéis de desastres e pestilência.",
    "Os druidas reverenciam a natureza como um todo e podem servir uma dessas divindades, praticando rituais misteriosos e recitando orações na língua druídica."
  ],
  subclass_flavor: "Muitos desses deuses têm clérigos, campeões que tomam um papel mais ativo em promover os interesses de um deus da natureza particular.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "acolyte-of-nature", name: "Acólito da Natureza", url: "/api/features/acolyte-of-nature" },
        { index: "bonus-proficiency-nature", name: "Proficiência Adicional", url: "/api/features/bonus-proficiency-nature" }
      ]
    },
    {
      level: 2,
      features: [
        { index: "channel-divinity-charm-animals-plants", name: "Canalizar Divindade: Encantar Animais e Plantas", url: "/api/features/channel-divinity-charm-animals-plants" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "dampen-elements", name: "Amortecer Elementos", url: "/api/features/dampen-elements" }
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
        { index: "master-of-nature", name: "Mestre da Natureza", url: "/api/features/master-of-nature" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "animal-friendship", name: "Amizade Animal", url: "/api/spells/animal-friendship" },
        { index: "speak-with-animals", name: "Falar com Animais", url: "/api/spells/speak-with-animals" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "barkskin", name: "Pele de Árvore", url: "/api/spells/barkskin" },
        { index: "spike-growth", name: "Crescimento de Espinhos", url: "/api/spells/spike-growth" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "plant-growth", name: "Crescimento Vegetal", url: "/api/spells/plant-growth" },
        { index: "wind-wall", name: "Muralha de Vento", url: "/api/spells/wind-wall" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "dominate-beast", name: "Dominar Fera", url: "/api/spells/dominate-beast" },
        { index: "grasping-vine", name: "Cipó Agarrador", url: "/api/spells/grasping-vine" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "insect-plague", name: "Praga de Insetos", url: "/api/spells/insect-plague" },
        { index: "tree-stride", name: "Caminhar em Árvores", url: "/api/spells/tree-stride" }
      ]
    }
  ],
  url: "/api/subclasses/nature-domain",
},

{
  index: "tempest-domain",
  name: "Domínio da Tempestade",
  class: { index: "cleric", name: "Clérico", url: "/api/classes/cleric" },
  desc: [
    "Deuses cujos portfólios incluem o Domínio da Tempestade – incluindo Talos, Umberlee, Kord, Zeboim, o Devorador, Zeus e Thor – governam tempestades, mar e céu.",
    "Eles incluem deuses de relâmpagos e trovões, deuses de terremotos, alguns deuses do fogo e certos deuses de violência, força física e coragem."
  ],
  subclass_flavor: "Marinheiros oram a esses deuses buscando ventos favoráveis e mares calmos, e oram para longe de suas iras quando ventos uivantes surgem para devastar embarcações contra os rochedos costeiros.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "bonus-proficiencies-tempest", name: "Proficiências Adicionais", url: "/api/features/bonus-proficiencies-tempest" },
        { index: "wrath-of-the-storm", name: "Ira da Tempestade", url: "/api/features/wrath-of-the-storm" }
      ]
    },
    {
      level: 2,
      features: [
        { index: "channel-divinity-destructive-wrath", name: "Canalizar Divindade: Ira Destrutiva", url: "/api/features/channel-divinity-destructive-wrath" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "thunderbolt-strike", name: "Golpe do Raio", url: "/api/features/thunderbolt-strike" }
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
        { index: "stormborn", name: "Nascido da Tempestade", url: "/api/features/stormborn" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "fog-cloud", name: "Nuvem de Névoa", url: "/api/spells/fog-cloud" },
        { index: "thunderwave", name: "Onda Trovejante", url: "/api/spells/thunderwave" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "gust-of-wind", name: "Rajada de Vento", url: "/api/spells/gust-of-wind" },
        { index: "shatter", name: "Despedaçar", url: "/api/spells/shatter" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "call-lightning", name: "Convocar Raios", url: "/api/spells/call-lightning" },
        { index: "sleet-storm", name: "Tempestade de Granizo", url: "/api/spells/sleet-storm" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "control-water", name: "Controlar Água", url: "/api/spells/control-water" },
        { index: "ice-storm", name: "Tempestade de Gelo", url: "/api/spells/ice-storm" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "destructive-wave", name: "Onda Destrutiva", url: "/api/spells/destructive-wave" },
        { index: "insect-plague", name: "Praga de Insetos", url: "/api/spells/insect-plague" }
      ]
    }
  ],
  url: "/api/subclasses/tempest-domain",
},

{
  index: "trickery-domain",
  name: "Domínio da Trapaça",
  class: { index: "cleric", name: "Clérico", url: "/api/classes/cleric" },
  desc: [
    "Deuses da trapaça – como Cyric, Beshaba, Hiddukel, Vecna, e Hermes – são desencaminhadores e instigadores que se colocam como um desafio constante à ordem aceita entre deuses e mortais.",
    "Eles são patronos de ladrões, canalhas, apostadores, rebeldes e libertadores."
  ],
  subclass_flavor: "Seus clérigos são uma força disruptiva no mundo, cutucando consciências, zombando de tiranos, roubando dos ricos, libertando cativos e ignorando convenções vazias.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "blessing-of-the-trickster", name: "Bênção do Trapaceiro", url: "/api/features/blessing-of-the-trickster" }
      ]
    },
    {
      level: 2,
      features: [
        { index: "channel-divinity-invoke-duplicity", name: "Canalizar Divindade: Invocar Duplicata", url: "/api/features/channel-divinity-invoke-duplicity" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "channel-divinity-cloak-of-shadows", name: "Canalizar Divindade: Manto de Sombras", url: "/api/features/channel-divinity-cloak-of-shadows" }
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
        { index: "improved-duplicity", name: "Duplicata Aprimorada", url: "/api/features/improved-duplicity" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "charm-person", name: "Encantar Pessoa", url: "/api/spells/charm-person" },
        { index: "disguise-self", name: "Disfarçar-se", url: "/api/spells/disguise-self" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "mirror-image", name: "Imagem Espelhada", url: "/api/spells/mirror-image" },
        { index: "pass-without-trace", name: "Passar sem Pegadas", url: "/api/spells/pass-without-trace" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "blink", name: "Piscar", url: "/api/spells/blink" },
        { index: "dispel-magic", name: "Dissipar Magia", url: "/api/spells/dispel-magic" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "dimension-door", name: "Porta Dimensional", url: "/api/spells/dimension-door" },
        { index: "polymorph", name: "Metamorfose", url: "/api/spells/polymorph" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "dominate-person", name: "Dominar Pessoa", url: "/api/spells/dominate-person" },
        { index: "modify-memory", name: "Modificar Memória", url: "/api/spells/modify-memory" }
      ]
    }
  ],
  url: "/api/subclasses/trickery-domain",
},

{
  index: "war-domain",
  name: "Domínio da Guerra",
  class: { index: "cleric", name: "Clérico", url: "/api/classes/cleric" },
  desc: [
    "Guerra tem muitas manifestações. Pode fazer heróis de pessoas comuns. Pode ser desesperada e aterrorizante, com atos de covardia e brutalidade eclipsando instâncias de excelência e coragem.",
    "Em qualquer caso, os deuses da guerra observam guerreiros e recompensam por feitos poderosos com atos de violência."
  ],
  subclass_flavor: "Os domínios da guerra e da morte trabalham intimamente juntos, pois guerra semeia morte, e morte desperta medo da guerra.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "bonus-proficiencies-war", name: "Proficiências Adicionais", url: "/api/features/bonus-proficiencies-war" },
        { index: "war-priest", name: "Sacerdote da Guerra", url: "/api/features/war-priest" }
      ]
    },
    {
      level: 2,
      features: [
        { index: "channel-divinity-guided-strike", name: "Canalizar Divindade: Golpe Guiado", url: "/api/features/channel-divinity-guided-strike" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "channel-divinity-war-god-blessing", name: "Canalizar Divindade: Bênção do Deus da Guerra", url: "/api/features/channel-divinity-war-god-blessing" }
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
        { index: "avatar-of-battle", name: "Avatar da Batalha", url: "/api/features/avatar-of-battle" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "divine-favor", name: "Favor Divino", url: "/api/spells/divine-favor" },
        { index: "shield-of-faith", name: "Escudo da Fé", url: "/api/spells/shield-of-faith" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "magic-weapon", name: "Arma Mágica", url: "/api/spells/magic-weapon" },
        { index: "spiritual-weapon", name: "Arma Espiritual", url: "/api/spells/spiritual-weapon" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "crusaders-mantle", name: "Manto do Cruzado", url: "/api/spells/crusaders-mantle" },
        { index: "spirit-guardians", name: "Guardiões Espirituais", url: "/api/spells/spirit-guardians" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "freedom-of-movement", name: "Liberdade de Movimento", url: "/api/spells/freedom-of-movement" },
        { index: "stoneskin", name: "Pele de Pedra", url: "/api/spells/stoneskin" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "flame-strike", name: "Coluna de Chamas", url: "/api/spells/flame-strike" },
        { index: "hold-monster", name: "Prender Monstro", url: "/api/spells/hold-monster" }
      ]
    }
  ],
  url: "/api/subclasses/war-domain",
},

// 💀 SUBCLASSES ADICIONAIS (LIVROS DE EXPANSÃO):

{
  index: "death-domain",
  name: "Domínio da Morte",
  class: { index: "cleric", name: "Clérico", url: "/api/classes/cleric" },
  desc: [
    "O Domínio da Morte se preocupa com as forças que causam morte, bem como a energia negativa que dá origem a criaturas mortas-vivas.",
    "Divindades da morte também governam sobre sonos e sonhos, às vezes atuando como porteiros entre o mundo dos vivos e o além."
  ],
  subclass_flavor: "Deuses da morte incluem Chemosh, Myrkul, e Wee Jas. Esta subclasse está disponível apenas para campanhas que permitam conteúdo sombrio.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "bonus-proficiency-death", name: "Proficiência Adicional", url: "/api/features/bonus-proficiency-death" },
        { index: "reaper", name: "Ceifador", url: "/api/features/reaper" }
      ]
    },
    {
      level: 2,
      features: [
        { index: "channel-divinity-touch-of-death", name: "Canalizar Divindade: Toque da Morte", url: "/api/features/channel-divinity-touch-of-death" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "inescapable-destruction", name: "Destruição Inevitável", url: "/api/features/inescapable-destruction" }
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
        { index: "improved-reaper", name: "Ceifador Aprimorado", url: "/api/features/improved-reaper" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "false-life", name: "Vida Falsa", url: "/api/spells/false-life" },
        { index: "inflict-wounds", name: "Infligir Ferimentos", url: "/api/spells/inflict-wounds" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "blindness-deafness", name: "Cegueira/Surdez", url: "/api/spells/blindness-deafness" },
        { index: "ray-of-enfeeblement", name: "Raio de Enfraquecimento", url: "/api/spells/ray-of-enfeeblement" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "animate-dead", name: "Animar Mortos", url: "/api/spells/animate-dead" },
        { index: "vampiric-touch", name: "Toque Vampírico", url: "/api/spells/vampiric-touch" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "blight", name: "Praga", url: "/api/spells/blight" },
        { index: "death-ward", name: "Proteção contra a Morte", url: "/api/spells/death-ward" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "antilife-shell", name: "Concha Antivida", url: "/api/spells/antilife-shell" },
        { index: "cloudkill", name: "Nuvem Mortal", url: "/api/spells/cloudkill" }
      ]
    }
  ],
  url: "/api/subclasses/death-domain",
},

{
  index: "forge-domain",
  name: "Domínio da Forja",
  class: { index: "cleric", name: "Clérico", url: "/api/classes/cleric" },
  desc: [
    "Os deuses do domínio da forja são patronos dos artesãos que trabalham com metal, de ferreiros e artesãos a armeiros e joalheiros.",
    "Eles ensinam que, com paciência e trabalho duro, mesmo o metal mais intratável pode ser transformado de minério bruto em algo belo."
  ],
  subclass_flavor: "Os seguidores dessas divindades buscam a perfeição através do trabalho incansável, criando não apenas objetos de beleza, mas também de grande poder.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "bonus-proficiencies-forge", name: "Proficiências Adicionais", url: "/api/features/bonus-proficiencies-forge" },
        { index: "blessing-of-the-forge", name: "Bênção da Forja", url: "/api/features/blessing-of-the-forge" }
      ]
    },
    {
      level: 2,
      features: [
        { index: "channel-divinity-artisans-blessing", name: "Canalizar Divindade: Bênção do Artesão", url: "/api/features/channel-divinity-artisans-blessing" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "soul-of-the-forge", name: "Alma da Forja", url: "/api/features/soul-of-the-forge" }
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
        { index: "saint-of-forge-and-fire", name: "Santo da Forja e Fogo", url: "/api/features/saint-of-forge-and-fire" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "identify", name: "Identificar", url: "/api/spells/identify" },
        { index: "searing-smite", name: "Golpe Ardente", url: "/api/spells/searing-smite" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "heat-metal", name: "Aquecer Metal", url: "/api/spells/heat-metal" },
        { index: "magic-weapon", name: "Arma Mágica", url: "/api/spells/magic-weapon" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "elemental-weapon", name: "Arma Elemental", url: "/api/spells/elemental-weapon" },
        { index: "protection-from-energy", name: "Proteção contra Energia", url: "/api/spells/protection-from-energy" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "fabricate", name: "Fabricar", url: "/api/spells/fabricate" },
        { index: "wall-of-fire", name: "Muralha de Fogo", url: "/api/spells/wall-of-fire" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "animate-objects", name: "Animar Objetos", url: "/api/spells/animate-objects" },
        { index: "creation", name: "Criação", url: "/api/spells/creation" }
      ]
    }
  ],
  url: "/api/subclasses/forge-domain",
},

  // ===========================
  // DRUIDA SUBCLASSES
  // ===========================
  

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
  {
  index: "circle-of-the-stars",
  name: "Círculo das Estrelas",
  class: { index: "druid", name: "Druida", url: "/api/classes/druid" },
  desc: [
    "O Círculo das Estrelas permite que druidas aproveitem o poder do cosmos para lançar magias e parcialmente resistir ao destino através da divindade estelar.",
    "Muitos druidas deste círculo mantêm registros de constelações e os ciclos das estrelas, criando cartas estelares para navegação."
  ],
  subclass_flavor: "Esses druidas acreditam que as estrelas mantêm segredos antigos que podem ser revelados através da observação cuidadosa e meditação.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "star-map", name: "Mapa Estelar", url: "/api/features/star-map" },
        { index: "starry-form", name: "Forma Estelar", url: "/api/features/starry-form" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "cosmic-omen", name: "Presságio Cósmico", url: "/api/features/cosmic-omen" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "twinkling-constellations", name: "Constelações Cintilantes", url: "/api/features/twinkling-constellations" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "full-of-stars", name: "Cheio de Estrelas", url: "/api/features/full-of-stars" }
      ]
    }
  ],
  url: "/api/subclasses/circle-of-the-stars",
},

{
  index: "circle-of-dreams",
  name: "Círculo dos Sonhos",
  class: { index: "druid", name: "Druida", url: "/api/classes/druid" },
  desc: [
    "Druidas que são membros do Círculo dos Sonhos vieram em contato com o Feywild e suas redes de sonhos, visões e profecias reverberantes.",
    "Suas magias, seus talentos para vislumbrar o futuro e suas conexões feéricas os tornam premonitory em seu papel."
  ],
  subclass_flavor: "Esses druidas buscam preencher o mundo com sonhos de esperança, alegria e paz, protegendo pessoas através de sonhos curativos.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "balm-of-the-summer-court", name: "Bálsamo da Corte de Verão", url: "/api/features/balm-of-the-summer-court" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "hearth-of-moonlight-and-shadow", name: "Lareira de Luar e Sombra", url: "/api/features/hearth-of-moonlight-and-shadow" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "hidden-paths", name: "Caminhos Ocultos", url: "/api/features/hidden-paths" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "walker-in-dreams", name: "Caminhante nos Sonhos", url: "/api/features/walker-in-dreams" }
      ]
    }
  ],
  url: "/api/subclasses/circle-of-dreams",
},

{
  index: "circle-of-the-shepherd",
  name: "Círculo do Pastor",
  class: { index: "druid", name: "Druida", url: "/api/classes/druid" },
  desc: [
    "Druidas do Círculo do Pastor compartilham com espíritos da natureza, especialmente animais e fadas.",
    "Esses druidas reconhecem que todas as coisas vivas têm um papel a desempenhar no mundo natural, mas concentram-se especificamente em proteger animais e espíritos da fada."
  ],
  subclass_flavor: "Estes druidas aceitam seu papel como pastores e guardiões da vida selvagem, desde os menores insetos até as maiores feras.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "speech-of-the-woods", name: "Fala das Florestas", url: "/api/features/speech-of-the-woods" },
        { index: "spirit-totem", name: "Totem Espiritual", url: "/api/features/spirit-totem" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "mighty-summoner", name: "Invocador Poderoso", url: "/api/features/mighty-summoner" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "guardian-spirit", name: "Espírito Guardião", url: "/api/features/guardian-spirit" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "faithful-summons", name: "Invocações Fiéis", url: "/api/features/faithful-summons" }
      ]
    }
  ],
  url: "/api/subclasses/circle-of-the-shepherd",
},

{
  index: "circle-of-spores",
  name: "Círculo dos Esporos",
  class: { index: "druid", name: "Druida", url: "/api/classes/druid" },
  desc: [
    "Druidas do Círculo dos Esporos encontram beleza na decadência. Eles veem dentro do mofo e outros fungos a capacidade de transformar matéria morta em vida nova, uma infinita fonte de renovação.",
    "Esses druidas acreditam que a vida e a morte são partes de um grandioso ciclo, com um fluindo para o outro constantemente."
  ],
  subclass_flavor: "Para esses druidas, a morte não é o fim da vida, mas uma mudança de estado que vê a vida continuando de novas formas.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "circle-spells-spores", name: "Magias do Círculo", url: "/api/features/circle-spells-spores" },
        { index: "halo-of-spores", name: "Halo de Esporos", url: "/api/features/halo-of-spores" },
        { index: "symbiotic-entity", name: "Entidade Simbiótica", url: "/api/features/symbiotic-entity" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "fungal-infestation", name: "Infestação Fúngica", url: "/api/features/fungal-infestation" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "spreading-spores", name: "Esporos em Propagação", url: "/api/features/spreading-spores" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "fungal-body", name: "Corpo Fúngico", url: "/api/features/fungal-body" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "blindness-deafness", name: "Cegueira/Surdez", url: "/api/spells/blindness-deafness" },
        { index: "gentle-repose", name: "Repouso Gentil", url: "/api/spells/gentle-repose" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "animate-dead", name: "Animar Mortos", url: "/api/spells/animate-dead" },
        { index: "gaseous-form", name: "Forma Gasosa", url: "/api/spells/gaseous-form" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "blight", name: "Praga", url: "/api/spells/blight" },
        { index: "confusion", name: "Confusão", url: "/api/spells/confusion" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "cloudkill", name: "Nuvem Mortal", url: "/api/spells/cloudkill" },
        { index: "contagion", name: "Contágio", url: "/api/spells/contagion" }
      ]
    }
  ],
  url: "/api/subclasses/circle-of-spores",
},

{
  index: "circle-of-wildfire",
  name: "Círculo do Fogo Selvagem",
  class: { index: "druid", name: "Druida", url: "/api/classes/druid" },
  desc: [
    "Druidas dentro do Círculo do Fogo Selvagem entendem que a destruição às vezes é o precursor da criação, como quando um incêndio florestal promove o crescimento posterior.",
    "Esses druidas se ligam a um espírito primitivo do fogo, um pequeno elemental que incorpora a criatividade e destruição do fogo."
  ],
  subclass_flavor: "Eles ensinam que o fogo traz mudança, e é mudança - seja através de renovação ou destruição - que promove a impetuosidade da natureza.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "circle-spells-wildfire", name: "Magias do Círculo", url: "/api/features/circle-spells-wildfire" },
        { index: "summon-wildfire-spirit", name: "Invocar Espírito do Fogo Selvagem", url: "/api/features/summon-wildfire-spirit" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "enhanced-bond", name: "Ligação Fortalecida", url: "/api/features/enhanced-bond" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "cauterizing-flames", name: "Chamas Cauterizadoras", url: "/api/features/cauterizing-flames" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "blazing-revival", name: "Renascimento Flamejante", url: "/api/features/blazing-revival" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "burning-hands", name: "Mãos Flamejantes", url: "/api/spells/burning-hands" },
        { index: "cure-wounds", name: "Curar Ferimentos", url: "/api/spells/cure-wounds" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "flaming-sphere", name: "Esfera Flamejante", url: "/api/spells/flaming-sphere" },
        { index: "scorching-ray", name: "Raio Ardente", url: "/api/spells/scorching-ray" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "plant-growth", name: "Crescimento Vegetal", url: "/api/spells/plant-growth" },
        { index: "revivify", name: "Revivificar", url: "/api/spells/revivify" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "aura-of-life", name: "Aura da Vida", url: "/api/spells/aura-of-life" },
        { index: "fire-shield", name: "Escudo de Fogo", url: "/api/spells/fire-shield" }
      ]
    }
  ],
  url: "/api/subclasses/circle-of-wildfire",
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
    name: "Cavaleiro Arcano",
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

  {
  index: "samurai",
  name: "Samurai",
  class: { index: "fighter", name: "Guerreiro", url: "/api/classes/fighter" },
  desc: [
    "O Samurai é um guerreiro que atrai sua força interior para lutar com resolução inabalável.",
    "Um samurai é resoluto face à morte e é leal ao código de honra do Bushido."
  ],
  subclass_flavor: "Os samurais de D&D podem vir de qualquer cultura, mas seguem um código similar que enfatiza honra, coragem e disciplina.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "bonus-proficiency-samurai", name: "Proficiência Adicional", url: "/api/features/bonus-proficiency-samurai" },
        { index: "fighting-spirit", name: "Espírito de Luta", url: "/api/features/fighting-spirit" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "elegant-courtier", name: "Cortesão Elegante", url: "/api/features/elegant-courtier" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "tireless-spirit", name: "Espírito Incansável", url: "/api/features/tireless-spirit" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "rapid-strike", name: "Golpe Rápido", url: "/api/features/rapid-strike" }
      ]
    },
    {
      level: 18,
      features: [
        { index: "strength-before-death", name: "Força Antes da Morte", url: "/api/features/strength-before-death" }
      ]
    }
  ],
  url: "/api/subclasses/samurai",
},

{
  index: "cavalier",
  name: "Cavaleiro",
  class: { index: "fighter", name: "Guerreiro", url: "/api/classes/fighter" },
  desc: [
    "O arqueótipo Cavaleiro representa o ideal de cavaleiros montados em armaduras brilhantes.",
    "Cavaleiros são mestres do combate montado e são especialmente eficazes em proteger seus aliados."
  ],
  subclass_flavor: "Nem todos os cavaleiros históricos eram nobres ou mesmo montados, mas todos compartilhavam um código de conduta que priorizava honor e proteção dos mais fracos.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "bonus-proficiency-cavalier", name: "Proficiência Adicional", url: "/api/features/bonus-proficiency-cavalier" },
        { index: "born-to-the-saddle", name: "Nascido para a Sela", url: "/api/features/born-to-the-saddle" },
        { index: "unwavering-mark", name: "Marca Inabalável", url: "/api/features/unwavering-mark" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "warding-maneuver", name: "Manobra Protetora", url: "/api/features/warding-maneuver" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "hold-the-line", name: "Manter a Linha", url: "/api/features/hold-the-line" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "ferocious-charger", name: "Investida Feroz", url: "/api/features/ferocious-charger" }
      ]
    },
    {
      level: 18,
      features: [
        { index: "vigilant-defender", name: "Defensor Vigilante", url: "/api/features/vigilant-defender" }
      ]
    }
  ],
  url: "/api/subclasses/cavalier",
},

{
  index: "arcane-archer",
  name: "Arqueiro Arcano",
  class: { index: "fighter", name: "Guerreiro", url: "/api/classes/fighter" },
  desc: [
    "Um Arqueiro Arcano estuda um método único de tiro com arco que tece magia nas flechas para produzir efeitos sobrenaturais.",
    "Arqueiros Arcanos são alguns dos mais conceituados guerreiros élfico, mas o arquétipo está disponível para personagens de qualquer raça."
  ],
  subclass_flavor: "Esses guerreiros infundem suas flechas com essência mágica, criando munição que pode perfurar defesas mágicas ou produzir efeitos elementais devastadores.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "arcane-archer-lore", name: "Conhecimento do Arqueiro Arcano", url: "/api/features/arcane-archer-lore" },
        { index: "arcane-shot", name: "Tiro Arcano", url: "/api/features/arcane-shot" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "magic-arrow", name: "Flecha Mágica", url: "/api/features/magic-arrow" },
        { index: "curving-shot", name: "Tiro Curvado", url: "/api/features/curving-shot" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "arcane-shot-improvement", name: "Melhoria do Tiro Arcano", url: "/api/features/arcane-shot-improvement" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "ever-ready-shot", name: "Tiro Sempre Pronto", url: "/api/features/ever-ready-shot" }
      ]
    },
    {
      level: 18,
      features: [
        { index: "arcane-shot-mastery", name: "Maestria do Tiro Arcano", url: "/api/features/arcane-shot-mastery" }
      ]
    }
  ],
  url: "/api/subclasses/arcane-archer",
},

{
  index: "banneret",
  name: "Cavaleiro Púrpura",
  class: { index: "fighter", name: "Guerreiro", url: "/api/classes/fighter" },
  desc: [
    "Um Cavaleiro Púrpura, também conhecido como banneret, exemplifica os ideais de cavalaria, coragem e táticas em campo de batalha.",
    "Reconhecido por sua liderança excepcional em campanhas militares, um Cavaleiro Púrpura recebe uma patente de nobreza."
  ],
  subclass_flavor: "O Cavaleiro Púrpura atua como comandante de campo, inspirando aliados e coordenando estratégias de batalha com maestria militar.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "rallying-cry", name: "Grito de Guerra", url: "/api/features/rallying-cry" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "royal-envoy", name: "Enviado Real", url: "/api/features/royal-envoy" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "inspiring-surge", name: "Surto Inspirador", url: "/api/features/inspiring-surge" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "bulwark", name: "Baluarte", url: "/api/features/bulwark" }
      ]
    },
    {
      level: 18,
      features: [
        { index: "improved-inspiring-surge", name: "Surto Inspirador Aprimorado", url: "/api/features/improved-inspiring-surge" }
      ]
    }
  ],
  url: "/api/subclasses/banneret",
},

{
  index: "rune-knight",
  name: "Cavaleiro das Runas",
  class: { index: "fighter", name: "Guerreiro", url: "/api/classes/fighter" },
  desc: [
    "Cavaleiros das Runas aprimoram suas habilidades marciais usando os poderes sobrenaturais das runas antigas.",
    "Runas são símbolos mágicos que carregam poder vestigial dos gigantes que um dia dominaram gran parte do multiverso."
  ],
  subclass_flavor: "Esses guerreiros estudam e aplicam runas gigantes, crescendo em tamanho e ganhando poderes ligados às tempestades, montanhas e outros aspectos primordiais.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "bonus-proficiencies-rune-knight", name: "Proficiências Adicionais", url: "/api/features/bonus-proficiencies-rune-knight" },
        { index: "rune-carver", name: "Entalhador de Runas", url: "/api/features/rune-carver" },
        { index: "giants-might", name: "Força dos Gigantes", url: "/api/features/giants-might" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "runic-shield", name: "Escudo Rúnico", url: "/api/features/runic-shield" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "great-stature", name: "Grande Estatura", url: "/api/features/great-stature" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "master-of-runes", name: "Mestre das Runas", url: "/api/features/master-of-runes" }
      ]
    },
    {
      level: 18,
      features: [
        { index: "runic-juggernaut", name: "Juggernaut Rúnico", url: "/api/features/runic-juggernaut" }
      ]
    }
  ],
  url: "/api/subclasses/rune-knight",
},

{
  index: "psi-warrior",
  name: "Guerreiro Psíquico",
  class: { index: "fighter", name: "Guerreiro", url: "/api/classes/fighter" },
  desc: [
    "Despertando para o poder psíquico dentro de si, um Guerreiro Psíquico é um guerreiro que aumenta sua força física, velocidade e táticas com poderes telecinéticos e telepáticos.",
    "Muitos githyanki treinam para se tornar tais guerreiros, como fazem alguns dos githzerai mais disciplinados."
  ],
  subclass_flavor: "O Guerreiro Psíquico combina mestria marcial com poderes da mente, criando campos de força, movendo objetos com o pensamento e lendo intenções inimigas.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "telekinetic-movement", name: "Movimento Telecinético", url: "/api/features/telekinetic-movement" },
        { index: "psionic-power", name: "Poder Psíquico", url: "/api/features/psionic-power" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "telekinetic-adept", name: "Adepto Telecinético", url: "/api/features/telekinetic-adept" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "guarded-mind", name: "Mente Guardada", url: "/api/features/guarded-mind" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "bulwark-of-force", name: "Baluarte de Força", url: "/api/features/bulwark-of-force" }
      ]
    },
    {
      level: 18,
      features: [
        { index: "telekinetic-master", name: "Mestre Telecinético", url: "/api/features/telekinetic-master" }
      ]
    }
  ],
  url: "/api/subclasses/psi-warrior",
},

  // ===========================
  // MONGE SUBCLASSES
  // ===========================
  

{
  index: "way-of-shadow",
  name: "Caminho da Sombra",
  class: { index: "monk", name: "Monge", url: "/api/classes/monk" },
  desc: [
    "Monges do Caminho da Sombra seguem uma tradição que valoriza furtividade e subterfúgio.",
    "Esses monges podem ser chamados de ninjas ou dançarinos das sombras, e servem como espiões e assassinos."
  ],
  subclass_flavor: "Às vezes os membros de um mosteiro são enviados em missões clandestinas, requerendo que eles se tornem invisíveis às suas vítimas e aos seus inimigos.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "shadow-arts", name: "Artes das Sombras", url: "/api/features/shadow-arts" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "shadow-step", name: "Passo Sombrio", url: "/api/features/shadow-step" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "cloak-of-shadows", name: "Manto de Sombras", url: "/api/features/cloak-of-shadows" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "opportunist", name: "Oportunista", url: "/api/features/opportunist" }
      ]
    }
  ],
  url: "/api/subclasses/way-of-shadow",
},

{
  index: "way-of-the-four-elements",
  name: "Caminho dos Quatro Elementos",
  class: { index: "monk", name: "Monge", url: "/api/classes/monk" },
  desc: [
    "Você segue uma tradição monástica que ensina você a dominar os elementos.",
    "Quando você foca seu ki, você pode se alinhar com as forças da criação e dobrar os quatro elementos à sua vontade, usando-os como uma extensão de seu corpo."
  ],
  subclass_flavor: "Alguns membros desta tradição se dedicam a um único elemento, mas outros tecem os elementos juntos.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "disciple-of-the-elements", name: "Discípulo dos Elementos", url: "/api/features/disciple-of-the-elements" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "extra-elemental-discipline", name: "Disciplina Elemental Extra", url: "/api/features/extra-elemental-discipline" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "extra-elemental-discipline-2", name: "Disciplina Elemental Extra", url: "/api/features/extra-elemental-discipline-2" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "extra-elemental-discipline-3", name: "Disciplina Elemental Extra", url: "/api/features/extra-elemental-discipline-3" }
      ]
    }
  ],
  url: "/api/subclasses/way-of-the-four-elements",
},

// 🌟 SUBCLASSES ADICIONAIS (LIVROS DE EXPANSÃO):

{
  index: "way-of-the-long-death",
  name: "Caminho da Morte Longa",
  class: { index: "monk", name: "Monge", url: "/api/classes/monk" },
  desc: [
    "Monges do Caminho da Morte Longa são obcecados com o significado e mecânica da morte.",
    "Eles capturam criaturas e realizam experimentos grotescos em si mesmos e outros para entender melhor a fronteira entre vida e morte."
  ],
  subclass_flavor: "Esses monges são frequentemente temidos por sua crueldade e metodologia sinistra, mas seu conhecimento da morte os torna adversários formidáveis.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "touch-of-death", name: "Toque da Morte", url: "/api/features/touch-of-death" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "hour-of-reaping", name: "Hora da Ceifa", url: "/api/features/hour-of-reaping" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "mastery-of-death", name: "Maestria da Morte", url: "/api/features/mastery-of-death" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "touch-of-the-long-death", name: "Toque da Morte Longa", url: "/api/features/touch-of-the-long-death" }
      ]
    }
  ],
  url: "/api/subclasses/way-of-the-long-death",
},

{
  index: "way-of-the-sun-soul",
  name: "Caminho da Alma Solar",
  class: { index: "monk", name: "Monge", url: "/api/classes/monk" },
  desc: [
    "Monges do Caminho da Alma Solar aprendem a canalizar sua própria força vital em raios de energia solar abrasadora.",
    "Eles ensinam que a meditação pode desbloquear a capacidade de liberar o potencial brilhante da alma."
  ],
  subclass_flavor: "Monges dessa tradição são frequentemente encontrados em regiões desérticas ou montanhosas, onde podem meditar sob a luz solar direta.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "radiant-sun-bolt", name: "Raio de Sol Radiante", url: "/api/features/radiant-sun-bolt" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "searing-arc-strike", name: "Golpe de Arco Ardente", url: "/api/features/searing-arc-strike" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "searing-sunburst", name: "Explosão Solar Ardente", url: "/api/features/searing-sunburst" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "sun-shield", name: "Escudo Solar", url: "/api/features/sun-shield" }
      ]
    }
  ],
  url: "/api/subclasses/way-of-the-sun-soul",
},

{
  index: "way-of-the-drunken-master",
  name: "Caminho do Mestre Bêbado",
  class: { index: "monk", name: "Monge", url: "/api/classes/monk" },
  desc: [
    "O Caminho do Mestre Bêbado ensina seus estudantes a se mover com a irregularidade descoordenada de um bêbado.",
    "Um mestre bêbado cambaleia, tropeça e rola pelo campo de batalha, evitando qualquer golpe direcionado a eles e confundindo seus inimigos."
  ],
  subclass_flavor: "Apesar das aparências, um mestre bêbado está no controle de seus movimentos, usando a imprevisibilidade como uma arma.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "bonus-proficiencies-drunken-master", name: "Proficiências Adicionais", url: "/api/features/bonus-proficiencies-drunken-master" },
        { index: "drunken-technique", name: "Técnica do Bêbado", url: "/api/features/drunken-technique" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "tipsy-sway", name: "Balanço Cambaleante", url: "/api/features/tipsy-sway" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "drunkard-luck", name: "Sorte do Bêbado", url: "/api/features/drunkard-luck" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "intoxicated-frenzy", name: "Frenesi Intoxicado", url: "/api/features/intoxicated-frenzy" }
      ]
    }
  ],
  url: "/api/subclasses/way-of-the-drunken-master",
},

{
  index: "way-of-the-kensei",
  name: "Caminho do Kensei",
  class: { index: "monk", name: "Monge", url: "/api/classes/monk" },
  desc: [
    "Monges do Caminho do Kensei treinam incansavelmente com suas armas, até o ponto em que a arma se torna uma extensão do corpo.",
    "Fundada na maestria da espada, a tradição se expandiu para incluir muitas armas diferentes."
  ],
  subclass_flavor: "Um kensei vê uma arma da mesma forma que um calígrafo ou um pintor vê um pincel. Qualquer que seja a arma, o kensei a vê como uma ferramenta usada para expressar a beleza e precisão das artes marciais.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "path-of-the-kensei", name: "Caminho do Kensei", url: "/api/features/path-of-the-kensei" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "one-with-the-blade", name: "Um com a Lâmina", url: "/api/features/one-with-the-blade" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "sharpen-the-blade", name: "Afiar a Lâmina", url: "/api/features/sharpen-the-blade" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "unerring-accuracy", name: "Precisão Infalível", url: "/api/features/unerring-accuracy" }
      ]
    }
  ],
  url: "/api/subclasses/way-of-the-kensei",
},

{
  index: "way-of-mercy",
  name: "Caminho da Misericórdia",
  class: { index: "monk", name: "Monge", url: "/api/classes/monk" },
  desc: [
    "Monges do Caminho da Misericórdia aprendem a manipular a força vital dos outros para trazer ajuda aos necessitados.",
    "Eles são médicos errantes para os pobres e feridos. No entanto, para aqueles além da redenção, eles trazem uma morte rápida como ato de misericórdia."
  ],
  subclass_flavor: "Aqueles que seguem o Caminho da Misericórdia podem usar máscaras para ocultar suas identidades, seja para proteger sua privacidade ou como símbolo de transformação.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "implements-of-mercy", name: "Implementos da Misericórdia", url: "/api/features/implements-of-mercy" },
        { index: "hands-of-healing", name: "Mãos da Cura", url: "/api/features/hands-of-healing" },
        { index: "hands-of-harm", name: "Mãos do Dano", url: "/api/features/hands-of-harm" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "physicians-touch", name: "Toque do Médico", url: "/api/features/physicians-touch" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "flurry-of-healing-and-harm", name: "Rajada de Cura e Dano", url: "/api/features/flurry-of-healing-and-harm" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "hand-of-ultimate-mercy", name: "Mão da Misericórdia Suprema", url: "/api/features/hand-of-ultimate-mercy" }
      ]
    }
  ],
  url: "/api/subclasses/way-of-mercy",
},

{
  index: "way-of-the-astral-self",
  name: "Caminho do Eu Astral",
  class: { index: "monk", name: "Monge", url: "/api/classes/monk" },
  desc: [
    "Um monge que segue o Caminho do Eu Astral acredita que seu corpo é uma ilusão.",
    "Eles veem sua forma astral como seu verdadeiro eu e disciplinam suas mentes para despertar esse poder interior."
  ],
  subclass_flavor: "O eu astral é a forma espiritual de uma pessoa - a essência de sua alma que transcende limitações físicas.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "arms-of-the-astral-self", name: "Braços do Eu Astral", url: "/api/features/arms-of-the-astral-self" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "visage-of-the-astral-self", name: "Semblante do Eu Astral", url: "/api/features/visage-of-the-astral-self" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "body-of-the-astral-self", name: "Corpo do Eu Astral", url: "/api/features/body-of-the-astral-self" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "awakened-astral-self", name: "Eu Astral Desperto", url: "/api/features/awakened-astral-self" }
      ]
    }
  ],
  url: "/api/subclasses/way-of-the-astral-self",
},

  // ===========================
  // PALADINO SUBCLASSES
  // ===========================
  {
  index: "oath-of-the-ancients",
  name: "Juramento dos Anciões",
  class: { index: "paladin", name: "Paladino", url: "/api/classes/paladin" },
  desc: [
    "O Juramento dos Anciões é tão antigo quanto a raça dos elfos e os rituais dos druidas.",
    "Às vezes chamados de cavaleiros feéricos, cavaleiros verdes ou cavaleiros cornudos, paladinos que fazem esse juramento lançam sua sorte com o lado da luz na luta cósmica contra as trevas."
  ],
  subclass_flavor: "Eles amam a luz bonita e risonha do sol, a música do riacho, o sussurro do vento através das folhas de carvalho. Eles protegem estas coisas contra a escuridão que as ameaçaria.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "channel-divinity-ancients", name: "Canalizar Divindade", url: "/api/features/channel-divinity-ancients" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "aura-of-warding", name: "Aura de Proteção", url: "/api/features/aura-of-warding" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "undying-sentinel", name: "Sentinela Imortal", url: "/api/features/undying-sentinel" }
      ]
    },
    {
      level: 20,
      features: [
        { index: "elder-champion", name: "Campeão Ancião", url: "/api/features/elder-champion" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "ensnaring-strike", name: "Golpe Laçador", url: "/api/spells/ensnaring-strike" },
        { index: "speak-with-animals", name: "Falar com Animais", url: "/api/spells/speak-with-animals" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "moonbeam", name: "Raio Lunar", url: "/api/spells/moonbeam" },
        { index: "misty-step", name: "Passo Sombrio", url: "/api/spells/misty-step" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "plant-growth", name: "Crescimento Vegetal", url: "/api/spells/plant-growth" },
        { index: "protection-from-energy", name: "Proteção contra Energia", url: "/api/spells/protection-from-energy" }
      ]
    },
    {
      level: 13,
      spells: [
        { index: "ice-storm", name: "Tempestade de Gelo", url: "/api/spells/ice-storm" },
        { index: "stoneskin", name: "Pele de Pedra", url: "/api/spells/stoneskin" }
      ]
    },
    {
      level: 17,
      spells: [
        { index: "commune-with-nature", name: "Comunhão com a Natureza", url: "/api/spells/commune-with-nature" },
        { index: "tree-stride", name: "Caminhar em Árvores", url: "/api/spells/tree-stride" }
      ]
    }
  ],
  url: "/api/subclasses/oath-of-the-ancients",
},

{
  index: "oath-of-vengeance",
  name: "Juramento de Vingança",
  class: { index: "paladin", name: "Paladino", url: "/api/classes/paladin" },
  desc: [
    "O Juramento de Vingança é um comprometimento solene em punir aqueles que cometeram pecados terrivelmente graves.",
    "Quando forças do mal massacram aldeões indefesos, quando todo um povo se volta contra a vontade dos deuses, quando uma guilda de ladrões se torna muito violenta e poderosa, quando um dragão assola o interior - em momentos como esses, paladinos surgem e fazem o Juramento de Vingança."
  ],
  subclass_flavor: "Para esses paladinos - às vezes chamados vingadores ou cavaleiros sombrios - sua própria pureza não é tão importante quanto entregar justiça.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "channel-divinity-vengeance", name: "Canalizar Divindade", url: "/api/features/channel-divinity-vengeance" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "relentless-avenger", name: "Vingador Implacável", url: "/api/features/relentless-avenger" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "soul-of-vengeance", name: "Alma da Vingança", url: "/api/features/soul-of-vengeance" }
      ]
    },
    {
      level: 20,
      features: [
        { index: "avenging-angel", name: "Anjo Vingador", url: "/api/features/avenging-angel" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "bane", name: "Perdição", url: "/api/spells/bane" },
        { index: "hunters-mark", name: "Marca do Caçador", url: "/api/spells/hunters-mark" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "hold-person", name: "Prender Pessoa", url: "/api/spells/hold-person" },
        { index: "misty-step", name: "Passo Sombrio", url: "/api/spells/misty-step" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "haste", name: "Acelerar", url: "/api/spells/haste" },
        { index: "protection-from-energy", name: "Proteção contra Energia", url: "/api/spells/protection-from-energy" }
      ]
    },
    {
      level: 13,
      spells: [
        { index: "banishment", name: "Banimento", url: "/api/spells/banishment" },
        { index: "dimension-door", name: "Porta Dimensional", url: "/api/spells/dimension-door" }
      ]
    },
    {
      level: 17,
      spells: [
        { index: "hold-monster", name: "Prender Monstro", url: "/api/spells/hold-monster" },
        { index: "scrying", name: "Vidência", url: "/api/spells/scrying" }
      ]
    }
  ],
  url: "/api/subclasses/oath-of-vengeance",
},

// 🌟 SUBCLASSES ADICIONAIS (LIVROS DE EXPANSÃO):

{
  index: "oath-of-conquest",
  name: "Juramento de Conquista",
  class: { index: "paladin", name: "Paladino", url: "/api/classes/paladin" },
  desc: [
    "O Juramento de Conquista clama por esmagamento dos inimigos de ordem e lei por qualquer meio necessário.",
    "Os paladinos que fazem esse juramento são conhecidos como conquistadores, cavaleiros de ferro ou cavaleiros de ferro."
  ],
  subclass_flavor: "Alguns desses paladinos vão tão longe a ponto de consorciar com os poderes dos Nove Infernos, valorizando o domínio da lei acima da pureza de seus corações.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "channel-divinity-conquest", name: "Canalizar Divindade", url: "/api/features/channel-divinity-conquest" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "aura-of-conquest", name: "Aura de Conquista", url: "/api/features/aura-of-conquest" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "scornful-rebuke", name: "Repreensão Desdenhosa", url: "/api/features/scornful-rebuke" }
      ]
    },
    {
      level: 20,
      features: [
        { index: "invincible-conqueror", name: "Conquistador Invencível", url: "/api/features/invincible-conqueror" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "armor-of-agathys", name: "Armadura de Agathys", url: "/api/spells/armor-of-agathys" },
        { index: "command", name: "Comando", url: "/api/spells/command" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "hold-person", name: "Prender Pessoa", url: "/api/spells/hold-person" },
        { index: "spiritual-weapon", name: "Arma Espiritual", url: "/api/spells/spiritual-weapon" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "bestow-curse", name: "Lançar Maldição", url: "/api/spells/bestow-curse" },
        { index: "fear", name: "Medo", url: "/api/spells/fear" }
      ]
    },
    {
      level: 13,
      spells: [
        { index: "dominate-beast", name: "Dominar Fera", url: "/api/spells/dominate-beast" },
        { index: "stoneskin", name: "Pele de Pedra", url: "/api/spells/stoneskin" }
      ]
    },
    {
      level: 17,
      spells: [
        { index: "cloudkill", name: "Nuvem Mortal", url: "/api/spells/cloudkill" },
        { index: "dominate-person", name: "Dominar Pessoa", url: "/api/spells/dominate-person" }
      ]
    }
  ],
  url: "/api/subclasses/oath-of-conquest",
},

{
  index: "oath-of-redemption",
  name: "Juramento de Redenção",
  class: { index: "paladin", name: "Paladino", url: "/api/classes/paladin" },
  desc: [
    "O Juramento de Redenção coloca um paladino no caminho da busca de paz através de sua própria palavra e ações.",
    "Esses paladinos acreditam que qualquer pessoa pode ser redimida e que o caminho da benevolência e justiça é o que todos devem trilhar."
  ],
  subclass_flavor: "Esses paladinos enfrentam o mal onde quer que o encontrem, mas show mercy para àqueles que encontraram e chegaram ao arrependimento pela maldade.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "channel-divinity-redemption", name: "Canalizar Divindade", url: "/api/features/channel-divinity-redemption" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "aura-of-the-guardian", name: "Aura do Guardião", url: "/api/features/aura-of-the-guardian" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "protective-spirit", name: "Espírito Protetor", url: "/api/features/protective-spirit" }
      ]
    },
    {
      level: 20,
      features: [
        { index: "emissary-of-redemption", name: "Emissário da Redenção", url: "/api/features/emissary-of-redemption" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "sanctuary", name: "Santuário", url: "/api/spells/sanctuary" },
        { index: "sleep", name: "Sono", url: "/api/spells/sleep" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "calm-emotions", name: "Acalmar Emoções", url: "/api/spells/calm-emotions" },
        { index: "hold-person", name: "Prender Pessoa", url: "/api/spells/hold-person" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "counterspell", name: "Contra-atacar", url: "/api/spells/counterspell" },
        { index: "hypnotic-pattern", name: "Padrão Hipnótico", url: "/api/spells/hypnotic-pattern" }
      ]
    },
    {
      level: 13,
      spells: [
        { index: "otiluke-resilient-sphere", name: "Esfera Resistente de Otiluke", url: "/api/spells/otiluke-resilient-sphere" },
        { index: "stoneskin", name: "Pele de Pedra", url: "/api/spells/stoneskin" }
      ]
    },
    {
      level: 17,
      spells: [
        { index: "hold-monster", name: "Prender Monstro", url: "/api/spells/hold-monster" },
        { index: "wall-of-force", name: "Muralha de Força", url: "/api/spells/wall-of-force" }
      ]
    }
  ],
  url: "/api/subclasses/oath-of-redemption",
},

{
  index: "oath-of-glory",
  name: "Juramento da Glória",
  class: { index: "paladin", name: "Paladino", url: "/api/classes/paladin" },
  desc: [
    "Paladinos que fazem o Juramento da Glória acreditam que eles e seus companheiros estão destinados a alcançar glória através de feitos de heroísmo.",
    "Eles se esforçam para responder aos desafios dignos de lenda."
  ],
  subclass_flavor: "Esses paladinos aspiram destino. Com suas ações, eles esperam garantir seu lugar nas lendas.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "channel-divinity-glory", name: "Canalizar Divindade", url: "/api/features/channel-divinity-glory" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "aura-of-alacrity", name: "Aura de Prontidão", url: "/api/features/aura-of-alacrity" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "glorious-defense", name: "Defesa Gloriosa", url: "/api/features/glorious-defense" }
      ]
    },
    {
      level: 20,
      features: [
        { index: "living-legend", name: "Lenda Viva", url: "/api/features/living-legend" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "guiding-bolt", name: "Raio Guiador", url: "/api/spells/guiding-bolt" },
        { index: "heroism", name: "Heroísmo", url: "/api/spells/heroism" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "enhance-ability", name: "Fortalecer Habilidade", url: "/api/spells/enhance-ability" },
        { index: "magic-weapon", name: "Arma Mágica", url: "/api/spells/magic-weapon" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "haste", name: "Acelerar", url: "/api/spells/haste" },
        { index: "protection-from-energy", name: "Proteção contra Energia", url: "/api/spells/protection-from-energy" }
      ]
    },
    {
      level: 13,
      spells: [
        { index: "compulsion", name: "Compulsão", url: "/api/spells/compulsion" },
        { index: "freedom-of-movement", name: "Liberdade de Movimento", url: "/api/spells/freedom-of-movement" }
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
  url: "/api/subclasses/oath-of-glory",
},

{
  index: "oath-of-the-watchers",
  name: "Juramento dos Vigilantes",
  class: { index: "paladin", name: "Paladino", url: "/api/classes/paladin" },
  desc: [
    "O Juramento dos Vigilantes vincula paladinos a vigiar contra as forças que se originam além do Reino Material.",
    "Muitas ameaças aos humanos, elfos, anões e outras raças nativas do Reino Material se originam nos outros planos de existência."
  ],
  subclass_flavor: "Os Vigilantes buscam manter essas ameaças à distância, mantendo vigília eterna contra invasores de outros planos.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "channel-divinity-watchers", name: "Canalizar Divindade", url: "/api/features/channel-divinity-watchers" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "aura-of-the-sentinel", name: "Aura do Sentinela", url: "/api/features/aura-of-the-sentinel" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "vigilant-rebuke", name: "Repreensão Vigilante", url: "/api/features/vigilant-rebuke" }
      ]
    },
    {
      level: 20,
      features: [
        { index: "mortal-bulwark", name: "Baluarte Mortal", url: "/api/features/mortal-bulwark" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "alarm", name: "Alarme", url: "/api/spells/alarm" },
        { index: "detect-magic", name: "Detectar Magia", url: "/api/spells/detect-magic" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "moonbeam", name: "Raio Lunar", url: "/api/spells/moonbeam" },
        { index: "see-invisibility", name: "Ver o Invisível", url: "/api/spells/see-invisibility" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "counterspell", name: "Contra-atacar", url: "/api/spells/counterspell" },
        { index: "nondetection", name: "Indetectabilidade", url: "/api/spells/nondetection" }
      ]
    },
    {
      level: 13,
      spells: [
        { index: "aura-of-purity", name: "Aura de Pureza", url: "/api/spells/aura-of-purity" },
        { index: "banishment", name: "Banimento", url: "/api/spells/banishment" }
      ]
    },
    {
      level: 17,
      spells: [
        { index: "hold-monster", name: "Prender Monstro", url: "/api/spells/hold-monster" },
        { index: "scrying", name: "Vidência", url: "/api/spells/scrying" }
      ]
    }
  ],
  url: "/api/subclasses/oath-of-the-watchers",
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

  {
  index: "gloom-stalker",
  name: "Perseguidor da Penumbra",
  class: { index: "ranger", name: "Patrulheiro", url: "/api/classes/ranger" },
  desc: [
    "Perseguidores da Penumbra são em casa nas regiões mais sombrias: cavernas profundas, florestas sombrias, e o Plano Sombrio.",
    "Eles são caçadores cujas habilidades são aprimoradas pela magia sombria da Umbral, dando-lhes uma vantagem sobrenatural contra seus inimigos."
  ],
  subclass_flavor: "Muitos patrulheiros empunham magia, mas poucos podem reivindicar possuir poderes tão sinistros quanto aqueles dos Perseguidores da Penumbra.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "gloom-stalker-magic", name: "Magia do Perseguidor da Penumbra", url: "/api/features/gloom-stalker-magic" },
        { index: "dread-ambusher", name: "Emboscador Terrível", url: "/api/features/dread-ambusher" },
        { index: "umbral-sight", name: "Visão Umbral", url: "/api/features/umbral-sight" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "iron-mind", name: "Mente de Ferro", url: "/api/features/iron-mind" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "stalkers-flurry", name: "Rajada do Perseguidor", url: "/api/features/stalkers-flurry" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "shadowy-dodge", name: "Esquiva Sombria", url: "/api/features/shadowy-dodge" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "disguise-self", name: "Disfarçar-se", url: "/api/spells/disguise-self" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "rope-trick", name: "Truque da Corda", url: "/api/spells/rope-trick" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "fear", name: "Medo", url: "/api/spells/fear" }
      ]
    },
    {
      level: 13,
      spells: [
        { index: "greater-invisibility", name: "Invisibilidade Maior", url: "/api/spells/greater-invisibility" }
      ]
    },
    {
      level: 17,
      spells: [
        { index: "seeming", name: "Aparência", url: "/api/spells/seeming" }
      ]
    }
  ],
  url: "/api/subclasses/gloom-stalker",
},

{
  index: "horizon-walker",
  name: "Andarilho do Horizonte",
  class: { index: "ranger", name: "Patrulheiro", url: "/api/classes/ranger" },
  desc: [
    "Andarilhos do Horizonte guardam o mundo contra ameaças que se originam de outros planos ou que buscam devastar o mundo mortal com magia planar.",
    "Eles buscam portais para outros planos e observam aqueles que os atravessam."
  ],
  subclass_flavor: "Estes patrulheiros são também conhecidos como guardiões planares, tendo a responsabilidade de proteger os limites entre os planos de existência.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "horizon-walker-magic", name: "Magia do Andarilho do Horizonte", url: "/api/features/horizon-walker-magic" },
        { index: "detect-portal", name: "Detectar Portal", url: "/api/features/detect-portal" },
        { index: "planar-warrior", name: "Guerreiro Planar", url: "/api/features/planar-warrior" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "ethereal-step", name: "Passo Etéreo", url: "/api/features/ethereal-step" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "distant-strike", name: "Golpe Distante", url: "/api/features/distant-strike" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "spectral-defense", name: "Defesa Espectral", url: "/api/features/spectral-defense" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "protection-from-evil-and-good", name: "Proteção contra o Bem e Mal", url: "/api/spells/protection-from-evil-and-good" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "misty-step", name: "Passo Sombrio", url: "/api/spells/misty-step" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "haste", name: "Acelerar", url: "/api/spells/haste" }
      ]
    },
    {
      level: 13,
      spells: [
        { index: "banishment", name: "Banimento", url: "/api/spells/banishment" }
      ]
    },
    {
      level: 17,
      spells: [
        { index: "teleportation-circle", name: "Círculo de Teletransporte", url: "/api/spells/teleportation-circle" }
      ]
    }
  ],
  url: "/api/subclasses/horizon-walker",
},

{
  index: "monster-slayer",
  name: "Matador de Monstros",
  class: { index: "ranger", name: "Patrulheiro", url: "/api/classes/ranger" },
  desc: [
    "Você se dedicou especificamente a caçar criaturas da noite e usuários de magia negra.",
    "Um Matador de Monstros busca e estuda seus adversários para aprender suas fraquezas."
  ],
  subclass_flavor: "Matadores de Monstros são especialistas em derrotar criaturas sobrenaturais, desde vampiros e liches até demônios e diabos.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "monster-slayer-magic", name: "Magia do Matador de Monstros", url: "/api/features/monster-slayer-magic" },
        { index: "hunters-sense", name: "Sentido do Caçador", url: "/api/features/hunters-sense" },
        { index: "slayers-prey", name: "Presa do Matador", url: "/api/features/slayers-prey" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "supernatural-defense", name: "Defesa Sobrenatural", url: "/api/features/supernatural-defense" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "magic-users-nemesis", name: "Nêmesis dos Usuários de Magia", url: "/api/features/magic-users-nemesis" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "slayers-counter", name: "Contra-ataque do Matador", url: "/api/features/slayers-counter" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "protection-from-evil-and-good", name: "Proteção contra o Bem e Mal", url: "/api/spells/protection-from-evil-and-good" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "zone-of-truth", name: "Zona da Verdade", url: "/api/spells/zone-of-truth" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "magic-circle", name: "Círculo Mágico", url: "/api/spells/magic-circle" }
      ]
    },
    {
      level: 13,
      spells: [
        { index: "banishment", name: "Banimento", url: "/api/spells/banishment" }
      ]
    },
    {
      level: 17,
      spells: [
        { index: "hold-monster", name: "Prender Monstro", url: "/api/spells/hold-monster" }
      ]
    }
  ],
  url: "/api/subclasses/monster-slayer",
},

{
  index: "fey-wanderer",
  name: "Andarilho Feérico",
  class: { index: "ranger", name: "Patrulheiro", url: "/api/classes/ranger" },
  desc: [
    "Um Andarilho Feérico caminha entre dois mundos, guiado por uma conexão com o Feywild.",
    "Sua magia é influenciada pelas fadas que eles encontraram, e eles descobriram que palavras têm poder - tanto para curar quanto para machucar."
  ],
  subclass_flavor: "Estes patrulheiros servem como embaixadores entre os mundos mortal e feérico, protegendo ambos dos perigos que ameaçam sua harmonia.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "fey-wanderer-magic", name: "Magia do Andarilho Feérico", url: "/api/features/fey-wanderer-magic" },
        { index: "otherworldly-glamour", name: "Glamour Sobrenatural", url: "/api/features/otherworldly-glamour" },
        { index: "dreadful-strikes", name: "Golpes Terríveis", url: "/api/features/dreadful-strikes" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "beguiling-twist", name: "Reviravolta Sedutora", url: "/api/features/beguiling-twist" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "fey-reinforcements", name: "Reforços Feéricos", url: "/api/features/fey-reinforcements" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "misty-wanderer", name: "Andarilho Sombrio", url: "/api/features/misty-wanderer" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "charm-person", name: "Encantar Pessoa", url: "/api/spells/charm-person" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "misty-step", name: "Passo Sombrio", url: "/api/spells/misty-step" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "dispel-magic", name: "Dissipar Magia", url: "/api/spells/dispel-magic" }
      ]
    },
    {
      level: 13,
      spells: [
        { index: "dimension-door", name: "Porta Dimensional", url: "/api/spells/dimension-door" }
      ]
    },
    {
      level: 17,
      spells: [
        { index: "mislead", name: "Enganar", url: "/api/spells/mislead" }
      ]
    }
  ],
  url: "/api/subclasses/fey-wanderer",
},

{
  index: "swarmkeeper",
  name: "Guardião do Enxame",
  class: { index: "ranger", name: "Patrulheiro", url: "/api/classes/ranger" },
  desc: [
    "Sentindo uma conexão profunda com o mundo ao seu redor, você aprendeu a formar uma ligação poderosa com um enxame de criaturas da natureza.",
    "Seu enxame pode tomar a forma de vespas, besouros, fadas minúsculas, ou outras criaturas pequenas."
  ],
  subclass_flavor: "Estes patrulheiros comandam enxames de criaturas naturais para ajudá-los em combate e exploração, formando uma simbiose única com a natureza.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "swarmkeeper-magic", name: "Magia do Guardião do Enxame", url: "/api/features/swarmkeeper-magic" },
        { index: "gathered-swarm", name: "Enxame Reunido", url: "/api/features/gathered-swarm" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "writhing-tide", name: "Maré Retorcida", url: "/api/features/writhing-tide" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "mighty-swarm", name: "Enxame Poderoso", url: "/api/features/mighty-swarm" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "swarming-dispersal", name: "Dispersão do Enxame", url: "/api/features/swarming-dispersal" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "faerie-fire", name: "Fogo das Fadas", url: "/api/spells/faerie-fire" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "web", name: "Teia", url: "/api/spells/web" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "gaseous-form", name: "Forma Gasosa", url: "/api/spells/gaseous-form" }
      ]
    },
    {
      level: 13,
      spells: [
        { index: "arcane-eye", name: "Olho Arcano", url: "/api/spells/arcane-eye" }
      ]
    },
    {
      level: 17,
      spells: [
        { index: "insect-plague", name: "Praga de Insetos", url: "/api/spells/insect-plague" }
      ]
    }
  ],
  url: "/api/subclasses/swarmkeeper",
},

{
  index: "drakewarden",
  name: "Guardião do Drake",
  class: { index: "ranger", name: "Patrulheiro", url: "/api/classes/ranger" },
  desc: [
    "Seu vínculo com o mundo natural toma a forma de um companheiro dracônico.",
    "Como você avança no poder, seu drake se desenvolve em um dragão menor capaz de montar, eventualmente se tornando uma criatura verdadeiramente formidável."
  ],
  subclass_flavor: "Estes patrulheiros forjam uma ligação especial com drakes jovens, criando uma parceria que cresce em poder com o tempo.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "drakewarden-magic", name: "Magia do Guardião do Drake", url: "/api/features/drakewarden-magic" },
        { index: "draconic-gift", name: "Dádiva Dracônica", url: "/api/features/draconic-gift" },
        { index: "drake-companion", name: "Companheiro Drake", url: "/api/features/drake-companion" }
      ]
    },
    {
      level: 7,
      features: [
        { index: "bond-of-fang-and-scale", name: "Laço de Presa e Escama", url: "/api/features/bond-of-fang-and-scale" }
      ]
    },
    {
      level: 11,
      features: [
        { index: "drakes-breath", name: "Sopro do Drake", url: "/api/features/drakes-breath" }
      ]
    },
    {
      level: 15,
      features: [
        { index: "perfected-bond", name: "Laço Aperfeiçoado", url: "/api/features/perfected-bond" }
      ]
    }
  ],
  spells: [
    {
      level: 3,
      spells: [
        { index: "thaumaturgy", name: "Taumaturgia", url: "/api/spells/thaumaturgy" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "dragon-breath", name: "Sopro do Dragão", url: "/api/spells/dragon-breath" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "fear", name: "Medo", url: "/api/spells/fear" }
      ]
    },
    {
      level: 13,
      spells: [
        { index: "elemental-bane", name: "Perdição Elemental", url: "/api/spells/elemental-bane" }
      ]
    },
    {
      level: 17,
      spells: [
        { index: "summon-draconic-spirit", name: "Invocar Espírito Dracônico", url: "/api/spells/summon-draconic-spirit" }
      ]
    }
  ],
  url: "/api/subclasses/drakewarden",
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

  {
  index: "mastermind",
  name: "Mente Mestra",
  class: { index: "rogue", name: "Ladino", url: "/api/classes/rogue" },
  desc: [
    "Sua foco está na arte de intriga. Uma mente mestra é um especialista em manipulação, mestre de disfarce e ás do engano.",
    "Você tem capacidade para urdir esquemas intrincados e orquestrar planos complexos."
  ],
  subclass_flavor: "Muitos espiões, cortesãos, e esquemeiros seguem esse arquétipo, liderando redes de informantes e implementando planos que podem mudar o curso da história.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "master-of-intrigue", name: "Mestre da Intriga", url: "/api/features/master-of-intrigue" },
        { index: "master-of-tactics", name: "Mestre de Táticas", url: "/api/features/master-of-tactics" }
      ]
    },
    {
      level: 9,
      features: [
        { index: "insightful-manipulator", name: "Manipulador Perspicaz", url: "/api/features/insightful-manipulator" }
      ]
    },
    {
      level: 13,
      features: [
        { index: "misdirection", name: "Desorientação", url: "/api/features/misdirection" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "soul-of-deceit", name: "Alma do Engano", url: "/api/features/soul-of-deceit" }
      ]
    }
  ],
  url: "/api/subclasses/mastermind",
},

{
  index: "scout",
  name: "Batedor",
  class: { index: "rogue", name: "Ladino", url: "/api/classes/rogue" },
  desc: [
    "Você é habilidoso em furtividade e sobrevivência, longe das ruas de uma cidade e nos rincões selvagens.",
    "Você é longe mais em casa nas regiões selvagens do que na civilização, e você está disposto a viajar longas distâncias para alcançar seu objetivo."
  ],
  subclass_flavor: "Muitos batedores são contratados como guias, rastreadores ou espiões. Alguns são parte de grupos militares, enquanto outros trabalham sozinhos.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "skirmisher", name: "Escaramuçador", url: "/api/features/skirmisher" },
        { index: "survivalist", name: "Sobrevivencialista", url: "/api/features/survivalist" }
      ]
    },
    {
      level: 9,
      features: [
        { index: "superior-mobility", name: "Mobilidade Superior", url: "/api/features/superior-mobility" }
      ]
    },
    {
      level: 13,
      features: [
        { index: "ambush-master", name: "Mestre da Emboscada", url: "/api/features/ambush-master" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "sudden-strike", name: "Golpe Súbito", url: "/api/features/sudden-strike" }
      ]
    }
  ],
  url: "/api/subclasses/scout",
},

{
  index: "swashbuckler",
  name: "Espadachim",
  class: { index: "rogue", name: "Ladino", url: "/api/classes/rogue" },
  desc: [
    "Você se foca nos elementos do combate e social que requerem elegância, panache e charme.",
    "Um espadachim excele em combate singular, especialmente contra alvos únicos."
  ],
  subclass_flavor: "Alguns espadachins são nobres decadentes que se voltaram para aventuras, enquanto outros são plebeus que se elevaram para nobres através de sua sagacidade e charme.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "fancy-footwork", name: "Trabalho de Pés Elegante", url: "/api/features/fancy-footwork" },
        { index: "rakish-audacity", name: "Audácia Libertina", url: "/api/features/rakish-audacity" }
      ]
    },
    {
      level: 9,
      features: [
        { index: "panache", name: "Panache", url: "/api/features/panache" }
      ]
    },
    {
      level: 13,
      features: [
        { index: "elegant-maneuver", name: "Manobra Elegante", url: "/api/features/elegant-maneuver" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "master-duelist", name: "Mestre Duelista", url: "/api/features/master-duelist" }
      ]
    }
  ],
  url: "/api/subclasses/swashbuckler",
},

{
  index: "inquisitive",
  name: "Investigativo",
  class: { index: "rogue", name: "Ladino", url: "/api/classes/rogue" },
  desc: [
    "Como um arqueótipo, um Investigativo excede em desenrolar mistérios, rastreando rastros e descobrindo a verdade por trás de esquemas e crimes.",
    "Um investigativo mestre vê detalhes que outros perdem, faz conexões que outros não fazem, e resolve casos que outros consideram sem solução."
  ],
  subclass_flavor: "Muitos investigativos trabalham dentro do sistema legal como detetives, agentes do governo ou consultores privados. Outros operam nas margens da sociedade.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "ear-for-deceit", name: "Ouvido para Mentiras", url: "/api/features/ear-for-deceit" },
        { index: "eye-for-detail", name: "Olho para Detalhes", url: "/api/features/eye-for-detail" },
        { index: "insightful-fighting", name: "Combate Perspicaz", url: "/api/features/insightful-fighting" }
      ]
    },
    {
      level: 9,
      features: [
        { index: "steady-eye", name: "Olho Firme", url: "/api/features/steady-eye" }
      ]
    },
    {
      level: 13,
      features: [
        { index: "unerring-eye", name: "Olho Infalível", url: "/api/features/unerring-eye" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "eye-for-weakness", name: "Olho para Fraquezas", url: "/api/features/eye-for-weakness" }
      ]
    }
  ],
  url: "/api/subclasses/inquisitive",
},

{
  index: "soulknife",
  name: "Lâmina Psíquica",
  class: { index: "rogue", name: "Ladino", url: "/api/classes/rogue" },
  desc: [
    "A maioria dos assassinos depende das lâminas físicas, mas um Lâmina Psíquica manifesta uma lâmina psíquica formada de energia mental.",
    "Essa energia é uma projeção das ansiedades e dores emocionais da pessoa, dando forma física às tribulações mentais do indivíduo."
  ],
  subclass_flavor: "A lâmina psíquica é tanto uma arma quanto uma ferramenta, capaz de cortar através da matéria física e também através da própria psique.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "psionic-power-rogue", name: "Poder Psíquico", url: "/api/features/psionic-power-rogue" },
        { index: "psychic-blades-soulknife", name: "Lâminas Psíquicas", url: "/api/features/psychic-blades-soulknife" }
      ]
    },
    {
      level: 9,
      features: [
        { index: "soul-blades", name: "Lâminas da Alma", url: "/api/features/soul-blades" }
      ]
    },
    {
      level: 13,
      features: [
        { index: "psychic-veil", name: "Véu Psíquico", url: "/api/features/psychic-veil" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "rend-mind", name: "Rasgar a Mente", url: "/api/features/rend-mind" }
      ]
    }
  ],
  url: "/api/subclasses/soulknife",
},

{
  index: "phantom",
  name: "Fantasma",
  class: { index: "rogue", name: "Ladino", url: "/api/classes/rogue" },
  desc: [
    "Muitos ladinos caminham uma linha fina entre vida e morte, arriscando suas próprias vidas e tomando as vidas de outros.",
    "Enquanto aventureiros de muitas classes se encontram em situações perigosas, ladinos regularmente adquirem suas habilidades e sustento em empreendimentos que ameaçam suas vidas."
  ],
  subclass_flavor: "Fantasmas fazem uma conexão com os espíritos dos mortos, usando essa ligação para alcançar capacidades sobrenaturais.",
  subclass_levels: [
    {
      level: 3,
      features: [
        { index: "whispers-of-the-dead", name: "Sussurros dos Mortos", url: "/api/features/whispers-of-the-dead" },
        { index: "wails-from-the-grave", name: "Lamentos do Túmulo", url: "/api/features/wails-from-the-grave" }
      ]
    },
    {
      level: 9,
      features: [
        { index: "tokens-of-the-departed", name: "Símbolos dos Mortos", url: "/api/features/tokens-of-the-departed" }
      ]
    },
    {
      level: 13,
      features: [
        { index: "ghost-walk", name: "Caminhada Fantasma", url: "/api/features/ghost-walk" }
      ]
    },
    {
      level: 17,
      features: [
        { index: "deaths-friend", name: "Amigo da Morte", url: "/api/features/deaths-friend" }
      ]
    }
  ],
  url: "/api/subclasses/phantom",
},

  // ===========================
  // FEITICEIRO SUBCLASSES
  // ===========================
  

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

  {
  index: "divine-soul",
  name: "Alma Divina",
  class: { index: "sorcerer", name: "Feiticeiro", url: "/api/classes/sorcerer" },
  desc: [
    "Às vezes a centelha de magia que alimenta um feiticeiro vem de uma fonte divina que brilha dentro da alma.",
    "Tendo uma alma divina, sua magia inata pode vir dos planos superiores dos Nove Céus ou dos planos inferiores dos Nove Infernos."
  ],
  subclass_flavor: "Você é um favorito dos deuses, um filho de um ser celestial ou demoníaco, ou um indivíduo exposto a forças divinas.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "divine-magic", name: "Magia Divina", url: "/api/features/divine-magic" },
        { index: "favored-by-the-gods", name: "Favorecido pelos Deuses", url: "/api/features/favored-by-the-gods" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "empowered-healing", name: "Cura Fortalecida", url: "/api/features/empowered-healing" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "otherworldly-wings", name: "Asas Sobrenaturais", url: "/api/features/otherworldly-wings" }
      ]
    },
    {
      level: 18,
      features: [
        { index: "unearthly-recovery", name: "Recuperação Sobrenatural", url: "/api/features/unearthly-recovery" }
      ]
    }
  ],
  url: "/api/subclasses/divine-soul",
},

{
  index: "storm-sorcery",
  name: "Feitiçaria da Tempestade",
  class: { index: "sorcerer", name: "Feiticeiro", url: "/api/classes/sorcerer" },
  desc: [
    "Sua magia inata vem do poder dos elementos. Muitos com esse poder podem rastrear sua magia de volta a uma exposição próxima aos Planos Elementais.",
    "A influência de tais exposições pode resultar em marcas de nascimento que se assemelham a padrões naturais e seres podem sentir sua magia como uma brisa fresca ou o cheiro de chuva."
  ],
  subclass_flavor: "A família de um feiticeiro da tempestade pode ter origem de algum evento dramático envolvendo os elementais do ar ou água.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "wind-speaker", name: "Orador do Vento", url: "/api/features/wind-speaker" },
        { index: "tempestuous-magic", name: "Magia Tempestuosa", url: "/api/features/tempestuous-magic" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "heart-of-the-storm", name: "Coração da Tempestade", url: "/api/features/heart-of-the-storm" },
        { index: "storm-guide", name: "Guia da Tempestade", url: "/api/features/storm-guide" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "storms-fury", name: "Fúria da Tempestade", url: "/api/features/storms-fury" }
      ]
    },
    {
      level: 18,
      features: [
        { index: "wind-soul", name: "Alma do Vento", url: "/api/features/wind-soul" }
      ]
    }
  ],
  url: "/api/subclasses/storm-sorcery",
},

{
  index: "shadow-magic",
  name: "Magia Sombria",
  class: { index: "sorcerer", name: "Feiticeiro", url: "/api/classes/sorcerer" },
  desc: [
    "Você é uma criatura da sombra, pois sua magia inata vem do próprio Shadowfell.",
    "Você pode ter traçado essa influência sombria até uma entidade do Shadowfell, ou você pode ter sido exposto à energia sombria e transformado por ela."
  ],
  subclass_flavor: "O poder da magia sombria lança uma pálida sinistra sobre sua aparência física. Centelhas de escuridão dançam em seus olhos quando você está irritado ou excitado.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "eyes-of-the-dark", name: "Olhos da Escuridão", url: "/api/features/eyes-of-the-dark" },
        { index: "strength-of-the-grave", name: "Força do Túmulo", url: "/api/features/strength-of-the-grave" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "hound-of-ill-omen", name: "Cão de Mau Agouro", url: "/api/features/hound-of-ill-omen" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "shadow-walk", name: "Caminhada Sombria", url: "/api/features/shadow-walk" }
      ]
    },
    {
      level: 18,
      features: [
        { index: "umbral-form", name: "Forma Umbral", url: "/api/features/umbral-form" }
      ]
    }
  ],
  url: "/api/subclasses/shadow-magic",
},

{
  index: "clockwork-soul",
  name: "Alma Mecânica",
  class: { index: "sorcerer", name: "Feiticeiro", url: "/api/classes/sorcerer" },
  desc: [
    "A centelha cósmica de ordem que move os planos de Mechanus se enraizou em sua alma.",
    "Que essa influência viesse através de exposição ancestral a modrons, uma infusão de energia axiomatic, ou alguma outra fonte, você pode canalizar a força da ordem absoluta."
  ],
  subclass_flavor: "Isso se manifesta como a capacidade de diminuir a aleatoriedade da magia, tornando as magias mais confiáveis ​​mesmo quando elas se recusam a cooperar.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "clockwork-magic", name: "Magia Mecânica", url: "/api/features/clockwork-magic" },
        { index: "restore-balance", name: "Restaurar Equilíbrio", url: "/api/features/restore-balance" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "bastion-of-law", name: "Bastião da Lei", url: "/api/features/bastion-of-law" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "trance-of-order", name: "Transe da Ordem", url: "/api/features/trance-of-order" }
      ]
    },
    {
      level: 18,
      features: [
        { index: "clockwork-cavalcade", name: "Cavalgada Mecânica", url: "/api/features/clockwork-cavalcade" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "alarm", name: "Alarme", url: "/api/spells/alarm" },
        { index: "protection-from-evil-and-good", name: "Proteção contra Bem e Mal", url: "/api/spells/protection-from-evil-and-good" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "aid", name: "Ajuda", url: "/api/spells/aid" },
        { index: "lesser-restoration", name: "Restauração Menor", url: "/api/spells/lesser-restoration" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "dispel-magic", name: "Dissipar Magia", url: "/api/spells/dispel-magic" },
        { index: "protection-from-energy", name: "Proteção contra Energia", url: "/api/spells/protection-from-energy" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "freedom-of-movement", name: "Liberdade de Movimento", url: "/api/spells/freedom-of-movement" },
        { index: "summon-construct", name: "Invocar Constructo", url: "/api/spells/summon-construct" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "greater-restoration", name: "Restauração Maior", url: "/api/spells/greater-restoration" },
        { index: "wall-of-force", name: "Muralha de Força", url: "/api/spells/wall-of-force" }
      ]
    }
  ],
  url: "/api/subclasses/clockwork-soul",
},

{
  index: "aberrant-mind",
  name: "Mente Aberrante",
  class: { index: "sorcerer", name: "Feiticeiro", url: "/api/classes/sorcerer" },
  desc: [
    "Uma força alienígena tocou sua mente e moldou sua magia. Essa força pode vir de algum horror Far Realm ou pode ser o vestígio de invasão por flayer mental.",
    "Você não pode confiar completamente em sua própria mente, mas ganhou capacidades psíquicas bizarras e potentes."
  ],
  subclass_flavor: "Como um feiticeiro da Mente Aberrante, você decidiu aceitar essa influência corrupta ou lutar contra ela, canalizando sua magia psíquica de formas úteis.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "aberrant-mind-spells", name: "Magias da Mente Aberrante", url: "/api/features/aberrant-mind-spells" },
        { index: "telepathic-speech", name: "Fala Telepática", url: "/api/features/telepathic-speech" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "psionic-spells", name: "Magias Psíquicas", url: "/api/features/psionic-spells" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "psychic-defenses", name: "Defesas Psíquicas", url: "/api/features/psychic-defenses" }
      ]
    },
    {
      level: 18,
      features: [
        { index: "warping-implosion", name: "Implosão Distorcida", url: "/api/features/warping-implosion" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "mind-spike", name: "Espinho Mental", url: "/api/spells/mind-spike" },
        { index: "silvery-barbs", name: "Farpas Prateadas", url: "/api/spells/silvery-barbs" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "calm-emotions", name: "Acalmar Emoções", url: "/api/spells/calm-emotions" },
        { index: "detect-thoughts", name: "Detectar Pensamentos", url: "/api/spells/detect-thoughts" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "enemies-abound", name: "Inimigos por Toda Parte", url: "/api/spells/enemies-abound" },
        { index: "sending", name: "Enviar Mensagem", url: "/api/spells/sending" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "summon-aberration", name: "Invocar Aberração", url: "/api/spells/summon-aberration" },
        { index: "evards-black-tentacles", name: "Tentáculos Negros de Evard", url: "/api/spells/evards-black-tentacles" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "modify-memory", name: "Modificar Memória", url: "/api/spells/modify-memory" },
        { index: "telekinesis", name: "Telecinesia", url: "/api/spells/telekinesis" }
      ]
    }
  ],
  url: "/api/subclasses/aberrant-mind",
},

  // ===========================
  // BRUXO SUBCLASSES
  // ===========================
  {
  index: "the-archfey",
  name: "O Arquifada",
  class: { index: "warlock", name: "Bruxo", url: "/api/classes/warlock" },
  desc: [
    "Seu patrono é um senhor ou senhora das fadas, uma criatura de lenda que detém segredos que foram esquecidos antes das raças mortais nascerem.",
    "As motivações desses seres são muitas vezes inescrutáveis, e às vezes caprichosas, e podem envolver esforços para adquirir objetos mágicos maiores ou estabelecer pactos místicos."
  ],
  subclass_flavor: "Seres desse tipo incluem o Príncipe do Gelo; a Rainha do Ar e Escuridão, governante da Corte Sombria; Titania da Corte de Verão; seu consorte Oberon, o Senhor Verde; Hyrsam, o Príncipe dos Tolos; e antigas hag como Baba Yaga.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "fey-presence", name: "Presença Feérica", url: "/api/features/fey-presence" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "misty-escape", name: "Fuga Nebulosa", url: "/api/features/misty-escape" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "beguiling-defenses", name: "Defesas Sedutoras", url: "/api/features/beguiling-defenses" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "dark-delirium", name: "Delírio Sombrio", url: "/api/features/dark-delirium" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "faerie-fire", name: "Fogo das Fadas", url: "/api/spells/faerie-fire" },
        { index: "sleep", name: "Sono", url: "/api/spells/sleep" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "calm-emotions", name: "Acalmar Emoções", url: "/api/spells/calm-emotions" },
        { index: "phantasmal-force", name: "Força Fantasmal", url: "/api/spells/phantasmal-force" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "blink", name: "Piscar", url: "/api/spells/blink" },
        { index: "plant-growth", name: "Crescimento Vegetal", url: "/api/spells/plant-growth" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "dominate-beast", name: "Dominar Besta", url: "/api/spells/dominate-beast" },
        { index: "greater-invisibility", name: "Invisibilidade Maior", url: "/api/spells/greater-invisibility" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "dominate-person", name: "Dominar Pessoa", url: "/api/spells/dominate-person" },
        { index: "seeming", name: "Aparentar", url: "/api/spells/seeming" }
      ]
    }
  ],
  url: "/api/subclasses/the-archfey",
},

{
  index: "the-great-old-one",
  name: "O Grande Antigo",
  class: { index: "warlock", name: "Bruxo", url: "/api/classes/warlock" },
  desc: [
    "Seu patrono é uma entidade misteriosa cuja natureza é completamente estranha à estrutura da realidade.",
    "Talvez venha do Far Realm, o espaço além da realidade, ou talvez seja um dos deuses antigos apenas conhecidos em lendas."
  ],
  subclass_flavor: "Suas motivações são incompreensíveis para os mortais, e seu conhecimento é tão imenso e antigo que mesmo as maiores bibliotecas palidecem em comparação com os vastos segredos que detém.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "awakened-mind", name: "Mente Desperta", url: "/api/features/awakened-mind" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "entropic-ward", name: "Proteção Entrópica", url: "/api/features/entropic-ward" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "thought-shield", name: "Escudo Mental", url: "/api/features/thought-shield" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "create-thrall", name: "Criar Servo", url: "/api/features/create-thrall" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "dissonant-whispers", name: "Sussurros Dissonantes", url: "/api/spells/dissonant-whispers" },
        { index: "tashas-hideous-laughter", name: "Riso Horrendo de Tasha", url: "/api/spells/tashas-hideous-laughter" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "calm-emotions", name: "Acalmar Emoções", url: "/api/spells/calm-emotions" },
        { index: "detect-thoughts", name: "Detectar Pensamentos", url: "/api/spells/detect-thoughts" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "clairvoyance", name: "Clarividência", url: "/api/spells/clairvoyance" },
        { index: "sending", name: "Enviar Mensagem", url: "/api/spells/sending" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "dominate-beast", name: "Dominar Besta", url: "/api/spells/dominate-beast" },
        { index: "evards-black-tentacles", name: "Tentáculos Negros de Evard", url: "/api/spells/evards-black-tentacles" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "dominate-person", name: "Dominar Pessoa", url: "/api/spells/dominate-person" },
        { index: "telekinesis", name: "Telecinesia", url: "/api/spells/telekinesis" }
      ]
    }
  ],
  url: "/api/subclasses/the-great-old-one",
},

{
  index: "the-celestial",
  name: "O Celestial",
  class: { index: "warlock", name: "Bruxo", url: "/api/classes/warlock" },
  desc: [
    "Seu patrono é um ser poderoso dos planos superiores. Você fez um pacto com um empíreo, solar, ki-rin, unicórnio ou outro ser que reside nos planos de bem eterno.",
    "Seu pacto com esse ser permite que você experimente o toque mais fraco da luz sagrada que ilumina o multiverso."
  ],
  subclass_flavor: "Ser conectado a tal poder pode causar mudanças em seu comportamento e crenças. Você pode se encontrar levado a aniquilar mortos-vivos, derrotar demônios e proteger os inocentes.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "bonus-cantrips", name: "Truques Bônus", url: "/api/features/bonus-cantrips" },
        { index: "healing-light", name: "Luz Curativa", url: "/api/features/healing-light" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "radiant-soul", name: "Alma Radiante", url: "/api/features/radiant-soul" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "celestial-resilience", name: "Resistência Celestial", url: "/api/features/celestial-resilience" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "searing-vengeance", name: "Vingança Ardente", url: "/api/features/searing-vengeance" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "cure-wounds", name: "Curar Ferimentos", url: "/api/spells/cure-wounds" },
        { index: "guiding-bolt", name: "Seta Guiadora", url: "/api/spells/guiding-bolt" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "flaming-sphere", name: "Esfera Flamejante", url: "/api/spells/flaming-sphere" },
        { index: "lesser-restoration", name: "Restauração Menor", url: "/api/spells/lesser-restoration" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "daylight", name: "Luz do Dia", url: "/api/spells/daylight" },
        { index: "revivify", name: "Revivificar", url: "/api/spells/revivify" }
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
        { index: "greater-restoration", name: "Restauração Maior", url: "/api/spells/greater-restoration" }
      ]
    }
  ],
  url: "/api/subclasses/the-celestial",
},

{
  index: "the-hexblade",
  name: "A Lâmina Maldita",
  class: { index: "warlock", name: "Bruxo", url: "/api/classes/warlock" },
  desc: [
    "Você fez seu pacto com uma entidade misteriosa do Shadowfell - uma força que se manifesta em armas sencientes nutridas pela mais escura emoção.",
    "A poderosa lâmina Blackrazor é a mais notável dessas armas, que foram todas forjadas no Shadowfell no alvorecer dos tempos por uma entidade desconhecida."
  ],
  subclass_flavor: "Essas entidades de lâminas amaldiçoadas e a sombriamente poderosa força por trás delas são seu patrono. Esses patronos querem que você use essas armas para a derrota final da morte - levando o mundo a um estado de desolação similar ao Shadowfell.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "hexblades-curse", name: "Maldição da Lâmina Maldita", url: "/api/features/hexblades-curse" },
        { index: "hex-warrior", name: "Guerreiro Amaldiçoado", url: "/api/features/hex-warrior" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "accursed-specter", name: "Espectro Amaldiçoado", url: "/api/features/accursed-specter" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "armor-of-hexes", name: "Armadura de Maldições", url: "/api/features/armor-of-hexes" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "master-of-hexes", name: "Mestre das Maldições", url: "/api/features/master-of-hexes" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "shield", name: "Escudo", url: "/api/spells/shield" },
        { index: "wrathful-smite", name: "Golpe Colérico", url: "/api/spells/wrathful-smite" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "blur", name: "Desfoque", url: "/api/spells/blur" },
        { index: "branding-smite", name: "Golpe Marcador", url: "/api/spells/branding-smite" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "blink", name: "Piscar", url: "/api/spells/blink" },
        { index: "elemental-weapon", name: "Arma Elemental", url: "/api/spells/elemental-weapon" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "phantasmal-killer", name: "Assassino Fantasmal", url: "/api/spells/phantasmal-killer" },
        { index: "hallucinatory-terrain", name: "Terreno Ilusório", url: "/api/spells/hallucinatory-terrain" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "banishing-smite", name: "Golpe Banidor", url: "/api/spells/banishing-smite" },
        { index: "cone-of-cold", name: "Cone de Frio", url: "/api/spells/cone-of-cold" }
      ]
    }
  ],
  url: "/api/subclasses/the-hexblade",
},

{
  index: "the-fathomless",
  name: "O Insondável",
  class: { index: "warlock", name: "Bruxo", url: "/api/classes/warlock" },
  desc: [
    "Você fez um pacto com uma entidade deific das profundezas do mar ou dos Planos Elementais da Água.",
    "Kraken, elementais primordiais da água, deidades do mar como Olhydra ou Dagon e outras entidades misteriosas das profundezas oceânicas ou do Plano Elemental da Água podem servir como patronos para aqueles que fazem tais pactos."
  ],
  subclass_flavor: "Uma vez que você tenha feito um pacto com o mar, o oceano se torna um lugar de respiro e renovação para você.",
  subclass_levels: [
    {
      level: 1,
      features: [
        { index: "tentacle-of-the-deeps", name: "Tentáculo das Profundezas", url: "/api/features/tentacle-of-the-deeps" },
        { index: "gift-of-the-sea", name: "Dádiva do Mar", url: "/api/features/gift-of-the-sea" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "oceanic-soul", name: "Alma Oceânica", url: "/api/features/oceanic-soul" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "guardian-coil", name: "Bobina Guardiã", url: "/api/features/guardian-coil" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "grasping-tentacles", name: "Tentáculos Agarradores", url: "/api/features/grasping-tentacles" }
      ]
    }
  ],
  spells: [
    {
      level: 1,
      spells: [
        { index: "create-or-destroy-water", name: "Criar ou Destruir Água", url: "/api/spells/create-or-destroy-water" },
        { index: "thunderwave", name: "Onda Trovejante", url: "/api/spells/thunderwave" }
      ]
    },
    {
      level: 3,
      spells: [
        { index: "gust-of-wind", name: "Rajada de Vento", url: "/api/spells/gust-of-wind" },
        { index: "silence", name: "Silêncio", url: "/api/spells/silence" }
      ]
    },
    {
      level: 5,
      spells: [
        { index: "lightning-bolt", name: "Raio", url: "/api/spells/lightning-bolt" },
        { index: "sleet-storm", name: "Tempestade de Granizo", url: "/api/spells/sleet-storm" }
      ]
    },
    {
      level: 7,
      spells: [
        { index: "control-water", name: "Controlar Água", url: "/api/spells/control-water" },
        { index: "summon-elemental", name: "Invocar Elemental", url: "/api/spells/summon-elemental" }
      ]
    },
    {
      level: 9,
      spells: [
        { index: "bigbys-hand", name: "Mão de Bigby", url: "/api/spells/bigbys-hand" },
        { index: "cone-of-cold", name: "Cone de Frio", url: "/api/spells/cone-of-cold" }
      ]
    }
  ],
  url: "/api/subclasses/the-fathomless",
},

  // ===========================
  // MAGO SUBCLASSES
  // ===========================
  {
  index: "school-of-conjuration",
  name: "Escola de Conjuração",
  class: { index: "wizard", name: "Mago", url: "/api/classes/wizard" },
  desc: [
    "Como um conjurador, você favorece magias que produzem objetos e criaturas do nada.",
    "Você pode conjurar nuvens de névoa mortal ou invocar criaturas de outros lugares para lutar em seu nome."
  ],
  subclass_flavor: "Como sua maestria cresce, você aprende magias de teletransporte e pode se teletransportar através de vastas distâncias, até mesmo para outros planos de existência, em um instante.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "conjuration-savant", name: "Especialista em Conjuração", url: "/api/features/conjuration-savant" },
        { index: "minor-conjuration", name: "Conjuração Menor", url: "/api/features/minor-conjuration" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "benign-transposition", name: "Transposição Benigna", url: "/api/features/benign-transposition" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "focused-conjuration", name: "Conjuração Focada", url: "/api/features/focused-conjuration" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "durable-summons", name: "Invocações Duráveis", url: "/api/features/durable-summons" }
      ]
    }
  ],
  url: "/api/subclasses/school-of-conjuration",
},

{
  index: "school-of-divination",
  name: "Escola de Divinação",
  class: { index: "wizard", name: "Mago", url: "/api/classes/wizard" },
  desc: [
    "Os conselhos de um divinador são procurados tanto por realeza quanto por plebeus comuns, pois todos buscam uma compreensão mais clara do passado, presente e futuro.",
    "Como um divinador, você se esforça para separar os véus do espaço, tempo e consciência para que possa ver claramente."
  ],
  subclass_flavor: "Você trabalha para dominar magias de discernimento, visualização remota, conhecimento sobrenatural e previsão.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "divination-savant", name: "Especialista em Divinação", url: "/api/features/divination-savant" },
        { index: "portent", name: "Presságio", url: "/api/features/portent" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "expert-divination", name: "Divinação Especializada", url: "/api/features/expert-divination" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "the-third-eye", name: "O Terceiro Olho", url: "/api/features/the-third-eye" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "greater-portent", name: "Presságio Maior", url: "/api/features/greater-portent" }
      ]
    }
  ],
  url: "/api/subclasses/school-of-divination",
},

{
  index: "school-of-enchantment",
  name: "Escola de Encantamento",
  class: { index: "wizard", name: "Mago", url: "/api/classes/wizard" },
  desc: [
    "Como um membro da Escola de Encantamento, você aguçou sua capacidade de interferir magicamente na mente de outros, influenciando ou controlando seu comportamento.",
    "Alguns encantadores são pacifistas que fascinam os violentos para que larguem suas armas e enfeitiçam os cruéis para mostrar misericórdia."
  ],
  subclass_flavor: "Outros são tiranos que dominam magicamente os relutantes para servi-los. A maioria dos encantadores está em algum lugar entre estes dois extremos.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "enchantment-savant", name: "Especialista em Encantamento", url: "/api/features/enchantment-savant" },
        { index: "hypnotic-gaze", name: "Olhar Hipnótico", url: "/api/features/hypnotic-gaze" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "split-enchantment", name: "Encantamento Dividido", url: "/api/features/split-enchantment" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "instinctive-charm", name: "Charme Instintivo", url: "/api/features/instinctive-charm" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "alter-memories", name: "Alterar Memórias", url: "/api/features/alter-memories" }
      ]
    }
  ],
  url: "/api/subclasses/school-of-enchantment",
},

{
  index: "school-of-illusion",
  name: "Escola de Ilusão",
  class: { index: "wizard", name: "Mago", url: "/api/classes/wizard" },
  desc: [
    "Você foca seus estudos em magias que deslumbram os sentidos, confundem a mente e enganam até mesmo os mais sábios.",
    "Sua magia é sutil, mas as ilusões criadas por uma mente disciplinada podem tornar o impossível parecer real."
  ],
  subclass_flavor: "As ilusões podem distrair, confundir e fascinar um multidão de pessoas. Outros ilusionistas são mais sinistros mestres da decepção, usando suas habilidades para enganar outros para propósitos malignos.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "illusion-savant", name: "Especialista em Ilusão", url: "/api/features/illusion-savant" },
        { index: "improved-minor-illusion", name: "Ilusão Menor Aprimorada", url: "/api/features/improved-minor-illusion" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "malleable-illusions", name: "Ilusões Maleáveis", url: "/api/features/malleable-illusions" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "illusory-step", name: "Passo Ilusório", url: "/api/features/illusory-step" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "illusory-reality", name: "Realidade Ilusória", url: "/api/features/illusory-reality" }
      ]
    }
  ],
  url: "/api/subclasses/school-of-illusion",
},

{
  index: "school-of-necromancy",
  name: "Escola de Necromancia",
  class: { index: "wizard", name: "Mago", url: "/api/classes/wizard" },
  desc: [
    "A Escola de Necromancia explora as forças cósmicas da vida, morte e morte-viva.",
    "À medida que você foca seus estudos nesta tradição, você aprende a manipular a energia que anima todas as coisas vivas."
  ],
  subclass_flavor: "Como você avança, você aprende a arrancar a força vital dos outros para curar suas próprias feridas, a animar mortos e até mesmo alcançar a imortalidade.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "necromancy-savant", name: "Especialista em Necromancia", url: "/api/features/necromancy-savant" },
        { index: "grim-harvest", name: "Colheita Sombria", url: "/api/features/grim-harvest" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "undead-thralls", name: "Servos Mortos-Vivos", url: "/api/features/undead-thralls" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "inured-to-undeath", name: "Habituado à Morte-Viva", url: "/api/features/inured-to-undeath" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "command-undead", name: "Comandar Mortos-Vivos", url: "/api/features/command-undead" }
      ]
    }
  ],
  url: "/api/subclasses/school-of-necromancy",
},

{
  index: "school-of-transmutation",
  name: "Escola de Transmutação",
  class: { index: "wizard", name: "Mago", url: "/api/classes/wizard" },
  desc: [
    "Você é um estudante de magias que modificam energia e matéria.",
    "Para você, o mundo não é uma coisa fixa, mas eminentemente mutável, e você se deleita em ser um agente de mudança."
  ],
  subclass_flavor: "Você empunha a matéria-prima da criação e aprende a alterar tanto formas físicas quanto qualidades mentais. Sua magia lhe dá as ferramentas para se tornar um ferreiro na forja da realidade.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "transmutation-savant", name: "Especialista em Transmutação", url: "/api/features/transmutation-savant" },
        { index: "minor-alchemy", name: "Alquimia Menor", url: "/api/features/minor-alchemy" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "transmuters-stone", name: "Pedra do Transmutador", url: "/api/features/transmuters-stone" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "shapechanger", name: "Metamorfo", url: "/api/features/shapechanger" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "master-transmuter", name: "Transmutador Mestre", url: "/api/features/master-transmuter" }
      ]
    }
  ],
  url: "/api/subclasses/school-of-transmutation",
},

{
  index: "war-magic",
  name: "Magia de Guerra",
  class: { index: "wizard", name: "Mago", url: "/api/classes/wizard" },
  desc: [
    "Uma variedade de tradições arcanas se especializaram na formação de magos para a guerra.",
    "A tradição da Magia de Guerra combina princípios de evocação e abjuração, em vez de se especializar em qualquer uma delas."
  ],
  subclass_flavor: "Ela ensina técnicas que potencializam as magias de um conjurador, enquanto também fornece métodos para que magos fortifiquem a si mesmos contra ataques.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "arcane-deflection", name: "Deflexão Arcana", url: "/api/features/arcane-deflection" },
        { index: "tactical-wit", name: "Sagacidade Tática", url: "/api/features/tactical-wit" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "power-surge", name: "Surto de Poder", url: "/api/features/power-surge" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "durable-magic", name: "Magia Durável", url: "/api/features/durable-magic" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "deflecting-shroud", name: "Manto Defletor", url: "/api/features/deflecting-shroud" }
      ]
    }
  ],
  url: "/api/subclasses/war-magic",
},

{
  index: "chronurgy-magic",
  name: "Magia de Cronurgia",
  class: { index: "wizard", name: "Mago", url: "/api/classes/wizard" },
  desc: [
    "Concentrando-se na manipulação do tempo, aqueles que seguem a tradição da Cronurgia aprendem a alterar o fluxo da batalha em seu favor.",
    "Usando a dunamância fundamental do tempo, estes magos podem acelerar aliados, retardar inimigos e alterar o destino através de pequenos ajustes no tempo."
  ],
  subclass_flavor: "Cronurgistas da Academia de Rexxentrum foram os pioneiros desta tradição mágica, e ela continua centrada na cidade de Rexxentrum.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "chronal-shift", name: "Mudança Temporal", url: "/api/features/chronal-shift" },
        { index: "temporal-awareness", name: "Consciência Temporal", url: "/api/features/temporal-awareness" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "momentary-stasis", name: "Estase Momentânea", url: "/api/features/momentary-stasis" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "arcane-abeyance", name: "Suspensão Arcana", url: "/api/features/arcane-abeyance" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "convergent-future", name: "Futuro Convergente", url: "/api/features/convergent-future" }
      ]
    }
  ],
  url: "/api/subclasses/chronurgy-magic",
},

{
  index: "graviturgy-magic",
  name: "Magia de Graviturgia",
  class: { index: "wizard", name: "Mago", url: "/api/classes/wizard" },
  desc: [
    "Compreendendo e dominando as forças que impulsionam o cosmos, os Graviturgistas fazem uso da gravidade, massa e peso como ferramentas para controlar o campo de batalha.",
    "Estudando no Colégio de Geodesia, eles aprendem que a gravidade é uma força fundamental que sustenta tanto a criação quanto a destruição através do multiverso."
  ],
  subclass_flavor: "Os segredos da dunamância gravitacional são conhecidos apenas por um punhado de arcanos de Wildemount, principalmente aqueles que estudaram na Academia de Rexxentrum.",
  subclass_levels: [
    {
      level: 2,
      features: [
        { index: "adjust-density", name: "Ajustar Densidade", url: "/api/features/adjust-density" }
      ]
    },
    {
      level: 6,
      features: [
        { index: "gravity-well", name: "Poço Gravitacional", url: "/api/features/gravity-well" }
      ]
    },
    {
      level: 10,
      features: [
        { index: "violent-attraction", name: "Atração Violenta", url: "/api/features/violent-attraction" }
      ]
    },
    {
      level: 14,
      features: [
        { index: "event-horizon", name: "Horizonte de Eventos", url: "/api/features/event-horizon" }
      ]
    }
  ],
  url: "/api/subclasses/graviturgy-magic",
}]