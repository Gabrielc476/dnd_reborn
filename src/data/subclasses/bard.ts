import { Subclass } from "@/types/character";

export const BardSubClasses: Subclass[] = [
    {
      "index": "college-of-valor",
      "name": "Colégio da Bravura",
      "class": {
        "index": "bard",
        "name": "Bardo",
        "url": "/api/classes/bard"
      },
      "desc": ["Os bardos do Colégio da Bravura são audaciosos contadores de histórias cujos contos mantêm viva a memória dos grandes heróis do passado."],
      "subclass_flavor": "Esses bardos se reúnem em halls de hidromel ou ao redor de grandes fogueiras para cantar as façanhas dos poderosos, tanto do passado quanto do presente.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "bonus-proficiencies-valor",
              "name": "Proficiências Adicionais",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "combat-inspiration",
              "name": "Inspiração em Combate",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "extra-attack",
              "name": "Ataque Extra",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "combat-inspiration-improved",
              "name": "Inspiração em Combate (Aprimorada)",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/college-of-valor"
    },
    {
      "index": "college-of-glamour",
      "name": "Colégio do Glamour",
      "class": {
        "index": "bard",
        "name": "Bardo",
        "url": "/api/classes/bard"
      },
      "desc": [
        "O Colégio do Glamour é o lar de bardos que dominaram suas artes no reino vibrante das fadas ou sob a tutela de alguém que residiu lá.",
        "Instruídos por sátiros, eladrin e outras criaturas feéricas, esses bardos aprendem a usar sua magia para deleitar e cativar outros."
      ],
      "subclass_flavor": "Os membros deste colégio são considerados cativantes e carismáticos, embora muitos também sejam considerados egocêntricos e perigosos.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "mantle-of-inspiration",
              "name": "Manto da Inspiração",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "enthralling-performance",
              "name": "Performance Cativante",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "extra-magical-secrets",
              "name": "Segredos Mágicos Extras",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "unbreakable-majesty",
              "name": "Majestade Inquebrantável",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/college-of-glamour"
    },
    {
      "index": "college-of-swords",
      "name": "Colégio das Espadas",
      "class": {
        "index": "bard",
        "name": "Bardo",
        "url": "/api/classes/bard"
      },
      "desc": [
        "Os bardos do Colégio das Espadas são chamados de lâminas, e entretêm através de façanhas de proeza marcial.",
        "As lâminas realizam acrobacias como engolir espadas, arremesso de punhais e exibições de esgrima."
      ],
      "subclass_flavor": "Embora usem sua magia para criar efeitos extraordinários, uma lâmina verdadeira confia na sua arma tanto quanto na sua sagacidade.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "fighting-style-bard",
              "name": "Estilo de Luta",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "blade-flourish",
              "name": "Floreio de Lâmina",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "extra-attack-bard",
              "name": "Ataque Extra",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "masters-flourish",
              "name": "Floreio do Mestre",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/college-of-swords"
    },
    {
      "index": "college-of-whispers",
      "name": "Colégio dos Sussurros",
      "class": {
        "index": "bard",
        "name": "Bardo",
        "url": "/api/classes/bard"
      },
      "desc": [
        "A maioria das pessoas fica feliz em receber um bardo em uma taverna ou numa fogueira de acampamento.",
        "Afinal, bardos trazem notícias, músicas e contos de terras distantes. Mas nem todo bardo é tão benigno."
      ],
      "subclass_flavor": "O Colégio dos Sussurros ensina que música e palavras são não apenas para diversão, mas também armas poderosas.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "psychic-blades",
              "name": "Lâminas Psíquicas",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "words-of-terror",
              "name": "Palavras de Terror",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "mantle-of-whispers",
              "name": "Manto dos Sussurros",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "shadow-lore",
              "name": "Conhecimento Sombrio",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/college-of-whispers"
    },
    {
      "index": "college-of-eloquence",
      "name": "Colégio da Eloquência",
      "class": {
        "index": "bard",
        "name": "Bardo",
        "url": "/api/classes/bard"
      },
      "desc": [
        "Aderentes ao Colégio da Eloquência dominam a arte da oratória.",
        "Persuasão é considerada uma alta arte, e um bardo bem versado é respeitado nos salões de poder."
      ],
      "subclass_flavor": "Esses bardos exercem uma mistura de lógica e performance teatral, ganhando força das verdades universais da retórica e do drama.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "silver-tongue",
              "name": "Língua de Prata",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "unsettling-words",
              "name": "Palavras Perturbadoras",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "universal-speech",
              "name": "Fala Universal",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "infectious-inspiration",
              "name": "Inspiração Contagiosa",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/college-of-eloquence"
    },
    {
      "index": "college-of-creation",
      "name": "Colégio da Criação",
      "class": {
        "index": "bard",
        "name": "Bardo",
        "url": "/api/classes/bard"
      },
      "desc": [
        "Bardos acreditam que o cosmos é uma obra de arte - as criações dos primeiros dragões e deuses.",
        "Esse conceito de origem criativa alimenta a filosofia do Colégio da Criação."
      ],
      "subclass_flavor": "Os bardos deste colégio acreditam que o multiverso é literalmente uma performance que ainda está sendo escrita, e buscam deixar sua marca nesta grande obra.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "note-of-potential",
              "name": "Nota de Potencial",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "performance-of-creation",
              "name": "Performance da Criação",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "animating-performance",
              "name": "Performance Animadora",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "creative-crescendo",
              "name": "Crescendo Criativo",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/college-of-creation"
    },
    {
      "index": "college-of-spirits",
      "name": "Colégio dos Espíritos",
      "class": {
        "index": "bard",
        "name": "Bardo",
        "url": "/api/classes/bard"
      },
      "desc": [
        "Os bardos do Colégio dos Espíritos buscam contos com espíritos mortos.",
        "Usando rituais rituais e seances, esses bardos chamam os espíritos dos mortos."
      ],
      "subclass_flavor": "Esses bardos usam suas canções e contos para invocar espíritos que compartilham conhecimento esquecido e auxiliam o bardo em suas aventuras.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "guiding-whispers",
              "name": "Sussurros Orientadores",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "spiritual-focus",
              "name": "Foco Espiritual",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 6,
          "features": [
            {
              "index": "tales-from-beyond",
              "name": "Contos do Além",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 14,
          "features": [
            {
              "index": "spirit-session",
              "name": "Sessão Espiritual",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/college-of-spirits"
    }
  ]
