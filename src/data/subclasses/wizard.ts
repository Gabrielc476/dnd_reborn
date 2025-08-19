import { Subclass } from "@/types/character";

export const WizardSubclasses: Subclass[] = [
    {
      "index": "school-of-conjuration",
      "name": "Escola de Conjuração",
      "class": {
        "index": "wizard",
        "name": "Mago",
        "url": "/api/classes/wizard"
      },
      "desc": [
        "Como um conjurador, você favorece magias que produzem objetos e criaturas do nada.",
        "Você pode conjurar nuvens de névoa mortal ou invocar criaturas de outros lugares para lutar em seu nome."
      ],
      "subclass_flavor": "Como sua maestria cresce, você aprende magias de teletransporte e pode se teletransportar através de vastas distâncias, até mesmo para outros planos de existência, em um instante.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "conjuration-savant",
              "name": "Especialista em Conjuração",
              "description": "Escolha duas magias de conjuração (até 2º nível) para adicionar gratuitamente ao grimório. Em novos níveis, adicione uma magia adicional de conjuração gratuitamente :cite[1]."
            },
            {
              "index": "minor-conjuration",
              "name": "Conjuração Menor",
              "description": "Como ação, conjure um objeto inanimado (até 90cm/5kg) em sua mão ou no chão (alcance 3m). Objeto desaparece após 1 hora, novo uso ou ao sofrer/causar dano :cite[1]."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "benign-transposition",
              "name": "Transposição Benigna",
              "description": "Como ação, teleporte-se 9m para espaço desocupado ou troque de lugar com criatura Pequena/Média voluntária. Recarrega com descanso longo ou magia de conjuração de 1º+ :cite[1]."
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "focused-conjuration",
              "name": "Conjuração Focada",
              "description": "Concentração em magias de conjuração não pode ser quebrada por dano :cite[1]."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "durable-summons",
              "name": "Invocações Duráveis",
              "description": "Criaturas invocadas por magias de conjuração ganham +30 PV temporários :cite[1]."
            }
          ]
        }
      ],
      "url": "/api/subclasses/school-of-conjuration"
    },
    {
      "index": "school-of-divination",
      "name": "Escola de Divinação",
      "class": {
        "index": "wizard",
        "name": "Mago",
        "url": "/api/classes/wizard"
      },
      "desc": [
        "Os conselhos de um divinador são procurados tanto por realeza quanto por plebeus comuns, pois todos buscam uma compreensão mais clara do passado, presente e futuro.",
        "Como um divinador, você se esforça para separar os véus do espaço, tempo e consciência para que possa ver claramente."
      ],
      "subclass_flavor": "Você trabalha para dominar magias de discernimento, visualização remota, conhecimento sobrenatural e previsão.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "portent",
              "name": "Presságio",
              "description": "Role 2d20 ao acordar. Substitua qualquer jogada de ataque, salvaguarda ou teste por um desses valores antes do resultado ser declarado :cite[4]."
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "the-third-eye",
              "name": "O Terceiro Olho",
              "description": "Ação bônus para ativar visão no escuro (36m) ou conjurar Ver o Invisível sem gastar espaço de magia :cite[4]."
            }
          ]
        }
      ],
      "url": "/api/subclasses/school-of-divination"
    },
    {
      "index": "school-of-illusion",
      "name": "Escola de Ilusão",
      "class": {
        "index": "wizard",
        "name": "Mago",
        "url": "/api/classes/wizard"
      },
      "desc": [
        "Você foca seus estudos em magias que deslumbram os sentidos, confundem a mente e enganam até mesmo os mais sábios.",
        "Sua magia é sutil, mas as ilusões criadas por uma mente disciplinada podem tornar o impossível parecer real."
      ],
      "subclass_flavor": "As ilusões podem distrair, confundir e fascinar um multidão de pessoas. Outros ilusionistas são mais sinistros mestres da decepção, usando suas habilidades para enganar outros para propósitos malignos.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "improved-minor-illusion",
              "name": "Ilusão Menor Aprimorada",
              "description": "Conjure Ilusão Menor como ação bônus, criando efeitos visuais e sonoros simultaneamente. Não conta no limite de truques :cite[4]."
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "illusory-step",
              "name": "Passo Ilusório",
              "description": "Como ação bônus, torne-se invisível até o início do próximo turno ou até atacar/conjurar. Usável 1x/descanso curto ou longo."
            }
          ]
        }
      ],
      "url": "/api/subclasses/school-of-illusion"
    },
    {
      "index": "school-of-necromancy",
      "name": "Escola de Necromancia",
      "class": {
        "index": "wizard",
        "name": "Mago",
        "url": "/api/classes/wizard"
      },
      "desc": [
        "A Escola de Necromancia explora as forças cósmicas da vida, morte e morte-viva.",
        "À medida que você foca seus estudos nesta tradição, você aprende a manipular a energia que anima todas as coisas vivas."
      ],
      "subclass_flavor": "Como você avança, você aprende a arrancar a força vital dos outros para curar suas próprias feridas, a animar mortos e até mesmo alcançar a imortalidade.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "grim-harvest",
              "name": "Colheita Sombria",
              "description": "Ao matar criatura com magia de 1º+ nível, cure PV = 2x nível da magia (ou 3x se necromântica). Só funciona uma vez por turno."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "undead-thralls",
              "name": "Servos Mortos-Vivos",
              "description": "Mortos-vivos criados por você ganham PV bônus = seu nível de Mago. Seus ataques causam +PB de dano."
            }
          ]
        }
      ],
      "url": "/api/subclasses/school-of-necromancy"
    },
    {
      "index": "war-magic",
      "name": "Magia de Guerra",
      "class": {
        "index": "wizard",
        "name": "Mago",
        "url": "/api/classes/wizard"
      },
      "desc": [
        "Uma variedade de tradições arcanas se especializaram na formação de magos para a guerra.",
        "A tradição da Magia de Guerra combina princípios de evocação e abjuração, em vez de se especializar em qualquer uma delas."
      ],
      "subclass_flavor": "Ela ensina técnicas que potencializam as magias de um conjurador, enquanto também fornece métodos para que magos fortifiquem a si mesmos contra ataques.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "arcane-deflection",
              "name": "Deflexão Arcana",
              "description": "Reação para ganhar +2 em CA contra um ataque ou +4 em salvaguarda. Após uso, só pode conjurar truques até seu próximo turno."
            },
            {
              "index": "tactical-wit",
              "name": "Sagacidade Tática",
              "description": "Adicione seu modificador de INT à iniciativa."
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "durable-magic",
              "name": "Magia Durável",
              "description": "Enquanto concentrado em uma magia, ganhe +2 em CA e salvaguardas."
            }
          ]
        }
      ],
      "url": "/api/subclasses/war-magic"
    },
    {
      "index": "chronurgy-magic",
      "name": "Magia de Cronurgia",
      "class": {
        "index": "wizard",
        "name": "Mago",
        "url": "/api/classes/wizard"
      },
      "desc": [
        "Concentrando-se na manipulação do tempo, aqueles que seguem a tradição da Cronurgia aprendem a alterar o fluxo da batalha em seu favor.",
        "Usando a dunamância fundamental do tempo, estes magos podem acelerar aliados, retardar inimigos e alterar o destino através de pequenos ajustes no tempo."
      ],
      "subclass_flavor": "Cronurgistas da Academia de Rexxentrum foram os pioneiros desta tradição mágica, e ela continua centrada na cidade de Rexxentrum.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "chronal-shift",
              "name": "Mudança Temporal",
              "description": "Como reação, force criatura a rerrolar ataque/salvaguarda/teste (usos = mod. INT, recarrega em descanso longo)."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "convergent-future",
              "name": "Futuro Convergente",
              "description": "Como ação, force sucesso/falha automática em qualquer rolagem. Após uso, sofra exaustão e incapacidade de usar até descanso longo."
            }
          ]
        }
      ],
      "url": "/api/subclasses/chronurgy-magic"
    },
    {
      "index": "school-of-transmutation",
      "name": "Escola de Transmutação",
      "class": {
        "index": "wizard",
        "name": "Mago",
        "url": "/api/classes/wizard"
      },
      "desc": [
        "Você é um estudante de magias que modificam energia e matéria.",
        "Para você, o mundo não é uma coisa fixa, mas eminentemente mutável, e você se deleita em ser um agente de mudança."
      ],
      "subclass_flavor": "Você empunha a matéria-prima da criação e aprende a alterar tanto formas físicas quanto qualidades mentais. Sua magia lhe dá as ferramentas para se tornar um ferreiro na força da realidade.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "minor-alchemy",
              "name": "Alquimia Menor",
              "description": "Toque objeto não-mágico para transformá-lo em outro material comum (ex: madeira → ferro). Dura 1 hora ou até usar novamente."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "transmuters-stone",
              "name": "Pedra do Transmutador",
              "description": "Crie uma pedra mágica (ação) que concede um benefício escolhido: velocidade +3m, visão no escuro, resistência a um tipo de dano, ou vantagem em testes de Constituição."
            }
          ]
        }
      ],
      "url": "/api/subclasses/school-of-transmutation"
    },
    {
      "index": "graviturgy-magic",
      "name": "Magia de Graviturgia",
      "class": {
        "index": "wizard",
        "name": "Mago",
        "url": "/api/classes/wizard"
      },
      "desc": [
        "Compreendendo e dominando as forças que impulsionam o cosmos, os Graviturgistas fazem uso da gravidade, massa e peso como ferramentas para controlar o campo de batalha.",
        "Estudando no Colégio de Geodesia, eles aprendem que a gravidade é uma força fundamental que sustenta tanto a criação quanto a destruição através do multiverso."
      ],
      "subclass_flavor": "Os segredos da dunamância gravitacional são conhecidos apenas por um punhado de arcanos de Wildemount, principalmente aqueles que estudaram na Academia de Rexxentrum.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "adjust-density",
              "name": "Ajustar Densidade",
              "description": "Como ação, toque criatura para aumentar/reduzir peso (fator ×2/÷2). Objetos afetados causam +1d6 de dano por 1,5m caídos."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "event-horizon",
              "name": "Horizonte de Eventos",
              "description": "Como ação, crie esfera de gravidade (6m raio). Criaturas começando turno ali são puxadas 1,5m para o centro e sofrem 2d10 dano de força (CD INT para reduzir)."
            }
          ]
        }
      ],
      "url": "/api/subclasses/graviturgy-magic"
    }
  ]
