import { Subclass } from "@/types/character";

 export const BarbarianSubclasses: Subclass[] = [
    {
      "index": "berserker",
      "name": "Caminho do Berserker",
      "class": {
        "index": "barbarian",
        "name": "Bárbaro",
        "url": "/api/classes/barbarian"
      },
      "desc": ["Para alguns bárbaros, a raiva é um meio para um fim – esse fim sendo a violência. O Caminho do Berserker é um caminho de fúria desenfreada, escorrendo sangue."],
      "subclass_flavor": "Quando você entra na sua fúria em batalha, você se desloca em direção a um berserker, e o caos reina.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "frenzy",
              "name": "Frenesi",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "mindless-rage",
              "name": "Fúria Irracional",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "intimidating-presence",
              "name": "Presença Intimidante",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "retaliation",
              "name": "Retaliação",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/berserker"
    },
    {
      "index": "totem-warrior",
      "name": "Caminho do Guerreiro Totêmico",
      "class": {
        "index": "barbarian",
        "name": "Bárbaro",
        "url": "/api/classes/barbarian"
      },
      "desc": [
        "O Caminho do Guerreiro Totêmico é uma jornada espiritual, pois o bárbaro aceita um espírito animal como guia, protetor e inspiração.",
        "Em batalha, seu espírito totêmico preenche você com força sobrenatural, adicionando combustível mágico à sua fúria bárbara."
      ],
      "subclass_flavor": "A maioria das tribos bárbaras considera um espírito animal totêmico como parente de um clã particular. Em tais casos, é incomum para um indivíduo ter mais de um espírito animal totêmico, embora existam exceções.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "spirit-seeker",
              "name": "Buscador de Espíritos",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "totem-spirit",
              "name": "Espírito Totêmico",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "aspect-of-the-beast",
              "name": "Aspecto da Fera",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "spirit-walker",
              "name": "Andarilho Espiritual",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "totemic-attunement",
              "name": "Sintonia Totêmica",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/totem-warrior"
    },
    {
      "index": "wild-magic-barbarian",
      "name": "Caminho da Magia Selvagem",
      "class": {
        "index": "barbarian",
        "name": "Bárbaro",
        "url": "/api/classes/barbarian"
      },
      "desc": [
        "Muitas terras no multiverso abrigam sua própria forma de magia bárbara. Em reinos como o Feywild, ou em certas regiões da Shadowfell, a mágica se infiltra em tudo.",
        "Alguns bárbaros dessas terras desenvolvem uma relação primitiva com a magia que existe em sua terra natal, canalizando-a em seus ataques de fúria."
      ],
      "subclass_flavor": "Esses bárbaros da magia selvagem encontram sua fúria infundida com magia primitiva, permitindo que conjurem feitiços e efeitos mágicos enquanto estão furiosos.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "magic-awareness",
              "name": "Consciência Mágica",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "wild-surge",
              "name": "Surto Selvagem",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "bolstering-magic",
              "name": "Magia Fortalecedora",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "unstable-backlash",
              "name": "Reação Instável",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "controlled-surge",
              "name": "Surto Controlado",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/wild-magic-barbarian"
    },
    {
      "index": "zealot",
      "name": "Caminho do Zelote",
      "class": {
        "index": "barbarian",
        "name": "Bárbaro",
        "url": "/api/classes/barbarian"
      },
      "desc": [
        "Alguns deuses enxergam os bárbaros como seus escolhidos, empregando esses guerreiros furiosos como instrumentos divinos para semear destruição.",
        "Esses bárbaros são conhecidos como zelotes, e veem sua fúria como uma benção divina - um estado de êxtase religioso que os conecta aos deuses."
      ],
      "subclass_flavor": "Para um zelote, a batalha é um ato de devoção, uma oração violenta oferecida em honra aos deuses da guerra e da morte.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "divine-fury",
              "name": "Fúria Divina",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "warrior-of-the-gods",
              "name": "Guerreiro dos Deuses",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "fanatical-focus",
              "name": "Foco Fanático",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "zealous-presence",
              "name": "Presença Zelosa",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "rage-beyond-death",
              "name": "Fúria Além da Morte",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/zealot"
    },
    {
      "index": "ancestral-guardian",
      "name": "Caminho do Guardião Ancestral",
      "class": {
        "index": "barbarian",
        "name": "Bárbaro",
        "url": "/api/classes/barbarian"
      },
      "desc": [
        "Alguns bárbaros são visitados pelos espíritos de ancestrais mortos que os guiam e protegem.",
        "Quando um bárbaro que segue esse caminho entra em fúria, o bárbaro faz contato com o mundo dos espíritos e convoca esses guardiões."
      ],
      "subclass_flavor": "Os bárbaros que seguem o Caminho do Guardião Ancestral veem suas tradições como uma ligação vital com seu passado, honrando a memória daqueles que vieram antes.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "ancestral-protectors",
              "name": "Protetores Ancestrais",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "spirit-shield",
              "name": "Escudo Espiritual",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "consult-the-spirits",
              "name": "Consultar os Espíritos",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "vengeful-ancestors",
              "name": "Ancestrais Vingativos",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/ancestral-guardian"
    }
  ]

