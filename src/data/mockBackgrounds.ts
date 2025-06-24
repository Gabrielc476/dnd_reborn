// ===========================
// MOCK BACKGROUNDS DATA
// ===========================

import { DndBackground } from "@/types/characterCreation";

export const mockBackgrounds: DndBackground[] = [
  {
    index: "acolyte",
    name: "Acólito",
    starting_proficiencies: [],
    languages: [],
    starting_equipment: [],
    feature: {
      name: "Abrigo dos Fiéis",
      desc: ["Você tem acesso a um templo onde pode encontrar abrigo e cuidados."],
    },
    personality_traits: {
      choose: 2,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu idolatro um herói particular da minha fé.",
          },
          {
            option_type: "string",
            string: "Eu posso encontrar pontos em comum entre os inimigos mais ferozes.",
          },
          {
            option_type: "string",
            string: "Eu vejo presságios em cada evento e ação.",
          },
          {
            option_type: "string",
            string: "Nada pode abalar minha fé otimista.",
          },
        ],
      },
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Tradição. As tradições antigas devem ser preservadas.",
          },
          {
            option_type: "string",
            string: "Caridade. Eu sempre tento ajudar os necessitados.",
          },
        ],
      },
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu morreria para recuperar uma relíquia perdida da minha fé.",
          },
        ],
      },
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu julgo os outros severamente e a mim mesmo ainda mais.",
          },
        ],
      },
    },
    url: "/api/backgrounds/acolyte",
  },
  {
    index: "criminal",
    name: "Criminoso",
    starting_proficiencies: [],
    languages: [],
    starting_equipment: [],
    feature: {
      name: "Contato Criminal",
      desc: ["Você tem um contato confiável que atua como seu elo com uma rede de outros criminosos."],
    },
    personality_traits: {
      choose: 2,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu sempre tenho um plano para quando as coisas dão errado.",
          },
          {
            option_type: "string",
            string: "Eu sou incrivelmente lento para confiar.",
          },
        ],
      },
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Honra. Eu não roubo de outros do ramo.",
          },
          {
            option_type: "string",
            string: "Liberdade. Correntes são feitas para serem quebradas.",
          },
        ],
      },
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu sou culpado de um crime terrível e espero que algum dia me redima.",
          },
        ],
      },
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Quando vejo algo valioso, não consigo pensar em nada além de como roubá-lo.",
          },
        ],
      },
    },
    url: "/api/backgrounds/criminal",
  },
  {
    index: "folk-hero",
    name: "Herói do Povo",
    starting_proficiencies: [],
    languages: [],
    starting_equipment: [],
    feature: {
      name: "Hospitalidade Rústica",
      desc: ["Como você vem das fileiras do povo comum, você se encaixa entre eles com facilidade."],
    },
    personality_traits: {
      choose: 2,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu julgo as pessoas pelas suas ações, não pelas suas palavras.",
          },
          {
            option_type: "string",
            string: "Se alguém está em apuros, eu estou sempre pronto para ajudar.",
          },
        ],
      },
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Respeito. As pessoas merecem ser tratadas com dignidade.",
          },
          {
            option_type: "string",
            string: "Justiça. Ninguém deve receber tratamento preferencial.",
          },
        ],
      },
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu tenho uma família, mas não tenho ideia de onde eles estão.",
          },
        ],
      },
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "O tirano que governa minha terra nunca me deixará em paz.",
          },
        ],
      },
    },
    url: "/api/backgrounds/folk-hero",
  },
  {
    index: "noble",
    name: "Nobre",
    starting_proficiencies: [],
    languages: [],
    starting_equipment: [],
    feature: {
      name: "Posição de Privilégio",
      desc: ["Graças ao seu nascimento nobre, as pessoas estão inclinadas a pensar o melhor de você."],
    },
    personality_traits: {
      choose: 2,
      from: {
        options: [
          {
            option_type: "string",
            string: "Minha eloquência adulação torna qualquer um com quem converso meu amigo.",
          },
          {
            option_type: "string",
            string: "Apesar do meu nascimento nobre, não me coloco acima das outras pessoas.",
          },
        ],
      },
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Respeito. O respeito é devido a mim por causa da minha posição.",
          },
          {
            option_type: "string",
            string: "Responsabilidade. É meu dever respeitar a autoridade.",
          },
        ],
      },
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu enfrentarei qualquer desafio para ganhar a aprovação da minha família.",
          },
        ],
      },
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu secretamente acredito que todos estão abaixo de mim.",
          },
        ],
      },
    },
    url: "/api/backgrounds/noble",
  },
  {
    index: "sage",
    name: "Sábio",
    starting_proficiencies: [],
    languages: [],
    starting_equipment: [],
    feature: {
      name: "Pesquisador",
      desc: ["Quando você tenta aprender ou lembrar de uma informação, você sabe onde encontrá-la."],
    },
    personality_traits: {
      choose: 2,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu uso palavras polissílabas para transmitir a impressão de grande erudição.",
          },
          {
            option_type: "string",
            string: "Eu li todos os livros que posso e estou sempre procurando por mais conhecimento.",
          },
        ],
      },
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Conhecimento. O caminho para o poder e o autoaperfeiçoamento é através do conhecimento.",
          },
          {
            option_type: "string",
            string: "Beleza. O que é belo aponta para além de si mesmo.",
          },
        ],
      },
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "O trabalho da minha vida é uma série de tomos relacionados a um campo específico.",
          },
        ],
      },
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu falo sem realmente pensar nas minhas palavras, invariavelmente insultando outros.",
          },
        ],
      },
    },
    url: "/api/backgrounds/sage",
  },
  {
    index: "soldier",
    name: "Soldado",
    starting_proficiencies: [],
    languages: [],
    starting_equipment: [],
    feature: {
      name: "Posição Militar",
      desc: ["Você tem uma posição militar que lhe confere autoridade sobre soldados de menor rank."],
    },
    personality_traits: {
      choose: 2,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu sou sempre educado e respeitoso.",
          },
          {
            option_type: "string",
            string: "Eu sou assombrado por memórias de guerra.",
          },
        ],
      },
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Bem Maior. Nossos destinos estão unidos para o bem ou para o mal.",
          },
          {
            option_type: "string",
            string: "Responsabilidade. Eu faço o que preciso fazer e obedeço ordens justas.",
          },
        ],
      },
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu lutaria até a morte pelos meus companheiros.",
          },
        ],
      },
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "O inimigo monstruoso que enfrentei em batalha ainda me deixa tremendo de medo.",
          },
        ],
      },
    },
    url: "/api/backgrounds/soldier",
  },
];