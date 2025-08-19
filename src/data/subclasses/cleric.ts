import { Subclass } from "@/types/character"

 
 export const ClericSubclasses: Subclass[] = [
    {
      "index": "light-domain",
      "name": "Domínio da Luz",
      "class": {
        "index": "cleric",
        "name": "Clérico",
        "url": "/api/classes/cleric"
      },
      "desc": ["Deuses da luz – incluindo Helm, Lathander, Pholtus, Branchala, a Chama Prateada, Belenus, Apolo e Re-Horakhty – promovem os ideais de renascimento e renovação, verdade, vigilância e beleza."],
      "subclass_flavor": "Alguns desses deuses são retratados como o próprio sol ou como um cocheiro que guia o sol pelo céu. Outros são sentinelas incansáveis cujos olhos perfuram toda sombra e veem através de todo engano.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "bonus-cantrip-light",
              "name": "Truque Adicional",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "warding-flare",
              "name": "Clarão Protetor",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 2,
          "features": [
            {
              "index": "channel-divinity-radiance-of-dawn",
              "name": "Canalizar Divindade: Radiância do Amanhecer",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "improved-flare",
              "name": "Clarão Aprimorado",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 8,
          "features": [
            {
              "index": "potent-spellcasting",
              "name": "Conjuração Potente",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "corona-of-light",
              "name": "Coroa de Luz",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "burning-hands", "name": "Mãos Flamejantes", "url": "/api/spells/burning-hands" },
            { "index": "faerie-fire", "name": "Fogo das Fadas", "url": "/api/spells/faerie-fire" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "flaming-sphere", "name": "Esfera Flamejante", "url": "/api/spells/flaming-sphere" },
            { "index": "scorching-ray", "name": "Raio Ardente", "url": "/api/spells/scorching-ray" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "daylight", "name": "Luz do Dia", "url": "/api/spells/daylight" },
            { "index": "fireball", "name": "Bola de Fogo", "url": "/api/spells/fireball" }
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
            { "index": "scrying", "name": "Vidência", "url": "/api/spells/scrying" }
          ]
        }
      ],
      "url": "/api/subclasses/light-domain"
    },
    {
      "index": "knowledge-domain",
      "name": "Domínio do Conhecimento",
      "class": {
        "index": "cleric",
        "name": "Clérico",
        "url": "/api/classes/cleric"
      },
      "desc": [
        "Os deuses do conhecimento – incluindo Oghma, Boccob, Gilean, Aureon e Thoth – valorizam o aprendizado e o entendimento acima de tudo.",
        "Alguns ensinam que o conhecimento deve ser reunido e compartilhado em bibliotecas e universidades, ou promovem o conhecimento prático do artesanato e da invenção."
      ],
      "subclass_flavor": "Alguns deuses acumulam conhecimento e os mantêm em segredo para si mesmos, outros prometem conceder aos seus seguidores acesso a uma grande biblioteca mística.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "blessings-of-knowledge",
              "name": "Bênçãos do Conhecimento",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 2,
          "features": [
            {
              "index": "channel-divinity-knowledge-of-ages",
              "name": "Canalizar Divindade: Conhecimento das Eras",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "channel-divinity-read-thoughts",
              "name": "Canalizar Divindade: Ler Pensamentos",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 8,
          "features": [
            {
              "index": "potent-spellcasting",
              "name": "Conjuração Potente",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "visions-of-the-past",
              "name": "Visões do Passado",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "command", "name": "Comando", "url": "/api/spells/command" },
            { "index": "identify", "name": "Identificar", "url": "/api/spells/identify" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "augury", "name": "Augúrio", "url": "/api/spells/augury" },
            { "index": "suggestion", "name": "Sugestão", "url": "/api/spells/suggestion" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "nondetection", "name": "Indetectabilidade", "url": "/api/spells/nondetection" },
            { "index": "speak-with-dead", "name": "Falar com os Mortos", "url": "/api/spells/speak-with-dead" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "arcane-eye", "name": "Olho Arcano", "url": "/api/spells/arcane-eye" },
            { "index": "confusion", "name": "Confusão", "url": "/api/spells/confusion" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "legend-lore", "name": "Conhecimento Lendário", "url": "/api/spells/legend-lore" },
            { "index": "scrying", "name": "Vidência", "url": "/api/spells/scrying" }
          ]
        }
      ],
      "url": "/api/subclasses/knowledge-domain"
    },
    {
      "index": "nature-domain",
      "name": "Domínio da Natureza",
      "class": {
        "index": "cleric",
        "name": "Clérico",
        "url": "/api/classes/cleric"
      },
      "desc": [
        "Deuses da natureza são diversos quanto o mundo natural em si, de divindades benignas associadas com bosques particulares para divindades cruéis de desastres e pestilência.",
        "Os druidas reverenciam a natureza como um todo e podem servir uma dessas divindades, praticando rituais misteriosos e recitando orações na língua druídica."
      ],
      "subclass_flavor": "Muitos desses deuses têm clérigos, campeões que tomam um papel mais ativo em promover os interesses de um deus da natureza particular.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "acolyte-of-nature",
              "name": "Acólito da Natureza",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "bonus-proficiency-nature",
              "name": "Proficiência Adicional",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 2,
          "features": [
            {
              "index": "channel-divinity-charm-animals-plants",
              "name": "Canalizar Divindade: Encantar Animais e Plantas",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "dampen-elements",
              "name": "Amortecer Elementos",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 8,
          "features": [
            {
              "index": "divine-strike",
              "name": "Golpe Divino",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "master-of-nature",
              "name": "Mestre da Natureza",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "animal-friendship", "name": "Amizade Animal", "url": "/api/spells/animal-friendship" },
            { "index": "speak-with-animals", "name": "Falar com Animais", "url": "/api/spells/speak-with-animals" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "barkskin", "name": "Pele de Árvore", "url": "/api/spells/barkskin" },
            { "index": "spike-growth", "name": "Crescimento de Espinhos", "url": "/api/spells/spike-growth" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "plant-growth", "name": "Crescimento Vegetal", "url": "/api/spells/plant-growth" },
            { "index": "wind-wall", "name": "Muralha de Vento", "url": "/api/spells/wind-wall" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "dominate-beast", "name": "Dominar Fera", "url": "/api/spells/dominate-beast" },
            { "index": "grasping-vine", "name": "Cipó Agarrador", "url": "/api/spells/grasping-vine" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "insect-plague", "name": "Praga de Insetos", "url": "/api/spells/insect-plague" },
            { "index": "tree-stride", "name": "Caminhar em Árvores", "url": "/api/spells/tree-stride" }
          ]
        }
      ],
      "url": "/api/subclasses/nature-domain"
    },
    {
      "index": "tempest-domain",
      "name": "Domínio da Tempestade",
      "class": {
        "index": "cleric",
        "name": "Clérico",
        "url": "/api/classes/cleric"
      },
      "desc": [
        "Deuses cujos portfólios incluem o Domínio da Tempestade – incluindo Talos, Umberlee, Kord, Zeboim, o Devorador, Zeus e Thor – governam tempestades, mar e céu.",
        "Eles incluem deuses de relâmpagos e trovões, deuses de terremotos, alguns deuses do fogo e certos deuses de violência, força física e coragem."
      ],
      "subclass_flavor": "Marinheiros oram a esses deuses buscando ventos favoráveis e mares calmos, e oram para longe de suas iras quando ventos uivantes surgem para devastar embarcações contra os rochedos costeiros.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "bonus-proficiencies-tempest",
              "name": "Proficiências Adicionais",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "wrath-of-the-storm",
              "name": "Ira da Tempestade",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 2,
          "features": [
            {
              "index": "channel-divinity-destructive-wrath",
              "name": "Canalizar Divindade: Ira Destrutiva",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "thunderbolt-strike",
              "name": "Golpe do Raio",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 8,
          "features": [
            {
              "index": "divine-strike",
              "name": "Golpe Divino",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "stormborn",
              "name": "Nascido da Tempestade",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "fog-cloud", "name": "Nuvem de Névoa", "url": "/api/spells/fog-cloud" },
            { "index": "thunderwave", "name": "Onda Trovejante", "url": "/api/spells/thunderwave" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "gust-of-wind", "name": "Rajada de Vento", "url": "/api/spells/gust-of-wind" },
            { "index": "shatter", "name": "Despedaçar", "url": "/api/spells/shatter" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "call-lightning", "name": "Convocar Raios", "url": "/api/spells/call-lightning" },
            { "index": "sleet-storm", "name": "Tempestade de Granizo", "url": "/api/spells/sleet-storm" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "control-water", "name": "Controlar Água", "url": "/api/spells/control-water" },
            { "index": "ice-storm", "name": "Tempestade de Gelo", "url": "/api/spells/ice-storm" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "destructive-wave", "name": "Onda Destrutiva", "url": "/api/spells/destructive-wave" },
            { "index": "insect-plague", "name": "Praga de Insetos", "url": "/api/spells/insect-plague" }
          ]
        }
      ],
      "url": "/api/subclasses/tempest-domain"
    },
    {
      "index": "trickery-domain",
      "name": "Domínio da Trapaça",
      "class": {
        "index": "cleric",
        "name": "Clérico",
        "url": "/api/classes/cleric"
      },
      "desc": [
        "Deuses da trapaça – como Cyric, Beshaba, Hiddukel, Vecna, e Hermes – são desencaminhadores e instigadores que se colocam como um desafio constante à ordem aceita entre deuses e mortais.",
        "Eles são patronos de ladrões, canalhas, apostadores, rebeldes e libertadores."
      ],
      "subclass_flavor": "Seus clérigos são uma força disruptiva no mundo, cutucando consciências, zombando de tiranos, roubando dos ricos, libertando cativos e ignorando convenções vazias.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "blessing-of-the-trickster",
              "name": "Bênção do Trapaceiro",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 2,
          "features": [
            {
              "index": "channel-divinity-invoke-duplicity",
              "name": "Canalizar Divindade: Invocar Duplicata",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "channel-divinity-cloak-of-shadows",
              "name": "Canalizar Divindade: Manto de Sombras",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 8,
          "features": [
            {
              "index": "divine-strike",
              "name": "Golpe Divino",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "improved-duplicity",
              "name": "Duplicata Aprimorada",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "charm-person", "name": "Encantar Pessoa", "url": "/api/spells/charm-person" },
            { "index": "disguise-self", "name": "Disfarçar-se", "url": "/api/spells/disguise-self" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "mirror-image", "name": "Imagem Espelhada", "url": "/api/spells/mirror-image" },
            { "index": "pass-without-trace", "name": "Passar sem Pegadas", "url": "/api/spells/pass-without-trace" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "blink", "name": "Piscar", "url": "/api/spells/blink" },
            { "index": "dispel-magic", "name": "Dissipar Magia", "url": "/api/spells/dispel-magic" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "dimension-door", "name": "Porta Dimensional", "url": "/api/spells/dimension-door" },
            { "index": "polymorph", "name": "Metamorfose", "url": "/api/spells/polymorph" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "dominate-person", "name": "Dominar Pessoa", "url": "/api/spells/dominate-person" },
            { "index": "modify-memory", "name": "Modificar Memória", "url": "/api/spells/modify-memory" }
          ]
        }
      ],
      "url": "/api/subclasses/trickery-domain"
    },
    {
      "index": "war-domain",
      "name": "Domínio da Guerra",
      "class": {
        "index": "cleric",
        "name": "Clérico",
        "url": "/api/classes/cleric"
      },
      "desc": [
        "Guerra tem muitas manifestações. Pode fazer heróis de pessoas comuns. Pode ser desesperada e aterrorizante, com atos de covardia e brutalidade eclipsando instâncias de excelência e coragem.",
        "Em qualquer caso, os deuses da guerra observam guerreiros e recompensam por feitos poderosos com atos de violência."
      ],
      "subclass_flavor": "Os domínios da guerra e da morte trabalham intimamente juntos, pois guerra semeia morte, e morte desperta medo da guerra.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "bonus-proficiencies-war",
              "name": "Proficiências Adicionais",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "war-priest",
              "name": "Sacerdote da Guerra",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 2,
          "features": [
            {
              "index": "channel-divinity-guided-strike",
              "name": "Canalizar Divindade: Golpe Guiado",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "channel-divinity-war-god-blessing",
              "name": "Canalizar Divindade: Bênção do Deus da Guerra",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 8,
          "features": [
            {
              "index": "divine-strike",
              "name": "Golpe Divino",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "avatar-of-battle",
              "name": "Avatar da Batalha",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "divine-favor", "name": "Favor Divino", "url": "/api/spells/divine-favor" },
            { "index": "shield-of-faith", "name": "Escudo da Fé", "url": "/api/spells/shield-of-faith" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "magic-weapon", "name": "Arma Mágica", "url": "/api/spells/magic-weapon" },
            { "index": "spiritual-weapon", "name": "Arma Espiritual", "url": "/api/spells/spiritual-weapon" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "crusaders-mantle", "name": "Manto do Cruzado", "url": "/api/spells/crusaders-mantle" },
            { "index": "spirit-guardians", "name": "Guardiões Espirituais", "url": "/api/spells/spirit-guardians" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "freedom-of-movement", "name": "Liberdade de Movimento", "url": "/api/spells/freedom-of-movement" },
            { "index": "stoneskin", "name": "Pele de Pedra", "url": "/api/spells/stoneskin" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "flame-strike", "name": "Coluna de Chamas", "url": "/api/spells/flame-strike" },
            { "index": "hold-monster", "name": "Prender Monstro", "url": "/api/spells/hold-monster" }
          ]
        }
      ],
      "url": "/api/subclasses/war-domain"
    },
    {
      "index": "death-domain",
      "name": "Domínio da Morte",
      "class": {
        "index": "cleric",
        "name": "Clérico",
        "url": "/api/classes/cleric"
      },
      "desc": [
        "O Domínio da Morte se preocupa com as forças que causam morte, bem como a energia negativa que dá origem a criaturas mortas-vivas.",
        "Divindades da morte também governam sobre sonos e sonhos, às vezes atuando como porteiros entre o mundo dos vivos e o além."
      ],
      "subclass_flavor": "Deuses da morte incluem Chemosh, Myrkul, e Wee Jas. Esta subclasse está disponível apenas para campanhas que permitam conteúdo sombrio.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "bonus-proficiency-death",
              "name": "Proficiência Adicional",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "reaper",
              "name": "Ceifador",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 2,
          "features": [
            {
              "index": "channel-divinity-touch-of-death",
              "name": "Canalizar Divindade: Toque da Morte",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "inescapable-destruction",
              "name": "Destruição Inevitável",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 8,
          "features": [
            {
              "index": "divine-strike",
              "name": "Golpe Divino",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "improved-reaper",
              "name": "Ceifador Aprimorado",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "false-life", "name": "Vida Falsa", "url": "/api/spells/false-life" },
            { "index": "inflict-wounds", "name": "Infligir Ferimentos", "url": "/api/spells/inflict-wounds" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "blindness-deafness", "name": "Cegueira/Surdez", "url": "/api/spells/blindness-deafness" },
            { "index": "ray-of-enfeeblement", "name": "Raio de Enfraquecimento", "url": "/api/spells/ray-of-enfeeblement" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "animate-dead", "name": "Animar Mortos", "url": "/api/spells/animate-dead" },
            { "index": "vampiric-touch", "name": "Toque Vampírico", "url": "/api/spells/vampiric-touch" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "blight", "name": "Praga", "url": "/api/spells/blight" },
            { "index": "death-ward", "name": "Proteção contra a Morte", "url": "/api/spells/death-ward" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "antilife-shell", "name": "Concha Antivida", "url": "/api/spells/antilife-shell" },
            { "index": "cloudkill", "name": "Nuvem Mortal", "url": "/api/spells/cloudkill" }
          ]
        }
      ],
      "url": "/api/subclasses/death-domain"
    },
    {
      "index": "forge-domain",
      "name": "Domínio da Forja",
      "class": {
        "index": "cleric",
        "name": "Clérico",
        "url": "/api/classes/cleric"
      },
      "desc": [
        "Os deuses do domínio da forja são patronos dos artesãos que trabalham com metal, de ferreiros e artesãos a armeiros e joalheiros.",
        "Eles ensinam que, com paciência e trabalho duro, mesmo o metal mais intratável pode ser transformado de minério bruto em algo belo."
      ],
      "subclass_flavor": "Os seguidores dessas divindades buscam a perfeição através do trabalho incansável, criando não apenas objetos de beleza, mas também de grande poder.",
      "subclass_levels": [
        {
          "level": 1,
          "features": [
            {
              "index": "bonus-proficiencies-forge",
              "name": "Proficiências Adicionais",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "blessing-of-the-forge",
              "name": "Bênção da Forja",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 2,
          "features": [
            {
              "index": "channel-divinity-artisans-blessing",
              "name": "Canalizar Divindade: Bênção do Artesão",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "soul-of-the-forge",
              "name": "Alma da Forja",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 8,
          "features": [
            {
              "index": "divine-strike",
              "name": "Golpe Divino",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 17,
          "features": [
            {
              "index": "saint-of-forge-and-fire",
              "name": "Santo da Forja e Fogo",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 1,
          "spells": [
            { "index": "identify", "name": "Identificar", "url": "/api/spells/identify" },
            { "index": "searing-smite", "name": "Golpe Ardente", "url": "/api/spells/searing-smite" }
          ]
        },
        {
          "level": 3,
          "spells": [
            { "index": "heat-metal", "name": "Aquecer Metal", "url": "/api/spells/heat-metal" },
            { "index": "magic-weapon", "name": "Arma Mágica", "url": "/api/spells/magic-weapon" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "elemental-weapon", "name": "Arma Elemental", "url": "/api/spells/elemental-weapon" },
            { "index": "protection-from-energy", "name": "Proteção contra Energia", "url": "/api/spells/protection-from-energy" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "fabricate", "name": "Fabricar", "url": "/api/spells/fabricate" },
            { "index": "wall-of-fire", "name": "Muralha de Fogo", "url": "/api/spells/wall-of-fire" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "animate-objects", "name": "Animar Objetos", "url": "/api/spells/animate-objects" },
            { "index": "creation", "name": "Criação", "url": "/api/spells/creation" }
          ]
        }
      ],
      "url": "/api/subclasses/forge-domain"
    }
  ]
