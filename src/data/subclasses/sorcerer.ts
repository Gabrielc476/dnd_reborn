import { Subclass } from "@/types/character";

export const SorcererSubclasses: Subclass[] =  [
    {
      "index": "wild-magic",
      "name": "Magia Selvagem",
      "class": {
        "index": "sorcerer",
        "name": "Feiticeiro",
        "url": "/api/classes/sorcerer"
      },
      "desc": ["Sua magia inata vem das forças selvagens do caos que subjazem a ordem da criação."],
      "subclass_flavor": "Você pode ter sofrido exposição a alguma forma de magia bruta, talvez através de um portal planar liderando ao Limbo, os Planos Elementais ou os distantes Reinos Feéricos.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "wild-magic-surge",
              "name": "Surto de Magia Selvagem",
              "description": "Após conjurar uma magia de Feiticeiro, role 1d20. Com resultado 20 (antes 1), role na tabela de Surto para efeitos caóticos como transformação em planta ou teletransporte."
            },
            {
              "index": "tides-of-chaos",
              "name": "Marés do Caos",
              "description": "Ganhe vantagem em um teste de d20. Após usar, a próxima magia conjurada automaticamente desencadeia um Surto de Magia Selvagem."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "bend-luck",
              "name": "Dobrar a Sorte",
              "description": "Como reação, gaste 1 Ponto de Feitiçaria para rolar 1d4 e adicionar/subtrair o resultado de um teste de resistência ou ataque de criatura visível."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "controlled-chaos",
              "name": "Caos Controlado",
              "description": "Role duas vezes na tabela de Surto e escolha o resultado preferido."
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "spell-bombardment",
              "name": "Surto Controlado",
              "description": "Ative um efeito da tabela de Surto à vontade (exceto o último). Após usar, requer descanso longo."
            }
          ]
        }
      ],
      "url": "/api/subclasses/wild-magic"
    },
    {
      "index": "divine-soul",
      "name": "Alma Divina",
      "class": {
        "index": "sorcerer",
        "name": "Feiticeiro",
        "url": "/api/classes/sorcerer"
      },
      "desc": [
        "Às vezes a centelha de magia que alimenta um feiticeiro vem de uma fonte divina que brilha dentro da alma.",
        "Tendo uma alma divina, sua magia inata pode vir dos planos superiores dos Nove Céus ou dos planos inferiores dos Nove Infernos."
      ],
      "subclass_flavor": "Você é um favorito dos deuses, um filho de um ser celestial ou demoníaco, ou um indivíduo exposto a forças divinas.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "divine-magic",
              "name": "Magia Divina",
              "description": "Acesse magias divinas (lista de clérigo) e escolha um alinhamento (bondade/maldade) para bônus em testes relacionados."
            },
            {
              "index": "favored-by-the-gods",
              "name": "Favorecido pelos Deuses",
              "description": "Como reação, adicione 2d4 a um teste de resistência ou ataque falho, uma vez por descanso."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "empowered-healing",
              "name": "Cura Fortalecida",
              "description": "Ao conjurar magias de cura, gaste 1 Ponto de Feitiçaria para rolar dados adicionais igual ao seu modificador de Carisma."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "otherworldly-wings",
              "name": "Asas Sobrenaturais",
              "description": "Ganhe asas (voar 9m) ativáveis como ação bônus. Duração igual ao nível de Feiticeiro em minutos."
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "unearthly-recovery",
              "name": "Recuperação Sobrenatural",
              "description": "Quando reduzido a 0 PV, gaste 5 Pontos de Feitiçaria para voltar a metade dos PV máximos. Usável 1x/dia."
            }
          ]
        }
      ],
      "url": "/api/subclasses/divine-soul"
    },
    {
      "index": "storm-sorcery",
      "name": "Feitiçaria da Tempestade",
      "class": {
        "index": "sorcerer",
        "name": "Feiticeiro",
        "url": "/api/classes/sorcerer"
      },
      "desc": [
        "Sua magia inata vem do poder dos elementos. Muitos com esse poder podem rastrear sua magia de volta a uma exposição próxima aos Planos Elementais.",
        "A influência de tais exposições pode resultar em marcas de nascimento que se assemelham a padrões naturais e seres podem sentir sua magia como uma brisa fresca ou o cheiro de chuva."
      ],
      "subclass_flavor": "A família de um feiticeiro da tempestade pode ter origem de algum evento dramático envolvendo os elementais do ar ou água.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "wind-speaker",
              "name": "Orador do Vento",
              "description": "Comunique-se telepaticamente com criaturas através do vento em 36m. Compreensão mútua requer língua compartilhada."
            },
            {
              "index": "tempestuous-magic",
              "name": "Magia Tempestuosa",
              "description": "Após conjurar magia de 1º nível ou superior, voe 3m sem provocar ataques de oportunidade."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "heart-of-the-storm",
              "name": "Coração da Tempestade",
              "description": "Imune a dano de trovão/relâmpago. Ao conjurar magias desses tipos, cause dano adicional (metade do nível de Feiticeiro) em criaturas a 3m."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "storms-fury",
              "name": "Fúria da Tempestade",
              "description": "Como reação ao sofrer dano, cause 2d8 de dano de relâmpago/trovão no agressor. Teste de resistência reduz à metade."
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "wind-soul",
              "name": "Alma do Vento",
              "description": "Imune a dano de relâmpago/trovão e ganhe voo 18m. Pode anular efeitos de voo para flutuar."
            }
          ]
        }
      ],
      "url": "/api/subclasses/storm-sorcery"
    },
    {
      "index": "shadow-magic",
      "name": "Magia Sombria",
      "class": {
        "index": "sorcerer",
        "name": "Feiticeiro",
        "url": "/api/classes/sorcerer"
      },
      "desc": [
        "Você é uma criatura da sombra, pois sua magia inata vem do próprio Shadowfell.",
        "Você pode ter traçado essa influência sombria até uma entidade do Shadowfell, ou você pode ter sido exposto à energia sombria e transformado por ela."
      ],
      "subclass_flavor": "O poder da magia sombria lança uma pálida sinistra sobre sua aparência física. Centelhas de escuridão dançam em seus olhos quando você está irritado ou excitado.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "eyes-of-the-dark",
              "name": "Olhos da Escuridão",
              "description": "Veja no escuro até 36m e conjure escuridão gastando Pontos de Feitiçaria."
            },
            {
              "index": "strength-of-the-grave",
              "name": "Força do Túmulo",
              "description": "Ao ser reduzido a 0 PV, teste de Constituição (CD 5 + dano sofrido). Sucesso o deixa com 1 PV."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "hound-of-ill-omen",
              "name": "Cão de Mau Agouro",
              "description": "Invoque um cão espectral que concede desvantagem em testes de resistência contra suas magias. Dura 5 minutos."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "shadow-walk",
              "name": "Caminhada Sombria",
              "description": "Teletransporte 12m entre sombras. Se usado para atacar, vantagem no primeiro ataque."
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "umbral-form",
              "name": "Forma Umbral",
              "description": "Transforme-se em sombra por 1 minuto (resistência a dano; imunidade a veneno/medo). Usável 1x/descanso longo."
            }
          ]
        }
      ],
      "url": "/api/subclasses/shadow-magic"
    },
    {
      "index": "clockwork-soul",
      "name": "Alma Mecânica",
      "class": {
        "index": "sorcerer",
        "name": "Feiticeiro",
        "url": "/api/classes/sorcerer"
      },
      "desc": [
        "A centelha cósmica de ordem que move os planos de Mechanus se enraizou em sua alma.",
        "Que essa influência viesse através de exposição ancestral a modrons, uma infusão de energia axiomatic, ou alguma outra fonte, você pode canalizar a força da ordem absoluta."
      ],
      "subclass_flavor": "Isso se manifesta como a capacidade de diminuir a aleatoriedade da magia, tornando as magias mais confiáveis ​​mesmo quando elas se recusam a cooperar.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "restore-balance",
              "name": "Restaurar Equilíbrio",
              "description": "Como reação, cancele vantagem/desvantagem em um teste próximo. Usos = modificador de Carisma."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "bastion-of-law",
              "name": "Bastião da Lei",
              "description": "Gaste Pontos de Feitiçaria para reduzir dano sofrido por você ou aliados (redução = 1d8 por ponto gasto)."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "trance-of-order",
              "name": "Transe da Ordem",
              "description": "Por 1 minuto, ignore rolagens abaixo de 10 em ataques/testes, e ataques contra você não têm vantagem."
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "clockwork-cavalcade",
              "name": "Cavalgada Mecânica",
              "description": "Invoque modrons que curam aliados (2d8 PV por aliado) e removem efeitos negativos. Usável 1x/dia."
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "alarm", "name": "Alarme", "url": "/api/spells/alarm" },
            { "index": "protection-from-evil-and-good", "name": "Proteção contra Bem e Mal", "url": "/api/spells/protection-from-evil-and-good" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "aid", "name": "Ajuda", "url": "/api/spells/aid" },
            { "index": "lesser-restoration", "name": "Restauração Menor", "url": "/api/spells/lesser-restoration" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "dispel-magic", "name": "Dissipar Magia", "url": "/api/spells/dispel-magic" },
            { "index": "protection-from-energy", "name": "Proteção contra Energia", "url": "/api/spells/protection-from-energy" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "freedom-of-movement", "name": "Liberdade de Movimento", "url": "/api/spells/freedom-of-movement" },
            { "index": "summon-construct", "name": "Invocar Constructo", "url": "/api/spells/summon-construct" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "greater-restoration", "name": "Restauração Maior", "url": "/api/spells/greater-restoration" },
            { "index": "wall-of-force", "name": "Muralha de Força", "url": "/api/spells/wall-of-force" }
          ]
        }
      ],
      "url": "/api/subclasses/clockwork-soul"
    },
    {
      "index": "aberrant-mind",
      "name": "Mente Aberrante",
      "class": {
        "index": "sorcerer",
        "name": "Feiticeiro",
        "url": "/api/classes/sorcerer"
      },
      "desc": [
        "Uma força alienígena tocou sua mente e moldou sua magia. Essa força pode vir de algum horror Far Realm ou pode ser o vestígio de invasão por flayer mental.",
        "Você não pode confiar completamente em sua própria mente, mas ganhou capacidades psíquicas bizarras e potentes."
      ],
      "subclass_flavor": "Como um feiticeiro da Mente Aberrante, você decidiu aceitar essa influência corrupta ou lutar contra ela, canalizando sua magia psíquica de formas úteis.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "telepathic-speech",
              "name": "Fala Telepática",
              "description": "Comunique-se telepaticamente (distância = modificador de Carisma em milhas). Dura minutos = nível de Feiticeiro."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "psionic-spells",
              "name": "Magias Psíquicas",
              "description": "Conjure magias da subclasse sem componentes verbais/somáticos, gastando Pontos de Feitiçaria."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "psychic-defenses",
              "name": "Defesas Psíquicas",
              "description": "Resistência a dano psíquico e vantagem em salvaguardas contra efeitos de encantamento/medo."
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "warping-implosion",
              "name": "Implosão Distorcida",
              "description": "Teletransporte e puxe criaturas para sua localização anterior, causando 3d10 de dano de força (CD = Carisma)."
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "mind-spike", "name": "Espinho Mental", "url": "/api/spells/mind-spike" },
            { "index": "silvery-barbs", "name": "Farpas Prateadas", "url": "/api/spells/silvery-barbs" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "calm-emotions", "name": "Acalmar Emoções", "url": "/api/spells/calm-emotions" },
            { "index": "detect-thoughts", "name": "Detectar Pensamentos", "url": "/api/spells/detect-thoughts" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "enemies-abound", "name": "Inimigos por Toda Parte", "url": "/api/spells/enemies-abound" },
            { "index": "sending", "name": "Enviar Mensagem", "url": "/api/spells/sending" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "summon-aberration", "name": "Invocar Aberração", "url": "/api/spells/summon-aberration" },
            { "index": "evards-black-tentacles", "name": "Tentáculos Negros de Evard", "url": "/api/spells/evards-black-tentacles" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "modify-memory", "name": "Modificar Memória", "url": "/api/spells/modify-memory" },
            { "index": "telekinesis", "name": "Telecinesia", "url": "/api/spells/telekinesis" }
          ]
        }
      ],
      "url": "/api/subclasses/aberrant-mind"
    }
  ]
