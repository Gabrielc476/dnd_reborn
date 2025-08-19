import { Subclass } from "@/types/character"

 export const FighterSubclasses: Subclass[] = [
    {
      "index": "champion",
      "name": "Campeão",
      "class": {
        "index": "fighter",
        "name": "Guerreiro",
        "url": "/api/classes/fighter"
      },
      "desc": ["O arquétipo do Campeão foca na excelência física pura. Aqueles que seguem esse arquétipo combinam treinamento rigoroso com excelência física para produzir feitos marciais devastadores."],
      "subclass_flavor": "Campeões combinam treinamento rigoroso com excelência física para atingir feitos de guerra devastadores.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "improved-critical",
              "name": "Crítico Aprimorado",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "remarkable-athlete",
              "name": "Atleta Notável",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "additional-fighting-style",
              "name": "Estilo de Luta Adicional",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "superior-critical",
              "name": "Crítico Superior",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "survivor",
              "name": "Sobrevivente",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/champion"
    },
    {
      "index": "battle-master",
      "name": "Mestre de Batalha",
      "class": {
        "index": "fighter",
        "name": "Guerreiro",
        "url": "/api/classes/fighter"
      },
      "desc": ["Aqueles que emulam o arquétipo do Mestre de Batalha empregam técnicas marciais passadas através de gerações. Para um mestre de batalha, o combate é um campo acadêmico."],
      "subclass_flavor": "Para um mestre de batalha, o combate é um campo acadêmico, algumas vezes incluindo temas além da batalha como metalurgia, caligrafia e carpintaria.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "combat-superiority",
              "name": "Superioridade em Combate",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "maneuvers",
              "name": "Manobras",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "student-of-war",
              "name": "Estudante da Guerra",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "know-your-enemy",
              "name": "Conheça Seu Inimigo",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "improved-combat-superiority",
              "name": "Superioridade em Combate Aprimorada",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "relentless",
              "name": "Implacável",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "ultimate-combat-superiority",
              "name": "Superioridade em Combate Suprema",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/battle-master"
    },
    {
      "index": "eldritch-knight",
      "name": "Cavaleiro Arcano",
      "class": {
        "index": "fighter",
        "name": "Guerreiro",
        "url": "/api/classes/fighter"
      },
      "desc": ["O arquétipo de Cavaleiro Élfico combina a maestria marcial comum a todos os guerreiros com um estudo cuidadoso da magia."],
      "subclass_flavor": "Cavaleiros Élficos usam técnicas mágicas similares àquelas praticadas por magos. Eles focam seu estudo em duas das oito escolas de magia: abjuração e evocação.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "spellcasting-ek",
              "name": "Conjuração",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "weapon-bond",
              "name": "Ligação com Arma",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "war-magic",
              "name": "Magia de Guerra",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "eldritch-strike",
              "name": "Golpe Élfico",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "arcane-charge",
              "name": "Investida Arcana",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "improved-war-magic",
              "name": "Magia de Guerra Aprimorada",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/eldritch-knight"
    },
    {
      "index": "samurai",
      "name": "Samurai",
      "class": {
        "index": "fighter",
        "name": "Guerreiro",
        "url": "/api/classes/fighter"
      },
      "desc": [
        "O Samurai é um guerreiro que atrai sua força interior para lutar com resolução inabalável.",
        "Um samurai é resoluto face à morte e é leal ao código de honra do Bushido."
      ],
      "subclass_flavor": "Os samurais de D&D podem vir de qualquer cultura, mas seguem um código similar que enfatiza honra, coragem e disciplina.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "bonus-proficiency-samurai",
              "name": "Proficiência Adicional",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "fighting-spirit",
              "name": "Espírito de Luta",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "elegant-courtier",
              "name": "Cortesão Elegante",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "tireless-spirit",
              "name": "Espírito Incansável",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "rapid-strike",
              "name": "Golpe Rápido",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "strength-before-death",
              "name": "Força Antes da Morte",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/samurai"
    },
    {
      "index": "cavalier",
      "name": "Cavaleiro",
      "class": {
        "index": "fighter",
        "name": "Guerreiro",
        "url": "/api/classes/fighter"
      },
      "desc": [
        "O arqueótipo Cavaleiro representa o ideal de cavaleiros montados em armaduras brilhantes.",
        "Cavaleiros são mestres do combate montado e são especialmente eficazes em proteger seus aliados."
      ],
      "subclass_flavor": "Nem todos os cavaleiros históricos eram nobres ou mesmo montados, mas todos compartilhavam um código de conduta que priorizava honor e proteção dos mais fracos.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "bonus-proficiency-cavalier",
              "name": "Proficiência Adicional",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "born-to-the-saddle",
              "name": "Nascido para a Sela",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "unwavering-mark",
              "name": "Marca Inabalável",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "warding-maneuver",
              "name": "Manobra Protetora",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "hold-the-line",
              "name": "Manter a Linha",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "ferocious-charger",
              "name": "Investida Feroz",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "vigilant-defender",
              "name": "Defensor Vigilante",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/cavalier"
    },
    {
      "index": "arcane-archer",
      "name": "Arqueiro Arcano",
      "class": {
        "index": "fighter",
        "name": "Guerreiro",
        "url": "/api/classes/fighter"
      },
      "desc": [
        "Um Arqueiro Arcano estuda um método único de tiro com arco que tece magia nas flechas para produzir efeitos sobrenaturais.",
        "Arqueiros Arcanos são alguns dos mais conceituados guerreiros élfico, mas o arquétipo está disponível para personagens de qualquer raça."
      ],
      "subclass_flavor": "Esses guerreiros infundem suas flechas com essência mágica, criando munição que pode perfurar defesas mágicas ou produzir efeitos elementais devastadores.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "arcane-archer-lore",
              "name": "Conhecimento do Arqueiro Arcano",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "arcane-shot",
              "name": "Tiro Arcano",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "magic-arrow",
              "name": "Flecha Mágica",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "curving-shot",
              "name": "Tiro Curvado",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "arcane-shot-improvement",
              "name": "Melhoria do Tiro Arcano",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "ever-ready-shot",
              "name": "Tiro Sempre Pronto",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "arcane-shot-mastery",
              "name": "Maestria do Tiro Arcano",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/arcane-archer"
    },
    {
      "index": "banneret",
      "name": "Cavaleiro Púrpura",
      "class": {
        "index": "fighter",
        "name": "Guerreiro",
        "url": "/api/classes/fighter"
      },
      "desc": [
        "Um Cavaleiro Púrpura, também conhecido como banneret, exemplifica os ideais de cavalaria, coragem e táticas em campo de batalha.",
        "Reconhecido por sua liderança excepcional em campanhas militares, um Cavaleiro Púrpura recebe uma patente de nobreza."
      ],
      "subclass_flavor": "O Cavaleiro Púrpura atua como comandante de campo, inspirando aliados e coordenando estratégias de batalha com maestria militar.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "rallying-cry",
              "name": "Grito de Guerra",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "royal-envoy",
              "name": "Enviado Real",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "inspiring-surge",
              "name": "Surto Inspirador",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "bulwark",
              "name": "Baluarte",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "improved-inspiring-surge",
              "name": "Surto Inspirador Aprimorado",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/banneret"
    },
    {
      "index": "rune-knight",
      "name": "Cavaleiro das Runas",
      "class": {
        "index": "fighter",
        "name": "Guerreiro",
        "url": "/api/classes/fighter"
      },
      "desc": [
        "Cavaleiros das Runas aprimoram suas habilidades marciais usando os poderes sobrenaturais das runas antigas.",
        "Runas são símbolos mágicos que carregam poder vestigial dos gigantes que um dia dominaram gran parte do multiverso."
      ],
      "subclass_flavor": "Esses guerreiros estudam e aplicam runas gigantes, crescendo em tamanho e ganhando poderes ligados às tempestades, montanhas e outros aspectos primordiais.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "bonus-proficiencies-rune-knight",
              "name": "Proficiências Adicionais",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "rune-carver",
              "name": "Entalhador de Runas",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "giants-might",
              "name": "Força dos Gigantes",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "runic-shield",
              "name": "Escudo Rúnico",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "great-stature",
              "name": "Grande Estatura",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "master-of-runes",
              "name": "Mestre das Runas",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "runic-juggernaut",
              "name": "Juggernaut Rúnico",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/rune-knight"
    },
    {
      "index": "psi-warrior",
      "name": "Guerreiro Psíquico",
      "class": {
        "index": "fighter",
        "name": "Guerreiro",
        "url": "/api/classes/fighter"
      },
      "desc": [
        "Despertando para o poder psíquico dentro de si, um Guerreiro Psíquico é um guerreiro que aumenta sua força física, velocidade e táticas com poderes telecinéticos e telepáticos.",
        "Muitos githyanki treinam para se tornar tais guerreiros, como fazem alguns dos githzerai mais disciplinados."
      ],
      "subclass_flavor": "O Guerreiro Psíquico combina mestria marcial com poderes da mente, criando campos de força, movendo objetos com o pensamento e lendo intenções inimigas.",
      "subclass_levels": [
        {
          "level": 3,
          "features": [
            {
              "index": "telekinetic-movement",
              "name": "Movimento Telecinético",
              "description": "Descrição detalhada indisponível"
            },
            {
              "index": "psionic-power",
              "name": "Poder Psíquico",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 7,
          "features": [
            {
              "index": "telekinetic-adept",
              "name": "Adepto Telecinético",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 10,
          "features": [
            {
              "index": "guarded-mind",
              "name": "Mente Guardada",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 15,
          "features": [
            {
              "index": "bulwark-of-force",
              "name": "Baluarte de Força",
              "description": "Descrição detalhada indisponível"
            }
          ]
        },
        {
          "level": 18,
          "features": [
            {
              "index": "telekinetic-master",
              "name": "Mestre Telecinético",
              "description": "Descrição detalhada indisponível"
            }
          ]
        }
      ],
      "url": "/api/subclasses/psi-warrior"
    }
  ]
