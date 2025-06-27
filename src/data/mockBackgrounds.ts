// ===========================
// MOCK BACKGROUNDS DATA - COMPLETE D&D 5e SRD + CUSTOM
// src/data/mockBackgrounds.ts
// ===========================

import { DndBackground } from "@/types/characterCreation";

export const mockBackgrounds: DndBackground[] = [
  // ===========================
  // D&D 5e SRD BACKGROUNDS
  // ===========================
  
  {
    index: "acolyte",
    name: "Acólito",
    desc: "Você passou sua vida a serviço de um templo de um deus específico ou panteão de deuses. Você atua como intermediário entre o reino sagrado e o mundo mortal, realizando ritos sagrados e oferecendo sacrifícios para conduzir os adoradores à presença do divino. Você não é necessariamente um clérigo - realizar ritos sagrados não é o mesmo que canalizar poder divino. Como acólito, você conhece os mitos e cosmogonias, história e relacionamentos entre os deuses, hierarquia eclesiástica e dogmas religiosos.",
    starting_proficiencies: [
      { index: "skill-insight", name: "Intuição", url: "/api/proficiencies/skill-insight" },
      { index: "skill-religion", name: "Religião", url: "/api/proficiencies/skill-religion" }
    ],
    language_options: {
      choose: 2,
      type: "languages",
      from: {
        option_set_type: "options_array",
        options: [
          { option_type: "reference", item: { index: "common", name: "Comum", url: "/api/languages/common" } },
          { option_type: "reference", item: { index: "celestial", name: "Celestial", url: "/api/languages/celestial" } },
          { option_type: "reference", item: { index: "abyssal", name: "Abissal", url: "/api/languages/abyssal" } }
        ]
      }
    },
    starting_equipment: [
      { equipment: { index: "holy-symbol", name: "Símbolo Sagrado", url: "/api/equipment/holy-symbol" }, quantity: 1 },
      { equipment: { index: "prayer-book", name: "Livro de Orações", url: "/api/equipment/prayer-book" }, quantity: 1 },
      { equipment: { index: "incense", name: "Incenso", url: "/api/equipment/incense" }, quantity: 5 }
    ],
    feature: {
      name: "Abrigo dos Fiéis",
      desc: [
        "Como um acólito, você comanda o respeito daqueles que compartilham sua fé, e você pode realizar as cerimônias religiosas de sua divindade. Você e seus companheiros aventureiros podem esperar receber cura gratuita e cuidados em um templo, santuário ou outra presença estabelecida de sua fé, desde que vocês tenham apoiado esse templo no passado.",
        "Aqueles que compartilham sua religião irão apoiá-lo (mas apenas você) em um estilo de vida modesto. Você também pode ter laços com um templo específico dedicado à sua divindade ou panteão, e tem uma residência lá. Este pode ser o templo onde você costumava servir, se permaneceu em bons termos com ele, ou um templo onde você encontrou uma nova casa.",
        "Enquanto próximo ao seu templo, você pode pedir aos sacerdotes para ajuda, desde que a ajuda que você pedir não seja perigosa e você permanecer em boa situação com seu templo."
      ]
    },
    personality_traits: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu idolatro um herói particular da minha fé e constantemente me refiro aos feitos e exemplo dessa pessoa." },
          { option_type: "string", string: "Eu posso encontrar um terreno comum entre os inimigos mais ferozes, empatizando com eles e sempre trabalhando em direção à paz." },
          { option_type: "string", string: "Eu vejo presságios em todos os eventos e ações. Os deuses estão tentando falar conosco, nós apenas temos que ouvir." },
          { option_type: "string", string: "Nada pode abalar minha atitude otimista." },
          { option_type: "string", string: "Eu cito textos sagrados e provérbios em quase todas as situações." },
          { option_type: "string", string: "Eu sou tolerante (ou intolerante) de outras fés e respeito (ou condeno) o culto de outros deuses." },
          { option_type: "string", string: "Eu gostei de comida requintada, bebida e alta sociedade entre a elite da minha fé. A vida áspera me incomoda." },
          { option_type: "string", string: "Eu passei tanto tempo no templo que tenho pouca experiência prática em lidar com pessoas no mundo exterior." }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Tradição. As tradições antigas de adoração e sacrifício devem ser preservadas e defendidas." },
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Caridade. Eu sempre tento ajudar os necessitados, não importa o custo pessoal." },
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Mudança. Devemos ajudar a provocar as mudanças que os deuses estão constantemente trabalhando no mundo." },
          { option_type: "string", alignments: [{ index: "lawful", name: "Leal", url: "" }], desc: "Poder. Espero um dia liderar a hierarquia da minha fé." },
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Fé. Eu confio que minha divindade guiará minhas ações. Eu tenho fé de que se eu trabalhar duro, as coisas darão certo." },
          { option_type: "string", alignments: [{ index: "any", name: "Qualquer", url: "" }], desc: "Aspiração. Eu procuro me provar digno da favor do meu deus, combinando as minhas ações contra os seus ou seus ensinamentos." }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu morreria para recuperar uma relíquia antiga da minha fé que foi perdida há muito tempo." },
          { option_type: "string", string: "Eu ainda vou me vingar dos hierofantes corruptos do templo que me declararam herege." },
          { option_type: "string", string: "Eu devo minha vida ao sacerdote que me acolheu quando meus pais morreram." },
          { option_type: "string", string: "Tudo o que faço é para as pessoas comuns." },
          { option_type: "string", string: "Eu farei qualquer coisa para proteger o templo onde servi." },
          { option_type: "string", string: "Eu procuro preservar um texto sagrado que meus inimigos consideram herético e procuram destruir." }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu julgo os outros severamente, e a mim mesmo ainda mais severamente." },
          { option_type: "string", string: "Eu deposito muita confiança naqueles que exercem poder dentro da hierarquia do meu templo." },
          { option_type: "string", string: "Minha piedade às vezes me leva a confiar cegamente naqueles que professam fé em meu deus." },
          { option_type: "string", string: "Eu sou inflexível em meu pensamento." },
          { option_type: "string", string: "Eu sou suspeito de estranhos e suspeito do pior deles." },
          { option_type: "string", string: "Uma vez que eu escolho um objetivo, eu fico obcecado com ele em detrimento de todo o resto da minha vida." }
        ]
      }
    },
    url: "/api/backgrounds/acolyte",
  },

  {
    index: "criminal",
    name: "Criminoso",
    desc: "Você é um criminoso experiente com um histórico de violação da lei. Você passou muito tempo entre outros criminosos e ainda tem contatos no submundo criminoso. Você está muito mais próximo do que a maioria das pessoas do submundo do assassinato, roubo e violência que prevalece no ventre da civilização, e você sobreviveu até este ponto ao afiar seus instintos - ao contrário de outros que confiaram na sorte.",
    starting_proficiencies: [
      { index: "skill-deception", name: "Enganação", url: "/api/proficiencies/skill-deception" },
      { index: "skill-stealth", name: "Furtividade", url: "/api/proficiencies/skill-stealth" },
      { index: "thieves-tools", name: "Ferramentas de Ladrão", url: "/api/proficiencies/thieves-tools" },
      { index: "gaming-set", name: "Conjunto de Jogo", url: "/api/proficiencies/gaming-set" }
    ],
    starting_equipment: [
      { equipment: { index: "crowbar", name: "Pé de Cabra", url: "/api/equipment/crowbar" }, quantity: 1 },
      { equipment: { index: "dark-clothes", name: "Roupas Escuras", url: "/api/equipment/dark-clothes" }, quantity: 1 },
      { equipment: { index: "belt-pouch", name: "Bolsa", url: "/api/equipment/belt-pouch" }, quantity: 1 }
    ],
    feature: {
      name: "Contato Criminal",
      desc: [
        "Você tem um contato confiável e fidedigno que atua como seu intermediário para uma rede de outros criminosos. Você sabe como obter e enviar mensagens para seu contato, mesmo através de grandes distâncias; especificamente, você conhece os mensageiros locais, mestres de caravana corruptos e marinheiros escusos que podem entregar mensagens para você.",
        "Seu contato trabalha para você por uma pequena taxa (geralmente 1-2 moedas de ouro) e pode arranjar uma reunião com outros criminosos se você precisar conversar com eles. Seu contato também pode tentar reunir rumores ou informações sobre alvos específicos, pessoas ou locais.",
        "Se você for preso, seu contato tentará reunir informações sobre sua situação e condições, e pode trabalhar para subornar guardas ou funcionários da prisão em seu nome, dependendo de sua influência e recursos."
      ]
    },
    personality_traits: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu sempre tenho um plano para o que fazer quando as coisas dão errado." },
          { option_type: "string", string: "Eu sou sempre calmo, não importa a situação. Eu nunca levanto minha voz ou deixo minhas emoções me controlarem." },
          { option_type: "string", string: "A primeira coisa que eu faço em um novo lugar é anotar os locais de tudo valioso - ou onde essas coisas poderiam ser escondidas." },
          { option_type: "string", string: "Eu preferiria fazer um novo amigo do que um novo inimigo." },
          { option_type: "string", string: "Eu sou incrivelmente lento para confiar. Aqueles que parecem os mais justos muitas vezes têm mais a esconder." },
          { option_type: "string", string: "Eu não presto atenção aos riscos em uma situação. Nunca me diga as chances." },
          { option_type: "string", string: "A melhor maneira de me fazer fazer algo é me dizer que eu não posso fazê-lo." },
          { option_type: "string", string: "Eu explodo ao menor insulto." }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", alignments: [{ index: "chaotic", name: "Caótico", url: "" }], desc: "Honra. Eu não roubo de outros no comércio." },
          { option_type: "string", alignments: [{ index: "chaotic", name: "Caótico", url: "" }], desc: "Liberdade. Correntes são feitas para serem quebradas, assim como aqueles que as forjariam." },
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Caridade. Eu roubo dos ricos para que eu possa ajudar os necessitados." },
          { option_type: "string", alignments: [{ index: "evil", name: "Maligno", url: "" }], desc: "Ganância. Eu farei qualquer coisa para me tornar rico." },
          { option_type: "string", alignments: [{ index: "evil", name: "Maligno", url: "" }], desc: "Pessoas. Eu sou leal aos meus amigos, não a qualquer ideal, e todo mundo sabe que eu posso viajar pelo fogo e água para aqueles que se importam comigo." },
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Redenção. Há uma faísca de bondade em todos." }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu estou tentando pagar uma dívida antiga que devo a um benfeitor generoso." },
          { option_type: "string", string: "Meus ganhos mal adquiridos vão para sustentar minha família." },
          { option_type: "string", string: "Algo importante foi tirado de mim, e eu pretendo roubá-lo de volta." },
          { option_type: "string", string: "Eu me tornarei a maior ladra que já viveu." },
          { option_type: "string", string: "Eu sou culpado de um crime terrível. Espero que eu possa me redimir por isso." },
          { option_type: "string", string: "Alguém que eu amei morreu por causa de um erro que cometi. Isso nunca acontecerá novamente." }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Quando vejo algo valioso, eu não consigo pensar em mais nada além de como roubá-lo." },
          { option_type: "string", string: "Quando confrontado com uma escolha entre dinheiro e meus amigos, eu geralmente escolho o dinheiro." },
          { option_type: "string", string: "Se há um plano, eu vou esquecê-lo. Se eu não esquecer, eu vou ignorá-lo." },
          { option_type: "string", string: "Eu tenho um \"diga\" que revela se eu estou mentindo." },
          { option_type: "string", string: "Eu me viro e corro quando as coisas parecem ruins." },
          { option_type: "string", string: "Uma pessoa inocente está na prisão pelo crime que cometi. Está tudo bem comigo." }
        ]
      }
    },
    url: "/api/backgrounds/criminal",
  },

  {
    index: "folk-hero",
    name: "Herói do Povo",
    desc: "Você vem de uma origem humilde, mas está destinado para muito mais. Já as pessoas de sua aldeia natal o consideram como seu campeão, e seu destino o chama para se posicionar contra os tiranos e monstros que ameaçam as pessoas comuns de qualquer lugar. Talvez você tenha sido treinado em um exército. Talvez você tenha considerado as opções práticas de uma carreira como ferreiro ou pastor. Talvez você tenha sido um outlander. Mas algo aconteceu que colocou você no caminho para a grandeza.",
    starting_proficiencies: [
      { index: "skill-animal-handling", name: "Lidar com Animais", url: "/api/proficiencies/skill-animal-handling" },
      { index: "skill-survival", name: "Sobrevivência", url: "/api/proficiencies/skill-survival" },
      { index: "smiths-tools", name: "Ferramentas de Ferreiro", url: "/api/proficiencies/smiths-tools" },
      { index: "vehicles-land", name: "Veículos Terrestres", url: "/api/proficiencies/vehicles-land" }
    ],
    starting_equipment: [
      { equipment: { index: "smiths-tools", name: "Ferramentas de Artesão", url: "/api/equipment/smiths-tools" }, quantity: 1 },
      { equipment: { index: "shovel", name: "Pá", url: "/api/equipment/shovel" }, quantity: 1 },
      { equipment: { index: "common-clothes", name: "Roupas Comuns", url: "/api/equipment/common-clothes" }, quantity: 1 }
    ],
    feature: {
      name: "Hospitalidade Rústica",
      desc: [
        "Já que você vem das fileiras do povo comum, você se encaixa entre eles com facilidade. Você pode encontrar um lugar para se esconder, descansar ou se recuperar entre outros plebeus, a menos que você tenha se mostrado um perigo para eles.",
        "Eles irão protegê-lo da lei ou de qualquer um procurando por você, embora eles não correrão riscos para lutar por você. Se você for claramente culpado de um crime, eles não irão protegê-lo.",
        "Esta feature permite que você se esconda entre trabalhadores, camponeses, comerciantes e artesãos. Tais pessoas podem fornecer informações que você não conseguiria obter da nobreza, como rumores locais, quem tem influência real, e onde você pode encontrar equipamentos, embarcações ou outros recursos."
      ]
    },
    personality_traits: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu julgo as pessoas por suas ações, não pelas suas palavras." },
          { option_type: "string", string: "Se alguém está em apuros, eu estou sempre pronto para emprestar ajuda." },
          { option_type: "string", string: "Quando eu defino minha mente em algo, eu sigo até o final, não importa o que fica no meu caminho." },
          { option_type: "string", string: "Eu tenho um forte senso de justiça e sempre tento encontrar a solução mais equitativa para os argumentos." },
          { option_type: "string", string: "Eu confio em minhas habilidades e faço o que posso para infundir confiança nos outros." },
          { option_type: "string", string: "Pensar é para outras pessoas. Eu prefiro ação." },
          { option_type: "string", string: "Eu uso palavras polissilábicas para transmitir a impressão de grande erudição." },
          { option_type: "string", string: "Eu me canso facilmente. Talvez a próxima coisa que eu experimentar seja a chave para encontrar esta nova faísca." }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Respeito. As pessoas merecem ser tratadas com dignidade e respeito." },
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Justiça. Ninguém deve ter tratamento preferencial perante a lei, e ninguém está acima da lei." },
          { option_type: "string", alignments: [{ index: "chaotic", name: "Caótico", url: "" }], desc: "Liberdade. Tiranos não devem ser autorizados a oprimir o povo." },
          { option_type: "string", alignments: [{ index: "lawful", name: "Leal", url: "" }], desc: "Poder. Se eu me tornar forte, posso tomar o que eu quiser - o que merece." },
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Sinceridade. Não há nada de bom em fingir ser algo que não sou." },
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Destino. Nada e ninguém podem me desviar de meu chamado superior." }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu tenho uma família, mas não tenho ideia de onde eles estão. Espero vê-los novamente um dia." },
          { option_type: "string", string: "Eu trabalhei a terra, amo a terra, e protegerei a terra." },
          { option_type: "string", string: "Um nobre orgulhoso me deu uma surra uma vez, e eu procurarei me vingar contra qualquer valentão que encontrar." },
          { option_type: "string", string: "Minhas ferramentas são símbolos da minha vida passada, e eu as carrego para que eu nunca esqueça minhas raízes." },
          { option_type: "string", string: "Eu protejo aqueles que não podem proteger a si mesmos." },
          { option_type: "string", string: "Eu desejo que minha cidade natal seja um lugar melhor." }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "O tirano que governa minha terra não vai me deixar em paz." },
          { option_type: "string", string: "Eu estou convencido da importância do meu destino, e cego aos meus defeitos e ao risco de fracasso." },
          { option_type: "string", string: "As pessoas que me conheceram quando eu era jovem sabem meu segredo vergonhoso, então eu nunca posso voltar para casa novamente." },
          { option_type: "string", string: "Eu tenho uma fraqueza pelos vícios da cidade, especialmente bebida pesada." },
          { option_type: "string", string: "Secretamente, acredito que as coisas seriam melhores se eu fosse um tirano que governasse a terra." },
          { option_type: "string", string: "Eu tenho problemas de confiança em meus aliados." }
        ]
      }
    },
    url: "/api/backgrounds/folk-hero",
  },

  {
    index: "noble",
    name: "Nobre",
    starting_proficiencies: [
      { index: "skill-history", name: "História", url: "/api/proficiencies/skill-history" },
      { index: "skill-persuasion", name: "Persuasão", url: "/api/proficiencies/skill-persuasion" },
      { index: "gaming-set", name: "Conjunto de Jogo", url: "/api/proficiencies/gaming-set" }
    ],
    language_options: {
      choose: 1,
      type: "languages",
      from: {
        option_set_type: "options_array",
        options: [
          { option_type: "reference", item: { index: "common", name: "Comum", url: "/api/languages/common" } },
          { option_type: "reference", item: { index: "elvish", name: "Élfico", url: "/api/languages/elvish" } },
          { option_type: "reference", item: { index: "draconic", name: "Dracônico", url: "/api/languages/draconic" } }
        ]
      }
    },
    starting_equipment: [
      { equipment: { index: "fine-clothes", name: "Roupas Finas", url: "/api/equipment/fine-clothes" }, quantity: 1 },
      { equipment: { index: "signet-ring", name: "Anel de Sinete", url: "/api/equipment/signet-ring" }, quantity: 1 },
      { equipment: { index: "scroll-of-pedigree", name: "Pergaminho de Linhagem", url: "/api/equipment/scroll-of-pedigree" }, quantity: 1 }
    ],
    feature: {
      name: "Posição de Privilégio",
      desc: [
        "Graças ao seu nascimento nobre, as pessoas tendem a pensar o melhor de você.",
        "Você é bem-vindo na alta sociedade, e as pessoas assumem que você tem o direito de estar onde quer que esteja."
      ]
    },
    personality_traits: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Minha bajulação eloquente faz com que todos com quem falo se sintam como a pessoa mais maravilhosa e importante do mundo." },
          { option_type: "string", string: "A pessoa comum me ama por minha bondade e generosidade." },
          { option_type: "string", string: "Ninguém poderia duvidar, observando minhas maneiras régias, que eu sou um aristocrata até a medula." },
          { option_type: "string", string: "Eu tenho grande cuidado para sempre estar vestido da melhor forma e seguir as últimas modas." },
          { option_type: "string", string: "Eu não gosto de sujar minhas mãos, e eu não vou ser pego morto em acomodações inadequadas." },
          { option_type: "string", string: "Apesar de meu nascimento nobre, eu não me coloco acima de outras pessoas. Somos todos iguais." },
          { option_type: "string", string: "Meu favor, uma vez perdido, é perdido para sempre." },
          { option_type: "string", string: "Se você me fizer uma lesão, eu vou esmagar você, arruinar seu nome, e salgar seus campos." }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Respeito. O respeito me é devido por causa da minha posição, mas todas as pessoas, independentemente da estação, merecem ser tratadas com dignidade." },
          { option_type: "string", alignments: [{ index: "lawful", name: "Leal", url: "" }], desc: "Responsabilidade. É meu dever respeitar a autoridade daqueles acima de mim, assim como aqueles abaixo de mim devem respeitar a minha." },
          { option_type: "string", alignments: [{ index: "chaotic", name: "Caótico", url: "" }], desc: "Independência. Devo provar que posso me cuidar sem a coddling da minha família." },
          { option_type: "string", alignments: [{ index: "evil", name: "Maligno", url: "" }], desc: "Poder. Se eu puder atingir mais poder, ninguém vai me dizer o que fazer." },
          { option_type: "string", alignments: [{ index: "lawful", name: "Leal", url: "" }], desc: "Família. O sangue corre mais grosso que a água." },
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Obrigação. É meu dever proteger e cuidar das pessoas debaixo de mim." }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Vou enfrentar qualquer desafio para ganhar a aprovação da minha família." },
          { option_type: "string", string: "A aliança da minha casa com outra família nobre deve ser sustentada a todo custo." },
          { option_type: "string", string: "Nada é mais importante que os outros membros da minha família." },
          { option_type: "string", string: "Eu sou apaixonado pelo herdeiro de uma família que minha família despreza." },
          { option_type: "string", string: "Minha lealdade ao meu soberano é inabalável." },
          { option_type: "string", string: "As pessoas comuns devem me ver como um herói do povo." }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu secretamente acredito que todos estão abaixo de mim." },
          { option_type: "string", string: "Eu escondo um segredo verdadeiramente escandaloso que poderia arruinar minha família para sempre." },
          { option_type: "string", string: "Eu muitas vezes ouço insultos velados e ameaças onde nenhum são destinados." },
          { option_type: "string", string: "Eu tenho uma raiva insaciável por prazeres carnais." },
          { option_type: "string", string: "Na verdade, o mundo realmente gira em torno de mim." },
          { option_type: "string", string: "Por minhas palavras e ações, muitas vezes trago vergonha para minha família." }
        ]
      }
    },
    url: "/api/backgrounds/noble",
  },

  {
    index: "sage",
    name: "Sábio",
    starting_proficiencies: [
      { index: "skill-arcana", name: "Arcanismo", url: "/api/proficiencies/skill-arcana" },
      { index: "skill-history", name: "História", url: "/api/proficiencies/skill-history" }
    ],
    language_options: {
      choose: 2,
      type: "languages",
      from: {
        option_set_type: "options_array",
        options: [
          { option_type: "reference", item: { index: "common", name: "Comum", url: "/api/languages/common" } },
          { option_type: "reference", item: { index: "draconic", name: "Dracônico", url: "/api/languages/draconic" } },
          { option_type: "reference", item: { index: "celestial", name: "Celestial", url: "/api/languages/celestial" } },
          { option_type: "reference", item: { index: "abyssal", name: "Abissal", url: "/api/languages/abyssal" } }
        ]
      }
    },
    starting_equipment: [
      { equipment: { index: "ink", name: "Tinta", url: "/api/equipment/ink" }, quantity: 1 },
      { equipment: { index: "quill", name: "Pena", url: "/api/equipment/quill" }, quantity: 1 },
      { equipment: { index: "small-knife", name: "Faca Pequena", url: "/api/equipment/small-knife" }, quantity: 1 },
      { equipment: { index: "scholar-pack", name: "Mochila de Estudioso", url: "/api/equipment/scholar-pack" }, quantity: 1 }
    ],
    feature: {
      name: "Pesquisador",
      desc: [
        "Quando você tenta aprender ou lembrar de uma informação, se você não souber essa informação, você muitas vezes sabe onde e de quem você pode obtê-la.",
        "Essas informações podem vir de uma biblioteca, de um scriptorium, de uma universidade, ou de outros sábios e pessoas instruídas."
      ]
    },
    personality_traits: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu uso palavras polissilábicas que transmitem a impressão de grande erudição." },
          { option_type: "string", string: "Eu li todos os livros nas maiores bibliotecas do mundo - ou gosto de me vangloriar de que li." },
          { option_type: "string", string: "Eu estou acostumado a ajudar aqueles que não são tão inteligentes quanto eu, e eu pacientemente explico qualquer coisa e tudo para os outros." },
          { option_type: "string", string: "Não há nada que eu goste mais do que um bom mistério." },
          { option_type: "string", string: "Eu estou disposto a ouvir todos os lados de um argumento antes de fazer meu próprio julgamento." },
          { option_type: "string", string: "Eu... falo... lentamente... ao conversar... com idiotas... que... tentam... me acompanhar." },
          { option_type: "string", string: "Eu sou horrível e desconfortável em situações sociais." },
          { option_type: "string", string: "Eu estou convencido de que as pessoas estão sempre tentando roubar meus segredos." }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Conhecimento. O caminho para o poder e o autoaperfeiçoamento é através do conhecimento." },
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Beleza. O que é belo aponta para além de si mesmo em direção ao que é verdadeiro." },
          { option_type: "string", alignments: [{ index: "lawful", name: "Leal", url: "" }], desc: "Lógica. Emoções não devem obscurecer nosso senso do que é certo e verdadeiro, ou nosso pensamento lógico." },
          { option_type: "string", alignments: [{ index: "chaotic", name: "Caótico", url: "" }], desc: "Sem Limites. Nada deve conter as possibilidades infinitas inerentes em toda a existência." },
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Poder. O conhecimento é o caminho para todas as outras formas de poder." },
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Autoaperfeiçoamento. O objetivo de uma vida de estudo é a melhoria de si mesmo." }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "É meu dever proteger meus estudantes." },
          { option_type: "string", string: "Eu tenho um texto antigo que contém segredos terríveis que não devem cair em mãos erradas." },
          { option_type: "string", string: "Eu trabalho para preservar uma biblioteca, universidade, scriptorium ou mosteiro." },
          { option_type: "string", string: "O trabalho da minha vida é uma série de tomos relacionados a um campo específico de conhecimento." },
          { option_type: "string", string: "Eu procurei toda a minha vida pela resposta a uma certa questão." },
          { option_type: "string", string: "Eu vendi minha alma por conhecimento. Espero fazer grandes feitos e encontrar uma maneira de quebrá-lo." }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu sou facilmente distraído pela promessa de informação." },
          { option_type: "string", string: "A maioria das pessoas grita e corre quando veem um demônio, então eu paro e tomo notas sobre sua anatomia." },
          { option_type: "string", string: "Desbloquear um mistério antigo vale o preço de uma civilização." },
          { option_type: "string", string: "Eu falo sobretudo em discursos que são de uma página de comprimento." },
          { option_type: "string", string: "Eu sou convencido de que as pessoas estão sempre tentando roubar meus segredos." },
          { option_type: "string", string: "Eu ignoro perigos óbvios, preferindo estudar fenômenos interessantes." }
        ]
      }
    },
    url: "/api/backgrounds/sage",
  },

  {
    index: "soldier",
    name: "Soldado",
    starting_proficiencies: [
      { index: "skill-athletics", name: "Atletismo", url: "/api/proficiencies/skill-athletics" },
      { index: "skill-intimidation", name: "Intimidação", url: "/api/proficiencies/skill-intimidation" },
      { index: "gaming-set", name: "Conjunto de Jogo", url: "/api/proficiencies/gaming-set" },
      { index: "vehicles-land", name: "Veículos Terrestres", url: "/api/proficiencies/vehicles-land" }
    ],
    starting_equipment: [
      { equipment: { index: "insignia-of-rank", name: "Insígnia de Patente", url: "/api/equipment/insignia-of-rank" }, quantity: 1 },
      { equipment: { index: "trophy", name: "Troféu", url: "/api/equipment/trophy" }, quantity: 1 },
      { equipment: { index: "playing-cards", name: "Cartas de Jogar", url: "/api/equipment/playing-cards" }, quantity: 1 },
      { equipment: { index: "common-clothes", name: "Roupas Comuns", url: "/api/equipment/common-clothes" }, quantity: 1 }
    ],
    feature: {
      name: "Posto Militar",
      desc: [
        "Você tem um posto militar de sua carreira anterior. Soldados leais à sua antiga organização militar ainda reconhecem sua autoridade e influência.",
        "Você pode invocar sua patente para exercer influência sobre outros soldados e requisitar equipamentos simples ou cavalos para uso temporário."
      ]
    },
    personality_traits: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu estou sempre educado e respeitoso." },
          { option_type: "string", string: "Eu sou assombrado por memórias de guerra. Eu não posso tirar as imagens de violência da minha mente." },
          { option_type: "string", string: "Eu perdi muitos amigos, e eu sou lento para fazer novos." },
          { option_type: "string", string: "Eu estou cheio de histórias inspiradoras e de advertência da minha experiência militar relevante para quase todas as situações de combate." },
          { option_type: "string", string: "Eu posso olhar fixamente para baixo um cão do inferno sem piscar." },
          { option_type: "string", string: "Eu gosto de ser forte e quebrando coisas." },
          { option_type: "string", string: "Eu tenho uma piada grosseira para todas as ocasiões." },
          { option_type: "string", string: "Eu enfrento problemas de frente. Uma solução direta é a melhor abordagem." }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", alignments: [{ index: "lawful", name: "Leal", url: "" }], desc: "Bem Maior. Nosso lote é de colocar nossa própria vida em risco para proteger os outros." },
          { option_type: "string", alignments: [{ index: "lawful", name: "Leal", url: "" }], desc: "Responsabilidade. Eu faço o que devo e obedeço à autoridade legítima." },
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Independência. Quando as pessoas seguem ordens cegamente, elas abraçam um tipo de tirania." },
          { option_type: "string", alignments: [{ index: "chaotic", name: "Caótico", url: "" }], desc: "Força. Na vida como na guerra, o mais forte vence." },
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Viver e deixar viver. Ideais não valem matando ou ir para a guerra." },
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Nação. Minha cidade, nação ou povo são tudo o que importa." }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu ainda morreria pelas pessoas com quem servi." },
          { option_type: "string", string: "Alguém salvou minha vida no campo de batalha. Até hoje, eu nunca vou deixar um amigo para trás." },
          { option_type: "string", string: "Minha honra é minha vida." },
          { option_type: "string", string: "Eu nunca vou esquecer a derrota esmagadora que minha empresa sofreu ou os inimigos que a lideram." },
          { option_type: "string", string: "Aqueles que lutam ao meu lado são aqueles que valem morrer." },
          { option_type: "string", string: "Eu luto por aqueles que não podem lutar por si mesmos." }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "O inimigo monstruoso que enfrentei em batalha ainda me assombra até hoje." },
          { option_type: "string", string: "Eu tenho pouco respeito por quem não é um guerreiro comprovado." },
          { option_type: "string", string: "Eu cometi um erro terrível na batalha que custou muitas vidas - e eu faria qualquer coisa para manter esse erro em segredo." },
          { option_type: "string", string: "Meu ódio de meus inimigos é cego e irracional." },
          { option_type: "string", string: "Eu obedeço à lei, mesmo se a lei causa infelicidade." },
          { option_type: "string", string: "Eu prefiro comer minha armadura a admitir quando estou errado." }
        ]
      }
    },
    url: "/api/backgrounds/soldier",
  },

  // ===========================
  // CUSTOM BACKGROUNDS ADICIONAIS
  // ===========================

  {
    index: "scholar",
    name: "Erudito",
    starting_proficiencies: [
      { index: "skill-investigation", name: "Investigação", url: "/api/proficiencies/skill-investigation" },
      { index: "skill-nature", name: "Natureza", url: "/api/proficiencies/skill-nature" },
      { index: "alchemists-supplies", name: "Suprimentos de Alquimista", url: "/api/proficiencies/alchemists-supplies" }
    ],
    language_options: {
      choose: 2,
      type: "languages",
      from: {
        option_set_type: "options_array",
        options: [
          { option_type: "reference", item: { index: "common", name: "Comum", url: "/api/languages/common" } },
          { option_type: "reference", item: { index: "draconic", name: "Dracônico", url: "/api/languages/draconic" } },
          { option_type: "reference", item: { index: "celestial", name: "Celestial", url: "/api/languages/celestial" } },
          { option_type: "reference", item: { index: "sylvan", name: "Silvestre", url: "/api/languages/sylvan" } }
        ]
      }
    },
    starting_equipment: [
      { equipment: { index: "scholars-pack", name: "Mochila de Estudioso", url: "/api/equipment/scholars-pack" }, quantity: 1 },
      { equipment: { index: "ink-and-quill", name: "Tinta e Pena", url: "/api/equipment/ink-and-quill" }, quantity: 1 },
      { equipment: { index: "research-notes", name: "Anotações de Pesquisa", url: "/api/equipment/research-notes" }, quantity: 1 }
    ],
    feature: {
      name: "Rede Acadêmica",
      desc: [
        "Você possui uma vasta rede de contatos acadêmicos incluindo professores, bibliotecários, e outros estudiosos.",
        "Você pode obter acesso a bibliotecas e instituições de aprendizado, bem como solicitar favores menores de colegas acadêmicos."
      ]
    },
    personality_traits: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu corrijo constantemente os outros quando eles cometem erros factuais." },
          { option_type: "string", string: "Eu tenho uma teoria para tudo, mesmo quando não faz sentido." },
          { option_type: "string", string: "Eu não consigo resistir a um bom debate intelectual." },
          { option_type: "string", string: "Eu anoto tudo em meu diário pessoal." },
          { option_type: "string", string: "Eu fico fascinado por fenômenos inexplicados." },
          { option_type: "string", string: "Eu falo como se estivesse dando uma palestra." },
          { option_type: "string", string: "Eu sempre carrego um livro para ler nos momentos de silêncio." },
          { option_type: "string", string: "Eu questiono tudo, mesmo as verdades mais óbvias." }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Iluminação. O conhecimento deve ser compartilhado para o bem de todos." },
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Descoberta. A busca pela verdade vale qualquer sacrifício." },
          { option_type: "string", alignments: [{ index: "lawful", name: "Leal", url: "" }], desc: "Método. Apenas através de pesquisa sistemática podemos entender o mundo." },
          { option_type: "string", alignments: [{ index: "chaotic", name: "Caótico", url: "" }], desc: "Curiosidade. Regras e tradições não devem limitar a investigação." },
          { option_type: "string", alignments: [{ index: "evil", name: "Maligno", url: "" }], desc: "Poder. Conhecimento é poder, e poder deve ser guardado." },
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Compreensão. O objetivo é entender, não julgar." }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Minha tese de doutorado mudará o mundo se eu conseguir completá-la." },
          { option_type: "string", string: "Eu devo muito ao meu mentor que me ensinou tudo que sei." },
          { option_type: "string", string: "Existe um mistério antigo que domina meus pensamentos." },
          { option_type: "string", string: "Minha pesquisa foi roubada e eu devo recuperá-la." },
          { option_type: "string", string: "Eu dedico meus estudos à memória de alguém que perdi." },
          { option_type: "string", string: "Uma descoberta que fiz pode ser perigosa se mal utilizada." }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu fico tão absorto em meus estudos que ignoro perigos evidentes." },
          { option_type: "string", string: "Eu menosprezo aqueles que considero intelectualmente inferiores." },
          { option_type: "string", string: "Minha obsessão por conhecimento me torna socialmente inadequado." },
          { option_type: "string", string: "Eu acredito que minhas teorias estão sempre corretas." },
          { option_type: "string", string: "Eu sou perigosamente curioso sobre coisas proibidas." },
          { option_type: "string", string: "Eu tenho dificuldade em tomar decisões práticas." }
        ]
      }
    },
    url: "/api/backgrounds/scholar",
  },

  {
    index: "merchant",
    name: "Mercador",
    starting_proficiencies: [
      { index: "skill-insight", name: "Intuição", url: "/api/proficiencies/skill-insight" },
      { index: "skill-persuasion", name: "Persuasão", url: "/api/proficiencies/skill-persuasion" },
      { index: "vehicles-land", name: "Veículos Terrestres", url: "/api/proficiencies/vehicles-land" }
    ],
    language_options: {
      choose: 1,
      type: "languages",
      from: {
        option_set_type: "options_array",
        options: [
          { option_type: "reference", item: { index: "common", name: "Comum", url: "/api/languages/common" } },
          { option_type: "reference", item: { index: "halfling", name: "Halfling", url: "/api/languages/halfling" } },
          { option_type: "reference", item: { index: "dwarvish", name: "Anão", url: "/api/languages/dwarvish" } }
        ]
      }
    },
    starting_equipment: [
      { equipment: { index: "merchants-scale", name: "Balança de Mercador", url: "/api/equipment/merchants-scale" }, quantity: 1 },
      { equipment: { index: "fine-clothes", name: "Roupas Finas", url: "/api/equipment/fine-clothes" }, quantity: 1 },
      { equipment: { index: "signet-ring", name: "Anel de Sinete", url: "/api/equipment/signet-ring" }, quantity: 1 }
    ],
    feature: {
      name: "Conexões Comerciais",
      desc: [
        "Você tem uma rede de contatos comerciais incluindo mercadores, comerciantes, e fornecedores.",
        "Você pode obter informações sobre preços de mercado, encontrar compradores e vendedores, e conseguir descontos em mercadorias."
      ]
    },
    personality_traits: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu avalio tudo em termos de valor monetário." },
          { option_type: "string", string: "Eu posso encontrar o lado positivo em qualquer negócio ruim." },
          { option_type: "string", string: "Eu sempre estou procurando por uma oportunidade de negócio." },
          { option_type: "string", string: "Eu amo uma boa barganha e odeio pagar preço cheio." },
          { option_type: "string", string: "Eu conto histórias sobre negócios exóticos que fiz." },
          { option_type: "string", string: "Eu sou generoso com meus amigos mas implacável nos negócios." },
          { option_type: "string", string: "Eu documento meticulosamente todas as minhas transações." },
          { option_type: "string", string: "Eu posso sentir o cheiro de uma oportunidade de lucro a léguas." }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Comércio. O livre comércio beneficia a todos." },
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Honestidade. Um nome honesto vale mais que ouro." },
          { option_type: "string", alignments: [{ index: "lawful", name: "Leal", url: "" }], desc: "Contratos. Acordos devem ser honrados, sempre." },
          { option_type: "string", alignments: [{ index: "evil", name: "Maligno", url: "" }], desc: "Ganância. Lucro justifica qualquer meio." },
          { option_type: "string", alignments: [{ index: "chaotic", name: "Caótico", url: "" }], desc: "Oportunidade. Fortuna favorece os ousados." },
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Equilíbrio. Todo negócio deve ser justo para ambas as partes." }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Minha família construiu este negócio e eu não os desapontarei." },
          { option_type: "string", string: "Eu devo uma grande soma a credores poderosos." },
          { option_type: "string", string: "Minha caravana mercante é minha vida." },
          { option_type: "string", string: "Um rival de negócios arruinou minha reputação uma vez." },
          { option_type: "string", string: "Eu procuro um artefato lendário para completar minha coleção." },
          { option_type: "string", string: "Meu sucesso nos negócios sustenta minha comunidade." }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu não consigo resistir a apostar em uma chance de lucro." },
          { option_type: "string", string: "Eu confio demais em estranhos que mostram interesse em meus negócios." },
          { option_type: "string", string: "Minha ganância às vezes cega meu julgamento." },
          { option_type: "string", string: "Eu guardo rancor contra qualquer um que me prejudique financeiramente." },
          { option_type: "string", string: "Eu minto sobre a qualidade de meus produtos." },
          { option_type: "string", string: "Eu fico paranóico sobre competidores sabotando meus negócios." }
        ]
      }
    },
    url: "/api/backgrounds/merchant",
  },

  {
    index: "explorer",
    name: "Explorador",
    starting_proficiencies: [
      { index: "skill-survival", name: "Sobrevivência", url: "/api/proficiencies/skill-survival" },
      { index: "skill-nature", name: "Natureza", url: "/api/proficiencies/skill-nature" },
      { index: "cartographers-tools", name: "Ferramentas de Cartógrafo", url: "/api/proficiencies/cartographers-tools" },
      { index: "navigators-tools", name: "Ferramentas de Navegador", url: "/api/proficiencies/navigators-tools" }
    ],
    language_options: {
      choose: 1,
      type: "languages",
      from: {
        option_set_type: "options_array",
        options: [
          { option_type: "reference", item: { index: "giant", name: "Gigante", url: "/api/languages/giant" } },
          { option_type: "reference", item: { index: "orc", name: "Orc", url: "/api/languages/orc" } },
          { option_type: "reference", item: { index: "sylvan", name: "Silvestre", url: "/api/languages/sylvan" } }
        ]
      }
    },
    starting_equipment: [
      { equipment: { index: "explorers-pack", name: "Mochila de Explorador", url: "/api/equipment/explorers-pack" }, quantity: 1 },
      { equipment: { index: "cartographers-tools", name: "Ferramentas de Cartógrafo", url: "/api/equipment/cartographers-tools" }, quantity: 1 },
      { equipment: { index: "traveler-clothes", name: "Roupas de Viajante", url: "/api/equipment/traveler-clothes" }, quantity: 1 }
    ],
    feature: {
      name: "Conhecimento dos Ermos",
      desc: [
        "Você tem conhecimento extenso sobre terras selvagens e pode navegar através delas com facilidade.",
        "Você pode encontrar abrigo, comida e água para você e até seis outras pessoas diariamente, desde que a terra ofereça."
      ]
    },
    personality_traits: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu sempre procuro por novos horizontes para explorar." },
          { option_type: "string", string: "Eu documento cuidadosamente cada nova descoberta." },
          { option_type: "string", string: "Eu prefiro a companhia da natureza à das pessoas." },
          { option_type: "string", string: "Eu tenho histórias fantásticas sobre lugares distantes." },
          { option_type: "string", string: "Eu posso ler os sinais da natureza como um livro aberto." },
          { option_type: "string", string: "Eu sou inquieto em cidades e vilas." },
          { option_type: "string", string: "Eu coleciono mapas de lugares que ainda não visitei." },
          { option_type: "string", string: "Eu sempre sei qual direção é o norte." }
        ]
      }
    },
    ideals: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", alignments: [{ index: "chaotic", name: "Caótico", url: "" }], desc: "Liberdade. Nada deve restringir minha vontade de vagar." },
          { option_type: "string", alignments: [{ index: "good", name: "Bondoso", url: "" }], desc: "Descoberta. Novas terras trazem novas possibilidades para todos." },
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Natureza. O mundo selvagem deve ser preservado." },
          { option_type: "string", alignments: [{ index: "lawful", name: "Leal", url: "" }], desc: "Mapeamento. Conhecimento dos territórios beneficia a civilização." },
          { option_type: "string", alignments: [{ index: "evil", name: "Maligno", url: "" }], desc: "Conquista. Novas terras significam novas oportunidades de dominação." },
          { option_type: "string", alignments: [{ index: "neutral", name: "Neutro", url: "" }], desc: "Aventura. A jornada é mais importante que o destino." }
        ]
      }
    },
    bonds: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Existe um lugar lendário que devo encontrar." },
          { option_type: "string", string: "Meu mentor desapareceu em uma expedição e eu devo encontrá-lo." },
          { option_type: "string", string: "Eu devo meus mapas e conhecimento à minha guilda de exploradores." },
          { option_type: "string", string: "Uma criatura selvagem salvou minha vida uma vez." },
          { option_type: "string", string: "Minhas explorações financiam minha família distante." },
          { option_type: "string", string: "Eu procuro por uma cidade perdida mencionada em textos antigos." }
        ]
      }
    },
    flaws: {
      choose: 1,
      from: {
        options: [
          { option_type: "string", string: "Eu não consigo resistir à curiosidade sobre lugares perigosos." },
          { option_type: "string", string: "Eu tenho um senso terrível de direção em ambientes urbanos." },
          { option_type: "string", string: "Eu escondo informações sobre locais lucrativos para mim mesmo." },
          { option_type: "string", string: "Eu me perco em memórias de lugares distantes durante conversas." },
          { option_type: "string", string: "Eu desconfio de qualquer um que nunca deixou sua cidade natal." },
          { option_type: "string", string: "Minha sede por descoberta me leva a ignorar perigos óbvios." }
        ]
      }
    },
    url: "/api/backgrounds/explorer",
  }
];