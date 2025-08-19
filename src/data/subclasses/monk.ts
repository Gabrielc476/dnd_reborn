import { Subclass } from "@/types/character";

export const MonkSubclasses: Subclass[] = [
  {
    index: "way-of-shadow",
    name: "Caminho da Sombra",
    class: { 
      index: "monk", 
      name: "Monge", 
      url: "/api/classes/monk" 
    },
    desc: [
      "Monges do Caminho da Sombra seguem uma tradição que valoriza furtividade e subterfúgio.",
      "Esses monges podem ser chamados de ninjas ou dançarinos das sombras, e servem como espiões e assassinos."
    ],
    subclass_flavor: "Às vezes os membros de um mosteiro são enviados em missões clandestinas, requerendo que eles se tornem invisíveis às suas vítimas e aos seus inimigos.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { 
            index: "shadow-arts", 
            name: "Artes das Sombras", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/shadow-arts" 
          }
        ]
      },
      {
        level: 6,
        features: [
          { 
            index: "shadow-step", 
            name: "Passo Sombrio", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/shadow-step" 
          }
        ]
      },
      {
        level: 11,
        features: [
          { 
            index: "cloak-of-shadows", 
            name: "Manto de Sombras", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/cloak-of-shadows" 
          }
        ]
      },
      {
        level: 17,
        features: [
          { 
            index: "opportunist", 
            name: "Oportunista", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/opportunist" 
          }
        ]
      }
    ],
    url: "/api/subclasses/way-of-shadow",
  },
  {
    index: "way-of-the-four-elements",
    name: "Caminho dos Quatro Elementos",
    class: { 
      index: "monk", 
      name: "Monge", 
      url: "/api/classes/monk" 
    },
    desc: [
      "Você segue uma tradição monástica que ensina você a dominar os elementos.",
      "Quando você foca seu ki, você pode se alinhar com as forças da criação e dobrar os quatro elementos à sua vontade, usando-os como uma extensão de seu corpo."
    ],
    subclass_flavor: "Alguns membros desta tradição se dedicam a um único elemento, mas outros tecem os elementos juntos.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { 
            index: "disciple-of-the-elements", 
            name: "Discípulo dos Elementos", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/disciple-of-the-elements" 
          }
        ]
      },
      {
        level: 6,
        features: [
          { 
            index: "extra-elemental-discipline", 
            name: "Disciplina Elemental Extra", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/extra-elemental-discipline" 
          }
        ]
      },
      {
        level: 11,
        features: [
          { 
            index: "extra-elemental-discipline-2", 
            name: "Disciplina Elemental Extra", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/extra-elemental-discipline-2" 
          }
        ]
      },
      {
        level: 17,
        features: [
          { 
            index: "extra-elemental-discipline-3", 
            name: "Disciplina Elemental Extra", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/extra-elemental-discipline-3" 
          }
        ]
      }
    ],
    url: "/api/subclasses/way-of-the-four-elements",
  },
  {
    index: "way-of-the-long-death",
    name: "Caminho da Morte Longa",
    class: { 
      index: "monk", 
      name: "Monge", 
      url: "/api/classes/monk" 
    },
    desc: [
      "Monges do Caminho da Morte Longa são obcecados com o significado e mecânica da morte.",
      "Eles capturam criaturas e realizam experimentos grotescos em si mesmos e outros para entender melhor a fronteira entre vida e morte."
    ],
    subclass_flavor: "Esses monges são frequentemente temidos por sua crueldade e metodologia sinistra, mas seu conhecimento da morte os torna adversários formidáveis.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { 
            index: "touch-of-death", 
            name: "Toque da Morte", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/touch-of-death" 
          }
        ]
      },
      {
        level: 6,
        features: [
          { 
            index: "hour-of-reaping", 
            name: "Hora da Ceifa", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/hour-of-reaping" 
          }
        ]
      },
      {
        level: 11,
        features: [
          { 
            index: "mastery-of-death", 
            name: "Maestria da Morte", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/mastery-of-death" 
          }
        ]
      },
      {
        level: 17,
        features: [
          { 
            index: "touch-of-the-long-death", 
            name: "Toque da Morte Longa", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/touch-of-the-long-death" 
          }
        ]
      }
    ],
    url: "/api/subclasses/way-of-the-long-death",
  },
  {
    index: "way-of-the-sun-soul",
    name: "Caminho da Alma Solar",
    class: { 
      index: "monk", 
      name: "Monge", 
      url: "/api/classes/monk" 
    },
    desc: [
      "Monges do Caminho da Alma Solar aprendem a canalizar sua própria força vital em raios de energia solar abrasadora.",
      "Eles ensinam que a meditação pode desbloquear a capacidade de liberar o potencial brilhante da alma."
    ],
    subclass_flavor: "Monges dessa tradição são frequentemente encontrados em regiões desérticas ou montanhosas, onde podem meditar sob a luz solar direta.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { 
            index: "radiant-sun-bolt", 
            name: "Raio de Sol Radiante", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/radiant-sun-bolt" 
          }
        ]
      },
      {
        level: 6,
        features: [
          { 
            index: "searing-arc-strike", 
            name: "Golpe de Arco Ardente", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/searing-arc-strike" 
          }
        ]
      },
      {
        level: 11,
        features: [
          { 
            index: "searing-sunburst", 
            name: "Explosão Solar Ardente", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/searing-sunburst" 
          }
        ]
      },
      {
        level: 17,
        features: [
          { 
            index: "sun-shield", 
            name: "Escudo Solar", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/sun-shield" 
          }
        ]
      }
    ],
    url: "/api/subclasses/way-of-the-sun-soul",
  },
  {
    index: "way-of-the-drunken-master",
    name: "Caminho do Mestre Bêbado",
    class: { 
      index: "monk", 
      name: "Monge", 
      url: "/api/classes/monk" 
    },
    desc: [
      "O Caminho do Mestre Bêbado ensina seus estudantes a se mover com a irregularidade descoordenada de um bêbado.",
      "Um mestre bêbado cambaleia, tropeça e rola pelo campo de batalha, evitando qualquer golpe direcionado a eles e confundindo seus inimigos."
    ],
    subclass_flavor: "Apesar das aparências, um mestre bêbado está no controle de seus movimentos, usando a imprevisibilidade como uma arma.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { 
            index: "bonus-proficiencies-drunken-master", 
            name: "Proficiências Adicionais", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/bonus-proficiencies-drunken-master" 
          },
          { 
            index: "drunken-technique", 
            name: "Técnica do Bêbado", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/drunken-technique" 
          }
        ]
      },
      {
        level: 6,
        features: [
          { 
            index: "tipsy-sway", 
            name: "Balanço Cambaleante", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/tipsy-sway" 
          }
        ]
      },
      {
        level: 11,
        features: [
          { 
            index: "drunkard-luck", 
            name: "Sorte do Bêbado", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/drunkard-luck" 
          }
        ]
      },
      {
        level: 17,
        features: [
          { 
            index: "intoxicated-frenzy", 
            name: "Frenesi Intoxicado", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/intoxicated-frenzy" 
          }
        ]
      }
    ],
    url: "/api/subclasses/way-of-the-drunken-master",
  },
  {
    index: "way-of-the-kensei",
    name: "Caminho do Kensei",
    class: { 
      index: "monk", 
      name: "Monge", 
      url: "/api/classes/monk" 
    },
    desc: [
      "Monges do Caminho do Kensei treinam incansavelmente com suas armas, até o ponto em que a arma se torna uma extensão do corpo.",
      "Fundada na maestria da espada, a tradição se expandiu para incluir muitas armas diferentes."
    ],
    subclass_flavor: "Um kensei vê uma arma da mesma forma que um calígrafo ou um pintor vê um pincel. Qualquer que seja a arma, o kensei a vê como uma ferramenta usada para expressar a beleza e precisão das artes marciais.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { 
            index: "path-of-the-kensei", 
            name: "Caminho do Kensei", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/path-of-the-kensei" 
          }
        ]
      },
      {
        level: 6,
        features: [
          { 
            index: "one-with-the-blade", 
            name: "Um com a Lâmina", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/one-with-the-blade" 
          }
        ]
      },
      {
        level: 11,
        features: [
          { 
            index: "sharpen-the-blade", 
            name: "Afiar a Lâmina", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/sharpen-the-blade" 
          }
        ]
      },
      {
        level: 17,
        features: [
          { 
            index: "unerring-accuracy", 
            name: "Precisão Infalível", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/unerring-accuracy" 
          }
        ]
      }
    ],
    url: "/api/subclasses/way-of-the-kensei",
  },
  {
    index: "way-of-mercy",
    name: "Caminho da Misericórdia",
    class: { 
      index: "monk", 
      name: "Monge", 
      url: "/api/classes/monk" 
    },
    desc: [
      "Monges do Caminho da Misericórdia aprendem a manipular a força vital dos outros para trazer ajuda aos necessitados.",
      "Eles são médicos errantes para os pobres e feridos. No entanto, para aqueles além da redenção, eles trazem uma morte rápida como ato de misericórdia."
    ],
    subclass_flavor: "Aqueles que seguem o Caminho da Misericórdia podem usar máscaras para ocultar suas identidades, seja para proteger sua privacidade ou como símbolo de transformação.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { 
            index: "implements-of-mercy", 
            name: "Implementos da Misericórdia", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/implements-of-mercy" 
          },
          { 
            index: "hands-of-healing", 
            name: "Mãos da Cura", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/hands-of-healing" 
          },
          { 
            index: "hands-of-harm", 
            name: "Mãos do Dano", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/hands-of-harm" 
          }
        ]
      },
      {
        level: 6,
        features: [
          { 
            index: "physicians-touch", 
            name: "Toque do Médico", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/physicians-touch" 
          }
        ]
      },
      {
        level: 11,
        features: [
          { 
            index: "flurry-of-healing-and-harm", 
            name: "Rajada de Cura e Dano", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/flurry-of-healing-and-harm" 
          }
        ]
      },
      {
        level: 17,
        features: [
          { 
            index: "hand-of-ultimate-mercy", 
            name: "Mão da Misericórdia Suprema", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/hand-of-ultimate-mercy" 
          }
        ]
      }
    ],
    url: "/api/subclasses/way-of-mercy",
  },
  {
    index: "way-of-the-astral-self",
    name: "Caminho do Eu Astral",
    class: { 
      index: "monk", 
      name: "Monge", 
      url: "/api/classes/monk" 
    },
    desc: [
      "Um monge que segue o Caminho do Eu Astral acredita que seu corpo é uma ilusão.",
      "Eles veem sua forma astral como seu verdadeiro eu e disciplinam suas mentes para despertar esse poder interior."
    ],
    subclass_flavor: "O eu astral é a forma espiritual de uma pessoa - a essência de sua alma que transcende limitações físicas.",
    subclass_levels: [
      {
        level: 3,
        features: [
          { 
            index: "arms-of-the-astral-self", 
            name: "Braços do Eu Astral", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/arms-of-the-astral-self" 
          }
        ]
      },
      {
        level: 6,
        features: [
          { 
            index: "visage-of-the-astral-self", 
            name: "Semblante do Eu Astral", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/visage-of-the-astral-self" 
          }
        ]
      },
      {
        level: 11,
        features: [
          { 
            index: "body-of-the-astral-self", 
            name: "Corpo do Eu Astral", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/body-of-the-astral-self" 
          }
        ]
      },
      {
        level: 17,
        features: [
          { 
            index: "awakened-astral-self", 
            name: "Eu Astral Desperto", 
            description: "Descrição detalhada indisponível",
            url: "/api/features/awakened-astral-self" 
          }
        ]
      }
    ],
    url: "/api/subclasses/way-of-the-astral-self",
  }
];