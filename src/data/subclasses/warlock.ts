import { Subclass } from "@/types/character";

 export const WarlockSubclasses: Subclass[] =  [
    {
      "index": "the-archfey",
      "name": "O Arquifada",
      "class": {
        "index": "warlock",
        "name": "Bruxo",
        "url": "/api/classes/warlock"
      },
      "desc": [
        "Seu patrono é um senhor ou senhora das fadas, uma criatura de lenda que detém segredos que foram esquecidos antes das raças mortais nascerem.",
        "As motivações desses seres são muitas vezes inescrutáveis, e às vezes caprichosas, e podem envolver esforços para adquirir objetos mágicos maiores ou estabelecer pactos místicos."
      ],
      "subclass_flavor": "Seres desse tipo incluem o Príncipe do Gelo; a Rainha do Ar e Escuridão, governante da Corte Sombria; Titania da Corte de Verão; seu consorte Oberon, o Senhor Verde; Hyrsam, o Príncipe dos Tolos; e antigas hag como Baba Yaga.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "fey-presence",
              "name": "Presença Feérica",
              "description": "Como ação, faça criaturas em um cubo de 3m centrado em você realizarem teste de Sabedoria contra CD de magia Bruxo. Falhando, ficam Fascinadas ou Assustadas (sua escolha) até seu próximo turno. Usável 1x/descanso curto ou longo :cite[1]:cite[2]."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "misty-escape",
              "name": "Fuga Nebulosa",
              "description": "Ao sofrer dano, use reação para ficar invisível e teleportar até 18m. Mantém invisibilidade até início do próximo turno ou ao atacar/conjurar. Usável 1x/descanso curto ou longo :cite[1]:cite[2]."
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "beguiling-defenses",
              "name": "Defesas Sedutoras",
              "description": "Imune a efeitos de encantamento. Quando outra criatura tentar encantá-lo, use reação para inverter o efeito: criatura deve salvar (Sabedoria contra CD de magia) ou ficará encantada por você por 1 minuto :cite[1]:cite[2]."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "dark-delirium",
              "name": "Delírio Sombrio",
              "description": "Como ação, mergulhe uma criatura visível em raio de 18m em reino ilusório. Falha no save (Sabedoria contra CD de magia) causa Fascínio ou Medo por 1 minuto (concentração). Criatura só vê você e a ilusão. Usável 1x/descanso longo :cite[1]:cite[2]."
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "faerie-fire", "name": "Fogo das Fadas", "url": "/api/spells/faerie-fire" },
            { "index": "sleep", "name": "Sono", "url": "/api/spells/sleep" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "calm-emotions", "name": "Acalmar Emoções", "url": "/api/spells/calm-emotions" },
            { "index": "phantasmal-force", "name": "Força Fantasmal", "url": "/api/spells/phantasmal-force" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "blink", "name": "Piscar", "url": "/api/spells/blink" },
            { "index": "plant-growth", "name": "Crescimento Vegetal", "url": "/api/spells/plant-growth" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "dominate-beast", "name": "Dominar Besta", "url": "/api/spells/dominate-beast" },
            { "index": "greater-invisibility", "name": "Invisibilidade Maior", "url": "/api/spells/greater-invisibility" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "dominate-person", "name": "Dominar Pessoa", "url": "/api/spells/dominate-person" },
            { "index": "seeming", "name": "Aparentar", "url": "/api/spells/seeming" }
          ]
        }
      ],
      "url": "/api/subclasses/the-archfey"
    },
    {
      "index": "the-great-old-one",
      "name": "O Grande Antigo",
      "class": {
        "index": "warlock",
        "name": "Bruxo",
        "url": "/api/classes/warlock"
      },
      "desc": [
        "Seu patrono é uma entidade misteriosa cuja natureza é completamente estranha à estrutura da realidade.",
        "Talvez venha do Far Realm, o espaço além da realidade, ou talvez seja um dos deuses antigos apenas conhecidos em lendas."
      ],
      "subclass_flavor": "Suas motivações são incompreensíveis para os mortais, e seu conhecimento é tão imenso e antigo que mesmo as maiores bibliotecas palidecem em comparação com os vastos segredos que detém.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "awakened-mind",
              "name": "Mente Desperta",
              "description": "Comunique-se telepaticamente com qualquer criatura visível a 9m que compartilhe um idioma. A comunicação é unilateral (sem resposta telepática) :cite[4]."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "entropic-ward",
              "name": "Proteção Entrópica",
              "description": "Como reação a um ataque contra você, cause desvantagem no atacante. Se errar, ganhe vantagem em ataques contra ele até seu próximo turno. Usável 1x/descanso curto ou longo :cite[4]."
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "thought-shield",
              "name": "Escudo Mental",
              "description": "Imune a dano psíquico e detecção de pensamentos. Como reação ao sofrer dano, cause 2d10 de dano psíquico no agressor a até 9m :cite[4]."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "create-thrall",
              "name": "Criar Servo",
              "description": "Toque uma humanoide incapacitada para encantá-la permanentemente. Ela obedece a seus comandos. Efeito termina com remove curse ou magia similar. Limite: 1 servo por vez :cite[4]."
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "dissonant-whispers", "name": "Sussurros Dissonantes", "url": "/api/spells/dissonant-whispers" },
            { "index": "tashas-hideous-laughter", "name": "Riso Horrendo de Tasha", "url": "/api/spells/tashas-hideous-laughter" }
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
            { "index": "clairvoyance", "name": "Clarividência", "url": "/api/spells/clairvoyance" },
            { "index": "sending", "name": "Enviar Mensagem", "url": "/api/spells/sending" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "dominate-beast", "name": "Dominar Besta", "url": "/api/spells/dominate-beast" },
            { "index": "evards-black-tentacles", "name": "Tentáculos Negros de Evard", "url": "/api/spells/evards-black-tentacles" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "dominate-person", "name": "Dominar Pessoa", "url": "/api/spells/dominate-person" },
            { "index": "telekinesis", "name": "Telecinesia", "url": "/api/spells/telekinesis" }
          ]
        }
      ],
      "url": "/api/subclasses/the-great-old-one"
    },
    {
      "index": "the-celestial",
      "name": "O Celestial",
      "class": {
        "index": "warlock",
        "name": "Bruxo",
        "url": "/api/classes/warlock"
      },
      "desc": [
        "Seu patrono é um ser poderoso dos planos superiores. Você fez um pacto com um empíreo, solar, ki-rin, unicórnio ou outro ser que reside nos planos de bem eterno.",
        "Seu pacto com esse ser permite que você experimente o toque mais fraco da luz sagrada que ilumina o multiverso."
      ],
      "subclass_flavor": "Ser conectado a tal poder pode causar mudanças em seu comportamento e crenças. Você pode se encontrar levado a aniquilar mortos-vivos, derrotar demônios e proteger os inocentes.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "bonus-cantrips",
              "name": "Truques Bônus",
              "description": "Aprenda os truques luz e prestidigitação. Eles não contam no seu limite de truques conhecidos :cite[4]."
            },
            {
              "index": "healing-light",
              "name": "Luz Curativa",
              "description": "Tenha d6s de cura = 1 + nível de Bruxo. Como ação bônus, cure uma criatura tocada gastando até metade desses d6s (mín 1). Recupera d6s em descanso longo :cite[4]."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "radiant-soul",
              "name": "Alma Radiante",
              "description": "Resistência a dano radiante. Ao conjurar magias de fogo ou radiante, adicione seu modificador de Carisma ao dano. Emite luz (1,5m raio brilhante + 1,5m penumbra) :cite[4]."
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "celestial-resilience",
              "name": "Resistência Celestial",
              "description": "Após descanso curto/longo, conceda PV temporários = metade do nível de Bruxo + mod. Carisma para até mod. Carisma criaturas (mín 1) :cite[4]."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "searing-vengeance",
              "name": "Vingança Ardente",
              "description": "Ao ser reduzido a 0 PV, use reação para levantar com 1 PV. Cause 2d8 + mod. Carisma de dano radiante e cegue criaturas em 9m até seu próximo turno. Usável 1x/descanso longo :cite[4]."
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "cure-wounds", "name": "Curar Ferimentos", "url": "/api/spells/cure-wounds" },
            { "index": "guiding-bolt", "name": "Seta Guiadora", "url": "/api/spells/guiding-bolt" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "flaming-sphere", "name": "Esfera Flamejante", "url": "/api/spells/flaming-sphere" },
            { "index": "lesser-restoration", "name": "Restauração Menor", "url": "/api/spells/lesser-restoration" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "daylight", "name": "Luz do Dia", "url": "/api/spells/daylight" },
            { "index": "revivify", "name": "Revivificar", "url": "/api/spells/revivify" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "guardian-of-faith", "name": "Guardião da Fé", "url": "/api/spells/guardian-of-faith" },
            { "index": "wall-of-fire", "name": "Muralha de Fogo", "url": "/api/spells/wall-of-fire" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "flame-strike", "name": "Coluna de Chamas", "url": "/api/spells/flame-strike" },
            { "index": "greater-restoration", "name": "Restauração Maior", "url": "/api/spells/greater-restoration" }
          ]
        }
      ],
      "url": "/api/subclasses/the-celestial"
    },
    {
      "index": "the-hexblade",
      "name": "A Lâmina Maldita",
      "class": {
        "index": "warlock",
        "name": "Bruxo",
        "url": "/api/classes/warlock"
      },
      "desc": [
        "Você fez seu pacto com uma entidade misteriosa do Shadowfell - uma força que se manifesta em armas sencientes nutridas pela mais escura emoção.",
        "A poderosa lâmina Blackrazor é a mais notável dessas armas, que foram todas forjadas no Shadowfell no alvorecer dos tempos por uma entidade desconhecida."
      ],
      "subclass_flavor": "Essas entidades de lâminas amaldiçoadas e a sombriamente poderosa força por trás delas são seu patrono. Esses patronos querem que você use essas armas para a derrota final da morte - levando o mundo a um estado de desolação similar ao Shadowfell.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "hexblades-curse",
              "name": "Maldição da Lâmina Maldita",
              "description": "Como ação bônus, amaldiçoe uma criatura a 9m. Por 1 minuto: +bônus de proficiência no dano contra ela, crítico em 19-20, e ao matá-la, cure PV = mod. Carisma + nível de Bruxo. Usável 1x/descanso curto/longo :cite[4]."
            },
            {
              "index": "hex-warrior",
              "name": "Guerreiro Amaldiçoado",
              "description": "Proficiência com armaduras médias, escudos e armas marciais. Use Carisma em vez de Força/Destreza para ataques e dano com armas corpo-a-corpo de uma mão :cite[4]."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "accursed-specter",
              "name": "Espectro Amaldiçoado",
              "description": "Ao reduzir humanoide a 0 PV, invoque um espectro aliado no espaço dele. Dura 1 hora ou até ser destruído. Usável 1x/descanso longo :cite[4]."
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "armor-of-hexes",
              "name": "Armadura de Maldições",
              "description": "Criaturas amaldiçoadas têm desvantagem em ataques contra você. Ao ser atingido por elas, use reação para rolar d6: 4+ evita o ataque :cite[4]."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "master-of-hexes",
              "name": "Mestre das Maldições",
              "description": "Ao matar criatura amaldiçoada, transfira a maldição para outra criatura visível como reação. Pode amaldiçoar duas criaturas simultaneamente :cite[4]."
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "shield", "name": "Escudo", "url": "/api/spells/shield" },
            { "index": "wrathful-smite", "name": "Golpe Colérico", "url": "/api/spells/wrathful-smite" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "blur", "name": "Desfoque", "url": "/api/spells/blur" },
            { "index": "branding-smite", "name": "Golpe Marcador", "url": "/api/spells/branding-smite" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "blink", "name": "Piscar", "url": "/api/spells/blink" },
            { "index": "elemental-weapon", "name": "Arma Elemental", "url": "/api/spells/elemental-weapon" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "phantasmal-killer", "name": "Assassino Fantasmal", "url": "/api/spells/phantasmal-killer" },
            { "index": "hallucinatory-terrain", "name": "Terreno Ilusório", "url": "/api/spells/hallucinatory-terrain" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "banishing-smite", "name": "Golpe Banidor", "url": "/api/spells/banishing-smite" },
            { "index": "cone-of-cold", "name": "Cone de Frio", "url": "/api/spells/cone-of-cold" }
          ]
        }
      ],
      "url": "/api/subclasses/the-hexblade"
    },
    {
      "index": "the-fathomless",
      "name": "O Insondável",
      "class": {
        "index": "warlock",
        "name": "Bruxo",
        "url": "/api/classes/warlock"
      },
      "desc": [
        "Você fez um pacto com uma entidade deific das profundezas do mar ou dos Planos Elementais da Água.",
        "Kraken, elementais primordiais da água, deidades do mar como Olhydra ou Dagon e outras entidades misteriosas das profundezas oceânicas ou do Plano Elemental da Água podem servir como patronos para aqueles que fazem tais pactos."
      ],
      "subclass_flavor": "Uma vez que você tenha feito um pacto com o mar, o oceano se torna um lugar de respiro e renovação para você.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "tentacle-of-the-deeps",
              "name": "Tentáculo das Profundezas",
              "description": "Ação bônus para invocar tentáculo aquático a 18m. Ele ataca como ação bônus, causando 1d8 + mod. Carisma de dano e reduzindo velocidade do alvo em 3m. Dura 1 minuto. Usos = mod. Carisma (mín 1), recarrega em descanso longo :cite[4]."
            },
            {
              "index": "gift-of-the-sea",
              "name": "Dádiva do Mar",
              "description": "Ganhe velocidade de nado igual à de caminhada e capacidade de respirar sob a água :cite[4]."
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "oceanic-soul",
              "name": "Alma Oceânica",
              "description": "Resistência a dano de frio. Imunidade a detecção mágica quando submerso (requer save bem-sucedido do detector) :cite[4]."
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "guardian-coil",
              "name": "Bobina Guardiã",
              "description": "Reação para reduzir velocidade de atacante em 3m se ele atacar aliado perto do seu tentáculo. O tentáculo pode realizar ataque de oportunidade contra o agressor :cite[4]."
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "grasping-tentacles",
              "name": "Tentáculos Agarradores",
              "description": "Ação para conjurar tentáculos em área de 6m de raio. Área se torna terreno difícil, e criaturas entrando/iniciando turno lá sofrem 2d8 de dano e podem ser agarradas (save de Força). Concentração até 1 minuto. Usável 1x/descanso longo :cite[4]."
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "create-or-destroy-water", "name": "Criar ou Destruir Água", "url": "/api/spells/create-or-destroy-water" },
            { "index": "thunderwave", "name": "Onda Trovejante", "url": "/api/spells/thunderwave" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "gust-of-wind", "name": "Rajada de Vento", "url": "/api/spells/gust-of-wind" },
            { "index": "silence", "name": "Silêncio", "url": "/api/spells/silence" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "lightning-bolt", "name": "Raio", "url": "/api/spells/lightning-bolt" },
            { "index": "sleet-storm", "name": "Tempestade de Granizo", "url": "/api/spells/sleet-storm" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "control-water", "name": "Controlar Água", "url": "/api/spells/control-water" },
            { "index": "summon-elemental", "name": "Invocar Elemental", "url": "/api/spells/summon-elemental" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "bigbys-hand", "name": "Mão de Bigby", "url": "/api/spells/bigbys-hand" },
            { "index": "cone-of-cold", "name": "Cone de Frio", "url": "/api/spells/cone-of-cold" }
          ]
        }
      ],
      "url": "/api/subclasses/the-fathomless"
    }
  ]
