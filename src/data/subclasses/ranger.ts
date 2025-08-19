import { Subclass } from "@/types/character";

export const RangerSubclasses: Subclass[] = [
    {
      "index": "beast-master",
      "name": "Mestre das Feras",
      "class": { "index": "ranger", "name": "Patrulheiro", "url": "/api/classes/ranger" },
      "desc": ["O arquétipo de Mestre das Feras incorpora uma amizade entre a raça civilizada e as feras do mundo."],
      "subclass_flavor": "Unidos em foco, fera e patrulheiro trabalham como um para lutar contra os monstros ameaçadores que ameaçam a civilização e a natureza.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "rangers-companion",
              "name": "Companheiro do Patrulheiro",
              "description": "Forja um vínculo simbiótico com uma fera da natureza, permitindo coordenação tática em combate e exploração de ambientes hostis."
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "exceptional-training",
              "name": "Treinamento Excepcional",
              "description": "Aprimora as habilidades naturais do companheiro, concedendo resistência a efeitos adversos e ampliando seu repertório de ações táticas."
            }
          ]
        },
        {
          "level": 11,
          "features": [
            {
              "index": "bestial-fury",
              "name": "Fúria Bestial",
              "description": "A fera desencadeia ataques coordenados em múltiplos alvos, refletindo a sinergia aguçada após anos de caça conjunta."
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "share-spells",
              "name": "Compartilhar Magias",
              "description": "Magias de aprimoramento ou cura lançadas no patrulheiro estendem-se instantaneamente ao companheiro, mesmo a distância."
            }
          ]
        }
      ],
      "url": "/api/subclasses/beast-master"
    },
    {
      "index": "hunter",
      "name": "Caçador",
      "class": { "index": "ranger", "name": "Patrulheiro", "url": "/api/classes/ranger" },
      "desc": ["Guerreiros da natureza, os patrulheiros se especializam em caçar os monstros que ameaçam as bordas da civilização."],
      "subclass_flavor": "O arquétipo de Caçador refina suas habilidades para desenvolver uma especialização mortal.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "hunters-prey",
              "name": "Presa do Caçador",
              "description": "Especialização em técnicas de emboscada e perseguição, com ataques precisos que exploram pontos vitais de criaturas monstruosas."
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "defensive-tactics",
              "name": "Táticas Defensivas",
              "description": "Adaptação a padrões de ataque inimigos, desviando de investidas ou contra-atacando ao identificar brechas na defesa adversária."
            }
          ]
        },
        {
          "level": 11,
          "features": [
            {
              "index": "multiattack",
              "name": "Ataque Múltiplo",
              "description": "Sequências rápidas de golpes contra grupos, mirando múltiplos oponentes com precisão letal em um único movimento fluido."
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "superior-hunters-defense",
              "name": "Defesa Superior do Caçador",
              "description": "Evasão instintiva de ameaças mágicas ou físicas, reduzindo dano mesmo em situações de desvantagem tática."
            }
          ]
        }
      ],
      "url": "/api/subclasses/hunter"
    },
    {
      "index": "gloom-stalker",
      "name": "Perseguidor da Penumbra",
      "class": { "index": "ranger", "name": "Patrulheiro", "url": "/api/classes/ranger" },
      "desc": [
        "Perseguidores da Penumbra são em casa nas regiões mais sombrias: cavernas profundas, florestas sombrias, e o Plano Sombrio.",
        "Eles são caçadores cujas habilidades são aprimoradas pela magia sombria da Umbral, dando-lhes uma vantagem sobrenatural contra seus inimigos."
      ],
      "subclass_flavor": "Muitos patrulheiros empunham magia, mas poucos podem reivindicar possuir poderes tão sinistros quanto aqueles dos Perseguidores da Penumbra.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "dread-ambusher",
              "name": "Emboscador Terrível",
              "description": "Movimentos furtivos amplificados pela escuridão, com ataques surpresa que infligem terror psicológico e dano adicional."
            },
            {
              "index": "umbral-sight",
              "name": "Visão Umbral",
              "description": "Visão aguçada em penumbra total, anulando magias de escuridão e detectando criaturas ocultas em alcance estendido."
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "iron-mind",
              "name": "Mente de Ferro",
              "description": "Foco mental inabalável, garantindo resistência a efeitos de ilusão, possessão ou paralisia por meios sobrenaturais."
            }
          ]
        },
        {
          "level": 11,
          "features": [
            {
              "index": "stalkers-flurry",
              "name": "Rajada do Perseguidor",
              "description": "Ajustes precisos em ataques falhos, convertendo erros em oportunidades para golpes secundários imediatos."
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "shadowy-dodge",
              "name": "Esquiva Sombria",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "disguise-self", "name": "Disfarçar-se", "url": "/api/spells/disguise-self" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "rope-trick", "name": "Truque da Corda", "url": "/api/spells/rope-trick" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "fear", "name": "Medo", "url": "/api/spells/fear" }
          ]
        },
        {
          "level": 13,
          "spells": [
            { "index": "greater-invisibility", "name": "Invisibilidade Maior", "url": "/api/spells/greater-invisibility" }
          ]
        },
        {
          "level": 17,
          "spells": [
            { "index": "seeming", "name": "Aparência", "url": "/api/spells/seeming" }
          ]
        }
      ],
      "url": "/api/subclasses/gloom-stalker"
    },
    {
      "index": "horizon-walker",
      "name": "Andarilho do Horizonte",
      "class": { "index": "ranger", "name": "Patrulheiro", "url": "/api/classes/ranger" },
      "desc": [
        "Andarilhos do Horizonte guardam o mundo contra ameaças que se originam de outros planos ou que buscam devastar o mundo mortal com magia planar.",
        "Eles buscam portais para outros planos e observam aqueles que os atravessam."
      ],
      "subclass_flavor": "Estes patrulheiros são também conhecidos como guardiões planares, tendo a responsabilidade de proteger os limites entre os planos de existência.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "detect-portal",
              "name": "Detectar Portal",
              "description": "Sensores psíquicos identificam rupturas dimensionais, revelando portais interplanares e energias residuais de teletransporte."
            },
            {
              "index": "planar-warrior",
              "name": "Guerreiro Planar",
              "description": "Canalização de energia interdimensional em armas, convertendo dano físico em força pura que ignora resistências."
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "ethereal-step",
              "name": "Passo Etéreo",
              "description": "Transição momentânea para o plano etéreo, atravessando obstáculos sólidos e evitando ataques durante a movimentação."
            }
          ]
        },
        {
          "level": 11,
          "features": [
            {
              "index": "distant-strike",
              "name": "Golpe Distante",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "spectral-defense",
              "name": "Defesa Espectral",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "protection-from-evil-and-good", "name": "Proteção contra o Bem e Mal", "url": "/api/spells/protection-from-evil-and-good" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "misty-step", "name": "Passo Sombrio", "url": "/api/spells/misty-step" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "haste", "name": "Acelerar", "url": "/api/spells/haste" }
          ]
        },
        {
          "level": 13,
          "spells": [
            { "index": "banishment", "name": "Banimento", "url": "/api/spells/banishment" }
          ]
        },
        {
          "level": 17,
          "spells": [
            { "index": "teleportation-circle", "name": "Círculo de Teletransporte", "url": "/api/spells/teleportation-circle" }
          ]
        }
      ],
      "url": "/api/subclasses/horizon-walker"
    },
    {
      "index": "monster-slayer",
      "name": "Matador de Monstros",
      "class": { "index": "ranger", "name": "Patrulheiro", "url": "/api/classes/ranger" },
      "desc": [
        "Você se dedicou especificamente a caçar criaturas da noite e usuários de magia negra.",
        "Um Matador de Monstros busca e estuda seus adversários para aprender suas fraquezas."
      ],
      "subclass_flavor": "Matadores de Monstros são especialistas em derrotar criaturas sobrenaturais, desde vampiros e liches até demônios e diabos.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "hunters-sense",
              "name": "Sentido do Caçador",
              "description": "Análise tática instantânea que revela vulnerabilidades, resistências e históricos de combate de criaturas sobrenaturais."
            },
            {
              "index": "slayers-prey",
              "name": "Presa do Matador",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "supernatural-defense",
              "name": "Defesa Sobrenatural",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 11,
          "features": [
            {
              "index": "magic-users-nemesis",
              "name": "Nêmesis dos Usuários de Magia",
              "description": "Bloqueio de magias direcionadas ao patrulheiro, com contra-ataques que drenam energia arcana do conjurador."
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "slayers-counter",
              "name": "Contra-ataque do Matador",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "protection-from-evil-and-good", "name": "Proteção contra o Bem e Mal", "url": "/api/spells/protection-from-evil-and-good" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "zone-of-truth", "name": "Zona da Verdade", "url": "/api/spells/zone-of-truth" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "magic-circle", "name": "Círculo Mágico", "url": "/api/spells/magic-circle" }
          ]
        },
        {
          "level": 13,
          "spells": [
            { "index": "banishment", "name": "Banimento", "url": "/api/spells/banishment" }
          ]
        },
        {
          "level": 17,
          "spells": [
            { "index": "hold-monster", "name": "Prender Monstro", "url": "/api/spells/hold-monster" }
          ]
        }
      ],
      "url": "/api/subclasses/monster-slayer"
    },
    {
      "index": "fey-wanderer",
      "name": "Andarilho Feérico",
      "class": { "index": "ranger", "name": "Patrulheiro", "url": "/api/classes/ranger" },
      "desc": [
        "Um Andarilho Feérico caminha entre dois mundos, guiado por uma conexão com o Feywild.",
        "Sua magia é influenciada pelas fadas que eles encontraram, e eles descobriram que palavras têm poder - tanto para curar quanto para machucar."
      ],
      "subclass_flavor": "Estes patrulheiros servem como embaixadores entre os mundos mortal e feérico, protegendo ambos dos perigos que ameaçam sua harmonia.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "otherworldly-glamour",
              "name": "Glamour Sobrenatural",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "dreadful-strikes",
              "name": "Golpes Terríveis",
              "description": "Ataques impregnados com glamour feérico, causando confusão mental ou paralisia em alvos vulneráveis a encantamentos."
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "beguiling-twist",
              "name": "Reviravolta Sedutora",
              "description": "Redirecionamento de efeitos mentais adversos, convertendo maldições em benefícios para aliados ou prejuízos para o inimigo."
            }
          ]
        },
        {
          "level": 11,
          "features": [
            {
              "index": "fey-reinforcements",
              "name": "Reforços Feéricos",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "misty-wanderer",
              "name": "Andarilho Sombrio",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "charm-person", "name": "Encantar Pessoa", "url": "/api/spells/charm-person" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "misty-step", "name": "Passo Sombrio", "url": "/api/spells/misty-step" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "dispel-magic", "name": "Dissipar Magia", "url": "/api/spells/dispel-magic" }
          ]
        },
        {
          "level": 13,
          "spells": [
            { "index": "dimension-door", "name": "Porta Dimensional", "url": "/api/spells/dimension-door" }
          ]
        },
        {
          "level": 17,
          "spells": [
            { "index": "mislead", "name": "Enganar", "url": "/api/spells/mislead" }
          ]
        }
      ],
      "url": "/api/subclasses/fey-wanderer"
    },
    {
      "index": "swarmkeeper",
      "name": "Guardião do Enxame",
      "class": { "index": "ranger", "name": "Patrulheiro", "url": "/api/classes/ranger" },
      "desc": [
        "Sentindo uma conexão profunda com o mundo ao seu redor, você aprendeu a formar uma ligação poderosa com um enxame de criaturas da natureza.",
        "Seu enxame pode tomar a forma de vespas, besouros, fadas minúsculas, ou outras criaturas pequenas."
      ],
      "subclass_flavor": "Estes patrulheiros comandam enxames de criaturas naturais para ajudá-los em combate e exploração, formando uma simbiose única com a natureza.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "gathered-swarm",
              "name": "Enxame Reunido",
              "description": "Controle tático de insetos ou fadas que atrapalham oponentes, reduzindo visibilidade ou causando dano por contato persistente."
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "writhing-tide",
              "name": "Maré Retorcida",
              "description": "Manobras evasivas assistidas pelo enxame, propelindo o patrulheiro para fora de áreas de perigo iminente."
            }
          ]
        },
        {
          "level": 11,
          "features": [
            {
              "index": "mighty-swarm",
              "name": "Enxame Poderoso",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "swarming-dispersal",
              "name": "Dispersão do Enxame",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "faerie-fire", "name": "Fogo das Fadas", "url": "/api/spells/faerie-fire" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "web", "name": "Teia", "url": "/api/spells/web" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "gaseous-form", "name": "Forma Gasosa", "url": "/api/spells/gaseous-form" }
          ]
        },
        {
          "level": 13,
          "spells": [
            { "index": "arcane-eye", "name": "Olho Arcano", "url": "/api/spells/arcane-eye" }
          ]
        },
        {
          "level": 17,
          "spells": [
            { "index": "insect-plague", "name": "Praga de Insetos", "url": "/api/spells/insect-plague" }
          ]
        }
      ],
      "url": "/api/subclasses/swarmkeeper"
    },
    {
      "index": "drakewarden",
      "name": "Guardião do Drake",
      "class": { "index": "ranger", "name": "Patrulheiro", "url": "/api/classes/ranger" },
      "desc": [
        "Seu vínculo com o mundo natural toma a forma de um companheiro dracônico.",
        "Como você avança no poder, seu drake se desenvolve em um dragão menor capaz de montar, eventualmente se tornando uma criatura verdadeiramente formidável."
      ],
      "subclass_flavor": "Estes patrulheiros forjam uma ligação especial com drakes jovens, criando uma parceria que cresce em poder com o tempo.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "drake-companion",
              "name": "Companheiro Drake",
              "description": "Vinculo com um draconiano juvenil que evolui em poder, adquirindo resistências elementais e ataques especializados."
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "bond-of-fang-and-scale",
              "name": "Laço de Presa e Escama",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 11,
          "features": [
            {
              "index": "drakes-breath",
              "name": "Sopro do Drake",
              "description": "Canalização do sopro elemental do drake através do patrulheiro, criando explosões cônicas de fogo, gelo ou eletricidade."
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "perfected-bond",
              "name": "Laço Aperfeiçoado",
              "description": "Montaria aérea e compartilhamento vital, permitindo ao drake absorver dano direcionado ao patrulheiro."
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "thaumaturgy", "name": "Taumaturgia", "url": "/api/spells/thaumaturgy" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "dragon-breath", "name": "Sopro do Dragão", "url": "/api/spells/dragon-breath" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "fear", "name": "Medo", "url": "/api/spells/fear" }
          ]
        },
        {
          "level": 13,
          "spells": [
            { "index": "elemental-bane", "name": "Perdição Elemental", "url": "/api/spells/elemental-bane" }
          ]
        },
        {
          "level": 17,
          "spells": [
            { "index": "summon-draconic-spirit", "name": "Invocar Espírito Dracônico", "url": "/api/spells/summon-draconic-spirit" }
          ]
        }
      ],
      "url": "/api/subclasses/drakewarden"
    }
  ]
