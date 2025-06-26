// ===========================
// MOCK BACKGROUNDS DATA - COMPLETE SRD
// ===========================

import { DndBackground } from "@/types/characterCreation";

export const mockBackgrounds: DndBackground[] = [
  // ===========================
  // ACÓLITO
  // ===========================
  {
    index: "acolyte",
    name: "Acólito",
    starting_proficiencies: [
      { index: "insight", name: "Intuição", url: "" },
      { index: "religion", name: "Religião", url: "" }
    ],
    languages: [
      { index: "any-two", name: "Dois idiomas à sua escolha", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "holy-symbol", name: "Símbolo sagrado", url: "" }, quantity: 1 },
      { equipment: { index: "prayer-book", name: "Livro de orações", url: "" }, quantity: 1 },
      { equipment: { index: "incense", name: "5 varetas de incenso", url: "" }, quantity: 5 },
      { equipment: { index: "vestments", name: "Vestes", url: "" }, quantity: 1 },
      { equipment: { index: "common-clothes", name: "Roupas comuns", url: "" }, quantity: 1 },
      { equipment: { index: "belt-pouch", name: "Algibeira", url: "" }, quantity: 1 },
      { equipment: { index: "gold-pieces", name: "15 moedas de ouro", url: "" }, quantity: 15 }
    ],
    feature: {
      name: "Abrigo dos Fiéis",
      desc: [
        "Como um acólito, você comanda o respeito daqueles que compartilham sua fé, e você pode realizar as cerimônias religiosas de sua divindade. Você e seus companheiros aventureiros podem esperar receber cura gratuita e cuidados em um templo, santuário ou outra presença estabelecida de sua fé, embora você deva fornecer quaisquer componentes materiais necessários para magias.",
        "Aqueles que compartilham sua religião vão apoiá-lo (mas apenas você) com um estilo de vida modesto.",
        "Você também pode ter laços com um templo específico dedicado à sua divindade ou panteão escolhido, e você tem uma residência lá. Isso pode ser o templo onde você costumava servir, se você permanece em bons termos com ele, ou um templo onde você encontrou um novo lar. Enquanto estiver perto de seu templo, você pode chamar os sacerdotes para assistência, desde que a assistência que você pedir não seja perigosa e você permaneça em situação regular com seu templo."
      ]
    },
    personality_traits: {
      choose: 2,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu idolatro um herói particular da minha fé e constantemente me refiro aos feitos e exemplo dessa pessoa."
          },
          {
            option_type: "string",
            string: "Eu posso encontrar pontos em comum entre os inimigos mais ferozes, empatizando com eles e sempre trabalhando em direção à paz."
          },
          {
            option_type: "string",
            string: "Eu vejo presságios em cada evento e ação. Os deuses estão tentando falar conosco, só precisamos ouvir."
          },
          {
            option_type: "string",
            string: "Nada pode abalar minha fé otimista."
          },
          {
            option_type: "string",
            string: "Eu cito (ou cito erroneamente) textos sagrados e provérbios em quase todas as situações."
          },
          {
            option_type: "string",
            string: "Eu sou tolerante (ou intolerante) de outras fés e respeito (ou condeno) a adoração de outros deuses."
          },
          {
            option_type: "string",
            string: "Eu desfrutei de comida fina e hospedagem no templo e tenho dificuldade com as dificuldades da vida de aventureiro."
          },
          {
            option_type: "string",
            string: "Eu passei tanto tempo no templo que tenho pouca experiência prática em lidar com pessoas no mundo exterior."
          }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            alignments: [{ index: "lawful", name: "Leal", url: "" }],
            desc: "Tradição. As tradições antigas de adoração e sacrifício devem ser preservadas e mantidas."
          },
          {
            option_type: "string",
            alignments: [{ index: "good", name: "Bondoso", url: "" }],
            desc: "Caridade. Eu sempre tento ajudar os necessitados, não importa qual seja o custo pessoal."
          },
          {
            option_type: "string",
            alignments: [{ index: "good", name: "Bondoso", url: "" }],
            desc: "Mudança. Devemos ajudar a trazer as mudanças que os deuses estão constantemente trabalhando no mundo."
          },
          {
            option_type: "string",
            alignments: [{ index: "lawful", name: "Leal", url: "" }],
            desc: "Poder. Eu espero um dia alcançar o topo da hierarquia da minha fé."
          },
          {
            option_type: "string",
            alignments: [{ index: "neutral", name: "Neutro", url: "" }],
            desc: "Fé. Eu confio que minha divindade guiará minhas ações. Eu tenho fé de que se eu trabalhar duro, as coisas darão certo."
          },
          {
            option_type: "string",
            alignments: [{ index: "any", name: "Qualquer", url: "" }],
            desc: "Aspiração. Eu procuro me provar digno da favor do meu deus, combinando as minhas ações contra os seus ou seus ensinamentos."
          }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu morreria para recuperar uma relíquia antiga da minha fé que foi perdida há muito tempo."
          },
          {
            option_type: "string",
            string: "Eu ainda vou me vingar dos hierofantes corruptos do templo que me declararam herege."
          },
          {
            option_type: "string",
            string: "Eu devo minha vida ao sacerdote que me acolheu quando meus pais morreram."
          },
          {
            option_type: "string",
            string: "Tudo o que faço é para as pessoas comuns."
          },
          {
            option_type: "string",
            string: "Eu farei qualquer coisa para proteger o templo onde servi."
          },
          {
            option_type: "string",
            string: "Eu procuro preservar um texto sagrado que meus inimigos consideram herético e procuram destruir."
          }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu julgo os outros severamente, e a mim mesmo ainda mais severamente."
          },
          {
            option_type: "string",
            string: "Eu deposito muita confiança naqueles que exercem poder dentro da hierarquia do meu templo."
          },
          {
            option_type: "string",
            string: "Minha piedade às vezes me leva a confiar cegamente naqueles que professam fé em meu deus."
          },
          {
            option_type: "string",
            string: "Eu sou inflexível em meu pensamento."
          },
          {
            option_type: "string",
            string: "Eu sou suspeito de estranhos e suspeito do pior deles."
          },
          {
            option_type: "string",
            string: "Uma vez que eu escolho um objetivo, eu fico obcecado com ele em detrimento de todo o resto da minha vida."
          }
        ]
      }
    },
    url: "/api/backgrounds/acolyte",
  },

  // ===========================
  // CRIMINOSO
  // ===========================
  {
    index: "criminal",
    name: "Criminoso",
    starting_proficiencies: [
      { index: "deception", name: "Enganação", url: "" },
      { index: "stealth", name: "Furtividade", url: "" }
    ],
    languages: [],
    starting_equipment: [
      { equipment: { index: "crowbar", name: "Pé de cabra", url: "" }, quantity: 1 },
      { equipment: { index: "dark-clothes", name: "Roupas escuras com capuz", url: "" }, quantity: 1 },
      { equipment: { index: "belt-pouch", name: "Algibeira", url: "" }, quantity: 1 },
      { equipment: { index: "gold-pieces", name: "15 moedas de ouro", url: "" }, quantity: 15 }
    ],
    feature: {
      name: "Contato Criminal",
      desc: [
        "Você tem um contato confiável que atua como seu elo com uma rede de outros criminosos. Você sabe como conseguir mensagens de e para seu contato, mesmo através de grandes distâncias; especificamente, você conhece os mensageiros locais, mestres de caravana corruptos e marinheiros obscuros que podem entregar mensagens para você."
      ]
    },
    personality_traits: {
      choose: 2,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu sempre tenho um plano para quando as coisas dão errado."
          },
          {
            option_type: "string",
            string: "Eu sou sempre calmo, não importa qual seja a situação. Eu nunca levanto minha voz ou deixo minhas emoções me controlarem."
          },
          {
            option_type: "string",
            string: "A primeira coisa que faço em um novo lugar é anotar os locais de tudo que é valioso - ou onde essas coisas podem estar escondidas."
          },
          {
            option_type: "string",
            string: "Eu preferiria fazer um novo amigo a um novo inimigo."
          },
          {
            option_type: "string",
            string: "Eu sou incrivelmente lento para confiar. Aqueles que parecem os mais justos muitas vezes têm mais a esconder."
          },
          {
            option_type: "string",
            string: "Eu não presto atenção aos riscos em uma situação. Nunca me diga as chances."
          },
          {
            option_type: "string",
            string: "A melhor maneira de me fazer fazer alguma coisa é me dizer que não posso fazê-la."
          },
          {
            option_type: "string",
            string: "Eu sopro e tenho uma língua afiada com qualquer um que me cruze o caminho."
          }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            alignments: [{ index: "lawful", name: "Leal", url: "" }],
            desc: "Honra. Eu não roubo de outros do ramo."
          },
          {
            option_type: "string",
            alignments: [{ index: "chaotic", name: "Caótico", url: "" }],
            desc: "Liberdade. Correntes são feitas para serem quebradas, como aqueles que as forjariam."
          },
          {
            option_type: "string",
            alignments: [{ index: "neutral", name: "Neutro", url: "" }],
            desc: "Caridade. Eu roubo dos ricos para que eu possa ajudar as pessoas necessitadas."
          },
          {
            option_type: "string",
            alignments: [{ index: "evil", name: "Maligno", url: "" }],
            desc: "Ganância. Eu farei qualquer coisa para me tornar rico."
          },
          {
            option_type: "string",
            alignments: [{ index: "neutral", name: "Neutro", url: "" }],
            desc: "Pessoas. Eu sou leal aos meus amigos, não a ideais."
          },
          {
            option_type: "string",
            alignments: [{ index: "chaotic", name: "Caótico", url: "" }],
            desc: "Redenção. Há uma centelha de bem em todos."
          }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu estou tentando quitar uma dívida antiga que devo a um benfeitor generoso."
          },
          {
            option_type: "string",
            string: "Meus ganhos mal-intencionados vão para sustentar minha família."
          },
          {
            option_type: "string",
            string: "Algo importante foi roubado de mim, e eu vou recuperá-lo."
          },
          {
            option_type: "string",
            string: "Eu me tornarei a maior ladra que já existiu."
          },
          {
            option_type: "string",
            string: "Eu sou culpado por um crime terrível. Espero que um dia possa me redimir."
          },
          {
            option_type: "string",
            string: "Alguém que eu amava morreu por causa de um erro que cometi. Isso nunca mais vai acontecer."
          }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Quando vejo algo valioso, não consigo pensar em mais nada além de como roubá-lo."
          },
          {
            option_type: "string",
            string: "Quando confrontado com uma escolha entre dinheiro e meus amigos, eu geralmente escolho o dinheiro."
          },
          {
            option_type: "string",
            string: "Se há um plano, eu vou esquecê-lo. Se eu não esquecer, eu vou ignorá-lo."
          },
          {
            option_type: "string",
            string: "Eu tenho um 'tell' que revela quando estou mentindo."
          },
          {
            option_type: "string",
            string: "Eu me viro e fujo quando as coisas parecem ruins."
          },
          {
            option_type: "string",
            string: "Uma pessoa inocente está na prisão por um crime que cometi. Eu estou bem com isso."
          }
        ]
      }
    },
    url: "/api/backgrounds/criminal",
  },

  // ===========================
  // HERÓI POPULAR
  // ===========================
  {
    index: "folk-hero",
    name: "Herói Popular",
    starting_proficiencies: [
      { index: "animal-handling", name: "Adestrar Animais", url: "" },
      { index: "survival", name: "Sobrevivência", url: "" }
    ],
    languages: [],
    starting_equipment: [
      { equipment: { index: "artisan-tools", name: "Um conjunto de ferramentas de artesão", url: "" }, quantity: 1 },
      { equipment: { index: "shovel", name: "Pá", url: "" }, quantity: 1 },
      { equipment: { index: "iron-pot", name: "Panela de ferro", url: "" }, quantity: 1 },
      { equipment: { index: "common-clothes", name: "Roupas comuns", url: "" }, quantity: 1 },
      { equipment: { index: "belt-pouch", name: "Algibeira", url: "" }, quantity: 1 },
      { equipment: { index: "gold-pieces", name: "10 moedas de ouro", url: "" }, quantity: 10 }
    ],
    feature: {
      name: "Hospitalidade Rústica",
      desc: [
        "Uma vez que você vem das fileiras do povo comum, você se encaixa entre eles com facilidade. Você pode encontrar um lugar para se esconder, descansar ou se recuperar entre os plebeus, a menos que você tenha se mostrado um perigo para eles. Eles vão protegê-lo da lei ou de qualquer um que o procure, embora não arriscarem suas vidas por você."
      ]
    },
    personality_traits: {
      choose: 2,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu julgo as pessoas por suas ações, não por suas palavras."
          },
          {
            option_type: "string",
            string: "Se alguém está em apuros, eu estou sempre pronto para dar uma ajuda."
          },
          {
            option_type: "string",
            string: "Quando ponho minha mente em algo, eu sigo até o fim, não importa o que fique no caminho."
          },
          {
            option_type: "string",
            string: "Eu tenho um forte senso de honra justo e sempre tento encontrar a solução mais justa para os argumentos."
          },
          {
            option_type: "string",
            string: "Eu sou confiante em minhas próprias habilidades e faço o que posso para incutir confiança nos outros."
          },
          {
            option_type: "string",
            string: "Pensar é para outras pessoas. Eu prefiro a ação."
          },
          {
            option_type: "string",
            string: "Eu uso palavras mal pronunciadas e mau vocabulário."
          },
          {
            option_type: "string",
            string: "Eu gosto de desafios e nunca recuo de uma briga justa."
          }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            alignments: [{ index: "good", name: "Bondoso", url: "" }],
            desc: "Respeito. Todas as pessoas, ricas ou pobres, merecem respeito."
          },
          {
            option_type: "string",
            alignments: [{ index: "neutral", name: "Neutro", url: "" }],
            desc: "Justiça. Ninguém deve receber tratamento preferencial perante a lei, e ninguém está acima da lei."
          },
          {
            option_type: "string",
            alignments: [{ index: "chaotic", name: "Caótico", url: "" }],
            desc: "Liberdade. Tiranos não devem ser autorizados a oprimir o povo."
          },
          {
            option_type: "string",
            alignments: [{ index: "lawful", name: "Leal", url: "" }],
            desc: "Força. Se eu me tornar forte, posso tomar o que eu quiser - o que merece."
          },
          {
            option_type: "string",
            alignments: [{ index: "neutral", name: "Neutro", url: "" }],
            desc: "Sinceridade. Não há nada de bom em fingir ser algo que não sou."
          },
          {
            option_type: "string",
            alignments: [{ index: "good", name: "Bondoso", url: "" }],
            desc: "Destino. Nada e ninguém podem me desviar de meu chamado superior."
          }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu tenho uma família, mas não tenho ideia de onde eles estão. Espero vê-los novamente um dia."
          },
          {
            option_type: "string",
            string: "Eu trabalhei a terra, amo a terra, e protegerei a terra."
          },
          {
            option_type: "string",
            string: "Um nobre orgulhoso me deu uma surra uma vez, e eu procurarei me vingar contra qualquer valentão que encontrar."
          },
          {
            option_type: "string",
            string: "Minhas ferramentas são símbolos da minha vida passada, e eu as carrego para que eu nunca esqueça minhas raízes."
          },
          {
            option_type: "string",
            string: "Eu protejo aqueles que não podem proteger a si mesmos."
          },
          {
            option_type: "string",
            string: "Eu desejo que minha cidade natal seja um lugar melhor."
          }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "O tirano que governa minha terra não vai me deixar em paz."
          },
          {
            option_type: "string",
            string: "Eu estou convencido da importância do meu destino, e cego aos meus defeitos e ao risco de fracasso."
          },
          {
            option_type: "string",
            string: "As pessoas que me conheceram quando eu era jovem sabem meu segredo vergonhoso, então eu nunca posso voltar para casa novamente."
          },
          {
            option_type: "string",
            string: "Eu tenho uma fraqueza pelos vícios da cidade, especialmente bebida pesada."
          },
          {
            option_type: "string",
            string: "Secretamente, acredito que as coisas seriam melhores se eu fosse um tirano que governasse a terra."
          },
          {
            option_type: "string",
            string: "Eu tenho problemas de confiança em meus aliados."
          }
        ]
      }
    },
    url: "/api/backgrounds/folk-hero",
  },

  // ===========================
  // NOBRE
  // ===========================
  {
    index: "noble",
    name: "Nobre",
    starting_proficiencies: [
      { index: "history", name: "História", url: "" },
      { index: "persuasion", name: "Persuasão", url: "" }
    ],
    languages: [
      { index: "any-one", name: "Um idioma à sua escolha", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "fine-clothes", name: "Roupas finas", url: "" }, quantity: 1 },
      { equipment: { index: "signet-ring", name: "Anel de sinete", url: "" }, quantity: 1 },
      { equipment: { index: "scroll-of-pedigree", name: "Pergaminho de linhagem", url: "" }, quantity: 1 },
      { equipment: { index: "purse", name: "Bolsa", url: "" }, quantity: 1 },
      { equipment: { index: "gold-pieces", name: "25 moedas de ouro", url: "" }, quantity: 25 }
    ],
    feature: {
      name: "Posição de Privilégio",
      desc: [
        "Graças ao seu nascimento nobre, as pessoas estão inclinadas a pensar o melhor de você. Você é bem-vindo na alta sociedade, e as pessoas assumem que você tem o direito de estar onde quer que esteja. Os plebeus fazem todos os esforços para acomodá-lo e evitar seu desagrado, e outras pessoas de alto nascimento o tratam como um membro de sua esfera social. Você pode conseguir uma audiência com um nobre local se precisar."
      ]
    },
    personality_traits: {
      choose: 2,
      from: {
        options: [
          {
            option_type: "string",
            string: "Minha bajulação eloquente faz qualquer pessoa com quem eu converse se sentir como a pessoa mais maravilhosa e importante do mundo."
          },
          {
            option_type: "string",
            string: "As pessoas comuns me amam por minha bondade e generosidade."
          },
          {
            option_type: "string",
            string: "Ninguém pode duvidar, olhando minha aparência real, que eu estou acima dos plebeus incultos."
          },
          {
            option_type: "string",
            string: "Eu tenho muito cuidado para sempre parecer o melhor e seguir as últimas modas."
          },
          {
            option_type: "string",
            string: "Eu não gosto de sujar minhas mãos, e não vou ser apanhado morto em acomodações inadequadas."
          },
          {
            option_type: "string",
            string: "Apesar do meu nascimento nobre, eu não me coloco acima das outras pessoas. Todos nós temos o mesmo sangue."
          },
          {
            option_type: "string",
            string: "Meu favor, uma vez perdido, é perdido para sempre."
          },
          {
            option_type: "string",
            string: "Se você me ferir, eu vou esmagá-lo, arruinar seu nome e salgar seus campos."
          }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            alignments: [{ index: "lawful", name: "Leal", url: "" }],
            desc: "Respeito. O respeito é devido a mim por causa da minha posição, mas todas as pessoas, independentemente da estação, merecem ser tratadas com dignidade."
          },
          {
            option_type: "string",
            alignments: [{ index: "good", name: "Bondoso", url: "" }],
            desc: "Responsabilidade. É meu dever respeitar a autoridade daqueles acima de mim, assim como aqueles abaixo de mim devem me respeitar."
          },
          {
            option_type: "string",
            alignments: [{ index: "neutral", name: "Neutro", url: "" }],
            desc: "Independência. Devo provar que posso me cuidar sem os mimos da minha família."
          },
          {
            option_type: "string",
            alignments: [{ index: "evil", name: "Maligno", url: "" }],
            desc: "Poder. Se eu puder atingir mais poder, ninguém vai me dizer o que fazer."
          },
          {
            option_type: "string",
            alignments: [{ index: "lawful", name: "Leal", url: "" }],
            desc: "Família. O sangue corre mais grosso que a água."
          },
          {
            option_type: "string",
            alignments: [{ index: "chaotic", name: "Caótico", url: "" }],
            desc: "Obrigação Nobre. É meu dever proteger e cuidar das pessoas abaixo de mim."
          }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu enfrentarei qualquer desafio para ganhar a aprovação da minha família."
          },
          {
            option_type: "string",
            string: "A aliança da minha casa com outra família nobre deve ser sustentada a todo custo."
          },
          {
            option_type: "string",
            string: "Nada é mais importante que os outros membros da minha família."
          },
          {
            option_type: "string",
            string: "Eu sou apaixonado por um herdeiro de uma família que minha família despreza."
          },
          {
            option_type: "string",
            string: "Minha lealdade ao meu soberano é inabalável."
          },
          {
            option_type: "string",
            string: "O povo comum deve me ver como um herói do povo."
          }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu secretamente acredito que todos estão abaixo de mim."
          },
          {
            option_type: "string",
            string: "Eu escondo um segredo verdadeiramente escandaloso que poderia arruinar minha família para sempre."
          },
          {
            option_type: "string",
            string: "Eu muitas vezes ouço insultos velados e ameaças onde nenhuma existe."
          },
          {
            option_type: "string",
            string: "Eu tenho uma raiva insaciável por prazeres carnais."
          },
          {
            option_type: "string",
            string: "Na verdade, o mundo gira em torno de mim."
          },
          {
            option_type: "string",
            string: "Por minhas palavras e ações, muitas vezes trago vergonha para minha família."
          }
        ]
      }
    },
    url: "/api/backgrounds/noble",
  },

  // ===========================
  // SÁBIO
  // ===========================
  {
    index: "sage",
    name: "Sábio",
    starting_proficiencies: [
      { index: "arcana", name: "Arcana", url: "" },
      { index: "history", name: "História", url: "" }
    ],
    languages: [
      { index: "any-two", name: "Dois idiomas à sua escolha", url: "" }
    ],
    starting_equipment: [
      { equipment: { index: "bottle-of-black-ink", name: "Frasco de tinta preta", url: "" }, quantity: 1 },
      { equipment: { index: "quill", name: "Pena", url: "" }, quantity: 1 },
      { equipment: { index: "small-knife", name: "Faca pequena", url: "" }, quantity: 1 },
      { equipment: { index: "letter", name: "Carta de um colega morto", url: "" }, quantity: 1 },
      { equipment: { index: "common-clothes", name: "Roupas comuns", url: "" }, quantity: 1 },
      { equipment: { index: "belt-pouch", name: "Algibeira", url: "" }, quantity: 1 },
      { equipment: { index: "gold-pieces", name: "10 moedas de ouro", url: "" }, quantity: 10 }
    ],
    feature: {
      name: "Pesquisador",
      desc: [
        "Quando você tenta aprender ou lembrar de uma informação, se você não souber essa informação, você frequentemente sabe onde e de quem você pode obtê-la. Normalmente, essas informações vêm de uma biblioteca, scriptorium, universidade ou um sábio ou outra pessoa ou criatura instruída. Seu DM pode decidir que o conhecimento que você procura está escondido em um lugar quase inacessível, ou que simplesmente não pode ser encontrado. Descobrir os segredos mais profundos do multiverso pode exigir uma aventura ou até mesmo toda uma campanha."
      ]
    },
    personality_traits: {
      choose: 2,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu uso palavras polissílabas que transmitem a impressão de grande erudição."
          },
          {
            option_type: "string",
            string: "Eu li todos os livros nas maiores bibliotecas do mundo - ou gosto de me vangloriar de que li."
          },
          {
            option_type: "string",
            string: "Eu estou acostumado a ajudar aqueles que não são tão inteligentes quanto eu, e eu pacientemente explico qualquer coisa e tudo para os outros."
          },
          {
            option_type: "string",
            string: "Não há nada que eu goste mais do que um bom mistério."
          },
          {
            option_type: "string",
            string: "Eu estou disposto a ouvir todos os lados de um argumento antes de fazer meu próprio julgamento."
          },
          {
            option_type: "string",
            string: "Eu... falo... lentamente... ao conversar... com idiotas... que... tentam... me acompanhar."
          },
          {
            option_type: "string",
            string: "Eu sou horrível e desconfortável em situações sociais."
          },
          {
            option_type: "string",
            string: "Eu estou convencido de que as pessoas estão sempre tentando roubar meus segredos."
          }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            alignments: [{ index: "neutral", name: "Neutro", url: "" }],
            desc: "Conhecimento. O caminho para o poder e o autoaperfeiçoamento é através do conhecimento."
          },
          {
            option_type: "string",
            alignments: [{ index: "good", name: "Bondoso", url: "" }],
            desc: "Beleza. O que é belo aponta para além de si mesmo em direção ao que é verdadeiro."
          },
          {
            option_type: "string",
            alignments: [{ index: "lawful", name: "Leal", url: "" }],
            desc: "Lógica. Emoções não devem obscurecer nosso senso do que é certo e verdadeiro, ou nosso pensamento lógico."
          },
          {
            option_type: "string",
            alignments: [{ index: "chaotic", name: "Caótico", url: "" }],
            desc: "Sem Limites. Nada deve conter as possibilidades infinitas inerentes em toda a existência."
          },
          {
            option_type: "string",
            alignments: [{ index: "neutral", name: "Neutro", url: "" }],
            desc: "Poder. O conhecimento é o caminho para todas as outras formas de poder."
          },
          {
            option_type: "string",
            alignments: [{ index: "good", name: "Bondoso", url: "" }],
            desc: "Autoaperfeiçoamento. O objetivo de uma vida de estudo é a melhoria de si mesmo."
          }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "É meu dever proteger meus estudantes."
          },
          {
            option_type: "string",
            string: "Eu tenho um texto antigo que contém segredos terríveis que não devem cair em mãos erradas."
          },
          {
            option_type: "string",
            string: "Eu trabalho para preservar uma biblioteca, universidade, scriptorium ou mosteiro."
          },
          {
            option_type: "string",
            string: "O trabalho da minha vida é uma série de tomos relacionados a um campo específico de conhecimento."
          },
          {
            option_type: "string",
            string: "Eu estive procurando por toda a minha vida pela resposta a uma certa questão."
          },
          {
            option_type: "string",
            string: "Eu vendi minha alma por conhecimento. Espero fazer grandes feitos e ganhá-la de volta."
          }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu sou facilmente distraído pelo promessa de informação."
          },
          {
            option_type: "string",
            string: "A maioria das pessoas grita e corre quando vê um demônio, então eu paro e tomo notas sobre sua anatomia."
          },
          {
            option_type: "string",
            string: "Desbloquear um mistério antigo vale a civilização de um preço."
          },
          {
            option_type: "string",
            string: "Eu passo segredos que supostamente devo manter, porque eu acho que é mais importante que o conhecimento seja compartilhado."
          },
          {
            option_type: "string",
            string: "Eu negligencio frequentemente meu próprio bem-estar físico e os de outras pessoas em busca de conhecimento."
          },
          {
            option_type: "string",
            string: "Eu estou trabalhando em teorias grandiosas e grandes que não são suportadas por evidências."
          }
        ]
      }
    },
    url: "/api/backgrounds/sage",
  },

  // ===========================
  // SOLDADO
  // ===========================
  {
    index: "soldier",
    name: "Soldado",
    starting_proficiencies: [
      { index: "athletics", name: "Atletismo", url: "" },
      { index: "intimidation", name: "Intimidação", url: "" }
    ],
    languages: [],
    starting_equipment: [
      { equipment: { index: "insignia-of-rank", name: "Insígnia de patente", url: "" }, quantity: 1 },
      { equipment: { index: "trophy", name: "Troféu de inimigo caído", url: "" }, quantity: 1 },
      { equipment: { index: "common-clothes", name: "Roupas comuns", url: "" }, quantity: 1 },
      { equipment: { index: "belt-pouch", name: "Algibeira", url: "" }, quantity: 1 },
      { equipment: { index: "gold-pieces", name: "10 moedas de ouro", url: "" }, quantity: 10 }
    ],
    feature: {
      name: "Posto Militar",
      desc: [
        "Você tem um posto militar de sua carreira como soldado. Os soldados leais à sua antiga organização militar ainda reconhecem sua autoridade e influência, e eles diferem a você se forem de uma patente mais baixa. Você pode invocar sua patente para exercer influência sobre outros soldados e requisitar equipamentos simples ou cavalos para uso temporário. Você também pode geralmente obter acesso a acampamentos militares amigáveis e fortalezas onde sua patente é reconhecida."
      ]
    },
    personality_traits: {
      choose: 2,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu sempre sou educado e respeitoso."
          },
          {
            option_type: "string",
            string: "Eu sou assombrado por memórias de guerra. Não posso tirar as imagens de violência da minha mente."
          },
          {
            option_type: "string",
            string: "Eu perdi muitos amigos, e sou lento para fazer novos."
          },
          {
            option_type: "string",
            string: "Eu sou cheio de histórias inspiradoras e cautelares dos meus tempos militares relevantes para quase todas as situações de combate."
          },
          {
            option_type: "string",
            string: "Eu posso encarar um cão do inferno sem piscar, mas coloque-me em uma festa social e eu fico desconfortável."
          },
          {
            option_type: "string",
            string: "Eu gosto de estar no comando e ordenar as pessoas ao redor."
          },
          {
            option_type: "string",
            string: "Eu me arrisco pelos meus amigos."
          },
          {
            option_type: "string",
            string: "Eu tenho um senso de humor vulgar."
          }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            alignments: [{ index: "lawful", name: "Leal", url: "" }],
            desc: "Maior Bem. Nosso destino é lutar onde a batalha contra as forças do mal é maior."
          },
          {
            option_type: "string",
            alignments: [{ index: "good", name: "Bondoso", url: "" }],
            desc: "Responsabilidade. Eu faço o que devo e obedeço à autoridade justa."
          },
          {
            option_type: "string",
            alignments: [{ index: "neutral", name: "Neutro", url: "" }],
            desc: "Independência. Quando as pessoas seguem ordens cegamente, abraçam um tipo de tirania."
          },
          {
            option_type: "string",
            alignments: [{ index: "evil", name: "Maligno", url: "" }],
            desc: "Poder. Na vida como na guerra, o mais forte força os outros a se submeter."
          },
          {
            option_type: "string",
            alignments: [{ index: "chaotic", name: "Caótico", url: "" }],
            desc: "Viver e Deixar Viver. Ideais não valem matar por eles ou ir à guerra."
          },
          {
            option_type: "string",
            alignments: [{ index: "lawful", name: "Leal", url: "" }],
            desc: "Nação. Minha cidade, nação ou povo são tudo o que importa."
          }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "Eu ainda morreria pelas pessoas com quem servi."
          },
          {
            option_type: "string",
            string: "Alguém salvou minha vida no campo de batalha. Até hoje, eu nunca vou deixar um amigo para trás."
          },
          {
            option_type: "string",
            string: "Minha honra é minha vida."
          },
          {
            option_type: "string",
            string: "Eu nunca vou esquecer a derrota esmagadora que minha empresa sofreu ou os inimigos que a lideram."
          },
          {
            option_type: "string",
            string: "Aqueles que lutam ao meu lado são aqueles que valem morrer."
          },
          {
            option_type: "string",
            string: "Eu luto por aqueles que não podem lutar por si mesmos."
          }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          {
            option_type: "string",
            string: "O inimigo monstruoso que enfrentei em batalha ainda me assombra até hoje."
          },
          {
            option_type: "string",
            string: "Eu tenho pouco respeito por quem não é um guerreiro comprovado."
          },
          {
            option_type: "string",
            string: "Eu cometi um erro terrível na batalha que custou muitas vidas - e eu faria qualquer coisa para manter esse erro em segredo."
          },
          {
            option_type: "string",
            string: "Meu ódio de meus inimigos é cego e irracional."
          },
          {
            option_type: "string",
            string: "Eu obedeço à lei, mesmo se a lei causa infelicidade."
          },
          {
            option_type: "string",
            string: "Eu prefiro comer minha armadura a admitir quando estou errado."
          }
        ]
      }
    },
    url: "/api/backgrounds/soldier",
  },
];