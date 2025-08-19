// ===========================
  // DRUIDA SUBCLASSES
  // ===========================

import { Subclass } from "@/types/character"

  

export const DruidSubclasses: Subclass[] =[
    {
      "index": "circle-of-the-moon",
      "name": "Círculo da Lua",
      "class": {
        "index": "druid",
        "name": "Druida",
        "url": "/api/classes/druid"
      },
      "desc": ["Os druidas do Círculo da Lua são ferozes guardiões da natureza selvagem. Sua ordem se reúne sob a lua cheia para compartilhar notícias e trocar avisos."],
      "subclass_flavor": "Eles assombram as regiões selvagens mais profundas, onde podem ficar semanas sem encontrar outro humanoide, muito menos outro druida.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "combat-wild-shape",
              "name": "Forma Selvagem de Combate",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "circle-forms",
              "name": "Formas do Círculo",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 4,
          "features": [
            {
              "index": "primal-strike",
              "name": "Ataque Primitivo",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "elemental-wild-shape",
              "name": "Forma Selvagem Elemental",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "thousand-forms",
              "name": "Mil Formas",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/circle-of-the-moon"
    },
    {
      "index": "circle-of-the-stars",
      "name": "Círculo das Estrelas",
      "class": {
        "index": "druid",
        "name": "Druida",
        "url": "/api/classes/druid"
      },
      "desc": [
        "O Círculo das Estrelas permite que druidas aproveitem o poder do cosmos para lançar magias e parcialmente resistir ao destino através da divindade estelar.",
        "Muitos druidas deste círculo mantêm registros de constelações e os ciclos das estrelas, criando cartas estelares para navegação."
      ],
      "subclass_flavor": "Esses druidas acreditam que as estrelas mantêm segredos antigos que podem ser revelados através da observação cuidadosa e meditação.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "star-map",
              "name": "Mapa Estelar",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "starry-form",
              "name": "Forma Estelar",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "cosmic-omen",
              "name": "Presságio Cósmico",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "twinkling-constellations",
              "name": "Constelações Cintilantes",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "full-of-stars",
              "name": "Cheio de Estrelas",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/circle-of-the-stars"
    },
    {
      "index": "circle-of-dreams",
      "name": "Círculo dos Sonhos",
      "class": {
        "index": "druid",
        "name": "Druida",
        "url": "/api/classes/druid"
      },
      "desc": [
        "Druidas que são membros do Círculo dos Sonhos vieram em contato com o Feywild e suas redes de sonhos, visões e profecias reverberantes.",
        "Suas magias, seus talentos para vislumbrar o futuro e suas conexões feéricas os tornam premonitory em seu papel."
      ],
      "subclass_flavor": "Esses druidas buscam preencher o mundo com sonhos de esperança, alegria e paz, protegendo pessoas através de sonhos curativos.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "balm-of-the-summer-court",
              "name": "Bálsamo da Corte de Verão",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "hearth-of-moonlight-and-shadow",
              "name": "Lareira de Luar e Sombra",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "hidden-paths",
              "name": "Caminhos Ocultos",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "walker-in-dreams",
              "name": "Caminhante nos Sonhos",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/circle-of-dreams"
    },
    {
      "index": "circle-of-the-shepherd",
      "name": "Círculo do Pastor",
      "class": {
        "index": "druid",
        "name": "Druida",
        "url": "/api/classes/druid"
      },
      "desc": [
        "Druidas do Círculo do Pastor compartilham com espíritos da natureza, especialmente animais e fadas.",
        "Esses druidas reconhecem que todas as coisas vivas têm um papel a desempenhar no mundo natural, mas concentram-se especificamente em proteger animais e espíritos da fada."
      ],
      "subclass_flavor": "Estes druidas aceitam seu papel como pastores e guardiões da vida selvagem, desde os menores insetos até as maiores feras.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "speech-of-the-woods",
              "name": "Fala das Florestas",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "spirit-totem",
              "name": "Totem Espiritual",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "mighty-summoner",
              "name": "Invocador Poderoso",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "guardian-spirit",
              "name": "Espírito Guardião",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "faithful-summons",
              "name": "Invocações Fiéis",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/circle-of-the-shepherd"
    },
    {
      "index": "circle-of-spores",
      "name": "Círculo dos Esporos",
      "class": {
        "index": "druid",
        "name": "Druida",
        "url": "/api/classes/druid"
      },
      "desc": [
        "Druidas do Círculo dos Esporos encontram beleza na decadência. Eles veem dentro do mofo e outros fungos a capacidade de transformar matéria morta em vida nova, uma infinita fonte de renovação.",
        "Esses druidas acreditam que a vida e a morte são partes de um grandioso ciclo, com um fluindo para o outro constantemente."
      ],
      "subclass_flavor": "Para esses druidas, a morte não é o fim da vida, mas uma mudança de estado que vê a vida continuando de novas formas.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "circle-spells-spores",
              "name": "Magias do Círculo",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "halo-of-spores",
              "name": "Halo de Esporos",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "symbiotic-entity",
              "name": "Entidade Simbiótica",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "fungal-infestation",
              "name": "Infestação Fúngica",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "spreading-spores",
              "name": "Esporos em Propagação",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "fungal-body",
              "name": "Corpo Fúngico",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "blindness-deafness", "name": "Cegueira/Surdez", "url": "/api/spells/blindness-deafness" },
            { "index": "gentle-repose", "name": "Repouso Gentil", "url": "/api/spells/gentle-repose" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "animate-dead", "name": "Animar Mortos", "url": "/api/spells/animate-dead" },
            { "index": "gaseous-form", "name": "Forma Gasosa", "url": "/api/spells/gaseous-form" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "blight", "name": "Praga", "url": "/api/spells/blight" },
            { "index": "confusion", "name": "Confusão", "url": "/api/spells/confusion" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "cloudkill", "name": "Nuvem Mortal", "url": "/api/spells/cloudkill" },
            { "index": "contagion", "name": "Contágio", "url": "/api/spells/contagion" }
          ]
        }
      ],
      "url": "/api/subclasses/circle-of-spores"
    },
    {
      "index": "circle-of-wildfire",
      "name": "Círculo do Fogo Selvagem",
      "class": {
        "index": "druid",
        "name": "Druida",
        "url": "/api/classes/druid"
      },
      "desc": [
        "Druidas dentro do Círculo do Fogo Selvagem entendem que a destruição às vezes é o precursor da criação, como quando um incêndio florestal promove o crescimento posterior.",
        "Esses druidas se ligam a um espírito primitivo do fogo, um pequeno elemental que incorpora a criatividade e destruição do fogo."
      ],
      "subclass_flavor": "Eles ensinam que o fogo traz mudança, e é mudança - seja através de renovação ou destruição - que promove a impetuosidade da natureza.",
      "subclass_levels": [
        {
          "level": 2,
          "features": [
            {
              "index": "circle-spells-wildfire",
              "name": "Magias do Círculo",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "summon-wildfire-spirit",
              "name": "Invocar Espírito do Fogo Selvagem",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "enhanced-bond",
              "name": "Ligação Fortalecida",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "cauterizing-flames",
              "name": "Chamas Cauterizadoras",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "blazing-revival",
              "name": "Renascimento Flamejante",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "spells": [
        {
          "level": 3,
          "spells": [
            { "index": "burning-hands", "name": "Mãos Flamejantes", "url": "/api/spells/burning-hands" },
            { "index": "cure-wounds", "name": "Curar Ferimentos", "url": "/api/spells/cure-wounds" }
          ]
        },
        {
          "level": 5,
          "spells": [
            { "index": "flaming-sphere", "name": "Esfera Flamejante", "url": "/api/spells/flaming-sphere" },
            { "index": "scorching-ray", "name": "Raio Ardente", "url": "/api/spells/scorching-ray" }
          ]
        },
        {
          "level": 7,
          "spells": [
            { "index": "plant-growth", "name": "Crescimento Vegetal", "url": "/api/spells/plant-growth" },
            { "index": "revivify", "name": "Revivificar", "url": "/api/spells/revivify" }
          ]
        },
        {
          "level": 9,
          "spells": [
            { "index": "aura-of-life", "name": "Aura da Vida", "url": "/api/spells/aura-of-life" },
            { "index": "fire-shield", "name": "Escudo de Fogo", "url": "/api/spells/fire-shield" }
          ]
        }
      ],
      "url": "/api/subclasses/circle-of-wildfire"
    }
  ]
