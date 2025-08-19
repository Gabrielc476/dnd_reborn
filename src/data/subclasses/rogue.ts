import { Subclass } from "@/types/character";

export const RogueSubclasses: Subclass[] =  [
    {
      "index": "thief",
      "name": "Ladino",
      "class": {
        "index": "rogue",
        "name": "Ladino",
        "url": "/api/classes/rogue"
      },
      "desc": ["Você aprimora suas habilidades nas artes ladinas. Ladrões, bandidos, batedores de carteira e outros criminosos tipicamente seguem esse arquétipo."],
      "subclass_flavor": "Mas também o fazem patrulheiros dispostos a explorar ruínas antigas perigosas, membros de sociedades secretas e investigadores privados.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "fast-hands",
              "name": "Mãos Rápidas",
              "description": "A partir do 3º nível, você pode usar a ação bônus concedida por sua Ação Ardilosa para realizar uma jogada de Destreza (Prestidigitação), usar suas ferramentas de ladrão para desarmar uma armadilha ou abrir uma fechadura, ou realizar a ação Usar um Objeto."
            },
            {
              "index": "second-story-work",
              "name": "Trabalho de Segundo Andar",
              "description": "Ao escolher esse arquétipo no 3º nível, você obtém a habilidade de escalar mais rápido que o normal; escalar não custa movimento extra. Além disso, ao realizar um salto em corrida, a distância aumentada é igual ao seu modificador de Destreza."
            }
          ]
        },
        {
          "level": 9,
          "features": [
            {
              "index": "supreme-sneak",
              "name": "Furtividade Suprema",
              "description": "A partir do 9º nível, você tem vantagem em testes de Destreza (Furtividade) se se mover no máximo metade da sua velocidade durante o mesmo turno."
            }
          ]
        },
        {
          "level": 13,
          "features": [
            {
              "index": "use-magic-device",
              "name": "Usar Dispositivo Mágico",
              "description": "A partir do 13º nível, você aprendeu o suficiente sobre o funcionamento da magia para improvisar o uso de itens mesmo quando eles não foram feitos para você. Você ignora todos os requisitos de classe, raça e nível para uso de itens mágicos."
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "thiefs-reflexes",
              "name": "Reflexos de Ladrão",
              "description": "Ao atingir o 17º nível, você se torna adepto em montar emboscadas e escapar rapidamente de perigos. Você pode agir duas vezes durante a primeira rodada de qualquer combate. Você age primeiro normalmente, e depois novamente na sua iniciativa menos 10. Não pode usar esse recurso se estiver surpreso."
            }
          ]
        }
      ],
      "url": "/api/subclasses/thief"
    },
    {
      "index": "assassin",
      "name": "Assassino",
      "class": {
        "index": "rogue",
        "name": "Ladino",
        "url": "/api/classes/rogue"
      },
      "desc": ["Você se foca na arte do assassinato. Aqueles que aderem a esse arquétipo são assassinos profissionais, espiões, caçadores de recompensas e outros que dependem de furtividade, veneno e disfarces."],
      "subclass_flavor": "Nem todos os assassinos são assassinos sem alma. Muitos são apenas profissionais que fazem um trabalho que outros não podem ou não farão.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "bonus-proficiencies-assassin",
              "name": "Proficiências Adicionais",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "assassinate",
              "name": "Assassinar",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 9,
          "features": [
            {
              "index": "infiltration-expertise",
              "name": "Especialização em Infiltração",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 13,
          "features": [
            {
              "index": "impostor",
              "name": "Impostor",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "death-strike",
              "name": "Golpe Mortal",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/assassin"
    },
    {
      "index": "arcane-trickster",
      "name": "Trapaceiro Arcano",
      "class": {
        "index": "rogue",
        "name": "Ladino",
        "url": "/api/classes/rogue"
      },
      "desc": ["Alguns ladinos aprimoram suas habilidades furtivas com magia, aprendendo truques de encantamento e ilusão."],
      "subclass_flavor": "Esses ladinos incluem batedores de carteira e assaltantes, mas também brincalhões, travessos e um número significativo de aventureiros.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "spellcasting-at",
              "name": "Conjuração",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "mage-hand-legerdemain",
              "name": "Prestidigitação de Mão de Mago",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 9,
          "features": [
            {
              "index": "magical-ambush",
              "name": "Emboscada Mágica",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 13,
          "features": [
            {
              "index": "versatile-trickster",
              "name": "Trapaceiro Versátil",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "spell-thief",
              "name": "Ladrão de Magias",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/arcane-trickster"
    },
    {
      "index": "mastermind",
      "name": "Mente Mestra",
      "class": {
        "index": "rogue",
        "name": "Ladino",
        "url": "/api/classes/rogue"
      },
      "desc": [
        "Sua foco está na arte de intriga. Uma mente mestra é um especialista em manipulação, mestre de disfarce e ás do engano.",
        "Você tem capacidade para urdir esquemas intrincados e orquestrar planos complexos."
      ],
      "subclass_flavor": "Muitos espiões, cortesãos, e esquemeiros seguem esse arquétipo, liderando redes de informantes e implementando planos que podem mudar o curso da história.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "master-of-intrigue",
              "name": "Mestre da Intriga",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "master-of-tactics",
              "name": "Mestre de Táticas",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 9,
          "features": [
            {
              "index": "insightful-manipulator",
              "name": "Manipulador Perspicaz",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 13,
          "features": [
            {
              "index": "misdirection",
              "name": "Desorientação",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "soul-of-deceit",
              "name": "Alma do Engano",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/mastermind"
    },
    {
      "index": "scout",
      "name": "Batedor",
      "class": {
        "index": "rogue",
        "name": "Ladino",
        "url": "/api/classes/rogue"
      },
      "desc": [
        "Você é habilidoso em furtividade e sobrevivência, longe das ruas de uma cidade e nos rincões selvagens.",
        "Você é longe mais em casa nas regiões selvagens do que na civilização, e você está disposto a viajar longas distâncias para alcançar seu objetivo."
      ],
      "subclass_flavor": "Muitos batedores são contratados como guias, rastreadores ou espiões. Alguns são parte de grupos militares, enquanto outros trabalham sozinhos.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "skirmisher",
              "name": "Escaramuçador",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "survivalist",
              "name": "Sobrevivencialista",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 9,
          "features": [
            {
              "index": "superior-mobility",
              "name": "Mobilidade Superior",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 13,
          "features": [
            {
              "index": "ambush-master",
              "name": "Mestre da Emboscada",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "sudden-strike",
              "name": "Golpe Súbito",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/scout"
    },
    {
      "index": "swashbuckler",
      "name": "Espadachim",
      "class": {
        "index": "rogue",
        "name": "Ladino",
        "url": "/api/classes/rogue"
      },
      "desc": [
        "Você se foca nos elementos do combate e social que requerem elegância, panache e charme.",
        "Um espadachim excele em combate singular, especialmente contra alvos únicos."
      ],
      "subclass_flavor": "Alguns espadachins são nobres decadentes que se voltaram para aventuras, enquanto outros são plebeus que se elevaram para nobres através de sua sagacidade e charme.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "fancy-footwork",
              "name": "Trabalho de Pés Elegante",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "rakish-audacity",
              "name": "Audácia Libertina",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 9,
          "features": [
            {
              "index": "panache",
              "name": "Panache",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 13,
          "features": [
            {
              "index": "elegant-maneuver",
              "name": "Manobra Elegante",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "master-duelist",
              "name": "Mestre Duelista",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/swashbuckler"
    },
    {
      "index": "inquisitive",
      "name": "Investigativo",
      "class": {
        "index": "rogue",
        "name": "Ladino",
        "url": "/api/classes/rogue"
      },
      "desc": [
        "Como um arqueótipo, um Investigativo excede em desenrolar mistérios, rastreando rastros e descobrindo a verdade por trás de esquemas e crimes.",
        "Um investigativo mestre vê detalhes que outros perdem, faz conexões que outros não fazem, e resolve casos que outros consideram sem solução."
      ],
      "subclass_flavor": "Muitos investigativos trabalham dentro do sistema legal como detetives, agentes do governo ou consultores privados. Outros operam nas margens da sociedade.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "ear-for-deceit",
              "name": "Ouvido para Mentiras",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "eye-for-detail",
              "name": "Olho para Detalhes",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "insightful-fighting",
              "name": "Combate Perspicaz",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 9,
          "features": [
            {
              "index": "steady-eye",
              "name": "Olho Firme",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 13,
          "features": [
            {
              "index": "unerring-eye",
              "name": "Olho Infalível",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "eye-for-weakness",
              "name": "Olho para Fraquezas",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/inquisitive"
    },
    {
      "index": "soulknife",
      "name": "Lâmina Psíquica",
      "class": {
        "index": "rogue",
        "name": "Ladino",
        "url": "/api/classes/rogue"
      },
      "desc": [
        "A maioria dos assassinos depende das lâminas físicas, mas um Lâmina Psíquica manifesta uma lâmina psíquica formada de energia mental.",
        "Essa energia é uma projeção das ansiedades e dores emocionais da pessoa, dando forma física às tribulações mentais do indivíduo."
      ],
      "subclass_flavor": "A lâmina psíquica é tanto uma arma quanto uma ferramenta, capaz de cortar através da matéria física e também através da própria psique.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "psionic-power-rogue",
              "name": "Poder Psíquico",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "psychic-blades-soulknife",
              "name": "Lâminas Psíquicas",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 9,
          "features": [
            {
              "index": "soul-blades",
              "name": "Lâminas da Alma",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 13,
          "features": [
            {
              "index": "psychic-veil",
              "name": "Véu Psíquico",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "rend-mind",
              "name": "Rasgar a Mente",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/soulknife"
    },
    {
      "index": "phantom",
      "name": "Fantasma",
      "class": {
        "index": "rogue",
        "name": "Ladino",
        "url": "/api/classes/rogue"
      },
      "desc": [
        "Muitos ladinos caminham uma linha fina entre vida e morte, arriscando suas próprias vidas e tomando as vidas de outros.",
        "Enquanto aventureiros de muitas classes se encontram em situações perigosas, ladinos regularmente adquirem suas habilidades e sustento em empreendimentos que ameaçam suas vidas."
      ],
      "subclass_flavor": "Fantasmas fazem uma conexão com os espíritos dos mortos, usando essa ligação para alcançar capacidades sobrenaturais.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "whispers-of-the-dead",
              "name": "Sussurros dos Mortos",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "wails-from-the-grave",
              "name": "Lamentos do Túmulo",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 9,
          "features": [
            {
              "index": "tokens-of-the-departed",
              "name": "Símbolos dos Mortos",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 13,
          "features": [
            {
              "index": "ghost-walk",
              "name": "Caminhada Fantasma",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "deaths-friend",
              "name": "Amigo da Morte",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/phantom"
    }
  ]
