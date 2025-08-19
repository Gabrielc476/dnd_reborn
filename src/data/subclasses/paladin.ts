import { Subclass } from "@/types/character";

export const PaladinSubclasses: Subclass[] =  [
    {
      "index": "oath-of-the-ancients",
      "name": "Juramento dos Anciões",
      "class": {
        "index": "paladin",
        "name": "Paladino",
        "url": "/api/classes/paladin"
      },
      "desc": [
        "O Juramento dos Anciões é tão antigo quanto a raça dos elfos e os rituais dos druidas.",
        "Às vezes chamados de cavaleiros feéricos, cavaleiros verdes ou cavaleiros cornudos, paladinos que fazem esse juramento lançam sua sorte com o lado da luz na luta cósmica contra as trevas."
      ],
      "subclass_flavor": "Eles amam a luz bonita e risonha do sol, a música do riacho, o sussurro do vento através das folhas de carvalho. Eles protegem estas coisas contra a escuridão que as ameaçaria.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "channel-divinity-ancients",
              "name": "Canalizar Divindade",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "aura-of-warding",
              "name": "Aura de Proteção",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "undying-sentinel",
              "name": "Sentinela Imortal",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 20,
          "features": [
            {
              "index": "elder-champion",
              "name": "Campeão Ancião",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "ensnaring-strike", "name": "Golpe Laçador", "url": "/api/spells/ensnaring-strike" },
            { "index": "speak-with-animals", "name": "Falar com Animais", "url": "/api/spells/speak-with-animals" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "moonbeam", "name": "Raio Lunar", "url": "/api/spells/moonbeam" },
            { "index": "misty-step", "name": "Passo Sombrio", "url": "/api/spells/misty-step" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "plant-growth", "name": "Crescimento Vegetal", "url": "/api/spells/plant-growth" },
            { "index": "protection-from-energy", "name": "Proteção contra Energia", "url": "/api/spells/protection-from-energy" }
          ]
        },
        {
          "level": 13,
          "spells": [
            { "index": "ice-storm", "name": "Tempestade de Gelo", "url": "/api/spells/ice-storm" },
            { "index": "stoneskin", "name": "Pele de Pedra", "url": "/api/spells/stoneskin" }
          ]
        },
        {
          "level": 17,
          "spells": [
            { "index": "commune-with-nature", "name": "Comunhão com a Natureza", "url": "/api/spells/commune-with-nature" },
            { "index": "tree-stride", "name": "Caminhar em Árvores", "url": "/api/spells/tree-stride" }
          ]
        }
      ],
      "url": "/api/subclasses/oath-of-the-ancients"
    },
    {
      "index": "oath-of-vengeance",
      "name": "Juramento de Vingança",
      "class": {
        "index": "paladin",
        "name": "Paladino",
        "url": "/api/classes/paladin"
      },
      "desc": [
        "O Juramento de Vingança é um comprometimento solene em punir aqueles que cometeram pecados terrivelmente graves.",
        "Quando forças do mal massacram aldeões indefesos, quando todo um povo se volta contra a vontade dos deuses, quando uma guilda de ladrões se torna muito violenta e poderosa, quando um dragão assola o interior - em momentos como esses, paladinos surgem e fazem o Juramento de Vingança."
      ],
      "subclass_flavor": "Para esses paladinos - às vezes chamados vingadores ou cavaleiros sombrios - sua própria pureza não é tão importante quanto entregar justiça.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "channel-divinity-vengeance",
              "name": "Canalizar Divindade",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "relentless-avenger",
              "name": "Vingador Implacável",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "soul-of-vengeance",
              "name": "Alma da Vingança",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 20,
          "features": [
            {
              "index": "avenging-angel",
              "name": "Anjo Vingador",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "bane", "name": "Perdição", "url": "/api/spells/bane" },
            { "index": "hunters-mark", "name": "Marca do Caçador", "url": "/api/spells/hunters-mark" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "hold-person", "name": "Prender Pessoa", "url": "/api/spells/hold-person" },
            { "index": "misty-step", "name": "Passo Sombrio", "url": "/api/spells/misty-step" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "haste", "name": "Acelerar", "url": "/api/spells/haste" },
            { "index": "protection-from-energy", "name": "Proteção contra Energia", "url": "/api/spells/protection-from-energy" }
          ]
        },
        {
          "level": 13,
          "spells": [
            { "index": "banishment", "name": "Banimento", "url": "/api/spells/banishment" },
            { "index": "dimension-door", "name": "Porta Dimensional", "url": "/api/spells/dimension-door" }
          ]
        },
        {
          "level": 17,
          "spells": [
            { "index": "hold-monster", "name": "Prender Monstro", "url": "/api/spells/hold-monster" },
            { "index": "scrying", "name": "Vidência", "url": "/api/spells/scrying" }
          ]
        }
      ],
      "url": "/api/subclasses/oath-of-vengeance"
    },
    {
      "index": "oath-of-conquest",
      "name": "Juramento de Conquista",
      "class": {
        "index": "paladin",
        "name": "Paladino",
        "url": "/api/classes/paladin"
      },
      "desc": [
        "O Juramento de Conquista clama por esmagamento dos inimigos de ordem e lei por qualquer meio necessário.",
        "Os paladinos que fazem esse juramento são conhecidos como conquistadores, cavaleiros de ferro ou cavaleiros de ferro."
      ],
      "subclass_flavor": "Alguns desses paladinos vão tão longe a ponto de consorciar com os poderes dos Nove Infernos, valorizando o domínio da lei acima da pureza de seus corações.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "channel-divinity-conquest",
              "name": "Canalizar Divindade",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "aura-of-conquest",
              "name": "Aura de Conquista",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "scornful-rebuke",
              "name": "Repreensão Desdenhosa",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 20,
          "features": [
            {
              "index": "invincible-conqueror",
              "name": "Conquistador Invencível",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "armor-of-agathys", "name": "Armadura de Agathys", "url": "/api/spells/armor-of-agathys" },
            { "index": "command", "name": "Comando", "url": "/api/spells/command" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "hold-person", "name": "Prender Pessoa", "url": "/api/spells/hold-person" },
            { "index": "spiritual-weapon", "name": "Arma Espiritual", "url": "/api/spells/spiritual-weapon" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "bestow-curse", "name": "Lançar Maldição", "url": "/api/spells/bestow-curse" },
            { "index": "fear", "name": "Medo", "url": "/api/spells/fear" }
          ]
        },
        {
          "level": 13,
          "spells": [
            { "index": "dominate-beast", "name": "Dominar Fera", "url": "/api/spells/dominate-beast" },
            { "index": "stoneskin", "name": "Pele de Pedra", "url": "/api/spells/stoneskin" }
          ]
        },
        {
          "level": 17,
          "spells": [
            { "index": "cloudkill", "name": "Nuvem Mortal", "url": "/api/spells/cloudkill" },
            { "index": "dominate-person", "name": "Dominar Pessoa", "url": "/api/spells/dominate-person" }
          ]
        }
      ],
      "url": "/api/subclasses/oath-of-conquest"
    },
    {
      "index": "oath-of-redemption",
      "name": "Juramento de Redenção",
      "class": {
        "index": "paladin",
        "name": "Paladino",
        "url": "/api/classes/paladin"
      },
      "desc": [
        "O Juramento de Redenção coloca um paladino no caminho da busca de paz através de sua própria palavra e ações.",
        "Esses paladinos acreditam que qualquer pessoa pode ser redimida e que o caminho da benevolência e justiça é o que todos devem trilhar."
      ],
      "subclass_flavor": "Esses paladinos enfrentam o mal onde quer que o encontrem, mas show mercy para àqueles que encontraram e chegaram ao arrependimento pela maldade.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "channel-divinity-redemption",
              "name": "Canalizar Divindade",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "aura-of-the-guardian",
              "name": "Aura do Guardião",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "protective-spirit",
              "name": "Espírito Protetor",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 20,
          "features": [
            {
              "index": "emissary-of-redemption",
              "name": "Emissário da Redenção",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "sanctuary", "name": "Santuário", "url": "/api/spells/sanctuary" },
            { "index": "sleep", "name": "Sono", "url": "/api/spells/sleep" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "calm-emotions", "name": "Acalmar Emoções", "url": "/api/spells/calm-emotions" },
            { "index": "hold-person", "name": "Prender Pessoa", "url": "/api/spells/hold-person" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "counterspell", "name": "Contra-atacar", "url": "/api/spells/counterspell" },
            { "index": "hypnotic-pattern", "name": "Padrão Hipnótico", "url": "/api/spells/hypnotic-pattern" }
          ]
        },
        {
          "level": 13,
          "spells": [
            { "index": "otiluke-resilient-sphere", "name": "Esfera Resistente de Otiluke", "url": "/api/spells/otiluke-resilient-sphere" },
            { "index": "stoneskin", "name": "Pele de Pedra", "url": "/api/spells/stoneskin" }
          ]
        },
        {
          "level": 17,
          "spells": [
            { "index": "hold-monster", "name": "Prender Monstro", "url": "/api/spells/hold-monster" },
            { "index": "wall-of-force", "name": "Muralha de Força", "url": "/api/spells/wall-of-force" }
          ]
        }
      ],
      "url": "/api/subclasses/oath-of-redemption"
    },
    {
      "index": "oath-of-glory",
      "name": "Juramento da Glória",
      "class": {
        "index": "paladin",
        "name": "Paladino",
        "url": "/api/classes/paladin"
      },
      "desc": [
        "Paladinos que fazem o Juramento da Glória acreditam que eles e seus companheiros estão destinados a alcançar glória através de feitos de heroísmo.",
        "Eles se esforçam para responder aos desafios dignos de lenda."
      ],
      "subclass_flavor": "Esses paladinos aspiram destino. Com suas ações, eles esperam garantir seu lugar nas lendas.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "channel-divinity-glory",
              "name": "Canalizar Divindade",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "aura-of-alacrity",
              "name": "Aura de Prontidão",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "glorious-defense",
              "name": "Defesa Gloriosa",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 20,
          "features": [
            {
              "index": "living-legend",
              "name": "Lenda Viva",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "guiding-bolt", "name": "Raio Guiador", "url": "/api/spells/guiding-bolt" },
            { "index": "heroism", "name": "Heroísmo", "url": "/api/spells/heroism" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "enhance-ability", "name": "Fortalecer Habilidade", "url": "/api/spells/enhance-ability" },
            { "index": "magic-weapon", "name": "Arma Mágica", "url": "/api/spells/magic-weapon" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "haste", "name": "Acelerar", "url": "/api/spells/haste" },
            { "index": "protection-from-energy", "name": "Proteção contra Energia", "url": "/api/spells/protection-from-energy" }
          ]
        },
        {
          "level": 13,
          "spells": [
            { "index": "compulsion", "name": "Compulsão", "url": "/api/spells/compulsion" },
            { "index": "freedom-of-movement", "name": "Liberdade de Movimento", "url": "/api/spells/freedom-of-movement" }
          ]
        },
        {
          "level": 17,
          "spells": [
            { "index": "commune", "name": "Comunhão", "url": "/api/spells/commune" },
            { "index": "flame-strike", "name": "Coluna de Chamas", "url": "/api/spells/flame-strike" }
          ]
        }
      ],
      "url": "/api/subclasses/oath-of-glory"
    },
    {
      "index": "oath-of-the-watchers",
      "name": "Juramento dos Vigilantes",
      "class": {
        "index": "paladin",
        "name": "Paladino",
        "url": "/api/classes/paladin"
      },
      "desc": [
        "O Juramento dos Vigilantes vincula paladinos a vigiar contra as forças que se originam além do Reino Material.",
        "Muitas ameaças aos humanos, elfos, anões e outras raças nativas do Reino Material se originam nos outros planos de existência."
      ],
      "subclass_flavor": "Os Vigilantes buscam manter essas ameaças à distância, mantendo vigília eterna contra invasores de outros planos.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "channel-divinity-watchers",
              "name": "Canalizar Divindade",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "aura-of-the-sentinel",
              "name": "Aura do Sentinela",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "vigilant-rebuke",
              "name": "Repreensão Vigilante",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 20,
          "features": [
            {
              "index": "mortal-bulwark",
              "name": "Baluarte Mortal",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "alarm", "name": "Alarme", "url": "/api/spells/alarm" },
            { "index": "detect-magic", "name": "Detectar Magia", "url": "/api/spells/detect-magic" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "moonbeam", "name": "Raio Lunar", "url": "/api/spells/moonbeam" },
            { "index": "see-invisibility", "name": "Ver o Invisível", "url": "/api/spells/see-invisibility" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "counterspell", "name": "Contra-atacar", "url": "/api/spells/counterspell" },
            { "index": "nondetection", "name": "Indetectabilidade", "url": "/api/spells/nondetection" }
          ]
        },
        {
          "level": 13,
          "spells": [
            { "index": "aura-of-purity", "name": "Aura de Pureza", "url": "/api/spells/aura-of-purity" },
            { "index": "banishment", "name": "Banimento", "url": "/api/spells/banishment" }
          ]
        },
        {
          "level": 17,
          "spells": [
            { "index": "hold-monster", "name": "Prender Monstro", "url": "/api/spells/hold-monster" },
            { "index": "scrying", "name": "Vidência", "url": "/api/spells/scrying" }
          ]
        }
      ],
      "url": "/api/subclasses/oath-of-the-watchers"
    }
  ]
